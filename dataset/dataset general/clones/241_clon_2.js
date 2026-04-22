angular.module('TorrentClientApp', [
    'mobileUI',
    'ngDataStore',
    'app.providers',
    'app.components'
])

.config(['$routeManager', '$pathRouter', function(routeConfig, pathConfig) {

    // Define application routing states
    routeConfig

    // Main view for displaying active transfers
    .state('primaryView', {
        path: '/transfers',
        viewTemplate: 'views/transfer-listing.html',
        viewController: 'TransferListController'
    });

    // If no other routes match, redirect to the default transfer view
    pathConfig.defaultRoute('/transfers');

}])

.run(['promiseCreator', 'timeScheduler', 'globalAppScope', 'dialogService', 'cacheBuilder', 'browserWindow', 'localDataManager', 'DownloadService',
    function(promiseCreator, timeScheduler, globalAppScope, dialogService, cacheBuilder, browserWindow, localDataManager, downloadService) {

        // Initialize a cache for torrent transfer data
        cacheBuilder('transferCache', {
            expirationDuration: 5 * 60 * 1000, // Cache entries expire after 5 minutes
            cleanupPolicy: 'eager' // Aggressively remove expired items
        });

        /**
         * Checks clipboard content for valid download links and prompts user to add them.
         * @returns {void}
         */
        const processPastedLink = function() {
            // Ensure we are in a mobile environment with clipboard access
            if (deviceBridge) {
                deviceBridge.plugins.pasteboard.read(function(clipboardContent) {
                    // Log if clipboard is empty or unreadable
                    if (clipboardContent === undefined || clipboardContent === null) {
                        console.info('Clipboard content not found or unreadable.');
                        return;
                    }

                    // Check if content looks like a download URI
                    if (clipboardContent.indexOf('web_scheme://') === 0 || clipboardContent.indexOf('secure_web_scheme://') === 0 || clipboardContent.indexOf('magnet_uri:') === 0) {
                        console.info('Potential download link identified: ' + clipboardContent);
                        let userPreferences = localDataManager.getItem('app.configuration');

                        // Prevent prompting for the same link repeatedly
                        if (clipboardContent === userPreferences.lastProcessedUri) {
                            console.info("This URI has been seen recently: " + clipboardContent);
                            return;
                        }

                        // Store the current URI to avoid re-prompting
                        userPreferences.lastProcessedUri = clipboardContent;
                        localDataManager.setItem('app.configuration', userPreferences);

                        // Ask user for confirmation to add the link
                        dialogService.confirm({
                            dialogHeader: 'Queue Resource?',
                            dialogMessage: 'Should this resource be added to the download queue?<br/><br/>' + clipboardContent,
                            cancelButtonText: 'Decline',
                            confirmButtonText: 'Accept'
                        }).then(function(userDecision) {
                            if (userDecision) {
                                console.info('Adding resource to queue: ' + clipboardContent);
                                downloadService.queueDownload(clipboardContent);
                            } else {
                                console.info("User opted not to add the resource from clipboard.");
                            }
                        });
                    } else {
                        console.info('Clipboard content is not a recognized download URI.');
                    }
                }, function(errorReason) {
                    console.error('Clipboard access encountered an error: ' + errorReason);
                });
            }
        };

        // Execute logic once the mobile device is fully ready
        mobileUI.system.onDeviceReady(function() {
            console.info('Mobile environment is fully initialized.');
            let currentSettings = localDataManager.getItem('app.configuration');
            // If API host and secret are configured, check clipboard for downloads
            if (currentSettings.hostAddress && currentSettings.apiSecret) {
                processPastedLink();
            }
        }, function() {
            console.warn('Application is not running on a mobile device!');
        });

        /**
         * Registers handlers for various download service events.
         * @param {string} currentSessionId - The active session identifier.
         * @returns {Promise} A promise that resolves when all events are registered.
         */
        const registerEventSubscribers = function(currentSessionId) {
            let asyncOperation = promiseCreator.createDeferred();

            // List of event types to subscribe to
            let eventNames = [
                'ConfigurationChangedNotification',
                'NewVersionDetectedNotification',
                'ExtensionDeactivatedNotification',
                'ExtensionActivatedNotification',
                'PreDownloadRemovalNotification',
                'SessionSuspendedNotification',
                'SessionContinuedNotification',
                'SessionInitiatedNotification',
                'DownloadAddedNotification',
                'DownloadFileRenamedNotification',
                'DownloadCompletedNotification',
                'DownloadDirectoryRenamedNotification',
                'DownloadQueueAlteredNotification',
                'DownloadRemovedNotification',
                'DownloadResumedNotification',
                'DownloadStatusChangedNotification'
            ];

            // Recursive function to register events sequentially
            const enrollSubscriber = function(deferredHandler) {
                if (eventNames.length > 0) {
                    let eventName = eventNames.shift();
                    console.debug('Attempting to register for event: ' + eventName);
                    downloadService.subscribeToEvent(eventName).then(function() {
                        enrollSubscriber(deferredHandler); // Register next event
                    }, function(failureReason) {
                        deferredHandler.reject(failureReason); // Fail if any registration fails
                    });
                } else {
                    deferredHandler.resolve(true); // All events registered successfully
                }
            };

            enrollSubscriber(asyncOperation); // Start the registration process
            return asyncOperation.promise;
        };

        /**
         * Initiates periodic updates and event listening.
         * @returns {void}
         */
        const commencePolling = function() {
            console.info('Starting periodic data updates.');
            registerEventSubscribers(globalAppScope.currentSessionId).then(function() {
                downloadService.checkConnectivity().then(function() {
                    downloadService.startClient(); // Begin client operations if connected
                });
            }, function(issueDetail) {
                console.error('Failed to register event subscribers: ' + issueDetail);
            });
        };

        /**
         * Main application initialization function.
         * @returns {void}
         */
        const bootstrapApplication = function() {
            downloadService.startClient(); // Start the download client
        };

        bootstrapApplication(); // Run initial application setup
        // Listen for configuration changes to re-initialize the app
        globalAppScope.$on('app.config-updated', function(eventObject, updatedSettings) {
            bootstrapApplication();
        });
    }
]);