angular.module('AuthServices', ['ngResource', 'ngStorage'])
    .factory('Auth', function ($resource, $rootScope, $sessionStorage, $q, $cookies, $location, utilityService) {

        /**
         *  User profile resource
         */
        var Profile = $resource('/api/User/Authenticate', {}, {
            login: {
                method: "POST",
                isArray: false
            }
        });

        var auth = {};

        /**
         *  Saves the current user in the root scope
         *  Call this in the app run() method
         */
        auth.init = function () {
            if (auth.isLoggedIn()) {
                $rootScope.user = auth.currentUser();
            }
        };

        auth.login = function (loginUser) {
            return $q(function (resolve, reject) {

                Profile.login({ username: loginUser.UserName, password: loginUser.Password }).$promise
                    .then(function (data) {
                        $sessionStorage.user = data;
                        $rootScope.user = $sessionStorage.user;
                        resolve();
                    }, function () {
                        reject();
                    });
            });
        };


        auth.logout = function () {

            /* Limpiar la sesión desde la base */
            var process_expireToken_request = function () {

                debugger;
                utilityService.callSecureHttp({
                    method: "POST",
                    url: "api/ExpireToken/",
                    callbackSuccess: success_expireToken_request,
                    callbackError: success_expireToken_request,
                    data: { username: $rootScope.user.name, sessionToken: $rootScope.user.Token }
                });
            };

            var success_expireToken_request = function (response) {
                if(response & response.data){
                    delete $sessionStorage.user;
                    delete $rootScope.user;

                    $cookies.remove('token');
                }
            };

            process_expireToken_request();

            /* Se limpian los datos de usuario y cookies */
            delete $sessionStorage.user;
            delete $rootScope.user;

            $cookies.remove('token');
        };


        auth.checkPermissionForView = function (view) {
            if (!view.requiresAuthentication) {
                return true;
            }

            return userHasPermissionForView(view);
        };


        var userHasPermissionForView = function (view) {
            if (!auth.isLoggedIn()) {
                return false;
            }

            if (!view.permissions || !view.permissions.length) {
                return true;
            }

            return auth.userHasPermission(view.permissions);
        };

        auth.userHasPermission = function (permissions, permissionType) {

            /* Antes de verificar los permisos, verificamos si el usuario se encuentra logueado */
            if (!auth.isLoggedIn()) {
                return false;
            }

            var found = false;

            if (permissionType == 'Excluding') {
                return auth.userHasPermissionExluding(permissions);
            }
            if (permissionType == 'NonExcluding') {
                return auth.userHasPermissionNonExcluding(permissions);
            }

            return found;
        };


        auth.userHasPermissionNonExcluding = function (permissions) {

            /* Antes de verificar los permisos, verificamos si el usuario se encuentra logueado */
            if (!auth.isLoggedIn()) {
                return false;
            }

            var found = false;

            if ($sessionStorage.user.permissions) {
                angular.forEach(permissions, function (permission, index) {
                    if ($sessionStorage.user.permissions.indexOf(permission) >= 0) {
                        found = true;
                        return;
                    }
                });
            }
            else {
                found = true;
            }

            return found;
        };


        auth.userHasPermissionExluding = function (permissions) {

            /* Antes de verificar los permisos, verificamos si el usuario se encuentra logueado */
            if (!auth.isLoggedIn()) {
                return false;
            }

            var found = true;

            if ($sessionStorage.user.permissions) {
                angular.forEach(permissions, function (permission, index) {
                    if (!($sessionStorage.user.permissions.indexOf(permission) >= 0)) {
                        found = false;
                        return;
                    }
                });
            }
            else {
                found = true;
            }

            return found;
        };

        auth.currentUser = function () {
            return $sessionStorage.user;
        };


        auth.isLoggedIn = function () {
            return $sessionStorage.user != null;
        };

        auth.extendTokenTime = function (timeExtensionMinutes) {

            var token = readCookie('token');

            if (token) {
                $.removeCookie('token');

                var now = new Date(), timeExtension = timeExtensionMinutes;
                now.setMinutes(now.getMinutes() + expirationMinutes);

                $cookies.put('token', $rootScope.token, { expires: now });
            }
        };

        auth.tokenCookieExists = function (usernameComparision, tokenComparision) {
            if (usernameComparision && tokenComparision) {
                auth.validateTokenAndUsername(usernameComparision, tokenComparision)
            }
            else {
                // En el caso de querer verificar que el cookie exista.
                var cookieEnabled = navigator.cookieEnabled;
                if (!cookieEnabled) {
                    document.cookie = "token";
                    cookieEnabled = document.cookie.indexOf("token") != -1;
                }
                return cookieEnabled;
            }
        };

        auth.validateTokenAndUsername = function (usernameComparision, tokenComparision) {

            var process_validateTokenAndUsername_request = function () {

                utilityService.callSecureHttp({
                    method: "POST",
                    url: "api/ValidateAuthentication/",
                    callbackSuccess: success_validateTokenAndUsername_request,
                    callbackError: success_validateTokenAndUsername_request,
                    data: { username: usernameComparision, sessionToken: tokenComparision }
                });
            };

            var success_validateTokenAndUsername_request = function (response) {
                if (response && response.data) {
                    return true;
                }
            };

            process_validateTokenAndUsername_request();
        };

        auth.invalidTokenAlert = function () {
            var data = {
                messageTitle: 'La sesión expiró',
                message: 'Su sesión ha expirado, es necesario reingresar al sistema.',
                messageType: 1
            };

            var modal = utilityService.showMessage(data);

            modal.result.then(
                function (result) { },
                function (result) {
                    auth.logout();
                }
            );
        }
        return auth;
    });