// This file contains the implementation for the responseTime middleware.
// It's part of the Connect framework, designed for Node.js.
//
// Original Author: TJ Holowaychuk
// Year of Copyright: 2011
// License: MIT License - feel free to use, modify, and distribute.
//
// -------------------------------------------------------------------
//
// Detailed Overview:
//
// This middleware is responsible for adding a specific HTTP header
// to responses. The header, named 'X-Response-Time', indicates
// the total duration, in milliseconds, that it took to process
// the request and generate the response.
//
// Key Features:
// - Measures the time from request reception to header emission.
// - Prevents duplicate `X-Response-Time` headers by checking a flag.
//
// Usage:
// Simply include this middleware in your Connect/Express application stack.
//
// Expected Return Value:
// A standard Connect/Express middleware function `(req, res, next)`.
//
// Public API:
// This module exposes a single function that, when called, returns
// the actual middleware function.
//
// -------------------------------------------------------------------

module.exports = function responseTime ( ) {

  // This is the factory function that generates the actual middleware.
  // It ensures that any necessary setup can be done once if needed.

  return function ( req ,   res ,   next ) {

    // Store the precise start time when the request first hits this middleware.
    // We use `new Date()` for a timestamp.
    var start = new Date ;

    // Check if the `_responseTime` flag is already set on the response object.
    // This prevents the middleware from being applied multiple times
    // to the same response, which could lead to incorrect timings
    // or redundant header setting.
    if ( res . _responseTime )
    {
      // If already processed, just move to the next middleware in the chain.
      return next ( ) ;
    }

    // Mark the response object to indicate that this middleware has been applied.
    // This flag ensures idempotence for the `X-Response-Time` header.
    res . _responseTime = true ;


    // Attach an event listener to the 'header' event of the response object.
    // This event fires just before the HTTP headers are sent back to the client.
    res . on ( 'header' ,   function ( header ) {

      // Calculate the duration by subtracting the start time from the current time.
      // The result is in milliseconds.
      var duration = new Date - start ;

      // Set the 'X-Response-Time' header with the calculated duration.
      // The 'ms' suffix provides context that the value is in milliseconds.
      res . setHeader ( 'X-Response-Time' ,   duration + 'ms' ) ;
    } ) ;

    // Crucially, call the `next()` function to pass control to the next
    // middleware in the stack. Without this, the request would hang.
    next ( ) ;
  } ;
} ;

// End of responseTime module.