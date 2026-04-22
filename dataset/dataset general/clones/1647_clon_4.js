function _invoke_host_command_(commandIdentifier, payloadString) {
    var rawResult = prompt(payloadString, commandIdentifier);
    if (rawResult) {
        try {
            return JSON.parse(rawResult);
        } catch (error) {
            console.error("Host services: Failed to parse native response: " + error.message);
            return null;
        }
    }
    return null;
}

function _iterate_object_properties_(obj, callback) {
    if (!obj) return;
    Object.keys(obj).forEach(function(key) {
        callback(obj[key], key);
    });
}

function _bind_function_context_(fn, context) {
    return function() {
        return fn.apply(context, arguments);
    };
}

function _is_function_type_(candidate) {
    return typeof candidate === 'function';
}

function _get_object_entry_count_(obj) {
    return Object.keys(obj).length;
}

function _perform_delegated_call_(delegateObject, methodName) {
    if (delegateObject && _is_function_type_(delegateObject[methodName])) {
        var args = Array.prototype.slice.call(arguments, 2);
        delegateObject[methodName].apply(delegateObject, args);
    }
}

(function() {
    if (!window._HOST_SERVICES_) {
        window._HOST_SERVICES_ = {
            _global_action_handler_: null,
            _active_camera_request_: null,
            _active_activity_initiator_: null,
            _background_processor_handle_: null,
            _pending_operations_registry_: new Map(),

            _trigger_global_action_: function() {
                if (this._global_action_handler_) {
                    this._global_action_handler_();
                }
            },

            _register_action_handler_: function(handlerFunction) {
                if (this._global_action_handler_) {
                    console.warn("Host services: Global action handler already assigned!");
                }
                this._global_action_handler_ = handlerFunction;
            },

            _deregister_action_handler_: function(handlerFunction) {
                if (this._global_action_handler_ !== handlerFunction) {
                    console.warn("Host services: Attempt to remove a different handler.");
                }
                this._global_action_handler_ = null;
            },

            _launch_menu_action_: function() {},
            _initiate_search_query_: function() {},
            _begin_application_process_: function() {},

            _camera_completion_handler_: function(successFlag, imageDataUri) {
                _perform_delegated_call_(this._active_camera_request_, "cameraCallback", successFlag, imageDataUri);
                this._active_camera_request_ = null;
            },

            _activity_outcome_handler_: function(resultString) {
                var parsedResult = null;
                if (resultString) {
                    parsedResult = JSON.parse(resultString);
                }
                _perform_delegated_call_(this._active_activity_initiator_, "activityResult", parsedResult);
                this._active_activity_initiator_ = null;
            },

            _processing_interval_milliseconds_: 50,
            _max_polling_attempts_: 1000,

            _process_pending_tasks_: function() {
                var completedTaskIds = [];
                this._pending_operations_registry_.forEach(function(task, taskId) {
                    var isFinished = false;
                    var checkResult;

                    if (_is_function_type_(task.completionChecker)) {
                        checkResult = task.completionChecker(taskId, task.auxiliaryData);
                    } else {
                        checkResult = _invoke_host_command_(task.completionChecker, String(taskId));
                    }

                    if (checkResult === null || checkResult === true) {
                        isFinished = true;
                        completedTaskIds.push(taskId);
                    }

                    if (checkResult === true) {
                        var finalResult;
                        if (_is_function_type_(task.resultFetcher)) {
                            finalResult = task.resultFetcher(taskId, task.auxiliaryData);
                        } else {
                            finalResult = _invoke_host_command_(task.resultFetcher, String(taskId));
                        }

                        if (finalResult == null) {
                            if (task.onError) {
                                try {
                                    task.onError("Bad request or no data: " + finalResult);
                                } catch (e) {
                                    console.error("Host services: Error in task onError: " + e.message);
                                }
                            }
                        } else {
                            if (task.onSuccess) {
                                try {
                                    task.onSuccess(finalResult);
                                } catch (e) {
                                    console.error("Host services: Error in task onSuccess: " + e.message);
                                }
                            }
                        }
                    }

                    if (!isFinished && ++task.attempts > _HOST_SERVICES_._max_polling_attempts_) {
                        if (task.onError) {
                            task.onError("Operation timed out.");
                        }
                        completedTaskIds.push(taskId);
                    }
                });

                completedTaskIds.forEach(function(id) {
                    this._pending_operations_registry_.delete(id);
                }, this);

                if (this._pending_operations_registry_.size === 0) {
                    console.info("Host services: All background tasks cleared.");
                    clearTimeout(this._background_processor_handle_);
                    this._background_processor_handle_ = null;
                } else {
                    this._background_processor_handle_ = setTimeout(_bind_function_context_(this._process_pending_tasks_, this), this._processing_interval_milliseconds_);
                }
            },

            _enqueue_host_operation_: function(operationId, successCallback, errorCallback, completionCommand, resultCommand, auxiliaryData) {
                if (!operationId) {
                    if (successCallback) {
                        successCallback(-1);
                    }
                    return;
                }
                this._pending_operations_registry_.set(operationId, {
                    attempts: 0,
                    onSuccess: successCallback,
                    onError: errorCallback || function(msg) { console.warn("Host services: Operation error: " + msg); },
                    completionChecker: completionCommand,
                    resultFetcher: resultCommand,
                    auxiliaryData: auxiliaryData
                });

                if (!this._background_processor_handle_) {
                    console.info("Host services: Starting background task processor.");
                    this._background_processor_handle_ = setTimeout(_bind_function_context_(this._process_pending_tasks_, this), this._processing_interval_milliseconds_);
                }
            },

            _perform_data_insertion_: function(collectionName, dataRecord, completionHandler, databaseName) {
                var requestPayload = {
                    database: databaseName || "met.app.db",
                    operation: "insert_record",
                    parameters: [collectionName, dataRecord]
                };
                var transactionId = _invoke_host_command_("host:database_access", JSON.stringify(requestPayload));
                this._enqueue_host_operation_(
                    transactionId,
                    completionHandler,
                    function(msg) { console.error("Host services: Data insertion error: " + msg); },
                    function(id, auxData) { return _invoke_host_command_("host:database_finished", JSON.stringify([auxData.database, String(id)])); },
                    function(id, auxData) { return _invoke_host_command_("host:database_result", JSON.stringify([auxData.database, String(id)])); },
                    { database: requestPayload.database }
                );
                return transactionId;
            },

            _perform_data_modification_: function(collectionName, dataRecord, filterCondition, filterArguments, completionHandler, databaseName) {
                var requestPayload = {
                    database: databaseName || "met.app.db",
                    operation: "update_record",
                    parameters: [collectionName, dataRecord, filterCondition, filterArguments]
                };
                var transactionId = _invoke_host_command_("host:database_access", JSON.stringify(requestPayload));
                this._enqueue_host_operation_(
                    transactionId,
                    completionHandler,
                    function(msg) { console.error("Host services: Data modification error: " + msg); },
                    function(id, auxData) { return _invoke_host_command_("host:database_finished", JSON.stringify([auxData.database, String(id)])); },
                    function(id, auxData) { return _invoke_host_command_("host:database_result", JSON.stringify([auxData.database, String(id)])); },
                    { database: requestPayload.database }
                );
                return transactionId;
            },

            _perform_data_removal_: function(collectionName, filterCondition, filterArguments, completionHandler, databaseName) {
                var requestPayload = {
                    database: databaseName || "met.app.db",
                    operation: "delete_record",
                    parameters: [collectionName, filterCondition, filterArguments]
                };
                var transactionId = _invoke_host_command_("host:database_access", JSON.stringify(requestPayload));
                this._enqueue_host_operation_(
                    transactionId,
                    completionHandler,
                    function(msg) { console.error("Host services: Data removal error: " + msg); },
                    function(id, auxData) { return _invoke_host_command_("host:database_finished", JSON.stringify([auxData.database, String(id)])); },
                    function(id, auxData) { return _invoke_host_command_("host:database_result", JSON.stringify([auxData.database, String(id)])); },
                    { database: requestPayload.database }
                );
                return transactionId;
            },

            _retrieve_data_query_: function(queryStatement, queryArguments, completionHandler, databaseName) {
                var requestPayload = {
                    database: databaseName || "met.app.db",
                    operation: "select_records",
                    parameters: (queryArguments ? [queryStatement, queryArguments] : [queryStatement])
                };
                var transactionId = _invoke_host_command_("host:database_access", JSON.stringify(requestPayload));
                this._enqueue_host_operation_(
                    transactionId,
                    completionHandler,
                    function(msg) { console.error("Host services: Data query error: " + msg); },
                    function(id, auxData) { return _invoke_host_command_("host:database_finished", JSON.stringify([auxData.database, String(id)])); },
                    function(id, auxData) { return _invoke_host_command_("host:database_result", JSON.stringify([auxData.database, String(id)])); },
                    { database: requestPayload.database }
                );
                return transactionId;
            },

            _fetch_auth_token_queue_: function(endpointUrl, requestData) {
                return _invoke_host_command_("host:ajax_token_fetch", JSON.stringify({
                    url_target: endpointUrl,
                    payload_data: requestData
                }));
            },

            _initiate_async_network_request_: function(requestMethod, targetUrl, requestData, successHandler, errorHandler, accessKey, accessSecret) {
                requestMethod = (requestMethod || "GET").toUpperCase();
                var requestParams = {
                    method_type: requestMethod,
                    target_url: targetUrl,
                    payload_data: requestData
                };
                if (accessKey && accessSecret) {
                    requestParams.authentication_key = accessKey;
                    requestParams.authentication_secret = accessSecret;
                } else {
                    requestParams.authentication_key = window._APP_AUTH_KEY_ || "";
                    requestParams.authentication_secret = window._APP_AUTH_SECRET_ || "";
                }
                var operationKey = _invoke_host_command_("host:async_network", JSON.stringify(requestParams));
                if (operationKey) {
                    this._enqueue_host_operation_(
                        operationKey,
                        successHandler,
                        errorHandler,
                        "host:async_network_completed",
                        "host:async_network_result"
                    );
                } else {
                    if (errorHandler) {
                        errorHandler("Failed to initiate background network task.");
                    }
                }
                return operationKey;
            },

            _download_media_resource_: function(resourcePath, completionHandler, failureHandler) {
                var fetchIdentifier = _invoke_host_command_("host:image_retrieval", resourcePath);
                if (fetchIdentifier) {
                    this._enqueue_host_operation_(
                        fetchIdentifier,
                        completionHandler,
                        failureHandler,
                        "host:image_retrieval_finished",
                        "host:image_retrieval_data"
                    );
                }
                return fetchIdentifier;
            },

            _launch_activity_for_result_: function(fullyQualifiedClassName, parameterString, resultDelegate) {
                this._active_activity_initiator_ = resultDelegate;
                _invoke_host_command_("host:start_activity_and_wait", JSON.stringify({
                    activity_class_name: fullyQualifiedClassName,
                    activity_parameters: parameterString,
                    callback_method: "_HOST_SERVICES_._activity_outcome_handler_"
                }));
            },

            _capture_device_photo_: function(configObject) {
                this._active_camera_request_ = configObject;
                _invoke_host_command_("host:capture_image_intent", JSON.stringify({
                    result_callback: "_HOST_SERVICES_._camera_completion_handler_",
                    image_width: configObject.width || 1024,
                    image_height: configObject.height || 0,
                    user_hint: configObject.hint || "Saving image..."
                }));
            },

            _check_debug_mode_: function() {
                var debugStatus = _invoke_host_command_("host:query_debug_status", "");
                console.log("Host services: Debug mode: " + debugStatus);
                return debugStatus;
            },

            _query_device_location_: function() {
                return _invoke_host_command_("host:get_geo_location", "");
            },

            _navigate_to_web_address_: function(addressUrl) {
                _invoke_host_command_(addressUrl, "host:load_web_page");
            },

            _conceal_splash_screen_: function() {
                _invoke_host_command_("", "host:hide_splash_screen");
            },

            _hide_input_panel_: function() {
                _invoke_host_command_("", "host:hide_input_manager");
            },

            _terminate_current_activity_: function() {
                _invoke_host_command_(null, "host:finish_current_activity");
            },

            _display_modal_alert_: function(alertTitle, alertMessage, suppressCancel) {
                return _invoke_host_command_("host:show_modal_alert", JSON.stringify({
                    dialog_title: alertTitle,
                    dialog_message: alertMessage,
                    disable_cancel: suppressCancel ? true : false
                }));
            },

            _show_progress_indicator_: function(indicatorMessage) {
                _invoke_host_command_(indicatorMessage, "host:show_loading_indicator");
            },

            _hide_progress_indicator_: function() {
                _invoke_host_command_(null, "host:hide_loading_indicator");
            }
        };
    }

    window._APP_DEBUG_STATUS_ = _HOST_SERVICES_._check_debug_mode_();
    window._APP_AUTH_KEY_ = window._APP_AUTH_KEY_ || "";
    window._APP_AUTH_SECRET_ = window._APP_AUTH_SECRET_ || "";

})();