angular.module('app')  
  .controller('gestionarUnTramiteController_Administrativo', function ($scope, $rootScope, $location, Auth, $uibModal, utilityService, $cookies, workflowService) {

    var gestionarUnTramiteController = this;
    
    // Setting various
    gestionarUnTramiteController.alumnoNameByLegajo = '';
    gestionarUnTramiteController.idUsuario = 0;
    gestionarUnTramiteController.idGrupoAsignado = 0;

    // Setting lists
    gestionarUnTramiteController.tramiteList = [];
    gestionarUnTramiteController.tramiteInstanciaList = [];

    // Setting selected items
    gestionarUnTramiteController.selectedTramite = null;
    gestionarUnTramiteController.legajo = '';

    // Setting text items    
    gestionarUnTramiteController.legajoSearchText = null;

    // Setting validation items
    gestionarUnTramiteController.validLegajo = null;

    gestionarUnTramiteController.init = function () {

        Auth.tokenCookieExists();          
        gestionarUnTramiteController.getGrupoAsignadoByUsername();

        $('#myModal').on('shown.bs.modal', function () {
            $('#myInput').focus()
        })

    };

    gestionarUnTramiteController.getGrupoAsignadoByUsername = function() {
        var process_getGrupoAsignadoByUsername_request = function(){
            utilityService.callSecureHttp({
                method: "GET", 
                url: "secure-api/TraGrupoUsuarios/GetGrupoAsignadoByUsername/" + $rootScope.user.username, 
                callbackSuccess: success_getGrupoAsignadoByUsername_request, 
                callbackError: success_getGrupoAsignadoByUsername_request,
                token: $cookies.get('token')
            });
        };

        var success_getGrupoAsignadoByUsername_request = function(response){
            if(response && response.data){
                gestionarUnTramiteController.idUsuario = response.data[0].IdUsuario;
                gestionarUnTramiteController.idGrupoAsignado = response.data[0].IdGrupo;                
            }

            
            gestionarUnTramiteController.loadLists();
        };

        process_getGrupoAsignadoByUsername_request();
    }

    gestionarUnTramiteController.loadLists = function() {
        gestionarUnTramiteController.gettramiteInstanciaList();
        gestionarUnTramiteController.getTramiteList();
    };

    gestionarUnTramiteController.getEstadoInstanciaList = function(){
        
        // Solicito la información de la primera tarea de un trámite
        var process_getEstadoInstanciaByGrupoAsignadoAndIdUsuario_request = function(){
            utilityService.callSecureHttp({
                method: "GET", 
                url: "secure-api/TraEstadoInstancia/GetEstadoInstanciaByGrupoAsignadoAndIdUsuario/" + gestionarUnTramiteController.idGrupoAsignado + "/" + gestionarUnTramiteController.idUsuario,
                callbackSuccess: success_getEstadoInstanciaByGrupoAsignadoAndIdUsuario_Request, 
                callbackError: success_getEstadoInstanciaByGrupoAsignadoAndIdUsuario_Request,
                token: $cookies.get('token')
            });
        };

        var success_getEstadoInstanciaByGrupoAsignadoAndIdUsuario_Request = function(response){
            gestionarUnTramiteController.estadoInstanciaList = response.data;

            for(index in gestionarUnTramiteController.estadoInstanciaList){

                var actualItem = gestionarUnTramiteController.estadoInstanciaList[index];
                actualItem.Ver = '<i class="fa fa-arrow-circle-right fa-lg bootstrap-data-detail" onclick="loadTramiteDetailContent(' + index + ')" ></i>';
            }
    
            $('#gestionarUnTramite_ResultTable').bootstrapTable({
                data: gestionarUnTramiteController.estadoInstanciaList
            });
        };
        process_getEstadoInstanciaByGrupoAsignadoAndIdUsuario_request();      
    };

    gestionarUnTramiteController.getCarreraList = function(){
        setTimeout(function () {
            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/UniEscuela/GetAll",
                callbackSuccess: gestionarUnTramiteController.getCarreraListCallback
            });
        }, 1000);
    };
    
    gestionarUnTramiteController.getCarreraListCallback = function(response){
        if(response){
            gestionarUnTramiteController.carreraList = response.data;
        }
    };

    gestionarUnTramiteController.getTramiteList = function(){
        setTimeout(function () {
            utilityService.callSecureHttp({
                method: "GET", 
                url: "secure-api/TraTramite/GetAll", 
                callbackSuccess: gestionarUnTramiteController.getTramiteListCallback
            });
       }, 2000);
    };
    
    gestionarUnTramiteController.getTramiteListCallback = function(response){
        if(response){
            gestionarUnTramiteController.tramiteList = response.data;
        }
    };

    gestionarUnTramiteController.cleanLegajoAndCarreraText = function(){
        gestionarUnTramiteController.alumnoNameByLegajo = '';
        gestionarUnTramiteController.carreraSelected = '';
        gestionarUnTramiteController.alumnoSelected = undefined;
    };

    gestionarUnTramiteController.validateLegajo = function(){

        if(gestionarUnTramiteController.legajoSearchText){
            var legajo = gestionarUnTramiteController.legajoSearchText;

            var process_validateLegajo_request = function(legajo){
                setTimeout(function () {
                    utilityService.callSecureHttp({
                        method: "GET", 
                        url: "secure-api/UniAlumno/ValidateLegajo/" + gestionarUnTramiteController.legajoSearchText, 
                        callbackSuccess: success_validateLegajo_request, 
                        callbackError: success_validateLegajo_request,
                        token: $cookies.get('token')
                    });
                }, 1000);
            };

            var success_validateLegajo_request = function(response){
                if(response && response.data){
                    var jsonRes = response.data;
                    if(jsonRes){
                        gestionarUnTramiteController.alumnoSelected = jsonRes;
                        gestionarUnTramiteController.alumnoNameByLegajo = jsonRes.Nombre + ' ' + jsonRes.Apellido;
                        gestionarUnTramiteController.carreraSelected = '(' + jsonRes.Carrera + ') ' + jsonRes.CarreraNombre;

                        return;
                    }
                    else{
                        gestionarUnTramiteController.alumnoNameByLegajo = '';
                        gestionarUnTramiteController.carreraSelected = '';
                        gestionarUnTramiteController.alumnoSelected = undefined;
                    }
                    gestionarUnTramiteController.validLegajo = false;
                }
                else{
                    gestionarUnTramiteController.alumnoNameByLegajo = 'Alumno no encontrado';
                    gestionarUnTramiteController.carreraSelected = '';
                    gestionarUnTramiteController.alumnoSelected = undefined;

                }
            };

            process_validateLegajo_request(legajo);
        }
        else{
            gestionarUnTramiteController.alumnoNameByLegajo = '';
            gestionarUnTramiteController.carreraSelected = '';
            gestionarUnTramiteController.alumnoSelected = undefined;
        }
        
    };

    gestionarUnTramiteController.createInstanciaTramite = function(){

        var instanciaTramiteData = {};

        if(gestionarUnTramiteController.alumnoSelected && gestionarUnTramiteController.tramiteSelected){

            instanciaTramiteData.IdTramite = gestionarUnTramiteController.tramiteSelected.IdTramite; 
            
            var auxDate = new Date();
            var fechaComienzo = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(), 
                                                        (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());
            
            instanciaTramiteData.FechaComienzo = fechaComienzo;
            auxDate = new Date();
            var fechaFin = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(), 
                                                        (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());
            

            instanciaTramiteData.FechaFin = fechaFin;
            instanciaTramiteData.Legajo = gestionarUnTramiteController.alumnoSelected.LegajoProvisorio;

            var process_createInstanciaTramite_request = function(data){
                utilityService.callSecureHttp({
                    method: "POST", 
                    url: "secure-api/TraInstanciaTramite/create", 
                    data: data,
                    callbackSuccess: success_createInstanciaTramite_Request, 
                    callbackError: success_createInstanciaTramite_Request
                });
            };
    
            var success_createInstanciaTramite_Request = function(response){
                if(response.data){
                    var createdInstanciaTramite = response.data[0];

                    workflowService.getEstadoInicialByIdTramite("gchervet", createdInstanciaTramite.IdTramite, createdInstanciaTramite);
                    gestionarUnTramiteController.gettramiteInstanciaList();

                }
            };
    
            process_createInstanciaTramite_request(instanciaTramiteData);            
        }
        else{
            utilityService.showMessage({
                messageType: 2,
                messageTitle: "Error",
                message: "Verificar que el alumno y el tipo de trámite se encuentren seleccionados."
            });
            return;

        }
        
    };

    gestionarUnTramiteController.openTramiteModal = function(){
        gestionarUnTramiteController.createInstanciaTramite();
    };

})