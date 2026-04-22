( function ( $ ) {
    // This immediately invoked function expression (IIFE) encapsulates the plugin to prevent global scope pollution.
    // It passes the jQuery object as '$' for local use.

    // Define the responsiveFullSlide plugin as a new function on jQuery's prototype.
    // This allows it to be called on jQuery selections, e.g., $('selector').responsiveFullSlide(...).
    $.fn.responsiveFullSlide = function ( speed, easing ) {
        // 'this' refers to the jQuery object on which the plugin was called (e.g., the container for the slider).
        var self = this; // Cache 'this' for use within nested functions and event handlers.

        // Locate the main slider window element within the current context.
        this.sliders = this.find( "#slider-window" );

        // Locate all individual slide elements within the current context.
        this.img = this.find( ".slide" );

        // Set the initial width of the slider window.
        // It's calculated to be 100% multiplied by the number of slides, allowing them to be laid out horizontally.
        $( '#slider-window' ).css( {
            width : self.img.length * 100 + '%' // Dynamically calculate the total width required.
        } );

        // Store the initial cached width of the container element.
        this.largeurCache = this.width();

        // Store the height of the container element.
        this.hauteur = this.height();

        // Store the total count of slides.
        this.largeur = this.img.length;

        // Iterate through each slide and set its width to the current document width.
        // This makes each slide take up the full width of the viewport.
        this.find( ".slide" ).each( function () {
            $( this ).css( { width : $( document ).width() } );
        } );

        // Select the navigation arrow for moving to the previous slide.
        this.prev = this.find( "#leftArrow" );

        // Select the navigation arrow for moving to the next slide.
        this.next = this.find( "#rightArrow" );

        // Calculate the maximum number of times the slider can 'jump' forward.
        // This is one less than the total number of slides, as the index is zero-based.
        this.nbJump = ( this.img.length ) - 1;

        // Initialize the current slide index to the first slide (index 0).
        this.curent = 0;

        // Attach a click event handler to the 'next' navigation arrow.
        this.next.click( function () {
            // Check if there are more slides to the right (i.e., we are not at the last slide).
            if ( self.curent < self.nbJump ) {
                self.curent++; // Increment the current slide index to move to the next slide.
                // Animate the slider window to the new position.
                // The 'left' CSS property is adjusted by the cached width multiplied by the current slide index.
                self.sliders.animate( {
                    left : -self.curent * self.largeurCache // Calculate the new 'left' offset for the animation.
                }, speed, easing ); // Use the provided speed and easing for the animation.
            }
            // Call a 'stop' method on 'self'. This method is not defined in the provided snippet
            // but is likely intended to halt any auto-play or other ongoing actions.
            self.stop();
        } );

        // Attach a click event handler to the 'previous' navigation arrow.
        this.prev.click( function () {
            // Check if there are more slides to the left (i.e., we are not at the first slide).
            if ( self.curent > 0 ) {
                self.curent--; // Decrement the current slide index to move to the previous slide.
                // Animate the slider window to the new position.
                // The 'left' CSS property is adjusted similarly to the 'next' button.
                self.sliders.animate( {
                    left : -self.curent * self.largeurCache // Calculate the new 'left' offset for the animation.
                }, speed, easing ); // Use the provided speed and easing for the animation.
            }
            // Call the 'stop' method, similar to the 'next' button.
            self.stop();
        } );

        // Attach a resize event handler to the window object.
        // This ensures the slider adapts when the browser window dimensions change.
        $( window ).resize( function () {
            // Recalculate the cached width of the container on window resize.
            self.largeurCache = self.width();

            // Recalculate the width of a single image/slide.
            // This assumes all slides have the same width.
            self.largeurImg = self.img.width();

            // Re-adjust the width of each individual slide to the new window width.
            self.find( ".slide" ).each( function () {
                $( this ).css( { width : $( window ).width() } );
            } );

            // Adjust the slider window's position immediately (without animation)
            // to maintain the currently viewed slide in the correct position after the resize.
            self.sliders.css( {
                left : -self.largeurImg * self.curent
            } );

            // Ensure navigation arrows are positioned correctly after a window resize event.
            $( '#leftArrow' ).css( "left", "0" );
            $( '#rightArrow' ).css( "right", "0" );
        } );
    }; // End of responsiveFullSlide plugin definition.
} )( jQuery ); // End of the IIFE, passing the global jQuery object.