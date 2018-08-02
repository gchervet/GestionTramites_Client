angular.module('app')
    .controller('previewTramiteController', function ($scope, $routeParams, $rootScope, $location, Auth, $uibModal, utilityService, data, $uibModalInstance, workflowService) {

        var previewTramiteController = this;

        previewTramiteController.legajo = data.IdentificadorInteresado;

        previewTramiteController.data = data;

        previewTramiteController.personalData = {};

        previewTramiteController.modalidadString = '';

        previewTramiteController.tipoDocumentoString = '';

        previewTramiteController.title = data.NombreTramite;

        previewTramiteController.IdTramite = data.IdTramite;

        previewTramiteController.nroTramite = data.IdInstanciaTramiteActivo;

        previewTramiteController.nroTarea = data.NroTarea;

        previewTramiteController.lugarRetiro = false;

        previewTramiteController.esExpress = 'NO';

        previewTramiteController.tipoDocumentos =
            [{ id: 1, name: 'DNI' },
            { id: 5, name: 'Pasaporte' },
            { id: 6, name: 'LC' }];

        previewTramiteController.tipoModalidades =
            [{ id: 0, name: 'Presencial' },
            { id: 1, name: 'Virtual' }];
        
        var valoresEntrada = JSON.parse(data.ValoresEntrada);

        if (typeof valoresEntrada.express !== 'undefined'){
            if (valoresEntrada.express){
                previewTramiteController.esExpress = 'SI'
            }
        }

        previewTramiteController.init = function () {

            Auth.tokenCookieExists();

            previewTramiteController.getPersonalData();
        };

        previewTramiteController.getPersonalData = function() {
            utilityService.callSecureHttp({
                method: "GET", 
                url: "secure-api/UniAlumno/GetDatosPersonalesByLegajoProgramasLegalizados/" + previewTramiteController.legajo,
                callbackSuccess: previewTramiteController.getPersonalDataCallback
            });
        }

        previewTramiteController.getPersonalDataCallback = function(response){
            previewTramiteController.personalData = response.data;
            previewTramiteController.modalidadString = previewTramiteController.tipoModalidades.find(previewTramiteController.getModalidad).name;
            previewTramiteController.tipoDocumentoString = previewTramiteController.tipoDocumentos.find(previewTramiteController.getDocumento).name;

            if(previewTramiteController.IdTramite == 6)//si es constancia de alumno regular carga los lugares de retiro para mostrar
                previewTramiteController.getEdificioConstanciaList();
        }

        previewTramiteController.getEdificioConstanciaList = function () {
            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/UniEdificio/GetEdificioConstancia",
                callbackSuccess: previewTramiteController.getEdificioConstanciaListCallback
            });
        };

        previewTramiteController.getEdificioConstanciaListCallback = function (response) {
            if (response) {
                previewTramiteController.edificioConstanciaList = response.data;
                workflowService.getEstadoInstanciaById(previewTramiteController.nroTarea).then(function (response) {
                    if (response) {
                        var valoresEntrada = JSON.parse(response.ValoresEntrada)
                        if (typeof valoresEntrada.edificioCodIns !== 'undefined'){
                            var nombreLugarRetiro = previewTramiteController.edificioConstanciaList.find(previewTramiteController.getLugarRetiro,valoresEntrada.edificioCodIns).NomIns;
                            if (nombreLugarRetiro != undefined){
                                $scope.$apply(function () {
                                    previewTramiteController.lugarRetiro = nombreLugarRetiro;
                                })
                            }
                            else
                                previewTramiteController.lugarRetiro = '';
                        }
                        else
                            previewTramiteController.lugarRetiro = '';
                    }
                });
            }
        };

        previewTramiteController.getModalidad = function(modalidad) {
            return modalidad.id == previewTramiteController.personalData.Modalidad;
        }

        previewTramiteController.getDocumento = function(documento) {
            return documento.id == previewTramiteController.personalData.TipoDocumento;
        }

        previewTramiteController.getLugarRetiro = function(lugar) {
            return lugar.CodIns == this;
        }

        previewTramiteController.cancel = function () {
            $uibModalInstance.dismiss('cancel');
            return false;
        }
                        
    })