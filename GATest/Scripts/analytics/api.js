"use strict";

var scopes = 'https://www.googleapis.com/auth/analytics.readonly';
var api = gapi;

// This function is called after the Client Library has finished loading
var handleClientLoad = function() {
    // 1. Set the API Key
    if (!ngScope().apiKey) {
        showError("API Key not set.");
        return;
    }
    api.client.setApiKey(ngScope().apiKey);

    // 2. Call the function that checks if the user is Authenticated. This is defined in the next section
    window.setTimeout(checkAuth, 1);
};

function checkAuth() {
    ngScope().$apply(function ($s) { $s.loading = true; });
    // Call the Google Accounts Service to determine the current user's auth status.
    // Pass the response to the handleAuthResult callback function
    gapi.auth.authorize({ client_id: ngScope().clientId, scope: scopes, immediate: true }, handleAuthResult);
}

function handleAuthResult(authResult) {
    if (authResult) {
        // The user has authorized access
        // Load the Analytics Client. This function is defined in the next section.
        loadAnalyticsClient();
    } else {
        // User has not Authenticated and Authorized
        handleUnAuthorized();
    }
}

function loadAnalyticsClient() {
    // Load the Analytics client and set handleAuthorized as the callback function
    gapi.client.load('analytics', 'v3', handleAuthorized);
}

// Authorized user
function handleAuthorized() {
    ngScope().$apply(function ($s) { $s.loading = true; });
    // authorized, so query accounts.
    queryForAccountsWithAction(function(results) {
        if (results && results.items) {
            var acctId = null;
            ngScope().$apply(function($s) {
                $s.accounts = results.items;
                $s.account = $s.accounts[0];
                $s.accountId = $s.account.id;
                acctId = $s.accountId;
            });

            // Query for web properties
            queryForWebPropertiesWithAction(acctId, function(results) {
                if (results && results.items) {
                    var webPropertyId = null;
                    ngScope().$apply(function ($s) {
                        $s.trackingCodes = results.items;
                        $s.trackingCode = $s.trackingCodes[0];
                        $s.trackingCodeId = $s.trackingCode.id;
                        webPropertyId = $s.trackingCodeId;
                    });

                    // Query for profiles under the web property.
                    queryForProfilesWithAction(acctId, webPropertyId, function(results) {
                        if (results && results.items) {
                            var profileId = null;
                            ngScope().$apply(function($s) {
                                $s.gaViews = results.items;
                                $s.gaView = $s.gaViews[0];
                                $s.gaViewId = $s.gaView.id;
                                profileId = $s.gaViewId;
                                $s.loading = false;
                            });
                        } else {
                            showInfo("No profiles (views) found for this property: " + webPropertyId + " account id: " + acctId);
                            ngScope().$apply(function ($s) { $s.loading = false; });
                        }
                    });
                } else {
                    showInfo("No properties found for this account: " + acctId);
                    ngScope().$apply(function ($s) { $s.loading = false; });
                }
            });
        } else {
            showInfo("No accounts found for this user.");
            ngScope().$apply(function ($s) { $s.loading = false; });
        }
    });
}

// Unauthorized user
function handleUnAuthorized() {
    showError('Unauthorized');
    gapi.auth.authorize({ client_id: ngScope().clientId, scope: scopes, immediate: false }, handleAuthResult);
}

var makeApiCall = function (action) {
    var $scope = ngScope();
    if (!$scope.apiKey) {
        showError("API Key not set.");
        return;
    }
    if (!$scope.clientId) {
        showError("Client ID not set.");
        return;
    }
    if (action) {
        action();
    }
    //else {
    //    queryAccounts();
    //}
};

function queryForAccountsWithAction(action) {
    log('Querying Accounts.');
    gapi.client.analytics.management.accounts.list().execute(action);
}

function queryForWebPropertiesWithAction(accountId, action) {
    log('Querying Webproperties.');
    // Get a list of all the Web Properties for the account
    gapi.client.analytics.management.webproperties.list({ 'accountId': accountId }).execute(action);
}

function queryForProfilesWithAction(accountId, webPropertyId, action) {
    log('Querying Views (Profiles).');

    // Get a list of all Views (Profiles) for the first Web Property of the first Account
    gapi.client.analytics.management.profiles.list({
        'accountId': accountId,
        'webPropertyId': webPropertyId
    }).execute(action);
}

function queryCoreReportingApi(profileId, startDate, endDate, action) {
    log('Querying Core Reporting API for profile ID: ' + profileId);

    if (!startDate || !endDate) {
        var now = new Date();
        var before = new Date();
        before.setMonth(before.getMonth() - 1); // by default go back a month.
        startDate = before.gaFormat();
        endDate = now.gaFormat();
    }

    // Use the Analytics Service Object to query the Core Reporting API
    gapi.client.analytics.data.ga.get({
        'ids': 'ga:' + profileId,
        'start-date': startDate,
        'end-date': endDate,
        'dimensions': 'ga:date',
        'metrics': 'ga:pageviews',
        //'filters': 'ga:hostname==' + hostname,
        'start-index': '1',
        'max-results': '1000',
        'output': 'json'
    }).execute(action);
}

jQuery(function($) {
    $(window).on("load", function(e) {
        handleClientLoad();
    });
});