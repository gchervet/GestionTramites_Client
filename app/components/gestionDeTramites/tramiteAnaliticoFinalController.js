angular.module('app')
    .controller('tramiteAnaliticoFinalController', function ($scope, $rootScope, $location, Auth, $uibModal, utilityService, $routeParams) {

        var tramiteAnaliticoFinalController = this;
        tramiteAnaliticoFinalController.showHeader = $routeParams.showHeader || false;

        tramiteAnaliticoFinalController.selectedTramite = null;
        tramiteAnaliticoFinalController.dummyData =
            {
                TramiteSolicitado: 'Certificación de datos',
                Fecha: '08/11/17',
                Estado: 'Iniciado pago',
                EstadoDescription: 'Iniciado pago',
                Legajo: '25555',
                Eliminar: '<i class="fa fa-times-circle fa-lg" style="cursor: pointer"></i>',
                Carrera: 'QUÍMICA',
                Descripción: '',
                Observaciones: '',
                TramiteNro: '001',
                Nombre: 'Test Alumno 001',
                Saldo: 2000
            };
        tramiteAnaliticoFinalController.arancelAnalitico = 1500;
        tramiteAnaliticoFinalController.arancelCertificado = 300;
        tramiteAnaliticoFinalController.analiticoExpress = 900;
        tramiteAnaliticoFinalController.chkArancelAnalitico = false;
        tramiteAnaliticoFinalController.chkArancelCertificado = false;
        tramiteAnaliticoFinalController.chkAnaliticoExpress = false;
        tramiteAnaliticoFinalController.total = 0;



        tramiteAnaliticoFinalController.init = function () {

            Auth.tokenCookieExists();
        };

        tramiteAnaliticoFinalController.chkChecked = function () {
            var subtotal = 0;
            if (tramiteAnaliticoFinalController.chkArancelAnalitico)
                subtotal += tramiteAnaliticoFinalController.arancelAnalitico;
            if (tramiteAnaliticoFinalController.chkArancelCertificado)
                subtotal += tramiteAnaliticoFinalController.arancelCertificado;
            if (tramiteAnaliticoFinalController.chkAnaliticoExpress)
                subtotal += tramiteAnaliticoFinalController.analiticoExpress;

            if (tramiteAnaliticoFinalController.chkArancelAnalitico || tramiteAnaliticoFinalController.chkArancelCertificado || tramiteAnaliticoFinalController.chkAnaliticoExpress) {
                subtotal = subtotal - tramiteAnaliticoFinalController.dummyData.Saldo;
                tramiteAnaliticoFinalController.total = subtotal > 0 ? subtotal : 0;
            }
            else
                tramiteAnaliticoFinalController.total = 0;

        };

        tramiteAnaliticoFinalController.confirmSave = function () {
            var data = {
                messageType: 3,
                messageTitle: 'Confirmar y guardar',
                message: 'Al presionar Aceptar se generará el movimiento de cobro por Trámite de Analítico Final en tu cuenta corriente. ¿Deseas continuar?',
                messageYes: 'Aceptar',
                messageNo: 'Cancelar'
            };
            var modal = utilityService.showMessage(data)
            modal.result.then(
                function (result) { },
                function (result) {
                    if (result == 'ok') {
                        console.log("OK!")
                    }
                    if (result == 'cancel') {
                        console.log("CANCEL!")
                    }
                });
        }
        
        tramiteAnaliticoFinalController.showCtaCte = function () {
        }

        tramiteAnaliticoFinalController.payMethod = function () {
            //agregar llamada para hacer el pago
            return true;
        }

        tramiteAnaliticoFinalController.payContinue = function () {
            if (tramiteAnaliticoFinalController.payMethod()) {
                var data = {
                    messageType: 1,
                    messageTitle: 'Pagar Online y Finalizar',
                    message: 'Su pago fue realizado con éxito.',
                };
                utilityService.showMessage(data)                
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
    })