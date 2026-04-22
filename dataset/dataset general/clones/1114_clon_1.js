/*
 * This file is part of the Seurat.js project.
 *
 * It's heavily inspired by Georges Seurat's pointillism art technique.
 * This JavaScript extension for Raphael.js allows converting images
 * into a series of small, colored shapes.
 *
 * @project Seurat.js
 * @url     http://seuratjs.com/
 *
 * @dependency Raphael JavaScript Library v2.1
 * @link    http://raphaeljs.com/
 *
 * @author  Greg Smith
 * @url     http://gregoryryansmith.com/
 *
 * @license Dual licensed under the MIT or GPL Version 2 licenses.
 *          (c) 2012-2013 Greg Smith. All rights reserved.
 */

/*
 * Extends the Raphael.fn prototype object to add a new method: 'seurat'.
 * This method takes an options object to configure the pointillism effect.
 *
 * @param {object} settings - Configuration object for the Seurat effect.
 * @param {string} settings.imageSource - URL of the image to process. (Required)
 * @param {number} [settings.step=10] - The size of each 'dot' or grid cell.
 * @param {string} [settings.shape="circ"] - The shape of the 'dots': "circ" for circles or "rect" for rectangles.
 * @param {object} [settings.attributes={stroke: "none"}] - Additional Raphael attributes to apply to each dot.
 * @param {function} [settings.animator] - A function to animate each generated element.
 *                                         Signature: (element, x, y, step).
 * @param {function} [settings.generator] - A custom function to generate each element.
 *                                          Signature: (paper, x, y, color, step, attributes).
 */
Raphael.fn.seurat = function ( settings )
{
    // Ensure the settings object is initialized, providing a default empty object if none is passed.
    settings = settings || {};

    /*
     * Extract configuration parameters from the provided 'settings' object.
     * Assign default values for optional parameters if they are not explicitly set.
     */
    var imageSource = settings.imageSource,          // The URL of the input image.
        step        = settings.step        || 10,   // Determines the grid size and dot size. Default is 10 pixels.
        shape       = settings.shape       || "circ", // The base shape for the generated dots: "circ" (circle) or "rect" (rectangle).
        attributes  = settings.attributes  || { stroke: "none" }, // Raphael attributes applied to all generated elements.
        animator    = settings.animator,           // Optional function to apply animations to each dot.
        generator   = settings.generator;          // Optional custom function to generate the dot element itself.

    // 'this' refers to the current Raphael paper instance on which 'seurat' is called.
    var paper     = this,
        // Create an off-screen HTML5 canvas element. This is used to load the image
        // and extract its pixel data without displaying the original image.
        canvas    = document.createElement ( 'canvas' ),
        // Obtain the 2D rendering context from the canvas, which provides methods
        // for drawing and manipulating image data.
        context   = canvas.getContext ( '2d' ),
        // This variable will store the raw pixel data (RGBA values) of the image.
        colorData;

    /*
     * Calculate core dimensions based on the 'step' size.
     * These are used for positioning and sizing the individual 'dots'.
     */
    var center = step / 2,     // Half of the step size, used to find the center of each grid cell.
        radius = center - 1;   // Radius for circles, slightly smaller than 'center' to prevent adjacent circles from touching.

    /**
     * @private
     * Retrieves the RGB color string at a specific (x, y) coordinate from the image's pixel data.
     * This function reads the red, green, and blue components of a pixel.
     *
     * @param {number} x - The x-coordinate (horizontal position) of the pixel.
     * @param {number} y - The y-coordinate (vertical position) of the pixel.
     * @returns {string} An RGB color string in the format "rgb(R, G, B)".
     */
    var getColorAt = function ( x , y )
    {
        // Calculate the starting index in the 'colorData' array for the given (x, y) coordinates.
        // Each pixel's data consists of four bytes: Red, Green, Blue, Alpha.
        var index = ( ( canvas.width * y ) + x ) * 4;

        // Construct and return the RGB color string using the extracted color components.
        return "rgb(" + colorData[index] + ", " + colorData[index + 1] + ", " + colorData[index + 2] + ")";
    }; // End of getColorAt function.


    /**
     * @private
     * Default function to draw a rectangle 'dot' on the Raphael paper.
     * This is used when 'shape' is set to "rect" and no custom 'generator' is provided.
     *
     * @param {number} x   - The x-coordinate for the top-left corner of the rectangle.
     * @param {number} y   - The y-coordinate for the top-left corner of the rectangle.
     * @param {string} clr - The fill color for the rectangle, typically derived from the image pixel.
     * @returns {RaphaelElement} The newly created Raphael rectangle element.
     */
    var defaultRect = function ( x , y , clr )
    {
        // Create a Raphael rectangle element using the specified coordinates, step size for width/height,
        // and then apply the fill color and any additional attributes.
        return paper.rect(x, y, step, step)
                    .attr({ fill: clr })
                    .attr(attributes);
    }; // End of defaultRect function.


    /**
     * @private
     * Default function to draw a circle 'dot' on the Raphael paper.
     * This is used when 'shape' is set to "circ" (or any other value) and no custom 'generator' is provided.
     *
     * @param {number} x   - The x-coordinate for the bounding box of the circle (top-left).
     * @param {number} y   - The y-coordinate for the bounding box of the circle (top-left).
     * @param {string} clr - The fill color for the circle, typically derived from the image pixel.
     * @returns {RaphaelElement} The newly created Raphael circle element.
     */
    var defaultCirc = function ( x , y , clr )
    {
        // Create a Raphael circle element. Its center is calculated from (x, y) plus 'center' offset,
        // and its radius is 'radius'. The fill color and additional attributes are then applied.
        return paper.circle(x + center, y + center, radius)
                    .attr({ fill: clr })
                    .attr(attributes);
    }; // End of defaultCirc function.


    // Create a new HTML Image object.
    var img = new Image ();

    /*
     * Define the 'onload' event handler for the image.
     * This function will execute asynchronously once the image specified by 'img.src'
     * has been completely loaded into memory. All image processing logic resides here.
     */
    img.onload = function ( )
    {
        // Declare local variables for loop counters and for storing the current element and color.
        var x = 0,               // X-coordinate loop counter.
            y = 0,               // Y-coordinate loop counter.
            element,             // Holds the Raphael element created for each 'dot'.
            color;               // Stores the color extracted from the image for the current dot.

        // Set the dimensions of the off-screen canvas to match the loaded image.
        // This ensures the canvas is large enough to contain the entire image.
        canvas.width  = img.width;
        canvas.height = img.height;

        // Draw the loaded image onto the canvas at position (0,0), filling its entire area.
        context.drawImage( img, 0, 0, img.width, img.height );

        // Extract the raw pixel data from the canvas. This returns an ImageData object,
        // and its 'data' property is a Uint8ClampedArray containing RGBA values for each pixel.
        colorData = context.getImageData( 0, 0, img.width, img.height ).data;

        // Begin the main loop to iterate over the image area in a grid-like fashion.
        // The 'step' variable determines the size of each grid cell (and thus each 'dot').
        for ( ; x < canvas.width; x += step )
        {
            // Reset the 'y' counter for each new column.
            for ( y = 0; y < canvas.height; y += step )
            {
                // Get the average color at the center of the current grid cell.
                // This color will be used to fill the 'dot'.
                color = getColorAt( x + center, y + center );

                // Determine which function to use for generating the Raphael element ('dot'):
                // 1. If a custom 'generator' function is provided in settings, use it.
                // 2. Otherwise, if 'shape' is "rect", use the 'defaultRect' function.
                // 3. As a fallback, use the 'defaultCirc' function for circles.
                element = ( generator )
                            ? generator( paper, x, y, color, step, attributes )
                            : ( shape === "rect" )
                                ? defaultRect( x, y, color )
                                : defaultCirc( x, y, color );

                // If an 'animator' function is provided in settings, call it.
                // This allows for custom animations to be applied to each generated dot.
                if ( animator )
                {
                    animator( element, x, y, step );
                }
            } // End of the inner for-loop (iterating along the y-axis).
        } // End of the outer for-loop (iterating along the x-axis).
    }; // End of the img.onload event handler function.


    // Set the 'crossOrigin' property for the image.
    // This is crucial for security when loading images from different domains,
    // as it enables reading pixel data from the canvas without tainting it.
    img.crossOrigin = '';

    // Set the 'src' attribute of the image object.
    // This action initiates the loading of the image from the specified 'imageSource' URL.
    // Once the image is fully loaded, the 'img.onload' function will be triggered.
    img.src = imageSource;

}; // End of the Raphael.fn.seurat method definition.