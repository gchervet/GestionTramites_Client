angular.module('app')
    .controller('consultaTramitesController', function ($scope, $rootScope, $location, Auth, $uibModal, utilityService, $cookies, workflowService) {

        var consultaTramitesController = this;

        // Setting socket
        var socket = io($rootScope.WEB_SOCKET_URL);

        // Setting selected items
        consultaTramitesController.selectedTramite = null;
        consultaTramitesController.legajo = '';
        consultaTramitesController.selectedPrioridad = null;
        consultaTramitesController.selectedEdificio = null;

        consultaTramitesController.tramiteAGenerar = {};

        // Setting various
        consultaTramitesController.usuarioAsignadoUsername = $rootScope.user.username.split('@')[0] || $rootScope.user.username;
        consultaTramitesController.grupoAsignadoListString = '';
        consultaTramitesController.usuarioAsignadoIdUsuario = 0;

        // Setting list values
        consultaTramitesController.tramiteListData = [];
        consultaTramitesController.tramiteInstanciaList = [];
        consultaTramitesController.prioridadList = [];
        consultaTramitesController.edificioConstanciaList = [];
        consultaTramitesController.edificioList = [];

        // Setting text items    
        consultaTramitesController.legajoSearchText = null;

        consultaTramitesController.init = function () {

            Auth.tokenCookieExists();
            consultaTramitesController.loadUserData();
            consultaTramitesController.loadLists();

        };

        consultaTramitesController.loadUserData = function () {
            consultaTramitesController.getTipoUsuarioByUsername();
            consultaTramitesController.getGruposAsignadosByUsername();
        }

        consultaTramitesController.getTipoUsuarioByUsername = function () {

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

        consultaTramitesController.getGruposAsignadosByUsername = function () {

            var process_getGruposAsignadosByUsername_request = function () {
                utilityService.callSecureHttp({
                    method: "GET",
                    url: "secure-api/TraGrupoUsuarios/GetGruposByUsername/" + consultaTramitesController.usuarioAsignadoUsername,
                    callbackSuccess: success_getGruposAsignadosByUsername_Request,
                    callbackError: success_getGruposAsignadosByUsername_Request
                });
            };

            var success_getGruposAsignadosByUsername_Request = function (response) {
                if (response.data) {

                    for (i in response.data) {
                        var actualGrupo = response.data[i];

                        consultaTramitesController.grupoAsignadoListString = consultaTramitesController.grupoAsignadoListString + actualGrupo.IdGrupo;

                        if (i != (response.data.length - 1)) {
                            consultaTramitesController.grupoAsignadoListString = consultaTramitesController.grupoAsignadoListString + ',';
                        }

                        consultaTramitesController.usuarioAsignadoIdUsuario = actualGrupo.IdUsuario;
                    }
                }
            };

            process_getGruposAsignadosByUsername_request();
        }

        consultaTramitesController.loadLists = function () {
            consultaTramitesController.loadTareaList();
            consultaTramitesController.getTramiteTypeList();
            consultaTramitesController.getPrioridadList();
            consultaTramitesController.getEdificioConstanciaList();
            consultaTramitesController.getEdificioList();
        }

        consultaTramitesController.getEdificioConstanciaList = function () {
            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/UniEdificio/GetEdificioConstancia",
                callbackSuccess: consultaTramitesController.getEdificioConstanciaListCallback
            });
        };

        consultaTramitesController.getEdificioConstanciaListCallback = function (response) {
            if (response) {
                consultaTramitesController.edificioConstanciaList = response.data;
            }
        };

        consultaTramitesController.getEdificioList = function () {
            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/UniEdificio/GetEdificioLibretaUniversitaria",
                callbackSuccess: consultaTramitesController.getEdificioListCallback
            });
        };

        consultaTramitesController.getEdificioListCallback = function (response) {
            if (response) {
                consultaTramitesController.edificioList = response.data;
            }
        };

        consultaTramitesController.loadTareaList = function () {

            var process_getTareaListByUsername_request = function () {
                utilityService.callSecureHttp({
                    method: "GET",
                    url: "secure-api/TraEstadoInstancia/GetEstadoInstanciaListAll",
                    callbackSuccess: success_getTareaListByUsername_Request,
                    callbackError: success_getTareaListByUsername_Request
                });
            };

            var success_getTareaListByUsername_Request = function (response) {
                consultaTramitesController.tramiteListData = [];
                var iterGrid = 0;
                if (response.data) {

                    if (Array.isArray(response.data))
                        for (i in response.data) {
                            var actualTareaInstanciaConsulta = response.data[i];
                            var addToList = true;

                            // Agregar el campo de observación
                            var observacionText = actualTareaInstanciaConsulta.Observaciones || '';
                            actualTareaInstanciaConsulta.Observaciones =
                                '<div class="row" id="div_observacion_Consulta_' + actualTareaInstanciaConsulta.NroTramite + '">' +
                                '<div class="col-sm-9">' +
                                '<input class=" form-control" id="comboLegajoConsulta_' + actualTareaInstanciaConsulta.NroTramite + '" onkeypress="submitObservacion(' + actualTareaInstanciaConsulta.NroTramite + ',' + actualTareaInstanciaConsulta.NroTarea + ')"/>' +
                                '</div>' +
                                '<div id="tooltipConsulta_' + actualTareaInstanciaConsulta.NroTramite + '" class="col-sm-2"  data-toggle="tooltip" data-placement="left" data-html="true" title="' + observacionText + '">' +
                                '<i class="fa fa-comments-o bootstrap-data-comment-button"' + (observacionText ? 'style="background-color:#337ab7;"' : '')+ ' aria-hidden="true"></i>' +
                                '</div>' +
                                '</div>';

                            // Agregarlo a la lista de la grilla

                            if (addToList) {

                                consultaTramitesController.tramiteListData.push({
                                    NroTramite: actualTareaInstanciaConsulta.NroTramite,
                                    NombreTramite: actualTareaInstanciaConsulta.DescripcionTramite,
                                    IdInstanciaTramiteActivo : actualTareaInstanciaConsulta.IdInstanciaTramiteActivo,
                                    DescripcionTramite: actualTareaInstanciaConsulta.DescripcionTramite,
                                    NombreTarea: actualTareaInstanciaConsulta.NombreTarea,
                                    IdentificadorInteresado: actualTareaInstanciaConsulta.IdentificadorInteresado,
                                    Prioridad: actualTareaInstanciaConsulta.PrioridadNombre,
                                    Estado: actualTareaInstanciaConsulta.Estado,
                                    FechaCreacion: utilityService.formatDate(actualTareaInstanciaConsulta.FechaEntradaBandeja,null),
                                    FechaLimite:  utilityService.formatDate(actualTareaInstanciaConsulta.FechaLimite,null),
                                    Asignado: actualTareaInstanciaConsulta.UsuarioAsignadoUsername,
                                    Accion: actualTareaInstanciaConsulta.Accion,
                                    Observaciones: actualTareaInstanciaConsulta.Observaciones
                                });
                            }


                        }

                    $('#consultaDeTramite_ResultTable').bootstrapTable();
                    $('#consultaDeTramite_ResultTable').bootstrapTable('load', {
                        data: consultaTramitesController.tramiteListData
                    });

                    $('[data-toggle="tooltip"]').tooltip();

                    var iterGrid = 0;
                    for (j in consultaTramitesController.tramiteListData) {
                        var actualTareaInstanciaConsultaPrioridad = consultaTramitesController.tramiteListData[j];
                        // Establecer combo de prioridad
                        if (actualTareaInstanciaConsultaPrioridad.Prioridad) {
                            $("#selectPrioridadConsulta" + iterGrid).val(actualTareaInstanciaConsultaPrioridad.Prioridad);
                            iterGrid++;
                        }
                        else {
                            actualTareaInstanciaConsulta.Prioridad =
                                '<select class="input-large form-control" ng-options="tramite.Descripcion for tramite in vm.tramiteList" ng-model="vm.tramiteSelected"> ' +
                                '<option></option> ' +
                                '</select>';
                        }
                    }
                }


            };
            process_getTareaListByUsername_request();
        }

        assignInstanciaEstado = function (idInstanciaTramite, idInstanciaEstado) {
            workflowService.getEstadoInstanciaById(idInstanciaTramite).then(function (response) {
                if (response) {

                    for (i in response) {
                        var actualInstanciaTramiteConsulta = response[i];

                        if (actualInstanciaTramiteConsulta.IdEstadoInstancia == idInstanciaEstado) {
                            if (actualInstanciaTramiteConsulta.IdAsignadoUsuario && actualInstanciaTramiteConsulta.IdAsignadoUsuario != $rootScope.user.IdUsuario) {
                                // Mostrar error, un usuario ya tiene tomado el caso
                                utilityService.showMessage({
                                    messageType: 1,
                                    messageTitle: "Mensaje",
                                    message: "Este caso se encuentra tomado por otro usuario."
                                });
                            }
                            else {
                                var instanciaTramiteToUpdate = actualInstanciaTramiteConsulta;

                                instanciaTramiteToUpdate.EstadoEstado = 1;
                                //Date(year, month, day, hours, minutes, seconds
                                var auxDate = new Date();
                                instanciaTramiteToUpdate.Comienzo = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                                    (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());
                                instanciaTramiteToUpdate.IdAsignadoUsuario = consultaTramitesController.usuarioAsignadoIdUsuario;

                                workflowService.updateInstanciaEstado(instanciaTramiteToUpdate).then(function (updateResponse) {

                                    consultaTramitesController.loadTareaList();
                                    // Se abre el modal correspondiente si tiene pantalla asignada
                                    if (instanciaTramiteToUpdate.Pantalla.NombrePantalla) {
                                        workflowService.openTramiteModal(instanciaTramiteToUpdate).then(function (modalResponse) {
                                            // Cuando el modal se cierre, se recarga la pantalla
                                            consultaTramitesController.loadTareaList();
                                        })
                                    } else {
                                        consultaTramitesController.loadTareaList();
                                    }
                                })

                            }
                        }
                    }
                }
            });
        }

        reassignEstadoInstancia = function(nroTarea){
            if(Auth.tokenCookieExists){
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
                    consultaTramitesController.loadTareaList()
                  });

                modalInstance.result.then(function(){});
            }
            else{
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

                    var estadoInstanciaData = response[response.length - 1];

                    estadoInstanciaData.EstadoEstado = 2;
                    estadoInstanciaData.FechaFin = fechaFin;

                    success_updateEstadoInstancia_Request = function (response) {
                        var data = response.data[0];
                        workflowService.getNextEstadoByIdEstadoActual(data.IdEstadoDefinicion, true, data)
                                // utilityService.showMessage({
                                //     messageType: 1,
                                //     messageTitle: "Mensaje",
                                //     message: "Esto está funcando"
                                // });
                                consultaTramitesController.loadTareaList();
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
            });
        }

        //socket.on('TraInstanciaTramite.Socket_UpdateTraInstanciaGrid', function (message) {
        //    if (($rootScope.user.tipoUsuario && $rootScope.user.tipoUsuario == 1) || ($rootScope.user.tipoUsuario[0] && $rootScope.user.tipoUsuario[0].IdTipoUsuario == 1)) {
        //        consultaTramitesController.loadTareaList();
        //    }
        //});

        consultaTramitesController.getPrioridadList = function () {
            workflowService.getTipoPrioridadList().then(function (response) {
                if (response) {
                    for (i in response) {
                        var actualPrioridad = response[i];

                        consultaTramitesController.prioridadList.push(actualPrioridad);
                    }
                }
            })
        };

        consultaTramitesController.getTramiteTypeList = function () {
            setTimeout(function () {
                utilityService.callSecureHttp({
                    method: "GET",
                    url: "secure-api/TraTramite/GetAll",
                    callbackSuccess: consultaTramitesController.getTramiteTypeListCallback
                });
            }, 2000);
        };

        consultaTramitesController.getTramiteTypeListCallback = function (response) {
            if (response) {
                consultaTramitesController.tramiteList = response.data;
            }
        };

        consultaTramitesController.cleanLegajoAndCarreraText = function () {
            consultaTramitesController.tramiteAGenerar.alumnoNameByLegajo = '';
            consultaTramitesController.tramiteAGenerar.carreraSelected = '';
            consultaTramitesController.tramiteAGenerar.alumnoSelected = undefined;
        };

        consultaTramitesController.validateLegajo = function () {

            if (consultaTramitesController.tramiteAGenerar.legajoSearchText) {
                var legajo = consultaTramitesController.tramiteAGenerar.legajoSearchText;

                var process_validateLegajo_request = function (legajo) {

                    utilityService.callSecureHttp({
                        method: "GET",
                        url: "secure-api/UniAlumno/ValidateLegajo/" + consultaTramitesController.tramiteAGenerar.legajoSearchText,
                        callbackSuccess: success_validateLegajo_request,
                        callbackError: success_validateLegajo_request,
                        token: $cookies.get('token')
                    });
                };

                var success_validateLegajo_request = function (response) {
                    if (response && response.data) {
                        var jsonRes = response.data;
                        if (jsonRes) {
                            consultaTramitesController.tramiteAGenerar.alumnoSelected = jsonRes;
                            consultaTramitesController.tramiteAGenerar.alumnoNameByLegajo = jsonRes.Nombre + ' ' + jsonRes.Apellido;
                            consultaTramitesController.tramiteAGenerar.carreraSelected = '(' + jsonRes.Carrera + ') ' + jsonRes.CarreraNombre;

                            return;
                        }
                        else {
                            consultaTramitesController.tramiteAGenerar.alumnoNameByLegajo = '';
                            consultaTramitesController.tramiteAGenerar.carreraSelected = '';
                            consultaTramitesController.tramiteAGenerar.alumnoSelected = undefined;
                        }
                        consultaTramitesController.tramiteAGenerar.validLegajo = false;
                    }
                    else {
                        consultaTramitesController.tramiteAGenerar.alumnoNameByLegajo = 'Alumno no encontrado';
                        consultaTramitesController.tramiteAGenerar.carreraSelected = '';
                        consultaTramitesController.tramiteAGenerar.alumnoSelected = undefined;

                    }
                };

                process_validateLegajo_request(legajo);
            }
            else {
                consultaTramitesController.tramiteAGenerar.alumnoNameByLegajo = '';
                consultaTramitesController.tramiteAGenerar.carreraSelected = '';
                consultaTramitesController.tramiteAGenerar.alumnoSelected = undefined;
            }

        };

        consultaTramitesController.openTramiteModal = function () {
            consultaTramitesController.processInstanciaTramite();
        };

        consultaTramitesController.processInstanciaTramite = function () {

            consultaTramitesController.createInstanciaTramite();

        };

        consultaTramitesController.createInstanciaTramite = function () {
            var instanciaTramiteData = {};

            if (consultaTramitesController.tramiteAGenerar.alumnoSelected && consultaTramitesController.tramiteAGenerar.tramiteSelected) {

                instanciaTramiteData.IdTramite = consultaTramitesController.tramiteAGenerar.tramiteSelected.IdTramite;
                var auxDate = new Date();
                var fechaComienzo = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                    (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());
                instanciaTramiteData.FechaComienzo = fechaComienzo;
                auxDate = new Date();
                var fechaFin = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(),
                    (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());
                instanciaTramiteData.FechaFin = fechaFin;
                instanciaTramiteData.IdUsuario = consultaTramitesController.usuarioAsignadoIdUsuario;
                instanciaTramiteData.Legajo = consultaTramitesController.tramiteAGenerar.legajoSearchText;
                instanciaTramiteData.Prioridad = consultaTramitesController.tramiteAGenerar.prioridadSelected.IdTipoPrioridad;

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
                        consultaTramitesController.CreateInstanciaEstado(createdInstanciaTramite);

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

consultaTramitesController.CreateInstanciaEstado = function(createdInstanciaTramite) {
    
    workflowService.getFirstEstadoDefinicion(createdInstanciaTramite.IdTramite)
    .then(function (response) {

        var instanciaTarea = {
            IdEstado: response[0].IdEstado
        }
        var idEstadoEstado = 1; // En proceso

        workflowService.createEstadoInstancia(consultaTramitesController.usuarioAsignadoIdUsuario,
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
                        consultaTramitesController.usuarioAsignadoIdUsuario,
                        createdInstanciaTramite.IdTramite,
                        consultaTramitesController.tramiteAGenerar.alumnoSelected.IdUsuario,
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
                                        estadoInstanciaData.ValoresSalida = JSON.stringify({ edificioCodIns: consultaTramitesController.selectedEdificio.CodIns });
                                    else
                                        estadoInstanciaData.ValoresSalida = JSON.stringify({});

                                    estadoInstanciaData.Username = consultaTramitesController.tramiteAGenerar.alumnoSelected.Username;
                                    estadoInstanciaData.FechaFin = fechaFin;

                                    success_updateEstadoInstancia_Request = function (response) {
                                        var data = response.data[0];
                                            workflowService.openTramiteModal(estadoInstanciaData).then(function (response) {
                                                consultaTramitesController.loadTareaList();
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
                                        estadoInstanciaData.ValoresSalida = JSON.stringify({ edificioCodIns: consultaTramitesController.selectedEdificio.CodIns });
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
                                                consultaTramitesController.loadTareaList();
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
                            consultaTramitesController.loadTareaList();
                        });
                }
            });

    });
    consultaTramitesController.loadTareaList();
}

        changeSelectPrioridad = function (index) {
            var instanciaTramiteData = {};
            var valueSelected = $('#selectPrioridadConsulta' + index)[0].value;
            consultaTramitesController.tramiteListData[index].valorPrioridad = valueSelected;
            instanciaTramiteData.IdTramite = consultaTramitesController.tramiteListData[index].NroTramite;
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
                    for (var i in consultaTramitesController.tramiteListData) {
                        if (consultaTramitesController.tramiteListData[i].NroTramite == response.data[0].IdInstanciaTramite) {
                            consultaTramitesController.tramiteListData[i].Prioridad = response.data[0].Prioridad;
                        }
                    }
                    var updateInstanciaTramite = response.data[0];
                }
            };
            process_updateInstanciaTramite_request(instanciaTramiteData);
        }

        submitObservacion = function (nroTramite, nroTarea) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {

                if ($('#comboLegajo_' + nroTramite).val()) {

                    if ($('#comboLegajo_' + nroTramite).val().trim()) {

                        var observacionDate = utilityService.formatDate(new Date(),null);
                        var observacionUser =
                            {
                                IdUsuario: $rootScope.user.IdUsuario,
                                Username: $rootScope.user.username
                            };

                        var observacionText = workflowService.formatTramiteObservacion(observacionDate, observacionUser, $('#comboLegajo_' + nroTramite).val());

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

                            // Abrir popup de observaciones al generar una nueva
                            if (response.data) {
                                $('#comboLegajo_' + nroTramite).val('');
                                for (var i in consultaTramitesController.tramiteListData) {
                                    var actualTramiteData = consultaTramitesController.tramiteListData[i];
                                    if (actualTramiteData.NroTramite == nroTramite) {
                                        consultaTramitesController.tramiteListData[i].Observaciones =
                                            '<div class="row" id="div_observacion_consulta_' + actualTramiteData.NroTramite + ' ">' +
                                            '<div class="col-sm-9">' +
                                            '<input class=" form-control" id="comboLegajoConsulta_' + actualTramiteData.NroTramite + '" onkeypress="submitObservacion(' + actualTramiteData.NroTramite + ',' + nroTarea + ')"/>' +
                                            '</div>' +
                                            '<div id="tooltipConsulta_' + actualTramiteData.NroTramite + '" class="col-sm-2"  data-toggle="tooltip" data-placement="left" data-html="true" title="' + response.data[0].Texto + '">' +
                                            '<i class="fa fa-comments-o bootstrap-data-comment-button"' + (response.data[0].Texto ? 'style="background-color:#337ab7;"' : '')+ ' aria-hidden="true"></i>' +
                                            '</div>' +
                                            '</div>';
                                    }
                                }

                                $('#consultaDeTramite_ResultTable').bootstrapTable();
                                $('#consultaDeTramite_ResultTable').bootstrapTable('load', {
                                    data: consultaTramitesController.tramiteListData
                                });

                                $('[data-toggle="tooltip"]').tooltip();

                                var iterGrid = 0;
                                for (j in consultaTramitesController.tramiteListData) {
                                    var actualTareaInstanciaConsultaPrioridad = consultaTramitesController.tramiteListData[j];
                                    // Establecer combo de prioridad
                                    if (actualTareaInstanciaConsultaPrioridad.Prioridad) {
                                        $("#selectPrioridadConsulta" + iterGrid).val(actualTareaInstanciaConsultaPrioridad.Prioridad);
                                        iterGrid++;
                                    }
                                    else {
                                        actualTareaInstanciaConsulta.Prioridad =
                                            '<select class="input-large form-control" ng-options="tramite.Descripcion for tramite in vm.tramiteList" ng-model="vm.tramiteSelected"> ' +
                                            '<option></option> ' +
                                            '</select>';
                                    }
                                }
                            }
                        };
                        process_createUpdateObservacion_request({ Texto: observacionText, IdInstanciaTramite: nroTramite, IdEstadoInstancia: nroTarea, IdUsuarioAsignado: consultaTramitesController.usuarioAsignadoIdUsuario });
                    }

                }

                //alert('You pressed a "enter" key in textbox, here submit your form'); 
            }
        }

        // Setting intervals (for demo only)
        //setInterval(consultaTramitesController.loadTareaList, 30000);
    });


function prioridadFormatterConsulta(value, row, index, field) {
    var selectByValue = function (option, value) {
        if (option == value)
            return 'selected'
        else
            return '';
    }
    return '<select id="selectPrioridadConsulta' + index + '" disabled="true" class="input-large form-control" onchange="changeSelectPrioridad(' + index + ')">' +
        '<option value=1 ' + selectByValue(1, row.valorPrioridad) + '>Baja</option>' +
        '<option value=2 ' + selectByValue(2, row.valorPrioridad) + '>Media</option>' +
        '<option value=3 ' + selectByValue(3, row.valorPrioridad) + '>Alta</option>' +
        '<option value=4 ' + selectByValue(4, row.valorPrioridad) + '>Urgente</option>' +
        '</select>';
}

