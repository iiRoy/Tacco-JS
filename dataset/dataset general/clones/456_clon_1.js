// This file contains the JavaScript code for the jQuery.plainModal plugin.
// It provides functionality for creating simple, accessible modal dialogs.
//
// Project home: https://github.com/anseki/jquery-plainmodal
//
// Original Author: anseki
// License: MIT (https://opensource.org/licenses/MIT)

;
( function($, undefined) {
    'use strict';

    // Define core application constants.
    var APP_NAME = 'plainModal'
      , APP_PREFIX = APP_NAME.toLowerCase();

    // Event type constants for custom events.
    var EVENT_TYPE_OPEN = APP_PREFIX + 'open'
      , EVENT_TYPE_CLOSE = APP_PREFIX + 'close'
      , EVENT_TYPE_BEFOREOPEN = APP_PREFIX + 'beforeopen'
      , EVENT_TYPE_BEFORECLOSE = APP_PREFIX + 'beforeclose';

    /*
     * Global state variable for the currently opened modal.
     *
     * - If `jqOpened` is `null`, no modal is currently open.
     * - If `jqOpened` is `0`, a modal is in the process of fading in/out.
     * - If `jqOpened` is a jQuery object, that modal is fully opened.
     */
    var jqOpened = null;

    // Additional global variables to manage modal state and DOM elements.
    var lockAction, jqNextOpen, jqFading;
    var jqWin, jqBody, jqOverlay, jqActive, jq1st;
    var orgOverflow, orgMarginR, orgMarginB;
    var winLeft, winTop;


    /**
     * Initializes the plainModal plugin for a given set of jQuery elements.
     * This function sets up options, attaches necessary event handlers,
     * and prepares the elements for modal functionality.
     *
     * @param {jQuery} jq - The jQuery object representing the elements to initialize.
     * @param {object} options - Configuration options for the modal.
     * @returns {jQuery} The original jQuery object for chaining.
     */
    function init(jq, options) {
        // The options object is shared across all elements if `jq` contains multiple.
        // Therefore, properties should not be modified directly after this point.
        // If changes are needed, a new options object should be created.
        var opt = $.extend( true, {
            duration:       200, // Default animation duration in milliseconds.
            effect:         { open: $.fn.fadeIn, close: $.fn.fadeOut }, // Default fade effects.
            overlay:        { opacity: 0.6, zIndex: 9000 }, // Default overlay styles.
            closeClass:     APP_PREFIX + '-close' // Class for elements that close the modal.
            // Optional properties: offset (positioning), open (callback), close (callback)
        }, options );

        // Handle alias for overlay fill color.
        opt.overlay.fillColor = opt.overlay.fillColor || opt.overlay.color /* alias */ || '#888';
        // Calculate z-index for the modal, ensuring it's above the overlay.
        opt.zIndex = opt.zIndex || opt.overlay.zIndex + 1;

        // Perform page-level initialization only once.
        if ( !jqWin ) {
            // Cache jQuery window and body objects.
            jqWin = $( window );
            jqBody = $( 'body' );

            // Create and append the overlay element.
            jqOverlay = $( '<div class="' + APP_PREFIX + '-overlay" />' )
                .css({
                    position:       'fixed',
                    left:           0,
                    top:            0,
                    width:          '100%',
                    height:         '150%', // Extended height for touch devices with address bars.
                    display:        'none'
                })
                .appendTo( jqBody )
                .click( modalClose ) // Close modal when overlay is clicked.
                .on( 'touchmove', function() { return false; } ); // Prevent scrolling on touch devices.

            // Set up global event handlers for accessibility and interaction.
            $( document ).focusin( function(e) {
                // Keep focus within the opened modal if it exists.
                if ( jqOpened && !jqOpened.has( e.target ).length ) {
                    if ( jq1st ) { jq1st.focus(); } // Focus the first focusable element.
                    else { $( document.activeElement ).blur(); } // Blur if nothing else is focusable.
                }
            })
            .keydown( function(e) {
                // Close the modal if the Escape key is pressed.
                if ( jqOpened && e.keyCode === 27 ) { // Escape key code.
                    return modalClose( e );
                }
            } );
        }

        // Iterate over each selected element to apply configurations.
        return jq.each( function() {
            var that = $( this )
              , cssProp = {
                  position:       'fixed',
                  display:        'none',
                  zIndex:         opt.zIndex
              };

            // Determine modal positioning.
            if ( opt.offset ) {
                if ( typeof opt.offset === 'function' ) {
                    // Wrap custom offset function to ensure centering is applied if needed.
                    opt.offset = ( function(org) {
                        return function() {
                            var that = this; // 'this' is the modal element.
                            return org.call( that, function() { setCenter.call( that ); } );
                        };
                    } )( opt.offset );
                } else {
                    // Apply static offset values.
                    cssProp.left = opt.offset.left;
                    cssProp.top = opt.offset.top;
                    cssProp.marginLeft = cssProp.marginTop = ''; // Clear any previous margin-based positioning.
                }
            } else {
                // If no offset is specified, default to centering.
                opt.offset = setCenter;
            }

            // Attach click handler to close elements.
            if ( opt.closeClass ) {
                that.find( '.' + opt.closeClass ).off( 'click', modalClose ).click( modalClose );
            }

            // Bind custom event handlers defined in options.
            $.each( [
                [ 'open', EVENT_TYPE_OPEN ],
                [ 'close', EVENT_TYPE_CLOSE ],
                [ 'beforeopen', EVENT_TYPE_BEFOREOPEN ],
                [ 'beforeclose', EVENT_TYPE_BEFORECLOSE ]
            ], function(i, elm) {
                var optName = elm[0]
                  , type = elm[1];
                if ( typeof opt[optName] === 'function' ) {
                    that.off( type, opt[optName] ).on( type, opt[optName] );
                }
            } );

            // Apply base CSS, store options, append to body, and prevent touch scroll.
            that.css( cssProp )
                .data( APP_NAME, opt )
                .appendTo( jqBody )
                .on( 'touchmove', function() { return false; } ); // Prevent scrolling on touch devices.
        } );
    }

    /**
     * Opens a plainModal dialog.
     * Handles animation, state management, and accessibility.
     *
     * @param {jQuery} jq - The jQuery object representing the modal to open.
     * @param {object} options - Optional new configuration options.
     * @returns {jQuery} The original jQuery object for chaining.
     */
    function modalOpen(jq, options) {
        var jqTarget = jq.length ? jq.eq(0) : undefined; // Process only the first selected element.
        var opt, inlineStyles, calMarginR, calMarginB, event;

        // Prevent action if locked or no target.
        if ( lockAction || !jqTarget ) { return jq; }

        // Retrieve or initialize options for the target modal.
        if ( options || !( opt = jqTarget.data( APP_NAME ) ) ) {
            opt = init( jqTarget, options ).data( APP_NAME );
        }

        // Handle 'force' option: immediately stop any ongoing fade animations.
        if ( !jqNextOpen && opt.force && jqFading && jqFading.get(0) !== jqTarget.get(0) ) {
            jqFading.stop( true, true );
            jqOverlay.stop( true, true );
        }

        // Handle 'force' option: close currently opened modal before opening a new one.
        if ( !jqNextOpen && opt.force && jqOpened && jqOpened.get(0) !== jqTarget.get(0) ) {
            jqNextOpen = jqTarget; // Store target for next open call.
            modalClose( jqOpened );
        }
        // Proceed with opening only if no modal is currently opened.
        else if ( jqOpened === null ) {
            lockAction = true; // Lock actions during opening process.

            // Trigger 'beforeopen' event.
            event = $.Event( EVENT_TYPE_BEFOREOPEN, { cancelable: true } );
            jqTarget.trigger( event );

            // Only proceed if the event was not prevented.
            if ( !event.isDefaultPrevented() ) {
                // Save original body styles to restore later.
                inlineStyles = jqBody.get(0).style;
                orgOverflow = inlineStyles.overflow;

                // Calculate scrollbar width/height to prevent content shift when hiding overflow.
                calMarginR = jqBody.prop( 'clientWidth' );
                calMarginB = jqBody.prop( 'clientHeight' );
                jqBody.css( 'overflow', 'hidden' );
                calMarginR -= jqBody.prop( 'clientWidth' );
                calMarginB -= jqBody.prop( 'clientHeight' );

                orgMarginR = inlineStyles.marginRight;
                orgMarginB = inlineStyles.marginBottom;

                // Adjust body margins to compensate for scrollbar removal.
                if ( calMarginR < 0 ) { jqBody.css( 'marginRight', '+=' + ( -calMarginR ) ); }
                if ( calMarginB < 0 ) { jqBody.css( 'marginBottom', '+=' + ( -calMarginB ) ); }

                // Save active element and scroll position for restoration.
                jqActive = $( document.activeElement ).blur();
                jq1st = null;
                winLeft = jqWin.scrollLeft();
                winTop = jqWin.scrollTop();
                jqWin.scroll( avoidScroll ); // Prevent window scroll.

                // Position the modal.
                callOffset( jqTarget, opt );

                // Apply the open effect (e.g., fadeIn).
                // The callback is executed after the animation completes.
                opt.effect.open.call( ( jqFading = jqTarget ), opt.duration || 1, function() {
                    jqFading = undefined; // Clear fading state.

                    // Attempt to find and focus the first focusable element inside the modal.
                    jqTarget.find( 'a,input,select,textarea,button,object,area,img,map' ).each( function() {
                        var that = $( this );
                        if ( that.focus().get(0) === document.activeElement ) { // Check if focus was successful.
                            jq1st = that;
                            return false; // Break loop after finding first focusable element.
                        }
                    } );

                    jqOpened = jqTarget; // Mark this modal as fully opened.
                    jqTarget.trigger( EVENT_TYPE_OPEN ); // Trigger 'open' event.
                } );

                // Re-style and animate the overlay.
                jqOverlay.css( { backgroundColor: opt.overlay.fillColor, zIndex: opt.overlay.zIndex } )
                    .fadeTo( opt.duration, opt.overlay.opacity );

                jqOpened = 0; // Indicate that a modal is currently fading in.
            }

            lockAction = false; // Unlock actions.
        }

        return jq; // Return original jQuery object.
    }

    /**
     * Closes a plainModal dialog.
     * Handles animation, state management, and restoration of original page state.
     *
     * @param {jQuery|Event} jq - The jQuery object representing the modal to close, or an event object.
     * @returns {jQuery|boolean} The original jQuery object for chaining, or false if called by an event handler.
     */
    function modalClose(jq) { // `jq` can be a target jQuery object or an event object.
        var isEvent = jq instanceof $.Event
          , jqTarget, opt, event, duration;

        // Prevent action if locked or no modal is opened.
        if ( !lockAction && jqOpened ) {
            lockAction = true; // Lock actions during closing process.

            // Determine the target modal to close.
            jqTarget = isEvent ? jqOpened : ( function() { // If `jq` is an event, close `jqOpened`.
                var index = jq.index( jqOpened ); // Check if `jqOpened` is among the `jq` set.
                return index > -1 ? jq.eq( index ) : undefined; // Return it if found.
            } )();

            if ( jqTarget ) {
                // Trigger 'beforeclose' event.
                event = $.Event( EVENT_TYPE_BEFORECLOSE, { cancelable: true } );
                if ( isEvent ) { event.from = jq; } // Attach original event.
                else if ( jqNextOpen ) { event.from = jqNextOpen; } // Attach next open target if pending.
                jqTarget.trigger( event );

                // Only proceed if the event was not prevented.
                if ( !event.isDefaultPrevented() ) {
                    opt = jqTarget.data( APP_NAME ); // Retrieve options.

                    // Determine animation duration. If a new modal is pending, close quickly.
                    duration = jqNextOpen ? 1 : ( opt.duration || 1 );

                    // Apply the close effect (e.g., fadeOut).
                    opt.effect.close.call( ( jqFading = jqTarget ), duration, function() {
                        var event;
                        jqFading = undefined; // Clear fading state.

                        // Restore body overflow and margins.
                        jqBody.css( { overflow: orgOverflow,
                            marginRight: orgMarginR, marginBottom: orgMarginB } );

                        // Restore focus to the element that was active before the modal opened.
                        if ( jqActive && jqActive.length ) { jqActive.focus(); }

                        // Unbind scroll prevention and restore original scroll position.
                        jqWin.off( 'scroll', avoidScroll ).scrollLeft( winLeft ).scrollTop( winTop );

                        jqOpened = null; // Mark no modal as opened.

                        // Trigger 'close' event.
                        event = $.Event( EVENT_TYPE_CLOSE );
                        if ( isEvent ) { event.from = jq; }
                        else if ( jqNextOpen ) { event.from = jqNextOpen; }
                        jqTarget.trigger( event );

                        // If a new modal is pending, open it after a short delay.
                        if ( jqNextOpen ) {
                            window.setTimeout( function() {
                                modalOpen( jqNextOpen );
                                jqNextOpen = undefined;
                            }, 0 );
                        }
                    } );

                    // Fade out the overlay.
                    jqOverlay.fadeOut( duration );

                    jqOpened = 0; // Indicate that a modal is currently fading out.
                } else {
                    jqNextOpen = undefined; // Clear pending open if close was prevented.
                }
            }

            lockAction = false; // Unlock actions.
        }

        // If called by an event, prevent default behavior and stop propagation.
        if ( isEvent ) { jq.preventDefault(); return false; }

        return jq; // Return original jQuery object.
    }

    /**
     * Calls the offset function to position the modal.
     *
     * @param {jQuery} jq - The modal jQuery element.
     * @param {object} options - The modal's options.
     */
    function callOffset(jq, options) {
        var offset;
        options = options || jq.data( APP_NAME ); // Use existing options if not provided.
        if ( typeof options.offset === 'function' &&
             ( offset = options.offset.call( jq ) ) ) { // Execute offset function if it exists.
            jq.css( { left: offset.left, top: offset.top, marginLeft: '', marginTop: '' } );
        }
    }

    /**
     * Centers the modal on the screen using CSS `left`, `top`, `marginLeft`, and `marginTop`.
     * This function is intended to be called with `this` bound to the modal element.
     */
    function setCenter() {
        /*
         * The strategy for positioning might change frequently.
         * Therefore, CSS properties are set every time this function is called,
         * rather than trying to optimize for unchanged dimensions.
         */

        /* jshint validthis:true */
        this.css( {
            left: '50%',
            top: '50%',
            marginLeft: '-' + ( this.outerWidth() / 2 ) + 'px',
            marginTop: '-' + ( this.outerHeight() / 2 ) + 'px'
        } );
        /* jshint validthis:false */
    }

    /**
     * Event handler to prevent scrolling of the window.
     * Restores previous scroll position.
     *
     * @param {Event} e - The scroll event object.
     * @returns {boolean} Always returns false to prevent default.
     */
    function avoidScroll(e) {
        jqWin.scrollLeft( winLeft ).scrollTop( winTop ); // Restore previous scroll position.
        e.preventDefault(); // Prevent default scroll behavior.
        return false;
    }

    /**
     * Sets or retrieves an option for a plainModal instance.
     *
     * @param {jQuery} jq - The jQuery object representing the modal.
     * @param {string} name - The name of the option.
     * @param {*} newValue - The new value for the option (optional, if retrieving).
     * @returns {*} The option's value, or undefined if the option does not exist.
     */
    function setOption(jq, name, newValue) {
        var jqTarget = jq.length ? jq.eq(0) : undefined; // Operate on the first element.
        var opt;

        if ( !jqTarget ) { return; }

        // Get options, initializing if necessary.
        opt = jqTarget.data( APP_NAME ) || init( jqTarget ).data( APP_NAME );

        // If the option name doesn't exist, do nothing.
        if ( !opt.hasOwnProperty( name ) ) { return; }

        /* jshint eqnull:true */
        // If a newValue is provided (and not null/undefined), set the option.
        if ( newValue != null ) { opt[name] = newValue; }
        /* jshint eqnull:false */

        return opt[name]; // Return the option's current value.
    }

    // Initialize resize handler when the DOM is ready.
    $( function() {
        $( window ).resize( function() {
            // Re-position the modal if it's currently open.
            if ( jqOpened ) { callOffset( jqOpened ); }
        } );
    } );

    /**
     * The main jQuery plugin entry point for plainModal.
     * Allows opening, closing, setting options, or initializing the plugin.
     *
     * @param {string|object} action - The action to perform ('open', 'close', 'option') or options object for initialization.
     * @param {*} arg1 - First argument for the action (e.g., options for 'open', option name for 'option').
     * @param {*} arg2 - Second argument for the action (e.g., option value for 'option').
     * @returns {jQuery} The original jQuery object for chaining.
     */
    $.fn[APP_NAME] = function(action, arg1, arg2) {
        return (
            action === 'open' ?   modalOpen( this, arg1 ) : // Open the modal.
            action === 'close' ?  modalClose( this ) :      // Close the modal.
            action === 'option' ? setOption( this, arg1, arg2 ) : // Set or get an option.
                                  init( this, action )      // Initialize the plugin with options.
        );
    };

} )( jQuery ); // End of IIFE, passing jQuery as an argument.