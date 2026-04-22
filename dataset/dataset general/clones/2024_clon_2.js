'use strict'; // Enforce strict parsing and error handling

let webFramework = require('express'),
    httpRequest = require('request'),
    imageProcessor = require('./lib/imageProcessor'), // Load the image processing utility
    utilityToolkit = require('underscore'), // Include a general-purpose utility library
    webAppInstance = webFramework(); // Initialize the web application framework

/*
 * Query string parameters that can influence image transformation:
 * imgStrategy:        Image resizing approach [default: bounded] (options: bounded, matted, fill, strict)
 * outputWidth:        Desired output image width [default: 100]
 * outputHeight:       Desired output image height [default: 100]
 * compressionQuality: JPEG compression quality [default: 75]
 * focalPoint:         Gravitational focus for cropping [default: Center] (options: NorthWest, North, NorthEast, West, Center, East, SouthWest, South, SouthEast)
 * backgroundColor:    Canvas background color [default: black]
 * postEffect:         Image post-processing filter [default: null] (options: grayscale, sepia, negate, lomo, gotham, hue)
 * effectModifier:     Variable for 'hue' filter (0-360) [default: null]
 */

webAppInstance.get( /(.+)/,  function  (  clientRequest,  serverResponse  )  {
  // Extract the target resource URI from the request parameters
  let  resourceUri  =  clientRequest.params[0].substring(1,  clientRequest.params[0].length);

  // Validate that the URI starts with 'http'
  if ( resourceUri.substring(0,  4)  !==  'http' )  {
    return  false; // Invalid URI scheme, abort processing
  }

  // Ensure width and height are consistent if only one dimension is provided in the query
  if ( !clientRequest.query.outputWidth  &&  clientRequest.query.outputHeight )  {
    clientRequest.query.outputWidth  =  clientRequest.query.outputHeight;
  }

  if ( clientRequest.query.outputWidth  &&  !clientRequest.query.outputHeight )  {
    clientRequest.query.outputHeight  =  clientRequest.query.outputWidth;
  }

  // Define default image processing configuration parameters
  const  transformationSettings  =  {
      imgStrategy:  'bounded',
      outputWidth:  100,
      outputHeight:  100,
      focalPoint:  'Center',
      backgroundColor:  'black',
      compressionQuality:  75
    };

  // Merge client-provided query parameters into default settings, overriding defaults where specified
  utilityToolkit.extend(transformationSettings,  clientRequest.query);

  // Initiate an HTTP request to fetch the source image from the specified URI
  httpRequest( { destination:  resourceUri } )
    .on( 'response',  function  (  incomingImageData  )  {
      // Process the fetched image data using the defined settings
      imageProcessor(incomingImageData,  transformationSettings,  function  (  processingError,  outputDataStream  )  {
        if  (  processingError  )  {
          console.error(processingError); // Log any errors that occur during image processing
        }  else  {
          outputDataStream.pipe(serverResponse); // Stream the processed output back to the client
        }
      });
    });
});

// Start the web application server on the specified port
webAppInstance.listen( 3000,  function  ()  {
  console.info('Image transformation service is operational on port 3000'); // Inform about server readiness
});