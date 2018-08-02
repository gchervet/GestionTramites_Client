angular.module('app')
  .controller('mainController', function ($scope, $rootScope, $location, Auth) {

      var mainController = this;

      mainController.init = function () {

          Auth.tokenCookieExists();

          //if (Auth.userHasPermission(["administration"])) {
          //    var userName = Auth.currentUser().name;
          //}
      };

  });