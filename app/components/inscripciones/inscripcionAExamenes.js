angular.module('app')
  .controller('inscripcionAExamenesController', function ($scope, $rootScope, $location, Auth) {

      var inscripcionAExamenesController = this;

      inscripcionAExamenesController.init = function () {

          Auth.tokenCookieExists();

          //if (Auth.userHasPermission(["administration"])) {
          //    var userName = Auth.currentUser().name;
          //}
      };

  });