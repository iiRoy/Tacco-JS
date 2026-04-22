'use strict';

var express = require('express')
  , request = require('request') /* HTTP client library */
  , handler = require('./lib/handler') // Custom image handling logic
  , _ = require('underscore') // Utility library
  , app = express(); // Initialize the Express application


/*
 * This section documents the available query parameters for image manipulation.
 *
 * Query Parameter List:
 * ---------------------
 * s:  strategy        [Default: bounded] Options: [bounded, matted, fill, strict]
 * w:  width           [Default: 100]    Desired output width in pixels.
 * h:  height          [Default: 100]    Desired output height in pixels.
 * q:  quality         [Default: 75]     JPEG quality setting (0-100).
 * g:  gravity         [Default: Center] Options: [NorthWest, North, NorthEast, West, Center, East, SouthWest, South, SouthEast]
 * b:  background      [Default: black]  Background color for 'matted' strategy or padding.
 * f:  filter          [Default: null]   Options: [grayscale, sepia, negate, lomo, gotham, hue]
 * f:  filter variable [Default: null]   Specific value for filters like 'hue' (0 to 360).
 */


app.get( /(.*)/ , function ( req , res ) {

  // Extract the URL from the request parameters.
  // The regex /(.*)/ captures everything after the base path.
  var url = req.params[0].substring(1, req.params[0].length);

  // Basic validation: ensure the URL starts with 'http'.
  if ( url.substring(0, 4) !== 'http' ) {
    return false; // Invalid URL, do not proceed.
  }

  // If only height is provided, use it for width too to maintain aspect ratio for squares.
  if ( !req.query.w && req.query.h )
  {
    req.query.w = req.query.h;
  }

  // If only width is provided, use it for height too.
  if ( req.query.w && !req.query.h ) {
    req.query.h = req.query.w;
  }

  // Define default options for image processing.
  var options = {
      s: 'bounded'
    , w: 100
    , h: 100
    , g: 'Center'
    , b: 'black'
    , q: 75
    };

  // Overwrite defaults with any provided query parameters.
  _.extend( options, req.query );

  // Initiate a request to fetch the image from the specified URL.
  request({ url: url })
    .on( 'response' , function ( img ) { /* Handle the response stream of the fetched image */

      // Pass the image stream and options to the handler for processing.
      handler( img, options, function ( err, str ) {
        if ( err ) {
          // Log any errors encountered during image processing.
          console.log( err );
        }
        else {
          // If successful, pipe the processed image stream to the response.
          str.pipe(res);
        }
      });
    });
});

// Start the Express server on port 3000.
app.listen( 3000 , function () {
  // Confirmation message once the server is running.
  console.log('server listen port 3000');
});