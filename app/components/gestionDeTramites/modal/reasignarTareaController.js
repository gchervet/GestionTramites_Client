angular.module('app')  
.controller('reasignarTareaController', function ($scope, $rootScope, $location, Auth, $uibModal, utilityService, $routeParams, $uibModalInstance, data) {

    var reasignarTareaController = this;
    reasignarTareaController.selectedUsuario = null;

    reasignarTareaController.init = function () {

        Auth.tokenCookieExists();        
        $scope.records = [];

        reasignarTareaController.getGrupoUsuarios(data.nroTarea);
    };

    reasignarTareaController.getGrupoUsuarios = function(nroTarea){
        
        request_getGrupoUsuarios_process = function(){
            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/TraEstadoInstancia/GetPossibleAssignationUsuarios/" + nroTarea,
                callbackSuccess: request_getGrupoUsuarios_success,
                callbackError: request_getGrupoUsuarios_success
            });
        }      

        request_getGrupoUsuarios_success = function(response){
            if(response.data){
                for(var i in response.data){
                    var actualUsuario = response.data[i];

                    if(actualUsuario.IdUsuarioAsignado != $rootScope.user.IdUsuario){
                        var usuarioToAdd = {};
                        
                        usuarioToAdd.IdUsuarioAsignado = actualUsuario.IdUsuarioAsignado;
                        usuarioToAdd.Email = actualUsuario.Email;
                        usuarioToAdd.GrupoAsignado = 'Grupo: ' + actualUsuario.NombreGrupo;
                        usuarioToAdd.IdGrupo = actualUsuario.IdGrupo;
                        usuarioToAdd.Nombre = actualUsuario.Username;
    
                        $scope.records.push(usuarioToAdd);
                    }
                }
            }
        }

        request_getGrupoUsuarios_process();
    }

    reasignarTareaController.checkUsuario = function(idUsuarioAsignado, username){
        $("#check_" + idUsuarioAsignado).prop("checked", true);

        reasignarTareaController.selectedUsuario = {};
        reasignarTareaController.selectedUsuario.IdUsuarioAsignado = idUsuarioAsignado;
        reasignarTareaController.selectedUsuario.Username = username;
    }

    reasignarTareaController.assign = function(){
        if(reasignarTareaController.selectedUsuario){

            closeAssignModal = function(){
                
                var data = {
                    messageTitle:'Asignación realizada',
                    message: 'Se ha asignado la tarea al usuario ' + reasignarTareaController.selectedUsuario.Username,
                    messageType: 1
                };
        
                var modal = utilityService.showMessage(data);
    
                $uibModalInstance.dismiss('cancel');
            }
            
            utilityService.callSecureHttp({
                method: "POST", 
                url: "secure-api/TraEstadoInstancia/Update",
                data: 
                    {
                        IdAsignadoUsuario: reasignarTareaController.selectedUsuario.IdUsuarioAsignado,
                        IdEstadoInstancia: data.nroTarea
                    },
                callbackSuccess: closeAssignModal, 
                callbackError: closeAssignModal
            });
        }
    }

    reasignarTareaController.back = function () {
        $uibModalInstance.dismiss('back');
        return false;
    }

    reasignarTareaController.cancel = function () {
        var data = {
            messageTitle:'¿Desea salir?',
            message: '¿Cancelar la reasignación?',
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
                    console.log("CANCEL!")
                }
            });
    }
});

function operationFormatter(value, row, index, field) {
    if (value) {
        if (value == "T")
            return ' ';
        else
            return 'R';
    } else {
        return '-';
    }
}  

function rowStyle(row, index) {
    if (row.typeStyle == 1) {
        return {
            css: { "background-color": "#eee" }
        };
    } else if (row.typeStyle == 2) {
        return {
            
        };
    } else return {
        css: { "background-color": "#dddddd", "font-weight": "bold" }
    };
}