/*global gapi*/
(function () {
    // A custom event emitter to facilitate communication between components and state changes.
    // This replaces AngularJS's $rootScope.$broadcast and provides a mechanism for event-driven updates.
    class EventHub {
        constructor() {
            this.listeners = new Map();
        }

        // Registers a listener for a given event name.
        on(eventName, handler) {
            if (!this.listeners.has(eventName)) {
                this.listeners.set(eventName, []);
            }
            this.listeners.get(eventName).push(handler);
        }

        // Registers a listener that will be invoked only once.
        once(eventName, handler) {
            const wrapper = (...args) => {
                handler(...args);
                this.off(eventName, wrapper);
            };
            this.on(eventName, wrapper);
        }

        // Removes a specific listener for an event.
        off(eventName, handler) {
            if (!this.listeners.has(eventName)) return;
            const handlers = this.listeners.get(eventName).filter(h => h !== handler);
            this.listeners.set(eventName, handlers);
        }

        // Dispatches an event to all registered listeners.
        trigger(eventName, ...args) {
            if (this.listeners.has(eventName)) {
                // Execute listeners asynchronously to prevent blocking and mimic $timeout(0) behavior
                // for some event reactions.
                setTimeout(() => {
                    this.listeners.get(eventName).forEach(handler => {
                        try {
                            handler(...args);
                        } catch (e) {
                            console.error(`Issue encountered in event '${eventName}' listener:`, e);
                        }
                    });
                }, 0);
            }
        }
    }

    const globalEventBus = new EventHub();

    // Centralized data store and logic manager, replacing ngAnalyticsService.
    // This object manages the state related to the Google Analytics Embed API.
    const analyticsCoreStore = (() => {
        let currentClientKey = null;
        let googleEmbedApi = null;
        let apiOperational = false;
        let authState = false;
        let authDisplayMessage = undefined;
        const registeredViewControls = {}; // Stores instances of gapi.analytics.ViewSelector by their container ID

        // Public API for the store
        const storeInterface = {
            get clientKey() { return currentClientKey; },
            get embedApi() { return googleEmbedApi; },
            get apiReady() { return apiOperational; },
            get isAuthenticated() { return authState; },
            get authText() { return authDisplayMessage; },
            get viewControls() { return registeredViewControls; },

            // Updates the client ID and notifies subscribers.
            setClientKey(key) {
                currentClientKey = key;
                globalEventBus.trigger('clientKeyUpdated', key);
            },

            // Sets the Google Embed API instance once it's loaded and ready.
            setEmbedApi(apiInstance) {
                googleEmbedApi = apiInstance;
                apiOperational = true;
                globalEventBus.trigger('embedApiReady', apiInstance);
                // Check initial authorization status
                if (apiInstance.auth.isAuthorized()) {
                    storeInterface.setAuthStatus(true);
                }
            },

            // Updates the authorization status and notifies subscribers.
            setAuthStatus(status) {
                if (authState !== status) { // Only trigger if status changes
                    authState = status;
                    globalEventBus.trigger('authStatusChanged', status);
                    if (status) {
                        globalEventBus.trigger('authenticationSucceeded');
                    } else {
                        globalEventBus.trigger('authenticationFailed');
                    }
                }
            },

            // Sets the authorization display label.
            setAuthText(message) {
                authDisplayMessage = message;
                globalEventBus.trigger('authTextChanged', message);
            },

            // Stores a ViewSelector instance.
            registerViewControl(containerIdentifier, controlInstance) {
                registeredViewControls[containerIdentifier] = controlInstance;
                globalEventBus.trigger('viewControlRegistered', containerIdentifier, controlInstance);
            },

            // Initiates the Google Analytics authorization flow.
            requestAuthorization(containerIdentifier) {
                if (!googleEmbedApi) {
                    console.warn('Google Embed API not available for authorization request.');
                    return;
                }
                // Use setTimeout to mimic AngularJS $timeout(0) for next-tick execution.
                setTimeout(() => {
                    googleEmbedApi.auth.authorize({
                        container: containerIdentifier,
                        clientid: currentClientKey,
                        userInfoLabel: authDisplayMessage
                    });
                }, 0);
            }
        };

        // Listen for gapi.analytics auth events and update the store's state.
        globalEventBus.on('embedApiReady', (api) => {
            api.auth.on('success', () => {
                storeInterface.setAuthStatus(true);
            });
            api.auth.on('error', (err) => {
                storeInterface.setAuthStatus(false);
                globalEventBus.trigger('authorizationErrorOccurred', err); // Additional error event
            });
        });

        return storeInterface;
    })();

    // Function to dynamically load the Google Analytics Embed API script.
    const loadApiScript = () => {
        return new Promise((resolve) => {
            const scriptContent = "(function(w,d,s,g,js,fs){ g=w.gapi||(w.gapi={});g.analytics={q:[],ready:function(f){this.q.push(f);}}; js=d.createElement(s);fs=d.getElementsByTagName(s)[0]; js.src='https://apis.google.com/js/platform.js'; fs.parentNode.insertBefore(js,fs);js.onload=function(){g.load('analytics');}; }(window,document,'script'));";
            const scriptNode = document.createElement('script');
            scriptNode.type = 'text/javascript';
            scriptNode.appendChild(document.createTextNode(scriptContent));
            document.body.appendChild(scriptNode);

            // Wait for gapi.analytics to be ready before initializing the store.
            gapi.analytics.ready(() => {
                setTimeout(() => { // Mimics $timeout(0)
                    analyticsCoreStore.setEmbedApi(gapi.analytics);
                    resolve();
                }, 0);
            });
        });
    };

    // Component initialization functions (replacing AngularJS directives)
    // Each function takes a DOM element and initializes its functionality based on data attributes.

    // Replaces ngAnalyticsAuth directive. Handles authorization display and visibility.
    const setupAuthDisplay = (targetElement) => {
        const messageAttribute = targetElement.dataset.authMessage;
        const authPanelId = targetElement.dataset.authPanel || 'embed-api-auth-container';
        const hideOnAuthSuccess = targetElement.dataset.hideOnAuth === 'true';

        // Insert the container div for gapi.analytics.auth.authorize
        targetElement.innerHTML = `<div id="${authPanelId}"></div>`;

        analyticsCoreStore.setAuthText(messageAttribute);

        const updateElementVisibility = (isAuth) => {
            if (hideOnAuthSuccess) {
                targetElement.style.display = isAuth ? 'none' : '';
            }
        };

        // React to authorization status changes
        globalEventBus.on('authStatusChanged', updateElementVisibility);

        // Initial check if API is already ready
        if (analyticsCoreStore.apiReady) {
            updateElementVisibility(analyticsCoreStore.embedApi.auth.isAuthorized());
        } else {
            // If not ready, wait for API to be ready to perform initial check
            globalEventBus.once('embedApiReady', (api) => {
                updateElementVisibility(api.auth.isAuthorized());
            });
        }
        // Ensure visibility updates on explicit success event
        globalEventBus.once('authenticationSucceeded', () => updateElementVisibility(true));
    };

    // Replaces ngAnalyticsChart directive. Renders GA charts.
    const createDataVisualizer = (targetElement) => {
        const viewSourceId = targetElement.dataset.viewSource;
        const authPanelId = targetElement.dataset.authPanel || 'embed-api-auth-container';
        let chartSettings;
        try {
            chartSettings = JSON.parse(targetElement.dataset.visualizerSettings);
        } catch (e) {
            console.error('Invalid chart settings JSON for data-visualizer-settings:', e);
            return;
        }

        let chartInstance = null;
        let authorizationCheckedForComponent = false; // Tracks if this component has initiated auth

        const activateVisualizer = () => {
            if (!analyticsCoreStore.apiReady) return;

            // Authorize if not already authorized and this component hasn't yet initiated it.
            if (!analyticsCoreStore.embedApi.auth.isAuthorized() && !authorizationCheckedForComponent) {
                analyticsCoreStore.requestAuthorization(authPanelId);
                authorizationCheckedForComponent = true;
            }

            if (!chartInstance) {
                chartInstance = new analyticsCoreStore.embedApi.googleCharts.DataChart(chartSettings);
                // Insert chart container if not already there (template replacement)
                if (chartSettings.chart && chartSettings.chart.container) {
                    targetElement.innerHTML = `<div id="${chartSettings.chart.container}"></div>`;
                }
            }

            if (viewSourceId) {
                const linkViewControl = () => {
                    const linkedControl = analyticsCoreStore.viewControls[viewSourceId];
                    if (linkedControl) {
                        linkedControl.on('change', (ids) => {
                            const updatedQuery = {
                                query: { ids: ids }
                            };
                            chartInstance.set(updatedQuery).execute();
                        });
                        // Initial execution with current IDs if the view control already has them
                        if (linkedControl.get()) {
                            chartInstance.set({ query: { ids: linkedControl.get() } }).execute();
                        }
                    } else {
                        // View control not yet registered, wait for it
                        globalEventBus.once('viewControlRegistered', (id, control) => {
                            if (id === viewSourceId) {
                                linkViewControl();
                            }
                        });
                    }
                };
                linkViewControl();
            } else {
                // No view selector connected, execute chart on authorization success
                const executeChart = () => {
                    chartInstance.execute();
                };
                analyticsCoreStore.embedApi.auth.once('success', executeChart);
                if (analyticsCoreStore.embedApi.auth.isAuthorized()) {
                    executeChart();
                }
            }
        };

        globalEventBus.on('embedApiReady', activateVisualizer);
        if (analyticsCoreStore.apiReady) { // If API is already ready, initialize immediately
            activateVisualizer();
        }
    };

    // Replaces ngAnalyticsReport directive. Fetches GA reports.
    const retrieveAnalyticsReports = (targetElement) => {
        const reportRequests = JSON.parse(targetElement.dataset.reportRequests);
        const viewSourceId = targetElement.dataset.viewSource;
        const authPanelId = targetElement.dataset.authPanel || 'embed-api-auth-container';

        let authCheckDone = false;

        const fetchSingleReport = (queryDefinition) => {
            return new Promise((resolve, reject) => {
                const reportQuery = new analyticsCoreStore.embedApi.report.Data(queryDefinition);
                reportQuery.once('success', (result) => resolve(result));
                reportQuery.once('error', (err) => reject(err));
                reportQuery.execute();
            });
        };

        const executeReportFetches = (currentIds = null) => {
            const allTasks = reportRequests.map(originalQuery => {
                const adjustedQuery = currentIds ? { ...originalQuery, query: { ...originalQuery.query, ids: currentIds } } : originalQuery;
                return fetchSingleReport(adjustedQuery);
            });

            Promise.all(allTasks)
                .then(finalResults => {
                    globalEventBus.trigger('analyticsReportSuccess', finalResults, targetElement);
                })
                .catch(failureResponse => {
                    globalEventBus.trigger('analyticsReportError', failureResponse, targetElement);
                });
        };

        const initializeReportLogic = () => {
            if (!analyticsCoreStore.apiReady) return;

            if (!analyticsCoreStore.embedApi.auth.isAuthorized() && !authCheckDone) {
                analyticsCoreStore.requestAuthorization(authPanelId);
                authCheckDone = true;
            }

            if (!viewSourceId) {
                const runOnAuthSuccess = () => {
                    executeReportFetches();
                };
                analyticsCoreStore.embedApi.auth.once('success', runOnAuthSuccess);
                if (analyticsCoreStore.embedApi.auth.isAuthorized()) {
                    runOnAuthSuccess();
                }
            } else {
                const connectViewControl = () => {
                    const linkedControl = analyticsCoreStore.viewControls[viewSourceId];
                    if (linkedControl) {
                        linkedControl.on('change', (ids) => {
                            executeReportFetches(ids);
                        });
                        // Initial execution with current IDs if available
                        if (linkedControl.get()) {
                            executeReportFetches(linkedControl.get());
                        }
                    } else {
                        globalEventBus.once('viewControlRegistered', (id, control) => {
                            if (id === viewSourceId) {
                                connectViewControl();
                            }
                        });
                    }
                };
                connectViewControl();
            }
        };

        globalEventBus.on('embedApiReady', initializeReportLogic);
        if (analyticsCoreStore.apiReady) {
            initializeReportLogic();
        }
    };

    // Replaces ngAnalyticsView directive. Renders GA view selectors.
    const createViewControl = (targetElement) => {
        const controlPanelId = targetElement.dataset.controlPanel || 'view-selector-container';
        const authPanelId = targetElement.dataset.authPanel || 'embed-api-auth-container';

        let authInitiationComplete = false;

        // Insert the container div for gapi.analytics.ViewSelector
        targetElement.innerHTML = `<div id="${controlPanelId}"></div>`;

        const activateControl = () => {
            if (!analyticsCoreStore.apiReady) return;

            if (!analyticsCoreStore.embedApi.auth.isAuthorized() && !authInitiationComplete) {
                analyticsCoreStore.requestAuthorization(authPanelId);
                authInitiationComplete = true;
            }

            const selectorInstance = new analyticsCoreStore.embedApi.ViewSelector({
                container: controlPanelId
            });
            analyticsCoreStore.registerViewControl(controlPanelId, selectorInstance);

            const renderControl = () => {
                selectorInstance.execute();
            };

            analyticsCoreStore.embedApi.auth.once('success', renderControl);
            if (analyticsCoreStore.embedApi.auth.isAuthorized()) {
                renderControl();
            }
        };

        globalEventBus.on('embedApiReady', activateControl);
        if (analyticsCoreStore.apiReady) {
            activateControl();
        }
    };

    // Main initialization routine for all components on the page.
    // This function scans the DOM for specific data attributes and initializes the corresponding logic.
    const activateAllAnalyticsComponents = () => {
        document.querySelectorAll('[data-auth-component]').forEach(setupAuthDisplay);
        document.querySelectorAll('[data-visualizer-component]').forEach(createDataVisualizer);
        document.querySelectorAll('[data-report-component]').forEach(retrieveAnalyticsReports);
        document.querySelectorAll('[data-view-component]').forEach(createViewControl);
    };

    // Entry point for the module (replaces app.run block).
    // Initializes the client key and loads the Google Embed API.
    // Components will self-initialize when the API is ready and the DOM is loaded.
    (function initiateAnalyticsIntegration() {
        analyticsCoreStore.setClientKey("YOUR_ANALYTICS_CLIENT_ID"); // Placeholder for actual client ID

        // Load the Google API script and wait for it to be ready.
        loadApiScript().then(() => {
            // API is ready, now activate any components already in the DOM.
            // If DOMContentLoaded already fired, activateAllAnalyticsComponents runs immediately.
            // If not, it will run when DOMContentLoaded fires.
        });

        // Listen for DOMContentLoaded to ensure elements are available for processing.
        // This ensures components are initialized even if the API loads faster than the DOM.
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', activateAllAnalyticsComponents);
        } else {
            // DOM is already loaded
            activateAllAnalyticsComponents();
        }
    })();

}).call(this);