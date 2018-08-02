angular.module('app')
    .controller('tituloTramiteEstadoAdministrativoController', function ($scope, $rootScope, $location, Auth, $uibModal, utilityService, $routeParams, $uibModalInstance, data, idListPrecios, workflowService) {

        var estadoAdministrativoController = this;
        estadoAdministrativoController.arancelList = [{ Descripcion: 'Constancia de Título en Trámite', Valor: 500 }];
        estadoAdministrativoController.legajo = undefined;

        estadoAdministrativoController.idPantalla = data.Pantalla.IdPantalla;
        data.idPantalla = data.Pantalla.IdPantalla;

        estadoAdministrativoController.data = data;
        estadoAdministrativoController.total;
        estadoAdministrativoController.saldoString;
        estadoAdministrativoController.paises = [];
        estadoAdministrativoController.selectedCountry = null;
        estadoAdministrativoController.chkForeign = false;
        estadoAdministrativoController.foreignInstitution = '';

        estadoAdministrativoController.alumnoPagaTitulo = false; //En una tarea mas adelante se van a diferenciar los alumnos que pagan y los que no.

        estadoAdministrativoController.alumnoData =
            {
                Saldo: -250
            };

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


            estadoAdministrativoController.getPersonalData();
            estadoAdministrativoController.getAllPaises();
        };

        estadoAdministrativoController.getAllPaises = function () {
            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/PadPaises/GetAll/",
                callbackSuccess: estadoAdministrativoController.getAllPaisesCallback
            });
        };

        estadoAdministrativoController.getAllPaisesCallback = function (response) {
            estadoAdministrativoController.paises = response.data;
        }

        estadoAdministrativoController.foreignKeyUp = function(value) {
            estadoAdministrativoController.foreignInstitution = estadoAdministrativoController.foreignInstitution.replace(/[^a-z\dA-Z ]/, '');
        }

        estadoAdministrativoController.getPersonalData = function () {
            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/UniAlumno/GetAlumnoByUsername/" + data.Username,
                callbackSuccess: estadoAdministrativoController.getAlumnoByUsernameCallback
            });
        };

        estadoAdministrativoController.getAlumnoByUsernameCallback = function (response) {
            estadoAdministrativoController.legajo = response.data.LegajoProvisorio;
            data.legajo = response.data.LegajoProvisorio;
            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/UniCtaCteEstado/GetSaldoByLegajo/" + estadoAdministrativoController.legajo,
                callbackSuccess: estadoAdministrativoController.GetSaldoByLegajoCallback
            });
        };

        estadoAdministrativoController.GetSaldoByLegajoCallback = function (response) {
            estadoAdministrativoController.alumnoData = response.data;

            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/TraPrecioItem/GetByPrecioItemByIdPantalla/" + idListPrecios.base + "&" + estadoAdministrativoController.idPantalla,
                callbackSuccess: estadoAdministrativoController.fillTableItemPrecio
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

                var valoresSalida = estadoInstanciaData.ValoresSalida != '' ? JSON.parse(estadoInstanciaData.ValoresSalida) : {};

                valoresSalida.presentaExterior = estadoAdministrativoController.chkForeign;
                valoresSalida.paisExterior = estadoAdministrativoController.selectedCountry;
                valoresSalida.institucionExterior = estadoAdministrativoController.foreignInstitution;
                
                estadoInstanciaData.ValoresSalida = JSON.stringify( valoresSalida );

                estadoInstanciaData.FechaFin = fechaFin;
                success_updateEstadoInstancia_Request = function (response) {
                    workflowService.getNextEstadoByIdEstadoActualP(estadoAdministrativoController.data.IdEstadoDefinicion, true, estadoAdministrativoController.data)
                        .then(function (result) {
                            workflowService.getInstanciaTramiteById(estadoAdministrativoController.data.IdInstanciaTramite)
                                .then(result => {
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
                                });
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

        estadoAdministrativoController.confirm = function () {
            var auxDate = new Date();
            var fechaFin = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());

            var estadoInstanciaData = estadoAdministrativoController.data;

            estadoInstanciaData.EstadoEstado = 2;

            var valoresSalida = estadoInstanciaData.ValoresSalida != '' ? JSON.parse(estadoInstanciaData.ValoresSalida) : {};

            valoresSalida.presentaExterior = estadoAdministrativoController.chkForeign;
            valoresSalida.paisExterior = estadoAdministrativoController.selectedCountry;
            valoresSalida.institucionExterior = estadoAdministrativoController.foreignInstitution;

            estadoInstanciaData.ValoresSalida = JSON.stringify(valoresSalida);

            estadoInstanciaData.FechaFin = fechaFin;
            success_updateEstadoInstancia_Request = function (response) {
                workflowService.getNextEstadoByIdEstadoActualP(estadoAdministrativoController.data.IdEstadoDefinicion, true, estadoAdministrativoController.data)
                    .then(function (result) {
                        workflowService.getInstanciaTramiteById(estadoAdministrativoController.data.IdInstanciaTramite)
                            .then(result => {
                                var data = {
                                    messageType: 1,
                                    messageTitle: 'Finalizar',
                                    message: 'Tu solicitud de Trámite ha sido registrada exitosamente.\nNro. de Trámite ' + result.IdInstanciaTramiteActivo + '\nPodrás realizar el seguimiento desde la aplicación de Gestión de Trámites, telefónicamente al 0800xxxxxxx o vía email a admin@kennedy.edu.ar.',
                                };
                                var modal = utilityService.showMessage(data);

                                modal.result.then(
                                    function (result) { },
                                    function (result) {
                                        $uibModalInstance.dismiss('finish');
                                        return false;
                                    });
                            });
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

        estadoAdministrativoController.cancel = function () {
            var data = {
                messageTitle: '¿Desea salir?',
                message: '¿Estás seguro que deseas cancelar el trámite?',
                messageType: 3
            };

            var modal = utilityService.showMessage(data);

            modal.result.then(
                function (result) { },
                function (result) {
                    if (result == 'ok') {
                        var instanciaTramiteToUpdate = estadoAdministrativoController.data;
                        instanciaTramiteToUpdate.EstadoEstado = 6;
                        workflowService.updateInstanciaEstado(instanciaTramiteToUpdate).then(function (updateResponse) {
                            $uibModalInstance.dismiss('cancel');
                            return false;
                        })
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

                var valoresSalida = estadoInstanciaData.ValoresSalida != '' ? JSON.parse(estadoInstanciaData.ValoresSalida) : {};

                valoresSalida.presentaExterior = estadoAdministrativoController.chkForeign;
                valoresSalida.paisExterior = estadoAdministrativoController.selectedCountry;
                valoresSalida.institucionExterior = estadoAdministrativoController.foreignInstitution;
                
                estadoInstanciaData.ValoresSalida = JSON.stringify( valoresSalida );

                estadoInstanciaData.FechaFin = fechaFin;
                success_updateEstadoInstancia_Request = function (response) {
                    workflowService.getNextEstadoByIdEstadoActualP(estadoAdministrativoController.data.IdEstadoDefinicion, true, estadoAdministrativoController.data)
                        .then(function (result) {
                            workflowService.getInstanciaTramiteById(estadoAdministrativoController.data.IdInstanciaTramite)
                                .then(result => {
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
                                });
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