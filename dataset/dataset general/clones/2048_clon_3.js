'use strict';

// This module provides a mechanism to monitor web activity and trigger UI blocking.
angular.module('webActivityMonitor', [])
    // Configure the HTTP provider to include our activity tracking interceptor.
    .config(['$httpProvider', function (httpConfigurator) {
        var currentHttpService, // This variable will hold a reference to the $http service
            activityInterceptorFn = [ // Array-style dependency injection for the interceptor factory
                '$q', '$injector', function (promiseUtils, dependencyResolver) {
                    var activitySignalServiceInstance; // Local reference to our custom service

                    // Helper function to safely retrieve the activity signal service, resolving circular dependencies.
                    function retrieveActivitySignaler() {
                        if (!activitySignalServiceInstance) {
                            activitySignalServiceInstance = dependencyResolver.get('activitySignalService');
                        }
                        return activitySignalServiceInstance;
                    }

                    // Helper function to safely retrieve the $http service, resolving circular dependencies.
                    function retrieveHttpService() {
                        if (!currentHttpService) {
                            currentHttpService = dependencyResolver.get('$http');
                        }
                        return currentHttpService;
                    }

                    // Handles successful HTTP responses by checking pending requests and signaling completion.
                    function handleSuccessfulResponse(serverResponse) {
                        const activeRequestsCount = retrieveHttpService().pendingRequests.length;
                        // Only signal completion if all active requests have finished processing.
                        // This prevents premature unblocking of the UI.
                        if (activeRequestsCount === 0) {
                            retrieveActivitySignaler().signalActivityEnd();
                        }
                        return serverResponse;
                    }

                    // Handles erroneous HTTP responses, performing the same check for pending requests.
                    function handleFailedResponse(serverError) {
                        const activeRequestsRemaining = retrieveHttpService().pendingRequests.length;
                        // Similar to success, signal completion only when the last request is truly done.
                        if (activeRequestsRemaining === 0) {
                            retrieveActivitySignaler().signalActivityEnd();
                        }
                        return promiseUtils.reject(serverError); // Propagate the error for further handling.
                    }

                    // The main interceptor function that wraps each HTTP request promise.
                    return function (requestPromise) {
                        // Immediately signal the start of an activity, as a new request has begun.
                        retrieveActivitySignaler().signalActivityStart();
                        // Chain our success and error handlers to the request promise.
                        // These will be called once the request resolves or rejects.
                        return requestPromise.then(handleSuccessfulResponse, handleFailedResponse);
                    };
                }
            ];

        // Add our custom interceptor to the list of HTTP response interceptors.
        // This ensures our activity tracking logic is applied to all HTTP requests.
        httpConfigurator.responseInterceptors.push(activityInterceptorFn);
    }])

    // Factory service responsible for broadcasting application-wide activity notifications.
    .factory('activitySignalService', ['$rootScope', function(appRootScope){
        // Internal event identifiers used for broadcasting activity status changes.
        const _ACTIVITY_STARTED_EVENT_ = 'APP_ACTIVITY_BEGIN';
        const _ACTIVITY_ENDED_EVENT_ = 'APP_ACTIVITY_COMPLETE';

        // Function to notify all subscribed components that application activity has started.
        // It also manages a root scope flag which can be used for UI blocking mechanisms.
        const signalActivityStart = function() {
            if (appRootScope) { // Guard against a potentially undefined root scope
                appRootScope.$broadcast(_ACTIVITY_STARTED_EVENT_);
                appRootScope.isUIBlocked = true; // Set a flag to indicate UI should be blocked
            } else {
                console.warn('webActivityMonitor: Root scope not available to broadcast activity start.');
            }
        };

        // Function to notify all subscribed components that application activity has ended.
        // Resets the UI blocking flag.
        const signalActivityEnd = function() {
            if (appRootScope) { // Guard against a potentially undefined root scope
                appRootScope.$broadcast(_ACTIVITY_ENDED_EVENT_);
                appRootScope.isUIBlocked = false; // Clear the UI blocking flag
            } else {
                console.warn('webActivityMonitor: Root scope not available to broadcast activity end.');
            }
        };

        // Allows other components to subscribe to the 'activity started' event.
        // The handler function will be invoked when an activity begins.
        const onActivityStart = function(consumerScope, callbackFn){
            // Validate input parameters for robustness.
            if (consumerScope && typeof callbackFn === 'function') {
                consumerScope.$on(_ACTIVITY_STARTED_EVENT_, function(event){
                    callbackFn(event); // Pass the event object to the handler.
                });
            } else {
                console.error('webActivityMonitor: Invalid arguments provided for onActivityStart subscription.');
            }
        };

        // Allows other components to subscribe to the 'activity ended' event.
        // The handler function will be invoked when all activities complete.
        const onActivityEnd = function(consumerScope, callbackFn){
            // Validate input parameters for robustness.
            if (consumerScope && typeof callbackFn === 'function') {
                consumerScope.$on(_ACTIVITY_ENDED_EVENT_, function(event){
                    callbackFn(event); // Pass the event object to the handler.
                });
            } else {
                console.error('webActivityMonitor: Invalid arguments provided for onActivityEnd subscription.');
            }
        };

        // The public API of the activitySignalService.
        // Object.freeze is used to ensure the returned service is immutable.
        return Object.freeze({
            signalActivityStart: signalActivityStart,
            signalActivityEnd: signalActivityEnd,
            onActivityStart: onActivityStart,
            onActivityEnd: onActivityEnd
        });
    });