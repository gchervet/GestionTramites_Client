angular.module('app')
    .controller('estadoAcademicoController', function ($scope, Auth, utilityService, $uibModalInstance) {

        var estadoAcademicoController = this;

        estadoAcademicoController.legajo = undefined;

        
        estadoAcademicoController.init = function () {
            Auth.tokenCookieExists();
        };

        $scope.$watch('Filters.monthFilter', function (v) {
            $scope.SearchCode = $scope.Filters.yearFilter + $scope.Filters.monthFilter.value;
        });

        $scope.$watch('Filters.yearFilter', function (v) {
            $scope.SearchCode = $scope.Filters.yearFilter + $scope.Filters.monthFilter.value;
        });

        estadoAcademicoController.cancel = function () {
            var data = {
                messageTitle: '¿Desea salir?',
                message: '¿Está seguro que desea salir?',
                messageType: 3
            };

            var modal = utilityService.showMessage(data);

            modal.result.then(
                function (result) { },
                function (result) {
                    if (result == 'ok') {
                        $uibModalInstance.dismiss('finish');
                        return false;
                    }
                    if (result == 'cancel') {
                        console.log("CANCEL!")
                    }
                });
        }
    })