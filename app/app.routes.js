/// <reference path="components/indicadoresDePermanencia/indicadoresDePermanencia.html" />
app.config(['$qProvider', '$routeProvider', '$stateProvider', '$urlRouterProvider',
    function ($qProvider, $routeProvider, $stateProvider, $urlRouterProvider) {

        $qProvider.errorOnUnhandledRejections(false);

        var server_prefix = '';

        $routeProvider
        .when('/login', {
            templateUrl: server_prefix + 'app/components/login/login.html',
            controller: 'loginController as vm'
        })
        .when('/home', {
            templateUrl: server_prefix + 'app/components/home/home.html',
            controller: 'homeController as home',
            requiresAuthentication: true
        })
        .when('/main', {
            templateUrl: server_prefix + 'app/components/main/main.html',
            controller: 'mainController as main',
            requiresAuthentication: true
        })
        .when('/user', {
            templateUrl: server_prefix + 'app/components/user/userProfile.html',
            controller: 'userProfileController as vm',
            requiresAuthentication: true
        })
        /* INGRESOS */
        .when('/MatriculacionYArancelamiento', {
            templateUrl: server_prefix + 'app/components/inscripciones/matriculacionYArancelamiento.html',
            controller: 'matriculacionYArancelamientoController as vm',
            requiresAuthentication: true
        })
        .when('/ConsultaDeMatriculaciones', {
            templateUrl: server_prefix + 'app/components/inscripciones/consultaDeMatriculaciones.html',
            controller: 'consultaDeMatriculacionesController as vm',
            requiresAuthentication: true
        })
        .when('/InscripcionAMaterias', {
            templateUrl: server_prefix + 'app/components/inscripciones/inscripcionAMaterias.html',
            controller: 'inscripcionAMateriasController as vm',
            requiresAuthentication: true
        })
        .when('/ConsultaDeInscripcionAMaterias', {
            templateUrl: server_prefix + 'app/components/inscripciones/consultaDeInscripcionAMaterias.html',
            controller: 'consultaDeInscripcionAMateriasController as vm',
            requiresAuthentication: true
        })
        .when('/ConsultaDeDerechosDeExamen', {
            templateUrl: server_prefix + 'app/components/inscripciones/consultaDeDerechosDeExamen.html',
            controller: 'consultaDeDerechosDeExamenController as vm',
            requiresAuthentication: true
        })
        .when('/InscripcionAExamenes', {
            templateUrl: server_prefix + 'app/components/inscripciones/inscripcionAExamenes.html',
            controller: 'inscripcionAExamenesController as vm',
            requiresAuthentication: true
        })
        .when('/ConsultaDeInscripcionAExamenes', {
            templateUrl: server_prefix + 'app/components/inscripciones/consultaDeInscripcionAExamenes.html',
            controller: 'consultaDeInscripcionAExamenesController as vm',
            requiresAuthentication: true
        })
        /* PROGRAMACIÓN ACADÉMICA */
        .when('/CrearCursoAislado', {
            templateUrl: server_prefix + 'app/components/programacionAcademica/crearCursoAislado.html',
            controller: 'crearCursoAisladoController as vm',
            requiresAuthentication: true
        })
        .when('/CrearCursoDesdeCarrera', {
            templateUrl: server_prefix + 'app/components/programacionAcademica/crearCursoDesdeCarrera.html',
            controller: 'crearCursoDesdeCarreraController as vm',
            requiresAuthentication: true
        })
        .when('/CrearCursoDesdeCurso', {
            templateUrl: server_prefix + 'app/components/programacionAcademica/crearCursoDesdeCurso.html',
            controller: 'crearCursoDesdeCursoController as vm',
            requiresAuthentication: true
        })
        /* INDICADORES DE PERMANENCIA */
        .when('/IndicadoresDePermanencia', {
            templateUrl: server_prefix + 'app/components/indicadoresDePermanencia/indicadoresDePermanencia.html',
            controller: 'indicadoresDePermanenciaController as vm',
            requiresAuthentication: true
        })
        /* GESTIÓN DE TRÁMITES */
        .when('/GestionarUnTramite', {
            templateUrl: server_prefix + 'app/components/gestionDeTramites/gestionarUnTramite.html',
            controller: 'gestionarUnTramiteController as vm',
            requiresAuthentication: true
        })
        .when('/BandejaDeTramites', {
            templateUrl: server_prefix + 'app/components/gestionDeTramites/bandejaDeTramites.html',
            controller: 'bandejaDeTramitesController as vm',
            requiresAuthentication: true
        })
        .when('/ConsultaTramites', {
            templateUrl: server_prefix + 'app/components/gestionDeTramites/consultaTramites.html',
            controller: 'consultaTramitesController as vm',
            requiresAuthentication: true
        })
        .when('/TramiteAnaliticoFinal', {
            templateUrl: server_prefix + 'app/components/gestionDeTramites/tramiteAnaliticoFinal.html',
            controller: 'tramiteAnaliticoFinalController as vm',
            requiresAuthentication: true
        })
        .when('/ConfirmacionDatosPersonales', {
            templateUrl: server_prefix + 'app/components/gestionDeTramites/confirmacionDatosPersonales.html',
            controller: 'confirmacionDatosPersonalesController as vm',
            requiresAuthentication: true
        })
        .when('/EstadoAcademico', {
            templateUrl: server_prefix + 'app/components/gestionDeTramites/estadoAcademico.html',
            controller: 'estadoAcademicoController as vm',
            requiresAuthentication: true
        })
        .when('/DocumentacionLibretaUniversitaria', {
            templateUrl: server_prefix + 'app/components/gestionDeTramites/documentacionLibretaUniversitaria.html',
            controller: 'documentacionLibretaUniversitariaController as vm',
            requiresAuthentication: true
        })
        .when('/PlanEstudio', {
            templateUrl: server_prefix + 'app/components/gestionDeTramites/planEstudio.html',
            controller: 'planEstudioController as vm',
            requiresAuthentication: true
        })
        .when('/InformeEstadoAcademico', {
            templateUrl: server_prefix + 'app/components/utilidades/informeEstadoAcademico.html',
            controller: 'informeEstadoAcademicoController as vm',
            requiresAuthentication: true
        })
        
        
        
        /* DEFAULT */
        .otherwise({ redirectTo: "home" });

    }
]);
app.run(['myUrl', '$rootScope', '$location', 'Auth', 'blockUIConfig',
    function (myUrl, $rootScope, $location, Auth, blockUIConfig) {

        // Setting the authorization Instance
        Auth.init();

        // Setting the authentication validation on every route change
        $rootScope.$on('$routeChangeStart', function (event, next) {
            if (!Auth.checkPermissionForView(next)) {
                event.preventDefault();
                $location.path("/login");
            }
        });
        // Setting service url
        $rootScope.myUrl = myUrl;

        $rootScope.WEB_SOCKET_URL = "http://localhost:9000";
        
        /* Setting global variables */
        // 4.Client\app\components\indicadoresDePermanencia\indicadoresDePermanencia.html
        $rootScope.KPI_INASISTENCIAS_PORCENTAJE_LIMITE_MAYOR = 80;
        $rootScope.KPI_INASISTENCIAS_PORCENTAJE_LIMITE_MENOR = 30;
        $rootScope.KPI_EXAMENES_REPROBADOS_PORCENTAJE_LIMITE_MAYOR = 80;
        $rootScope.KPI_EXAMENES_REPROBADOS_PORCENTAJE_LIMITE_MENOR = 30;
        $rootScope.KPI_FINALES_REPROBADOS_PORCENTAJE_LIMITE_MAYOR = 80;
        $rootScope.KPI_FINALES_REPROBADOS_PORCENTAJE_LIMITE_MENOR = 30;
        $rootScope.KPI_MONTO_DE_DEUDA_LIMITE_MAYOR = 10000;
        $rootScope.KPI_MONTO_DE_DEUDA_LIMITE_MENOR = 1000;

        blockUIConfig.message = "Cargando ...";
        blockUIConfig.requestFilter = function (request) { return (request.noBlock) ? false : blockUIConfig.message; };

    }
]);