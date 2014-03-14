"use strict";

var analyticsController = document.getElementById('analyticsController');

function ngScope() {
    return angular.element(analyticsController).scope();
}

var $consoleTextarea = null;

function log(message) {
    console.log(message);

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

function showError(message) {
    console.log(message);

    ngScope().$apply(function ($s) {
        $s.error = message;
        var now = new Date();
        $s.output += now.logFormat() + "> " + message + "\n";
    });
}

gaApp.controller("Analytics",
    function Analytics($scope) {
        $scope.clientId = "";
        $scope.apiKey = "";
        $scope.trackingCode = "";
        $scope.accounts = null;
        $scope.accountId = "";
        $scope.username = "";

        $scope.error = "";
        $scope.output = "";
        $scope.startDate = "";
        $scope.endDate = "";

        $scope.results = null;
    }
);

jQuery(function ($) {
    $consoleTextarea = $("#console textarea");

    var $datepicker = $(".datepicker");
    $datepicker.datepicker();

    $datepicker.each(function (i, dp) {
        $(dp).val($(dp).data('value'));
    });

    $("#fetchResults").on('click', function (e) {
        var $scope = ngScope();
        $scope.error = "";

        $scope.$apply(function ($s) {
            $s.results = null;
        });
        makeApiCall();
    });

    $("#form").on("click", "label.account input", function (e) {
        var val = $(this).val();
        log(val);
        ngScope().$apply(function ($s) {
            $s.accountId = val;
        });
    });
});

