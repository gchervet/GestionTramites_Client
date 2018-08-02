# UKAng_Client

## Cómo instalar

1. Instalar XAMPP. Descargarlo desde la siguiente URL, cualquiera de los clientes es útil debido a que sólo es necesaria la configuración de un servidor Apache, tarea básica de XAMPP

    https://www.apachefriends.org/download.html

2. Una vez instalado, abrir la configuración de apache **httpd.config** y buscar la linea que dice **Listen 80**, suele estar por la parte de arriba. Cambiarla a otro puerto disponible, por ejemplo **Listen 8085**.

3. Una vez cambiado el puerto, creamos una nueva carpeta en el directorio **C:\xampp\htdocs** llamada **UKAng_Client**.

4. Copiar los archivos de este repositorio dentro de la carpeta.

5. Poner en funcionamiento el servidor apache desde el panel de control de XAMPP.

6. Abrir http://localhost:<<puerto>>/UKAng_Client/

    en el caso del ejemplo, sería http://localhost:8085/UKAng_Client/

7. Si aparece el sitio, ya se encuentra en funcionamiento.

    Los archivos y carpetas se generan en la carpeta **C:\xampp\htdocs\UKAng_Client\files**.
	
## Documentación
--------------
* [1. Manejo de Modals](#manejoDeModals)
* [2. Manejo de Notificaciones](#manejoDeNotificaciones)
* [3. Autenticación](#autenticacion)
* [4. Invocación de Web Services](#invocacionWebServices)
* [5. Invocar un Web Service desde una SQL Stored Procedure](#invocarWebServiceDesdeStoredProcedure)
* [6. Mensajes popup](#mensajesPopup)

---------------------------------------

<a name="manejoDeModals" />

## Manejo de Modals (popups)

El manejo de modal se da mediante la libreria ui.bootstrap, perteneciente a Angular.

	Tomar de ejemplo base el template html de modal ubicado en **app/components/gestionDeTramites/modal/modalDetalleDeTramite.html**

Tener en cuenta lo siguiente:

	- Cada modal que se realice será un .html separado.
	- La ubicación de los modal será definida por la carpeta app/components/<<componente>>/modal
	- Todos los modal comparten un controlador en comun, **app/components/modal/ModalInstanceCtrl.js**, solicitado por index.html
	- Este controlador puede, además, tener extras dependiendo de las necesidades de cada modal en particular (ver Modal.4.)

### Modal.1. Realizar un template de modal

La ubicación de los template se define en la carpeta **app/components/<<componente>>/modal**, por ejemplo, el componente **home** tendría un modal en **app/components/home/modal/modalDeHome.html**.

De esta forma, el HTML interno de un modal será basicamente el siguiente:


```html
<div class="modal-header">
	<h3 class="modal-title">Título del Modal</h3>
</div>
<div class="modal-body">

	{{variableAngular}}
	...Contenido del modal...
	
</div>
<div class="modal-footer">
	<button class="btn btn-primary" type="button" ng-click="ok()">OK</button>
</div>
```
	
Este template podrá utilizar variables de angular, siempre y cuando estas pertenzcan a $scope, en el controlador.

### Modal.2. Invocar a un modal

Los modal serán invocados desde los distintos controladores en cada componente.

Para invocar a un popup, se debe usar la siguiente sintaxis:

```js
.controller('gestionarUnTramiteController', function ($scope, $uibModal) {
	
	var modalInstance = $uibModal.open({
		animation: $scope.animationsEnabled,
		templateUrl: 'app/components/<<componente>>/modal/<<modal>>.html',
		controller: 'ModalInstanceCtrl'
	});
	
};
```

Donde 

	- El controlador del componente debe recibir como mínimo a **$scope** y **$uibModal**
	- **ModalInstanceCtrl** es el controlador general para todos los modal
	- **animation** es un valor fijo
	- **templateUrl** debe ser la ruta física desde app/components/<<componente>>/modal/<<modal>>.html

De esta forma estaríamos invocando al modal ubicado en el valor dado en **templateUrl**, dándole el controlador general.

Dicho controlador general, **ModalInstanceCtrl**, tiene los valores mínimos y necesarios para que los componentes dentro del modal funcionen:

```js
angular.module('app')
.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, data) {
	
	$scope.modalInternalData = data;    
	$scope.ok = function() {        
		$uibModalInstance.dismiss('cancel');
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

});
```

### Modal.3. Darle valores internos al Modal

El controlador general de modal, **ModalInstanceCtrl**, tiene un valor que maneja los datos internos que son traspasados desde un componente a un modal.

De esta forma los modal pueden recibir parametros mediante su invocación y aplicarlos al $scope, para poder utilizarlos.

Para ello existe la variable **data**, recibida en el controlador **ModalInstanceCtrl**. Esta variable es luego asignada al $scope del modal, de modo que el modal podra usar **{{modalInternalData}}** como una variable de angular.

Para enviar un valor interno al modal, hay que agregarlo al objeto de su invocación de la siguiente manera:

```js
var modalInstance = $uibModal.open({
	animation: $scope.animationsEnabled,
	templateUrl: 'app/components/<<componente>>/modal/<<modal>>.html',
	controller: 'ModalInstanceCtrl',
	
	resolve: {
		data: function () {
			return <<controller>>.<<variable>>;
		} 
	}
});
```

Donde *resolve* envía como parámetro **data** (que luego es el que recibe el modal en su firma). Esta variable retornada puede ser de cualquier tipo.

### Modal.4. Agregar nuevas funciones al controlador general de modal

El controlador general de modal, **ModalInstanceCtrl**, puede tener extras agregados, dependiendo de las necesidades de los distintos componentes que llamarán a los modal.

De esta forma, cada agregado se dará en el mismo archivo controlador de cada componente que necesite dicho extra.

Por ejemplo, si el componente **menu** necesita un agregado en modal, como un método, lo hará en el mismo **homeController.html**:

```js
angular.module('app')
.controller('homeController', function ($scope, $rootScope, $location, $sessionStorage, utilityService, Auth) {

	...

})
.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, data) {

	$scope.NuevoMetodo = function (){};
	
});
```

<a name="manejoDeNotificaciones" />	

## Manejo de Notificaciones

El manejo de notificaciones se da mediante la libreria **socket.io**. Esta librería funciona como enlace a tiempo real para captar notificaciones y triggers. Utiliza tecnología **web socket**.

Los archivos importantes son 

	- app/shared/services/notificationServices.js 
	- app/shared/services/socket.js

Tener en cuenta lo siguiente:

	- Para poder usar estos servicios en un controller, hay que asignarlos a los parámetros, ver por ejemplo app/components/main/headerController.js.
		
		- .controller('headerController', function ($scope, $rootScope, $location, $sessionStorage, utilityService, Auth, socket, notificationService) {
		
	- Cualquier tipo de notificación debe ir con una variable options para enviar todos los datos de la misma.

### Notificaciones.1 Generar una nueva notificación

Para generar una nueva notificación, es necesario tener un objeto de **notificationService** y de **socket** en el controlador.

Una vez que los objetos estén referenciados, con estas líneas es posible generar una nueva notificación:

```js	
$scope.sendMessage = function () {
	notificationService.emit('show:notification', {
		message: $scope.message
	});
};
```

La clave de este codigo está en la linea que dice **notificationService.emit('show:notification', {**, donde:

	- notificationService es nuestro objeto del servicio de notificaciones
	- emit es el método que levanta un llamado web socket (librería socket.io)
	- 'show:notification' es el código de evento que vamos a levantar, este código se espera en un callback de web socket
	- message es el objeto de mensaje que vamos a enviar al callback
	
El callback del web socket se encuentra en **notificationService** y es el siguiente:

```js
socket.on('show:notification', function (message) {     
	showNotification();        
});
```

Donde 

	- on es el método del servicio web socket que obtiene el evento levantado.
	- 'show:notification' es el código del evento levantado que vamos a capturar.
	- message es el objeto de mensaje que llega desde el evento
	- el interior es la función a implementar cuando se levanta el callback. En este caso llama a showNotification();

### Notificaciones.2 Generar una nueva notificación alternativa

Si lo que se quiere es realizar una nueva notificación, va a ser necesario generar el método socket.on en notificationService de la siguiente forma:

```js
socket.on('CUSTOM:NOTIFICATION', function (objeto) {     
	. . .
});
```
	
Y para llamar a dicha notificación desde un controlador, el mismo deberá obtener **socket** y **notificationService**, llamando al callback de esta forma:

```js	
notificationService.emit('CUSTOM:NOTIFICATION', {
	objeto: {}
});
```

<a name="autenticacion" />	

## Autenticación

La autenticación se maneja mediante Active Directory, utilizando la librería node **activedirectory DEL SERVICIO**

	https://github.com/gheeres/node-activedirectory
	
Ver 

	app/components/service/configuration/session-service.js
	
En dicho archivo se encuentra la configuración LDAP para ingresar al AD del servidor.

Tener en cuenta el JSON de configuración **config**

La llamada para autenticar un usuario es la siguiente:

**POST**

http://<<SERVICE>>/api/authenticate

```json
{
	"username":"usuario@kennedy.edu.ar",
	"password":"password"
}
```

<a name="invocacionWebServices" />	

## Invocar un Web Service desde el cliente

Para invocar a un servicio web, hacemos uso de la clase **utilityService** ubicada en app\shared\services.
Para hacer uso de dicha clase, hay que parametrizarla en cada controlador de la siguiente forma:

```js
 .controller('headerController', function (utilityService) {
```

Hay dos formas, mediante esta clase, de invocar un servicio:

	1. Invocación pública/anónima
	2. Invocación segura/con token

### Invocación pública/anónima

```js
utilityService.callHttp({ 
	method: "GET", 
	url: "api/menu/getall", 
	callbackSuccess: getAllMenuCallback, 
	callbackError: getAllMenuErrorCallback
});
```

Donde

- **method** es el tipo de método al que se va llamar
- **url** es la dirección del servicio.
	- Es importante que comience de la siguiente manera: "api/....."
- **callbackSuccess** es la función a la que se llamará si se retornó un status 200 o derivados.
- **callbackError** es la función a la que se llamará si se retornó un status 500 o de error.

Obviamente, ambas funciones de callback deben estar creadas. Se puede usar la misma en ambos casos.

### Invocación segura/con token

Es necesario que el controlador reciba a **$rootScope** parametrizado de la siguiente manera:

```js
 .controller('headerController', function (utilityService, $rootScope) {
```

**$rootScope** contiene el token que se enviará en las peticiones seguras, de la siguiente manera:

```js
utilityService.callSecureHttp({ 
	method: "GET", 
	url: "api/menu/getall", 
	callbackSuccess: getAllMenuCallback, 
	callbackError: getAllMenuErrorCallback
});
```

Donde

- **method** es el tipo de método al que se va llamar
- **url** es la dirección del servicio.
	- Es importante que comience de la siguiente manera: "api/....."
- **callbackSuccess** es la función a la que se llamará si se retornó un status 200 o derivados.
- **callbackError** es la función a la que se llamará si se retornó un status 500 o de error.

Obviamente, ambas funciones de callback deben estar creadas. Se puede usar la misma en ambos casos.


<a name="invocarWebServiceDesdeStoredProcedure" />	

## Invocar un Web Service desde una SQL Stored Procedure

Es necesario activar ciertas funciones en la BDD mediante este código

```sql
sp_configure 'show advanced options', 1 

GO 
RECONFIGURE WITH OVERRIDE; 
GO 
sp_configure 'Ole Automation Procedures', 1 
GO 
RECONFIGURE WITH OVERRIDE; 
GO 
sp_configure 'show advanced options', 1 
GO 
RECONFIGURE WITH OVERRIDE;
```

Luego realizamos la SP:

```sql
CREATE PROCEDURE [dbo].[sp_CallWebServices]
@param varchar(100) = NULL

AS

	DECLARE @obj INT
	DECLARE @return INT
	DECLARE @sUrl VARCHAR(200)
	DECLARE @response VARCHAR(8000)
	DECLARE @hr INT
	DECLARE @src VARCHAR(255)
	DECLARE @desc VARCHAR(255)

	SET @sUrl = 'http://10.9.0.112:9000/api/test' -- WEB SERVICE URL

	EXEC sp_OACreate 'MSXML2.ServerXMLHttp', @obj OUT
	EXEC sp_OAMethod @obj, 'Open', NULL, 'GET', @sUrl, false
	EXEC sp_OAMethod @obj, 'send'
	EXEC sp_OAGetProperty @obj, 'responseText', @response OUT

	SELECT @response [response]
	EXEC sp_OADestroy

RETURN
```
De esta forma se puede ejecutar la SP de la siguiente manera:

```sql
EXEC sp_CallWebServices 'parametro'
```

Nota importante:

	SQL no entiende quién es localhost. 
	Si se quiere llamar a un servicio local, suplantar localhost con la IP del equipo 
	(aunque sea el mismo propio). 

Otra forma de SP:

```sql
Declare @Object as Int;
Declare @ResponseText as Varchar(8000);
 
--Code Snippet
Exec sp_OACreate 'MSXML2.XMLHTTP', @Object OUT;
Exec sp_OAMethod @Object, 'open', NULL, 'get',
'http://10.9.0.112:9000/api/test', -- WEB SERVICE URL
'false'
Exec sp_OAMethod @Object, 'send'
Exec sp_OAMethod @Object, 'responseText', @ResponseText OUTPUT
 
Select @ResponseText
 
Exec sp_OADestroy @Object

```

<a name="mensajesPopup" />	

## Invocar mensajes popup

Para invocar un mensaje popup, hay que llamar al método **showMessage**, el cual se le envían las instrucciones por medio de un json. Este método se encuentre en el archivo de javascript **app/shared/services/utilityService.js**. El template html **components/main/modal/message.html** se encuentra acompañado por su controller **components/main/modal/messageController.js**

```json
{
	messageType: 3,
	messageTitle: "Confirmar y guardar",
	message: "Al presionar Aceptar se generará el movimiento de cobro por Trámite de Analítico Final en tu cuenta corriente. ¿Deseas continuar?",
	messageYes: "Aceptar",
	messageNo: "Cancelar"
}
```

Donde 

	- messageType es el tipo de mensaje(1:información 2:error 3:pregunta 4:aviso). Si no se ingresa nada, por default elegirá 1:información
	- messageTitle contiene el título que va a tener el mensaje popup. Si no se ingresa nada, por default será "Mensaje de {tipo de mensaje}"
	- message contiene el texto que se mostrará en el mensaje popup.
	- messageYes contiene el texto que se mostrará en el botón afirmativo del popup. Si no se ingresa nada, por default es "Si". Solo aparece en el mensaje de pregunta.
	- messageNo contiene el texto que se mostrará en el botón negativo del popup. Si no se ingresa nada, por default es "No". Solo aparece en el mensaje de pregunta.