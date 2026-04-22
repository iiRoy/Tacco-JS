// This file contains configurations and overrides for integrating Backbone.js with Parse.com's REST API.
// It defines the necessary credentials and custom synchronization logic.

// --- PARSE API ACCESS CREDENTIALS CONFIGURATION ---

// application_id: The unique identifier for your Parse.com application.
var application_id =     "CkWCHMSOgyqoNKoIc5hu09uvdZcJ9rpHJD4iwhxI"   ;
// rest_api_key: The REST API key for your Parse.com application, used for authentication.
var rest_api_key   = "H5SIwarTRXqd07C0OIZPbcRTYTNLKsjFAJt5PrFY";
// api_version: Specifies the version of the Parse.com API to be used.
var api_version = "1" ;


// --- END OF CREDENTIALS BLOCK ---


// This immediately-invoked function expression (IIFE) encapsulates the Backbone overrides
// to prevent polluting the global namespace.
( function ( ) {

    /*
     *  Here we override the default `toJSON` method of Backbone.Model.
     *
     *  The primary purpose of this modification is to ensure that "createdAt" and "updatedAt"
     *  timestamp fields, which are automatically managed by Parse.com, are not sent back
     *  to the Parse API during PUT (update) requests. Sending these fields can cause
     *  errors or unexpected behavior with Parse's backend.
     */
	var original_toJSON = Backbone.Model.prototype.toJSON ;

    // Define a new object containing our custom toJSON implementation and other Parse-specific properties.
    var ParseModel = {

        toJSON : function ( options ) {

            // Retrieve the Parse class name from the model's prototype, if available.
            _parse_class_name = this.__proto__._parse_class_name ;

            // Call the original Backbone.Model.toJSON method to get the base JSON representation.
            data = original_toJSON.call( this , options ) ;


            // Remove the 'createdAt' field from the data to be sent to Parse.
            delete data.createdAt ;

            // Remove the 'updatedAt' field from the data.
            delete data.updatedAt ;

            // Return the modified data object.
            return data ;
        } ,

        // Parse.com uses "objectId" as the unique identifier for its objects,
        // so we map Backbone's `idAttribute` to "objectId".
        idAttribute : "objectId"
    } ;

    // Extend Backbone.Model.prototype with our Parse-specific customizations.
    _.extend( Backbone.Model.prototype , ParseModel ) ;


    /*
     *  Next, we override the `parse` method of Backbone.Collection.
     *
     *  Backbone Collections expect the server to return a direct JSON array of models
     *  when a fetch operation is performed. However, Parse.com's REST API, for collection
     *  fetches, returns a JSON object that contains a key named "results", and the value
     *  associated with "results" is the actual array of objects.
     *  This override extracts that array from the Parse response.
     */
    original_parse = Backbone.Collection.prototype.parse ;

    var ParseCollection = {

        parse : function ( options ) {

            // Attempt to get the Parse class name from the collection's prototype.
            _parse_class_name = this.__proto__._parse_class_name ;

            // Call the original Backbone.Collection.parse method first.
            data = original_parse.call( this , options ) ;

            // If a Parse class name is defined AND the response contains a 'results' key,
            // then we assume it's a Parse collection response.
            if ( _parse_class_name && data.results ) {
                // Return only the array of results.
                return data.results ;
            }
            else {
            	// Otherwise, return the data as-is, assuming it's not a Parse-specific collection response
            	// or that it's already in the expected format.
                return data ;
            }
        }
    } ;

    // Apply the custom ParseCollection methods to Backbone.Collection.prototype.
    _.extend( Backbone.Collection.prototype , ParseCollection ) ;

    // --- HTTP Method to REST API Type Mapping ---
    // This map translates Backbone's CRUD operations ('create', 'update', etc.)
    // into standard HTTP methods ('POST', 'PUT', etc.) required by Parse.com.
	var methodMap = {
        'create' : 'POST' ,
        'update' : 'PUT' ,
        'delete' : 'DELETE' ,
        'read' :   'GET'
    } ;


    // --- Override Backbone.sync for Parse.com Integration ---

    // Store a reference to the original Backbone.sync method.
    var ajaxSync = Backbone.sync ;

	// Replace Backbone's default synchronization logic with our custom Parse-aware version.
	Backbone.sync = function ( method , model , options ) {


        // Determine the object ID. If it's a collection (model.models exists), the ID is empty.
        // Otherwise, it's a model, and we use its `id` attribute.
        var object_id = model.models ? "" : model.id ;


        // Retrieve the Parse class name associated with the model or collection.
        var class_name = model.__proto__._parse_class_name ;

        // If no Parse class name is defined, this model/collection is not Parse-backed.
        // In this case, delegate to the original Backbone.sync implementation.
        if ( !class_name ) {
            return ajaxSync( method , model , options ) ;
        }

        // --- Prepare Request Parameters for Parse.com ---

        // Map the Backbone method (e.g., 'create') to an HTTP verb (e.g., 'POST').
		var type = methodMap[ method ] ;

	    // Ensure options object exists.
	    options || ( options = { } ) ;

		// Construct the base URL for Parse.com's REST API.
		var base_url = "https://api.parse.com/" + api_version + "/classes" ;

		// Initialize the URL for the specific Parse class.
		var url = base_url + "/" + class_name + "/" ;

        // For all methods except 'create', append the object_id to the URL.
        // 'create' requests typically don't have an ID yet, as it's assigned by Parse.
        if ( method != "create" ) {
            url = url + object_id ;
        }

        // --- Setup Data Payload for the Request ---

		var data ;

	    // For 'create' or 'update' operations, if no data is explicitly provided in options,
	    // stringify the model's JSON representation.
	    if ( !options.data && model && ( method == 'create' || method == 'update' ) ) {
	      data = JSON.stringify( model.toJSON( ) ) ;
	    }
        // If it's a 'read' operation and `options.query` is provided,
        // encode it for Parse's 'where' clause in the URL query string.
        else if ( options.query && method == "read" ) {
            data = encodeURI( "where=" + JSON.stringify( options.query ) ) ;
        }

        // --- Construct the AJAX Request Object ---

		var request = {
            // Data related settings
            contentType : "application/json" ,
            processData : false ,
            dataType : 'json' ,
            data : data ,

            // Action related settings
            url : url ,
            type : type ,

            // Authentication headers required by Parse.com
            headers : {
                "X-Parse-Application-Id" : application_id ,
                "X-Parse-REST-API-Key" : rest_api_key
            }
        } ;

        // Perform the AJAX request using jQuery, merging any additional options provided.
        return $.ajax( _.extend( options , request ) ) ;
	} ; // End of Backbone.sync override

})( ) ; // End of IIFE