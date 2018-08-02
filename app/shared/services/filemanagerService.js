angular.module('app')
    .factory('filemanagerService', ['$http', '$rootScope', '$uibModal', '$q', '$filter', '$interval', 'myUrl', '$cookies', 'urlFilemanager', 'utilityService',
        function filemanagerService($http, $rootScope, $uibModal, $q, $filter, $interval, myUrl, $cookies, urlFilemanager, utilityService) {
            var service = {
                upload: upload,
                createDirectory: createDirectory
            };

                //TODO: esta llamada funciona contra el filemanager. colocar url de este en app.config.js para poder configurar facilmente y usarla de allá. 
                //var payload = new FormData();

                // payload.append("destination", "/HOLA");
                // payload.append('file-0', estadoAdministrativoController.data.attachData.dniFront);

                // var result = $http({
                //     url: "http://localhost:8085/angular-filemanager/bridges/php-local/index.php",
                //     method: 'POST',
                //     data: payload,
                //     //assign content-type as undefined, the browser
                //     //will assign the correct boundary for us
                //     headers: { 'Content-Type': undefined },
                //     //prevents serializing payload.  don't do it.
                //     transformRequest: angular.identity
                // });

            function upload(dir, file, name) {
                //TODO: esta llamada funciona contra el filemanager. colocar url de este en app.config.js para poder configurar facilmente y usarla de allá. 
                var payload = new FormData();

                var blob = file.slice(0, -1, 'image/jpeg'); 
                var newFile = new File([blob], name + '.jpg', {type: 'image/jpeg' });

                payload.append("destination", dir);
                payload.append('file-0', newFile);

                var result = $http({
                    url: urlFilemanager.base,
                    method: 'POST',
                    data: payload,
                    //assign content-type as undefined, the browser
                    //will assign the correct boundary for us
                    headers: { 'Content-Type': undefined },
                    //prevents serializing payload.  don't do it.
                    transformRequest: angular.identity
                });
            }

            function createDirectory(idInstanciaTramite, idInstanciaTramiteActivo, username) {

                var createDirectoryDTO = {
                    idInstanciaTramite: idInstanciaTramite,
                    idInstanciaTramiteActivo: idInstanciaTramiteActivo,
                    username: username
                }

                return new Promise(function (resolve, reject) {
                    // Solicito la información de la primera tarea de un trámite
                    var process_createDirectory_request = function () {
                        utilityService.callSecureHttp({
                            method: "POST",
                            url: "secure-api/TraInstanciaTramite/CreateDirectory",
                            data: createDirectoryDTO,
                            callbackSuccess: success_createDirectory_Request,
                            callbackError: success_createDirectory_Request,
                            token: $cookies.get('token')
                        });
                    };

                    var success_createDirectory_Request = function (response) {
                        resolve(response.data);
                    };
                    process_createDirectory_request();
                })
            }

            return service;
        }]);