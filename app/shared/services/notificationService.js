angular.module("app")
.factory('notificationService', function ($rootScope, socket) {    
    
    var socket = io($rootScope.WEB_SOCKET_URL);

    socket.on('show:notification', function (message) {     
        showNotification(message);        
    });

    
    socket.on('traInstanciaTramiteObservaciones.Updated', function (message) {     
        showEntityNotification(message);        
    });


    // notification Helpers
    var showNotification = function (eventName, callback, message) {
        
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }
        else if (Notification.permission === "granted") {
            var options = {
                body: "This is the body of the notification",
                icon: "favicon.ico",
                dir : "ltr"
            };
            var notification = new Notification("Hi there",options);
        }
        else if (Notification.permission !== 'denied') {
            
            Notification.requestPermission(function (permission) {
                
                if (!('permission' in Notification)) {
                    Notification.permission = permission;
                }
            
                if (permission === "granted") {
                    var options = {
                        body: "This is the body of the notification",
                        icon: "favicon.ico",
                        dir : "ltr"
                    };
                    var notification = new Notification("Hi there",options);
                }
            });
        }
    }

     // notification Helpers
     var showEntityNotification = function (message) { 
     
        var title = 'Aviso';
        var body = '';

        var messageJSON = JSON.parse(message);
        if(messageJSON){
            if(messageJSON.Title) title = messageJSON.Title;

        }
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }
        else if (Notification.permission === "granted") {
            var options = {
                body: title,
                icon: "favicon.ico",
                dir : "ltr"
            };
            var notification = new Notification("Hi there",options);
        }
        else if (Notification.permission !== 'denied') {
            
            Notification.requestPermission(function (permission) {
                
                if (!('permission' in Notification)) {
                    Notification.permission = permission;
                }
            
                if (permission === "granted") {
                    var options = {
                        body: "This is the body of the notification",
                        icon: "favicon.ico",
                        dir : "ltr"
                    };
                    var notification = new Notification("Hi there",options);
                }
            });
        }
    }
    
    return {        
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                if (callback) {
                    callback.apply(socket, args);
                }
                });
            })
        },
        showNotification: showNotification
    };
});