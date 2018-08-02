angular.module('app')
    .factory('httpRequestInterceptor', ['$cookies',
        function ($cookies) {

            return {
                request: function ($config) {

                    $config.headers['Authorization'] = $cookies.get("token");
                    return $config;
                }
            };
        }])

    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('httpRequestInterceptor');
    });