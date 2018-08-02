angular.module('app')
    .factory('utilityService', ['$http', '$rootScope', '$uibModal', '$q', '$filter', '$interval', 'myUrl', '$cookies',
        function utilityService($http, $rootScope, $uibModal, $q, $filter, $interval, myUrl, $cookies) {
            var service = {
                showMessage: showMessage,
                callHttp: callHttp,
                callSecureHttp: callSecureHttp,
                callExternalHttp: callExternalHttp,
                openModal: openModal,
                formatDate: formatDate,
                addWorkDays: addWorkDays,
                removeByKey: removeByKey,
                getByKey: getByKey
            };

            return service;

            function modalDraggable() {
                setTimeout(function () {
                    $(".modal-content").draggable({
                        handle: ".modal-header",
                        opacity: 0.85,
                        distance: 10,
                        scroll: true,
                        stop: function () { },
                        drag: function (e, ui) {
                            var w = $(ui.helper[0]).width();
                            if (ui.offset.left < 1 || ui.offset.left > window.innerWidth - w) {
                                ui.position.left = ui.originalPosition.left;
                            }
                            else {
                                ui.originalPosition.left = ui.position.left;
                            }

                            var h = $(ui.helper[0]).height();
                            if (ui.offset.top < 1 || ui.offset.top > window.innerHeight - h) {
                                ui.position.top = ui.originalPosition.top;
                            }
                            else {
                                ui.originalPosition.top = ui.position.top;
                            }

                        }
                    });
                    $(".modal-header").css("cursor", "move");
                }, 150);
            };

            function openModal(modalConfig) {
                var callConfig = {
                    animation: true,
                    backdrop: 'static',
                    keyboard: false,
                    size: 'medium',
                    isHisOwnCrud: true
                };

                $.extend(callConfig, modalConfig);

                var makeTitle = function () {
                    var title = "";
                    if (!callConfig.isHisOwnCrud) {
                        title = title + callConfig.entity + " > ";
                    }

                    var action = "create";
                    if (callConfig.action) {
                        action = callConfig.action;
                    }
                    else if (callConfig.resolve.items().action) {
                        action = callConfig.resolve.items().action;
                    }

                    if (action == "edit") {
                        title = title + $filter('translate')('generic.button.edit');
                    }
                    else if (action == "create") {
                        title = title + $filter('translate')('generic.button.new');
                    }
                    else if (action == "show") {
                        title = title + modalConfig.route.Show;
                    }
                    else if (action == "delete") {
                        title = title + $filter('translate')('generic.button.delete');
                    }

                    return title;
                }


                var title = makeTitle();
                var resolve;

                //si no tiene la accion en esta instancia, deberia estar ya embebida en el resolve
                if (callConfig.action) {
                    //si dispone de validaciones embebidas en el resolve
                    if (callConfig.resolve.validations) {
                        resolve = {
                            items: function () {
                                var objectCollection = $.extend(callConfig.resolve.items(), { action: callConfig.action }, { MessageTittle: title });

                                return objectCollection;
                            },
                            validations: callConfig.resolve.validations

                        }
                    }
                    else {
                        resolve = {
                            items: function () {
                                var objectCollection = $.extend(callConfig.resolve.items(), { action: callConfig.action }, { MessageTittle: title });

                                return objectCollection;
                            }
                        }
                    }
                }
                else {
                    if (callConfig.resolve.validations) {
                        resolve = {
                            items: function () {
                                var objectCollection = $.extend(callConfig.resolve.items(), { MessageTittle: title });
                                return objectCollection;
                            },
                            validations: callConfig.resolve.validations
                        }
                    }
                    else {
                        resolve = {
                            items: function () {
                                var objectCollection = $.extend(callConfig.resolve.items(), { MessageTittle: title });

                                return objectCollection;
                            }
                        }
                    }
                }

                var modalInstance = $uibModal.open({
                    animation: callConfig.animation,
                    backdrop: callConfig.backdrop,
                    keyboard: callConfig.keyboard,
                    size: callConfig.size,
                    templateUrl: callConfig.templateUrl,
                    controller: callConfig.controller,
                    resolve: resolve
                });

                modalDraggable();
                return modalInstance;
            };



            function callHttp(httpCallConfig) {
                var callConfig = {
                    method: "GET",
                    host: myUrl.base,
                    url: "/api/entity/action",
                    callbackSuccess: function (response) { },
                    callbackError: function (response, status, headers, config) { },
                    runDefaultErrorHandler: false,
                    noblock: false,
                    data: null
                };

                $.extend(callConfig, httpCallConfig);

                $http({ noBlock: callConfig.noblock, method: callConfig.method, headers: { 'Content-Type': "application/json", 'User': $cookies.get("user") }, url: callConfig.host + callConfig.url, data: callConfig.data })
                    .then(function (response) {
                        callConfig.callbackSuccess(response);
                    }), function errorCallback(response, status, headers, config) {

                        callConfig.callbackError(response, status, headers, config);

                        if (callConfig.runDefaultErrorHandler) {
                            defaultErrorHandler(response, status, headers, config);
                        }
                    };

            };

            function callSecureHttp(httpCallConfig) {
                var callConfig = {
                    method: "GET",
                    host: myUrl.base,
                    url: "/api/entity/action",
                    callbackSuccess: function (response) { },
                    callbackError: function (response, status, headers, config) { },
                    runDefaultErrorHandler: false,
                    noblock: false,
                    data: null,
                    contentType: "application/json"
                };

                $.extend(callConfig, httpCallConfig);

                $http({ noBlock: callConfig.noblock, method: callConfig.method, headers: { 'Content-Type': callConfig.contentType, 'User': $cookies.get("user"), 'token': $cookies.get("token") }, url: callConfig.host + callConfig.url, data: callConfig.data })
                    .then(function (response) {
                        callConfig.callbackSuccess(response);
                    }), function errorCallback(response, status, headers, config) {

                        callConfig.callbackError(response, status, headers, config);

                        if (callConfig.runDefaultErrorHandler) {
                            defaultErrorHandler(response, status, headers, config);
                        }
                    };

            };

            function callExternalHttp(httpExternalConfig) {

                var callConfig = {
                    method: httpExternalConfig.method,
                    host: httpExternalConfig.host,
                    url: httpExternalConfig.url,
                    callbackSuccess: function (response) { },
                    callbackError: function (response, status, headers, config) { },
                    runDefaultErrorHandler: false,
                    noblock: false,
                    data: httpExternalConfig.data
                };

                $.extend(callConfig, httpExternalConfig);

                $http({ 
                        noBlock: callConfig.noblock, 
                        method: callConfig.method, 
                        headers: { 'Content-Type': "application/json" }, 
                        url: callConfig.host + callConfig.url, 
                        data: callConfig.data 
                    })
                    .then(function (response) {
                        callConfig.callbackSuccess(response);
                    }), function errorCallback(response, status, headers, config) {

                        callConfig.callbackError(response, status, headers, config);

                        if (callConfig.runDefaultErrorHandler) {
                            defaultErrorHandler(response, status, headers, config);
                        }
                    };

            };

            function defaultErrorHandler(response, status, headers, config) {
                if (status == 409) {
                    if (response.code == 1) {
                        showMessages("Error de integridad de datos", "Un registro obtenido desde la base de datos está corrupto. No se puede operar con él.", false);
                    }
                    else if (response.code == 2) {
                        showMessages("Error de concurrencia", "Alguien estuvo trabajando con este registro. Refresque la página para obtener la última versión.", false);
                    }
                }
            }


            function showMessage(data) {
                var messageTypeString;
                switch (data.messageType) {
                    case 1: messageTypeString = "información";
                        break;
                    case 2: messageTypeString = "error";
                        break;
                    case 3: messageTypeString = "pregunta";
                        break;
                    case 4: messageTypeString = "aviso";
                        break;
                    default: messageTypeString = "información";
                        break;
                }

                var modal = $uibModal.open({
                    animation: true,
                    backdrop: 'static',
                    keyboard: false,
                    size: 'medium',
                    templateUrl: 'app/components/main/modal/message.html',
                    controller: 'messageController as mc',
                    resolve: {
                        items: function () {
                            return {
                                MessageType: messageTypeString,
                                Message: data.message,
                                MessageTitle: data.messageTitle,
                                MessageYes: data.messageYes,
                                MessageNo: data.messageNo
                            };
                        }
                    }
                });

                //modalDraggable();
                return modal;
            }

            function formatDate(date,shortDate) {

                date = new Date(date);
                
                var dayOfMonth = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                var hour = date.getHours();
                var minute = date.getMinutes();
                var second = date.getSeconds();

                var dayOfMonthString = dayOfMonth < 10 ? '0' + dayOfMonth : dayOfMonth;
                var monthString = month < 10 ? '0' + month : month;

                var hourString = hour < 10 ? '0' + hour : hour;
                var minuteString = minute < 10 ? '0' + minute : minute;
                var secondString = second < 10 ? '0' + second : second;


                if(shortDate){
                    var dateString = dayOfMonthString + '/' + monthString + '/' + year;
                }else{
                    var dateString = dayOfMonthString + '/' + monthString + '/' + year + ' ' + hourString + ':' + minuteString + ':' + secondString;
                }



                //var dateDay = date.

                return dateString;
            }

            function addWorkDays(startDate, days) {
                if(isNaN(days)) {
                    console.log("Value provided for \"days\" was not a number");
                    return
                }
                if(!(startDate instanceof Date)) {
                    console.log("Value provided for \"startDate\" was not a Date object");
                    return
                }
                // Get the day of the week as a number (0 = Sunday, 1 = Monday, .... 6 = Saturday)
                var dow = startDate.getDay();
                var daysToAdd = parseInt(days);
                // If the current day is Sunday add one day
                if (dow == 0)
                    daysToAdd++;
                // If the start date plus the additional days falls on or after the closest Saturday calculate weekends
                if (dow + daysToAdd >= 6) {
                    //Subtract days in current working week from work days
                    var remainingWorkDays = daysToAdd - (5 - dow);
                    //Add current working week's weekend
                    daysToAdd += 2;
                    if (remainingWorkDays > 5) {
                        //Add two days for each working week by calculating how many weeks are included
                        daysToAdd += 2 * Math.floor(remainingWorkDays / 5);
                        //Exclude final weekend if remainingWorkDays resolves to an exact number of weeks
                        if (remainingWorkDays % 5 == 0)
                            daysToAdd -= 2;
                    }
                }
                startDate.setDate(startDate.getDate() + daysToAdd);
                return startDate;
            }

            function removeByKey(array, params){
                array.some(function(item, index) {
                  return (array[index][params.key] === params.value) ? !!(array.splice(index, 1)) : false;
                });
                return array;
            }
            
            function getByKey(array, params){
                var indexOut = 0;
                array.some(function(item, index) {
                  indexOut = index;
                  return (array[index][params.key] === params.value) ? array[index] : false;
                });
                return array[indexOut];
            }

        }]);
    
