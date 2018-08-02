angular.module('app')
  .controller('crearCursoDesdeCursoController', function ($scope, $rootScope, $location, $sessionStorage, utilityService, Auth) {

      var crearCursoDesdeCursoController = this;

      crearCursoDesdeCursoController.init = function () {

          Auth.tokenCookieExists();

          if ($sessionStorage.user == null) {
              $rootScope.logout();
          }
      };
  });