/*******************************************************************************
 * imgSizer Module for Responsive Image Sizing in Older Browsers
 * Version 1.0 - Initial Release
 *
 * This module provides functionality to dynamically resize images, primarily
 * targeting older Internet Explorer versions that may not fully support
 * modern CSS scaling techniques.
 ******************************************************************************/
var imgSizer =
{
    // Configuration settings for the image sizer utility.
    Config :
    {
        /*
         * An internal cache to store references to image elements
         * that have been processed or need further processing.
         */
        imgCache : []

        // Path to a transparent spacer GIF image, used for IE AlphaImageLoader workaround.
        ,spacer : "/path/to/your/spacer.gif"
    }

    /*
     * The main function to initiate image processing.
     * It identifies images within a given scope and applies necessary
     * workarounds for older browsers.
     * @param {Array<HTMLImageElement>|NodeList|undefined} aScope - An optional
     * array or NodeList of image elements to process. If not provided,
     * it defaults to all images in the document.
     */
    ,collate : function ( aScope )
    {
        // Check if the browser is an older version of Internet Explorer.
        // This specific check targets IE 6-8, which require special handling.
        var isOldIE = ( document.all && !window.opera && !window.XDomainRequest )
            ? 1
            : 0
        ;

        // Proceed only if it's an old IE and getElementsByTagName is available.
        if
        (
            isOldIE
            &&
            document.getElementsByTagName
        )
        {
            // Create a local reference to the imgSizer object for convenience.
            var c = imgSizer;

            // Get a reference to the global image cache.
            var imgCache = c.Config.imgCache;

            // Determine the set of images to process.
            // If aScope is provided and has length, use it; otherwise, get all images in the document.
            var images = ( aScope && aScope.length )
                ? aScope
                : document.getElementsByTagName( "img" )
            ;

            // Iterate through each identified image.
            for ( var i = 0; i < images.length; i++ )
            {
                // Store original dimensions before modification.
                images[ i ].origWidth  = images[ i ].offsetWidth;
                images[ i ].origHeight = images[ i ].offsetHeight;

                // Add the image to the cache for later resizing.
                imgCache.push( images[ i ] );

                // Apply the IE AlphaImageLoader workaround if necessary.
                c.ieAlpha( images[ i ] );

                // Set image width to 100% to fill its container.
                images[ i ].style.width = "100%";
            }

            // If there are images in the cache, set up a resize handler.
            if ( imgCache.length )
            {
                /*
                 * Register a function to run on window resize event.
                 * This ensures images are re-scaled when the browser window changes.
                 */
                c.resize
                (
                    function ( )
                    {
                        // Loop through cached images to adjust their heights proportionally.
                        for ( var i = 0; i < imgCache.length; i++ )
                        {
                            // Calculate the scaling ratio based on current width.
                            var ratio = ( imgCache[ i ].offsetWidth / imgCache[ i ].origWidth );

                            // Apply the ratio to the original height to maintain aspect ratio.
                            imgCache[ i ].style.height = ( imgCache[ i ].origHeight * ratio ) + "px";
                        }
                    }
                );
            }
        }
    }

    /*
     * Applies the AlphaImageLoader filter for IE6/7/8 to handle PNG transparency
     * and enable scaling without quality loss.
     * @param {HTMLImageElement} img - The image element to apply the filter to.
     */
    ,ieAlpha : function ( img )
    {
        var c = imgSizer; // Reference to the main object.

        // If img.oldSrc exists, it means this image has already been processed once.
        // Restore its original source before re-applying the filter.
        if ( img.oldSrc )
        {
            img.src = img.oldSrc;
        }

        var src = img.src; // Get the current image source.

        // Set explicit dimensions for the image.
        img.style.width  = img.offsetWidth  + "px";
        img.style.height = img.offsetHeight + "px";

        // Apply the AlphaImageLoader filter.
        // This filter scales the image while preserving transparency.
        img.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "', sizingMethod='scale')";

        // Store the original source in a custom property.
        img.oldSrc = src;

        // Replace the image source with a transparent spacer GIF.
        // This is a common technique when using AlphaImageLoader to prevent
        // the original image from rendering twice (once normally, once via filter).
        img.src = c.Config.spacer;
    }

    /*
     * A utility function to safely add a function to the window's onresize event.
     * It ensures that existing onresize handlers are preserved and called.
     * This is a modified version of Simon Willison's addLoadEvent() pattern.
     * Original source: http://simonwillison.net/2004/May/26/addLoadEvent/
     *
     * @param {Function} func - The function to be executed when the window is resized.
     */
    ,resize : function ( func )
    {
        // Store any pre-existing onresize handler.
        var oldonresize = window.onresize;

        // If no onresize handler is currently set, assign the new function directly.
        if
        (
            typeof window.onresize
            !=
            'function'
        )
        {
            window.onresize = func;
        }
        else
        {
            // If an onresize handler already exists, wrap it with the new function.
            // This creates a chain of functions to be executed.
            window.onresize = function ( )
            {
                // Call the original onresize handler if it exists.
                if ( oldonresize )
                {
                    oldonresize ( );
                }

                // Now, execute the new function.
                func ( );
            }
        }
    }
}
; // End of imgSizer object definition.