/**!
 * jquery.fast-Slider
 * @author CreoArt
 * @license Apache 2.0
 * @site https://github.com/CreoArt/jqeury.fast-Slider
 *
 * This is a JavaScript plugin for creating a responsive slider or gallery.
 * It provides functionalities like navigation, image loading, and overlay displays.
 * Version: 1.0.0
 */


( function ( $ ) {

    // Extend jQuery's prototype with a new function called 'Slider'
    $.fn.Slider = function ( s ) {

        // Store the current jQuery object (the element on which Slider was called)
        var $this = this,

            // Extend default settings with user-provided settings
            // This ensures all necessary options are present
            s = $.extend( {
                // Selector for the next button
                next_bt: '.next',
                // Selector for the previous button
                prev_bt: '.prev',
                // Flag to hide navigation buttons when not needed
                bt_hide: false,
                // Type of slider: 'gallary' for image galleries, or false for standard
                type: false,
                // Height synchronization: if true, all list items will have the same height
                hs: false,
                // Animation duration in milliseconds
                duration: 1000,
                // Debug mode flag; enables console logging
                debug: false,
                // Internal flag to prevent multiple animations simultaneously
                animating: false,
                // Circular slider mode: if true, slider loops endlessly
                circle: false
            }, s );

        // Store the merged settings object directly on the jQuery object for easy access
        $this.s = s;

        // Initialize internal state variables
        $this.windowLoaded = false;
        // Select the first <ul> element within the current slider container
        $this.ul = $( 'ul:first', this );
        // Select all <li> elements within the <ul>
        $this.li = $( 'li', $this.ul );
        // Select the first <li> element within the <ul>
        $this.lif = $( 'li:first', $this.ul );
        // Index counter, primarily used for gallery mode
        $this.idx = 0;
        // Get the ID attribute of the slider container
        $this.id = $( this ).attr( 'id' );
        // Select the next button based on the configured selector
        $this.next_bt = $( $this.s.next_bt, this );
        // Select the previous button based on the configured selector
        $this.prev_bt = $( $this.s.prev_bt, this );
        // Max height of list items, used for height synchronization
        $this.hh = 0;
        // Width of the <ul> element (not used directly in current logic, but initialized)
        $this.ulw = 0;
        // Factory width for <ul>, calculated based on container and button widths
        $this.ulfw = 0;
        // Number of objects (list items) that can fit in the visible area (rounded up)
        $this.obj = 0;
        // Number of objects (list items) that can fit in the visible area (raw float)
        $this.objr = 0;
        // Width of a single list item (not used directly, but initialized)
        $this.liw = 0;


        /**
         * The main 'make' function that initializes and sets up the slider.
         * This function is called for each element matched by the selector.
         */
        var make = function () {

            // If button hiding is enabled and it's not a circular slider, hide the previous button initially
            if ( $this.s.bt_hide && !$this.s.circle ) {
                $this.prev_bt.hide();
            }


            /**
             * Sets up the initial CSS and calculates dimensions for the slider.
             * This function is typically called once the window has fully loaded.
             */
            $this.setup = function () {

                // Mark that the window has loaded and setup can proceed
                $this.windowLoaded = true;

                // Log debug information if debug mode is enabled
                if ( $this.s.debug ) {
                    console.log( '--- Slider setup ---' );
                    console.log( 'id: ' + $this.id );
                    console.log( '--- Settings ---' );
                    console.log( s ); // Log the current settings object

                    if ( $this.s.type == 'gallary' ) {
                        console.log( 'gallary mode' );
                    }

                    console.log( 'li.length: ' + $this.li.length );
                    console.log( 'container & ul setup css' );
                }

                // Apply necessary CSS to the slider container
                $( $this ).css( {
                    'overflow': 'hidden',     // Hide overflowing content
                    'position': 'relative'    // Establish a positioning context
                } );

                // Apply necessary CSS to the <ul> element
                $this.ul.css( {
                    'list-style': 'none',     // Remove default list styling
                    'overflow': 'hidden',     // Hide overflowing content
                    'position': 'relative',   // Establish a positioning context
                    'float': 'left',          // Make <ul> float left
                    'width': '9999px'         // Ensure <ul> is wide enough to contain all <li>s
                } );

                // Calculate the "factory width" for the <ul>
                // This is the container's width minus the width of both navigation buttons
                $this.ulfw = ( $( $this ).outerWidth() - $this.next_bt.outerWidth() - $this.prev_bt.outerWidth() );

                // Log detailed width calculations if debug mode is on
                if ( $this.s.debug ) {
                    console.log( 'container width: ' + $( $this ).outerWidth() );
                    console.log( 'next bottom width: ' + $this.next_bt.outerWidth() );
                    console.log( 'prev bottom width: ' + $this.prev_bt.outerWidth() );
                    console.log( 'ul factory width: ' + $this.ulfw );
                }

                // Log message for list item setup
                if ( $this.s.debug ) {
                    console.log( 'li setup css and max height' );
                }


                // Iterate over each list item to apply CSS and handle gallery-specific logic
                $this.li.each( function () {

                    // Determine the maximum height among all list items
                    if ( $this.hh < $( this ).outerHeight( true ) ) {
                        $this.hh = $( this ).outerHeight( true );
                    }

                    // Apply necessary CSS to each <li> element
                    $( this ).css( {
                        'list-style': 'none',     // Remove default list styling
                        'position': 'relative',   // Establish a positioning context
                        'float': 'left'           // Make <li> float left
                    } );

                    // If in gallery mode, add specific classes, attributes, and click handlers
                    if ( $this.s.type == 'gallary' ) {
                        $( this ).addClass( 'gl_' + $this.id );
                        $( this ).attr( 'rel', 'gl_' + $this.id + '_' + $this.idx );
                        $( this ).css( 'cursor', 'pointer' );
                        $( this ).click( $this.gallary );
                        $this.idx++; // Increment index for unique rel attributes
                    }
                } );

                // Calculate the number of items that can fit in the visible area
                // obj: rounded up to ensure enough space is reserved
                $this.obj = Math.ceil( $this.ulfw / $this.li[ 0 ].clientWidth );
                // objr: raw float value for more precise calculations
                $this.objr = ( $this.ulfw / $this.li[ 0 ].clientWidth );

                // Log calculated object counts
                if ( $this.s.debug ) {
                    console.log( 'Obj: ' + $this.obj );
                    console.log( 'Objr: ' + $this.objr );
                }

                // If height synchronization is enabled, set the container's height to the max list item height
                if ( $this.s.hs ) {
                    if ( s.debug ) {
                        console.log( 'li max height: ' + $this.hh );
                    }
                    $( this ).height( $this.hh );
                }

            }; // End of $this.setup function


            /**
             * Displays an overlay with custom content.
             *
             * @param {object} o - Options for the overlay (width, height, close button, type, style, index).
             * @param {string} text - The HTML content to display inside the overlay.
             * @param {function} cb - Callback function to execute after the overlay is shown.
             */
            $this.overlay = function ( o, text, cb ) {

                // Merge default overlay options with provided options
                var o = $.extend( {
                        width: 'auto',       // Default width
                        height: 'auto',      // Default height
                        close: true,         // Show close button by default
                        type: false,         // Type of overlay (e.g., 'gallary')
                        style: '',           // Additional inline CSS style
                        idx: false           // Index for gallery navigation
                    }, o ),

                    // Initialize variables for close, next, and previous buttons HTML
                    close = '',
                    next = '',
                    prev = '';

                // If overlay type is 'gallary', include next and previous navigation buttons
                if ( o.type == 'gallary' ) {
                    next = '<div id="SliderOverlayNext" style="position:absolute;top:0;bottom:0;right:-20px;background: url(\'images/slider-next.png\') right center no-repeat; width:70px;cursor:pointer;" rel="' + o.idx + '"></div>';
                    prev = '<div id="SliderOverlayPrev" style="position:absolute;top:0;bottom:0;left:-20px;background: url(\'images/slider-prev.png\') left center no-repeat; width:70px;cursor:pointer;" rel="' + o.idx + '"></div>'
                }

                // If a close button is enabled, generate its HTML
                if ( o.close ) {
                    close = '<img id="SliderOverlayClose" style="position:absolute;top:-24px;right:-24px;z-index:1002;cursor:pointer;" src="images/slider-close.png">';
                }

                // If the main overlay background doesn't exist, append it to the body
                if ( $( '#SliderOverlay' ).html() == null ) {
                    $( 'body' ).append( '<div id="SliderOverlay" style="position:fixed;top:0;bottom:0;left:0;right:0;background:#000;opacity:0.5;z-index:1000;"></div>' );
                }

                // If the overlay content box doesn't exist, append it and bind events
                if ( $( '#SliderOverlayBox' ).html() == null ) {
                    $( 'body' ).append( '<div id="SliderOverlayBox" style="display:none;position:fixed;top:50%;left:50%;background:#fff;z-index:1001;width:' + o.width + ';height:' + o.height + ';' + o.style + '">' + text + '' + close + '' + next + '' + prev + '</div>' );
                    $this.overlay_bind( o, cb );
                } else {
                    // If the overlay content box already exists, update its content and dimensions
                    $( '#SliderOverlayBox' ).css( {
                        width: o.width + 'px',
                        height: o.height + 'px'
                    } );
                    $( '#SliderOverlayBox' ).html( text + '' + close + '' + next + '' + prev );
                    $this.overlay_bind( o, cb );
                }

            }; // End of $this.overlay function


            /**
             * Binds events and positions the overlay box after it's created or updated.
             *
             * @param {object} o - Options for the overlay.
             * @param {function} cb - Callback function to execute after the overlay is shown.
             */
            $this.overlay_bind = function ( o, cb ) {

                // Center the overlay box horizontally and vertically
                $( '#SliderOverlayBox' ).css( {
                    'margin-top': '-' + ( $( '#SliderOverlayBox' ).outerHeight() / 2 ) + 'px',
                    'margin-left': '-' + ( $( '#SliderOverlayBox' ).outerWidth() / 2 ) + 'px'
                } );

                // Bind close events if the close button is enabled
                if ( o.close ) {
                    $( '#SliderOverlay' ).click( $this.overlay_close );
                    $( '#SliderOverlayClose' ).click( $this.overlay_close );
                }

                // Bind gallery navigation events if in gallery mode
                if ( o.type == 'gallary' ) {
                    $( '#SliderOverlayNext' ).click( $this.gallary_next );
                    $( '#SliderOverlayPrev' ).click( $this.gallary_prev );
                }

                // Show the overlay box with a 'slow' animation, then execute callback
                if ( $( '#SliderOverlayBox' ).is( ':hidden' ) ) {
                    $( '#SliderOverlayBox' ).show( 'slow', function () {
                        if ( cb ) {
                            cb();
                        }
                    } );
                } else {
                    // If already visible, just execute the callback
                    if ( cb ) {
                        cb();
                    }
                }

            }; // End of $this.overlay_bind function


            /**
             * Closes and removes the overlay elements from the DOM.
             */
            $this.overlay_close = function () {
                $( '#SliderOverlay' ).remove();      // Remove the background overlay
                $( '#SliderOverlayBox' ).remove();   // Remove the content box
            };


            /**
             * Handles the click event for a gallery item.
             * Extracts image source and index, then loads the image into the overlay.
             */
            $this.gallary = function () {
                var img = $( 'img', $( this ) ).attr( 'rel' ), // Get the image source from 'rel' attribute of the img
                    idx = $( this ).attr( 'rel' );              // Get the item's unique index

                $this.gallary_load( idx, img ); // Load the image into the gallery overlay
            };


            /**
             * Generates an array of 'rel' attributes for all gallery items.
             * This array is used for navigating between gallery images.
             *
             * @returns {Array} An array containing 'rel' attributes of gallery items.
             */
            $this.gallary_array = function () {
                var idx = []; // Initialize an empty array
                $( '.gl_' + $this.id ).each( function () {
                    idx.push( $( this ).attr( 'rel' ) ) // Push each item's 'rel' attribute into the array
                } );
                return idx;
            };


            /**
             * Navigates to the previous image in the gallery.
             *
             * @param {Event} event - The event object (implicitly 'this' refers to the clicked element).
             */
            $this.gallary_prev = function () {
                var idx = $this.gallary_array(), // Get the array of gallery item indices
                    t = $( this ).attr( 'rel' ); // Get the 'rel' of the current overlay image

                var i = idx.indexOf( t ); // Find the current image's position in the array

                // Calculate the index of the previous image
                if ( i == 0 ) {
                    i = idx.length - 1; // Loop to the last image if currently at the first
                } else {
                    i--; // Go to the previous image
                }

                // Get the image source for the new index
                var img = $( 'img', $( "li[rel='" + idx[ i ] + "']" ) ).attr( 'rel' );

                $this.gallary_load( idx[ i ], img ); // Load the new image
            };


            /**
             * Navigates to the next image in the gallery.
             *
             * @param {Event} event - The event object (implicitly 'this' refers to the clicked element).
             */
            $this.gallary_next = function () {
                var idx = $this.gallary_array(), // Get the array of gallery item indices
                    t = $( this ).attr( 'rel' ); // Get the 'rel' of the current overlay image

                var i = idx.indexOf( t ); // Find the current image's position in the array

                // Calculate the index of the next image
                if ( idx.length - 1 < i + 1 ) {
                    i = 0; // Loop to the first image if currently at the last
                } else {
                    i++; // Go to the next image
                }

                // Get the image source for the new index
                var img = $( 'img', $( "li[rel='" + idx[ i ] + "']" ) ).attr( 'rel' );

                $this.gallary_load( idx[ i ], img ); // Load the new image
            };


            /**
             * Loads an image into the gallery overlay.
             * Displays a "loading" message first, then replaces it with the image once loaded.
             *
             * @param {string} idx - The index of the image being loaded.
             * @param {string} img - The URL of the image to load.
             */
            $this.gallary_load = function ( idx, img ) {

                // Options for the temporary "loading" overlay
                var osw = {
                    style: 'padding:20px;', // Add some padding
                    close: false            // No close button for the loading message
                }

                // Display the loading message overlay
                $this.overlay( osw, '<center>Подождите идет загрузка...</center>', function () {

                    // Create a new Image object to pre-load the image
                    var image = new Image();

                    // Once the image is loaded:
                    image.onload = function () {
                        // Options for the final image overlay
                        var os = {
                            width: this.width,    // Set width to actual image width
                            height: this.height,  // Set height to actual image height
                            type: 'gallary',      // Mark as gallery type
                            idx: idx              // Pass the current image index
                        };
                        // Display the actual image in the overlay
                        $this.overlay( os, '<img src="' + this.src + '" border="0">' );
                    };

                    // Set the image source (add a cache-busting parameter)
                    image.src = img + '?' + ( new Date().getTime() );

                } );

            }; // End of $this.gallary_load function


            /**
             * Handles the 'next' button click event.
             * Slides the content to the left to show the next set of items.
             */
            $this.next = function () {

                // Prevent animation if another animation is in progress or window is not loaded
                if ( $this.s.animating || !$this.windowLoaded ) {
                    return false;
                }

                $this.s.animating = true; // Set animating flag to true

                var stop = 0; // Unused variable, potentially for future logic
                var st = "$(el)"; // String for building the jQuery selector path
                var end = ".animate({left: '-'+twh+'px'}, $this.s.duration, function() { $(this).css('left','');});"; // End part of the animation string

                // Select the first visible list item and all visible list items
                var el = $( 'li:not(:hidden):first', $this.ul ),
                    eln = $( 'li:not(:hidden)', $this.ul );

                // If not in circular mode and button hiding is enabled, hide next button if almost at end
                if ( !$this.s.circle && $this.s.bt_hide && eln.length <= ( $this.objr + 1 ) ) {
                    $this.next_bt.hide();
                }

                // If not in circular mode and no more items to show, stop animation
                if ( eln.length <= $this.objr && !$this.s.circle ) {
                    $this.s.animating = false;
                    return false;
                }

                // If in circular mode and approaching the end, move the first item to the end
                if ( eln.length <= ( $this.objr + 1 ) && $this.s.circle ) {
                    $( 'li:first', $this.ul ).appendTo( $this.ul ).css( 'left', 0 ).show();
                }

                // Get the outer width of the first visible item
                twh = $( el ).outerWidth( true );

                // Animate the first item out of view
                $( el ).animate( { left: '-' + twh + 'px' }, $this.s.duration, function () {
                    $( this ).hide(); // Hide the item after animation
                    $this.s.animating = false; // Reset animating flag
                } );

                // Animate the subsequent items (up to $this.obj count)
                for ( var i = 0; i < $this.obj; i++ ) {
                    st += ".next()"; // Build the selector to target next items
                    eval( st + end ); // Execute the animation using eval
                }

                return false; // Prevent default link behavior

            }; // End of $this.next function


            /**
             * Handles the 'prev' button click event.
             * Slides the content to the right to show the previous set of items.
             */
            $this.prev = function () {

                // Prevent animation if another animation is in progress or window is not loaded
                if ( $this.s.animating || !$this.windowLoaded ) {
                    return false;
                }

                $this.s.animating = true; // Set animating flag to true

                // Select the last hidden list item and the first non-hidden list item
                var lihl = $( 'li:hidden:last', $this.ul ),
                    linhf = $( 'li:not(:hidden):first', $this.ul );

                // If no hidden items and not in circular mode with button hiding, stop animation
                if ( $( 'li:hidden', $this.ul ).length == 0 && !$this.s.bt_hide && !$this.s.circle ) {
                    $this.s.animating = false;
                    return false;
                }

                // If in circular mode and no hidden items, move the last item to the beginning
                if ( $( 'li:hidden', $this.ul ).length == 0 && $this.s.circle ) {
                    var el = $( 'li:last', $this.ul );
                    twh = el.outerWidth( true );
                    $( el ).css( { left: '-' + twh + 'px' } ); // Position it off-screen to the left
                    el.insertBefore( $( 'li:first', $this.ul ) ) // Move to the beginning
                    lihl = el; // Update lihl to be this newly moved element
                }

                // Get the outer width of the item being revealed
                var twh = lihl.outerWidth( true );

                lihl.show(); // Make the item visible
                lihl.animate( { left: '0px' }, 1000, function () {
                    $( this ).css( 'left', '' ); // Remove inline left style after animation
                    $this.s.animating = false; // Reset animating flag
                } );

                var st = "linhf"; // String for building the jQuery selector path
                var end = ".css('left','-'+twh+'px').animate({left: '0px'}, 1000, function() {$(this).css('left','');});" // End part of the animation string

                // Animate the subsequent items (up to $this.obj count)
                for ( var i = 0; i < $this.obj; i++ ) {
                    if ( i != 0 ) {
                        st += ".next()"; // Build the selector to target next items
                    }
                    eval( st + end ); // Execute the animation using eval
                }

                // If no hidden items remain and button hiding is enabled (non-circular), hide prev button
                if ( $( 'li:hidden', $this.ul ).length == 0 && $this.s.bt_hide && !$this.s.circle ) {
                    $this.prev_bt.hide();
                }

                // If not in circular mode and button hiding is enabled, show the next button
                if ( !$this.s.circle && $this.s.bt_hide ) {
                    $this.next_bt.show();
                }

                return false; // Prevent default link behavior

            }; // End of $this.prev function


            // Bind click handlers for navigation buttons to their respective functions
            $this.next_bt.click( $this.next );
            $this.prev_bt.click( $this.prev );


            // Call the setup function once the window has fully loaded
            // This ensures all element dimensions are correctly calculated
            $( window ).load( function () {
                $this.setup();
            } );

        }; // End of 'make' function


        // Iterate over each matched element and apply the 'make' function
        // This allows the Slider plugin to be called on multiple elements
        return this.each( make );

    }; // End of $.fn.Slider function

} )( jQuery ); // Pass jQuery as an argument to the IIFE