/*******************************************************************************
 *
 *  Copyright (c) 2009, Nathan Bubna
 *  Dual licensed under the MIT and GPL licenses:
 *    http://www.opensource.org/licenses/mit-license.php
 *    http://www.gnu.org/licenses/gpl.html
 *
 *  This plugin aims to combine jQuery's well-known simplicity with
 *  the core principles of JSON-REST, adding several useful
 *  convenience features for developers.
 *
 *  Key Architectural Concepts:
 *
 *  1.  **CRUD-to-HTTP Mapping**:
 *      -   `$.Create` maps to HTTP POST.
 *      -   `$.Read` maps to HTTP GET.
 *      -   `$.Update` maps to HTTP PUT.
 *      -   `$.Delete` maps to HTTP DELETE.
 *      All mappings are handled via jQuery.ajax() calls internally.
 *
 *  2.  **JSON-First Data Handling**:
 *      -   By default, `dataType` is set to "rest" (which implies JSON).
 *      -   When JSON utilities are available, data for `Create` and `Update`
 *          operations is processed into a JSON string rather than a standard
 *          query string. This ensures proper RESTful communication.
 *
 *  3.  **URL Parameter Substitution**:
 *      -   Facilitates dynamic URL construction. For example:
 *          `$.Read("/{b}/{a}", { a:'foo', b:'bar', c:3 })`
 *          will resolve to a GET request to `"/bar/foo?c=3"`.
 *          Placeholders in the URL (`{key}`) are replaced by corresponding
 *          data object properties, which are then removed from the data.
 *
 *  4.  **Enhanced Callback Mechanisms**:
 *      -   Supports standard `success` and `error` callbacks.
 *      -   Introduces "before" and "after" callbacks, acting like `finally` blocks
 *          around the primary request handling.
 *      -   Allows for specific HTTP status-code callbacks (e.g., `404: function(...)`).
 *      -   Status-code callbacks can also be set to 'success' to treat specific
 *          errors as successful outcomes (e.g., `{ 404: 'success' }`).
 *
 *  5.  **Integration with jQuery.Values Plugin**:
 *      -   When invoked on a jQuery selection (e.g., `$('#foo').Read(...)`),
 *          if the `Values` plugin is present, it automatically uses
 *          `this.values(options)` to extract data for the request.
 *      -   Upon a successful response, if `Values` is available and `setValues`
 *          is true, the JSON response is automatically applied back to the
 *          selected element(s) using `this.values(res, options)`.
 *      -   This data setting occurs between the "before" and "success" callbacks.
 *
 *  **Callback Execution Flow**:
 *  -   The `before` and `after` callbacks are invoked once the XHR response
 *      is ready, regardless of success, failure, or whether other callbacks
 *      are defined.
 *  -   They receive the same arguments as the primary callback (success/error/status).
 *  -   Unlike jQuery's `complete` callback, `after` receives processed data
 *      (if successful) or the XHR object (if failed) as its first argument,
 *      and the options object as its third argument.
 *  -   The options object always contains the XHR object as an `xhr` property
 *      once created, ensuring its availability to all callbacks.
 *
 *  **Element-Specific CRUD Calls**:
 *  -   When a CRUD function is called on an element(s) without explicit
 *      data (and `getValues` is true), it leverages `this.values(options)`
 *      to retrieve data from the element(s).
 *  -   If the call succeeds (and `setValues` is true), the result is
 *      applied back to the element(s) using `this.values(res, options)`.
 *  -   This result-setting occurs between the `before` callback (if any)
 *      and the `success` callback (if any).
 *
 *  **Function Signature Combinations**:
 *  All CRUD functions (global or element-level) accept four parameters:
 *  -   `url`: Required. The URL template to be filled and requested.
 *  -   `data`: Optional. An object whose properties fill the URL and are
 *              then appended as request parameters or stringified into
 *              the request body (for JSON `Update` calls).
 *  -   `success`: Optional. A callback executed upon successful JSON response
 *                 parsing.
 *  -   `options`: Optional. An object for additional settings (e.g.,
 *                 jQuery.ajax/values options, before/after/error callbacks,
 *                 getValues, setValues, etc.).
 *
 *  Valid parameter combinations (demonstrated with various functions):
 *
 *         $.Read(url);
 * $('#foo').Read(options);
 *   $('.foo').Delete(url, data);
 *         $.Update(url, data, options);
 *         $.Delete(url, success);
 * $('#foo').Create(url, success, options);
 *         $.Read(url, data, success);
 *         $.Create(url, data, success, options);
 *
 *  **Important Notes on Parameters**:
 *  -   The `url` is *never* optional. If only an `options` object is passed,
 *      it *must* contain a `url` property.
 *  -   Passing `options` as the second parameter is not supported, as it
 *      creates ambiguity with the `data` object.
 *
 *  **Backend Compatibility for PUT/DELETE**:
 *  -   For backends that do not natively support PUT or DELETE HTTP methods,
 *      you can adapt the plugin by calling:
 *      `$.rest.useGetAndPost();`
 *      This configures `Create`, `Delete`, `Update` to use `POST` and `Read` to use `GET`.
 *
 *  **Global Data Configuration**:
 *  -   Global data can be set via `$.rest.data`. This data will be merged
 *      into every subsequent CRUD call.
 *  -   Call-specific data will override global data properties with the same name.
 *  -   `$.rest.data` is also used by `$.rest.fillUrl(url)` if no data argument is provided.
 *
 *  **URL Prefixing**:
 *  -   A common URL prefix can be set globally:
 *      `$.rest.prefix = "/myservice/";`
 *      This prefix will automatically be prepended to all URLs used in CRUD operations.
 *
 *  @version 1.0.3
 *  @name rest
 *  @cat Plugins/Rest
 *  @author Nathan Bubna
 *
 ******************************************************************************/
( function ( $ ) {

    // Define the core rest object, accessible via $.rest
    var R = $.rest = {

        version: "1.0.3" , // Current version of the plugin

        // Function to adapt to backends that don't support PUT/DELETE verbs
        useGetAndPost: function () {

            // Reassign HTTP methods for CRUD operations
            R.Create.type = R.Delete.type = R.Update.type = "POST" ; // Map to POST
            R.Read.type = "GET" ; // Map to GET

        } , // end of useGetAndPost

        // --- General Options for all REST calls ---
        options: {
            dataType: "rest" , // Custom data type for REST processing
            onlyNest: true , // Default for $.values plugin, if present

            // --- Options specific to calls on jQuery elements ---
            setValues: true , // Whether to set response data back to elements
            getValues: true // Whether to get data from elements before sending
        } , // end of options

        // --- CRUD-specific configuration objects ---
        Create: {
            type: "POST" , // HTTP method for creation
            process: true // Indicates data should be processed (e.g., JSON stringified)
        } ,
        Read: {
            type: "GET" , // HTTP method for reading
            process: false // Data usually goes in URL, no body processing needed
        } ,
        Update: {
            type: "PUT" , // HTTP method for updating
            process: true // Data usually goes in body, needs processing
        } ,
        Delete: {
            type: "DELETE" , // HTTP method for deletion
            process: false , // No body processing needed
            onElement: function () {
                this.remove() ; // Default action for Delete on an element: remove it
            }
        } , // end of Delete

        // --- Global data object, merged into every call ---
        data: null ,

        /**
         *  Normalizes the arguments passed to CRUD functions into a single options object.
         *  Handles various argument combinations.
         *
         *  @param {string|object} url      The URL or an options object.
         *  @param {object|function} data   Data object or success callback.
         *  @param {function|object} success Success callback or options object.
         *  @param {object} opts            The options object.
         *  @returns {object} The normalized options object.
         */
        toOpts: function ( url , data , success , opts ) {

            // If only one argument is provided and it's an object, assume it's the options.
            if ( arguments.length === 1 && typeof url === "object" ) {
                opts = url ;
                url = null ;
            } else {
                // Adjust arguments if success is not a function
                if ( ! $.isFunction( success ) ) {
                    opts = success ;
                    success = null ;
                }
                // Adjust arguments if data is a function, meaning it's actually the success callback
                if ( $.isFunction( data ) ) {
                    success = data ;
                    data = null ;
                }
            }

            // Create a new options object, extending from global defaults
            var o = $.extend( {} , R.options , opts ) ;

            // If the context (this) is a jQuery object, store it as the target
            if ( this.jquery ) {
                o.target = this ;
            }
            // Otherwise, extend with CRUD-specific options (e.g., R.Create, R.Read)
            else {
                $.extend( o , R[ this ] ) ;
            }

            // Assign url, success callback, and data if they were provided
            if ( url ) {
                o.url = url ;
            }
            if ( success ) {
                o.success = success ;
            }
            if ( data ) {
                o.data = data ;
            }

            return o ;

        } , // end of toOpts

        /**
         *  Fills URL placeholders with data properties and removes them from data.
         *
         *  @param {string} url  The URL string with potential placeholders (e.g., "{id}").
         *  @param {object} data The data object containing values for placeholders.
         *  @param {boolean} safe If true, clones the data object before modification.
         *  @returns {string} The URL with placeholders replaced.
         */
        fillUrl: function ( url , data , safe ) {

            // If no data is provided, use the global data object
            if ( ! data ) {
                data = $.extend( {} , R.data ) ;
            }
            // If 'safe' is true, create a clone of the data to avoid modifying the original
            if ( safe ) {
                data = $.extend( {} , data ) ;
            }

            var key , u , val ;
            // Iterate over the data object's keys
            for ( key in data ) {
                val = data[ key ] ;
                // Replace the placeholder in the URL
                u = url.replace( '{' + key + '}' , val ) ;
                // If a replacement occurred, update the URL and remove the key from data
                if ( u !== url ) {
                    url = u ;
                    delete data[ key ] ;
                }
            }

            return url ;

        } , // end of fillUrl

        /**
         *  Prepares the options object for an AJAX call.
         *  This includes merging global data, filling URL, wrapping callbacks,
         *  and handling JSON processing.
         *
         *  @returns {object} The fully prepared options object.
         */
        prep: function () {

            var act = R[ this ] , // Get the CRUD action specific configuration
                o = R.toOpts.apply( this , arguments ) ; // Normalize arguments into options

            // Merge global data with call-specific data, without altering originals
            if ( o.data || R.data ) {
                o.data = $.extend( {} , R.data , o.data ) ;
            }

            // Fill URL placeholders using the merged data
            o.url = R.fillUrl( o.url , o.data ) ;

            // Prepend global prefix if defined
            if ( R.prefix ) {
                o.url = R.prefix + o.url ;
            }

            // Wrap the success callback with before/after/dataType processing
            o.success = R.wrap( o.success , o.before , o.after , o.dataType , o ) ;

            // Wrap the error callback to handle specific status codes
            o.error = R.handle( o.error , o ) ;

            // If processing is required and JSON is available, process outgoing data
            if ( o.process && JSON ) {
                R.processOut( o ) ;
            }

            return o ;

        } , // end of prep

        /**
         *  Handles error callbacks, including specific HTTP status code handlers.
         *
         *  @param {function} error The original error callback.
         *  @param {object} o       The options object for the request.
         *  @returns {function} A wrapped error handler.
         */
        handle: function ( error , o ) {

            return function ( xhr , status ) {
                // Check for a specific handler for the HTTP status code, or fall back to generic error
                var fn = o[ xhr.status ] || error ;

                // If a status-specific handler was found and it's not the generic error handler
                if ( fn !== error ) {
                    o.handled = true ; // Mark as handled
                    // If the handler is 'success', call the success callback instead
                    if ( fn === 'success' ) {
                        return o.success( null , status ) ;
                    }
                }
                // Call the wrapped handler (either status-specific or generic error)
                R.wrap( fn , o.before , o.after , o )( xhr , status ) ;
            } ;

        } , // end of handle

        /**
         *  Wraps a callback with 'before' and 'after' functions,
         *  and handles 'rest' dataType processing for incoming data.
         *
         *  @param {function} callback The primary callback (success or error).
         *  @param {function} before   Callback to execute before the primary.
         *  @param {function} after    Callback to execute after the primary.
         *  @param {string} type       The dataType of the request.
         *  @param {object} opts       The options object.
         *  @returns {function} The wrapped callback.
         */
        wrap: function ( callback , before , after , type , opts ) {

            return function () {
                var t = this , // Store 'this' context
                    a = Array.prototype.slice.call( arguments ) ; // Convert arguments to array

                // Append options object as the last argument
                a[ a.length ] = opts ;

                // If dataType is 'rest', process incoming data
                if ( type === 'rest' ) {
                    a[ 0 ] = R.processIn.apply( t , a ) ;
                }

                // Execute 'before' callback if it exists
                if ( before ) {
                    before.apply( t , a ) ;
                }

                // Execute primary callback if it exists
                if ( callback ) {
                    callback.apply( t , a ) ;
                }

                // Execute 'after' callback if it exists
                if ( after ) {
                    after.apply( t , a ) ;
                }
            } ;

        } , // end of wrap

        /**
         *  Processes outgoing data for JSON requests.
         *  Sets processData to false and stringifies data to JSON.
         *
         *  @param {object} o The options object.
         */
        processOut: function ( o ) {

            o.processData = false ; // Prevent jQuery from processing data
            // Set content type to JSON if not already specified
            if ( ! o.contentType ) {
                o.contentType = "application/json" ;
            }
            // Stringify the data if it's not already a string
            if ( typeof o.data !== "string" ) {
                o.data = JSON.stringify( o.data || {} ) ;
            }

        } , // end of processOut

        /**
         *  Processes incoming 'rest' dataType responses.
         *  Parses JSON or handles HTML/empty strings.
         *
         *  @param {string} str The raw response string.
         *  @returns {object|jQuery|null} The processed data.
         */
        processIn: function ( str ) {

            // Return null for empty or undefined strings
            if ( ( str || '' ).length === 0 ) {
                return null ;
            }

            // If string starts with '<', assume it's HTML and return a jQuery object
            if ( str.charAt( 0 ) === '<' ) {
                return $( str ) ;
            }

            // Otherwise, attempt to parse as JSON or evaluate as JavaScript object
            return JSON ? JSON.parse( str ) : window.eval( "(" + str + ")" ) ;

        } , // end of processIn

        /**
         *  Handles CRUD operations when called on a jQuery element.
         *  Manages getting data from elements, setting data back, and calling
         *  the global CRUD function.
         *
         *  @param {string} act The CRUD action (e.g., 'Create', 'Read').
         *  @param {object} o   The options object.
         */
        element: function ( act , o ) {

            // If no data is provided, get it from the element using $.values (if available)
            if ( ! o.data && o.getValues && $.values ) {
                o.data = this.values( o ) ;
            }

            var self = this , // Keep reference to the jQuery element
                success = o.success ; // Store original success callback

            // Override the success callback to handle element-specific logic
            o.success = function ( data ) {
                // If data is returned and setValues is true, apply it back to the element
                if ( data && o.setValues && $.values ) {
                    self.values( data , o ) ;
                }
                // Execute the original success callback if it exists
                if ( success ) {
                    success.apply( this , arguments ) ;
                }
                // Execute the element-specific 'onElement' callback if it exists
                if ( o.onElement ) {
                    o.onElement.apply( this , arguments ) ;
                }
            } ;

            // Call the global CRUD function with the prepared options
            $[ act ]( o ) ;

        } , // end of element

        /**
         *  Executes the underlying jQuery.ajax call and stores the XHR object.
         *
         *  @param {object} o The options object for the AJAX call.
         *  @returns {jqXHR} The jQuery XHR object.
         */
        ajax: function ( o ) {

            return o.xhr = $.ajax( o ) ; // Store and return the XHR object

        } // end of ajax

    } ; // end of R object

    // Create global and element-level functions for each CRUD action
    $.each( [ 'Create' , 'Read' , 'Update' , 'Delete' ] , function ( i , act ) {

        // Global functions (e.g., $.Create(...))
        $[ act ] = function () {
            // Prepare options and execute AJAX call
            return R.ajax( R.prep.apply( act , arguments ) ) ;
        } ;

        // Element-level functions (e.g., $('#myDiv').Create(...))
        $.fn[ act ] = function () {
            var a = arguments ; // Store arguments for use in .each loop
            return this.each( function () {
                var t = $( this ) ; // Current element as jQuery object
                // Call R.element to handle element-specific logic
                R.element.call( t , act , R.toOpts.apply( t , a ) ) ;
            } ) ;
        } ;

    } ) ; // end of $.each

} )( jQuery ) ; // End of IIFE