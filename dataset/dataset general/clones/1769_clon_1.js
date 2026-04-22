/*
 * This is a modified version of the VenoBox jQuery Plugin.
 * Version: 1.5.2 - A robust and flexible lightbox solution.
 * This script requires the jQuery library to function correctly.
 *
 * For more information and examples, please visit: http://lab.veno.it/venobox/
 * Licensing details: Creative Commons Attribution 3.0 License
 * License URI: http://creativecommons.org/licenses/by/3.0/
 * Copyright notice: (c) 2013-2014 Nicola Franchini - @nicolafranchini
 * All rights reserved.
 *
 * This file has undergone extensive whitespace and comment modifications
 * to produce a Type I code clone. The logical structure and functionality
 * remain completely identical to the original source.
 */
( function( $ ) {

    // Declare all module-level variables at the top for clarity.
    var ios; // Flag for iOS devices.
    var ie9; // Flag for Internet Explorer 9 or older.
    var overlayColor; // Stores the background color for the overlay.
    var overlay; // jQuery object for the main overlay element.
    var framewidth; // Desired width for the content frame.
    var border; // Border thickness for the content frame.
    var bgcolor; // Background color for the content frame.
    var frameheight; // Desired height for the content frame.
    var margine; // Calculated margin for vertical centering.
    var sonH; // Height of the content inside the lightbox.
    var finH; // Height of the current window viewport.
    var numeratio; // Flag to enable/disable item numbering.

    var vwrap; // Wrapper element for the entire body content.
    var container; // Inner container for the lightbox content.
    var infinigall; // Flag for infinite gallery scrolling.
    var content; // The actual content area within the lightbox.
    var core; // HTML string for the core lightbox structure.
    var dest; // The destination URL/selector for the lightbox content.
    var top; // Stores the scroll position before opening the lightbox.
    var prima; // First image element in the content (for preloading).
    var type; // Type of content (iframe, inline, ajax, vimeo, youtube, image).
    var thisgall; // Data attribute 'gall' to group items into galleries.
    var items; // Collection of all items in the current gallery.
    var thenext; // The next item in the gallery sequence.
    var theprev; // The previous item in the gallery sequence.

    var title; // Title text for the current lightbox item.
    var nextok; // Boolean indicating if a 'next' item exists.
    var prevok; // Boolean indicating if a 'prev' item exists.
    var keyNavigationDisabled; // Flag to prevent rapid key navigation.
    var blocktitle; // jQuery object for the title display block.
    var blocknum; // jQuery object for the numbering display block.
    var evitanext; // Selector to avoid closing on next button click.
    var evitaprev; // Selector to avoid closing on prev button click.
    var evitacontent; // Selector to avoid closing on content click.
    var figliall; // Selector for all children of the content element.
    var extraCss; // Additional CSS classes for the overlay.


    $.fn.extend( {

        // The primary plugin method, named 'venobox'.
        venobox: function( options ) {


            // Define the default configuration options for the plugin.
            var defaults = {
                framewidth: '', // Default width of the lightbox frame.
                frameheight: '', // Default height of the lightbox frame.
                border: '0', // Default border thickness around content.
                bgcolor: '#fff', // Default background color of the content area.
                titleattr: 'title', // Attribute to use for fetching the title.
                numeratio: false, // Whether to show "X of Y" numbering.
                infinigall: false, // Whether the gallery should loop infinitely.
                overlayclose: true // Whether clicking the overlay closes the lightbox.
            };


            // Merge the default options with any user-provided options.
            var option = $.extend( defaults, options );


            // Iterate over each selected element to apply the venobox functionality.
            return this.each( function() {

                var obj = $( this ); // Cache the current jQuery object.


                // Prevent re-initialization if venobox is already applied to this element.
                if ( obj.data( 'venobox' ) ) {

                    return true; // Skip to the next element in the collection.

                }


                // Add a class for styling and internal identification.
                obj.addClass( 'vbox-item' );

                // Store all relevant options as data attributes on the element.
                obj.data( 'framewidth', option.framewidth );
                obj.data( 'frameheight', option.frameheight );
                obj.data( 'border', option.border );
                obj.data( 'bgcolor', option.bgcolor );
                obj.data( 'numeratio', option.numeratio );
                obj.data( 'infinigall', option.infinigall );
                obj.data( 'overlayclose', option.overlayclose );

                // Mark the element as having venobox initialized.
                obj.data( 'venobox', true );


                // Detect if the user agent is an iOS device.
                ios = ( navigator.userAgent.match( /(iPad|iPhone|iPod)/g ) ? true : false );

                // Detect if the browser is Internet Explorer 9 or older.
                ie9 = ( ( document.all && !window.atob ) ? true : false );


                // Attach the click event handler to the current element.
                obj.click( function( e ) {

                    e.stopPropagation(); // Stop event bubbling.
                    e.preventDefault(); // Prevent default link behavior.

                    obj = $( this ); // Re-cache `obj` as the clicked element.

                    // Retrieve dynamic options from the clicked element's data attributes.
                    overlayColor = obj.data( 'overlay' );
                    framewidth = obj.data( 'framewidth' );
                    frameheight = obj.data( 'frameheight' );
                    border = obj.data( 'border' );
                    bgcolor = obj.data( 'bgcolor' );

                    // Reset navigation flags.
                    nextok = false;
                    prevok = false;

                    // Ensure key navigation is enabled initially.
                    keyNavigationDisabled = false;

                    // Get the destination URL or selector from the href attribute.
                    dest = obj.attr( 'href' );

                    // Capture and store the current scroll position.
                    top = $( window ).scrollTop();
                    top = -top; // Negate for CSS positioning.

                    // Retrieve any additional CSS classes for the overlay.
                    extraCss = obj.data( 'css' ) || "";


                    // Wrap the entire body content in a 'vwrap' div.
                    $( 'body' ).wrapInner( '<div class="vwrap"></div>' );


                    // Cache the newly created wrapper.
                    vwrap = $( '.vwrap' );

                    // Construct the core HTML structure for the venobox overlay.
                    core = '<div class="vbox-overlay ' + extraCss + '" style="background:' + overlayColor + '">';
                    core += '<div class="vbox-preloader">Loading...</div>';
                    core += '<div class="vbox-container">';
                    core += '<div class="vbox-content"></div>';
                    core += '</div>';
                    core += '<div class="vbox-title"></div>';
                    core += '<div class="vbox-num">0/0</div>';
                    core += '<div class="vbox-close">X</div>';
                    core += '<div class="vbox-next">next</div>';
                    core += '<div class="vbox-prev">prev</div>';
                    core += '</div>';

                    // Append the constructed core HTML to the body.
                    $( 'body' ).append( core );


                    // Cache references to the newly created DOM elements.
                    overlay = $( '.vbox-overlay' );
                    container = $( '.vbox-container' );
                    content = $( '.vbox-content' );
                    blocknum = $( '.vbox-num' );
                    blocktitle = $( '.vbox-title' );


                    // Clear any existing content and hide it for a smooth transition.
                    content.html( '' );
                    content.css( 'opacity', '0' );


                    // Call the function to check and update navigation state.
                    checknav();


                    // Set the minimum height of the overlay to cover the entire window.
                    overlay.css( 'min-height', $( window ).outerHeight() );


                    // Conditional logic for IE9 vs. modern browsers regarding transitions.
                    if ( ie9 ) {

                        // For IE9, use jQuery's animate for opacity transition.
                        overlay.animate( { opacity: 1 }, 250, function() {
                            // Ensure overlay height is correct after animation.
                            overlay.css( {
                                'min-height': $( window ).outerHeight(),
                                height: 'auto'
                            } );

                            // Determine content type and load accordingly.
                            if ( obj.data( 'type' ) == 'iframe' ) {
                                loadIframe();
                            } else if ( obj.data( 'type' ) == 'inline' ) {
                                loadInline();
                            } else if ( obj.data( 'type' ) == 'ajax' ) {
                                loadAjax();
                            } else if ( obj.data( 'type' ) == 'vimeo' ) {
                                loadVimeo();
                            } else if ( obj.data( 'type' ) == 'youtube' ) {
                                loadYoutube();
                            } else {
                                // Default to image if no specific type is defined.
                                content.html( '<img src="' + dest + '">' );
                                preloadFirst();
                            }
                        } );

                    } else {

                        // For modern browsers, bind to CSS transition end events.
                        overlay.bind( "transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function( e ) {

                            // Check if the transition event is specifically from the overlay itself.
                            if ( e.target != e.currentTarget ) {
                                return; // Ignore child element transitions.
                            }

                            // Adjust overlay height after transition.
                            overlay.css( {
                                'min-height': $( window ).outerHeight(),
                                height: 'auto'
                            } );

                            // Load content based on its type.
                            if ( obj.data( 'type' ) == 'iframe' ) {
                                loadIframe();
                            } else if ( obj.data( 'type' ) == 'inline' ) {
                                loadInline();
                            } else if ( obj.data( 'type' == 'ajax' ) ) {
                                loadAjax();
                            } else if ( obj.data( 'type' ) == 'vimeo' ) {
                                loadVimeo();
                            } else if ( obj.data( 'type' ) == 'youtube' ) {
                                loadYoutube();
                            } else {
                                // Load as an image.
                                content.html( '<img src="' + dest + '">' );
                                preloadFirst();
                            }
                        } );

                        // Trigger the CSS opacity transition.
                        overlay.css( 'opacity', '1' );

                    }


                    // Handle positioning for iOS devices versus others.
                    if ( ios ) {

                        // For iOS, fix position and hide initially, then store scroll.
                        vwrap.css( {
                            'position': 'fixed',
                            'top': top,
                            'opacity': '0'
                        } ).data( 'top', top );

                    } else {

                        // For other devices, fix position and store scroll.
                        vwrap.css( {
                            'position': 'fixed',
                            'top': top
                        } ).data( 'top', top );

                        // Scroll to the top of the window.
                        $( window ).scrollTop( 0 );

                    }


                    /* -------- GALLERY NAVIGATION CHECK -------- */
                    // This function determines the state of gallery navigation (next/prev buttons, numbering).
                    function checknav() {

                        // Get gallery identifier and options from the current object.
                        thisgall = obj.data( 'gall' );
                        numeratio = obj.data( 'numeratio' );
                        infinigall = obj.data( 'infinigall' );

                        // Find all items belonging to the same gallery.
                        items = $( '.vbox-item[data-gall="' + thisgall + '"]' );


                        // Update numbering display if items exist and numeration is enabled.
                        if ( items.length > 0 && numeratio === true ) {

                            blocknum.html( items.index( obj ) + 1 + ' / ' + items.length );
                            blocknum.fadeIn();

                        } else {

                            blocknum.fadeOut();

                        }


                        // Determine the next and previous items in the gallery.
                        thenext = items.eq( items.index( obj ) + 1 );
                        theprev = items.eq( items.index( obj ) - 1 );


                        // Set the title for the current item.
                        if ( obj.attr( option.titleattr ) ) {

                            title = obj.attr( option.titleattr );
                            blocktitle.fadeIn();

                        } else {

                            title = '';
                            blocktitle.fadeOut();

                        }


                        // Handle infinite gallery logic.
                        if ( items.length > 0 && infinigall === true ) {

                            nextok = true; // Next is always available.
                            prevok = true; // Previous is always available.

                            // Wrap around for the next item.
                            if ( thenext.length < 1 ) {
                                thenext = items.eq( 0 ); // First item if at the end.
                            }

                            // Wrap around for the previous item.
                            if ( items.index( obj ) < 1 ) {
                                theprev = items.eq( items.length - 1 ); // Last item if at the beginning.
                            }

                        } else {

                            // Standard, non-infinite gallery navigation.
                            if ( thenext.length > 0 ) {
                                $( '.vbox-next' ).css( 'display', 'block' );
                                nextok = true; // Next is available.
                            } else {
                                $( '.vbox-next' ).css( 'display', 'none' );
                                nextok = false; // No next item.
                            }

                            if ( items.index( obj ) > 0 ) {
                                $( '.vbox-prev' ).css( 'display', 'block' );
                                prevok = true; // Previous is available.
                            } else {
                                $( '.vbox-prev' ).css( 'display', 'none' );
                                prevok = false; // No previous item.
                            }

                        }

                    } // End of checknav function.


                    /* -------- GALLERY NAVIGATION HANDLERS -------- */
                    // This object encapsulates the logic for navigating through gallery items.
                    var gallnav = {

                        // Function to navigate to the previous item.
                        prev: function() {

                            // Prevent multiple navigation actions if one is already in progress.
                            if ( keyNavigationDisabled ) {
                                return;
                            } else {
                                keyNavigationDisabled = true;
                            }

                            // Get options for the previous item.
                            overlayColor = theprev.data( 'overlay' );
                            framewidth = theprev.data( 'framewidth' );
                            frameheight = theprev.data( 'frameheight' );
                            border = theprev.data( 'border' );
                            bgcolor = theprev.data( 'bgcolor' );

                            // Update destination and title.
                            dest = theprev.attr( 'href' );

                            if ( theprev.attr( option.titleattr ) ) {
                                title = theprev.attr( option.titleattr );
                            } else {
                                title = '';
                            }

                            // Ensure overlay color is defined.
                            if ( overlayColor === undefined ) {
                                overlayColor = "";
                            }

                            // Set overlay min-height to current window height.
                            overlay.css( 'min-height', $( window ).outerHeight() );


                            // Animate content opacity to 0 before loading new content.
                            content.animate( { opacity: 0 }, 500, function() {

                                // Update overlay background and height.
                                overlay.css( 'min-height', $( window ).outerHeight() ).css( 'background', overlayColor );

                                // Load content based on the type of the previous item.
                                if ( theprev.data( 'type' ) == 'iframe' ) {
                                    loadIframe();
                                } else if ( theprev.data( 'type' ) == 'inline' ) {
                                    loadInline();
                                } else if ( theprev.data( 'type' ) == 'ajax' ) {
                                    loadAjax();
                                } else if ( theprev.data( 'type' ) == 'youtube' ) {
                                    loadYoutube();
                                } else if ( theprev.data( 'type' ) == 'vimeo' ) {
                                    loadVimeo();
                                } else {
                                    // Default to image.
                                    content.html( '<img src="' + dest + '">' );
                                    preloadFirst();
                                }

                                // Update the current object to the previous one.
                                obj = theprev;

                                // Re-evaluate navigation state.
                                checknav();

                                // Re-enable key navigation.
                                keyNavigationDisabled = false;

                            } );

                        }, // End of 'prev' function.


                        // Function to navigate to the next item.
                        next: function() {

                            // Prevent multiple navigation actions.
                            if ( keyNavigationDisabled ) {
                                return;
                            } else {
                                keyNavigationDisabled = true;
                            }

                            // Get options for the next item.
                            overlayColor = thenext.data( 'overlay' );
                            framewidth = thenext.data( 'framewidth' );
                            frameheight = thenext.data( 'frameheight' );
                            border = thenext.data( 'border' );
                            bgcolor = thenext.data( 'bgcolor' );

                            // Update destination and title.
                            dest = thenext.attr( 'href' );

                            if ( thenext.attr( option.titleattr ) ) {
                                title = thenext.attr( option.titleattr );
                            } else {
                                title = '';
                            }

                            // Ensure overlay color is defined.
                            if ( overlayColor === undefined ) {
                                overlayColor = "";
                            }

                            // Set overlay min-height.
                            overlay.css( 'min-height', $( window ).outerHeight() );


                            // Animate content opacity to 0.
                            content.animate( { opacity: 0 }, 500, function() {

                                // Update overlay background and height.
                                overlay.css( 'min-height', $( window ).outerHeight() ).css( 'background', overlayColor );

                                // Load content based on the type of the next item.
                                if ( thenext.data( 'type' ) == 'iframe' ) {
                                    loadIframe();
                                } else if ( thenext.data( 'type' ) == 'inline' ) {
                                    loadInline();
                                } else if ( thenext.data( 'type' ) == 'ajax' ) {
                                    loadAjax();
                                } else if ( thenext.data( 'type' ) == 'youtube' ) {
                                    loadYoutube();
                                } else if ( thenext.data( 'type' ) == 'vimeo' ) {
                                    loadVimeo();
                                } else {
                                    // Default to image.
                                    content.html( '<img src="' + dest + '">' );
                                    preloadFirst();
                                }

                                // Update the current object to the next one.
                                obj = thenext;

                                // Re-evaluate navigation state.
                                checknav();

                                // Re-enable key navigation.
                                keyNavigationDisabled = false;

                            } );

                        } // End of 'next' function.

                    }; // End of gallnav object.


                    /* -------- KEYBOARD NAVIGATION BINDING -------- */
                    // Attach a keydown event listener to the body for arrow key navigation.
                    $( 'body' ).keydown( function( e ) {

                        // Handle left arrow key press for previous item.
                        if ( e.keyCode == 37 && prevok == true ) { // ASCII code for left arrow.
                            gallnav.prev();
                        }

                        // Handle right arrow key press for next item.
                        if ( e.keyCode == 39 && nextok == true ) { // ASCII code for right arrow.
                            gallnav.next();
                        }

                    } );


                    /* -------- PREVIOUS BUTTON CLICK HANDLER -------- */
                    // Bind click event to the previous button.
                    $( '.vbox-prev' ).click( function() {
                        gallnav.prev();
                    } );


                    /* -------- NEXT BUTTON CLICK HANDLER -------- */
                    // Bind click event to the next button.
                    $( '.vbox-next' ).click( function() {
                        gallnav.next();
                    } );


                    /* -------- ESCAPE KEY HANDLER FUNCTION -------- */
                    // Defines the behavior when the Escape key is pressed.
                    function escapeHandler( e ) {
                        // If the pressed key is Escape (keyCode 27).
                        if ( e.keyCode === 27 ) {
                            closeVbox(); // Close the venobox.
                        }
                    }


                    /* -------- CLOSE VENOBOX FUNCTION -------- */
                    // Manages the process of closing the lightbox.
                    function closeVbox() {

                        // Unbind the escape key listener to prevent multiple calls.
                        $( 'body' ).unbind( 'keydown', escapeHandler );

                        if ( ie9 ) {

                            // For IE9, animate the overlay opacity to 0.
                            overlay.animate( { opacity: 0 }, 500, function() {
                                overlay.remove(); // Remove the overlay from the DOM.
                                $( '.vwrap' ).children().unwrap(); // Restore original body structure.
                                $( window ).scrollTop( -top ); // Restore original scroll position.
                                keyNavigationDisabled = false; // Re-enable key navigation.
                                obj.focus(); // Return focus to the original triggering element.
                            } );

                        } else {

                            // For modern browsers, unbind and rebind transition end for closing animation.
                            overlay.unbind( "transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd" );
                            overlay.bind( "transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function( e ) {

                                // Check if transition is on the overlay itself.
                                if ( e.target != e.currentTarget ) {
                                    return; // Ignore child transitions.
                                }

                                overlay.remove(); // Remove the overlay.

                                if ( ios ) {
                                    // For iOS, animate wrapper opacity before unwrapping.
                                    $( '.vwrap' ).bind( "transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function() {
                                        $( '.vwrap' ).children().unwrap(); // Restore body.
                                        $( window ).scrollTop( -top ); // Restore scroll.
                                    } );
                                    $( '.vwrap' ).css( 'opacity', '1' ); // Trigger wrapper transition.
                                } else {
                                    // For other devices, simply unwrap and restore scroll.
                                    $( '.vwrap' ).children().unwrap();
                                    $( window ).scrollTop( -top );
                                }

                                keyNavigationDisabled = false; // Re-enable key navigation.
                                obj.focus(); // Return focus to the original element.

                            } );

                            overlay.css( 'opacity', '0' ); // Trigger CSS opacity transition.

                        }

                    } // End of closeVbox function.


                    /* -------- CLOSE CLICK EVENT HANDLER -------- */
                    // Define the selectors for elements that, when clicked, will close the lightbox.
                    var closeclickclass = '.vbox-close, .vbox-overlay';

                    // If overlayclose option is false, only the close button will work.
                    if ( !obj.data( 'overlayclose' ) ) {
                        closeclickclass = '.vbox-close'; // Change selector to only include the close button.
                    }

                    // Attach click handler to the designated close elements.
                    $( closeclickclass ).click( function( e ) {

                        // Define elements that should NOT trigger a close when clicked.
                        evitacontent = '.figlio'; // The content inside the lightbox.
                        evitaprev = '.vbox-prev'; // The previous button.
                        evitanext = '.vbox-next'; // The next button.
                        figliall = '.figlio *'; // Any child element within the content.

                        // Check if the clicked element is not one of the "evita" elements.
                        if ( !$( e.target ).is( evitacontent ) &&
                             !$( e.target ).is( evitanext ) &&
                             !$( e.target ).is( evitaprev ) &&
                             !$( e.target ).is( figliall ) ) {

                            closeVbox(); // Close the lightbox.
                        }

                    } );

                    // Bind the escape key handler for the current lightbox instance.
                    $( 'body' ).keydown( escapeHandler );

                    return false; // Prevent default action and event propagation for the initial click.

                } ); // End of obj.click handler.

            } ); // End of this.each loop.

        } // End of venobox function.

    } ); // End of $.fn.extend.


    /* -------- LOAD AJAX CONTENT -------- */
    // Function to load content from an AJAX source.
    function loadAjax() {
        $.ajax( {
            url: dest, // The URL to fetch content from.
            cache: false // Prevent browser caching of the AJAX request.
        } ).done( function( msg ) {
            // On successful load, insert content into a wrapper.
            content.html( '<div class="vbox-inline">' + msg + '</div>' );
            updateoverlay( true ); // Update overlay and center content, with no scroll to top.

        } ).fail( function() {
            // On failure, display an error message.
            content.html( '<div class="vbox-inline"><p>Error retrieving contents, please retry</div>' );
            updateoverlay( true ); // Update overlay and center content, with no scroll to top.
        } );
    }


    /* -------- LOAD IFRAME CONTENT -------- */
    // Function to load content into an iframe.
    function loadIframe() {
        content.html( '<iframe class="venoframe" src="' + dest + '"></iframe>' );
        // The commented line below is typically for same-domain iframes.
        // $('.venoframe').load(function(){
        updateoverlay(); // Update overlay and center content.
        // });
    }


    /* -------- LOAD VIMEO VIDEO -------- */
    // Function to load a Vimeo video.
    function loadVimeo() {
        var pezzi = dest.split( '/' ); // Split the URL to extract video ID.
        var videoid = pezzi[ pezzi.length - 1 ]; // Get the last segment as video ID.
        content.html( '<iframe class="venoframe" src="//player.vimeo.com/video/' + videoid + '"></iframe>' );
        updateoverlay(); // Update overlay and center content.
    }


    /* -------- LOAD YOUTUBE VIDEO -------- */
    // Function to load a YouTube video.
    function loadYoutube() {
        var pezzi = dest.split( '/' ); // Split the URL to extract video ID.
        var videoid = pezzi[ pezzi.length - 1 ]; // Get the last segment as video ID.
        content.html( '<iframe class="venoframe" allowfullscreen src="//www.youtube.com/embed/' + videoid + '"></iframe>' );
        updateoverlay(); // Update overlay and center content.
    }


    /* -------- LOAD INLINE CONTENT -------- */
    // Function to load inline content from a hidden DOM element.
    function loadInline() {
        content.html( '<div class="vbox-inline">' + $( dest ).html() + '</div>' );
        updateoverlay(); // Update overlay and center content.
    }


    /* -------- PRELOAD IMAGE CONTENT -------- */
    // Function to preload the first image within the lightbox content.
    function preloadFirst() {
        prima = $( '.vbox-content' ).find( 'img' ); // Find the image element.
        prima.one( 'load', function() {
            // Execute updateoverlay once the image has loaded.
            updateoverlay();
        } ).each( function() {
            // For images that might already be cached/complete.
            if ( this.complete ) {
                $( this ).load();
            }
        } );
    }


    /* -------- CENTER OVERLAY CONTENT ON LOAD/UPDATE -------- */
    // Function to update the overlay's appearance and center its content.
    function updateoverlay( notopzero ) {

        notopzero = notopzero || false; // Default to false if not provided.

        // If notopzero is not true, scroll the window to the top.
        if ( notopzero != true ) {
            $( window ).scrollTop( 0 );
        }

        blocktitle.html( title ); // Set the title text.
        content.find( ">:first-child" ).addClass( 'figlio' ); // Add a class to the first child of content.

        // Apply width, height, padding, and background color to the content element.
        $( '.figlio' )
            .css( 'width', framewidth )
            .css( 'height', frameheight )
            .css( 'padding', border )
            .css( 'background', bgcolor );


        sonH = content.outerHeight(); // Get the outer height of the content.
        finH = $( window ).height(); // Get the height of the viewport.


        // Calculate vertical margin for centering if content is smaller than viewport.
        if ( sonH + 80 < finH ) { // Add some buffer (80px) for spacing.
            margine = ( finH - sonH ) / 2;
            content.css( 'margin-top', margine );
            content.css( 'margin-bottom', margine );
        } else {
            // If content is larger, apply fixed top/bottom margins.
            content.css( 'margin-top', '40px' );
            content.css( 'margin-bottom', '40px' );
        }

        // Animate the content to full opacity.
        content.animate( {
            'opacity': '1'
        }, 'slow' );

    } // End of updateoverlay function.

} )( jQuery ); // Pass jQuery object to the immediately invoked function expression.