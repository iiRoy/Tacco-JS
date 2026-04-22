/*
 *  This is a slightly altered version of the original Lazy Load jQuery plugin.
 *
 *  Original Project: Lazy Load - jQuery plugin for lazy loading images
 *
 *  Original Copyright (c) 2007-2011 Mika Tuupola
 *
 *  Licensed under the MIT license - please see:
 *    http://www.opensource.org/licenses/mit-license.php
 *
 *  Official Project Home:
 *    http://www.appelsiini.net/projects/lazyload
 *
 *  Current Version:  1.7.0
 *
 *  Performance optimizations by: Amr Tj. Wallas
 *  Forked from Project (https://github.com/TjWallas/YouTube-Lite-Embed)
 *
 *  This clone maintains exact functional equivalence, only varying in
 *  whitespace and comments as per Type I definition.
 *
 */

( function ( $ ) {

    // Define the lazyload plugin method on jQuery's prototype object
    $.fn.lazyload = function ( options ) {

        // Default settings for the lazyload plugin
        var settings = {
            threshold    : 0,           // Pixels around the viewport to start loading
            failurelimit : 0,           // How many items to skip after hitting the fold
            event        : "scroll",    // Event that triggers checking for visible elements
            effect       : "show",      // jQuery effect to use when showing the image
            container    : window       // The container to check scroll position against
        };

        /*
         *   Merge user-provided options with default settings.
         *   If options are provided, extend the settings object.
         */
        if ( options ) {
            $.extend( settings, options );
        }

        /*
         *   Initialize a variable to hold the collection of elements.
         *   This ensures we're working with the original set of elements
         *   inside event handlers.
         */
        var elements = this;

        // If the specified event is "scroll", bind a single scroll handler to the container.
        if ( "scroll" == settings.event ) {

            // Bind the scroll event to the designated container
            $( settings.container ).bind( "scroll", function ( event ) {

                var counter = 0; // Initialize a counter for failure limit

                // Loop through all elements managed by lazyload
                for ( var i = 0; i < elements.length; i++ ) {

					// Get the current element in the loop
					currentElement = elements[ i ];

                    // Wrap the current DOM element in a jQuery object
                    $this = $( currentElement );

                    // If skip_invisible is true and the element is not visible, skip it.
                    if ( settings.skip_invisible && !$this.is( ":visible" ) ) {
                        // We simply return here to process the next element
                        return;
                    }

                    // Check if the element is above the top or to the left of the beginning of the fold
                    if ( $.abovethetop( currentElement, settings ) || $.leftofbegin( currentElement, settings ) ) {
                            /*
                             *  Do nothing if the element is outside the viewport
                             *  in a direction that implies it has already been scrolled past
                             *  or is not yet in view from the "start" direction.
                             */
                    }
                    // Otherwise, check if it's within the viewport (not below the fold and not right of fold)
                    else if ( !$.belowthefold( currentElement, settings ) && !$.rightoffold( currentElement, settings ) ) {
                            // If it's within the viewport, trigger the "appear" event to load it
                            $this.trigger( "appear" );
                    }
                    // If none of the above conditions are met, it means it's below or right of the fold
                    else {
                        // Increment the counter; if it exceeds the failure limit, stop processing
                        if ( counter++ > settings.failurelimit ) {
                            // Return false to break out of the scroll handler's loop
                            return false;
                        }
                    }
                }
            } );
        }

        // Iterate over each element in the jQuery selection
        for ( var i = 0; i < this.length; i++ ) {

            var self  = this[ i ];     // Get the raw DOM element
            var $self = $( self );     // Get the jQuery wrapped element

            self.loaded = false;       // Initialize a 'loaded' flag on the DOM element

            /*
             *   When the "appear" event is triggered on an element,
             *   load its original image source.
             */
            $( self ).one( "appear", function () {
                // Ensure the image hasn't been loaded already
                if ( !this.loaded ) {
                    // Create a new image element
                    $( "<img />" )
                        // Bind a load event to the newly created image
                        .bind( "load", function () {
                            // Once the new image loads, update the original element
                            $( self )
                                .hide()                                        // Hide it initially
                                .attr( "src", $( self ).data( "original" ) )  // Set its source from data-original
                                [ settings.effect ]( settings.effectspeed );   // Apply the specified effect
                            self.loaded = true;                                // Mark as loaded
                        } )
                        // Set the source of the temporary image to trigger loading
                        .attr( "src", $( self ).data( "original" ) );
                }
            } );

            /*
             *   If the event is not "scroll", bind the specified event
             *   to trigger the "appear" event on the element.
             */
            if ( "scroll" != settings.event ) {
                $( self ).bind( settings.event, function ( event ) {
                    // If the element hasn't been loaded yet, trigger "appear"
                    if ( !self.loaded ) {
                        $( self ).trigger( "appear" );
                    }
                } );
            }
        }

        /*
         *   Force an initial check to see if any images
         *   should appear immediately on page load.
         */
        $( settings.container ).trigger( settings.event );

        // Return the original jQuery object for chaining
        return this;

    }; // End of $.fn.lazyload

    /*
     *   Convenience methods added directly to the jQuery namespace.
     *   These can be used independently, e.g., $.belowthefold(element, {threshold : 100, container : window}).
     */

    // Checks if an element is below the fold (vertical scroll)
    $.belowthefold = function ( element, settings ) {
        var fold; // Variable to store the fold position

        // Determine the fold position based on the container
        if ( settings.container === undefined || settings.container === window ) {
            fold = $( window ).height() + $( window ).scrollTop();
        } else {
            fold = $( settings.container ).offset().top + $( settings.container ).height();
        }
        // Return true if the fold is less than or equal to the element's top position minus threshold
        return fold <= $( element ).offset().top - settings.threshold;
    };

    // Checks if an element is to the right of the fold (horizontal scroll)
    $.rightoffold = function ( element, settings ) {
        var fold; // Variable to store the fold position

        // Determine the fold position based on the container
        if ( settings.container === undefined || settings.container === window ) {
            fold = $( window ).width() + $( window ).scrollLeft();
        } else {
            fold = $( settings.container ).offset().left + $( settings.container ).width();
        }
        // Return true if the fold is less than or equal to the element's left position minus threshold
        return fold <= $( element ).offset().left - settings.threshold;
    };

    // Checks if an element is above the top of the fold (vertical scroll)
    $.abovethetop = function ( element, settings ) {
        var fold; // Variable to store the fold position

        // Determine the fold position based on the container
        if ( settings.container === undefined || settings.container === window ) {
            fold = $( window ).scrollTop();
        } else {
            fold = $( settings.container ).offset().top;
        }
        // Return true if the fold is greater than or equal to the element's bottom position plus threshold
        return fold >= $( element ).offset().top + settings.threshold + $( element ).height();
    };

    // Checks if an element is to the left of the beginning of the fold (horizontal scroll)
    $.leftofbegin = function ( element, settings ) {
        var fold; // Variable to store the fold position

        // Determine the fold position based on the container
        if ( settings.container === undefined || settings.container === window ) {
            fold = $( window ).scrollLeft();
        } else {
            fold = $( settings.container ).offset().left;
        }
        // Return true if the fold is greater than or equal to the element's right position plus threshold
        return fold >= $( element ).offset().left + settings.threshold + $( element ).width();
    };

    /*
     *   Custom selectors for jQuery, enhancing its selection capabilities.
     *   These can be used like: $("img:below-the-fold").something().
     */
    $.extend( $.expr[ ':' ], {
        // Selector for elements below the fold
        "below-the-fold" : "$.belowthefold(a, {threshold : 0, container: window})",
        // Selector for elements above the fold (negation of below-the-fold)
        "above-the-fold" : "!$.belowthefold(a, {threshold : 0, container: window})",
        // Selector for elements to the right of the fold
        "right-of-fold"  : "$.rightoffold(a, {threshold : 0, container: window})",
        // Selector for elements to the left of the fold (negation of right-of-fold)
        "left-of-fold"   : "!$.rightoffold(a, {threshold : 0, container: window})"
    } );

} )( jQuery ); // Pass jQuery object into the immediately invoked function expression