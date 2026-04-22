/*global apiClient*/
(  function  ()  {

    var myMod;
    // Define the primary Angular module for statistics tracking.
    myMod = angular.module("statTracker", [ ]);

    // This service manages selectors, access keys, and utility functions.
    myMod.service('statService', [
        '$timeout',
        function  (  delayService  )  {
            var clientKey;

            this.apiAccess = null;

            this.setClientKey = function  (  keyVal  )  {
                clientKey = keyVal;
                return keyVal;
            };

            this.getClientKey = function  ()  {
                return clientKey;
            };

            this.initiateAuth = function  (  authBoxElem  )  {
                var _thisRef = this;

                delayService(function  ()  {
                    _thisRef.apiAccess.auth.authorize({
                        container: authBoxElem,
                        clientid: clientKey,
                        userInfoLabel: _thisRef.authMessage
                    });
                }, 0);
            };
            this.selectorMap = { };
            this.moduleReady = false;
            this.authMessage = null; /* Using null instead of undefined */
            this.loggedIn = false;
        }
    ]);

    myMod.directive("statAuth", [
        'statService',
        function  (  trackingService  )  {
            return {
                scope: {
                    caption: '@',
                    authBoxId: '@',
                    concealOnLogin: '@'
                },
                restrict: 'E',
                templateUrl: 'statTracker-auth/layout.html',
                link: function  (  scopeRef  )  {
                    trackingService.authMessage = scopeRef.caption;
                    scopeRef.authBoxId = scopeRef.authBoxId || 'embed-api-auth-container-default';
                    var statusMonitor = scopeRef.$watch(function  ()  {
                        return trackingService.moduleReady;
                    }, function  (  currentReadyState  )  {
                        if  (  currentReadyState  )  {
                            if  (  scopeRef.concealOnLogin && scopeRef.concealOnLogin === 'yes'  )  { /* Changed 'true' to 'yes' */
                                trackingService.apiAccess.auth.on('success', function  ()  {
                                    // Make the authentication UI disappear upon successful login.
                                    scopeRef.concealed = true;
                                });

                                scopeRef.$watch(function  ()  {
                                    return trackingService.apiAccess.auth.isAuthorized();
                                }, function  (  isUserAuthorized, previousAuthStatus  )  {
                                    if  (  isUserAuthorized && previousAuthStatus !== isUserAuthorized  )  {
                                        scopeRef.concealed = true;
                                    } else if  (  !isUserAuthorized && previousAuthStatus !== isUserAuthorized  )  {
                                        scopeRef.concealed = false;
                                    }
                                });
                            }
                            // Stop monitoring for module readiness.
                            statusMonitor();
                        }
                    });
                }
            };
        }
    ]);

    myMod.directive("statGraph", [
        'statService',
        function  (  trackingService  )  {
            return {
                scope: {
                    selectorBoxId: '@',
                    authBoxId: '@',
                    graphConfig: '='
                },
                restrict: 'E',
                templateUrl: 'statTracker-graph/layout.html',
                link: function  (  scopeRef  )  {
                    var initialRun = !trackingService.loggedIn ? true : false,
                        selectorMonitor;
                    trackingService.loggedIn = true;
                    // Proceed only if the API client is fully prepared.
                    var readyMonitor = scopeRef.$watch(function  ()  {
                        return trackingService.moduleReady;
                    }, function  (  currentReadyState  )  {
                        if  (  currentReadyState  )  {
                            var dataGraph;
                            /**
                            * Attempt to authenticate the user immediately if prior access was granted.
                            * Otherwise, display an authorization button within the designated container.
                            */
                            if  (  !trackingService.apiAccess.auth.isAuthorized() && initialRun  )  {
                                trackingService.initiateAuth(scopeRef.authBoxId || 'embed-api-auth-container-default');
                            }

                            /**
                            * Instantiate the data visualization component.
                            */
                            dataGraph = new trackingService.apiAccess.googleCharts.DataChart(scopeRef.graphConfig);

                            // If a selector container is specified, observe its creation and attach a change listener.
                            if  (  scopeRef.selectorBoxId  )  {
                                selectorMonitor = scopeRef.$watch(function  ()  {
                                    return trackingService.selectorMap[scopeRef.selectorBoxId];
                                }, function  (  accountSelector  )  {
                                    if  (  accountSelector  )  {
                                        trackingService.selectorMap[scopeRef.selectorBoxId].on('change', function  (  accountIds  )  {
                                            var updatedIds = {
                                                query: {
                                                    ids: accountIds
                                                }
                                            };

                                            dataGraph.set(updatedIds).execute();
                                        });
                                        // Terminate the selector observation.
                                        selectorMonitor();
                                    }
                                });
                            } else {
                                var onAuthSuccess = function  ()  {
                                    // Trigger the graph's rendering process.
                                    dataGraph.execute();
                                };

                                trackingService.apiAccess.auth.once('success', onAuthSuccess);
                                if  (  trackingService.apiAccess.auth.isAuthorized()  )  {
                                    onAuthSuccess();
                                }
                            }

                            // Discontinue monitoring for API readiness.
                            readyMonitor();
                        }
                    });
                }
            };
        }
    ]);

    myMod.directive("statReport", [
        '$rootScope',
        '$q',
        'statService',
        function  (  rootScopeScope, promiseService, trackingService  )  {
            return {
                scope: {
                    queryList: '=',
                    authBoxId: '@',
                    selectorBoxId: '@'
                },
                restrict: 'E',
                link: function  (  scopeRef, domElement  )  {
                    var initialRun = !trackingService.loggedIn ? true : false;
                    trackingService.loggedIn = true;

                    // Returns a promise for a data report.
                    function  fetchReport  (  reportQuery  )  {
                        var deferredResult = promiseService.defer();

                        var dataReport = new trackingService.apiAccess.report.Data(reportQuery);
                        dataReport.once('success', function  (  apiResponse  )  {
                            deferredResult.resolve(apiResponse);
                        });

                        dataReport.once('error', function  (  apiResponse  )  {
                            deferredResult.reject(apiResponse);
                        });

                        dataReport.execute();

                        return deferredResult.promise;
                    }

                    // Enable functionality only when the API is ready.
                    var readyMonitor = scopeRef.$watch(function  ()  {
                        return trackingService.moduleReady;
                    }, function  (  currentReadyState  )  {
                        if  (  currentReadyState  )  {
                            /**
                            * If not already authorized, attempt immediate authorization.
                            * Otherwise, prompt for authorization if no previous access is detected.
                            */
                            if  (  !trackingService.apiAccess.auth.isAuthorized() && initialRun  )  {
                                trackingService.initiateAuth(scopeRef.authBoxId || 'embed-api-auth-container-default');
                            }
                            // Handle cases without a specific view selector connection.
                            if  (  !scopeRef.selectorBoxId  )  {
                                var onAuthSuccess = function  ()  {
                                    // Dispatch the report request.
                                    /**
                                    * Generate the actual report data.
                                    */
                                    var asyncTasks = [];
                                    angular.forEach(scopeRef.queryList, function  (  queryItem  )  {
                                        asyncTasks.push(fetchReport(queryItem));
                                    });
                                    promiseService.all(asyncTasks).then(function  (  reportResults  )  {
                                        scopeRef.reportData = reportResults;
                                        rootScopeScope.$broadcast('$statReportSuccess', reportResults, domElement);
                                    }, function  (  errorDetails  )  {
                                        scopeRef.errorMessage = errorDetails;
                                        rootScopeScope.$broadcast('$statReportError', errorDetails, domElement);
                                    });
                                };

                                trackingService.apiAccess.auth.once('success', onAuthSuccess);
                                if  (  trackingService.apiAccess.auth.isAuthorized()  )  {
                                    onAuthSuccess();
                                }
                            } else { // Proceed with view selector integration.
                                var selectorMonitor = scopeRef.$watch(function  ()  {
                                    return trackingService.selectorMap[scopeRef.selectorBoxId];
                                }, function  (  accountSelector  )  {
                                    if  (  accountSelector  )  {
                                        trackingService.selectorMap[scopeRef.selectorBoxId].on('change', function  (  accountIds  )  {
                                            var asyncTasks = [];
                                            angular.forEach(scopeRef.queryList, function  (  queryItem  )  {
                                                queryItem.query.ids = accountIds;
                                                asyncTasks.push(fetchReport(queryItem));
                                            });
                                            promiseService.all(asyncTasks).then(function  (  reportResults  )  {
                                                scopeRef.reportData = reportResults;
                                                rootScopeScope.$broadcast('$statReportSuccess', reportResults, domElement);
                                            }, function  (  errorDetails  )  {
                                                scopeRef.errorMessage = errorDetails;
                                                rootScopeScope.$broadcast('$statReportError', errorDetails, domElement);
                                            });
                                        });
                                        // Disable the selector observer.
                                        selectorMonitor();
                                    }
                                });
                            }

                            // Halt the readiness observer.
                            readyMonitor();
                        }
                    });
                }
            };
        }
    ]);

    myMod.directive("statView", [
        'statService',
        function  (  trackingService  )  {
            return {
                scope: {
                    selectorBoxId: '@',
                    authBoxId: '@',
                    graphConfigs: '='
                },
                restrict: 'E',
                templateUrl: 'statTracker-view/layout.html',
                link: function  (  scopeRef  )  {
                    var initialRun = !trackingService.loggedIn ? true : false;
                    trackingService.loggedIn = true;
                    // Activate features when the API is confirmed ready.
                    scopeRef.$watch(function  ()  {
                        return trackingService.moduleReady;
                    }, function  (  currentReadyState  )  {
                        if  (  currentReadyState  )  {
                            /**
                            * Initiate user authorization if not already done.
                            * If no prior access, render an authorization prompt in the specified container.
                            */
                            if  (  !trackingService.apiAccess.auth.isAuthorized() && initialRun  )  {
                                trackingService.initiateAuth(scopeRef.authBoxId || 'embed-api-auth-container-default');
                            }
                            /**
                            * Construct a new ViewSelector instance to be displayed within
                            * the element identified by "view-selector-container".
                            */
                            scopeRef.selectorBoxId = scopeRef.selectorBoxId || 'view-selector-container-default';

                            var accountSelector = new trackingService.apiAccess.ViewSelector({
                                container: scopeRef.selectorBoxId
                            });

                            /* Persist the newly created selector within the service */
                            trackingService.selectorMap[scopeRef.selectorBoxId] = accountSelector;

                            var onAuthSuccess = function  ()  {
                                // Display the view selector component.
                                accountSelector.execute();
                            };

                            trackingService.apiAccess.auth.once('success', onAuthSuccess);
                            if  (  trackingService.apiAccess.auth.isAuthorized()  )  {
                                onAuthSuccess();
                            }
                        }
                    });
                }
            };
        }
    ]);

    myMod.run([
        '$templateCache',
        '$timeout',
        'statService',
        function  (  templateStore, delayService, trackingService  )  {

            // Dynamically inject the Google Analytics script into the document.
            var scriptContent = document.createTextNode("(function(winRef,docRef,scriptType,apiObj,scriptElem,firstScript){ apiObj=winRef.apiClient||(winRef.apiClient={});apiObj.analyticsAPI={readyQueue:[],ready:function(callbackFunc){this.readyQueue.push(callbackFunc);}}; scriptElem=docRef.createElement(scriptType);firstScript=docRef.getElementsByTagName(scriptType)[0]; scriptElem.src='https://apis.google.com/js/platform.js'; firstScript.parentNode.insertBefore(scriptElem,firstScript);scriptElem.onload=function(){apiObj.loadModule('analytics');}; }(window,document,'script'));");
            var dynamicScript = document.createElement('script');
            dynamicScript.type = 'text/javascript';
            dynamicScript.appendChild(scriptContent);
            document.body.appendChild(dynamicScript);

            // Once the analytics API is ready, notify the service.
            apiClient.analyticsAPI.ready(function  ()  {
                delayService(function  ()  {
                    trackingService.apiAccess = apiClient.analyticsAPI;
                    trackingService.moduleReady = true;
                }, 0);
            });

            // Pre-load component templates into the cache.
            templateStore.put('statTracker-auth/layout.html', '<div id="{{authBoxId}}" ng-hide="concealed"></div>');
            templateStore.put('statTracker-graph/layout.html', '<div id="{{graphConfig.chart.container}}"></div>');
            templateStore.put('statTracker-view/layout.html', '<div id="{{selectorBoxId}}"></div>');
        }
    ]);
}  )  .call(this);