/*
 * Strict mode declaration for JavaScript.
 * Ensures cleaner code by catching common coding errors and "unsafe" actions.
 */
'use strict';


// This module, 'ngBlockui', is defined here.
// It currently has no external dependencies listed in its array.
angular
    .module(
        'ngBlockui',
        [] // An empty array, indicating no module dependencies.
    )

    /*
     * Configuration block for the 'ngBlockui' module.
     * Here we declare an HTTP interceptor to track request states.
     */
    .config(
        [
            '$httpProvider', // Dependency injection for $httpProvider.
            function ($httpProvider) { // The configuration function itself.

                // Declare $http variable (will be populated via $injector later).
                var $http,
                    /*
                     * Define the HTTP interceptor.
                     * This will be pushed into $httpProvider.responseInterceptors.
                     */
                    interceptor = [
                        '$q', // Promise service dependency.
                        '$injector', // Dependency injector service.
                        function (
                            $q, // The promise service.
                            $injector // The injector service.
                        ) {
                            var notificationChannel; // Variable to hold the notification channel.

                            /**
                             * Handler for successful HTTP responses.
                             * @param {Object} response - The HTTP response object.
                             * @returns {Object} The original response.
                             */
                            function success(response) {
                                // Lazy-load $http via $injector to avoid circular dependency with $httpProvider.
                                $http = $http || $injector.get('$http');

                                // Only send a 'request ended' notification when all pending requests are complete.
                                if (
                                    $http.pendingRequests.length < 1
                                ) {
                                    // Lazy-load requestNotificationChannel.
                                    notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');

                                    // Signal that requests have completed.
                                    notificationChannel.requestEnded();
                                }
                                return response; // Return the response to the next interceptor or caller.
                            }


                            /**
                             * Handler for erroneous HTTP responses.
                             * @param {Object} response - The HTTP response object.
                             * @returns {Promise} A rejected promise with the response.
                             */
                            function error(response) {
                                // Get the $http service instance using $injector to resolve circular dependency.
                                $http = $http || $injector.get('$http');

                                // Check if there are no more pending requests before signaling completion.
                                if ( $http.pendingRequests.length < 1 ) {
                                    // Retrieve the request notification channel.
                                    notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');

                                    // Broadcast that all requests have finished.
                                    notificationChannel.requestEnded();
                                }
                                // Reject the promise to propagate the error.
                                return $q.reject(response);
                            }

                            // The main interceptor function that wraps the promise.
                            return function (promise) {
                                // Ensure notificationChannel is initialized.
                                notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');

                                // Signal the beginning of an HTTP request.
                                notificationChannel.requestStarted();

                                // Attach success and error handlers to the promise.
                                return promise.then(success, error);
                            };
                        }
                    ];

                // Add the custom interceptor to the list of HTTP response interceptors.
                $httpProvider.responseInterceptors.push(
                    interceptor
                );
            }
        ]
    )

    /*
     * Factory for 'requestNotificationChannel'.
     * This service provides a pub/sub mechanism for HTTP request notifications.
     */
    .factory(
        'requestNotificationChannel', // Name of the factory service.
        [
            '$rootScope', // Dependency: Angular's root scope.
            function(
                $rootScope // Injected root scope instance.
            ) {
                // Internal constants for notification message names.
                var _START_REQUEST_ = '_START_REQUEST_'; // Message for request start.
                var _END_REQUEST_   = '_END_REQUEST_';   // Message for request end.


                // Function to publish a 'request started' notification.
                var requestStarted = function() {
                    // Broadcast the start request event across the application.
                    $rootScope.$broadcast(_START_REQUEST_);
                    // Set a flag on the root scope, potentially for UI blocking.
                    $rootScope.blockUI = true;
                };

                // Function to publish a 'request ended' notification.
                var requestEnded = function() {
                    // Broadcast the end request event.
                    $rootScope.$broadcast(_END_REQUEST_);
                    // Clear the UI blocking flag.
                    $rootScope.blockUI = false;
                };

                // Function to subscribe to 'request started' notifications.
                var onRequestStarted = function($scope, handler){
                    // Listen for the _START_REQUEST_ event on the given scope.
                    $scope.$on(
                        _START_REQUEST_,
                        function(event){
                            // Execute the provided handler function when the event occurs.
                            handler();
                        }
                    );
                };

                // Function to subscribe to 'request ended' notifications.
                var onRequestEnded = function($scope, handler){
                    // Register an event listener for _END_REQUEST_ on the specified scope.
                    $scope.$on(
                        _END_REQUEST_,
                        function(event){
                            // Call the handler function.
                            handler();
                        }
                    );
                };

                // Public API of the requestNotificationChannel service.
                return {
                    requestStarted:   requestStarted,   // Method to signal request start.
                    requestEnded:     requestEnded,     // Method to signal request end.
                    onRequestStarted: onRequestStarted, // Method to subscribe to request start.
                    onRequestEnded:   onRequestEnded    // Method to subscribe to request end.
                };
            }
        ]
    );