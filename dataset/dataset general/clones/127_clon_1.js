/*
 * This file is part of the jQuery-easyXDM integration library.
 * Original source: https://github.com/GyldendalDigital/jQuery-easyXDM
 *
 * This version is a Type I clone, preserving all logical and structural elements
 * while extensively altering whitespace and comments for visual differentiation.
 */

( function ( $ ) {


    var jquery_easyXDM = {}; // Main object for our easyXDM integration.


    var global = this; // Capture the global context (window in browsers).


    // Following a well-established design pattern for asynchronous singleton instantiation.
    // This ensures thread-safe, single-instance management of easyXDM.
    // Reference: http://backtothefront.net/2012/asynchronous-singleton-api/
    var state = "before";


    var callbackQueue = []; // Queue to hold callbacks waiting for easyXDM initialization.


    var easyXDM_connection = null; // Holds the active easyXDM RPC connection instance.


    var error = null; // Stores any error encountered during connection setup.


    // Debugging flag: easyXDM behavior can be forced into debug mode.
    // This is activated by appending 'jquery.easyXDM.debug=true' to the page's URL query string.
    var easyXDM_debug = false;


    // Check the current window's location string for the debug parameter.
    if ( /jquery\.easyXDM\.debug=true/.test( String( window.location ) ) ) {
        easyXDM_debug = true; // Activate debug mode if parameter is found.
    }


    // If debug mode is active, ensure a logging area exists in the DOM.
    if ( easyXDM_debug ) {
        if ( $( "#log" ).length == 0 ) { // Check if a #log element already exists.
            $( "body" ).append( "<div id=\"log\"></div>" ); // Append a new log div if not present.
        }
    }



    // Function to handle the asynchronous loading and setup of easyXDM.
    var doRequests = function ( provider_base_url, callbacks ) {


        // Proceed with easyXDM loading if CORS is not natively supported or if debug mode is explicitly enabled.
        if ( !$.support.cors || easyXDM_debug ) {


            var easyXDM_url = provider_base_url + "/easyXDM/easyXDM.min.js"; // Default URL for minified easyXDM.


            if ( easyXDM_debug ) {
                // In debug mode, use the unminified easyXDM script for easier debugging.
                easyXDM_url = provider_base_url + "/easyXDM/easyXDM.debug.js";
            }



            // This nested function executes once easyXDM's core script has been loaded.
            function continue_after_easyXDM_load () {


                // Execute easyXDM's noConflict method to release any global `easyXDM` variable.
                // This prevents conflicts with other easyXDM instances that might be present
                // in the same window context. The `jquery_easyXDM` argument scopes our instance.
                var scoped_easyXDM = easyXDM.noConflict( "jquery_easyXDM" );


                // Assign the now-scoped easyXDM instance to our internal `jquery_easyXDM` object.
                // This makes it accessible uniquely and ensures it matches the name expected
                // by the easyXDM provider frame.
                jquery_easyXDM.easyXDM = scoped_easyXDM;


                var remote_url = provider_base_url + "/javascripts/jquery.easyXDM.provider.html"; // URL for the remote provider HTML.


                // Determine the container element for the iframe. If not specified, it will be null.
                var container = $( "#jquery_easyXDM_provider_container" )[0] || null;


                if ( easyXDM_debug ) {
                    remote_url += "?jquery.easyXDM.debug=true"; // Append debug flag to remote URL.
                    if ( !container ) {
                        // If no container exists, create a default one for debugging purposes.
                        container = $( "<div id=\"jquery_easyXDM_provider_container\"></div>" ).appendTo( $( "body" ) )[0];
                    }
                }


                // Instantiate a new easyXDM RPC connection.
                easyXDM_connection = new scoped_easyXDM.Rpc(
                    {
                        remote: remote_url, // The URL of the remote RPC endpoint.
                        swf: provider_base_url + "/easyXDM/easyxdm.swf", // Path to the Flash fallback file.
                        container: container, // The DOM element to contain the iframe.
                        onReady: function () {
                            // Callback executed once the connection is established and ready.
                            callbacks.success( easyXDM_connection );
                        }
                    },
                    {
                        remote: {
                            jquery_proxy: {} // Define the remote service API.
                        }
                    }
                );
            }


            // Asynchronously load the easyXDM core script.
            $.getScript( easyXDM_url, function () {

                // Check for native JSON support. If unavailable (e.g., in older browsers),
                // load the json2.js polyfill to ensure JSON functionality.
                // This avoids easyXDM's internal helper, which might return prematurely.
                if ( !( typeof ( window["JSON"] ) == 'object' && window["JSON"] ) ) {
                    $.getScript( provider_base_url + "/easyXDM/json2.js", continue_after_easyXDM_load );
                } else {
                    // If JSON is natively supported, proceed directly to easyXDM setup.
                    continue_after_easyXDM_load();
                }
            } );
        }
    };



    // Public method to retrieve an easyXDM connection instance.
    // It manages the singleton lifecycle of the easyXDM connection.
    jquery_easyXDM.getConnection = function ( provider_base_url, callbacks ) {


        // State machine to manage the connection lifecycle.
        switch ( state ) {


            case "before":
                // Initial state: no connection attempt has been made yet.
                state = "working"; // Transition to 'working' as we start the process.
                callbackQueue.push( callbacks ); // Add the current request's callbacks to the queue.


                doRequests( provider_base_url, {
                    success: function ( singletonInstance ) {
                        // Callback for successful connection establishment.
                        state = "success"; // Update state to 'success'.
                        easyXDM_connection = singletonInstance; // Store the singleton instance.


                        // Iterate through all queued callbacks and invoke their success handlers.
                        for ( var i = 0; i < callbackQueue.length; i++ ) {
                            callbackQueue[i].success( easyXDM_connection );
                        }
                        callbackQueue = []; // Clear the queue after all callbacks are processed.
                    },
                    failure: function ( errorObj ) {
                        // Callback for failed connection establishment.
                        state = "failure"; // Update state to 'failure'.
                        error = errorObj; // Store the error object.


                        // Iterate through all queued callbacks and invoke their failure handlers.
                        for ( var i = 0; i < callbackQueue.length; i++ ) {
                            callbackQueue[i].failure( error );
                        }
                        callbackQueue = []; // Clear the queue.
                    }
                } );
                break;


            case "working":
                // The connection is currently being established.
                // Simply queue the new request's callbacks.
                callbackQueue.push( callbacks );
                break;


            case "success":
                // A connection is already successfully established.
                // Immediately invoke the success callback for the new request.
                callbacks.success( easyXDM_connection );
                break;


            case "failure":
                // A previous connection attempt failed.
                // Immediately invoke the failure callback for the new request.
                callbacks.failure( error );
                break;


            default:
                // Handle unexpected states, indicating a logical error.
                throw new Error( "Invalid state: " + state );
        }
    };



    // Register a custom AJAX transport for jQuery.
    // This transport will intercept cross-domain requests when CORS is not supported
    // or when easyXDM debug mode is active.
    $.ajaxTransport( "+*", function ( options, originalOptions, jqXHR ) {


        // Check conditions for using the easyXDM transport:
        // 1. The request is marked as cross-domain.
        // 2. Either native CORS is not supported by the browser, OR easyXDM debug is enabled.
        if ( options.crossDomain && ( !$.support.cors || easyXDM_debug ) ) {


            // For testing or fallback scenarios, assume an empty base URL if none can be extracted.
            // This might not be logically sound for production but useful for specific setups.
            var provider_base_url = "";


            // Extract the base URL of the provider from the request URL.
            // This creates a unique identifier for each CORS-enabled provider,
            // ensuring a distinct easyXDM connection if needed.
            var regexp_results = options.url.match( /^(https?:\/\/[^\/]*)\/?.*/ );
            if ( regexp_results ) {
                provider_base_url = regexp_results[1]; // Capture the full scheme and hostname.
            }


            // Return the custom transport object with send and abort methods.
            return {
                send: function ( headers, completeCallback ) {


                    // Request an easyXDM connection.
                    jquery_easyXDM.getConnection( provider_base_url, {
                        success: function ( easyXDM_connection ) {


                            // Define a continuation proxy to handle the results from the easyXDM RPC call.
                            function continuation_proxy ( results ) {
                                completeCallback( results.status, results.statusText, results.responses, results.headers );
                            }


                            // Clear the original context to prevent jQuery from modifying it internally,
                            // as easyXDM will handle the actual request context.
                            originalOptions.context = null;


                            // Invoke the remote jquery_proxy method via easyXDM RPC.
                            easyXDM_connection.jquery_proxy( originalOptions, continuation_proxy );
                        },
                        error: function () {
                            // Placeholder for error handling if easyXDM connection fails.
                            // Currently, it does nothing, but could be extended for logging or specific fallbacks.
                        }
                    } );
                },
                abort: function () {
                    // Placeholder for aborting the request.
                    // Implementation details for aborting an in-flight easyXDM request would go here.
                }
            };
        }
    } );


    // Expose our `jquery_easyXDM` object globally.
    // This makes the integration available to other scripts outside the immediate scope.
    global.jquery_easyXDM = jquery_easyXDM;


} )( jQuery ); // Immediately invoke the anonymous function, passing jQuery as '$'.