/*
 * This is a Type I clone generated for demonstration purposes.
 * Original code: [Provided in prompt]
 *
 * Changes applied:
 * - Extensive modification of whitespace (indentation, spacing, blank lines).
 * - Addition, removal, and modification of comments.
 * - No changes to identifiers, variable names, function names, operators, or expressions.
 * - The logical and structural integrity of the code is perfectly preserved.
 */


// Execute this function once the DOM is fully loaded and ready for manipulation.
$(
    function()
    {
        "use strict"
        ; // Enforce strict parsing and error handling rules for this script.


        // Declare and initialize several key variables used throughout the script.
        var allImagesLoaded = false;         // Flag to indicate if all images have finished loading.
        var imagesLength    = 0;             // Total number of images expected.
        var counter         = 0;             // Current index for the displayed image.
        var imageArray      = [ ] ;          // Array to store initial image paths.
        var loadedImages    = [ ];           // Array to store preloaded image objects.
        var loadedImagesCounter = 0;         // Counter for images that have been successfully loaded.

        // ----------------------------------------------------------------------------------------------------
        // IMPORTANT: Populate this array with the file paths of all images you wish to display.
        // For example: imageArray = ["path/to/image1.jpg", "path/to/image2.png"];
        // ----------------------------------------------------------------------------------------------------
        imageArray = [
            "img/1.jpg",
            "img/2.jpg",
            "img/3.jpg",
            "img/4.jpg"
        ] ;

        // Determine the total count of images from the populated array.
        imagesLength = imageArray.length;


        /**
         * Moves the image display forward to the next image in the sequence.
         * Wraps around to the first image if currently at the last image.
         */
        function stepForward( )
        {
            // Check if the current image is the last one in the array.
            if ( counter === imagesLength - 1 )
            {
                // If it is the last, loop back to the first image.
                counter = 0;
            }
            else
            {
                // Otherwise, simply increment the counter to move to the next image.
                counter ++ ;
            }

            // Update the 'src' attribute of the main display image element.
            $("#pageImage").attr( "src", $( loadedImages[ counter ] ).attr( 'src' ) );

            // Update the 'alt' attribute for accessibility and SEO.
            $("#pageImage").attr( "alt", "demobild " + counter );
        }


        /**
         * Moves the image display backward to the previous image in the sequence.
         * Wraps around to the last image if currently at the first image.
         */
        function stepBackward( )
        {
            // Check if the current image is the first one in the array.
            if ( counter === 0 )
            {
                // If it is the first, loop back to the last image.
                counter = imagesLength - 1 ;
            }
            else
            {
                // Otherwise, decrement the counter to move to the previous image.
                counter -- ;
            }

            // Retrieve the source path for the image from the array.
            var sourcePath = $( imageArray[ counter ] ).attr( 'src' ) ;

            // Set the 'src' attribute of the display image.
            $( "#pageImage" ).attr( "src", sourcePath );

            // Set the 'alt' attribute for the displayed image.
            $( "#pageImage" ).attr( "alt", "demobild " + counter );
        }


        /**
         * Initializes all necessary components and event handlers
         * once all images have been successfully preloaded.
         */
        function initEverything( )
        {
            // Set the flag to true, indicating that all images are now available.
            allImagesLoaded = true;

            // Hide the preloading indicator element.
            $( '#preloadingImages' ).hide( );


            // Prevent the default context menu from appearing on right-click anywhere on the document.
            // This enhances the user experience by keeping the interaction within the application.
            $( document ).bind( "contextmenu", function( e ) {
                return false;
            } ) ;


            // Prepare the initial image to be displayed in the container.
            var theSource = $( imageArray[ 0 ] ).attr( 'src' ); // Get source of the first image.
            var theImage  = $( '<img />' );                     // Create a new image element.

            // Configure the attributes of the newly created image element.
            $( theImage )
                .attr( 'src', theSource )                // Set the image source.
                .attr( 'width', imageArray[ 0 ].width )  // Set width (if available from initial array element).
                .attr( 'height', imageArray[ 0 ].height )// Set height (if available).
                .attr( 'alt', 'demobild 1' )             // Set alt text for accessibility.
                .attr( 'id', 'pageImage' );              // Assign a unique ID for later selection.

            // Append the configured image element to the main container.
            $( '#container' ).append( theImage );


            // Attach a mouse down event handler to the main display image.
            $( "#pageImage" ).mousedown(
                function( e )
                {
                    // Only process clicks if all images are loaded.
                    if ( allImagesLoaded )
                    {
                        // Determine which mouse button was pressed.
                        switch ( e.which )
                        {
                            case 1: // Left mouse button
                                stepForward( );
                                break;

                            case 2: // Middle mouse button
                                // No action defined for middle click in this version.
                                // Could be used to open in new tab or reset.
                                break;

                            case 3: // Right mouse button
                                stepBackward( );
                                break;

                            default:
                                // Handle any other unexpected mouse button presses.
                                // No specific action needed.
                                break;
                        }
                    }
                }
            ) ;


            // Attach a keydown event handler to the document for keyboard navigation.
            $( document ).keydown(
                function( e )
                {
                    // Prevent the default browser action for the key press (e.g., scrolling).
                    e.preventDefault( );

                    // Only respond to key presses if all images are loaded.
                    if ( allImagesLoaded )
                    {
                        // Check the keyCode to determine which arrow key was pressed.
                        switch ( e.keyCode )
                        {
                            case 37: // Left arrow key
                                stepBackward( );
                                break;

                            case 38: // Up arrow key
                                stepBackward( );
                                break;

                            case 39: // Right arrow key
                                stepForward( );
                                break;

                            case 40: // Down arrow key
                                stepForward( );
                                break;

                            default:
                                // No specific action for other keys.
                                // Could add debug logging here if needed.
                                break;
                        }
                    }
                }
            ) ;
        }


        /**
         * Recursively preloads images one by one to ensure smooth transitions.
         * Once all images are loaded, it calls initEverything().
         */
        function preloadImages( )
        {
            // Create a temporary image element to load the current image path.
            var tempImage = $( "<img />" ).attr( "src", imageArray[ loadedImagesCounter ] );

            // Attach a load event handler to the temporary image.
            tempImage.load(
                function( )
                {
                    // Push the loaded image (this refers to the image element) into the loadedImages array.
                    loadedImages.push( this );

                    // Increment the counter for successfully loaded images.
                    loadedImagesCounter ++ ;

                    // Check if all images have been loaded.
                    if ( loadedImagesCounter === imagesLength )
                    {
                        // Replace the original imageArray with the array of actual loaded image objects.
                        imageArray = loadedImages;

                        // Initialize the user interface and event handlers.
                        initEverything( );
                    }
                    else
                    {
                        // If not all images are loaded, continue preloading the next one.
                        // This check prevents unnecessary recursive calls if initEverything somehow sets allImagesLoaded prematurely.
                        if ( ! allImagesLoaded )
                        {
                            preloadImages( ); // Recursive call to load the next image.
                        }
                    }
                }
            ) ;
        }


        // --------------------------------------------------------------------
        // MAIN INITIALIZATION LOGIC
        // This block determines the initial state of the application.
        // --------------------------------------------------------------------
        if ( imagesLength === 0 )
        {
            // If no image paths are provided, display an error message.
            $( '#container' ).html( '<p><strong>You need to put some images in your array</strong></p>' );
        }
        else
        {
            // If images are present, begin the preloading process.
            preloadImages( );
        }

    }
) ; // End of jQuery document ready function.