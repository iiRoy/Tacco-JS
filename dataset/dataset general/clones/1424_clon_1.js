/* This file is part of a library that handles real-time communication.
 * It's licensed under the Apache License, Version 2.0.
 *
 * You can find a copy of the license at:
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This section acknowledges contributions from another project.
// Portions of this source code are derived from:
//
// jQuery Stream @VERSION
// Comet Streaming JavaScript Library
// Project URL: http://code.google.com/p/jquery-stream/
//
// Copyright (c) 2011, Donghwan Kim
// Licensed under the Apache License, Version 2.0
//
// Designed to be compatible with jQuery versions 1.5 and above.
//
// For more details, refer to the official documentation:
// https://github.com/Atmosphere/atmosphere/wiki/jQuery.atmosphere.js-API

jQuery .atmosphere = function ( ) {

    // Attach an unload handler to the window to ensure clean shutdown.
    jQuery ( window ) .unload ( function ( ) {
        jQuery .atmosphere .unsubscribe ( ) ;
    } ) ;

    // Internal helper function to parse HTTP header strings.
    var parseHeaders = function ( headerString ) {
        var match , rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg , headers = { } ;
        // Iterate through all header lines.
        while ( ( match = rheaders .exec ( headerString ) ) ) {
            headers [ match [ 1 ] ] = match [ 2 ] ;
        }
        return headers ;
    } ;

    // The public API for jQuery.atmosphere.
    return {
        version : "1.0" , // Current version of the library.
        requests : [ ] , // Array to hold active requests.
        callbacks : [ ] , // Array to hold registered callbacks.

        // Default handlers for various events.
        onError : function ( response ) {
            // Default empty error handler.
        } ,
        onClose : function ( response ) {
            // Default empty close handler.
        } ,
        onOpen : function ( response ) {
            // Default empty open handler.
        } ,
        onMessage : function ( response ) {
            // Default empty message handler.
        } ,
        onReconnect : function ( request , response ) {
            // Default empty reconnect handler.
        } ,
        onMessagePublished : function ( response ) {
            // Default empty message published handler.
        } ,
        onTransportFailure : function ( response ) {
            // Default empty transport failure handler.
        } ,

        // Constructor for a new Atmosphere request.
        AtmosphereRequest : function ( options ) {

            /**
             * @private
             * Internal object to store request parameters.
             * This object holds the configuration for the current Atmosphere connection.
             */
            var _request = {
                timeout: 300000, // Connection timeout in milliseconds.
                method: 'GET', // HTTP method for the request.
                headers: {}, // Custom HTTP headers.
                contentType : '', // Content type for the request body.
                callback: null, // Callback function for general events.
                url : '', // The URL for the Atmosphere endpoint.
                data : '', // Data to send with the request.
                suspend : true, // Whether to suspend the connection.
                maxRequest : 60, // Maximum number of reconnect attempts.
                reconnect : true, // Whether to automatically reconnect on failure.
                maxStreamingLength : 10000000, // Max length for streaming data.
                lastIndex : 0, // Last processed index for streamed data.
                logLevel : 'info', // Logging verbosity level.
                requestCount : 0, // Counter for request attempts.
                fallbackMethod: 'GET', // Method to use if primary transport fails.
                fallbackTransport : 'streaming', // Transport to use if primary fails.
                transport : 'long-polling', // Preferred transport protocol.
                webSocketImpl: null, // Custom WebSocket implementation.
                webSocketUrl: null, // Custom WebSocket URL.
                webSocketPathDelimiter: "@@", // Delimiter for WebSocket path.
                enableXDR : false, // Enable XDomainRequest for IE.
                rewriteURL : false, // Whether to rewrite the URL.
                attachHeadersAsQueryString : true, // Attach headers as query params.
                executeCallbackBeforeReconnect : false, // Callbacks before reconnect.
                readyState : 0, // Current ready state of the request.
                lastTimestamp : 0, // Timestamp of the last message.
                withCredentials : false, // Send cookies with cross-domain requests.
                trackMessageLength : false , // Track message length for streaming.
                messageDelimiter : '|', // Delimiter for messages in streaming.
                connectTimeout : -1, // Timeout for the initial connection.
                dropAtmosphereHeaders : false, // Drop Atmosphere-specific headers.
                // Event handlers specific to this request instance.
                onError : function ( response ) { } ,
                onClose : function ( response ) { } ,
                onOpen : function ( response ) { } ,
                onMessage : function ( response ) { } ,
                onReconnect : function ( request , response ) { } ,
                onMessagePublished : function ( response ) { } ,
                onTransportFailure : function ( reason , request ) { }
            } ;

            /**
             * @private
             * Stores the last response received for this request.
             */
            var _response = {
                status: 200, // HTTP status code of the response.
                responseBody : '', // The body of the response.
                expectedBodySize : -1, // Expected size of the response body.
                headers : [], // HTTP headers from the response.
                state : "messageReceived", // Current state of the connection.
                transport : "polling", // The transport used for this response.
                error: null, // Any error object associated with the response.
                request : null, // Reference to the current request.
                id : 0 // Identifier for the response.
            } ;

            /**
             * @private
             * Unique identifier for the current request.
             */
            var _uuid = 0 ;

            /**
             * @private
             * Holds the active WebSocket connection object, if in use.
             */
            var _websocket = null ;

            /**
             * @private
             * Holds the active Server-Sent Events (SSE) connection object.
             */
            var _sse = null ;

            /**
             * @private
             * Stores the XMLHttpRequest or ActiveXObject instance for HTTP transports.
             */
            var _activeRequest = null ;

            /**
             * @private
             * Special object used for streaming on Internet Explorer.
             */
            var _ieStream = null ;

            /**
             * @private
             * The jQuery XHR object for JSONP or AJAX requests.
             */
            var _jqxhr = null ;

            /**
             * @private
             * Flag indicating if the request has been subscribed.
             */
            var _subscribed = true ;

            /**
             * @private
             * Counter for reconnection attempts.
             */
            var _requestCount = 0 ;

            /**
             * @private
             * Flag to indicate if the connection is currently being aborted.
             */
            var _abordingConnection = false ;

            // Automatically subscribe when an AtmosphereRequest is created.
            _subscribe ( options ) ;

            /**
             * @private
             * Initializes the internal state variables for a new request.
             */
            function _init ( ) {
                _uuid = 0 ;
                _subscribed = true ;
                _abordingConnection = false ;
                _requestCount = 0 ;

                _websocket = null ;
                _sse = null ;
                _activeRequest = null ;
                _ieStream = null ;
            }

            /**
             * @private
             * Re-initializes the Atmosphere object, clearing its state first.
             */
            function _reinit ( ) {
                _clearState ( ) ; // Assuming _clearState is defined elsewhere.
                _init ( ) ;
            }

            /**
             * @private
             * Subscribes to the Atmosphere endpoint using the specified options.
             * If an existing connection is active, it will be closed first.
             *
             * @param {Object} options - Configuration parameters for the request.
             */
            function _subscribe ( options ) {
                _reinit ( ) ; // Reset state before subscribing.

                // Merge provided options with default request parameters.
                _request = jQuery .extend ( _request , options ) ;
                _uuid = jQuery .atmosphere .guid ( ) ; // Generate a new GUID for the request.
            }

            /**
             * @private
             * Checks if WebSocket transport is supported by the browser or a custom implementation.
             *
             * @returns {boolean} True if WebSockets are available, false otherwise.
             */
            function _supportWebsocket ( ) {
                // Check for custom implementation or native browser support.
                return _request .webSocketImpl != null || window .WebSocket || window .MozWebSocket ;
            }

            /**
             * @private
             * Determines if Server-Sent Events (SSE) are supported.
             *
             * @returns {boolean} True if EventSource is available, false otherwise.
             */
            function _supportSSE ( ) {
                return window .EventSource ;
            }

            /**
             * @private
             * Executes the Atmosphere request using the configured transport.
             * Handles fallback logic if the primary transport (WebSocket/SSE) fails.
             */
            function _execute ( ) {
                // Check if the transport is not WebSocket or SSE.
                if ( _request .transport != 'websocket' && _request .transport != 'sse' ) {
                    _open ( 'opening' , _request .transport , _request ) ; // Set state to 'opening'.
                    _executeRequest ( ) ; // Execute the request using traditional HTTP methods.
                }
                // If WebSocket is the chosen transport.
                else if ( _request .transport == 'websocket' ) {
                    if ( ! _supportWebsocket ( ) ) {
                        // Log and fallback if WebSockets are not supported.
                        _reconnectWithFallbackTransport ( "Websocket is not supported, using request.fallbackTransport (" + _request .fallbackTransport + ")" ) ;
                    } else {
                        _executeWebSocket ( false ) ; // Proceed with WebSocket connection.
                    }
                }
                // If SSE is the chosen transport.
                else if ( _request .transport == 'sse' ) {
                    if ( ! _supportSSE ( ) ) {
                        // Log and fallback if SSE is not supported.
                        _reconnectWithFallbackTransport ( "Server Side Events(SSE) is not supported, using request.fallbackTransport (" + _request .fallbackTransport + ")" ) ;
                    } else {
                        _executeSSE ( false ) ; // Proceed with SSE connection.
                    }
                }
            }

            /**
             * @private
             * Sets the internal state of the request and invokes the appropriate callbacks.
             *
             * @param {string} state - The new state of the connection (e.g., 'opening', 'messageReceived').
             * @param {string} transport - The transport protocol being used.
             * @param {Object} request - The request object.
             */
            function _open ( state , transport , request ) {

                // Provide a close method on the request object.
                request .close = function ( ) {
                    _close ( ) ; // Assuming _close is defined elsewhere.
                    request .reconnect = false ; // Disable auto-reconnect upon explicit close.
                } ;

                _response .request = request ; // Associate the response with the request.
                var prevState = _response .state ; // Store current state.
                _response .state = state ; // Update to the new state.
                _response .status = 200 ; // Assume success for opening.
                var prevTransport = _response .transport ; // Store current transport.
                _response .transport = transport ; // Update to the new transport.
                _invokeCallback ( ) ; // Trigger registered callbacks. (Assuming _invokeCallback is defined)
                _response .state = prevState ; // Restore previous state after callback.
                _response .transport = prevTransport ; // Restore previous transport.
            }

            /**
             * @private
             * Executes a request using JSONP transport.
             *
             * @param {Object} request - Optional request parameters. If undefined, `_request` is used.
             */
            function _jsonp ( request ) {
                var rq = _request ;
                // Use provided request object if available, otherwise use the default.
                if ( ( request != null ) && ( typeof ( request ) != 'undefined' ) ) {
                    rq = request ;
                }

                var url = rq .url ;
                var data = rq .data ;
                // Attach headers as query parameters if configured.
                if ( rq .attachHeadersAsQueryString ) {
                    url = _attachHeaders ( rq ) ; // Assuming _attachHeaders is defined.
                    if ( data != '' ) {
                        url += "&X-Atmosphere-Post-Body=" + data ; // Append post body.
                    }
                    data = '' ; // Clear data as it's now in the URL.
                }

                // Make the AJAX call using jQuery.
                _jqxhr = jQuery .ajax ( {
                    url : url ,
                    type : rq .method ,
                    dataType: "jsonp" , // Specify JSONP data type.
                    error : function ( jqXHR , textStatus , errorThrown ) {
                        // Handle errors and potential reconnections.
                        if ( jqXHR .status < 300 && rq .requestCount++ < rq .maxRequest ) {
                            _reconnect ( _jqxhr , rq ) ; // Reconnect on transient errors.
                        } else {
                            _prepareCallback ( textStatus , "error" , jqXHR .status , rq .transport ) ; // Trigger error callback.
                        }
                    } ,
                    jsonp : "jsonpTransport" , // Custom JSONP callback parameter name.
                    success: function ( json ) {
                        // Handle successful JSONP response.
                        if ( rq .requestCount++ < rq .maxRequest ) {
                            if ( rq .executeCallbackBeforeReconnect ) {
                                _reconnect ( _jqxhr , rq ) ; // Reconnect if configured to do so before callback.
                            }

                            var msg = json .message ;
                            // Stringify message if it's not already a string.
                            if ( msg != null && typeof msg != 'string' ) {
                                try {
                                    msg = jQuery .stringifyJSON ( msg ) ; // Assuming jQuery.stringifyJSON exists.
                                } catch ( err ) {
                                    // Handle cases where the message might be partial or malformed.
                                }
                            }

                            _prepareCallback ( msg , "messageReceived" , 200 , rq .transport ) ; // Trigger message received callback.

                            if ( ! rq .executeCallbackBeforeReconnect ) {
                                _reconnect ( _jqxhr , rq ) ; // Reconnect after callback if not done before.
                            }
                        } else {
                            // Log and handle max reconnect attempts reached.
                            jQuery .atmosphere .log ( _request .logLevel , [ "JSONP reconnect maximum try reached " + _request .requestCount ] ) ;
                            _onError ( ) ; // Trigger general error handler. (Assuming _onError is defined)
                        }
                    } ,
                    data : rq .data , // Data to send with the request.
                    beforeSend : function ( jqXHR ) {
                        _doRequest ( jqXHR , rq , false ) ; // Prepare the request before sending. (Assuming _doRequest is defined)
                    }
                } ) ;
            }

            /**
             * @private
             * Executes a request using standard AJAX transport (long-polling or streaming).
             *
             * @param {Object} request - Optional request parameters. If undefined, `_request` is used.
             */
            function _ajax ( request ) {
                var rq = _request ;
                // Use provided request object if available, otherwise use the default.
                if ( ( request != null ) && ( typeof ( request ) != 'undefined' ) ) {
                    rq = request ;
                }

                var url = rq .url ;
                var data = rq .data ;
                // Attach headers as query parameters if configured.
                if ( rq .attachHeadersAsQueryString ) {
                    url = _attachHeaders ( rq ) ; // Assuming _attachHeaders is defined.
                    if ( data != '' ) {
                        url += "&X-Atmosphere-Post-Body=" + data ; // Append post body.
                    }
                    data = '' ; // Clear data as it's now in the URL.
                }

                // Make the AJAX call using jQuery.
                _jqxhr = jQuery .ajax ( {
                    url : url ,
                    type : rq .method ,
                    error : function ( jqXHR , textStatus , errorThrown ) {
                        // Handle errors and potential reconnections.
                        if ( jqXHR .status < 300 && rq .requestCount++ < rq .maxRequest ) {
                            _reconnect ( _jqxhr , rq ) ; // Reconnect on transient errors.
                        } else {
                            _prepareCallback ( textStatus , "error" , jqXHR .status , rq .transport ) ; // Trigger error callback.
                        }
                    } ,
                    success: function ( data , textStatus , jqXHR ) {
                        // Handle successful AJAX response.
                        if ( rq .requestCount++ < rq .maxRequest ) {
                            if ( rq .executeCallbackBeforeReconnect ) {
                                _reconnect ( _jqxhr , rq ) ; // Reconnect if configured to do so before callback.
                            }

                            _prepareCallback ( data , "messageReceived" , 200 , rq .transport ) ; // Trigger message received callback.

                            if ( ! rq .executeCallbackBeforeReconnect ) {
                                _reconnect ( _jqxhr , rq ) ; // Reconnect after callback if not done before.
                            }
                        } else {
                            // Log and handle max reconnect attempts reached.
                            jQuery .atmosphere .log ( _request .logLevel , [ "AJAX reconnect maximum try reached " + _request .requestCount ] ) ;
                            _onError ( ) ; // Trigger general error handler.
                        }
                    } ,
                    data : rq .data , // Data to send with the request.
                    beforeSend : function ( jqXHR ) {
                        _doRequest ( jqXHR , rq , false ) ; // Prepare the request before sending.
                    }
                } ) ;
            }

            /**
             * @private
             * Creates and returns a WebSocket object.
             * Uses a custom implementation if provided, otherwise defaults to native browser WebSocket.
             *
             * @param {string} location - The URL for the WebSocket connection.
             * @returns {WebSocket} The WebSocket instance.
             */
            function _getWebSocket ( location ) {
                if ( _request .webSocketImpl != null ) {
                    return _request .webSocketImpl ; // Use custom implementation.
                } else {
                    if ( window .WebSocket ) {
                        return new WebSocket ( location ) ; // Native WebSocket.
                    } else {
                        return new MozWebSocket ( location ) ; // Mozilla-specific WebSocket (older browsers).
                    }
                }
            }

            /**
             * @private
             * Constructs the WebSocket URL from the request URL.
             * Replaces 'http' with 'ws' (or 'https' with 'wss').
             *
             * @returns {string} The formatted WebSocket URL.
             */
            function _buildWebSocketUrl ( ) {
                var url = _request .url ;
                url = _attachHeaders ( ) ; // Attach headers to the URL. (Assuming _attachHeaders is defined)
                // Decode URI and replace HTTP scheme with WebSocket scheme.
                return decodeURI ( jQuery ( '<a href="' + url + '"/>' ) [ 0 ] .href .replace ( /^http/ , "ws" ) ) ;
            }

            /**
             * @private
             * Constructs the Server-Sent Events (SSE) URL from the request URL.
             * Includes Atmosphere's headers as query parameters.
             *
             * @returns {string} The formatted SSE URL.
             */
            function _buildSSEUrl ( ) {
                var url = _request .url ;
                url = _attachHeaders ( ) ; // Attach headers to the URL.
                return url ;
            }

            /**
             * @private
             * Initiates a Server-Sent Events (SSE) connection.
             * Automatically falls back to another transport if SSE is not supported or fails to open.
             *
             * @param {boolean} sseOpened - Flag indicating if SSE was already successfully opened.
             */
            function _executeSSE ( sseOpened ) {

                _response .transport = "sse" ; // Set the current transport to SSE.

                var location = _buildSSEUrl ( _request .url ) ; // Get the SSE URL.

                jQuery .atmosphere .log ( _request .logLevel , [ "Invoking executeSSE" ] ) ; // Log the action.
                if ( _request .logLevel == 'debug' ) {
                    // More detailed debug logging might go here.
                }