angular.module('app')
  .controller('footerController', function ($scope, $rootScope, $location, $sessionStorage, utilityService, Auth) {

      var footerController = this;

      footerController.init = function () {

          Auth.tokenCookieExists();

          if ($sessionStorage.user == null) {
              $rootScope.logout();
          }
      };
  });