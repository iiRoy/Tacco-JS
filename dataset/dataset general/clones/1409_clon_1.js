/*******************************************************************************
 *
 * This JavaScript module provides functionality for generating image thumbnails.
 *
 * Author: kairyou
 * Initial Release: August 1, 2013
 * Last Updated: March 3, 2015
 *
 * Key updates include:
 * - Addressing compatibility issues with Chrome 4x and IE11 (whitespace handling).
 * - Introduction of `before` and `always` callback functions.
 * - Performance improvements for image upload processing.
 *
 * Configuration Options:
 *
 * `size`: Determines how the image fits within the thumbnail boundaries.
 *   - 'contain': Scales the image proportionally to fit entirely within the
 *                thumbnail, potentially leaving empty space.
 *   - 'cover': Scales the image proportionally to completely cover the
 *              thumbnail, potentially cropping parts of the image.
 *   - 'auto': Displays the image at its original size, centered within the
 *             thumbnail, without stretching.
 *
 * `fill`: A boolean flag. If `true`, the thumbnail's background color will
 *         fill any empty space when the source image is smaller than the
 *         specified thumbnail dimensions. If `false`, the thumbnail dimensions
 *         will automatically adjust to fit the image without filling.
 *
 * `stretch`: A boolean flag. If `true`, smaller images will be forcefully
 *            stretched to match the thumbnail's size when `size` is set to
 *            'auto' or 'contain'.
 *
 * Important Considerations:
 *
 * - Cross-origin images cannot be used for watermarking purposes due to
 *   browser security restrictions.
 * - It is recommended to test this functionality on an HTTP(S) server
 *   (e.g., `http://localhost:8080/leon/html5-make-thumb/index.html`)
 *   rather than directly from a local file path (`file://`).
 *
 ******************************************************************************/


( function ( window, $, undefined ) {


    'use strict';

    // Feature detection for FileReader API support.
    $.support.filereader = !!( window.File && window.FileReader && window.FileList && window.Blob );


    // Default configuration settings for thumbnail generation.
    var setting = {
        width: 0, // Desired width of the output thumbnail image.
        height: 0, // Desired height of the output thumbnail image.

        fill: false, // If true, fills background when image is smaller than thumbnail.
        background: '#fff', // Background color used when `fill` is true.

        type: 'image/jpeg', // Output MIME type for the thumbnail ('image/jpeg' or 'image/png').

        size: 'contain', // Defines how the image is scaled within the thumbnail.
                         // Options: 'contain', 'cover', 'auto'.

        mark: {}, // Watermark configuration object.
                  // For text watermarks:
                  // {padding: 5, height: 18, text: 'test', color: '#000', font: '400 18px Arial', bgColor: '#ccc', bgPadding: 5}
                  // For image watermarks:
                  // {padding: 5, src: 'mark.png', width: 34, height: 45}
                  // Note: Image watermarks cannot use cross-origin resources.

        stretch: false, // If true, small images are stretched to fit thumbnail size
                        // when `size` is 'auto' or 'contain'.

        before: null, // Callback function executed before image processing begins.
        done: null, // Callback function executed upon successful thumbnail creation.
                    // Receives: dataURL, blob, targetSize, file, imageSize, fEvt.
        fail: null, // Callback function executed if an error occurs during processing.
                    // Receives: file, fEvt.
        always: null // Callback function executed unconditionally upon completion (success or failure).
    };


    // Cache the jQuery body element for potential appending operations (e.g., debug).
    var $body = $( 'body' );


    // Regular expression to test if a file's MIME type is an image.
    var IMG_FILE = /image.*/;


    /**
     * Converts a Data URI (Base64 string) into a Blob object.
     * This is useful for handling image data in a more memory-efficient way
     * or for sending binary data via XMLHttpRequest.
     *
     * @param {string} dataURI - The Data URI string (e.g., "data:image/jpeg;base64,...").
     * @param {string} [mime] - Optional MIME type for the Blob. If not provided,
     *                          it will be extracted from the Data URI.
     * @returns {Blob|undefined} - A Blob object representing the binary data,
     *                             or undefined if Blob/Uint8Array is not supported.
     */
    var dataURItoBlob = function ( dataURI, mime ) {

        var blob;

        // Check for necessary browser support (FileReader and Uint8Array).
        // Older methods like BlobBuilder and ArrayBuffer are deprecated.
        // See: github.com/blueimp/JavaScript-Canvas-to-Blob, stackoverflow.com/q/15639070/2305701
        var support = !!( $.support.filereader && window.Uint8Array );

        if ( !support ) {
            return blob;
        }

        // Split the Data URI into parts: [ "data:image/jpeg;base64", "..." ]
        var arr = dataURI.split( ',' );

        // Decode the Base64 part into a binary string.
        var byteString = atob( arr[ 1 ] ); // decodeURI(arr[1]) can also be used if the data is URI-encoded.

        // Determine the MIME type. Use the provided one, or extract from URI, or default to 'image/jpeg'.
        mime = mime || arr[ 0 ].split( ':' )[ 1 ].split( ';' )[ 0 ] || 'image/jpeg';

        // Create a Uint8Array from the binary string.
        // (Previously, ArrayBuffer was used, but Uint8Array directly from string is more common now).
        // var ab = new ArrayBuffer(byteString.length); var ia = new Uint8Array(ab); blob = new Blob([ab], { type: mime });
        var ia = new Uint8Array( byteString.length );

        // Populate the Uint8Array with character codes from the binary string.
        for ( var i = 0; i < byteString.length; i++ ) {
            ia[ i ] = byteString.charCodeAt( i );
        }

        // Create and return the Blob object from the Uint8Array.
        blob = new Blob( [ ia ], { type: mime } );

        return blob;

    };


    /**
     * jQuery plugin to generate thumbnails from selected image files.
     *
     * @param {object} options - Configuration options, extending `setting`.
     * @returns {jQuery} - The jQuery object, for chaining.
     */
    $.fn.makeThumb = function ( options ) {

        var opts = {};

        // Merge default settings with user-provided options.
        $.extend( opts, setting, options );


        var $self = this; // Store reference to the jQuery element(s) this plugin was called on.

        // console.log($self); // Debug: Log the jQuery object.
        // alert(navigator.userAgent); alert(window.FileReader); // Debug: Check browser support.
                                                              // Android 2.3.7, for example, does not support FileReader.

        // If FileReader API is not supported, gracefully exit.
        if ( !$.support.filereader ) {
            return this; // Return jQuery object for chaining.
        }


        var size = opts.size; // Cache the 'size' option.


        // Assign callback functions, allowing for both 'done'/'success' and 'fail'/'error' aliases.
        var before = opts.before;
        var always = opts.always || opts.complete;
        var done = opts.done || opts.success;
        var fail = opts.fail || opts.error;


        // Attach a change event handler to the selected input element(s).
        $self.change( function () {

            var self = this; // Reference to the DOM input element.
            var files = self.files; // FileList object from the input.

            var dataURL = ''; // Will store the generated thumbnail's Data URI.
            var blob;         // Will store the generated thumbnail's Blob object.


            // console.log(files.length); // Debug: Number of files selected.

            // Execute the 'before' callback if it's a function.
            if ( $.isFunction( before ) ) {
                before();
            }


            // If no files were selected (e.g., user cancelled file dialog).
            if ( !files.length ) {
                if ( $.isFunction( fail ) ) {
                    fail.apply( self, [] ); // Call 'fail' callback with no arguments.
                }
                if ( $.isFunction( always ) ) {
                    always(); // Call 'always' callback.
                }
                return; // Exit the change handler.
            }


            var file = files[ 0 ]; // Get the first selected file.
            var fr = new FileReader(); // Create a new FileReader instance.

            // console.log('fileInfo:', file); // Debug: Log file information.


            // Create an off-screen HTML5 <canvas> element for image manipulation.
            var $canvas = $( '<canvas></canvas>' );
            var canvas = $canvas[ 0 ];
            var context = canvas.getContext( '2d' );


            var image;       // Will hold the loaded Image object.
            var fEvt;        // Will hold the FileReader event object.

            var imageSize;   // Original image dimensions.
            var targetSize;  // Final thumbnail dimensions.

            var targetH, targetW, tragetX, tragetY; // Variables for positioning/sizing within canvas.
            var ratio;       // Aspect ratio.


            /**
             * Callback function executed after the image has been rendered to the canvas.
             * Retrieves the Data URI and Blob, then invokes user-defined callbacks.
             */
            var callback = function () {

                // $canvas.appendTo($body).hide(); // Debug: Append canvas to body to inspect it.

                dataURL = canvas.toDataURL( opts.type ); // Get the image data as a Data URI.
                blob = dataURItoBlob( dataURL );         // Convert Data URI to Blob.


                // debug: show thumb
                // var thumb = new Image();
                // thumb.src = dataURL;
                // $(thumb).appendTo($body);


                // If a 'done' callback is provided, execute it.
                if ( $.isFunction( done ) ) {
                    targetSize = { width: targetW, height: targetH }; // Final rendered size on canvas.
                    done.apply( self, [ dataURL, blob, targetSize, file, imageSize, fEvt ] );
                }

                // If an 'always' callback is provided, execute it.
                if ( $.isFunction( always ) ) {
                    always();
                }

                $canvas.remove(); // Clean up: Remove the temporary canvas element from the DOM.
            };


            // Initialize MegaPixImage for handling large images and EXIF orientation.
            var mpImg = new MegaPixImage( file );

            // Set the onrender callback for MegaPixImage.
            mpImg.onrender = function () {
                callback(); // Once MegaPixImage finishes rendering, trigger our main callback.
            };


            /**
             * Draws the image onto the canvas, applying EXIF orientation and background.
             * This function is typically called after the image has been loaded.
             *
             * @param {object} exif - EXIF data, particularly for Orientation.
             */
            var drawImage = function ( exif ) {

                var orientation = exif.Orientation; // Get EXIF orientation.

                // Set canvas dimensions based on options.
                canvas.width = opts.width;
                canvas.height = opts.height;

                // If a background color is specified, fill the canvas with it.
                if ( opts.background ) {
                    context.fillStyle = opts.background;
                    context.fillRect( 0, 0, opts.width, opts.height );
                }

                // Render the image using MegaPixImage, handling orientation and scaling.
                mpImg.render( canvas, { maxWidth: opts.width, maxHeight: opts.height, orientation: orientation } );
            };


            // Proceed only if the selected file is an image.
            if ( IMG_FILE.test( file.type ) ) {

                // console.log('file.name:', file.name); // Debug: Log the file name.

                // Set up the error handler for FileReader.
                fr.onerror = function ( fEvent ) {
                    fEvt = fEvent; // Store the error event.
                    if ( $.isFunction( fail ) ) {
                        fail.apply( self, [ file, fEvt ] ); // Call 'fail' callback.
                    }
                    if ( $.isFunction( always ) ) {
                        always(); // Call 'always' callback.
                    }
                };


                // Set up the success handler for FileReader (when file is loaded).
                fr.onload = function ( fEvent ) {

                    fEvt = fEvent; // Store the load event.
                    // console.log(fEvt); // Debug: Log the FileReader load event.

                    var target = fEvt.target;       // The FileReader instance.
                    var result = target.result;     // The Data URI of the loaded file.


                    image = new Image(); // Create a new Image object.

                    var exif; // Variable to store EXIF data.


                    // Set up error handler for the Image object.
                    image.onerror = function () {
                        if ( $.isFunction( fail ) ) {
                            fail.apply( self, [ file ] ); // Call 'fail' callback.
                        }
                        if ( $.isFunction( always ) ) {
                            always(); // Call 'always' callback.
                        }
                    };


                    // Set up load handler for the Image object.
                    image.onload = function () { // When the image itself has loaded.
                        drawImage.apply( null, [ exif ] ); // Draw it onto the canvas.
                    };


                    // Extract the Base64 string from the Data URI.
                    var base64 = result.replace( /^.*?,/, '' );

                    // Decode the Base64 string into a raw binary string.
                    var binary = atob( base64 );

                    // Wrap the binary string in a BinaryFile object for EXIF parsing.
                    var binaryData = new BinaryFile( binary );


                    // Parse EXIF data from the binary file.
                    exif = EXIF.readFromBinaryFile( binaryData );

                    // console.log(exif); // Debug: Log the parsed EXIF data.
                    // console.log(file.name +': '+ exif.Orientation); // Debug: Log file name and orientation.

                    image.src = result; // Set the image source, triggering its load.
                };

                // Read the file content as a Data URL.
                fr.readAsDataURL( file );

                // Note: Using fr.readAsBinaryString(file) would also require binaryajax
                // (as EXIF parsing depends on it), and could result in blank images
                // if not properly handled within image.onload to call drawImage.
            }

        } );

        return this; // Allow for jQuery method chaining.
    };


} )( window, jQuery ); // Immediately Invoked Function Expression (IIFE)