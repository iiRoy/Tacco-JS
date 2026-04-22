( function ( $ , undefined ) {

  // This is the main jQuery extension point for jsonRPC functionality.
  $.extend ( {

    // The core jsonRPC object definition begins here.
    jsonRPC : {

      /*
       * Defines the JSON-RPC protocol version used by this client.
       * As per JSON-RPC 2.0 specification.
       */
      version : '2.0',


      /*
       * The default endpoint URL for all RPC requests.
       * If not explicitly provided in a specific request call,
       * this value will be utilized.
       * Initialized to null, meaning no default endpoint is set initially.
       */
      endPoint : null,


      // Specifies the default namespace to prepend to method names.
      // This is useful for organizing methods on the server side.
      namespace : null,


      /*
       * Initializes or reconfigures the JSON-RPC client with global settings.
       * This method allows setting a default endpoint, namespace, and caching behavior.
       *
       * @param { object } params - An object containing configuration parameters.
       *   @property { string } [endPoint]  - The base URL for all RPC requests if not overridden per call.
       *   @property { string } [namespace] - A string to prepend to method names for server-side organization.
       *   @property { boolean } [cache]    - Controls browser caching for AJAX requests.
       *                                       If `false`, a unique timestamp parameter (`_=[TIMESTAMP]`)
       *                                       is appended to the URL to prevent caching.
       *                                       Defaults to `true` if not specified.
       */
      setup : function ( params ) {

        // First, validate the structure and types of the provided configuration parameters.
        this._validateConfigParams ( params ) ;

        // Assign the provided endpoint to the client's global configuration.
        this.endPoint  =  params.endPoint ;

        // Assign the provided namespace to the client's global configuration.
        this.namespace =  params.namespace ;

        // Determine caching behavior: use provided value if present, otherwise default to true.
        this.cache     =  params.cache  !==  undefined  ?  params.cache  :  true ;

        // Allow for method chaining by returning the current instance.
        return this ;

      } ,


      /*
       * A utility method to execute a callback function within a temporary
       * configuration context. This allows for setting `endPoint` or `namespace`
       * temporarily for a specific operation, and automatically reverting
       * to the previous configuration afterwards.
       *
       * @param { object } params   - Configuration parameters to apply temporarily.
       *   @property { string } [endPoint]  - Temporary endpoint URL.
       *   @property { string } [namespace] - Temporary namespace.
       * @param { function } callback - The function to execute with the temporary
       *                                configuration active. This function will be
       *                                called with `this` context set to the jsonRPC object.
       */
      withOptions : function ( params ,  callback ) {

        // Validate the temporary configuration parameters provided.
        this._validateConfigParams ( params ) ;

        // Ensure a callback function is actually provided, as it's essential for this method's purpose.
        if ( callback  ===  undefined ) {
          throw ( "No callback specified" ) ; // If no callback, there's nothing to execute.
        }


        // Store the current configuration parameters so they can be restored later.
        origParams  =  { endPoint : this.endPoint ,  namespace : this.namespace } ;

        // Apply the new, temporary configuration.
        this.setup ( params ) ;

        // Execute the provided callback function within the new configuration context.
        callback.call ( this ) ;

        // Restore the original configuration parameters after the callback has finished.
        this.setup ( origParams ) ;

      } ,


      /*
       * Executes a single JSON-RPC method call to the server.
       * This is the primary method for making individual RPC requests.
       *
       * @param { string } method  - The name of the remote procedure to invoke.
       * @param { object } options - An object containing various request configurations.
       *   @property { Array<any> | object } [params]  - Parameters to pass to the remote method. Can be an array or an object.
       *   @property { Function } [success] - Callback function to execute upon successful RPC response.
       *   @property { Function } [error]   - Callback function to execute if the RPC request or response indicates an error.
       *   @property { string } [url]       - Overrides the default `endPoint` for this specific request.
       *   @property { string | number } [id] - A unique identifier for this request, used for correlating responses.
       *                                        Defaults to `1` if not provided.
       *   @property { boolean } [cache]    - Specifies caching behavior for this request. If `false`, a timestamp
       *                                       is appended to the URL. Defaults to the value set via `setup()`.
       * @returns { boolean } Always returns `true` upon successful initiation of the request.
       */
      request : function ( method ,  options ) {

        // Initialize options if they are not provided, ensuring it's an object.
        if ( options  ===  undefined ) {
          options = { id : 1 } ;
        }

        // Assign a default request ID if none is explicitly specified.
        if ( options.id  ===  undefined ) {
          options.id  =  1 ;
        }

        // Inherit the global caching setting if not specified for this particular request.
        if ( options.cache  ===  undefined ) {
          options.cache  =  this.cache ;
        }

        // Validate the method name to ensure it's a string.
        this._validateRequestMethod ( method ) ;

        // Validate the parameters object/array for the request.
        this._validateRequestParams ( options.params ) ;

        // Validate the success and error callback functions.
        this._validateRequestCallbacks ( options.success ,  options.error ) ;


        // Construct the JSON-RPC request object and stringify it for the AJAX call.
        var  requestPayload  =  JSON.stringify ( this._requestDataObj ( method ,  options.params ,  options.id ) ) ;

        // Execute the actual AJAX request with the prepared payload and options.
        this._doRequest ( requestPayload ,  options ) ;

        // Indicate that the request initiation was successful.
        return true ;

      } ,


      /*
       * Facilitates the submission of multiple JSON-RPC requests in a single batch.
       * This method accepts an array of individual request objects.
       *
       * @param { Array<object> } requests - An array where each element is an object
       *   representing a single RPC request. Each request object must contain:
       *   @property { string } method  - The name of the RPC method to call.
       *   @property { object | Array<any> } [params] - Parameters for the method.
       *   @property { string | number } [id] - A unique identifier for this specific request within the batch.
       *                                        Defaults to an incrementing number starting from 1.
       * @param { object } options - Configuration options for the entire batch request.
       *   @property { Function } [success] - Callback for successful batch response processing.
       *   @property { Function } [error]   - Callback for errors occurring during the batch request.
       *   @property { string } [url]       - Overrides the default `endPoint` for this batch.
       * @returns { undefined } This method does not return a value; it initiates an asynchronous operation.
       */
      batchRequest : function ( requests ,  options ) {

        // Ensure options object exists, even if empty.
        if ( options  ===  undefined ) {
          options  =  { } ;
        }


        // Critical validation: `requests` must be a non-empty array.
        if ( ! $.isArray ( requests )  ||  requests.length  ===  0 ) {
          throw ( "Invalid requests supplied for jsonRPC batchRequest. Must be an array object that contain at least a method attribute" ) ;
        }


        // Pre-validation and ID assignment for each individual request within the batch.
        var  _that  =  this ; // Capture 'this' for use within the $.each loop.
        $.each ( requests ,  function ( i ,  req ) {

          _that._validateRequestMethod ( req.method ) ; // Validate the method name.
          _that._validateRequestParams ( req.params ) ; // Validate the parameters.

          // Assign a sequential ID if not already provided for batch correlation.
          if ( req.id  ===  undefined ) {
            req.id  =  i  +  1 ;
          }

        } ) ;

        // Validate the success and error callbacks provided for the batch.
        this._validateRequestCallbacks ( options.success ,  options.error ) ;


        // Prepare the array that will hold the formatted JSON-RPC request objects.
        var  data  =  [ ] ,
             request ;


        // Iterate through the input requests array to build the JSON-RPC compliant data structure.
        for ( var  i  =  0 ;  i < requests.length ;  i ++ ) {

          request  =  requests [ i ] ;

          // Create the RPC data object for each individual request and add it to the batch array.
          data.push ( this._requestDataObj ( request.method ,  request.params ,  request.id ) ) ;

        }


        // Execute the single AJAX request for the entire batch.
        this._doRequest ( JSON.stringify ( data ) ,  options ) ;

      } ,


      /*
       * Internal validation method for configuration parameters passed to `setup` or `withOptions`.
       * Ensures that parameters are correctly formatted and typed.
       *
       * @private
       * @param { object } params - The configuration object to validate.
       * @throws { string } If `params` is undefined, or if `endPoint` or `namespace` are not strings.
       */
      _validateConfigParams : function ( params ) {

        // Check if any parameters object was provided at all.
        if ( params  ===  undefined ) {
          throw ( "No params specified" ) ; // Essential parameters object is missing.
        }
        else {
          // If endPoint is provided, it must be a string type.
          if ( params.endPoint  &&  typeof ( params.endPoint )  !==  'string' ) {
            throw ( "endPoint must be a string" ) ;
          }

          // If namespace is provided, it must also be a string type.
          if ( params.namespace  &&  typeof ( params.namespace )  !==  'string' ) {
            throw ( "namespace must be a string" ) ;
          }
        }

      } ,


      /*
       * Validates the RPC method name.
       * The method name must always be a string.
       *
       * @private
       * @param { string } method - The RPC method name to validate.
       * @returns { boolean } Always returns `true` if validation passes.
       * @throws { string } If `method` is not a string.
       */
      _validateRequestMethod : function ( method ) {

        // A method name is a fundamental requirement and must be a string.
        if ( typeof ( method )  !==  'string' ) {
          throw ( "Invalid method supplied for jsonRPC request" ) ;
        }

        return true ; // Validation successful.

      } ,


      /*
       * Validates the parameters (`params`) provided for an RPC request.
       * According to JSON-RPC 2.0, parameters can be:
       * 1. Omitted (i.e., `null` or `undefined`).
       * 2. A structured value (an object).
       * 3. A positional value (an array).
       *
       * @private
       * @param { any } params - The parameters to validate.
       * @returns { boolean } Always `true` if validation passes.
       * @throws { string } If `params` is not `null`, `undefined`, an object, or an array.
       */
      _validateRequestParams : function ( params ) {

        // Check if params are valid according to JSON-RPC 2.0 specification.
        if ( ! ( params  ===  null  ||
                 params  ===  undefined  ||
                 typeof ( params )  ===  'object'  ||
                 $.isArray ( params ) ) ) {

          throw ( "Invalid params supplied for jsonRPC request. It must be empty, an object or an array." ) ;

        }

        return true ; // Validation passed.

      } ,


      /*
       * Validates the `success` and `error` callback functions.
       * Callbacks are optional but, if provided, must be actual functions.
       *
       * @private
       * @param { Function | undefined } success - The success callback.
       * @param { Function | undefined } error   - The error callback.
       * @returns { boolean } Always `true` if validation passes.
       * @throws { string } If a provided callback is not a function.
       */
      _validateRequestCallbacks : function ( success ,  error ) {

        // Check if the success callback is provided and if it's a function.
        if ( success  !==  undefined  &&
             typeof ( success )  !==  'function' ) {
          throw ( "Invalid success callback supplied for jsonRPC request" ) ;
        }

        // Check if the error callback is provided and if it's a function.
        if ( error  !==  undefined  &&
             typeof ( error )  !==  'function' ) {
          throw ( "Invalid error callback supplied for jsonRPC request" ) ;
        }

        return true ; // All callbacks (or lack thereof) are valid.

      } ,


      /*
       * Executes the actual AJAX request to the JSON-RPC server.
       * This is an internal helper method encapsulating jQuery's `$.ajax`.
       *
       * @private
       * @param { string } data    - The JSON string payload to send in the request body.
       * @param { object } options - Configuration options for the AJAX call,
       *                             including URL, caching, and callback functions.
       * @returns { undefined } This method does not return a value; it performs a side effect (AJAX call).
       */
      _doRequest : function ( data ,  options ) {

        var  _that  =  this ; // Preserve the 'this' context for callbacks.

        // Initiate the jQuery AJAX call with specified configurations.
        $.ajax ( {

          type        :  'POST' ,                                            // All JSON-RPC requests are typically POST.
          async       :  ( false  !==  options.async ) ,                     // Control asynchronous behavior.
          dataType    :  'json' ,                                            // Expect a JSON response.
          contentType :  'application/json' ,                                // Indicate sending JSON data.
          url         :  this._requestUrl ( ( options.endPoint  ||  options.url ) ,  options.cache ) , // Determine the final request URL.
          data        :  data ,                                              // The JSON-RPC request payload.
          cache       :  options.cache ,                                     // Control browser caching for this specific request.
          processData :  false ,                                             // Prevent jQuery from processing the data, as it's already a string.

          // Define the error handler for the AJAX request.
          error : function ( json ) {
            // Delegate to the internal error handler, passing the original error callback.
            _that._requestError.call ( _that ,  json ,  options.error ) ;
          } ,

          // Define the success handler for the AJAX request.
          success : function ( json ) {
            // Delegate to the internal success handler, passing both success and error callbacks.
            _that._requestSuccess.call ( _that ,  json ,  options.success ,  options.error ) ;
          }

        } ) ; // End of $.ajax call.

      } ,


      /*
       * Constructs the final URL for an AJAX request, incorporating caching logic.
       * If caching is disabled, a unique timestamp is appended to the URL.
       *
       * @private
       * @param { string } url   - The specific URL provided for the request, or `undefined`.
       * @param { boolean } cache - Flag indicating whether caching is enabled for this request.
       * @returns { string } The fully constructed URL.
       */
      _requestUrl : function ( url ,  cache ) {

        // Use the provided URL if available, otherwise fall back to the global endpoint.
        url  =  url  ||  this.endPoint ;

        // If caching is explicitly disabled for this request:
        if ( ! cache ) {

            // Append a unique timestamp to prevent browser caching.
            // Check if there are existing query parameters.
            if ( url.indexOf ( "?" )  <  0 ) {
              url  +=  '?tm='  +  new Date ( ) .getTime ( ) ; // First parameter.
            }
            else {
              url  +=  "&tm="  +  new Date ( ) .getTime ( ) ; // Additional parameter.
            }

        }

        return url ; // Return the resolved and potentially modified URL.

      } ,


      /*
       * Generates a standard JSON-RPC 2.0 request object structure.
       * This object is then typically stringified before being sent as the AJAX payload.
       *
       * @private
       * @param { string } method - The RPC method name.
       * @param { any } params    - The parameters for the method (can be `undefined`, object, or array).
       * @param { string | number } id - The request ID.
       * @returns { object } The formatted JSON-RPC request object.
       */
      _requestDataObj : function ( method ,  params ,  id ) {

        var  dataObj  =  {
          jsonrpc : this.version , // Specifies the JSON-RPC protocol version.
          method  : ( this.namespace  ?  this.namespace  + '.'  +  method  :  method ) , // Prepend namespace if defined.
          id      : id              // The request identifier.
        } ;

        // Only include the 'params' field if parameters are actually provided.
        if ( params  !==  undefined ) {
          dataObj.params  =  params ;
        }

        return dataObj ; // Return the complete request object.

      } ,


      /*
       * Manages the invocation of the user-defined error callback for AJAX failures.
       * Attempts to parse the response text if available, otherwise provides a generic error.
       *
       * @private
       * @param { object } json  - The raw JSON response object from the AJAX `error` handler.
       * @param { Function | undefined } error - The user-supplied error callback function.
       * @returns { undefined }
       */
      _requestError : function ( json ,  error ) {

        // Proceed only if an error callback function has been provided.
        if ( error  !==  undefined  &&  typeof ( error )  ===  'function' ) {

          // If the response contains text, attempt to parse it as JSON.
          if ( typeof ( json.responseText )  ===  'string' ) {

            try {
              // Attempt to evaluate the response text as a JavaScript object.
              error ( eval ( '('  +  json.responseText  +  ')' ) ) ;
            }
            catch ( e ) {
              // If parsing fails, call the error callback with a generic response.
              error ( this._response ( ) ) ;
            }

          }
          else {
            // If no response text, call the error callback with a generic response.
            error ( this._response ( ) ) ;
          }

        }

      } ,


      /*
       * Processes a successful AJAX response for an RPC call.
       * This method checks the RPC response for server-side errors and
       * dispatches to the appropriate user-defined callback (success or error).
       *
       * @private
       * @param { object } json    - The raw JSON response object from the AJAX `success` handler.
       * @param { Function | undefined } success - The user-supplied success callback function.
       * @param { Function | undefined } error   - The user-supplied error callback function.
       * @returns { undefined }
       * @todo Improve error handling for batch requests, which may contain mixed success/error results.
       */
      _requestSuccess : function ( json ,  success ,  error ) {

        // Process the raw JSON response into a standardized RPC response object.
        var  response  =  this._response ( json ) ;

        // Check if the RPC response itself indicates a server-side error.
        if ( response.error  &&  typeof ( error )  ===  'function' ) {
          // If an RPC error is present and an error callback exists, invoke it.
          error ( response ) ;
          return ; // Stop further processing for this response.
        }


        // If no RPC error, and a success callback is provided, invoke it.
        if ( typeof ( success )  ===  'function' ) {
          success ( response ) ;
        }

      } ,


      /*
       * Standardizes and validates the incoming JSON-RPC response from the server.
       * It handles parsing, version checking, and provides a default error response
       * for malformed or missing JSON.
       *
       * @private
       * @param { object | string | undefined } json - The raw JSON response received from the server.
       * @returns { object } A standardized JSON-RPC 2.0 response object.
       */
      _response : function ( json ) {

        // If no JSON response was received at all, return a generic internal server error.
        if ( json  ===  undefined ) {
          return {
            error   : 'Internal server error' , // A default error message.
            version : '2.0'                     // Conforming to RPC 2.0.
          } ;
        }
        else {
          try {
            // If the JSON is received as a string, attempt to parse it into an object.
            if ( typeof ( json )  ===  'string' ) {
              json  =  eval ( '('  +  json  +  ')' ) ; // Using eval for parsing, typically for older browsers/environments.
            }

            // Perform JSON-RPC version validation.
            // This checks both single responses and batch responses for the 'jsonrpc' field.
            if ( ( $.isArray ( json )  &&  json.length  >  0  &&  json [ 0 ] .jsonrpc  !==  '2.0' )  ||
                 ( ! $.isArray ( json )  &&  json.jsonrpc  !==  '2.0' ) ) {
              throw 'Version error' ; // Indicates a mismatch in JSON-RPC protocol version.
            }

            return json ; // Return the successfully parsed and validated JSON response.
          }
          catch ( e ) {
            // Catch any parsing or validation errors and return a structured error response.
            return {
              error   : 'Internal server error: '  +  e , // Include the original error message for debugging.
              version : '2.0'
            } ;
          }
        }

      }

    } // End of jsonRPC object.

  } ) ; // End of $.extend call.

} ) ( jQuery ) ; // End of immediately invoked function expression (IIFE).