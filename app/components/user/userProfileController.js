angular.module('app')
    .controller('userProfileController', function ($scope, $rootScope, $location, Auth) {

        var userProfileController = this;

        userProfileController.init = function () {
            Auth.tokenCookieExists();
        };

    });