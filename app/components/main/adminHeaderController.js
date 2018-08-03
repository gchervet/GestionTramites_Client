angular.module('app')
    .controller('adminHeaderController', function ($scope, $rootScope, $location, $sessionStorage, utilityService, Auth, socket, notificationService, $cookies, $uibModal) {

        var headerController = this;
        headerController.userFullName = '';
        headerController.userPermission = '';

        headerController.selectedTramite = 0;
        headerController.menuGroupList = [];

        headerController.init = function () {

            Auth.tokenCookieExists();

            if ($sessionStorage.user == null) {
                $rootScope.logout();
            }

            headerController.validAdminAuthentication();

            headerController.userFullName = $sessionStorage.user.name;

        };

        headerController.logout = function () {

            Auth.logout();
            $location.url($location.path("/login"));

        };

        headerController.validAdminAuthentication = function () {

            request_validAdminAuthentication_process = function () {
                
                utilityService.callSecureHttp({
                    method: "POST",
                    url: "api/ValidateAdminAuthentication",
                    data: {
                        username: $rootScope.user.username,
                        sessionToken: $rootScope.user.Token
                    },
                    callbackSuccess: request_validAdminAuthentication_response,
                    callbackError: request_validAdminAuthentication_response,
                    token: $cookies.get('token')
                });
            }

            request_validAdminAuthentication_response = function (response) {
                if(response && response.data){
                    return true;
                }
                else{
                    $location.url($location.path("/home"));        
                }
            }

            request_validAdminAuthentication_process();
        };

        
        $scope.sendMessage = function () {
            notificationService.emit('show:notification', {
                message: $scope.message
            });
        };

    });