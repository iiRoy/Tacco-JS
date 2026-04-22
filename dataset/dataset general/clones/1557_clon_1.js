( function ( ) { // Main IIFE wrapper for the entire LiveReload script.
    // Initialize several module-like objects for internal use.
    var __customevents = {} ,
        __protocol = {} ,
        __connector = {} ,
        __timer = {} ,
        __options = {} ,
        __reloader = {} ,
        __livereload = {} ,
        __less = {} ,
        __startup = {};

    // customevents: Module for handling custom DOM events.
    var CustomEvents;

    CustomEvents = {
        // Binds a custom event handler to an element.
        bind: function ( element , eventName , handler ) {
            if ( element.addEventListener ) {
                // Standard DOM event binding.
                return element.addEventListener( eventName , handler , false );
            }
            else if ( element.attachEvent ) {
                // IE-specific event binding using onpropertychange.
                element[ eventName ] = 1; // Mark the event as existing.
                return element.attachEvent( 'onpropertychange' , function ( event ) {
                    if ( event.propertyName === eventName ) {
                        return handler( ); // Execute handler when property changes.
                    }
                } );
            }
            else {
                // If neither method is available, throw an error.
                throw new Error( "Attempt to attach custom event " + eventName + " to something which isn't a DOMElement" );
            }
        } ,

        // Fires a custom event on an element.
        fire: function ( element , eventName ) {
            var event;
            if ( element.addEventListener ) {
                // Standard DOM event dispatching.
                event = document.createEvent( 'HTMLEvents' );
                event.initEvent( eventName , true , true ); // Initialize event with bubbles and cancelable true.
                return document.dispatchEvent( event );
            }
            else if ( element.attachEvent ) {
                // IE-specific event firing.
                if ( element[ eventName ] ) {
                    return element[ eventName ]++; // Increment property to trigger onpropertychange.
                }
            }
            else {
                // If neither method is available, throw an error.
                throw new Error( "Attempt to fire custom event " + eventName + " on something which isn't a DOMElement" );
            }
        }
    };

    // Expose CustomEvents methods through the __customevents object.
    __customevents.bind = CustomEvents.bind;
    __customevents.fire = CustomEvents.fire;


    // protocol: Handles the LiveReload protocol parsing.
    var PROTOCOL_6 , PROTOCOL_7 , Parser , ProtocolError;


    // Polyfill for Array.prototype.indexOf for older browsers.
    var __indexOf = Array.prototype.indexOf || function ( item ) {
        for ( var i = 0 , l = this.length; i < l; i++ ) {
            if ( this[ i ] === item ) return i;
        }
        return -1;
    };

    // Define LiveReload protocol URLs.
    __protocol.PROTOCOL_6 = PROTOCOL_6 = 'http://livereload.com/protocols/official-6';
    __protocol.PROTOCOL_7 = PROTOCOL_7 = 'http://livereload.com/protocols/official-7';

    // ProtocolError class for specific protocol-related errors.
    __protocol.ProtocolError = ProtocolError = ( function ( ) {
        function ProtocolError ( reason , data ) {
            this.message = "LiveReload protocol error (" + reason + ") after receiving data: \"" + data + "\".";
        }
        return ProtocolError;
    } )( );

    // Parser class responsible for interpreting messages from the LiveReload server.
    __protocol.Parser = Parser = ( function ( ) {
        function Parser ( handlers ) {
            this.handlers = handlers; // Handlers for connected, error, and message events.
            this.reset( ); // Initialize protocol state.
        }

        // Resets the parser's state, clearing the detected protocol.
        Parser.prototype.reset = function ( ) {
            return this.protocol = null;
        };

        // Processes incoming data from the WebSocket connection.
        Parser.prototype.process = function ( data ) {
            var command , message , options , _ref;

            try {
                // If protocol is not yet established (initial handshake).
                if ( ! ( this.protocol != null ) ) {
                    if ( data.match( /^!!ver:([\d.]+)$/ ) ) {
                        // Protocol 6 version message.
                        this.protocol = 6;
                    }
                    else if ( message = this._parseMessage( data , [ 'hello' ] ) ) {
                        // Hello message for protocol negotiation.
                        if ( ! message.protocols.length ) {
                            throw new ProtocolError( "no protocols specified in handshake message" );
                        }
                        else if ( __indexOf.call( message.protocols , PROTOCOL_7 ) >= 0 ) {
                            this.protocol = 7; // Prefer protocol 7.
                        }
                        else if ( __indexOf.call( message.protocols , PROTOCOL_6 ) >= 0 ) {
                            this.protocol = 6; // Fallback to protocol 6.
                        }
                        else {
                            throw new ProtocolError( "no supported protocols found" );
                        }
                    }
                    return this.handlers.connected( this.protocol ); // Notify handler that connection is established.
                }
                // If protocol 6 is in use.
                else if ( this.protocol === 6 ) {
                    message = JSON.parse( data );
                    if ( ! message.length ) {
                        throw new ProtocolError( "protocol 6 messages must be arrays" );
                    }
                    command = message[ 0 ] , options = message[ 1 ]; // Protocol 6 messages are [command, options].
                    if ( command !== 'refresh' ) {
                        throw new ProtocolError( "unknown protocol 6 command" );
                    }
                    return this.handlers.message( {
                        command: 'reload' ,
                        path: options.path ,
                        liveCSS: ( _ref = options.apply_css_live ) != null ? _ref : true // Default liveCSS to true.
                    } );
                }
                // If protocol 7 (or later) is in use.
                else {
                    message = this._parseMessage( data , [ 'reload' , 'alert' ] ); // Parse specific commands for protocol 7.
                    return this.handlers.message( message ); // Pass the parsed message to the handler.
                }
            }
            catch ( e ) {
                if ( e instanceof ProtocolError ) {
                    return this.handlers.error( e ); // Handle protocol-specific errors.
                }
                else {
                    throw e; // Re-throw other types of errors.
                }
            }
        };

        // Internal helper to parse JSON messages and validate commands.
        Parser.prototype._parseMessage = function ( data , validCommands ) {
            var message , _ref;
            try {
                message = JSON.parse( data );
            }
            catch ( e ) {
                throw new ProtocolError( 'unparsable JSON' , data );
            }
            if ( ! message.command ) {
                throw new ProtocolError( 'missing "command" key' , data );
            }
            if ( ( _ref = message.command , __indexOf.call( validCommands , _ref ) < 0 ) ) {
                throw new ProtocolError( "invalid command '" + message.command + "', only valid commands are: " + ( validCommands.join( ', ' ) ) + ")" , data );
            }
            return message;
        };

        return Parser;
    } )( );


    // connector: Establishes and maintains the WebSocket connection to the LiveReload server.
    var Connector , PROTOCOL_6 , PROTOCOL_7 , Parser , Version , _ref;

    // Helper for binding 'this' context to functions.
    var __bind = function ( fn , me ) {
        return function ( ) {
            return fn.apply( me , arguments );
        };
    };

    // Destructure protocol constants and Parser from the __protocol module.
    _ref = __protocol , Parser = _ref.Parser , PROTOCOL_6 = _ref.PROTOCOL_6 , PROTOCOL_7 = _ref.PROTOCOL_7;

    Version = '2.0.4'; // LiveReload.js client version.

    __connector.Connector = Connector = ( function ( ) {
        function Connector ( options , WebSocket , Timer , handlers ) {
            this.options = options; // Configuration options.
            this.WebSocket = WebSocket; // WebSocket constructor.
            this.Timer = Timer; // Timer utility.
            this.handlers = handlers; // Handlers for connection events.

            // Construct WebSocket URI.
            this._uri = "ws://" + this.options.host + ":" + this.options.port + "/livereload";
            this._nextDelay = this.options.mindelay; // Initial reconnection delay.
            this._connectionDesired = false; // Flag to indicate if connection should be active.
            this.protocol = 0; // Current protocol version (0 means not yet established).

            // Initialize protocol parser with bound handlers for 'this'.
            this.protocolParser = new Parser( {
                connected: __bind( function ( protocol ) {
                    this.protocol = protocol;
                    this._handshakeTimeout.stop( ); // Stop handshake timer on successful connection.
                    this._nextDelay = this.options.mindelay; // Reset delay on successful connection.
                    this._disconnectionReason = 'broken'; // Default reason if connection drops.
                    return this.handlers.connected( protocol );
                } , this ) ,

                error: __bind( function ( e ) {
                    this.handlers.error( e );
                    return this._closeOnError( ); // Close connection on protocol error.
                } , this ) ,

                message: __bind( function ( message ) {
                    return this.handlers.message( message ); // Pass parsed messages to handler.
                } , this )
            } );

            // Timer for handshake timeout.
            this._handshakeTimeout = new Timer( __bind( function ( ) {
                if ( ! this._isSocketConnected( ) ) {
                    return;
                }
                this._disconnectionReason = 'handshake-timeout';
                return this.socket.close( ); // Close if handshake times out.
            } , this ) );

            // Timer for scheduling reconnections.
            this._reconnectTimer = new Timer( __bind( function ( ) {
                if ( ! this._connectionDesired ) {
                    return;
                }
                return this.connect( ); // Attempt to reconnect.
            } , this ) );

            this.connect( ); // Initial connection attempt.
        }

        // Checks if the WebSocket is currently open.
        Connector.prototype._isSocketConnected = function ( ) {
            return this.socket && this.socket.readyState === this.WebSocket.OPEN;
        };

        // Initiates a WebSocket connection.
        Connector.prototype.connect = function ( ) {
            this._connectionDesired = true;

            if ( this._isSocketConnected( ) ) {
                return; // Already connected, do nothing.
            }

            if ( this._reconnectTimer ) {
                clearTimeout( this._reconnectTimer ); // Clear any pending reconnection.
            }

            this._disconnectionReason = 'cannot-connect'; // Default reason before connection.
            this.protocolParser.reset( ); // Reset protocol state for new connection.
            this.handlers.connecting( ); // Notify handlers that connection is starting.

            this.socket = new this.WebSocket( this._uri ); // Create new WebSocket instance.

            // Bind event handlers for the WebSocket.
            this.socket.onopen = __bind( function ( e ) {
                return this._onopen( e );
            } , this );
            this.socket.onclose = __bind( function ( e ) {
                return this._onclose( e );
            } , this );
            this.socket.onmessage = __bind( function ( e ) {
                return this._onmessage( e );
            } , this );
            return this.socket.onerror = __bind( function ( e ) {
                return this._onerror( e );
            } , this );
        };

        // Disconnects from the LiveReload server.
        Connector.prototype.disconnect = function ( ) {
            this._connectionDesired = false; // Stop desiring connection.
            this._reconnectTimer.stop( ); // Stop any reconnection attempts.

            if ( ! this._isSocketConnected( ) ) {
                return; // Not connected, nothing to do.
            }

            this._disconnectionReason = 'manual'; // Reason for disconnection.
            return this.socket.close( ); // Close the socket.
        };

        // Schedules a reconnection attempt with exponential backoff.
        Connector.prototype._scheduleReconnection = function ( ) {
            if ( ! this._connectionDesired ) {
                return; // Only reconnect if connection is desired.
            }

            if ( ! this._reconnectTimer.running ) {
                this._reconnectTimer.start( this._nextDelay ); // Start timer with current delay.
                // Increase delay for next attempt, capped by maxdelay.
                return this._nextDelay = Math.min( this.options.maxdelay , this._nextDelay * 2 );
            }
        };

        // Sends a command to the LiveReload server.
        Connector.prototype.sendCommand = function ( command ) {
            if ( this.protocol == null ) {
                return; // Cannot send command if protocol not established.
            }
            return this._sendCommand( command );
        };

        // Internal method to send a command (JSON stringified).
        Connector.prototype._sendCommand = function ( command ) {
            return this.socket.send( JSON.stringify( command ) );
        };

        // Closes the socket due to an error.
        Connector.prototype._closeOnError = function ( ) {
            this._handshakeTimeout.stop( );
            this._disconnectionReason = 'error';
            return this.socket.close( );
        };

        // WebSocket onopen event handler.
        Connector.prototype._onopen = function ( e ) {
            var hello;
            this.handlers.socketConnected( ); // Notify handler.
            this._disconnectionReason = 'handshake-failed'; // Default reason if handshake fails.

            // Construct the 'hello' message for handshake.
            hello = {
                command: 'hello' ,
                protocols: [ PROTOCOL_6 , PROTOCOL_7 ]
            };
            hello.ver = Version; // Add client version.
            if ( this.options.ext ) {
                hello.ext = this.options.ext;
            }
            if ( this.options.extver ) {
                hello.extver = this.options.extver;
            }
            if ( this.options.snipver ) {
                hello.snipver = this.options.snipver;
            }

            this._sendCommand( hello ); // Send the handshake message.
            // Start handshake timeout timer.
            return this._handshakeTimeout.start( this.options.handshake_timeout );
        };

        // WebSocket onclose event handler.
        Connector.prototype._onclose = function ( e ) {
            this.protocol = 0; // Reset protocol state.
            this.handlers.disconnected( this._disconnectionReason , this._nextDelay ); // Notify handler.
            return this._scheduleReconnection( ); // Schedule next reconnection attempt.
        };

        // WebSocket onerror event handler (currently a no-op).
        Connector.prototype._onerror = function ( e ) {
            // Error handling can be added here if needed, e.g., logging.
        };

        // WebSocket onmessage event handler.
        Connector.prototype._onmessage = function ( e ) {
            return this.protocolParser.process( e.data ); // Process incoming message data.
        };

        return Connector;
    } )( );


    // timer: A simple utility for managing timeouts.
    var Timer;

    // Helper for binding 'this' context to functions.
    var __bind = function ( fn , me ) {
        return function ( ) {
            return fn.apply( me , arguments );
        };
    };

    __timer.Timer = Timer = ( function ( ) {
        function Timer ( func ) {
            this.func = func; // The function to execute when the timer fires.
            this.running = false; // Flag indicating if the timer is active.
            this.id = null; // Stores the timeout ID.

            // Bound handler to ensure 'this' refers to the Timer instance.
            this._handler = __bind( function ( ) {
                this.running = false;
                this.id = null;
                return this.func( ); // Execute the stored function.
            } , this );
        }

        // Starts the timer with a given timeout duration.
        Timer.prototype.start = function ( timeout ) {
            if ( this.running ) {
                clearTimeout( this.id ); // Clear any existing timer.
            }
            this.id = setTimeout( this._handler , timeout ); // Set new timeout.
            return this.running = true; // Mark as running.
        };

        // Stops the timer if it's currently running.
        Timer.prototype.stop = function ( ) {
            if ( this.running ) {
                clearTimeout( this.id );
                this.running = false;
                return this.id = null;
            }
        };

        return Timer;
    } )( );

    // Static method for one-shot timers.
    Timer.start = function ( timeout , func ) {
        return setTimeout( func , timeout );
    };


    // options: Handles configuration options for LiveReload.
    var Options;

    __options.Options = Options = ( function ( ) {
        function Options ( ) {
            // Default option values.
            this.host = null;
            this.port = 35729;
            this.snipver = null;
            this.ext = null;
            this.extver = null;
            this.mindelay = 1000; // Minimum reconnection delay (ms).
            this.maxdelay = 60000; // Maximum reconnection delay (ms).
            this.handshake_timeout = 5000; // Handshake timeout (ms).
        }

        // Sets an option, performing type conversion for numbers.
        Options.prototype.set = function ( name , value ) {
            switch ( typeof this[ name ] ) {
                case 'undefined':
                    // If option does not exist, do nothing.
                    break;
                case 'number':
                    return this[ name ] = + value; // Convert to number.
                default:
                    return this[ name ] = value; // Assign directly.
            }
        };

        return Options;
    } )( );

    // Static method to extract LiveReload options from the script tag's URL.
    Options.extract = function ( document ) {
        var element , keyAndValue , m , mm , options , pair , src , _i , _j , _len , _len2 , _ref , _ref2;
        _ref = document.getElementsByTagName( 'script' ); // Get all script tags.
        for ( _i = 0 , _len = _ref.length; _i < _len; _i++ ) {
            element = _ref[ _i ];
            // Match script tag src that looks like a LiveReload script.
            if ( ( src = element.src ) && ( m = src.match( /^[^:]+:\/\/(.*)\/z?livereload\.js(?:\?(.*))?$/ ) ) ) {
                options = new Options( ); // Create new options instance.

                // Parse host and port from the URL part (m[1]).
                if ( mm = m[ 1 ].match( /^([^\/:]+)(?::(\d+))?$/ ) ) {
                    options.host = mm[ 1 ];
                    if ( mm[ 2 ] ) {
                        options.port = parseInt( mm[ 2 ] , 10 ); // Parse port as integer.
                    }
                }

                // Parse query parameters (m[2]) for additional options.
                if ( m[ 2 ] ) {
                    _ref2 = m[ 2 ].split( '&' );
                    for ( _j = 0 , _len2 = _ref2.length; _j < _len2; _j++ ) {
                        pair = _ref2[ _j ];
                        if ( ( keyAndValue = pair.split( '=' ) ).length > 1 ) {
                            // Set option, converting hyphen-separated names to camelCase (e.g., 'max-delay' to 'max_delay').
                            options.set( keyAndValue[ 0 ].replace( /-/g , '_' ) , keyAndValue.slice( 1 ).join( '=' ) );
                        }
                    }
                }
                return options; // Return the parsed options.
            }
        }
        return null; // Return null if no LiveReload script tag is found.
    };


    // reloader: Manages the reloading of assets and the page itself.
    var IMAGE_STYLES , Reloader , numberOfMatchingSegments , pathFromUrl , pathsMatch , pickBestMatch , splitUrl;

    // Helper for binding 'this' context to functions.
    var __bind = function ( fn , me ) {
        return function ( ) {
            return fn.apply( me , arguments );
        };
    };

    // Splits a URL into its base URL, parameters, and hash components.
    splitUrl = function ( url ) {
        var hash , index , params;
        if ( ( index = url.indexOf( '#' ) ) >= 0 ) {
            hash = url.slice( index );
            url = url.slice( 0 , index );
        }
        else {
            hash = '';
        }
        if ( ( index = url.indexOf( '?' ) ) >= 0 ) {
            params = url.slice( index );
            url = url.slice( 0 , index );
        }
        else {
            params = '';
        }
        return {
            url: url ,
            params: params ,
            hash: hash
        };
    };

    // Extracts the path component from a given URL.
    pathFromUrl = function ( url ) {
        var path;
        url = splitUrl( url ).url; // Get base URL without params/hash.
        if ( url.indexOf( 'file://' ) === 0 ) {
            path = url.replace( /^file:\/\/(localhost)?/ , '' ); // Handle local file paths.
        }
        else {
            // Remove protocol, host, and port to get the path.
            path = url.replace( /^([^:]+:)?\/\/([^:\/]+)(:\d*)?\// , '/' );
        }
        return decodeURIComponent( path ); // Decode URI components.
    };

    // Finds the object in a list that best matches a given path.
    pickBestMatch = function ( path , objects , pathFunc ) {
        var bestMatch , object , score , _i , _len;
        bestMatch = {
            score: 0
        };
        for ( _i = 0 , _len = objects.length; _i < _len; _i++ ) {
            object = objects[ _i ];
            score = numberOfMatchingSegments( path , pathFunc( object ) ); // Calculate match score.
            if ( score > bestMatch.score ) {
                bestMatch = {
                    object: object ,
                    score: score
                };
            }
        }
        if ( bestMatch.score > 0 ) {
            return bestMatch; // Return best match if score is positive.
        }
        else {
            return null; // No match found.
        }
    };

    // Calculates a score based on the number of matching path segments.
    numberOfMatchingSegments = function ( path1 , path2 ) {
        var comps1 , comps2 , eqCount , len;
        path1 = path1.replace( /^\/+/ , '' ).toLowerCase( ); // Normalize paths.
        path2 = path2.replace( /^\/+/ , '' ).toLowerCase( );

        if ( path1 === path2 ) {
            return 10000; // Perfect match gets a very high score.
        }

        comps1 = path1.split( '/' ).reverse( ); // Split into components and reverse for matching from end.
        comps2 = path2.split( '/' ).reverse( );
        len = Math.min( comps1.length , comps2.length );
        eqCount = 0;

        // Count matching segments from the end.
        while ( eqCount < len && comps1[ eqCount ] === comps2[ eqCount ] ) {
            ++ eqCount;
        }
        return eqCount;
    };

    // Checks if two paths match based on segment comparison.
    pathsMatch = function ( path1 , path2 ) {
        return numberOfMatchingSegments( path1 , path2 ) > 0;
    };

    // Defines CSS properties that might contain image URLs.
    IMAGE_STYLES = [
        {
            selector: 'background' ,
            styleNames: [ 'backgroundImage' ]
        } ,
        {
            selector: 'border' ,
            styleNames: [ 'borderImage' , 'webkitBorderImage' , 'MozBorderImage' ]
        }
    ];

    __reloader.Reloader = Reloader = ( function ( ) {
        function Reloader ( window , console , Timer ) {
            this.window = window;
            this.console = console;
            this.Timer = Timer;
            this.document = this.window.document;
            this.stylesheetGracePeriod = 200; // Delay for stylesheet reloads to take effect.
            this.importCacheWaitPeriod = 200; // Delay for @import rules.
            this.plugins = [ ]; // Array to hold LiveReload plugins.
        }

        // Adds a plugin to the reloader.
        Reloader.prototype.addPlugin = function ( plugin ) {
            return this.plugins.push( plugin );
        };

        // Placeholder for analysis functionality (not implemented in this snippet).
        Reloader.prototype.analyze = function ( callback ) {
            return results;
        };

        // Reloads assets based on the given path and options.
        Reloader.prototype.reload = function ( path , options ) {
            var plugin , _i , _len , _ref;
            _ref = this.plugins;
            for ( _i = 0 , _len = _ref.length; _i < _len; _i++ ) {
                plugin = _ref[ _i ];
                // If a plugin handles the reload, return early.
                if ( plugin.reload && plugin.reload( path , options ) ) {
                    return;
                }
            }

            if ( options.liveCSS ) {
                if ( path.match( /\.css$/i ) ) {
                    if ( this.reloadStylesheet( path ) ) {
                        return; // If stylesheet reloaded, stop here.
                    }
                }
            }

            if ( options.liveImg ) {
                if ( path.match( /\.(jpe?g|png|gif)$/i ) ) {
                    this.reloadImages( path );
                    return; // If image reloaded, stop here.
                }
            }

            return this.reloadPage( ); // Fallback to full page reload.
        };

        // Performs a full page reload.
        Reloader.prototype.reloadPage = function ( ) {
            return this.window.document.location.reload( );
        };

        // Reloads images by busting the cache.
        Reloader.prototype.reloadImages = function ( path ) {
            var expando , img , selector , styleNames , styleSheet , _i , _j , _k , _l , _len , _len2 , _len3 , _len4 , _ref , _ref2 , _ref3 , _ref4 , _results;
            expando = this.generateUniqueString( ); // Generate unique string for cache busting.

            // Reload images in <img> tags.
            _ref = this.document.images;
            for ( _i = 0 , _len = _ref.length; _i < _len; _i++ ) {
                img = _ref[ _i ];
                if ( pathsMatch( path , pathFromUrl( img.src ) ) ) {
                    img.src = this.generateCacheBustUrl( img.src , expando ); // Update src to force reload.
                }
            }

            // Reload images specified in CSS styles.
            if ( this.document.querySelectorAll ) {
                for ( _j = 0 , _len2 = IMAGE_STYLES.length; _j < _len2; _j++ ) {
                    _ref2 = IMAGE_STYLES[ _j ] , selector = _ref2.selector , styleNames = _ref2.styleNames;
                    _ref3 = this.document.querySelectorAll( "[style*=" + selector + "]" ); // Find elements with relevant inline styles.
                    for ( _k = 0 , _len3 = _ref3.length; _k < _len3; _k++ ) {
                        img = _ref3[ _k ]; // 'img' here refers to any element, not just <img>.
                        this.reloadStyleImages( img.style , styleNames , path , expando );
                    }
                }
            }

            // Reload images within stylesheets (more complex, not fully shown here).
            if ( this.document.styleSheets ) {
                _ref4 = this.document.styleSheets;
                _results = [ ];
                for ( _l = 0 , _len4 = _ref4.length; _l < _len4; _l++ ) {
                    styleSheet = _ref4[ _l ];
                    // The rest of the implementation for reloading images in stylesheets would go here.
                }
            }