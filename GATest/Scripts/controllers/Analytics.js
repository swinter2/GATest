"use strict";

gaApp.controller("Analytics",
    function Analytics($scope) {
        $scope.username = "";
        $scope.error = "";
        $scope.output = "";
        $scope.clientId = "";
        $scope.apiKey = "";
        $scope.trackingCode = "";
        $scope.results = null;

        $scope.fetchData = function() {
        };
    }
);

