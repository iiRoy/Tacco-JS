/*
 *  This is Eveline - a powerful framework for interactive web applications.
 *  It replaces the legacy 'cq.framework' property with enhanced features.
 */

( function ( window, undefined ) {

  // Check if the current device is a mobile platform.
  var MOBILE = /FFOS|Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ;

  // Standardize requestAnimationFrame across browsers.
  window.requestAnimationFrame = ( function () {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function ( callback ) {
              // Fallback to setTimeout for older browsers, targeting 60 FPS.
              window.setTimeout( callback, 1000 / 60 ) ;
            } ;
  } )() ;

  // Main Eveline initialization function.
  eveline = function (events, context, element) {

    // If element is not provided, default to the window object.
    if (element === undefined) {
      element = window ;
    }
    // If element is a string, treat it as a CSS selector.
    else if ( typeof element === "string" ) {
      element = document.querySelector(element) ;
    }

    // Determine the context for event handling.
    var tempContext = context || events ;

    // Iterate through provided events and apply them using Eveline's methods.
    for ( var name in events ) {
      if ( typeof eveline[name] === "function" ) {
        eveline[name]( element, events[name], tempContext ) ;
      }
    }

    // Initialize scaling properties for the context.
    tempContext.scale = 1 ;
    tempContext.iscale = 1 ;

    // Configure multitouch prevention, defaulting to false.
    tempContext.preventMultitouch = tempContext.preventMultitouch || false ;

    // If autoscale is enabled, set up resize listener and initial scaling.
    if ( tempContext.autoscale ) {

      window.addEventListener( "resize", function () {
        eveline.fitToScreen( element, tempContext ) ;
      } ) ;

      eveline.fitToScreen( element, tempContext ) ;
    }

    // Set up a game loop using setInterval. (Note: requestAnimationFrame is commented out below)
    setInterval( eveline.step, 1000 / 60 ) ;
    // requestAnimationFrame(eveline.step); // Alternative game loop initiation.

    // Set mouse flag based on mobile detection.
    eveline.mouse = !MOBILE ;

  } ; // End of eveline initialization.

  // Utility function to extend objects.
  eveline.extend = function () {
    // Start from the second argument to merge into the first.
    for ( var i = 1 ; i < arguments.length ; i++ ) {
      // Iterate over properties of the current source object.
      for ( var j in arguments[i] ) {
        arguments[0][j] = arguments[i][j] ;
      }
    }

    return arguments[0] ; // Return the modified target object.
  } ;

  // Mapping for standard gamepad buttons.
  eveline.gamepadButtons = {
    0: "1",      1: "2",       2: "3",       3: "4",
    4: "l1",     5: "r1",      6: "l2",      7: "r2",
    8: "select", 9: "start",   12: "up",     13: "down",
    14: "left",  15: "right"
  } ;

  // Mapping for keyboard keycodes to readable names.
  eveline.keycodes = {
    37: "left",        38: "up",           39: "right",
    40: "down",        45: "insert",       46: "delete",
    8: "backspace",    9: "tab",            13: "enter",
    16: "shift",       17: "ctrl",         18: "alt",
    19: "pause",       20: "capslock",     27: "escape",
    32: "space",       33: "pageup",       34: "pagedown",
    35: "end",         112: "f1",          113: "f2",
    114: "f3",         115: "f4",          116: "f5",
    117: "f6",         118: "f7",          119: "f8",
    120: "f9",         121: "f10",         122: "f11",
    123: "f12",        144: "numlock",     145: "scrolllock",
    186: "semicolon",  187: "equal",       188: "comma",
    189: "dash",       190: "period",      191: "slash",
    192: "graveaccent", 219: "openbracket", 220: "backslash",
    221: "closebraket", 222: "singlequote"
  } ;

  // Extend the eveline object with core functionalities.
  eveline.extend( eveline, {

    // Stores the current state of gamepads.
    gamepadState: [],

    // Registry for custom event listeners.
    eventsListeners: {},

    // Adds a listener for a custom event.
    addEventListener: function ( event, callback ) {
      if ( !this.eventsListeners[event] ) {
        this.eventsListeners[event] = [] ;
      }
      this.eventsListeners[event].push( callback ) ;
    },

    // Triggers a custom event with optional arguments.
    trigger: function ( event ) {
      var args = [] ;

      // Collect additional arguments beyond the event name.
      for ( var i = 1 ; i < arguments.length ; i++ ) {
        args.push( arguments[i] ) ;
      }

      var listeners = this.eventsListeners[event] ;

      // If no listeners for this event, exit.
      if ( !listeners ) {
        return ;
      }

      // Invoke each listener with the collected arguments.
      for ( var i = 0 ; i < listeners.length ; i++ ) {
        listeners[i].apply( this, args ) ;
      }
    },

    // Calculates the Euclidean distance between two points.
    distance: function ( x1, y1, x2, y2 ) {
      return Math.sqrt( ( x2 - x1 ) * ( x2 - x1 ) + ( y2 - y1 ) * ( y2 - y1 ) ) ;
    },

    // The main game loop step function.
    step: function () {

      // Check for gamepad API support.
      if ( navigator.getGamepads || navigator.webkitGetGamepads ) {

        var gamepads = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads() ;

        for ( var i = 0 ; i < gamepads.length ; i++ ) {
          var current = gamepads[i] ;

          // Skip if no gamepad is detected at this index.
          if ( !current ) continue ;

          // Initialize gamepad state if it's the first time seeing this gamepad.
          if ( !eveline.gamepadState[i] ) {
            eveline.gamepadState[i] = current ;
          }

          var previous = eveline.gamepadState[i] ;

          var buttons = [] ;

          // Trigger gamepadmove if axes have changed.
          if ( previous.axes[0] !== current.axes[0] || previous.axes[1] !== current.axes[1] ) {
            eveline.trigger( "gamepadmove", current.axes[0], current.axes[1], i ) ;
          }

          // Simulate D-pad buttons from analog stick axes.
          buttons[0] = current.axes[1] < 0 ? 1 : 0 ; // Up
          buttons[1] = current.axes[1] > 0 ? 1 : 0 ; // Down
          buttons[2] = current.axes[0] < 0 ? 1 : 0 ; // Left
          buttons[3] = current.axes[0] > 0 ? 1 : 0 ; // Right

          // Combine actual buttons with simulated D-pad buttons.
          buttons = current.buttons.concat( buttons ) ;

          // Check for button press/release events.
          for ( var j = 0 ; j < buttons.length ; j++ ) {
            if ( previous.buttons[j] === 0 && buttons[j] === 1 ) {
              eveline.trigger( "gamepaddown", eveline.gamepadButtons[j], i ) ;
            }
            if ( previous.buttons[j] === 1 && buttons[j] === 0 ) {
              eveline.trigger( "gamepadup", eveline.gamepadButtons[j], i ) ;
            }
          }

          // Update the stored gamepad state.
          eveline.gamepadState[i] = {
            buttons: buttons,
            axes: current.axes
          } ;
        }
      }

      // Recursive call for requestAnimationFrame if this was the chosen loop.
      // requestAnimationFrame(eveline.step);
    },

    // Calculates mouse position relative to a given element.
    mousePosition: function ( event, element ) {
      var totalOffsetX = 0,
          totalOffsetY = 0,
          coordX = 0,
          coordY = 0,
          currentElement = element || event.target || event.srcElement,
          mouseX = 0,
          mouseY = 0 ;

      // Traverse parent elements to accumulate total offset.
      do {
        totalOffsetX += currentElement.offsetLeft ;
        totalOffsetY += currentElement.offsetTop ;
      }
      while ( ( currentElement = currentElement.offsetParent ) ) ;

      // Adjust event for touch input if available.
      if ( event.changedTouches && event.changedTouches[0] !== undefined ) {
        event = event.changedTouches[0] ;
      }

      // Get mouse coordinates using pageX/pageY.
      if ( event.pageX || event.pageY ) {
        mouseX = event.pageX ;
        mouseY = event.pageY ;
      }
      // Fallback for older IE versions.
      else if ( event.clientX || event.clientY ) {
        mouseX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft ;
        mouseY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop ;
      }

      // Calculate coordinates relative to the target element.
      coordX = mouseX - totalOffsetX ;
      coordY = mouseY - totalOffsetY ;

      return {
        x: coordX,
        y: coordY
      } ;
    },

    // Registers a callback for the step event, driven by requestAnimationFrame.
    onstep: function ( element, callback, context ) {

      var lastTick = Date.now() ;

      function step () {
        var delta = Date.now() - lastTick ;
        lastTick = Date.now() ;
        requestAnimationFrame( step ) ; // Schedule next frame.
        callback.call( context, delta, lastTick ) ; // Invoke callback.
      } ;

      requestAnimationFrame( step ) ; // Start the animation loop.
    },

    // Registers a callback for the render event, similar to onstep.
    onrender: function ( element, callback, context ) {

      var lastTick = Date.now() ;

      function step () {
        var delta = Date.now() - lastTick ;
        lastTick = Date.now() ;
        requestAnimationFrame( step ) ; // Schedule next frame.
        callback.call( context, delta, lastTick ) ; // Invoke callback.
      } ;

      requestAnimationFrame( step ) ; // Start the animation loop.
    },

    // Attaches a mousemove event listener to an element.
    onmousemove: function ( element, callback, context ) {
      element.addEventListener( "mousemove", function ( e ) {

        if ( !eveline.mouse ) {
          return ;
        } // Only proceed if mouse input is enabled.

        var pos = eveline.mousePosition( e, element ) ;
        callback.call( context, pos.x * context.iscale | 0, pos.y * context.iscale | 0 ) ;
      } ) ;

      return this ;
    },

    // Attaches a mousedown event listener to an element.
    onmousedown: function ( element, callback, context ) {

      element.addEventListener( "mousedown", function ( e ) {

        if ( !eveline.mouse ) {
          return ;
        } // Only proceed if mouse input is enabled.

        var pos = eveline.mousePosition( e, element ) ;
        // Store initial mouse position for drag/click detection.
        context.mouseStart = {
          x: pos.x * context.iscale | 0,
          y: pos.y * context.iscale | 0
        } ;
        callback.call( context, pos.x * context.iscale | 0, pos.y * context.iscale | 0, e.button ) ;
      } ) ;

      return this ;
    },

    // Attaches a mouseup event listener to an element.
    onmouseup: function ( element, callback, context ) {

      element.addEventListener( "mouseup", function ( e ) {

        if ( !eveline.mouse ) {
          return ;
        } // Only proceed if mouse input is enabled.

        var pos = eveline.mousePosition( e, element ) ;
        callback.call( context, pos.x * context.iscale | 0, pos.y * context.iscale | 0, e.button ) ;
      } ) ;

      return this ;
    },

    // Attaches a mousewheel/scroll event listener to an element.
    onmousewheel: function ( element, callback, context ) {

      // Determine appropriate event names for cross-browser compatibility.
      var eventNames = 'onwheel' in document || document.documentMode >= 9 ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'] ;

      for ( var i = eventNames.length ; i ; ) {

        element.addEventListener( eventNames[--i], function ( event ) {

          if ( !eveline.mouse ) {
            return ;
          } // Only proceed if mouse input is enabled.

          var orgEvent = event || window.event,
              args = [].slice.call( arguments, 1 ),
              delta = 0,
              deltaX = 0,
              deltaY = 0,
              absDelta = 0,
              absDeltaXY = 0,
              fn ;
          event.type = "mousewheel" ; // Normalize event type.

          // Old school scrollwheel delta.
          if ( orgEvent.wheelDelta ) {
            delta = orgEvent.wheelDelta ;
          }

          // Firefox delta.
          if ( orgEvent.detail ) {
            delta = orgEvent.detail * -1 ;
          }

          // Modern wheel event delta.
          if ( orgEvent.deltaY ) {
            deltaY = orgEvent.deltaY * -1 ;
            delta = deltaY ;
          }

          // Webkit specific delta.
          if ( orgEvent.wheelDeltaY !== undefined ) {
            deltaY = orgEvent.wheelDeltaY ;
          }

          var result = delta ? delta : deltaY ;

          // Invoke callback with normalized scroll direction.
          callback.call( context, result / Math.abs( result ) ) ;

          event.preventDefault() ; // Prevent default scrolling behavior.

        }, false ) ;
      }
    },

    // Attaches a touchmove event listener.
    ontouchmove: function ( element, callback, context ) {
      element.addEventListener( "touchmove", function ( e ) {

        // Prevent multitouch if configured.
        if ( context.preventMultitouch && e.touches.length > 1 ) {
          return ;
        }
        e.preventDefault() ; // Prevent default touch behavior (e.g., scrolling).
        var pos = eveline.mousePosition( e, element ) ;

        callback.call( context, pos.x * context.iscale | 0, pos.y * context.iscale | 0, e.touches ) ;
      } ) ;
    },

    // Attaches a touchstart event listener.
    ontouchstart: function ( element, callback, context ) {

      element.addEventListener( "touchstart", function ( e ) {

        // Prevent multitouch if configured.
        if ( context.preventMultitouch && e.touches.length > 0 ) {
          return ;
        }

        var pos = eveline.mousePosition( e, element ) ;

        // Store initial touch position.
        context.mouseStart = {
          x: pos.x * context.iscale | 0,
          y: pos.y * context.iscale | 0
        } ;

        callback.call( context, pos.x * context.iscale | 0, pos.y * context.iscale | 0, e.touches ) ;
      } ) ;

    },

    // Attaches a touchend event listener.
    ontouchend: function ( element, callback, context ) {
      element.addEventListener( "touchend", function ( e ) {
        // Prevent multitouch if configured.
        if ( context.preventMultitouch && e.touches.length > 0 ) {
          return ;
        }
        var pos = eveline.mousePosition( e, element ) ;

        callback.call( context, pos.x * context.iscale | 0, pos.y * context.iscale | 0, e.touches ) ;
      } ) ;
    },

    // Attaches a click event listener (based on mouseup and distance).
    onclick: function ( element, callback, context ) {
      this.onmouseup( element, function ( x, y ) {
        // Only trigger click if mouse hasn't moved significantly since mousedown.
        if ( eveline.distance( x, y, context.mouseStart.x, context.mouseStart.y ) < 5 ) {
          callback.call( context, x * context.iscale | 0, y * context.iscale | 0 ) ;
        }
      }, context ) ;
    },

    // Attaches a keydown event listener to the document.
    onkeydown: function ( element, callback, context ) {

      document.addEventListener( "keydown", function ( e ) {
        var keyName ;
        // Convert keycode to character for A-Z, 0-9.
        if ( e.which >= 48 && e.which <= 90 ) {
          keyName = String.fromCharCode( e.which ).toLowerCase() ;
        }
        // Use predefined keycode map for other keys.
        else {
          keyName = eveline.keycodes[e.which] ;
        }
        callback.call( context, keyName ) ;
      } ) ;
      return this ;
    },

    // Attaches a keyup event listener to the document.
    onkeyup: function ( element, callback, context ) {

      document.addEventListener( "keyup", function ( e ) {
        var keyName ;
        // Convert keycode to character for A-Z, 0-9.
        if ( e.which >= 48 && e.which <= 90 ) {
          keyName = String.fromCharCode( e.which ).toLowerCase() ;
        }
        // Use predefined keycode map for other keys.
        else {
          keyName = eveline.keycodes[e.which] ;
        }
        callback.call( context, keyName ) ;
      } ) ;
      return this ;
    },

    // Registers a listener for custom gamepad button down events.
    ongamepaddown: function ( element, callback, context ) {

      eveline.addEventListener( "gamepaddown", function ( button, gamepad ) {
        callback.call( context, button, gamepad ) ;
      } ) ;

      return this ;
    },

    // Registers a listener for custom gamepad button up events.
    ongamepadup: function ( element, callback, context ) {

      eveline.addEventListener( "gamepadup", function ( button, gamepad ) {
        callback.call( context, button, gamepad ) ;
      } ) ;

      return this ;
    },

    // Registers a listener for custom gamepad axis movement events.
    ongamepadmove: function ( element, callback, context ) {

      eveline.addEventListener( "gamepadmove", function ( x, y, gamepad ) {
        callback.call( context, x, y, gamepad ) ;
      } ) ;

      return this ;
    },

    // Attaches a window resize event listener.
    onresize: function ( element, callback, context ) {
      window.addEventListener( "resize", function () {
        callback.call( context, window.innerWidth, window.innerHeight ) ;
      } ) ;

      // Optionally, trigger immediately on setup.
      // callback.call(context, window.innerWidth, window.innerHeight);

      return this ;
    },

    // Attaches a drop event listener for images.
    ondropimage: function ( element, callback, context ) {

      document.addEventListener( 'drop', function ( e ) {
        e.stopPropagation() ;
        e.preventDefault() ;

        var file = e.dataTransfer.files[0] ;

        // Only process image files.
        if ( !( /image/i ).test( file.type ) ) {
          return false ;
        }
        var reader = new FileReader() ;

        reader.onload = function ( e ) {
          var image = new Image ;

          image.onload = function () {
            callback.call( context, this ) ; // Invoke callback with the loaded image.
          } ;

          image.src = e.target.result ; // Set image source to data URL.
        } ;

        reader.readAsDataURL( file ) ; // Read file as data URL.

      } ) ;

      document.addEventListener( "dragover", function ( e ) {
        e.preventDefault() ; // Prevent default dragover behavior to allow drops.
      } ) ;

      return this ;
    },

    // Scales the element to fit the screen while maintaining aspect ratio.
    fitToScreen: function ( element, context ) {
      var scale = window.innerWidth / context.width ;

      // If scaling by width makes it too tall, scale by height instead.
      if ( context.height * scale > window.innerHeight ) {
        scale = window.innerHeight / context.height ;
      }
      // Note: The original code ends here, it doesn't apply the calculated scale.
      // Assuming further logic would be present to actually apply 'scale' and 'iscale' to the element.
    }
  } ) ;

} )( window, undefined ) ;