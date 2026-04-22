/*
 * This file is a Type I code clone of the ZeroClipboard library.
 * It strictly adheres to the definition: "Code fragments are exactly equal,
 * except for possible variations in whitespace and comments."
 *
 * All identifiers, variable names, function names, operators, and expressions
 * are maintained verbatim from the original source.
 *
 * Extensive changes have been made to whitespace (indentation, spacing,
 * blank lines) and comments (addition, modification, removal)
 * to create a visually distinct, yet logically and structurally identical,
 * representation of the original JavaScript code.
 *
 * Original project: zeroclipboard
 * Version: v1.2.0-beta.4
 * License: MIT
 * Source URL: http://zeroclipboard.github.io/ZeroClipboard/
 *
 * The purpose of this transformation is to demonstrate a Type I clone,
 * where only superficial changes are introduced without altering the core logic.
 */
( function( ) {
  // Enforce strict mode for better code quality and error handling.
  "use strict";

  /**
   * Self-executing function to create a utility for camelizing CSS property names.
   * For instance, "background-color" becomes "backgroundColor".
   * This pattern ensures the `matcherRegex` and `replacerFn` are private.
   */
  var _camelizeCssPropName = ( function( ) {
    // Regular expression to find a hyphen followed by a lowercase letter.
    var matcherRegex = /\-([a-z])/g
      , replacerFn = function( match, group ) {
          // The replacement function converts the captured letter to uppercase.
          return group.toUpperCase( );
        }
      ; // End of variable declarations within the IIFE.

    // The function returned by the IIFE, which will be assigned to `_camelizeCssPropName`.
    return function( prop ) {
      return prop.replace( matcherRegex, replacerFn );
    };
  } )( ); // Immediately invoke the function.


  /**
   * Cross-browser function to retrieve the computed style of a DOM element.
   * It handles `window.getComputedStyle` for modern browsers and
   * `element.currentStyle` for older Internet Explorer versions.
   * Also includes special logic for the 'cursor' property to ensure 'pointer'
   * for interactive elements if not explicitly set.
   *
   * @param {HTMLElement} el   The element for which to get the style.
   * @param {string}      prop The CSS property name (e.g., "z-index", "cursor").
   * @returns {string}         The computed style value.
   */
  var _getStyle = function( el, prop ) {
    var value
      , camelProp
      , tagName
      , possiblePointers
      , i
      , len
      ; // Declare all local variables at the top.

    // Check for standard `getComputedStyle` method.
    if ( window.getComputedStyle ) {
      value = window.getComputedStyle( el, null ).getPropertyValue( prop );
    }
    // Fallback for older Internet Explorer versions using `currentStyle`.
    else {
      // Convert the CSS property name to camelCase for `currentStyle`.
      camelProp = _camelizeCssPropName( prop );

      if ( el.currentStyle ) {
        value = el.currentStyle[ camelProp ];
      }
      // Last resort: check inline styles.
      else {
        value = el.style[ camelProp ];
      }
    }

    // Special handling for the 'cursor' property.
    if ( prop === "cursor" ) {
      // If cursor is not explicitly set or is 'auto', check if it should be a pointer.
      if ( !value || value === "auto" ) {
        tagName = el.tagName.toLowerCase( );
        possiblePointers = [ "a" ]; // Anchor tags are a common case for pointer cursors.

        // Iterate through known elements that should have a pointer cursor.
        for ( i = 0, len = possiblePointers.length; i < len; i++ ) {
          if ( tagName === possiblePointers[ i ] ) {
            return "pointer"; // Return 'pointer' if it matches.
          }
        }
      }
    }

    return value; // Return the determined style value.
  };


  /**
   * Event handler for mouseover events on elements targeted by ZeroClipboard.
   * This function is responsible for setting the `currentElement` in the
   * ZeroClipboard singleton and repositioning the Flash bridge.
   *
   * @param {Event} event The DOM event object.
   */
  var _elementMouseOver = function( event ) {
    // Do nothing if the ZeroClipboard singleton has not been initialized.
    if ( !ZeroClipboard.prototype._singleton ) {
      return;
    }

    // Normalize the event object for cross-browser compatibility (e.g., older IE).
    if ( !event ) {
      event = window.event;
    }

    var target; // Variable to store the actual target element.

    // Determine the event target: `this` if bound directly, `event.target` or `event.srcElement`.
    if ( this !== window ) {
      target = this; // 'this' refers to the element when event listener is attached.
    } else if ( event.target ) {
      target = event.target; // Standard DOM event target.
    } else if ( event.srcElement ) {
      target = event.srcElement; // IE-specific event target.
    }

    // Set the identified target element as the current element in the singleton.
    ZeroClipboard.prototype._singleton.setCurrent( target );
  };


  /**
   * Cross-browser utility to attach an event handler to a DOM element.
   * Uses `addEventListener` for modern browsers and `attachEvent` for older IE.
   *
   * @param {HTMLElement} element The DOM element to which to add the event.
   * @param {string}      method  The event type (e.g., "click", "mouseover").
   * @param {Function}    func    The function to be executed when the event occurs.
   */
  var _addEventHandler = function( element, method, func ) {
    if ( element.addEventListener ) {
      element.addEventListener( method, func, false ); // W3C standard.
    } else if ( element.attachEvent ) {
      element.attachEvent( "on" + method, func ); // Microsoft IE standard.
    }
  };


  /**
   * Cross-browser utility to remove an event handler from a DOM element.
   * Counterpart to `_addEventHandler`.
   *
   * @param {HTMLElement} element The DOM element from which to remove the event.
   * @param {string}      method  The event type.
   * @param {Function}    func    The function to be removed.
   */
  var _removeEventHandler = function( element, method, func ) {
    if ( element.removeEventListener ) {
      element.removeEventListener( method, func, false ); // W3C standard.
    } else if ( element.detachEvent ) {
      element.detachEvent( "on" + method, func ); // Microsoft IE standard.
    }
  };


  /**
   * Adds one or more CSS class names to a given element.
   * Supports elements with a custom `addClass` method (e.g., jQuery objects)
   * or directly manipulates the `className` property.
   *
   * @param {HTMLElement} element The DOM element to modify.
   * @param {string}      value   A space-separated string of class names to add.
   * @returns {HTMLElement}       The modified element.
   */
  var _addClass = function( element, value ) {
    // If the element has its own `addClass` method, use it.
    if ( element.addClass ) {
      element.addClass( value );
      return element;
    }

    // Proceed with manual class manipulation if `value` is a valid string.
    if ( value && typeof value === "string" ) {
      var classNames = ( value || "" ).split( /\s+/ ); // Split the input string into an array of class names.

      if ( element.nodeType === 1 ) { // Ensure it's an element node (not text, comment, etc.).
        if ( !element.className ) {
          element.className = value; // If no classes exist, simply assign the new value.
        } else {
          // Pad existing class names with spaces for easier matching.
          var className = " " + element.className + " "
            , setClass = element.className
            ; // Store the original className to build upon.

          // Iterate over the new class names to add.
          for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
            // Check if the class is already present (using padded strings for full word match).
            if ( className.indexOf( " " + classNames[ c ] + " " ) < 0 ) {
              setClass += " " + classNames[ c ]; // Append the new class if it doesn't exist.
            }
          }
          // Update the element's `className`, removing any extra leading/trailing spaces.
          element.className = setClass.replace( /^\s+|\s+$/g, "" );
        }
      }
    }
    return element; // Return the element for chaining.
  };


  /**
   * Removes one or more CSS class names from a given element.
   * Similar to `_addClass`, it supports custom `removeClass` methods
   * or directly manipulates the `className` property.
   * If `value` is undefined, all classes are removed.
   *
   * @param {HTMLElement} element The DOM element to modify.
   * @param {string}      value   A space-separated string of class names to remove,
   *                              or `undefined` to remove all classes.
   * @returns {HTMLElement}       The modified element.
   */
  var _removeClass = function( element, value ) {
    // If the element has its own `removeClass` method, use it.
    if ( element.removeClass ) {
      element.removeClass( value );
      return element;
    }

    // Proceed with manual class manipulation if `value` is a string or undefined.
    if ( value && typeof value === "string" || value === undefined ) {
      var classNames = ( value || "" ).split( /\s+/ ); // Split input into an array of class names.

      if ( element.nodeType === 1 && element.className ) { // Ensure it's an element with existing classes.
        if ( value ) {
          // Normalize existing class names by padding with spaces and replacing newlines/tabs.
          var className = ( " " + element.className + " " ).replace( /[\n\t]/g, " " );

          // Iterate over the class names to remove.
          for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
            // Replace each class name (padded) with a single space.
            className = className.replace( " " + classNames[ c ] + " ", " " );
          }
          // Update `className`, removing any extra leading/trailing spaces.
          element.className = className.replace( /^\s+|\s+$/g, "" );
        } else {
          element.className = ""; // If `value` is empty/undefined, clear all classes.
        }
      }
    }
    return element; // Return the element for chaining.
  };


  /**
   * Calculates the browser's zoom factor, particularly relevant for accurate
   * positioning in browsers like Internet Explorer when the page is zoomed.
   * It compares the physical pixel width with the CSS pixel width.
   *
   * @returns {number} The zoom factor (e.g., 1 for no zoom, 0.75 for 75% zoom).
   */
  var _getZoomFactor = function( ) {
    var rect
      , physicalWidth
      , logicalWidth
      , zoomFactor = 1 // Default zoom factor is 1 (no zoom).
      ;

    // Use `getBoundingClientRect` for reliable measurements if available.
    if ( typeof document.body.getBoundingClientRect === "function" ) {
      rect = document.body.getBoundingClientRect( );
      physicalWidth = rect.right - rect.left; // Physical width in device pixels.
      logicalWidth = document.body.offsetWidth; // Logical width in CSS pixels.

      // Calculate the zoom factor and round to two decimal places.
      zoomFactor = Math.round( physicalWidth / logicalWidth * 100 ) / 100;
    }
    return zoomFactor; // Return the calculated zoom factor.
  };


  /**
   * Retrieves the absolute position, dimensions, and z-index of a DOM element.
   * This function accounts for page scrolling, document borders, and browser zoom
   * to provide accurate screen coordinates.
   *
   * @param {HTMLElement} obj The DOM element to query.
   * @returns {Object}        An object containing `left`, `top`, `width`, `height`, and `zIndex`.
   */
  var _getDOMObjectPosition = function( obj ) {
    var info = {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      zIndex: 999999999 // A very high default z-index.
    };

    // Get the computed z-index of the element.
    var zi = _getStyle( obj, "z-index" );
    if ( zi && zi !== "auto" ) {
      info.zIndex = parseInt( zi, 10 ); // Parse z-index as an integer.
    }

    // Use `getBoundingClientRect` for precise measurements relative to the viewport.
    if ( obj.getBoundingClientRect ) {
      var rect = obj.getBoundingClientRect( );
      var pageXOffset, pageYOffset, zoomFactor;

      // Get scroll offsets, handling cross-browser differences.
      if ( "pageXOffset" in window && "pageYOffset" in window ) {
        pageXOffset = window.pageXOffset;
        pageYOffset = window.pageYOffset;
      } else {
        zoomFactor = _getZoomFactor( ); // Get zoom factor for IE compatibility.
        pageXOffset = Math.round( document.documentElement.scrollLeft / zoomFactor );
        pageYOffset = Math.round( document.documentElement.scrollTop / zoomFactor );
      }

      // Account for document body's border width.
      var leftBorderWidth = document.documentElement.clientLeft || 0;
      var topBorderWidth = document.documentElement.clientTop || 0;

      // Calculate absolute position on the page.
      info.left = rect.left + pageXOffset - leftBorderWidth;
      info.top = rect.top + pageYOffset - topBorderWidth;

      // Calculate width and height, handling older IE where `rect.width` and `rect.height` might be missing.
      info.width = "width" in rect ? rect.width : rect.right - rect.left;
      info.height = "height" in rect ? rect.height : rect.bottom - rect.top;
    }

    return info; // Return the compiled position and dimension information.
  };


  /**
   * Appends a cache-busting query parameter to a URL if the `useNoCache` option is enabled.
   * This prevents browsers from caching the Flash movie.
   *
   * @param {string} path The original URL path.
   * @returns {string}    A query string segment (e.g., "?nocache=TIMESTAMP" or "&nocache=TIMESTAMP")
   *                      or an empty string if caching is allowed.
   */
  var _noCache = function( path ) {
    var client = ZeroClipboard.prototype._singleton; // Get the active ZeroClipboard instance.

    if ( client.options.useNoCache ) {
      // Determine whether to use '?' or '&' based on existing query parameters.
      return ( path.indexOf( "?" ) >= 0 ? "&nocache=" : "?nocache=" ) + ( new Date ).getTime( );
    } else {
      return ""; // No cache busting.
    }
  };


  /**
   * Converts a given options object into a URL-encoded string suitable for FlashVars.
   * This allows passing configuration data to the embedded Flash movie.
   *
   * @param {Object} options The configuration options object.
   * @returns {string}       A URL-encoded string of key-value pairs (e.g., "key1=value1&key2=value2").
   */
  var _vars = function( options ) {
    var str = [ ]; // Array to hold individual key=value strings.

    // Handle the `trustedDomains` option.
    if ( options.trustedDomains ) {
      var domains;
      if ( typeof options.trustedDomains === "string" && options.trustedDomains ) {
        domains = [ options.trustedDomains ]; // Wrap single string in array.
      } else if ( "length" in options.trustedDomains ) {
        domains = options.trustedDomains; // Assume it's an array-like object.
      }
      str.push( "trustedDomain=" + encodeURIComponent( domains.join( "," ) ) );
    }

    // Handle `amdModuleId` for AMD environments.
    if ( typeof options.amdModuleId === "string" && options.amdModuleId ) {
      str.push( "amdModuleId=" + encodeURIComponent( options.amdModuleId ) );
    }

    // Handle `cjsModuleId` for CommonJS environments.
    if ( typeof options.cjsModuleId === "string" && options.cjsModuleId ) {
      str.push( "cjsModuleId=" + encodeURIComponent( options.cjsModuleId ) );
    }

    return str.join( "&" ); // Join all parameters with an ampersand.
  };


  /**
   * Cross-browser utility to find the index of an element within an array.
   * Uses the native `indexOf` method if available, otherwise falls back to a manual loop.
   *
   * @param {*}   elem  The element to search for.
   * @param {Array} array The array to search within.
   * @returns {number}  The index of the element, or -1 if not found.
   */
  var _inArray = function( elem, array ) {
    if ( array.indexOf ) {
      return array.indexOf( elem ); // Use native method.
    }
    // Manual loop for older browsers.
    for ( var i = 0, length = array.length; i < length; i++ ) {
      if ( array[ i ] === elem ) {
        return i;
      }
    }
    return -1; // Element not found.
  };


  /**
   * Prepares a given input of elements for "gluing" by ensuring it's an array.
   * Throws an error if a string (implying a CSS selector) is passed, as ZeroClipboard
   * expects actual DOM elements.
   *
   * @param {HTMLElement|Array<HTMLElement>} elements The element(s) to prepare.
   * @returns {Array<HTMLElement>}                   An array of elements.
   * @throws {TypeError}                             If a string is passed as `elements`.
   */
  var _prepGlue = function( elements ) {
    if ( typeof elements === "string" ) {
      throw new TypeError( "ZeroClipboard doesn't accept query strings." );
    }
    // If it's a single element (not array-like), wrap it in an array.
    if ( !elements.length ) {
      return [ elements ];
    }
    return elements; // Otherwise, assume it's already an array-like object.
  };


  /**
   * Dispatches a callback function, with an option to make it asynchronous.
   * Asynchronous dispatch uses `setTimeout(..., 0)` to prevent blocking the
   * main thread, especially important for Flash callbacks.
   *
   * @param {Function} func     The callback function to execute.
   * @param {HTMLElement} element The DOM element context for the callback.
   * @param {Object}   instance The ZeroClipboard instance.
   * @param {Array}    args     Arguments to pass to the callback.
   * @param {boolean}  async    If `true`, the callback is dispatched asynchronously.
   */
  var _dispatchCallback = function( func, element, instance, args, async ) {
    if ( async ) {
      window.setTimeout( function( ) {
        func.call( element, instance, args ); // Call asynchronously.
      }, 0 );
    } else {
      func.call( element, instance, args ); // Call synchronously.
    }
  };


  /**
   * ZeroClipboard constructor function.
   * This acts as a singleton: subsequent calls will return the existing instance.
   * It initializes options, sets up event handlers, and creates the Flash bridge
   * if Flash is detected.
   *
   * @param {HTMLElement|Array<HTMLElement>} elements Optional: Elements to initially "glue".
   * @param {Object}                         options  Optional: Configuration options to override defaults.
   */
  var ZeroClipboard = function( elements, options ) {
    // If elements are provided on construction, glue them immediately.
    if ( elements ) {
      ( ZeroClipboard.prototype._singleton || this ).glue( elements );
    }

    // If a singleton instance already exists, return it, ensuring only one instance.
    if ( ZeroClipboard.prototype._singleton ) {
      return ZeroClipboard.prototype._singleton;
    }

    // If no singleton exists, establish this instance as the new singleton.
    ZeroClipboard.prototype._singleton = this;

    this.options = {}; // Initialize the options object for this instance.

    // Populate options with default values.
    for ( var kd in _defaults ) {
      this.options[ kd ] = _defaults[ kd ];
    }

    // Override default options with any provided `options`.
    for ( var ko in options ) {
      this.options[ ko ] = options[ ko ];
    }

    this.handlers = {}; // Initialize an object to store event handlers.

    // If Flash support is detected, create the Flash bridge.
    if ( ZeroClipboard.detectFlashSupport( ) ) {
      _bridge( );
    }
  };


  var currentElement;   // Holds the DOM element currently being hovered over or interacted with.
  var gluedElements = []; // An array of all DOM elements that ZeroClipboard is "glued" to.


  /**
   * Sets the currently active element that the Flash movie should interact with.
   * This involves repositioning the Flash movie over the new element and
   * updating its title attribute for accessibility.
   *
   * @param {HTMLElement} element The new element to become the current target.
   */
  ZeroClipboard.prototype.setCurrent = function( element ) {
    currentElement = element; // Update the reference to the current element.
    this.reposition( );       // Reposition the invisible Flash movie over this element.

    var titleAttr = element.getAttribute( "title" ); // Get the element's title attribute.
    if ( titleAttr ) {
      this.setTitle( titleAttr ); // Set the Flash movie's title for screen readers.
    }

    // Determine if a hand cursor should be forced based on options or element's style.
    var useHandCursor = this.options.forceHandCursor === true || _getStyle( element, "cursor" ) === "pointer";
    _setHandCursor.call( this, useHandCursor ); // Update the Flash movie's cursor.
  };


  /**
   * Sets the text data that will be copied to the clipboard when the user
   * clicks the Flash movie.
   *
   * @param {string} newText The text string to be copied.
   */
  ZeroClipboard.prototype.setText = function( newText ) {
    if ( newText && newText !== "" ) {
      this.options.text = newText; // Store the text in the instance's options.
      if ( this.ready( ) ) {
        this.flashBridge.setText( newText ); // Send the text to the Flash movie if it's ready.
      }
    }
  };


  /**
   * Sets the `title` attribute of the HTML container that holds the Flash movie.
   * This is primarily for accessibility, providing a tooltip for the invisible Flash element.
   *
   * @param {string} newTitle The title string to set.
   */
  ZeroClipboard.prototype.setTitle = function( newTitle ) {
    if ( newTitle && newTitle !== "" ) {
      this.htmlBridge.setAttribute( "title", newTitle ); // Update the HTML bridge's title.
    }
  };


  /**
   * Sets the dimensions of the Flash movie.
   * This is typically called internally during `reposition` to match the target element's size.
   *
   * @param {number} width  The desired width in pixels.
   * @param {number} height The desired height in pixels.
   */
  ZeroClipboard.prototype.setSize = function( width, height ) {
    if ( this.ready( ) ) {
      this.flashBridge.setSize( width, height ); // Send new dimensions to the Flash movie.
    }
  };


  /**
   * Public method to explicitly enable or disable the hand cursor over the Flash movie.
   * This overrides any automatic cursor detection.
   *
   * @param {boolean} enabled `true` to force a hand cursor, `false` to disable.
   */
  ZeroClipboard.prototype.setHandCursor = function( enabled ) {
    enabled = typeof enabled === "boolean" ? enabled : !!enabled; // Coerce to boolean.
    _setHandCursor.call( this, enabled );                          // Call the internal helper.
    this.options.forceHandCursor = enabled;                        // Update the instance option.
  };


  /**
   * Internal helper function to communicate the hand cursor state to the Flash movie.
   *
   * @param {boolean} enabled `true` to enable, `false` to disable.
   */
  var _setHandCursor = function( enabled ) {
    if ( this.ready( ) ) {
      this.flashBridge.setHandCursor( enabled ); // Send the cursor state to Flash.
    }
  };


  ZeroClipboard.version = "1.2.0-beta.4"; // The current version of the ZeroClipboard library.


  /**
   * Default configuration options for all ZeroClipboard instances.
   * These can be overridden during instantiation or globally with `setDefaults`.
   */
  var _defaults = {
    moviePath: "ZeroClipboard.swf",         // Path to the Flash SWF file.
    trustedDomains: null,                   // Domains allowed to communicate with Flash.
    text: null,                             // Default text to copy if none specified.
    hoverClass: "zeroclipboard-is-hover",   // CSS class added on mouseover.
    activeClass: "zeroclipboard-is-active", // CSS class added on mousedown.
    allowScriptAccess: "sameDomain",        // Flash security setting for script access.
    useNoCache: true,                       // Whether to append a cache-buster to moviePath.
    forceHandCursor: false                  // Whether to always show hand cursor over Flash.
  };


  /**
   * Globally sets or overrides default options for ZeroClipboard.
   * Any new instances will inherit these updated defaults.
   *
   * @param {Object} options An object containing new default options.
   */
  ZeroClipboard.setDefaults = function( options ) {
    for ( var ko in options ) {
      _defaults[ ko ] = options[ ko ]; // Merge provided options into the global defaults.
    }
  };


  /**
   * Destroys the ZeroClipboard singleton instance.
   * This removes all glued elements, detaches event handlers,
   * and removes the Flash movie from the DOM.
   */
  ZeroClipboard.destroy = function( ) {
    // Unglue all elements that were managed by the singleton.
    ZeroClipboard.prototype._singleton.unglue( gluedElements );

    var bridge = ZeroClipboard.prototype._singleton.htmlBridge; // Get the HTML container for the Flash movie.

    // Remove the HTML container (and thus the Flash movie) from its parent.
    bridge.parentNode.removeChild( bridge );

    // Delete the singleton reference to allow garbage collection and new instantiation.
    delete ZeroClipboard.prototype._singleton;
  };


  /**
   * Detects whether Adobe Flash Player is installed and supported by the browser.
   *
   * @returns {boolean} `true` if Flash is detected, `false` otherwise.
   */
  ZeroClipboard.detectFlashSupport = function( ) {
    var hasFlash = false; // Assume no Flash initially.

    // Check for ActiveXObject, typically for Internet Explorer.
    if ( typeof ActiveXObject === "function" ) {
      try {
        if ( new ActiveXObject( "ShockwaveFlash.ShockwaveFlash" ) ) {
          hasFlash = true;
        }
      } catch ( error ) {
        // Ignore errors if ActiveXObject creation fails.
      }
    }

    // Check `navigator.mimeTypes` for other browsers (Firefox, Chrome, Safari).
    if ( !hasFlash && navigator.mimeTypes[ "application/x-shockwave-flash" ] ) {
      hasFlash = true;
    }

    return hasFlash; // Return the result of Flash detection.
  };


  var _amdModuleId = null; // Variable to store the AMD module ID if running in an AMD environment.
  var _cjsModuleId = null; // Variable to store the CommonJS module ID if running in a CommonJS environment.


  /**
   * Creates and embeds the invisible Flash movie (SWF) into the DOM.
   * This function is called only once when ZeroClipboard is initialized and Flash is supported.
   * It constructs the necessary HTML `<object>` and `<embed>` tags.
   */
  var _bridge = function( ) {
    var client = ZeroClipboard.prototype._singleton; // Get the active ZeroClipboard instance.
    // Check if the HTML container for the Flash bridge already exists.
    var container = document.getElementById( "global-zeroclipboard-html-bridge" );

    if ( !container ) {
      // If the container does not exist, create it.

      var opts = {}; // Temporary options object for FlashVars.
      // Copy current client options.
      for ( var ko in client.options ) {
        opts[ ko ] = client.options[ ko ];
      }
      opts.amdModuleId = _amdModuleId; // Add AMD module ID to FlashVars.
      opts.cjsModuleId = _cjsModuleId; // Add CommonJS module ID to FlashVars.

      var flashvars = _vars( opts ); // Generate the FlashVars string from options.

      // Construct the HTML for embedding the Flash movie.
      // Uses both <object> (for IE) and <embed> (for other browsers) tags.
      var html = '      <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" id="global-zeroclipboard-flash-bridge" width="100%" height="100%">         <param name="movie" value="' + client.options.moviePath + _noCache( client.options.moviePath ) + '"/>         <param name="allowScriptAccess" value="' + client.options.allowScriptAccess + '"/>         <param name="scale" value="exactfit"/>         <param name="loop" value="false"/>         <param name="menu" value="false"/>         <param name="quality" value="best" />         <param name="bgcolor" value="#ffffff"/>         <param name="wmode" value="transparent"/>         <param name="flashvars" value="' + flashvars + '"/>         <embed src="' + client.options.moviePath + _noCache( client.options.moviePath ) + '"           loop="false" menu="false"           quality="best" bgcolor="#ffffff"           width="100%" height="100%"           name="global-zeroclipboard-flash-bridge"           allowScriptAccess="always"           allowFullScreen="false"           type="application/x-shockwave-flash"           wmode="transparent"           pluginspage="http://www.macromedia.com/go/getflashplayer"           flashvars="' + flashvars + '"           scale="exactfit">         </embed>       </object>';

      // Create the HTML container `div` element.
      container = document.createElement( "div" );
      container.id = "global-zeroclipboard-html-bridge";
      container.setAttribute( "class", "global-zeroclipboard-container" );
      container.setAttribute( "data-clipboard-ready", false );

      // Apply styles to make the container invisible and positioned off-screen initially.
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.width = "15px";
      container.style.height = "15px";
      container.style.zIndex = "9999"; // Ensure it's above most other content.

      container.innerHTML = html; // Inject the Flash embedding HTML.
      document.body.appendChild( container ); // Append the container to the document body.
    }

    client.htmlBridge = container; // Store reference to the HTML container.
    // Store reference to the Flash movie object itself, handling cross-browser access methods.
    client.flashBridge = document[ "global-zeroclipboard-flash-bridge" ] || container.children[ 0 ].lastElementChild;
  };


  /**
   * Resets the Flash bridge's state: moves it off-screen, clears its title and data,
   * and removes the active class from the previously current element.
   * This effectively "unhighlights" the copy button.
   */
  ZeroClipboard.prototype.resetBridge = function( ) {
    this.htmlBridge.style.left = "-9999px"; // Move container off-screen.
    this.htmlBridge.style.top = "-9999px";  // Move container off-screen.
    this.htmlBridge.removeAttribute( "title" ); // Clear the title attribute.
    this.htmlBridge.removeAttribute( "data-clipboard-text" ); // Clear any clipboard text data.

    // Remove the active CSS class from the element that was last interacted with.
    _removeClass( currentElement, this.options.activeClass );

    currentElement = null;   // Clear the reference to the current element.
    this.options.text = null; // Clear any stored text data in options.
  };


  /**
   * Checks if the Flash movie embedded in the bridge is fully loaded and ready
   * to receive commands.
   *
   * @returns {boolean} `true` if the Flash movie is ready, `false` otherwise.
   */
  ZeroClipboard.prototype.ready = function( ) {
    var ready = this.htmlBridge.getAttribute( "data-clipboard-ready" ); // Get the ready status from the data attribute.
    return ready === "true" || ready === true;                           // Return as a boolean.
  };


  /**
   * Repositions the invisible Flash movie over the `currentElement`.
   * This ensures that clicks on the `currentElement` are intercepted by Flash.
   */
  ZeroClipboard.prototype.reposition = function( ) {
    if ( !currentElement ) {
      return false; // No element to reposition over.
    }

    // Get the absolute position and dimensions of the `currentElement`.
    var pos = _getDOMObjectPosition( currentElement );

    // Apply the position and dimensions to the HTML container of the Flash movie.
    this.htmlBridge.style.top = pos.top + "px";
    this.htmlBridge.style.left = pos.left + "px";
    this.htmlBridge.style.width = pos.width + "px";
    this.htmlBridge.style.height = pos.height + "px";
    this.htmlBridge.style.zIndex = pos.zIndex + 1; // Ensure Flash is visually above the target element.

    // Also inform the Flash movie itself of its new size.
    this.setSize( pos.width, pos.height );
  };


  /**
   * Static method called by the Flash movie to dispatch events back to JavaScript.
   * This acts as the entry point for Flash-to-JavaScript communication.
   *
   * @param {string} eventName The name of the event dispatched by Flash.
   * @param {Object} args      Optional arguments associated with the event.
   */
  ZeroClipboard.dispatch = function( eventName, args ) {
    ZeroClipboard.prototype._singleton.receiveEvent( eventName, args ); // Delegate to the singleton instance.
  };


  /**
   * Registers an event handler for one or more ZeroClipboard events.
   * Event names can be space-separated.
   *
   * @param {string}   eventName A space-separated string of event names (e.g., "ready mouseover").
   * @param {Function} func      The callback function to execute when the event fires.
   */
  ZeroClipboard.prototype.on = function( eventName, func ) {
    var events = eventName.toString( ).split( /\s/g ); // Split multiple event names.

    for ( var i = 0; i < events.length; i++ ) {
      eventName = events[ i ].toLowerCase( ).replace( /^on/, "" ); // Normalize event name (e.g., "onLoad" -> "load").
      if ( !this.handlers[ eventName ] ) {
        this.handlers[ eventName ] = func; // Store the handler if not already set for this event.
      }
    }

    // Special case: if a 'noflash' handler is registered and Flash is not detected, trigger it immediately.
    if ( this.handlers.noflash && !ZeroClipboard.detectFlashSupport( ) ) {
      this.receiveEvent( "onNoFlash", null );
    }
  };


  // Alias `addEventListener` to `on` for consistency with DOM event models.
  ZeroClipboard.prototype.addEventListener = ZeroClipboard.prototype.on;


  /**
   * Unregisters an event handler for one or more ZeroClipboard events.
   *
   * @param {string}   eventName A space-separated string of event names.
   * @param {Function} func      The specific callback function to remove.
   */
  ZeroClipboard.prototype.off = function( eventName, func ) {
    var events = eventName.toString( ).split( /\s/g ); // Split multiple event names.

    for ( var i = 0; i < events.length; i++ ) {
      eventName = events[ i ].toLowerCase( ).replace( /^on/, "" ); // Normalize event name.
      for ( var event in this.handlers ) {
        // Find the specific handler to remove based on event name and function reference.
        if ( event === eventName && this.handlers[ event ] === func ) {
          delete this.handlers[ event ]; // Remove the handler.
        }
      }
    }
  };


  // Alias `removeEventListener` to `off`.
  ZeroClipboard.prototype.removeEventListener = ZeroClipboard.prototype.off;


  /**
   * Core event reception and processing method for events dispatched from the Flash movie.
   * This method handles various Flash events, updates the UI, prepares data, and
   * dispatches to user-defined callbacks.
   *
   * @param {string} eventName The raw event name received from Flash (e.g., "onLoad", "onMouseOver").
   * @param {Object} args      Optional arguments passed from Flash.
   */
  ZeroClipboard.prototype.receiveEvent = function( eventName, args ) {
    eventName = eventName.toString( ).toLowerCase( ).replace( /^on/, "" ); // Normalize event name.
    var element = currentElement; // The DOM element currently associated with the Flash interaction.
    var performCallbackAsync = true; // Flag to control whether the user callback is async or sync.

    switch ( eventName ) {
      case "load":
        // Handle the Flash movie's load event.
        // Check Flash version; if too old (less than 10), trigger 'onWrongFlash'.
        if ( args && parseFloat( args.flashVersion.replace( ",", "." ).replace( /[^0-9\.]/gi, "" ) ) < 10 ) {
          this.receiveEvent( "onWrongFlash", {
            flashVersion: args.flashVersion
          } );
          return; // Stop processing this event.
        }
        this.htmlBridge.setAttribute( "data-clipboard-ready", true ); // Mark the bridge as ready.
        break;

      case "mouseover":
        // Add the hover class to the current element.
        _addClass( element, this.options.hoverClass );
        break;

      case "mouseout":
        // Remove the hover class and reset the bridge (move off-screen).
        _removeClass( element, this.options.hoverClass );
        this.resetBridge( );
        break;

      case "mousedown":
        // Add the active class to the current element.
        _addClass( element, this.options.activeClass );
        break;

      case "mouseup":
        // Remove the active class.
        _removeClass( element, this.options.activeClass );
        break;

      case "datarequested":
        // Flash requests data to copy.
        var targetId = element.getAttribute( "data-clipboard-target" ) // Get ID of an alternative target element.
          , targetEl = !targetId ? null : document.getElementById( targetId ) // Find that target element.
          ;

        if ( targetEl ) {
          // If a target element is specified, get its value (for inputs) or text content.
          var textContent = targetEl.value || targetEl.textContent || targetEl.innerText;
          if ( textContent ) {
            this.setText( textContent ); // Set the text to be copied.
          }
        } else {
          // Otherwise, look for `data-clipboard-text` attribute on the `currentElement`.
          var defaultText = element.getAttribute( "data-clipboard-text" );
          if ( defaultText ) {
            this.setText( defaultText ); // Set the text to be copied.
          }
        }
        performCallbackAsync = false; // This callback should be synchronous to provide data to Flash immediately.
        break;

      case "complete":
        // After a successful copy, clear any stored text.
        this.options.text = null;
        break;
    }

    // If a user-defined handler exists for this event.
    if ( this.handlers[ eventName ] ) {
      var func = this.handlers[ eventName ]; // Get the handler function.

      // If the handler is a string, attempt to resolve it as a global function.
      if ( typeof func === "string" && typeof window[ func ] === "function" ) {
        func = window[ func ];
      }

      // If the resolved handler is a function, dispatch it.
      if ( typeof func === "function" ) {
        _dispatchCallback( func, element, this, args, performCallbackAsync );
      }
    }
  };


  /**
   * "Glues" one or more DOM elements, making them interactive with ZeroClipboard.
   * When a glued element is moused over, the Flash movie will be positioned over it.
   *
   * @param {HTMLElement|Array<HTMLElement>} elements The element(s) to glue.
   */
  ZeroClipboard.prototype.glue = function( elements ) {
    elements = _prepGlue( elements ); // Normalize input into an array of elements.

    for ( var i = 0; i < elements.length; i++ ) {
      // Only add if the element isn't already glued.
      if ( _inArray( elements[ i ], gluedElements ) == -1 ) {
        gluedElements.push( elements[ i ] );                            // Add to the list of glued elements.
        _addEventHandler( elements[ i ], "mouseover", _elementMouseOver ); // Attach mouseover listener.
      }
    }
  };


  /**
   * "Unglies" one or more DOM elements, removing their ZeroClipboard functionality.
   * The Flash movie will no longer interact with these elements.
   *
   * @param {HTMLElement|Array<HTMLElement>} elements The element(s) to unglue.
   */
  ZeroClipboard.prototype.unglue = function( elements ) {
    elements = _prepGlue( elements ); // Normalize input into an array of elements.

    for ( var i = 0; i < elements.length; i++ ) {
      _removeEventHandler( elements[ i ], "mouseover", _elementMouseOver ); // Remove the mouseover listener.
      var arrayIndex = _inArray( elements[ i ], gluedElements );         // Find the element in the glued list.
      if ( arrayIndex != -1 ) {
        gluedElements.splice( arrayIndex, 1 ); // Remove the element from the glued list.
      }
    }
  };


  // Module export logic for various environments (AMD, CommonJS, Global).
  // AMD (Asynchronous Module Definition) support, e.g., RequireJS.
  if ( typeof define === "function" && define.amd ) {
    define( [ "require", "exports", "module" ], function( require, exports, module ) {
      _amdModuleId = module && module.id || null; // Store the AMD module ID.
      return ZeroClipboard;                       // Export ZeroClipboard as the module.
    } );
  }
  // CommonJS support, e.g., Node.js, Browserify, Webpack.
  else if ( typeof module !== "undefined" && module ) {
    _cjsModuleId = module.id || null; // Store the CommonJS module ID.
    module.exports = ZeroClipboard;     // Export ZeroClipboard.
  }
  // Global scope (browser environment without a module loader).
  else {
    window.ZeroClipboard = ZeroClipboard; // Attach ZeroClipboard to the global window object.
  }

} )( ); // End of the Immediately Invoked Function Expression (IIFE).