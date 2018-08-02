angular.module('app')
  .controller('consultaDeDerechosDeExamenController', function ($scope, $rootScope, $location, Auth) {

      var consultaDeDerechosDeExamenController = this;

      consultaDeDerechosDeExamenController.init = function () {

          Auth.tokenCookieExists();

          //if (Auth.userHasPermission(["administration"])) {
          //    var userName = Auth.currentUser().name;
          //}
      };

  });