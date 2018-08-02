angular.module('app')
    .controller('analiticoFinalControlDatosController', function ($scope, $routeParams, $rootScope, $location, Auth, $uibModal, utilityService, data, $uibModalInstance, workflowService) {

        var confirmacionDatosPersonalesController = this;

        confirmacionDatosPersonalesController.legajo = undefined;

        confirmacionDatosPersonalesController.idPantalla = data.Pantalla.IdPantalla;
        data.idPantalla = data.Pantalla.IdPantalla;
        confirmacionDatosPersonalesController.data = data;
        confirmacionDatosPersonalesController.cumpleRequisitos = false;

        confirmacionDatosPersonalesController.init = function () {
            Auth.tokenCookieExists();
        };

        confirmacionDatosPersonalesController.cancel = function () {
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

        confirmacionDatosPersonalesController.next = function () {
            var auxDate = new Date();
            var fechaFin = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());

            var estadoInstanciaData = confirmacionDatosPersonalesController.data;

            estadoInstanciaData.EstadoEstado = 2;

            var valoresSalida = estadoInstanciaData.ValoresSalida != '' ? JSON.parse(estadoInstanciaData.ValoresSalida) : {};

            valoresSalida.cumpleRequisitos = confirmacionDatosPersonalesController.cumpleRequisitos;

            estadoInstanciaData.ValoresSalida = JSON.stringify( valoresSalida );

            estadoInstanciaData.FechaFin = fechaFin;
            success_updateEstadoInstancia_Request = function (response) {
                workflowService.getNextEstadoByIdEstadoActual(confirmacionDatosPersonalesController.data.IdEstadoDefinicion, true, confirmacionDatosPersonalesController.data);
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