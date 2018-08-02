angular.module('app')
    .controller('duplicadoAnaliticoEstadoAdministrativoController', function ($scope, $rootScope, $location, Auth, $uibModal, utilityService, $routeParams, $uibModalInstance, data, idListPrecios, workflowService, filemanagerService) {

        var estadoAdministrativoController = this;
        estadoAdministrativoController.arancelList = [{ Name: 'Duplicado Analítico Final', Id: 0, Check: false }, { Name: 'Duplicado de Título', Id: 1, Check: false }];
        estadoAdministrativoController.idPantalla = data.idPantalla;
        estadoAdministrativoController.legajo = data.legajo;
        estadoAdministrativoController.total;
        estadoAdministrativoController.saldoString;
        estadoAdministrativoController.someChecked = false;
        estadoAdministrativoController.data = data;

        estadoAdministrativoController.alumnoData =
        {
            Saldo: -250
        };

        estadoAdministrativoController.checkChecked = function() {
            estadoAdministrativoController.someChecked = estadoAdministrativoController.arancelList.some(elem => elem.Check);
        }

        estadoAdministrativoController.fillTableItemPrecio = function (response) {
            estadoAdministrativoController.arancelList = response.data;
            estadoAdministrativoController.total = estadoAdministrativoController.alumnoData.Saldo < 0 ? estadoAdministrativoController.alumnoData.Saldo + response.data[0].Valor : response.data[0].Valor;

            estadoAdministrativoController.saldoString = "$ ";

            if (estadoAdministrativoController.alumnoData.Saldo < 0) {
                estadoAdministrativoController.saldoString += "-";
                estadoAdministrativoController.saldoString += (estadoAdministrativoController.alumnoData.Saldo * -1);
            }
            else {
                estadoAdministrativoController.saldoString += estadoAdministrativoController.alumnoData.Saldo;
            }
        }

        estadoAdministrativoController.init = function () {

            Auth.tokenCookieExists();

            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/UniCtaCteEstado/GetSaldoByLegajo/" + estadoAdministrativoController.legajo,
                callbackSuccess: function(response) {
                    estadoAdministrativoController.alumnoData = response.data;

                    utilityService.callSecureHttp({
                        method: "GET",
                        url: "secure-api/TraPrecioItem/GetByPrecioItemByIdPantalla/" + idListPrecios.base + "&" + estadoAdministrativoController.idPantalla,
                        callbackSuccess: estadoAdministrativoController.fillTableItemPrecio
                    });
                }
            });
        };

        estadoAdministrativoController.confirmSave = function () {
            console.log(estadoAdministrativoController.arancelList);
            var data = {
                messageType: 3,
                messageTitle: 'Confirmar y guardar',
                message: 'Al presionar Aceptar se generará el movimiento de cobro por Duplicado de Analítico y/o Diplomas en tu cuenta corriente. ¿Deseas continuar?',
                messageYes: 'Aceptar',
                messageNo: 'Cancelar'
            };
            var modal = utilityService.showMessage(data);
            
            modal.result.then(
                function (result) { },
                function (result) {
                    if (result == 'ok') {
                        //terminar tramite?
                    }
                    if (result == 'cancel') {
                        console.log("CANCEL!")
                    }
                });
        }
        
        estadoAdministrativoController.showCtaCte = function () {
            window.open('https://miportal.kennedy.edu.ar/', '_blank');
        }

        estadoAdministrativoController.payMethod = function () {
            //agregar llamada para hacer el pago
            return true;
        }

        estadoAdministrativoController.payContinue = function () {
            if (estadoAdministrativoController.payMethod()) {
                var auxDate = new Date();
                var fechaFin = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                    (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());

                var estadoInstanciaData = estadoAdministrativoController.data;

                estadoInstanciaData.EstadoEstado = 2;

                estadoInstanciaData.FechaFin = fechaFin;
                success_updateEstadoInstancia_Request = function (response) {
                    workflowService.getNextEstadoByIdEstadoActualP(estadoAdministrativoController.data.IdEstadoDefinicion, true, estadoAdministrativoController.data)
                        .then(function (result) {
                            workflowService.getInstanciaTramiteById(estadoAdministrativoController.data.IdInstanciaTramite)
                                .then(result => {
                                    filemanagerService.createDirectory(result.IdInstanciaTramite, result.IdInstanciaTramiteActivo, estadoAdministrativoController.data.Username)
                                        .then(result2 => {
                                            if (estadoAdministrativoController.data.attachData.dniFront)
                                                filemanagerService.upload(result2.userFolder, estadoAdministrativoController.data.attachData.dniFront, 'dni_frente');
                                            if (estadoAdministrativoController.data.attachData.dniBack)
                                                filemanagerService.upload(result2.userFolder, estadoAdministrativoController.data.attachData.dniBack, 'dni_reverso');
                                            if (estadoAdministrativoController.data.attachData.title)
                                                filemanagerService.upload(result2.userFolder, estadoAdministrativoController.data.attachData.title, 'titulo_secundario');
                                            if (estadoAdministrativoController.data.attachData.accreditation)
                                                filemanagerService.upload(result2.tramiteFolder, estadoAdministrativoController.data.attachData.accreditation, 'convalidacion');
                                            if (estadoAdministrativoController.data.attachData.lossComplaint)
                                                filemanagerService.upload(result2.tramiteFolder, estadoAdministrativoController.data.attachData.lossComplaint, 'denuncia_extravio');

                                            var data = {
                                                messageType: 1,
                                                messageTitle: 'Pagar Online y Finalizar',
                                                message: 'Tu solicitud de Trámite ha sido registrada exitosamente.\nNro. de Trámite ' + result.IdInstanciaTramiteActivo + '\nPodrás realizar el seguimiento desde la aplicación de Gestión de Trámites, telefónicamente al 0800xxxxxxx o vía email a admin@kennedy.edu.ar.',
                                            };
                                            var modal = utilityService.showMessage(data);

                                            modal.result.then(
                                                function (result) { },
                                                function (result) {
                                                    $uibModalInstance.dismiss('finish');
                                                    return false;
                                                });
                                        }, result, estadoAdministrativoController.data);
                                }, estadoAdministrativoController.data);
                        }, estadoAdministrativoController.data);
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
            else {
                var data = {
                    messageType: 2,
                    messageTitle: 'Pagar Online y Finalizar',
                    message: 'Lamentablemente su pago no se ha podido realizar.',
                };
                utilityService.showMessage(data)                
            }
        }

        estadoAdministrativoController.cancel = function () {
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
                        $uibModalInstance.dismiss('cancel');
                        return false;
                    }
                    if (result == 'cancel') {
                        console.log("CANCEL!")
                    }
                });
        }

        estadoAdministrativoController.back = function () {
            $uibModalInstance.dismiss('back');
            return false;
        }  
        
        estadoAdministrativoController.confirmContinue = function () {
            if (estadoAdministrativoController.payMethod()) {
                var auxDate = new Date();
                var fechaFin = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                    (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());

                var estadoInstanciaData = estadoAdministrativoController.data;

                estadoInstanciaData.EstadoEstado = 2;

                estadoInstanciaData.FechaFin = fechaFin;
                success_updateEstadoInstancia_Request = function (response) {
                    workflowService.getNextEstadoByIdEstadoActualP(estadoAdministrativoController.data.IdEstadoDefinicion, true, estadoAdministrativoController.data)
                        .then(function (result) {
                            workflowService.getInstanciaTramiteById(estadoAdministrativoController.data.IdInstanciaTramite)
                                .then(result => {
                                    filemanagerService.createDirectory(result.IdInstanciaTramite, result.IdInstanciaTramiteActivo, estadoAdministrativoController.data.Username)
                                        .then(result2 => {
                                            if (estadoAdministrativoController.data.attachData.dniFront)
                                                filemanagerService.upload(result2.userFolder, estadoAdministrativoController.data.attachData.dniFront, 'dni_frente');
                                            if (estadoAdministrativoController.data.attachData.dniBack)
                                                filemanagerService.upload(result2.userFolder, estadoAdministrativoController.data.attachData.dniBack, 'dni_reverso');
                                            if (estadoAdministrativoController.data.attachData.title)
                                                filemanagerService.upload(result2.userFolder, estadoAdministrativoController.data.attachData.title, 'titulo_secundario');
                                            if (estadoAdministrativoController.data.attachData.accreditation)
                                                filemanagerService.upload(result2.tramiteFolder, estadoAdministrativoController.data.attachData.accreditation, 'convalidacion');
                                            if (estadoAdministrativoController.data.attachData.lossComplaint)
                                                filemanagerService.upload(result2.tramiteFolder, estadoAdministrativoController.data.attachData.lossComplaint, 'denuncia_extravio');

                                            var data = {
                                                messageType: 1,
                                                messageTitle: 'Confirmar y Finalizar',
                                                message: 'Tu solicitud de Trámite ha sido registrada exitosamente.\nNro. de Trámite ' + result.IdInstanciaTramiteActivo + '\nPodrás realizar el seguimiento desde la aplicación de Gestión de Trámites, telefónicamente al 0800xxxxxxx o vía email a admin@kennedy.edu.ar.',
                                            };
                                            var modal = utilityService.showMessage(data);

                                            modal.result.then(
                                                function (result) { },
                                                function (result) {
                                                    $uibModalInstance.dismiss('finish');
                                                    return false;
                                                });
                                        }, result, estadoAdministrativoController.data);
                                }, estadoAdministrativoController.data);
                        }, estadoAdministrativoController.data);
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
            else {
                var data = {
                    messageType: 2,
                    messageTitle: 'Confirmar y Finalizar',
                    message: 'Lamentablemente su pago no se ha podido realizar.',
                };
                utilityService.showMessage(data)                
            }
        }
    })