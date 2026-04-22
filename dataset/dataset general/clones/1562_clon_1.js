/*******************************************************************************
 *
 *  jQuery Webcam Plugin - Version 1.0.3
 *
 *  This plugin provides functionality for jQuery to interact with a user's
 *  webcam or other video capture hardware, enabling video stream processing.
 *
 *  Copyright (c) 2010, David "Mackers" McNamara (http://mackers.com)
 *  Licensed under either the MIT license or the GPL Version 2 license.
 *
 *  Portions of this code are derived from the CamCanvas API 0.2.
 *  CamCanvas API Copyright (c) 2009 Taboca (http://www.taboca.com/p/camcanvas/)
 *
 *  Last Modified: Tuesday, March 9, 2010, 14:42:05 CET
 *
 ******************************************************************************/

( function ( $ ) {

    // Main namespace for the webcam plugin
    $.webcam = {};

    // Internal state variables for the webcam plugin
    $.webcam._initialized         = false; // Flag to indicate if the plugin has been initialized
    $.webcam._capturing           = false; // Flag to indicate if video capture is active
    $.webcam._flashready          = false; // Flag to indicate if the Flash component is ready
    $.webcam._width               = 320;   // Default capture width
    $.webcam._height              = 240;   // Default capture height
    $.webcam._interval            = 100;   // Default capture interval in milliseconds

    $.webcam._imageData           = null;  // Stores the raw image data from the webcam
    $.webcam._imageDataCount      = 0;     // Current position in the image data array

    $.webcam._flash               = null;  // Reference to the Flash object
    $.webcam._canvas              = null;  // Reference to the HTML5 canvas element

    $.webcam._triggerCaptureTimeout = null; // Timeout handle for continuous capture

    $.webcam._callbacks           = [];    // Array to store user-defined callbacks
    $.webcam._filters             = [];    // Array to store user-defined image filters

    // Default message displayed in the dialog for Flash permissions
    $.webcam._dialogBody          = "<p>This site wants to access your webcam.</p>" +
                                    "<p>Please ensure you can see yourself above. " +
                                    "Some visitors may have to right-click or " +
                                    "context-click then choose \'Settings\'.</p>";
    $.webcam._dialogProperties    = null;  // Custom properties for the dialog

    $.webcam._imageSize           = 0;     // Calculated size of the image data array

    /**
     * Initializes the webcam plugin.
     * Sets up the canvas and Flash components based on provided properties.
     *
     * @param {HTMLElement} canvas          The HTML5 canvas element to draw video frames on.
     * @param {HTMLElement} flashContainer  The container for the Flash object.
     * @param {Object}      properties      Configuration properties (width, height, interval, dialogBody, dialogProperties).
     */
    $.webcam.init = function ( canvas, flashContainer, properties ) {
        // Reset image data and count upon re-initialization
        $.webcam._imageData       = null;
        $.webcam._imageDataCount  = 0;

        // Apply custom properties if provided
        if ( properties ) {
            if ( properties.width ) {
                $.webcam._width = properties.width;
            }

            if ( properties.height ) {
                $.webcam._height = properties.height;
            }

            if ( properties.interval ) {
                $.webcam._interval = properties.interval;
            }

            if ( properties.dialogBody ) {
                $.webcam._dialogBody = properties.dialogBody;
            }

            if ( properties.dialogProperties ) {
                $.webcam._dialogProperties = properties.dialogProperties;
            }
        }

        // Calculate the total size required for image data (width * height * 4 bytes per pixel for RGBA)
        $.webcam._imageSize = $.webcam._width * $.webcam._height * 4;

        // Store the Flash container and initialize the Flash component
        $.webcam._flash = flashContainer;
        $.webcam._initFlash();

        // Store the canvas element and initialize the canvas component
        $.webcam._canvas = canvas;
        $.webcam._initCanvas();

        // Mark the plugin as initialized
        $.webcam._initialized = true;
    }; // End of $.webcam.init

    /**
     * Starts the video capture process.
     * Optionally adds a callback function to be executed with each captured frame.
     *
     * @param {Function} fn  Optional callback function to execute on each frame.
     */
    $.webcam.startCapture = function ( fn ) {
        // Only proceed if the plugin has been successfully initialized
        if ( !$.webcam._initialized ) {
            return;
        }

        // Set the capturing flag to true
        $.webcam._capturing = true;

        // If a callback function is provided, add it to the list of callbacks
        if ( fn ) {
            $.webcam.addCallback( fn, $.webcam._interval );
        }

        // Begin the process of triggering captures
        $.webcam._triggerCapture();
    }; // End of $.webcam.startCapture

    /**
     * Stops the video capture process.
     * Clears any pending capture timeouts.
     */
    $.webcam.stopCapture = function () {
        // Set the capturing flag to false
        $.webcam._capturing = false;

        // Clear any active capture timeout to prevent further captures
        window.clearTimeout( $.webcam._triggerCaptureTimeout );
    }; // End of $.webcam.stopCapture

    /**
     * Adds a callback function to be executed periodically during capture.
     *
     * @param {Function} fn        The callback function. It will receive the ImageData object as an argument.
     * @param {number}   interval  The minimum interval (in milliseconds) between executions of this callback.
     */
    $.webcam.addCallback = function ( fn, interval ) {
        // Add the new callback to the internal list, along with its interval and last execution time
        $.webcam._callbacks.push( { fn: fn, interval: interval, last: 0 } );
    }; // End of $.webcam.addCallback

    /**
     * Adds an image filter function to be applied to each pixel during capture.
     *
     * @param {Function} fn  The filter function. It receives an object {r, g, b, a}
     *                       and should modify its properties in place.
     */
    $.webcam.addFilter = function ( fn ) {
        // Add the new filter function to the internal list
        $.webcam._filters.push( { fn: fn } );
    }; // End of $.webcam.addFilter

    /**
     * Internal function to trigger a single video frame capture from Flash.
     * This function is called repeatedly via a timeout.
     * It handles cases where Flash might not be ready yet.
     */
    $.webcam._triggerCapture = function () {
        try {
            // Check if the Flash component is ready to capture
            if ( !$.webcam._flashready ) {
                throw ( "Flash not ready" ); // Throw an error if Flash is not initialized
            }

            // Call the ccCapture method on the Flash embed object to grab a frame
            $.webcam._flash.find( 'embed' ).get( 0 ).ccCapture();
        } catch ( e ) {
            // If Flash is not ready or an error occurs, it means the Flash object
            // might not have loaded completely yet.
            // Clear any existing timeout and set a new one to retry capture after the interval.
            window.clearTimeout( $.webcam._triggerCaptureTimeout );
            $.webcam._triggerCaptureTimeout = window.setTimeout( $.webcam._triggerCapture, $.webcam._interval );
        }
    }; // End of $.webcam._triggerCapture

    /**
     * Internal function to initialize the Flash component for webcam access.
     * If no Flash container is provided, a dialog is created to prompt the user
     * for webcam permissions.
     */
    $.webcam._initFlash = function () {
        // Check if the provided Flash container element exists.
        // If not, we need to create a default dialog and container.
        if ( $( $.webcam._flash ).length === 0 ) {
            // Define the callback for when the user accepts webcam access in the dialog
            var onclose = function () {
                // Once accepted, get a reference to the dynamically created Flash container
                $.webcam._flash = $( "#jquerywebcamflash" );

                // Set attributes for the Flash embed object
                $.webcam._flash.find( "embed" ).attr( "width", "0" );             // Make it invisible
                $.webcam._flash.find( "embed" ).attr( "height", "0" );            // Make it invisible
                $.webcam._flash.find( "embed" ).attr( "allowScriptAccess", "always" ); // Allow JS interaction
                $.webcam._flash.find( "embed" ).attr( "mayscript", "true" );      // Enable script access

                // Close the jQuery UI dialog
                dialog.dialog( 'close' );

                // Use a short timeout to ensure the dialog fully closes and DOM updates
                setTimeout( function () {
                    // Position the dialog's parent off-screen to keep the Flash object accessible but hidden
                    $( '#jquerywebcamdialog' ).parent().get( 0 ).style.display = "block";
                    $( '#jquerywebcamdialog' ).parent().get( 0 ).style.left    = "-1000px";

                    // Mark Flash as ready after setup
                    $.webcam._flashready = true;
                }, 200 ); // Wait 200ms
            };

            // This variable seems unused; it might be a remnant.
            var blah = "" + $.webcam._dialogClose;

            // Create a jQuery UI dialog to prompt the user for webcam access.
            // It includes a container for the Flash object and the dialog body message.
            var dialog = $( '<div id="jquerywebcamdialog"></div>' )
                .html( '<div id="jquerywebcamflash"></div>' + $.webcam._dialogBody )
                .dialog( $.webcam._dialogProperties ? $.webcam._dialogProperties : {
                    autoOpen : false, // Don't open automatically, we'll open it explicitly
                    modal    : true,  // Make it a modal dialog
                    title    : "Allow Access to Webcam?", // Dialog title
                    width    : ( $.webcam._width + 40 ),  // Width based on webcam width + padding
                    position : 'top', // Position at the top of the viewport
                    buttons  : { "I Can See Myself" : onclose } // Button to close dialog and proceed
                } );

            // Open the created dialog to display the Flash permission prompt
            dialog.dialog( 'open' );

            // Update the internal reference to point to the dynamically created Flash container
            $.webcam._flash = $( "#jquerywebcamflash" );
        } else {
            // If a Flash container was provided, assume Flash is ready for interaction
            $.webcam._flashready = true;
        }

        // Embed the Flash SWF file into the designated Flash container.
        // This uses a jQuery Flash plugin (not provided in this snippet but implied).
        $.webcam._flash.flash(
            {
                src    : 'jquerywebcamhelper.swf', // Path to the Flash helper SWF
                width  : $.webcam._width,          // Set Flash object width
                height : $.webcam._height          // Set Flash object height
            },
            {
                version : 8 // Require Flash Player version 8 or higher
            }
        );
    }; // End of $.webcam._initFlash

    /**
     * Internal function to initialize the HTML5 canvas element for drawing webcam frames.
     * If no canvas element is provided, a hidden one is created and appended to the body.
     */
    $.webcam._initCanvas = function () {
        // Check if the provided canvas element exists.
        // If not, create a default hidden canvas.
        if ( $( $.webcam._canvas ).length === 0 ) {
            // Create a new canvas element
            var canvas = document.createElement( "canvas" );

            // Set its ID, width, height, and style to make it hidden initially
            canvas.setAttribute( "id", "jquerywebcamcanvas" );
            canvas.setAttribute( "width", $.webcam._width );
            canvas.setAttribute( "height", $.webcam._height );
            canvas.setAttribute( "style", "position: absolute; top: 0; left: -1000px;" );

            // Append the new canvas to the document body
            $( document ).find( "body" ).append( $( canvas ) );

            // Update the internal reference to the newly created canvas
            $.webcam._canvas = $( '#jquerywebcamcanvas' );
        }

        // Iterate over each canvas element (in case multiple were selected/created)
        $.webcam._canvas.each( function () {
            var e = $( this ).get( 0 ); // Get the native DOM element

            // Set the CSS dimensions and intrinsic dimensions of the canvas
            e.style.width  = $.webcam._width + "px";
            e.style.height = $.webcam._height + "px";
            e.width        = $.webcam._width;
            e.height       = $.webcam._height;

            // Get the 2D rendering context of the canvas
            var ctx = e.getContext( "2d" );

            // Clear the canvas and create an empty ImageData object
            ctx.clearRect( 0, 0, $.webcam._width, $.webcam._height );
            $.webcam._imageData = ctx.getImageData( 0, 0, 320, 240 ); // Note: fixed dimensions here, should probably use _width/_height

            // Store the context with the canvas element's jQuery data for easy retrieval
            $( this ).data( 'ctx', ctx );
        } );
    }; // End of $.webcam._initCanvas

    /**
     * Internal function called by the Flash object to pass a single line of pixel data.
     * This function reconstructs the full image, applies filters, and triggers callbacks.
     *
     * @param {string} data  A string of hyphen-separated integer values representing pixel colors for a line.
     */
    $.webcam._passLine = function ( data ) {
        // If the plugin is not initialized, not capturing, or Flash is not ready, do nothing.
        if ( !$.webcam._initialized || !$.webcam._capturing || !$.webcam._flashready ) {
            return;
        }

        // Split the incoming data string into an array of color values
        var coll = data.split( "-" );

        // Process each pixel in the current line
        for ( var i = 0; i < $.webcam._width; i++ ) {
            var intVal = parseInt( coll[ i ] ); // Parse the integer color value

            // Extract R, G, B components from the integer (assuming 0xRRGGBB format)
            var r = ( intVal >> 16 ) & 0xff; // Red component
            var g = ( intVal >> 8 ) & 0xff;  // Green component
            var b = ( intVal ) & 0xff;       // Blue component

            // Assign pixel data to the ImageData object (RGBA format)
            $.webcam._imageData.data[ $.webcam._imageDataCount + 0 ] = r;
            $.webcam._imageData.data[ $.webcam._imageDataCount + 1 ] = g;
            $.webcam._imageData.data[ $.webcam._imageDataCount + 2 ] = b;
            $.webcam._imageData.data[ $.webcam._imageDataCount + 3 ] = 255; // Alpha (fully opaque)

            // Apply any registered image filters to the current pixel
            for ( var j = 0; j < $.webcam._filters.length; j++ ) {
                // Create a temporary object for the filter to modify
                var filtered = {
                    r : $.webcam._imageData.data[ $.webcam._imageDataCount + 0 ],
                    g : $.webcam._imageData.data[ $.webcam._imageDataCount + 1 ],
                    b : $.webcam._imageData.data[ $.webcam._imageDataCount + 2 ],
                    a : $.webcam._imageData.data[ $.webcam._imageDataCount + 3 ]
                };

                // Execute the filter function
                $.webcam._filters[ j ].fn( filtered );

                // Update the ImageData with the filtered pixel values
                $.webcam._imageData.data[ $.webcam._imageDataCount + 0 ] = filtered.r;
                $.webcam._imageData.data[ $.webcam._imageDataCount + 1 ] = filtered.g;
                $.webcam._imageData.data[ $.webcam._imageDataCount + 2 ] = filtered.b;
                $.webcam._imageData.data[ $.webcam._imageDataCount + 3 ] = filtered.a;
            }

            // Increment the image data count by 4 (for R, G, B, A) to move to the next pixel
            $.webcam._imageDataCount += 4;
        }

        // Check if a full frame of image data has been received
        if ( $.webcam._imageDataCount >= $.webcam._imageSize ) {
            // Reset the image data count for the next frame
            $.webcam._imageDataCount = 0;

            // Draw the complete image data onto the canvas
            $.webcam._canvas.each( function () {
                var ctx = $( this ).data( 'ctx' ); // Retrieve the canvas context
                ctx.putImageData( $.webcam._imageData, 0, 0 ); // Put the image data at (0,0)
            } );

            // Execute registered callbacks if their interval has passed
            for ( var i = 0; i < $.webcam._callbacks.length; i++ ) {
                var d = ( new Date() ).getTime(); // Current timestamp

                // Check if enough time has passed since the last callback execution
                if ( $.webcam._callbacks[ i ].last < d - $.webcam._callbacks[ i ].interval ) {
                    $.webcam._callbacks[ i ].last = d; // Update last execution time
                    $.webcam._callbacks[ i ].fn( $.webcam._imageData ); // Execute the callback
                }
            }

            // Set a timeout to trigger the next capture after the specified interval
            $.webcam._triggerCaptureTimeout = window.setTimeout( $.webcam._triggerCapture, $.webcam._interval );
        }
    }; // End of $.webcam._passLine

} )( jQuery ); // End of the IIFE (Immediately Invoked Function Expression)

// Global function required by the Flash object to pass line data.
// This acts as a bridge from the Flash environment to the jQuery plugin.
// This is a known architectural "TODO" for refactoring.
function passLine ( data ) {
    $.webcam._passLine( data );
}