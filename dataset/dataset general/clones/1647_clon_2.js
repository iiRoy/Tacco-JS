/*
 *  Proprietary (c) 2011, MyCorp.org, CodeCraft.
 */

(function () {
    // This provides a global bridge to native platform functionality.
    // The core method is:
    //      appInterface.executeNativeCommand(json_payload, command_string)
    var DATABASE_IDENTIFIER = "app.data.store";

    if (!window.appInterface) {
        window.appInterface = {
            // Callback for handling system-level back actions.
            returnActionHandler: null,

            // Triggers the registered handler for back navigation.
            // Note: This does not determine if the action is handled by JavaScript.
            performReturnAction: function () {
                if (window.appInterface.returnActionHandler) {
                    window.appInterface.returnActionHandler();
                }
            },

            // Sets a function to be called when a system back event occurs.
            registerReturnHandler: function (incoming_function) {
                if (window.appInterface.returnActionHandler) {
                    // Log a warning if a handler is already set.
                    console.warn("ATTENTION: registerReturnHandler: a handler is already established!");
                }
                window.appInterface.returnActionHandler = incoming_function;
            },

            // Removes the currently set back action handler.
            deregisterReturnHandler: function (function_to_remove) {
                if (window.appInterface.returnActionHandler !== function_to_remove) {
                    console.warn("ATTENTION: deregisterReturnHandler: attempting to remove a handler not currently active.");
                }
                window.appInterface.returnActionHandler = null;
            },

            // Placeholder for displaying an application menu.
            showAppMenu: function () {
            },

            // Placeholder for initiating a search operation.
            initiateSearch: function () {
            },

            // Placeholder for starting the main application.
            launchApplication: function () {
            },

            // Core method to execute a command on the native platform.
            executeNativeCommand: function (json_payload, command_string) {
                var js_response = prompt(json_payload, command_string);
                // console.debug("appInterface.executeNativeCommand: RAW RESPONSE: " + js_response);

                if (js_response) {
                    try {
                        js_response = JSON.parse(js_response);
                    } catch (error_instance) {
                        console.error("JSON parsing error: " + error_instance);
                        js_response = null; // Reset on parsing failure
                    }
                    // console.debug("appInterface.executeNativeCommand: PARSED RESPONSE: " + (typeof js_response) + " " + js_response);
                } else {
                    js_response = null; // No response or empty response
                }
                return js_response;
            },

            // Callback for handling results from camera operations.
            photoCaptureCallback: function (status_ok, image_data_uri) {
                // Forward the event to the designated requester object.
                _$.forwardEvent(window.appInterface._cameraRequesterObject, "photoCaptureCallback", status_ok, image_data_uri);
                window.appInterface._cameraRequesterObject = null; // Clear requester after use.
            },
            _cameraRequesterObject: null, // Holds the object requesting camera access. Non-reentrant.

            // Callback for processing results from launched activities.
            activityOutcomeHandler: function (json_string_result) {
                var parsed_json = null;
                if (json_string_result) {
                    parsed_json = JSON.parse(json_string_result);
                }
                // Delegate the result back to the initiating activity launcher.
                _$.forwardEvent(window.appInterface._activityLauncher, "launchedActivityResult", parsed_json);
                window.appInterface._activityLauncher = null; // Clear launcher after result.
            },
            _activityLauncher: null, // Stores the object that initiated the activity. Non-reentrant.

            // Internal mechanism for polling asynchronous operation results.

            _asyncPollTimer: null,
            _pollingParameters: {}, // Maps operation ID to { count, success, error, completionChecker, resultFetcher }

            // Periodically checks for completion of native asynchronous tasks.
            _interfacePoller: function () {
                var completed_tasks = [];
                _$.each(this._pollingParameters, function (task_details, task_identifier) {
                    // task_identifier is the unique ID for the operation, task_details holds callbacks and state.
                    var is_finished = false;
                    var command_result;

                    // Determine how to check for completion.
                    if (_$.isAFunction(task_details.completionChecker)) {
                        console.log("_interfacePoller: utilizing completion functor");
                        command_result = task_details.completionChecker(task_identifier);
                    } else {
                        command_result = window.appInterface.executeNativeCommand("" + task_identifier, task_details.completionChecker);
                    }

                    if (command_result === null || command_result === true) {
                        is_finished = true;
                        completed_tasks.push(task_identifier);
                    }

                    if (command_result === true) {
                        // If the operation is marked as complete, fetch the actual result.
                        if (_$.isAFunction(task_details.resultFetcher)) {
                            command_result = task_details.resultFetcher(task_identifier);
                        } else {
                            command_result = window.appInterface.executeNativeCommand("" + task_identifier, task_details.resultFetcher);
                        }

                        if (command_result == null) {
                            // Handle cases where result fetching failed.
                            if (task_details.errorHandler) {
                                try {
                                    task_details.errorHandler("malformed response: " + command_result);
                                } catch (exception_obj) {
                                    console.error("exception in appInterface.errorHandler: " + exception_obj);
                                }
                            }
                        } else {
                            // Successfully obtained result, trigger success callback.
                            if (task_details.successHandler) {
                                try {
                                    task_details.successHandler(command_result);
                                } catch (exception_obj) {
                                    console.error("exception in appInterface.successHandler: " + exception_obj);
                                }
                            }
                        }
                    }

                    // If not finished and query count exceeds limit, consider it a timeout.
                    if (!is_finished && ++task_details.query_count > 1000) {
                        if (task_details.errorHandler) {
                            task_details.errorHandler("operation timed out");
                        }
                        completed_tasks.push(task_identifier);
                    }
                });

                // Clean up completed tasks from the polling parameters.
                for (var i = 0; i < completed_tasks.length; i++) {
                    delete this._pollingParameters[completed_tasks[i]];
                }

                // If no more tasks to poll, clear the interval timer.
                if (!_$.objectSize(this._pollingParameters)) {
                    console.log("ASYNC TIMER deactivated!");
                    clearInterval(this._asyncPollTimer);
                    this._asyncPollTimer = 0;
                }
            },

            // Sets up polling for database operations.
            _configureDatabasePolling: function (database_name, operation_id, on_completion) {
                if (!operation_id) {
                    if (on_completion) {
                        on_completion(-1); // Indicate failure if no ID.
                    }
                    return;
                }

                // Store polling details for this operation.
                this._pollingParameters[operation_id] = {
                    query_count: 0,
                    successHandler: on_completion,
                    errorHandler: function (error_message) { console.error("DATABASE error: " + error_message); },
                    completionChecker: function (current_id) { return window.appInterface.executeNativeCommand(JSON.stringify([database_name, "" + current_id]), "appInterface:sqlOperationComplete"); },
                    resultFetcher: function (current_id) { return window.appInterface.executeNativeCommand(JSON.stringify([database_name, "" + current_id]), "appInterface:sqlOperationResult"); }
                };

                // Start the polling timer if it's not already running.
                if (!this._asyncPollTimer) {
                    console.log("ASYNC TIMER activated!");
                    this._asyncPollTimer = setInterval(_$.bindFunction(this._interfacePoller, this), 50);
                }
            },

            // Public methods for database interaction.

            // Inserts a new record into a specified table.
            insertIntoDatabase: function (target_table, column_data, on_completion, database_name) {
                var command_object = {
                    dbName: database_name ? database_name : DATABASE_IDENTIFIER,
                    operation_type: "insert",
                    arguments_list: [target_table, column_data]
                };
                var operation_id = window.appInterface.executeNativeCommand(JSON.stringify(command_object), "appInterface:sql");
                this._configureDatabasePolling(command_object.dbName, operation_id, on_completion);
                return operation_id;
            },

            // Updates records in a specified table.
            updateDatabaseRecord: function (target_table, column_data, where_clause, where_arguments, on_completion, database_name) {
                var command_object = {
                    dbName: database_name ? database_name : DATABASE_IDENTIFIER,
                    operation_type: "update",
                    arguments_list: [target_table, column_data, where_clause, where_arguments]
                };
                var operation_id = window.appInterface.executeNativeCommand(JSON.stringify(command_object), "appInterface:sql");
                this._configureDatabasePolling(command_object.dbName, operation_id, on_completion);
                return operation_id;
            },

            // Deletes records from a specified table.
            deleteFromDatabase: function (target_table, where_clause, where_arguments, on_completion, database_name) {
                var command_object = {
                    dbName: database_name ? database_name : DATABASE_IDENTIFIER,
                    operation_type: "delete",
                    arguments_list: [target_table, where_clause, where_arguments]
                };
                var operation_id = window.appInterface.executeNativeCommand(JSON.stringify(command_object), "appInterface:sql");
                this._configureDatabasePolling(command_object.dbName, operation_id, on_completion);
                return operation_id;
            },

            // Executes a SQL SELECT query.
            selectFromDatabase: function (query_string, arguments_list, on_completion, database_name) {
                var command_object = {
                    dbName: database_name ? database_name : DATABASE_IDENTIFIER,
                    operation_type: "select",
                    arguments_list: (arguments_list ? [query_string, arguments_list] : [query_string])
                };
                var operation_id = window.appInterface.executeNativeCommand(JSON.stringify(command_object), "appInterface:sql");
                this._configureDatabasePolling(command_object.dbName, operation_id, on_completion);
                return operation_id;
            },

            // Retrieves a request token for API calls.
            fetchRequestTokenAsync: function (target_url, request_data) {
                return window.appInterface.executeNativeCommand(JSON.stringify({
                    url: target_url,
                    data: request_data
                }), "appInterface:ajaxGetRequestTokenQ");
            },

            // Initiates an asynchronous HTTP request with OAuth signing.
            // request_type: "GET" | "POST"
            // target_url: Base URL (excluding query string)
            // request_data: Data payload
            // success_callback: function(response_data)
            // error_callback: function(error_message)
            //
            // Native platform handles the request without interrupting foreground UI.
            performAsyncRequest: function (request_type, target_url, request_data, success_callback, error_callback, access_key, access_secret) {
                request_type = request_type || "GET";
                request_type = request_type.toUpperCase();
                var request_description = request_type + ": " + target_url;
                var request_parameters = {
                    type: request_type,
                    url: target_url,
                    data: request_data
                };
                if (access_key && access_secret) {
                    request_parameters.accKey = access_key;
                    request_parameters.accSecret = access_secret;
                } else {
                    // Fallback to global application credentials.
                    request_parameters.accKey = window.GLOBAL_ACCESS_KEY;
                    request_parameters.accSecret = window.GLOBAL_ACCESS_SECRET;
                }
                var operation_id = window.appInterface.executeNativeCommand(JSON.stringify(request_parameters), "appInterface:asyncRequest");
                if (operation_id) {
                    this._pollingParameters[operation_id] = {
                        query_count: 0,
                        successHandler: success_callback,
                        errorHandler: error_callback,
                        completionChecker: "appInterface:asyncRequestComplete",
                        resultFetcher: "appInterface:asyncRequestResult"
                    };
                    if (!this._asyncPollTimer) {
                        this._asyncPollTimer = setInterval(_$.bindFunction(this._interfacePoller, this), 50);
                    }
                } else {
                    if (error_callback) {
                        error_callback("failed to set up background worker.");
                    }
                }
                return operation_id;
            },

            // Fetches an image asynchronously.
            retrieveImage: function (target_url, success_callback, error_callback) {
                var operation_id = window.appInterface.executeNativeCommand(target_url, "appInterface:imageFetch");
                if (operation_id) {
                    this._pollingParameters[operation_id] = {
                        query_count: 0,
                        successHandler: success_callback,
                        errorHandler: error_callback,
                        completionChecker: "appInterface:imageFetchComplete",
                        resultFetcher: "appInterface:imageFetchResult"
                    };
                    if (!this._asyncPollTimer) {
                        this._asyncPollTimer = setInterval(_$.bindFunction(this._interfacePoller, this), 50);
                    }
                }
                return operation_id;
            },

            // Launches a native activity and expects a result.
            // outcome_delegate(status_ok, error_message_or_json_string)
            launchActivityForOutcome: function (class_full_name, parameter_string, outcome_delegate) {
                window.appInterface._activityLauncher = outcome_delegate;
                window.appInterface.executeNativeCommand(JSON.stringify({
                    activityClassFullname: class_full_name,
                    activityParam: parameter_string,
                    onResult: "appInterface.activityOutcomeHandler"
                }), "appInterface:launchActivityForOutcome");
            },

            // Triggers the native camera to capture a photo.
            capturePhoto: function (requester_object) {
                window.appInterface._cameraRequesterObject = requester_object;
                window.appInterface.executeNativeCommand(JSON.stringify({
                    cbName: "appInterface.photoCaptureCallback",
                    image_width: 1024,
                    image_height: 0,
                    display_hint: "Saving image..."
                }), "appInterface:photoIntent");
            },

            // Checks if the application is running in debug mode.
            isDebuggingEnabled: function () {
                var debug_status = window.appInterface.executeNativeCommand("", "appInterface:checkDebugMode");
                console.log("isDebuggingEnabled: " + debug_status);
                return debug_status;
            },

            // Retrieves the current geographic location.
            fetchGeolocation: function () {
                return window.appInterface.executeNativeCommand("", "appInterface:obtainGeolocation");
            },

            // Directs the native browser to load a URL.
            navigateURL: function (target_url) {
                window.appInterface.executeNativeCommand(target_url, "appInterface:loadWebPage");
            },

            // Hides the application's splash screen.
            concealSplashScreen: function () {
                window.appInterface.executeNativeCommand("", "appInterface:hideSplash");
            },

            // Hides the software input method (keyboard).
            concealInputMethod: function () {
                window.appInterface.executeNativeCommand("", "appInterface:hideInputMethod");
            },

            // Finishes the current native activity.
            terminateCurrentActivity: function () {
                window.appInterface.executeNativeCommand(null, "appInterface:endActivity");
            },

            // Displays a modal alert dialog.
            showModalAlert: function (alert_title, alert_message, disable_cancel) {
                return window.appInterface.executeNativeCommand(JSON.stringify({ title: alert_title, msg: alert_message, noCancel: disable_cancel ? true : false }), "appInterface:displayModalAlert");
            },

            // Shows a modal loading indicator with a message.
            showLoadingSpinner: function (alert_message) {
                window.appInterface.executeNativeCommand(alert_message, "appInterface:displayLoadingSpinner");
            },

            // Hides any active modal loading indicator.
            hideLoadingSpinner: function () {
                window.appInterface.executeNativeCommand(null, "appInterface:hideLoadingSpinner");
            }
        };
    }
    _$.IS_DEBUG_MODE = window.appInterface.isDebuggingEnabled();


/*------------------------ Visual Panels ------------------------------*/

    // Panel Definition: Based on a holder div within "#templates"
    //      Expected attributes:
    //          panel:     a class name in "applicationNamespace" or empty (defaults to _$.BaseView)
    //          delegate:  a class name in "applicationNamespace"

    // Given a template with two DIVs, typically "tabbed-panels" and "navigationBar",
    // this view identifies all navigation tabs within the "navigationBar"
    // based on their internal labels.
    // It then fetches templates for its child panels using a predefined naming convention.
    _$.NavigationView = _$.BaseView.extend({
        viewComponents: function () {
            return {
                navigationTabs: null,
                currentActiveTab: null,
                navbarDisplayHeight: -1,

                currentTabElement: null,
                childViews: {},
                childTabElements: {},
                $navigationBar: null
            };
        },

        initializeViewComponents: function () {
            var component_data = this.viewComponents();
            for (var component_name in component_data) {
                this[component_name] = component_data[component_name];
            }
        },

        setupView: function (template_selector, application_namespace) {
            this.initializeViewComponents();
            if (!application_namespace) application_namespace = mainApplication.applicationNamespace;

            this.drawView();
            var $template_root = this.fragment;

            // Extract tab names from labels within the navigation bar.
            this.navigationTabs = _$.map($("#navigationBar>div>label", $template_root), function (tab_label) {
                return $(tab_label).attr("identifier");
            });

            if (!this.navigationTabs.length) {
                throw new Error("NavigationView: no navigation tabs found");
            }

            this.$navigationBar = $template_root.find("#navigationBar");

            // Initialize child views and their corresponding tab elements.
            for (var i = 0; i < this.navigationTabs.length; i++) {
                var tab_name = this.navigationTabs[i],
                    child_id = this.childViewTemplateIdentifier(tab_name);
                this.childTabElements[tab_name] = $(this.$navigationBar.find("div")[i]);
                this.childViews[tab_name] = _$.createView(this, "#" + child_id, application_namespace);
            }

            // Set the initial active tab.
            this.switchNavigationTab(this.navigationTabs[0]);
        },

        drawView: function (force_render, triggered_by) {
            // Note: Use 'force_render' with caution; it can invalidate existing fragment references.
            // If this view is currently displayed, manual removal might be necessary.
            if ((force_render && triggered_by === this) || !this.fragment) {
                if (this.fragment) {
                    this.disconnectFromDOM(this.fragment); // Disconnect old fragment.
                }
                this.fragment = $(this.template); // Create new fragment.
                this.connectToDOM(this.fragment); // Connect new fragment.
            }

            // Re-render the active child view if conditions are met.
            if (this.currentActiveTab &&
                (!this.currentTabElement ||
                    (force_render && (triggered_by === this.childViews[this.currentActiveTab]
                        || triggered_by === this.childViews[this.currentActiveTab].delegate)))) {
                // Important: Avoid re-rendering an already rendered child view.
                // Consider releasing resources of inactive child views.
                this.currentTabElement = this.childViews[this.currentActiveTab].drawView(force_render, triggered_by).fragment;
                var $target_container = this.fragment.find("#tabbed-panels"),
                    css_class_name;
                if (css_class_name = this.childViews[this.currentActiveTab].cssClass) {
                    $target_container.addClass(css_class_name);
                } else {
                    $target_container.attr("class", ""); // Clear any existing classes.
                }
                $target_container.empty().append(this.currentTabElement);
            }
            return this;
        },

        destroyComponent: function () {
            this._parent_.destroyComponent.call(this); // Call parent destructor.
            _$.each(this.childViews, function (child_view_instance, view_key) {
                child_view_instance.destroyComponent(); // Destroy each child view.
                this.childViews[view_key] = null; // Clear reference.
            });
        },

        switchNavigationTab: function (new_tab_name) {
            if (this.currentActiveTab === new_tab_name) {
                // this.childViews[new_tab_name].triggerDelegateAction("alreadyActivated");
                return; // Tab is already active.
            }
            this.drawView(); // Ensure the parent view is rendered.

            if (!this.currentActiveTab) {
                // First tab activation.
                for (var i = 0; i < this.navigationTabs.length; i++) {
                    if (this.navigationTabs[i] === new_tab_name) {
                        this.childTabElements[new_tab_name].addClass("selected");
                    } else {
                        this.childTabElements[this.navigationTabs[i]].removeClass("selected");
                    }
                }
            } else {
                // Switching from an existing active tab.
                this.currentTabElement = null; // Clear active fragment reference.
                this.childTabElements[this.currentActiveTab].removeClass("selected");
                this.childViews[this.currentActiveTab].triggerDelegateAction("deactivateTab");
                this.childTabElements[new_tab_name].addClass("selected");
            }
            this.childViews[new_tab_name].triggerDelegateAction("activateTab");
            this.currentActiveTab = new_tab_name;
            this.drawView(); // Re-draw to update content based on new active tab.
        },

        // Application delegate message for keyboard visibility.
        handleSoftKeyboard: function (keyboard_is_visible) {
            if (this.navbarDisplayHeight <= 0) {
                this.calculateNavbarHeight(); // Calculate height if not known.
            }
            if (this.navbarDisplayHeight <= 0) {
                return; // Navbar not yet on screen.
            }

            if (keyboard_is_visible) { // Hide the navigation bar.
                this.fragment.find("#tabbed-panels").css("margin-bottom", 0);
                this.$navigationBar.css("margin-bottom", -this.navbarDisplayHeight);
            } else { // Show the navigation bar.
                this.fragment.find("#tabbed-panels").css("margin-bottom", this.navbarDisplayHeight);
                this.$navigationBar.css("margin-bottom", 0);
            }
        },

        // Determines the height of the navigation bar.
        calculateNavbarHeight: function () {
            this.navbarDisplayHeight = this.$navigationBar.position().height;
        },

        // Generates the template ID for a child view.
        childViewTemplateIdentifier: function (tab_name) {
            return "template-panel-" + tab_name;
        }
    });

    _$.PanelNavigator = _$.BaseView.extend({

        componentData: function () {
            return {
                ANIMATION_END_EVENT: "webkitTransitionEnd",
                panelCache: {},
                panelStack: [],
                elementStack: [],
                scrollPositionStack: [],

                $displayArea: null,
                $topBar: null,
                topBarHomeClass: null,
                topBarHomeContent: null
            };
        },

        initializeViewComponents: function () {
            var component_data = this.componentData();
            for (var member_key in component_data) {
                this[member_key] = component_data[member_key];
            }
        },
})();