angular.module('app')
    .controller('estadoInstanciaObservacionesController', function ($scope, $rootScope, $uibModalInstance, data, utilityService, workflowService) {

        var estadoInstanciaObservacionesController = this;

        $scope.data = data;
        $scope.inputComentario = '';

        $scope.cancel = function () {

            if ($scope.inputComentario.trim()) {
                var data = {
                    messageTitle: '¿Desea salir?',
                    message: 'Al presionar "Salir" los cambios en progreso se perderán.',
                    messageType: 3
                };

                var modal = utilityService.showMessage(data);

                modal.result.then(
                    function (result) { },
                    function (result) {
                        if (result == 'ok') {
                            $uibModalInstance.dismiss('cancel');
                            return false;
                        }
                        if (result == 'cancel') {
                            console.log("CANCEL!")
                        }
                    });
            }
            else {
                $uibModalInstance.dismiss('cancel');
            }


        };

        estadoInstanciaObservacionesController.GetObservacionesListByTramiteId = function () {

            var process_GetObservacionesListByTramiteId_request = function () {
                utilityService.callSecureHttp({
                    method: "GET",
                    url: "secure-api/TraEstadoInstanciaObservaciones/GetByIdInstanciaTramite/" + $scope.data.NroTramite,
                    callbackSuccess: success_GetObservacionesListByTramiteId_Request,
                    callbackError: success_GetObservacionesListByTramiteId_Request
                });
            };

            var success_GetObservacionesListByTramiteId_Request = function (response) {
                if (response.data) {
                    $scope.data.ObservacionList = response.data;
                }
            };
            process_GetObservacionesListByTramiteId_request();
        };

        $scope.submitObservacion = function () {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {

                if ($scope.inputComentario.trim()) {

                    // GUARDAR OBSERVACIONES
                    var process_createUpdateObservacion_request = function (data) {
                        utilityService.callSecureHttp({
                            method: "POST",
                            url: "secure-api/TraEstadoInstanciaObservaciones/Create",
                            data: data,
                            callbackSuccess: success_createUpdateObservacion_Request,
                            callbackError: error_createUpdateObservacion_Request
                        });
                    };

                    var success_createUpdateObservacion_Request = function (response) {
                        $scope.inputComentario = '';
                        estadoInstanciaObservacionesController.GetObservacionesListByTramiteId();
                    };

                    var error_createUpdateObservacion_Request = function (response) {
                        utilityService.showMessage({
                            messageType: 2,
                            messageTitle: "Error",
                            message: "Ocurrió un error inesperado."
                        });
                    };
                    process_createUpdateObservacion_request({ Texto: $scope.inputComentario, IdInstanciaTramite: $scope.data.NroTramite, IdEstadoInstancia: $scope.data.NroTarea, IdUsuarioAsignado: $scope.data.UsuarioAsignadoIdUsuario });


                }

                //alert('You pressed a "enter" key in textbox, here submit your form'); 
            }
        }

        estadoInstanciaObservacionesController.GetObservacionesListByTramiteId();

    });