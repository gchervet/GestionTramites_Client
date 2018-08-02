angular.module('app')
    .controller('analiticoParcialCorregirSolicitudController', function ($scope, $routeParams, $rootScope, $location, Auth, $uibModal, utilityService, data, $uibModalInstance, workflowService) {

        var corregirSolicitudController = this;

        corregirSolicitudController.legajo = undefined;

        corregirSolicitudController.idPantalla = data.Pantalla.IdPantalla;
        data.idPantalla = data.Pantalla.IdPantalla;
        corregirSolicitudController.data = data;
        corregirSolicitudController.correccion = false;

        corregirSolicitudController.init = function () {
            Auth.tokenCookieExists();
        };

        corregirSolicitudController.cancel = function () {
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

        corregirSolicitudController.next = function () {
            var auxDate = new Date();
            var fechaFin = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());

            var estadoInstanciaData = corregirSolicitudController.data;

            estadoInstanciaData.EstadoEstado = 2;

            var valoresSalida = estadoInstanciaData.ValoresSalida != '' ? JSON.parse(estadoInstanciaData.ValoresSalida) : {};

            valoresSalida.Correccion = corregirSolicitudController.correccion;

            estadoInstanciaData.ValoresSalida = JSON.stringify( valoresSalida );

            estadoInstanciaData.FechaFin = fechaFin;
            success_updateEstadoInstancia_Request = function (response) {
                workflowService.getNextEstadoByIdEstadoActual(corregirSolicitudController.data.IdEstadoDefinicion, true, corregirSolicitudController.data);
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