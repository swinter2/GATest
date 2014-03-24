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
        $scope.loading = false;
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
        $scope.error = "";
        $scope.info = "";
        $scope.output = "";
        $scope.results = null;

        var before = new Date();
        before.setDate(before.getDate()-7);
        $scope.startDate = before.gaFormat();
        $scope.endDate = (new Date()).gaFormat();

        // Turn this into a "yyyy-M-d" format instead of "yyyy-MM-dd" because for some reason it is a day behind with the leading zeroes.
        $scope.startDateObj = function () {
            return new Date($scope.startDate.replace(/\-0/i, '-'));
        };
        $scope.endDateObj = function () {
            return new Date($scope.endDate.replace(/\-0/i, '-'));
        };

        $scope.accountChanged = function () {
            // Query for tracking codes (web properties) underneath this account.
            log('account changed.');
            $scope.loading = true;

            $scope.trackingCodeId = "";
            $scope.trackingCode = null;
            $scope.trackingCodes = null;

            queryForWebPropertiesWithAction($scope.accountId, function(results) {
                $scope.$apply(function($s) {
                    if (results && results.items) {
                        $s.trackingCodes = results.items;
                        $s.trackingCode = $s.trackingCodes[0];
                        $s.trackingCodeId = $s.trackingCode.id;

                        $scope.trackingCodeChanged();
                    } else {
                        showInfo("No properties found for this account: " + $s.accountId);
                        $s.loading = false;
                    }
                });
            });
        };
        $scope.trackingCodeChanged = function () {
            // Query for views underneath this web property.
            log('tracking code changed.');
            $scope.loading = true;

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
                    $s.loading = false;
                });
            });
        };
        $scope.fetchResults = function() {
            log("Fetching results.");
            $scope.loading = true;

            $scope.info = "";
            $scope.error = "";
            $scope.results = null;

            if (!$scope.gaView) {
                showError("No View available for tracking code " + $scope.trackingCodeId);
                $scope.loading = false;
                return;
            }

            queryCoreReportingApi($scope.gaViewId, $scope.startDate, $scope.endDate, function(results) {
                $scope.$apply(function($s) {
                    if (results && results.rows) {
                        $s.results = results;
                    } else {
                        showInfo("No results found for Tracking Code: (" + $s.trackingCode.name + ", " + $s.trackingCode.id + "), View: (" 
                            + $s.gaView.name + ", " + $s.gaView.id + "), " + "Start Date: " + $s.startDate + " End Date: " + $s.endDate);
                    }
                    $s.loading = false;
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

