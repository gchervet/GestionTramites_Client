angular.module('app')
    .controller('confirmacionDatosPersonalesController', function ($scope, $routeParams, $rootScope, $location, Auth, $uibModal, utilityService) {

        var confirmacionDatosPersonalesController = this;
        
        confirmacionDatosPersonalesController.showHeader = $routeParams.showHeader || false;
        
        confirmacionDatosPersonalesController.dummyData =
            {
                Legajo: '25555',
                Carrera: 'QUÍMICA',
                Nombre: 'Test Alumno 001',
                Modalidad: 0,
                TipoDocumento: 0,
                Documento: 12345678,
                LugarNacimiento: 'XXXXXXXXXXXXXXXXXXXXXXXXXXX',
                FechaNacimiento: '15/05/1985',
                Domicilio: 'La Casa Test Alumno 001',
                Localidad: 'CABA',
                CodigoPostal: '1037',
                Telefono1: '1555555555',
                Telefono2: '01155551111',
                Mail1: 'alumnoprueba@gmail.com',
                Mail2: 'aprueba@kennedy.edu.ar',
                MesAnoFinalCarreraUK: '06/2015',
                AnoFinalSecundario: '2000',
                NombreOpcional: 'Fulano A',
                TelefonoOpcional: '1511111111',
                MailOpcional: 'fulano@algo.com'
            };
        confirmacionDatosPersonalesController.confirmed = false;

        confirmacionDatosPersonalesController.tipoDocumentos =
            [{ id: 0, name: 'DNI' },
            { id: 1, name: 'Pasaporte' },
            { id: 2, name: 'LC' }];

        confirmacionDatosPersonalesController.tipoModalidades =
            [{ id: 0, name: 'Presencial' },
            { id: 1, name: 'Virtual' }];

        confirmacionDatosPersonalesController.init = function () {

            Auth.tokenCookieExists();
        };

        confirmacionDatosPersonalesController.checkConfirmed = function () {
            if (confirmacionDatosPersonalesController.confirmed) {
                var data = {
                    messageTitle: 'Validación de Datos Personales',
                    message: 'Al presionar Siguiente confirmas que los datos ingresados son correctos, ya que estos serán utilizados para la confección del certificado ante el Ministerio de Educación.'
                };

                utilityService.showMessage(data);
            }

        };

        confirmacionDatosPersonalesController.cancel = function () {
            var data = {
                messageTitle: '¿Estás seguro que deseas cancelar el trámite',
                message: 'Al presionar Si se te devolverá el importe del pago realizado y el trámite quedará en estado "Pendiente de pago". Podrás retomarlo en otro momento o eliminarlo desde la aplicación de Gestión de Trámites.',
                messageType: 3
            };

            var modal = utilityService.showMessage(data);

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

        confirmacionDatosPersonalesController.next = function () {
            //lógica al aceptar los datos y guardarlos
        }

        confirmacionDatosPersonalesController.getDatosPersonales = function (legajo) {
          
            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/UniAlumno/GetDatosPersonalesByLegajoMock/" + legajo,
                callbackSuccess: confirmacionDatosPersonalesController.getDatosPersonalesCallback,
                callbackError: confirmacionDatosPersonalesController.getDatosPersonalesCallback
            });
        };

        confirmacionDatosPersonalesController.getDatosPersonalesCallback = function (response) {
            if (response) {
                confirmacionDatosPersonalesController.dummyData = response.data;
            }
        };  

    })