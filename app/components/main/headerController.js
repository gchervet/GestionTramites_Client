angular.module('app')
    .controller('headerController', function ($scope, $rootScope, $location, $sessionStorage, utilityService, Auth, socket, notificationService, $cookies, $uibModal) {

        var headerController = this;
        headerController.userFullName = '';
        headerController.userPermission = '';

        headerController.tramites =
            [{ id: 0, name: 'Programas Legalizados' },
            { id: 1, name: 'Duplicado Analítico' },
            { id: 2, name: 'Título en Trámite' },
            { id: 3, name: 'Analitico Final' },
            { id: 4, name: 'Analitico Parcial' },
            { id: 5, name: 'Libreta Universitaria' },
            { id: 6, name: 'Rectificación de Datos' },
            { id: 7, name: 'Plan de Estudio' },
            { id: 8, name: 'Porcentaje de materias' }];

        headerController.selectedTramite = 0;
        headerController.menuGroupList = [];

        headerController.init = function () {

            Auth.tokenCookieExists();

            if ($sessionStorage.user == null) {
                $rootScope.logout();
            }

            headerController.userFullName = $sessionStorage.user.name;
            headerController.userPermission = $sessionStorage.user.permissions;

            if (!$rootScope.user.menuGroupList) {
                headerController.getAllMenu();
            }
            else {
                headerController.menuGroupList = $rootScope.user.menuGroupList;


                for (var menuGroupIndex in headerController.menuGroupList) {
                    var actualMenuGroup = headerController.menuGroupList[menuGroupIndex];
                    var actualMenuGroupRootScope = $rootScope.user.menuGroupList[menuGroupIndex];

                    // Variable que define si el menú debe mostrarse o no
                    actualMenuGroup.Show = false;
                    actualMenuGroupRootScope.Show = false;
                    for (var menuIndex in actualMenuGroup.MenuList) {

                        // Algoritmo que resuelve los permisos por cada pantalla, en cada botón
                        var actualMenu = actualMenuGroup.MenuList[menuIndex];
                        actualMenu.PermissionString = "[";
                        actualMenuGroupRootScope.PermissionString = "[";
                        for (var permissionIndex in actualMenu.PermissionList) {
                            var actualMenuPermission = actualMenu.PermissionList[permissionIndex];

                            // Si el usuario cuenta con al menos un permiso de la lista, se muestra el menú principal
                            if (headerController.userPermission.indexOf(actualMenuPermission.Name) != -1) {
                                actualMenuGroup.Show = true;
                            }

                            actualMenu.PermissionString += '"' + actualMenuPermission.Name + '"';
                            actualMenuGroupRootScope.PermissionString += '"' + actualMenuPermission.Name + '"';
                            if (actualMenu.PermissionList.length > 1 && (Number(permissionIndex) + 1) < actualMenu.PermissionList.length) {
                                actualMenu.PermissionString += ',';
                                actualMenuGroupRootScope.PermissionString += ',';
                            }
                        }
                        actualMenu.PermissionString += "]";
                        actualMenuGroupRootScope.PermissionString += "]";
                    }
                }
            }

        };

        headerController.logout = function () {

            Auth.logout();
            $location.url($location.path("/login"));

        };

        headerController.getAllMenu = function () {
            Auth.tokenCookieExists();
            var getAllMenuCallback = function (response) {
                if (response) {

                    $rootScope.user.menuGroupList = response.data;

                    // Se setea el valor de menú al front end
                    headerController.menuGroupList = response.data;


                    for (var menuGroupIndex in headerController.menuGroupList) {
                        var actualMenuGroup = headerController.menuGroupList[menuGroupIndex];
                        var actualMenuGroupRootScope = $rootScope.user.menuGroupList[menuGroupIndex];

                        // Variable que define si el menú debe mostrarse o no
                        actualMenuGroup.Show = false;
                        actualMenuGroupRootScope.Show = false;
                        for (var menuIndex in actualMenuGroup.MenuList) {

                            // Algoritmo que resuelve los permisos por cada pantalla, en cada botón
                            var actualMenu = actualMenuGroup.MenuList[menuIndex];
                            actualMenu.PermissionString = "[";
                            actualMenuGroupRootScope.PermissionString = "[";
                            for (var permissionIndex in actualMenu.PermissionList) {
                                var actualMenuPermission = actualMenu.PermissionList[permissionIndex];

                                // Si el usuario cuenta con al menos un permiso de la lista, se muestra el menú principal
                                if (headerController.userPermission.indexOf(actualMenuPermission.Name) != -1) {
                                    actualMenuGroup.Show = true;
                                }

                                actualMenu.PermissionString += '"' + actualMenuPermission.Name + '"';
                                actualMenuGroupRootScope.PermissionString += '"' + actualMenuPermission.Name + '"';
                                if (actualMenu.PermissionList.length > 1 && (Number(permissionIndex) + 1) < actualMenu.PermissionList.length) {
                                    actualMenu.PermissionString += ',';
                                    actualMenuGroupRootScope.PermissionString += ',';
                                }
                            }
                            actualMenu.PermissionString += "]";
                            actualMenuGroupRootScope.PermissionString += "]";
                        }
                    }
                }


                $('.nav li.dropdown').hover(function () {
                    $(this).addClass('open');
                }, function () {
                    $(this).removeClass('open');
                });
            };

            var getAllMenuErrorCallback = function (response) {
                // Qué hacer en caso de error?
            }

            utilityService.callSecureHttp({
                method: "GET",
                url: "secure-api/menu/getall",
                callbackSuccess: getAllMenuCallback,
                callbackError: getAllMenuErrorCallback,
                token: $cookies.get('token')
            });
        };

        $scope.sendMessage = function () {
            notificationService.emit('show:notification', {
                message: $scope.message
            });
        };


        $scope.openModel = function () {
            var templateUrl;
            var controller;
            var idPantalla;
            switch (headerController.selectedTramite) {
                case 0:
                    templateUrl = 'app/components/gestionDeTramites/modal/programasLegalizadosConfirmacionDatosPersonales.html';
                    controller = 'programasLegalizadosConfirmacionDatosPersonalesController as vm';
                    idPantalla = 3;
                    break;
                case 1:
                    templateUrl = 'app/components/gestionDeTramites/modal/duplicadoAnaliticoConfirmacionDatosPersonales.html';
                    controller = 'duplicadoAnaliticoConfirmacionDatosPersonalesController as vm';
                    idPantalla = 4;
                    break;
                case 2:
                    templateUrl = 'app/components/gestionDeTramites/modal/tituloTramiteEstadoAdministrativo.html';
                    controller = 'tituloTramiteEstadoAdministrativoController as vm';
                    idPantalla = 5;
                    break;
                case 3:
                    templateUrl = 'app/components/gestionDeTramites/modal/analiticoFinalConfirmacionDatosPersonales.html';
                    controller = 'analiticoFinalConfirmacionDatosPersonalesController as vm';
                    idPantalla = 1;
                    break;
                case 4:
                    templateUrl = 'app/components/gestionDeTramites/modal/analiticoParcialConfirmacionDatosPersonales.html';
                    controller = 'analiticoParcialConfirmacionDatosPersonalesController as vm';
                    idPantalla = 2;
                    break;
                case 5:
                    templateUrl = 'app/components/gestionDeTramites/modal/libretaUniversitariaDocumentacion.html';
                    controller = 'libretaUniversitariaDocumentacionController as vm';
                    idPantalla = 0;
                    break;
                case 6:
                    templateUrl = 'app/components/gestionDeTramites/modal/rectificacionDatosConfirmacionDatosPersonales.html';
                    controller = 'rectificacionDatosConfirmacionDatosPersonalesController as vm';
                    idPantalla = 6;
                    break;
                case 7:
                    templateUrl = 'app/components/gestionDeTramites/modal/planEstudioConfirmacionDatosPersonales.html';
                    controller = 'planEstudioConfirmacionDatosPersonalesController as vm';
                    idPantalla = 7;
                    break;
                case 8:
                    templateUrl = 'app/components/gestionDeTramites/modal/porcentajesMateriasConfirmacionDatosPersonales.html';
                    controller = 'porcentajesMateriasConfirmacionDatosPersonalesController as vm';
                    idPantalla = 8;
                    break;
                default:
            }
            //448886
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: templateUrl,
                controller: controller,
                size: 'lg',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    data: {
                        legajo: headerController.legajo,
                        idPantalla: idPantalla
                    }
                }
            });
        }

    });