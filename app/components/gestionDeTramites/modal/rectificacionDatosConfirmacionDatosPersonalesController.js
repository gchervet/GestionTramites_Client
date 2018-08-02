angular.module('app')
    .controller('rectificacionDatosConfirmacionDatosPersonalesController', function ($scope, $routeParams, $rootScope, $location, Auth, $uibModal, utilityService, data, $uibModalInstance, workflowService) {

        var confirmacionDatosPersonalesController = this;

        confirmacionDatosPersonalesController.legajo = undefined;

        confirmacionDatosPersonalesController.idPantalla = data.Pantalla.IdPantalla;
        data.idPantalla = data.Pantalla.IdPantalla;

        confirmacionDatosPersonalesController.data = data;
        
        confirmacionDatosPersonalesController.personalData = {};

        confirmacionDatosPersonalesController.modalidadString = '';

        confirmacionDatosPersonalesController.tipoDocumentoString = '';

        confirmacionDatosPersonalesController.dummyData =
            {
                Legajo: '25555',
                Carrera: 'QUÍMICA',
                Nombre: 'Alumno 001',
                Apellido: 'Test',
                Modalidad: 0,
                TipoDocumento: 0,
                Documento: 12345678,
                LugarNacimiento: 'XXXXXXXXXXXXXXXXXXXXXXXXXXX',
                FechaNacimiento: '15/05/1985',
                Domicilio: 'La Casa Test Alumno 001',
                Localidad: 'CABA',
                CodigoPostal: '1037',
                Telefono: '1555555555',
                Mail: 'alumnoprueba@gmail.com',
                TituloSecundario: 'Titulo',
                AnoFinalSecundario: '2000',
                NombreSecundario: 'Secundario',
                LocalidadSecundario: 'LocalidadSecundario'
            };
        confirmacionDatosPersonalesController.confirmed = false;

        confirmacionDatosPersonalesController.tipoDocumentos =
            [{ id: 1, name: 'DNI' },
            { id: 5, name: 'Pasaporte' },
            { id: 6, name: 'LC' }];

        confirmacionDatosPersonalesController.tipoModalidades =
            [{ id: 0, name: 'Presencial' },
            { id: 1, name: 'Virtual' }];

        confirmacionDatosPersonalesController.init = function () {

            Auth.tokenCookieExists();

            confirmacionDatosPersonalesController.getPersonalData();
        };

        confirmacionDatosPersonalesController.getPersonalData = function() {
            utilityService.callSecureHttp({
                method: "GET", 
                url: "secure-api/UniAlumno/GetAlumnoByUsername/" + data.Username,
                callbackSuccess: confirmacionDatosPersonalesController.getAlumnoByUsernameCallback  
            });
        };

        confirmacionDatosPersonalesController.getAlumnoByUsernameCallback = function(response) {
            confirmacionDatosPersonalesController.legajo = response.data.LegajoProvisorio;
            data.legajo = response.data.LegajoProvisorio;
            utilityService.callSecureHttp({
                method: "GET", 
                url: "secure-api/UniAlumno/GetDatosPersonalesByLegajoProgramasLegalizados/" + confirmacionDatosPersonalesController.legajo,
                callbackSuccess: confirmacionDatosPersonalesController.getPersonalDataCallback
            });
        };
        
        confirmacionDatosPersonalesController.getPersonalDataCallback = function(response){
            confirmacionDatosPersonalesController.personalData = response.data;
            confirmacionDatosPersonalesController.personalDataOriginal = angular.copy(response.data);
            confirmacionDatosPersonalesController.modalidadString = confirmacionDatosPersonalesController.tipoModalidades.find(confirmacionDatosPersonalesController.getModalidad).name;
            confirmacionDatosPersonalesController.tipoDocumentoString = confirmacionDatosPersonalesController.tipoDocumentos.find(confirmacionDatosPersonalesController.getDocumento).name;
        }

        confirmacionDatosPersonalesController.getModalidad = function(modalidad) {
            return modalidad.id == confirmacionDatosPersonalesController.personalData.Modalidad;
        }

        confirmacionDatosPersonalesController.getDocumento = function(documento) {
            return documento.id == confirmacionDatosPersonalesController.personalData.TipoDocumento;
        }

        confirmacionDatosPersonalesController.checkConfirmed = function () {
            if (confirmacionDatosPersonalesController.confirmed) {
                var stringify = function (string) {
                    if (string)
                        return string;
                    else
                        return '';
                }
                var messageString = 'Al presionar Siguiente confirmas que los datos ingresados son correctos, ya que estos serán utilizados para la confección del certificado ante el Ministerio de Educación.' +
                '\nNombre: ' + confirmacionDatosPersonalesController.personalData.Nombre +
                '\nApellido: ' + confirmacionDatosPersonalesController.personalData.Apellido +
                '\nModalidad: ' + confirmacionDatosPersonalesController.tipoModalidades.find(confirmacionDatosPersonalesController.getModalidad).name +
                '\nTipo Documento: ' + confirmacionDatosPersonalesController.tipoDocumentos.find(confirmacionDatosPersonalesController.getDocumento).name +
                '\nDocumento: ' + confirmacionDatosPersonalesController.personalData.Documento +
                '\nLugar Nacimiento: ' + confirmacionDatosPersonalesController.personalData.LugarNacimiento +
                '\nFecha Nacimiento: ' + confirmacionDatosPersonalesController.personalData.FechaNacimiento +
                '\nDomicilio: ' + stringify(confirmacionDatosPersonalesController.personalData.DirCalle) + ' ' + 
                                  stringify(confirmacionDatosPersonalesController.personalData.DirNumero) + ' ' + 
                                  stringify(confirmacionDatosPersonalesController.personalData.DirPiso) + ' ' +
                                  stringify(confirmacionDatosPersonalesController.personalData.DirDepto) +
                '\nLocalidad: ' + stringify(confirmacionDatosPersonalesController.personalData.Localidad) +
                '\nCodigo Postal: ' + stringify(confirmacionDatosPersonalesController.personalData.CodigoPostal) +
                '\nTelefono fijo: ' + stringify(confirmacionDatosPersonalesController.personalData.TelFijoCodPais) +
                                 stringify(confirmacionDatosPersonalesController.personalData.TelFijoCodArea) +
                                 stringify(confirmacionDatosPersonalesController.personalData.TelFijoNumero) +
                '\nTelefono móvil: ' + stringify(confirmacionDatosPersonalesController.personalData.TelMovilCodPais) +
                    stringify(confirmacionDatosPersonalesController.personalData.TelMovilCodArea) +
                        stringify(confirmacionDatosPersonalesController.personalData.TelMovilNumero) +
                '\nMail: ' + stringify(confirmacionDatosPersonalesController.personalData.Mail) +
                '\nTitulo Secundario: ' + stringify(confirmacionDatosPersonalesController.personalData.TituloSecundario) +
                '\nEgreso: ' + stringify(confirmacionDatosPersonalesController.personalData.AnoFinalSecundario) +
                '\nNombre Secundario: ' + stringify(confirmacionDatosPersonalesController.personalData.NombreSecundario) +
                '\nLocalidad Secundario:' + stringify(confirmacionDatosPersonalesController.personalData.LocalidadSecundario)

                var data = {
                    messageTitle: 'Validación de Datos Personales',
                    message: messageString
                };

                utilityService.showMessage(data);
            }

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
                        var instanciaTramiteToUpdate = confirmacionDatosPersonalesController.data;
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

        confirmacionDatosPersonalesController.next = function () {
            if (confirmacionDatosPersonalesController.validarObligatorios()) {
                //lógica al aceptar los datos y guardarlos
                confirmacionDatosPersonalesController.personalData.legprovi = confirmacionDatosPersonalesController.legajo;
                confirmacionDatosPersonalesController.personalDataOriginal.legprovi = confirmacionDatosPersonalesController.legajo;
                utilityService.callSecureHttp({
                    method: "POST",
                    url: "secure-api/UniAlumno/UpdateDatosPersonalesByLegajoProgramasLegalizados",
                    data: confirmacionDatosPersonalesController.personalData,
                    callbackSuccess: confirmacionDatosPersonalesController.updateDatosPersonalesCallback,
                    callbackError: confirmacionDatosPersonalesController.updateDatosPersonalesCallback
                });
            }
        }

        confirmacionDatosPersonalesController.updateDatosPersonalesCallback = function (response) {
            if(response){
                data.sinCambiosPersonales = JSON.stringify(confirmacionDatosPersonalesController.personalDataOriginal) === JSON.stringify(confirmacionDatosPersonalesController.personalData) ;
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/components/gestionDeTramites/modal/rectificacionDatosEstadoAcademico.html',
                    controller: 'rectificacionDatosEstadoAcademicoController as vm',
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        data: function () {
                            return data;
                        }
                    }
                });

                modalInstance.result.then(
                    function (result) { },
                    function (result) {
                        if (result == 'cancel') {
                            var  instanciaTramiteToUpdate  =  confirmacionDatosPersonalesController.data;
                            instanciaTramiteToUpdate.EstadoEstado  =  6;
                            workflowService.updateInstanciaEstado(instanciaTramiteToUpdate).then(function (updateResponse) {
                                $uibModalInstance.dismiss('cancel');
                                return false;
                            })
                        }
                        if(result == 'finish') {
                            $uibModalInstance.dismiss('cancel');
                            return false;
                        }
                    });
            }
        };

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
                confirmacionDatosPersonalesController.personalData = response.data;
            }
        }; 
        
        confirmacionDatosPersonalesController.changeValues = function () {
            confirmacionDatosPersonalesController.confirmed = false;
        }

        confirmacionDatosPersonalesController.validarObligatorios = function () {
            var datos = confirmacionDatosPersonalesController.personalData;
            if(!datos.TelMovilCodArea || !datos.TelMovilCodPais || !datos.TelMovilNumero || !datos.Mail) {
                var data = {
                    messageType: 2,
                    messageTitle: 'Error',
                    message: 'Debe completar todos los campos obligatorios.'
                };
    
                utilityService.showMessage(data);

                return false;
            }
            return true;
        }
    })