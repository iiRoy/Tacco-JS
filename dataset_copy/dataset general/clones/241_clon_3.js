angular.module('FluidFlowApp', [
    'ngIonicModule',
    'cache.manager.angular',
    'flow.services',
    'flow.controllers'
])

.config(['$routeConfigurator', '$pathResolver', function($routeConfigurator, $pathResolver) {

    // Define a constant for the base path of application views
    const APPLICATION_VIEW_BASE_PATH = 'app/views/';

    $routeConfigurator

    // Configure the main dashboard state for active downloads
    .state('downloadDashboard', {
        url: '/active-downloads',
        templateUrl: APPLICATION_VIEW_BASE_PATH + 'download-list-view.html',
        controller: 'DownloadListController'
    });

    // The previously commented-out states (e.g., 'tab', 'tab.downloads-index', etc.)
    // have been intentionally removed as part of Type III code deletion,
    // signifying a streamlined application structure or a refocused scope.

    // Define the default fallback route if no other states match
    $pathResolver.otherwise('/active-downloads');

}])

.run(['$promiseService', '$timingService', '$appScope', '$modalDialog', '$dataCacheFactory', '$browserWindow', 'persistentStore', 'TorrentManagementService',
    function($promiseService, $timingService, $appScope, $modalDialog, $dataCacheFactory, $browserWindow, persistentStore, torrentManager) {

    // Configuration for the download metadata cache
    const CACHE_LIFETIME_MINUTES = 5;
    const CACHE_LIFETIME_MILLISECONDS = CACHE_LIFETIME_MINUTES * 60 * 1000; // Calculated as 300,000 ms

    // Initialize an application-wide data cache
    $dataCacheFactory('downloadMetadataCache', {
        maxAge: CACHE_LIFETIME_MILLISECONDS,
        deleteOnExpire: 'aggressive',
        storageMode: 'localStorage' // Added a new fragment: cache persistence mode
    });

    /**
     * Utility function to determine if a string begins with any of the provided prefixes.
     * @param {string} inputString The string to evaluate.
     * @param {string[]} prefixList An array of potential starting strings.
     * @returns {boolean} True if inputString starts with any prefix in prefixList, otherwise false.
     */
    const checkStringStart = (inputString, prefixList) => {
        if (!inputString || !Array.isArray(prefixList) || prefixList.length === 0) {
            return false;
        }
        // Iterate through prefixes and return true on the first match
        return prefixList.some(prefix => inputString.startsWith(prefix));
    };

    /**
     * Processes content obtained from the device's clipboard.
     * If a valid torrent or magnet link is found, the user is prompted to add it.
     */
    const processClipboardContent = function() {
        // Guard clause: Ensure the Cordova clipboard plugin is available in the environment
        if (!$browserWindow.cordova || !$browserWindow.cordova.plugins || !$browserWindow.cordova.plugins.clipboard) {
            console.warn('Cordova clipboard plugin not detected. Clipboard processing skipped.');
            return;
        }

        $browserWindow.cordova.plugins.clipboard.paste(function(clipboardText) {
            // Validate clipboard content: ignore if undefined, null, or empty after trimming
            if (clipboardText === undefined || clipboardText === null || clipboardText.trim() === '') {
                console.log('Clipboard content is empty or unreadable.');
                return;
            }

            // Define the set of recognized URL schemes for torrents
            const recognizedLinkSchemes = ['http://', 'https://', 'magnet:'];

            if (checkStringStart(clipboardText, recognizedLinkSchemes)) { // Using the new helper function
                console.log(`Identified a potential download link: ${clipboardText}`);

                // Fetch current user preferences from persistent storage
                let userAppPreferences = persistentStore.get('app.preferences'); // Renamed 'dm.settings' to 'app.preferences'

                // Ensure preferences object is valid; initialize if missing
                if (!userAppPreferences || typeof userAppPreferences !== 'object') {
                    console.info('Application preferences not found or invalid; initializing default.');
                    userAppPreferences = {};
                    persistentStore.set('app.preferences', userAppPreferences);
                }

                // Prevent re-processing the same link if it was recently handled
                if (clipboardText === userAppPreferences.lastProcessedLink) { // Renamed 'lastUrl' to 'lastProcessedLink'
                    console.info(`Link "${clipboardText}" has already been handled in a previous session.`);
                    return;
                }

                // Update the stored last processed link
                userAppPreferences.lastProcessedLink = clipboardText;
                persistentStore.set('app.preferences', userAppPreferences);

                // Configuration for the confirmation pop-up
                const confirmationPromptOptions = { // New fragment: object for popup options
                    title: 'Initiate New Download?',
                    subTitle: `Do you want to add this URL to your active downloads?<br/><br/><i>${clipboardText}</i>`,
                    cancelText: 'Decline',
                    okText: 'Proceed'
                };

                $modalDialog.confirm(confirmationPromptOptions) // Using new name and options object
                    .then(function(userAccepts) { // Renamed 'result' to 'userAccepts'
                        if (userAccepts) {
                            console.log(`User confirmed. Adding: ${clipboardText}`);
                            torrentManager.initiateDownload(clipboardText); // Renamed 'deluge.add' to 'torrentManager.initiateDownload'
                        } else {
                            console.log("User declined to add the clipboard link.");
                        }
                    });
            } else {
                console.log('Clipboard content is not a recognized torrent or magnet link format.');
            }
        }, function(clipboardError) { // Renamed 'error' to 'clipboardError'
            console.error(`Error retrieving clipboard content: ${clipboardError.message || clipboardError}`);
        });
    };

    // Handler for when the Ionic platform is fully ready
    const onPlatformInitialized = function() {
        console.log('Ionic framework and device platform are ready.');
        let currentAppConfig = persistentStore.get('app.preferences'); // Renamed 'settings' to 'currentAppConfig'

        // New fragment: Validate essential configuration before proceeding
        if (!currentAppConfig || !currentAppConfig.serverAddress || !currentAppConfig.authenticationKey) { // Renamed properties
            console.warn('Crucial application configuration (server address or authentication key) is missing. Skipping clipboard check.');
            $modalDialog.alert({ // New fragment: Inform user about missing config
                title: 'Configuration Required',
                template: 'Please configure your torrent server details in the application settings to enable full functionality.'
            });
            return;
        }

        processClipboardContent(); // Call the renamed function
    };

    // Handler for when the Ionic platform is not ready (e.g., running in a browser)
    const onPlatformUnavailable = function() {
        console.info('Application is running in a non-mobile environment or platform initialization failed.');
    };

    // Register platform ready listeners
    $browserWindow.ionic.Platform.ready(onPlatformInitialized, onPlatformUnavailable);

    /**
     * Subscribes the application to a predefined set of torrent management events.
     * @param {string} currentSessionIdentifier The unique ID for the current user session.
     * @returns {Promise<boolean>} A promise that resolves to true upon successful registration of all events.
     */
    const subscribeToTorrentEvents = function(currentSessionIdentifier) { // Renamed 'registerListeners'
        const eventRegistrationPromise = $promiseService.defer(); // Renamed 'deferred' to 'eventRegistrationPromise'

        // List of torrent-related events to which the application will subscribe
        const torrentEventTypes = [ // Renamed 'events' and reordered/renamed event names
            'TorrentAdded',
            'TorrentRemoved',
            'TorrentStateChanged',
            'TorrentFinished',
            'SessionStarted',
            'SessionPaused',
            'SessionResumed',
            'ConfigurationUpdated',
            'ApplicationVersionCheckCompleted', // Renamed from NewVersionAvailableEvent
            'PluginActivated',
            'PluginDeactivated',
            'PreTorrentDeletion',
            'FileRenamed',
            'FolderRenamed',
            'QueueModified'
        ];

        let eventIterator = 0; // New fragment: iterator for managing event registration loop

        // Function to iteratively register events
        const performEventRegistration = () => { // Renamed 'registerEvent'
            if (eventIterator < torrentEventTypes.length) {
                const currentEventType = torrentEventTypes[eventIterator]; // Renamed 'ev'
                console.log(`Attempting to register for event: ${currentEventType}`);

                torrentManager.registerForEvent(currentEventType) // Renamed 'deluge.registerEventListener'
                    .then(() => {
                        eventIterator++; // Move to the next event
                        performEventRegistration(); // Recursively call for the next event
                    })
                    .catch(registrationError => { // Using modern promise catch syntax
                        console.error(`Failed to register for event "${currentEventType}":`, registrationError);
                        eventRegistrationPromise.reject(new Error(`Event subscription failed for ${currentEventType}`));
                    });
            } else {
                console.log('All required torrent events have been successfully registered.');
                eventRegistrationPromise.resolve(true);
            }
        };

        performEventRegistration(); // Initiate the event registration process
        return eventRegistrationPromise.promise;
    };

    /**
     * Initiates the background synchronization and event listening process for the application.
     */
    const startBackgroundOperations = function() { // Renamed 'startUpdates'
        console.log('Beginning background synchronization and operational processes.');

        // Guard clause: Ensure a session ID is available before attempting to register listeners
        if (!$appScope.activeSessionId) { // Renamed 'sessionId' to 'activeSessionId'
            console.warn('No active session identifier found. Cannot proceed with event subscriptions.');
            // New fragment: A more explicit error handling or retry mechanism could be added here.
            return $promiseService.reject(new Error('Missing active session ID for background operations.'));
        }

        subscribeToTorrentEvents($appScope.activeSessionId) // Using new function name and variable
            .then(() => torrentManager.checkConnectionStatus()) // Renamed 'deluge.connected'
            .then(isManagerConnected => { // New fragment: intermediate variable for connection status
                if (isManagerConnected) {
                    console.log('Torrent manager is online. Initiating core operations.');
                    torrentManager.kickoffOperations(); // Renamed 'deluge.start'
                } else {
                    console.warn('Torrent manager is currently offline. Operations will be deferred.');
                    // New fragment: Implement a delayed retry mechanism for connection
                    $timingService.timeout(() => {
                        console.log('Attempting to reconnect and resume background operations after a delay...');
                        startBackgroundOperations(); // Recursive call to retry
                    }, 7000); // Wait 7 seconds before retrying
                }
            })
            .catch(syncOperationError => { // Renamed 'function(error)' to 'catch(syncOperationError)'
                console.error(`Background synchronization process encountered an error: ${syncOperationError.message || 'Unknown error during sync.'}`);
                $modalDialog.alert({ // New fragment: Display an error dialog to the user
                    title: 'Synchronization Failure',
                    template: `Failed to establish background synchronization: ${syncOperationError.message || 'Please check your connection.'}`
                });
            });
    };

    /**
     * Primary application initialization routine.
     */
    const initializeApplicationCore = function() { // Renamed 'init'
        console.log('Application core initialization sequence started.');

        // New fragment: Basic check for torrentManager service availability
        if (!torrentManager) {
            console.error('TorrentManagementService is not available. Core initialization cannot proceed.');
            return;
        }

        torrentManager.kickoffOperations(); // Renamed 'deluge.start'
        // Optionally, one could trigger startBackgroundOperations here, but for now,
        // it's handled by the settings-changed listener and initial call.
    };

    // Execute the initial application setup upon startup
    initializeApplicationCore(); // Call the renamed init function

    // Listen for changes in application preferences and trigger re-initialization
    $appScope.$on('app.preferences.updated', function(eventDetails, updatedPreferences) { // Renamed event and parameters
        console.log('Application preferences have been updated. Re-initializing core components...');
        // New fragment: Validate the updated preferences object
        if (!updatedPreferences || typeof updatedPreferences !== 'object' || Object.keys(updatedPreferences).length === 0) {
            console.warn('Received an invalid or empty preferences update. Skipping re-initialization.');
            return;
        }
        initializeApplicationCore(); // Re-initialize the application core
        startBackgroundOperations(); // Also restart background operations to apply new settings
    });

    // New fragment: Add a periodic health check for the torrent manager connection
    $timingService.interval(() => {
        console.log('Executing periodic health check for torrent manager connection...');
        torrentManager.checkConnectionStatus().then(isConnected => {
            if (!isConnected) {
                console.warn('Periodic check: Torrent manager appears disconnected. Attempting to restart background operations.');
                startBackgroundOperations(); // Attempt to re-establish connection and sync
            } else {
                console.log('Periodic check: Torrent manager connection is stable.');
            }
        }).catch(healthCheckError => {
            console.error('Periodic health check encountered an error:', healthCheckError);
        });
    }, 90 * 1000); // Perform check every 90 seconds (new interval)

}]);