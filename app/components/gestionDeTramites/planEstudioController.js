angular.module('app')
    .controller('planEstudioController', function ($scope, $rootScope, $location, Auth, $uibModal, utilityService, $routeParams) {

        var planEstudioController = this;
    
        planEstudioController.showHeader = $routeParams.showHeader || false;

        planEstudioController.dummyData =
            {
                Legajo: '25555',
                Carrera: 'QUÍMICA',
                Nombre: 'Alumno Prueba',
                Modalidad: 0,
                TipoDocumento: 0,
                Documento: 12345678,
                LugarNacimiento: 'XXXXXXXXXXXXXXXXXXXXXXXXXXX',
                FechaNacimiento: '15/05/1985',
                Domicilio: 'La Casa Test Alumno 001',
                Localidad: 'CABA',
                CodigoPostal: '1037',
                Telefono: '1555555555',
                Mail: 'alumnoprueba@gmail.com',
                MesAnoFinalCarreraUK: '06/2015',
                AnoFinalSecundario: '2000',
            };

        planEstudioController.tipoDocumentos =
            [{ id: 0, name: 'DNI' },
            { id: 1, name: 'Pasaporte' },
            { id: 2, name: 'LC' }];

        planEstudioController.tipoModalidades =
            [{ id: 0, name: 'Presencial' },
            { id: 1, name: 'Virtual' }];

        planEstudioController.init = function () {

            Auth.tokenCookieExists();
        };

    })