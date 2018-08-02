angular.module('app')
    .controller('analiticoParcialConfeccionaAnexoController', function ($scope, $routeParams, $rootScope, $location, Auth, $uibModal, utilityService, data, $uibModalInstance, workflowService) {

        var confeccionaAnexoController = this;

        confeccionaAnexoController.legajo = undefined;

        confeccionaAnexoController.idPantalla = data.Pantalla.IdPantalla;
        data.idPantalla = data.Pantalla.IdPantalla;
        confeccionaAnexoController.data = data;
        confeccionaAnexoController.anexo = false;

        confeccionaAnexoController.init = function () {
            Auth.tokenCookieExists();
        };

        confeccionaAnexoController.cancel = function () {
            var data = {
                messageTitle:'¿Desea salir?',
                message: '¿Estás seguro que deseas cancelar el trámite?',
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

        confeccionaAnexoController.next = function () {
            var auxDate = new Date();
            var fechaFin = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());

            var estadoInstanciaData = confeccionaAnexoController.data;

            estadoInstanciaData.EstadoEstado = 2;

            var valoresSalida = estadoInstanciaData.ValoresSalida != '' ? JSON.parse(estadoInstanciaData.ValoresSalida) : {};

            valoresSalida.Anexo = confeccionaAnexoController.anexo;

            estadoInstanciaData.ValoresSalida = JSON.stringify( valoresSalida );

            estadoInstanciaData.FechaFin = fechaFin;
            success_updateEstadoInstancia_Request = function (response) {
                workflowService.getNextEstadoByIdEstadoActual(confeccionaAnexoController.data.IdEstadoDefinicion, true, confeccionaAnexoController.data);
                $uibModalInstance.dismiss('cancel');
                return false;
            }

            // LLAMADA AL UPDATE
            utilityService.callSecureHttp({
                method: "POST",
                url: "secure-api/TraEstadoInstancia/Update",
                data: estadoInstanciaData,
                callbackSuccess: success_updateEstadoInstancia_Request,
                callbackError: success_updateEstadoInstancia_Request
            });
        }
    })