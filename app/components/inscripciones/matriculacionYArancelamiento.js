angular.module('app')
  .controller('matriculacionYArancelamientoController', function ($scope, $rootScope, $location, Auth) {

      var matriculacionYArancelamientoController = this;

      matriculacionYArancelamientoController.init = function () {

          Auth.tokenCookieExists();

          //if (Auth.userHasPermission(["administration"])) {
          //    var userName = Auth.currentUser().name;
          //}
      };

  });