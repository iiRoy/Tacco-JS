const UINT32_LIMIT = 4294967296; // A large constant, representing 2^32, used for random number generation.

module.exports = function ( imageWidth, imageHeight, startPixelValue, pixelValueRange ) {
    // Initialize core variables for the drawing process.
    let drawingSurface = document.createElement('canvas'), // The HTML canvas element itself.
        renderContext  = drawingSurface.getContext('2d'), // The 2D rendering context for the canvas.
        currentPixelIdx,  // Loop counter for iterating through pixels in the image data.
        currentChannelIdx, // Loop counter for iterating through RGBA channels within a pixel.
        pixelDataBuffer, // Stores the raw pixel data (RGBA values).
        randomInteger;   // A temporary variable to hold a large random number.


    // Normalize 'startPixelValue' to be an array of 4 components (RGBA).
    // If it's a single value, expand it to [value, value, value, 255].
    // If it's an array but shorter than 4, pad it. Alpha defaults to 255.
    if ( !(startPixelValue instanceof Array) ) {
        startPixelValue = [ startPixelValue, startPixelValue, startPixelValue, 255 ];
    }
    else {
        while ( startPixelValue.length < 4 ) {
            startPixelValue.push( startPixelValue.length === 3 ? 255 : startPixelValue[ startPixelValue.length - 1 ] );
        }
    }

    // Normalize 'pixelValueRange' to be an array of 4 components (RGBA).
    // Similar logic as 'startPixelValue' for expansion and padding.
    if ( !(pixelValueRange instanceof Array) ) {
        pixelValueRange = [ pixelValueRange, pixelValueRange, pixelValueRange, 255 ];
    }
    else {
        while ( pixelValueRange.length < 4 ) {
            pixelValueRange.push( pixelValueRange.length === 3 ? 255 : pixelValueRange[ pixelValueRange.length - 1 ] );
        }
    }


    // Assign the specified dimensions to the canvas element.
    drawingSurface.width  = imageWidth;
    drawingSurface.height = imageHeight;


    // Create an ImageData object, which is a one-dimensional array containing
    // the data in the RGBA order, with integer values between 0 and 255.
    pixelDataBuffer = renderContext.createImageData( drawingSurface.width, drawingSurface.height );


    // Loop through the entire pixel data buffer.
    // Each pixel occupies 4 bytes (Red, Green, Blue, Alpha).
    // The loop decrements by 4 to process each full pixel.
    for ( currentPixelIdx = pixelDataBuffer.data.length; ( currentPixelIdx -= 4 ) >= 0; ) {
        // Generate a new large random integer for the current pixel.
        // This value will be used to derive random components for R, G, B, A.
        randomInteger = Math.random() * UINT32_LIMIT;

        // Process each of the four color channels (R, G, B, A) for the current pixel.
        for ( currentChannelIdx = 0; currentChannelIdx < 4; currentChannelIdx++ ) {
            // Calculate the final color component for the current channel.
            // If 'pixelValueRange' for this channel is non-zero,
            // a random value derived from 'randomInteger' is added to 'startPixelValue'.
            // Otherwise, only 'startPixelValue' is used.
            pixelDataBuffer.data[ currentPixelIdx + currentChannelIdx ] = pixelValueRange[ currentChannelIdx ]
                ? ( ( ( ( randomInteger >> ( currentChannelIdx * 8 ) ) & 255 ) / 255.0 ) * pixelValueRange[ currentChannelIdx ] | 0 ) + startPixelValue[ currentChannelIdx ]
                : startPixelValue[ currentChannelIdx ];
        }
    }


    // Draw the generated pixel data onto the canvas at the top-left corner (0, 0).
    renderContext.putImageData( pixelDataBuffer, 0, 0 );


    // Return the content of the canvas as a data URL (e.g., a base64 encoded PNG image).
    return drawingSurface.toDataURL();
};