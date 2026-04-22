var app_key_identifier = "CkWCHMSOgyqoNKoIc5hu09uvdZcJ9rpHJD4iwhxI";
var api_secret_token = "H5SIwarTRXqd07C0OIZPbcRTYTNLKsjFAJt5PrFY";
var protocol_revision_number = "1";

(function() {

    // Override the standard Backbone Model's toJSON function.
    // This custom implementation removes internal Parse.com timestamps
    // to prevent issues when sending data back to the server.
    var base_serialization_func = Backbone.Model.prototype.toJSON;
    var CloudModelExtension = {

        serializeToJSON: function(serialization_opts) {
            var _cloud_entity_type_name = this.__proto__._parse_class_name;
            var serialized_payload = base_serialization_func.call(this, serialization_opts);

            delete serialized_payload.createdAt;
            delete serialized_payload.updatedAt;

            return serialized_payload;
        },

        // Specifies the attribute used as the unique identifier for models.
        uniqueIdentifierField: "objectId"

    };
    _.extend(Backbone.Model.prototype, CloudModelExtension);

    // Replace the default parse method for Backbone Collections.
    // Parse.com returns collection data wrapped in a "results" key,
    // which needs to be extracted for Backbone to process correctly.
    var base_deserialization_func = Backbone.Collection.prototype.parse;
    var CloudCollectionProcessor = {
        deserializeCollection: function(deserialization_opts) {
            var _cloud_entity_type_name = this.__proto__._parse_class_name;
            var received_input_data = base_deserialization_func.call(this, deserialization_opts);

            if (_cloud_entity_type_name && received_input_data.results) {
                // Return just the array of items from the results property
                return received_input_data.results;
            } else {
                // If not a Parse collection or no results, return original data
                return received_input_data;
            }
        }
    };
    _.extend(Backbone.Collection.prototype, CloudCollectionProcessor);

    /*
     * Mapping of Backbone sync operations to standard HTTP methods.
     */
    var http_action_mapping = {
        'create':   'POST',
        'update':   'PUT',
        'delete':   'DELETE',
        'read':     'GET'
    };

    // Replace Backbone's default synchronization method with a custom one
    // tailored for interaction with the Parse.com API.
    var default_backbone_sync = Backbone.sync;
    Backbone.sync = function(operation_type, data_object, request_config) {

        // Determine if this is a model or collection, and get its ID if it's a model.
        var unique_record_id = data_object.models ? "" : data_object.id;

        var entity_class_name = data_object.__proto__._parse_class_name;
        if (!entity_class_name) {
            // If the model/collection doesn't have a Parse class name,
            // fall back to the standard Backbone.sync behavior.
            return default_backbone_sync(operation_type, data_object, request_config);
        }

        // Prepare the request parameters for the Parse API.
        var http_verb = http_action_mapping[operation_type];
        request_config = request_config || {};
        var service_endpoint_base = "https://api.parse.com/" + protocol_revision_number + "/classes";
        var target_resource_url = service_endpoint_base + "/" + entity_class_name + "/";

        if (operation_type !== "create") {
            target_resource_url = target_resource_url + unique_record_id;
        }

        // Set up the payload for the request.
        var request_body_data;
        if (!request_config.data && data_object && (operation_type === 'create' || operation_type === 'update')) {
            request_body_data = JSON.stringify(data_object.toJSON());
        } else if (request_config.query && operation_type === "read") {
            // Handle query parameters for 'read' operations on Parse objects.
            request_body_data = encodeURI("where=" + JSON.stringify(request_config.query));
        }

        var ajax_request_params = {
            // Request payload configuration
            contentType: "application/json",
            processData: false,
            dataType: 'json',
            data: request_body_data,

            // HTTP action details
            url: target_resource_url,
            type: http_verb,

            // Authentication credentials for Parse.com
            headers: {
                "X-Cloud-App-Id": app_key_identifier,
                "X-Cloud-API-Token": api_secret_token
            }
        };

        // Execute the AJAX request using jQuery and extend with any custom options.
        return $.ajax(_.extend(request_config, ajax_request_params));
    };

})();