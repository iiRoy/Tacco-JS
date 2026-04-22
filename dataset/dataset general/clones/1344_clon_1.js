/*
 * This JavaScript module facilitates the generation of focus point coordinates
 * for image manipulation, designed for integration into various web applications.
 * Feel free to customize this implementation to align with your specific project requirements.
 */

( function( $ ) {

    // Ensure the DOM is fully loaded before executing the script.
    $( document ).ready( function() {

        // Declare core variables for image handling and UI elements.
        var defaultImage,
            $dataAttrInput,
            $cssAttrInput,
            $focusPointContainers,
            $focusPointImages,
            $helperToolImage;

        /**
         * @var {object} focusPointAttr - Stores the essential data attributes
         *                                  for the focusPoint functionality.
         * @property {number} x - X-coordinate of the focus point (normalized -1 to 1).
         * @property {number} y - Y-coordinate of the focus point (normalized -1 to 1).
         * @property {number} w - Original width of the image.
         * @property {number} h - Original height of the image.
         */
        var focusPointAttr = {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        };

        // --- Module Initialization ---
        // This self-executing anonymous function sets up the helper tool's initial state.
        ( function() {

            // Initialize DOM element references and default values.
            defaultImage        =       '../img/city_from_unsplash.jpg';
            $dataAttrInput      =       $( '.helper-tool-data-attr' );
            $cssAttrInput       =       $( '.helper-tool-css3-val' );
            $helperToolImage    =       $( 'img.helper-tool-img, img.target-overlay' );

            // Dynamically create grid elements for visual demonstration.
            for ( var i = 1; i < 10; i++ ) {
                $( '#Frames' ).append( '<div id="Frame' + i + '" class="focuspoint"><img/></div>' );
            }

            // After creation, store references to the new focus point elements.
            $focusPointContainers   =   $( '.focuspoint' );
            $focusPointImages       =   $( '.focuspoint img' );

            // Load the default image into the helper tool.
            setImage( defaultImage );

        } )(); // End of Helper Tool Initialization

        /*
         * =====================================================================
         * Function: setImage( imgURL )
         * Description: Loads a new image into the demo and updates all
         *              associated focusPoint elements.
         * Parameter: imgURL - The URI (Uniform Resource Identifier) of the image to load.
         * =====================================================================
         */

        function setImage( imgURL ) {

            // Temporarily create an image element in memory to get its natural dimensions.
            $( "<img/>" )
                .attr( "src", imgURL )
                .load( function() {

                    // Store the actual width and height of the loaded image.
                    focusPointAttr.w = this.width;
                    focusPointAttr.h = this.height;

                    // Update the source attribute of the helper tool's thumbnail image.
                    $helperToolImage.attr( 'src', imgURL );

                    // Apply the new image source to all focusPoint display elements.
                    $focusPointImages.attr( 'src', imgURL );

                    // Set up initial properties for the .focuspoint containers.

                    /*
                     * IMPORTANT NOTE:
                     * Setting these attributes directly via .attr() is primarily for
                     * visual inspection in the DOM by developers. The FocusPoint plugin
                     * relies on jQuery's .data() method for its operational values.
                     * Therefore, the subsequent .data() assignments are critical for
                     * the functionality, while .attr() calls are mostly for demonstration.
                     */
                    $focusPointContainers.attr( {
                        'data-focus-x'  :   focusPointAttr.x,
                        'data-focus-y'  :   focusPointAttr.y,
                        'data-image-w'  :   focusPointAttr.w,
                        'data-image-h'  :   focusPointAttr.h
                    } );

                    /*
                     * These assignments using jQuery's .data() method are the actual
                     * mechanism by which FocusPoint consumes its configuration.
                     * These are the truly essential parts for the plugin to work.
                     */
                    $focusPointContainers.data( 'focusX', focusPointAttr.x );
                    $focusPointContainers.data( 'focusY', focusPointAttr.y );
                    $focusPointContainers.data( 'imageW', focusPointAttr.w );
                    $focusPointContainers.data( 'imageH', focusPointAttr.h );

                    // Initialize or re-initialize the FocusPoint plugin on the containers.
                    $( '.focuspoint' ).focusPoint();

                    // Display the updated data attributes to the user in the UI.
                    printDataAttr();

                } );
        } // End of setImage function

        /*
         * =====================================================================
         * Function: printDataAttr()
         * Description: Updates the input field displaying the current
         *              focus point data attributes.
         * =====================================================================
         */

        function printDataAttr() {
            // Concatenate and format the focus point attributes for display.
            $dataAttrInput.val( 'data-focus-x="' + focusPointAttr.x.toFixed( 2 ) + '" data-focus-y="' + focusPointAttr.y.toFixed( 2 ) + '" data-focus-w="' + focusPointAttr.w + '" data-focus-h="' + focusPointAttr.h + '"' );
        } // End of printDataAttr function

        /*
         * =====================================================================
         * Event Handler: $helperToolImage.click
         * Description: Calculates and applies new focus point coordinates
         *              based on a user's click on the helper image.
         *              Also updates CSS3 background-position properties.
         * =====================================================================
         */

        $helperToolImage.click( function( e ) {

            var imageW  = $( this ).width();
            var imageH  = $( this ).height();

            // Calculate the raw pixel offsets from the event.
            var offsetX = e.pageX - $( this ).offset().left;
            var offsetY = e.pageY - $( this ).offset().top;

            // Convert pixel offsets to normalized focusPoint coordinates (-1 to 1).
            var focusX  = ( offsetX / imageW - .5 ) * 2;
            var focusY  = ( offsetY / imageH - .5 ) * -2;

            // Store the newly calculated focus point coordinates.
            focusPointAttr.x = focusX;
            focusPointAttr.y = focusY;

            // Update the display of data attributes in the UI.
            printDataAttr();

            // Apply the new focus point to all relevant images.
            updateFocusPoint();

            // Calculate CSS percentages for background-position.
            var percentageX             = ( offsetX / imageW ) * 100;
            var percentageY             = ( offsetY / imageH ) * 100;
            var backgroundPosition      = percentageX.toFixed( 0 ) + '% ' + percentageY.toFixed( 0 ) + '%';
            var backgroundPositionCSS   = 'background-position: ' + backgroundPosition + ';';

            // Display the generated CSS property to the user.
            $cssAttrInput.val( backgroundPositionCSS );

            // Position a visual reticle (target) at the clicked focus point.
            $( '.reticle' ).css( {
                'top'   :   percentageY + '%',
                'left'  :   percentageX + '%'
            } );
        } ); // End of $helperToolImage.click handler

        /*
         * =====================================================================
         * Event Handler: $('input.helper-tool-set-src').on('paste blur')
         * Description: Allows users to paste or type an image URL into an input
         *              field, which then updates the demo image.
         * =====================================================================
         */

        $( 'input.helper-tool-set-src' ).on( 'paste blur', function( e ) {
            var element = this;
            // Use a short timeout to ensure the input field's value has updated.
            setTimeout( function() {
                var text = $( element ).val();
                setImage( text ); // Call setImage with the new URL.
            }, 100 );
        } ); // End of input paste/blur handler

        /*
         * =====================================================================
         * Function: updateFocusPoint()
         * Description: Applies the current focusPointAttr.x and .y values
         *              to all focusPoint containers and triggers an update.
         * =====================================================================
         */

        function updateFocusPoint() {

            /*
             * REITERATION:
             * As mentioned in the setImage() function, setting these attributes
             * directly via .attr() is mainly for debugging and visual confirmation
             * in the DOM. They are not strictly necessary for the FocusPoint plugin's
             * core operation, which relies on .data().
             */
            $focusPointContainers.attr( {
                'data-focus-x'  :   focusPointAttr.x,
                'data-focus-y'  :   focusPointAttr.y
            } );

            /*
             * CRITICAL STEP:
             * These .data() assignments are paramount. They provide the FocusPoint
             * plugin with the dynamic coordinates it needs to adjust image cropping.
             */
            $focusPointContainers.data( 'focusX', focusPointAttr.x );
            $focusPointContainers.data( 'focusY', focusPointAttr.y );

            // Trigger the FocusPoint plugin's adjustment method to re-render images.
            $focusPointContainers.adjustFocus();

        }; // End of updateFocusPoint function

    } ); // End of $(document).ready

} )( jQuery ); // End of IIFE with jQuery alias