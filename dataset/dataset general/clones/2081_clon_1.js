/*******************************************************************************
 *
 *  Module Name: Popelt - A Lightweight jQuery Popup/Modal Plugin
 *  Description: This script provides functionality for creating dynamic pop-up windows.
 *  Version: 1.0.0 (First stable release)
 *  Author: (c) Elton Jain - @eltonjain (Developer & Maintainer)
 *  Demo URL: http://welbour.com (See it in action!)
 *  Dependencies: Requires jQuery library version 1.9.1 or higher for core functionality.
 *
 *  =============================================================================
 *  (C) Copyright 2023, Elton Jain. All rights reserved.
 *  Unauthorized reproduction or distribution of this code is prohibited.
 *  =============================================================================
 *
 ******************************************************************************/
( function ( $ ) {

    // These are intended to be global-like variables within the IIFE's scope,
    // managing the state of all Popelt instances.
    var _popups_open        = []  // An array to keep track of currently open popup IDs.
      , _popups_open_count  = 0   // A counter for the number of active popups.
      , _popups             = null// Initialized to null, later counts total popup instances created.
      , _popup_current_id   = null// Stores the ID of the most recently opened popup.
    ; // End of global variable declarations.


    /**
     * Popelt Constructor Function
     * Initializes a new Popelt instance with given parameters.
     * @param {Object} params - Configuration object for the popup.
     */
    function Popelt( params ) {

        // Store a reference to the current instance for internal methods.
        var _self = this;


        ////////////////////////////////////////////////////////////////////////
        // INTERNAL VARIABLES & CACHED SELECTORS
        ////////////////////////////////////////////////////////////////////////

        // Cache common DOM elements and window objects for performance.
        var _d                  = $( document )       // jQuery wrapped document object.
          , _w                  = window              // Native window object reference.
          , _$w                 = $( _w )             // jQuery wrapped window object.
          , _wH                 = windowHeight()      // Current window height, calculated once.
          , _wW                 = windowWidth()       // Current window width, calculated once.

          , _prefix             = '__pop'             // Prefix for generated popup IDs to ensure uniqueness.
          , _btnCloseClass      = 'pop-btn-close'     // CSS class for the default close button.
          , _closeClass         = 'pop-close'         // Generic CSS class used for closing elements.
          , _popBtnClass        = 'pop-btn'           // Base CSS class for any custom buttons.
          , _popOverlayClass    = 'pop-screen'        // CSS class for the semi-transparent overlay.
          , _popClass           = 'pop-wrap'          // CSS class for the main popup wrapper element.
          , _popContentClass    = 'pop-content'       // CSS class for the area where popup content resides.
          , _popActionBlockClass= 'pop-action-block'  // CSS class for the container of action buttons.
          , _popTitleClass      = 'pop-title'         // CSS class for the popup's title bar.

          , _id                                       // Placeholder for the unique ID of this popup instance.
          , _zIndex             = 9000                // Base z-index for popups, increments for stacking.
        ; // End of internal variable declarations.


        ////////////////////////////////////////////////////////////////////////
        // DEFAULT OPTIONS
        ////////////////////////////////////////////////////////////////////////

        // Define the default configuration options for a Popelt instance.
        var defaults = {
              modal             : false                   // If true, overlay cannot be clicked to close.
            , title             : false                   // The title text for the popup header.
            , content           : ''                      // Initial content to be displayed in the popup.
            , offsetTop         : -1                      // Top offset in pixels. -1 means vertical centering.
            , closeButton       : true                    // Whether to show the default 'X' close button.
            , closeBtnTooltip   : 'Close'                 // Tooltip text for the 'X' close button.
            , width             : 600                     // Default width of the popup in pixels.
            , closeClass        : ''                      // Custom CSS class that can trigger popup close.
            , escClose          : true                    // Allow closing the popup by pressing the ESC key.
            , focus             : null                    // Element selector to focus after popup opens (e.g., 'input').
            , contentType       : false                   // Type of content: 'iframe', 'ajax', or '#elementId'.
            , loadUrl           : false                   // URL to load for 'iframe' or 'ajax' content types.
            , buttons           : []                      // Array of button configurations for the action block.
            , fadeSpeed         : 200                     // Duration of fade animations in milliseconds.
            , iframeHeight      : '300px'                 // Default height for iframes.
            , iframeWidth       : '100%'                  // Default width for iframes.
            , maxHeight         : false                   // Maximum height for the content area.
            , valign            : true                    // Vertically center the popup if true.
            , responsive        : false                   // Make the popup responsive (max-width: 100%).
            , overlayColor      : false                   // Custom background color for the overlay.
            , overlayOpacity    : false                   // Custom opacity for the overlay.
        };

        // Merge default options with user-provided parameters.
        var o = $.extend( defaults, params );


        /**
         * Initializes the popup instance.
         * Increments popup counters and generates a unique ID.
         */
        _self.init = function () {
            _popups = ( _popups || 0 ) + 1;             // Increment total popup instances.
            _id = _prefix + _popups + '__';             // Generate a unique ID for this specific popup.
            _zIndex += _popups;                         // Adjust z-index for stacking order.
        };


        /**
         * Sets the content of the popup.
         * @param {string|HTMLElement|jQuery} content - The content to be displayed.
         * @returns {Popelt} The current Popelt instance for chaining.
         */
        _self.setContent = function ( content ) {
            o.content = content;                        // Update the content option.
            return _self;                               // Allow method chaining.
        };


        /**
         * Displays the popup on the screen.
         * Creates the popup structure if it doesn't exist, then shows it.
         * @returns {Popelt} The current Popelt instance for chaining.
         */
        _self.showPopup = function () {

            // Check if the popup's DOM structure already exists for this ID.
            if ( $( '.' + _popClass + '.' + _id ).length <= 0 ) {

                // If not, proceed to create the template elements.
                var popHtml, popTitle, popContent, popOverlay, actionPanel, popBlock, popContainer;

                // Create the overlay element.
                popOverlay = $( '<div>' )
                                .addClass( _popOverlayClass )
                                .addClass( _id )
                                .css( 'z-index', _zIndex );

                // Apply custom overlay color if specified.
                if ( o.overlayColor ) {
                    popOverlay.css( 'background', o.overlayColor );
                }

                // Apply custom overlay opacity if specified, including IE filter.
                if ( o.overlayOpacity ) {
                    popOverlay.css( 'opacity', o.overlayOpacity ).css( 'filter', 'alpha(opacity=' + ( o.overlayOpacity * 100 ) + ')' );
                }

                // Create the content wrapper.
                popContent = $( '<div>' ).addClass( _popContentClass );

                // If a title is provided, create the title bar.
                if ( o.title ) {
                    popTitle = $( '<div>' ).addClass( _popTitleClass ).text( o.title );
                }

                // Append initial content if available.
                if ( o.content ) {
                    popContent.append( o.content );
                }

                // If buttons are defined, create the action panel and buttons.
                if ( o.buttons.length ) {
                    actionPanel = $( '<div>' ).addClass( _popActionBlockClass );

                    // Iterate over each button definition.
                    $.each( o.buttons, function ( k, v ) {
                        var classname = v.classname;
                        var clickEvent = v.clickEvent;

                        // Handle case where classname might be the click event function.
                        if ( $.isFunction( classname ) ) {
                            clickEvent = classname;
                            classname = '';
                        }

                        // Create the button element.
                        var btn = $( '<button>' )
                                  .addClass( _popBtnClass )
                                  .addClass( v.classname )
                                  .text( v.label );

                        // Attach click event handler if provided.
                        if ( v.clickEvent ) {
                            btn.on( 'click', v.clickEvent );
                        }
                        actionPanel.append( btn ); // Add button to the action panel.
                    } );
                }

                // Apply max height to the content container if specified.
                if ( o.maxHeight ) {
                    popContent.css( 'max-height', o.maxHeight );
                }

                // Create the inner block that holds title, content, and actions.
                popBlock = $( '<div>' ).addClass( 'pop-block' );

                // If the default close button is enabled, create and append it.
                if ( o.closeButton !== false ) {
                    var closeButton = $( '<span>' ).addClass( 'pop-btn-close' ).html( '&times;' );
                    if ( o.closeBtnTooltip ) {
                        closeButton.attr( 'title', o.closeBtnTooltip );
                    }
                    popBlock.append( closeButton );
                }

                // Assemble the popBlock.
                popBlock.append( popTitle ).append( popContent ).append( actionPanel );

                // Create the outer container and set its width.
                popContainer = $( '<div>' ).addClass( 'pop-container' ).width( o.width ).append( popBlock );

                // Center the container horizontally.
                popContainer.css( 'margin', '0 auto' );

                // Apply custom top offset if specified.
                if ( o.offsetTop >= 0 ) {
                    popContainer.css( 'margin-top', o.offsetTop );
                }

                // Apply responsive styles if enabled.
                if ( o.responsive === true ) {
                    popContainer.css( 'max-width', '100%' );
                }

                // Create the main popup wrapper and append the container.
                popHtml = $( '<div>' )
                            .addClass( _popClass )
                            .addClass( _id )
                            .css( 'z-index', _zIndex + 1 )
                            .append( popContainer );

                // Append the overlay and popup to the body.
                $( 'body' ).append( popOverlay );
                $( 'body' ).append( popHtml );
            }

            // If content type or load URL is specified, render external content.
            if ( o.contentType || o.loadUrl ) {
                renderContent();
            }

            // Show the overlay and the popup wrapper.
            $( '.' + _popOverlayClass + '.' + _id ).show();
            $( '.' + _popClass + '.' + _id ).show();

            // Bind all necessary event handlers for the new popup.
            bindEvents();

            // Recenter the popup on the screen.
            recenter();

            // Update global popup state variables.
            _popups_open_count++;                       // Increment the count of open popups.
            _popups_open.push( _id );                   // Add the current popup's ID to the open list.
            _popup_current_id = _id;                    // Set this popup as the currently active one.

            // Prevent body scrolling when a popup is open.
            if ( $( 'body' ).not( '.noscroll' ) ) {
                $( 'body' ).addClass( 'noscroll' );
            }

            return _self; // Allow method chaining.
        };


        /**
         * Adds a custom button to the popup's action block.
         * @param {string} label - The text label for the button.
         * @param {string|Function} classname - CSS class for the button, or the click event function.
         * @param {Function} [clickEvent] - The function to execute when the button is clicked.
         * @returns {Object} The button configuration object that was added.
         */
        _self.addButton = function ( label, classname, clickEvent ) {
            var btn = { label: label };                 // Create a button object with its label.

            // Adjust parameters if classname is actually the clickEvent.
            if ( $.isFunction( classname ) ) {
                clickEvent = classname;
                classname = '';
            }
            btn.classname = classname;                  // Assign the CSS class.

            // Assign the click event, defaulting to popup close if none provided.
            if ( $.isFunction( clickEvent ) ) {
                btn.clickEvent = clickEvent;
            } else {
                btn.clickEvent = _self.close;           // Default action is to close the popup.
            }
            o.buttons.push( btn );                      // Add the new button to the options array.
            return btn;                                 // Return the button object.
        };


        /**
         * Adds a predefined 'OK' button to the popup.
         * @param {Function} [clickEvent] - Optional click event for the OK button.
         */
        _self.addOKButton = function ( clickEvent ) {
            _self.addButton( 'OK', clickEvent );        // Call addButton with 'OK' label.
        };


        /**
         * Adds a predefined 'Cancel' button to the popup, which closes the popup by default.
         */
        _self.addCancelButton = function () {
            _self.addButton( 'Cancel', _self.close );   // Call addButton with 'Cancel' label and close event.
        };


        /**
         * Adds a predefined 'Close' button to the popup, which closes the popup by default.
         */
        _self.addCloseButton = function () {
            _self.addButton( 'Close', _self.close );    // Call addButton with 'Close' label and close event.
        };


        /**
         * Closes the currently active or a specific popup.
         * Fades out and removes the popup and its overlay from the DOM.
         * @param {Event} [e] - The event object (e.g., from a click).
         * @returns {boolean} Always returns false to prevent default event actions.
         */
        _self.closePopup = function ( e ) {

            // Determine which popup to close: the current one or the instance's own ID.
            var popupId = _popup_current_id ? _popup_current_id : _id;

            // Unbind all event listeners associated with the popup being closed.
            unbindEvents( popupId );

            // Select the popup wrapper and overlay elements.
            var popWrap = $( '.' + _popClass + '.' + popupId );
            var popOverlay = $( '.' + _popOverlayClass + '.' + popupId );

            // Fade out the popup wrapper and then remove it from the DOM.
            popWrap.fadeTo( o.fadeSpeed, 0, function () {
                $( this ).remove();
            } );

            // Fade out the overlay and then remove it from the DOM.
            popOverlay.fadeTo( o.fadeSpeed, 0, function () {
                $( this ).remove();
            } );

            // Update global popup state.
            _popups_open_count--;                       // Decrement the count of open popups.
            _popups_open.pop();                         // Remove the last opened popup's ID from the stack.
            _popup_current_id = _popups_open[ _popups_open.length - 1 ]; // Set current to the previous popup.

            // If no popups are open, re-enable body scrolling.
            if ( _popups_open_count == 0 ) {
                $( 'body' ).removeClass( 'noscroll' );
            }

            return false; // Prevent default event behavior (e.g., following a link).
        };


        // Provide aliases for `showPopup` and `closePopup` for convenience.
        _self.show = _self.showPopup;
        _self.close = _self.closePopup;


        // Initialize the current Popelt instance upon creation.
        _self.init();

        // Return the instance, allowing for further method calls.
        return this;


        ////////////////////////////////////////////////////////////////////////
        // PRIVATE HELPER FUNCTIONS
        ////////////////////////////////////////////////////////////////////////

        /**
         * Calculates and returns the current height of the browser window.
         * @returns {number} The window height in pixels.
         */
        function windowHeight() {
            return _w.innerHeight || _$w.height();      // Use innerHeight for modern browsers, fallback to jQuery.
        }


        /**
         * Calculates and returns the current width of the browser window.
         * @returns {number} The window width in pixels.
         */
        function windowWidth() {
            return _w.innerWidth || _$w.width();       // Use innerWidth for modern browsers, fallback to jQuery.
        }


        /**
         * Binds all necessary event listeners for the popup, including close buttons,
         * overlay clicks, and window resizing.
         */
        function bindEvents() {

            // Define selectors for the current popup's wrapper and overlay.
            var popWrapSelector = '.' + _popClass + '.' + _id;
            var popOverlaySelector = "." + _popOverlayClass + '.' + _id;

            // Bind click event to the generic close class within the popup.
            $( popWrapSelector ).on( 'click', '.' + _closeClass, _self.close );

            // If a custom close class is defined, bind its click event.
            if ( o.closeClass ) {
                o.closeClass = o.closeClass.replace( '.', '' ); // Ensure no dot prefix.
                $( popWrapSelector ).on( 'click', '.' + o.closeClass, _self.close );
            }

            // If the default 'X' close button is enabled, bind its click event.
            if ( o.closeButton === true ) {
                $( popWrapSelector ).on( 'click', '.' + _btnCloseClass, _self.close );
            }

            // If the popup is not modal, allow closing by clicking the overlay or outside the pop-block.
            if ( o.modal !== true ) {
                $( 'body' ).on( 'click', popOverlaySelector + ', ' + popWrapSelector, _self.close );
                // Prevent closing when clicking inside the actual content block.
                $( 'body' ).on( 'click', popWrapSelector + ' .pop-block', function ( e ) {
                    e.stopPropagation(); // Stop event from bubbling up to the body/overlay.
                } );
            }

            // Enable ESC key to close if configured.
            if ( o.escClose !== false ) {
                enableEscClose();
            }

            // Bind the recenter function to the window resize event.
            _$w.on( 'resize', recenter );
        }


        /**
         * Unbinds all event listeners associated with a specific popup ID.
         * This is crucial for preventing memory leaks and conflicting events.
         * @param {string} popupId - The unique ID of the popup whose events should be unbound.
         */
        function unbindEvents( popupId ) {

            // Define selectors for the specific popup's wrapper and overlay.
            var popWrapSelector = '.' + _popClass + '.' + popupId;
            var popOverlaySelector = "." + _popOverlayClass + '.' + popupId;

            // Unbind click events from the overlay and the popup wrapper.
            $( popOverlaySelector + ', ' + popWrapSelector ).off( 'click' );

            // Unbind click events from generic close buttons within the popup.
            $( popWrapSelector + '.' + _closeClass ).off( 'click' );

            // If a custom close class was used, unbind its click events.
            if ( o.closeClass ) {
                $( popWrapSelector + '.' + o.closeClass.replace( '.', '' ) ).off( 'click' );
            }

            // Unbind the escape key listener specific to this popup.
            _d.off( 'keydown.' + popupId );
        }


        /**
         * Enables the functionality to close the popup when the ESC key is pressed.
         * Binds a keydown event listener to the document.
         */
        function enableEscClose() {
            _d.on( 'keydown.' + _id, function ( e ) {
                if ( e.which == 27 ) {              // Check if the pressed key is ESC (key code 27).
                    e.stopImmediatePropagation();   // Stop other keydown listeners from firing.
                    _self.close( _popup_current_id ); // Close the currently active popup.
                    return false;                   // Prevent default browser behavior.
                }
            } );
        }


        /**
         * Updates the content of the popup's content area with new DOM elements or HTML.
         * After updating, it attempts to focus an element and recenters the popup.
         * @param {string|HTMLElement|jQuery} content - The new content to be inserted.
         */
        function updateDomContent( content ) {

            // Construct the selector for the specific popup's content container.
            var contentContainerSelector = '.' + _popClass + '.' + _id + ' .' + _popContentClass;

            _self.setContent( content );                // Update the instance's content option.
            $( contentContainerSelector ).append( content ); // Append the new content to the DOM.

            enableFocus();                              // Attempt to focus a specified element.
            recenter();                                 // Re-calculate and apply vertical centering.
        }


        /**
         * Renders external content based on the `contentType` and `loadUrl` options.
         * Supports AJAX, IFRAME, and loading content from a hidden DOM element.
         */
        function renderContent() {

            // Handle AJAX content loading.
            if ( o.contentType == 'ajax' && o.loadUrl ) {
                $.get( o.loadUrl, function ( data ) {
                    var content = $( '<div class="pop-ajax-wrapper"></div>' ).append( data );
                    updateDomContent( content );        // Update popup with fetched content.
                    return false;                       // Prevent default browser behavior.
                } );

            // Handle IFRAME content loading.
            } else if ( o.contentType == 'iframe' && o.loadUrl ) {
                var iframe = $( '<iframe class="pop-iframe"></iframe>' );
                iframe.attr( 'src', o.loadUrl );        // Set the iframe's source URL.

                // Apply specified iframe dimensions.
                iframe.css( {
                    'border': 0,
                    'width' : o.iframeWidth,
                    'height': o.iframeHeight
                } );

                updateDomContent( iframe );             // Update popup with the iframe.
                // Dynamic height adjustment for iframes could be added here in future versions.

            // Handle content loaded from an existing DOM element (e.g., a hidden div).
            } else if ( o.contentType && o.contentType.indexOf( '#' ) == 0 ) { // Check if it's an ID selector.
                var content = $( o.contentType ).html(); // Get the HTML content of the target element.
                updateDomContent( content );            // Update popup with the retrieved HTML.
            }
        }


        /**
         * Attempts to set focus on a specific element within the popup content.
         * This improves accessibility for users navigating with keyboards.
         */
        function enableFocus() {
            var popupContentSelector = '.' + _popClass + ' ' + '.' + _popContentClass;
            if ( o.focus === true ) {
                // Find the first input or textarea within the popup content and focus it.
                $( popupContentSelector ).find( 'input,textarea' ).first().focus();
            }
        }


        /**
         * Recalculates and applies the vertical centering of the popup.
         * This function is triggered on popup display and window resize.
         */
        function recenter() {

            // Do not recenter if a specific offsetTop is set or if vertical alignment is disabled.
            if ( ( o.offsetTop !== '' && o.offsetTop >= 0 ) || o.valign === false ) {
                return false; // Exit early.
            }

            // Select the inner block of the current popup.
            var contentWrapSelector = '.' + _popClass + '.' + _id + ' .pop-block';
            var _content_w = $( contentWrapSelector ).outerWidth();  // Get the outer width of the content block.
            var _content_h = $( contentWrapSelector ).outerHeight(); // Get the outer height of the content block.

            // Calculate the new top margin for vertical centering, with a slight adjustment.
            var _new_top = ( ( _wH - _content_h ) / 2 ) - 20;

            // Ensure the top margin is not negative.
            _new_top = _new_top > 0 ? _new_top : 0;

            // Apply the calculated top margin to the popup container.
            $( '.' + _popClass + '.' + _id + ' .pop-container' ).css( 'margin-top', _new_top );
        }

    } // End of Popelt constructor function.

    // Expose the Popelt constructor to the global window object.
    window.Popelt = Popelt;

} ( jQuery ) ); // End of Immediately Invoked Function Expression (IIFE).