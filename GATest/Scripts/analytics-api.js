"use strict";

var scopes = 'https://www.googleapis.com/auth/analytics.readonly';

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
    //$authentication.hide();
    makeApiCall();
}

// Unauthorized user
function handleUnAuthorized() {
    showError('Unauthorized');
    gapi.auth.authorize({ client_id: ngScope().clientId, scope: scopes, immediate: false }, handleAuthResult);
}

var makeApiCall = function () {
    var $scope = ngScope();
    if (!$scope.apiKey) {
        showError("API Key not set.");
        return;
    }
    if (!$scope.clientId) {
        showError("Client ID not set.");
        return;
    }
    queryAccounts();
};

function queryAccounts() {
    log('Querying Accounts.');

    // Get a list of all Google Analytics accounts for this user
    gapi.client.analytics.management.accounts.list().execute(handleAccounts);
}

function handleAccounts(results) {
    if (!results.code) {
        if (results && results.items && results.items.length) {

            var aid = "";

            var $scope = ngScope();
            if (!$scope.accounts) {
                $scope.$apply(function($s) {
                    $s.accounts = results.items;
                    $s.accountId =
                        aid = results.items[0].id;
                });
            } else {
                aid = $scope.accountId;
            }

            // Query for Web Properties
            //var aid = ngScope().accountId;
            if (aid) {
                queryWebproperties(aid);
            } else {
                // Show the list of accounts in a radio button selection so that the user can pick which account they want.
                //$accountChoices.empty();

                //if (results.items.length > 0) {
                //    for (var i in results.items) {
                //        var item = results.items[i];
                //        $accountChoices.append("<button class='button' value='" + item.id + "'>" + item.name + "</button>");
                //    }
                //} else {
                //    $accountChoices.prev('p').remove();
                //    $accountChoices.html("The currently logged in Google Account (" + results.username + ") does not have read access to any Analytics Accounts.");
                //}
                //$chooseAccount.show();
                showError("No Account Id.");
            }
        } else {
            showError('No accounts found for this user.');
        }
    } else {
        showError('There was an error querying accounts: ' + results.message);
    }
}

function queryWebproperties(accountId) {
    log('Querying Webproperties.');

    // Get a list of all the Web Properties for the account
    gapi.client.analytics.management.webproperties.list({ 'accountId': accountId }).execute(handleWebproperties);
}

function handleWebproperties(results) {
    if (!results.code) {
        if (results && results.items && results.items.length) {

            // Get the first Google Analytics account
            //var firstAccountId = results.items[0].accountId;

            // Get the first Web Property ID
            //var firstWebpropertyId = results.items[0].id;

            // Query for Views (Profiles)
            queryProfiles(ngScope().accountId, ngScope().trackingCode);

        } else {
            showError('No webproperties found for this Google Analytics user.  (' + results.username + ")");
        }
    } else {
        showError('There was an error querying webproperties: ' + results.message);
    }
}

function queryProfiles(accountId, webpropertyId) {
    log('Querying Views (Profiles).');

    // Get a list of all Views (Profiles) for the first Web Property of the first Account
    gapi.client.analytics.management.profiles.list({
        'accountId': accountId,
        'webPropertyId': webpropertyId
    }).execute(handleProfiles);
}

function handleProfiles(results) {
    if (!results.code) {
        if (results && results.items && results.items.length) {

            // Get the first View (Profile) ID
            var firstProfileId = results.items[0].id;

            // Step 3. Query the Core Reporting API
            // use the start date and end date found in the UI
            //var startDate = $("#analyticsStartDate").val().reformatDate();
            //var endDate = $("#analyticsEndDate").val().reformatDate();
            var $s = ngScope();
            var startDate = $s.startDate;
            var endDate = $s.endDate;
            log("Start Date: " + startDate);
            log("End Date: " + endDate);

            queryCoreReportingApi(firstProfileId, startDate, endDate);

        } else {
            showError('No views (profiles) found for this Google Analytics user.  (' + results.username + ")");
        }
    } else {
        showError('There was an error querying views (profiles): ' + results.message);
    }
}

function queryCoreReportingApi(profileId, startDate, endDate) {
    log('Querying Core Reporting API.');

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
    }).execute(handleCoreReportingResults);
}

function handleCoreReportingResults(results) {
    log(results);
    ngScope().$apply(function($s) {
        $s.results = results;
    });
}

jQuery(function($) {
    $(window).on("load", function(e) {
        handleClientLoad();
    });
});