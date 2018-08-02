angular.module('app')
  .controller('crearCursoDesdeCarreraController', function ($scope, $rootScope, $location, $sessionStorage, utilityService, Auth) {

      var crearCursoDesdeCarreraController = this;

      crearCursoDesdeCarreraController.init = function () {

          Auth.tokenCookieExists();

          if ($sessionStorage.user == null) {
              $rootScope.logout();
          }
      };
  });