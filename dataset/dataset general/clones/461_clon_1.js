/*
 *  This file contains the core components of the jQuery UI library,
 *  specifically version 1.8.7.
 *  It includes fundamental utilities, feature detections, and base functionalities.
 *
 *  Please note the original licensing information:
 *  Note: While Microsoft is not the author of this file, Microsoft is
 *  offering you a license subject to the terms of the Microsoft Software
 *  License Terms for Microsoft ASP.NET Model View Controller 3.
 *  Microsoft reserves all other rights. The notices below are provided
 *  for informational purposes only and are not the license terms under
 *  which Microsoft distributed this file.
 *
 *  Original Copyright: 2010, AUTHORS.txt (http://jqueryui.com/about)
 *  Official Documentation: http://docs.jquery.com/UI
 */
( function( $, undefined ) {

  // This immediately-invoked function expression (IIFE) encapsulates
  // the jQuery UI core code, preventing global scope pollution.
  // The 'undefined' parameter ensures that 'undefined' is truly undefined
  // within this scope, guarding against global 'undefined' redefinitions.


  // A critical check to prevent duplicate loading of the jQuery UI library.
  // If $.ui.version already exists, it implies the library has been loaded,
  // and further execution of this script is redundant and potentially harmful
  // due to proxying existing functions.
  $.ui = $.ui || { };

  if ( $.ui.version ) {

    return; // Terminate execution if already loaded.
  }



  // Extend the jQuery UI namespace with core properties and utilities.
  $.extend( $.ui, {

    // The semantic version number of the current jQuery UI release.
    version : "1.8.7",


    // A comprehensive map of standard keyboard key codes.
    // This object provides a consistent way to refer to key presses,
    // abstracting away browser-specific variations.
    keyCode : {
      ALT          : 18,
      BACKSPACE    : 8,
      CAPS_LOCK    : 20,
      COMMA        : 188,
      COMMAND      : 91,
      COMMAND_LEFT : 91, // Alias for COMMAND key.
      COMMAND_RIGHT: 93,
      CONTROL      : 17,
      DELETE       : 46,
      DOWN         : 40,
      END          : 35,
      ENTER        : 13,
      ESCAPE       : 27,
      HOME         : 36,
      INSERT       : 45,
      LEFT         : 37,
      MENU         : 93, // Alias for COMMAND_RIGHT key.
      NUMPAD_ADD   : 107,
      NUMPAD_DECIMAL: 110,
      NUMPAD_DIVIDE: 111,
      NUMPAD_ENTER : 108,
      NUMPAD_MULTIPLY: 106,
      NUMPAD_SUBTRACT: 109,
      PAGE_DOWN    : 34,
      PAGE_UP      : 33,
      PERIOD       : 190,
      RIGHT        : 39,
      SHIFT        : 16,
      SPACE        : 32,
      TAB          : 9,
      UP           : 38,
      WINDOWS      : 91 // Alias for COMMAND key (Windows key).
    }
  } );


  /*
   * This section defines various utility methods that extend jQuery's prototype (`$.fn`).
   * These methods are designed to enhance element manipulation, particularly in a UI context.
   */
  $.fn.extend( {
    // Stores a reference to the original jQuery `focus` method.
    // This allows the custom `focus` method to call the native one.
    _focus : $.fn.focus,


    // A custom `focus` method that supports an optional delay.
    // Useful for scenarios where focus needs to be applied after a short pause.
    focus : function( delay, fn ) {
      return typeof delay === "number" ?
        this.each( function() {
          var elem = this; // Capture the current DOM element.
          setTimeout( function() {
            $( elem ).focus(); // Apply focus after the specified delay.
            if ( fn ) { // If a callback function is provided, execute it in the context of the element.
              fn.call( elem );
            }
          }, delay ); // The delay duration in milliseconds.
        } ) :
        // If `delay` is not a number, or not provided,
        // defer to the original jQuery `focus` method.
        this._focus.apply( this, arguments );
    },


    // Identifies the closest scrollable parent of the current element.
    // A 'scrollable parent' is defined by its CSS `overflow` properties.
    scrollParent : function() {
      var scrollParent; // Variable to store the jQuery object of the scrollable parent.

      // Special handling for Internet Explorer and absolutely positioned elements.
      if ( ( $.browser.msie && ( /(static|relative)/ ).test( this.css( 'position' ) ) ) || ( /(absolute)/ ).test( this.css( 'position' ) ) ) {
        scrollParent = this.parents().filter( function() {
          // Filter parents based on position (relative, absolute, fixed) and overflow (auto, scroll).
          return ( /(relative|absolute|fixed)/ ).test( $.curCSS( this, 'position', 1 ) ) && ( /(auto|scroll)/ ).test( $.curCSS( this, 'overflow', 1 ) + $.curCSS( this, 'overflow-y', 1 ) + $.curCSS( this, 'overflow-x', 1 ) );
        } ).eq( 0 ); // Select the first matching parent.
      } else {
        // General logic for other browsers and positioning types.
        scrollParent = this.parents().filter( function() {
          return ( /(auto|scroll)/ ).test( $.curCSS( this, 'overflow', 1 ) + $.curCSS( this, 'overflow-y', 1 ) + $.curCSS( this, 'overflow-x', 1 ) );
        } ).eq( 0 );
      }

      // If the element's position is 'fixed' or no scrollable parent is found,
      // the document itself is considered the scroll parent.
      return ( /(fixed)/ ).test( this.css( 'position' ) ) || !scrollParent.length ? $( document ) : scrollParent;
    },


    // Manages the `z-index` CSS property of an element.
    // If a `zIndex` value is provided, it sets the property.
    // Otherwise, it attempts to determine the computed `z-index` by traversing up the DOM.
    zIndex : function( zIndex ) {
      if ( zIndex !== undefined ) {
        return this.css( "zIndex", zIndex ); // Set the z-index directly.
      }


      if ( this.length ) {
        var elem = $( this[ 0 ] ), // Start with the first element in the collection.
          position, // Holds the computed CSS `position`.
          value; // Holds the parsed `z-index` value.

        // Iterate through the element and its ancestors up to the document root.
        while ( elem.length && elem[ 0 ] !== document ) {
          // Z-index only applies to absolutely, relatively, or fixed-positioned elements.
          position = elem.css( "position" );
          if ( position === "absolute" || position === "relative" || position === "fixed" ) {
            value = parseInt( elem.css( "zIndex" ), 10 ); // Parse the z-index to an integer.
            // If a valid, non-zero z-index is found, return it.
            if ( !isNaN( value ) && value !== 0 ) {
              return value;
            }
          }
          elem = elem.parent(); // Move to the next parent.
        }
      }


      return 0; // Return 0 if no explicit z-index is found or applicable.
    },


    // Disables text selection on the matched elements.
    // This is achieved by binding an event handler that prevents the default action.
    disableSelection : function() {
      return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
        ".ui-disableSelection", function( event ) {
          event.preventDefault(); // Prevent the browser's default text selection behavior.
        } );
    },


    // Re-enables text selection on elements by unbinding the previously attached handler.
    enableSelection : function() {
      return this.unbind( ".ui-disableSelection" ); // Unbind all events in the ".ui-disableSelection" namespace.
    }
  } ); // End of $.fn.extend for core utilities.


  /*
   * This block dynamically extends jQuery's prototype to provide consistent
   * `innerWidth`/`innerHeight` and `outerWidth`/`outerHeight` methods.
   * It ensures calculations correctly account for padding, border, and margin
   * across different browser implementations.
   */
  $.each( [ "Width", "Height" ], function( i, name ) {

    var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ], // Determine the relevant sides (horizontal or vertical).
      type = name.toLowerCase(), // 'width' or 'height' for CSS property names.
      orig = { // Store original jQuery dimension methods for later use.
        innerWidth : $.fn.innerWidth,
        innerHeight : $.fn.innerHeight,
        outerWidth : $.fn.outerWidth,
        outerHeight : $.fn.outerHeight
      };


    // Internal helper function to subtract padding, border, and/or margin from a given size.
    function reduce( elem, size, border, margin ) {
      $.each( side, function() {
        size -= parseFloat( $.curCSS( elem, "padding" + this, true ) ) || 0; // Subtract padding.
        if ( border ) {
          size -= parseFloat( $.curCSS( elem, "border" + this + "Width", true ) ) || 0; // Subtract border if requested.
        }
        if ( margin ) {
          size -= parseFloat( $.curCSS( elem, "margin" + this, true ) ) || 0; // Subtract margin if requested.
        }
      } );
      return size; // Return the adjusted size.
    }


    // Custom `inner` + `Name` (e.g., `innerWidth`) method.
    $.fn[ "inner" + name ] = function( size ) {
      if ( size === undefined ) {
        return orig[ "inner" + name ].call( this ); // If no size is provided, act as a getter (call original method).
      }

      // If a size is provided, act as a setter: compute and apply the CSS dimension.
      return this.each( function() {
        $( this ).css( type, reduce( this, size ) + "px" );
      } );
    };


    // Custom `outer` + `Name` (e.g., `outerWidth`) method.
    $.fn[ "outer" + name ] = function( size, margin ) {
      if ( typeof size !== "number" ) {
        return orig[ "outer" + name ].call( this, size ); // If not setting a numeric size, act as a getter.
      }

      // If a numeric size is provided, act as a setter: compute and apply the CSS dimension.
      return this.each( function() {
        $( this ).css( type, reduce( this, size, true, margin ) + "px" );
      } );
    };
  } );


  /*
   * Custom selectors for jQuery, extending `$.expr[ ":" ]`.
   * These provide powerful ways to query elements based on UI-specific criteria.
   */

  // Helper function to determine if an element is currently visible in the DOM.
  function visible( element ) {
    return !$( element ).parents().andSelf().filter( function() {
      // An element is considered not visible if its CSS `visibility` is "hidden"
      // or if jQuery's internal `:hidden` filter considers it hidden.
      return $.curCSS( this, "visibility" ) === "hidden" ||
        $.expr.filters.hidden( this );
    } ).length; // If any element in the ancestor chain (including itself) matches, it's not visible.
  }


  $.extend( $.expr[ ":" ], {
    // Custom selector `:data(key)`: checks if an element has data associated with `key`.
    data : function( elem, i, match ) {
      return !!$.data( elem, match[ 3 ] ); // Coerces the result of $.data to a boolean.
    },


    // Custom selector `:focusable`: identifies elements that can receive keyboard focus.
    focusable : function( element ) {
      var nodeName = element.nodeName.toLowerCase(), // The lowercase tag name of the element.
        tabIndex = $.attr( element, "tabindex" ); // The value of the `tabindex` attribute.

      if ( "area" === nodeName ) { // Special case for HTML <area> elements.
        var map = element.parentNode,
          mapName = map.name,
          img;

        if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
          return false; // An area must have an href and belong to a named map.
        }
        img = $( "img[usemap=#" + mapName + "]" )[ 0 ]; // Find the image associated with the map.
        return !!img && visible( img ); // The area is focusable if its corresponding image is visible.
      }
      // General logic for other elements:
      return ( /input|select|textarea|button|object/.test( nodeName ) // If it's a common interactive element...
        ? !element.disabled // ...it must not be disabled.
        : "a" == nodeName // If it's an anchor tag...
          ? element.href || !isNaN( tabIndex ) // ...it must have an href or a valid tabindex.
          : !isNaN( tabIndex ) ) // For any other element, it must have a valid tabindex.
        // Additionally, the element itself and all its ancestors must be visible.
        && visible( element );
    },


    // Custom selector `:tabbable`: identifies elements that can be reached via the Tab key.
    tabbable : function( element ) {
      var tabIndex = $.attr( element, "tabindex" ); // Retrieve the `tabindex` attribute.
      // An element is tabbable if its tabindex is not NaN and is non-negative,
      // AND the element is also `:focusable`.
      return ( isNaN( tabIndex ) || tabIndex >= 0 ) && $( element ).is( ":focusable" );
    }
  } );


  // This block executes on document ready to perform feature detection.
  $( function() {
    var body = document.body,
      div = body.appendChild( div = document.createElement( "div" ) ); // Create a temporary div and append it to the body.

    $.extend( div.style, {
      minHeight : "100px",
      height : "auto",
      padding : 0,
      borderWidth : 0
    } );

    // Check if the browser correctly supports `min-height` CSS property.
    $.support.minHeight = div.offsetHeight === 100;
    // Check for `onselectstart` event support, common in older IE versions.
    $.support.selectstart = "onselectstart" in div;

    // Clean up the temporary div. Setting `display: none` before removal
    // helps mitigate potential layout bugs in Internet Explorer.
    body.removeChild( div ).style.display = "none";
  } );



  /*
   * The following methods are considered deprecated or are slated for future refactoring.
   * Developers are encouraged to use alternative, more modern approaches where available.
   */
  $.extend( $.ui, {
    // Deprecated: `$.ui.plugin` is an older mechanism for managing widget extensions.
    // The recommended approach now involves using the proxy pattern.
    plugin : {
      // Adds a plugin method to a specific module's prototype.
      add : function( module, option, set ) {
        var proto = $.ui[ module ].prototype;
        for ( var i in set ) {
          proto.plugins[ i ] = proto.plugins[ i ] || [];
          proto.plugins[ i ].push( [ option, set[ i ] ] );
        }
      },
      // Calls a registered plugin method on a widget instance.
      call : function( instance, name, args ) {
        var set = instance.plugins[ name ];
        // Ensure the plugin exists and the widget's element is still in the DOM.
        if ( !set || !instance.element[ 0 ].parentNode ) {
          return;
        }

        // Iterate through all registered plugin functions for the given name.
        for ( var i = 0; i < set.length; i++ ) {
          // Execute the plugin function if its associated option is enabled.
          if ( instance.options[ set[ i ][ 0 ] ] ) {
            set[ i ][ 1 ].apply( instance.element, args );
          }
        }
      }
    },

    // Deprecated: `$.ui.contains` provides a cross-browser way to check if a DOM element
    // contains another. Since jQuery 1.4, `jQuery.contains()` is available and should be used instead.
    contains : function( a, b ) {
      return document.compareDocumentPosition ?
        a.compareDocumentPosition( b ) & 16 : // W3C DOM method for comparing node positions.
        a !== b && a.contains( b ); // Older IE-specific `contains` method.
    },

    // Utility function to determine if an element has scrollable content.
    // This method is primarily utilized by the jQuery UI Resizable widget.
    hasScroll : function( el, a ) {

      // If the `overflow` CSS property is "hidden", the element is not scrollable,
      // even if its content exceeds its dimensions.
      if ( $( el ).css( "overflow" ) === "hidden" ) {
        return false;
      }

      var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop", // Determine whether to check horizontal or vertical scroll.
        has = false; // Flag to indicate if the element has scrollable content.

      // If the scroll position is already greater than zero, it is definitely scrollable.
      if ( el[ scroll ] > 0 ) {
        return true;
      }

      // Temporarily set the scroll position to 1 to check if the browser allows it.
      // If `el[scroll]` remains 0, it means the element cannot be scrolled.
      el[ scroll ] = 1;
      has = ( el[ scroll ] > 0 ); // Check if the scroll position actually changed.
      el[ scroll ] = 0; // Reset the scroll position to its original state.
      return has;
    },

    // Determines if a given `x` coordinate falls within a specified axis range.
    // Useful for hit-testing or collision detection.
    isOverAxis : function( x, reference, size ) {
      // Returns true if `x` is greater than `reference` AND less than (`reference` + `size`).
      return ( x > reference ) && ( x < ( reference + size ) );
    },

    // Determines if a point defined by `(y, x)` coordinates is within a rectangular area.
    // This is achieved by checking both horizontal and vertical axis overlaps.
    isOver : function( y, x, top, left, height, width ) {
      // Combines two `isOverAxis` checks: one for the Y-axis and one for the X-axis.
      return $.ui.isOverAxis( y, top, height ) && $.ui.isOverAxis( x, left, width );
    }
  } );

} )( jQuery ); // End of the main IIFE for jQuery UI Core.


/*
 *  This section contains the jQuery UI Widget Factory,
 *  a powerful and extensible framework for creating stateful jQuery plugins.
 *  It provides a consistent API for managing widget lifecycle, options, and events.
 *
 *  License and Copyright Information:
 *  Refer to the top-level license block and AUTHORS.txt for full details.
 *  This particular file corresponds to jQuery UI Widget version 1.8.7.
 *  Official Documentation: http://docs.jquery.com/UI/Widget
 */
( function( $, undefined ) {

  // This block addresses crucial resource cleanup when elements are removed from the DOM.
  // It ensures that any 'remove' event handlers, particularly those registered by widgets,
  // are properly triggered before the element's data and events are purged by jQuery.

  // For jQuery versions 1.4 and later, which provide `$.cleanData`.
  if ( $.cleanData ) {
    var _cleanData = $.cleanData; // Store a reference to the original `$.cleanData` function.
    $.cleanData = function( elems ) { // Override `$.cleanData` to include widget-specific cleanup.
      for ( var i = 0, elem; ( elem = elems[ i ] ) != null; i++ ) {
        $( elem ).triggerHandler( "remove" ); // Trigger a custom 'remove' event on each element.
      }
      _cleanData( elems ); // Call the original `cleanData` to perform standard jQuery cleanup.
    };
  } else {
    // For older jQuery versions (prior to 1.4), override `$.fn.remove` directly.
    var _remove = $.fn.remove; // Store a reference to the original `$.fn.remove` method.
    $.fn.remove = function( selector, keepData ) {
      return this.each( function() {
        if ( !keepData ) { // If the widget's data should not be preserved.
          if ( !selector || $.filter( selector, [ this ] ).length ) {
            // Find all descendants and the element itself, then trigger the 'remove' event.
            $( "*", this ).add( [ this ] ).each( function() {
              $( this ).triggerHandler( "remove" );
            } );
          }
        }
        return _remove.call( $( this ), selector, keepData ); // Call the original `remove` method.
      } );
    };
  }


  // The core Widget Factory function.
  // This is the entry point for defining new jQuery UI widgets.
  // It orchestrates inheritance, option merging, and method bridging.
  $.widget = function( name, base, prototype ) {
    var namespace = name.split( "." )[ 0 ], // Extract the namespace (e.g., "ui" from "ui.dialog").
      fullName; // Will store the full widget name (e.g., "ui-dialog").

    name = name.split( "." )[ 1 ]; // Extract the widget's short name (e.g., "dialog").
    fullName = namespace + "-" + name; // Construct the full name, often used for CSS classes.

    if ( !prototype ) { // If the `base` argument is omitted, assume `$.Widget` as the base class.
      prototype = base;
      base = $.Widget;
    }

    // Register a custom selector for this plugin.
    // This allows developers to query for elements that are instances of this widget
    // using a syntax like `$( ".my-element:ui-dialog" )`.
    $.expr[ ":" ][ fullName ] = function( elem ) {
      return !!$.data( elem, name ); // Returns true if the element has data associated with the widget name.
    };

    $[ namespace ] = $[ namespace ] || {}; // Ensure the namespace object exists (e.g., `$.ui`).

    // Define the widget constructor function.
    // This is the function that gets called when a new widget instance is created.
    $[ namespace ][ name ] = function( options, element ) {
      // Allow instantiation without immediate initialization for simple inheritance scenarios.
      if ( arguments.length ) {
        this._createWidget( options, element ); // Call the internal widget creation method.
      }
    };

    var basePrototype = new base(); // Create an instance of the base widget's prototype.
    // Crucial step: Deep clone the `options` object from the base prototype.
    // This prevents direct modification of the base prototype's options
    // when an individual widget instance's options are changed.
    basePrototype.options = $.extend( true, {}, basePrototype.options );

    // Extend the new widget's prototype.
    // This merges properties from the base prototype, adds widget-specific metadata,
    // and incorporates the `prototype` object provided by the developer.
    $[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
      namespace : namespace, // The namespace the widget belongs to.
      widgetName : name, // The short name of the widget.
      // Determines the prefix for custom widget events (e.g., "dialogcreate").
      // Defaults to the widget name if not explicitly defined.
      widgetEventPrefix : $[ namespace ][ name ].prototype.widgetEventPrefix || name,
      widgetBaseClass : fullName // The base CSS class name for the widget.
    }, prototype );

    // Bridge the widget constructor to jQuery's `$.fn` object.
    // This enables the standard jQuery plugin invocation syntax,
    // like `$(selector).widgetName(options)` or `$(selector).widgetName('method', arg)`.
    $.widget.bridge( name, $[ namespace ][ name ] );
  };


  // The `$.widget.bridge` function facilitates the integration of widget constructors
  // with jQuery's method chainability (`$.fn`).
  // It handles both initialization and method calls on widget instances.
  $.widget.bridge = function( name, object ) {
    $.fn[ name ] = function( options ) {
      var isMethodCall = typeof options === "string", // Check if the first argument is a string (indicating a method call).
        args = Array.prototype.slice.call( arguments, 1 ), // Capture any additional arguments for method calls.
        returnValue = this; // Default return value is the jQuery collection itself.

      // Allow multiple option hashes to be passed during initialization.
      options = !isMethodCall && args.length ?
        $.extend.apply( null, [ true, options ].concat( args ) ) : // Deep merge options if multiple provided.
        options; // Otherwise, use the options as provided.

      // Prevent direct calls to internal methods (those prefixed with an underscore).
      if ( isMethodCall && options.charAt( 0 ) === "_" ) {
        return returnValue; // Return the jQuery collection, effectively ignoring the call.
      }

      if ( isMethodCall ) {
        // If it's a method call, iterate over each element in the collection.
        this.each( function() {
          var instance = $.data( this, name ), // Retrieve the widget instance from the element's data.
            methodValue = instance && $.isFunction( instance[ options ] ) ?
              instance[ options ].apply( instance, args ) : // Execute the method if it exists and is a function.
              instance; // If method not found, return the instance itself.

          // If a method returned a value that is neither the instance itself nor `undefined`,
          // capture this value and stop the `each` loop. This allows methods to return data.
          if ( methodValue !== instance && methodValue !== undefined ) {
            returnValue = methodValue;
            return false; // Break out of the `each` loop.
          }
        } );
      } else {
        // If it's not a method call, it's an initialization request.
        this.each( function() {
          var instance = $.data( this, name ); // Check if a widget instance already exists on this element.
          if ( instance ) {
            // If an instance exists, update its options (if provided) and re-initialize it.
            instance.option( options || {} )._init();
          } else {
            // If no instance exists, create a new one and store it in the element's data.
            $.data( this, name, new object( options, this ) );
          }
        } );
      }

      return returnValue; // Return the jQuery collection (for chainability) or a method's return value.
    };
  };


  // The base Widget constructor. All other specific jQuery UI widgets
  // inherit from this constructor, gaining its fundamental properties and methods.
  $.Widget = function( options, element ) {
    // Allows creating a widget instance without immediate initialization,
    // which is useful in inheritance chains where `_createWidget` is called later.
    if ( arguments.length ) {
      this._createWidget( options, element );
    }
  };


  // The prototype object for the base `$.Widget`.
  // This defines the default properties, methods, and lifecycle hooks
  // that all jQuery UI widgets inherit and can override.
  $.Widget.prototype = {
    widgetName : "widget", // The default name for a widget instance.
    widgetEventPrefix : "", // Default prefix for custom events triggered by the widget.
    options : { // Default options object for all widgets.
      disabled : false // A common option to enable/disable widget functionality.
    },

    // The core method responsible for creating and setting up a widget instance.
    // This is called internally by the widget constructor.
    _createWidget : function( options, element ) {
      // Store the widget instance itself on the DOM element's data.
      // This makes the instance accessible via `$(element).data(widgetName)`.
      // It's done early to ensure the instance is available even during `_create`.
      $.data( element, this.widgetName, this );
      this.element = $( element ); // Wrap the raw DOM element in a jQuery object.

      // Merge options from multiple sources:
      // 1. Base widget's default options.
      // 2. Options extracted from HTML metadata (if `$.metadata` plugin is available).
      // 3. User-provided options.
      // `true` enables a deep merge, cloning nested objects.
      this.options = $.extend( true, {},
        this.options, // Default options from the prototype chain.
        this._getCreateOptions(), // Options from metadata (e.g., `class="mywidget {foo: 'bar'}"`).
        options ); // Options passed during instantiation.

      var self = this; // Cache a reference to `this` for use in event handlers.

      // Bind a namespaced 'remove' event handler to the widget's element.
      // When the element is removed from the DOM, the widget's `destroy` method is automatically called.
      this.element.bind( "remove." + this.widgetName, function() {
        self.destroy();
      } );

      this._create(); // Call the widget-specific creation logic (to be overridden by child widgets).
      this._trigger( "create" ); // Trigger a custom 'create' event (e.g., "dialogcreate").
      this._init(); // Call the widget-specific initialization logic (to be overridden).
    },


    // Retrieves options from the element's HTML metadata if the `$.metadata` plugin is loaded.
    // This allows declarative widget configuration directly in the HTML.
    _getCreateOptions : function() {
      return $.metadata && $.metadata.get( this.element[ 0 ] )[ this.widgetName ];
    },


    // A placeholder method for widget-specific creation logic.
    // Child widgets should override this method to perform their initial setup.
    _create : function() {},


    // A placeholder method for widget-specific initialization logic.
    // Child widgets should override this to perform actions after creation and event triggering.
    _init : function() {},


    // The `destroy` method is responsible for cleaning up the widget instance.
    // It unbinds events, removes data, and restores the element to its pre-widget state.
    destroy : function() {
      this.element
        .unbind( "." + this.widgetName ) // Unbind all events namespaced to this widget from the element.
        .removeData( this.widgetName ); // Remove the widget instance data associated with the element.

      this.widget() // Get the widget's root element (which might be different from `this.element`).
        .unbind( "." + this.widgetName ) // Unbind all namespaced events from the root widget element.
        .removeAttr( "aria-disabled" ) // Remove accessibility attributes like `aria-disabled`.
        .removeClass(
          this.widgetBaseClass + "-disabled " + // Remove CSS classes indicating a disabled state.
          "ui-state-disabled" );
    },


    // Returns the root element of the widget as a jQuery object.
    // This might be the original element or a wrapper element created by the widget.
    widget : function() {