/*
 ***************************************************************
 *                                                             *
 *                 JQuery FADELOADER Plugin                    *
 *                                                             *
 *                        Version 1.0.1                        *
 *                                                             *
 *               Developed by Periplo Solutions                *
 *                                                             *
 ***************************************************************
*/

( function( $ ) {

    $.fn.fadeloader = function( options ) {

        // Merge default settings with user-provided options
        var opts = $.extend( {}, $.fn.fadeloader.defaults, options );

        // === Public Variables and Data Storage ===

        // Cache the HTML element for global data storage
        var html = $( 'html' );

        // Store the main element reference
        html.data( 'main', this );

        // Initialize animation status flags
        html.data( 'statin', false ); // Indicates if an 'in' animation is currently running
        html.data( 'statout', false ); // Indicates if an 'out' animation is currently running

        // Alphabet array for class-based animations
        html.data( 'alphain', [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ] );

        // Array to store classes for fade-out sequence
        html.data( 'alphaout', '' );

        // Store animation mode (class or children)
        html.data( 'mode', opts.mode );

        // Store fade speed
        html.data( 'fadespeed', opts.fadeSpeed );

        // Store easing type for animations
        html.data( 'easeload', opts.easeLoad );

        // === Private Variables ===

        // Reference to the main jQuery object
        var main = this;

        // Variable to hold the preloader image HTML
        var loaderImg = '';

        // Array to store objects for animation tracking
        var objArray = [];

        // Array to hold child elements for animation
        var childArr = [];

        // === Preloader HTML Generation ===

        // Check if a custom preloader HTML is provided
        if ( opts.preloadCustom === '' ) {

            // Generate default preloader HTML if no custom one is specified
            loaderImg = '<div class="preloader" style="position:absolute;top:50%;left:50%;width:' + opts.preloadWidth + 'px;height:' + opts.preloadHeight + 'px; margin:-' + Math.round( opts.loadHeight / 2 ) + 'px 0 0 -' + Math.round( opts.preloadWidth / 2 ) + 'px;"><img src="' + opts.preloadImg + '" border="0" width="' + opts.preloadWidth + '" height="' + opts.preloadHeight + '" /></div>';

        } else {

            // Use the provided custom preloader HTML
            loaderImg = opts.preloadCustom;

        }

        // === Preloader Insertion ===

        // Prepend the loader to the BODY if the preloader option is enabled
        if ( opts.preloader === true ) { $( 'body' ).prepend( loaderImg ); }


        /**
         * Recursively animates elements into view (fade-in).
         * @param {number} start_index - The current index in the animation sequence.
         * @param {string} call - The function to call upon completion (as a string).
         */
        function animIn( start_index, call ) {

            // Proceed only if no 'out' animation is currently active
            if ( html.data( 'statout' ) === false ) {

                // Set 'in' animation status to true
                html.data( 'statin', true );

                // Calculate the index for the next element in the sequence
                var next_index = start_index + 1;

                var object; // Declare object variable for scoping

                // Determine the target object based on the animation mode
                if ( opts.mode == 'children' ) {

                    // If mode is 'children', target the element from childArr
                    object = $( childArr[ start_index ] );

                } else { // Default mode is 'class'

                    // If mode is 'class', target elements by class name
                    object = main.find( '.' + html.data( 'alphain' )[ start_index ] );

                }

                // If an object is found for the current index
                if ( object.length > 0 ) {

                    // Set initial opacity to 0 and display type
                    object.css( 'opacity', '0' );
                    object.css( 'display', opts.displayType );

                    // Animate the object to full opacity
                    object.animate( { opacity: 1 }, opts.fadeSpeed, opts.easeLoad, function() {
                        // Recursively call animIn for the next element
                        animIn( next_index, call );
                    } );

                    // Add the current class to the array for fade-out sequence
                    objArray.push( html.data( 'alphain' )[ start_index ] );

                } else {

                    // If no more objects are found, reverse the array for fade-out
                    html.data( 'alphaout', objArray.reverse() );

                    // Reset 'in' animation status
                    html.data( 'statin', false );

                    // Execute the completion callback if provided
                    eval( call );

                    // Exit the function
                    return false;
                }
            }
        }

        // === Initial Function Call on Window Load ===

        // Execute when the entire page (including images) has loaded
        $( window ).load( function() {

            // Remove the preloader element from the DOM
            $( '.preloader' ).remove();

            // Determine initial animation based on mode
            if ( opts.mode == 'children' ) {

                // Get all direct children, excluding scripts and line breaks
                var subsubchildArr = html.data( 'main' ).children( ':not(script,br)' );

                // Convert jQuery object to a native array
                childArr = $.makeArray( subsubchildArr );

                // Start the fade-in animation for children
                animIn( 0, opts.onComplete );

            } else {

                // Start the fade-in animation for classes
                animIn( 0, opts.onComplete );

            }
        } );

    }; // End of $.fn.fadeloader

    /**
     * Public method to animate elements out of view (fade-out).
     * @param {string} url - The URL to navigate to after the animation completes.
     */
    $.fn.fadeloader.animOut = function( url ) {

        // Get the HTML element data
        var html = $( 'html' );

        // Initialize child array for fade-out sequence
        var childArr = [];

        /**
         * Recursively fades out elements based on stored classes.
         * @param {number} pos - The current position in the alphaout array.
         */
        function fadeOutClasses( pos ) {

            // Check if there's a class at the current position
            if ( html.data( 'alphaout' )[ pos ] ) {

                // Calculate the next position
                var newpos = pos + 1;

                // Animate the element with the current class to opacity 0
                $( '.' + html.data( 'alphaout' )[ pos ] ).animate( { opacity: 0 }, html.data( 'fadespeed' ), html.data( 'easeload' ), function() {

                    // After animation, set display to 'none' and call recursively
                    $( this ).css( 'display', 'none' );
                    fadeOutClasses( newpos );

                } );

            } else {

                // If no more classes, reset 'in' animation status
                html.data( 'statin', false );

                // Redirect if a URL is provided
                if ( url ) { document.location.href = url; }

                // Exit the function
                return false;
            }
        }

        /**
         * Recursively fades out child elements.
         * @param {number} pos - The current position in the childArr.
         * @param {Array} arr - The array of child elements to animate.
         */
        function fadeOutChildren( pos, arr ) {

            // Check if there's a child at the current position and it's not a script, br, or a tag
            if ( childArr[ pos ] && childArr[ pos ] != 'script' && childArr[ pos ] != 'br' && childArr[ pos ] != 'a' ) {

                // Calculate the next position
                var newpos = pos + 1;

                // Animate the current child element to opacity 0
                $( childArr[ pos ] ).animate( { opacity: 0 }, html.data( 'fadespeed' ), html.data( 'easeload' ), function() {

                    // After animation, set display to 'none' and call recursively
                    $( this ).css( 'display', 'none' );
                    fadeOutChildren( newpos, childArr );

                } );

            } else {

                // If no more children, reset 'in' animation status
                html.data( 'statin', false );

                // Redirect if a URL is provided
                if ( url ) { document.location.href = url; }

                // Exit the function
                return false;
            }
        }

        // Only proceed if no 'in' animation is currently active
        if ( html.data( 'statin' ) === false ) {

            // Set 'out' animation status to true
            html.data( 'statout', true );

            // Determine fade-out method based on mode
            if ( html.data( 'mode' ) == 'children' ) {

                // Get direct children, excluding scripts and line breaks
                var subsubchildArr = html.data( 'main' ).children( ':not(script,br)' );

                // Convert to array
                var subchildArr = $.makeArray( subsubchildArr );

                // Reverse the array for proper fade-out order
                childArr = subchildArr.reverse();

                // Start fading out children
                fadeOutChildren( 0, childArr );

            } else {

                // Start fading out elements by class
                fadeOutClasses( 0 );

            }
        }
    }; // End of $.fn.fadeloader.animOut


    // === Default Options for Fadeloader Plugin ===
    $.fn.fadeloader.defaults = {

        mode            : 'class',          // Animation mode: 'class' (default) or 'children'
        fadeSpeed       : 500,              // Speed of the fade animation in milliseconds
        //fadeInOrder   : 'desc',           // (Currently unused/commented out)
        //fadeOutOrder  : 'asc',            // (Currently unused/commented out)
        easeLoad        : 'linear',         // Easing function for animations (e.g., 'linear', 'swing')
        displayType     : 'block',          // CSS display property for elements during fade-in
        preloader       : true,             // Enable/disable the default preloader
        preloadImg      : 'loading.gif',    // Path to the preloader image
        preloadWidth    : 50,               // Width of the preloader image/container
        preloadHeight   : 50,               // Height of the preloader image/container
        preloadCustom   : '',               // Custom HTML for the preloader (must have class 'preloader')
        onComplete      : ''                // Javascript code to execute after fade-in completes (as a string)

    };

} )( jQuery ); // End of IIFE (Immediately Invoked Function Expression)