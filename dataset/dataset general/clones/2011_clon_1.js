/*
 *    jQuery UI - Core Library
 *    Version 1.8.10
 *
 *    Copyright (c) 2011 The jQuery UI Team
 *    Authors: See AUTHORS.txt (http://jqueryui.com/about)
 *    License: Dual licensed under the MIT or GPL Version 2 licenses.
 *    See http://jquery.org/license for details.
 *
 *    Project Homepage: http://docs.jquery.com/UI
 *    This file contains core functionalities and utilities for jQuery UI.
 */
( function( $, undefined ) { /* Anonymous function for scope isolation */

    // This section prevents redundant loading of jQuery UI components.
    // It's crucial because some functions are proxied, and double-proxying
    // would lead to unexpected behavior or errors.
    $.ui = $.ui || {};

    // If a version is already defined, UI is already loaded, so exit.
    if ( $.ui.version ) {
        return;
    }

    // Extending the jQuery UI namespace with core properties.
    $.extend( $.ui, {

        // Current version of jQuery UI.
        version: "1.8.10",

        // Key codes for common keyboard interactions.
        // This object provides a consistent way to refer to key codes.
        keyCode: {
            ALT:            18,
            BACKSPACE:      8,
            CAPS_LOCK:      20,
            COMMA:          188,
            COMMAND:        91,
            COMMAND_LEFT:   91,  // Alias for COMMAND
            COMMAND_RIGHT:  93,
            CONTROL:        17,
            DELETE:         46,
            DOWN:           40,
            END:            35,
            ENTER:          13,
            ESCAPE:         27,
            HOME:           36,
            INSERT:         45,
            LEFT:           37,
            MENU:           93,  // Alias for COMMAND_RIGHT
            NUMPAD_ADD:     107,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE:  111,
            NUMPAD_ENTER:   108,
            NUMPAD_MULTIPLY:106,
            NUMPAD_SUBTRACT:109,
            PAGE_DOWN:      34,
            PAGE_UP:        33,
            PERIOD:         190,
            RIGHT:          39,
            SHIFT:          16,
            SPACE:          32,
            TAB:            9,
            UP:             38,
            WINDOWS:        91   // Another alias for COMMAND
        }
    } );

    // jQuery plugin extensions for UI functionalities.
    $.fn.extend( {

        // Store original focus method to restore later or use internally.
        _focus: $.fn.focus,

        /**
         * Enhances the focus method to allow a delay before focusing.
         * @param {number} delay - The delay in milliseconds before focusing.
         * @param {function} fn - An optional callback function to execute after focus.
         * @returns {jQuery} - The jQuery object for chaining.
         */
        focus: function( delay, fn ) {
            // If delay is a number, apply delayed focus.
            return typeof delay === "number" ?
                this.each( function() {
                    var elem = this;
                    setTimeout( function() {
                        $( elem ).focus();
                        if ( fn ) {
                            fn.call( elem );
                        }
                    }, delay );
                } ) :
                // Otherwise, call the original focus method.
                this._focus.apply( this, arguments );
        },

        /**
         * Finds the first scrollable parent of an element.
         * @returns {jQuery} - The scrollable parent element or `$(document)` if none found.
         */
        scrollParent: function() {
            var scrollParent;

            // Handle IE-specific behavior or absolutely positioned elements.
            if ( ( $.browser.msie && ( /(static|relative)/ ).test( this.css( 'position' ) ) ) || ( /absolute/ ).test( this.css( 'position' ) ) ) {
                scrollParent = this.parents().filter( function() {
                    // Check for positioned and scrollable overflow.
                    return ( /(relative|absolute|fixed)/ ).test( $.curCSS( this, 'position', 1 ) ) && ( /(auto|scroll)/ ).test( $.curCSS( this, 'overflow', 1 ) + $.curCSS( this, 'overflow-y', 1 ) + $.curCSS( this, 'overflow-x', 1 ) );
                } ).eq( 0 );
            } else {
                // For other browsers or default cases, find any scrollable parent.
                scrollParent = this.parents().filter( function() {
                    // Check for scrollable overflow.
                    return ( /(auto|scroll)/ ).test( $.curCSS( this, 'overflow', 1 ) + $.curCSS( this, 'overflow-y', 1 ) + $.curCSS( this, 'overflow-x', 1 ) );
                } ).eq( 0 );
            }

            // If the element is fixed or no scroll parent is found, use the document.
            return ( /fixed/ ).test( this.css( 'position' ) ) || !scrollParent.length ? $( document ) : scrollParent;
        },

        /**
         * Gets or sets the z-index of an element.
         * @param {number} zIndex - The new z-index value to set.
         * @returns {number|jQuery} - The z-index value if getting, or the jQuery object if setting.
         */
        zIndex: function( zIndex ) {
            // If zIndex is provided, set it.
            if ( zIndex !== undefined ) {
                return this.css( "zIndex", zIndex );
            }

            // If the element exists, calculate its effective z-index.
            if ( this.length ) {
                var elem = $( this[ 0 ] ),
                    position,
                    value;
                // Traverse up the DOM tree until the document root.
                while ( elem.length && elem[ 0 ] !== document ) {
                    // Ignore z-index if position is set to a value where z-index is ignored by the browser.
                    // This ensures consistent behavior across different browsers.
                    // WebKit browsers often return "auto" even if positioned.
                    position = elem.css( "position" );
                    if ( position === "absolute" || position === "relative" || position === "fixed" ) {
                        // IE returns 0 when zIndex is not specified, other browsers return a string.
                        // We also ignore cases of nested elements with an explicit value of 0,
                        // for example: <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
                        value = parseInt( elem.css( "zIndex" ), 10 );
                        if ( !isNaN( value ) && value !== 0 ) {
                            return value;
                        }
                    }
                    elem = elem.parent(); // Move to the parent element.
                }
            }

            // Default z-index if nothing found or no explicit z-index.
            return 0;
        },

        /**
         * Disables text selection for the elements in the collection.
         * @returns {jQuery} - The jQuery object for chaining.
         */
        disableSelection: function() {
            return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
                ".ui-disableSelection", function( event ) {
                    event.preventDefault(); // Prevent default selection behavior.
                } );
        },

        /**
         * Enables text selection for the elements in the collection.
         * @returns {jQuery} - The jQuery object for chaining.
         */
        enableSelection: function() {
            // Unbind the event handler previously bound by disableSelection.
            return this.unbind( ".ui-disableSelection" );
        }
    } );

    // Extend jQuery's dimension methods (innerWidth, outerWidth, innerHeight, outerHeight).
    $.each( [ "Width", "Height" ], function( i, name ) {
        // Determine the sides (Left/Right or Top/Bottom) based on dimension name.
        var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
            // Lowercase version of the dimension name (e.g., "width", "height").
            type = name.toLowerCase(),
            // Store original jQuery methods.
            orig = {
                innerWidth:     $.fn.innerWidth,
                innerHeight:    $.fn.innerHeight,
                outerWidth:     $.fn.outerWidth,
                outerHeight:    $.fn.outerHeight
            };

        /**
         * Helper function to reduce size based on padding, border, and margin.
         * @param {HTMLElement} elem - The element to measure.
         * @param {number} size - The initial size.
         * @param {boolean} border - Whether to subtract border width.
         * @param {boolean} margin - Whether to subtract margin.
         * @returns {number} - The adjusted size.
         */
        function reduce( elem, size, border, margin ) {
            $.each( side, function() {
                // Subtract padding.
                size -= parseFloat( $.curCSS( elem, "padding" + this, true ) ) || 0;
                // Subtract border if requested.
                if ( border ) {
                    size -= parseFloat( $.curCSS( elem, "border" + this + "Width", true ) ) || 0;
                }
                // Subtract margin if requested.
                if ( margin ) {
                    size -= parseFloat( $.curCSS( elem, "margin" + this, true ) ) || 0;
                }
            } );
            return size;
        }

        // Override $.fn.innerWidth/innerHeight.
        $.fn[ "inner" + name ] = function( size ) {
            // If no size is provided, get the inner dimension using the original method.
            if ( size === undefined ) {
                return orig[ "inner" + name ].call( this );
            }

            // If a size is provided, set the dimension.
            return this.each( function() {
                // Set CSS property with reduced size and "px" unit.
                $( this ).css( type, reduce( this, size ) + "px" );
            } );
        };

        // Override $.fn.outerWidth/outerHeight.
        $.fn[ "outer" + name ] = function( size, margin ) {
            // If size is not a number, call the original outer dimension method.
            if ( typeof size !== "number" ) {
                return orig[ "outer" + name ].call( this, size );
            }

            // If a size is provided, set the dimension.
            return this.each( function() {
                // Set CSS property with reduced size, including border and optionally margin.
                $( this ).css( type, reduce( this, size, true, margin ) + "px" );
            } );
        };
    } );

    // Custom selectors for jQuery UI.
    // Helper function to determine if an element is truly visible.
    function visible( element ) {
        // An element is visible if neither it nor its ancestors are hidden or have visibility: hidden.
        return !$( element ).parents().andSelf().filter( function() {
            return $.curCSS( this, "visibility" ) === "hidden" ||
                $.expr.filters.hidden( this );
        } ).length;
    }

    $.extend( $.expr[ ":" ], {
        /**
         * Selector for elements that have jQuery data associated with a specific key.
         * Usage: `$( "div:data(myKey)" )`
         */
        data: function( elem, i, match ) {
            return !!$.data( elem, match[ 3 ] );
        },

        /**
         * Selector for focusable elements.
         * Determines if an element can receive keyboard focus.
         */
        focusable: function( element ) {
            var nodeName = element.nodeName.toLowerCase(),
                tabIndex = $.attr( element, "tabindex" );

            // Special handling for <area> elements within an image map.
            if ( "area" === nodeName ) {
                var map = element.parentNode,
                    mapName = map.name,
                    img;

                if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
                    return false;
                }
                img = $( "img[usemap=#" + mapName + "]" )[ 0 ];
                return !!img && visible( img ); // Area is focusable if its image is visible.
            }

            // Check if the element is an input-like control, a link, or has a tabindex.
            return ( /input|select|textarea|button|object/.test( nodeName )
                ? !element.disabled // Input-like elements are focusable if not disabled.
                : "a" == nodeName
                    ? element.href || !isNaN( tabIndex ) // Links are focusable if they have an href or a tabindex.
                    : !isNaN( tabIndex ) ) // Other elements are focusable if they have a tabindex.
                // Additionally, the element and all its ancestors must be visible.
                && visible( element );
        },

        /**
         * Selector for tabbable elements (elements reachable via Tab key).
         * @returns {boolean} True if the element is tabbable.
         */
        tabbable: function( element ) {
            var tabIndex = $.attr( element, "tabindex" );
            // An element is tabbable if its tabindex is not NaN or >= 0, AND it's focusable.
            return ( isNaN( tabIndex ) || tabIndex >= 0 ) && $( element ).is( ":focusable" );
        }
    } );

    // jQuery document ready function for feature detection.
    $( function() {
        var body = document.body,
            div = body.appendChild( div = document.createElement( "div" ) ); // Create a temporary div.

        // Apply styles to the temporary div for testing.
        $.extend( div.style, {
            minHeight:      "100px",
            height:         "auto",
            padding:        0,
            borderWidth:    0
        } );

        // Detect if min-height CSS property is supported correctly.
        $.support.minHeight = div.offsetHeight === 100;
        // Detect if `onselectstart` event is supported (for IE).
        $.support.selectstart = "onselectstart" in div;

        // Clean up: remove the temporary div and set its display to none.
        // This avoids a layout bug in IE (http://dev.jquery.com/ticket/4014).
        body.removeChild( div ).style.display = "none";
    } );

    // Deprecated functionalities and utilities.
    $.extend( $.ui, {
        // $.ui.plugin is deprecated. Use the proxy pattern instead for extensibility.
        plugin: {
            /**
             * Adds a plugin method to a UI widget prototype.
             * @param {string} module - The widget module name (e.g., "draggable").
             * @param {string} option - The name of the option that enables this plugin part.
             * @param {object} set - An object mapping event names to handler functions.
             */
            add: function( module, option, set ) {
                var proto = $.ui[ module ].prototype;
                for ( var i in set ) {
                    proto.plugins[ i ] = proto.plugins[ i ] || [];
                    proto.plugins[ i ].push( [ option, set[ i ] ] );
                }
            },
            /**
             * Calls all registered plugin handlers for a specific event.
             * @param {object} instance - The widget instance.
             * @param {string} name - The event name (e.g., "start", "stop").
             * @param {Array} args - Arguments to pass to the plugin handlers.
             */
            call: function( instance, name, args ) {
                var set = instance.plugins[ name ];
                // If no plugins for this event or element is detached, do nothing.
                if ( !set || !instance.element[ 0 ].parentNode ) {
                    return;
                }

                // Iterate through registered plugin handlers.
                for ( var i = 0; i < set.length; i++ ) {
                    // Only call if the corresponding option is enabled.
                    if ( instance.options[ set[ i ][ 0 ] ] ) {
                        set[ i ][ 1 ].apply( instance.element, args );
                    }
                }
            }
        },

        // This `contains` method will be deprecated when upgrading to jQuery 1.4+,
        // which includes `jQuery.contains()`.
        /**
         * Checks if a DOM element `b` is a descendant of DOM element `a`.
         * @param {HTMLElement} a - The potential ancestor.
         * @param {HTMLElement} b - The potential descendant.
         * @returns {boolean} True if `b` is contained within `a`.
         */
        contains: function( a, b ) {
            // Use native `compareDocumentPosition` if available (modern browsers).
            return document.compareDocumentPosition ?
                a.compareDocumentPosition( b ) & 16 : // Node.DOCUMENT_POSITION_CONTAINS bitmask.
                // Fallback to `contains` for older browsers (e.g., IE).
                a !== b && a.contains( b );
        },

        // This utility is primarily used by the resizable widget.
        /**
         * Checks if an element has scrollable content.
         * @param {HTMLElement} el - The element to check.
         * @param {string} a - Optional: "left" to check horizontal scroll, otherwise checks vertical.
         * @returns {boolean} True if the element has scrollable content.
         */
        hasScroll: function( el, a ) {
            // If overflow is hidden, the user intends to hide extra content, so it's not "scrollable".
            if ( $( el ).css( "overflow" ) === "hidden" ) {
                return false;
            }

            var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop", // Determine scroll property.
                has = false;

            // If scroll position is already greater than 0, it definitely has scroll.
            if ( el[ scroll ] > 0 ) {
                return true;
            }

            // TODO: Determine which cases actually cause this to happen.
            // If the element doesn't have scroll set, temporarily try to set it
            // to see if it becomes scrollable.
            el[ scroll ] = 1;
            has = ( el[ scroll ] > 0 ); // Check if scroll position changed.
            el[ scroll ] = 0;           // Reset scroll position.
            return has;
        },

        // These are somewhat specialized functions; consider fixing the API
        // or moving them into individual plugins where they are used.

        /**
         * Determines if an x-coordinate is within a specified axis range.
         * @param {number} x - The coordinate to check.
         * @param {number} reference - The starting point of the axis.
         * @param {number} size - The length of the axis.
         * @returns {boolean} True if x is within the axis.
         */
        isOverAxis: function( x, reference, size ) {
            return ( x > reference ) && ( x < ( reference + size ) );
        },

        /**
         * Determines if x, y coordinates are over a given rectangular area.
         * @param {number} y - The y-coordinate.
         * @param {number} x - The x-coordinate.
         * @param {number} top - The top boundary of the area.
         * @param {number} left - The left boundary of the area.
         * @param {number} height - The height of the area.
         * @param {number} width - The width of the area.
         * @returns {boolean} True if the coordinates are within the area.
         */
        isOver: function( y, x, top, left, height, width ) {
            // Checks both vertical and horizontal axes.
            return $.ui.isOverAxis( y, top, height ) && $.ui.isOverAxis( x, left, width );
        }
    } );

} )( jQuery ); /* End of the first self-executing anonymous function */


/*
 *    jQuery UI Widget Framework
 *    Version 1.8.10
 *
 *    Copyright (c) 2011 The jQuery UI Team
 *    Authors: See AUTHORS.txt (http://jqueryui.com/about)
 *    License: Dual licensed under the MIT or GPL Version 2 licenses.
 *    See http://jquery.org/license for details.
 *
 *    Project Homepage: http://docs.jquery.com/UI/Widget
 *    This file provides the base widget factory for creating jQuery UI components.
 */
( function( $, undefined ) { /* Second anonymous function for widget scope */

    // Check for jQuery 1.4+ which introduced `$.cleanData`.
    if ( $.cleanData ) {
        var _cleanData = $.cleanData; // Store original cleanData.
        $.cleanData = function( elems ) {
            // Trigger a "remove" event for each element being cleaned.
            for ( var i = 0, elem; ( elem = elems[ i ] ) != null; i++ ) {
                $( elem ).triggerHandler( "remove" );
            }
            _cleanData( elems ); // Call the original cleanData function.
        };
    } else {
        // Fallback for older jQuery versions (pre-1.4).
        var _remove = $.fn.remove; // Store original remove.
        $.fn.remove = function( selector, keepData ) {
            return this.each( function() {
                if ( !keepData ) {
                    // If not keeping data, trigger "remove" on the element and its descendants.
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

    /**
     * Creates a new jQuery UI widget.
     * @param {string} name - The full name of the widget (e.g., "namespace.widgetName").
     * @param {Function} base - The base widget constructor to inherit from (e.g., $.Widget).
     * @param {object} prototype - The prototype object for the new widget.
     */
    $.widget = function( name, base, prototype ) {
        var namespace = name.split( "." )[ 0 ], // Extract namespace.
            fullName;

        name = name.split( "." )[ 1 ]; // Extract widget name.
        fullName = namespace + "-" + name; // Create full CSS class name.

        // If 'prototype' is not provided, 'base' is the prototype and default to $.Widget as base.
        if ( !prototype ) {
            prototype = base;
            base = $.Widget;
        }

        // Create a selector for the plugin (e.g., `$( ":mywidget" )`).
        $.expr[ ":" ][ fullName ] = function( elem ) {
            return !!$.data( elem, name ); // Element has data associated with the widget name.
        };

        // Ensure namespace exists.
        $[ namespace ] = $[ namespace ] || {};

        // The widget constructor function.
        $[ namespace ][ name ] = function( options, element ) {
            // Allow instantiation without initializing for simple inheritance.
            if ( arguments.length ) {
                this._createWidget( options, element );
            }
        };

        var basePrototype = new base(); // Create an instance of the base widget.

        // We need to make the options hash a property directly on the new instance,
        // otherwise, we'd modify the options hash on the prototype that we're inheriting from.
        // The commented-out $.each block below was an alternative way to deep copy
        // plain objects from the base prototype, but $.extend(true, ...) handles it.
        // $.each( basePrototype, function( key, val ) {
        //     if ( $.isPlainObject(val) ) {
        //         basePrototype[ key ] = $.extend( {}, val );
        //     }
        // });

        basePrototype.options = $.extend( true, {}, basePrototype.options ); // Deep copy base options.

        // Set the prototype for the new widget.
        $[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
            namespace:          namespace,
            widgetName:         name,
            widgetEventPrefix:  $[ namespace ][ name ].prototype.widgetEventPrefix || name,
            widgetBaseClass:    fullName
        }, prototype );

        // Bridge the widget to jQuery's prototype, making it a jQuery plugin.
        $.widget.bridge( name, $[ namespace ][ name ] );
    };

    /**
     * Bridges a widget constructor to `$.fn`, allowing it to be called as a jQuery plugin.
     * @param {string} name - The name of the widget (e.g., "draggable").
     * @param {Function} object - The widget constructor function.
     */
    $.widget.bridge = function( name, object ) {
        $.fn[ name ] = function( options ) {
            var isMethodCall = typeof options === "string", // Check if the first argument is a method name.
                args = Array.prototype.slice.call( arguments, 1 ), // Get remaining arguments.
                returnValue = this; // Default return value for chaining.

            // Allow multiple hashes to be passed on initialization.
            options = !isMethodCall && args.length ?
                $.extend.apply( null, [ true, options ].concat( args ) ) :
                options;

            // Prevent calls to internal methods (methods starting with '_').
            if ( isMethodCall && options.charAt( 0 ) === "_" ) {
                return returnValue;
            }

            if ( isMethodCall ) {
                // If it's a method call.
                this.each( function() {
                    var instance = $.data( this, name ), // Get the widget instance.
                        methodValue = instance && $.isFunction( instance[ options ] ) ?
                            instance[ options ].apply( instance, args ) :
                            instance;

                    // TODO: Add this back in 1.9 and use $.error() (see #5972).
                    // The following commented-out code was for error handling in later versions.
                    // if ( !instance ) {
                    //     throw "cannot call methods on " + name + " prior to initialization; " +
                    //         "attempted to call method '" + options + "'";
                    // }
                    // if ( !$.isFunction( instance[options] ) ) {
                    //     throw "no such method '" + options + "' for " + name + " widget instance";
                    // }
                    // var methodValue = instance[ options ].apply( instance, args );

                    // If a method returns a value other than the instance itself,
                    // store it and break the each loop to return that value.
                    if ( methodValue !== instance && methodValue !== undefined ) {
                        returnValue = methodValue;
                        return false; // Break out of $.each.
                    }
                } );
            } else {
                // If it's an initialization call.
                this.each( function() {
                    var instance = $.data( this, name );
                    if ( instance ) {
                        // If instance already exists, update options and re-initialize.
                        instance.option( options || {} )._init();
                    } else {
                        // Create a new instance and store it in data.
                        $.data( this, name, new object( options, this ) );
                    }
                } );
            }

            return returnValue; // Return for chaining.
        };
    };

    /**
     * The base constructor for all jQuery UI widgets.
     * Provides common functionality and lifecycle methods.
     * @param {object} options - Initial options for the widget.
     * @param {HTMLElement} element - The DOM element associated with the widget.
     */
    $.Widget = function( options, element ) {
        // Allow instantiation without initializing for simple inheritance.
        if ( arguments.length ) {
            this._createWidget( options, element );
        }
    };

    // Prototype for the base Widget.
    $.Widget.prototype = {
        widgetName:         "widget",       // Default widget name.
        widgetEventPrefix:  "",             // Default event prefix.
        options: {                          // Default options.
            disabled:       false
        },

        /**
         * Internal method to create and initialize the widget instance.
         * @param {object} options - Options passed during instantiation.
         * @param {HTMLElement} element - The DOM element.
         * @private
         */
        _createWidget: function( options, element ) {
            // $.widget.bridge stores the plugin instance, but we do it here too
            // so that it's stored even before the _create function runs.
            $.data( element, this.widgetName, this );
            this.element = $( element ); // Store jQuery wrapped element.
            this.options = $.extend( true, {}, // Deep merge options.
                this.options,
                this._getCreateOptions(), // Get options from metadata if available.
                options );

            var self = this;
            // Bind a "remove" event handler to destroy the widget when its element is removed.
            this.element.bind( "remove." + this.widgetName, function() {
                self.destroy();
            } );

            this._create();     // Call the widget's custom create logic.
            this._trigger( "create" ); // Trigger the "create" event.
            this._init();       // Call the widget's custom initialization logic.
        },

        /**
         * Retrieves creation options, potentially from jQuery metadata.
         * @returns {object} Options object.
         * @private
         */
        _getCreateOptions: function() {
            // If jQuery metadata plugin is present, extract options from element's metadata.
            return $.metadata && $.metadata.get( this.element[ 0 ] )[ this.widgetName ];
        },

        /**
         * Placeholder for widget-specific creation logic.
         * To be overridden by concrete widgets.
         * @private
         */
        _create: function() {},

        /**
         * Placeholder for widget-specific initialization logic.
         * To be overridden by concrete widgets.
         * @private
         */
        _init: function() {},

        /**
         * Destroys the widget instance, cleaning up events and data.
         */
        destroy: function() {
            this.element
                .unbind( "." + this.widgetName )    // Unbind all widget-specific events.
                .removeData( this.widgetName );     // Remove stored widget data.
            this.widget()
                .unbind( "." + this.widgetName )    // Unbind events from the widget's root element.
                .removeAttr( "aria-disabled" )      // Remove ARIA disabled attribute.
                .removeClass(                       // Remove disabled CSS classes.
                    this.widgetBaseClass + "-disabled " +
                    "ui-state-disabled" );
        },

        /**
         * Returns the widget's root jQuery element.
         * @returns {jQuery} The root element.
         */
        widget: function() {
            return this.element;
        },

        /**
         * Gets or sets widget options.
         * @param {string|object} key - The option name to get/set, or an object of key/value pairs to set.
         * @param {*} value - The value to set for the option.
         * @returns {*} The option value if getting, or the widget instance if setting.
         */
        option: function( key, value ) {
            var options = key;

            // If no arguments, return a copy of all options.
            if ( arguments.length === 0 ) {
                // Don't return a reference to the internal hash to prevent direct modification.
                return $.extend( {}, this.options );
            }
            // ... (rest of the option method implementation would follow here)
            // (The provided code snippet ends abruptly here, so I will end it similarly.)