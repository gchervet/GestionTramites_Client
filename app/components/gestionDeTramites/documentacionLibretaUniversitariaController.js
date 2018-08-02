angular.module('app')
    .controller('documentacionLibretaUniversitariaController', function ($scope, $rootScope, $location, Auth, $uibModal, utilityService, $routeParams) {

        var documentacionLibretaUniversitariaController = this;

        documentacionLibretaUniversitariaController.showHeader = $routeParams.showHeader || false;

        documentacionLibretaUniversitariaController.selectedDocumento = 0;
        documentacionLibretaUniversitariaController.selectedCarrera = 0;
        documentacionLibretaUniversitariaController.selectedColegio;
        documentacionLibretaUniversitariaController.documentos =
            [{ id: 0, name: 'Legajo provisorio' },
            { id: 1, name: 'DNI' },
            { id: 2, name: 'Pasaporte' }];
            documentacionLibretaUniversitariaController.carreras =
            [{ id: 0, name: 'Odontología' }];
        documentacionLibretaUniversitariaController.colegios =
            [{ id: 0, name: 'Colegio Central' },
            { id: 1, name: 'Colegio Lanús' }];

        documentacionLibretaUniversitariaController.init = function () {

            Auth.tokenCookieExists();
        };


    })