angular.module('app')
.controller('testModal_1Controller', function ($scope, $rootScope, $uibModalInstance, data, utilityService, workflowService) {
    
    $scope.selectedTramite = data;    
    $scope.data = data;
    
    if($scope.data.ValoresEntrada){
        $scope.data.ValoresEntrada = JSON.parse(data.ValoresEntrada)
    }
    $scope.title = "Recepción";
    $scope.inputComentario = $scope.data.ValoresEntrada.inputComentario || "";

    $scope.UpdateEstadoInstancia = function(estadoEstado, fechaFin){
        var estadoInstanciaData = data;

        estadoInstanciaData.EstadoEstado = estadoEstado;
        //estadoInstanciaData.ValoresEntrada = JSON.stringify({inputComentario: $scope.inputComentario});
        estadoInstanciaData.ValoresSalida = JSON.stringify({pre: 10, tem: 10});
        if(fechaFin){
            estadoInstanciaData.FechaFin = fechaFin;
        }
        success_updateEstadoInstancia_Request = function(response){
            utilityService.showMessage({
                messageType: 1,
                messageTitle: "Mensaje",
                message: "Los cambios fueron guadados."
            });
            $uibModalInstance.dismiss('cancel');
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

    $scope.save = function() {
        $scope.UpdateEstadoInstancia(3);
    };

    $scope.end = function() {
        var auxDate = new Date();
        var fechaFin = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(), 
                                                    (auxDate.getHours() - 3), auxDate.getMinutes(), auxDate.getSeconds(), auxDate.getMilliseconds());

        $scope.UpdateEstadoInstancia(2, fechaFin);

        workflowService.getNextEstadoByIdEstadoActual($scope.data.IdEstadoDefinicion, true, $scope.data);
        $uibModalInstance.dismiss('cancel');
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

});