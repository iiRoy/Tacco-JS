(function($) {

    // Internal constants and configurations
    const _GLOBAL_ADAPTER_SETTINGS_ = {
        transferDataType: "custom_rest_data", // New custom data type identifier
        jsonContentType: "application/json",
        elementDataFetch: true, // Corresponds to getValues
        elementDataStore: true,    // Corresponds to setValues
        nestedDataOnly: true         // Corresponds to onlyNest
    };

    let _universalPayload_ = null;
    let _endpointRoot_ = '';
    let _legacyHttpMethodFlag_ = false; // Flag for useGetAndPost

    const _OPERATION_PROFILES_ = {
        'create': { httpVerb: 'POST',  processOutgoing: true  },
        'retrieve':  { httpVerb: 'GET',   processOutgoing: false },
        'update': { httpVerb: 'PUT',   processOutgoing: true  },
        'delete': { httpVerb: 'DELETE',processOutgoing: false,
                    onElementSuccess: function() { $(this).remove(); } }
    };

    // --- Core Utility Functions ---

    // Parses diverse argument combinations into a structured settings object.
    function _interpretCallArguments_(...args) {
        let configuration = {};
        let urlArg = null, dataArg = null, successArg = null, optionsArg = null;

        const workingArgs = [...args];

        // 1. Check for options object at the end
        if (workingArgs.length > 0 && typeof workingArgs[workingArgs.length - 1] === 'object' && workingArgs[workingArgs.length - 1] !== null && !$.isFunction(workingArgs[workingArgs.length - 1])) {
            optionsArg = workingArgs.pop();
        }
        // 2. Check for success callback at the end
        if (workingArgs.length > 0 && $.isFunction(workingArgs[workingArgs.length - 1])) {
            successArg = workingArgs.pop();
        }
        // 3. Check for data object at the end
        if (workingArgs.length > 0 && typeof workingArgs[workingArgs.length - 1] === 'object' && workingArgs[workingArgs.length - 1] !== null) {
            dataArg = workingArgs.pop();
        }
        // 4. Remaining argument must be URL
        if (workingArgs.length > 0 && typeof workingArgs[workingArgs.length - 1] === 'string') {
            urlArg = workingArgs.pop();
        }
        // 5. If only one argument was provided and it was an object, it must be the options.
        // This handles cases like `$.read({ url: '/path', ... })`.
        if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
             $.extend(configuration, args[0]);
        } else {
            if (urlArg) configuration.url = urlArg;
            if (dataArg) configuration.data = dataArg;
            if (successArg) configuration.success = successArg;
            if (optionsArg) $.extend(configuration, optionsArg);
        }

        return configuration;
    }

    // Replaces placeholders in a URL string (e.g., /{key}/) with values from a data object.
    function _resolvePathPlaceholders_(templatePath, dataContainer, keepDataIntact) {
        let currentPath = templatePath;
        let activeData = keepDataIntact ? $.extend({}, dataContainer) : dataContainer;
        if (!activeData) activeData = {};

        for (const propertyName in activeData) {
            if (Object.prototype.hasOwnProperty.call(activeData, propertyName)) {
                const token = `{${propertyName}}`;
                if (currentPath.includes(token)) {
                    currentPath = currentPath.replace(token, activeData[propertyName]);
                    if (!keepDataIntact) {
                        delete activeData[propertyName];
                    }
                }
            }
        }
        return currentPath;
    }

    // Serializes outgoing data for AJAX requests, especially for JSON.
    function _prepareOutgoingPayload_(requestSettings) {
        if (requestSettings.processOutgoing && typeof JSON !== 'undefined') {
            requestSettings.processData = false; // Prevent jQuery from processing data
            if (!requestSettings.contentType) {
                requestSettings.contentType = _GLOBAL_ADAPTER_SETTINGS_.jsonContentType;
            }
            if (typeof requestSettings.data !== 'string') {
                requestSettings.data = JSON.stringify(requestSettings.data || {});
            }
        }
    }

    // Deserializes incoming content from AJAX responses.
    function _decodeIncomingContent_(rawResponse) {
        if (!rawResponse || rawResponse.length === 0) return null;
        if (rawResponse.charAt(0) === '<') return $(rawResponse); // Treat as HTML if starts with '<'
        return (typeof JSON !== 'undefined') ? JSON.parse(rawResponse) : window.eval("(" + rawResponse + ")");
    }

    // Manages the execution order of before, primary, and after callbacks.
    function _executeCallbackSequence_(mainCallback, preCb, postCb, dataTypeKey, contextObject, requestSettings) {
        return function(...cbArgs) {
            const extendedArgs = Array.prototype.slice.call(cbArgs);
            extendedArgs.push(requestSettings); // Add full settings as the last argument

            // Custom data processing for specific data types (e.g., 'custom_rest_data')
            if (dataTypeKey === _GLOBAL_ADAPTER_SETTINGS_.transferDataType) {
                // The first argument is the response data (for success) or XHR (for error).
                // _decodeIncomingContent_ applies to the actual response data string.
                extendedArgs[0] = _decodeIncomingContent_.apply(contextObject, [extendedArgs[0]]);
            }

            if (preCb) preCb.apply(contextObject, extendedArgs);
            if (mainCallback) mainCallback.apply(contextObject, extendedArgs);
            if (postCb) postCb.apply(contextObject, extendedArgs);
        };
    }

    // Handles error responses, including status-code specific overrides.
    function _handleAjaxError_(fallbackErrorCallback, currentRequestSettings) {
        return function(jqXHR, statusString) {
            // 'this' context here is the AJAX settings object.
            let specificErrorHandler = currentRequestSettings[jqXHR.status] || fallbackErrorCallback;

            if (specificErrorHandler === 'successful_outcome') { // Custom string to indicate success override
                currentRequestSettings.errorHandled = true; // Mark as handled to prevent further error processing
                return currentRequestSettings.success.apply(this, [null, statusString]); // Call success with null data
            }
            // Execute the chosen error handler with the full callback sequence
            _executeCallbackSequence_(specificErrorHandler, currentRequestSettings.before, currentRequestSettings.after, null, this, currentRequestSettings).apply(this, [jqXHR, statusString]);
        };
    }

    // --- Main Request Dispatcher ---
    function _initiateServiceRequest_(operationIdentifier, ...requestInputArgs) {
        const initialConfiguration = _interpretCallArguments_(...requestInputArgs);
        let finalSettings = $.extend({}, _GLOBAL_ADAPTER_SETTINGS_, initialConfiguration);

        // Merge operation-specific defaults
        const opProfile = _OPERATION_PROFILES_[operationIdentifier];
        if (opProfile) {
            $.extend(finalSettings, opProfile);
        }

        // Merge global payload if available
        if (_universalPayload_ || finalSettings.data) {
            finalSettings.data = $.extend({}, _universalPayload_, finalSettings.data);
        }

        // Resolve URL placeholders
        finalSettings.url = _resolvePathPlaceholders_(finalSettings.url, finalSettings.data);

        // Prepend global endpoint root if set
        if (_endpointRoot_) {
            finalSettings.url = _endpointRoot_ + finalSettings.url;
        }

        // Adjust HTTP method for legacy compatibility if enabled
        if (_legacyHttpMethodFlag_) {
            if (operationIdentifier === 'create' || operationIdentifier === 'update' || operationIdentifier === 'delete') {
                finalSettings.httpVerb = 'POST';
            } else if (operationIdentifier === 'retrieve') {
                finalSettings.httpVerb = 'GET';
            }
        }

        // Prepare outgoing data (e.g., JSON stringify)
        _prepareOutgoingPayload_(finalSettings);

        // Wrap success and error callbacks with pre/post hooks
        finalSettings.success = _executeCallbackSequence_(
            finalSettings.success,
            finalSettings.before,
            finalSettings.after,
            finalSettings.transferDataType, // Custom data type key for processing
            finalSettings, // Context for callbacks (the settings object itself)
            finalSettings
        );
        finalSettings.error = _handleAjaxError_(finalSettings.error, finalSettings);

        // Execute the AJAX call
        return finalSettings.ajaxRequestObject = $.ajax(finalSettings);
    }

    // --- Element-specific functionality ---
    function _processJQueryElementRequest_(operationKind, elementSettings) {
        let currentJQueryElement = $(this); // The jQuery object for the current element

        // Retrieve data from element if enabled and $.values plugin is available
        if (!elementSettings.data && elementSettings.elementDataFetch && $.values) {
            elementSettings.data = currentJQueryElement.values(elementSettings);
        }

        const originalSuccessCb = elementSettings.success;
        elementSettings.success = function(responseContent) {
            // Update element with response data if enabled and $.values is available
            if (responseContent && elementSettings.elementDataStore && $.values) {
                currentJQueryElement.values(responseContent, elementSettings);
            }
            // Execute original success callback if provided
            if (originalSuccessCb) originalSuccessCb.apply(this, arguments);
            // Execute element-specific action from config (e.g., remove element on delete)
            if (elementSettings.onElementSuccess) elementSettings.onElementSuccess.apply(this, arguments);
        };

        // Dispatch the global request using the prepared settings
        _initiateServiceRequest_.apply(null, [operationKind, elementSettings]);
    }

    // --- Public API for the new service ---
    const _SERVICE_INTERFACE_ = {
        apiVersion: "1.0.3-alternative",
        enableOldHttpMethodCompatibility: function() {
            _legacyHttpMethodFlag_ = true;
        },
        setGlobalRequestData: function(dataObject) {
            _universalPayload_ = dataObject;
        },
        setGlobalUrlPrefix: function(prefixString) {
            _endpointRoot_ = prefixString;
        },
        // Global API methods
        createEntry: function(...args) {
            return _initiateServiceRequest_.apply(this, ['create', ...args]);
        },
        retrieveEntry: function(...args) {
            return _initiateServiceRequest_.apply(this, ['retrieve', ...args]);
        },
        updateEntry: function(...args) {
            return _initiateServiceRequest_.apply(this, ['update', ...args]);
        },
        deleteEntry: function(...args) {
            return _initiateServiceRequest_.apply(this, ['delete', ...args]);
        }
    };

    // --- Extend jQuery with global and element-level functions ---
    $.extend({
        // Global functions (e.g., $.createEntry)
        createEntry: _SERVICE_INTERFACE_.createEntry,
        retrieveEntry: _SERVICE_INTERFACE_.retrieveEntry,
        updateEntry: _SERVICE_INTERFACE_.updateEntry,
        deleteEntry: _SERVICE_INTERFACE_.deleteEntry,
    });

    $.fn.extend({
        // Element-level functions (e.g., $('#el').createEntry)
        createEntry: function(...args) {
            const preparedSettings = _interpretCallArguments_(...args);
            // Ensure `this` context (the jQuery element) is preserved for `_processJQueryElementRequest_`
            return this.each(function() {
                _processJQueryElementRequest_.call(this, 'create', preparedSettings);
            });
        },
        retrieveEntry: function(...args) {
            const preparedSettings = _interpretCallArguments_(...args);
            return this.each(function() {
                _processJQueryElementRequest_.call(this, 'retrieve', preparedSettings);
            });
        },
        updateEntry: function(...args) {
            const preparedSettings = _interpretCallArguments_(...args);
            return this.each(function() {
                _processJQueryElementRequest_.call(this, 'update', preparedSettings);
            });
        },
        deleteEntry: function(...args) {
            const preparedSettings = _interpretCallArguments_(...args);
            return this.each(function() {
                _processJQueryElementRequest_.call(this, 'delete', preparedSettings);
            });
        }
    });

    // Expose configuration methods via a distinct global object
    window.RestApiConfigurator = {
        enableOldMethods: _SERVICE_INTERFACE_.enableOldHttpMethodCompatibility,
        setGlobalData: _SERVICE_INTERFACE_.setGlobalRequestData,
        setBaseUrl: _SERVICE_INTERFACE_.setGlobalUrlPrefix,
        pluginVersion: _SERVICE_INTERFACE_.apiVersion,
        // Provide access to internal defaults for advanced customization
        getServiceAdapterSettings: () => $.extend(true, {}, _GLOBAL_ADAPTER_SETTINGS_),
        getOperationProfiles: () => $.extend(true, {}, _OPERATION_PROFILES_) // Deep copy
    };

    return _SERVICE_INTERFACE_; // This return is not strictly necessary for plugin functionality

})(jQuery);