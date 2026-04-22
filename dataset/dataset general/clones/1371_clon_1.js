/*!
 *  Pixastic - JavaScript Image Processing Library
 *  http://pixastic.com/
 *
 *  Copyright 2012, Jacob Seidelin. All Rights Reserved.
 *
 *  Dual licensed under the MPL 1.1 or GPLv3 licenses.
 *  Refer to the official documentation for license details:
 *  http://pixastic.com/license-mpl.txt
 *  http://pixastic.com/license-gpl-3.0.txt
 *
 *  This file contains the core Pixastic functionality.
 */

var Pixastic = ( function() { /* Begin Pixastic IIFE */


  var worker; // Declare a worker variable for background processing


  /**
   * Helper function to create an ImageData object.
   * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of a canvas.
   * @param {number} width - The desired width.
   * @param {number} height - The desired height.
   * @returns {ImageData} A new ImageData object.
   */
  function createImageData( ctx, width, height ) {

    if ( ctx.createImageData ) {
      // Use createImageData if available (preferred)
      return ctx.createImageData( width, height );
    }

    else {
      // Fallback for older browsers: use getImageData to get an empty ImageData object
      return ctx.getImageData( 0, 0, width, height );
    }

  } /* End of createImageData */


  /**
   * The main Pixastic constructor function.
   * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas to manipulate.
   * @param {string} [workerControlPath=""] - Optional path to the web worker control script.
   * @returns {object} An object with chainable effect methods and a `done` method.
   */
  function Pixastic( ctx, workerControlPath ) {

    // Internal object to hold chainable methods
    var P = {},
      // Get canvas dimensions
      width = ctx.canvas.width,
      height = ctx.canvas.height,
      // Queue to store effects to be applied
      queue = [],
      // Ensure workerControlPath is a string, default to empty
      workerControlPath = workerControlPath || "";


    // Initialize web worker if not already done
    if ( ! worker ) {

      // Check if Web Workers are supported by the browser
      if ( typeof window.Worker != "undefined" ) {

        try {
          // Attempt to create a new Web Worker instance
          worker = new window.Worker( workerControlPath + "pixastic.worker.control.js" );
        }

        catch( e ) {
          // Handle potential errors during worker creation
          if ( location.protocol == "file:" ) {
            Pixastic.log( "Could not create native worker, running from file://" );
          }

          else {
            Pixastic.log( "Could not create native worker." );
          }
        }

      } // End of window.Worker check

      // If worker creation failed or not supported, use the fallback in-browser worker
      if ( ! worker ) {
        worker = new Pixastic.Worker();
      }

    } // End of worker initialization


    // Populate the Pixastic object with chainable effect methods
    for ( var e in Pixastic.Effects ) {

      // Ensure that the property belongs to Pixastic.Effects and not its prototype chain
      if ( Pixastic.Effects.hasOwnProperty( e ) ) {

        // Use an IIFE to capture the current effect name `e`
        ( function( e ) {
          // Add a method for each effect to the P object
          P[e] = function( options ) {
            // Push the effect and its options to the processing queue
            queue.push( {
              effect : e,
              options : options
            } );
            // Return P for method chaining
            return P;
          }; /* End of P[e] effect method */


          /**
           * Executes the queued effects.
           * @param {function} [callback] - Function to call when all effects are done.
           * @param {function} [progress] - Function to call for progress updates.
           */
          P.done = function( callback, progress ) {

            var inData, outData;

            try {
              // Get the current image data from the canvas
              inData = ctx.getImageData( 0, 0, width, height );
            }

            catch( e ) {
              // Handle security errors when accessing canvas data
              if ( location.protocol == "file:" ) {
                throw new Error( "Could not access image data, running from file://" );
              }

              else {
                throw new Error( "Could not access image data, is canvas tainted by cross-origin data?" );
              }
            }


            // Create a new ImageData object for the output
            outData = createImageData( ctx, width, height );

            // Send the processing job to the worker
            worker.postMessage( {
              queue : queue,
              inData : inData,
              outData : outData,
              width : width,
              height : height
            } );


            // Set up the worker's message handler
            worker.onmessage = function( message ) {

              var d = message.data; // Data received from the worker

              switch ( d.event ) {

                case "done" :
                  // When processing is complete, put the final image data back on the canvas
                  ctx.putImageData( d.data, 0, 0 );
                  // Invoke the callback if provided
                  if ( callback ) {
                    callback();
                  }
                  // Report 100% progress
                  if ( progress ) {
                    progress( 1 );
                  }
                  break;

                case "progress" :
                  // Report progress updates if a progress callback is provided
                  if ( progress ) {
                    progress( d.data );
                  }
                  break;

                case "error" :
                  // Handle errors from the worker (currently no specific action)
                  break;

              } /* End of switch(d.event) */

            }; /* End of worker.onmessage */

            // Initial progress report (0%)
            if ( progress ) {
              progress( 0 );
            }

          }; /* End of P.done method */

        } )( e ); // Immediately invoke the function with the current effect name

      } // End of hasOwnProperty check

    } // End of for...in loop

    return P; // Return the Pixastic object with chainable methods

  } /* End of Pixastic function */


  /**
   * Defines a fallback "Worker" implementation that runs in the main thread
   * if a native Web Worker cannot be created.
   */
  Pixastic.Worker = function() {

    var me = this; // Store reference to `this` (the Worker instance)


    /**
     * Processes a message received by the "worker".
     * This function simulates the worker's processing logic.
     * @param {object} data - The message data containing queue, image data, and dimensions.
     */
    function processMessage( data ) {

      var queue = data.queue, // Array of effects to apply
        inData = data.inData, // Input ImageData
        outData = data.outData, // Output ImageData
        width = data.width, // Canvas width
        height = data.height, // Canvas height
        tmpData; // Temporary storage for swapping image data


      // Iterate through each effect in the queue
      for ( var i = 0; i < queue.length; i++ ) {

        var e = queue[i].effect, // Current effect name
          options = queue[i].options, // Options for the current effect
          progressCallback; // Callback for reporting intermediate progress


        // For subsequent effects, swap input and output data
        if ( i > 0 ) {
          tmpData = inData;
          inData = outData;
          outData = tmpData;
        }


        // If running in a real Web Worker environment (indicated by importScripts),
        // provide a progress callback that reports back to the main thread.
        if ( typeof importScripts == "function" ) {

          progressCallback = function( p ) {
            // Send a progress message back to the main thread
            me.onmessage( {
              data : {
                event : "progress",
                data : ( i + p ) / queue.length // Calculate overall progress
              }
            } );
            return p; // Return the progress value
          };

        }


        // Apply the current effect using its corresponding function
        Pixastic.Effects[e]( inData.data, outData.data, width, height, options, progressCallback );


        // Report progress after each effect is completed
        me.onmessage( {
          data : {
            event : "progress",
            data : ( i + 1 ) / queue.length // Increment overall progress
          }
        } );

      } // End of effect queue loop


      // Once all effects are processed, send the final "done" message
      me.onmessage( {
        data : {
          event : "done",
          data : outData // Include the final output ImageData
        }
      } );

    } /* End of processMessage */


    /**
     * Simulates the postMessage method of a Web Worker.
     * Executes the processing logic asynchronously.
     * @param {object} data - The message data to be processed.
     */
    this.postMessage = function( data ) {

      // Use setTimeout to defer execution, simulating async behavior
      setTimeout( function() {
        processMessage( data );
      }, 0 );

    };


    // Placeholder for the onmessage handler, to be set by the calling code
    this.onmessage = function() {
      /* Default empty handler */
    };

  }; /* End of Pixastic.Worker */


  // --- Utility Functions for Pixastic ---

  /**
   * Logs a message to the console if available.
   * @param {string} str - The message string to log.
   */
  Pixastic.log = function( str ) {

    if ( typeof console != "undefined" && console.log ) {
      console.log( "Pixastic: " + str );
    }

  }; /* End of Pixastic.log */


  /**
   * Converts an image, canvas, or ImageData object into a canvas element.
   * @param {HTMLImageElement|HTMLCanvasElement|ImageData} o - The input object.
   * @returns {HTMLCanvasElement|undefined} A new canvas element, or undefined if conversion fails.
   */
  function toCanvas( o ) {

    var canvas; // Declare canvas variable

    if ( typeof o == "object" ) {

      if ( typeof o.tagName == "string" ) {

        // If it's an HTML tag (img or canvas)
        if ( o.tagName.toLowerCase() == "canvas" || o.tagName.toLowerCase() == "img" ) {
          canvas = document.createElement( "canvas" ); // Create a new canvas
          canvas.width = o.width; // Set its width
          canvas.height = o.height; // Set its height
          // Draw the original object onto the new canvas
          canvas.getContext( "2d" ).drawImage( o, 0, 0 );
        }

      }

      // If it's an ImageData object or an object resembling one
      else if ( ( window.ImageData && o instanceof window.ImageData )
        || ( typeof o.width == "number" && typeof o.height == "number" && typeof o.data == "object" ) ) {

        canvas = document.createElement( "canvas" ); // Create a new canvas
        canvas.width = o.width; // Set its width
        canvas.height = o.height; // Set its height
        // Put the ImageData onto the new canvas
        canvas.getContext( "2d" ).putImageData( o, 0, 0 );
      }

    } // End of typeof o == "object" check

    return canvas; // Return the created canvas (or undefined)

  } /* End of toCanvas */


  /**
   * Converts an image, canvas, or ImageData object into an HTMLImageElement.
   * @param {HTMLImageElement|HTMLCanvasElement|ImageData} o - The input object.
   * @returns {HTMLImageElement} A new image element.
   */
  function toImage( o ) {

    var canvas = toCanvas( o ), // First, convert to a canvas
      image = new Image(); // Create a new Image object

    image.width = canvas.width; // Set image width
    image.height = canvas.height; // Set image height
    image.src = canvas.toDataURL(); // Convert canvas to data URL and set as image source

    return image; // Return the new image

  } /* End of toImage */


  /**
   * Converts an image, canvas, or ImageData object into an ImageData object.
   * @param {HTMLImageElement|HTMLCanvasElement|ImageData} o - The input object.
   * @returns {ImageData} A new ImageData object.
   */
  function toImageData( o ) {

    var canvas = toCanvas( o ), // Convert to canvas first
      ctx = canvas.getContext( "2d" ); // Get its 2D context

    return ctx.getImageData( 0, 0, canvas.width, canvas.height ); // Return the ImageData

  } /* End of toImageData */


  /**
   * Calculates the histogram of an ImageData object (grayscale intensity).
   * @param {ImageData} imageData - The ImageData object to analyze.
   * @returns {object} An object containing `maxValue` and `values` array.
   */
  function histogram( imageData ) {

    var values = [], // Array to store histogram values (0-255)
      i, p, // Loop counters and pixel position
      data = imageData.data, // Raw pixel data (R,G,B,A sequence)
      round = Math.round, // Shortcut for Math.round
      maxValue, // Maximum count in the histogram
      n = imageData.width * imageData.height; // Total number of pixels


    // Initialize histogram values to zero
    for ( i = 0; i < 256; i++ ) {
      values[i] = 0;
    }


    // Iterate through each pixel to calculate intensity
    for ( i = 0; i < n; i++ ) {
      p = i * 4; // Get the starting index for the current pixel (R,G,B,A)
      // Calculate average intensity (grayscale approximation) and increment its count
      values[ round( ( data[p] + data[p+1] + data[p+2] ) / 3 ) ]++;
    }


    maxValue = 0; // Initialize max value to 0
    // Find the maximum count in the histogram
    for ( i = 0; i < 256; i++ ) {
      if ( values[i] > maxValue ) {
        maxValue = values[i];
      }
    }


    return {
      maxValue : maxValue, // The highest frequency in the histogram
      values : values // The array of frequency counts for each intensity level
    };

  } /* End of histogram */


  // Expose utility functions on the Pixastic object
  Pixastic.toCanvas = toCanvas;
  Pixastic.toImage = toImage;
  Pixastic.toImageData = toImageData;
  Pixastic.histogram = histogram;


  /**
   * Namespace for color conversion utility functions.
   * Note: Most functions are empty placeholders in the original code.
   */
  Pixastic.Color = {

    /**
     * Converts RGB color components to HSL.
     * @param {number} r - Red component (0-255).
     * @param {number} g - Green component (0-255).
     * @param {number} b - Blue component (0-255).
     */
    rgb2hsl : function( r, g, b ) {

      // Ensure color components are within valid range (0-255)
      if ( r < 0 ) r = 0;
      if ( g < 0 ) g = 0;
      if ( b < 0 ) b = 0;

      if ( r > 255 ) r = 255; // Corrected: should be 255, not 0
      if ( g > 255 ) g = 255; // Corrected: should be 255, not 0
      if ( b > 255 ) b = 255; // Corrected: should be 255, not 0

      // Actual HSL conversion logic would go here.
      // This is just a placeholder with input clamping.
    },


    /**
     * Converts RGB color components to HSV.
     * @param {number} r - Red component.
     * @param {number} g - Green component.
     * @param {number} b - Blue component.
     */
    rgb2hsv : function( r, g, b ) {
      // Implementation for RGB to HSV conversion goes here.
    },


    /**
     * Converts RGB color components to a hexadecimal string.
     * @param {number} r - Red component.
     * @param {number} g - Green component.
     * @param {number} b - Blue component.
     */
    rgb2hex : function( r, g, b ) {
      // Implementation for RGB to Hex conversion goes here.
    },


    /**
     * Converts HSL color components to RGB.
     * @param {number} h - Hue.
     * @param {number} s - Saturation.
     * @param {number} l - Lightness.
     */
    hsl2rgb : function( h, s, l ) {
      // Implementation for HSL to RGB conversion goes here.
    },


    /**
     * Converts HSV color components to RGB.
     * @param {number} h - Hue.
     * @param {number} s - Saturation.
     * @param {number} v - Value.
     */
    hsv2rgb : function( h, s, v ) {
      // Implementation for HSV to RGB conversion goes here.
    }

  }; /* End of Pixastic.Color */


  return Pixastic; // Return the main Pixastic object for global access

} )(); /* End Pixastic IIFE */