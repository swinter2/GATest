"use strict";

Date.prototype.logFormat = function () {
    return this.getFullYear() + "-" + this.getMonth() + "-" + this.getDate() + ":" + this.getHours() + ":" + this.getMinutes() + ":" + this.getSeconds() + "." + this.getMilliseconds();
};

Date.prototype.gaFormat = function () {
    var dd = this.getDate();
    if (dd < 10) dd = "0" + dd;
    var MM = this.getMonth() + 1;
    if (MM < 10) MM = "0" + MM;
    var yyyy = this.getFullYear();
    return yyyy + "-" + MM + "-" + dd;
};

String.prototype.formatDate = function() {
    var pattern = new RegExp("^(\\d{4})(\\d{2})(\\d{2})$");
    var match = pattern.exec(this);
    if (match && match[1] && match[2] && match[3]) {
        return match[1] + "-" + match[2] + "-" + match[3];
    }
    return this;
};

var gaApp = angular.module("gaApp", []);
