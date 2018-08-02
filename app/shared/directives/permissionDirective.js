angular.module('app')
.directive('permission', ['Auth', function (Auth) {
    return {
        restrict: 'A',
        scope: {
            permission: '@'
        },

        link: function (scope, elem, attrs) {
            scope.$watch(Auth.isLoggedIn, function () {

                scope.permissionType = 'NonExcluding';
                if (attrs.permissiontype) {
                    scope.permissionType = attrs.permissiontype;
                }
                
                /* Para tomar los permisos escritos desde etiquetas, debemos convertirlos en un array */
                /* Para tomarlos desde un array, debemos reemplazar las comillas simples con las comillas dobles */
                /* De esta forma, la conversion a JSON array no falla */
                while (attrs.permission.indexOf("'") != -1) {
                    attrs.permission = attrs.permission.replace("'", '"');
                }
                /* Conversión a JSON array */
                scope.permission = JSON.parse(attrs.permission);

                if (Auth.userHasPermission(scope.permission, scope.permissionType)) {
                    $(elem).show();
                } else {
                    $(elem).hide();
                }
            });
        }
    }
}]);