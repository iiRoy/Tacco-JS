/*
 * This file contains RESTe configuration and utility functions.
 * It's a core component for handling API requests and model interactions.
 * Version: 1.0.1
 */

// Initialize global configuration object
var config = {},
    /*
     * Array to store HTTP request headers that apply globally
     * across all requests made by this module.
     */
    requestHeaders = [];

// A simple logging utility, active only when debug mode is enabled in config.
// This helps in debugging network requests and responses.
function log( message ) {

    // Check if the debug flag is set within the global configuration.
    if ( config.debug ) {

        // If debug is true, output the message to the console.
        console.log( message );

    } // End of debug check.
}


/**
 * Sets up the module's configuration based on the provided arguments.
 * This function is the primary entry point for initializing RESTe.
 *
 * @param {Object} args - Configuration object containing various settings
 *                        like URL, methods, models, timeouts, etc.
 */
exports.config = function(args) {

    // Assign the input arguments to the global config object.
    config = args;

    // Set up global request headers from the configuration.
    exports.setRequestHeaders(config.requestHeaders);

    // Iterate over each method defined in the configuration and add it.
    config.methods.forEach(
        function(method) {

            exports.addMethod(method);

        }
    );

    // Check if models are defined in the configuration.
    if (config.models) {

        // If models are present, initialize the model handling system.
        initModels();

        // Add each model defined in the configuration.
        config.models.forEach(
            function(model) {

                exports.addModel(model);

            }
        );
    }
};

/*
 * This function is responsible for making actual HTTP requests.
 * It handles GET, POST, PUT, DELETE operations and manages callbacks.
 *
 * @param {Object} args - Request arguments including URL, method, parameters, and headers.
 * @param {Function} onLoad - Callback function to execute upon successful request completion.
 * @param {Function} onError - Callback function to execute if an error occurs during the request.
 */
function makeHttpRequest( args , onLoad , onError ) {

    // Helper function to determine if a string is valid JSON.
    function isJSON(str) {

        try {
            // Attempt to parse the string as JSON.
            JSON.parse(str);
        }
        catch (e) {
            // If parsing fails, it's not valid JSON.
            return false;
        }

        // If parsing succeeds, it is valid JSON.
        return true;
    }

    // Helper function to parse a string as JSON if possible, otherwise return the string as-is.
    function parseJSON(text) {

        if ( isJSON(text) ) {

            return JSON.parse( text );

        } else {

            return text;

        }
    }

    // Log the URL being accessed for debugging purposes.
    log( "::RESTE:: " + (config.url ? config.url + args.url : args.url) );

    // If parameters are present, log them as well.
    if ( args.params ) {
        log("::RESTE:: " + JSON.stringify(args.params));
    }

    // Create a new HTTP client instance using Ti.Network (Titanium Mobile specific).
    var http = Ti.Network.createHTTPClient();

    // Flag to indicate if the request body should be form-encoded.
    var formEncode = false;

    // Set a timeout for the HTTP request, using config.timeout or a default of 10 seconds.
    http.setTimeout(config.timeout || 10000);

    // Open the HTTP connection with the specified method and URL.
    http.open(args.method, (config.url ? config.url + args.url : args.url));

    // Iterate through global request headers and set them.
    requestHeaders.forEach( function(header) {

        // Check for Content-Type header to determine if form encoding is needed.
        if ( header.name == "Content-Type" && header.value == "application/x-www-form-urlencoded" ) {
            formEncode = true;
        }

        // Set the request header. If the value is a function, call it; otherwise, use the value directly.
        http.setRequestHeader( header.name , typeof header.value == "function" ? header.value : header.value );

    } );

    // Handle non-global (per-request) headers.
    if (args.headers) {

        // Loop through each header provided in the arguments.
        for ( header in args.headers ) {

            // Check if the Content-Type header indicates form-urlencoded.
            if ( header == "Content-Type" && args.headers[header] == "application/x-www-form-urlencoded" ) {
                formEncode = true;
            }

            // Set the per-request header.
            http.setRequestHeader( header , typeof args.headers[header] == "function" ? args.headers[header]() : args.headers[header] );
        }
    }

    // Define the onload event handler for the HTTP client.
    http.onload = function(e) {

        // Parse the response text to get the actual response data.
        var response = parseJSON(http.responseText);

        // If a global onLoad handler is configured, call it.
        if (config.onLoad) {

            config.onLoad(response, onLoad);

        } else if (onLoad) { // Otherwise, call the specific onLoad handler for this request.

            onLoad(response);

        }

    };

    // Define the onerror event handler for the HTTP client.
    http.onerror = function(e) {

        // Attach the original URL to the error event for context.
        e.url = args.url;

        // Prioritize the specific onError callback provided for this request.
        if (onError) {

            // If an onError function is provided, use it.
            onError(parseJSON(http.responseText));

        } else if (config.onError) { // Fallback to the global onError handler from config.

            // Use the global error handler.
            config.onError(parseJSON(http.responseText));

        } else if (onLoad) { // If no specific error handler, try to use the onLoad callback.

            // As a last resort, pass the error to the onLoad callback.
            onLoad(parseJSON(http.responseText));

        } else {
            // If no handlers are found, throw an error to prevent silent failures.
            throw "RESTe :: No error handler / callback for: " + args.url;
        }
    };

    // Internal function to send the HTTP request.
    function send() {

        // If parameters exist and the method is POST or PUT, send them in the request body.
        if ( args.params && (args.method === "POST" || args.method === "PUT") ) {

            if (formEncode) {
                // If form encoding is required, send parameters directly.
                http.send(args.params);
            } else {
                // Otherwise, stringify parameters as JSON.
                http.send(JSON.stringify(args.params));
            }

        } else {
            // For GET/DELETE or no params, send without a body.
            http.send();
        }
    }

    // Check for a 'beforePost' hook in the configuration if it's a POST request.
    if ( args.method == "POST" && config.beforePost ) {

        // Ensure args.params is initialized, even if undefined.
        args.params = args.params || {};

        // Execute the beforePost hook, allowing modification of parameters.
        config.beforePost( args.params , function(e) {

            args.params = e;

        } );

        // After the hook, send the request.
        send();

    } else {

        // If no beforePost hook or not a POST request, send immediately.
        send();

    }

}

/**
 * Sets the global request headers. This will clear any previously set headers.
 *
 * @param {Object} headers - An object where keys are header names and values are header values.
 */
exports.setRequestHeaders = function(headers) {

    // Clear existing request headers.
    requestHeaders = [];

    // Iterate through the provided headers object.
    for ( header in headers ) {

        // Add each header as an object with 'name' and 'value' properties.
        requestHeaders.push({
            name: header,
            value: headers[header]
        });

    }
};

/**
 * Adds a new API method to the exports object, making it callable.
 * Each method can have different HTTP verbs (GET, POST, PUT, DELETE).
 *
 * @param {Object} args - Configuration for the new method, including name, HTTP verbs, and expected parameters.
 */
exports.addMethod = function(args) {

    // Log the request headers associated with this method, useful for debugging.
    console.log(args.requestHeaders);

    // Define the new method on the exports object using its specified name.
    exports[args.name] = function(params, onLoad) {

        var body, // Holds the request body for POST/PUT.
            method = "GET", // Default HTTP method.
            url, // The URL for the request.
            onError; // Specific error handler for this method call.

        // Determine the HTTP method based on the configuration.
        if (args.post) method = "POST";
        if (args.get) method = "GET";
        if (args.put) method = "PUT";
        if (args.delete) method = "DELETE";

        // Get the specific URL for the determined method, or default to GET if not found.
        url = args[method.toLowerCase()] || args.get;

        // If onLoad is not provided and params is a function, assume params is the onLoad callback.
        if (!onLoad && typeof(params) == "function") {
            onLoad = params;
        } else {
            // Iterate through parameters to extract the body and replace URL placeholders.
            for ( param in params ) {

                if ( param === "body" ) {
                    // If 'body' is a parameter, it's intended for the request body.
                    body = params[param];
                } else {
                    // Replace placeholders in the URL like "<param>" with actual parameter values.
                    while ( url.indexOf("<" + param + ">") >= 0 ) {

                        if ( typeof params[param] == "object" ) {
                            // If the parameter is an object, stringify it for the URL.
                            url = url.replace("<" + param + ">", JSON.stringify(params[param]));
                        } else {
                            // Otherwise, replace directly.
                            url = url.replace("<" + param + ">", params[param]);
                        }
                    }
                }
            }
        }

        // If the method configuration specifies an onLoad hook.
        if (args.onLoad) {

            // Save the original onLoad callback.
            var originalOnLoad = onLoad;

            // Wrap the original onLoad with the method's specific onLoad hook.
            onLoad = function(e) {
                args.onLoad(e, originalOnLoad);
            };

        }

        // If the method configuration specifies an onError hook.
        if (args.onError) {

            // Wrap the original onError with the method's specific onError hook.
            onError = function(e) {
                args.onError(e, onLoad);
            };

        }

        // Check for explicitly required parameters.
        if (args.expects) {

            args.expects.forEach( function(expectedParam) {
                // Determine if the expected parameter is missing, considering body for POST.
                if ( (method == "POST" && params.body) ? !params.body[expectedParam] : !params[expectedParam] ) {
                    throw "RESTe :: missing parameter " + expectedParam + " for method " + args.name;
                }
            } );

            // Make the HTTP request with the constructed arguments.
            makeHttpRequest({
                url: url,
                method: method,
                params: body,
                headers: args.requestHeaders || args.headers, // Use method-specific headers or global ones.
            }, onLoad, onError);

        } else { // If no explicit 'expects' are defined, optionally auto-validate.

            var m,
                missing = [],
                re = /(\<\w*\>)/g; // Regular expression to find URL placeholders.

            // If auto-validation is enabled in the global config.
            if (config.autoValidateParams) {

                // Find all missing parameters (placeholders) in the URL.
                while ((m = re.exec(url)) != null) {
                    if (m.index === re.lastIndex) {
                        re.lastIndex++;
                    }

                    missing.push(m[0]);
                }

            }

            // If any parameters are still missing after validation.
            if (missing.length > 0) {
                throw "RESTe :: missing parameter/s " + missing + " for method " + args.name;
            } else {
                // If all parameters are present or auto-validation is off, make the request.
                makeHttpRequest({
                    url: url,
                    method: method,
                    params: body,
                    headers: args.requestHeaders || args.headers,
                }, onLoad, onError);

            }
        }
    };
};

// This section contains "hacktastic" overrides for Alloy.createModel
// and Backbone.sync to integrate with RESTe's model handling.
// It is only called and executed if models are defined in the configuration.
function initModels() {

    // Store the original Alloy.createModel function.
    Alloy._createModel = Alloy.createModel;

    // Override Alloy.createModel to intercept model creation.
    Alloy.createModel = function(name, attributes) {

        try {
            // Attempt to call the original Alloy.createModel first.
            return Alloy._createModel(name, attributes);
        }
        catch (err) {
            // If the original fails (e.g., model not found in Alloy),
            // fallback to RESTe's custom createModel.
            return exports.createModel(name, attributes);
        }
    };

    /**
     * Creates a new Backbone model instance. This is used when Alloy's createModel
     * cannot find a definition, allowing RESTe to define its own models.
     *
     * @param {string} name - The name of the model.
     * @param {Object} attributes - Initial attributes for the model.
     * @returns {Backbone.Model} A new Backbone Model instance.
     */
    exports.createModel = function(name, attributes) {

        var model = new Backbone.Model(attributes); // Create a new Backbone Model.

        model._type = name; // Store the model type for later reference in sync.

        return model;
    };

    /**
     * Adds a new model definition to RESTe's internal model configuration.
     * This registers how a model interacts with specific API methods and collections.
     *
     * @param {Object} args - Model configuration, including name, collections, and API methods.
     */
    exports.addModel = function(args) {
        // Initialize modelConfig if it doesn't exist.
        exports.modelConfig = exports.modelConfig || {};

        // Store a reference to the model's definition in the modelConfig.
        exports.modelConfig[args.name] = args;

        // Extend Backbone.Model to create a specific model type.
        var model = Backbone.Model.extend({
            _type: args.name, // Custom property to identify the model type.
            _method: args.name // Another custom property, potentially for method mapping.
        });

        // Iterate through each collection associated with this model.
        args.collections.forEach(
            function(collection) {

                // Ensure the Alloy collection exists, create if not.
                Alloy.Collections[collection.name] = Alloy.Collections[collection.name] || new Backbone.Collection();

                // Assign custom properties to the collection for identification.
                Alloy.Collections[collection.name]._type = args.name;
                Alloy.Collections[collection.name]._name = collection.name;
                Alloy.Collections[collection.name].model = model; // Link the model to the collection.
            }
        );

    };

    // Intercept Backbone.sync to handle data synchronization for RESTe models and collections.
    Backbone.sync = function(method, model, options) {
        // Log the sync operation for debugging.
        console.log(method + model._type);

        // Retrieve the model's configuration from RESTe's internal store.
        modelConfig = exports.modelConfig[model._type];

        // Handle synchronization for Backbone Collections.
        if (model instanceof Backbone.Collection) {

            // Find the specific collection configuration based on its name.
            var collectionConfig = _.where(modelConfig.collections, {
                name: model._name
            })[0];

            // Get the API method to call for reading (fetching) the collection.
            var methodCall = exports[collectionConfig.read];

            // Execute the API method.
            methodCall(options, function(response) {

                if (options.success) {

                    // Iterate through the content of the response to set unique IDs.
                    response[collectionConfig.content].forEach( function(item) {
                        item.id = item[modelConfig.id];
                    } );

                    // Check if the response has a specific content property.
                    if (response[collectionConfig.content]) {

                        options.success(response[collectionConfig.content]); // Pass the content to the success callback.

                    } else {
                        // If not, assume the entire response is the item or an array containing it.
                        options.success([response]);

                    }

                }
            });

        } else if (model instanceof Backbone.Model) { // Handle synchronization for Backbone Models.

            if (method == "update") {
                var body = {}; // Prepare the request body for an update.

                // Set the model's ID and the model itself in the body.
                body[modelConfig.id] = model.id;
                body.body = model;

                // Call the API method configured for updating this model.
                exports[modelConfig.update](body, function(e) {
                    options.success(e); // Pass the response to the success callback.
                });
            }

            if (method == "create") {
                // Call the API method configured for creating this model.
                exports[modelConfig.create]({
                    body: model
                }, function(e) {
                    e.id = e[modelConfig.id]; // Assign the ID from the response.
                    options.success(e); // Pass the response to the success callback.
                });
            }

            if (method == "delete") {
                var body = {}; // Prepare the request body for a delete.

                // Set the model's ID and the model itself in the body.
                body[modelConfig.id] = model.id;
                body.body = model;

                // Call the API method configured for deleting this model.
                exports[modelConfig.delete](body, function(e) {
                    options.success(e); // Pass the response to the success callback.
                });
            }
        }
    };
}