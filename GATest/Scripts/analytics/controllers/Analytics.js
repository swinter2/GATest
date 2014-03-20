"use strict";

var analyticsController = document.getElementById('analyticsController');

function ngScope() {
    return angular.element(analyticsController).scope();
}

var $consoleTextarea = null;

function log(message) {
    console.log(message);

    if (typeof (message) === 'string') {
        var $s = ngScope();
        var now = new Date();
        message = now.logFormat() + "> " + message;
        $s.output += message + "\n";

        if ($consoleTextarea) {
            var t = $consoleTextarea[0];
            t.scrollTop = t.scrollHeight - t.clientHeight;
        }
    }
}

function showError(message) {
    console.log(message);

    if (typeof (message) === 'string') {
        var $s = ngScope();
        $s.info = "";
        $s.error = message;
        var now = new Date();
        $s.output += now.logFormat() + "> " + message + "\n";

        if ($consoleTextarea) {
            var t = $consoleTextarea[0];
            t.scrollTop = t.scrollHeight - t.clientHeight;
        }
    }
}
function showInfo(message) {
    console.log(message);

    if (typeof (message) === 'string') {
        var $s = ngScope();
        $s.error = "";
        $s.info = message;
        var now = new Date();
        $s.output += now.logFormat() + "> " + message + "\n";

        if ($consoleTextarea) {
            var t = $consoleTextarea[0];
            t.scrollTop = t.scrollHeight - t.clientHeight;
        }
    }
}

gaApp.controller("Analytics",
    function ($scope) {
        $scope.clientId = "955069224494.apps.googleusercontent.com";
        $scope.apiKey = "AIzaSyDdU5uKPYj0zX6XGHDQ5RY-O9wS_OM7HDc";
        $scope.gaViewId = "";
        $scope.gaView = null;
        $scope.gaViews = null;
        $scope.trackingCodeId = ""; 
        $scope.trackingCode = null; 
        $scope.trackingCodes = null;
        $scope.accounts = null;
        $scope.account = null;
        $scope.accountId = "";

        $scope.accountChanged = function () {
            // Query for tracking codes (web properties) underneath this account.
            console.log('account changed.');

            $scope.trackingCodeId = "";
            $scope.trackingCode = null;
            $scope.trackingCodes = null;

            queryForWebPropertiesWithAction($scope.accountId, function(results) {
                $scope.$apply(function($s) {
                    if (results && results.items) {
                        $s.trackingCodes = results.items;
                        $s.trackingCode = $s.trackingCodes[0];
                        $s.trackingCodeId = $s.trackingCode.id;
                    } else {
                        showInfo("No properties found for this account: " + $s.accountId);
                    }
                });
            });
        };
        $scope.trackingCodeChanged = function () {
            // Query for views underneath this web property.
            console.log('tracking code changed.');

            $scope.gaViews = null;
            $scope.gaView = null;
            $scope.gaViewId = "";

            queryForProfilesWithAction($scope.accountId, $scope.trackingCodeId, function(results) {
                $scope.$apply(function ($s) {
                    if (results && results.items) {
                        $s.gaViews = results.items;
                        $s.gaView = $s.gaViews[0];
                        $s.gaViewId = $s.gaView.id;
                    } else {
                        showInfo("No profiles (views) found for this property: " + $s.trackingCodeId + " account id: " + $s.accountId);
                    }
                });
            });
        };

        $scope.error = "";
        $scope.info = "";
        $scope.output = "";
        $scope.startDate = startDate;
        $scope.endDate = endDate;

        $scope.results = null;

        $scope.fetchResults = function() {
            $scope.error = "";
            $scope.results = null;
            queryCoreReportingApi($scope.trackingCodeId, $scope.startDate, $scope.endDate, function(results) {
                $scope.$apply(function($s) {
                    if (results && results.items) {
                        $s.results = results;
                    } else {
                        showInfo("No results found for Profile ID: " + $s.trackingCodeId);
                    }
                });
            });
        };
    }
);

jQuery(function ($) {
    $consoleTextarea = $("#console textarea");

    var $datepicker = $(".datepicker");
    $datepicker.datepicker({
        dateFormat: "yy-mm-dd",
        onSelect: function (dateText) {
            log(this);
            log(dateText);
            var id = this.id;
            ngScope().$apply(function ($s) {
                $s[id] = dateText;
            });
        }
    });

    $datepicker.each(function (i, dp) {
        $(dp).val($(dp).data('value'));
    });
});

