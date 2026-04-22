/*
 *  Copyright (c) 2024, ForgeLabs.io, Aeliana.
 */

(function(){
    // This module provides a bridge for JavaScript to interact with the native host environment.
    // The core interaction mechanism is via `window.interactWithHost(jsonPayload, commandString)`.
    var DEFAULT_STORAGE_KEY = "application.data.store"; // Default identifier for persistent data.

    // Initialize the nativeBridge object if it doesn't already exist on the window.
    if (!window.nativeBridge) {
        window.nativeBridge = {
            // Callback function for handling system-level back button presses.
            backActionHandler: null,

            // Triggers the registered back action handler.
            // This method is invoked by the native environment when a back event occurs.
            invokeBackAction: function() {
                if (this.backActionHandler instanceof Function) {
                    this.backActionHandler(); // Execute the stored handler.
                }
            },

            // Registers a function to be called when the system back button is pressed.
            registerBackHandler: function(callbackFn) {
                if (this.backActionHandler) {
                    console.warn("NativeBridge: A back handler was already registered. Overwriting it.");
                }
                this.backActionHandler = callbackFn;
            },

            // Deregisters the currently active back handler.
            deregisterBackHandler: function(handlerToClear) {
                // Check if the handler being cleared is actually the one registered.
                if (this.backActionHandler && this.backActionHandler !== handlerToClear) {
                    console.warn("NativeBridge: Attempted to deregister a handler that was not currently active.");
                    return; // Prevent clearing if it's not the intended handler.
                }
                this.backActionHandler = null; // Clear the handler.
            },

            // Placeholder for native menu invocation.
            showAppMenu: function() {
                // No operation by default. Native implementation handles this.
            },

            // Placeholder for native search invocation.
            performSearch: function() {
                // No operation by default. Native implementation handles this.
            },

            // Placeholder for native application startup routine.
            launchApplication: function() {
                // No operation by default. Native implementation handles this.
            },

            // The primary interface for sending commands to the native environment.
            // It expects a JSON string or object as payload and a command string.
            sendNativeCommand: function(payloadData, commandKey) {
                if (!commandKey || typeof commandKey !== 'string') {
                    console.error("NativeBridge: Invalid or missing command key for native interaction.");
                    return null;
                }

                let commandInput = payloadData;
                // Ensure payload is a string for the native interface.
                if (typeof payloadData !== 'string' && payloadData !== null) {
                    try {
                        commandInput = JSON.stringify(payloadData);
                    } catch (e) {
                        console.error("NativeBridge: Failed to stringify command payload:", e);
                        return null;
                    }
                }

                let rawNativeOutput = window.prompt(commandInput, commandKey);
                let processedResult = null;

                if (rawNativeOutput) {
                    try {
                        processedResult = JSON.parse(rawNativeOutput);
                    } catch (parseError) {
                        console.warn("NativeBridge: Error parsing native response as JSON:", parseError, "Raw response:", rawNativeOutput);
                        // If parsing fails, the raw string might be the intended result.
                        processedResult = rawNativeOutput;
                    }
                }
                return processedResult;
            },

            // Callback for photo capture results from native camera.
            photoCaptureCallback: function(isSuccess, imageDataURI) {
                // Delegate the result to the waiting object/component.
                if (nativeBridge.currentPhotoRequester && $.isFunction(nativeBridge.currentPhotoRequester.onPhotoCaptured)) {
                    nativeBridge.currentPhotoRequester.onPhotoCaptured(isSuccess, imageDataURI);
                } else if (nativeBridge.currentPhotoRequester) {
                    // Fallback if specific method not found, try a generic delegate.
                    $.delegate(nativeBridge.currentPhotoRequester, "photoCaptureResult", isSuccess, imageDataURI);
                }
                nativeBridge.currentPhotoRequester = null; // Clear the requester to prevent re-entrancy issues.
            },
            currentPhotoRequester: null, // Holds the object awaiting camera results (non-re-entrant).

            // Callback for results from an external activity launched by native.
            externalActivityResult: function(resultString) {
                let parsedResult = null;
                if (resultString) {
                    try {
                        parsedResult = JSON.parse(resultString);
                    } catch (e) {
                        console.warn("NativeBridge: Failed to parse activity result JSON:", e, "Raw:", resultString);
                        parsedResult = resultString; // Store raw string if JSON parsing fails.
                    }
                }
                // Delegate the result to the waiting activity initiator.
                if (nativeBridge.pendingActivityInitiator && $.isFunction(nativeBridge.pendingActivityInitiator.onActivityCompletion)) {
                    nativeBridge.pendingActivityInitiator.onActivityCompletion(parsedResult);
                } else if (nativeBridge.pendingActivityInitiator) {
                    $.delegate(nativeBridge.pendingActivityInitiator, "activityResult", parsedResult);
                }
                nativeBridge.pendingActivityInitiator = null; // Clear the initiator.
            },
            pendingActivityInitiator: null, // Holds the object awaiting activity results (non-re-entrant).

            //--- Asynchronous Polling Mechanism for Native Operations ---
            // This section handles long-running native operations that return an ID immediately,
            // and their results are polled later.

            asyncResultTimer: null, // Timer handle for polling.
            activePollRequests: {}, // Stores active requests: id -> { count, successCb, errorCb, statusFn, resultFn }

            // Periodically checks for results of asynchronous native operations.
            pollAsyncResults: function() {
                const completedRequests = [];
                const currentRequests = Object.keys(this.activePollRequests);

                if (currentRequests.length === 0) {
                    // No active requests, so clear the timer.
                    if (this.asyncResultTimer) {
                        clearInterval(this.asyncResultTimer);
                        this.asyncResultTimer = null;
                        console.info("NativeBridge: Asynchronous polling timer cleared as no active requests remain.");
                    }
                    return;
                }

                currentRequests.forEach(requestId => {
                    const requestConfig = this.activePollRequests[requestId];
                    let operationFinished = false;
                    let pollStatusResult;

                    // Determine if the operation is finished using the provided function or default native call.
                    if (typeof requestConfig.statusFn === 'function') {
                        // Custom function to check status.
                        pollStatusResult = requestConfig.statusFn(requestId);
                    } else {
                        // Default to calling native bridge with the specified status command.
                        pollStatusResult = nativeBridge.sendNativeCommand("" + requestId, requestConfig.statusFn);
                    }

                    // Native operations typically return 'true' for finished, 'false' for pending, or 'null' for error.
                    if (pollStatusResult === true) {
                        operationFinished = true;
                    } else if (pollStatusResult === null) {
                        // Treat null as an immediate error for status check.
                        if (requestConfig.errorCb) {
                            try {
                                requestConfig.errorCb("Native operation status check failed or returned null for ID: " + requestId);
                            } catch(err) {
                                console.error("NativeBridge: Exception in error callback during status check:", err);
                            }
                        }
                        operationFinished = true; // Mark as finished to prevent endless polling.
                    }

                    if (operationFinished) {
                        let finalResult;
                        if (typeof requestConfig.resultFn === 'function') {
                            finalResult = requestConfig.resultFn(requestId);
                        } else {
                            finalResult = nativeBridge.sendNativeCommand("" + requestId, requestConfig.resultFn);
                        }

                        if (finalResult === null) {
                            if (requestConfig.errorCb) {
                                try {
                                    requestConfig.errorCb("Failed to retrieve final result for ID: " + requestId);
                                } catch(err) {
                                    console.error("NativeBridge: Exception in error callback during final result retrieval:", err);
                                }
                            }
                        } else {
                            if (requestConfig.successCb) {
                                try {
                                    requestConfig.successCb(finalResult);
                                } catch (err) {
                                    console.error("NativeBridge: Exception in success callback:", err);
                                }
                            }
                        }
                        completedRequests.push(requestId);
                    } else {
                        // Increment query count and check for timeout.
                        requestConfig.queryCount = (requestConfig.queryCount || 0) + 1;
                        if (requestConfig.queryCount > 2000) { // Timeout after 100 seconds (2000 * 50ms)
                            if (requestConfig.errorCb) {
                                try {
                                    requestConfig.errorCb("Asynchronous operation timed out for ID: " + requestId);
                                } catch(err) {
                                    console.error("NativeBridge: Exception in error callback due to timeout:", err);
                                }
                            }
                            completedRequests.push(requestId);
                        }
                    }
                });

                // Clean up completed requests.
                completedRequests.forEach(id => {
                    delete this.activePollRequests[id];
                });
            },

            // Sets up polling for a specific SQL operation.
            configureSqlPolling: function(databaseIdentifier, operationId, successCallback, errorCallback) {
                if (!operationId) {
                    if (errorCallback) {
                        errorCallback("Invalid operation ID provided for SQL polling setup.");
                    } else if (successCallback) {
                        successCallback(-1); // Indicate failure with -1 if only success callback provided.
                    }
                    return;
                }

                this.activePollRequests[operationId] = {
                    queryCount: 0,
                    successCb: successCallback,
                    errorCb: errorCallback || function(msg) { console.error("SQL Async Error: " + msg); },
                    statusFn: function(id) {
                        return nativeBridge.sendNativeCommand(JSON.stringify([databaseIdentifier, "" + id]), "app:sqlOpStatus");
                    },
                    resultFn: function(id) {
                        return nativeBridge.sendNativeCommand(JSON.stringify([databaseIdentifier, "" + id]), "app:sqlOpResult");
                    }
                };

                // Start the polling timer if it's not already running.
                if (!this.asyncResultTimer) {
                    this.asyncResultTimer = setInterval($.bind(this.pollAsyncResults, this), 50); // Poll every 50ms.
                    console.info("NativeBridge: Asynchronous polling timer initiated.");
                }
            },

            //--- Public Database Interaction Methods ---

            // Inserts a new row into a specified table.
            dbInsert: function(tableName, columnValuesMap, onCompletion, databaseName) {
                const operationPayload = {
                    dbIdentifier: databaseName || DEFAULT_STORAGE_KEY,
                    action: "insert",
                    params: [tableName, columnValuesMap]
                };
                const operationId = nativeBridge.sendNativeCommand(operationPayload, "app:sqlCommand");
                this.configureSqlPolling(operationPayload.dbIdentifier, operationId, onCompletion);
                return operationId;
            },

            // Updates existing rows in a table.
            dbUpdate: function(tableName, columnValuesMap, whereClause, whereArgsArray, onCompletion, databaseName) {
                const operationPayload = {
                    dbIdentifier: databaseName || DEFAULT_STORAGE_KEY,
                    action: "update",
                    params: [tableName, columnValuesMap, whereClause, whereArgsArray]
                };
                const operationId = nativeBridge.sendNativeCommand(operationPayload, "app:sqlCommand");
                this.configureSqlPolling(operationPayload.dbIdentifier, operationId, onCompletion);
                return operationId;
            },

            // Deletes rows from a table.
            dbRemove: function(tableName, whereClause, whereArgsArray, onCompletion, databaseName) {
                const operationPayload = {
                    dbIdentifier: databaseName || DEFAULT_STORAGE_KEY,
                    action: "delete",
                    params: [tableName, whereClause, whereArgsArray]
                };
                const operationId = nativeBridge.sendNativeCommand(operationPayload, "app:sqlCommand");
                this.configureSqlPolling(operationPayload.dbIdentifier, operationId, onCompletion);
                return operationId;
            },

            // Executes a SQL SELECT query.
            dbQuery: function(sqlStatement, argumentsArray, onCompletion, databaseName) {
                const queryArgs = argumentsArray ? [sqlStatement, argumentsArray] : [sqlStatement];
                const operationPayload = {
                    dbIdentifier: databaseName || DEFAULT_STORAGE_KEY,
                    action: "select",
                    params: queryArgs
                };
                const operationId = nativeBridge.sendNativeCommand(operationPayload, "app:sqlCommand");
                this.configureSqlPolling(operationPayload.dbIdentifier, operationId, onCompletion);
                return operationId;
            },

            // Fetches an OAuth request token.
            fetchOAuthToken: function(requestUrl, requestData) {
                const tokenRequest = {
                    targetUrl: requestUrl,
                    payloadData: requestData
                };
                return nativeBridge.sendNativeCommand(tokenRequest, "app:oauthGetToken");
            },

            // Initiates an asynchronous HTTP request with OAuth signing.
            // Parameters:
            //   method: "GET" | "POST" | "PUT" | "DELETE"
            //   endpointUrl: The base URL for the request.
            //   requestBody: Data payload for POST/PUT.
            //   onSuccess: Callback for successful response (function(response)).
            //   onError: Callback for errors (function(errorMessage)).
            //   clientKey, clientSecret: Optional OAuth credentials.
            makeHttpRequest: function(method, endpointUrl, requestBody, onSuccess, onError, clientKey, clientSecret) {
                const requestMethod = (method || "GET").toUpperCase();
                const requestDescription = `${requestMethod}: ${endpointUrl}`; // For logging/debugging.

                const httpParams = {
                    httpMethod: requestMethod,
                    destinationUrl: endpointUrl,
                    requestPayload: requestBody
                };

                // Apply OAuth credentials, prioritizing provided ones, then global window variables.
                if (clientKey && clientSecret) {
                    httpParams.authConsumerKey = clientKey;
                    httpParams.authConsumerSecret = clientSecret;
                } else if (window.GLOBAL_AUTH_KEY && window.GLOBAL_AUTH_SECRET) {
                    httpParams.authConsumerKey = window.GLOBAL_AUTH_KEY;
                    httpParams.authConsumerSecret = window.GLOBAL_AUTH_SECRET;
                } else {
                    // No auth keys provided, proceed without OAuth signing.
                    console.warn("NativeBridge: Making HTTP request without OAuth credentials:", requestDescription);
                }

                const requestId = nativeBridge.sendNativeCommand(httpParams, "app:asyncHttpRequest");

                if (requestId) {
                    this.activePollRequests[requestId] = {
                        queryCount: 0,
                        successCb: onSuccess,
                        errorCb: onError,
                        statusFn: "app:httpRequestStatus",
                        resultFn: "app:httpRequestResult"
                    };
                    // Ensure the polling timer is active.
                    if (!this.asyncResultTimer) {
                        this.asyncResultTimer = setInterval($.bind(this.pollAsyncResults, this), 50);
                    }
                } else {
                    // If native call failed to return an ID.
                    if (onError) {
                        onError("Failed to initiate background HTTP request via native bridge.");
                    }
                }
                return requestId;
            },

            // Fetches image data asynchronously.
            fetchImageData: function(imageUrl, successHandler, errorHandler) {
                const imageFetchId = nativeBridge.sendNativeCommand(imageUrl, "app:imageDownload");
                if (imageFetchId) {
                    this.activePollRequests[imageFetchId] = {
                        queryCount: 0,
                        successCb: successHandler,
                        errorCb: errorHandler,
                        statusFn: "app:imageDownloadStatus",
                        resultFn: "app:imageDownloadResult"
                    };
                    if (!this.asyncResultTimer) {
                        this.asyncResultTimer = setInterval($.bind(this.pollAsyncResults, this), 50);
                    }
                } else {
                    if (errorHandler) {
                        errorHandler("Failed to initiate image download.");
                    }
                }
                return imageFetchId;
            },

            // Starts an external native activity and expects a result.
            // The `requesterDelegate` object should have an `onActivityCompletion(result)` method.
            startExternalActivity: function(activityClassName, activityParameters, requesterDelegate) {
                if (!activityClassName) {
                    console.error("NativeBridge: Activity class name is required.");
                    return;
                }
                this.pendingActivityInitiator = requesterDelegate; // Store the requester.

                const activityCommand = {
                    targetActivityClass: activityClassName,
                    activityInputParams: activityParameters,
                    resultCallbackName: "nativeBridge.externalActivityResult" // Native calls this JS function.
                };
                nativeBridge.sendNativeCommand(activityCommand, "app:startActivityForOutcome");
            },

            // Triggers the native camera to capture a photo.
            // The `requesterObject` should have a `onPhotoCaptured(success, dataUri)` method.
            capturePhoto: function(requesterObject, captureOptions = {}) {
                this.currentPhotoRequester = requesterObject; // Store the object waiting for photo.

                const photoIntentConfig = {
                    callbackTarget: "nativeBridge.photoCaptureCallback",
                    maxWidth: captureOptions.maxWidth || 1024,
                    maxHeight: captureOptions.maxHeight || 0, // 0 implies aspect ratio maintained.
                    promptText: captureOptions.prompt || "Saving image..."
                };
                nativeBridge.sendNativeCommand(photoIntentConfig, "app:capturePhotoIntent");
            },

            // Checks if the application is running in debug mode.
            isDebuggingEnabled: function() {
                const debugStatus = nativeBridge.sendNativeCommand("", "app:queryDebugMode");
                console.log("NativeBridge Debug Mode Status: " + debugStatus);
                return debugStatus === true; // Ensure boolean return.
            },

            // Retrieves the device's current geographical location.
            getCurrentLocation: function() {
                return nativeBridge.sendNativeCommand("", "app:getDeviceLocation");
            },

            // Instructs the native container to load a new URL.
            navigateToURL: function(urlAddress) {
                if (typeof urlAddress === 'string' && urlAddress.length > 0) {
                    nativeBridge.sendNativeCommand(urlAddress, "app:loadWebURL");
                } else {
                    console.error("NativeBridge: Invalid URL provided for navigation.");
                }
            },

            // Dismisses the application's splash screen.
            dismissSplashScreen: function() {
                nativeBridge.sendNativeCommand(null, "app:hideAppSplash");
            },

            // Hides the native soft keyboard.
            hideSoftKeyboard: function() {
                nativeBridge.sendNativeCommand(null, "app:hideKeyboard");
            },

            // Terminates the current native activity/screen.
            terminateCurrentActivity: function() {
                nativeBridge.sendNativeCommand(null, "app:finishCurrentActivity");
            },

            // Displays a modal alert dialog.
            displayModalAlert: function(titleText, messageContent, preventCancel = false) {
                const alertConfig = {
                    dialogTitle: titleText,
                    dialogMessage: messageContent,
                    isNonCancellable: preventCancel
                };
                return nativeBridge.sendNativeCommand(alertConfig, "app:showAlertDialog");
            },

            // Shows a modal loading indicator with a message.
            showLoadingOverlay: function(loadingMessage) {
                nativeBridge.sendNativeCommand(loadingMessage, "app:showLoadingSpinner");
            },

            // Hides the active modal loading indicator.
            hideLoadingOverlay: function() {
                nativeBridge.sendNativeCommand(null, "app:hideLoadingSpinner");
            }
        };
    }
    // Set a global debug flag based on native bridge status.
    if (window.$ && typeof $.DEBUG === 'undefined') {
        $.DEBUG = nativeBridge.isDebuggingEnabled();
    }


/*------------------------ View Components ------------------------------*/

    // Generic template structure: A holder div within "#component-templates"
    //      Attributes:
    //          view-class: A class name from the "applicationNamespace" or empty (defaults to $.View)
    //          delegate-class: A class name from the "applicationNamespace" for event delegation

    // This component manages multiple tab-like subviews within a single display area.
    // It expects a template containing a main content area (e.g., "#tab-content-area")
    // and a tab bar (e.g., "#tab-selector-bar").
    $.TabViewContainer = $.View.extend({
        // Defines the initial state for instance-specific members.
        // This method is called once per instance to reset properties.
        initializeMembers: function() {
            return {
                tabIdentifiers: [], // Array of unique IDs for each tab.
                currentActiveTabId: null, // ID of the currently displayed tab.
                tabBarHeightValue: -1, // Cached height of the tab bar.

                activeTabComponentFragment: null, // DOM fragment of the active subview.
                subviewInstances: {}, // Map: tabId -> subview instance.
                tabButtonElements: {}, // Map: tabId -> jQuery element of the tab button.
                $tabBarElement: null // jQuery object for the tab bar container.
            };
        },

        // Initializes the data members using the results from `initializeMembers`.
        resetDataMembers: function() {
            const initialData = this.initializeMembers();
            for(const propName in initialData) {
                this[propName] = initialData[propName];
            }
        },

        // Constructor for the TabViewContainer.
        // `templateSelector`: CSS selector for the main template.
        // `appComponentsNamespace`: The namespace where subview classes are defined.
        init: function(templateSelector, appComponentsNamespace) {
            this.resetDataMembers(); // Initialize all instance properties.
            const componentNamespace = appComponentsNamespace || theApp.appNamespace;

            // Render the initial structure of this view.
            this.renderComponent();

            const $componentTemplate = this.fragment;
            // Extract tab identifiers from labels within the tab bar.
            this.tabIdentifiers = $.map($componentTemplate.find("#tab-selector-bar > div > label"), function(labelElem){
                return $(labelElem).attr("id");
            });

            if (this.tabIdentifiers.length === 0) {
                console.error("TabViewContainer: No tabs found in the template. Check #tab-selector-bar structure.");
                // Optionally throw an error or handle gracefully.
                // throw new Error("TabViewContainer: Empty tab configuration detected.");
                return; // Exit if no tabs.
            }

            this.$tabBarElement = $componentTemplate.find("#tab-selector-bar");

            // Instantiate subviews for each tab.
            this.tabIdentifiers.forEach((tabId, index) => {
                const subviewTemplateId = this.generateSubviewTemplateId(tabId);
                this.tabButtonElements[tabId] = $(this.$tabBarElement.find("div")[index]);
                // Create a new subview instance, passing this container as parent.
                this.subviewInstances[tabId] = $.makeView(this, "#" + subviewTemplateId, componentNamespace);
            });

            // Activate the first tab by default.
            if (this.tabIdentifiers.length > 0) {
                this.switchTab(this.tabIdentifiers[0]);
            }
        },

        // Renders or re-renders the component.
        // `forceRender`: If true, forces re-rendering even if fragment exists.
        // `originator`: The component that initiated the render (for conditional updates).
        renderComponent: function(forceRender, originator) {
            // Re-create the fragment if forced or if it doesn't exist.
            if ((forceRender && originator === this) || !this.fragment) {
                if (this.fragment) {
                    this.disconnect(this.fragment); // Disconnect old event handlers.
                }
                this.fragment = $(this.tmpl); // Clone the template HTML.
                this.connect(this.fragment); // Reconnect event handlers.
            }

            // Render the active subview if necessary.
            if (this.currentActiveTabId &&
                (!this.activeTabComponentFragment ||
                (forceRender && (originator === this.subviewInstances[this.currentActiveTabId] ||
                                 originator === this.subviewInstances[this.currentActiveTabId].delegate)))) {

                // Render the active subview and get its DOM fragment.
                this.activeTabComponentFragment = this.subviewInstances[this.currentActiveTabId].render(forceRender, originator).fragment;
                const $contentArea = this.fragment.find("#tab-content-area");
                let customCssClass;

                // Apply custom CSS class from the subview.
                if (customCssClass = this.subviewInstances[this.currentActiveTabId].cssClass) {
                    $contentArea.attr("class", "").addClass(customCssClass); // Clear previous and add new.
                } else {
                    $contentArea.attr("class", ""); // Clear all classes.
                }

                $contentArea.empty().append(this.activeTabComponentFragment); // Replace content.
            }
            return this;
        },

        // Cleans up the view and its subviews.
        destroy: function() {
            this._super_.destroy.call(this); // Call parent's destroy method.
            // Destroy all subview instances.
            $.each(this.subviewInstances, (viewInstance, tabKey) => {
                viewInstance.destroy();
                this.subviewInstances[tabKey] = null; // Dereference.
            });
            this.tabIdentifiers.length = 0; // Clear array.
            this.tabButtonElements = {};
        },

        // Switches to a different tab.
        switchTab: function(targetTabId) {
            if (this.currentActiveTabId === targetTabId) {
                // If already on this tab, notify delegate if applicable.
                // this.subviewInstances[targetTabId].doDelegate("tabAlreadyActive");
                return;
            }

            this.renderComponent(); // Ensure the container is rendered.

            // Update tab bar visual state.
            if (this.currentActiveTabId) {
                this.tabButtonElements[this.currentActiveTabId].removeClass("selected-tab");
                // Notify the old tab's delegate that it's being switched out.
                this.subviewInstances[this.currentActiveTabId].doDelegate("tabSwitchedOut");
            }
            this.tabButtonElements[targetTabId].addClass("selected-tab");

            // Notify the new tab's delegate that it's being switched in.
            this.subviewInstances[targetTabId].doDelegate("tabSwitchedIn");

            this.currentActiveTabId = targetTabId;
            this.activeTabComponentFragment = null; // Invalidate cache for new tab.
            this.renderComponent(); // Re-render to display the new tab's content.
        },

        // Handler for soft keyboard visibility changes.
        // Adjusts layout to hide/show the tab bar when keyboard appears/disappears.
        handleSoftKeyboardVisibility: function(keyboardIsVisible) {
            // Calculate tab bar height only once.
            if (this.tabBarHeightValue <= 0) {
                this.calculateTabBarHeight();
            }
            if (this.tabBarHeightValue <= 0) { // If still unable to get height, return.
                return;
            }

            const $contentArea = this.fragment.find("#tab-content-area");
            if (keyboardIsVisible) {
                // When keyboard is visible, hide the tab bar by moving it off-screen.
                $contentArea.css("margin-bottom", 0);
                this.$tabBarElement.css("margin-bottom", -this.tabBarHeightValue);
            } else {
                // When keyboard is hidden, restore the tab bar.
                $contentArea.css("margin-bottom", this.tabBarHeightValue);
                this.$tabBarElement.css("margin-bottom", 0);
            }
        },

        // Computes and stores the height of the tab bar.
        calculateTabBarHeight: function() {
            if (this.$tabBarElement && this.$tabBarElement.length) {
                this.tabBarHeightValue = this.$tabBarElement.outerHeight(true); // Include margins.
            }
        },

        // Generates the expected template ID for a subview based on its tab name.
        generateSubviewTemplateId: function(tabName) {
            return "template-for-view-" + tabName;
        }
    });

    // Manages a stack of views, providing navigation capabilities (push/pop).
    $.NavigationStackView = $.View.extend({
        // Defines the initial state for instance-specific members.
        initializeMembers: function() {
            return {
                TRANSITION_END_EVENT: "transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", // Cross-browser transition end.
                viewCacheMap: {}, // Stores instantiated views by a unique key.
                viewStackArray: [], // Ordered list of views in the stack.
                domElementStack: [], // Corresponding DOM elements for views.
                scrollPositionStack: [], // Stores scroll positions before pushing new views.

                $mainStageContainer: null, // The main DOM element where views are displayed.
                $navigationBarElement: null, // The DOM element for the navigation bar.
                navbarDefaultClass: null, // Original class of the navigation bar.
                navbarDefaultContent: null // Original HTML content of the navigation bar.
            };
        },

        // Initializes the data members using the results from `initializeMembers`.
        resetDataMembers: function() {
            const initialData = this.initializeMembers();
            for(const propName in initialData) {
                this[propName] = initialData[propName];
            }
        },

        init: function(templateSelector, appComponentsNamespace) {
            this.resetDataMembers();
            this.appNamespace = appComponentsNamespace || theApp.appNamespace;

            // Render the base navigation view template.
            this.renderComponent();
            this.$mainStageContainer = this.fragment.find("#view-stage");
            this.$navigationBarElement = this.fragment.find("#app-navbar");

            // Store default navigation bar state for resetting.
            if (this.$navigationBarElement.length) {
                this.navbarDefaultClass = this.$navigationBarElement.attr("class");
                this.navbarDefaultContent = this.$navigationBarElement.html();
            }
        },

        // Pushes a new view onto the navigation stack.
        // `viewInstance`: The view component to push.
        // `transitionEffect`: Optional CSS class for transition (e.g., "slide-left").
        pushView: function(viewInstance, transitionEffect = 'slide-in-right') {
            if (!viewInstance || !viewInstance.fragment) {
                console.error("NavigationStackView: Attempted to push an invalid view instance.");
                return;
            }

            const currentActiveView = this.getCurrentView();
            if (currentActiveView) {
                // Save scroll position of the current view before hiding it.
                this.scrollPositionStack.push(this.$mainStageContainer.scrollTop());
                currentActiveView.doDelegate("viewWillDisappear");
                currentActiveView.fragment.addClass('hidden'); // Hide the previous view.
            }

            this.viewStackArray.push(viewInstance);
            this.domElementStack.push(viewInstance.fragment);

            // Append the new view's fragment to the stage.
            this.$mainStageContainer.append(viewInstance.fragment);
            viewInstance.fragment.addClass(transitionEffect); // Apply transition class.

            // Wait for transition to complete before removing the class.
            viewInstance.fragment.one(this.TRANSITION_END_EVENT, () => {
                viewInstance.fragment.removeClass(transitionEffect);
                viewInstance.doDelegate("viewDidAppear");
            });

            this.updateNavigationBar(viewInstance); // Update navbar for the new view.
        },

        // Pops the top view from the navigation stack.
        // `transitionEffect`: Optional CSS class for transition (e.g., "slide-right").
        popView: function(transitionEffect = 'slide-out-right') {
            if (this.viewStackArray.length <= 1) {
                // Cannot pop the last view.
                console.warn("NavigationStackView: Cannot pop the last view on the stack.");
                return;
            }

            const viewToPop = this.viewStackArray.pop();
            this.domElementStack.pop();
            viewToPop.doDelegate("viewWillDisappear");

            viewToPop.fragment.addClass(transitionEffect); // Apply exit transition.

            viewToPop.fragment.one(this.TRANSITION_END_EVENT, () => {
                viewToPop.fragment.remove(); // Remove from DOM after transition.
                viewToPop.destroy(); // Clean up the view instance.
            });

            const previousView = this.getCurrentView();
            if (previousView) {
                previousView.fragment.removeClass('hidden'); // Show the previous view.
                previousView.doDelegate("viewDidAppear");

                // Restore scroll position.
                this.$mainStageContainer.scrollTop(this.scrollPositionStack.pop());
                this.updateNavigationBar(previousView); // Update navbar for the previous view.
            } else {
                // If no views left, reset the navigation bar.
                this.resetNavigationBar();
            }
        },

        // Retrieves the currently active view component.
        getCurrentView: function() {
            return this.viewStackArray[this.viewStackArray.length - 1];
        },

        // Updates the navigation bar based on the properties of the active view.
        updateNavigationBar: function(activeView) {
            if (!this.$navigationBarElement || !activeView) return;

            // Delegate a method to the view to get its navbar configuration.
            const navbarConfig = activeView.doDelegate("getNavigationBarConfig");

            // Reset to default first to ensure a clean state.
            this.$navigationBarElement.attr("class", this.navbarDefaultClass);
            this.$navigationBarElement.html(this.navbarDefaultContent);

            if (navbarConfig) {
                if (navbarConfig.cssClass) {
                    this.$navigationBarElement.addClass(navbarConfig.cssClass);
                }
                if (navbarConfig.htmlContent) {
                    this.$navigationBarElement.html(navbarConfig.htmlContent);
                }
                // Potentially add logic for title, left/right buttons etc.
            }
        },

        // Resets the navigation bar to its default appearance.
        resetNavigationBar: function() {
            if (this.$navigationBarElement) {
                this.$navigationBarElement.attr("class", this.navbarDefaultClass);
                this.$navigationBarElement.html(this.navbarDefaultContent);
            }
        },

        // Default render method (can be overridden by specific views).
        renderComponent: function() {
            if (!this.fragment) {
                this.fragment = $(this.tmpl); // Create fragment from template.
                this.connect(this.fragment); // Connect event handlers.
            }
            return this;
        },

        // Destroys the navigation stack and all its contained views.
        destroy: function() {
            this._super_.destroy.call(this);
            // Destroy all views in the stack and cache.
            this.viewStackArray.forEach(view => view.destroy());
            $.each(this.viewCacheMap, (view, key) => view.destroy());

            this.viewStackArray.length = 0;
            this.domElementStack.length = 0;
            this.scrollPositionStack.length = 0;
            this.viewCacheMap = {};
        }
    });

    // In a real application, the `theApp` and `$.View.extend` would be defined elsewhere.
    // Assuming jQuery and a base View class are available.
    // For this clone, these are just illustrative.
    if (typeof $ === 'undefined') {
        window.$ = {
            // Simplified jQuery-like utility methods for demonstration.
            map: function(arr, cb) { return arr.map(cb); },
            each: function(obj, cb) {
                if (Array.isArray(obj)) { obj.forEach((v, i) => cb(v, i)); }
                else { Object.keys(obj).forEach(k => cb(obj[k], k)); }
            },
            bind: function(fn, ctx) { return fn.bind(ctx); },
            delegate: function(obj, methodName, ...args) {
                if (obj && typeof obj[methodName] === 'function') {
                    obj[methodName](...args);
                }
            },
            isFunction: function(obj) { return typeof obj === 'function'; },
            // Mock for $.View.extend
            View: {
                extend: function(protoProps) {
                    const parent = this;
                    const child = function() { return parent.apply(this, arguments); };
                    $.extend(child, parent); // Inherit static properties.
                    child.prototype = Object.create(parent.prototype);
                    $.extend(child.prototype, protoProps);
                    child.prototype.constructor = child;
                    child.prototype._super_ = parent.prototype; // Reference to parent prototype.
                    return child;
                }
            },
            // Mock for $.makeView
            makeView: function(parentView, tmplSelector, namespace) {
                // In a real app, this would instantiate the correct View subclass.
                // For this example, we'll just return a mock object.
                const MockView = {
                    tmpl: tmplSelector,
                    fragment: $(tmplSelector).clone(),
                    parent: parentView,
                    delegate: parentView, // For simplicity, parent is delegate.
                    cssClass: '',
                    connect: function() { /* mock connect */ },
                    disconnect: function() { /* mock disconnect */ },
                    render: function() { return this; },
                    destroy: function() { /* mock destroy */ },
                    doDelegate: function(methodName, ...args) {
                        if (this.delegate && typeof this.delegate[methodName] === 'function') {
                            this.delegate[methodName](...args);
                        }
                    }
                };
                return MockView;
            },
            // Simple extend utility.
            extend: function(target, source) {
                for (let key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
                return target;
            }
        };
    }
    if (typeof theApp === 'undefined') {
        window.theApp = {
            appNamespace: {} // Mock namespace.
        };
    }
})();