angular.module('app')
    .controller('informeEstadoAcademicoController', function ($scope, $rootScope, $location, Auth, $uibModal, utilityService, $routeParams) {

        var informeEstadoAcademicoController = this;

        informeEstadoAcademicoController.init = function () {

            Auth.tokenCookieExists();
        };

        informeEstadoAcademicoController.getInformePDF = function () {

            var process_getInformePDF_request = function () {
                utilityService.callExternalHttp({
                    method: "GET",
                    host: "http://ar-wintest-01/AcademicoServices",
                    url: "/Services/AcademicoWebServices.svc/ObtenerEstadoAcademico/405485",
                    callbackSuccess: success_getInformePDF_request,
                    callbackError: success_getInformePDF_request
                });
            };
    
            var success_getInformePDF_request = function (response) {
                    if (response && response.data) {
                        var out = response;
                        var url = 'data:application/pdf;base64,' + out;
                        window.open(url,'_blank');
                    }
                };
    
            process_getInformePDF_request();
        };

    });