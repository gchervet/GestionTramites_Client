angular.module('app')
  .controller('consultaDeMatriculacionesController', function ($scope, $rootScope, $location, Auth) {

      var consultaDeMatriculacionesController = this;

      consultaDeMatriculacionesController.init = function () {

          Auth.tokenCookieExists();

          //if (Auth.userHasPermission(["administration"])) {
          //    var userName = Auth.currentUser().name;
          //}
      };

  });