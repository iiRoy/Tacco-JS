'use strict';

// Module-level configuration and state management
let apiConfiguration = {},
    commonRequestHeaders = [];

// A utility for logging messages when in development mode
function activityMonitor(logEntry) {
    // Only output logs if the debug flag is enabled in the API configuration
    if (apiConfiguration.verboseLog) {
        console.info(`[API Bridge Log]: ${new Date().toISOString()} - ${logEntry}`);
    }
}

// Establishes the core configuration for the API bridge, including headers and endpoint definitions.
module.exports.initializeService = function(configurationData) {
    // Validate input: ensure configurationData is an object
    if (!configurationData || typeof configurationData !== 'object') {
        throw new Error("API Bridge: Initial configuration data must be a valid object.");
    }

    // Overwrite the global API configuration with the provided settings
    apiConfiguration = configurationData;

    // Set common headers that apply to all requests
    if (apiConfiguration.defaultHeaders) {
        module.exports.setCommonHeaders(apiConfiguration.defaultHeaders);
    }

    // Register all defined API endpoints
    if (Array.isArray(apiConfiguration.apiEndpoints)) {
        apiConfiguration.apiEndpoints.forEach(function(endpointDef) {
            module.exports.registerEndpoint(endpointDef);
        });
    } else {
        activityMonitor("No API endpoints defined in configuration.");
    }

    // Initialize data model integration if models are specified
    if (apiConfiguration.dataModels) {
        initializeDataLayer();
        if (Array.isArray(apiConfiguration.dataModels)) {
            apiConfiguration.dataModels.forEach(function(modelDef) {
                module.exports.registerDataModel(modelDef);
            });
        }
    }
};

/**
 * Helper function to safely parse a JSON string.
 * Returns the parsed object or the original string if parsing fails.
 * @param {string} inputText The string to parse.
 * @returns {object|string} The parsed object or the original string.
 */
const safelyParseJson = (inputText) => {
    if (typeof inputText !== 'string' || !inputText.trim()) {
        return inputText; // Not a string or empty, return as is
    }
    try {
        const parsed = JSON.parse(inputText);
        // If it was a JSON string, return the object.
        // If it was a string that JSON.parse converted to a primitive (e.g., "null", "123"),
        // we might want to preserve that behavior or return the original string if it wasn't an object/array.
        // For this clone, we'll return whatever JSON.parse gives.
        return parsed;
    } catch (e) {
        activityMonitor(`JSON parsing failed for: "${inputText.substring(0, 50)}..." - Error: ${e.message}`);
        return inputText; // Return original text on parsing error
    }
};

/**
 * Utility to construct the full request URL.
 * @param {string} baseUrl The base URL from config.
 * @param {string} relativePath The relative path for the current request.
 * @returns {string} The complete URL.
 */
const buildFullUrl = (baseUrl, relativePath) => {
    if (!relativePath) return ''; // Guard against empty relative path

    if (baseUrl) {
        // Ensure proper URL concatenation (e.g., avoid double slashes)
        const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const path = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
        return `${base}/${path}`;
    }
    return relativePath;
};


// Executes an HTTP request to a specified URL with given parameters and callbacks.
function performNetworkCall(callParameters, successCallback, failureCallback) {

    // Log the target URL for debugging purposes
    const targetUrl = buildFullUrl(apiConfiguration.baseUrl, callParameters.path);
    activityMonitor(`API Request: ${callParameters.methodType} ${targetUrl}`);

    if (callParameters.payload) {
        activityMonitor(`Request Payload: ${JSON.stringify(callParameters.payload)}`);
    }

    // Ensure Titanium Network module is available
    if (typeof Titanium === 'undefined' || !Titanium.Network || !Titanium.Network.createHTTPClient) {
        const err = new Error("Titanium.Network module not found. Cannot perform HTTP requests.");
        failureCallback ? failureCallback(err) : console.error(err);
        return;
    }

    // Initialize the HTTP client instance
    const networkClient = Titanium.Network.createHTTPClient();
    let isFormUrlEncoded = false;

    // Configure the request timeout
    networkClient.setTimeout(apiConfiguration.requestTimeout || 15000); // Default to 15 seconds

    // Open the connection using the specified method and URL
    networkClient.open(callParameters.methodType, targetUrl);

    // Apply global request headers
    commonRequestHeaders.forEach(currentHeader => {
        if (currentHeader.key === "Content-Type" && currentHeader.val === "application/x-www-form-urlencoded") {
            isFormUrlEncoded = true;
        }
        networkClient.setRequestHeader(currentHeader.key, typeof currentHeader.val === "function" ? currentHeader.val() : currentHeader.val);
    });

    // Apply request-specific headers, overriding global ones if conflicts exist
    if (callParameters.additionalHeaders) {
        Object.entries(callParameters.additionalHeaders).forEach(([headerName, headerValue]) => {
            if (headerName === "Content-Type" && headerValue === "application/x-www-form-urlencoded") {
                isFormUrlEncoded = true;
            }
            networkClient.setRequestHeader(headerName, typeof headerValue === "function" ? headerValue() : headerValue);
        });
    }

    // Define success event handler
    networkClient.onload = function(e) {
        activityMonitor(`Request successful for ${targetUrl} (Status: ${networkClient.status})`);
        const responsePayload = safelyParseJson(networkClient.responseText);

        // Prioritize module-level success handler, then request-specific, then a fallback
        if (apiConfiguration.onSuccessGlobal) {
            apiConfiguration.onSuccessGlobal(responsePayload, successCallback);
        } else if (successCallback) {
            successCallback(responsePayload);
        } else {
            activityMonitor(`No success callback provided for ${targetUrl}, response ignored.`);
        }
    };

    // Define error event handler
    networkClient.onerror = function(e) {
        const errorDetails = {
            url: targetUrl,
            status: networkClient.status,
            error: e.error,
            response: safelyParseJson(networkClient.responseText || "{}") // Provide default empty object for response
        };
        activityMonitor(`Request failed for ${targetUrl} (Status: ${networkClient.status}, Error: ${e.error})`);

        // Prioritize request-specific error handler, then module-level, then a fallback
        if (failureCallback) {
            failureCallback(errorDetails);
        } else if (apiConfiguration.onErrorGlobal) {
            apiConfiguration.onErrorGlobal(errorDetails);
        } else {
            // If no specific error handler, and no global one, try the success callback as a last resort
            // (this can be useful for some APIs that return errors in a 'success' format)
            if (successCallback) {
                successCallback(errorDetails);
            } else {
                // If all else fails, log a critical error and throw
                console.error("API Bridge Critical Error: No handler for request failure.", errorDetails);
                throw new Error(`API Bridge :: Unhandled network error for: ${targetUrl}`);
            }
        }
    };

    // Function to transmit the actual request
    const transmitRequest = () => {
        const isBodyMethod = ["POST", "PUT", "PATCH"].includes(callParameters.methodType);

        if (callParameters.payload && isBodyMethod) {
            if (isFormUrlEncoded) {
                // Assuming payload is already form-encoded or a simple object
                networkClient.send(callParameters.payload);
            } else {
                // Default to sending JSON stringified payload
                networkClient.send(JSON.stringify(callParameters.payload));
            }
        } else {
            networkClient.send(); // No body for GET/DELETE or no payload provided
        }
    };

    // Pre-process POST requests if a handler is defined in the configuration
    if (callParameters.methodType === "POST" && apiConfiguration.preProcessPost) {
        // Ensure payload exists, even if empty, for the pre-processor
        let currentPayload = callParameters.payload || {};

        apiConfiguration.preProcessPost(currentPayload, function(modifiedPayload) {
            callParameters.payload = modifiedPayload; // Update payload with pre-processed data
            transmitRequest();
        });
    } else {
        transmitRequest(); // Proceed directly if no pre-processing is needed
    }
}

// Configures global HTTP request headers for the API bridge.
module.exports.setCommonHeaders = function(headerMap) {
    if (!headerMap || typeof headerMap !== 'object') {
        activityMonitor("Attempted to set common headers with invalid input.");
        return;
    }
    commonRequestHeaders = []; // Clear existing headers
    Object.entries(headerMap).forEach(([headerKey, headerValue]) => {
        commonRequestHeaders.push({
            key: headerKey,
            val: headerValue
        });
    });
    activityMonitor(`Set ${commonRequestHeaders.length} common headers.`);
};

// Registers a new API endpoint, creating a callable function on the exports object.
module.exports.registerEndpoint = function(endpointDefinition) {
    // Basic validation for endpoint definition
    if (!endpointDefinition || typeof endpointDefinition.name !== 'string' || !endpointDefinition.name.trim()) {
        console.warn("API Bridge: Invalid endpoint definition provided. Skipping registration.");
        return;
    }

    module.exports[endpointDefinition.name] = function(requestParameters, onCompletion) {
        let requestBody = null;
        let httpMethod = "GET";
        let requestUrlTemplate = null;
        let onFailed = null;

        // Determine the HTTP method based on definition properties
        if (endpointDefinition.post) httpMethod = "POST";
        else if (endpointDefinition.get) httpMethod = "GET";
        else if (endpointDefinition.put) httpMethod = "PUT";
        else if (endpointDefinition.delete) httpMethod = "DELETE";
        else if (endpointDefinition.patch) httpMethod = "PATCH"; // Added PATCH method
        else {
            console.warn(`API Bridge: Endpoint '${endpointDefinition.name}' has no recognized HTTP method defined. Defaulting to GET.`);
            httpMethod = "GET";
        }

        // Select the URL template corresponding to the determined HTTP method
        requestUrlTemplate = endpointDefinition[httpMethod.toLowerCase()] || endpointDefinition.get;

        // Handle flexible parameter signature: if only one arg and it's a function, it's the callback
        if (typeof requestParameters === "function" && onCompletion === undefined) {
            onCompletion = requestParameters;
            requestParameters = {}; // No explicit params, initialize as empty object
        } else if (requestParameters === undefined) {
            requestParameters = {}; // Ensure params is an object
        }

        // Process parameters to populate URL placeholders and extract request body
        if (requestParameters && typeof requestParameters === 'object') {
            Object.entries(requestParameters).forEach(([paramKey, paramValue]) => {
                if (paramKey === "body") {
                    requestBody = paramValue;
                } else {
                    // Replace all occurrences of the placeholder in the URL template
                    const placeholder = `<${paramKey}>`;
                    if (requestUrlTemplate.includes(placeholder)) {
                        const replacement = typeof paramValue === "object" ? JSON.stringify(paramValue) : String(paramValue);
                        requestUrlTemplate = requestUrlTemplate.split(placeholder).join(replacement);
                    }
                }
            });
        }

        // Wrap success callback if an endpoint-specific handler is defined
        if (endpointDefinition.onSuccessHandler) {
            const originalCompletionHandler = onCompletion;
            onCompletion = function(response) {
                endpointDefinition.onSuccessHandler(response, originalCompletionHandler);
            };
        }

        // Wrap error callback if an endpoint-specific handler is defined
        if (endpointDefinition.onErrorHandler) {
            onFailed = function(error) {
                endpointDefinition.onErrorHandler(error, onCompletion); // Pass success callback for potential recovery
            };
        }

        // Explicit parameter validation
        if (Array.isArray(endpointDefinition.requiredParams)) {
            endpointDefinition.requiredParams.forEach(expectedParam => {
                const targetObject = (httpMethod === "POST" || httpMethod === "PUT" || httpMethod === "PATCH") && requestBody ? requestBody : requestParameters;
                if (!Object.prototype.hasOwnProperty.call(targetObject, expectedParam)) {
                    throw new Error(`API Bridge :: Missing required parameter '${expectedParam}' for endpoint '${endpointDefinition.name}'.`);
                }
            });
        }

        // Automatic URL parameter validation (if enabled globally)
        if (apiConfiguration.autoValidateUrlParameters) {
            const placeholderRegex = /(\<\w+\>)/g;
            let unresolvedPlaceholders = [];
            let matchResult;

            while ((matchResult = placeholderRegex.exec(requestUrlTemplate)) !== null) {
                unresolvedPlaceholders.push(matchResult[0]);
            }

            if (unresolvedPlaceholders.length > 0) {
                throw new Error(`API Bridge :: Unresolved URL placeholders: ${unresolvedPlaceholders.join(', ')} for endpoint '${endpointDefinition.name}'.`);
            }
        }

        // Execute the network request
        performNetworkCall({
            path: requestUrlTemplate,
            methodType: httpMethod,
            payload: requestBody,
            additionalHeaders: endpointDefinition.requestSpecificHeaders || endpointDefinition.headers,
        }, onCompletion, onFailed);
    };
};

// Integration with Alloy/Backbone models. This section is conditionally executed.
function initializeDataLayer() {
    // Guard against re-initialization
    if (Alloy.originalCreateModel) {
        activityMonitor("Alloy data layer already initialized.");
        return;
    }

    // Store a reference to the original Alloy.createModel function
    Alloy.originalCreateModel = Alloy.createModel;

    // Override Alloy.createModel to support custom model creation
    Alloy.createModel = function(modelName, modelAttributes) {
        try {
            // Attempt to use the original Alloy method first
            return Alloy.originalCreateModel(modelName, modelAttributes);
        } catch (err) {
            // If original method fails (e.g., model not defined in Alloy),
            // fallback to our custom model creation logic
            activityMonitor(`Alloy.createModel failed for ${modelName}, attempting custom model creation. Error: ${err.message}`);
            return module.exports.buildModelInstance(modelName, modelAttributes);
        }
    };

    // Provides a method to create a basic Backbone model instance
    module.exports.buildModelInstance = function(modelName, modelAttributes) {
        const newModel = new Backbone.Model(modelAttributes);
        newModel.dataTypeIdentifier = modelName; // Custom property to identify model type
        return newModel;
    };

    // Registers a new data model definition with the API bridge
    module.exports.registerDataModel = function(modelDefinition) {
        if (!modelDefinition || typeof modelDefinition.name !== 'string') {
            console.warn("API Bridge: Invalid model definition provided. Skipping registration.");
            return;
        }

        module.exports.modelRegistry = module.exports.modelRegistry || {};
        module.exports.modelRegistry[modelDefinition.name] = modelDefinition;

        // Create a Backbone Model prototype for this definition
        const dataModelPrototype = Backbone.Model.extend({
            dataTypeIdentifier: modelDefinition.name,
            modelMethodName: modelDefinition.name // A descriptive name for API methods
        });

        // Initialize associated Backbone Collections
        if (Array.isArray(modelDefinition.collections)) {
            modelDefinition.collections.forEach(collectionDef => {
                Alloy.Collections[collectionDef.name] = Alloy.Collections[collectionDef.name] || new Backbone.Collection();
                Alloy.Collections[collectionDef.name].dataTypeIdentifier = modelDefinition.name;
                Alloy.Collections[collectionDef.name].collectionKey = collectionDef.name;
                Alloy.Collections[collectionDef.name].model = dataModelPrototype; // Assign the model prototype
                activityMonitor(`Registered collection '${collectionDef.name}' for model '${modelDefinition.name}'.`);
            });
        }
    };

    // Override Backbone.sync to intercept data operations and route them through the API bridge
    Backbone.sync = function(syncOperation, targetModel, syncOptions) {
        activityMonitor(`Backbone Sync: ${syncOperation} for model type '${targetModel.dataTypeIdentifier}'`);

        const currentModelSettings = module.exports.modelRegistry[targetModel.dataTypeIdentifier];
        if (!currentModelSettings) {
            console.error(`API Bridge: Model definition for '${targetModel.dataTypeIdentifier}' not found in registry.`);
            syncOptions.error && syncOptions.error(new Error(`Model definition for '${targetModel.dataTypeIdentifier}' not found.`));
            return;
        }

        // Handle collection synchronization (read operation)
        if (targetModel instanceof Backbone.Collection) {
            const collectionSettings = currentModelSettings.collections.find(col => col.name === targetModel.collectionKey);
            if (!collectionSettings || !collectionSettings.fetchMethod) {
                console.error(`API Bridge: Collection settings or fetch method not defined for collection '${targetModel.collectionKey}'.`);
                syncOptions.error && syncOptions.error(new Error(`Collection fetch method not defined.`));
                return;
            }

            const fetchApiMethod = module.exports[collectionSettings.fetchMethod];
            if (typeof fetchApiMethod !== 'function') {
                console.error(`API Bridge: API method '${collectionSettings.fetchMethod}' not registered for collection fetch.`);
                syncOptions.error && syncOptions.error(new Error(`API method '${collectionSettings.fetchMethod}' not found.`));
                return;
            }

            fetchApiMethod(syncOptions, function(apiResponse) {
                if (syncOptions.success) {
                    const contentArray = apiResponse[collectionSettings.contentKey] || [apiResponse]; // Default to array if contentKey is missing
                    contentArray.forEach(item => {
                        // Ensure each item has an 'id' property based on model definition
                        if (currentModelSettings.identifierField && item[currentModelSettings.identifierField]) {
                            item.id = item[currentModelSettings.identifierField];
                        } else if (!item.id) {
                            // Fallback if no specific identifierField is set
                            item.id = item._id || Math.random().toString(36).substr(2, 9); // Generate a temporary ID
                            activityMonitor(`Generated temporary ID for item in collection '${targetModel.collectionKey}'.`);
                        }
                    });
                    syncOptions.success(contentArray);
                }
            }, function(error) {
                syncOptions.error && syncOptions.error(error);
            });

        } else if (targetModel instanceof Backbone.Model) {
            // Handle individual model synchronization (create, update, delete)
            let requestPayload = {};
            const modelIdentifier = currentModelSettings.identifierField;

            switch (syncOperation) {
                case "update":
                    if (!currentModelSettings.updateMethod) {
                        console.error(`API Bridge: Update method not defined for model type '${targetModel.dataTypeIdentifier}'.`);
                        syncOptions.error && syncOptions.error(new Error(`Update method not defined.`));
                        break;
                    }
                    requestPayload[modelIdentifier] = targetModel.id;
                    requestPayload.body = targetModel.toJSON(); // Send model attributes as body
                    module.exports[currentModelSettings.updateMethod](requestPayload, function(response) {
                        syncOptions.success && syncOptions.success(response);
                    }, function(error) {
                        syncOptions.error && syncOptions.error(error);
                    });
                    break;

                case "create":
                    if (!currentModelSettings.createMethod) {
                        console.error(`API Bridge: Create method not defined for model type '${targetModel.dataTypeIdentifier}'.`);
                        syncOptions.error && syncOptions.error(new Error(`Create method not defined.`));
                        break;
                    }
                    requestPayload.body = targetModel.toJSON();
                    module.exports[currentModelSettings.createMethod](requestPayload, function(response) {
                        // Update model with ID from response if available
                        if (response && response[modelIdentifier]) {
                            response.id = response[modelIdentifier];
                        }
                        syncOptions.success && syncOptions.success(response);
                    }, function(error) {
                        syncOptions.error && syncOptions.error(error);
                    });
                    break;

                case "delete":
                    if (!currentModelSettings.deleteMethod) {
                        console.error(`API Bridge: Delete method not defined for model type '${targetModel.dataTypeIdentifier}'.`);
                        syncOptions.error && syncOptions.error(new Error(`Delete method not defined.`));
                        break;
                    }
                    requestPayload[modelIdentifier] = targetModel.id;
                    // For delete, body might be optional or specific, sending model data as body for consistency
                    requestPayload.body = targetModel.toJSON();
                    module.exports[currentModelSettings.deleteMethod](requestPayload, function(response) {
                        syncOptions.success && syncOptions.success(response);
                    }, function(error) {
                        syncOptions.error && syncOptions.error(error);
                    });
                    break;

                default:
                    console.warn(`API Bridge: Unhandled Backbone sync operation: ${syncOperation} for model type '${targetModel.dataTypeIdentifier}'.`);
                    syncOptions.error && syncOptions.error(new Error(`Unsupported sync operation: ${syncOperation}`));
                    break;
            }
        }
    };
}