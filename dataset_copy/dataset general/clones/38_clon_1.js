jQuery( document ) . ready (
    function ( $ )
    {

        /*
         * This constant holds the base URL pattern for images.
         * The '{width}' placeholder will be replaced dynamically.
         */
        var IMAGE_URL = "img/orion-{width}.jpg" ;


        /**
         * @function evenRows
         * @description Adjusts the height of all '.column .note' elements
         *              to match the height of the tallest one among them.
         *              This ensures visual alignment in a grid-like layout.
         */
        var evenRows = function ( )
        {

            var highest = 0 ; // Variable to store the maximum height found.

            // First, reset all note heights to 'auto' to get their natural dimensions.
            $( ".column .note" ) . css (
                {
                    height : "auto"
                }
            ) ;


            // Use a zero-delay setTimeout to allow the browser to re-render
            // with 'auto' heights before calculating the maximum.
            setTimeout (
                function ( )
                {

                    // Iterate over each '.column .note' element.
                    $( ".column .note" ) . each (
                        function ( )
                        {
                            // Get the outer height (including padding and border) of the current element.
                            var h = $( this ) . outerHeight ( ) ;

                            // Update 'highest' if the current element's height is greater.
                            highest = Math . max ( highest , h ) ;
                        }
                    ) ;


                    // After finding the highest height, apply it to all '.column .note' elements.
                    $( ".column .note" ) . css (
                        {
                            height : highest
                        }
                    ) ;

                }
                ,
                0
            ) ; // End of setTimeout call.

        } ; // End of evenRows function definition.


        /**
         * @function writeInfo
         * @description Updates various display elements within a given parent container
         *              with information related to an image's dimensions and source.
         * @param {string} sizeId - The identifier for the image size.
         * @param {number} width - The width of the image.
         * @param {boolean} highResolution - Indicates if the image is high resolution.
         * @param {string} url - The URL of the image.
         * @param {jQuery} $parent - The jQuery object representing the parent container.
         */
        var writeInfo = function ( sizeId , width , highResolution , url , $parent )
        {

            // Update the text for the image input details.
            $( ".image-input" , $parent ) . text (
                width + ", " + sizeId + ", high resolution: " + highResolution
            ) ;


            // Update the text for the image source URL.
            $( ".image-source" , $parent ) . text ( url ) ;


            // Update the text for the current time, formatted for en-US without 12-hour clock.
            $( ".input-time" , $parent ) . text (
                new Date ( ) . toLocaleTimeString ( "en-US" , { hour12 : false } )
            ) ;


            // Call evenRows to re-adjust heights after content update.
            evenRows ( ) ;

        } ; // End of writeInfo function definition.


        /*
         * This block configures the global settings for the $.responsive plugin.
         * These settings define how the plugin should behave across the application
         * unless overridden by element-specific calls.
         */
        $. responsive (
            {
                // Specifies the range of widths the responsive images should cover.
                range : "320-640" ,

                // Enables or disables media query integration for responsive behavior.
                mediaQuery : true ,

                // A custom function to determine the image URL based on responsive data.
                urlSource : function ( data , $el )
                {
                    // Determine the appropriate size string based on high resolution flag.
                    var sizeStr = data . highResolution
                                  ? data . width + "@2x" // Append "@2x" for high-res.
                                  : data . width . toString ( ) ; // Convert width to string for standard res.

                    // Replace the placeholder in IMAGE_URL with the determined size string.
                    var url = IMAGE_URL . replace ( "{width}" , sizeStr ) ;

                    // Call writeInfo to update the UI with the new image details.
                    writeInfo (
                        data . sizeId ,
                        data . width ,
                        data . highResolution ,
                        url ,
                        $el . closest ( ".column" ) // Pass the closest column as the parent.
                    ) ;

                    // Return the constructed URL.
                    return url ;
                }
            }
        ) ; // End of $.responsive global configuration.


        // Apply the responsive plugin to all image elements with the class 'my-image'.
        // This initializes their responsive behavior based on the global settings.
        $( "img.my-image" ) . responsive ( ) ;

    }
) ; // End of jQuery(document).ready() function.