angular.module('app')  
.controller('porcentajesMateriasEstadoAcademicoController', function ($scope, $rootScope, $location, Auth, $uibModal, utilityService, $routeParams, $uibModalInstance, data, workflowService) {

    var estadoAcademicoController = this;
    estadoAcademicoController.estadoAcademicoData;
    estadoAcademicoController.legajo = data.legajo;
    estadoAcademicoController.idPantalla = data.idPantalla;
    estadoAcademicoController.aniosMaterias = [];
    estadoAcademicoController.confirmed = false;
    estadoAcademicoController.data = data;
    estadoAcademicoController.paises = [];
    estadoAcademicoController.selectedCountry = null;
    estadoAcademicoController.chkForeign = false;
    estadoAcademicoController.foreignInstitution = '';
    
    estadoAcademicoController.init = function () {

        Auth.tokenCookieExists();        
        
        estadoAcademicoController.getMateriasAprobadasByLegajo(data.legajo);
        estadoAcademicoController.getAllPaises();
    };

    estadoAcademicoController.getAllPaises = function () {
        utilityService.callSecureHttp({
            method: "GET",
            url: "secure-api/PadPaises/GetAll/",
            callbackSuccess: estadoAcademicoController.getAllPaisesCallback
        });
    };

    estadoAcademicoController.getAllPaisesCallback = function (response) {
        estadoAcademicoController.paises = response.data;
    }

    estadoAcademicoController.foreignKeyUp = function(value) {
        estadoAcademicoController.foreignInstitution = estadoAcademicoController.foreignInstitution.replace(/[^a-z\dA-Z ]/, '');
    }

    estadoAcademicoController.next = function () {
        estadoAcademicoController.data.presentaExterior = estadoAcademicoController.chkForeign;
        estadoAcademicoController.data.paisExterior = estadoAcademicoController.selectedCountry;
        estadoAcademicoController.data.institucionExterior = estadoAcademicoController.chkForeign ? estadoAcademicoController.foreignInstitution : null;
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'app/components/gestionDeTramites/modal/porcentajesMateriasEstadoAdministrativo.html',
            controller: 'porcentajesMateriasEstadoAdministrativoController as vm',
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                data: function () {
                    return estadoAcademicoController.data;
                }
            }
        });

        modalInstance.result.then(
            function (result) { },
            function (result) {
                if (result == 'cancel') {
                    $uibModalInstance.dismiss('cancel');
                    return false;
                }
                if (result == 'finish') {
                    $uibModalInstance.dismiss('finish');
                    return false;
                }
            });
    }

    estadoAcademicoController.getMateriasAprobadasByLegajo = function(){
        utilityService.callSecureHttp({
            method: "GET", 
            url: "secure-api/UniMateria/GetMateriasAprobadasByLegajo/" + estadoAcademicoController.legajo,
            callbackSuccess: estadoAcademicoController.getMateriasAprobadasByLegajoCallback
        });
    };
    
    estadoAcademicoController.getMateriasAprobadasByLegajoCallback = function(response){
        if(response){
            var fechaR = new Date();
            estadoAcademicoController.estadoAcademicoData = response.data;
            var stringToDate = function (string) {
                if (string == "")
                    return fechaR;
                else {
                    var parts = string.split('/');
                    return new Date(parts[2], parts[1] - 1, parts[0]);
                }
            }
            estadoAcademicoController.estadoAcademicoData.Materias.sort(function(a, b) {

                return stringToDate(a.FechaReal).getTime() - stringToDate(b.FechaReal).getTime();
            });

            var year;
            var typeStyle = 1;
            var listaMateriasFinal = [];
            estadoAcademicoController.estadoAcademicoData.Materias.forEach(function (materia) {
                if (stringToDate(materia.FechaReal).getFullYear() != year) {
                    year = stringToDate(materia.FechaReal).getFullYear();
                    if (typeStyle == 1) {
                        typeStyle = 2;
                    } else {
                        typeStyle = 1;
                    }
                    if (materia.FechaReal == "") {
                        listaMateriasFinal.push({Materia:"Reconocimientos", Fecha:" ", Nota:" ", Folio:" ", LibroActa:" ", Recono:"T"});
                    } else {
                        listaMateriasFinal.push({Materia:"Año " + year, Fecha:" ", Nota:" ", Folio:" ", LibroActa:" ", Recono:"T"});
                    }
                }
                materia.typeStyle = typeStyle;
                listaMateriasFinal.push(materia);
            });

            $('#estadoAcademico_ResultTable').bootstrapTable({
                data: listaMateriasFinal
            });
            
    
            $('#myModal').on('shown.bs.modal', function () {
                $('#myInput').focus()
            })
        }
    };

    estadoAcademicoController.cancel = function () {
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
                    $uibModalInstance.dismiss('cancel');
                    return false;
                }
                if (result == 'cancel') {
                    console.log("CANCEL!")
                }
            });
    }

    estadoAcademicoController.back = function () {
        $uibModalInstance.dismiss('back');
        return false;
    }

    estadoAcademicoController.print = function () {
        $('#estadoAcademico_ResultTable').tableExport({
            fileName: 'listaMaterias',
            type: 'pdf',
            jspdf: {
                orientation: 'l',
                format: 'bestfit',
                margins: { left: 10, right: 10, top: 20, bottom: 20 },                
                autotable: {
                    styles: {
                        fillColor: 'inherit',
                        textColor: 'inherit'
                    },
                    tableWidth: 'auto',
                    addPageContent: function(data) {
                        doc.text("Testing text", 40, 30);
                    },
                    tableExport: {
                        onAfterAutotable: new function (var1, var2, var3, var4) {
                        }
                    }
                }
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