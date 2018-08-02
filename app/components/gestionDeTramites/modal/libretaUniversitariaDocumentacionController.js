angular.module('app')
    .controller('libretaUniversitariaDocumentacionController', function ($scope, $rootScope, $location, Auth, $uibModal, utilityService, $routeParams, $uibModalInstance) {

        var documentacionController = this;

        documentacionController.flag = false;
        documentacionController.alumno = {NombreCompleto:''};
        documentacionController.numeroDocumento = null;
        documentacionController.selectedTipoDocumento = 0;
        documentacionController.selectedCarrera = 0;
        documentacionController.selectedColegio;
        documentacionController.tipoDocumentoList =
            [{ id: 0, name: 'Legajo provisorio' },
            { id: 1, name: 'DNI' },
            { id: 5, name: 'Pasaporte' }];
            documentacionController.carreras =
            [{ id: 0, name: 'Odontología' }];
        documentacionController.colegiosList =
            [{ id: 0, name: 'Colegio Central' },
            { id: 1, name: 'Colegio Lanús' }];

        documentacionController.init = function () {
            documentacionController.getEdificioLibretaUniversitariaList();
            Auth.tokenCookieExists();
        };

        documentacionController.getEdificioLibretaUniversitariaList = function () {
            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/UniEdificio/GetEdificioLibretaUniversitaria",
                callbackSuccess: documentacionController.getEdificioLibretaUniversitariaListCallback
            });
        };

        documentacionController.getEdificioLibretaUniversitariaListCallback = function (response) {
            if (response) {
                documentacionController.colegiosList = response.data;
            }
        };

        documentacionController.search = function() {
            var stringUrl = "secure-api/UniAlumno/GetDatosPersonalesByLibretaUniversitaria/" + documentacionController.numeroDocumento + "&" + documentacionController.selectedTipoDocumento.toString();
            utilityService.callSecureHttp({
                method: "GET",
                url: stringUrl,
                callbackSuccess: documentacionController.searchCallback
            });
        }

        documentacionController.searchCallback = function(response) {
            if(response.data) {
                documentacionController.alumno = response.data;
                documentacionController.selectedCarrera = response.data.Carreras[0].CarreraCod;
                documentacionController.alumno.NombreCompleto = response.data.Nombre + ' ' + response.data.Apellido;
                documentacionController.changeCarrera();
            }
            else {
                var data = {
                    messageTitle:'Error',
                    message: 'No se encontraron los datos.',
                    messageType: 2
                };
        
                utilityService.showMessage(data);
            }
        }

        documentacionController.cancel = function () {
            var data = {
                messageTitle:'¿Desea salir?',
                message: '¿Estás seguro que deseas salir?',
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
                    }
                });
        }

        documentacionController.changeCarrera = function () {
            var findCarrera = function (info) {
                return info.CarreraCod == documentacionController.selectedCarrera;
            }
            
            var infoCarrera = documentacionController.alumno.Carreras.find(findCarrera);

            if (infoCarrera.FotocopiaDniEstado > 0)
                documentacionController.chkPresDNI = true;
                documentacionController.chkVeriDNI = false;
            if (infoCarrera.FotocopiaDniEstado > 1)
                documentacionController.chkVeriDNI = true;
            if (!infoCarrera.FotocopiaDniEstado) {
                documentacionController.chkPresDNI = false;
                documentacionController.chkVeriDNI = false;
            }

            if (infoCarrera.FotosCarnetEstado > 0)
                documentacionController.chkPresFotos = true;
                documentacionController.chkVeriFotos = false;
            if (infoCarrera.FotosCarnetEstado > 1)
                documentacionController.chkVeriFotos = true;
            if (!infoCarrera.FotosCarnetEstado) {
                documentacionController.chkPresFotos = false;
                documentacionController.chkVeriFotos = false;
            }

            if (infoCarrera.TituloSecundarioEstado > 0)
                documentacionController.chkPresTitulo = true;
                documentacionController.chkVeriTitulo = false;
            if (infoCarrera.TituloSecundarioEstado > 1)
                documentacionController.chkVeriTitulo = true;
            if (!infoCarrera.TituloSecundarioEstado) {
                documentacionController.chkPresTitulo = false;
                documentacionController.chkVeriTitulo = false;
            }
            
            documentacionController.selectedColegio = infoCarrera.RetiroCodins;
        }

        documentacionController.saveChanges = function () {
            var findCarrera = function (info) {
                return info.CarreraCod == documentacionController.selectedCarrera;
            }
            
            var infoCarrera = documentacionController.alumno.Carreras.find(findCarrera);

            var data = {
                LegProvi : infoCarrera.LegProvi,
                FotocopiaDniEstado : documentacionController.chkPresDNI + documentacionController.chkVeriDNI,
                FotosCarnetEstado : documentacionController.chkPresFotos + documentacionController.chkVeriFotos,
                TituloSecundarioEstado : documentacionController.chkPresTitulo + documentacionController.chkVeriTitulo,
                RetiroCodins : documentacionController.selectedColegio
            }

            utilityService.callSecureHttp({
                method: "POST",
                url: "secure-api/UniAlumno/SaveDatosPersonalesByLibretaUniversitaria",
                data: data,
                callbackSuccess: documentacionController.saveDatosPersonalesCallback,
                callbackError: documentacionController.saveDatosPersonalesCallback
            });
        }

        documentacionController.saveDatosPersonalesCallback = function (response) {
            if (response) {
                var data = {
                    messageTitle:'Finalizado',
                    message: 'Los datos fueron guardados exitósamente.',
                    messageType: 1
                };
        
                utilityService.showMessage(data);
            } else {
                var data = {
                    messageTitle:'Error',
                    message: 'Los datos no pudieron ser guardados.',
                    messageType: 2
                };
        
                utilityService.showMessage(data);
            }
        }

        documentacionController.chkClickedDNI = function (chkPresDNI, chkVeriDNI, which) {
            //which true = chkPresDNI
            if (!chkPresDNI && which)
                documentacionController.chkVeriDNI = chkPresDNI;
            //which false = chkVeriDNI
            if (chkVeriDNI && !which) {
                documentacionController.chkPresDNI = chkVeriDNI;
            }
        }

        documentacionController.chkClickedFotos = function (chkPresFotos, chkVeriFotos, which) {
            //which true = chkPresFotos
            if (!chkPresFotos && which)
                documentacionController.chkVeriFotos = chkPresFotos;
            //which false = chkVeriFotos
            if (chkVeriFotos && !which) {
                documentacionController.chkPresFotos = chkVeriFotos;
            }
        }

        documentacionController.chkClickedTitulo = function (chkPresTitulo, chkVeriTitulo, which) {
            //which true = chkPresTitulo
            if (!chkPresTitulo && which)
                documentacionController.chkVeriTitulo = chkPresTitulo;
            //which false = chkVeriTitulo
            if (chkVeriTitulo && !which) {
                documentacionController.chkPresTitulo = chkVeriTitulo;
            }
        }
    })