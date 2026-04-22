( function ( f ) {

    // Check for CommonJS environment
    if ( typeof exports === "object" && typeof module !== "undefined" ) {

        module.exports = f(); // Export the module

    } else if ( typeof define === "function" && define.amd ) {

        // Check for AMD environment
        define( [], f );

    } else {

        // Browser global
        var g; // Declare global variable

        // Determine the global object
        if ( typeof window !== "undefined" ) {

            g = window; // Assign window if available

        } else if ( typeof global !== "undefined" ) {

            g = global; // Assign global if available

        } else if ( typeof self !== "undefined" ) {

            g = self; // Assign self if available

        } else {

            g = this; // Fallback to 'this'
            // This 'this' refers to the global scope in non-strict mode
            // or undefined in strict mode if not called on an object.
        }

        g.Share = f(); // Assign the factory function result to g.Share
    }

} ) ( function () {

    /*
     * Define module, exports, and define variables for UMD compatibility.
     * These are typically provided by the module loader, but sometimes declared
     * to avoid 'undeclared variable' errors in some environments or linters.
     */
    var define,
        module,
        exports;

    /**
     * Generates CSS styles based on the provided configuration.
     * This function constructs a long string of CSS rules.
     * @param {object} config - Configuration object containing selector and network display settings.
     * @returns {string} A concatenated string of CSS rules.
     */
    function getStyles ( config ) {

        // Start of the CSS string concatenation
        return "" + config.selector + " .social.bottom," + config.selector + " .social.top{" +
               "-webkit-transform-origin:0 0;" + // Webkit transform origin
               "-moz-transform-origin:0 0;" +    // Mozilla transform origin
               "-o-transform-origin:0 0}" +      // Opera transform origin
               config.selector + "{width:92px;height:20px;" + // Main selector dimensions
               "-webkit-touch-callout:none;" +   // Disable callout on touch
               "-webkit-user-select:none;" +     // Disable user selection (webkit)
               "-moz-user-select:none;" +        // Disable user selection (mozilla)
               "-ms-user-select:none;" +         // Disable user selection (IE)
               "user-select:none}" +             // Disable user selection (standard)
               config.selector + " [class*=entypo-]:before{font-family:entypo,sans-serif}" + // Entypo font family
               config.selector + " label{font-size:16px;cursor:pointer;margin:0;padding:5px 10px;" +
               "border-radius:5px;background:#a29baa;color:#333;transition:all .3s ease}" + // Label styling
               config.selector + " label:hover{opacity:.8}" + // Label hover effect
               config.selector + " label span{text-transform:uppercase;font-size:.9em;font-family:Lato,sans-serif;" +
               "font-weight:700;-webkit-font-smoothing:antialiased;padding-left:6px}" + // Label span styling
               config.selector + " .social{opacity:0;transition:all .4s ease;margin-left:-15px;visibility:hidden}" + // Social container styling
               config.selector + " .social.top{-ms-transform-origin:0 0;transform-origin:0 0;margin-top:-80px}" + // Social top specific
               config.selector + " .social.bottom{-ms-transform-origin:0 0;transform-origin:0 0;margin-top:5px}" + // Social bottom specific
               config.selector + " .social.middle.left," + config.selector + " .social.middle.right{" +
               "-ms-transform-origin:5% 50%;transform-origin:5% 50%;" +
               "-webkit-transform-origin:5% 50%;-moz-transform-origin:5% 50%;-o-transform-origin:5% 50%}" + // Social middle origins
               config.selector + " .social.middle{margin-top:-34px}" + // Social middle margin
               config.selector + " .social.middle.right{margin-left:105px}" + // Social middle right margin
               config.selector + " .social.networks-1.center," + config.selector + " .social.networks-1.left," +
               config.selector + " .social.right{margin-left:14px}" + // Social networks-1 and right margins
               config.selector + " .social.load{transition:none!important}" + // Social load transition override
               config.selector + " .social.networks-1{width:60px}" + // Networks-1 width
               config.selector + " .social.networks-1.middle.left{margin-left:-70px}" + // Networks-1 middle left margin
               config.selector + " .social.networks-1 ul{width:60px}" + // Networks-1 ul width
               config.selector + " .social.networks-2," + config.selector + " .social.networks-2 ul{width:120px}" + // Networks-2 widths
               config.selector + " .social.networks-2.center{margin-left:-13px}" + // Networks-2 center margin
               config.selector + " .social.networks-2.left{margin-left:-44px}" + // Networks-2 left margin
               config.selector + " .social.networks-2.middle.left{margin-left:-130px}" + // Networks-2 middle left margin
               config.selector + " .social.networks-3," + config.selector + " .social.networks-3 ul{width:180px}" + // Networks-3 widths
               config.selector + " .social.networks-3.center{margin-left:-45px}" + // Networks-3 center margin
               config.selector + " .social.networks-3.left{margin-left:-102px}" + // Networks-3 left margin
               config.selector + " .social.networks-3.middle.left{margin-left:-190px}" + // Networks-3 middle left margin
               config.selector + " .social.networks-4," + config.selector + " .social.networks-4 ul{width:240px}" + // Networks-4 widths
               config.selector + " .social.networks-4.center{margin-left:-75px}" + // Networks-4 center margin
               config.selector + " .social.networks-4.left{margin-left:162px}" + // Networks-4 left margin
               config.selector + " .social.networks-4.middle.left{margin-left:-250px}" + // Networks-4 middle left margin
               config.selector + " .social.networks-5," + config.selector + " .social.networks-5 ul{width:300px}" + // Networks-5 widths
               config.selector + " .social.networks-5.center{margin-left:-105px}" + // Networks-5 center margin
               config.selector + " .social.networks-5.left{margin-left:-225px}" + // Networks-5 left margin
               config.selector + " .social.networks-5.middle.left{margin-left:-320px}" + // Networks-5 middle left margin
               config.selector + " .social.active{opacity:1;transition:all .4s ease;visibility:visible}" + // Social active state
               config.selector + " .social.active.top{-webkit-transform:scale(1)translateY(-10px);" +
               "-moz-transform:scale(1)translateY(-10px);-o-transform:scale(1)translateY(-10px);" +
               "-ms-transform:scale(1)translateY(-10px);transform:scale(1)translateY(-10px)}" + // Active top transform
               config.selector + " .social.active.bottom{-webkit-transform:scale(1)translateY(15px);" +
               "-moz-transform:scale(1)translateY(15px);-o-transform:scale(1)translateY(15px);" +
               "-ms-transform:scale(1)translateY(15px);transform:scale(1)translateY(15px)}" + // Active bottom transform
               config.selector + " .social.active.middle.right{-webkit-transform:scale(1)translateX(10px);" +
               "-moz-transform:scale(1)translateX(10px);-o-transform:scale(1)translateX(10px);" +
               "-ms-transform:scale(1)translateX(10px);transform:scale(1)translateX(10px)}" + // Active middle right transform
               config.selector + " .social.active.middle.left{-webkit-transform:scale(1)translateX(-10px);" +
               "-moz-transform:scale(1)translateX(-10px);-o-transform:scale(1)translateX(-10px);" +
               "-ms-transform:scale(1)translateX(-10px);transform:scale(1)translateX(-10px)}" + // Active middle left transform
               config.selector + " .social ul{position:relative;left:0;right:0;height:46px;color:#fff;margin:auto;padding:0;list-style:none}" + // Social ul styling
               config.selector + " .social ul li{font-size:20px;cursor:pointer;width:60px;margin:0;padding:12px 0;text-align:center;" +
               "float:left;display:none;height:22px;position:relative;z-index:2;" +
               "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;transition:all .3s ease}" + // Social li styling
               config.selector + " .social ul li:hover{color:rgba(0,0,0,.5)}" + // Social li hover
               config.selector + " .social li[class*=facebook]{background:#3b5998;display:" + config.networks.facebook.display + "}" + // Facebook li styling
               config.selector + " .social li[class*=twitter]{background:#6cdfea;display:" + config.networks.twitter.display + "}" + // Twitter li styling
               config.selector + " .social li[class*=gplus]{background:#e34429;display:" + config.networks.google_plus.display + "}" + // Google Plus li styling
               config.selector + " .social li[class*=pinterest]{background:#c5282f;display:" + config.networks.pinterest.display + "}" + // Pinterest li styling
               config.selector + " .social li[class*=paper-plane]{background:#42c5b0;display:" + config.networks.email.display + "}"; // Email li styling
    };

    var ShareUtils; // Declare ShareUtils variable

    // Polyfill for Element.prototype.classList
    // This block ensures that older browsers (like IE9) that do not natively
    // support classList have a functional equivalent.
    if ( ( ! ( "classList" in document.documentElement ) ) && Object.defineProperty && typeof HTMLElement !== "undefined" ) {

        Object.defineProperty( HTMLElement.prototype, "classList", {

            get : function () {

                var ret,        // Return object for classList
                    self,       // Reference to the current element
                    update;     // Function to update class list

                /**
                 * Creates a function that updates the element's className based on a given operation.
                 * @param {function} fn - The operation function (e.g., push, splice).
                 * @returns {function} A function that takes a value and performs the update.
                 */
                update = function ( fn ) {

                    return function ( value ) {

                        var classes, // Array of class names
                            index;   // Index of the value in the classes array

                        // Split the className string into an array of individual class names.
                        classes = self.className.split( /\s+/ );

                        // Find the index of the value (class name) in the array.
                        index = classes.indexOf( value );

                        // Execute the provided function `fn` with the classes array, index, and value.
                        fn( classes, index, value );

                        // Rejoin the classes array into a string and update the element's className.
                        self.className = classes.join( " " );
                    };
                };

                self = this; // Store reference to the current HTMLElement instance

                // Define the methods for the classList object
                ret = {
                    add : update( function ( classes, index, value ) {
                        // Add a class if it doesn't already exist.
                        ~index || classes.push( value );
                    } ),
                    remove : update( function ( classes, index ) {
                        // Remove a class if it exists.
                        ~index && classes.splice( index, 1 );
                    } ),
                    toggle : update( function ( classes, index, value ) {
                        // Toggle a class: remove if exists, add if not.
                        if ( ~index ) {
                            classes.splice( index, 1 );
                        } else {
                            classes.push( value );
                        }
                    } ),
                    contains : function ( value ) {
                        // Check if a class exists.
                        return !!~self.className.split( /\s+/ ).indexOf( value );
                    },
                    item : function ( i ) {
                        // Get class name by index.
                        return self.className.split( /\s+/ )[ i ] || null;
                    }
                };

                // Define a getter for the 'length' property of the classList object
                Object.defineProperty( ret, "length", {
                    get : function () {
                        return self.className.split( /\s+/ ).length;
                    }
                } );

                return ret; // Return the classList object
            }
        } );
    }

    // Extend String.prototype with a method to encode for RFC3986
    String.prototype.to_rfc3986 = function () {

        var tmp; // Temporary variable to hold encoded string

        // Encode the URI component first
        tmp = encodeURIComponent( this );

        // Replace specific characters that encodeURIComponent doesn't handle for RFC3986
        // '!', '(', ')', '*' are safe in RFC3986 but encoded by encodeURIComponent.
        return tmp.replace( /[!'()*]/g, function ( c ) {
            return "%" + c.charCodeAt( 0 ).toString( 16 ); // Convert character to its hex representation
        } );
    };


    // ShareUtils Class Definition
    ShareUtils = ( function () {

        /**
         * Constructor for ShareUtils.
         * @constructor
         */
        function ShareUtils () {
            // Constructor is empty as there's no state specific to an instance upon creation.
        }

        /**
         * Extends an object with properties from another object.
         * @param {object} to - The target object to extend.
         * @param {object} from - The source object providing properties.
         * @param {boolean} overwrite - If true, existing properties in 'to' will be overwritten.
         */
        ShareUtils.prototype.extend = function ( to, from, overwrite ) {

            var hasProp, // Flag to check if 'to' has a property
                prop;    // Current property name

            // Iterate over properties in the 'from' object
            for ( prop in from ) {

                hasProp = to[ prop ] !== undefined; // Check if the target object already has this property

                // If the property exists in 'to' and is an object, recursively extend it
                if ( hasProp && typeof from[ prop ] === "object" ) {

                    this.extend( to[ prop ], from[ prop ], overwrite );

                } else {

                    // If overwrite is true, or the property doesn't exist in 'to', assign it
                    if ( overwrite || ! hasProp ) {

                        to[ prop ] = from[ prop ]; // Assign the property

                    }
                }
            }
        };

        /**
         * Hides an HTML element by setting its display style to "none".
         * @param {HTMLElement} el - The element to hide.
         * @returns {string} The new display style value ("none").
         */
        ShareUtils.prototype.hide = function ( el ) {
            return el.style.display = "none";
        };

        /**
         * Shows an HTML element by setting its display style to "block".
         * @param {HTMLElement} el - The element to show.
         * @returns {string} The new display style value ("block").
         */
        ShareUtils.prototype.show = function ( el ) {
            return el.style.display = "block";
        };

        /**
         * Checks if an HTML element has a specific CSS class.
         * @param {HTMLElement} el - The element to check.
         * @param {string} class_name - The class name to look for.
         * @returns {boolean} True if the element has the class, false otherwise.
         */
        ShareUtils.prototype.has_class = function ( el, class_name ) {
            return el.classList.contains( class_name );
        };

        /**
         * Adds a CSS class to an HTML element.
         * @param {HTMLElement} el - The element to modify.
         * @param {string} class_name - The class name to add.
         */
        ShareUtils.prototype.add_class = function ( el, class_name ) {
            return el.classList.add( class_name );
        };

        /**
         * Removes a CSS class from an HTML element.
         * @param {HTMLElement} el - The element to modify.
         * @param {string} class_name - The class name to remove.
         */
        ShareUtils.prototype.remove_class = function ( el, class_name ) {
            return el.classList.remove( class_name );
        };

        /**
         * Checks if a string is already RFC3986 encoded.
         * @param {string} str - The string to check.
         * @returns {boolean} True if encoded, false otherwise.
         */
        ShareUtils.prototype.is_encoded = function ( str ) {
            var temp_str;
            temp_str = str.to_rfc3986(); // Attempt to encode it
            return decodeURIComponent( temp_str ) !== temp_str; // If decoding it doesn't yield the original, it was encoded.
        };

        /**
         * Encodes a string using RFC3986 if it's not already encoded.
         * @param {string} str - The string to encode.
         * @returns {string} The encoded string, or the original if already encoded or undefined.
         */
        ShareUtils.prototype.encode = function ( str ) {

            if ( typeof str === "undefined" || this.is_encoded( str ) ) {
                return str; // Return as is if undefined or already encoded
            } else {
                return str.to_rfc3986(); // Encode if not already
            }
        };

        /**
         * Opens a popup window with the specified URL and parameters.
         * @param {string} url - The base URL for the popup.
         * @param {object} [params={}] - An object of key-value pairs for URL query parameters.
         * @returns {Window} The new window object.
         */
        ShareUtils.prototype.popup = function ( url, params ) {

            var k,       // Key for parameters
                popup,   // Popup window dimensions and position
                qs,      // Query string
                v;       // Value for parameters

            // Initialize params if not provided
            if ( params == null ) {
                params = {};
            }

            // Default popup dimensions
            popup = {
                width : 500,
                height : 350
            };

            // Calculate center position
            popup.top = ( screen.height / 2 ) - ( popup.height / 2 );
            popup.left = ( screen.width / 2 ) - ( popup.width / 2 );

            // Build query string from parameters
            qs = ( ( function () {

                var results; // Array to hold individual query parameter strings

                results = [];

                // Iterate through parameters and encode values
                for ( k in params ) {
                    v = params[ k ];
                    results.push( k + "=" + ( this.encode( v ) ) );
                }

                return results;

            } ).call( this ) ).join( '&' ); // Join them with '&'

            // Prepend '?' if query string exists
            if ( qs ) {
                qs = "?" + qs;
            }

            // Open the popup window
            return window.open( url + qs, 'targetWindow',
                                "toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes," +
                                "left=" + popup.left + ",top=" + popup.top + ",width=" + popup.width + ",height=" + popup.height );
        };

        return ShareUtils; // Return the ShareUtils constructor

    } )();


    // Helper functions for class inheritance (CoffeeScript style)
    var Share, // Declare Share class variable

        // extend function for prototypal inheritance
        extend = function ( child, parent ) {
            for ( var key in parent ) {
                if ( hasProp.call( parent, key ) ) {
                    child[ key ] = parent[ key ];
                }
            }

            function ctor () {
                this.constructor = child;
            }

            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        },

        // hasProp for checking own properties
        hasProp = {}.hasOwnProperty;


    // Share Class Definition, extending ShareUtils
    Share = ( function ( superClass ) {

        extend( Share, superClass ); // Apply inheritance

        /**
         * Share constructor.
         * @param {string} element1 - CSS selector for the share button elements.
         * @param {object} options - Configuration options.
         * @constructor
         */
        function Share ( element1, options ) {

            // Store the element selector
            this.element = element1;

            // Cache DOM elements for head and body
            this.el = {
                head : document.getElementsByTagName( 'head' )[ 0 ],
                body : document.getElementsByTagName( 'body' )[ 0 ]
            };

            // Default configuration settings
            this.config = {
                enabled_networks : 0, // Counter for enabled networks

                // Determine protocol (http/https)
                protocol : [ 'http', 'https' ].indexOf( window.location.href.split( ':' )[ 0 ] ) === -1 ? 'https://' : '//',

                url : window.location.href, // Default URL to share
                caption : null,             // Default caption
                title : this.default_title(),         // Default title from meta tags
                image : this.default_image(),         // Default image from meta tags
                description : this.default_description(), // Default description from meta tags

                ui : {
                    flyout : 'top center', // Flyout position
                    button_text : 'Share', // Text on the share button
                    button_font : true,    // Whether to inject button font
                    icon_font : true       // Whether to inject icon font
                },

                networks : {
                    google_plus : {
                        enabled : true,
                        url : null
                    },
                    twitter : {
                        enabled : true,
                        url : null,
                        description : null
                    },
                    facebook : {
                        enabled : true,
                        load_sdk : true, // Whether to load Facebook SDK
                        url : null,
                        app_id : null,
                        title : null,
                        caption : null,
                        description : null,
                        image : null
                    },
                    pinterest : {
                        enabled : true,
                        url : null,
                        image : null,
                        description : null
                    },
                    email : {
                        enabled : true,
                        title : null,
                        description : null
                    }
                }
            };

            // Set up the instance with provided options
            this.setup( this.element, options );

            return this; // Return the instance
        }

        /**
         * Sets up the share buttons.
         * @param {string} element - CSS selector for the elements.
         * @param {object} opts - Options to extend the default configuration.
         */
        Share.prototype.setup = function ( element, opts ) {

            var i,        // Loop counter
                index,    // Index in loop
                instance, // Current DOM element instance
                instances, // All matching DOM elements
                len;      // Length of instances array

            instances = document.querySelectorAll( element ); // Get all elements matching the selector

            this.extend( this.config, opts, true ); // Extend default config with user options, overwriting existing

            this.set_global_configuration();       // Apply global network configuration
            this.normalize_network_configuration(); // Normalize network specific configurations

            // Inject icon font if enabled
            if ( this.config.ui.icon_font ) {
                this.inject_icons();
            }

            // Inject button font if enabled
            if ( this.config.ui.button_font ) {
                this.inject_fonts();
            }

            // Inject Facebook SDK if enabled and configured
            if ( this.config.networks.facebook.enabled && this.config.networks.facebook.load_sdk ) {
                this.inject_facebook_sdk();
            }

            // Loop through each instance and set it up
            for ( index = i = 0, len = instances.length; i < len; index = ++i ) {
                instance = instances[ index ];
                this.setup_instance( element, index ); // Setup individual instance
            }
        };

        /**
         * Sets up a single share button instance.
         * @param {string} element - The CSS selector used to find instances.
         * @param {number} index - The index of the specific instance in the querySelectorAll result.
         */
        Share.prototype.setup_instance = function ( element, index ) {

            var _this,      // Reference to 'this' for event listeners
                button,     // The social button container
                i,          // Loop counter
                instance,   // The current share button DOM element
                label,      // The label element within the share button
                len,        // Length of networks array
                network,    // Current network li element
                networks,   // List of network li elements
                results;    // Array to hold event listener results

            // Select the specific instance
            instance = document.querySelectorAll( element )[ index ];

            this.hide( instance ); // Hide it initially

            // Add a unique class for this instance
            this.add_class( instance, "sharer-" + index );

            // Re-select the instance to ensure it has the new class for CSS injection
            instance = document.querySelectorAll( element )[ index ];

            this.inject_css( instance );  // Inject CSS for this instance
            this.inject_html( instance ); // Inject HTML structure

            this.show( instance );        // Show the instance after setup

            // Get references to key elements
            label = instance.getElementsByTagName( "label" )[ 0 ];
            button = instance.getElementsByClassName( "social" )[ 0 ];
            networks = instance.getElementsByTagName( 'li' );

            // Add class indicating number of enabled networks
            this.add_class( button, "networks-" + this.config.enabled_networks );

            // Add click listener to the label to toggle the social buttons
            label.addEventListener( "click", ( function ( _this ) {
                return function () {
                    return _this.event_toggle( button );
                };
            } )( this ) );

            _this = this; // Store 'this' for use in event listener closure
            results = [];

            // Add click listeners to each network button
            for ( index = i = 0, len = networks.length; i < len; index = ++i ) {
                network = networks[ index ];
                results.push( network.addEventListener( "click", function () {
                    _this.event_network( instance, this ); // Handle network click
                    return _this.event_close( button );   // Close the flyout after clicking a network
                } ) );
            }

            return results; // Return the results of adding event listeners
        };

        /**
         * Toggles the active state of the social button flyout.
         * @param {HTMLElement} button - The social button container element.
         */
        Share.prototype.event_toggle = function ( button ) {

            if ( this.has_class( button, "active" ) ) {
                return this.event_close( button ); // If active, close it
            } else {
                return this.event_open( button );  // If not active, open it
            }
        };

        /**
         * Opens the social button flyout.
         * @param {HTMLElement} button - The social button container element.
         */
        Share.prototype.event_open = function ( button ) {

            if ( this.has_class( button, "load" ) ) {
                this.remove_class( button, "load" ); // Remove 'load' class if present
            }
            return this.add_class( button, "active" ); // Add 'active' class
        };

        /**
         * Closes the social button flyout.
         * @param {HTMLElement} button - The social button container element.
         */
        Share.prototype.event_close = function ( button ) {
            return this.remove_class( button, "active" ); // Remove 'active' class
        };

        /**
         * Handles the click event for a specific network button.
         * Calls before/after hooks and the network-specific sharing function.
         * @param {HTMLElement} instance - The parent share button instance.
         * @param {HTMLElement} network - The clicked network list item element.
         */
        Share.prototype.event_network = function ( instance, network ) {

            var name; // Name of the network

            name = network.getAttribute( "data-network" ); // Get network name from data attribute

            this.hook( "before", name, instance ); // Call 'before' hook

            this[ "network_" + name ](); // Call the specific network sharing method

            return this.hook( "after", name, instance ); // Call 'after' hook
        };

        /**
         * Public method to open all share button flyouts.
         */
        Share.prototype.open = function () {
            return this[ "public" ]( "open" );
        };

        /**
         * Public method to close all share button flyouts.
         */
        Share.prototype.close = function () {
            return this[ "public" ]( "close" );
        };

        /**
         * Public method to toggle all share button flyouts.
         */
        Share.prototype.toggle = function () {
            return this[ "public" ]( "toggle" );
        };

        /**
         * Executes a given action ('open', 'close', 'toggle') on all share button instances.
         * @param {string} action - The action to perform.
         */
        Share.prototype[ "public" ] = function ( action ) {

            var button,   // The social button container
                i,        // Loop counter
                index,    // Index in loop
                instance, // Current DOM element instance
                len,      // Length of ref array
                ref,      // Reference to all instances
                results;  // Array to hold results

            ref = document.querySelectorAll( this.element ); // Get all instances

            results = [];

            // Loop through each instance and apply the action
            for ( index = i = 0, len = ref.length; i < len; index = ++i ) {
                instance = ref[ index ];
                button = instance.getElementsByClassName( "social" )[ 0 ];
                results.push( this[ "event_" + action ]( button ) ); // Call the corresponding event handler
            }

            return results;
        };

        /**
         * Shares content on Facebook.
         * Uses FB.ui if SDK is loaded, otherwise falls back to a popup.
         */
        Share.prototype.network_facebook = function () {

            if ( this.config.networks.facebook.load_sdk ) {
                if ( ! window.FB ) {
                    // Log an error if SDK is expected but not loaded
                    return console.error( "The Facebook JS SDK hasn't loaded yet." );
                }
                // Use Facebook SDK's UI method
                return FB.ui( {
                    method : 'feed',
                    name : this.config.networks.facebook.title,
                    link : this.config.networks.facebook.url,
                    picture : this.config.networks.facebook.image,
                    caption : this.config.networks.facebook.caption,
                    description : this.config.networks.facebook.description
                } );
            } else {
                // Fallback to direct sharer URL in a popup
                return this.popup( 'https://www.facebook.com/sharer/sharer.php', {
                    u : this.config.networks.facebook.url
                } );
            }
        };

        /**
         * Shares content on Twitter via a popup.
         */
        Share.prototype.network_twitter = function () {
            return this.popup( 'https://twitter.com/intent/tweet', {
                text : this.config.networks.twitter.description,
                url : this.config.networks.twitter.url
            } );
        };

        /**
         * Shares content on Google Plus via a popup.
         */
        Share.prototype.network_google_plus = function () {
            return this.popup( 'https://plus.google.com/share', {
                url : this.config.networks.google_plus.url
            } );
        };

        /**
         * Shares content on Pinterest via a popup.
         */
        Share.prototype.network_pinterest = function () {
            return this.popup( 'https://www.pinterest.com/pin/create/button', {
                url : this.config.networks.pinterest.url,
                media : this.config.networks.pinterest.image,
                description : this.config.networks.pinterest.description
            } );
        };

        /**
         * Shares content via email (opens mailto link in a popup).
         */
        Share.prototype.network_email = function () {
            return this.popup( 'mailto:', {
                subject : this.config.networks.email.title,
                body : this.config.networks.email.description
            } );
        };

        /**
         * Injects the Entypo icon font stylesheet.
         */
        Share.prototype.inject_icons = function () {
            return this.inject_stylesheet( "https://www.sharebutton.co/fonts/v2/entypo.min.css" );
        };

        /**
         * Injects the Lato font stylesheet for the button text.
         */
        Share.prototype.inject_fonts = function () {
            return this.inject_stylesheet( "https://fonts.googleapis.com/css?family=Lato:900&text=" + this.config.ui.button_text );
        };

        /**
         * Injects a stylesheet into the document head if it's not already present.
         * @param {string} url - The URL of the stylesheet.
         */
        Share.prototype.inject_stylesheet = function ( url ) {

            var link; // Link element

            // Check if stylesheet already exists
            if ( ! this.el.head.querySelector( "link[href=\"" + url + "\"]" ) ) {
                link = document.createElement( "link" ); // Create link element
                link.setAttribute( "rel", "stylesheet" );   // Set rel attribute
                link.setAttribute( "href", url );           // Set href attribute
                return this.el.head.appendChild( link );    // Append to head
            }
        };

        /**
         * Injects dynamic CSS rules for a specific share button instance.
         * @param {HTMLElement} instance - The share button DOM element.
         */
        Share.prototype.inject_css = function ( instance ) {

            var css,      // Generated CSS string
                meta,     // Meta element to mark CSS injection
                selector, // CSS selector for the instance
                style;    // Style element

            // Create a unique selector based on the instance's classes
            selector = "." + ( instance.getAttribute( 'class' ).split( " " ).join( "." ) );

            // Check if CSS for this selector has already been injected
            if ( ! this.el.head.querySelector( "meta[name='sharer" + selector + "']" ) ) {
                this.config.selector = selector; // Temporarily set selector in config for getStyles

                css = getStyles( this.config ); // Get the generated CSS

                style = document.createElement( "style" ); // Create style element
                style.type = "text/css"; // Set type

                // Handle IE specific stylesheet injection
                if ( style.styleSheet ) {
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild( document.createTextNode( css ) ); // Append CSS text
                }

                this.el.head.appendChild( style ); // Append style element to head

                delete this.config.selector; // Remove temporary selector from config

                // Add a meta tag to mark that CSS has been injected for this selector
                meta = document.createElement( "meta" );
                meta.setAttribute( "name", "sharer" + selector );
                return this.el.head.appendChild( meta );
            }
        };

        /**
         * Injects the HTML structure for the share button and its flyout.
         * @param {HTMLElement} instance - The share button DOM element.
         */
        Share.prototype.inject_html = function ( instance ) {

            // Set innerHTML with the button label and social network list
            return instance.innerHTML = "<label class='entypo-export'><span>" + this.config.ui.button_text + "</span></label>" +
                                       "<div class='social load " + this.config.ui.flyout + "'>" +
                                       "<ul>" +
                                       "<li class='entypo-pinterest' data-network='pinterest'></li>" +
                                       "<li class='entypo-twitter' data-network='twitter'></li>" +
                                       "<li class='entypo-facebook' data-network='facebook'></li>" +
                                       "<li class='entypo-gplus' data-network='google_plus'></li>" +
                                       "<li class='entypo-paper-plane' data-network='email'></li>" +
                                       "</ul>" +
                                       "</div>";
        };

        /**
         * Injects the Facebook JavaScript SDK if not already present and configured.
         */
        Share.prototype.inject_facebook_sdk = function () {

            var fb_root, // #fb-root div element
                script;  // Script element for SDK

            // Only inject if FB object is not present, app_id is configured, and #fb-root doesn't exist
            if ( ! window.FB && this.config.networks.facebook.app_id && ! this.el.body.querySelector( '#fb-root' ) ) {

                script = document.createElement( "script" ); // Create script element
                script.text = "window.fbAsyncInit=function(){FB.init({appId:'" + this.config.networks.facebook.app_id + "',status:true,xfbml:true})};" +
                              "(function(e,t,n){var r,i=e.getElementsByTagName(t)[0];if(e.getElementById(n)){return}r=e.createElement(t);r.id=n;r.src='" +
                              this.config.protocol + "connect.facebook.net/en_US/all.js';i.parentNode.insertBefore(r,i)})(document,'script','facebook-jssdk')";

                fb_root = document.createElement( "div" ); // Create #fb-root div
                fb_root.id = "fb-root";

                this.el.body.appendChild( fb_root );  // Append #fb-root to body
                return this.el.body.appendChild( script ); // Append SDK script to body
            }
        };

        /**
         * Executes a hook function (before/after) for a specific network.
         * Allows customization of network configuration before or after sharing.
         * @param {string} type - The type of hook ('before' or 'after').
         * @param {string} network - The name of the network.
         * @param {HTMLElement} instance - The share button instance.
         */
        Share.prototype.hook = function ( type, network, instance ) {

            var fn,   // The hook function
                opts; // Options returned by the hook function

            fn = this.config.networks[ network ][ type ]; // Get the hook function from config

            if ( typeof fn === "function" ) {
                opts = fn.call( this.config.networks[ network ], instance ); // Execute hook function

                if ( opts !== void 0 ) {
                    opts = this.normalize_filter_config_updates( opts ); // Normalize any updates from the hook
                    this.extend( this.config.networks[ network ], opts, true ); // Apply updates to network config
                    this.normalize_network_configuration(); // Re-normalize global network config
                }
            }
        };

        /**
         * Retrieves the default title from meta tags or the document title.
         * @returns {string|null} The default title or null if not found.
         */
        Share.prototype.default_title = function () {

            var content; // Content element

            // Try to get title from Open Graph or Twitter meta tags
            if ( content = document.querySelector( 'meta[property="og:title"]' ) || document.querySelector( 'meta[name="twitter:title"]' ) ) {
                return content.getAttribute( 'content' );
            } else if ( content = document.querySelector( 'title' ) ) {
                // Fallback to document title
                return content.innerText;
            }
            return null; // No title found
        };

        /**
         * Retrieves the default image URL from meta tags.
         * @returns {string|null} The default image URL or null if not found.
         */
        Share.prototype.default_image = function () {

            var content; // Content element

            // Try to get image from Open Graph or Twitter meta tags
            if ( content = document.querySelector( 'meta[property="og:image"]' ) || document.querySelector( 'meta[name="twitter:image"]' ) ) {
                return content.getAttribute( 'content' );
            }
            return null; // No image found
        };

        /**
         * Retrieves the default description from meta tags.
         * @returns {string} The default description or an empty string if not found.
         */
        Share.prototype.default_description = function () {

            var content; // Content element

            // Try to get description from Open Graph, Twitter, or standard meta tags
            if ( content = document.querySelector( 'meta[property="og:description"]' ) || document.querySelector( 'meta[name="twitter:description"]' ) || document.querySelector( 'meta[name="description"]' ) ) {
                return content.getAttribute( 'content' );
            } else {
                return ''; // Return empty string if no description found
            }
        };

        /**
         * Sets global configuration for networks, such as default values and enabled status.
         */
        Share.prototype.set_global_configuration = function () {

            var display,   // CSS display property value
                network,   // Network name
                option,    // Option name
                options,   // Network specific options
                ref,       // Reference to networks config
                results;   // Array to hold results

            ref = this.config.networks; // Get networks configuration

            results = [];

            // Iterate through each network
            for ( network in ref ) {
                options = ref[ network ];

                // Inherit global options if not defined for a specific network
                for ( option in options ) {
                    if ( this.config.networks[ network ][ option ] == null ) {
                        this.config.networks[ network ][ option ] = this.config[ option ];
                    }
                }

                // Determine display style and count enabled networks
                if ( this.config.networks[ network ].enabled ) {
                    display = 'block';
                    this.config.enabled_networks += 1;
                } else {
                    display = 'none';
                }
                results.push( this.config.networks[ network ].display = display ); // Set display property
            }
            return results;
        };

        /**
         * Normalizes network-specific configurations, such as encoding and type conversions.
         */
        Share.prototype.normalize_network_configuration = function () {

            // Disable Facebook SDK loading if app_id is not provided
            if ( ! this.config.networks.facebook.app_id ) {
                this.config.networks.facebook.load_sdk = false;
            }

            // Encode Twitter description if not already encoded
            if ( ! this.is_encoded( this.config.networks.twitter.description ) ) {
                this.config.networks.twitter.description = encodeURIComponent( this.config.networks.twitter.description );
            }

            // Convert Facebook app_id to string if it's a number
            if ( typeof this.config.networks.facebook.app_id === 'number' ) {
                return this.config.networks.facebook.app_id = this.config.networks.facebook.app_id.toString();
            }
        };

        /**
         * Filters configuration updates from hooks, preventing changes to properties
         * that cannot be altered after initialization (e.g., Facebook app_id).
         * @param {object} opts - The options object returned by a hook.
         * @returns {object} The filtered options object.
         */
        Share.prototype.normalize_filter_config_updates = function ( opts ) {

            // Warn and prevent changes to Facebook app_id
            if ( this.config.networks.facebook.app_id !== opts.app_id ) {
                console.warn( "You are unable to change the Facebook app_id after the button has been initialized. Please update your Facebook filters accordingly." );
                delete opts.app_id;
            }

            // Warn and prevent changes to Facebook load_sdk option
            if ( this.config.networks.facebook.load_sdk !== opts.load_sdk ) {
                console.warn( "You are unable to change the Facebook load_sdk option after the button has been initialized. Please update your Facebook filters accordingly." );
                delete opts.app_id; // Note: This should probably be delete opts.load_sdk
            }
            return opts;
        };

        return Share; // Return the Share constructor

    } ) ( ShareUtils ); // Pass ShareUtils as the superClass

    return Share; // The factory function returns the Share class
} );