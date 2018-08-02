angular.module('app')
  .controller('consultaDeInscripcionAExamenesController', function ($scope, $rootScope, $location, Auth) {

      var consultaDeInscripcionAExamenesController = this;

      consultaDeInscripcionAExamenesController.init = function () {

          Auth.tokenCookieExists();

          //if (Auth.userHasPermission(["administration"])) {
          //    var userName = Auth.currentUser().name;
          //}
      };

  });