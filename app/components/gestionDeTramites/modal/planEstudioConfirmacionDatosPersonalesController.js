angular.module('app')
    .controller('planEstudioConfirmacionDatosPersonalesController', function ($scope, $routeParams, $rootScope, $location, Auth, $uibModal, utilityService, data, $uibModalInstance, workflowService) {

        var confirmacionDatosPersonalesController = this;

        confirmacionDatosPersonalesController.chkSistemaCalificaciones = false;
        confirmacionDatosPersonalesController.chkCargaHoraria = false;
        confirmacionDatosPersonalesController.legajo = undefined;
        confirmacionDatosPersonalesController.idPantalla = data.Pantalla.IdPantalla;
        data.idPantalla = data.Pantalla.IdPantalla;
        confirmacionDatosPersonalesController.personalData = {};
        confirmacionDatosPersonalesController.modalidadString = '';
        confirmacionDatosPersonalesController.tipoDocumentoString = '';
        confirmacionDatosPersonalesController.data = data;
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
        
        confirmacionDatosPersonalesController.paises = [];
        confirmacionDatosPersonalesController.selectedCountry = null;
        confirmacionDatosPersonalesController.chkForeign = false;
        confirmacionDatosPersonalesController.foreignInstitution = '';

        confirmacionDatosPersonalesController.init = function () {

            Auth.tokenCookieExists();

            confirmacionDatosPersonalesController.getPersonalData();
            confirmacionDatosPersonalesController.getAllPaises();
        };
    
        confirmacionDatosPersonalesController.getAllPaises = function () {
            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/PadPaises/GetAll/",
                callbackSuccess: confirmacionDatosPersonalesController.getAllPaisesCallback
            });
        };
    
        confirmacionDatosPersonalesController.getAllPaisesCallback = function (response) {
            confirmacionDatosPersonalesController.paises = response.data;
        }

        confirmacionDatosPersonalesController.foreignKeyUp = function(value) {
            confirmacionDatosPersonalesController.foreignInstitution = confirmacionDatosPersonalesController.foreignInstitution.replace(/[^a-z\dA-Z ]/, '');
        }

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
            confirmacionDatosPersonalesController.modalidadString = confirmacionDatosPersonalesController.tipoModalidades.find(confirmacionDatosPersonalesController.getModalidad).name;
            confirmacionDatosPersonalesController.tipoDocumentoString = confirmacionDatosPersonalesController.tipoDocumentos.find(confirmacionDatosPersonalesController.getDocumento).name;
        }

        confirmacionDatosPersonalesController.getModalidad = function(modalidad) {
            return modalidad.id == confirmacionDatosPersonalesController.personalData.Modalidad;
        }

        confirmacionDatosPersonalesController.getDocumento = function(documento) {
            return documento.id == confirmacionDatosPersonalesController.personalData.TipoDocumento;
        }

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
                var auxDate = new Date();
                var fechaFin = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                    (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());

                var estadoInstanciaData = confirmacionDatosPersonalesController.data;

                estadoInstanciaData.EstadoEstado = 2;

                var valoresSalida = estadoInstanciaData.ValoresSalida != '' ? JSON.parse(estadoInstanciaData.ValoresSalida) : {};

                valoresSalida.presentaExterior = confirmacionDatosPersonalesController.chkForeign;
                valoresSalida.paisExterior = confirmacionDatosPersonalesController.selectedCountry;
                valoresSalida.institucionExterior = confirmacionDatosPersonalesController.foreignInstitution;

                estadoInstanciaData.ValoresSalida = JSON.stringify(valoresSalida);

                estadoInstanciaData.FechaFin = fechaFin;
                success_updateEstadoInstancia_Request = function (response) {
                    workflowService.getNextEstadoByIdEstadoActualP(confirmacionDatosPersonalesController.data.IdEstadoDefinicion, true, confirmacionDatosPersonalesController.data)
                    .then(function(result) {
                        workflowService.getInstanciaTramiteById(confirmacionDatosPersonalesController.data.IdInstanciaTramite)
                        .then(result => {
                            var data = {
                                messageType: 1,
                                messageTitle: 'Confirmar y Finalizar',
                                message: 'Tu solicitud de Trámite ha sido registrada exitosamente.\nNro. de Trámite '+ result.IdInstanciaTramiteActivo +'\nPodrás realizar el seguimiento desde la aplicación de Gestión de Trámites, telefónicamente al 0800xxxxxxx o vía email a admin@kennedy.edu.ar.',
                            };
                            var modal = utilityService.showMessage(data);
        
                            modal.result.then(
                                function (result) { },
                                function (result) {
                                    $uibModalInstance.dismiss('finish');
                                    return false;
                                });
                        });
                    }, confirmacionDatosPersonalesController.data);
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