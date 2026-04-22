/* Backend Service Access Configuration */

const appIdentifier = "CkWCHMSOgyqoNKoIc5hu09uvdZcJ9rpHJD4iwhxI"; // Unique identifier for the application
const secretKey = "H5SIwarTRXqd07C0OIZPbcRTYTNLKsjFAJt5PrFY"; // Secret key for REST API interactions
const apiRevision = "1"; // Version of the API to target

/* END OF INITIAL SETUP */

(function() {
    // Perform a quick check for essential libraries before proceeding.
    // If Backbone or Underscore are not present, our custom logic cannot be applied.
    if (typeof Backbone === 'undefined' || typeof _ === 'undefined') {
        console.error("Dependency Error: Backbone.js or Underscore.js not found. Skipping custom Parse integration.");
        return;
    }

    /*
     * Extends Backbone.Model's default serialization behavior (`toJSON`).
     * This modification specifically targets Parse-backed models,
     * ensuring that internal timestamp fields ('createdAt', 'updatedAt')
     * are not included in the JSON payload sent to the Parse API,
     * which could otherwise lead to update conflicts or errors.
     */
    const originalModelSerializer = Backbone.Model.prototype.toJSON; // Preserve the original toJSON method
    const ModelSerializationEnhancement = {
        // Overrides the standard toJSON method for all Backbone.Model instances.
        toJSON: function(serializationOptions) {
            // First, call the original toJSON method to get the base data object.
            const initialModelData = originalModelSerializer.call(this, serializationOptions);

            // Check if the model has a Parse-specific class name defined in its prototype.
            // This acts as an indicator that it's a Parse-managed model.
            const entityParseClassName = this.__proto__._parse_class_name;
            if (!entityParseClassName) {
                // If it's not a Parse-backed model, return the data as-is without modifications.
                return initialModelData;
            }

            // Create a new object using a shallow copy to prevent direct mutation of `initialModelData`.
            const filteredModelData = { ...initialModelData
            };
            // Remove Parse's auto-generated timestamp fields, as these are managed by the server.
            delete filteredModelData.createdAt; // Exclude the creation timestamp
            delete filteredModelData.updatedAt; // Exclude the last update timestamp

            return filteredModelData; // Return the cleaned data object
        },

        // Defines the attribute name that serves as the unique identifier for models
        // when interacting with the Parse backend (e.g., "objectId" instead of "id").
        idAttribute: "objectId"
    };
    // Apply the custom serialization logic to Backbone.Model's prototype.
    _.extend(Backbone.Model.prototype, ModelSerializationEnhancement);

    /*
     * Extends Backbone.Collection's default parsing behavior (`parse`).
     * This adjustment handles the specific JSON response format returned by the
     * Parse API for collection fetches, where the actual array of results is
     * nested under a 'results' key. Backbone expects a direct array.
     */
    const originalCollectionParser = Backbone.Collection.prototype.parse; // Preserve the original parse method
    const CollectionParsingEnhancement = {
        // Overrides the standard parse method for all Backbone.Collection instances.
        parse: function(responseDataPayload, parsingOptions) {
            // If the response payload is empty or null, defer to the original parser.
            if (!responseDataPayload) {
                return originalCollectionParser.call(this, responseDataPayload, parsingOptions);
            }

            // Retrieve the Parse-specific class name from the collection's prototype.
            const collectionParseClassName = this.__proto__._parse_class_name;

            // If it's a Parse-backed collection and the payload contains a 'results' array,
            // extract and return that array. This adapts Parse's response to Backbone's expectation.
            if (collectionParseClassName && responseDataPayload.results && Array.isArray(responseDataPayload.results)) {
                return responseDataPayload.results; // Return the extracted array of models
            } else {
                // For non-Parse collections or if the Parse response format is unexpected,
                // fallback to the original Backbone parsing logic.
                return originalCollectionParser.call(this, responseDataPayload, parsingOptions);
            }
        }
    };
    // Apply the custom parsing logic to Backbone.Collection's prototype.
    _.extend(Backbone.Collection.prototype, CollectionParsingEnhancement);

    /* Lookup table for mapping Backbone CRUD operations to HTTP verbs */
    const crudOperationToHttpMethod = {
        'create': 'POST', // For creating new resources
        'update': 'PUT', // For updating existing resources
        'delete': 'DELETE', // For deleting resources
        'read': 'GET' // For fetching resources
    };

    /*
     * Overrides the global Backbone.sync method to provide custom integration
     * with the Parse REST API. This handles URL construction, authentication headers,
     * and request body formatting specific to Parse.
     */
    const baseBackboneSync = Backbone.sync; // Keep a reference to Backbone's default sync method

    Backbone.sync = function(operationMethod, targetEntity, syncConfiguration) {
        // Ensure syncConfiguration is an object, providing a default if none is supplied.
        const currentSyncConfig = { ...syncConfiguration
        };

        // Determine if the target entity is a Backbone Collection (has a 'models' property).
        const isTargetACollection = !!targetEntity.models;

        // Obtain the Parse class name from the target entity's prototype.
        const entityParseClassName = targetEntity.__proto__._parse_class_name;

        // If the entity does not have a Parse class name, it's not a Parse-backed model/collection.
        // In this scenario, delegate to Backbone's original sync method.
        if (!entityParseClassName) {
            return baseBackboneSync(operationMethod, targetEntity, currentSyncConfig);
        }

        // Validate the requested operation method and map it to an HTTP verb.
        const httpVerbForOperation = crudOperationToHttpMethod[operationMethod];
        if (!httpVerbForOperation) {
            console.warn(`Sync Warning: Unknown operation method '${operationMethod}'. Falling back to default sync.`);
            return baseBackboneSync(operationMethod, targetEntity, currentSyncConfig);
        }

        // Construct the base URL for Parse API class operations.
        const parseApiEndpoint = `https://api.parse.com/${apiRevision}/classes`;
        let constructedRequestUrl = `${parseApiEndpoint}/${entityParseClassName}/`;

        // For single model operations (not collections) and not creation, append the object ID to the URL.
        if (!isTargetACollection && operationMethod !== 'create' && targetEntity.id) {
            constructedRequestUrl += targetEntity.id;
        }

        let payloadForRequestBody = null;

        // Prepare the request body data based on the HTTP operation.
        if (operationMethod === 'create' || operationMethod === 'update') {
            // For creation or update, serialize the model to JSON.
            // Only do this if `currentSyncConfig.data` isn't already provided.
            if (!currentSyncConfig.data) {
                payloadForRequestBody = JSON.stringify(targetEntity.toJSON());
            } else {
                payloadForRequestBody = currentSyncConfig.data; // Use pre-existing data from config
            }
        } else if (operationMethod === 'read' && currentSyncConfig.query) {
            // For read operations with a custom query, encode it for the 'where' parameter.
            payloadForRequestBody = `where=${encodeURIComponent(JSON.stringify(currentSyncConfig.query))}`;
        }

        // Assemble the AJAX request configuration object.
        const ajaxRequestSettings = {
            // Data handling and content type.
            contentType: "application/json", // Default content type for JSON payloads
            processData: false, // Prevent jQuery from automatically processing data for POST/PUT/DELETE
            dataType: 'json', // Expect JSON response from the server
            data: payloadForRequestBody, // The prepared data payload

            // Request action details.
            url: constructedRequestUrl, // The final URL for the API request
            type: httpVerbForOperation, // The HTTP method (e.g., 'GET', 'POST')

            // Authentication headers required by Parse.
            headers: {
                "X-Parse-Application-Id": appIdentifier,
                "X-Parse-REST-API-Key": secretKey
            }
        };

        // Special handling for GET requests with query parameters.
        // jQuery's $.ajax treats 'data' differently for GET requests, appending it to the URL.
        if (httpVerbForOperation === 'GET' && payloadForRequestBody) {
            ajaxRequestSettings.processData = true; // Allow jQuery to process data
            if (payloadForRequestBody.startsWith('where=')) {
                // If it's a 'where' query, re-parse it into an object for jQuery.
                ajaxRequestSettings.contentType = 'application/x-www-form-urlencoded';
                ajaxRequestSettings.data = {
                    where: JSON.parse(decodeURIComponent(payloadForRequestBody.substring(6)))
                };
            }
            // For other GET data, jQuery will handle it as query parameters by default.
        }


        // Merge the original sync configuration options with our custom AJAX settings.
        // Our settings will override any conflicting properties from `currentSyncConfig`.
        const finalAjaxCallOptions = _.extend({}, currentSyncConfig, ajaxRequestSettings);

        // Execute the AJAX request using jQuery and return the promise.
        return $.ajax(finalAjaxCallOptions);
    };

})();