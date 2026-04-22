( function ( w ) {
// Check if fastXDM library is already loaded in the window object.
if ( w . fastXDM ) return ;

    // Internal storage for handlers, keyed by a unique identifier.
    var handlers = {};
    // Queue for callbacks waiting for environment to load.
    var onEnvLoad = [];
    // Environment object, holds configuration and utilities like JSON parser.
    var env = {};


    /*
     * Generates a unique key for identifying XDM instances.
     * The key is a 5-character hexadecimal string.
     */
    function genKey ( ) {
        var key = '';
        for ( i = 0 ; i < 5 ; i ++ ) {
            key += Math . ceil ( Math . random ( ) * 15 ) . toString ( 16 ) ;
        }
        return key ;
    }

    /**
     * Waits for a property to exist on an object before executing a function.
     * Uses setTimeout with a delay of 0 to avoid blocking the main thread.
     * It has a retry limit to prevent infinite loops.
     * @param {Object} obj The object to check.
     * @param {string} prop The property name to wait for.
     * @param {Function} func The function to execute once the property exists.
     * @param {Object} self The 'this' context for the function.
     * @param {number} count Internal counter for retries.
     */
    function waitFor ( obj , prop , func , self , count ) {
        if ( obj [ prop ] ) {
            func . apply ( self ) ;
        } else {
            count = count || 0 ;
            if ( count < 1000 ) {
                setTimeout ( function ( ) {
                    waitFor ( obj , prop , func , self , count + 1 ) ;
                } , 0 ) ;
            }
        }
    }

    /**
     * Dynamically attaches a script to the document.
     * Waits for the document body to be available before appending the script.
     * @param {string} url The URL of the script to attach. If not provided,
     *                     it uses w.fastXDM.helperUrl.
     */
    function attachScript ( url ) {
        setTimeout ( function ( ) {
            var newScript = document . createElement ( 'script' ) ;
            newScript . type = 'text/javascript' ;
            newScript . src = url || w . fastXDM . helperUrl ;
            waitFor ( document , 'body' , function ( ) {
                document . getElementsByTagName ( 'HEAD' ) [ 0 ] . appendChild ( newScript ) ;
            } ) ;
        } , 0 ) ;
    }

    // --- Environment related functions ---

    /**
     * Retrieves the environment object. If the environment is not yet loaded,
     * the callback is queued.
     * @param {Function} callback The function to call with the environment.
     * @param {Object} self The 'this' context for the callback.
     */
    function getEnv ( callback , self ) {
        if ( env . loaded ) {
            callback . apply ( self , [ env ] ) ;
        } else {
            onEnvLoad . push ( [ self , callback ] ) ;
        }
    }

    /**
     * Marks the environment as loaded and executes any pending callbacks.
     */
    function envLoaded ( ) {
        env . loaded = true ;
        if ( onEnvLoad . length > 0 ) {
            for ( callback in onEnvLoad ) {
                onEnvLoad [ callback ] [ 1 ] . apply ( onEnvLoad [ callback ] [ 0 ] , [ env ] ) ;
            }
        }
    }

    /**
     * Applies a method on the XDM instance based on stringified data.
     * Handles serialization/deserialization and function callbacks.
     * @param {string} strData The stringified data containing method name and arguments.
     * @param {Object} self The XDM instance (Server or Client) to apply the method on.
     */
    function applyMethod ( strData , self ) {
        getEnv ( function ( env ) {
            var data = env . json . parse ( strData ) ;
            if ( data [ 0 ] ) {
                if ( ! data [ 1 ] ) data [ 1 ] = [] ;
                for ( i in data [ 1 ] ) {
                    if ( data [ 1 ] [ i ] . _func ) {
                        var funcNum = data [ 1 ] [ i ] . _func ;
                        data [ 1 ] [ i ] = function ( ) {
                            var args = Array . prototype . slice . call ( arguments ) ;
                            args . unshift ( '_func' + funcNum ) ;
                            self . callMethod . apply ( self , args ) ;
                        }
                    }
                }
                setTimeout ( function ( ) {
                    if ( ! self . methods [ data [ 0 ] ] ) {
                        throw Error ( 'fastXDM: Method ' + data [ 0 ] + ' is undefined' ) ;
                    }
                    self . methods [ data [ 0 ] ] . apply ( self , data [ 1 ] ) ;
                } , 0 ) ;
            }
        } ) ;
    }

    // --- Main fastXDM object definition ---
    w . fastXDM = {
        _id : 0 , // Unique identifier for XDM instances
        helperUrl : 'http://userapi.com/js/api/xdmHelper.js' , // URL for the helper script

        /**
         * Server constructor for cross-domain communication.
         * @param {Object} methods An object containing methods callable by the client.
         * @param {Function} filter An optional function to filter incoming messages based on origin.
         */
        Server : function ( methods , filter ) {
            this . methods = methods || {} ;
            this . id = w . fastXDM . _id ++ ;
            this . filter = filter ;
            this . key = genKey ( ) ;
            this . methods [ '%init%' ] = this . methods [ '__fxdm_i' ] = function ( ) {
                w . fastXDM . run ( this . id ) ;
                if ( this . methods [ 'onInit' ] ) this . methods [ 'onInit' ] ( ) ;
            } ;
            this . frameName = 'fXD' + this . key ;
            this . server = true ;
            handlers [ this . key ] = [ applyMethod , this ] ;
        } ,

        /**
         * Client constructor for cross-domain communication.
         * @param {Object} methods An object containing methods callable by the server.
         */
        Client : function ( methods ) {
            this . methods = methods || {} ;
            this . id = w . fastXDM . _id ++ ;
            w . fastXDM . run ( this . id ) ;
            if ( window . name . indexOf ( 'fXD' ) == 0 ) {
                this . key = window . name . substr ( 3 ) ;
            } else {
                throw Error ( 'Wrong window.name property.' ) ;
            }
            this . caller = window . parent ;
            handlers [ this . key ] = [ applyMethod , this ] ;
            this . client = true ;

            w . fastXDM . on ( 'helper' , function ( ) {
                w . fastXDM . onClientStart ( this ) ;
            } , this ) ;

            getEnv ( function ( env ) {
                // Special case for 'chaskor.ru' domain, sends a different init signal.
                if ( w . location . toString ( ) . indexOf ( 'chaskor.ru' ) != -1 ) {
                    env . send ( this , env . json . stringify ( [ '__fxdm_i' ] ) ) ;
                } else {
                    env . send ( this , env . json . stringify ( [ '%init%' ] ) ) ;
                }
                var methods = this . methods ;
                setTimeout ( function ( ) {
                    if ( methods [ 'onInit' ] ) methods [ 'onInit' ] ( ) ;
                } , 0 ) ;
            } , this ) ;
        } ,

        /**
         * Global message handler for incoming XDM messages.
         * Dispatches messages to the appropriate handler based on the key.
         * @param {Event} e The message event object.
         */
        onMessage : function ( e ) {
            if ( ! e . data ) return false ;
            var key = e . data . substr ( 0 , 5 ) ;
            if ( handlers [ key ] ) {
                var self = handlers [ key ] [ 1 ] ;
                if ( self && ( ! self . filter || self . filter ( e . origin ) ) ) {
                    handlers [ key ] [ 0 ] ( e . data . substr ( 6 ) , self ) ;
                }
            }
        } ,

        /**
         * Sets the JSON utility object (parse and stringify methods).
         * @param {Object} json The JSON object.
         */
        setJSON : function ( json ) {
            env . json = json ;
        } ,

        /**
         * Retrieves the JSON utility object.
         * @param {Function} callback Optional callback to receive the JSON object asynchronously.
         * @returns {Object} The JSON object if no callback is provided.
         */
        getJSON : function ( callback ) {
            if ( ! callback ) return env . json ;
            getEnv ( function ( env ) {
                callback ( env . json ) ;
            } ) ;
        } ,

        /**
         * Sets additional environment variables and marks the environment as loaded.
         * @param {Object} exEnv An object containing environment properties to extend.
         */
        setEnv : function ( exEnv ) {
            for ( i in exEnv ) {
                env [ i ] = exEnv [ i ] ;
            }
            envLoaded ( ) ;
        } ,

        _q : {} , // Internal queue for events

        /**
         * Registers an event handler for a given key.
         * If the event has already "run", the action is executed immediately.
         * @param {string} key The event key.
         * @param {Function} act The action (callback) to execute.
         * @param {Object} self The 'this' context for the action.
         */
        on : function ( key , act , self ) {
            if ( ! this . _q [ key ] ) this . _q [ key ] = [] ;
            if ( this . _q [ key ] == -1 ) {
                act . apply ( self ) ;
            } else {
                this . _q [ key ] . push ( [ act , self ] ) ;
            }
        } ,

        /**
         * Executes all registered handlers for a given key and marks the event as "run".
         * @param {string} key The event key.
         */
        run : function ( key ) {
            if ( this . _q [ key ] && this . _q [ key ] . length > 0 ) {
                for ( i = 0 ; i < this . _q [ key ] . length ; i ++ ) {
                    this . _q [ key ] [ i ] [ 0 ] . apply ( this . _q [ key ] [ i ] [ 1 ] ) ;
                }
            }
            this . _q [ key ] = -1 ; // Mark as already run
        } ,

        waitFor : waitFor // Expose the internal waitFor utility
    } ;


    /**
     * Starts the server by attaching to a target iframe's contentWindow.
     * @param {HTMLIFrameElement} obj The iframe element.
     * @param {number} count Internal retry count for older Opera versions.
     */
    w . fastXDM . Server . prototype . start = function ( obj , count ) {
        if ( obj . contentWindow ) {
            this . caller = obj . contentWindow ;
            this . frame = obj ;

            w . fastXDM . on ( 'helper' , function ( ) {
                w . fastXDM . onServerStart ( this ) ;
            } , this ) ;

        } else { // Handle older Opera versions that might not have contentWindow immediately
            var self = this ;
            count = count || 0 ;
            if ( count < 50 ) {
                setTimeout ( function ( ) {
                    self . start . apply ( self , [ obj , count + 1 ] ) ;
                } , 100 ) ;
            }
        }
    }

    /**
     * Destroys the server instance, removing its handler.
     */
    w . fastXDM . Server . prototype . destroy = function ( ) {
        // Note: This splice operation might be incorrect if handlers is an object, not an array.
        // Original code had `handlers.splice(handlers.indexOf(this.key), 1);` which is problematic.
        // Assuming `handlers` is meant to be an object/map, this should probably be `delete handlers[this.key];`
        // However, I must preserve the original code exactly, so I keep the problematic line.
        handlers . splice ( handlers . indexOf ( this . key ) , 1 ) ;
    }

    /**
     * Utility function to extend an object with properties from another object.
     * Performs a shallow merge, but recursively merges nested objects.
     * @param {Object} obj1 The target object to extend.
     * @param {Object} obj2 The source object with properties to add.
     */
    function extend ( obj1 , obj2 ) {
        for ( var i in obj2 ) {
            if ( obj1 [ i ] && typeof ( obj1 [ i ] ) == 'object' ) {
                extend ( obj1 [ i ] , obj2 [ i ] ) ;
            } else {
                obj1 [ i ] = obj2 [ i ] ;
            }
        }
    }

    /**
     * Appends an iframe to a target object, setting up the server for communication.
     * @param {HTMLElement} obj The DOM element to append the iframe to.
     * @param {Object} options Optional attributes to apply to the iframe.
     * @returns {HTMLIFrameElement} The created iframe element.
     */
    w . fastXDM . Server . prototype . append = function ( obj , options ) {
        var div = document . createElement ( 'DIV' ) ;
        div . innerHTML = '<iframe name="' + this . frameName + '" />' ;
        var frame = div . firstChild ;
        var self = this ;
        setTimeout ( function ( ) {
            frame . frameBorder = '0' ;
            if ( options ) extend ( frame , options ) ;
            obj . insertBefore ( frame , obj . firstChild ) ;
            self . start ( frame ) ;
        } , 0 ) ;
        return frame ;
    }

    /**
     * Prototype method for both Server and Client to call a method on the remote peer.
     * Handles serialization of functions into callbacks for remote execution.
     */
    w . fastXDM . Client . prototype . callMethod = w . fastXDM . Server . prototype . callMethod = function ( ) {
        var args = Array . prototype . slice . call ( arguments ) ;
        var method = args . shift ( ) ;
        for ( i in args ) {
            if ( typeof ( args [ i ] ) == 'function' ) {
                this . funcsCount = ( this . funcsCount || 0 ) + 1 ;
                var func = args [ i ] ;
                var funcName = '_func' + this . funcsCount ;
                this . methods [ funcName ] = function ( ) {
                    func . apply ( this , arguments ) ;
                    delete this . methods [ funcName ] ;
                }
                args [ i ] = { _func : this . funcsCount } ;
            }
        }
        waitFor ( this , 'caller' , function ( ) {
            w . fastXDM . on ( this . id , function ( ) {
                getEnv ( function ( env ) {
                    env . send ( this , env . json . stringify ( [ method , args ] ) ) ;
                } , this ) ;
            } , this ) ;
        } , this ) ;
    }

    // --- JSON detection and polyfill loading ---
    if ( w . JSON && typeof ( w . JSON ) == 'object' && w . JSON . parse && w . JSON . stringify && w . JSON . stringify ( { a : [ 1 , 2 , 3 ] } ) . replace ( / / g , '' ) == '{"a":[1,2,3]}' ) {
        env . json = { parse : w . JSON . parse , stringify : w . JSON . stringify } ;
    } else {
        // Mark that JSON polyfill is needed.
        w . fastXDM . _needJSON = true ;
    }

    // --- PostMessage protocol implementation ---
    if ( w . postMessage ) {
        env . protocol = 'p' ; // 'p' for postMessage
        env . send = function ( xdm , strData ) {
            // alert(key+':'+strData); // Original comment, kept as is.
            xdm . caller . postMessage ( xdm . key + ':' + strData , "*" ) ;
        }
        if ( w . addEventListener ) {
            w . addEventListener ( "message" , w . fastXDM . onMessage , false ) ;
        } else {
            w . attachEvent ( "onmessage" , w . fastXDM . onMessage ) ;
        }

        if ( w . fastXDM . _needJSON ) {
            w . fastXDM . _onlyJSON = true ; // Flag for helper script to only load JSON
            attachScript ( ) ; // Load helper script for JSON polyfill
        } else {
            envLoaded ( ) ; // Environment is ready if no JSON polyfill is needed
        }
    } else {
        // Fallback for browsers without postMessage (uses iframe hash communication)
        attachScript ( ) ;
    }

} ) ( window ) ;