/*!
 * jQuery Migrate - v1.2.1 - 2013-05-08
 * https://github.com/jquery/jquery-migrate
 * Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors; Licensed MIT
 *
 * This is a Type I clone, preserving all original logic and structure.
 * Only whitespace and comments have been altered.
 */
( function( jQuery, window, undefined ) {

  // See http://bugs.jquery.com/ticket/13335 for context
  // "use strict"; // This line was commented out in the original, keeping it that way.

  var warnedAbout = {}; // Object to track warnings already issued.

  // List of warnings already given; public and read-only externally.
  jQuery.migrateWarnings = [];

  // Set to true to prevent console output; migrateWarnings array is still maintained.
  // jQuery.migrateMute = false; // This line was commented out in the original.

  // Display a message on the console so developers are aware that jQuery Migrate is active.
  if ( !jQuery.migrateMute && window.console && window.console.log ) {
    window.console.log( "JQMIGRATE: Logging is active" );
  }

  // Set to false to disable stack traces that appear with warnings.
  if ( jQuery.migrateTrace === undefined ) {
    jQuery.migrateTrace = true;
  }

  // Resets any warnings already given; this is a public function.
  jQuery.migrateReset = function() {
    warnedAbout = {}; // Clear the object of warnings.
    jQuery.migrateWarnings.length = 0; // Empty the warnings array.
  };

  // Function to issue a migration warning.
  function migrateWarn( msg ) {
    var console = window.console; // Get a reference to the console object.
    if ( !warnedAbout[ msg ] ) { // Check if this message has not been warned about yet.
      warnedAbout[ msg ] = true; // Mark this message as warned.
      jQuery.migrateWarnings.push( msg ); // Add the message to the public warnings array.
      if ( console && console.warn && !jQuery.migrateMute ) { // If console.warn exists and not muted.
        console.warn( "JQMIGRATE: " + msg ); // Log the warning.
        if ( jQuery.migrateTrace && console.trace ) { // If tracing is enabled and console.trace exists.
          console.trace(); // Output a stack trace.
        }
      }
    }
  }

  // Function to warn about deprecated properties.
  function migrateWarnProp( obj, prop, value, msg ) {
    if ( Object.defineProperty ) {
      // For ES5 browsers (excluding old IE), warn if code tries to access the property;
      // allow the property to be overwritten in case another plugin needs it.
      try {
        Object.defineProperty( obj, prop, {
          configurable: true,
          enumerable: true,
          get: function() {
            migrateWarn( msg ); // Warn when the property is accessed.
            return value;
          },
          set: function( newValue ) {
            migrateWarn( msg ); // Warn when the property is set.
            value = newValue;
          }
        } );
        return;
      } catch( err ) {
        // IE8 is problematic with Object.defineProperty, so we can't warn there effectively.
      }
    }

    // For non-ES5 or broken browsers, simply set the property.
    jQuery._definePropertyBroken = true;
    obj[ prop ] = value;
  }

  // Check for quirks mode.
  if ( document.compatMode === "BackCompat" ) {
    // jQuery has never officially supported or been tested in Quirks Mode.
    migrateWarn( "jQuery is not compatible with Quirks Mode" );
  }


  var attrFn = jQuery( "<input/>", { size: 1 } ).attr( "size" ) && jQuery.attrFn, // Check for attrFn existence.
      oldAttr = jQuery.attr, // Store original jQuery.attr.
      valueAttrGet = jQuery.attrHooks.value && jQuery.attrHooks.value.get || // Get original value attrHook getter.
        function() { return null; },
      valueAttrSet = jQuery.attrHooks.value && jQuery.attrHooks.value.set || // Get original value attrHook setter.
        function() { return undefined; },
      rnoType = /^(?:input|button)$/i, // Regex for input and button elements.
      rnoAttrNodeType = /^[238]$/, // Regex for node types that are not elements (2=ATTRIBUTE_NODE, 3=TEXT_NODE, 8=COMMENT_NODE).
      rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i, // Regex for boolean attributes.
      ruseDefault = /^(?:checked|selected)$/i; // Regex for boolean attributes that might use property instead of attribute.

  // jQuery.attrFn is deprecated.
  migrateWarnProp( jQuery, "attrFn", attrFn || {}, "jQuery.attrFn is deprecated" );

  jQuery.attr = function( elem, name, value, pass ) {
    var lowerName = name.toLowerCase(), // Convert attribute name to lowercase.
        nType = elem && elem.nodeType; // Get node type if element exists.

    if ( pass ) {
      // The 'pass' argument is used internally. We only warn for newer jQuery versions
      // where this argument is no longer part of the formal parameters.
      if ( oldAttr.length < 4 ) {
        migrateWarn( "jQuery.fn.attr( props, pass ) is deprecated" );
      }
      // If element is valid, not an attribute node, and attrFn or jQuery.fn[name] is a function.
      if ( elem && !rnoAttrNodeType.test( nType ) &&
          ( attrFn ? name in attrFn : jQuery.isFunction( jQuery.fn[ name ] ) ) ) {
        return jQuery( elem )[ name ]( value ); // Call the corresponding jQuery method.
      }
    }

    // Warn if the user attempts to set 'type', as it causes issues in IE 6/7/8.
    // By checking for `elem.parentNode`, we avoid warning for newly created disconnected elements.
    if ( name === "type" && value !== undefined && rnoType.test( elem.nodeName ) && elem.parentNode ) {
      migrateWarn( "Can't change the 'type' of an input or button in IE 6/7/8" );
    }

    // Restore boolHook for synchronization of boolean properties/attributes.
    if ( !jQuery.attrHooks[ lowerName ] && rboolean.test( lowerName ) ) {
      jQuery.attrHooks[ lowerName ] = {
        get: function( elem, name ) {
          // Align boolean attributes with their corresponding DOM properties.
          // Fall back to attribute presence in cases where some booleans are not directly supported as properties.
          var attrNode,
              property = jQuery.prop( elem, name );
          return property === true || typeof property !== "boolean" &&
            ( attrNode = elem.getAttributeNode( name ) ) && attrNode.nodeValue !== false ?
            name.toLowerCase() :
            undefined;
        },
        set: function( elem, value, name ) {
          var propName;
          if ( value === false ) {
            // Remove boolean attributes when set to false.
            jQuery.removeAttr( elem, name );
          } else {
            // Value must be true here, as we know it's a boolean type and not false.
            // Set boolean attributes to their own name and update the DOM property.
            propName = jQuery.propFix[ name ] || name;
            if ( propName in elem ) {
              // Only set the IDL property specifically if it already exists on the element.
              elem[ propName ] = true;
            }

            elem.setAttribute( name, name.toLowerCase() );
          }
          return name;
        }
      };

      // Warn specifically for attributes that can remain distinct from their properties post-jQuery 1.9.
      if ( ruseDefault.test( lowerName ) ) {
        migrateWarn( "jQuery.fn.attr('" + lowerName + "') may use property instead of attribute" );
      }
    }

    return oldAttr.call( jQuery, elem, name, value ); // Call the original attr method.
  };

  // attrHooks for 'value' property.
  jQuery.attrHooks.value = {
    get: function( elem, name ) {
      var nodeName = ( elem.nodeName || "" ).toLowerCase(); // Get element's node name in lowercase.
      if ( nodeName === "button" ) {
        return valueAttrGet.apply( this, arguments ); // Use original getter for buttons.
      }
      if ( nodeName !== "input" && nodeName !== "option" ) {
        migrateWarn( "jQuery.fn.attr('value') no longer gets properties" );
      }
      return name in elem ? // Check if 'name' (which is 'value' here) is a property of the element.
        elem.value : // Return the property value.
        null;
    },
    set: function( elem, value ) {
      var nodeName = ( elem.nodeName || "" ).toLowerCase(); // Get element's node name in lowercase.
      if ( nodeName === "button" ) {
        return valueAttrSet.apply( this, arguments ); // Use original setter for buttons.
      }
      if ( nodeName !== "input" && nodeName !== "option" ) {
        migrateWarn( "jQuery.fn.attr('value', val) no longer sets properties" );
      }
      // This function does not return a value so that setAttribute is also utilized.
      elem.value = value;
    }
  };


  var matched, browser, // Variables for browser detection.
      oldInit = jQuery.fn.init, // Store original jQuery.fn.init.
      oldParseJSON = jQuery.parseJSON, // Store original jQuery.parseJSON.
      // Note: XSS check is performed below after the string has been trimmed.
      rquickExpr = /^([^<]*)(<[\w\W]+>)([^>]*)$/; // Regex for quick HTML string detection.

  // $(html) "looks like html" rule change.
  jQuery.fn.init = function( selector, context, rootjQuery ) {
    var match; // Variable to store regex match result.

    if ( selector && typeof selector === "string" && !jQuery.isPlainObject( context ) &&
        ( match = rquickExpr.exec( jQuery.trim( selector ) ) ) && match[ 0 ] ) {
      // This appears to be an HTML string according to the "old" rules; is it still valid?
      if ( selector.charAt( 0 ) !== "<" ) {
        migrateWarn( "$(html) HTML strings must start with '<' character" );
      }
      if ( match[ 3 ] ) {
        migrateWarn( "$(html) HTML text after last tag is ignored" );
      }
      // Consistent rejection of any HTML-like string that begins with a hash character (#9521).
      // Be aware that this might break jQuery 1.6.x code that would otherwise function correctly.
      if ( match[ 0 ].charAt( 0 ) === "#" ) {
        migrateWarn( "HTML string cannot start with a '#' character" );
        jQuery.error( "JQMIGRATE: Invalid selector string (XSS)" );
      }
      // Now process using more lenient rules; allow pre-1.8 behavior.
      if ( context && context.context ) {
        // If context is a jQuery object, parseHTML expects a DOM object.
        context = context.context;
      }
      if ( jQuery.parseHTML ) {
        return oldInit.call( this, jQuery.parseHTML( match[ 2 ], context, true ),
            context, rootjQuery );
      }
    }
    return oldInit.apply( this, arguments ); // Call the original init method.
  };
  jQuery.fn.init.prototype = jQuery.fn; // Ensure prototype chain is maintained.

  // Allow $.parseJSON(falsy_value) to return null.
  jQuery.parseJSON = function( json ) {
    if ( !json && json !== null ) { // If json is falsy but not null.
      migrateWarn( "jQuery.parseJSON requires a valid JSON string" );
      return null;
    }
    return oldParseJSON.apply( this, arguments ); // Call the original parseJSON method.
  };

  jQuery.uaMatch = function( ua ) {
    ua = ua.toLowerCase(); // Convert user agent string to lowercase.

    var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) || // Match Chrome.
      /(webkit)[ \/]([\w.]+)/.exec( ua ) || // Match Webkit.
      /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) || // Match Opera.
      /(msie) ([\w.]+)/.exec( ua ) || // Match MSIE.
      ua.indexOf( "compatible" ) < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) || // Match Mozilla.
      []; // Default to an empty array if no match.

    return {
      browser: match[ 1 ] || "", // Browser name.
      version: match[ 2 ] || "0" // Browser version.
    };
  };

  // Do not overwrite any existing jQuery.browser object if it's different.
  if ( !jQuery.browser ) {
    matched = jQuery.uaMatch( navigator.userAgent ); // Perform user agent matching.
    browser = {}; // Initialize browser object.

    if ( matched.browser ) {
      browser[ matched.browser ] = true; // Set browser flag.
      browser.version = matched.version; // Set browser version.
    }

    // Chrome is Webkit, but Webkit is also Safari.
    if ( browser.chrome ) {
      browser.webkit = true;
    } else if ( browser.webkit ) {
      browser.safari = true;
    }

    jQuery.browser = browser; // Assign the detected browser object to jQuery.
  }

  // Warn if code tries to access jQuery.browser, as it's deprecated.
  migrateWarnProp( jQuery, "browser", jQuery.browser, "jQuery.browser is deprecated" );

  jQuery.sub = function() {
    function jQuerySub( selector, context ) {
      return new jQuerySub.fn.init( selector, context );
    }
    jQuery.extend( true, jQuerySub, this ); // Extend jQuerySub with properties from 'this'.
    jQuerySub.superclass = this; // Set superclass reference.
    jQuerySub.fn = jQuerySub.prototype = this(); // Set prototype and fn property.
    jQuerySub.fn.constructor = jQuerySub; // Correct the constructor.
    jQuerySub.sub = this.sub; // Inherit the sub method.
    jQuerySub.fn.init = function init( selector, context ) {
      if ( context && context instanceof jQuery && !( context instanceof jQuerySub ) ) {
        context = jQuerySub( context ); // Wrap context in jQuerySub if it's a jQuery object but not a jQuerySub instance.
      }

      return jQuery.fn.init.call( this, selector, context, rootjQuerySub ); // Call the original jQuery.fn.init.
    };
    jQuerySub.fn.init.prototype = jQuerySub.fn; // Ensure prototype chain is maintained for init.
    var rootjQuerySub = jQuerySub( document ); // Create a new jQuerySub instance for the document.
    migrateWarn( "jQuery.sub() is deprecated" ); // Warn about jQuery.sub() deprecation.
    return jQuerySub;
  };


  // Ensure that $.ajax uses the new parseJSON defined in core.js.
  jQuery.ajaxSetup( {
    converters: {
      "text json": jQuery.parseJSON // Set JSON converter to the migrated parseJSON.
    }
  } );


  var oldFnData = jQuery.fn.data; // Store original jQuery.fn.data.

  jQuery.fn.data = function( name ) {
    var ret, evt,
        elem = this[ 0 ]; // Get the first element in the jQuery collection.

    // Handles jQuery 1.7 (which has this behavior) and 1.8 (which does not).
    if ( elem && name === "events" && arguments.length === 1 ) {
      ret = jQuery.data( elem, name ); // Get data using jQuery.data.
      evt = jQuery._data( elem, name ); // Get data using internal jQuery._data.
      if ( ( ret === undefined || ret === evt ) && evt !== undefined ) {
        migrateWarn( "Use of jQuery.fn.data('events') is deprecated" );
        return evt;
      }
    }
    return oldFnData.apply( this, arguments ); // Call the original data method.
  };


  var rscriptType = /\/(java|ecma)script/i, // Regex for script types.
      oldSelf = jQuery.fn.andSelf || jQuery.fn.addBack; // Store original andSelf or addBack.

  jQuery.fn.andSelf = function() {
    migrateWarn( "jQuery.fn.andSelf() replaced by jQuery.fn.addBack()" ); // Warn about deprecation.
    return oldSelf.apply( this, arguments ); // Call the stored method.
  };

  // Since jQuery.clean was used internally on older versions, we only shim it if it's missing.
  if ( !jQuery.clean ) {
    jQuery.clean = function( elems, context, fragment, scripts ) {
      // Set context according to jQuery 1.8 logic.
      context = context || document;
      context = !context.nodeType && context[ 0 ] || context;
      context = context.ownerDocument || context;

      migrateWarn( "jQuery.clean() is deprecated" ); // Warn about jQuery.clean() deprecation.

      var i, elem, handleScript, jsTags,
          ret = []; // Array to hold processed elements.

      jQuery.merge( ret, jQuery.buildFragment( elems, context ).childNodes ); // Merge child nodes into ret.

      // Complex logic directly from jQuery 1.8.
      if ( fragment ) {
        // Special handling for each script element.
        handleScript = function( elem ) {
          // Check if the script is considered executable.
          if ( !elem.type || rscriptType.test( elem.type ) ) {
            // Detach the script and store it in the 'scripts' array (if provided) or append to fragment.
            // Return truthy to indicate it has been handled.
            return scripts ?
              scripts.push( elem.parentNode ? elem.parentNode.removeChild( elem ) : elem ) :
              fragment.appendChild( elem );
          }
        };

        for ( i = 0; ( elem = ret[ i ] ) != null; i++ ) {
          // Check if we're done after processing an executable script.
          if ( !( jQuery.nodeName( elem, "script" ) && handleScript( elem ) ) ) {
            // Append to the fragment and handle any embedded scripts.
            fragment.appendChild( elem );
            if ( typeof elem.getElementsByTagName !== "undefined" ) {
              // handleScript modifies the DOM, so use jQuery.merge to ensure a snapshot iteration.
              jsTags = jQuery.grep( jQuery.merge( [], elem.getElementsByTagName( "script" ) ), handleScript );

              // Splice the scripts back into 'ret' after their former ancestor, and advance our index.
              ret.splice.apply( ret, [ i + 1, 0 ].concat( jsTags ) );
              i += jsTags.length;
            }
          }
        }
      }

      return ret;
    };
  }

  var eventAdd = jQuery.event.add, // Store original jQuery.event.add.
      eventRemove = jQuery.event.remove, // Store original jQuery.event.remove.
      eventTrigger = jQuery.event.trigger, // Store original jQuery.event.trigger.
      oldToggle = jQuery.fn.toggle, // Store original jQuery.fn.toggle.
      oldLive = jQuery.fn.live, // Store original jQuery.fn.live.
      oldDie = jQuery.fn.die, // Store original jQuery.fn.die.
      ajaxEvents = "ajaxStart|ajaxStop|ajaxSend|ajaxComplete|ajaxError|ajaxSuccess", // String of AJAX event names.
      rajaxEvent = new RegExp( "\\b(?:" + ajaxEvents + ")\\b" ), // Regex to match AJAX events.
      rhoverHack = /(?:^|\s)hover(\.\S+|)\b/, // Regex to find 'hover' pseudo-event.
      hoverHack = function( events ) {
        if ( typeof( events ) !== "string" || jQuery.event.special.hover ) {
          return events; // If not a string or hover special event exists, return as is.
        }
        if ( rhoverHack.test( events ) ) {
          migrateWarn( "'hover' pseudo-event is deprecated, use 'mouseenter mouseleave'" ); // Warn about 'hover' deprecation.
        }
        return events && events.replace( rhoverHack, "mouseenter$1 mouseleave$1" ); // Replace 'hover' with 'mouseenter mouseleave'.
      };

  // Event properties removed in 1.9; add them back if needed. No practical way to warn about them.
  if ( jQuery.event.props && jQuery.event.props[ 0 ] !== "attrChange" ) {
    jQuery.event.props.unshift( "attrChange", "attrName", "relatedNode", "srcElement" );
  }

  // Undocumented jQuery.event.handle was "deprecated" in jQuery 1.7.
  if ( jQuery.event.dispatch ) {
    migrateWarnProp( jQuery.event, "handle", jQuery.event.dispatch, "jQuery.event.handle is undocumented and deprecated" );
  }

  // Support for 'hover' pseudo-event and AJAX event warnings.
  jQuery.event.add = function( elem, types, handler, data, selector ) {
    if ( elem !== document && rajaxEvent.test( types ) ) {
      migrateWarn( "AJAX events should be attached to document: " + types ); // Warn if AJAX events not on document.
    }
    eventAdd.call( this, elem, hoverHack( types || "" ), handler, data, selector ); // Call original add with hover hack.
  };
  jQuery.event.remove = function( elem, types, handler, selector, mappedTypes ) {
    eventRemove.call( this, elem, hoverHack( types ) || "", handler, selector, mappedTypes ); // Call original remove with hover hack.
  };

  jQuery.fn.error = function() {
    var args = Array.prototype.slice.call( arguments, 0 ); // Convert arguments to an array.
    migrateWarn( "jQuery.fn.error() is deprecated" ); // Warn about deprecation.
    args.splice( 0, 0, "error" ); // Insert "error" at the beginning of arguments.
    if ( arguments.length ) {
      return this.bind.apply( this, args ); // If arguments provided, use bind.
    }
    // The error event should not bubble to window, although it did pre-1.7.
    this.triggerHandler.apply( this, args ); // Otherwise, triggerHandler.
    return this;
  };

  jQuery.fn.toggle = function( fn, fn2 ) {

    // Do not interfere with animation or CSS toggles.
    if ( !jQuery.isFunction( fn ) || !jQuery.isFunction( fn2 ) ) {
      return oldToggle.apply( this, arguments ); // Call the original toggle if not function handlers.
    }
    migrateWarn( "jQuery.fn.toggle(handler, handler...) is deprecated" ); // Warn about handler-based toggle.

    // Save reference to arguments for access within the closure.
    var args = arguments,
        guid = fn.guid || jQuery.guid++, // Get or assign a GUID.
        i = 0,
        toggler = function( event ) {
          // Determine which function to execute.
          var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
          jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

          // Ensure that clicks are stopped.
          event.preventDefault();

          // And execute the appropriate function.
          return args[ lastToggle ].apply( this, arguments ) || false;
        };

    // Link all functions so any of them can unbind this click handler.
    toggler.guid = guid;
    while ( i < args.length ) {
      args[ i++ ].guid = guid;
    }

    return this.click( toggler ); // Attach the toggler as a click handler.
  };

  jQuery.fn.live = function( types, data, fn ) {
    migrateWarn( "jQuery.fn.live() is deprecated" ); // Warn about live() deprecation.
    if ( oldLive ) {
      return oldLive.apply( this, arguments ); // If oldLive exists, use it.
    }
    jQuery( this.context ).on( types, this.selector, data, fn ); // Otherwise, use on().
    return this;
  };

  jQuery.fn.die = function( types, fn ) {
    migrateWarn( "jQuery.fn.die() is deprecated" ); // Warn about die() deprecation.
    if ( oldDie ) {
      return oldDie.apply( this, arguments ); // If oldDie exists, use it.
    }
    jQuery( this.context ).off( types, this.selector || "**", fn ); // Otherwise, use off().
    return this;
  };

  // Convert global events into document-triggered events.
  jQuery.event.trigger = function( event, data, elem, onlyHandlers ) {
    if ( !elem && !rajaxEvent.test( event ) ) {
      migrateWarn( "Global events are undocumented and deprecated" ); // Warn about global events.
    }
    return eventTrigger.call( this, event, data, elem || document, onlyHandlers ); // Call original trigger, defaulting elem to document.
  };
  jQuery.each( ajaxEvents.split( "|" ), // Iterate over AJAX event names.
    function( _, name ) {
      jQuery.event.special[ name ] = {
        setup: function() {
          var elem = this; // Current element in the iteration.
          // Setup logic for special AJAX events.
        }
      };
    }
  );
} )( jQuery, window ); // Immediately Invoked Function Expression (IIFE).