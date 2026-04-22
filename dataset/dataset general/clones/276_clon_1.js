/*
 * Overlay Class Definition
 * This class provides utility methods for canvas manipulation,
 * including image rendering, grayscale conversion, and cropping.
 * @param {HTMLCanvasElement} canvas - The canvas element to operate on.
 */
var Overlay = function ( canvas ) {

    // Store the canvas element
    this.canvas_ = canvas;
    // Get the 2D rendering context from the canvas
    this.ctx_ = canvas.getContext( "2d" );

}; // End of Overlay constructor

/*
 * Extend the Overlay prototype with various methods.
 * This uses angular.extend, assuming an Angular environment or similar utility.
 */
angular.extend(
    Overlay.prototype,
    {

        /**
         * Refreshes the canvas dimensions to match its parent container.
         * Ensures the canvas is always sized correctly.
         */
        refresh: function () {

            var canvas = this.canvas_, // Reference to the main canvas
                parent = canvas.parentNode; // Reference to the canvas's parent element

            // Update canvas width and height to match parent's client dimensions
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;

        }, // End of refresh method

        /**
         * Converts the current image data on the canvas to grayscale.
         * This operation directly manipulates the pixel data.
         */
        converterToGray_: function () {

            var ctx = this.ctx_, // The 2D rendering context
                canvas = this.canvas_, // The main canvas element
                // Get the image data for the entire canvas area
                imgData = ctx.getImageData( 0, 0, canvas.width, canvas.height ),
                data = imgData.data, // The pixel data array (R, G, B, A)
                dataSize = data.length; // Total number of values in the data array


            // Loop through each pixel (4 values per pixel: R, G, B, A)
            for ( var i = 0; i < dataSize; i = i + 4 ) {
                var r = data[ i ]; // Red component
                var g = data[ i + 1 ]; // Green component
                var b = data[ i + 2 ]; // Blue component
                // Calculate brightness using a weighted average for human perception
                var brightness = 0.34 * data[ i ] + 0.5 * data[ i + 1 ] + 0.16 * data[ i + 2 ];

                // Set R, G, and B components to the calculated brightness
                data[ i ] = brightness; // Red
                data[ i + 1 ] = brightness; // Green
                data[ i + 2 ] = brightness; // Blue
                // Alpha (data[i + 3]) remains unchanged
            }
            // Put the modified image data back onto the canvas
            ctx.putImageData( imgData, 0, 0 );

        }, // End of converterToGray_ method

        /**
         * Draws a scaled block of an image onto a specified canvas context.
         * This method handles scaling and positioning to draw a portion of an image
         * into a specific block on the target canvas.
         * @param {HTMLCanvasElement} canvas       - The target canvas element.
         * @param {CanvasRenderingContext2D} ctx   - The 2D rendering context of the target canvas.
         * @param {HTMLImageElement} img           - The source image to draw from.
         * @param {number} startLeft               - The x-coordinate on the target canvas to start drawing.
         * @param {number} startTop                - The y-coordinate on the target canvas to start drawing.
         * @param {number} imageWidth              - The original width of the source image.
         * @param {number} imageHeight             - The original height of the source image.
         * @param {number} blockWidth              - The width of the block to draw on the target canvas.
         * @param {number} blockHeight             - The height of the block to draw on the target canvas.
         */
        drawImageBlock: function ( canvas, ctx, img, startLeft, startTop, imageWidth, imageHeight, blockWidth, blockHeight ) {

            // Calculate width and height scaling rates relative to the target canvas
            var rateW = blockWidth / canvas.width,
                rateH = blockHeight / canvas.height,
                // Calculate the x-coordinate on the source image corresponding to startLeft on canvas
                imgLeft = startLeft / ( canvas.width ) * imageWidth,
                // Calculate the y-coordinate on the source image corresponding to startTop on canvas
                imgTop = startTop / ( canvas.height ) * imageHeight,
                // Calculate the width of the source image portion to draw
                endImgWidth = imageWidth * rateW,
                // Calculate the height of the source image portion to draw
                endImgHeight = imageHeight * rateH;


            // Use drawImage with 9 arguments:
            // img: source image
            // imgLeft, imgTop: x, y coordinates on the source image to start clipping
            // endImgWidth, endImgHeight: width, height of the clipped image from the source
            // startLeft, startTop: x, y coordinates on the destination canvas to place the image
            // blockWidth, blockHeight: width, height to stretch/shrink the image on the destination canvas
            ctx.drawImage( img, imgLeft, imgTop, endImgWidth, endImgHeight, startLeft, startTop, blockWidth, blockHeight );

        }, // End of drawImageBlock method

        /**
         * Renders an image onto the canvas, applies a grayscale filter,
         * and then draws a specific block of the original image over the grayscale background.
         * @param {HTMLImageElement} img     - The source image to render.
         * @param {object} selected          - An object defining the selected area (e.g., { left, top, width, height }).
         * @param {object} imageSize         - An object defining the original size of the image (e.g., { width, height }).
         */
        render: function ( img, selected, imageSize ) {

            var ctx = this.ctx_, // Canvas rendering context
                canvas = this.canvas_, // Canvas element
                width = canvas.width, // Current canvas width
                height = canvas.height, // Current canvas height
                widthRate = imageSize.width / width, // Ratio of original image width to canvas width
                heightRate = imageSize.height / height; // Ratio of original image height to canvas height

            // Draw the entire image onto the canvas, scaled to canvas dimensions
            ctx.drawImage( img, 0, 0, width, height );

            // Convert the entire canvas content to grayscale
            this.converterToGray_();

            // Draw the specified block of the *original* image over the grayscale background.
            // This makes the selected area appear in full color while the rest is grayscale.
            this.drawImageBlock(
                canvas,
                ctx,
                img,
                selected.left,
                selected.top,
                imageSize.width,
                imageSize.height,
                selected.width,
                selected.height
            );

        }, // End of render method

        /**
         * Refreshes the canvas size and then re-renders the image.
         * This is a convenience method combining refresh and render.
         * @param {HTMLImageElement} img     - The source image.
         * @param {object} selected          - The selected area object.
         * @param {object} imageSize         - The original image size object.
         */
        refreshAndRender: function ( img, selected, imageSize ) {

            // First, ensure the canvas dimensions are correct
            this.refresh();
            // Then, render the image with the specified selection
            this.render( img, selected, imageSize );

        }, // End of refreshAndRender method

        /**
         * Converts a selected portion of the canvas content to a Data URL.
         * This effectively "crops" the canvas content and returns it as an image string.
         * @param {string} type              - The image format for the Data URL (e.g., 'image/png', 'image/jpeg').
         * @param {object} selected          - An object defining the selected area to crop (e.g., { left, top, width, height }).
         * @return {string}                  - The Data URL representing the cropped image.
         */
        toDataURL: function ( type, selected ) {

            var canvas = this.canvas_, // The source canvas
                // Create a temporary canvas element for cropping
                copyCanvas = document.createElement( 'canvas' ),
                // Get the 2D rendering context for the temporary canvas
                ctx = copyCanvas.getContext( '2d' );

            // Set the dimensions of the temporary canvas to match the selected area
            copyCanvas.width = selected.width;
            copyCanvas.height = selected.height;

            // Draw the selected portion of the main canvas onto the temporary canvas
            // Parameters:
            // source: canvas (the main canvas)
            // sx, sy: selected.left, selected.top (start x, y on source)
            // sWidth, sHeight: selected.width, selected.height (width, height to clip from source)
            // dx, dy: 0, 0 (start x, y on destination - temporary canvas)
            // dWidth, dHeight: selected.width, selected.height (width, height to draw on destination)
            ctx.drawImage(
                canvas,
                selected.left,
                selected.top,
                selected.width,
                selected.height,
                0,
                0,
                selected.width,
                selected.height
            );

            // Return the Data URL of the content on the temporary canvas
            return copyCanvas.toDataURL( type );

        } // End of toDataURL method

    }
); // End of angular.extend call