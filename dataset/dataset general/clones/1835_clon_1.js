/*
 * This is a Type I clone of the original jQuery UI 1.8.13 code.
 * All functional aspects, variable names, and logic remain identical.
 * Only formatting, spacing, and comments have been altered.
 *
 * The original copyright and licensing information is preserved here:
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 * http://docs.jquery.com/UI
 */
( function(
    $, // jQuery reference
    undefined // Ensures 'undefined' is truly undefined
) {


    // This section prevents multiple loadings of the same library.
    // It's crucial because some functions might be proxied,
    // and double-proxying could lead to unexpected behavior or errors.
    $.ui = $.ui || {}; // Initialize $.ui if it doesn't exist.

    if ( $.ui.version ) {
        // If a version is already defined, the library has been loaded.
        return; // Exit to prevent re-initialization.
    }

    // Extend the jQuery UI object with core properties.
    $.extend( $.ui, {
        // Current version of the jQuery UI library.
        version: "1.8.13",


        // Define key codes for common keyboard actions.
        // This makes event handling more robust and readable.
        keyCode: {
            ALT: 18,
            BACKSPACE: 8,
            CAPS_LOCK: 20,
            COMMA: 188,
            COMMAND: 91,
            COMMAND_LEFT: 91,    /* Corresponds to COMMAND */
            COMMAND_RIGHT: 93,
            CONTROL: 17,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            INSERT: 45,
            LEFT: 37,
            MENU: 93,            /* Corresponds to COMMAND_RIGHT */
            NUMPAD_ADD: 107,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,
            NUMPAD_ENTER: 108,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_SUBTRACT: 109,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SHIFT: 16,
            SPACE: 32,
            TAB: 9,
            UP: 38,
            WINDOWS: 91          /* Corresponds to COMMAND */
        }
    } );

    // --- jQuery fn extensions (plugins) ---
    // These methods extend the jQuery prototype, adding new functionalities to jQuery objects.
    $.fn.extend( {
        // Store a reference to the original focus method.
        _focus: $.fn.focus,

        // Custom focus method with an optional delay.
        focus: function( delay, fn ) {
            // Check if 'delay' is a number, indicating delayed focus.
            return typeof delay === "number" ?
                this.each( function() {
                    var elem = this; // Cache the current element.
                    // Set a timeout to apply focus after the specified delay.
                    setTimeout( function() {
                        $( elem ).focus(); // Apply focus using jQuery.
                        if ( fn ) {
                            // If a callback function is provided, execute it in the context of the element.
                            fn.call( elem );
                        }
                    }, delay );
                } ) :
                // If no delay, or delay is not a number, call the original focus method.
                this._focus.apply( this, arguments );
        },

        // Determine the scrollable parent of an element.
        scrollParent: function() {
            var scrollParent; // Variable to store the identified scroll parent.

            // Logic for IE and elements with 'absolute' position.
            // These elements have different rules for scroll parent determination.
            if ( ( $.browser.msie && ( /(static|relative)/ ).test( this.css( 'position' ) ) ) || ( /(absolute)/ ).test( this.css( 'position' ) ) ) {
                scrollParent = this.parents().filter( function() {
                    // Filter parents based on position and overflow properties.
                    return ( /(relative|absolute|fixed)/ ).test( $.curCSS( this, 'position', 1 ) ) && ( /(auto|scroll)/ ).test( $.curCSS( this, 'overflow', 1 ) + $.curCSS( this, 'overflow-y', 1 ) + $.curCSS( this, 'overflow-x', 1 ) );
                } ).eq( 0 ); // Get the first matching parent.
            } else {
                // Logic for other browsers and positioning.
                scrollParent = this.parents().filter( function() {
                    // Filter parents based on overflow properties.
                    return ( /(auto|scroll)/ ).test( $.curCSS( this, 'overflow', 1 ) + $.curCSS( this, 'overflow-y', 1 ) + $.curCSS( this, 'overflow-x', 1 ) );
                } ).eq( 0 ); // Get the first matching parent.
            }

            // Return the scroll parent or the document if the element is fixed or no scroll parent is found.
            return ( /(fixed)/ ).test( this.css( 'position' ) ) || !scrollParent.length ? $( document ) : scrollParent;
        },

        // Get or set the z-index of an element.
        zIndex: function( zIndex ) {
            if ( zIndex !== undefined ) {
                // If a zIndex value is provided, set it.
                return this.css( "zIndex", zIndex );
            }

            // If no zIndex is provided, try to determine the current z-index.
            if ( this.length ) {
                var elem = $( this[ 0 ] ),
                    position,
                    value;
                // Traverse up the DOM tree until document root is reached.
                while ( elem.length && elem[ 0 ] !== document ) {
                    // Ignore z-index if position is set to a value where z-index is ignored by the browser.
                    // This ensures consistent behavior across different browsers.
                    // WebKit browsers typically return 'auto' if an element is positioned.
                    position = elem.css( "position" );
                    if ( position === "absolute" || position === "relative" || position === "fixed" ) {
                        // IE returns 0 when zIndex is not explicitly set.
                        // Other browsers return a string like "auto".
                        // We need to parse the value and handle edge cases, like nested elements with z-index: 0.
                        value = parseInt( elem.css( "zIndex" ), 10 );
                        if ( !isNaN( value ) && value !== 0 ) {
                            return value;
                        }
                    }
                    elem = elem.parent(); // Move to the parent element.
                }
            }

            return 0; // Default z-index if none is found.
        },

        // Disable text selection on elements.
        disableSelection: function() {
            return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
                ".ui-disableSelection", function( event ) {
                    event.preventDefault(); // Prevent the default selection behavior.
                } );
        },

        // Enable text selection on elements.
        enableSelection: function() {
            // Unbind the event handler that prevents selection.
            return this.unbind( ".ui-disableSelection" );
        }
    } );

    // --- Dynamic Width/Height extensions ---
    // This loop dynamically creates innerWidth/Height and outerWidth/Height methods.
    $.each( [ "Width", "Height" ], function( i, name ) {
        var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
            type = name.toLowerCase(),
            orig = {
                innerWidth: $.fn.innerWidth,
                innerHeight: $.fn.innerHeight,
                outerWidth: $.fn.outerWidth,
                outerHeight: $.fn.outerHeight
            };

        // Helper function to calculate reduced size by subtracting padding, border, and/or margin.
        function reduce( elem, size, border, margin ) {
            $.each( side, function() {
                size -= parseFloat( $.curCSS( elem, "padding" + this, true ) ) || 0;
                if ( border ) {
                    size -= parseFloat( $.curCSS( elem, "border" + this + "Width", true ) ) || 0;
                }
                if ( margin ) {
                    size -= parseFloat( $.curCSS( elem, "margin" + this, true ) ) || 0;
                }
            } );
            return size;
        }

        // Define innerWidth/innerHeight methods.
        $.fn[ "inner" + name ] = function( size ) {
            if ( size === undefined ) {
                // If no size is provided, return the original inner dimension.
                return orig[ "inner" + name ].call( this );
            }

            // If a size is provided, set the CSS dimension.
            return this.each( function() {
                $( this ).css( type, reduce( this, size ) + "px" );
            } );
        };

        // Define outerWidth/outerHeight methods.
        $.fn[ "outer" + name ] = function( size, margin ) {
            if ( typeof size !== "number" ) {
                // If size is not a number, return the original outer dimension.
                return orig[ "outer" + name ].call( this, size );
            }

            // If a size is provided, set the CSS dimension, considering border and margin.
            return this.each( function() {
                $( this ).css( type, reduce( this, size, true, margin ) + "px" );
            } );
        };
    } );

    // --- Selector functions ---
    // Determines if an element is focusable.
    function focusable( element, isTabIndexNotNaN ) {
        var nodeName = element.nodeName.toLowerCase(); // Get the lowercase tag name.

        // Special handling for 'area' elements.
        if ( "area" === nodeName ) {
            var map = element.parentNode,
                mapName = map.name,
                img;
            // An area is focusable if it has an href, its map has a name, and its parent is a map.
            if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
                return false;
            }
            // Find the image associated with the map.
            img = $( "img[usemap=#" + mapName + "]" )[ 0 ];
            // It's focusable if the image exists and is visible.
            return !!img && visible( img );
        }

        // General focusability rules:
        // Input, select, textarea, button, object are focusable if not disabled.
        // Anchor tags are focusable if they have an href or if their tabindex is explicitly set.
        // Otherwise, focusability depends on tabindex.
        return ( /input|select|textarea|button|object/.test( nodeName ) ?
                !element.disabled :
                "a" == nodeName ?
                element.href || isTabIndexNotNaN :
                isTabIndexNotNaN ) &&
            // Additionally, the element and all its ancestors must be visible.
            visible( element );
    }

    // Determines if an element is visible in the DOM.
    function visible( element ) {
        // An element is visible if none of its ancestors or itself have 'visibility: hidden'
        // or are hidden by jQuery's :hidden filter (e.g., display: none).
        return !$( element ).parents().andSelf().filter( function() {
            return $.curCSS( this, "visibility" ) === "hidden" ||
                $.expr.filters.hidden( this );
        } ).length;
    }

    // Extend jQuery's expression selectors.
    $.extend( $.expr[ ":" ], {
        // Select elements that have jQuery data associated with them.
        data: function( elem, i, match ) {
            return !!$.data( elem, match[ 3 ] );
        },

        // Select focusable elements.
        focusable: function( element ) {
            return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
        },

        // Select tabbable elements.
        tabbable: function( element ) {
            var tabIndex = $.attr( element, "tabindex" ),
                isTabIndexNaN = isNaN( tabIndex );
            // Tabbable if tabindex is not NaN or >= 0, and it's focusable.
            return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
        }
    } );

    // --- Support checks ---
    // Run this code when the DOM is ready.
    $( function() {
        var body = document.body,
            div = body.appendChild( div = document.createElement( "div" ) ); // Create a temporary div for feature detection.

        // Apply styles to the temporary div.
        $.extend( div.style, {
            minHeight: "100px",
            height: "auto",
            padding: 0,
            borderWidth: 0
        } );

        // Check for minHeight support.
        $.support.minHeight = div.offsetHeight === 100;
        // Check for selectstart event support.
        $.support.selectstart = "onselectstart" in div;

        // Clean up the temporary div.
        // Set display to 'none' to avoid potential layout bugs in IE before removal.
        // (Refer to http://dev.jquery.com/ticket/4014 for context).
        body.removeChild( div ).style.display = "none";
    } );


    /*
     * Deprecated utilities for jQuery UI.
     * These functions are maintained for backward compatibility but might be removed or refactored in future versions.
     */
    $.extend( $.ui, {
        // $.ui.plugin is deprecated. The recommended pattern is to use direct method calls or event proxies.
        plugin: {
            // Adds a plugin method to a module's prototype.
            add: function( module, option, set ) {
                var proto = $.ui[ module ].prototype;
                for ( var i in set ) {
                    proto.plugins[ i ] = proto.plugins[ i ] || [];
                    proto.plugins[ i ].push( [ option, set[ i ] ] );
                }
            },
            // Calls a plugin method on an instance.
            call: function( instance, name, args ) {
                var set = instance.plugins[ name ];
                // Ensure the plugin exists and the element is still in the DOM.
                if ( !set || !instance.element[ 0 ].parentNode ) {
                    return;
                }

                // Iterate through registered plugin methods and call them if enabled.
                for ( var i = 0; i < set.length; i++ ) {
                    if ( instance.options[ set[ i ][ 0 ] ] ) {
                        set[ i ][ 1 ].apply( instance.element, args );
                    }
                }
            }
        },

        // This 'contains' function will be deprecated once jQuery 1.4+ is standard,
        // as jQuery.contains() provides similar functionality.
        contains: function( a, b ) {
            // Use compareDocumentPosition for modern browsers.
            return document.compareDocumentPosition ?
                a.compareDocumentPosition( b ) & 16 :
                // Fallback for older browsers (e.g., IE).
                a !== b && a.contains( b );
        },

        // This function is primarily used by the resizable plugin.
        hasScroll: function( el, a ) {

            // If overflow is set to 'hidden', the element might have content
            // that overflows, but the user explicitly wants it hidden,
            // so it should not be considered scrollable.
            if ( $( el ).css( "overflow" ) === "hidden" ) {
                return false;
            }

            var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
                has = false;

            // Check if the element already has a scroll position.
            if ( el[ scroll ] > 0 ) {
                return true;
            }

            // TODO: Investigate edge cases where an element might not have scroll
            // but is still scrollable.
            // Temporarily set scroll to 1 to check if it's possible to scroll.
            el[ scroll ] = 1;
            has = ( el[ scroll ] > 0 ); // If it scrolls, it's scrollable.
            el[ scroll ] = 0; // Reset scroll position.
            return has;
        },

        // These are somewhat specialized functions.
        // Consider moving them into individual plugins or refining the API.
        isOverAxis: function( x, reference, size ) {
            // Determines if an x-coordinate falls within a given axis range.
            return ( x > reference ) && ( x < ( reference + size ) );
        },
        isOver: function( y, x, top, left, height, width ) {
            // Determines if a coordinate (x, y) is over a specified element area.
            return $.ui.isOverAxis( y, top, height ) && $.ui.isOverAxis( x, left, width );
        }
    } );

} )( jQuery ); // Pass jQuery into the immediately invoked function expression.


/*
 * jQuery UI Widget 1.8.13
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
( function( $, undefined ) {

    // --- Custom cleanData/remove for jQuery 1.4+ ---
    // This section ensures that the "remove" event is triggered
    // when elements are removed from the DOM, allowing widgets to clean up.
    if ( $.cleanData ) {
        var _cleanData = $.cleanData; // Store a reference to the original cleanData.
        $.cleanData = function( elems ) {
            // Iterate through elements being cleaned.
            for ( var i = 0, elem;
                ( elem = elems[ i ] ) != null; i++ ) {
                $( elem ).triggerHandler( "remove" ); // Trigger the custom "remove" event.
            }
            _cleanData( elems ); // Call the original cleanData function.
        };
    } else {
        // Fallback for older jQuery versions (pre-1.4) that don't have $.cleanData.
        var _remove = $.fn.remove; // Store a reference to the original $.fn.remove.
        $.fn.remove = function( selector, keepData ) {
            return this.each( function() {
                if ( !keepData ) {
                    // If data should not be kept, trigger "remove" for the element and its descendants.
                    if ( !selector || $.filter( selector, [ this ] ).length ) {
                        $( "*", this ).add( [ this ] ).each( function() {
                            $( this ).triggerHandler( "remove" );
                        } );
                    }
                }
                // Call the original remove function.
                return _remove.call( $( this ), selector, keepData );
            } );
        };
    }

    // The core widget factory function.
    // `name`: Full widget name (e.g., "namespace.widgetName").
    // `base`: Base widget constructor (e.g., $.Widget).
    // `prototype`: Widget-specific prototype methods and options.
    $.widget = function( name, base, prototype ) {
        var namespace = name.split( "." )[ 0 ], // Extract the namespace.
            fullName; // Variable for the full widget name.
        name = name.split( "." )[ 1 ]; // Extract the widget name.
        fullName = namespace + "-" + name; // Create a hyphenated full name for CSS classes/selectors.

        // If no base widget is specified, default to $.Widget.
        if ( !prototype ) {
            prototype = base;
            base = $.Widget;
        }

        // Create a custom selector for the plugin (e.g., ":myWidget").
        // This allows selecting elements initialized with this widget.
        $.expr[ ":" ][ fullName ] = function( elem ) {
            return !!$.data( elem, name ); // Returns true if the element has data associated with the widget name.
        };

        // Ensure the namespace exists.
        $[ namespace ] = $[ namespace ] || {};
        // Define the widget constructor function within its namespace.
        $[ namespace ][ name ] = function( options, element ) {
            // Allow instantiation without immediate initialization for inheritance.
            if ( arguments.length ) {
                this._createWidget( options, element );
            }
        };

        var basePrototype = new base(); // Create an instance of the base prototype.
        // It's important to make the options hash a direct property on the new instance,
        // otherwise, modifications would affect the prototype being inherited from.
        // The commented-out $.each block below was an alternative way to deep-copy options,
        // but $.extend(true, ...) is more concise.
        // $.each( basePrototype, function( key, val ) {
        //     if ( $.isPlainObject(val) ) {
        //         basePrototype[ key ] = $.extend( {}, val );
        //     }
        // });
        basePrototype.options = $.extend( true, {}, basePrototype.options ); // Deep copy base options.

        // Extend the widget's prototype with base prototype and widget-specific prototype.
        $[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
            namespace: namespace, // Store the widget's namespace.
            widgetName: name, // Store the widget's name.
            // Determine the event prefix, defaulting to the widget name if not specified.
            widgetEventPrefix: $[ namespace ][ name ].prototype.widgetEventPrefix || name,
            widgetBaseClass: fullName // Store the base CSS class name.
        }, prototype );

        // Bridge the widget to jQuery's fn object, making it accessible via $(selector).widgetName().
        $.widget.bridge( name, $[ namespace ][ name ] );
    };

    // --- Widget Bridge ---
    // This function adds a method to $.fn, allowing widgets to be called on jQuery selections.
    $.widget.bridge = function( name, object ) {
        $.fn[ name ] = function( options ) {
            var isMethodCall = typeof options === "string", // Check if the call is for a method (e.g., $(...).widget('method')).
                args = Array.prototype.slice.call( arguments, 1 ), // Extract arguments for method calls.
                returnValue = this; // Default return value is the jQuery object itself.

            // Allow multiple option hashes to be passed during initialization.
            options = !isMethodCall && args.length ?
                $.extend.apply( null, [ true, options ].concat( args ) ) :
                options;

            // Prevent calls to internal widget methods (those starting with '_').
            if ( isMethodCall && options.charAt( 0 ) === "_" ) {
                return returnValue;
            }

            if ( isMethodCall ) {
                this.each( function() {
                    var instance = $.data( this, name ), // Get the widget instance from element data.
                        methodValue = instance && $.isFunction( instance[ options ] ) ?
                        instance[ options ].apply( instance, args ) :
                        instance;

                    // TODO: Re-enable error handling in jQuery 1.9+ using $.error() (ticket #5972).
                    // The commented-out error checks below would throw exceptions for invalid method calls.
                    // if ( !instance ) {
                    //     throw "cannot call methods on " + name + " prior to initialization; " +
                    //         "attempted to call method '" + options + "'";
                    // }
                    // if ( !$.isFunction( instance[options] ) ) {
                    //     throw "no such method '" + options + "' for " + name + " widget instance";
                    // }
                    // var methodValue = instance[ options ].apply( instance, args );

                    // If a method returns a value (other than the instance itself or undefined),
                    // store it as the return value for the bridged call.
                    if ( methodValue !== instance && methodValue !== undefined ) {
                        returnValue = methodValue;
                        return false; // Stop iteration if a specific value is returned.
                    }
                } );
            } else {
                // Widget initialization path.
                this.each( function() {
                    var instance = $.data( this, name ); // Check if an instance already exists.
                    if ( instance ) {
                        // If an instance exists, update its options and re-initialize.
                        instance.option( options || {} )._init();
                    } else {
                        // If no instance, create a new one and store it in element data.
                        $.data( this, name, new object( options, this ) );
                    }
                } );
            }

            return returnValue; // Return the jQuery object or the method's return value.
        };
    };

    // --- Base Widget Constructor ---
    // This is the fundamental constructor for all jQuery UI widgets.
    $.Widget = function( options, element ) {
        // Allow instantiation without immediate _createWidget call for inheritance purposes.
        if ( arguments.length ) {
            this._createWidget( options, element );
        }
    };

    // --- Base Widget Prototype ---
    // Defines core properties and methods common to all widgets.
    $.Widget.prototype = {
        widgetName: "widget", // Default widget name.
        widgetEventPrefix: "", // Default event prefix.
        options: {
            disabled: false // Default option: widget is not disabled.
        },

        // Initializes the widget instance.
        _createWidget: function( options, element ) {
            // Store the plugin instance in element data.
            // This is done early so it's available even before _create runs.
            $.data( element, this.widgetName, this );
            this.element = $( element ); // Wrap the element in a jQuery object.
            this.options = $.extend( true, {}, // Deep merge options.
                this.options, // Base options.
                this._getCreateOptions(), // Options from metadata.
                options ); // User-provided options.

            var self = this; // Cache 'this' for use in callbacks.
            // Bind a "remove" event handler to destroy the widget when its element is removed.
            this.element.bind( "remove." + this.widgetName, function() {
                self.destroy();
            } );

            this._create(); // Call the widget's custom creation logic.
            this._trigger( "create" ); // Trigger the 'create' event.
            this._init(); // Call the widget's custom initialization logic.
        },

        // Retrieves creation options from element metadata (if available).
        _getCreateOptions: function() {
            return $.metadata && $.metadata.get( this.element[ 0 ] )[ this.widgetName ];
        },
        _create: function() {}, // Placeholder for widget-specific creation logic.
        _init: function() {}, // Placeholder for widget-specific initialization logic.

        // Destroys the widget instance, unbinding events and cleaning up data.
        destroy: function() {
            this.element
                .unbind( "." + this.widgetName ) // Unbind all widget-specific events.
                .removeData( this.widgetName ); // Remove the widget instance from element data.
            this.widget()
                .unbind( "." + this.widgetName ) // Unbind events from the widget's root element.
                .removeAttr( "aria-disabled" ) // Remove accessibility attribute.
                .removeClass(
                    this.widgetBaseClass + "-disabled " + // Remove disabled classes.
                    "ui-state-disabled" );
        },

        // Returns the widget's root element as a jQuery object.
        widget: function() {
            return this.element;
        },

        // Get or set widget options.
        option: function( key, value ) {
            var options = key; // If 'key' is an object, it's a set of options.