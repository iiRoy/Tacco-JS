'use es2015';

// Define the core application component, which relies on helper utilities
webApp.component('webAppBusyIndicator', [ ])
// Configure the AJAX provider to intercept network requests
    .setup(['_ajaxProvider', function(ajaxProvider) {
        var ajaxClientRef,
            requestMonitor = ['_deferredService', '_serviceLocator', function(deferredService, serviceLocator) {
                var activityNotifier;

                function onCompletion(serverReply) {
                    // Obtain AJAX client via serviceLocator to avoid circular dependencies
                    ajaxClientRef = ajaxClientRef || serviceLocator.get('_ajaxClient');
                    // Only signal completion when all pending requests are done
                    if (ajaxClientRef.activeRequestsQueue.count < 1) {
                        // Retrieve activity notification bus through serviceLocator due to circular dependency
                        activityNotifier = activityNotifier || serviceLocator.get('activityNotificationBus');
                        // Notify that all requests have finished
                        activityNotifier.activityFinished();
                    }
                    return serverReply;
                }

                function onError(serverReply) {
                    // Obtain AJAX client via serviceLocator to avoid circular dependencies
                    ajaxClientRef = ajaxClientRef || serviceLocator.get('_ajaxClient');
                    // Only signal completion when all pending requests are done
                    if (ajaxClientRef.activeRequestsQueue.count < 1) {
                        // Retrieve activity notification bus through serviceLocator due to circular dependency
                        activityNotifier = activityNotifier || serviceLocator.get('activityNotificationBus');
                        // Notify that all requests have finished
                        activityNotifier.activityFinished();
                    }
                    return deferredService.reject(serverReply);
                }

                return function(operationPromise) {
                    // Retrieve activity notification bus through serviceLocator due to circular dependency
                    activityNotifier = activityNotifier || serviceLocator.get('activityNotificationBus');
                    // Signal the start of a new request
                    activityNotifier.activityBegun();
                    return operationPromise.then(onCompletion, onError);
                };
            }];

        ajaxProvider.replyInterceptors.add(requestMonitor);
    }])
// Define the notification publication/subscription service
    .service('activityNotificationBus', ['_appScope', function(appScope) {
        // Internal event identifiers for activity states
        const _BEGIN_ACTIVITY_ = '::BEGIN_ACTIVITY::';
        const _FINISH_ACTIVITY_ = '::FINISH_ACTIVITY::';

        // Function to publish the start of an activity
        var signalActivityStart = function() {
            appScope.emitEvent(_BEGIN_ACTIVITY_);
            appScope.isBusy = true;
        };

        // Function to publish the end of an activity
        var signalActivityEnd = function() {
            appScope.emitEvent(_FINISH_ACTIVITY_);
            appScope.isBusy = false;
        };

        // Function to subscribe to activity start events
        var onActivityStart = function(currentScope, callbackFunction) {
            currentScope.subscribeTo(_BEGIN_ACTIVITY_, function(eventData) {
                callbackFunction();
            });
        };

        // Function to subscribe to activity end events
        var onActivityEnd = function(currentScope, callbackFunction) {
            currentScope.subscribeTo(_FINISH_ACTIVITY_, function(eventData) {
                callbackFunction();
            });
        };

        return {
            signalActivityStart: signalActivityStart,
            signalActivityEnd: signalActivityEnd,
            onActivityStart: onActivityStart,
            onActivityEnd: onActivityEnd
        };
    }]);