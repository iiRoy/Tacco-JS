/*
 *  This file contains a jQuery plugin.
 *  Its purpose is to provide an interactive "cover" effect.
 *  Developed by Mojtaba Seyedi.
 *  Licensed under MIT.
 *  For more details, visit http://seyedi.mit-license.org
 */

( function ( $ ) {

    // Define the plugin method within jQuery's fn object.
    $.fn.coveringBad = function ( options ) {

        // Merge default settings with user-provided options.
        var settings = $.extend( {

            marginY   :   30   ,   // Vertical margin for the draggable handle.
            marginX   :   30   ,   // Horizontal margin for the draggable handle.
            setX      :   30   ,   // Initial X position for the handle.
            setY      :   30   ,   // Initial Y position for the handle.
            direction : "horizontal" // Default direction of the cover effect.

        } , options ) ;

        // Iterate over each selected element to apply the plugin.
        return this.each( function ( ) {

            // --- Plugin Initialization Steps ---

            var $this         = $( this ) ; // The current element.
            var $changeable   = $this.find ( '>.changeable' ) ; // The element to be resized.
            var $handle       = $this.find ( '>.handle' ) ; // The draggable handle element.
            var width         = $this.innerWidth ( ) ; // Inner width of the main container.
            var height        = $this.innerHeight ( ) ; // Inner height of the main container.

            var pos_x         = null ; // Stores the initial X position of the handle for dragging.
            var pos_y         = null ; // Stores the initial Y position of the handle for dragging.
            var startX        = null ; // Stores the starting X coordinate of the mouse during a drag.
            var startY        = null ; // Stores the starting Y coordinate of the mouse during a drag.

            // Calculate minimum and maximum allowed positions for the handle.
            var min_left      = settings.marginX ;
            var max_left      = width - settings.marginX ;

            var min_top       = settings.marginY ;
            var max_top       = height - settings.marginY ;

            // Set initial X and Y positions for the handle based on settings.
            var setX          = settings.setX ;
            var setY          = settings.setY ;

            // Apply background images from data attributes.
            $this.css ( 'background-image' , 'url(' + $this.data ( 'passive' ) + ')' ) ;
            $changeable.css ( 'background-image' , 'url(' + $this.data ( 'active' ) + ')' ) ;

            // Ensure the changeable element has the same height as its parent.
            $changeable.height ( $this.height ( ) ) ;

            // Adjust initial setX if it's outside the allowed minimum.
            if ( setX < min_left ) {
                setX = min_left ;
            }

            // Adjust initial setY if it's outside the allowed minimum.
            if ( setY < min_top ) {
                setY = min_top ;
            }

            // Append navigation icons to the handle.
            $handle.append ( '<span class="left icon-chevron-left"></span><span class="right icon-chevron-right"/></span>' ) ;

            // Position the handle according to calculated setX and setY.
            $handle.css ( 'left' , setX ) ;
            $handle.css ( 'top' , setY ) ;

            // --- Direction-specific Setup ---

            if ( settings.direction === "horizontal" ) {
                // For horizontal mode, set initial width and add a border.
                $changeable.width ( setX ) ;
                $changeable.css ( 'border-right' , '1px dashed #FFF' ) ;
            }

            else if ( settings.direction === "vertical" ) {
                // For vertical mode, adjust heights and add a bottom border.
                $this.height ( $changeable.height ( ) ) ;
                $changeable.height ( setY ) ;
                $changeable.css ( 'border-bottom' , '1px dashed #FFF' ) ;
                $handle.addClass ( 'vertical' ) ; // Add class for vertical styling.
            }

            // --- Dragging Functionality ---

            $handle.on ( 'mousedown' , function ( event ) {
                // Prevent default drag behavior (like text selection).
                event.preventDefault ( ) ;
                // Mark the handle as draggable.
                $handle.addClass ( 'draggable' ) ;
                // Store initial handle position and mouse coordinates.
                pos_x  = parseInt ( $handle.css ( 'left' ) ) ;
                startX = event.pageX ;
                pos_y  = parseInt ( $handle.css ( 'top' ) ) ;
                startY = event.pageY ;

            } ) ;

            // Global mouseup event to stop dragging.
            $( document ).on ( 'mouseup' , function ( event ) {
                // Remove the draggable class.
                $handle.removeClass ( 'draggable' ) ;
            } ) ;

            // Bind the dragger function to mousemove events on the container.
            $this.bind ( 'mousemove' , dragger ) ;

            /**
             * Handles the dragging logic when the mouse moves.
             * @param {Event} e - The mousemove event object.
             */
            function dragger ( e ) {

                // Calculate new left position for the handle.
                var left = pos_x + ( e.pageX - startX ) ;
                // Enforce horizontal boundaries.
                if ( left < min_left ) left = min_left ;
                else if ( left > max_left ) left = max_left ;

                // Apply the new left position to the draggable handle.
                $( '.draggable' ).css ( 'left' , left ) ;

                // Calculate new top position for the handle.
                var top = pos_y + ( e.pageY - startY ) ;
                // Enforce vertical boundaries.
                if ( top < min_top ) top = min_top ;
                else if ( top > max_top ) top = max_top ;

                // Apply the new top position to the draggable handle.
                $( '.draggable' ).css ( 'top' , top ) ;

                // If an element is currently being dragged, update its dimensions.
                if ( $( '.draggable' ).length ) {
                    changeWidth ( left , top ) ;
                }

            }

            /**
             * Updates the width or height of the changeable element based on handle position.
             * @param {number} w - The new width (or horizontal position).
             * @param {number} h - The new height (or vertical position).
             */
            function changeWidth ( w , h ) {

                if ( settings.direction === "horizontal" ) {
                    // Update width in horizontal mode.
                    $changeable.width ( w ) ;
                }

                else if ( settings.direction === "vertical" ) {
                    // Update height in vertical mode.
                    $changeable.height ( h ) ;
                }

            }

        } ) ; // End of this.each()

    } ; // End of $.fn.coveringBad

} ) ( jQuery ) ; // End of IIFE