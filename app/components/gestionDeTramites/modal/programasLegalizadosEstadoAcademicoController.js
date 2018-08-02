angular.module('app')  
.controller('programasLegalizadosEstadoAcademicoController', function ($scope, $rootScope, $location, Auth, $uibModal, utilityService, $routeParams, $uibModalInstance, data) {

    var estadoAcademicoController = this;
    estadoAcademicoController.estadoAcademicoData;
    estadoAcademicoController.legajo = data.legajo;
    estadoAcademicoController.aniosMaterias = [];
    estadoAcademicoController.idPantalla = data.idPantalla;
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
        var selectedItems = $('#estadoAcademico_ResultTable').bootstrapTable('getSelections');
        var materiasList = [];

        selectedItems.forEach(function (item) {
            if(item.Recono != 'T'){
                materiasList.push(item);
            }
        });
        estadoAcademicoController.data.presentaExterior = estadoAcademicoController.chkForeign;
        estadoAcademicoController.data.paisExterior = estadoAcademicoController.selectedCountry;
        estadoAcademicoController.data.institucionExterior = estadoAcademicoController.chkForeign ? estadoAcademicoController.foreignInstitution : null;
        estadoAcademicoController.data.materiasList = materiasList;
        if (materiasList.length > 0) {
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/components/gestionDeTramites/modal/programasLegalizadosEstadoAdministrativo.html',
                controller: 'programasLegalizadosEstadoAdministrativoController as vm',
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
        else {
            var data = {
                messageType: 2,
                messageTitle: 'Error',
                message: 'Debe seleccionar al menos un item de la lista de materias.'
            };

            utilityService.showMessage(data);
        }
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
                if (!string)
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
                    if (!materia.FechaReal) {
                        listaMateriasFinal.push({Materia:"Reconocimientos", Fecha:" ", Nota:" ", Folio:" ", LibroActa:" ", Recono:"T", FechaReal: materia.FechaReal});
                    } else {
                        listaMateriasFinal.push({Materia:"Año " + year, Fecha:" ", Nota:" ", Folio:" ", LibroActa:" ", Recono:"T", FechaReal: materia.FechaReal});
                    }
                }
                materia.typeStyle = typeStyle;
                listaMateriasFinal.push(materia);
            });

            for (i = 0; i < listaMateriasFinal.length; i++) {
                listaMateriasFinal[i].index = i;
            }

            $('#estadoAcademico_ResultTable').bootstrapTable({
                data: listaMateriasFinal
            });

            $('#estadoAcademico_ResultTable').on('check.bs.table', function ($element, row) {
                if(row.Recono == "T"){
                    var stringToDate = function (string) {
                        if (!string)
                            return fechaR;
                        else {
                            var parts = string.split('/');
                            return new Date(parts[2], parts[1] - 1, parts[0]);
                        }
                    }

                    var listaMateriasFinal = estadoAcademicoController.estadoAcademicoData.Materias;
                    year = stringToDate(row.FechaReal).getFullYear();
                    for (i in listaMateriasFinal) {
                        if(listaMateriasFinal[i].Recono != "T" && stringToDate(listaMateriasFinal[i].FechaReal).getFullYear() == year) {
                            $('#estadoAcademico_ResultTable').bootstrapTable('check', i);
                        }
                    }
                    $('#estadoAcademico_ResultTable').bootstrapTable('load', listaMateriasFinal);

                    for (i = 0; i < listaMateriasFinal.length; i++) {
                        if (listaMateriasFinal[i].Recono == "T") {
                            //var string = '<td class="bs-checkbox " style="background-color: #dddddd;"><input data-index="' + i + '" name="btSelectItem" type="checkbox"></td> <td style="background-color: #dddddd; font-weight: bold; " colspan="7">' + listaMateriasFinal[i].Materia + '</td>'
                            //$('#estadoAcademico_ResultTable').children('tbody').children(0)[i].innerHTML = '<td style="background-color: #dddddd; font-weight: bold;" colspan="7">' + listaMateriasFinal[i].Materia + '</td>'
                            //$('#estadoAcademico_ResultTable').children('tbody').children(0)[i].innerHTML = string;
                            var options = {
                                index: i,
                                field: 'Materia',
                                colspan: 6
                            };
                            $('#estadoAcademico_ResultTable').bootstrapTable('mergeCells', options);
                            $("input[data-index=" + i + "]:last").parents("td").attr('style', "background-color: #dddddd;")
                        }
                    }
                }
            });

            $('#estadoAcademico_ResultTable').on('uncheck.bs.table', function ($element, row) {
                if(row.Recono == "T"){
                    var stringToDate = function (string) {
                        if (!string)
                            return fechaR;
                        else {
                            var parts = string.split('/');
                            return new Date(parts[2], parts[1] - 1, parts[0]);
                        }
                    }

                    var listaMateriasFinal = estadoAcademicoController.estadoAcademicoData.Materias;
                    year = stringToDate(row.FechaReal).getFullYear();
                    for (i in listaMateriasFinal) {
                        if(listaMateriasFinal[i].Recono != "T" && stringToDate(listaMateriasFinal[i].FechaReal).getFullYear() == year) {
                            $('#estadoAcademico_ResultTable').bootstrapTable('uncheck', i);
                        }
                    }
                    $('#estadoAcademico_ResultTable').bootstrapTable('load', listaMateriasFinal);

                    for (i = 0; i < listaMateriasFinal.length; i++) {
                        if (listaMateriasFinal[i].Recono == "T") {
                            var options = {
                                index: i,
                                field: 'Materia',
                                colspan: 6
                            };
                            $('#estadoAcademico_ResultTable').bootstrapTable('mergeCells', options);
                            $("input[data-index=" + i + "]:last").parents("td").attr('style', "background-color: #dddddd;")
                        }
                    }
                }
            });

            $('#myModal').on('shown.bs.modal', function () {
                $('#myInput').focus()
            })

            for (i = 0; i < listaMateriasFinal.length; i++) {
                if (listaMateriasFinal[i].Recono == "T") {
                    var options = {
                        index: i,
                        field: 'Materia',
                        colspan: 6
                    };
                    $('#estadoAcademico_ResultTable').bootstrapTable('mergeCells', options);
                    $("input[data-index=" + i + "]:last").parents("td").attr('style', "background-color: #dddddd;")
                }
            }

            estadoAcademicoController.estadoAcademicoData.Materias = listaMateriasFinal;
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
});

function reconoFormatter(value, row, index, field) {
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