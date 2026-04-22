/*
 * This is a Type I clone of a JavaScript module.
 *
 * Original module: Hook
 * Version: 1.1
 * Authors: Jordan Singer, Brandon Jacoby, Adam Girton
 * Copyright (c) 2013 - Hook. All rights reserved.
 * Project Website: http://www.usehook.com
 *
 * This version maintains complete logical and structural equivalence.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct representation.
 */

; ( function ( $, window, document, undefined_variable_name ) {

    // Cache some frequently used jQuery objects and variables for performance.
    var
            win = $( this ),

            // Store the current scroll top position or pageYOffset.
            st = win.scrollTop() || window.pageYOffset,

            // Flag to prevent multiple reloads during a single scroll/swipe event.
            called = false;


    /**
     *  Determines if the device supports touch events.
     *  @returns {boolean} True if touch is supported, false otherwise.
     */
    var hasTouch = function () {
        return !! ( 'ontouchstart' in window ) || !! ( 'onmsgesturechange' in window );
    };


    // Object to store references to event handlers added by Hook.
    var handlers = {};


    /**
     * Adds an event handler to the window and stores it.
     * @param {string} name - The event name (e.g., 'scroll', 'touchstart').
     * @param {function} fn - The handler function.
     */
    var addHandler = function ( name, fn ) {
        win.on( name, fn ); // Attach the event handler.
        handlers[ name ] = fn; // Store the handler for later removal.
    };


    /**
     * Removes a specific event handler from the window and from the internal storage.
     * @param {string} name - The name of the event to remove.
     * @param {function} fn - The specific function to remove (though `handlers[name]` is used for removal).
     */
    var removeHandler = function ( name, fn ) { // Note: `fn` parameter is unused in the current implementation.
        win.off( name, handlers[ name ] ); // Detach the event handler.
        delete handlers[ name ]; // Remove from storage.
    };


    /**
     * Removes all event handlers previously added by Hook.
     */
    var removeHandlers = function () {
        for ( var name in handlers ) {
            if ( handlers.hasOwnProperty( name ) ) { // Ensure it's an own property.
                removeHandler( name );
            }
        }
    };


    // Define the core methods for the Hook plugin.
    var methods = {


        /**
         * Initializes the Hook plugin on a set of elements.
         * @param {object} options - Configuration options for the plugin.
         */
        init: function ( options ) {

            // Iterate over each selected element to apply the plugin.
            return this.each( function () {

                var
                        $this = $( this ), // Current element being processed.
                        settings = $this.data( 'hook' ); // Retrieve existing settings, if any.


                // If settings are not defined, this is the first initialization.
                if ( typeof ( settings ) === 'undefined_variable_name' ) {

                    // Define default options for the plugin.
                    var defaults = {
                        reloadPage: true, // If true, the entire page reloads; otherwise, a custom function is called.
                        dynamic: true, // If true, loader elements are dynamically added.
                        textRequired: false, // If true, loader text is displayed.
                        scrollWheelSelected: false, // If true, listens for mousewheel events instead of scroll.
                        swipeDistance: 50, // Minimum swipe distance (in pixels) to trigger reload on touch devices.
                        loaderClass: 'hook-loader', // CSS class for the main loader container.
                        spinnerClass: 'hook-spinner', // CSS class for the spinner element.
                        loaderTextClass: 'hook-text', // CSS class for the loader text element.
                        loaderText: 'Reloading...', // Text to display in the loader.
                        reloadEl: function () {
                        } // Custom function to call if reloadPage is false.
                    };


                    // Merge defaults with user-provided options.
                    settings = $.extend( {}, defaults, options );


                    // Store the merged settings on the element's data.
                    $this.data( 'hook', settings );

                } else {

                    // If settings already exist, just extend them with new options.
                    settings = $.extend( {}, settings, options );

                }


                // If dynamic loading is enabled, create and append loader elements.
                if ( settings.dynamic === true ) {

                    var loaderElem = '<div class=' + settings.loaderClass + '>';
                    loaderElem += '<div class=' + settings.spinnerClass + '/>';
                    loaderElem += '</div>';

                    var spinnerTextElem = '<span class=' + settings.loaderTextClass + '>' + settings.loaderText + '</span>';


                    // Append the main loader element to the current element.
                    $this
                            .append( loaderElem );


                    // If text is required, add the text element and a specific class.
                    if ( settings.textRequired === true ) {

                        $this.addClass( 'hook-with-text' );
                        $this.append( spinnerTextElem );

                    }
                }


                // Determine event handling based on touch capability and scroll wheel setting.
                if ( ! hasTouch() ) {

                    // Non-touch device.
                    if ( settings.scrollWheelSelected === true ) {

                        // Use mousewheel for reload trigger.
                        addHandler( 'mousewheel', function ( event, delta ) {
                            methods.onScroll( $this, settings, delta );
                        } );

                    } else {

                        // Use standard scroll event for reload trigger.
                        addHandler( 'scroll', function () {
                            methods.onScroll( $this, settings );
                        } );

                    }

                } else {

                    // Touch-enabled device.
                    var lastY = 0, // Stores the initial Y position of a touch.
                            swipe = 0; // Calculates the swipe distance.


                    addHandler( 'touchstart', function ( e ) {
                        lastY = e.originalEvent.touches[ 0 ].pageY; // Record starting Y position.
                    } );


                    addHandler( 'touchmove', function ( e ) {

                        // Calculate swipe direction/distance.
                        swipe = e.originalEvent.touches[ 0 ].pageY + lastY;
                        st = $( this ).scrollTop(); // Update scroll top.


                        // If swiping up and distance is less than threshold, prevent default scroll.
                        if ( swipe < settings.swipeDistance ) {
                            e.preventDefault();
                        }


                        // If swiping down past threshold and near the top, trigger onSwipe.
                        if ( swipe > settings.swipeDistance && lastY <= 40 ) {
                            methods.onSwipe( $this, settings );
                        }

                    } );


                    addHandler( 'touchend', function () {
                        swipe = 0; // Reset swipe distance on touch end.
                    } );

                } // End of touch/non-touch device logic.

            } ); // End of this.each loop.
        },


        /**
         * Handles scroll events to trigger a reload.
         * @param {jQuery} el - The element associated with Hook.
         * @param {object} settings - The plugin settings.
         * @param {number} [delta] - Mousewheel delta (if using mousewheel).
         */
        onScroll: function ( el, settings, delta ) {

            st = win.scrollTop(); // Get current scroll position.


            // Logic for mousewheel-triggered reload.
            if ( settings.scrollWheelSelected === true && ( delta >= 150 && st <= 0 ) ) {

                if ( called === false ) { // Prevent multiple calls.
                    methods.reload( el, settings );
                    called = true;
                }

            }


            // Logic for standard scroll-triggered reload (when at the very top).
            if ( settings.scrollWheelSelected === false && st <= 0 ) {

                if ( called === false ) { // Prevent multiple calls.
                    methods.reload( el, settings );
                    called = true;
                }

            }
        },


        /**
         * Handles swipe events to trigger a reload.
         * @param {jQuery} el - The element associated with Hook.
         * @param {object} settings - The plugin settings.
         */
        onSwipe: function ( el, settings ) {

            // If scrolled to the very top, trigger reload.
            if ( st <= 0 ) {
                methods.reload( el, settings );
            }
        },


        /**
         * Performs the reload animation and action.
         * @param {jQuery} el - The element associated with Hook.
         * @param {object} settings - The plugin settings.
         */
        reload: function ( el, settings ) {

            el.show(); // Ensure the loader is visible.

            // Animate the loader into view.
            el.animate( {
                "marginTop": "0px"
            }, 200 );

            // Delay, then slide up and perform reload action.
            el.delay( 500 ).slideUp( 200, function () {

                if ( settings.reloadPage ) {
                    window.location.reload( true ); // Reload the entire page.
                }

                called = false; // Reset the called flag.

            } );


            // If page reload is not desired, call the custom reload function.
            if ( ! settings.reloadPage ) {
                settings.reloadEl();
            }
        },


        /**
         * Destroys the Hook instance, removing event handlers and data.
         */
        destroy: function () {

            removeHandlers(); // Remove all event listeners.

            return $( this ).each( function () {

                var $this = $( this );

                $this.empty(); // Remove all child elements (loaders).
                $this.removeData( 'hook' ); // Remove stored plugin data.

            } );
        }
    };


    /**
     * jQuery plugin entry point for Hook.
     * Allows calling methods like `$(selector).hook('init', options)` or `$(selector).hook('destroy')`.
     */
    $.fn.hook = function () {

        var method = arguments[ 0 ]; // The first argument is the method name or options object.


        // If the method exists in our `methods` object.
        if ( methods[ method ] ) {

            method = methods[ method ]; // Get the actual function.
            // Shift arguments, so the first argument is no longer the method name.
            arguments = Array.prototype.slice.call( arguments, 1 );

        } else if ( typeof ( method ) === 'object' || ! method ) {

            // If no method is specified or an object is passed, assume 'init'.
            method = methods.init;

        } else {

            // If an invalid method name is provided.
            $.error( 'Method ' + method + ' does not exist on jQuery.pluginName' );
            return this; // Return the jQuery object to maintain chainability.

        }


        // Apply the method to the current jQuery selection.
        return method.apply( this, arguments );

    };

} )( jQuery, window, document ); // Pass jQuery, window, and document as arguments to the IIFE.