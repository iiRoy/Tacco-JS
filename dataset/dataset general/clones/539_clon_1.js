( function ( $, window ) {
  "use strict" ;

  // This section defines various constants used throughout the plugin.
  // These constants represent different states an element can be in
  // relative to its scrollable parent's viewport.
  var   VIEW_OUT         =  0 ; // The element is completely outside the visible area.
  var   VIEW_CLIP_TOP    =  4 ; // The top part of the element is outside, but the bottom part is visible.
  var   VIEW_INTERSECT   =  2 ; // The element is fully contained within the visible area.
  var   VIEW_CLIP_BOTTOM =  1 ; // The bottom part of the element is outside, but the top part is visible.
  var   VIEW_OVERLAP     =  7 ; // The element is larger than the viewport and extends beyond both top and bottom.
  var   VIEW_ABOVE       = -2 ; // The element is entirely positioned above the viewport.
  var   VIEW_BELOW       = -1 ; // The element is entirely positioned below the viewport.

  // Core namespace and event string definitions for the plugin.
  var   NAMESPACE        = 'scrollbeacon' ;
  var   NAMESPACE_ELMID  = NAMESPACE + '_elementid' ;       // Data attribute key for unique element ID.
  var   EV_APPEAR        = 'appear.' + NAMESPACE ;          // Event fired when an element enters the viewport.
  var   EV_DISAPPEAR     = 'disappear.' + NAMESPACE ;       // Event fired when an element leaves the viewport.
  var   EV_POSTIONCHANGE = 'positionchange.' + NAMESPACE ;  // Event fired on any change in element's position relative to viewport.
  var   EV_TOPREACHED    = 'topreached.' + NAMESPACE ;      // Event fired when element's top edge aligns with viewport's top.
  var   EV_BOTTOMREACHED = 'bottomreached.' + NAMESPACE ;   // Event fired when element's bottom edge aligns with viewport's bottom.

  // An array listing all custom events broadcast by the scrollbeacon plugin.
  var SCROLLBEACON_EVENTS = [ EV_APPEAR, EV_DISAPPEAR, EV_POSTIONCHANGE, EV_TOPREACHED, EV_BOTTOMREACHED ] ;

  // Derived event names without the namespace prefix, used for binding user callbacks.
  var MOVINGTARGET_EVENTS = $.map( SCROLLBEACON_EVENTS, function ( str ) {
    return str.split( '.' ).shift( ) ;
  } ) ;

  // Constants defining scroll directions.
  var   DIRECTION_DOWN = 'down' ;
  var   DIRECTION_UP   = 'up' ;

  // An internal array to keep track of all active Scroller instances.
  var scrollers = [] ;

  // Expose the scrollbeacon configuration and constants globally via jQuery.
  var jquery_scrollbeacon = $[ NAMESPACE ] = {
    every         : 34, // Default interval (in milliseconds) for throttling scroll events (approx. 30 frames per second).
    VIEW_ABOVE    : VIEW_ABOVE,
    VIEW_BELOW    : VIEW_BELOW,
    VIEW_OUT      : VIEW_OUT,
    VIEW_CLIP_BOTTOM : VIEW_CLIP_BOTTOM,
    VIEW_INTERSECT : VIEW_INTERSECT,
    VIEW_CLIP_TOP : VIEW_CLIP_TOP,
    VIEW_OVERLAP  : VIEW_OVERLAP
  } ;

  // Default options for the jQuery scrollbeacon plugin method.
  var DEFAULT_OPTIONS = {
    parent         : window,          // The element that is scrolled (e.g., `window`, or a `div` with `overflow: scroll`).
    offset         : null,            // Custom offset for calculating element visibility. Can be number, array, or object.
    scrolltick     : null,            // A callback function executed on every scroll event processed.
    appear         : null,            // Callback for when element appears in view.
    disappear      : null,            // Callback for when element disappears from view.
    positionchange : null,            // Callback for any change in element's position.
    topreached     : null,            // Callback for when element's top edge reaches viewport's top.
    bottomreached  : null             // Callback for when element's bottom edge reaches viewport's bottom.
  } ;

  /**
   * jQuery.scrollbeacon Plugin Definition
   *
   * This plugin allows developers to monitor elements within a scrollable
   * container (parent) and trigger custom events based on their visibility
   * and position relative to the viewport.
   *
   * @param {string|object} [methodOrOptions] The method name to call (e.g., 'refresh', 'destroy', 'stop')
   *                                           or an options object for initialization.
   * @param {object} [options] Options object if the first argument is a method name.
   * @param {...*} [args] Additional arguments passed to the method.
   * @returns {jQuery} The jQuery object for chaining.
   *
   * (c) 2012, Takashi Mizohata
   * Licensed under the MIT License
   */
  $.fn[ NAMESPACE ] = function ( ) {
    var method ; // Stores the name of the method to be invoked.
    var opts   ; // Holds the merged options for the current operation.
    var args   ; // An array containing any additional arguments.

    // Determine if the first argument is a method name (string) or an options object.
    if ( typeof arguments[ 0 ] === 'string' ) {
      method = arguments[ 0 ] ;
      opts   = $.extend( { }, DEFAULT_OPTIONS, arguments[ 1 ] || { } ) ;
      args   = Array.prototype.slice.call( arguments, 2 ) ; // Slice arguments from the third one.
    }
    else {
      method = 'init' ; // Default method is 'init' if no string method is specified.
      opts   = $.extend( { }, DEFAULT_OPTIONS, arguments[ 0 ] || { } ) ;
      args   = Array.prototype.slice.call( arguments, 1 ) ; // Slice arguments from the second one.
    }

    // Validate the specified parent element.
    var $parent = $( opts.parent ) ;
    if ( $parent.length === 0 || $parent.length > 1 ) {
      // The parent must be a single, existing DOM element.
      throw new Error( 'parent has to be a single object.' ) ;
    }
    if ( $parent[ 0 ] === document ) {
      // The document itself should not be the scrollable parent. Use `window` or a block element.
      throw new Error( 'parent should not be `document.` Choose `window` or other block element instaed.' ) ;
    }

    // Retrieve an existing Scroller instance for the parent, or create a new one.
    var scroller = $parent.data( 'scroller' ) ;
    if ( scroller === undefined ) {
      scroller = new Scroller( $parent[ 0 ] ) ; // Create a new Scroller instance.
    }

    // Configure the scroller's scrolltick function if provided in options.
    scroller.setScrollTick( opts.scrolltick ) ;

    // Define the public methods available through the plugin.
    var methods = {
      /**
       * Initializes or updates a moving target.
       * @param {number} i The index of the element in the jQuery collection.
       * @param {HTMLElement} elm The current DOM element.
       */
      init : function ( i, elm ) {
        var target = $( elm ).data( NAMESPACE ) ; // Check if this element is already a moving target.
        if ( target ) {
          bindMovingTargetEvents( elm, opts ) ; // Re-bind custom events from options.
          if ( opts.offset ) {
            target.setOffset( opts.offset ) ; // Update target's offset.
          }
          else {
            target.refresh( ) ; // Simply refresh its position.
          }
        }
        else {
          scroller.add( elm, opts ) ; // Add the element as a new moving target.
        }
        return this ; // Allow chaining.
      },

      /**
       * Forces a refresh of a moving target's position and view state.
       * @param {number} i The index of the element.
       * @param {HTMLElement} elm The current DOM element.
       */
      refresh : function ( i, elm ) {
        var target = $( elm ).data( NAMESPACE ) ;
        if ( target ) {
          if ( opts.offset ) {
            target.setOffset( opts.offset ) ;
          }
          target.refresh( ) ;
        }
        else {
          scroller.add( elm, opts ) ; // If not found, treat as new.
        }
        return this ;
      },

      /**
       * Destroys a moving target, removing it from monitoring.
       * @param {number} i The index of the element.
       * @param {HTMLElement} elm The current DOM element.
       */
      destroy : function ( i, elm ) {
        var target = $( elm ).data( NAMESPACE ) ;
        if ( target ) {
          target.destroy( ) ;
        }
        return this ;
      },

      /**
       * Stops all scrollbeacon events from being triggered on a specific target.
       * @param {number} i The index of the element.
       * @param {HTMLElement} elm The current DOM element.
       */
      stop : function ( i, elm ) {
        var target = $( elm ).data( NAMESPACE ) ;
        if ( target ) {
          target.stop( ) ;
        }
        return this ;
      }
    } ;

    // Execute the appropriate method for each element in the jQuery collection.
    return this.each( methods[ method ] ) ;
  } ;

  // =========================================================================
  // Scroller Class Definition
  // Manages the scrollable parent element and its associated MovingTarget instances.
  // Handles scroll event throttling and dispatching.
  // =========================================================================

  var Scroller = function ( elm ) {
    var $elm = $( elm ) ; // Cache jQuery wrapped parent element.

    this.elm                 = elm ;                     // The raw DOM element for the scrollable parent.
    this.targets             = [] ;                      // An array to hold all MovingTarget instances managed by this scroller.
    this.scrolltick          = null ;                    // A user-defined function called on each scroll processing cycle.
    this.last_scroll         = getNow( ) ;               // Timestamp of the last time a scroll event was fully processed.
    this.last_top            = $elm.scrollTop( ) ;       // The scroll position (scrollTop) at the last processing.
    this.handler_tailing     = false ;                   // Flag indicating if a trailing scroll handler is pending.
    this.tailing_function    = $.proxy( this._tail, this ) ; // A bound function for the trailing scroll event.
    this.tailing_event       = null ;                    // Stores the event object for the trailing handler.
    this.event_subscription  = { } ;                     // Tracks active subscriptions to determine if scroll listeners are needed.
    this.proxy_onscroll      = $.proxy( this._onscroll, this ) ; // A bound function for the actual 'scroll' event listener.

    // Store a reference to this Scroller instance on the parent element's data.
    $elm.data( 'scroller', this ) ;
  } ;

  /**
   * Manages the binding and unbinding of the actual 'scroll' and 'touchmove'
   * event listeners on the scroller's parent element. It ensures listeners
   * are only active when there are subscribed events.
   *
   * @param {HTMLElement} elm The element whose event subscriptions are being managed.
   * @param {string} event_type The type of event (e.g., 'appear', 'scrolltick').
   * @param {boolean} direction True to add subscription, false to remove.
   * @param {boolean} isScroller True if managing scroller's own events (like scrolltick), false for MovingTarget events.
   */
  Scroller.prototype._hookEventBinding = function ( elm, event_type, direction, isScroller ) {
    var $elm    = $( elm ) ;
    var elmid   = getElementId( $elm ) ;      // Get unique ID for the element.
    var events  = $elm.data( 'events' ) ;     // Access jQuery's internal event data.

    if ( isScroller ) {
      // Handle subscriptions directly for the scroller's own events.
      if ( direction ) {
        this.event_subscription[ [ elmid, '/', event_type ].join( '' ) ] = true ;
      }
      else {
        delete this.event_subscription[ [ elmid, '/', event_type ].join( '' ) ] ;
      }
    }
    else {
      // Handle subscriptions for moving targets.
      if ( direction ) {
        this.event_subscription[ [ elmid, '/', event_type ].join( '' ) ] = true ;
      }
      else if ( events === undefined || ! events[ event_type ] ) {
        // Only remove the subscription if there are no other handlers for this event type.
        delete this.event_subscription[ [ elmid, '/', event_type ].join( '' ) ] ;
      }
    }

    // Check how many unique event subscriptions are currently active.
    var isOn = $.map( this.event_subscription, function ( ) {
      return 1 ; // Map all active subscriptions to '1' to get a count.
    } ) ;

    // Conditionally attach or detach the global scroll/touchmove listeners.
    if ( isOn.length ) {
      if ( events === undefined || ! events.scroll ) {
        // If there are active subscriptions and no scroll listener, bind it.
        $( this.elm ).on( 'scroll touchmove', this.proxy_onscroll ) ;
      }
    }
    else {
      if ( events && events.scroll ) {
        // If no active subscriptions but a scroll listener exists, unbind it.
        $( this.elm ).off( 'scroll touchmove', this.proxy_onscroll ) ;
      }
    }
  } ;


  /**
   * Sets a custom function to be called on every scroll "tick".
   * This function will receive the scroll event object.
   * @param {function} func The callback function for scroll ticks.
   * @returns {Scroller} The Scroller instance for chaining.
   */
  Scroller.prototype.setScrollTick = function ( func ) {
    if ( typeof func === 'function' ) {
      this.scrolltick = func ;
      this._hookEventBinding( this.elm, 'scrolltick', true, true ) ; // Ensure scroll listener is active.
    }
    return this ;
  } ;

  /**
   * Removes the currently set custom scroll tick function.
   * @returns {Scroller} The Scroller instance for chaining.
   */
  Scroller.prototype.removeScrollTick = function ( ) {
    this.scrolltick = null ;
    this._hookEventBinding( this.elm, 'scrolltick', false, true ) ; // Potentially remove scroll listener if no other subs.
    return this ;
  } ;

  /**
   * Adds a new MovingTarget to be monitored by this Scroller.
   * @param {HTMLElement} elm The DOM element to monitor.
   * @param {object} opts Options for the moving target, including offset.
   * @returns {Scroller} The Scroller instance for chaining.
   */
  Scroller.prototype.add = function ( elm, opts ) {
    // Create a new MovingTarget and add it to the internal list.
    this.targets.push( new MovingTarget( this, elm, opts.offset ) ) ;
    bindMovingTargetEvents( elm, opts ) ; // Bind user-defined callbacks to the target.
    return this ;
  } ;

  /**
   * Removes a MovingTarget from being monitored by this Scroller.
   * @param {MovingTarget} target The MovingTarget instance to remove.
   * @returns {boolean} True if the target was found and removed, false otherwise.
   */
  Scroller.prototype.remove = function ( target ) {
    var result = false ;
    var index  = $.inArray( target, this.targets ) ; // Find the target's position in the array.
    if ( index > -1 ) {
      result = true ;
      this.targets.splice( index, 1 ) ; // Remove the target from the array.
    }
    return result ;
  } ;

  /**
   * Forces all MovingTargets managed by this Scroller to refresh their positions.
   * @returns {Scroller} The Scroller instance for chaining.
   */
  Scroller.prototype.refresh = function ( ) {
    // console.log('Scroller#refresh');
    $.each(
      this.targets,
      function ( i, target ) {
        target.refresh( ) ; // Call the refresh method on each target.
      }
    ) ;
    return this ;
  } ;

  /**
   * The trailing function, executed after a short delay following the last scroll event.
   * This ensures that the final state after a series of rapid scrolls is processed.
   */
  Scroller.prototype._tail = function ( ) {
    var tailev = this.tailing_event ; // Retrieve the last event object.
    this.handler_tailing = false ;     // Reset the trailing handler flag.
    this.tailing_event   = null ;      // Clear the stored event.
    this._scrollimpl( tailev, true ) ; // Process the scroll event, indicating it's a trailing call.
  } ;

  /**
   * The main scroll event handler, implementing throttling logic.
   * It ensures scroll events are processed at a controlled rate (e.g., 30fps).
   * @param {Event} ev The scroll event object.
   */
  Scroller.prototype._onscroll = function ( ev ) {
    var now = getNow( ) ; // Get the current timestamp.

    // If enough time has passed since the last processing, execute immediately.
    if ( now - this.last_scroll > jquery_scrollbeacon.every ) {
      this.last_scroll = now ;
      this._scrollimpl( ev ) ;
      return ;
    }

    // Otherwise, set a timeout to process the event after a short delay.
    // This creates a "trailing" edge processing for rapid scrolls.
    if ( this.handler_tailing ) {
      clearTimeout( this.handler_tailing ) ; // Clear any existing trailing timeout to prevent multiple calls.
    }
    this.handler_tailing = setTimeout( this.tailing_function, jquery_scrollbeacon.every * 1.25 ) ;
    this.tailing_event   = ev ; // Store the current event for the trailing handler.
  } ;

  /**
   * The core scroll processing logic. Calculates new positions and dispatches events.
   * @param {Event} ev The scroll event object.
   * @param {boolean} isTailing True if this call is from a trailing timeout.
   */
  Scroller.prototype._scrollimpl = function ( ev, isTailing ) {
    var scrollbeacon ;
    var $elm         = $( this.elm ) ;
    var top          = $elm.scrollTop( ) ;      // Get the current scroll position.
    var delta        = top - this.last_top ;    // Calculate the change in scroll position.

    // If this is a trailing event and there was no actual scroll change, exit.
    if ( isTailing && delta === 0 ) {
      return ;
    }

    // Augment the event object with scrollbeacon-specific data.
    scrollbeacon = ev[ NAMESPACE ] = {
      direction : ( ( delta >= 0 ) ? DIRECTION_DOWN : DIRECTION_UP ), // Determine scroll direction.
      delta     : delta                                                // The magnitude of scroll change.
    } ;
    this.last_top = top ; // Update the last recorded scroll position.

    // Call the user-defined scrolltick function if it exists.
    if ( this.scrolltick ) {
      this.scrolltick( ev ) ;
    }

    // Iterate through all MovingTargets, find those whose state has changed,
    // and then dispatch the appropriate events.
    $.each( $.map( this.targets, findChanged( this.elm, delta ) ), dispatchEvent( scrollbeacon ) ) ;
  } ;

  // =========================================================================
  // MovingTarget Class Definition
  // Represents a single DOM element being monitored for its visibility
  // and position within a scrollable parent.
  // =========================================================================

  var MovingTarget = function ( scroller, elm, offset ) {
    this.elm      = elm ;      // The raw DOM element this target represents.
    this.scroller = scroller ; // Reference to the Scroller instance managing this target.
    this.setOffset( offset ) ; // Initialize the target's offset and calculate initial position.
    $( elm ).data( NAMESPACE, this ) ; // Store a reference to this MovingTarget instance on its DOM element.
  } ;

  /**
   * Destroys this MovingTarget instance.
   * Removes it from the scroller, unbinds events, and cleans up data.
   */
  MovingTarget.prototype.destroy = function ( ) {
    var data = $( this.elm ).data( ) ; // Get all data associated with the element.
    this.stop( ) ;                     // Unbind all scrollbeacon events from the element.
    this.scroller.remove( this ) ;     // Remove this target from its managing scroller.
    this.elm      = null ;             // Nullify references to prevent memory leaks.
    this.scroller = null ;
    delete data[ NAMESPACE ] ;         // Remove the scrollbeacon instance from element data.
    delete data[ NAMESPACE_ELMID ] ;   // Remove the generated element ID from element data.
  } ;

  /**
   * Stops all scrollbeacon-related custom events from firing on this target element.
   * @returns {MovingTarget} The MovingTarget instance for chaining.
   */
  MovingTarget.prototype.stop = function ( ) {
    var $elm = $( this.elm ) ;
    $.each(
      SCROLLBEACON_EVENTS,
      function ( i, str ) {
        $elm.off( str ) ; // Detach each specific scrollbeacon event handler.
      }
    ) ;
    return this ;
  } ;

  /**
   * Refreshes the target's calculated position and its visibility state.
   * This should be called if the element's size or position on the page changes.
   * @returns {MovingTarget} The MovingTarget instance for chaining.
   */
  MovingTarget.prototype.refresh = function ( ) {
    // Recalculate the absolute top and bottom positions of the element, considering offsets.
    var tb = getTopBottom( this.scroller.elm, this.elm, this.offset_t, this.offset_b ) ;
    // Determine the element's new position relative to the scroller's viewport.
    var pos = findPosition( this.scroller.elm, tb.top, tb.bottom ) ;

    this.top      = tb.top ;       // Store the new top position.
    this.bottom   = tb.bottom ;    // Store the new bottom position.
    this.position = pos ;          // Store the new view position state.
    this.in_view  = ( pos > VIEW_OUT ) ; // Update the in_view flag.
    return this ;
  } ;

  /**
   * Sets the offset for this target and immediately refreshes its calculated position.
   * @param {number|string|array|object} obj The offset definition.
   * @returns {MovingTarget} The MovingTarget instance for chaining.
   */
  MovingTarget.prototype.setOffset = function ( obj ) {
    var offset     = getOffset( obj ) ; // Parse the input offset into top and bottom values.
    var top_bottom = getTopBottom( this.scroller.elm, this.elm, offset.top, offset.bottom ) ; // Calculate element bounds with new offsets.
    var pos        = findPosition( this.scroller.elm, top_bottom.top, top_bottom.bottom ) ; // Determine new view position.

    this.offset_t = offset.top ;       // Store the parsed top offset.
    this.offset_b = offset.bottom ;    // Store the parsed bottom offset.
    this.top      = top_bottom.top ;   // Store the calculated absolute top.
    this.bottom   = top_bottom.bottom ;// Store the calculated absolute bottom.
    this.position = pos ;              // Store the new view position state.
    this.in_view  = ( pos > VIEW_OUT ) ; // Update the in_view flag.

    return this ;
  } ;

  // =========================================================================
  // Helper Functions
  // These utility functions provide common operations and calculations.
  // =========================================================================

  /**
   * Retrieves or generates a unique identifier for a given jQuery element.
   * This ID is stored as data on the element for future retrieval.
   * @param {jQuery} $elm The jQuery wrapped element.
   * @returns {string} A unique ID string for the element.
   */
  var getElementId = function ( $elm ) {
    var id = $elm.data( NAMESPACE_ELMID ) ; // Try to retrieve an existing ID.
    if ( ! id ) {
      id = 'se_' + getNow( ) ; // If no ID, generate a new one based on current time.
      $elm.data( NAMESPACE_ELMID, id ) ; // Store the new ID on the element.
    }
    return id ;
  } ;


  /**
   * Binds custom event handlers (from the plugin options) to a target element.
   * This allows users to specify callbacks directly in the plugin configuration.
   * @param {HTMLElement} elm The target DOM element.
   * @param {object} opts The options object containing event callback functions.
   */
  var bindMovingTargetEvents = function ( elm, opts ) {
    var $elm = $( elm ) ;
    $.each(
      MOVINGTARGET_EVENTS,
      function ( i ) {
        // For each known event type, if a corresponding function is provided in options, bind it.
        if ( typeof opts[ this ] === 'function' ) {
          $elm.on( [ this, NAMESPACE ].join( '.' ), opts[ this ] ) ;
        }
      }
    ) ;
  } ;

  // =========================================================================
  // Position and Offset Calculation Utilities
  // =========================================================================

  /**
   * Parses various input formats for offsets into a standardized {top: number, bottom: number} object.
   * Supported formats: number, string, array ([top, bottom]), object ({top: N, bottom: M}).
   * @param {*} v The raw offset value provided by the user.
   * @returns {{top: number, bottom: number}} An object with resolved top and bottom offset values.
   */
  var getOffset = function ( v ) {
    var top, bottom ;
    var type = typeof( v ) ;

    if ( type === 'number' ) {
      top = bottom = v ; // Single number applies to both top and bottom.
    }
    else if ( type === 'string' ) {
      top = bottom = getInt( v ) ; // String is parsed as an integer for both.
    }
    else if ( type === 'undefined' || type === 'function' ) {
      top = bottom = 0 ; // Undefined or function defaults to zero offset.
    }
    else if ( type === 'boolean' ) {
      top = bottom = ( v ? 1 : 0 ) ; // Boolean converted to 1 or 0.
    }
    else {
      if ( v === null ) {
        top = bottom = 0 ; // Null also defaults to zero.
      }
      else if ( Object.prototype.toString.apply( v ) === '[object Array]' ) {
        top    = getInt( v[ 0 ] ) ; // Array [top, bottom]
        bottom = getInt( v[ 1 ] ) ;
      }
      else {
        top    = getInt( v.top ) ; // Object {top: N, bottom: M}
        bottom = getInt( v.bottom ) ;
      }
    }
    return { top: top, bottom: bottom } ;
  } ;

  /**
   * Safely converts a value to an integer, providing a default if conversion fails.
   * @param {*} val The value to parse.
   * @param {number} [def=0] The default value to return if `val` is not a valid number.
   * @param {number} [rad=10] The radix (base) to use for parsing (default: 10).
   * @returns {number} The parsed integer or the default value.
   */
  var getInt = function ( val, def, rad ) {
    var result ;
    rad = rad || 10 ; // Default radix to 10.
    def = def || 0 ;  // Default default value to 0.
    result = parseInt( val, rad ) ;
    if ( isNaN( result ) ) {
      result = def ; // If parsing results in NaN, return the default.
    }
    return result ;
  } ;

  /**
   * Calculates the absolute top and bottom coordinates of a target element
   * relative to its scrollable parent, taking into account custom offsets.
   * @param {HTMLElement} parent The scrollable parent element (or window).
   * @param {HTMLElement} elm The target element.
   * @param {number} offset_t The top offset to apply.
   * @param {number} offset_b The bottom offset to apply.
   * @returns {{top: number, bottom: number}} An object containing the calculated top and bottom coordinates.
   */
  var getTopBottom = function ( parent, elm, offset_t, offset_b ) {
    var parentTop = 0 ;
    var $elm      = $( elm ) ;
    var result    ;

    if ( parent !== window ) {
      // If parent is not window, calculate its absolute top position.
      parentTop = $( parent ).offset( ).top ;
    }

    result = { top: Math.round( $elm.offset( ).top - parentTop + offset_t ) } ;
    result.bottom = result.top + Math.round( $elm.outerHeight( true ) + offset_b ) ;
    return result ;
  } ;

  /**
   * Returns the current timestamp in milliseconds.
   * @returns {number} The number of milliseconds elapsed since January 1, 1970 UTC.
   */
  var getNow = function ( ) {
    return ( new Date( ) ).valueOf( ) ;
  } ;

  /**
   * Determines the relative position of a target element within the scrollable parent's viewport.
   * @param {HTMLElement} parent The scrollable parent element.
   * @param {number} t_top The absolute top coordinate of the target.
   * @param {number} t_bottom The absolute bottom coordinate of the target.
   * @returns {number} One of the `VIEW_` constants indicating the target's position.
   */
  var findPosition = function ( parent, t_top, t_bottom ) {
    var result  = VIEW_OUT ; // Default to out of view.
    var $p      = $( parent ) ;
    var p_top   = $p.scrollTop( ) ; // Current scroll position of the parent's viewport top.
    var p_bottom = p_top + $p.height( ) ; // Current scroll position of the parent's viewport bottom.

    if ( t_bottom <= p_top ) {
      // The target's bottom edge is above or at the viewport's top edge.
      result = VIEW_ABOVE ;
    }
    else if ( p_bottom <= t_top ) {
      // The viewport's bottom edge is above or at the target's top edge.
      result = VIEW_BELOW ;
    }
    else {
      // The target element is intersecting with the viewport in some way.
      if ( t_top <= p_top ) {
        if ( p_bottom <= t_bottom ) {
          // Target starts above viewport top and ends below viewport bottom.
          result = VIEW_OVERLAP ;
        }
        else if ( t_bottom <= p_bottom ) {
          // Target starts above viewport top, but ends within viewport.
          result = VIEW_CLIP_TOP ;
        }
      }
      else if ( p_top <= t_top ) {
        if ( t_bottom <= p_bottom ) {
          // Target is fully contained within the viewport.
          result = VIEW_INTERSECT ;
        }
        else if ( t_bottom <= t_bottom ) { // This condition is always true, implying: if t_top is in view, but t_bottom is not.
          // Target starts within viewport, but ends below viewport bottom.
          result = VIEW_CLIP_BOTTOM ;
        }
      }
    }
    return result ;
  } ;

  /**
   * Returns a function that dispatches custom scrollbeacon events for a given target.
   * This is designed to be used as a callback in a `$.each` loop after `findChanged`.
   * @param {object} scrollbeacon An object containing current scroll event data (direction, delta).
   * @returns {function(number, object)} A function that triggers events based on mapped changes.
   */
  var dispatchEvent = function ( scrollbeacon ) {
    return function ( i, mapped ) {
      var e_ad      ; // Variable to hold Appear/Disappear event object.
      var e_reached ; // Variable to hold TopReached/BottomReached event object.
      var e_change  = $.Event( EV_POSTIONCHANGE ) ; // Create a new positionchange event object.
      var target    = mapped.target ;               // The MovingTarget instance.
      var $elm      = $( target.elm ) ;             // The jQuery wrapped target element.
      var s         = $.extend( { }, scrollbeacon ) ; // Create a shallow copy of scrollbeacon data.

      s.position = target.position ; // Add the target's current view position to event data.
      e_change[ NAMESPACE ] = s ;     // Embed the scrollbeacon data into the custom event.
      $elm.triggerHandler( e_change ) ; // Trigger the positionchange event on the element.

      if ( mapped.event_tr ) {
        e_reached = $.Event( EV_TOPREACHED ) ;
        e_reached[ NAMESPACE ] = s ;
        $elm.triggerHandler( e_reached ) ; // Trigger the topreached event.
      }
      if ( mapped.event_br ) {
        e_reached = $.Event( EV_BOTTOMREACHED ) ;
        e_reached[ NAMESPACE ] = s ;
        $elm.triggerHandler( e_reached ) ; // Trigger the bottomreached event.
      }
      if ( mapped.event_ad ) {
        // Determine whether to trigger 'appear' or 'disappear'.
        if ( target.in_view ) {
          e_ad = $.Event( EV_APPEAR ) ;
        }
        else {
          e_ad = $.Event( EV_DISAPPEAR ) ;
        }
        e_ad[ NAMESPACE ] = s ;
        $elm.triggerHandler( e_ad ) ; // Trigger the appear or disappear event.
      }
    } ;
  } ;

  /**
   * Returns a function that checks if a target's view state has changed
   * and identifies which events (topreached, bottomreached, appear/disappear)
   * should be triggered. This is used as a callback in a `$.map` loop.
   * @param {HTMLElement} parent The scrollable parent element.
   * @param {number} delta The scroll delta (change in scroll position).
   * @returns {function(MovingTarget, number)} A function that returns an object describing event triggers.
   */
  var findChanged = function ( parent, delta ) {
    return function ( target, i ) {
      var result ;
      var pos = findPosition( parent, target.top, target.bottom ) ; // Calculate the target's current position.
      var tp  = target.position ; // Get the target's previous position.

      if ( tp !== pos ) {
        // If the position has changed, initialize the result object.
        result = { target: target } ;

        // Logic to determine specific "reached" events based on scroll direction and position change.
        if ( delta > 0 ) { // Scrolling downwards.
          if ( ( tp === VIEW_BELOW || tp === VIEW_CLIP_BOTTOM || tp === VIEW_INTERSECT ) && ( pos === VIEW_ABOVE || pos === VIEW_CLIP_TOP || pos === VIEW_OVERLAP ) ) {
            // A: Element was below or partially visible, and is now above or partially above (scrolled past its top).
            result.event_tr = true ; // Flag for 'topreached' event.
          }
          if ( ( VIEW_CLIP_BOTTOM < pos && pos < VIEW_OVERLAP ) && ( tp === VIEW_BELOW || tp === VIEW_CLIP_BOTTOM || tp === VIEW_OVERLAP ) ) {
            // B: Element was below or partially visible, and is now fully or partially visible (scrolled past its bottom).
            result.event_br = true ; // Flag for 'bottomreached' event.
          }
        }