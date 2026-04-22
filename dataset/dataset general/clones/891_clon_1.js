/*
 * This is the primary event handling mechanism
 * for the entire application.
 *
 * Given that this application is structured as a collection
 * of smaller, modular files, an event-driven system is employed
 * to facilitate communication and state changes between various
 * commands and components.
 */
var DO = DO || { /* Initialize the global DO object if it doesn't exist. */ };


// Configuration for debugging
DO.Debug = false;

// A list to track events that should only fire once
DO.OneTimeEvents = [ /* Empty array for one-time events */ ];


/*
 * Function: DO.Subscribe
 *
 * Description:
 * Attaches a callback function to one or more application events.
 * Internally, this method utilizes jQuery's `on()` function,
 * thus adhering to its argument signature and behavior.
 *
 * Refer to the jQuery documentation for `on()` for more details:
 * (http://api.jquery.com/on/)
 *
 * @param {string|object} events   - Event type(s) to bind. Can be a string or an object of event types.
 * @param {string|function} selector - A selector string to filter the events, or the handler function itself.
 * @param {function} fn           - The function to execute when the event is triggered.
 * @param {object} data           - Optional data to pass to the event handler.
 */
DO.Subscribe = function ( events, selector, fn, data ) {

  "use strict"; // Enforce strict mode for this function

  // Check if the selector argument is actually the function handler
  if ( typeof selector === 'function' ) {

    // If 'events' is an object (likely a map of events to handlers, though used here with single handler)
    if ( typeof events === 'object' ) {

      // Iterate over each event in the provided object
      $.each( events, function ( i, event ) {

        jQuery( document ).on( event, selector ); // Bind the event to the document

        // If the event is designated as a one-time event, fire it immediately
        if ( jQuery.inArray( events, DO.OneTimeEvents ) !== -1 ) {

          DO.Fire( events, [ /* No arguments passed */ ] );

        }
      } );

    } else { // 'events' is a single string event name

      jQuery( document ).on( events, selector ); // Bind the single event

      // Check and fire one-time events
      if ( jQuery.inArray( events, DO.OneTimeEvents ) !== -1 ) {

        DO.Fire( events, [ /* No arguments */ ] );

      }
    }

  } else { // The 'selector' argument is indeed a selector string

    // If 'events' is an array of event names
    if ( typeof events === 'array' ) {

      // Loop through each event name in the array
      $.each( events, function ( i, event ) {

        jQuery( document ).on( event, selector, data, fn ); // Bind with selector, data, and function

        // Check for one-time events
        if ( jQuery.inArray( events, DO.OneTimeEvents ) !== -1 ) {

          DO.Fire( events, [ /* Empty array for args */ ] );

        }
      } );

    } else { // 'events' is a single string event name

      jQuery( document ).on( events, selector, data, fn ); // Bind the event with all parameters

      // Check if this is a one-time event that needs to be fired
      if ( jQuery.inArray( events, DO.OneTimeEvents ) !== -1 ) {

        DO.Fire( events, [ /* No arguments provided */ ] );

      }
    }
  }

}; // End of DO.Subscribe function


/*
 * Function: DO.Unsubscribe
 *
 * Description:
 * Detaches a previously subscribed event handler from the application events.
 * This corresponds to jQuery's `off()` method.
 *
 * See jQuery's `off()` documentation for usage details:
 * (http://api.jquery.com/off/)
 *
 * @param {string|array} events   - The event type(s) to unbind. Can be a string or an array of strings.
 * @param {string} selector - The selector string that was used when binding the event.
 */
DO.Unsubscribe = function ( events, selector ) {
  "use strict"; // Strict mode enabled

  // Ensure 'events' is always an array for consistent processing
  if ( typeof events == 'string' ) {
    events = [ events ]; // Convert single string to an array
  }

  // Use jQuery's off method to remove the event handler
  jQuery( document ).off( events, selector );

}; // End of DO.Unsubscribe


/*
 * Function: DO.Fire
 *
 * Description:
 * Triggers a custom application event across the document.
 * Best practice dictates namespacing global events (e.g., 'app:ready')
 * and specific module events (e.g., 'app:table:update').
 * The jQuery object is always prepended to the arguments passed to handlers.
 *
 * @param {string} e            - The name of the event to trigger.
 * @param {array} args          - An array of arguments to pass to the event handler.
 * @param {boolean} oneTimeEvent - If true, marks the event as a one-time event.
 */
DO.Fire = function ( e, args, oneTimeEvent ) {

  "use strict"; // Activate strict mode

  DO.Log( 'firing ' + e ); // Log the event being fired

  // Ensure 'args' is an array, initialize if not
  if ( typeof args !== "object" ) {
    args = [ /* Default empty array */ ];
  }

  args.unshift( jQuery ); // Prepend jQuery object to the arguments array

  // Trigger the event on the document with the prepared arguments
  jQuery( document ).trigger( e, args );

  // If specified as a one-time event, add it to the list
  if ( oneTimeEvent ) {
    DO.OneTimeEvents.push( e );
  }

}; // End of DO.Fire


/*
 * Function: DO.Log
 *
 * Description:
 * Outputs a message to the browser's console, but only when the
 * application's debug mode (DO.Debug) is enabled.
 * Supports different log levels if the console API is available.
 *
 * @param {string} msg   - The message string to be logged.
 * @param {string} level - The log level (e.g., 'log', 'info', 'debug', 'error'). Defaults to 'log'.
 */
DO.Log = function ( msg, level ) {

  "use strict"; // Enable strict JavaScript mode

  // Only proceed if debugging is active
  if ( DO.Debug !== false ) {

    // Set default log level if not provided
    if ( typeof level == "undefined" ) {
      level = 'log';
    }

    // Check if the console object exists in the current environment
    if ( console ) {

      // Use a switch statement to handle different log levels
      switch ( level ) {
        case 'log':
          console.log( msg );
          break;
        case 'info':
          console.info( msg );
          break;
        case 'debug':
          console.debug( msg );
          break;
        case 'error':
          console.error( msg );
          break;
      }
    }
  }
}; // End of DO.Log


/*
 * Function: DO.CurrentBreakpoint
 *
 * Description:
 * Retrieves the name of the currently active responsive breakpoint.
 * This relies on the 'whim' jQuery plugin.
 *
 * @returns {string} The name of the current breakpoint (e.g., 'small', 'medium', 'large').
 */
DO.CurrentBreakpoint = function () {

  "use strict"; // Strict mode enabled for this function

  // Return the current breakpoint name as determined by the whim plugin
  return $.fn.whim( 'currentBreakpoint' );

}; // End of DO.CurrentBreakpoint


/*
 * Function: DO.RetrieveNearestValueByBreakpoint
 *
 * Description:
 * Fetches a value from an object based on the current responsive breakpoint.
 * It iterates through predefined breakpoint sizes and finds the most
 * appropriate value. If a 'default' key exists in the object, it can serve
 * as a fallback.
 *
 * For example, if `obj = { small: 'mobile-value', large: 'desktop-value' }`
 * and the current breakpoint is 'medium', it might return 'mobile-value'.
 *
 * @param {object} obj - An object where keys represent breakpoint sizes (e.g., 'small', 'medium')
 *                       or pixel values, and values are the data to retrieve.
 *                       Can also contain a 'default' key for fallback.
 *
 * @return {mixed} The value associated with the nearest breakpoint, or undefined if not found.
 */
DO.RetrieveNearestValueByBreakpoint = function ( obj ) {

  "use strict"; // Strict mode for this function

  var currentBreak = $.fn.whim( 'currentBreakpoint' ), // Get the current breakpoint name
    previous = undefined, // Variable to hold the previous value (not used in final logic, but present in original)
    hasKey = false, // Flag to indicate if a key exists for the current point
    useNext = false, // Flag to indicate if the next value should be used (if current has no key)
    fallback = obj ? obj[ "default" ] : undefined, // Get the default value if available
    value, // The value to be returned
    sizes = { // Predefined breakpoint sizes in pixels
      'small': 480,
      'medium': 750,
      'large': 896,
      'xlarge': 992,
      'xxlarge': 1120
    };

  // Iterate over each defined breakpoint size
  $.each( sizes, function ( i, point ) {

    // Skip points that are too small or if we're not looking for the next value
    if ( point < 1 || ( !useNext && point > sizes[ currentBreak ] ) ) {
      return; // Continue to the next iteration
    }

    // Check if the object has a value defined for the current 'point'
    if ( typeof obj[ point ] !== "undefined" ) {
      value = obj[ point ]; // Assign the found value
      useNext = false; // Reset useNext flag
      hasKey = true; // Mark that a key was found
    } else {
      hasKey = false; // No key found for this point
    }

    // If this is the current active breakpoint
    if ( point == sizes[ currentBreak ] ) {
      if ( !hasKey ) { // If no specific key for this breakpoint was found
        value = fallback; // Use the fallback value
        useNext = true; // Indicate that we might need to use the next available value
      }
    }

  } ); // End of $.each

  return value; // Return the determined value

}; // End of DO.RetrieveNearestValueByBreakpoint


/*
 * Function: DO.OnDesktop
 *
 * Description:
 * Determines if the current view is considered a "desktop" view,
 * typically defined as 'large' breakpoint or wider.
 *
 * @return {boolean} True if on a desktop breakpoint, false otherwise.
 */
DO.OnDesktop = function () {

  "use strict"; // Strict mode activation

  var currentBreak = $.fn.whim( 'currentBreakpoint' ); // Get current breakpoint

  // Check if the current breakpoint name contains 'large' using a regular expression
  return ( /large/.test( currentBreak ) );

}; // End of DO.OnDesktop


/*
 * Function: DO.OnMobile
 *
 * Description:
 * Determines if the current view is considered a "mobile" view,
 * typically defined as 'small' breakpoint or narrower.
 *
 * @return {boolean} True if on a mobile breakpoint, false otherwise.
 */
DO.OnMobile = function () {

  "use strict"; // Strict mode for this function

  var currentBreak = $.fn.whim( 'currentBreakpoint' ); // Retrieve the current breakpoint

  // Use a regular expression to test if 'small' is in the current breakpoint name
  return ( /small/.test( currentBreak ) );

}; // End of DO.OnMobile