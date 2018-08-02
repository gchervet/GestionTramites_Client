angular.module("app")
    .factory('workflowService', ['$http', '$rootScope', '$uibModal', '$q', '$filter', '$interval', 'myUrl', '$cookies', 'utilityService', '$uibModal',
        function workflowService($http, $rootScope, $uibModal, $q, $filter, $interval, myUrl, $cookies, utilityService, $uibModal) {
            var service = {
                getTipoUsuarioByUsername: getTipoUsuarioByUsername,
                getEstadoInicialByIdTramite: getEstadoInicialByIdTramite,
                openTramiteModal: openTramiteModal,
                getEstadoInstanciaById: getEstadoInstanciaById,
                createEstadoInstancia: createEstadoInstancia,
                getNextEstadoByIdEstadoActual: getNextEstadoByIdEstadoActual,
                getEstadoInstanciaByGrupoAsignadoAndIdUsuario: getEstadoInstanciaByGrupoAsignadoAndIdUsuario,
                updateInstanciaEstado: updateInstanciaEstado,
                checkForPendingEstadoInstanciasByIdInstanciaTramite: checkForPendingEstadoInstanciasByIdInstanciaTramite,
                getTipoPrioridadList: getTipoPrioridadList,
                formatTramiteObservacion: formatTramiteObservacion,
                getFirstEstadoDefinicion: getFirstEstadoDefinicion,
                getNextEstadoByIdEstadoActualP: getNextEstadoByIdEstadoActualP,
                getInstanciaTramiteById: getInstanciaTramiteById
            };

            return service;

            /* Buscar el tipo de usuario según username */
            function getTipoUsuarioByUsername(username) {
                return new Promise(function (resolve, reject) {
                    var process_getTipoUsuarioByUsername_request = function () {
                        utilityService.callHttp({
                            method: "GET",
                            url: "api/TraUsuarioAsignado/GetUsuarioInfoByUsername/" + username,
                            callbackSuccess: success_getTipoUsuarioByUsername_request,
                            callbackError: success_getTipoUsuarioByUsername_request
                        });
                    };

                    var success_getTipoUsuarioByUsername_request = function (response) {
                        if (response && response.data) {
                            resolve(response.data);
                        }
                        resolve(null);
                    };
                    process_getTipoUsuarioByUsername_request();
                })
            }

            /* Busca la primera tarea de un trámite dado */
            function getEstadoInicialByIdTramite(username, idTramite, idUsuario, createdInstanciaTramite, createdInstanciaEstado) {

                return new Promise(function (resolve, reject) {
                    // Solicito la información de la primera tarea de un trámite
                    var process_getEstadoInicialByIdTramite_request = function () {
                        utilityService.callSecureHttp({
                            method: "GET",
                            url: "secure-api/TraEstadoDefinicion/GetEstadoInicialByIdTramite/" + idTramite,
                            callbackSuccess: success_getEstadoInicialByIdTramite_Request,
                            callbackError: success_getEstadoInicialByIdTramite_Request,
                            token: $cookies.get('token')
                        });
                    };

                    var success_getEstadoInicialByIdTramite_Request = function (response) {
                        if (response && response.data[0]) {
                            var firstTarea = response.data[0];
                            var idEstadoEstado = 0;
                            createdInstanciaEstado.ShowModal = false;

                            if (firstTarea.GrupoAsignado && firstTarea.GrupoAsignado.UsuarioList) {

                                var usernameIsInGrupoUsuarioList = false;
                                for (i in firstTarea.GrupoAsignado.UsuarioList) {
                                    var actualUsuario = firstTarea.GrupoAsignado.UsuarioList[i];

                                    if (actualUsuario.Username == username) {
                                        usernameIsInGrupoUsuarioList = true;
                                        idEstadoEstado = 1; // EstadoEstado Iniciado
                                        break;
                                    }
                                }
                                if (usernameIsInGrupoUsuarioList) {
                                    // Abrir modal
                                    createdInstanciaEstado.Username = username;
                                    createdInstanciaEstado.IdUsuario = idUsuario;
                                    createdInstanciaEstado.Pantalla = firstTarea.Pantalla;
                                    createdInstanciaEstado.ShowModal = true;
                                    //openTramiteModal(createdInstanciaEstado);
                                }
                                createdInstanciaEstado.Pantalla = firstTarea.Pantalla;
                                resolve(createdInstanciaEstado);
                            }
                        }
                        resolve(null);
                    };
                    process_getEstadoInicialByIdTramite_request();
                })
            }

            /* Obtiene los tramites correspondientes a la bandeja de un grupo/usuario */
            function getEstadoInstanciaByGrupoAsignadoAndIdUsuario(idGrupoAsignado, idUsuario) {

                // Solicito la información de la primera tarea de un trámite
                var process_getEstadoInstanciaByGrupoAsignadoAndIdUsuario_request = function () {
                    utilityService.callSecureHttp({
                        method: "GET",
                        url: "secure-api/TraEstadoInstancia/GetEstadoInstanciaByGrupoAsignadoAndIdUsuario/" + idGrupoAsignado + "/" + idUsuario,
                        callbackSuccess: success_getEstadoInstanciaByGrupoAsignadoAndIdUsuario_Request,
                        callbackError: success_getEstadoInstanciaByGrupoAsignadoAndIdUsuario_Request,
                        token: $cookies.get('token')
                    });
                };

                var success_getEstadoInstanciaByGrupoAsignadoAndIdUsuario_Request = function (response) {
                    return response.data;
                };
                process_getEstadoInstanciaByGrupoAsignadoAndIdUsuario_request();
            }

            /* Guarda la instancia de Estado/Tarea */
            function createEstadoInstancia(idUsuario, idEstado, idTramite, idInstanciaTramite, idEstadoEstado, prioridad, fechaComienzo, fechaFin, fechaEntradaBandeja, valoresEntrada, valoresSalida) {

                var traInstanciaTramiteDTO = {
                    IdInstanciaTramite: idInstanciaTramite,
                    IdEstadoDefinicion: idEstado,
                    IdAsignadoUsuario: idUsuario,
                    FechaEntradaBandeja: fechaEntradaBandeja,
                    Comienzo: fechaComienzo,
                    Fin: fechaFin,
                    EstadoEstado: idEstadoEstado,
                    ValoresEntrada: valoresEntrada,
                    ValoresSalida: valoresSalida,
                    Prioridad: prioridad
                }

                return new Promise(function (resolve, reject) {
                    // Solicito la información de la primera tarea de un trámite
                    var process_createEstadoInstancia_request = function () {
                        utilityService.callSecureHttp({
                            method: "POST",
                            url: "secure-api/TraEstadoInstancia/Create",
                            data: traInstanciaTramiteDTO,
                            callbackSuccess: success_createEstadoInstancia_Request,
                            callbackError: success_createEstadoInstancia_Request,
                            token: $cookies.get('token')
                        });
                    };

                    var success_createEstadoInstancia_Request = function (response) {
                        resolve(response.data);
                    };
                    process_createEstadoInstancia_request();

                })
            }

            /* Abre un nuevo modal si el trámite lo requiere */
            function getEstadoInstanciaById(idEstadoInstancia) {

                return new Promise(function (resolve, reject) {
                    // Solicito la información de la primera tarea de un trámite
                    var process_createEstadoInstancia_request = function () {
                        utilityService.callSecureHttp({
                            method: "GET",
                            url: "secure-api/TraEstadoInstancia/GetByIdEstadoInstancia/" + idEstadoInstancia,
                            callbackSuccess: success_createEstadoInstancia_Request,
                            callbackError: success_createEstadoInstancia_Request
                        });
                    };

                    var success_createEstadoInstancia_Request = function (response) {
                        resolve(response.data);
                    };
                    process_createEstadoInstancia_request();

                })
            }

            function getNextEstadoByIdEstadoActual(idEstadoActual, generateNextEstados, tramiteData) {

                var tramiteData = tramiteData;
                try {
                    var valoresEntrada = JSON.parse(tramiteData.ValoresEntrada);
                }
                catch (error) {
                    var valoresEntrada = null;
                }
                /*
                try {
                    var valoresSalida = JSON.parse(tramiteData.ValoresSalida);
                    for (var i in Object.entries(valoresSalida)) {
                        var entryList = Object.entries(valoresSalida)[i];
                        if(isNaN(Object.entries(valoresSalida)[i][1])){
                            eval("var " + Object.entries(valoresSalida)[i][0] + " = '" + Object.entries(valoresSalida)[i][1] + "';")
                        }
                        else{
                            eval("var " + Object.entries(valoresSalida)[i][0] + " = " + Object.entries(valoresSalida)[i][1] + ";")
                        }
                    }
                }
                catch (error) {
                    var valoresSalida = null;
                }
                */
                // Solicito la información de la primera tarea de un trámite
                var process_getNextEstadoByIdEstadoActual_request = function () {
                    utilityService.callSecureHttp({
                        method: "GET",
                        url: "secure-api/TraEstadoDefinicion/GetNextEstadosByIdEstadoActual/" + idEstadoActual,
                        callbackSuccess: success_getNextEstadoByIdEstadoActual_Request,
                        callbackError: success_getNextEstadoByIdEstadoActual_Request
                    });
                };

                var success_getNextEstadoByIdEstadoActual_Request = function (response) {

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
                    };

                    var rtn = [];
                    if (response && response.data) {

                        var defaultCondicionList = [];
                        var generateDefaultEstados = true;
                        for (i in response.data) {

                            var actualEstadoSiguiente = response.data[i];
                            var idEstadoEstado = 0;
                            var prioridad = tramiteData.PrioridadEstadoInstancia;
                            try {
                                var valoresSalida = JSON.parse(tramiteData.ValoresSalida);
                                for (var i in Object.entries(valoresSalida)) {
                                    var entryList = Object.entries(valoresSalida)[i];
                                    if (isNaN(Object.entries(valoresSalida)[i][1])) {
                                        eval("var " + Object.entries(valoresSalida)[i][0] + " = '" + Object.entries(valoresSalida)[i][1] + "';")
                                    }
                                    else {
                                        eval("var " + Object.entries(valoresSalida)[i][0] + " = " + Object.entries(valoresSalida)[i][1] + ";")
                                    }
                                }
                            }
                            catch (error) {
                                var valoresSalida = null;
                            }

                            if (typeof express !== 'undefined') //si detecta que es express, la prioridad del trámite debería cambiar a 4 (URGENTE)
                                if (express) { //si detecta que es express, la prioridad de los estados deberían cambiar a 4, contando también el estado inicial (URGENTE)
                                    prioridad = 4;
                                    var estadoInicial = new Object();
                                    estadoInicial.IdEstadoInstancia = tramiteData.IdEstadoInstancia;
                                    estadoInicial.Prioridad = prioridad;
                                    updateInstanciaEstado(estadoInicial);
                                }

                            if (actualEstadoSiguiente.Condicion) {

                                // 1. conseguir los valores de salida del estado actual
                                // 2. chequear por default, si es default agregarlo a un array aparte y NO evaluarlo hasta el final
                                if (actualEstadoSiguiente.Condicion.toUpperCase() == 'DEFAULT') {
                                    defaultCondicionList.push(actualEstadoSiguiente);
                                }
                                else {
                                    try {
                                        if (eval(actualEstadoSiguiente.Condicion) === true) {
                                            // Se cumple la condición del próximo estado (CASO 1)
                                            if (generateNextEstados) {
                                                createEstadoInstancia(null, //idUsuario
                                                    actualEstadoSiguiente.IdEstadoSiguiente,  //idEstado
                                                    actualEstadoSiguiente.IdTramite, //idTramite
                                                    tramiteData.IdInstanciaTramite, // idInstanciaTramite
                                                    idEstadoEstado, //idEstadoEstado
                                                    prioridad, //Prioridad
                                                    null, //
                                                    null, //fechaFin
                                                    new Date(), //fechaEntradaBandeja
                                                    JSON.stringify(valoresSalida), //valoresEntrada
                                                    JSON.stringify(valoresSalida) //valoresSalida
                                                );
                                            }
                                            rtn.push(actualEstadoSiguiente);

                                            // Al cumplirse una de las condiciones necesarias, no se generan los estados default
                                            generateDefaultEstados = false;
                                        }
                                    } catch (e) {
                                        if (e instanceof SyntaxError) {
                                            alert(e.message);
                                        }
                                    }
                                }
                            }
                            else {

                                // La condición es NULL, se generan los estados siguientes (CASO 3)
                                if (generateNextEstados) {
                                    createEstadoInstancia(null, //idUsuario
                                        actualEstadoSiguiente.IdEstadoSiguiente,  //idEstado
                                        actualEstadoSiguiente.IdTramite, //idTramite
                                        tramiteData.IdInstanciaTramite, // idInstanciaTramite
                                        idEstadoEstado, //idEstadoEstado
                                        prioridad, //Prioridad
                                        null, //
                                        null, //fechaFin
                                        new Date(), //fechaEntradaBandeja
                                        JSON.stringify(valoresSalida), //valoresEntrada
                                        JSON.stringify(valoresSalida) //valoresSalida
                                    );
                                }
                                rtn.push(actualEstadoSiguiente);
                            }
                        }

                        var obj = new Object();
                        obj.IdTramite = tramiteData.IdInstanciaTramite;
                        if (typeof express !== 'undefined') //si detecta que es express, la prioridad del trámite debería cambiar a 4 (URGENTE)
                            if (express)
                                obj.Prioridad = 4;
                        var jsonStringIdInstanciaTramite = JSON.stringify(obj);
                        process_updateInstanciaTramite_request(jsonStringIdInstanciaTramite);

                        // Si se debe chequear por defaults, se agregan mediante el array auxiliar defaultCondicionList (CASO 2)
                        if (generateDefaultEstados) {
                            for (var i in defaultCondicionList) {
                                var actualDefaultCondicion = defaultCondicionList[i];

                                if (generateNextEstados) {
                                    createEstadoInstancia(null, //idUsuario
                                        actualDefaultCondicion.IdEstadoSiguiente,  //idEstado
                                        actualDefaultCondicion.IdTramite, //idTramite
                                        tramiteData.IdInstanciaTramite, // idInstanciaTramite
                                        idEstadoEstado, //idEstadoEstado
                                        prioridad, //Prioridad
                                        null, //
                                        null, //fechaFin
                                        new Date(), //fechaEntradaBandeja
                                        JSON.stringify(valoresSalida), //valoresEntrada
                                        JSON.stringify(valoresSalida) //valoresSalida
                                    );
                                }
                                rtn.push(actualDefaultCondicion);
                            }
                        }
                    }
                    return rtn;
                };
                process_getNextEstadoByIdEstadoActual_request();
            }



            function getNextEstadoByIdEstadoActualP(idEstadoActual, generateNextEstados, tramiteData) {
                return new Promise(function (resolve, reject) {
                    var tramiteData2 = tramiteData;
                    try {
                        var valoresEntrada = JSON.parse(tramiteData.ValoresEntrada);
                    }
                    catch (error) {
                        var valoresEntrada = null;
                    }

                    // Solicito la información de la primera tarea de un trámite
                    var process_getNextEstadoByIdEstadoActual_request = function () {
                        utilityService.callSecureHttp({
                            method: "GET",
                            url: "secure-api/TraEstadoDefinicion/GetNextEstadosByIdEstadoActual/" + idEstadoActual,
                            callbackSuccess: success_getNextEstadoByIdEstadoActual_Request,
                            callbackError: success_getNextEstadoByIdEstadoActual_Request
                        });
                    };

                    var success_getNextEstadoByIdEstadoActual_Request = function (response) {

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
                            resolve(response);
                        };

                        var rtn = [];
                        if (response && response.data) {

                            var defaultCondicionList = [];
                            var generateDefaultEstados = true;
                            for (i in response.data) {

                                var actualEstadoSiguiente = response.data[i];
                                var idEstadoEstado = 0;
                                var prioridad = tramiteData.PrioridadEstadoInstancia;
                                try {
                                    var valoresSalida = JSON.parse(tramiteData.ValoresSalida);
                                    for (var i in Object.entries(valoresSalida)) {
                                        var entryList = Object.entries(valoresSalida)[i];
                                        if (isNaN(Object.entries(valoresSalida)[i][1])) {
                                            eval("var " + Object.entries(valoresSalida)[i][0] + " = '" + Object.entries(valoresSalida)[i][1] + "';")
                                        }
                                        else {
                                            eval("var " + Object.entries(valoresSalida)[i][0] + " = " + Object.entries(valoresSalida)[i][1] + ";")
                                        }
                                    }
                                }
                                catch (error) {
                                    var valoresSalida = null;
                                }

                                if (typeof express !== 'undefined') //si detecta que es express, la prioridad del trámite debería cambiar a 4 (URGENTE)
                                    if (express) { //si detecta que es express, la prioridad de los estados deberían cambiar a 4, contando también el estado inicial (URGENTE)
                                        prioridad = 4;
                                        var estadoInicial = new Object();
                                        estadoInicial.IdEstadoInstancia = tramiteData.IdEstadoInstancia;
                                        estadoInicial.Prioridad = prioridad;
                                        updateInstanciaEstado(estadoInicial);
                                    }

                                if (actualEstadoSiguiente.Condicion) {

                                    // 1. conseguir los valores de salida del estado actual
                                    // 2. chequear por default, si es default agregarlo a un array aparte y NO evaluarlo hasta el final
                                    if (actualEstadoSiguiente.Condicion.toUpperCase() == 'DEFAULT') {
                                        defaultCondicionList.push(actualEstadoSiguiente);
                                    }
                                    else {
                                        try {
                                            if (eval(actualEstadoSiguiente.Condicion) === true) {
                                                // Se cumple la condición del próximo estado (CASO 1)
                                                if (generateNextEstados) {
                                                    createEstadoInstancia(null, //idUsuario
                                                        actualEstadoSiguiente.IdEstadoSiguiente,  //idEstado
                                                        actualEstadoSiguiente.IdTramite, //idTramite
                                                        tramiteData.IdInstanciaTramite, // idInstanciaTramite
                                                        idEstadoEstado, //idEstadoEstado
                                                        prioridad, //Prioridad
                                                        null, //
                                                        null, //fechaFin
                                                        new Date(), //fechaEntradaBandeja
                                                        JSON.stringify(valoresSalida), //valoresEntrada
                                                        JSON.stringify(valoresSalida) //valoresSalida
                                                    );
                                                }
                                                rtn.push(actualEstadoSiguiente);

                                                // Al cumplirse una de las condiciones necesarias, no se generan los estados default
                                                generateDefaultEstados = false;
                                            }
                                        } catch (e) {
                                            if (e instanceof SyntaxError) {
                                                alert(e.message);
                                            }
                                        }
                                    }
                                }
                                else {

                                    // La condición es NULL, se generan los estados siguientes (CASO 3)
                                    if (generateNextEstados) {
                                        createEstadoInstancia(null, //idUsuario
                                            actualEstadoSiguiente.IdEstadoSiguiente,  //idEstado
                                            actualEstadoSiguiente.IdTramite, //idTramite
                                            tramiteData.IdInstanciaTramite, // idInstanciaTramite
                                            idEstadoEstado, //idEstadoEstado
                                            prioridad, //Prioridad
                                            null, //
                                            null, //fechaFin
                                            new Date(), //fechaEntradaBandeja
                                            JSON.stringify(valoresSalida), //valoresEntrada
                                            JSON.stringify(valoresSalida) //valoresSalida
                                        );
                                    }
                                    rtn.push(actualEstadoSiguiente);
                                }
                            }

                            var obj = new Object();
                            obj.IdTramite = tramiteData.IdInstanciaTramite;
                            if (typeof express !== 'undefined') //si detecta que es express, la prioridad del trámite debería cambiar a 4 (URGENTE)
                                if (express)
                                    obj.Prioridad = 4;
                            var jsonStringIdInstanciaTramite = JSON.stringify(obj);
                            process_updateInstanciaTramite_request(jsonStringIdInstanciaTramite);

                            // Si se debe chequear por defaults, se agregan mediante el array auxiliar defaultCondicionList (CASO 2)
                            if (generateDefaultEstados) {
                                for (var i in defaultCondicionList) {
                                    var actualDefaultCondicion = defaultCondicionList[i];

                                    if (generateNextEstados) {
                                        createEstadoInstancia(null, //idUsuario
                                            actualDefaultCondicion.IdEstadoSiguiente,  //idEstado
                                            actualDefaultCondicion.IdTramite, //idTramite
                                            tramiteData.IdInstanciaTramite, // idInstanciaTramite
                                            idEstadoEstado, //idEstadoEstado
                                            prioridad, //Prioridad
                                            null, //
                                            null, //fechaFin
                                            new Date(), //fechaEntradaBandeja
                                            JSON.stringify(valoresSalida), //valoresEntrada
                                            JSON.stringify(valoresSalida) //valoresSalida
                                        );
                                    }
                                    rtn.push(actualDefaultCondicion);
                                }
                            }
                        }
                        // return rtn;
                    };
                    process_getNextEstadoByIdEstadoActual_request();
                });
            }




            /* Abre un nuevo modal si el trámite lo requiere */
            function openTramiteModal(instanciaTarea) {
                return new Promise(function (resolve, reject) {
                    try {
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: 'app/components/gestionDeTramites/modal/' + instanciaTarea.Pantalla.NombrePantalla + '.html',
                            controller: instanciaTarea.Pantalla.NombrePantalla + 'Controller as vm',
                            size: 'lg',
                            backdrop: false,
                            resolve: {
                                data: function () {
                                    return instanciaTarea;
                                }
                            }
                        });
                        modalInstance.result.then(
                            function (result) { resolve(result); },
                            function (result) { resolve(result); }
                        );
                    }
                    catch (e) {
                        utilityService.showMessage({
                            messageType: 2,
                            messageTitle: "Error",
                            message: "Verificar que el alumno y el tipo de trámite se encuentren seleccionados."
                        });
                        return;
                    }

                })
            }

            /* Deserializa el json de condición para el estado siguiente */
            function serializeCondicionJSON(jsonString) {
                return JSON.parse(jsonString);
            }

            /* Abre un nuevo modal si el trámite lo requiere */
            function updateInstanciaEstado(estadoInstanciaData) {

                return new Promise(function (resolve, reject) {
                    // Solicito la información de la primera tarea de un trámite
                    var process_updateInstanciaEstado_request = function () {
                        utilityService.callSecureHttp({
                            method: "POST",
                            url: "secure-api/TraEstadoInstancia/Update",
                            data: estadoInstanciaData,
                            callbackSuccess: success_updateInstanciaEstado_Request,
                            callbackError: success_updateInstanciaEstado_Request,
                            token: $cookies.get('token')
                        });
                    };

                    var success_updateInstanciaEstado_Request = function (response) {
                        resolve(response.data);
                    };
                    process_updateInstanciaEstado_request();

                })
            }

            /* Abre un nuevo modal si el trámite lo requiere */
            function checkForPendingEstadoInstanciasByIdInstanciaTramite(idInstanciaTramite) {

                return new Promise(function (resolve, reject) {
                    // Solicito la información de la primera tarea de un trámite
                    var process_checkForPendingEstadoInstancias_request = function () {

                        utilityService.callSecureHttp({
                            method: "GET",
                            url: "secure-api/TraEstadoInstancia/GetPendingEstadosInstanciaByIdEstadoInstancia/" + idInstanciaTramite,
                            callbackSuccess: success_checkForPendingEstadoInstancias_Request,
                            callbackError: success_checkForPendingEstadoInstancias_Request
                        });
                    };

                    var success_checkForPendingEstadoInstancias_Request = function (response) {
                        resolve(response.data);
                    };
                    process_checkForPendingEstadoInstancias_request();

                })
            }

            function getTipoPrioridadList() {
                return new Promise(function (resolve, reject) {
                    var process_getAllTraTipoPrioridad_request = function () {

                        utilityService.callSecureHttp({
                            method: "GET",
                            url: "secure-api/TraTipoPrioridad/GetAll",
                            callbackSuccess: success_getAllTraTipoPrioridad_request,
                            callbackError: success_getAllTraTipoPrioridad_request
                        });
                    };

                    var success_getAllTraTipoPrioridad_request = function (response) {
                        resolve(response.data);
                    };
                    process_getAllTraTipoPrioridad_request();
                })
            }

            function formatTramiteObservacion(dateString, userData, observacionText) {

                return '' +
                    '<p>' + dateString + '</p>' +
                    '<p>' + userData.Username + '</p>' +
                    '<div>' + observacionText + '</div>' +
                    '<p>----------------------</p>';
            }

            function getFirstEstadoDefinicion(idTramite) {
                return new Promise(function (resolve, reject) {
                    var process_getEstadoInicialByIdTramite_request = function () {
                        utilityService.callSecureHttp({
                            method: "GET",
                            url: "secure-api/TraEstadoDefinicion/GetEstadoInicialByIdTramite/" + idTramite,
                            callbackSuccess: function (response) {
                                resolve(response.data);
                            },
                            callbackError: function (response) {
                                resolve(response.data);
                            },
                            token: $cookies.get('token')
                        });
                    };

                    var success_getEstadoInicialByIdTramite_request = function (response) {
                        resolve(response.data);
                    };

                    process_getEstadoInicialByIdTramite_request();
                });
            }

            function getInstanciaTramiteById(idInstanciaTramite) {
                return new Promise(function (resolve, reject) {
                    var success_getEstadoInicialByIdTramite_request = function (response) {
                        resolve(response.data);
                    };

                    var process_getInstanciaTramiteById_request = function () {
                        utilityService.callSecureHttp({
                            method: "GET",
                            url: "secure-api/TraInstanciaTramite/GetByIdInstanciaTramite/" + idInstanciaTramite,
                            callbackSuccess: success_getEstadoInicialByIdTramite_request,
                            callbackError: success_getEstadoInicialByIdTramite_request,
                            token: $cookies.get('token')
                        });
                    };

                    process_getInstanciaTramiteById_request();
                });
            }

        }]);