angular.module('app')
    .controller('bandejaDeTramitesController', function ($scope, $rootScope, $location, Auth, $uibModal, utilityService, $cookies, workflowService, notificationService) {

        var bandejaDeTramitesController = this;
        var gridType='No Iniciadas';

        // Setting socket
        var socket = io($rootScope.WEB_SOCKET_URL);

        // Setting selected items
        bandejaDeTramitesController.selectedTramite = null;
        bandejaDeTramitesController.legajo = '';
        bandejaDeTramitesController.selectedPrioridad = null;
        bandejaDeTramitesController.selectedEdificio = null;

        // BORRAR
        bandejaDeTramitesController.openPagarOnline = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/components/gestionDeTramites/printTemplates/estadoAcademico.html',
                controller: 'estadoAcademicoController as vm',
                windowClass: 'app-modal-window',
                resolve: {
                    data: {}
                }
            });
            modalInstance.result.then(
                function (result) { resolve(result); },
                function (result) { resolve(result); }
            );
        }

        bandejaDeTramitesController.tramiteAGenerar = {};

        // Setting various
        bandejaDeTramitesController.usuarioAsignadoUsername = $rootScope.user.username.split('@')[0] || $rootScope.user.username;
        bandejaDeTramitesController.grupoAsignadoListString = '';
        bandejaDeTramitesController.usuarioAsignadoIdUsuario = 0;

        // Setting list values
        bandejaDeTramitesController.tramiteListData = [];
        bandejaDeTramitesController.tramiteListIniciadasData = [];
        bandejaDeTramitesController.tramiteInstanciaList = [];
        bandejaDeTramitesController.prioridadList = [];
        bandejaDeTramitesController.edificioConstanciaList = [];
        bandejaDeTramitesController.edificioList = [];

        // Setting text items    
        bandejaDeTramitesController.legajoSearchText = null;

        bandejaDeTramitesController.init = function () {

            Auth.tokenCookieExists();
            bandejaDeTramitesController.loadUserData();
            bandejaDeTramitesController.loadLists();

        };

        bandejaDeTramitesController.loadUserData = function () {
            bandejaDeTramitesController.getTipoUsuarioByUsername();
            bandejaDeTramitesController.getGruposAsignadosByUsername();
        }

        bandejaDeTramitesController.getTipoUsuarioByUsername = function () {

            if (!$rootScope.user.tipoUsuario) {
                workflowService.getTipoUsuarioByUsername($rootScope.user.username).then(function (response) {
                    if (response) {
                        if (response[0]) {
                            $rootScope.user.tipoUsuario = response[0].IdTipoUsuario;
                        }
                    }
                })
            }
        }

        bandejaDeTramitesController.getGruposAsignadosByUsername = function () {

            var process_getGruposAsignadosByUsername_request = function () {
                utilityService.callSecureHttp({
                    method: "GET",
                    url: "secure-api/TraGrupoUsuarios/GetGruposByUsername/" + bandejaDeTramitesController.usuarioAsignadoUsername,
                    callbackSuccess: success_getGruposAsignadosByUsername_Request,
                    callbackError: success_getGruposAsignadosByUsername_Request
                });
            };

            var success_getGruposAsignadosByUsername_Request = function (response) {
                if (response.data) {

                    for (i in response.data) {
                        var actualGrupo = response.data[i];

                        bandejaDeTramitesController.grupoAsignadoListString = bandejaDeTramitesController.grupoAsignadoListString + actualGrupo.IdGrupo;

                        if (i != (response.data.length - 1)) {
                            bandejaDeTramitesController.grupoAsignadoListString = bandejaDeTramitesController.grupoAsignadoListString + ',';
                        }

                        bandejaDeTramitesController.usuarioAsignadoIdUsuario = actualGrupo.IdUsuario;
                    }
                }
            };

            process_getGruposAsignadosByUsername_request();
        }

        bandejaDeTramitesController.loadLists = function () {
            bandejaDeTramitesController.loadTareaList();
            bandejaDeTramitesController.getTramiteTypeList();
            bandejaDeTramitesController.getPrioridadList();
            bandejaDeTramitesController.getEdificioConstanciaList();
            bandejaDeTramitesController.getEdificioList();
        }

        bandejaDeTramitesController.getEdificioConstanciaList = function () {
            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/UniEdificio/GetEdificioConstancia",
                callbackSuccess: bandejaDeTramitesController.getEdificioConstanciaListCallback
            });
        };

        bandejaDeTramitesController.getEdificioConstanciaListCallback = function (response) {
            if (response) {
                bandejaDeTramitesController.edificioConstanciaList = response.data;
            }
        };

        bandejaDeTramitesController.getEdificioList = function () {
            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/UniEdificio/GetEdificioLibretaUniversitaria",
                callbackSuccess: bandejaDeTramitesController.getEdificioListCallback
            });
        };

        bandejaDeTramitesController.getEdificioListCallback = function (response) {
            if (response) {
                bandejaDeTramitesController.edificioList = response.data;
            }
        };

        bandejaDeTramitesController.loadTareaList = function () {

            var process_getTareaIniciadasListByUsername_request = function () {
                utilityService.callSecureHttp({
                    method: "GET",
                    url: "secure-api/TraEstadoInstancia/GetEstadoInstanciaListByUsername/" + bandejaDeTramitesController.usuarioAsignadoUsername + "/1",
                    callbackSuccess: success_getTareaIniciadasListByUsername_Request,
                    callbackError: success_getTareaIniciadasListByUsername_Request
                });
            };

            var process_getTareaListByUsername_request = function () {
                utilityService.callSecureHttp({
                    method: "GET",
                    url: "secure-api/TraEstadoInstancia/GetEstadoInstanciaListByUsername/" + bandejaDeTramitesController.usuarioAsignadoUsername + "/0",
                    callbackSuccess: success_getTareaListByUsername_Request,
                    callbackError: success_getTareaListByUsername_Request
                });
            };

            var success_getTareaIniciadasListByUsername_Request = function (response) {
                bandejaDeTramitesController.tramiteListIniciadasData = [];
                var iterGrid = 0;
                if (response.data) {

                    if (Array.isArray(response.data))
                        for (i in response.data) {
                            var actualTareaInstancia = response.data[i];
                            var addToList = true;

                            // Ocultar los terminados
                            if (actualTareaInstancia.Estado && actualTareaInstancia.Estado == "Terminado") {
                                addToList = false;
                            }
                            else if (actualTareaInstancia.TipoEstadoNombre) {
                                if (actualTareaInstancia.TipoEstadoNombre == 'Pantalla') {

                                    if (actualTareaInstancia.Estado == "No Iniciado") {
                                        // Botón tomar
                                        actualTareaInstancia.Accion = '<button type="button" style="width: 100%" class="btn btn-primary" onclick="assignInstanciaEstado(' + actualTareaInstancia.NroTarea + ')">Tomar</button>';
                                    } else {
                                        if (((actualTareaInstancia.esJefe = 1) && (actualTareaInstancia.Estado == "En Proceso")) || ((actualTareaInstancia.Estado == "En Proceso") && (actualTareaInstancia.UsuarioAsignadoUsername == $rootScope.user.username))) {

                                            actualTareaInstancia.Accion = '<div class="row" style="min-width: 165px;"><button type="button" class="btn btn-primary col-sm-7" style="margin-left: 16px;" onclick="assignInstanciaEstado(' + actualTareaInstancia.NroTarea + ',' + actualTareaInstancia.esJefe + ')">Reanudar</button>' +
                                                '<div class="col-sm-2" style="padding: 0; padding-left: 5px;" data-original-title="" onclick="reassignEstadoInstancia(' + actualTareaInstancia.NroTarea + ')"><i class="fa fa-user-circle-o bootstrap-data-reassign-button" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-html="true" title="Reasignar"></i></div></div>';
                                        } else {
                                            if (((actualTareaInstancia.esJefe = 1) && (actualTareaInstancia.Estado == "Suspendido")) || ((actualTareaInstancia.Estado == "Suspendido") && (actualTareaInstancia.UsuarioAsignadoUsername == $rootScope.user.username))) {
                                                // Botón reaundar
                                                actualTareaInstancia.Accion = '<button type="button" style="min-width: 165px" class="btn btn-primary" onclick="assignInstanciaEstado(' + actualTareaInstancia.NroTarea + ')">Reanudar</button>' +
                                                    '<div class="col-sm-2" style="padding: 0; padding-left: 5px;" data-original-title="" onclick="reassignEstadoInstancia(' + actualTareaInstancia.NroTarea + ')"><i class="fa fa-user-circle-o bootstrap-data-reassign-button" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-html="true" title="Reasignar"></i></div></div>';
                                            }
                                        }
                                    }
                                }
                                if (actualTareaInstancia.TipoEstadoNombre == 'Manual') {

                                    if (actualTareaInstancia.Estado == "No Iniciado") {
                                        // Botón tomar
                                        actualTareaInstancia.Accion = '<button type="button" style="width: 100%" class="btn btn-primary" onclick="assignInstanciaEstado(' + actualTareaInstancia.NroTarea + ')">Tomar</button>';
                                    } else {
                                        if (((actualTareaInstancia.esJefe = 1) && (actualTareaInstancia.Estado == "En Proceso")) || ((actualTareaInstancia.Estado == "En Proceso") && (actualTareaInstancia.UsuarioAsignadoUsername == $rootScope.user.username))) {
                                            // Botón terminar              
                                            actualTareaInstancia.Accion = '<div class="row" style="min-width: 175px;"><button type="button" class="btn btn-primary col-sm-7" style="margin-left: 16px;" onclick="finishInstanciaEstado(' + actualTareaInstancia.NroTarea + ')">Terminar Tarea</button>' +
                                                '<div class="col-sm-2" style="padding: 0; padding-left: 5px;" data-original-title="" onclick="reassignEstadoInstancia(' + actualTareaInstancia.NroTarea + ')"><i class="fa fa-user-circle-o bootstrap-data-reassign-button" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-html="true" title="Reasignar"></i></div></div>';
                                        }
                                    }
                                }
                                if (actualTareaInstancia.TipoEstadoNombre == 'Externa') {

                                    if (actualTareaInstancia.Estado == "No Iniciado") {
                                        // Sin botón
                                        //actualTareaInstancia.Accion = '<button type="button" style="width: 100%" class="btn btn-warning" onclick="showTramiteEnEsperaModal()">En espera</button>';
                                    }
                                }
                            }

                            // Agregar el campo de información
                            actualTareaInstancia.Informacion = '<button type="button" style="width: 100%" class="btn btn-primary" onclick="showInfoTramite(' + actualTareaInstancia.NroTramite + ',' + '\'Iniciadas\')">Ver</button>';

                            // Agregar el campo de observación
                            var observacionText = actualTareaInstancia.Observaciones || '';
                            actualTareaInstancia.Observaciones =
                                '<div class="row" id="div_observacion_' + actualTareaInstancia.NroTramite + '">' +
                                '<div class="col-sm-9">' +
                                '<input class=" form-control" id="comboLegajo_' + actualTareaInstancia.NroTramite + '" onkeypress="submitObservacion(' + actualTareaInstancia.NroTramite + ',' + actualTareaInstancia.NroTarea + ',' + actualTareaInstancia.IdInstanciaTramiteActivo + ',' + '\'Iniciadas\')"/>' +
                                '</div>' +
                                '<div class="col-sm-3"><i class="fa fa-comments-o bootstrap-data-comment-button"' + (observacionText ? 'style="background-color:#337ab7;" onclick="showTramiteObservaciones(' + actualTareaInstancia.NroTramite + ',' + actualTareaInstancia.NroTarea + ',' + actualTareaInstancia.IdInstanciaTramiteActivo +')" ' : '') + ' aria-hidden="true"></i></div>' +
                                '</div>' +
                                '</div>';

                            // Agregarlo a la lista de la grilla

                            if (addToList) {

                                bandejaDeTramitesController.tramiteListIniciadasData.push({
                                    NroTramite: actualTareaInstancia.NroTramite,
                                    NombreTramite: actualTareaInstancia.DescripcionTramite,
                                    IdInstanciaTramiteActivo: actualTareaInstancia.IdInstanciaTramiteActivo,
                                    DescripcionTramite: actualTareaInstancia.DescripcionTramite,
                                    NombreTarea: actualTareaInstancia.NombreTarea,
                                    IdentificadorInteresado: actualTareaInstancia.IdentificadorInteresado,
                                    Prioridad: actualTareaInstancia.PrioridadInstanciaTramite,
                                    Estado: actualTareaInstancia.Estado,
                                    FechaCreacion: utilityService.formatDate(actualTareaInstancia.FechaEntradaBandeja, null),
                                    FechaLimite: utilityService.formatDate(actualTareaInstancia.FechaLimite, null),
                                    Asignado: actualTareaInstancia.UsuarioAsignadoUsername,
                                    Accion: actualTareaInstancia.Accion,
                                    Informacion: actualTareaInstancia.Informacion,
                                    Observaciones: actualTareaInstancia.Observaciones,
                                    IdTramite: actualTareaInstancia.IdTramite,
                                    NroTarea: actualTareaInstancia.NroTarea,
                                    ValoresEntrada: actualTareaInstancia.ValoresEntrada,
                                    ValoresSalida: actualTareaInstancia.ValoresSalida
                                });
                            }


                        }

                    $('#bandejaDeTramite_ResultTable_Iniciados').bootstrapTable();
                    $('#bandejaDeTramite_ResultTable_Iniciados').bootstrapTable('load', {
                        data: bandejaDeTramitesController.tramiteListIniciadasData
                    });

                    $('[data-toggle="tooltip"]').tooltip();

                    var iterGrid = 0;
                    for (j in bandejaDeTramitesController.tramiteListIniciadasData) {
                        var actualTareaInstanciaPrioridad = bandejaDeTramitesController.tramiteListIniciadasData[j];
                        // Establecer combo de prioridad
                        if (actualTareaInstanciaPrioridad.Prioridad) {
                            $("#selectPrioridad" + iterGrid).val(actualTareaInstanciaPrioridad.Prioridad);
                            iterGrid++;
                        }
                        else {
                            actualTareaInstancia.Prioridad =
                                '<select class="input-large form-control" ng-options="tramite.Descripcion for tramite in vm.tramiteList" ng-model="vm.tramiteSelected"> ' +
                                '<option></option> ' +
                                '</select>';
                        }
                    }
                }
            };

            var success_getTareaListByUsername_Request = function (response) {
                bandejaDeTramitesController.tramiteListData = [];
                var iterGrid = 0;
                if (response.data) {

                    if (Array.isArray(response.data))
                        for (i in response.data) {
                            var actualTareaInstancia = response.data[i];
                            var addToList = true;

                            // Ocultar los terminados
                            if (actualTareaInstancia.Estado && actualTareaInstancia.Estado == "Terminado") {
                                addToList = false;
                            }
                            else if (actualTareaInstancia.TipoEstadoNombre) {
                                if (actualTareaInstancia.TipoEstadoNombre == 'Pantalla') {

                                    if (actualTareaInstancia.Estado == "No Iniciado") {
                                        // Botón tomar
                                        actualTareaInstancia.Accion = '<button type="button" style="width: 100%" class="btn btn-primary" onclick="assignInstanciaEstado(' + actualTareaInstancia.NroTarea + ')">Tomar</button>';
                                    } else {
                                        if (((actualTareaInstancia.esJefe = 1) && (actualTareaInstancia.Estado == "En Proceso")) || ((actualTareaInstancia.Estado == "En Proceso") && (actualTareaInstancia.UsuarioAsignadoUsername == $rootScope.user.username))) {

                                            actualTareaInstancia.Accion = '<div class="row" style="min-width: 165px;"><button type="button" class="btn btn-primary col-sm-7" style="margin-left: 16px;" onclick="assignInstanciaEstado(' + actualTareaInstancia.NroTarea + ',' + actualTareaInstancia.esJefe + ')">Reanudar</button>' +
                                                '<div class="col-sm-2" style="padding: 0; padding-left: 5px;" data-original-title="" onclick="reassignEstadoInstancia(' + actualTareaInstancia.NroTarea + ')"><i class="fa fa-user-circle-o bootstrap-data-reassign-button" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-html="true" title="Reasignar"></i></div></div>';
                                        } else {
                                            if (((actualTareaInstancia.esJefe = 1) && (actualTareaInstancia.Estado == "Suspendido")) || ((actualTareaInstancia.Estado == "Suspendido") && (actualTareaInstancia.UsuarioAsignadoUsername == $rootScope.user.username))) {
                                                // Botón reaundar
                                                actualTareaInstancia.Accion = '<button type="button" style="min-width: 165px" class="btn btn-primary" onclick="assignInstanciaEstado(' + actualTareaInstancia.NroTarea + ')">Reanudar</button>' +
                                                    '<div class="col-sm-2" style="padding: 0; padding-left: 5px;" data-original-title="" onclick="reassignEstadoInstancia(' + actualTareaInstancia.NroTarea + ')"><i class="fa fa-user-circle-o bootstrap-data-reassign-button" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-html="true" title="Reasignar"></i></div></div>';
                                            }
                                        }
                                    }
                                }
                                if (actualTareaInstancia.TipoEstadoNombre == 'Manual') {

                                    if (actualTareaInstancia.Estado == "No Iniciado") {
                                        // Botón tomar
                                        actualTareaInstancia.Accion = '<button type="button" style="width: 100%" class="btn btn-primary" onclick="assignInstanciaEstado(' + actualTareaInstancia.NroTarea + ')">Tomar</button>';
                                    } else {
                                        if (((actualTareaInstancia.esJefe = 1) && (actualTareaInstancia.Estado == "En Proceso")) || ((actualTareaInstancia.Estado == "En Proceso") && (actualTareaInstancia.UsuarioAsignadoUsername == $rootScope.user.username))) {
                                            // Botón terminar              
                                            actualTareaInstancia.Accion = '<div class="row" style="min-width: 175px;"><button type="button" class="btn btn-primary col-sm-7" style="margin-left: 16px;" onclick="finishInstanciaEstado(' + actualTareaInstancia.NroTarea + ')">Terminar Tarea</button>' +
                                                '<div class="col-sm-2" style="padding: 0; padding-left: 5px;" data-original-title="" onclick="reassignEstadoInstancia(' + actualTareaInstancia.NroTarea + ')"><i class="fa fa-user-circle-o bootstrap-data-reassign-button" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-html="true" title="Reasignar"></i></div></div>';
                                        }
                                    }
                                }
                                if (actualTareaInstancia.TipoEstadoNombre == 'Externa') {

                                    if (actualTareaInstancia.Estado == "No Iniciado") {
                                        // Sin botón
                                        //actualTareaInstancia.Accion = '<button type="button" style="width: 100%" class="btn btn-warning" onclick="showTramiteEnEsperaModal()">En espera</button>';
                                    }
                                }
                            }

                            // Agregar el campo de información
                            actualTareaInstancia.Informacion = '<button type="button" style="width: 100%" class="btn btn-primary" onclick="showInfoTramite(' + actualTareaInstancia.NroTramite + ',' + '\'No Iniciadas\')">Ver</button>';

                            // Agregar el campo de observación
                            var observacionText = actualTareaInstancia.Observaciones || '';
                            actualTareaInstancia.Observaciones =
                                '<div class="row" id="div_observacion_' + actualTareaInstancia.NroTramite + '">' +
                                '<div class="col-sm-9">' +
                                '<input class=" form-control" id="comboLegajo_' + actualTareaInstancia.NroTramite + '" onkeypress="submitObservacion(' + actualTareaInstancia.NroTramite + ',' + actualTareaInstancia.NroTarea + ',' + actualTareaInstancia.IdInstanciaTramiteActivo + ')"/>' +
                                '</div>' +
                                '<div class="col-sm-3"><i class="fa fa-comments-o bootstrap-data-comment-button"' + (observacionText ? 'style="background-color:#337ab7;" onclick="showTramiteObservaciones(' + actualTareaInstancia.NroTramite + ',' + actualTareaInstancia.NroTarea + ',' + actualTareaInstancia.IdInstanciaTramiteActivo +')" ' : '') + ' aria-hidden="true"></i></div>' +
                                '</div>' +
                                '</div>';

                            // Agregarlo a la lista de la grilla

                            if (addToList) {

                                bandejaDeTramitesController.tramiteListData.push({
                                    NroTramite: actualTareaInstancia.NroTramite,
                                    NombreTramite: actualTareaInstancia.DescripcionTramite,
                                    IdInstanciaTramiteActivo: actualTareaInstancia.IdInstanciaTramiteActivo,
                                    DescripcionTramite: actualTareaInstancia.DescripcionTramite,
                                    NombreTarea: actualTareaInstancia.NombreTarea,
                                    IdentificadorInteresado: actualTareaInstancia.IdentificadorInteresado,
                                    Prioridad: actualTareaInstancia.PrioridadInstanciaTramite,
                                    Estado: actualTareaInstancia.Estado,
                                    FechaCreacion: utilityService.formatDate(actualTareaInstancia.FechaEntradaBandeja, null),
                                    FechaLimite: utilityService.formatDate(actualTareaInstancia.FechaLimite, null),
                                    Asignado: actualTareaInstancia.UsuarioAsignadoUsername,
                                    Accion: actualTareaInstancia.Accion,
                                    Informacion: actualTareaInstancia.Informacion,
                                    Observaciones: actualTareaInstancia.Observaciones,
                                    IdTramite: actualTareaInstancia.IdTramite,
                                    NroTarea: actualTareaInstancia.NroTarea,
                                    ValoresEntrada: actualTareaInstancia.ValoresEntrada,
                                    ValoresSalida: actualTareaInstancia.ValoresSalida
                                });
                            }


                        }

                    $('#bandejaDeTramite_ResultTable').bootstrapTable();
                    $('#bandejaDeTramite_ResultTable').bootstrapTable('load', {
                        data: bandejaDeTramitesController.tramiteListData
                    });

                    $('[data-toggle="tooltip"]').tooltip();

                    var iterGrid = 0;
                    for (j in bandejaDeTramitesController.tramiteListData) {
                        var actualTareaInstanciaPrioridad = bandejaDeTramitesController.tramiteListData[j];
                        // Establecer combo de prioridad
                        if (actualTareaInstanciaPrioridad.Prioridad) {
                            $("#selectPrioridad" + iterGrid).val(actualTareaInstanciaPrioridad.Prioridad);
                            iterGrid++;
                        }
                        else {
                            actualTareaInstancia.Prioridad =
                                '<select class="input-large form-control" ng-options="tramite.Descripcion for tramite in vm.tramiteList" ng-model="vm.tramiteSelected"> ' +
                                '<option></option> ' +
                                '</select>';
                        }
                    }
                }


            };
            process_getTareaIniciadasListByUsername_request();
            process_getTareaListByUsername_request();
        }

        bandejaDeTramitesController.getInfoTramite = function (tramite) {
            return tramite.NroTramite == this;
        }

        showInfoTramite = function (nroTramite,gridTypeParam) {
            gridType= gridTypeParam
            if (gridType=='Iniciadas'){
                var tramiteData = bandejaDeTramitesController.tramiteListIniciadasData.find(bandejaDeTramitesController.getInfoTramite, nroTramite);    
            }else{
                var tramiteData = bandejaDeTramitesController.tramiteListData.find(bandejaDeTramitesController.getInfoTramite, nroTramite);
            }
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'app/components/gestionDeTramites/modal/previewTramite.html',
                controller: 'previewTramiteController as vm',
                size: 'lg',
                backdrop: false,
                resolve: {
                    data: function () {
                        return tramiteData;
                    }
                }
            });
        }

        showTramiteObservaciones = function (nroTramite, nroTarea, idInstanciaTramiteActivo) {

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'app/components/gestionDeTramites/modal/estadoInstanciaObservaciones.html',
                controller: 'estadoInstanciaObservacionesController as vm',
                backdrop: 'static',
                resolve: {
                    data: { NroTramite: nroTramite, NroTarea: nroTarea, IdInstanciaTramiteActivo: idInstanciaTramiteActivo, UsuarioAsignadoIdUsuario: bandejaDeTramitesController.usuarioAsignadoIdUsuario}
                }
            });
        };

        assignInstanciaEstado = function (idInstanciaTramite, isJefe, idInstanciaEstado) {
            workflowService.getEstadoInstanciaById(idInstanciaTramite).then(function (response) {
                if (response) {
                    var actualInstanciaTramite = response;

                    if ((isJefe != 1) && (actualInstanciaTramite.IdAsignadoUsuario && actualInstanciaTramite.IdAsignadoUsuario != $rootScope.user.IdUsuario)) {
                        // Mostrar error, un usuario ya tiene tomado el caso
                        utilityService.showMessage({
                            messageType: 1,
                            messageTitle: "Mensaje",
                            message: "Este caso se encuentra tomado por otro usuario."
                        });
                    }
                    else {
                        var instanciaTramiteToUpdate = actualInstanciaTramite;

                        instanciaTramiteToUpdate.EstadoEstado = 1;
                        //Date(year, month, day, hours, minutes, seconds
                        var auxDate = new Date();
                        instanciaTramiteToUpdate.Comienzo = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                            (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());
                        instanciaTramiteToUpdate.IdAsignadoUsuario = bandejaDeTramitesController.usuarioAsignadoIdUsuario;

                        workflowService.updateInstanciaEstado(instanciaTramiteToUpdate).then(function (updateResponse) {

                            bandejaDeTramitesController.loadTareaList();
                            // Se abre el modal correspondiente si tiene pantalla asignada
                            if (instanciaTramiteToUpdate.Pantalla.NombrePantalla) {
                                workflowService.openTramiteModal(instanciaTramiteToUpdate).then(function (modalResponse) {
                                    // Cuando el modal se cierre, se recarga la pantalla
                                    bandejaDeTramitesController.loadTareaList();
                                })
                            } else {
                                bandejaDeTramitesController.loadTareaList();
                            }
                        })

                    }
                }
            });
        }

        reassignEstadoInstancia = function (nroTarea) {
            if (Auth.tokenCookieExists) {
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/components/gestionDeTramites/modal/reasignarTarea.html',
                    controller: 'reasignarTareaController as vm',
                    backdrop: 'static',
                    id: 'assign_modal',
                    keyboard: false,
                    resolve: {
                        data: {
                            nroTarea: nroTarea
                        }
                    }
                });

                $("#assign_modal").on("hidden", function () {
                    bandejaDeTramitesController.loadTareaList()
                });

                modalInstance.result.then(function () { });
            }
            else {
                utilityService.showMessage({
                    messageType: 1,
                    messageTitle: "Sesión caducada",
                    message: "Se ha finalizado la sesión. Vuelva a ingresar al sistema."
                })
            }
        }

        resumeInstanciaEstado = function (idInstanciaEstado) {
            workflowService.getEstadoInstanciaById(idInstanciaEstado).then(function (response) {
                if (response) {
                }
            });
        }

        finishInstanciaEstado = function (idInstanciaEstado) {
            workflowService.getEstadoInstanciaById(idInstanciaEstado).then(function (response) {
                if (response) {
                    var auxDate = new Date();
                    var fechaFin = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                        (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());

                    var estadoInstanciaData = response;

                    estadoInstanciaData.EstadoEstado = 2;
                    estadoInstanciaData.FechaFin = fechaFin;

                    success_updateEstadoInstancia_Request = function (response) {
                        var data = response.data[0];
                        workflowService.getNextEstadoByIdEstadoActual(data.IdEstadoDefinicion, true, data)
                        bandejaDeTramitesController.loadTareaList();
                    }

                    utilityService.callSecureHttp({
                        method: "POST",
                        url: "secure-api/TraEstadoInstancia/Update",
                        data: estadoInstanciaData,
                        callbackSuccess: success_updateEstadoInstancia_Request,
                        callbackError: success_updateEstadoInstancia_Request
                    });
                }
            });
        }

        socket.on('TraEstadoInstanciaObservaciones.Notify', function (message) {
            if (message.IdUsuarioAsignado){
                debugger;
                if(message.IdUsuarioAsignado == $rootScope.user.IdUsuarioAsignado){
                    notificationService.showEntityNotification(message);
                }
            }
            else{
                notificationService.showEntityNotification(message);
            }
        });

        socket.on('TraInstanciaTramite.Socket_UpdateTraInstanciaGrid', function (message) {
            if (($rootScope.user.tipoUsuario && $rootScope.user.tipoUsuario == 1) || ($rootScope.user.tipoUsuario[0] && $rootScope.user.tipoUsuario[0].IdTipoUsuario == 1)) {
                bandejaDeTramitesController.loadTareaList();
            }
        });

        bandejaDeTramitesController.getPrioridadList = function () {
            workflowService.getTipoPrioridadList().then(function (response) {
                if (response) {
                    for (i in response) {
                        var actualPrioridad = response[i];

                        bandejaDeTramitesController.prioridadList.push(actualPrioridad);
                    }
                }
            })
        };

        bandejaDeTramitesController.getTramiteTypeList = function () {
            setTimeout(function () {
                utilityService.callSecureHttp({
                    method: "GET",
                    url: "secure-api/TraTramite/GetAll",
                    callbackSuccess: bandejaDeTramitesController.getTramiteTypeListCallback
                });
            }, 2000);
        };

        bandejaDeTramitesController.getTramiteTypeListCallback = function (response) {
            if (response) {
                bandejaDeTramitesController.tramiteList = response.data;
            }
        };

        bandejaDeTramitesController.cleanLegajoAndCarreraText = function () {
            bandejaDeTramitesController.tramiteAGenerar.alumnoNameByLegajo = '';
            bandejaDeTramitesController.tramiteAGenerar.carreraSelected = '';
            bandejaDeTramitesController.tramiteAGenerar.alumnoSelected = undefined;
        };

        bandejaDeTramitesController.validateLegajo = function () {

            if (bandejaDeTramitesController.tramiteAGenerar.legajoSearchText) {
                var legajo = bandejaDeTramitesController.tramiteAGenerar.legajoSearchText;

                var process_validateLegajo_request = function (legajo) {

                    utilityService.callSecureHttp({
                        method: "GET",
                        url: "secure-api/UniAlumno/ValidateLegajo/" + bandejaDeTramitesController.tramiteAGenerar.legajoSearchText,
                        callbackSuccess: success_validateLegajo_request,
                        callbackError: success_validateLegajo_request,
                        token: $cookies.get('token')
                    });
                };

                var success_validateLegajo_request = function (response) {
                    if (response && response.data) {
                        var jsonRes = response.data;
                        if (jsonRes) {
                            bandejaDeTramitesController.tramiteAGenerar.alumnoSelected = jsonRes;
                            bandejaDeTramitesController.tramiteAGenerar.alumnoNameByLegajo = jsonRes.Nombre + ' ' + jsonRes.Apellido;
                            bandejaDeTramitesController.tramiteAGenerar.carreraSelected = '(' + jsonRes.Carrera + ') ' + jsonRes.CarreraNombre;

                            return;
                        }
                        else {
                            bandejaDeTramitesController.tramiteAGenerar.alumnoNameByLegajo = '';
                            bandejaDeTramitesController.tramiteAGenerar.carreraSelected = '';
                            bandejaDeTramitesController.tramiteAGenerar.alumnoSelected = undefined;
                        }
                        bandejaDeTramitesController.tramiteAGenerar.validLegajo = false;
                    }
                    else {
                        bandejaDeTramitesController.tramiteAGenerar.alumnoNameByLegajo = 'Alumno no encontrado';
                        bandejaDeTramitesController.tramiteAGenerar.carreraSelected = '';
                        bandejaDeTramitesController.tramiteAGenerar.alumnoSelected = undefined;

                    }
                };

                process_validateLegajo_request(legajo);
            }
            else {
                bandejaDeTramitesController.tramiteAGenerar.alumnoNameByLegajo = '';
                bandejaDeTramitesController.tramiteAGenerar.carreraSelected = '';
                bandejaDeTramitesController.tramiteAGenerar.alumnoSelected = undefined;
            }

        };

        bandejaDeTramitesController.openTramiteModal = function () {
            bandejaDeTramitesController.processInstanciaTramite();
        };

        bandejaDeTramitesController.processInstanciaTramite = function () {

            bandejaDeTramitesController.createInstanciaTramite();

        };

        bandejaDeTramitesController.createInstanciaTramite = function () {
            var instanciaTramiteData = {};

            if (bandejaDeTramitesController.tramiteAGenerar.alumnoSelected && bandejaDeTramitesController.tramiteAGenerar.tramiteSelected) {

                instanciaTramiteData.IdTramite = bandejaDeTramitesController.tramiteAGenerar.tramiteSelected.IdTramite;
                var auxDate = new Date();
                var fechaComienzo = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                    (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());
                instanciaTramiteData.FechaComienzo = fechaComienzo;
                auxDate = new Date();
                var fechaFin = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                    (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());
                instanciaTramiteData.FechaFin = fechaFin;
                instanciaTramiteData.IdUsuario = bandejaDeTramitesController.usuarioAsignadoIdUsuario;
                instanciaTramiteData.Legajo = bandejaDeTramitesController.tramiteAGenerar.legajoSearchText;
                instanciaTramiteData.Prioridad = bandejaDeTramitesController.tramiteAGenerar.prioridadSelected.IdTipoPrioridad;

                // Agregar prioridad

                var process_createInstanciaTramite_request = function (data) {

                    utilityService.callSecureHttp({
                        method: "POST",
                        url: "secure-api/TraInstanciaTramite/create",
                        data: data,
                        callbackSuccess: success_createInstanciaTramite_Request,
                        callbackError: success_createInstanciaTramite_Request
                    });
                };

                var success_createInstanciaTramite_Request = function (response) {
                    if (response.data) {
                        var createdInstanciaTramite = response.data[0];
                        bandejaDeTramitesController.CreateInstanciaEstado(createdInstanciaTramite);

                    }
                };

                process_createInstanciaTramite_request(instanciaTramiteData);
            }
            else {
                utilityService.showMessage({
                    messageType: 2,
                    messageTitle: "Error",
                    message: "Verificar que el alumno y el tipo de trámite se encuentren seleccionados."
                });
                return;

            }
        }

        bandejaDeTramitesController.CreateInstanciaEstado = function (createdInstanciaTramite) {

            workflowService.getFirstEstadoDefinicion(createdInstanciaTramite.IdTramite)
                .then(function (response) {

                    var instanciaTarea = {
                        IdEstado: response[0].IdEstado
                    }
                    var idEstadoEstado = 1; // En proceso

                    workflowService.createEstadoInstancia(bandejaDeTramitesController.usuarioAsignadoIdUsuario,
                        instanciaTarea.IdEstado,
                        createdInstanciaTramite.IdTramite,
                        createdInstanciaTramite.IdInstanciaTramite,
                        idEstadoEstado,
                        createdInstanciaTramite.Prioridad,
                        new Date(),
                        null,
                        new Date(),
                        null,
                        null
                    )
                        .then(function (response) {

                            if (response[0]) {
                                workflowService.getEstadoInicialByIdTramite(
                                    bandejaDeTramitesController.usuarioAsignadoIdUsuario,
                                    createdInstanciaTramite.IdTramite,
                                    bandejaDeTramitesController.tramiteAGenerar.alumnoSelected.IdUsuario,
                                    createdInstanciaTramite,
                                    response[0])
                                    .then(function (response) {
                                        if (response) {
                                            if (response.Pantalla.NombrePantalla) {

                                                var auxDate = new Date();
                                                var fechaFin = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                                                    (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());

                                                var estadoInstanciaData = response;
                                                if (createdInstanciaTramite.IdTramite != 1)
                                                    estadoInstanciaData.ValoresSalida = JSON.stringify({ edificioCodIns: bandejaDeTramitesController.selectedEdificio.CodIns });
                                                else
                                                    estadoInstanciaData.ValoresSalida = JSON.stringify({});

                                                estadoInstanciaData.Username = bandejaDeTramitesController.tramiteAGenerar.alumnoSelected.Username;
                                                estadoInstanciaData.FechaFin = fechaFin;

                                                success_updateEstadoInstancia_Request = function (response) {
                                                    var data = response.data[0];
                                                    workflowService.openTramiteModal(estadoInstanciaData).then(function (response) {
                                                        bandejaDeTramitesController.loadTareaList();
                                                    })
                                                }

                                                // LLAMADA AL UPDATE
                                                utilityService.callSecureHttp({
                                                    method: "POST",
                                                    url: "secure-api/TraEstadoInstancia/Update",
                                                    data: estadoInstanciaData,
                                                    callbackSuccess: success_updateEstadoInstancia_Request,
                                                    callbackError: success_updateEstadoInstancia_Request
                                                });


                                            } else {//si idPantalla es null, se debería cerrar la instancia
                                                var auxDate = new Date();
                                                var fechaFin = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                                                    (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());

                                                var estadoInstanciaData = response;

                                                estadoInstanciaData.EstadoEstado = 2;
                                                if (createdInstanciaTramite.IdTramite != 1)
                                                    estadoInstanciaData.ValoresSalida = JSON.stringify({ edificioCodIns: bandejaDeTramitesController.selectedEdificio.CodIns });
                                                else
                                                    estadoInstanciaData.ValoresSalida = JSON.stringify({});

                                                estadoInstanciaData.FechaFin = fechaFin;

                                                success_updateEstadoInstancia_Request = function (response) {
                                                    var data = response.data[0];
                                                    workflowService.getNextEstadoByIdEstadoActual(data.IdEstadoDefinicion, true, data)
                                                        .then(function (response) {
                                                            // utilityService.showMessage({
                                                            //     messageType: 1,
                                                            //     messageTitle: "Mensaje",
                                                            //     message: "Esto está funcando"
                                                            // });
                                                            bandejaDeTramitesController.loadTareaList();
                                                        });

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

                                        }
                                        bandejaDeTramitesController.loadTareaList();
                                    });
                            }
                        });

                });
            bandejaDeTramitesController.loadTareaList();
        }

        changeSelectPrioridad = function (index,gridTypeParam) {
            var instanciaTramiteData = {};
            var valueSelected = $('#selectPrioridad' + index)[0].value;
            gridType=gridTypeParam;
            if (gridType=='Iniciadas'){
                bandejaDeTramitesController.tramiteListIniciadasData[index].valorPrioridad = valueSelected;
                instanciaTramiteData.IdTramite = bandejaDeTramitesController.tramiteListIniciadasData[index].NroTramite;
            }else{
                bandejaDeTramitesController.tramiteListData[index].valorPrioridad = valueSelected;
                instanciaTramiteData.IdTramite = bandejaDeTramitesController.tramiteListData[index].NroTramite;
            }
            instanciaTramiteData.Prioridad = valueSelected;

            var process_updateInstanciaTramite_request = function (data) {
                utilityService.callSecureHttp({
                    method: "POST",
                    url: "secure-api/TraInstanciaTramite/update",
                    data: data,
                    callbackSuccess: success_updateInstanciaTramite_Request,
                    callbackError: success_updateInstanciaTramite_Request
                });
            };

            var success_updateInstanciaTramite_Request = function (response) {
                if (response.data) {
                    if (gridType=='Iniciadas'){
                        for (var i in bandejaDeTramitesController.tramiteListIniciadasData) {
                            if (bandejaDeTramitesController.tramiteListIniciadasData[i].NroTramite == response.data[0].IdInstanciaTramite) {
                                bandejaDeTramitesController.tramiteListIniciadasData[i].Prioridad = response.data[0].Prioridad;
                            }
                        }
                    }else{
                        for (var i in bandejaDeTramitesController.tramiteListData) {
                            if (bandejaDeTramitesController.tramiteListData[i].NroTramite == response.data[0].IdInstanciaTramite) {
                                bandejaDeTramitesController.tramiteListData[i].Prioridad = response.data[0].Prioridad;
                            }
                        }
                    }
                    var updateInstanciaTramite = response.data[0];
                }
            };
            process_updateInstanciaTramite_request(instanciaTramiteData);
        }

        submitObservacion = function (nroTramite, nroTarea, idInstanciaTramiteActivo,gridTypeParam) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            gridType=gridTypeParam;
            if (keycode == '13') {

                if ($('#comboLegajo_' + nroTramite).val()) {

                    if ($('#comboLegajo_' + nroTramite).val().trim()) {

                        var observacionDate = utilityService.formatDate(new Date(), null);
                        var observacionUser =
                        {
                            IdUsuario: $rootScope.user.IdUsuario,
                            Username: $rootScope.user.username
                        };

                        var observacionText = $('#comboLegajo_' + nroTramite).val();

                        // GUARDAR OBSERVACIONES
                        var process_createUpdateObservacion_request = function (data) {
                            utilityService.callSecureHttp({
                                method: "POST",
                                url: "secure-api/TraEstadoInstanciaObservaciones/Create",
                                data: data,
                                callbackSuccess: success_createUpdateObservacion_Request,
                                callbackError: success_createUpdateObservacion_Request
                            });
                        };

                        var success_createUpdateObservacion_Request = function (response) {
                            if (response.data) {
                                $('#comboLegajo_' + nroTramite).val('');

                                debugger;
                                var modalInstance = $uibModal.open({
                                    animation: true,
                                    templateUrl: 'app/components/gestionDeTramites/modal/estadoInstanciaObservaciones.html',
                                    controller: 'estadoInstanciaObservacionesController as vm',
                                    backdrop: 'static',
                                    resolve: {
                                        data: { NroTramite: nroTramite, NroTarea: nroTarea, IdInstanciaTramiteActivo: idInstanciaTramiteActivo, UsuarioAsignadoIdUsuario: bandejaDeTramitesController.usuarioAsignadoIdUsuario}
                                    }
                                });

                                var iterGrid = 0;
                                if (gridType=='Iniciadas'){
                                    for (j in bandejaDeTramitesController.tramiteListIniciadasData) {
                                        var actualTareaInstanciaPrioridad = bandejaDeTramitesController.tramiteListIniciadasData[j];
                                        // Establecer combo de prioridad
                                        if (actualTareaInstanciaPrioridad.Prioridad) {
                                            $("#selectPrioridad" + iterGrid).val(actualTareaInstanciaPrioridad.Prioridad);
                                            iterGrid++;
                                        }
                                        else {
                                            actualTareaInstancia.Prioridad =
                                                '<select class="input-large form-control" ng-options="tramite.Descripcion for tramite in vm.tramiteList" ng-model="vm.tramiteSelected"> ' +
                                                '<option></option> ' +
                                                '</select>';
                                        }
                                    }
                                }else{
                                    for (j in bandejaDeTramitesController.tramiteListData) {
                                        var actualTareaInstanciaPrioridad = bandejaDeTramitesController.tramiteListData[j];
                                        // Establecer combo de prioridad
                                        if (actualTareaInstanciaPrioridad.Prioridad) {
                                            $("#selectPrioridad" + iterGrid).val(actualTareaInstanciaPrioridad.Prioridad);
                                            iterGrid++;
                                        }
                                        else {
                                            actualTareaInstancia.Prioridad =
                                                '<select class="input-large form-control" ng-options="tramite.Descripcion for tramite in vm.tramiteList" ng-model="vm.tramiteSelected"> ' +
                                                '<option></option> ' +
                                                '</select>';
                                        }
                                    }
                                }
                            }
                        };
                        process_createUpdateObservacion_request({ Texto: observacionText, IdInstanciaTramite: nroTramite, IdEstadoInstancia: nroTarea, IdUsuarioAsignado: bandejaDeTramitesController.usuarioAsignadoIdUsuario });
                    }

                }

                //alert('You pressed a "enter" key in textbox, here submit your form'); 
            }
        }

        // Setting intervals (for demo only)
        //setInterval(bandejaDeTramitesController.loadTareaList, 30000);
    });


    

function prioridadFormatterIniciadas(value,row,index,field) {
        var selectByValue = function (option, value) {
            if (option == value)
                return 'selected'
            else
                return '';
        }
        return '<select id="selectPrioridad' + index + '" class="input-large form-control" onchange="changeSelectPrioridad(' + index + ',' + '\'Iniciadas\'' + ')">' +
            '<option value=1 ' + selectByValue(1, row.valorPrioridad) + '>Baja</option>' +
            '<option value=2 ' + selectByValue(2, row.valorPrioridad) + '>Media</option>' +
            '<option value=3 ' + selectByValue(3, row.valorPrioridad) + '>Alta</option>' +
            '<option value=4 ' + selectByValue(4, row.valorPrioridad) + '>Urgente</option>' +
            '</select>';
}

function prioridadFormatter(value,row,index,field) {
    var selectByValue = function (option, value) {
        if (option == value)
            return 'selected'
        else
            return '';
    }
    return '<select id="selectPrioridad' + index + '" class="input-large form-control" onchange="changeSelectPrioridad(' + index + ',' + '\'No Iniciadas\')">' +
        '<option value=1 ' + selectByValue(1, row.valorPrioridad) + '>Baja</option>' +
        '<option value=2 ' + selectByValue(2, row.valorPrioridad) + '>Media</option>' +
        '<option value=3 ' + selectByValue(3, row.valorPrioridad) + '>Alta</option>' +
        '<option value=4 ' + selectByValue(4, row.valorPrioridad) + '>Urgente</option>' +
        '</select>';
}

