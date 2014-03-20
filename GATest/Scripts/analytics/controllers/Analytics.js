"use strict";

var analyticsController = document.getElementById('analyticsController');

function ngScope() {
    return angular.element(analyticsController).scope();
}

var $consoleTextarea = null;

function log(message) {
    console.log(message);

    if (typeof (message) === 'string') {
        ngScope().$apply(function ($s) {
            var now = new Date();
            message = now.logFormat() + "> " + message;
            $s.output += message + "\n";
        });

        if ($consoleTextarea) {
            var t = $consoleTextarea[0];
            t.scrollTop = t.scrollHeight - t.clientHeight;
        }
    }
}

function showError(message) {
    console.log(message);

    if (typeof (message) === 'string') {
        ngScope().$apply(function($s) {
            $s.error = message;
            var now = new Date();
            $s.output += now.logFormat() + "> " + message + "\n";
        });

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
        $scope.gaView = null;
        $scope.gaViews = null;
        $scope.trackingCode = ""; //"UA-2003853-6";
        $scope.trackingCodes = null;
        $scope.accounts = null;
        $scope.accountId = "";
        $scope.username = "";

        $scope.trackingCodeChanged = function () {
            // TODO: Query for views.
        };

        $scope.error = "";
        $scope.output = "";
        $scope.startDate = startDate;
        $scope.endDate = endDate;

        $scope.results = null;
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

    $("#fetchResults").on('click', function (e) {
        ngScope().$apply(function ($s) {
            $s.error = "";
            $s.results = null;
        });
        makeApiCall();
    });

    //$("#form").on("click", "label.account input", function (e) {
    //    var val = $(this).val();
    //    var name = $(this).data('name');
    //    log("Switching accounts: " + name + "(id: " + val + ")");
    //    ngScope().$apply(function ($s) {
    //        $s.accountId = val;
    //    });
    //});
});

