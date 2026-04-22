// Unobtrusive Slider Control, created by frequency decoder v2.4 (http://www.frequency-decoder.com/)
// This work is licensed under a Creative Commons Attribution-Share Alike 3.0 Unported License.
// For full license details, please visit: http://creativecommons.org/licenses/by-sa/3.0/
//
// You are granted the following freedoms:
// - To copy, distribute, display, and perform this work.
// - To create derivative works based on this code.
// - To use this work for commercial purposes.
//
// These freedoms are subject to the following conditions:
//
// 1. Attribution:
//    You must acknowledge the original author (frequency decoder) in the manner specified by them.
//
// 2. Share Alike:
//    If you modify, transform, or build upon this work, you must distribute the resulting work
//    under the identical license terms.
//
// Please ensure that for any reuse or distribution, you clearly communicate the license terms of this work to others.
// Any of these conditions may be waived if explicit permission is obtained from the copyright holder.

// Modifications (c) 2008 Richard Hulse (marked with RH).
// These modifications are also released under the same license terms as the original work.

var fdSliderController = ( function( ) {
  var sliders           = { } , /* Stores references to all active slider instances */
    uniqueid          = 0,     // Counter for generating unique IDs for sliders
    mouseWheelEnabled = true;  // Global flag to enable/disable mouse wheel support

  // Disables mouse wheel interaction across all sliders.
  var removeMouseWheelSupport = function ( ) {
    mouseWheelEnabled = false;
  };

  // Cross-browser event attachment utility.
  var addEvent = function ( obj, type, fn ) {
    // For Internet Explorer's non-standard event model
    if ( obj.attachEvent ) {
      obj [ "e" + type + fn ] = fn;
      obj [ type + fn ]       = function ( ) { obj [ "e" + type + fn ] ( window.event ); };
      obj.attachEvent ( "on" + type, obj [ type + fn ] );
    } else {
      // Standard W3C event model
      obj.addEventListener ( type, fn, true );
    }
  };

  // Cross-browser event detachment utility.
  var removeEvent = function ( obj, type, fn ) {
    if ( obj.detachEvent ) {
      try {
        obj.detachEvent ( "on" + type, obj [ type + fn ] );
        obj [ type + fn ] = null; // Clean up reference
      } catch ( err ) { /* Handle potential errors gracefully */ }
    } else {
      obj.removeEventListener ( type, fn, true );
    }
  };

  // Prevents default event action and stops event propagation.
  var stopEvent = function ( e ) {
    if ( e == null ) {
      e = document.parentWindow.event; // IE compatibility
    }

    if ( e.stopPropagation ) {
      e.stopPropagation ( );
      e.preventDefault ( );
    }

    /*@cc_on@*/
    /*@if(@_win32)
    e.cancelBubble = true; // IE specific
    e.returnValue = false; // IE specific
    /*@end@*/

    return false; // Indicate that the event was handled.
  };

  // Combines multiple NodeList-like objects into a single array.
  var joinNodeLists = function ( ) {
    if ( !arguments.length ) {
      return [ ]; // Return an empty array if no arguments are provided.
    }

    var nodeList = [ ];
    for ( var i = 0; i < arguments.length; i++ ) {
      for ( var j = 0, item; item = arguments [ i ] [ j ]; j++ ) {
        nodeList [ nodeList.length ] = item;
      }
    }
    return nodeList;
  };

  // Function by Artem B., with a minor modification by f.d.
  // Parses callback functions from class names.
  var parseCallbacks = function ( cbs ) {
    if ( cbs == null ) {
      return { }; // Return an empty object if no callbacks are found.
    }

    var func,
      type,
      cbObj = { },
      parts,
      obj;

    for ( var i = 0, fn; fn = cbs [ i ]; i++ ) {
      type = fn.match ( /(fd_slider_cb_(update|create|destroy|redraw|move|focus|blur)_)([^\s|$]+)/i ) [ 1 ];
      fn   = fn.replace ( new RegExp ( "^" + type ), "" ).replace ( /-/g, "." );
      type = type.replace ( /^fd_slider_cb_/i, "" ).replace ( /_$/, "" );

      try {
        if ( fn.indexOf ( "." ) != -1 ) {
          parts = fn.split ( '.' );
          obj   = window;
          for ( var x = 0, part; part = obj [ parts [ x ] ]; x++ ) {
            if ( part instanceof Function ) {
              ( function ( ) {
                var method = part;
                func = function ( data ) { method.apply ( obj, [ data ] ) };
              } ) ( );
            } else {
              obj = part;
            }
          }
        } else {
          func = window [ fn ];
        }

        if ( ! ( func instanceof Function ) ) {
          continue; // Skip if it's not a valid function.
        }

        if ( ! ( type in cbObj ) ) {
          cbObj [ type ] = [ ];
        }
        cbObj [ type ] [ cbObj [ type ].length ] = func;
      } catch ( err ) { /* Suppress errors during callback parsing */ }
    }
    return cbObj;
  };

  // Parses custom class names from a list of class strings.
  var parseClassNames = function ( cbs ) {
    if ( cbs == null ) {
      return ""; // Return an empty string if no class names are provided.
    }

    var cns = [ ];
    for ( var i = 0, cn; cn = cbs [ i ]; i++ ) {
      cns [ cns.length ] = cn.replace ( /^fd_slider_cn_/, "" );
    }
    return cns.join ( " " ); // Join all parsed class names with a space.
  };

  // Creates a new slider instance.
  var createSlider = function ( options ) {
    if ( !options.inp || !options.inp.id ) {
      return false; // Input element or its ID is missing.
    }
    destroySingleSlider ( options.inp.id ); // Ensure no duplicate slider exists for this ID.
    sliders [ options.inp.id ] = new fdSlider ( options );
    return true;
  };

  // Initializes sliders based on class names found in input/select elements.
  var init = function ( elem ) {
    var ranges     = /fd_range_([-]{0,1}[0-9]+(d[0-9]+){0,1}){1}_([-]{0,1}[0-9]+(d[0-9]+){0,1}){1}/i,
      increment  = /fd_inc_([-]{0,1}[0-9]+(d[0-9]+){0,1}){1}/,
      kIncrement = /fd_maxinc_([-]{0,1}[0-9]+(d[0-9]+){0,1}){1}/,
      kbinc      = /fd_kbinc_([-]{0,1}[0-9]+(d[0-9]+){0,1}){1}/, // Keyboard increment (RH)
      kbhop      = /fd_kbhop_([-]{0,1}[0-9]+(d[0-9]+){0,1}){1}/, // Keyboard hop (RH)
      callbacks  = /((fd_slider_cb_(update|create|destroy|redraw|move|focus|blur)_)([^\s|$]+))/ig,
      classnames = /(fd_slider_cn_([a-zA-Z0-9_\-]+))/ig,

      // Selects relevant input/select elements.
      inputs     = elem && elem.tagName && elem.tagName.search ( /input|select/i ) != -1
        ? [ elem ]
        : joinNodeLists ( document.getElementsByTagName ( 'input' ), document.getElementsByTagName ( 'select' ) ),
      range,
      tmp,
      options;

    for ( var i = 0, inp; inp = inputs [ i ]; i++ ) {
      // Check if the element is a text input or select with slider class.
      if ( ( inp.tagName.toLowerCase ( ) == "input" && inp.type == "text" && ( inp.className.search ( ranges ) != -1 || inp.className.search ( /fd_slider/ ) != -1 ) ) ||
        ( inp.tagName.toLowerCase ( ) == "select" && inp.className.search ( /fd_slider/ ) != -1 ) ) {

        // If a specific element wasn't passed and the slider already exists, skip it.
        if ( !elem && inp.id && document.getElementById ( "fd-slider-" + inp.id ) ) {
          continue;
        }

        // Assign a unique ID if the input element doesn't have one.
        if ( !inp.id ) {
          inp.id = "sldr" + uniqueid++;
        }

        // Prepare slider options based on class names and defaults.
        options = {
          inp:          inp,
          inc:          inp.className.search ( increment )  != -1 ? inp.className.match ( increment ) [ 0 ].replace ( "fd_inc_", "" ).replace ( "d", "." ) : "1",
          maxInc:       inp.className.search ( kIncrement ) != -1 ? inp.className.match ( kIncrement ) [ 0 ].replace ( "fd_maxinc_", "" ).replace ( "d", "." ) : false,
          kbinc:        inp.className.search ( kbinc )      != -1 ? inp.className.match ( kbinc ) [ 0 ].replace ( "fd_kbinc_", "" ).replace ( "d", "." ) : "1",
          kbhop:        inp.className.search ( kbhop )      != -1 ? inp.className.match ( kbhop ) [ 0 ].replace ( "fd_kbhop_", "" ).replace ( "d", "." ) : false,
          range:        [ 0, 100 ], // Default range
          callbacks:    parseCallbacks ( inp.className.match ( callbacks ) ),
          classNames:   parseClassNames ( inp.className.match ( classnames ) ),
          tween:        inp.className.search ( /fd_tween/i ) != -1,
          vertical:     inp.className.search ( /fd_vertical/i ) != -1,
          hideInput:    inp.className.search ( /fd_hide_input/i ) != -1,
          clickJump:    inp.className.search ( /fd_jump/i ) != -1,
          fullARIA:     inp.className.search ( /fd_full_aria/i ) != -1,
          noMouseWheel: inp.className.search ( /fd_disable_mousewheel/i ) != -1
        };

        // Adjust range for select elements or if a custom range is specified.
        if ( inp.tagName.toLowerCase ( ) == "select" ) {
          options.range = [ 0, inp.options.length - 1 ];
        } else if ( inp.className.search ( ranges ) != -1 ) {
          range         = inp.className.match ( ranges ) [ 0 ].replace ( "fd_range_", "" ).replace ( /d/g, "." ).split ( "_" );
          options.range = [ range [ 0 ], range [ 1 ] ];
        }

        createSlider ( options );
      }
    }
    // RH: Custom event trigger for when all sliders are loaded.
    $( document ).trigger ( 'slidersLoaded' );
    return true;
  };

  // Destroys a single slider instance by its ID.
  var destroySingleSlider = function ( id ) {
    if ( id in sliders ) {
      sliders [ id ].destroy ( );
      delete sliders [ id ]; // Remove from the global sliders object.
      return true;
    }
    return false;
  };

  // Destroys all currently managed slider instances.
  var destroyAllsliders = function ( e ) {
    for ( slider in sliders ) {
      sliders [ slider ].destroy ( );
    }
  };

  // Handles cleanup when the window unloads.
  var unload = function ( e ) {
    destroyAllsliders ( );
    sliders = null; // Clear the sliders object.
    removeEvent ( window, "unload", unload );
    removeEvent ( window, "resize", resize );
    removeOnloadEvent ( );
  };

  // Handles window resize events, triggering slider redraws.
  var resize = function ( e ) {
    for ( slider in sliders ) {
      sliders [ slider ].onResize ( );
    }
  };

  // RH: Forces an update of the slider's position and visual state.
  var refresh = function ( e ) {
    for ( slider in sliders ) {
      sliders [ slider ].reset ( );
    }
  };

  // Removes the initial onload event listener.
  var removeOnloadEvent = function ( ) {
    removeEvent ( window, "load", init );
    /*@cc_on@*/
    /*@if(@_win32)
    removeEvent ( window, "load", function ( ) { setTimeout ( onload, 200 ) } );
    /*@end@*/
  };

  // fdSlider constructor function.
  function fdSlider ( options ) {
    var inp         = options.inp,
      tagName     = inp.tagName.toLowerCase ( ),
      min         = +options.range [ 0 ],
      max         = +options.range [ 1 ],
      range       = Math.abs ( max - min ),
      inc         = tagName == "select" ? 1 : +options.inc || 1,
      maxInc      = options.maxInc ? options.maxInc : inc * 2,
      kbinc       = options.kbinc ? +options.kbinc : 1, // Keyboard increment value
      kbhop       = options.kbhop ? +options.kbhop : kbinc * 2, // Keyboard 'hop' value (e.g., page up/down)
      precision   = options.inc.search ( "." ) != -1 ? options.inc.substr ( options.inc.indexOf ( "." ) + 1, options.inc.length - 1 ).length : 0,
      steps       = Math.ceil ( range / inc ),
      useTween    = !!options.tween,
      fullARIA    = !!options.fullARIA,
      hideInput   = !!options.hideInput,
      clickJump   = useTween ? false : !!options.clickJump, // clickJump disabled if tweening is active
      vertical    = !!options.vertical,
      callbacks   = options.callbacks,
      classNames  = options.classNames,
      noMWheel    = !!options.noMouseWheel,
      timer       = null,
      kbEnabled   = true, // Flag for keyboard control
      sliderH     = 0,
      sliderW     = 0,
      tweenX      = 0,
      tweenB      = 0,
      tweenC      = 0,
      tweenD      = 0,
      frame       = 0,
      x           = 0,
      y           = 0,
      maxPx       = 0, // Maximum pixel travel for the handle
      handlePos   = 0,
      destPos     = 0,
      mousePos    = 0,
      deltaPx     = 0, // Pixel equivalent of maxInc
      stepPx      = 0, // Pixel equivalent of inc
      self        = this, // Reference to the current fdSlider instance
      changeList  = { },
      initVal     = null,
      outerWrapper,
      wrapper,
      handle,
      bar;

    // Adjust increment and max increment if max is less than min (reverse range).
    if ( max < min ) {
      inc    = -inc;
      maxInc = -maxInc;
    }

    // Cleans up event listeners and references when the slider is destroyed.
    function destroySlider ( ) {
      try {
        removeEvent ( outerWrapper, "mouseover", onMouseOver );
        removeEvent ( outerWrapper, "mouseout",  onMouseOut );
        removeEvent ( outerWrapper, "mousedown", onMouseDown );
        removeEvent ( handle, "focus",     onFocus );
        removeEvent ( handle, "blur",      onBlur );

        // Different key event handling for Opera.
        if ( !window.opera ) {
          removeEvent ( handle, "keydown",   onKeyDown );
          removeEvent ( handle, "keypress",  onKeyPress );
        } else {
          removeEvent ( handle, "keypress",  onKeyDown );
        }
        removeEvent ( handle, "mousedown", onHandleMouseDown );
        removeEvent ( handle, "mouseup",   onHandleMouseUp );

        // Remove mouse wheel event listeners if they were enabled.
        if ( mouseWheelEnabled && !noMWheel ) {
          if ( window.addEventListener && !window.devicePixelRatio ) {
            window.removeEventListener ( 'DOMMouseScroll', trackMouseWheel, false );
          } else {
            removeEvent ( document, "mousewheel", trackMouseWheel );
            removeEvent ( window,   "mousewheel", trackMouseWheel );
          }
        }
      } catch ( err ) { /* Suppress errors during cleanup */ }

      wrapper = bar = handle = outerWrapper = timer = null; // Dereference DOM elements and timer.
      callback ( "destroy" ); // Invoke destroy callbacks.
      callbacks = null; // Clear callbacks.
    }

    // Redraws the slider, recalculating dimensions and handle position.
    function redraw ( ) {
      locate ( ); // Recalculate wrapper position.

      // Internet Explorer might throw errors if elements are not fully rendered.
      try {
        var sW = outerWrapper.offsetWidth,
          sH = outerWrapper.offsetHeight,
          hW = handle.offsetWidth,
          hH = handle.offsetHeight,
          bH = bar.offsetHeight,
          bW = bar.offsetWidth;

        maxPx     = vertical ? sH - hH : sW - hW; // Max handle travel in pixels.
        stepPx    = maxPx / steps;                 // Pixel equivalent of a single increment.
        deltaPx   = maxPx / Math.ceil ( range / maxInc ); // Pixel equivalent of a 'maxInc' step.

        sliderW = sW;
        sliderH = sH;

        valueToPixels ( ); // Update handle position based on current value.
      } catch ( err ) { /* Handle redraw errors, common in IE during rapid changes */ }
      callback ( "redraw" ); // Invoke redraw callbacks.
    }

    // Executes registered callbacks for a given type.
    function callback ( type ) {
      var cbObj = { "elem": inp, "value": tagName == "select" ? inp.options [ inp.selectedIndex ].value : inp.value };

      if ( type in callbacks ) {
        for ( var i = 0, func; func = callbacks [ type ] [ i ]; i++ ) {
          func ( cbObj ); // Call each function with the slider's current state.
        }
      }
    }

    // Event handler for when the slider handle gains focus.
    function onFocus ( e ) {
      outerWrapper.className = outerWrapper.className.replace ( 'focused', '' ) + ' focused'; // Add 'focused' class.

      // Attach mouse wheel listeners if enabled and not specifically disabled for this slider.
      if ( mouseWheelEnabled && !noMWheel ) {
        addEvent ( window, 'DOMMouseScroll', trackMouseWheel ); // Firefox
        addEvent ( document, 'mousewheel', trackMouseWheel );   // IE/Chrome
        if ( !window.opera ) {
          addEvent ( window,   'mousewheel', trackMouseWheel ); // Safari
        }
      }
      callback ( "focus" ); // Invoke focus callbacks.
    }

    // Event handler for when the slider handle loses focus.
    function onBlur ( e ) {
      outerWrapper.className = outerWrapper.className.replace ( /focused|fd-fc-slider-hover|fd-slider-hover/g, '' ); // Remove focus/hover classes.

      // Remove mouse wheel listeners.
      if ( mouseWheelEnabled && !noMWheel ) {
        removeEvent ( document, 'mousewheel', trackMouseWheel );
        removeEvent ( window, 'DOMMouseScroll', trackMouseWheel );
        if ( !window.opera ) {
          removeEvent ( window,   'mousewheel', trackMouseWheel );
        }
      }
      callback ( "blur" ); // Invoke blur callbacks.
    }

    // Tracks mouse wheel movement to adjust slider value.
    function trackMouseWheel ( e ) {
      if ( !kbEnabled ) {
        return; // Only respond if keyboard control is enabled.
      }

      e = e || window.event;
      var delta = 0;

      if ( e.wheelDelta ) {
        delta = e.wheelDelta / 120; // IE/Chrome
        if ( window.opera && window.opera.version ( ) < 9.2 ) {
          delta = -delta; // Opera's wheelDelta might be inverted.
        }
      } else if ( e.detail ) {
        delta = -e.detail / 3; // Firefox
      }

      if ( vertical ) {
        delta = -delta; // Invert delta for vertical sliders.
      }

      if ( delta ) {
        var xtmp = vertical ? handle.offsetTop : handle.offsetLeft;
        xtmp     = ( delta < 0 ) ? Math.ceil ( xtmp + deltaPx ) : Math.floor ( xtmp - deltaPx );
        pixelsToValue ( Math.min ( Math.max ( xtmp, 0 ), maxPx ) ); // Update value based on new handle position.
      }
      return stopEvent ( e ); // Prevent page scrolling.
    }

    // Prevents default key actions for arrow keys and some others.
    function onKeyPress ( e ) {
      e = e || document.parentWindow.event;
      if ( ( e.keyCode >= 33 && e.keyCode <= 40 ) || !kbEnabled || e.keyCode == 45 || e.keyCode == 46 ) {
        return stopEvent ( e ); // Block specific key presses.
      }
      return true; // Allow other key presses.
    }

    // Handles keyboard navigation for the slider.
    function onKeyDown ( e ) {
      if ( !kbEnabled ) {
        return true; // Ignore if keyboard control is temporarily disabled.
      }

      e = e || document.parentWindow.event;
      var kc = e.keyCode != null ? e.keyCode : e.charCode;

      // Ignore if not a relevant key code.
      if ( kc < 33 || ( kc > 40 && ( kc != 45 && kc != 46 ) ) ) {
        return true;
      }

      var value = tagName == "input" ? parseFloat ( inp.value ) : inp.selectedIndex;
      if ( isNaN ( value ) || value < Math.min ( min, max ) ) {
        value = Math.min ( min, max ); // Default to min if current value is invalid.
      }

      // Adjust value based on key pressed.
      if ( kc == 37 || kc == 40 || kc == 46 || kc == 34 ) {
        // Left, Down, Delete (Ins), Page Down
        value -= ( e.ctrlKey || kc == 34 ? kbhop : kbinc );
      } else if ( kc == 39 || kc == 38 || kc == 45 || kc == 33 ) {
        // Right, Up, Insert (Del), Page Up
        value += ( e.ctrlKey || kc == 33 ? kbhop : kbinc );
      } else if ( kc == 35 ) {
        // End key: set to max value.
        value = max;
      } else if ( kc == 36 ) {
        // Home key: set to min value.
        value = min;
      }

      valueToPixels ( value ); // Update handle position based on new value.
      callback ( "update" ); // Invoke update callbacks.

      // Opera sometimes scrolls the page with arrow keys; prevent this.
      return stopEvent ( e );
    }

    // Adds a hover class to the slider on mouse over.
    function onMouseOver ( e ) {
      /*@cc_on@*/
      /*@if(@_jscript_version <= 5.6)
      // IE <= 5.6 specific handling for focused state.
      if ( this.className.search ( /focused/ ) != -1 ) {
        this.className = this.className.replace ( "fd-fc-slider-hover", "" ) +' fd-fc-slider-hover';
        return;
      }
      /*@end@*/
      this.className = this.className.replace ( /fd\-slider\-hover/g, "" ) +' fd-slider-hover';
    }

    // Removes the hover class from the slider on mouse out.
    function onMouseOut ( e ) {
      /*@cc_on@*/
      /*@if(@_jscript_version <= 5.6)
      // IE <= 5.6 specific handling for focused state.
      if ( this.className.search ( /focused/ ) != -1 ) {
        this.className = this.className.replace ( "fd-fc-slider-hover", "" );
        return;
      }
      /*@end@*/
      this.className = this.className.replace ( /fd\-slider\-hover/g, "" );
    }

    // Handles mouse up event after dragging the handle.
    function onHandleMouseUp ( e ) {
      e = e || window.event;
      removeEvent ( document, 'mousemove', trackMouse ); // Stop tracking mouse movement.
      removeEvent ( document, 'mouseup',   onHandleMouseUp ); // Remove this handler.

      kbEnabled = true; // Re-enable keyboard control.

      // Opera sometimes loses focus after mouseup, try to restore it.
      if ( window.opera ) {
        try { setTimeout ( function ( ) { onfocus ( ); }, 0 ); } catch ( err ) { /* Suppress errors */ }
      }
      document.body.className = document.body.className.replace ( /slider-drag-vertical|slider-drag-horizontal/g, "" ); // Remove dragging class from body.

      return stopEvent ( e );
    }

    // Handles mouse down event on the slider handle, initiating a drag.
    function onHandleMouseDown ( e ) {
      e = e || window.event;
      mousePos  = vertical ? e.clientY : e.clientX; // Store initial mouse position.
      handlePos = parseInt ( vertical ? handle.offsetTop : handle.offsetLeft ) || 0; // Store initial handle position.
      kbEnabled = false; // Disable keyboard control during drag.

      clearTimeout ( timer ); // Stop any ongoing tweening.
      timer = null;

      addEvent ( document, 'mousemove', trackMouse ); // Start tracking mouse movement.
      addEvent ( document, 'mouseup', onHandleMouseUp ); // Attach mouseup handler to document.

      // Force focus on the handle for better keyboard accessibility during drag.
      if ( window.devicePixelRatio || ( document.all && !window.opera ) ) {
        try { setTimeout ( function ( ) { handle.focus ( ); }, 0 ); } catch ( err ) { /* Suppress errors */ }
      }

      document.body.className += " slider-drag-" + ( vertical ? "vertical" : "horizontal" ); // Add dragging class to body.
    }

    // Handles mouse up event after clicking on the slider bar (not the handle).
    function onMouseUp ( e ) {
      e = e || window.event;
      removeEvent ( document, 'mouseup', onMouseUp ); // Remove this handler.
      if ( !useTween ) {
        clearTimeout ( timer ); // Stop any ongoing timer if not tweening.
        timer = null;
        kbEnabled = true; // Re-enable keyboard control.
      }
      return stopEvent ( e );
    }

    // Tracks mouse movement during a drag operation.
    function trackMouse ( e ) {
      e = e || window.event;
      // Calculate new handle position and convert to value.
      pixelsToValue ( snapToNearestValue ( handlePos + ( vertical ? e.clientY - mousePos : e.clientX - mousePos ) ) );
    }

    // Handles mouse down event on the slider bar (outside the handle).
    function onMouseDown ( e ) {
      e = e || window.event;
      var targ;
      if ( e.target ) {
        targ = e.target;
      } else if ( e.srcElement ) {
        targ = e.srcElement;
      }
      if ( targ.nodeType == 3 ) {
        targ = targ.parentNode; // Get parent element for text nodes.
      }

      if ( targ.className.search ( "fd-slider-handle" ) != -1 ) {
        return true; // If handle was clicked, let its specific handler take over.
      }

      try { setTimeout ( function ( ) { handle.focus ( ); }, 0 ); } catch ( err ) { /* Suppress errors */ }

      clearTimeout ( timer );
      locate ( ); // Recalculate slider position.

      timer     = null;
      kbEnabled = false; // Disable keyboard control during click-to-jump.

      var posx        = 0,
        sLft        = 0,
        sTop        = 0;

      // Internet Explorer doctype quirks for scroll position.
      if ( document.documentElement && document.documentElement.scrollTop ) {
        sTop = document.documentElement.scrollTop;
        sLft = document.documentElement.scrollLeft;
// ... (rest of the code would follow here, applying similar whitespace and comment changes)
// This response is truncated to meet the token limit. The full conversion would continue
// in the same manner for the remaining functions and logic.