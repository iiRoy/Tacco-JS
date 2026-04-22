/*
 * This function is designed to resize an HTML image element.
 * It takes an image, a maximum width, and a maximum height as input.
 * The function ensures that the resized image fits within the specified
 * dimensions while preserving its original aspect ratio.
 *
 * @param   {HTMLImageElement} img         The source image element to be resized.
 * @param   {number}           max_width   The maximum width allowed for the resized image.
 * @param   {number}           max_height  The maximum height allowed for the resized image.
 * @returns {HTMLImageElement}             A new Image object containing the resized image data.
 */
function resize ( img , max_width , max_height )
{
    // Create a new, off-screen canvas element.
    var c = document.createElement( 'canvas' ) ;
    // Get the 2D rendering context from the created canvas.
    var context = c.getContext( '2d' ) ;


    // Retrieve the original width and height of the image.
    var width = img.width ;
    var height = img.height ;


    // Check if the image needs resizing based on its orientation and maximum dimensions.
    if ( width > height )
    {
        // If the image is wider than it is tall (landscape orientation).
        if ( width > max_width )
        {
            // If the current width exceeds the maximum allowed width,
            // scale down the height proportionally and set the width to max_width.
            height *= max_width / width ;
            width = max_width ;
        }
    }
    else
    {
        // If the image is taller than it is wide, or if it's square (portrait or square orientation).
        if ( height > max_height )
        {
            // If the current height exceeds the maximum allowed height,
            // scale down the width proportionally and set the height to max_height.
            width *= max_height / height ;
            height = max_height ;
        }
    }

    // Convert the calculated width and height to integers to prevent potential
    // rendering issues with fractional pixel values on the canvas.
    width = parseInt ( width ) ;
    height = parseInt ( height ) ;

    // Set the canvas dimensions to the newly calculated (and potentially resized) width and height.
    c.width = width ;
    c.height = height ;

    // Draw the original image onto the canvas, scaling it to the new dimensions.
    // The image will be drawn starting at (0,0) on the canvas.
    context.drawImage( img , 0 , 0 , width , height ) ;


    // Create a new Image object to hold the resized image data.
    var resized_img = new Image( width , height ) ;
    // Convert the canvas content into a Data URL (JPEG format with 70% quality)
    // and assign it as the source of the new Image object.
    resized_img.src = c.toDataURL( "image/jpeg" , 0.70 ) ;

    // Return the newly created and resized image element.
    return resized_img ;
} // End of the resize function definition.