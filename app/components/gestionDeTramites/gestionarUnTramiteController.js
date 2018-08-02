angular.module('app')
    .controller('gestionarUnTramiteController', function ($scope, $rootScope, $location, Auth, $uibModal, utilityService, $cookies, workflowService, notificationService) {

        var gestionarUnTramiteController = this;

        // Setting socket
        var socket = io($rootScope.WEB_SOCKET_URL);

        // Setting various
        gestionarUnTramiteController.alumnoNameByLegajo = '';
        gestionarUnTramiteController.idUsuario = 0;
        gestionarUnTramiteController.idGrupoAsignado = 0;
        gestionarUnTramiteController.CarreraFinalizada = 0;
        gestionarUnTramiteController.username = $rootScope.user.username.split('@')[0] || $rootScope.user.username;

        // Setting lists
        gestionarUnTramiteController.tramiteList = [];
        gestionarUnTramiteController.tramiteInstanciaList = [];
        gestionarUnTramiteController.prioridadList = [];
        gestionarUnTramiteController.edificioConstanciaList = [];
        gestionarUnTramiteController.edificioList = [];

        // Setting selected items
        gestionarUnTramiteController.selectedTramite = null;
        gestionarUnTramiteController.legajo = '';
        gestionarUnTramiteController.selectedPrioridad = null;
        gestionarUnTramiteController.selectedEdificio = null;

        // Setting text items    
        gestionarUnTramiteController.legajoSearchText = null;

        // Setting validation items
        gestionarUnTramiteController.validLegajo = null;

        gestionarUnTramiteController.init = function () {

            Auth.tokenCookieExists();

            if (!$rootScope.user.tipoUsuario) {
                gestionarUnTramiteController.getTipoUsuarioByUsername();
            }

            gestionarUnTramiteController.getAlumnoDataByUsername();

            if (!$rootScope.user.grupoAsignadoList) {
                gestionarUnTramiteController.getGrupoAsignadoByUsername();
            }
        };

        gestionarUnTramiteController.getTipoUsuarioByUsername = function () {

            if (!$rootScope.user.tipoUsuario) {
                workflowService.getTipoUsuarioByUsername($rootScope.user.username).then(function (response) {
                    if (response) {
                        if(response[0]){
                            $rootScope.user.tipoUsuario = response[0].IdTipoUsuario;
                        }
                    }
                })
            }
        }

        gestionarUnTramiteController.getAlumnoDataByUsername = function () {
            var process_getAlumnoDataByUsername_request = function () {
                utilityService.callSecureHttp({
                    method: "GET",
                    url: "secure-api/UniAlumno/GetAlumnoByUsername/" + gestionarUnTramiteController.username,
                    callbackSuccess: success_getAlumnoDataByUsername_request,
                    callbackError: success_getAlumnoDataByUsername_request
                });
            };

            var success_getAlumnoDataByUsername_request = function (response) {
                if (response && response.data) {
                    gestionarUnTramiteController.alumnoSelected = response.data
                    gestionarUnTramiteController.idUsuario = gestionarUnTramiteController.alumnoSelected.IdUsuario;
                    gestionarUnTramiteController.carreraSelected = "(" + gestionarUnTramiteController.alumnoSelected.Carrera + ") " + gestionarUnTramiteController.alumnoSelected.CarreraNombre
                    gestionarUnTramiteController.legajoSearchText = gestionarUnTramiteController.alumnoSelected.LegajoProvisorio;
                }
                gestionarUnTramiteController.loadLists();
            };

            process_getAlumnoDataByUsername_request();
        };

        gestionarUnTramiteController.getGrupoAsignadoByUsername = function () {
            var process_getGrupoAsignadoByUsername_request = function () {
                utilityService.callSecureHttp({
                    method: "GET",
                    url: "secure-api/TraGrupoUsuarios/GetGrupoAsignadoByUsername/" + $rootScope.user.username,
                    callbackSuccess: success_getGrupoAsignadoByUsername_request,
                    callbackError: success_getGrupoAsignadoByUsername_request
                });
            };

            var success_getGrupoAsignadoByUsername_request = function (response) {
                if (response && response.data) {
                    gestionarUnTramiteController.idUsuario = response.data[0].IdUsuario;
                    gestionarUnTramiteController.idGrupoAsignado = response.data[0].IdGrupo;
                    gestionarUnTramiteController.CarreraFinalizada = response.data[0].CarreraFinalizada;
                    gestionarUnTramiteController.loadLists();
                }
                else {
                    utilityService.showMessage({
                        messageType: 2,
                        messageTitle: "Error",
                        message: "No se ha encontrado el alumno correspondiente."
                    });
                    return;
                }
            };

            process_getGrupoAsignadoByUsername_request();
        }

        gestionarUnTramiteController.loadLists = function () {
            gestionarUnTramiteController.getTramiteInstanciaList();
            gestionarUnTramiteController.getTramiteTypeList();
            gestionarUnTramiteController.getPrioridadList();
            gestionarUnTramiteController.getEdificioConstanciaList();
            gestionarUnTramiteController.getEdificioList();
        };

        gestionarUnTramiteController.getTramiteInstanciaList = function () {

            // Solicito la información de la primera tarea de un trámite
            var process_getTramiteInstanciaByLegajo_request = function () {
                utilityService.callSecureHttp({
                    method: "GET",
                    url: "secure-api/TraInstanciaTramite/GetTramiteInstanciaByLegajo/" + gestionarUnTramiteController.legajoSearchText + "/" + gestionarUnTramiteController.alumnoSelected.IdUsuario,
                    callbackSuccess: success_getTramiteInstanciaByLegajo_request,
                    callbackError: success_getTramiteInstanciaByLegajo_request,
                    token: $cookies.get('token')
                });
            };

            var success_getTramiteInstanciaByLegajo_request = function (response) {
                gestionarUnTramiteController.tramiteInstanciaList = response.data;
                var indexSede=0;
                for (index in gestionarUnTramiteController.tramiteInstanciaList) {

                    var actualItem = gestionarUnTramiteController.tramiteInstanciaList[index];
                    actualItem.Ver = '<i class="fa fa-info-circle fa-lg bootstrap-data-detail" title="Ver detalles del trámite" onclick="loadTramiteDetailContent(' + index + ')" ></i>';
                    actualItem.FechaComienzo = utilityService.formatDate(actualItem.FechaComienzo,true);
                    var dateString = actualItem.FechaComienzo; // Oct 23
                    var dateParts = dateString.split("/");
                    var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                    actualItem.FechaFinalizacionEstimada = utilityService.formatDate(utilityService.addWorkDays(new Date(dateObject),actualItem.FechaFinalizacionEstimada),true);
                    var jsonValorSalida = JSON.parse(actualItem.ValoresSalida);
                    actualItem.SedeRetiro =  jsonValorSalida ? jsonValorSalida.edificioCodIns : -1;
                    //SUSPENDIDO NO SE USA
                    //if (actualItem.EstadoEstado == 3) {
                    //    actualItem.Ver = actualItem.Ver + '<i class="fa fa-arrow-circle-right fa-lg bootstrap-data-continue" title="Continuar trámite" onclick="continueTramite(' + index + ')" ></i>';
                    //}
                }

                var process_getEdificios_request = function () {
                        utilityService.callSecureHttp({
                            method: "GET",
                            url: "secure-api/UniEdificio/GetAll/",
                            callbackSuccess: success_getEdificios_request,
                            callbackError: success_getEdificios_request,
                            token: $cookies.get('token')
                        });
                };
    
                var success_getEdificios_request = function (response) {
                    var uniEdificiosDTO = response.data;
                    for (index in gestionarUnTramiteController.tramiteInstanciaList) {
                        var actualItem = gestionarUnTramiteController.tramiteInstanciaList[index];
                        if (!actualItem.SedeRetiro) {
                            actualItem.SedeRetiro = 'Registro';
                        } else if (actualItem.SedeRetiro == -1) {
                            actualItem.SedeRetiro = 'NO SEDE';
                        } else {
                            gestionarUnTramiteController.tramiteInstanciaList[index].SedeRetiro = utilityService.getByKey(uniEdificiosDTO, {
                                key: 'CodIns',
                                value: gestionarUnTramiteController.tramiteInstanciaList[index].SedeRetiro
                            }).NomIns;
                        }
                    }
                    $('#gestionarUnTramite_ResultTable').bootstrapTable();
                    $('#gestionarUnTramite_ResultTable').bootstrapTable('load', {
                        data: gestionarUnTramiteController.tramiteInstanciaList
                    });
                }
                process_getEdificios_request();

                $('#gestionarUnTramite_ResultTable').bootstrapTable();
                $('#gestionarUnTramite_ResultTable').bootstrapTable('load', {
                    data: gestionarUnTramiteController.tramiteInstanciaList
                });
            };
            process_getTramiteInstanciaByLegajo_request();
        };

        gestionarUnTramiteController.getPrioridadList = function () {
            workflowService.getTipoPrioridadList().then(function (response) {
                if (response) {
                    for (i in response) {
                        var actualPrioridad = response[i];

                        gestionarUnTramiteController.prioridadList.push(actualPrioridad);
                    }
                }
            })
        };

        gestionarUnTramiteController.getTramiteTypeList = function () {
            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/TraTramite/GetAll",
                callbackSuccess: gestionarUnTramiteController.getTramiteTypeListCallback
            });
        };

        gestionarUnTramiteController.getTramiteTypeListCallback = function (response) {
            if (response) {
                if (gestionarUnTramiteController.CarreraFinalizada == 0) {
                    utilityService.removeByKey(response.data, {
                        key: 'IdTramite',
                        value: 1
                    });
                    gestionarUnTramiteController.tramiteList = response.data;
                } else {
                    gestionarUnTramiteController.tramiteList = response.data;
                }
            }
        };

        gestionarUnTramiteController.getEdificioConstanciaList = function () {
            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/UniEdificio/GetEdificioConstancia",
                callbackSuccess: gestionarUnTramiteController.getEdificioConstanciaListCallback
            });
        };

        gestionarUnTramiteController.getEdificioConstanciaListCallback = function (response) {
            if (response) {
                gestionarUnTramiteController.edificioConstanciaList = response.data;
            }
        };

        gestionarUnTramiteController.getEdificioList = function () {
            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/UniEdificio/GetEdificioLibretaUniversitaria",
                callbackSuccess: gestionarUnTramiteController.getEdificioListCallback
            });
        };

        gestionarUnTramiteController.getEdificioListCallback = function (response) {
            if (response) {
                gestionarUnTramiteController.edificioList = response.data;
            }
        };

        gestionarUnTramiteController.tipoTramiteChange = function() {
            gestionarUnTramiteController.selectedEdificio = null;
        }

        gestionarUnTramiteController.cleanLegajoAndCarreraText = function () {
            gestionarUnTramiteController.alumnoNameByLegajo = '';
            gestionarUnTramiteController.carreraSelected = '';
            gestionarUnTramiteController.alumnoSelected = undefined;
        };

        gestionarUnTramiteController.processInstanciaTramite = function () {

            gestionarUnTramiteController.createInstanciaTramite();

        };

        gestionarUnTramiteController.createInstanciaTramite = function () {
            var instanciaTramiteData = {};

            if (gestionarUnTramiteController.alumnoSelected && gestionarUnTramiteController.tramiteSelected) {

                instanciaTramiteData.IdTramite = gestionarUnTramiteController.tramiteSelected.IdTramite;
                var auxDate = new Date();
                var fechaComienzo = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());
                instanciaTramiteData.FechaComienzo = fechaComienzo;
                instanciaTramiteData.FechaComienzoFormat = utilityService.formatDate(fechaComienzo,null);

                auxDate = new Date();
                var fechaFin = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                    (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());
                instanciaTramiteData.FechaFin = fechaFin;
                instanciaTramiteData.IdUsuario = gestionarUnTramiteController.alumnoSelected.IdUsuario;
                instanciaTramiteData.Legajo = gestionarUnTramiteController.alumnoSelected.LegajoProvisorio;
                if(!gestionarUnTramiteController.selectedPrioridad && gestionarUnTramiteController.prioridadList){

                    // Por defecto, la prioridad es 1 ("BAJA")
                    gestionarUnTramiteController.selectedPrioridad = gestionarUnTramiteController.prioridadList[0];
                }
                instanciaTramiteData.Prioridad = gestionarUnTramiteController.selectedPrioridad.IdTipoPrioridad;

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
                        gestionarUnTramiteController.CreateInstanciaEstado(createdInstanciaTramite);

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

         gestionarUnTramiteController.CreateInstanciaEstado = function (createdInstanciaTramite) {

            workflowService.getFirstEstadoDefinicion(createdInstanciaTramite.IdTramite)
                .then(function (response) {

                    var instanciaTarea = {
                        IdEstado: response[0].IdEstado
                    }
                    var idEstadoEstado = 1; // En proceso

                    workflowService.createEstadoInstancia(gestionarUnTramiteController.alumnoSelected.IdUsuario,
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
                                    gestionarUnTramiteController.username,
                                    createdInstanciaTramite.IdTramite,
                                    gestionarUnTramiteController.alumnoSelected.IdUsuario,
                                    createdInstanciaTramite,
                                    response[0])
                                    .then(function (response) {

                                        if (response) {
                                            if (response.Pantalla.NombrePantalla) {

                                                var auxDate = new Date();
                                                var fechaFin = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                                                    (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());

                                                var estadoInstanciaData = response;

                                                if (gestionarUnTramiteController.tramiteSelected.IdTramite != 1)
                                                    estadoInstanciaData.ValoresSalida = JSON.stringify({ edificioCodIns: gestionarUnTramiteController.selectedEdificio.CodIns });
                                                else
                                                    estadoInstanciaData.ValoresSalida = JSON.stringify({});

                                                estadoInstanciaData.FechaFin = fechaFin;

                                                success_updateEstadoInstancia_Request = function (response) {
                                                    var data = response.data[0];
                                                        workflowService.openTramiteModal(estadoInstanciaData).then(function (response) {
                                                            gestionarUnTramiteController.getTramiteInstanciaList();
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
                                                if (gestionarUnTramiteController.tramiteSelected.IdTramite != 1)
                                                    estadoInstanciaData.ValoresSalida = JSON.stringify({ edificioCodIns: gestionarUnTramiteController.selectedEdificio.CodIns });
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
                                                            gestionarUnTramiteController.getTramiteInstanciaList();
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
                                        gestionarUnTramiteController.getTramiteInstanciaList();
                                    });
                            }
                        });

                });
        };

        gestionarUnTramiteController.openTramiteModal = function () {
            gestionarUnTramiteController.processInstanciaTramite();
        };

        // continueTramite = function (idTramite) {

        //     if (idTramite || idTramite === 0) {
        //         gestionarUnTramiteController.selectedTramite = gestionarUnTramiteController.tramiteInstanciaList[idTramite];
        //         workflowService.getEstadoInstanciaById(gestionarUnTramiteController.selectedTramite.IdInstanciaTramite).then(function (response) {
        //             if (response) {
        //                 response[0].IdTramite = idTramite;
        //                 workflowService.openTramiteModal(response[0]).then(function () {
        //                     gestionarUnTramiteController.getTramiteInstanciaList();
        //                 });
        //             }
        //         });
        //     }
        // }

        loadTramiteDetailContent = function (idTramite) {

            if (idTramite || idTramite === 0) {
                gestionarUnTramiteController.selectedTramite = gestionarUnTramiteController.tramiteInstanciaList[idTramite];
                // $('#mymodal').modal('toggle');
                // $('#myModal').modal('show');

                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/components/gestionDeTramites/modal/modalDetalleDeTramite.html',
                    controller: 'ModalInstanceCtrl',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        data: function () {
                            return gestionarUnTramiteController.selectedTramite;
                        }
                    }
                });
            }
        }

        socket.on('TraEstadoInstancia.ShowNotification', function (message) {
            if ($rootScope.user.tipoUsuario && $rootScope.user.tipoUsuario == 2) {
                gestionarUnTramiteController.getTramiteInstanciaList();
            }
        });

        socket.on('TraInstanciaTramite.Socket_UpdateTraInstanciaGrid', function (message) {
            if ($rootScope.user.tipoUsuario && $rootScope.user.tipoUsuario == 2) {
                gestionarUnTramiteController.getTramiteInstanciaList();
            }
        });
    })