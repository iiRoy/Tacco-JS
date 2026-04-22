/**
 *  !
 *  @file         jquery.transit.js
 *  @brief        jQuery Transit - CSS3 transitions and transformations library.
 *
 *  @copyright    (c) 2011 Rico Sta. Cruz <rico@ricostacruz.com>
 *  @license      MIT Licensed.
 *
 *  @link         http://ricostacruz.com/jquery.transit
 *  @link         http://github.com/rstacruz/jquery.transit
 *
 *  @version      0.1.3
 *
 *  @reviewer     Simon SER (for compatibility with jQuery 1.8.2)
 */

( function ( $ ) {

    "use strict"; /* Enforce strict mode for better code quality */

    // Initialize the main transit object within jQuery's namespace
    $.transit = {
        version: "0.1.3", // Current version of the library

        /*
         *  @property {Object} propertyMap
         *  A map of $.css() keys to their corresponding 'transitionProperty' values.
         *  This helps normalize property names for CSS transitions.
         *  For a comprehensive list of animatable properties, see:
         *  https://developer.mozilla.org/en/CSS/CSS_transitions#Properties_that_can_be_animated
         */
        propertyMap: {
            marginLeft    : 'margin',
            marginRight   : 'margin',
            marginBottom  : 'margin',
            marginTop     : 'margin',
            paddingLeft   : 'padding',
            paddingRight  : 'padding',
            paddingBottom : 'padding',
            paddingTop    : 'padding'
        },

        // If set to 'false', transitions will occur instantly without animation.
        enabled: true,

        /*
         *  @property {boolean} useTransitionEnd
         *  Controls whether the 'transitionend' event is utilized.
         *  Set to 'false' to disable its use, potentially relying on timeouts instead.
         */
        useTransitionEnd: false
    };

    // Create a temporary div element to detect browser capabilities.
    var div     = document.createElement( 'div' );
    var support = {}; // Object to store detected CSS feature support

    /**
     *  @function getVendorPropertyName
     *  @param {string} prop - The CSS property name (e.g., 'transition').
     *  @returns {string|undefined} The vendor-prefixed property name if supported,
     *                              or the original property name if no prefix is needed,
     *                              or undefined if not supported.
     *  Helper function to retrieve the correct vendor-prefixed CSS property name.
     *  For example, 'transition' might become 'WebkitTransition'.
     */
    function getVendorPropertyName ( prop ) {
        var prefixes = [ 'Moz', 'Webkit', 'O', 'ms' ]; // Common vendor prefixes
        var prop_    = prop.charAt( 0 ).toUpperCase() + prop.substr( 1 ); // Capitalize first letter

        // Check if the unprefixed property is directly supported
        if ( prop in div.style ) {
            return prop;
        }

        // Iterate through prefixes to find a supported vendor-prefixed property
        for ( var i = 0; i < prefixes.length; ++i ) {
            var vendorProp = prefixes[ i ] + prop_;
            if ( vendorProp in div.style ) {
                return vendorProp;
            }
        }
        return undefined; // Property not supported with any known prefix
    }

    /**
     *  @function checkTransform3dSupport
     *  @returns {boolean} True if CSS 3D transforms are supported, false otherwise.
     *  Helper function to determine if the browser supports 3D transforms.
     *  This typically returns true for Webkit browsers and Firefox 10+.
     */
    function checkTransform3dSupport () {
        div.style[ support.transform ] = ''; // Clear any existing transform
        div.style[ support.transform ] = 'rotateY(90deg)'; // Apply a 3D transform
        // If the style property is still set, 3D transforms are supported.
        return div.style[ support.transform ] !== '';
    }

    // Check if the user agent string indicates Chrome browser.
    var isChrome = navigator.userAgent.toLowerCase().indexOf( 'chrome' ) > -1;

    /*
     *  Check for the browser's transition support.
     *  The results are stored in jQuery's `$.support` object.
     *  As per jQuery's cssHooks documentation (http://api.jquery.com/jQuery.cssHooks/),
     *  `$.support.transition` will hold the actual property name used (e.g., 'WebkitTransition').
     */
    support.transition      = getVendorPropertyName( 'transition' );
    support.transitionDelay = getVendorPropertyName( 'transitionDelay' );
    support.transform       = getVendorPropertyName( 'transform' );
    support.transformOrigin = getVendorPropertyName( 'transformOrigin' );
    support.transform3d     = checkTransform3dSupport(); // Detect 3D transform support

    // Extend jQuery's support object with our detected features.
    $.extend( $.support, support );

    // Mapping of vendor-prefixed transition property names to their corresponding 'transitionend' event names.
    var eventNames = {
        'MozTransition':    'transitionend',
        'OTransition':      'oTransitionEnd',
        'WebkitTransition': 'webkitTransitionEnd',
        'msTransition':     'MSTransitionEnd'
    };

    // Determine the correct 'transitionend' event name for the current browser.
    // This will be null if transitions are not supported.
    var transitionEnd = support.transitionEnd = eventNames[ support.transition ] || null;

    // Clean up the temporary div to prevent memory leaks, especially in older IE.
    div = null;

    /*
     *  ## $.cssEase
     *  A collection of easing aliases that can be used with `$.fn.transition`.
     *  These provide convenient shortcuts for common CSS easing functions.
     */
    $.cssEase = {
        '_default': 'ease',
        'in':       'ease-in',
        'out':      'ease-out',
        'in-out':   'ease-in-out',
        'snap':     'cubic-bezier(0,1,.5,1)' // Custom cubic-bezier for a 'snap' effect
    };

    /*
     *  ## 'transform' CSS hook
     *  This hook enables the use of the `transform` CSS property directly in jQuery's `.css()` method.
     *
     *  Usage examples:
     *  $("#hello").css({ transform: "rotate(90deg) scale(2)" });
     *
     *  To retrieve the current transform:
     *  $("#hello").css('transform');
     *  // Returns a Transform object, e.g., { rotate: '90deg', scale: '2,2' }
     */
    $.cssHooks.transform = {
        // The getter function returns a `Transform` object instance.
        get: function ( elem ) {
            return $( elem ).data( 'transform' );
        },

        // The setter function accepts either a `Transform` object or a string.
        set: function ( elem, v ) {
            var value = v;

            // If the value is not already a Transform object, create one.
            if ( !( value instanceof Transform ) ) {
                value = new Transform( value );
            }

            // Special handling for WebkitTransform in Chrome:
            // We've observed that the 3D version of `scale()` may not work correctly
            // in Chrome when the scaled element extends outside the viewport.
            // Therefore, we force Chrome to use 2D transforms for `scale` (and `translate`).
            // Detection code for Chrome is from http://davidwalsh.name/detecting-google-chrome-javascript.
            if ( support.transform === 'WebkitTransform' && !isChrome ) {
                elem.style[ support.transform ] = value.toString( true ); // Use 3D version for Webkit (if not Chrome)
            } else {
                elem.style[ support.transform ] = value.toString(); // Use 2D version or standard
            }

            // Store the Transform object in the element's data for later retrieval.
            $( elem ).data( 'transform', value );
        }
    };

    /*
     *  ## 'transformOrigin' CSS hook
     *  This hook allows the use of the `transformOrigin` property in jQuery.
     *  It defines the point around which transformations (like scaling and rotation) are pivoted.
     *
     *  Usage example:
     *  $("#hello").css({ transformOrigin: '0 0' }); // Sets the origin to the top-left corner
     */
    $.cssHooks.transformOrigin = {
        get: function ( elem ) {
            return elem.style[ support.transformOrigin ];
        },
        set: function ( elem, value ) {
            elem.style[ support.transformOrigin ] = value;
        }
    };

    /*
     *  ## 'transition' CSS hook
     *  This hook enables the direct use of the `transition` CSS property in jQuery.
     *
     *  Usage example:
     *  $("#hello").css({ transition: 'all 0.5s ease-out 0.1s' });
     */
    $.cssHooks.transition = {
        get: function ( elem ) {
            return elem.style[ support.transition ];
        },
        set: function ( elem, value ) {
            elem.style[ support.transition ] = value;
        }
    };

    /*
     *  ## Other CSS hooks for individual transform properties
     *  These hooks allow direct manipulation of individual transform components
     *  such as `rotate`, `scale`, `translate`, `skew`, `perspective`, `x`, and `y`.
     *  They simplify setting complex transform properties.
     */
    registerCssHook( 'scale' );
    registerCssHook( 'translate' );
    registerCssHook( 'rotate' );
    registerCssHook( 'rotateX' );
    registerCssHook( 'rotateY' );
    registerCssHook( 'rotate3d' );
    registerCssHook( 'perspective' );
    registerCssHook( 'skewX' );
    registerCssHook( 'skewY' );
    registerCssHook( 'x', true ); // 'x' is an alias for translateX, and is an absolute value
    registerCssHook( 'y', true ); // 'y' is an alias for translateY, and is an absolute value

    /*
     *  ## Transform class
     *  This is the core class that manages transformation properties.
     *  It powers the `$.fn.css({ transform: '...' })` functionality.
     *
     *  Essentially, it's a dictionary-like object that holds key-value pairs
     *  representing individual CSS transform components.
     *
     *  Example:
     *  var t = new Transform("rotate(90) scale(4)");
     *
     *  Accessing properties:
     *  t.rotate             //=> "90deg"
     *  t.scale              //=> "4,4"
     *
     *  Setters are also available:
     *  t.set('rotate', 4)
     *  t.rotate             //=> "4deg"
     *
     *  Conversion to CSS string:
     *  t.toString()         //=> "rotate(90deg) scale(4,4)"
     *  t.toString(true)     //=> "rotate(90deg) scale3d(4,4,0)" (This is the WebKit-specific 3D version)
     */
    function Transform ( str ) {
        if ( typeof str === 'string' ) {
            this.parse( str ); // Parse the string if provided in the constructor
        }
        return this; // Return the Transform instance
    }

    Transform.prototype = {
        /*
         *  ### setFromString()
         *  Sets a transformation property from a string value.
         *
         *  Example:
         *  t.setFromString('scale', '2,4');
         *  // This is equivalent to calling set('scale', '2', '4');
         */
        setFromString: function ( prop, val ) {
            var args =
                ( typeof val === 'string' ) ? val.split( ',' ) : // If string, split by comma
                ( val.constructor === Array ) ? val : // If array, use as is
                [ val ]; // Otherwise, wrap in an array

            args.unshift( prop ); // Add the property name to the beginning of the arguments array

            // Call the 'set' method with the prepared arguments.
            Transform.prototype.set.apply( this, args );
        },

        /*
         *  ### set()
         *  Sets a specific transformation property with one or more values.
         *
         *  Example:
         *  t.set('scale', 2, 4); // Sets scaleX to 2 and scaleY to 4
         */
        set: function ( prop ) {
            var args = Array.prototype.slice.apply( arguments, [ 1 ] ); // Get arguments starting from the second one (the values)
            if ( this.setter[ prop ] ) {
                this.setter[ prop ].apply( this, args ); // If a custom setter exists, use it
            } else {
                this[ prop ] = args.join( ',' ); // Otherwise, store values as a comma-separated string
            }
        },

        /*
         *  ### get()
         *  Retrieves the value of a transformation property.
         *
         *  Example:
         *  t.get('rotate'); // Returns "90deg"
         */
        get: function ( prop ) {
            if ( this.getter[ prop ] ) {
                return this.getter[ prop ].apply( this ); // If a custom getter exists, use it
            } else {
                return this[ prop ] || 0; // Otherwise, return the stored value or 0 if undefined
            }
        },

        // Object containing custom setter functions for specific transform properties.
        setter: {
            /*
             *  ### rotate
             *  Sets the rotation angle. Automatically appends 'deg' unit if not present.
             *
             *  Examples:
             *  .css({ rotate: 30 })      //=> 30deg
             *  .css({ rotate: "30" })     //=> 30deg
             *  .css({ rotate: "30deg" })  //=> 30deg
             */
            rotate: function ( theta ) {
                this.rotate = unit( theta, 'deg' );
            },

            rotateX: function ( theta ) {
                this.rotateX = unit( theta, 'deg' );
            },

            rotateY: function ( theta ) {
                this.rotateY = unit( theta, 'deg' );
            },

            /*
             *  ### scale
             *  Sets the scaling factor. If only one value is provided, it's used for both X and Y.
             *
             *  Examples:
             *  .css({ scale: 9 })      //=> "scale(9,9)"
             *  .css({ scale: '3,2' })  //=> "scale(3,2)"
             */
            scale: function ( x, y ) {
                if ( y === undefined ) {
                    y = x; // If y is not provided, use x for both dimensions
                }
                this.scale = x + "," + y;
            },

            /*
             *  ### skewX + skewY
             *  Sets the skew angle along the X or Y axis.
             */
            skewX: function ( x ) {
                this.skewX = unit( x, 'deg' );
            },

            skewY: function ( y ) {
                this.skewY = unit( y, 'deg' );
            },

            /*
             *  ### perspective
             *  Sets the perspective value for 3D transforms.
             */
            perspective: function ( dist ) {
                this.perspective = unit( dist, 'px' );
            },

            /*
             *  ### x / y
             *  These are aliases for translateX and translateY.
             *  Crucially, they maintain the other translation value if only one is set.
             *
             *  Examples:
             *  .css({ x: 4 })       //=> "translate(4px, 0)"
             *  .css({ y: 10 })      //=> "translate(4px, 10px)" (if x was previously set to 4)
             */
            x: function ( x ) {
                this.set( 'translate', x, null ); // Set translateX, keep translateY
            },

            y: function ( y ) {
                this.set( 'translate', null, y ); // Set translateY, keep translateX
            },

            /*
             *  ### translate
             *  Sets the translation values along X and Y axes.
             *  Similar to x/y, this method also preserves existing translation values
             *  if one of the arguments is null.
             *
             *  Example:
             *  .css({ translate: '2, 5' })    //=> "translate(2px, 5px)"
             */
            translate: function ( x, y ) {
                // Initialize internal translation values if they don't exist
                if ( this._translateX === undefined ) {
                    this._translateX = 0;
                }
                if ( this._translateY === undefined ) {
                    this._translateY = 0;
                }

                // Update X translation if not null, ensuring 'px' unit
                if ( x !== null ) {
                    this._translateX = unit( x, 'px' );
                }
                // Update Y translation if not null, ensuring 'px' unit
                if ( y !== null ) {
                    this._translateY = unit( y, 'px' );
                }

                // Store the combined translate value
                this.translate = this._translateX + "," + this._translateY;
            }
        },

        // Object containing custom getter functions for specific transform properties.
        getter: {
            x: function () {
                return this._translateX || 0;
            },

            y: function () {
                return this._translateY || 0;
            },

            scale: function () {
                var s = ( this.scale || "1,1" ).split( ',' ); // Split scale string into components
                if ( s[ 0 ] ) {
                    s[ 0 ] = parseFloat( s[ 0 ] ); // Parse X scale
                }
                if ( s[ 1 ] ) {
                    s[ 1 ] = parseFloat( s[ 1 ] ); // Parse Y scale
                }

                // Return a single number if X and Y scales are equal, otherwise return an array.
                // "2.5,2.5" => 2.5
                // "2.5,1" => [2.5,1]
                return ( s[ 0 ] === s[ 1 ] ) ? s[ 0 ] : s;
            },

            rotate3d: function () {
                var s = ( this.rotate3d || "0,0,0,0deg" ).split( ',' ); // Split rotate3d string
                for ( var i = 0; i <= 3; ++i ) {
                    if ( s[ i ] ) {
                        s[ i ] = parseFloat( s[ i ] ); // Parse numerical components
                    }
                }
                if ( s[ 3 ] ) {
                    s[ 3 ] = unit( s[ 3 ], 'deg' ); // Ensure 'deg' unit for the angle
                }

                return s;
            }
        },

        /*
         *  ### parse()
         *  Parses a CSS transform string and populates the Transform object's properties.
         *  This method is typically called by the constructor.
         */
        parse: function ( str ) {
            var self = this;
            // Use a regex to find transform functions (e.g., "rotate(90deg)")
            str.replace( /([a-zA-Z0-9]+)\((.*?)\)/g, function ( x, prop, val ) {
                self.setFromString( prop, val ); // Call setFromString for each found transform
            } );
        },

        /*
         *  ### toString()
         *  Converts the Transform object back into a CSS `transition` property string.
         *  If `use3d` is true, it attempts to convert to a `-webkit-transition`
         *  CSS property string, using 3D equivalents where applicable.
         *
         *  @param {boolean} [use3d=false] - If true, generates 3D transform strings where possible.
         *  @returns {string} The CSS transform string.
         */
        toString: function ( use3d ) {
            var re = []; // Array to hold the individual transform function strings

            // Iterate over the properties of the Transform object.
            for ( var i in this ) {
                if ( this.hasOwnProperty( i ) ) {
                    // Skip 3D transformations if the browser does not support them
                    if ( ( !support.transform3d ) && (
                        ( i === 'rotateX' ) ||
                        ( i === 'rotateY' ) ||
                        ( i === 'perspective' ) ||
                        ( i === 'transformOrigin' ) ) ) {
                        continue; // Skip this property
                    }

                    // Exclude internal properties (those starting with '_')
                    if ( i[ 0 ] !== '_' ) {
                        if ( use3d && ( i === 'scale' ) ) {
                            // For WebKit 3D, convert scale(x,y) to scale3d(x,y,1)
                            re.push( i + "3d(" + this[ i ] + ",1)" );
                        } else if ( use3d && ( i === 'translate' ) ) {
                            // For WebKit 3D, convert translate(x,y) to translate3d(x,y,0)
                            re.push( i + "3d(" + this[ i ] + ",0)" );
                        } else {
                            // General case: prop(value)
                            re.push( i + "(" + this[ i ] + ")" );
                        }
                    }
                }
            }

            return re.join( " " ); // Join all transform functions with spaces
        }
    };

    /**
     *  @function callOrQueue
     *  Helper function to either call a function immediately or queue it using jQuery's queue system.
     *
     *  @param {jQuery} self - The jQuery object (context).
     *  @param {string|boolean} queue - The queue name (string) or true for default queue, false for no queue.
     *  @param {Function} fn - The function to execute or queue.
     */
    function callOrQueue ( self, queue, fn ) {
        if ( queue === true ) {
            self.queue( fn ); // Use default queue
        } else if ( queue ) {
            self.queue( queue, fn ); // Use a named queue
        } else {
            fn(); // Execute immediately
        }
    }

    /*
     *  ### getProperties(dict)
     *  Retrieves a list of CSS properties that will be transitioned,
     *  based on the provided dictionary of CSS properties and values.
     *  This function handles camelCase to dasherized conversion and property mapping.
     *
     *  @param {Object} props - A dictionary of CSS properties and their values,
     *                          similar to what `$.css()` expects.
     *  @returns {Array<string>} An array of unique, dasherized CSS property names.
     */
    function getProperties ( props ) {
        var re = []; // Array to store unique property names

        $.each( props, function ( key ) {
            key = $.camelCase( key ); // Convert "text-align" to "textAlign"
            key = $.transit.propertyMap[ key ] || key; // Map to generic property names (e.g., 'marginLeft' -> 'margin')
            key = uncamel( key ); // Convert back to dasherized "text-align"

            // Add the property to the list if it's not already present.
            if ( $.inArray( key, re ) === -1 ) {
                re.push( key );
            }
        } );

        return re;
    }

    /*
     *  ### getTransition()
     *  Constructs the CSS `transition` property string from given parameters.
     *
     *  Example usage:
     *  getTransition({ opacity: 1, rotate: 30 }, 500, 'ease');
     *  // Returns: 'opacity 500ms ease, -webkit-transform 500ms ease'
     *
     *  @param {Object} properties - The CSS properties being animated.
     *  @param {number} duration - The duration of the transition in milliseconds.
     *  @param {string} easing - The easing function name (e.g., 'ease', 'linear', or a custom alias).
     *  @param {number} delay - The delay before the transition starts in milliseconds.
     *  @returns {string} The formatted CSS `transition` string.
     */
    function getTransition ( properties, duration, easing, delay ) {
        // Get the list of actual CSS properties involved in the transition.
        var props = getProperties( properties );

        // Resolve easing aliases (e.g., 'in' to 'ease-in').
        if ( $.cssEase[ easing ] ) {
            easing = $.cssEase[ easing ];
        }

        // Build the duration, easing, and delay attributes for the transition.
        var attribs = '' + toMS( duration ) + ' ' + easing;
        if ( parseInt( delay, 10 ) > 0 ) {
            attribs += ' ' + toMS( delay ); // Add delay if greater than 0
        }

        // Combine all properties with their transition attributes.
        // Example: "margin 200ms ease, padding 200ms ease, ..."
        var transitions = [];
        $.each( props, function ( i, name ) {
            transitions.push( name + ' ' + attribs );
        } );

        return transitions.join( ', ' ); // Join multiple transitions with a comma and space
    }

    /*
     *  ## $.fn.transition
     *  This is the main plugin method, providing CSS3 transitions.
     *  It functions similarly to jQuery's `$.fn.animate()`, but leverages CSS transitions
     *  for smoother and often hardware-accelerated animations.
     *
     *  Basic usage:
     *  $("...").transition({ opacity: 0.1, scale: 0.3 });
     *
     *  With specific duration:
     *  $("...").transition({ opacity: 0.1, scale: 0.3 }, 500);
     *
     *  With duration and easing:
     *  $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in');
     *
     *  With a callback function:
     *  $("...").transition({ opacity: 0.1, scale: 0.3 }, function() { console.log('Animation complete!'); });
     *
     *  With duration, easing, and callback:
     *  $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in', function() { console.log('All done!'); });
     *
     *  Alternate syntax (object literal for options):
     *  $("...").transition({
     *    opacity: 0.1,
     *    duration: 200,
     *    delay: 40,
     *    easing: 'in',
     *    complete: function() { // ... do something on completion ... }
     *  });
     */
    $.fn.transition = $.fn.transit = function ( properties, duration, easing, callback ) {
        var self  = this; // Reference to the jQuery object
        var delay = 0;    // Default delay is 0ms
        var queue = true; // Default to using the animation queue

        // Handle function overloads for arguments:
        // 1. `.transition(properties, callback)`
        if ( typeof duration === 'function' ) {
            callback = duration;
            duration = undefined; // Reset duration as it was actually the callback
        }

        // 2. `.transition(properties, duration, callback)`
        if ( typeof easing === 'function' ) {
            callback = easing;
            easing = undefined; // Reset easing as it was actually the callback
        }

        // Handle alternate syntax where options are passed within the 'properties' object.
        if ( typeof properties.easing !== 'undefined' ) {
            easing = properties.easing;
            delete properties.easing; // Remove from properties to be animated
        }

        if ( typeof properties.duration !== 'undefined' ) {
            duration = properties.duration;
            delete properties.duration; // Remove from properties to be animated
        }