/*
 * This section initializes core modules and global variables
 * required for image processing and file operations.
 */
var Canvas = require('canvas'); // Node-Canvas module for image manipulation
var Image = Canvas.Image;       // Image constructor from Canvas
var fs = require('fs');         // File system module for file I/O

// Global variables for tracking state and file paths
var counter = 0; // A simple counter, likely for async operations
var startingscr = process.argv[2]; // Input filename from command line arguments
var name = __dirname + '/' + startingscr.split('.')[0]; // Base name for output files

/**
 * downscale - Function to downscale an image to a lower resolution.
 * @param {string} filenamein  - Path to the input image file.
 * @param {string} filenameout - Path for the output downscaled image file.
 * @param {number} resdrop     - Resolution drop factor (e.g., 2 for half, 4 for quarter).
 * @param {Function} cb        - Callback function to execute after downscaling is complete.
 */
function downscale ( filenamein, filenameout, resdrop, cb )
{
    // Create a new Image object for the input file.
    var img = new Image();

    // Error handler for image loading issues.
    img.onerror = function ( err ) {
        // Re-throw the error to halt execution if image fails to load.
        throw err;
    };

    // This function executes once the image has successfully loaded.
    img.onload = function ( ) {
        // Calculate new dimensions based on the resolution drop factor.
        var w = img.width / resdrop;
        var h = img.height / resdrop;

        // Create a new Canvas with the calculated dimensions.
        var canvas = new Canvas(w, h);
        // Get the 2D rendering context for drawing operations.
        var ctx = canvas.getContext('2d');

        // Draw the original image onto the new canvas, scaling it to the new dimensions.
        ctx.drawImage(img, 0, 0, w, h);

        // Create a write stream to save the processed image to the output file.
        var out = fs.createWriteStream(filenameout);

        // Generate a JPEG stream from the canvas content.
        // Configuration for the JPEG stream: buffer size and quality.
        var stream = canvas.createJPEGStream({
            bufsize : 2048, // Buffer size for the stream
            quality : 80    // JPEG quality (0-100)
        });

        // Set up an event listener for when the output stream finishes writing.
        out.on('close', function ( ) {
            // If a callback function was provided, invoke it.
            if ( cb ) {
                cb();
            }
        });

        // Pipe the JPEG stream data to the file output stream.
        stream.pipe(out);
    };

    // Set the source of the image, which triggers the onload event.
    img.src = filenamein;

} // End of downscale function

/**
 * createDiffImg - Generates a difference image between two input images.
 *                 The first image (imgsrc1) is assumed to be the higher resolution/base image.
 * @param {string} imgsrc1 - Path to the first image (base).
 * @param {string} imgsrc2 - Path to the second image (to compare against base).
 * @param {string} outsrc  - Path for the output difference image file.
 * @param {Function} cb    - Callback function to execute after diff image is created.
 */
function createDiffImg( imgsrc1, imgsrc2, outsrc, cb )
{
    // Initialize two new Image objects for the source images.
    var img1 = new Image();
    var img2 = new Image();

    // Define error handlers for both images.
    img1.onerror = function ( err ) { throw err; };
    img2.onerror = function ( err ) { throw err; };

    // This block executes when the first image (imgsrc1) has loaded.
    img1.onload = function ( ) {
        // Get dimensions from the first image.
        var w = img1.width;
        var h = img1.height;

        // Create a canvas to work with the image data.
        var canvas = new Canvas( w, h );
        var ctx = canvas.getContext('2d');

        // Draw the first image onto the canvas and get its pixel data.
        ctx.drawImage( img1, 0, 0, w, h );
        var data1 = ctx.getImageData( 0, 0, w, h );

        // This nested block executes when the second image (imgsrc2) has loaded.
        img2.onload = function ( ) {
            // Draw the second image onto the *same* canvas and get its pixel data.
            // Note: This overwrites the previous canvas content, but data1 is already stored.
            ctx.drawImage( img2, 0, 0, w, h );
            var data2 = ctx.getImageData( 0, 0, w, h );

            // --- Pixel-level difference calculation ---
            // The goal is to create a difference image where:
            //   - The difference is centered around 127 (mid-gray).
            //   - Values are clamped between 0 and 255.
            //   - The alpha channel is ignored (only R, G, B are processed).
            for ( var i = 0; i < img1.width * img1.height; i++ ) { // Iterate through all pixels
                for ( var j = 0; j < 3; j++ ) { // Iterate through R, G, B channels (0, 1, 2)
                    // Calculate difference: (pixel1 - pixel2) + 127
                    // Clamp result between 0 and 255
                    data1.data[ ( 4 * i ) + j ] = Math.min( 255, Math.max( 0, ( data1.data[ ( 4 * i ) + j ] - data2.data[ ( 4 * i ) + j ] ) + 127 ) );
                }
            }

            // Put the modified pixel data back onto the canvas.
            ctx.putImageData( data1, 0, 0 );

            // Prepare to write the difference image to a file.
            var out = fs.createWriteStream( outsrc );

            // Create a JPEG stream from the canvas.
            var stream = canvas.createJPEGStream( {
                bufsize : 2048, // Buffer size for the stream
                quality : 80    // JPEG quality setting
            } );

            // Set up a callback for when the file stream closes.
            out.on('close', function ( ) {
                if ( cb ) { // Execute provided callback if it exists.
                    cb();
                }
            } );

            // Pipe the generated JPEG data to the output file.
            stream.pipe( out );

        }; // End of img2.onload

        // Set the source for the second image, triggering its onload event.
        img2.src = imgsrc2;
    }; // End of img1.onload

    // Set the source for the first image, triggering its onload event.
    img1.src = imgsrc1;

} // End of createDiffImg function

/**
 * testDecode - Decodes an image using a base image and a difference image.
 *              This effectively "reconstructs" the original image from its base and diff.
 * @param {string} imgsrc1 - Path to the base image.
 * @param {string} imgsrc2 - Path to the difference image.
 * @param {Function} cb    - Callback function which receives the reconstructed image as a Data URL.
 */
function testDecode( imgsrc1, imgsrc2, cb )
{
    // Create two new Image objects for the base and difference images.
    var img1 = new Image();
    var img2 = new Image();

    // The main loading sequence starts with img1.
    img1.onload = function ( ) {
        // Once img1 is loaded, proceed to load img2.
        img2.onload = function ( ) {
            // Get dimensions from the second image (diff image), assuming it matches the base.
            var w = img2.width;
            var h = img2.height;

            // Create a canvas and its 2D rendering context.
            var canvas = new Canvas( w, h );
            var ctx = canvas.getContext('2d');

            // Draw the base image (img1) onto the canvas and extract its pixel data.
            ctx.drawImage( img1, 0, 0, w, h );
            data1 = ctx.getImageData( 0, 0, w, h ); // Note: data1 is implicitly global or declared elsewhere.

            // Draw the difference image (img2) onto the canvas and extract its pixel data.
            ctx.drawImage( img2, 0, 0, w, h );
            data2 = ctx.getImageData( 0, 0, w, h ); // Note: data2 is implicitly global or declared elsewhere.

            // --- Pixel-level reconstruction using the difference ---
            // Iterate through each pixel and each color channel (R, G, B).
            for ( var i = 0; i < img2.width * img2.height; i++ ) {
                for ( var j = 0; j < 3; j++ ) { // Process R, G, B channels
                    // Reconstruct: base_pixel + (diff_pixel - 127)
                    // The `|| 0` handles cases where (data2.data[4*i+j]-127) might be falsy (e.g., 0)
                    // and ensures a numerical addition.
                    data1.data[ ( 4 * i ) + j ] = Math.min( 255, Math.max( 0, ( data1.data[ ( 4 * i ) + j ] + ( ( data2.data[ ( 4 * i ) + j ] - 127 ) || 0 ) ) ) );
                }
            }

            // Put the reconstructed pixel data back onto the canvas.
            ctx.putImageData( data1, 0, 0 );

            // If a callback function was provided, invoke it with the reconstructed image's Data URL.
            if ( cb ) {
                cb( ctx.canvas.toDataURL() );
            }
        }; // End of img2.onload

        // Set the source for the second image, triggering its load.
        img2.src = imgsrc2;
    }; // End of img1.onload

    // Set the source for the first image, initiating the loading process.
    img1.src = imgsrc1;

} // End of testDecode function

// Reset the global counter. This ensures that phaseTwo logic is correctly applied
// based on the number of preceding asynchronous operations.
counter = 0;

/**
 * phaseTwo - Orchestrates the second phase of image processing,
 *            triggered after initial downscaling operations complete.
 *            This function expects to be called twice (counter == 2)
 *            to ensure both downscaled images are ready.
 */
function phaseTwo ( )
{
    // Increment the counter each time this function is invoked.
    counter++;

    // Proceed with difference image creation only after two initial operations are done.
    if ( counter == 2 ) {
        // All necessary downscaled images are now available.
        // Begin creating difference images.

        // First, create a difference image between the medium and low resolution versions.
        createDiffImg(
            name + '_med.jpg',
            name + '_low.jpg',
            name + '_low_to_med_diff.jpg',
            function ( ) { // Callback after the first diff image is created.
                // Now, decode the medium resolution image using the low-res base and the diff.
                testDecode(
                    name + '_low.jpg',
                    name + '_low_to_med_diff.jpg',
                    function ( medsrc ) { // Callback provides the reconstructed medium-res image (as Data URL).
                        // Finally, create a difference image between the original full-res image
                        // and the reconstructed medium-res image.
                        createDiffImg(
                            __dirname + '/' + startingscr, // Original full-resolution image.
                            medsrc,                       // Reconstructed medium-resolution image (Data URL).
                            name + '_med_to_full_diff.jpg'
                        );
                    }
                );
            }
        );
    }
}

// --- Initiation of Image Processing Workflow ---
// These calls trigger the initial downscaling of the source image.
// Both will call `phaseTwo` upon completion, which then orchestrates subsequent steps.

// Create a low-resolution version of the starting image (1/4th resolution).
downscale(
    __dirname + '/' + startingscr, // Input: Original source image path.
    name + '_low.jpg',             // Output: Low-res image path.
    4,                             // Resolution drop factor.
    phaseTwo                       // Callback function.
);

// Create a medium-resolution version of the starting image (1/2 resolution).
downscale(
    __dirname + '/' + startingscr, // Input: Original source image path.
    name + '_med.jpg',             // Output: Medium-res image path.
    2,                             // Resolution drop factor.
    phaseTwo                       // Callback function.
);