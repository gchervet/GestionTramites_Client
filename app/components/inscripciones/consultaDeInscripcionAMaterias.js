angular.module('app')
  .controller('consultaDeInscripcionAMateriasController', function ($scope, $rootScope, $location, Auth) {

      var consultaDeInscripcionAMateriasController = this;

      consultaDeInscripcionAMateriasController.init = function () {

          Auth.tokenCookieExists();

          //if (Auth.userHasPermission(["administration"])) {
          //    var userName = Auth.currentUser().name;
          //}
      };

  });