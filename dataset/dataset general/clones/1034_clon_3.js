(function () {

    const appModule = angular.module("metricFlow", []);

    // Configuration object for the module
    appModule.constant('MF_DEFAULTS', {
        AUTH_CONTAINER_ID: 'mf-auth-display-panel',
        VIEW_SELECTOR_ID: 'mf-view-picker-area',
        GAPI_URL: 'https://apis.google.com/js/platform.js'
    });

    // Centralized service for Google Analytics Embed API interactions
    appModule.service('metricFlowCore', [
        '$timeout', '$q', 'MF_DEFAULTS',
        function ($timeout, $q, MF_DEFAULTS) {
            let _userSessionId = null;
            let _gapiInstance = null;
            let _apiInitializationStatus = false;
            let _userAuthenticationStatus = false;
            let _authPromptMessage = undefined;
            const _activeSelectors = {}; // Stores references to active view selectors

            // Expose properties and methods
            Object.assign(this, {
                gapiRef: null,
                apiInitialized: false,
                isUserAuthenticated: false,
                authPromptText: undefined,
                activeSelectors: {},

                // Assign external GAPI reference and update status
                setGapiRef: function (gapiObj) {
                    if (gapiObj && gapiObj.analytics) {
                        this.gapiRef = gapiObj.analytics;
                        this.apiInitialized = true;
                        _gapiInstance = gapiObj.analytics;
                    } else {
                        console.warn("Invalid GAPI object provided to metricFlowCore.");
                    }
                },

                // Establishes a client session identifier
                establishSessionId: function (identifier) {
                    if (typeof identifier === 'string' && identifier.length > 0) {
                        _userSessionId = identifier;
                        return identifier;
                    }
                    console.error("Attempted to set an invalid session identifier.");
                    return null;
                },

                // Retrieves the current client session identifier
                retrieveSessionId: function () {
                    return _userSessionId;
                },

                // Initiates the Google Analytics authorization flow
                initiateAuthorization: function (containerElementId) {
                    const deferred = $q.defer();
                    if (!this.gapiRef || !this.gapiRef.auth) {
                        deferred.reject(new Error("GAPI Analytics not initialized for authorization."));
                        return deferred.promise;
                    }

                    // Use $timeout for Angular digest cycle integration, though 0 delay means immediate.
                    $timeout(() => {
                        try {
                            this.gapiRef.auth.authorize({
                                container: containerElementId || MF_DEFAULTS.AUTH_CONTAINER_ID,
                                clientid: _userSessionId,
                                userInfoLabel: this.authPromptText
                            });
                            deferred.resolve();
                        } catch (error) {
                            console.error("Authorization failed:", error);
                            deferred.reject(error);
                        }
                    }, 0);
                    return deferred.promise;
                },

                // Helper to check if the user is currently authorized
                checkAuthorizationStatus: function () {
                    return this.gapiRef && this.gapiRef.auth && this.gapiRef.auth.isAuthorized();
                }
            });

            // Synchronize service's properties with internal state changes
            Object.defineProperty(this, 'apiInitialized', {
                get: () => _apiInitializationStatus,
                set: (value) => {
                    _apiInitializationStatus = Boolean(value);
                }
            });
            Object.defineProperty(this, 'isUserAuthenticated', {
                get: () => _userAuthenticationStatus,
                set: (value) => {
                    _userAuthenticationStatus = Boolean(value);
                }
            });
            Object.defineProperty(this, 'authPromptText', {
                get: () => _authPromptMessage,
                set: (value) => {
                    _authPromptMessage = value;
                }
            });
            Object.defineProperty(this, 'activeSelectors', {
                get: () => _activeSelectors
            });
        }
    ]);

    // Directive for rendering the Google Analytics authorization component
    appModule.directive("mfAuthComponent", [
        'metricFlowCore', 'MF_DEFAULTS',
        function (metricFlowCore, MF_DEFAULTS) {
            return {
                scope: {
                    displayText: '@', // Label for the auth button
                    authTargetId: '@', // Container ID for the auth button
                    concealOnSuccess: '@' // Boolean string to hide after auth
                },
                restrict: 'E',
                templateUrl: 'mf-auth/template.html',
                link: function ($scope) {
                    metricFlowCore.authPromptText = $scope.displayText;
                    $scope.authTargetId = $scope.authTargetId || MF_DEFAULTS.AUTH_CONTAINER_ID;
                    $scope.shouldHide = false; // Internal state for visibility

                    const initializeAuthWatcher = $scope.$watch(() => metricFlowCore.apiInitialized, (isApiReady) => {
                        if (isApiReady) {
                            const hideOnAuthFlag = Boolean($scope.concealOnSuccess && $scope.concealOnSuccess === 'true');

                            if (hideOnAuthFlag) {
                                // Event listener for successful authorization
                                metricFlowCore.gapiRef.auth.on('success', () => {
                                    $scope.$evalAsync(() => {
                                        $scope.shouldHide = true;
                                    });
                                });

                                // Watch for changes in authorization status
                                $scope.$watch(() => metricFlowCore.gapiRef.auth.isAuthorized(), (isCurrentlyAuthorized, wasPreviouslyAuthorized) => {
                                    if (isCurrentlyAuthorized && isCurrentlyAuthorized !== wasPreviouslyAuthorized) {
                                        $scope.shouldHide = true;
                                    } else if (!isCurrentlyAuthorized && isCurrentlyAuthorized !== wasPreviouslyAuthorized) {
                                        $scope.shouldHide = false;
                                    }
                                });
                            }
                            initializeAuthWatcher(); // Deregister the watcher after API is ready
                        }
                    });
                }
            };
        }
    ]);

    // Directive for displaying Google Analytics data charts
    appModule.directive("mfChartDisplay", [
        'metricFlowCore', 'MF_DEFAULTS',
        function (metricFlowCore, MF_DEFAULTS) {
            return {
                scope: {
                    selectorTargetId: '@', // ID for view selector container
                    authTargetId: '@',     // ID for auth container
                    chartConfig: '='       // Chart configuration object
                },
                restrict: 'E',
                templateUrl: 'mf-chart/template.html',
                link: function ($scope) {
                    if (!angular.isObject($scope.chartConfig) || !angular.isObject($scope.chartConfig.chart)) {
                        console.error("mfChartDisplay: Invalid chart configuration provided.", $scope.chartConfig);
                        return;
                    }

                    let initialLoad = !metricFlowCore.isUserAuthenticated;
                    metricFlowCore.isUserAuthenticated = true; // Mark as attempting auth to prevent multiple prompts

                    const apiReadyWatcher = $scope.$watch(() => metricFlowCore.apiInitialized, (isReady) => {
                        if (isReady) {
                            const embedApi = metricFlowCore.gapiRef;
                            const authContainer = $scope.authTargetId || MF_DEFAULTS.AUTH_CONTAINER_ID;

                            // Authorize if not already and it's the initial load
                            if (!embedApi.auth.isAuthorized() && initialLoad) {
                                metricFlowCore.initiateAuthorization(authContainer);
                            }

                            // Create the DataChart instance
                            const dataChart = new embedApi.googleCharts.DataChart($scope.chartConfig);

                            if ($scope.selectorTargetId) {
                                // If a view selector is specified, watch for its creation and changes
                                const viewSelectorWatcher = $scope.$watch(() => metricFlowCore.activeSelectors[$scope.selectorTargetId], (viewSelectorInstance) => {
                                    if (viewSelectorInstance) {
                                        viewSelectorInstance.on('change', (newIds) => {
                                            const updatedQuery = {
                                                query: {
                                                    ids: newIds
                                                }
                                            };
                                            dataChart.set(updatedQuery).execute();
                                        });
                                        viewSelectorWatcher(); // Deregister watcher
                                    }
                                });
                            } else {
                                // If no view selector, execute the chart once authorized
                                const executeChart = () => dataChart.execute();
                                embedApi.auth.once('success', executeChart);

                                // If already authorized, execute immediately
                                if (embedApi.auth.isAuthorized()) {
                                    executeChart();
                                }
                            }
                            apiReadyWatcher(); // Deregister the main watcher
                        }
                    });
                }
            };
        }
    ]);

    // Directive for generating and displaying Google Analytics reports
    appModule.directive("mfReportGenerator", [
        '$rootScope', '$q', 'metricFlowCore', 'MF_DEFAULTS',
        function ($rootScope, $q, metricFlowCore, MF_DEFAULTS) {
            return {
                scope: {
                    reportQueries: '=',           // Array of report query objects
                    authTargetId: '@',            // ID for auth container
                    selectorTargetId: '@'         // ID for view selector container
                },
                restrict: 'E',
                link: function ($scope, element) {
                    let initialAuthAttempt = !metricFlowCore.isUserAuthenticated;
                    metricFlowCore.isUserAuthenticated = true; // Flag to prevent multiple auth prompts

                    // Helper function to fetch a single report using promises
                    const fetchReport = (queryConfig) => {
                        return new Promise((resolve, reject) => {
                            if (!metricFlowCore.gapiRef || !metricFlowCore.gapiRef.report) {
                                return reject(new Error("GAPI Analytics report object not available."));
                            }
                            const reportInstance = new metricFlowCore.gapiRef.report.Data(queryConfig);
                            reportInstance.once('success', resolve);
                            reportInstance.once('error', reject);
                            reportInstance.execute();
                        });
                    };

                    const apiReadyMonitor = $scope.$watch(() => metricFlowCore.apiInitialized, (isInitialized) => {
                        if (!isInitialized) return;

                        const embedApi = metricFlowCore.gapiRef;
                        const defaultAuthContainer = $scope.authTargetId || MF_DEFAULTS.AUTH_CONTAINER_ID;

                        // Ensure authorization if not already done and it's the first attempt
                        if (!embedApi.auth.isAuthorized() && initialAuthAttempt) {
                            metricFlowCore.initiateAuthorization(defaultAuthContainer);
                        }

                        // Function to process and fetch all reports
                        const processReports = (currentIds = null) => {
                            if (!Array.isArray($scope.reportQueries) || $scope.reportQueries.length === 0) {
                                console.warn("mfReportGenerator: No report queries defined.");
                                return;
                            }

                            const reportPromises = $scope.reportQueries.map(query => {
                                const modifiedQuery = angular.copy(query); // Deep copy to avoid modifying original
                                if (currentIds) {
                                    modifiedQuery.query = modifiedQuery.query || {};
                                    modifiedQuery.query.ids = currentIds;
                                }
                                return fetchReport(modifiedQuery);
                            });

                            $q.all(reportPromises)
                                .then(results => {
                                    $scope.reportData = results; // Store results on scope
                                    $rootScope.$broadcast('mfReportSuccess', results, element);
                                })
                                .catch(error => {
                                    $scope.reportError = error; // Store error on scope
                                    $rootScope.$broadcast('mfReportError', error, element);
                                });
                        };

                        if (!$scope.selectorTargetId) {
                            // No view selector connection: fetch reports once authorized
                            embedApi.auth.once('success', processReports);
                            if (embedApi.auth.isAuthorized()) {
                                processReports();
                            }
                        } else {
                            // With view selector connection: watch for selector creation and changes
                            const selectorInstanceWatcher = $scope.$watch(() => metricFlowCore.activeSelectors[$scope.selectorTargetId], (viewSelector) => {
                                if (viewSelector) {
                                    viewSelector.on('change', (ids) => processReports(ids));
                                    selectorInstanceWatcher(); // Deregister selector watcher
                                }
                            });
                        }
                        apiReadyMonitor(); // Deregister the main API readiness watcher
                    });
                }
            };
        }
    ]);

    // Directive for rendering the Google Analytics View Selector
    appModule.directive("mfViewSelector", [
        'metricFlowCore', 'MF_DEFAULTS',
        function (metricFlowCore, MF_DEFAULTS) {
            return {
                scope: {
                    selectorTargetId: '@', // Container ID for the view selector
                    authTargetId: '@',     // Container ID for auth button
                    associatedCharts: '='  // (Optional) Charts to update, not directly used here
                },
                restrict: 'E',
                templateUrl: 'mf-view/template.html',
                link: function ($scope) {
                    let initialAuthAttempt = !metricFlowCore.isUserAuthenticated;
                    metricFlowCore.isUserAuthenticated = true;

                    const apiReadyMonitor = $scope.$watch(() => metricFlowCore.apiInitialized, (isInitialized) => {
                        if (!isInitialized) return;

                        const embedApi = metricFlowCore.gapiRef;
                        const defaultAuthContainer = $scope.authTargetId || MF_DEFAULTS.AUTH_CONTAINER_ID;

                        // Ensure authorization if needed
                        if (!embedApi.auth.isAuthorized() && initialAuthAttempt) {
                            metricFlowCore.initiateAuthorization(defaultAuthContainer);
                        }

                        $scope.selectorTargetId = $scope.selectorTargetId || MF_DEFAULTS.VIEW_SELECTOR_ID;

                        const viewPicker = new embedApi.ViewSelector({
                            container: $scope.selectorTargetId
                        });

                        // Store the created view selector instance in the service
                        metricFlowCore.activeSelectors[$scope.selectorTargetId] = viewPicker;

                        const renderViewPicker = () => viewPicker.execute();
                        embedApi.auth.once('success', renderViewPicker);

                        if (embedApi.auth.isAuthorized()) {
                            renderViewPicker();
                        }
                        apiReadyMonitor(); // Deregister the watcher
                    });
                }
            };
        }
    ]);

    // Run block to initialize the Google Analytics Embed API and set up templates
    appModule.run([
        '$templateCache', '$timeout', 'metricFlowCore', 'MF_DEFAULTS',
        function ($templateCache, $timeout, metricFlowCore, MF_DEFAULTS) {

            // Function to dynamically load the GAPI script
            const loadGapiScript = (url) => {
                const scriptElement = document.createElement('script');
                scriptElement.type = 'text/javascript';
                scriptElement.async = true;
                scriptElement.src = url;

                return new Promise((resolve, reject) => {
                    scriptElement.onload = () => {
                        if (window.gapi) {
                            window.gapi.load('analytics', () => resolve(window.gapi));
                        } else {
                            reject(new Error("GAPI object not found after script load."));
                        }
                    };
                    scriptElement.onerror = (e) => reject(new Error("Failed to load GAPI script: " + e.message));
                    document.head.appendChild(scriptElement);
                });
            };

            // Load the GAPI script and initialize the service
            loadGapiScript(MF_DEFAULTS.GAPI_URL)
                .then(gapiInstance => {
                    gapiInstance.analytics.ready(() => {
                        $timeout(() => { // Ensure Angular's digest cycle is aware
                            metricFlowCore.setGapiRef(gapiInstance);
                        }, 0);
                    });
                })
                .catch(error => {
                    console.error("MetricFlow: GAPI initialization failed.", error);
                });

            // Store directive templates in the template cache
            $templateCache.put('mf-auth/template.html', '<div id="{{authTargetId}}" ng-hide="shouldHide"></div>');
            $templateCache.put('mf-chart/template.html', '<div id="{{chartConfig.chart.container}}"></div>');
            $templateCache.put('mf-view/template.html', '<div id="{{selectorTargetId}}"></div>');
        }
    ]);

}).call(this);