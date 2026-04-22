// This is a Type I clone of the original Scroller requestAnimationFrame polyfill.
// The purpose of this file is to provide a consistent requestAnimationFrame
// and cancelRequestAnimationFrame API across different browsers,
// falling back to a custom setTimeout-based implementation if native
// support or vendor-prefixed versions are not available.
// This code is designed to be functionally identical to the source,
// with only aesthetic changes permitted as per Type I definition.

( function ( global )
{

  // Check if a native or vendor-prefixed requestAnimationFrame is already present.
  // If it exists, there's no need for the polyfill, so we exit early.
  if ( global.requestAnimationFrame )
  {
    return; // Exit function, polyfill not needed.
  }



  // --- Start: Basic Emulation of Native Methods ---
  // These utilities are used internally by the polyfill logic.

  // Polyfill for Date.now() for older environments.
  var now = Date.now || function ( )
  {
    // Returns the current time in milliseconds since the epoch.
    return +new Date;
  };



  // Polyfill for Object.keys() to get an array of an object's own enumerable property names.
  // This is a simplified version, primarily for internal use here.
  var getKeys = Object.keys || function ( obj )
  {

    var keys = { }; // Initialize an empty object to store keys.
    for ( var key in obj )
    {
      keys[ key ] = true; // Mark key as present.
    }

    return keys; // Return the object representing keys.

  };



  // Custom utility to check if an object is empty.
  // This iterates over properties; if any are found, it's not empty.
  var isEmpty = Object.empty || function ( obj )
  {

    for ( var key in obj )
    {
      return false; // Found a key, so object is not empty.
    }

    return true; // No keys found, object is empty.

  };

  // --- End: Basic Emulation of Native Methods ---


  // --- Start: requestAnimationFrame Polyfill Implementation ---
  // Reference: http://webstuff.nfshost.com/anim-timing/Overview.html

  // Suffix used for requestAnimationFrame-like functions.
  var postfix = "RequestAnimationFrame";

  // Detect vendor prefix for requestAnimationFrame.
  var prefix = ( function ( )
  {
    // Common vendor prefixes.
    var all = "webkit,moz,o,ms".split( "," );
    for ( var i = 0; i < 4; i++ )
    {
      // Check if the global object has a vendor-prefixed requestAnimationFrame.
      if ( global[ all[ i ] + postfix ] != null )
      {
        return all[ i ]; // Return the detected prefix.
      }
    }
    return undefined; // No prefix found.
  } ) ( );


  // If a vendor-prefixed version is found, use it directly.
  if ( prefix )
  {
    global.requestAnimationFrame = global[ prefix + postfix ];
    global.cancelRequestAnimationFrame = global[ prefix + "Cancel" + postfix ];
    return; // Exit, as native/vendor implementation is available.
  }

  // --- Start: Custom requestAnimationFrame Implementation (Fallback) ---
  // This section runs if no native or vendor-prefixed requestAnimationFrame is found.

  // Target frames per second for the custom polyfill.
  var TARGET_FPS = 60;

  // Stores callbacks registered with requestAnimationFrame.
  var requests = { };

  // Unique handle counter for requestAnimationFrame calls.
  var rafHandle = 1;

  // Handle for the setTimeout that drives the custom loop.
  var timeoutHandle = null;


  // Custom implementation of requestAnimationFrame.
  global.requestAnimationFrame = function ( callback, root )
  {
    var callbackHandle = rafHandle++; // Get unique handle for this request.

    // Store the callback function associated with its handle.
    requests[ callbackHandle ] = callback;

    // If this is the first request, start the timeout loop.
    if ( timeoutHandle === null )
    {
      timeoutHandle = setTimeout( function ( )
      {
        var time = now( ); // Get current time.
        var currentRequests = requests; // Snapshot of current requests.
        var keys = getKeys( currentRequests ); // Get handles of pending requests.

        // Reset internal state before executing callbacks to prevent re-entrancy issues.
        requests = { };
        timeoutHandle = null;

        // Execute all stored callbacks.
        for ( var i = 0, l = keys.length; i < l; i++ )
        {
          currentRequests[ keys[ i ] ]( time ); // Call with the current time.
        }
      }, 1000 / TARGET_FPS ); // Schedule next frame.
    }

    return callbackHandle; // Return the handle for cancellation.
  };


  // Custom implementation of cancelRequestAnimationFrame.
  global.cancelRequestAnimationFrame = function ( handle )
  {
    delete requests[ handle ]; // Remove the callback from pending requests.

    // If all requests have been cancelled, clear the timeout.
    if ( isEmpty( requests ) )
    {
      clearTimeout( timeoutHandle ); // Stop the scheduled frame update.
      timeoutHandle = null; // Reset the timeout handle.
    }
  };

  // --- End: Custom requestAnimationFrame Implementation (Fallback) ---

} ) ( this ) ; // Immediately invoked function expression, passing 'this' (global object).