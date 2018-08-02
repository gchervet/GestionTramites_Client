angular.module('app')
  .controller('inscripcionAMateriasController', function ($scope, $rootScope, $location, Auth) {

      var inscripcionAMateriasController = this;

      inscripcionAMateriasController.init = function () {

          Auth.tokenCookieExists();

          //if (Auth.userHasPermission(["administration"])) {
          //    var userName = Auth.currentUser().name;
          //}
      };

  });