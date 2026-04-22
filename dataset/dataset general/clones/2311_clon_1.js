/*
 *  Swipebox v1.3.0.2 - A touch-enabled jQuery lightbox
 *  Original Author: Constantin Saguin (csag.co)
 *  License: MIT
 *  Project: github.com/brutaldesign/swipebox
 */
/*
 *  Modifications by: Thomas Meyer (http://dreihochzwo.de)
 *  This section contains custom adjustments.
 */
// Immediately Invoked Function Expression (IIFE) for scope isolation.
; ( function ( window, document, $, undefined ) { // Start of the main plugin definition.

    // Main plugin entry point.
    $.swipebox = function ( elem, options ) {

        // Define default configuration options for the plugin.
        var ui, // User Interface object, defined later.
            defaults = {
                useCSS                  : true,  // Enable CSS transitions if supported.
                useSVG                  : true,  // Use SVG icons if browser supports them.
                initialIndexOnArray     : 0,     // Starting slide index when an array is passed.
                hideCloseButtonOnMobile : false, // Do not show close button on mobile devices.
                hideBarsDelay           : 3000,  // Delay in milliseconds to hide top/bottom bars.
                videoMaxWidth           : 1140,  // Maximum width for embedded videos.
                vimeoColor              : 'cccccc', // Color for Vimeo player controls.
                beforeOpen              : null,  // Callback function executed before opening the lightbox.
                afterOpen               : null,  // Callback function executed after opening the lightbox.
                afterClose              : null,  // Callback function executed after closing the lightbox.
                loopAtEnd               : false, // Allow looping from last to first slide and vice-versa.
                autoplayVideos          : false  // Automatically play videos when opened.
            }, // End of default options.

            plugin        = this, // Reference to the plugin instance.
            elements      = [],   // Array to store slide data (href, title).
            $elem,                // jQuery object of the elements linked to the lightbox.
            selector      = elem.selector, // Original selector string.
            $selector     = $( selector ), // jQuery object of all elements matching the selector.
            // Detect mobile devices based on user agent string.
            isMobile      = navigator.userAgent.match( /(iPad)|(iPhone)|(iPod)|(Android)|(PlayBook)|(BB10)|(BlackBerry)|(Opera Mini)|(IEMobile)|(webOS)|(MeeGo)/i ),
            // Determine if the device supports touch input.
            isTouch       = isMobile !== null || document.createTouch !== undefined || ( 'ontouchstart' in window ) || ( 'onmsgesturechange' in window ) || navigator.msMaxTouchPoints,
            // Check for SVG support by attempting to create an SVG element.
            supportSVG    = !! document.createElementNS && !! document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' ).createSVGRect,
            // Get current window width, fallback to jQuery for older browsers.
            winWidth      = window.innerWidth ? window.innerWidth : $( window ).width(),
            // Get current window height, fallback to jQuery for older browsers.
            winHeight     = window.innerHeight ? window.innerHeight : $( window ).height(),
            currentX      = 0, // Current X position for slider translation.
            /* jshint multistr: true */ // JSHint directive to allow multi-line strings.
            // HTML structure for the swipebox overlay and its components.
            html          = '<div id="swipebox-overlay">' +
                            '<div id="swipebox-container">' +
                            '<div id="swipebox-slider"></div>' +
                            '<div id="swipebox-top-bar">' +
                            '<div id="swipebox-title"></div>' +
                            '</div>' +
                            '<div id="swipebox-bottom-bar">' +
                            '<div id="swipebox-arrows">' +
                            '<a id="swipebox-prev"></a>' +
                            '<a id="swipebox-next"></a>' +
                            '</div>' +
                            '</div>' +
                            '<a id="swipebox-close"></a>' +
                            '</div>' +
                            '</div>'; // End of html string.

        // Initialize an empty settings object for the plugin instance.
        plugin.settings = {};

        // Expose a public method to close the swipebox.
        $.swipebox.close = function () {
            ui.closeSlide(); // Delegates to the internal UI close method.
        };

        // Provide a public method to access the internal UI object for advanced extensions.
        $.swipebox.extend = function () {
            return ui; // Returns the internal UI object.
        };

        // Main initialization function for the plugin.
        plugin.init = function () {

            // Merge default options with user-provided options.
            plugin.settings = $.extend( {}, defaults, options );

            // Check if the 'elem' argument is an array of elements.
            if ( $.isArray( elem ) ) {

                elements    = elem; // Use the provided array as slide elements.
                ui.target   = $( window ); // Set target to window if using an array.
                // Initialize UI with the specified initial index.
                ui.init( plugin.settings.initialIndexOnArray );

            } else { // 'elem' is a selector string.

                // Attach a click event listener to the specified selector.
                $( document ).on( 'click', selector, function ( event ) {

                    // console.log( isTouch ); // Debugging line, can be removed.

                    // Prevent re-opening if already on the current slide.
                    if ( event.target.parentNode.className === 'slide current' ) {

                        return false; // Stop further execution.
                    }

                    // If not an array, destroy existing instances and re-initialize.
                    if ( ! $.isArray( elem ) ) {
                        ui.destroy(); // Destroy any previous swipebox instance.
                        $elem = $( selector ); // Re-select elements.
                        ui.actions(); // Re-bind actions.
                    }

                    elements = []; // Clear previous elements.
                    var index, relType, relVal; // Declare variables for element parsing.

                    // Prioritize HTML5 'data-rel' attribute over legacy 'rel'.
                    if ( ! relVal ) {
                        relType = 'data-rel'; // Set attribute type to data-rel.
                        relVal  = $( this ).attr( relType ); // Get value from data-rel.
                    }

                    // Fallback to 'rel' attribute if 'data-rel' is not found.
                    if ( ! relVal ) {
                        relType = 'rel'; // Set attribute type to rel.
                        relVal  = $( this ).attr( relType ); // Get value from rel.
                    }

                    // Filter elements by 'rel' or 'data-rel' attribute if present and valid.
                    if ( relVal && relVal !== '' && relVal !== 'nofollow' ) {
                        $elem = $selector.filter( '[' + relType + '="' + relVal + '"]' );
                    } else {
                        $elem = $( selector ); // If no rel attribute, use all elements matching selector.
                    }

                    // Iterate over selected elements to build the 'elements' array.
                    $elem.each( function () {

                        var title = null, // Initialize title.
                            href  = null; // Initialize href.

                        // Get title from 'data-title' attribute.
                        if ( $( this ).attr( 'data-title' ) ) {
                            title = $( this ).attr( 'data-title' );
                        }

                        // Get href from 'href' attribute.
                        if ( $( this ).attr( 'href' ) ) {
                            href = $( this ).attr( 'href' );
                        }

                        // Add the element's data to the elements array.
                        elements.push( {
                            href  : href,
                            title : title
                        } );
                    } );

                    // Determine the index of the clicked element within the filtered set.
                    index = $elem.index( $( this ) );
                    event.preventDefault(); // Prevent default link behavior.
                    event.stopPropagation(); // Stop event propagation.
                    ui.target = $( event.target ); // Set the UI target to the clicked element.
                    ui.init( index ); // Initialize the UI with the selected slide index.
                } ); // End of click event handler.
            } // End of if/else for 'elem' type.
        }; // End of plugin.init function.

        // UI object containing all core functionalities of the swipebox.
        ui = {

            /**
             * Initiate Swipebox UI
             * @param {number} index - The initial slide index to open.
             */
            init : function ( index ) {
                // Execute 'beforeOpen' callback if defined in settings.
                if ( plugin.settings.beforeOpen ) {
                    plugin.settings.beforeOpen();
                }

                // Trigger a custom event indicating swipebox is starting.
                this.target.trigger( 'swipebox-start' );
                $.swipebox.isOpen = true; // Set global flag that swipebox is open.
                this.build(); // Construct the necessary HTML elements.
                this.openSlide( index ); // Open the specified slide.
                this.openMedia( index ); // Load media for the specified slide.
                this.preloadMedia( index + 1 ); // Preload the next slide's media.
                this.preloadMedia( index - 1 ); // Preload the previous slide's media.

                // Execute 'afterOpen' callback if defined in settings.
                if ( plugin.settings.afterOpen ) {
                    plugin.settings.afterOpen();
                }
            }, // End of ui.init.

            /**
             * Build HTML containers and initialize main functions.
             * This method appends the main HTML structure to the body
             * and performs initial setup.
             */
            build : function () {
                var $this = this, // Cache 'this' for use in nested functions.
                    bg;           // Variable to hold background image path.

                $( 'body' ).append( html ); // Append the main swipebox HTML to the document body.

                // Check for SVG support and if SVG usage is enabled in settings.
                if ( supportSVG && plugin.settings.useSVG === true ) {
                    bg = $( '#swipebox-close' ).css( 'background-image' ); // Get current background image.
                    bg = bg.replace( 'png', 'svg' ); // Replace .png extension with .svg.
                    // Apply SVG background images to navigation and close buttons.
                    $( '#swipebox-prev, #swipebox-next, #swipebox-close' ).css( {
                        'background-image' : bg
                    } );
                }

                // If on a mobile device, remove top and bottom bars (they are handled by gestures).
                if ( isMobile ) {
                    $( '#swipebox-bottom-bar, #swipebox-top-bar' ).remove();
                }

                // For each element, append a new slide div to the slider container.
                $.each( elements, function () {
                    $( '#swipebox-slider' ).append( '<div class="slide"></div>' );
                } );

                $this.setDim();    // Set initial dimensions for the swipebox.
                $this.actions();   // Attach event listeners for navigation actions.

                // If touch input is detected, enable gesture navigation.
                if ( isTouch ) {
                    $this.gesture();
                }

                // Devices can have both touch and keyboard input, so always allow keyboard events.
                $this.keyboard(); // Bind keyboard navigation events.

                $this.animBars(); // Initialize animation for the bars.
                $this.resize();   // Bind resize event handler.

            }, // End of ui.build.

            /**
             * Set dimensions of the swipebox overlay based on current window size.
             * This function is crucial for responsive behavior.
             */
            setDim : function () {

                var width,                     // Variable to store calculated width.
                    height,                    // Variable to store calculated height.
                    sliderCss = {};            // Object to hold CSS properties for the slider.

                // Special handling for mobile devices that support orientation change events.
                if ( 'onorientationchange' in window ) {

                    // Add an event listener for orientation changes.
                    window.addEventListener( 'orientationchange', function () {
                        // Adjust width and height based on new orientation.
                        if ( window.orientation === 0 ) { // Portrait mode.
                            width  = winWidth;
                            height = winHeight;
                        } else if ( window.orientation === 90 || window.orientation === -90 ) { // Landscape mode.
                            width  = winHeight;
                            height = winWidth;
                        }
                    }, false ); // Use capture phase for event.


                } else { // For desktop browsers or devices without 'onorientationchange'.

                    width  = window.innerWidth ? window.innerWidth : $( window ).width();   // Get viewport width.
                    height = window.innerHeight ? window.innerHeight : $( window ).height(); // Get viewport height.
                }

                // Prepare CSS object with calculated dimensions.
                sliderCss = {
                    width  : width,
                    height : height
                };

                // Apply the calculated dimensions to the main overlay element.
                $( '#swipebox-overlay' ).css( sliderCss );

            }, // End of ui.setDim.

            /**
             * Reset dimensions on window resize event.
             * This ensures the lightbox adapts to browser window changes.
             */
            resize : function () {
                var $this = this; // Cache 'this' context.

                // Bind the 'setDim' method to the window's resize event.
                $( window ).resize( function () {
                    $this.setDim(); // Call setDim whenever the window is resized.
                } ).resize(); // Trigger resize immediately on load to set initial dimensions.
            }, // End of ui.resize.

            /**
             * Detects if the browser supports CSS transitions.
             * This helps determine whether to use CSS animations or jQuery fallbacks.
             * @returns {string|boolean} The supported transition property name, or false if not supported.
             */
            supportTransition : function () {

                // Array of common CSS transition prefixes.
                var prefixes = 'transition WebkitTransition MozTransition OTransition msTransition KhtmlTransition'.split( ' ' ),
                    i; // Loop counter.

                // Iterate through prefixes to find a supported transition property.
                for ( i = 0; i < prefixes.length; i++ ) {
                    // Check if the property exists in a dummy div's style.
                    if ( document.createElement( 'div' ).style[ prefixes[i] ] !== undefined ) {
                        return prefixes[i]; // Return the first supported prefix.
                    }
                }
                return false; // No transition support found.
            }, // End of ui.supportTransition.

            /**
             * Determines if CSS transitions should be used based on plugin settings and browser support.
             * @returns {boolean} True if CSS transitions are enabled and supported, false otherwise.
             */
            doCssTrans : function () {
                // Check if plugin settings allow CSS and if the browser supports it.
                if ( plugin.settings.useCSS && this.supportTransition() ) {
                    return true;
                }
                return false; // Explicitly return false if conditions are not met.
            }, // End of ui.doCssTrans.

            /**
             * Implements touch-based navigation (swiping gestures).
             * This handles both horizontal (slide change) and vertical (close) swipes.
             */
            gesture : function () {

                var $this            = this, // Cache 'this' for internal use.
                    index,                  // Current slide index.
                    hDistance,              // Horizontal distance moved during touch.
                    vDistance,              // Vertical distance moved during touch.
                    hDistanceLast,          // Last recorded horizontal distance.
                    vDistanceLast,          // Last recorded vertical distance.
                    hDistancePercent,       // Horizontal distance as a percentage of window width.
                    vSwipe           = false, // Flag for vertical swipe.
                    hSwipe           = false, // Flag for horizontal swipe.
                    hSwipMinDistance = 10,    // Minimum horizontal distance for a valid swipe.
                    vSwipMinDistance = 50,    // Minimum vertical distance for a valid swipe (to close).
                    startCoords      = {},    // Stores initial touch coordinates.
                    endCoords        = {},    // Stores final/current touch coordinates.
                    bars             = $( '#swipebox-top-bar, #swipebox-bottom-bar' ), // Top and bottom bars.
                    slider           = $( '#swipebox-slider' ); // The slide container.

                // Initially make bars visible and start the timeout to hide them.
                bars.addClass( 'visible-bars' );
                $this.setTimeout(); // Start timer to hide bars.

                // Bind 'touchstart' event to the body.
                $( 'body' ).bind( 'touchstart', function ( event ) {

                    $( this ).addClass( 'touching' ); // Add a class to indicate touch interaction.
                    // Get the index of the currently active slide.
                    index = $( '#swipebox-slider .slide' ).index( $( '#swipebox-slider .slide.current' ) );
                    // Record initial touch coordinates.
                    endCoords         = event.originalEvent.targetTouches[0];
                    startCoords.pageX = event.originalEvent.targetTouches[0].pageX;
                    startCoords.pageY = event.originalEvent.targetTouches[0].pageY;

                    // Apply initial transform to the slider.
                    $( '#swipebox-slider' ).css( {
                        '-webkit-transform' : 'translate3d(' + currentX + '%, 0, 0)',
                        'transform'         : 'translate3d(' + currentX + '%, 0, 0)'
                    } );

                    // Bind 'touchmove' event when touching.
                    $( '.touching' ).bind( 'touchmove', function ( event ) {
                        event.preventDefault();    // Prevent default scrolling behavior.
                        event.stopPropagation();   // Stop event from bubbling up.
                        endCoords = event.originalEvent.targetTouches[0]; // Update current touch coordinates.

                        // Handle vertical swipe for closing.
                        if ( ! hSwipe ) { // Only consider vertical if no horizontal swipe yet.
                            vDistanceLast = vDistance;
                            vDistance     = endCoords.pageY - startCoords.pageY;
                            if ( Math.abs( vDistance ) >= vSwipMinDistance || vSwipe ) {
                                var opacity = 0.75 - Math.abs( vDistance ) / slider.height(); // Calculate opacity.

                                slider.css( { 'top': vDistance + 'px' } ); // Move slider vertically.
                                slider.css( { 'opacity': opacity } );      // Adjust opacity.

                                vSwipe = true; // Mark as vertical swipe.
                            }
                        }

                        // Handle horizontal swipe for changing slides.
                        hDistanceLast    = hDistance;
                        hDistance        = endCoords.pageX - startCoords.pageX;
                        hDistancePercent = hDistance * 100 / winWidth; // Calculate percentage.

                        // If neither horizontal nor vertical swipe is active, check for horizontal threshold.
                        if ( ! hSwipe && ! vSwipe && Math.abs( hDistance ) >= hSwipMinDistance ) {
                            $( '#swipebox-slider' ).css( {
                                '-webkit-transition' : '', // Clear transition for immediate movement.
                                'transition'         : ''
                            } );
                            hSwipe = true; // Mark as horizontal swipe.
                        }

                        // If horizontal swipe is active, update slider position.
                        if ( hSwipe ) {

                            // Swiping to the right (positive hDistance).
                            if ( 0 < hDistance ) {

                                // If it's the first slide, show a "spring" effect.
                                if ( 0 === index ) {
                                    // console.log( 'first' ); // Debugging.
                                    $( '#swipebox-overlay' ).addClass( 'leftSpringTouch' );
                                } else {
                                    // Remove spring effects and follow gesture.
                                    $( '#swipebox-overlay' ).removeClass( 'leftSpringTouch' ).removeClass( 'rightSpringTouch' );
                                    $( '#swipebox-slider' ).css( {
                                        '-webkit-transform' : 'translate3d(' + ( currentX + hDistancePercent ) + '%, 0, 0)',
                                        'transform'         : 'translate3d(' + ( currentX + hDistancePercent ) + '%, 0, 0)'
                                    } );
                                }

                            // Swiping to the left (negative hDistance).
                            } else if ( 0 > hDistance ) {

                                // If it's the last slide, show a "spring" effect.
                                if ( elements.length === index + 1 ) {
                                    // console.log( 'last' ); // Debugging.
                                    $( '#swipebox-overlay' ).addClass( 'rightSpringTouch' );
                                } else {
                                    // Remove spring effects and follow gesture.
                                    $( '#swipebox-overlay' ).removeClass( 'leftSpringTouch' ).removeClass( 'rightSpringTouch' );
                                    $( '#swipebox-slider' ).css( {
                                        '-webkit-transform' : 'translate3d(' + ( currentX + hDistancePercent ) + '%, 0, 0)',
                                        'transform'         : 'translate3d(' + ( currentX + hDistancePercent ) + '%, 0, 0)'
                                    } );
                                }

                            } // End of hDistance conditions.
                        } // End of if hSwipe.
                    } ); // End of 'touchmove' handler.

                    return false; // Prevent default browser touch actions.

                } ).bind( 'touchend', function ( event ) { // Bind 'touchend' event to the body.
                    event.preventDefault();    // Prevent default browser actions.
                    event.stopPropagation();   // Stop event propagation.

                    // Re-enable CSS transitions for smooth snap-back or slide change.
                    $( '#swipebox-slider' ).css( {
                        '-webkit-transition' : '-webkit-transform 0.4s ease',
                        'transition'         : 'transform 0.4s ease'
                    } );

                    // Recalculate final distances.
                    vDistance        = endCoords.pageY - startCoords.pageY;
                    hDistance        = endCoords.pageX - startCoords.pageX;
                    hDistancePercent = hDistance * 100 / winWidth;

                    // Handle outcome of a vertical swipe.
                    if ( vSwipe ) {
                        vSwipe = false; // Reset vertical swipe flag.
                        // If vertical swipe was significant and accelerating, close the slide.
                        if ( Math.abs( vDistance ) >= 2 * vSwipMinDistance && Math.abs( vDistance ) > Math.abs( vDistanceLast ) ) {
                            var vOffset = vDistance > 0 ? slider.height() : - slider.height(); // Determine close direction.
                            slider.animate( { top: vOffset + 'px', 'opacity': 0 }, // Animate slide out.
                                300, // Animation duration.
                                function () {
                                    $this.closeSlide(); // Close the lightbox after animation.
                                } );
                        } else {
                            slider.animate( { top: 0, 'opacity': 1 }, 300 ); // Snap back to original position.
                        }

                    } else if ( hSwipe ) { // Handle outcome of a horizontal swipe.

                        hSwipe = false; // Reset horizontal swipe flag.

                        // Swipe to previous slide if conditions met.
                        if ( hDistance >= hSwipMinDistance && hDistance >= hDistanceLast ) {

                            $this.getPrev(); // Go to previous slide.

                        // Swipe to next slide if conditions met.
                        } else if ( hDistance <= -hSwipMinDistance && hDistance <= hDistanceLast ) {

                            $this.getNext(); // Go to next slide.
                        }

                    } else { // No significant swipe detected, likely a tap.
                        // On touch devices, bars are removed, so tapping toggles their visibility.
                        // If bars are not visible, show them and restart timeout.
                        if ( ! bars.hasClass( 'visible-bars' ) ) {
                            $this.showBars();
                            $this.setTimeout();
                        } else { // If bars are visible, hide them and clear timeout.
                            $this.clearTimeout();
                            $this.hideBars();
                        }
                    }

                    // Ensure slider snaps back to correct position after touch.
                    $( '#swipebox-slider' ).css( {
                        '-webkit-transform' : 'translate3d(' + currentX + '%, 0, 0)',
                        'transform'         : 'translate3d(' + currentX + '%, 0, 0)'
                    } );

                    // Remove spring effects and touch classes.
                    $( '#swipebox-overlay' ).removeClass( 'leftSpringTouch' ).removeClass( 'rightSpringTouch' );
                    $( '.touching' ).off( 'touchmove' ).removeClass( 'touching' ); // Unbind touchmove and remove class.

                } ); // End of 'touchend' handler.
            }, // End of ui.gesture.

            /**
             * Sets a timer to automatically hide the action bars (top and bottom).
             * The delay is configurable via plugin settings.
             */
            setTimeout : function () {
                // Only set timeout if hideBarsDelay is greater than 0.
                if ( plugin.settings.hideBarsDelay > 0 ) {
                    var $this = this; // Cache 'this' context.
                    $this.clearTimeout(); // Clear any existing timeout before setting a new one.
                    // Set a new timeout to hide the bars.
                    $this.timeout = window.setTimeout( function () {
                            $this.hideBars(); // Call the hideBars function after the delay.
                        },
                        plugin.settings.hideBarsDelay // Use the configured delay.
                    ); // End of setTimeout call.
                } // End of if hideBarsDelay > 0.
            }, // End of ui.setTimeout.

            /**
             * Clears any active timeout that would hide the action bars.
             * This is useful when user interaction occurs.
             */
            clearTimeout : function () {
                window.clearTimeout( this.timeout ); // Clear the JavaScript timeout.
                this.timeout = null; // Reset the timeout reference.
            }, // End of ui.clearTimeout.

            /**
             * Makes the navigation and title bars visible.
             * Uses CSS transitions if supported, otherwise falls back to jQuery animation.
             */
            showBars : function () {
                var bars = $( '#swipebox-top-bar, #swipebox-bottom-bar' ); // Select both bars.
                if ( this.doCssTrans() ) { // Check if CSS transitions are enabled and supported.
                    bars.addClass( 'visible-bars' ); // Use CSS class for transition.
                } else { // Fallback to jQuery animate.
                    $( '#swipebox-top-bar' ).animate( { top : 0 }, 500 );       // Animate top bar down.
                    $( '#swipebox-bottom-bar' ).animate( { bottom : 0 }, 500 ); // Animate bottom bar up.
                    // Add class after animation for proper styling.
                    setTimeout( function () {
                        bars.addClass( 'visible-bars' );
                    }, 1000 ); // Delay to ensure animation completes.
                } // End of if/else for CSS transition.
            }, // End of ui.showBars.

            /**
             * Hides the navigation and title bars.
             * Uses CSS transitions if supported, otherwise falls back to jQuery animation.
             */
            hideBars : function () {
                var bars = $( '#swipebox-top-bar, #swipebox-bottom-bar' ); // Select both bars.
                if ( this.doCssTrans() ) { // Check if CSS transitions are enabled and supported.
                    bars.removeClass( 'visible-bars' ); // Remove CSS class to hide bars via transition.
                } else { // Fallback to jQuery animate.
                    $( '#swipebox-top-bar' ).animate( { top : '-50px' }, 500 );    // Animate top bar up.
                    $( '#swipebox-bottom-bar' ).animate( { bottom : '-50px' }, 500 ); // Animate bottom bar down.
                    // Remove class after animation for proper styling.
                    setTimeout( function () {
                        bars.removeClass( 'visible-bars' );
                    }, 1000 ); // Delay to ensure animation completes.
                } // End of if/else for CSS transition.
            }, // End of ui.hideBars.

            /**
             * Initializes the animation behavior for the top and bottom bars.
             * This method likely sets up initial states or event bindings related to bar animations.
             */
            animBars : function () {
                // The body of this function was not provided in the original snippet.
                // Assuming it contains logic to handle bar animations or states.
            } // End of ui.animBars.

            // Other UI methods would typically follow here, e.g., openSlide, closeSlide, getNext, getPrev, etc.

        }; // End of ui object.

        // Initialize the plugin instance after defining all methods.
        // This call starts the plugin's functionality.
        plugin.init();

    }; // End of $.swipebox function definition.

})( window, document, jQuery ); // Pass global objects and jQuery to the IIFE for performance and scope.