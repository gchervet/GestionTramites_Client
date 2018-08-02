angular.module('app')
  .controller('indicadoresDePermanenciaController', function ($scope, $rootScope, $location, $sessionStorage, utilityService, Auth, $cookies) {

      var indicadoresDePermanenciaController = this;

      indicadoresDePermanenciaController.init = function () {

          Auth.tokenCookieExists();

          if ($sessionStorage.user == null) {
              $rootScope.logout();
          }

          indicadoresDePermanenciaController.loadRequestMethods();
          indicadoresDePermanenciaController.loadLists();
          indicadoresDePermanenciaController.loadPersonMethods();
          indicadoresDePermanenciaController.loadGrids();
      };

      indicadoresDePermanenciaController.loadRequestMethods = function () {

          indicadoresDePermanenciaController.getErrorCallback = function (response) {
              alert(response);
          }

          indicadoresDePermanenciaController.getFullGridInfoListCallback = function (response) {
              if (response) {
                  indicadoresDePermanenciaController.lastCicloCuatriSelected = { ciclo: indicadoresDePermanenciaController.cicloSelected, cuatrimestre: indicadoresDePermanenciaController.cuatrimestreSelected };
                  indicadoresDePermanenciaController.loadChartInfo(response.data, 'fullChartContainer', 'Total de inasistencias', 'En el ciclo ' + indicadoresDePermanenciaController.lastCicloCuatriSelected.ciclo + ', cuatrimestre ' + indicadoresDePermanenciaController.lastCicloCuatriSelected.cuatrimestre, $rootScope.KPI_INASISTENCIAS_PORCENTAJE_LIMITE_MENOR, $rootScope.KPI_INASISTENCIAS_PORCENTAJE_LIMITE_MAYOR, '#F9670C,#FFB089,#F9CCB6');

                  utilityService.callHttp({
                      method: "GET", url: "/api/UniAlumno/GetExamenesReprobadosTotal?ciclo=" + indicadoresDePermanenciaController.cicloSelected + "&cuatri=" + indicadoresDePermanenciaController.cuatrimestreSelected
                                                           , callbackSuccess: indicadoresDePermanenciaController.getExamenesReprobadosTotalInfoListCallback, callbackError: indicadoresDePermanenciaController.getErrorCallback
                  });
              }
          };

          indicadoresDePermanenciaController.getExamenesReprobadosTotalInfoListCallback = function (response) {
              if (response) {
                  indicadoresDePermanenciaController.lastCicloCuatriSelected = { ciclo: indicadoresDePermanenciaController.cicloSelected, cuatrimestre: indicadoresDePermanenciaController.cuatrimestreSelected };
                  indicadoresDePermanenciaController.loadChartInfo(response.data, 'fullExamenesReprobadosChartContainer', 'Total de parciales reprobados', 'En el ciclo ' + indicadoresDePermanenciaController.lastCicloCuatriSelected.ciclo + ', cuatrimestre ' + indicadoresDePermanenciaController.lastCicloCuatriSelected.cuatrimestre, $rootScope.KPI_EXAMENES_REPROBADOS_PORCENTAJE_LIMITE_MENOR, $rootScope.KPI_EXAMENES_REPROBADOS_PORCENTAJE_LIMITE_MAYOR, '#3288D3,#639FD3,#A3CAED');

                  utilityService.callHttp({
                      method: "GET", url: "/api/UniAlumno/GetFinalesReprobadosTotal?ciclo=" + indicadoresDePermanenciaController.cicloSelected + "&cuatri=" + indicadoresDePermanenciaController.cuatrimestreSelected
                                                           , callbackSuccess: indicadoresDePermanenciaController.getFinalesReprobadosTotalInfoListCallback, callbackError: indicadoresDePermanenciaController.getErrorCallback
                  });
              }
          };

          indicadoresDePermanenciaController.getFinalesReprobadosTotalInfoListCallback = function (response) {
              if (response) {
                  indicadoresDePermanenciaController.lastCicloCuatriSelected = { ciclo: indicadoresDePermanenciaController.cicloSelected, cuatrimestre: indicadoresDePermanenciaController.cuatrimestreSelected };
                  indicadoresDePermanenciaController.loadChartInfo(response.data, 'fullFinalesReprobadosChartContainer', 'Total de finales reprobados', 'En el ciclo ' + indicadoresDePermanenciaController.lastCicloCuatriSelected.ciclo + ', cuatrimestre ' + indicadoresDePermanenciaController.lastCicloCuatriSelected.cuatrimestre, $rootScope.KPI_FINALES_REPROBADOS_PORCENTAJE_LIMITE_MENOR, $rootScope.KPI_FINALES_REPROBADOS_PORCENTAJE_LIMITE_MAYOR, '#42A540,#25E222,#A4FFA3');

                  utilityService.callHttp({
                      method: "GET", url: "/api/UniAlumno/GetMorososTotal?ciclo=" + indicadoresDePermanenciaController.cicloSelected + "&cuatri=" + indicadoresDePermanenciaController.cuatrimestreSelected
                                                              , callbackSuccess: indicadoresDePermanenciaController.getMorososTotalGridInfoListCallback, callbackError: indicadoresDePermanenciaController.getErrorCallback
                  });
              }
          };

          indicadoresDePermanenciaController.getMorososTotalGridInfoListCallback = function (response) {

              if (response) {
                  indicadoresDePermanenciaController.lastCicloCuatriSelected = { ciclo: indicadoresDePermanenciaController.cicloSelected, cuatrimestre: indicadoresDePermanenciaController.cuatrimestreSelected };
                  indicadoresDePermanenciaController.loadChartInfo(response.data, 'morososFullChartContainer', 'Total de morosos', 'En el ciclo ' + indicadoresDePermanenciaController.lastCicloCuatriSelected.ciclo + ', cuatrimestre ' + indicadoresDePermanenciaController.lastCicloCuatriSelected.cuatrimestre, $rootScope.KPI_MONTO_DE_DEUDA_LIMITE_MENOR, $rootScope.KPI_MONTO_DE_DEUDA_LIMITE_MAYOR, '#F9670C,#FFB089,#F9CCB6');
              }
          };

          // Método de Chart genérico
          indicadoresDePermanenciaController.loadChartInfo = function (data, gridName, charTitle, charSubtitle, lowerLimit, higherLimit, charColour) {

              var cantALTO = 0, cantMEDIO = 0, cantBAJO = 0;
              if (data) {
                  for (i in data) {

                      if (data[i] && data[i] >= higherLimit) { cantALTO++; }
                      if (data[i] && data[i] > lowerLimit && data[i] < higherLimit) { cantMEDIO++; }
                      if (data[i] && data[i] <= lowerLimit) { cantBAJO++; }
                  }
                  indicadoresDePermanenciaController.loadCharts(gridName, [{ 'label': 'ALTO', 'value': cantALTO.toString() }, { 'label': 'MEDIO', 'value': cantMEDIO.toString() }, { 'label': 'BAJO', 'value': cantBAJO.toString() }], charTitle, charSubtitle, charColour);
              }
          };

          indicadoresDePermanenciaController.getRegionalListCallback = function (response) {
              if (response) {
                  for (i in response.data) {
                      var actualSede = response.data[i];
                      indicadoresDePermanenciaController.sedeList.push(
                                {
                                    name: actualSede.Nombre,
                                    code: actualSede.Codigo,
                                    customName: actualSede.NombreCustom
                                });
                  }
              }
          };

          indicadoresDePermanenciaController.getPlanListCallback = function (response) {
              if (response) {
                  for (i in response.data) {
                      var actualPlan = response.data[i];
                      if (actualPlan && actualPlan.CodCar && actualPlan.NombreCarrera) {
                          indicadoresDePermanenciaController.planList.push(
                                    {
                                        name: "(" + actualPlan.CodCar + ") " + actualPlan.NombreCarrera,
                                        code: actualPlan.CodCar,
                                        modalidadList: actualPlan.ModalidadList
                                    });
                      }
                  }
              }
          };

          indicadoresDePermanenciaController.clearCharts = function () {

              indicadoresDePermanenciaController.loadCharts('morososGridChartContainer', [], 'Morosos encontrados', 'Según los filtros ingresados', '#F9670C,#FFB089,#F9CCB6');
              indicadoresDePermanenciaController.loadCharts('gridChartContainer', [], 'Inasistencias encontradas', 'Según los filtros ingresados', '#F9670C,#FFB089,#F9CCB6');
              indicadoresDePermanenciaController.loadCharts('examenesReprobadosChartContainer', [], 'Parciales reprobados', 'Según los filtros ingresados', '#3288D3,#639FD3,#A3CAED');
              indicadoresDePermanenciaController.loadCharts('finalesReprobadosChartContainer', [], 'Finales reprobados', 'Según los filtros ingresados', '#42A540,#25E222,#A4FFA3');
          };

          indicadoresDePermanenciaController.setCicloCuatrimestreIntoSelection = function () {

              var date = new Date(),
                  month = date.getMonth(),
                  actualCuatrimestre = (month == 1 || month == 2 || month == 3 || month == 4 || month == 5 || month == 6 || month == 7) ? 1 : 2;

              indicadoresDePermanenciaController.cicloSelected = date.getFullYear();
              indicadoresDePermanenciaController.cuatrimestreSelected = actualCuatrimestre;
          };

          // KPI Inasistencias
          indicadoresDePermanenciaController.getKPIInasistenciaListCallback = function (response) {

              if (indicadoresDePermanenciaController.resetCharts) { indicadoresDePermanenciaController.clearCharts(); }
              if (response) {

                  var finalesLegajosUsados = [],
                      examenesLegajosUsados = [],
                      deudaLegajosUsados = [];

                  indicadoresDePermanenciaController.resultList = [];

                  var actualLegajo,
                      previousLegajo,
                      nuevaInasistencia = null,
                      nuevaInasistenciaCreada = false,
                      cantMaterias = 0,
                      inasistenciaALTO = 0,
                      inasistenciaMEDIO = 0,
                      inasistenciaBAJO = 0,
                      cantExamenesReprobadosALTO = 0,
                      cantExamenesReprobadosMEDIO = 0,
                      cantExamenesReprobadosBAJO = 0,
                      cantFinalesReprobadosALTO = 0,
                      cantFinalesReprobadosMEDIO = 0,
                      cantFinalesReprobadosBAJO = 0,
                      valorDeDeudaALTO = 0,
                      valorDeDeudaMEDIO = 0,
                      valorDeDeudaBAJO = 0;

                  for (i in response.data) {
                      var index = Number(i),
                          actualResult = response.data[index];

                      actualLegajo = actualResult.Legajo;

                      nuevaMateria = {
                          Inasistencia: actualResult.Inansistencia,
                          Materia: actualResult.Materia,
                          Examenes: actualResult.ExamenesDesaprobados,
                          FinalesReprobados: actualResult.FinalesDesaprobados,
                          TotalCantidadExamenesTomadosPorMateria: actualResult.TotalCantidadExamenesTomadosPorMateria,
                          TotalCantidadFinalesTomadosPorMateria: actualResult.TotalCantidadFinalesTomadosPorMateria
                      };
                      cantMaterias++;

                      if (((previousLegajo && actualLegajo != previousLegajo) || (!nuevaInasistencia)) && !nuevaInasistenciaCreada) {

                          // Inasistencia - Resumen
                          var inasistenciaTexto = 'N/A';
                          if (actualResult.Promedio && actualResult.Promedio >= $rootScope.KPI_INASISTENCIAS_PORCENTAJE_LIMITE_MAYOR) {
                              inasistenciaTexto = 'ALTO';
                              inasistenciaALTO++;
                          }
                          if (actualResult.Promedio && actualResult.Promedio > $rootScope.KPI_INASISTENCIAS_PORCENTAJE_LIMITE_MENOR && actualResult.Promedio < $rootScope.KPI_INASISTENCIAS_PORCENTAJE_LIMITE_MAYOR) {
                              inasistenciaTexto = 'MEDIO';
                              inasistenciaMEDIO++;
                          }
                          if (actualResult.Promedio && actualResult.Promedio <= $rootScope.KPI_INASISTENCIAS_PORCENTAJE_LIMITE_MENOR) {
                              inasistenciaTexto = 'BAJO';
                              inasistenciaBAJO++;
                          }

                          // Parciales reprobados - Resumen
                          var examenesReprobadosTexto = 'N/A';
                          if (examenesLegajosUsados.indexOf(actualLegajo) == -1) {
                              if (actualResult.PromedioExamenesReprobados && actualResult.PromedioExamenesReprobados >= $rootScope.KPI_EXAMENES_REPROBADOS_PORCENTAJE_LIMITE_MAYOR) {
                                  examenesReprobadosTexto = 'ALTO';
                                  examenesLegajosUsados.push(actualLegajo);
                                  cantExamenesReprobadosALTO++;
                              }
                              if (actualResult.PromedioExamenesReprobados && actualResult.PromedioExamenesReprobados > $rootScope.KPI_EXAMENES_REPROBADOS_PORCENTAJE_LIMITE_MENOR && actualResult.PromedioExamenesReprobados < $rootScope.KPI_EXAMENES_REPROBADOS_PORCENTAJE_LIMITE_MAYOR) {
                                  examenesReprobadosTexto = 'MEDIO';
                                  examenesLegajosUsados.push(actualLegajo);
                                  cantExamenesReprobadosMEDIO++;
                              }
                              if (actualResult.PromedioExamenesReprobados && actualResult.PromedioExamenesReprobados <= $rootScope.KPI_EXAMENES_REPROBADOS_PORCENTAJE_LIMITE_MENOR) {
                                  examenesReprobadosTexto = 'BAJO';
                                  examenesLegajosUsados.push(actualLegajo);
                                  cantExamenesReprobadosBAJO++;
                              }
                          }

                          // Finales reprobados - Resumen
                          var finalesReprobadosTexto = 'N/A';
                          if (finalesLegajosUsados.indexOf(actualLegajo) == -1) {
                              if (actualResult.PromedioFinalesReprobados && actualResult.PromedioFinalesReprobados >= $rootScope.KPI_FINALES_REPROBADOS_PORCENTAJE_LIMITE_MAYOR) {
                                  finalesReprobadosTexto = 'ALTO';
                                  finalesLegajosUsados.push(actualLegajo);
                                  cantFinalesReprobadosALTO++;
                              }
                              if (actualResult.PromedioFinalesReprobados && actualResult.PromedioFinalesReprobados > $rootScope.KPI_FINALES_REPROBADOS_PORCENTAJE_LIMITE_MENOR && actualResult.PromedioFinalesReprobados < $rootScope.KPI_FINALES_REPROBADOS_PORCENTAJE_LIMITE_MAYOR) {
                                  finalesReprobadosTexto = 'MEDIO';
                                  finalesLegajosUsados.push(actualLegajo);
                                  cantFinalesReprobadosMEDIO++;
                              }
                              if (actualResult.PromedioFinalesReprobados && actualResult.PromedioFinalesReprobados <= $rootScope.KPI_FINALES_REPROBADOS_PORCENTAJE_LIMITE_MENOR) {
                                  finalesReprobadosTexto = 'BAJO';
                                  finalesLegajosUsados.push(actualLegajo);
                                  cantFinalesReprobadosBAJO++;
                              }
                          }

                          // Valor de deuda - Resumen
                          var valorDeDeuda = 'N/A';
                          if (deudaLegajosUsados.indexOf(actualLegajo) == -1) {
                              if (actualResult.DeudaMonto && actualResult.DeudaMonto >= $rootScope.KPI_MONTO_DE_DEUDA_LIMITE_MAYOR) {
                                  valorDeDeuda = 'ALTO';
                                  deudaLegajosUsados.push(actualLegajo);
                                  valorDeDeudaALTO++;
                              }
                              if (actualResult.DeudaMonto && $rootScope.KPI_MONTO_DE_DEUDA_LIMITE_MENOR - 0.0001 < actualResult.DeudaMonto && actualResult.DeudaMonto < $rootScope.KPI_MONTO_DE_DEUDA_LIMITE_MAYOR + 0.0001) {
                                  valorDeDeuda = 'MEDIO';
                                  deudaLegajosUsados.push(actualLegajo);
                                  valorDeDeudaMEDIO++;
                              }
                              if (actualResult.DeudaMonto && actualResult.DeudaMonto <= $rootScope.KPI_MONTO_DE_DEUDA_LIMITE_MENOR) {
                                  valorDeDeuda = 'BAJO';
                                  deudaLegajosUsados.push(actualLegajo);
                                  valorDeDeudaBAJO++;
                              }
                          }

                          nuevaInasistencia = {
                              Legajo: actualResult.Legajo,
                              Nombre: actualResult.Nombre,
                              Apellido: actualResult.Apellido,
                              DNI: actualResult.Dni,
                              Carrera: actualResult.Carrera,
                              Ciclo: actualResult.Ciclo,
                              Cuatrimestre: actualResult.Cuatri,
                              CorreoElectronico: actualResult.Mail,
                              Telefono: actualResult.Telefono,
                              MaxNroClase: actualResult.MaxNroClase,
                              Promedio: actualResult.Promedio,
                              Inasistencia: inasistenciaTexto + ' (' + Math.round(actualResult.Promedio) + '%)',
                              TotalDeInasistencias: actualResult.TotalDeInasistencias,
                              Examenes: examenesReprobadosTexto,
                              FinalesReprobados: finalesReprobadosTexto,
                              ValorDeDeuda: valorDeDeuda,
                              DeudaMonto: actualResult.DeudaMonto ? '$ ' + actualResult.DeudaMonto : '-',

                              nested: []
                          }
                          nuevaInasistenciaCreada = true;
                      }
                      nuevaInasistencia.nested.push(nuevaMateria);

                      if (examenesLegajosUsados.indexOf(actualLegajo) == -1 && actualResult.PromedioExamenesReprobados) {
                          // Parciales reprobados - Resumen
                          if (actualResult.PromedioExamenesReprobados && actualResult.PromedioExamenesReprobados >= $rootScope.KPI_EXAMENES_REPROBADOS_PORCENTAJE_LIMITE_MAYOR) {
                              cantExamenesReprobadosALTO++;
                          }
                          if (actualResult.PromedioExamenesReprobados && actualResult.PromedioExamenesReprobados > $rootScope.KPI_EXAMENES_REPROBADOS_PORCENTAJE_LIMITE_MENOR && actualResult.PromedioExamenesReprobados < $rootScope.KPI_EXAMENES_REPROBADOS_PORCENTAJE_LIMITE_MAYOR) {
                              cantExamenesReprobadosMEDIO++;
                          }
                          if (actualResult.PromedioExamenesReprobados && actualResult.PromedioExamenesReprobados <= $rootScope.KPI_EXAMENES_REPROBADOS_PORCENTAJE_LIMITE_MENOR) {
                              cantExamenesReprobadosBAJO++;
                          }
                          examenesLegajosUsados.push(actualLegajo);
                      }

                      if (finalesLegajosUsados.indexOf(actualLegajo) == -1 && actualResult.PromedioFinalesReprobados) {
                          // Finales reprobados - Resumen
                          if (actualResult.PromedioFinalesReprobados && actualResult.PromedioFinalesReprobados >= $rootScope.KPI_FINALES_REPROBADOS_PORCENTAJE_LIMITE_MAYOR) {
                              cantFinalesReprobadosALTO++;
                          }
                          if (actualResult.PromedioFinalesReprobados && actualResult.PromedioFinalesReprobados > $rootScope.KPI_FINALES_REPROBADOS_PORCENTAJE_LIMITE_MENOR && actualResult.PromedioFinalesReprobados < $rootScope.KPI_FINALES_REPROBADOS_PORCENTAJE_LIMITE_MAYOR) {
                              cantFinalesReprobadosMEDIO++;
                          }
                          if (actualResult.PromedioFinalesReprobados && actualResult.PromedioFinalesReprobados <= $rootScope.KPI_FINALES_REPROBADOS_PORCENTAJE_LIMITE_MENOR) {
                              cantFinalesReprobadosBAJO++;
                          }
                          finalesLegajosUsados.push(actualLegajo);
                      }

                      if (deudaLegajosUsados.indexOf(actualLegajo) == -1 && actualResult.PromedioFinalesReprobados) {
                          // Valor de deuda - Resumen
                          if (actualResult.PromedioFinalesReprobados && actualResult.PromedioFinalesReprobados >= $rootScope.KPI_MONTO_DE_DEUDA_LIMITE_MAYOR) {
                              valorDeDeudaALTO++;
                          }
                          if (actualResult.PromedioFinalesReprobados && actualResult.PromedioFinalesReprobados > $rootScope.KPI_MONTO_DE_DEUDA_LIMITE_MENOR && actualResult.PromedioFinalesReprobados < $rootScope.KPI_MONTO_DE_DEUDA_LIMITE_MAYOR) {
                              valorDeDeudaMEDIO++;
                          }
                          if (actualResult.PromedioFinalesReprobados && actualResult.PromedioFinalesReprobados <= $rootScope.KPI_MONTO_DE_DEUDA_LIMITE_MENOR) {
                              valorDeDeudaBAJO++;
                          }
                          deudaLegajosUsados.push(actualLegajo);
                      }

                      if ((response.data[index + 1] && response.data[index + 1].Legajo != actualLegajo) || !response.data[index + 1]) {

                          // Si no hay filtro KPI
                          if (!indicadoresDePermanenciaController.kpiSelected) {
                              indicadoresDePermanenciaController.resultList.push(nuevaInasistencia);
                          }
                              // Si hay filtro KPI - Inasistencias
                          else if (indicadoresDePermanenciaController.kpiSelected == 'Inasistencias') {
                              if (inasistenciaTexto != 'N/A' && (!indicadoresDePermanenciaController.nivelDeRiesgoSelected || indicadoresDePermanenciaController.nivelDeRiesgoSelected.toLowerCase() == inasistenciaTexto.toLowerCase())) {
                                  indicadoresDePermanenciaController.resultList.push(nuevaInasistencia);
                              }
                          }
                              // Si hay filtro KPI - Parciales reprobados
                          else if (indicadoresDePermanenciaController.kpiSelected == 'Parciales reprobados') {
                              if (examenesReprobadosTexto != 'N/A' && (!indicadoresDePermanenciaController.nivelDeRiesgoSelected || indicadoresDePermanenciaController.nivelDeRiesgoSelected.toLowerCase() == examenesReprobadosTexto.toLowerCase())) {
                                  indicadoresDePermanenciaController.resultList.push(nuevaInasistencia);
                              }
                          }
                              // Si hay filtro KPI - Finales reprobados
                          else if (indicadoresDePermanenciaController.kpiSelected == 'Finales reprobados') {
                              if (finalesReprobadosTexto != 'N/A' && (!indicadoresDePermanenciaController.nivelDeRiesgoSelected || indicadoresDePermanenciaController.nivelDeRiesgoSelected.toLowerCase() == finalesReprobadosTexto.toLowerCase())) {
                                  indicadoresDePermanenciaController.resultList.push(nuevaInasistencia);
                              }
                          }
                              // Si hay filtro KPI - Monto de deuda
                          else if (indicadoresDePermanenciaController.kpiSelected == 'Monto de deuda') {
                              if (valorDeDeuda != 'N/A' && (!indicadoresDePermanenciaController.nivelDeRiesgoSelected || indicadoresDePermanenciaController.nivelDeRiesgoSelected.toLowerCase() == valorDeDeuda.toLowerCase())) {
                                  indicadoresDePermanenciaController.resultList.push(nuevaInasistencia);
                              }
                          }

                          previousLegajo = actualLegajo;
                          nuevaInasistencia = null;
                          nuevaInasistenciaCreada = false;
                      }
                  }

                  // Load grid values
                  $('#resultTable').bootstrapTable('load', indicadoresDePermanenciaController.resultList);

                  // Load charts values
                  indicadoresDePermanenciaController.loadCharts('gridChartContainer', [{ 'label': 'ALTO', 'value': inasistenciaALTO.toString() }, { 'label': 'MEDIO', 'value': inasistenciaMEDIO.toString() }, { 'label': 'BAJO', 'value': inasistenciaBAJO.toString() }], 'Inasistencias encontradas', 'Según los filtros ingresados', '#F9670C,#FFB089,#F9CCB6');
                  indicadoresDePermanenciaController.loadCharts('examenesReprobadosChartContainer', [{ 'label': 'ALTO', 'value': cantExamenesReprobadosALTO.toString() }, { 'label': 'MEDIO', 'value': cantExamenesReprobadosMEDIO.toString() }, { 'label': 'BAJO', 'value': cantExamenesReprobadosBAJO.toString() }], 'Parciales reprobados', 'Según los filtros ingresados', '#3288D3,#639FD3,#A3CAED');
                  indicadoresDePermanenciaController.loadCharts('finalesReprobadosChartContainer', [{ 'label': 'ALTO', 'value': cantFinalesReprobadosALTO.toString() }, { 'label': 'MEDIO', 'value': cantFinalesReprobadosMEDIO.toString() }, { 'label': 'BAJO', 'value': cantFinalesReprobadosBAJO.toString() }], 'Finales reprobados', 'Según los filtros ingresados', '#42A540,#25E222,#A4FFA3');
                  indicadoresDePermanenciaController.loadCharts('morososGridChartContainer', [{ 'label': 'ALTO', 'value': valorDeDeudaALTO.toString() }, { 'label': 'MEDIO', 'value': valorDeDeudaMEDIO.toString() }, { 'label': 'BAJO', 'value': valorDeDeudaBAJO.toString() }], 'Morosos encontradas', 'Según los filtros ingresados', '#F9670C,#FFB089,#F9CCB6');


                  if (!indicadoresDePermanenciaController.lastCicloCuatriSelected ||
                      indicadoresDePermanenciaController.lastCicloCuatriSelected.ciclo != indicadoresDePermanenciaController.cicloSelected ||
                      indicadoresDePermanenciaController.lastCicloCuatriSelected.cuatrimestre != indicadoresDePermanenciaController.cuatrimestreSelected) {

                      utilityService.callHttp({
                          method: "GET", url: "/api/UniAlumno/GetKPIInasistenciasTotalPromedios?ciclo=" + indicadoresDePermanenciaController.cicloSelected + "&cuatri=" + indicadoresDePermanenciaController.cuatrimestreSelected
                                                               , callbackSuccess: indicadoresDePermanenciaController.getFullGridInfoListCallback, callbackError: indicadoresDePermanenciaController.getErrorCallback
                      });
                  }
                  indicadoresDePermanenciaController.resetCharts = true;
              }
          };

          indicadoresDePermanenciaController.getLegajoListCallback = function (response) {
              if (response) {
                  for (i in response.data) {
                      var actualLegajo = response.data[i];
                      indicadoresDePermanenciaController.legajoList.push(actualLegajo.LegajoDefinitivo);
                  }

                  $("#comboLegajo").autocomplete({ source: indicadoresDePermanenciaController.legajoList });
              }
          };
      }

      indicadoresDePermanenciaController.loadLists = function () {
          indicadoresDePermanenciaController.source = [];
          $(function () {
              $("#comboLegajo").autocomplete({
                  source: [indicadoresDePermanenciaController.source]
              });
          });

          indicadoresDePermanenciaController.legajoSearchText = '';
          indicadoresDePermanenciaController.legajoSelected = '';
          indicadoresDePermanenciaController.nombreSelected = '';
          indicadoresDePermanenciaController.apellidoSelected = '';
          indicadoresDePermanenciaController.dniSelected = '';

          indicadoresDePermanenciaController.cicloSelected = '';
          indicadoresDePermanenciaController.cuatrimestreSelected = '';
          indicadoresDePermanenciaController.sedeSelected = '';
          indicadoresDePermanenciaController.planSelected = '';
          indicadoresDePermanenciaController.kpiSelected = '';
          indicadoresDePermanenciaController.nivelDeRiesgoSelected = '';

          indicadoresDePermanenciaController.chartGridData = [];
          indicadoresDePermanenciaController.lastCicloCuatriSelected = {};

          indicadoresDePermanenciaController.inasistenciaChartShowing = false;
          indicadoresDePermanenciaController.parcialChartShowing = false;
          indicadoresDePermanenciaController.finalChartShowing = false;

          indicadoresDePermanenciaController.resetCharts = false;

          indicadoresDePermanenciaController.legajoList = [];
          indicadoresDePermanenciaController.cicloList = [];
          indicadoresDePermanenciaController.cuatrimestreList = [1, 2];
          indicadoresDePermanenciaController.sedeList = [];
          indicadoresDePermanenciaController.planList = [];
          indicadoresDePermanenciaController.kpiList = ['Inasistencias', 'Parciales reprobados', 'Finales reprobados', 'Monto de deuda'];
          indicadoresDePermanenciaController.nivelDeRiesgoList = ['Alto', 'Medio', 'Bajo'];

          indicadoresDePermanenciaController.chartTotalData = [];

          utilityService.callSecureHttp({ method: "GET", url: "secure-api/UniPlan/GetAll", callbackSuccess: indicadoresDePermanenciaController.getPlanListCallback, callbackError: indicadoresDePermanenciaController.getErrorCallback, token: $cookies.get('token') });
          utilityService.callSecureHttp({ method: "GET", url: "secure-api/UniRegional/GetAll", callbackSuccess: indicadoresDePermanenciaController.getRegionalListCallback, callbackError: indicadoresDePermanenciaController.getErrorCallback, token: $cookies.get('token') });

          indicadoresDePermanenciaController.setCicloCuatrimestreIntoSelection();
      };

      indicadoresDePermanenciaController.loadPersonMethods = function () {

          indicadoresDePermanenciaController.legajoSelected = null;
          indicadoresDePermanenciaController.legajoSelected = null;

          indicadoresDePermanenciaController.legajoList = [];

          indicadoresDePermanenciaController.legajoWasSelected = function (select) {

              indicadoresDePermanenciaController.legajoSelected = select.originalObject;

              indicadoresDePermanenciaController.nombreSelected = select.originalObject.nombre;
              indicadoresDePermanenciaController.apellidoSelected = select.originalObject.apellido;
              indicadoresDePermanenciaController.dniSelected = select.originalObject.dni;

          };

          indicadoresDePermanenciaController.legajoSearch = function (str) {
              var matches = [];
              for (i in indicadoresDePermanenciaController.legajoList) {
                  var actualLegajo = indicadoresDePermanenciaController.legajoList[i];

                  if ((actualLegajo.legajoDefinitivo && actualLegajo.legajoDefinitivo.toString().indexOf(str.toString()) >= 0) ||
                      (actualLegajo.legajoProvisorio && actualLegajo.legajoProvisorio.toString().indexOf(str.toString()) >= 0)) {

                      matches.push(actualLegajo);

                      if (matches.length == 10) {
                          break;
                      }
                  }
              };
              return matches;
          };

          indicadoresDePermanenciaController.legajoInputChanged = function () {

          };

      };

    
      indicadoresDePermanenciaController.loadGrid = function () {

          indicadoresDePermanenciaController.resultList = [];

          // KPI Inasistencia Filter
          var kpi_inasistencia_url_query = '&kpi_inasistencia_mayor=&kpi_inasistencia_menor=';

          if (indicadoresDePermanenciaController.kpiSelected == 'Inasistencias') {
              if (indicadoresDePermanenciaController.nivelDeRiesgoSelected == 'Alto') {
                  kpi_inasistencia_url_query = '&kpi_inasistencia_menor&kpi_inasistencia_mayor=' + Number($rootScope.KPI_INASISTENCIAS_PORCENTAJE_LIMITE_MAYOR);
              }
              if (indicadoresDePermanenciaController.nivelDeRiesgoSelected == 'Medio') {
                  kpi_inasistencia_url_query = '&kpi_inasistencia_menor=' + Number($rootScope.KPI_INASISTENCIAS_PORCENTAJE_LIMITE_MAYOR + 0.0001) + '&kpi_inasistencia_mayor=' + Number($rootScope.KPI_INASISTENCIAS_PORCENTAJE_LIMITE_MENOR - 0.0001);
              }
              if (indicadoresDePermanenciaController.nivelDeRiesgoSelected == 'Bajo') {
                  kpi_inasistencia_url_query = '&kpi_inasistencia_mayor=&kpi_inasistencia_menor=' + Number($rootScope.KPI_INASISTENCIAS_PORCENTAJE_LIMITE_MENOR);
              }
          }

          // KPI Parciales reprobados Filter
          var kpi_examenes_url_query = '&kpi_reprobados_mayor=&kpi_reprobados_menor=';

          if (indicadoresDePermanenciaController.kpiSelected == 'Parciales reprobados') {
              if (indicadoresDePermanenciaController.nivelDeRiesgoSelected == 'Alto') {
                  kpi_examenes_url_query = '&kpi_reprobados_menor&kpi_reprobados_mayor=' + Number($rootScope.KPI_EXAMENES_REPROBADOS_PORCENTAJE_LIMITE_MAYOR);
              }
              if (indicadoresDePermanenciaController.nivelDeRiesgoSelected == 'Medio') {
                  kpi_examenes_url_query = '&kpi_reprobados_menor=' + Number($rootScope.KPI_EXAMENES_REPROBADOS_PORCENTAJE_LIMITE_MAYOR + 0.0001) + '&kpi_reprobados_mayor=' + Number($rootScope.KPI_EXAMENES_REPROBADOS_PORCENTAJE_LIMITE_MENOR - 0.0001);
              }
              if (indicadoresDePermanenciaController.nivelDeRiesgoSelected == 'Bajo') {
                  kpi_examenes_url_query = '&kpi_reprobados_mayor=&kpi_reprobados_menor=' + Number($rootScope.KPI_EXAMENES_REPROBADOS_PORCENTAJE_LIMITE_MENOR);
              }
          }

          // KPI Finales reprobados Filter
          var kpi_finales_url_query = '&kpi_finales_mayor=&kpi_finales_menor=';

          if (indicadoresDePermanenciaController.kpiSelected == 'Finales reprobados') {
              if (indicadoresDePermanenciaController.nivelDeRiesgoSelected == 'Alto') {
                  kpi_finales_url_query = '&kpi_finales_menor&kpi_finales_mayor=' + Number($rootScope.KPI_FINALES_REPROBADOS_PORCENTAJE_LIMITE_MAYOR);
              }
              if (indicadoresDePermanenciaController.nivelDeRiesgoSelected == 'Medio') {
                  kpi_finales_url_query = '&kpi_finales_menor=' + Number($rootScope.KPI_FINALES_REPROBADOS_PORCENTAJE_LIMITE_MAYOR + 0.0001) + '&kpi_finales_mayor=' + Number($rootScope.KPI_FINALES_REPROBADOS_PORCENTAJE_LIMITE_MENOR - 0.0001);
              }
              if (indicadoresDePermanenciaController.nivelDeRiesgoSelected == 'Bajo') {
                  kpi_finales_url_query = '&kpi_finales_mayor=&kpi_finales_menor=' + Number($rootScope.KPI_FINALES_REPROBADOS_PORCENTAJE_LIMITE_MENOR);
              }
          }

          // KPI Monto de deuda
          var kpi_monto_url_query = '&kpi_monto_menor=&kpi_monto_mayor=';

          if (indicadoresDePermanenciaController.kpiSelected) {
              if (indicadoresDePermanenciaController.nivelDeRiesgoSelected == 'Alto') {
                  kpi_monto_url_query = '&kpi_monto_menor&kpi_monto_mayor=' + $rootScope.KPI_MONTO_DE_DEUDA_LIMITE_MAYOR;
              }
              if (indicadoresDePermanenciaController.nivelDeRiesgoSelected == 'Medio') {
                  kpi_monto_url_query = '&kpi_monto_menor=' + $rootScope.KPI_MONTO_DE_DEUDA_LIMITE_MAYOR + '&kpi_monto_mayor=' + $rootScope.KPI_MONTO_DE_DEUDA_LIMITE_MENOR;
              }
              if (indicadoresDePermanenciaController.nivelDeRiesgoSelected == 'Bajo') {
                  kpi_monto_url_query = '&kpi_monto_mayor=&kpi_monto_menor=' + $rootScope.KPI_MONTO_DE_DEUDA_LIMITE_MENOR;
              }
          }
          utilityService.callHttp({
              method: "GET", url: "/api/UniAlumno/GetKPIInasistencias?ciclo=" + indicadoresDePermanenciaController.cicloSelected +
                                                                "&cuatri=" + indicadoresDePermanenciaController.cuatrimestreSelected +
                                                                "&legajo=" + (indicadoresDePermanenciaController.legajoSearchText ? indicadoresDePermanenciaController.legajoSearchText : '') +
                                                                "&sede=" + (indicadoresDePermanenciaController.sedeSelected ? indicadoresDePermanenciaController.sedeSelected : '') +
                                                                "&carrera=" + (indicadoresDePermanenciaController.planSelected ? indicadoresDePermanenciaController.planSelected : '') +
                                                                "&nombre=" + (indicadoresDePermanenciaController.nombreSelected ? indicadoresDePermanenciaController.nombreSelected : '') +
                                                                "&apellido=" + (indicadoresDePermanenciaController.apellidoSelected ? indicadoresDePermanenciaController.apellidoSelected : '') +
                                                                "&dni=" + (indicadoresDePermanenciaController.dniSelected ? indicadoresDePermanenciaController.dniSelected : '') +
                                                                kpi_inasistencia_url_query +
                                                                kpi_examenes_url_query +
                                                                kpi_finales_url_query +
                                                                kpi_monto_url_query
                                                                , callbackSuccess: indicadoresDePermanenciaController.getKPIInasistenciaListCallback, callbackError: indicadoresDePermanenciaController.getErrorCallback
          });

      };

      indicadoresDePermanenciaController.loadGrids = function () {

          indicadoresDePermanenciaController.resultList = [];

          $('#resultTable').bootstrapTable({
              data: indicadoresDePermanenciaController.resultList,
              detailView: true,
              onExpandRow: function (index, row, $detail) {
                  console.log(row)
                  $detail.html('<table></table>').find('table').bootstrapTable({
                      columns: [{
                          field: 'Materia',
                          title: 'Materia'
                      }, {
                          field: 'Inasistencia',
                          title: 'Inasistencia'
                      }, {
                          field: 'Examenes',
                          title: 'Parciales reprobados'
                      }, {
                          field: 'TotalCantidadExamenesTomadosPorMateria',
                          title: 'Total de parciales'
                      }, {
                          field: 'FinalesReprobados',
                          title: 'Finales reprobados'
                      }, {
                          field: 'TotalCantidadFinalesTomadosPorMateria',
                          title: 'Total de finales'
                      }],
                      data: row.nested
                  });

              }
          });
      };

      indicadoresDePermanenciaController.loadCharts = function (charId, charData, title, subtitle, colours) {

          // Previous validations
          if (!colours) { colours = '#008ee4,#e6e600,#00e600'; }
          if (!subtitle) { subtitle = ''; }

          // Grid data chart
          indicadoresDePermanenciaController.gridDataChart = new FusionCharts({
              type: 'pie3d',
              renderAt: charId,
              dataFormat: 'json',
              height: '500',
              width: '100%',
              dataSource: {
                  "chart": {
                      "showBorder": "0",
                      "caption": title,
                      "subCaption": subtitle,
                      "use3DLighting": "0",
                      "showShadow": "0",
                      "enableSmartLabels": "0",
                      "startingAngle": "0",
                      "exportEnabled": "1",
                      "exportFormats": "PNG=Exportar a PNG|PDF=Exportar a PDF|XLS=Exportar a excel",
                      "showPercentValues": "1",
                      "showPercentInTooltip": "0",
                      "decimals": "1",
                      "palettecolors": colours,
                      "captionFontSize": "14",
                      "subcaptionFontSize": "14",
                      "subcaptionFontBold": "0",
                      "toolTipColor": "#ffffff",
                      "toolTipBorderThickness": "0",
                      "toolTipBgColor": "#000000",
                      "toolTipBgAlpha": "80",
                      "toolTipBorderRadius": "2",
                      "toolTipPadding": "5",
                      "showHoverEffect": "1",
                      "showLegend": "1",
                      "legendBgColor": "#ffffff",
                      "legendBorderAlpha": '0',
                      "legendShadow": '0',
                      "legendItemFontSize": '10',
                      "legendItemFontColor": '#666666'
                  },
                  "data": charData
              }
          });

          indicadoresDePermanenciaController.gridDataChart.render();


          indicadoresDePermanenciaController.inasistenciaChartShowing = true;
          indicadoresDePermanenciaController.parcialChartShowing = true;
          indicadoresDePermanenciaController.finalChartShowing = true;
      };

  });