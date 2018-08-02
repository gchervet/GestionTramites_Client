angular.module('app')
  .controller('homeController', function ($scope, $rootScope, $location, $sessionStorage, utilityService, Auth) {

      var homeController = this;

      homeController.init = function () {

          Auth.tokenCookieExists();

          if ($sessionStorage.user == null) {
              $rootScope.logout();
          }
      };
  });