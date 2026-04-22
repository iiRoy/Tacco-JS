/*****************************************************************************************************
 *
 *  Filterous.js - A JavaScript library for applying simple photo filters directly within the browser
 *  using the HTML5 Canvas API. This project was developed by Tomomi Imura.
 *
 *  Project Repository: https://github.com/girliemac/Filterous/
 *  Author's Website: http://girliemac.com
 *  Author's Twitter: @girlie_mac
 *
 *  License: Distributed under the MIT License.
 *  Last Updated: March 2, 2014 - This version includes various enhancements and fixes.
 *
 *****************************************************************************************************/


var Filterous = function( imgObj, output )
{

    // Store the original image object and the desired output format/element.
    // These properties will be accessible throughout the Filterous instance.
    this.imgObj = imgObj;
    this.output = output;


    // Before proceeding, we need to check if a previously filtered photo
    // (identified by 'filteredPhoto' ID) exists in the DOM.
    // If it does, it implies a re-filtering operation or a previous render
    // that needs to be cleared to avoid duplicates.
    var prevFilteredPhoto = document.getElementById( 'filteredPhoto' );


    // If a previous instance of the filtered photo canvas or image is found,
    // it must be removed from its parent node to ensure a clean state
    // for the new filtering operation.
    if ( prevFilteredPhoto )
    {

        prevFilteredPhoto.parentNode.removeChild( prevFilteredPhoto );

    }


    // Create a new HTML5 Canvas element. This canvas will serve as the
    // primary drawing surface for applying filters and manipulations.
    this.c = document.createElement( 'canvas' );


    // Assign a unique ID to the newly created canvas. This ID is used
    // to manage the canvas in the DOM, especially for removal purposes
    // as seen above.
    this.c.id = 'filteredPhoto';


    // Set the width of the canvas to match the natural width of the
    // original image object. This ensures the filtered output has the
    // same dimensions as the source.
    this.c.width = imgObj.naturalWidth;


    // Similarly, set the height of the canvas to match the natural height
    // of the original image.
    this.c.height = imgObj.naturalHeight;


    // Obtain the 2D rendering context of the canvas. This context provides
    // all the drawing methods required for image manipulation, including
    // drawing images and manipulating pixel data.
    this.ctx = this.c.getContext( '2d' );


    // Draw the original image onto the canvas at position (0,0).
    // This initializes the canvas with the source image data,
    // making it ready for filter application.
    this.ctx.drawImage( imgObj, 0, 0 );

};


// Define the prototype methods for the Filterous object.
// These methods encapsulate the core functionalities like
// applying layers, filtering, rendering, and specific filter algorithms.
Filterous.prototype = {

    /**
     * Applies an image layer (e.g., a texture or overlay) onto the current canvas context.
     * The layer is drawn over the existing content, covering the entire canvas area.
     *
     * @param {Image} layerObj - The image object to be used as a layer.
     */
    applyLayer: function( layerObj )
    {

        // Draw the provided layer image onto the canvas context.
        // It's scaled to fit the entire canvas dimensions.
        this.ctx.drawImage( layerObj, 0, 0, this.c.width, this.c.height );

    },

    /**
     * Applies a specified filter function to the image data on the canvas.
     * This method manages retrieving pixel data, applying the filter,
     * and storing the resulting pixel data for rendering.
     *
     * @param {string} filter - The name of the filter function to apply (e.g., 'grayscale', 'brightness').
     * @param {...*} args - Additional arguments to pass to the filter function.
     */
    filterImage: function( filter, args )
    {

        // Check if there's already processed pixel data from a previous filter application.
        // If so, put that image data back onto the canvas. This is crucial for
        // applying multiple filters sequentially, ensuring each new filter
        // operates on the result of the previous one, not the original image.
        if ( this.pixelData )
        {
            this.ctx.putImageData( this.pixelData, 0, 0 );
        }

        // Retrieve the current image data from the canvas. This is an ImageData object
        // containing the pixel data (RGBA values) for the entire canvas area.
        var params = [ this.ctx.getImageData( 0, 0, this.c.width, this.c.height ) ];


        // Collect any additional arguments passed to filterImage after the 'filter' name.
        // These arguments are intended for the actual filter function (e.g., adjustment for brightness).
        for ( var i = 1; i < arguments.length; i++ )
        {
            params.push( arguments[i] );
        }

        // Dynamically call the specified filter function.
        // The 'filter' string is used as a key to access the corresponding method
        // on the Filterous.prototype object. The 'apply' method is used to
        // pass 'params' as an array of arguments to the filter function.
        // The result (modified ImageData) is stored in 'this.pixelData'.
        this.pixelData = this[filter].apply( this, params );

    },

    /**
     * Renders the filtered image onto the DOM, either by replacing the original image
     * with the canvas or by creating a new image element from the canvas data URL.
     *
     * @param {boolean} reset - If true, the canvas is reset to the original image before rendering.
     */
    render: function( reset )
    {

        // If the 'reset' flag is true, re-draw the original image onto the canvas.
        // This effectively clears any applied filters and reverts to the initial state.
        if ( reset )
        {
            this.ctx.drawImage( this.imgObj, 0, 0 );
        }
        // If 'reset' is false but 'this.pixelData' exists (meaning filters have been applied),
        // put the processed pixel data back onto the canvas. This makes the filtered image visible.
        else if ( this.pixelData )
        {
            this.ctx.putImageData( this.pixelData, 0, 0 );
        }


        // Determine how the output should be handled based on 'this.output' property.
        // If 'this.output' is specified (e.g., 'png', 'jpeg'), create a new image element.
        if ( this.output )
        {

            // Create a new <img> element from the canvas's data URL.
            // The format specified in 'this.output' determines the image type.
            var newImgObj = this.createNewImgObj( this.output );

            // Insert the newly created image element into the DOM,
            // right before the original image object.
            this.imgObj.parentNode.insertBefore( newImgObj, this.imgObj );

        }
        // If 'this.output' is not specified, insert the canvas itself into the DOM.
        else
        {

            // Insert the canvas element directly into the DOM,
            // before the original image object.
            this.imgObj.parentNode.insertBefore( this.c, this.imgObj );

        }


        // Hide the original image element. This ensures that only the
        // filtered output (either the canvas or the new image) is visible.
        this.imgObj.setAttribute( 'hidden', 'hidden' );

    },

    /**
     * Creates a new <img> element with its source set to the canvas's data URL.
     * This allows for saving or displaying the filtered image as a standard image file.
     *
     * @param {string} format - The desired image format (e.g., 'png', 'jpeg', 'webp').
     * @returns {HTMLImageElement} The newly created image element.
     */
    createNewImgObj: function( format )
    {
        // The 'format' parameter should ideally be 'png', 'jpeg', or 'webp'.
        // If an unsupported format is given, 'toDataURL' will typically default to 'png'.

        // Create a new HTML <img> element.
        var img = document.createElement( 'img' );

        // Assign the 'filteredPhoto' ID to the new image, matching the canvas ID.
        // This is useful if the output is an image and needs to be managed similarly.
        img.id = 'filteredPhoto';

        // Set the 'src' attribute of the image to the data URL obtained from the canvas.
        // The 'toDataURL' method converts the canvas content into an image data URL
        // of the specified MIME type.
        img.src = this.c.toDataURL( 'image/' + format );

        // Return the fully configured image element.
        return img;
    },

    /**
     * Resets the canvas to display the original image without any filters.
     * This is achieved by calling the render method with the 'reset' flag set to true.
     */
    reset: function()
    {
        // Call the render method, passing 'reset' as true to revert the canvas
        // to its initial state, drawing the original image.
        this.render( 'reset' );
    },

    /**
     * Applies a grayscale filter to the image pixels.
     * It converts each pixel's RGB values to a single grayscale intensity.
     *
     * @param {ImageData} pixels - The ImageData object containing the image pixels.
     * @returns {ImageData} The modified ImageData object with grayscale pixels.
     */
    grayscale: function( pixels, args )
    {
        // 'd' is a direct reference to the pixel data array (Uint8ClampedArray).
        // Each pixel consists of four values: Red, Green, Blue, Alpha (RGBA).
        var d = pixels.data;

        // Iterate through the pixel data array.
        // We increment by 4 because each pixel occupies 4 consecutive array elements.
        for ( var i = 0; i < d.length; i += 4 )
        {
            // Extract the Red, Green, and Blue components of the current pixel.
            var r = d[i];       // Red component
            var g = d[i + 1];   // Green component
            var b = d[i + 2];   // Blue component

            // Calculate the grayscale value using the CIE 1931 luminance formula.
            // This formula provides a perceptually accurate conversion to grayscale,
            // taking into account how humans perceive different colors' brightness.
            var avg = 0.2126 * r + 0.7152 * g + 0.0722 * b;

            // Assign the calculated grayscale value to all three color channels (R, G, B)
            // for the current pixel. The alpha channel (d[i+3]) remains unchanged.
            // Since 'd' is a reference, these changes directly modify 'pixels.data'.
            d[i] = d[i + 1] = d[i + 2] = avg;
        }

        // Return the modified ImageData object.
        return pixels;
    },

    /**
     * Adjusts the brightness of the image pixels.
     *
     * @param {ImageData} pixels - The ImageData object containing the image pixels.
     * @param {number} adjustment - The amount to add/subtract from each color channel (e.g., 50 for brighter).
     * @returns {ImageData} The modified ImageData object with adjusted brightness.
     */
    brightness: function( pixels, adjustment )
    {
        // Get a direct reference to the pixel data array.
        var d = pixels.data;

        // Loop through each pixel, incrementing by 4 to access RGBA components.
        for ( var i = 0; i < d.length; i += 4 )
        {
            // Add the adjustment value to the Red channel.
            d[i] += adjustment;
            // Add the adjustment value to the Green channel.
            d[i + 1] += adjustment;
            // Add the adjustment value to the Blue channel.
            d[i + 2] += adjustment;
            // The Alpha channel (d[i+3]) is typically left unchanged for brightness adjustments.
        }

        // Return the ImageData object with its brightness-adjusted pixel data.
        return pixels;
    },

    /**
     * Adjusts the individual RGB color channels of the image.
     * This can be used for color tinting or channel manipulation.
     *
     * @param {ImageData} pixels - The ImageData object containing the image pixels.
     * @param {number[]} rgb - An array of three numbers [R_multiplier, G_multiplier, B_multiplier]
     *                         to multiply each channel by.
     * @returns {ImageData} The modified ImageData object with RGB adjusted pixels.
     */
    rgbAdjust: function( pixels, rgb )
    {
        // Get a direct reference to the pixel data array.
        var d = pixels.data;

        // Iterate over the pixel data, processing each pixel (4 components at a time).
        for ( var i = 0; i < d.length; i += 4 )
        {
            // Multiply the Red channel by the first multiplier in the 'rgb' array.
            d[i] *= rgb[0]; // Red channel adjustment

            // Multiply the Green channel by the second multiplier.
            d[i + 1] *= rgb[1]; // Green channel adjustment

            // Multiply the Blue channel by the third multiplier.
            d[i + 2] *= rgb[2]; // Blue channel adjustment
        }

        // Return the ImageData object with its color-adjusted pixel data.
        return pixels;
    },

    /**
     * Creates a new, blank ImageData object with specified width and height.
     * This is useful for creating new canvases or pixel buffers.
     *
     * @param {number} w - The desired width for the new ImageData.
     * @param {number} h - The desired height for the new ImageData.
     * @returns {ImageData} A new ImageData object filled with transparent black pixels.
     */
    createImageData: function( w, h )
    {
        // Create a temporary off-screen canvas element.
        var tmpCanvas = document.createElement( 'canvas' ),
            // Get its 2D rendering context.
            tmpCtx = tmpCanvas.getContext( '2d' );

        // Use the context's 'createImageData' method to generate a new, empty ImageData object.
        // This object will have the specified width and height, and all pixels will be
        // initialized to transparent black (RGBA 0,0,0,0).
        return tmpCtx.createImageData( w, h );
    },

    /**
     * Applies a convolution matrix (kernel) to the image pixels.
     * This is a fundamental operation for many image processing effects like blur, sharpen, edge detection.
     *
     * @param {ImageData} pixels - The ImageData object containing the image pixels.
     * @param {number[]} weights - A 1D array representing the convolution kernel (e.g., [1,1,1,1,1,1,1,1,1] for blur).
     * @param {boolean} opaque - If true, the alpha channel is treated as fully opaque (255) for calculation.
     * @returns {ImageData} The new ImageData object with the convolved pixels.
     */
    convolute: function( pixels, weights, opaque )
    {
        // Determine the side length of the square convolution kernel.
        // It's the square root of the number of weights, rounded to the nearest integer.
        var side = Math.round( Math.sqrt( weights.length ) );

        // Calculate half the side length, truncated to an integer.
        // This is used to determine the offset from the center of the kernel.
        var halfSide = ( side / 2 ) >>> 0;


        // Get a reference to the source pixel data array.
        var src = pixels.data;

        // Store the width and height of the source image.
        var sw = pixels.width;
        var sh = pixels.height;


        // The output image will have the same dimensions as the source.
        var w = sw;
        var h = sh;

        // Create a new ImageData object for the output pixels.
        var output = Filterous.prototype.createImageData( w, h );

        // Get a reference to the output pixel data array.
        var dst = output.data;


        // Determine the alpha factor based on the 'opaque' flag.
        // If opaque is true, alphaFactor is 1 (meaning alpha will be forced to 255).
        // If opaque is false, alphaFactor is 0 (meaning alpha channel is convolved normally).
        var alphaFactor = opaque ? 1 : 0;


        // Iterate over each pixel in the output image (y-coordinate).
        for ( var y = 0; y < h; y++ )
        {

            // Iterate over each pixel in the output image (x-coordinate).
            for ( var x = 0; x < w; x++ )
            {

                // Current source y and x coordinates.
                var sy = y;
                var sx = x;

                // Calculate the starting index for the current pixel in the destination array.
                // Each pixel has 4 components (R, G, B, A).
                var dstOff = ( y * w + x ) * 4;

                // Initialize accumulated RGB and A values for the convolution.
                var r = 0, g = 0, b = 0, a = 0;


                // Apply the convolution kernel: Iterate over the kernel's rows (cy).
                for ( var cy = 0; cy < side; cy++ )
                {

                    // Iterate over the kernel's columns (cx).
                    for ( var cx = 0; cx < side; cx++ )
                    {

                        // Calculate the actual source y-coordinate for the current kernel element.
                        // Clamp the coordinate to stay within the image bounds (0 to sh-1).
                        var scy = Math.min( sh - 1, Math.max( 0, sy + cy - halfSide ) );

                        // Calculate the actual source x-coordinate for the current kernel element.
                        // Clamp the coordinate to stay within the image bounds (0 to sw-1).
                        var scx = Math.min( sw - 1, Math.max( 0, sx + cx - halfSide ) );

                        // Calculate the starting index for the source pixel corresponding to
                        // the current kernel element.
                        var srcOff = ( scy * sw + scx ) * 4;

                        // Get the weight for the current kernel element.
                        var wt = weights[cy * side + cx];


                        // Accumulate weighted RGB and A values from the source pixel.
                        r += src[srcOff] * wt;         // Weighted Red
                        g += src[srcOff + 1] * wt;     // Weighted Green
                        b += src[srcOff + 2] * wt;     // Weighted Blue
                        a += src[srcOff + 3] * wt;     // Weighted Alpha

                    } // End of inner loop (kernel columns)

                } // End of outer loop (kernel rows)


                // Assign the convolved (accumulated) RGB values to the destination pixel.
                dst[dstOff] = r;
                dst[dstOff + 1] = g;
                dst[dstOff + 2] = b;

                // Assign the convolved Alpha value.
                // If 'opaque' is true, force the alpha to 255. Otherwise, use the convolved alpha.
                dst[dstOff + 3] = a + alphaFactor * ( 255 - a );

            } // End of x-loop

        } // End of y-loop

        // Return the ImageData object containing the convolved pixels.
        return output;

    } // End of convolute method

}; // End of Filterous.prototype object definition