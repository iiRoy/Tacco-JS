/*
 * Foundationify Module - This script enhances UI elements, specifically for product pages.
 *
 * It is designed to encapsulate functionality related to the
 * product image galleries and other interactive UI components.
 */
var Foundationify = function ()
{
    // This private function initializes the product image gallery functionality.
    // It should be invoked on product detail pages to enable dynamic image display.
    function initProductImages()
    {

        // Define the jQuery scope for identifying product image elements.
        // We target the '#product-images' container within 'body.product' context.
        var $productImages = $( '#product-images', 'body.product' );

        // Select all thumbnail images located within unordered lists inside the product image container.
        var $thumbs = $( 'ul img', $productImages );

        // Proceed with gallery initialization only if thumbnails are found.
        if ( $thumbs.length )
        {

            // Identify the main large image element that will display the selected product image.
            var $largeImage = $( 'img', $productImages ).first();

            // Attach a click event listener to each thumbnail image.
            // This handler will update the main large image upon thumbnail selection.
            $thumbs.on( 'click', function( e )
            {
                e.preventDefault(); // Prevent the default action (e.g., navigating to the image URL).

                // Skip updating if the clicked thumbnail's image source is already
                // the same as the current large image's source.
                if ( $largeImage.attr( 'src' ) === $( this ).parent( 'a' ).attr( 'href' ) )
                {
                    return; // Exit the function as no change is needed.
                }

                // Temporarily change the mouse cursor to 'progress' to indicate a loading state.
                $( 'body' ).css( 'cursor', 'progress' );

                // Update both the 'src' and 'alt' attributes of the large image element.
                // The new 'src' is retrieved from the parent 'a' tag's 'href' attribute.
                // The new 'alt' text is taken directly from the clicked thumbnail image.
                $largeImage
                    .attr( 'src', $( this ).parent( 'a' ).attr( 'href' ) )
                    .attr( 'alt', $( this ).attr( 'alt' ) )
                ;
            } ); // End of the click event handler for thumbnails.

            // Attach a 'load' event listener to the large image.
            // This will revert the mouse cursor to its default state once the new image has fully loaded.
            $largeImage.on( 'load', function()
            {
                $( 'body' ).css( 'cursor', 'auto' ); // Restore the default cursor.
            } ); // End of the load event handler for the large image.

        }
        // If no thumbnails are present, the gallery functionality will not be activated.
    } // End of initProductImages private function.

    // Return the public interface for the Foundationify module.
    return {
        // The 'init' method is the primary entry point for module initialization.
        init: function ()
        {
            // Call the private function to set up the product image gallery.
            initProductImages();
        } // End of the public 'init' method.
    }; // End of the public interface object.

}(); // Immediately invoke this function to define and initialize the Foundationify module.


// jQuery's document ready handler ensures that the script runs only after the DOM is fully loaded.
$( document ).ready( function ()
{
    // Execute the main initialization routine of the Foundationify module.
    Foundationify.init();
} );