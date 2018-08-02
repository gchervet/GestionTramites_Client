angular.module("app")
    .factory('myHttpInterceptor', ['$q', '$location', "$cookies",
        function ($q, $location, $cookies) {
            return {
                'response': function (response) {
                    return response;
                },

                'responseError': function (rejection) {
                    if (rejection.status === 401) {
                        if ($location.url().indexOf("?path=") < 0 && $location.url().indexOf("/login") < 0) {
                            if (rejection.data != null && !(rejection.data.code == 4 || rejection.data.code == 7)) {
                                $cookies.remove('sessionToken');
                                $cookies.remove('RequiereSolicitudBloqueaProduccion');
                                $location.url('/login?path=' + encodeURIComponent($location.absUrl()));
                            }
                            else if (rejection.data.code == 7) {
                                $location.url('/passwordChangePage');
                            }
                        }
                    }
                    return $q.reject(rejection);
                }
            };
        }])

    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('myHttpInterceptor');
    });