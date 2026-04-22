// This is a comprehensive scrollbar plugin designed for jQuery UI.
// It allows for the creation of custom scrollbars, enhancing user interface elements.
//
// Based on initial adaptations from the jQuery UI Slider component, specifically for horizontal scrolling.
//
// Author: Jillian Ada Burrows.
// Version: 1.0.0 (initial release)
// Date: February 27, 2012
//
// Copyright (c) 2011, AUTHORS.txt (refer to http://jqueryui.com/about for details)
// This code is dual-licensed under either the MIT License or the GPL Version 2 License.
// For licensing information, please visit http://jquery.org/license
//
// Required dependencies for this plugin to function correctly:
//   - jquery.ui.core.js
//   - jquery.ui.mouse.js
//   - jquery.ui.widget.js
//   - jquery.ui.slider.js

( function ( $ ) {

    // Register the custom scrollbar widget with jQuery UI.
    // The namespace is 'ui' and the widget name is 'scrollbar'.
    $.widget( "ui.scrollbar", {

        // Default options for the scrollbar widget.
        options: {
            orientation         : "horizontal", // Determines if the scrollbar is horizontal or vertical.
            scrollFactor        : 15,           // Multiplier for mousewheel scrolling sensitivity.
            easing              : 'linear',     // Easing function for scroll animations.
            animationDuration   : 20            // Duration of scroll animations in milliseconds.
        },

        /**
         * Initializes the scrollbar widget. This method is called automatically upon widget creation.
         * It sets up the DOM structure for the scrollbar and content pane.
         */
        _create: function () {

            // Cache 'this' for use within nested functions and callbacks.
            var self    =   this;
            // Shorthand for the widget's options.
            var o       =   this.options;
            // The element on which the widget is initialized.
            var el      =   this.element;

            // Flag to indicate if the scrollbar is currently active (i.e., needed and visible).
            this.scrollbarActive = false;

            // Store the container element.
            this.containerElement   =   $( el );
            // Get all direct children of the container.
            this.containerChildren  =   this.containerElement.children();
            // Detach children temporarily to rebuild the DOM structure.
            this.containerChildren.detach();


            // --- Create the core scroll pane and content elements ---

            // The main scroll pane wrapper.
            this.scrollPane         =   $( '<div class="scroll-pane scroll-pane-' + o.orientation + '"></div>' );
            // The content wrapper that will hold the original children.
            this.scrollContent      =   $( '<div class="scroll-content scroll-content-' + o.orientation  + '"></div>' );

            // Append the original children back into the new scroll content div.
            this.scrollContent.append( this.containerChildren );
            // Append the scroll content to the scroll pane.
            this.scrollContent.appendTo( this.scrollPane );
            // Ensure the scroll content is visible.
            this.scrollContent.show();


            // --- Build the jQuery UI Slider component for the scrollbar ---

            // Wrapper for the actual slider, with rounded corners.
            this.scrollbarWrapper   =   $( '<div class="scroll-bar-wrap scroll-bar-wrap-' + o.orientation + ' ui-corner-all"></div>' );
            // Append the wrapper to the scroll pane and hide it initially.
            this.scrollbarWrapper.appendTo( this.scrollPane ).hide();

            // Initialize the jQuery UI Slider.
            this.scrollbar          =   $( '<div class="scroll-bar scroll-bar-' + o.orientation + '"></div>' ).slider({
                orientation :   o.orientation,
                // Set initial value based on orientation (0 for horizontal, 100 for vertical top).
                value       :   o.orientation == 'horizontal' ? 0 : 100,
                // Callback function when the slider is moved.
                slide       :   function( event, ui ) {
                    // Check orientation to call the appropriate scroll handler.
                    if ( o.orientation == "horizontal" ) {
                        self._horizontalScrollHandler( event, ui );
                    } else {
                        // Vertical Orientation handling.
                        self._verticalScrollHandler( event, ui );
                    }
                }
            });

            // Adjust the slider handle's appearance and behavior for a scrollbar.
            this._makeHandleHelper();

            // Append the configured slider to its wrapper.
            this.scrollbar.appendTo( this.scrollbarWrapper );

            // Finally, append the entire scroll pane structure back to the original container.
            this.scrollPane.appendTo( this.containerElement );

            // Bind a mousewheel event handler to the container element.
            this.containerElement.bind( 'mousewheel', function ( event, delta ) {
                // Only process mousewheel events if the scrollbar is active.
                if ( self.scrollbarActive === true ) {
                    event.stopPropagation(); // Prevent event bubbling.
                    // Ensure 'delta' is defined, indicating jquery.mousewheel.js is loaded.
                    if ( delta !== undefined ) {
                        return self._mousewheelHandler( event, delta );
                    }
                }
            });

            // Determine if the scrollbar is needed and show it if necessary.
            this._showScrollbar();
        },

        /**
         * Helper method to adjust the slider handle's appearance.
         * This makes the handle fit within the scrollbar track,
         * addressing the default slider behavior where handles might extend past the track.
         */
        _makeHandleHelper: function () {
            var self = this; // Store 'this' for use in event handlers.

            if ( this.options.orientation == "horizontal" ) {
                // For horizontal orientation.
                this.handleHelper = this.scrollbar.find( ".ui-slider-handle" )
                    .mousedown( function () {
                        // On mouse down, temporary adjust scrollbar width.
                        self.scrollbar.width( self.handleHelper.width() );
                    })
                    .mouseup( function () {
                        // On mouse up, restore scrollbar width to full.
                        self.scrollbar.width( "100%" );
                    })
                    // Wrap the handle in a helper parent div for styling/positioning.
                    .wrap( "<div class='ui-handle-helper-parent'></div>" ).parent();
            } else {
                // For vertical orientation.
                this.handleHelper = this.scrollbar.find( ".ui-slider-handle" )
                    .mousedown( function () {
                        // On mouse down, temporary adjust scrollbar height.
                        self.scrollbar.height( self.handleHelper.height() );
                    })
                    .mouseup( function () {
                        // On mouse up, restore scrollbar height to full.
                        self.scrollbar.height( "100%" );
                    })
                    // Wrap the handle in a helper parent div.
                    .wrap( "<div class='ui-handle-helper-parent'></div>" ).parent();
            }

            // Set the scroll pane's overflow to hidden, as the slider now manages scrolling.
            this.scrollPane.css( "overflow", "hidden" );
        },

        /**
         * Handles the horizontal scrolling action triggered by the slider.
         * @param {Object} event - The event object.
         * @param {Object} ui - The UI object from the slider, containing the current value.
         */
        _horizontalScrollHandler: function ( event, ui ) {
            // Scroll horizontally based on the slider's value and animation duration.
            this._scrollHorizontal( ui.value, this.options.animationDuration );
        },

        /**
         * Handles the vertical scrolling action triggered by the slider.
         * @param {Object} event - The event object.
         * @param {Object} ui - The UI object from the slider, containing the current value.
         */
        _verticalScrollHandler: function ( event, ui ) {
            // Scroll vertically based on the slider's value and animation duration.
            this._scrollVertical( ui.value, this.options.animationDuration );
        },

        /**
         * Processes mousewheel events to calculate and apply scroll animation.
         * @param {Object} event - The mousewheel event object.
         * @param {number} delta - The direction and magnitude of the mousewheel scroll.
         * @returns {boolean} - True if scrolling occurred, false otherwise.
         */
        _mousewheelHandler: function ( event, delta ) {
            var scrollScreen    =   false;
            var duration        =   this.options.animationDuration;
            // Calculate the amount to scroll based on delta and scrollFactor.
            var scrollAmount    =   delta * this.options.scrollFactor;

            if ( this.options.orientation == "horizontal" ) {
                // For horizontal scrolling, adjust the scroll amount and then scroll.
                var scroll = this._adjustScrollAmount( -scrollAmount );
                this._scrollHorizontal( scroll.amount, duration );
            } else {
                // For vertical scrolling, adjust the scroll amount and then scroll.
                var scroll = this._adjustScrollAmount( scrollAmount );
                this._scrollVertical( scroll.amount, duration );
            }
            // Return whether the screen was scrolled or not.
            return scroll.scroll;
        },

        /**
         * Adjusts the scroll amount to ensure it stays within the valid range (0-100)
         * of the slider's values.
         * @param {number} scrollAmount - The raw amount to scroll.
         * @returns {{amount: number, scroll: boolean}} - The adjusted scroll amount and a flag indicating if scrolling occurred.
         */
        _adjustScrollAmount: function ( scrollAmount ) {
            var scrollScreen    =   false;
            // Get current slider value and add the scroll amount.
            var scrollbarValue  =   parseInt( this.scrollbar.slider( 'value' ) ) + scrollAmount;

            // Clamp the scrollbar value to be within 0 and 100.
            if ( scrollbarValue < 0 ) {
                scrollbarValue  =   0;
                scrollScreen    =   true; // Indicate that a boundary was hit.
            }
            if ( scrollbarValue > 100 ) {
                scrollbarValue  =   100;
                scrollScreen    =   true; // Indicate that a boundary was hit.
            }
            // Update the slider's value.
            this.scrollbar.slider( 'value', scrollbarValue );
            // Return the adjusted amount and the scroll screen status.
            return { amount: scrollbarValue, scroll: scrollScreen };
        },

        /**
         * Scrolls the content horizontally by a given percentage.
         * @param {number} scrollbarValue - The percentage value (0-100) from the scrollbar.
         * @param {number} duration - The duration of the scroll animation.
         */
        _scrollHorizontal: function ( scrollbarValue, duration ) {
            // Only scroll if content width exceeds pane width.
            if ( this.scrollContent.width() > this.scrollPane.width() ) {
                // Calculate the distance to move the content.
                var distance = Math.round(
                    scrollbarValue / 100 * ( this.scrollPane.width() - this.scrollContent.width() )
                );
                // Perform the actual animation.
                this._scrollHorizontalDistance( distance, duration );
            } else {
                // If no scrollbar is needed, ensure content is at its original position.
                this.scrollContent.css( "margin-left", 0 );
            }
        },

        /**
         * Scrolls the content vertically by a given percentage.
         * @param {number} scrollbarValue - The percentage value (0-100) from the scrollbar.
         * @param {number} duration - The duration of the scroll animation.
         */
        _scrollVertical: function ( scrollbarValue, duration ) {
            // Only scroll if content height exceeds pane height.
            if ( this.scrollContent.height() > this.scrollPane.height() ) {
                // Calculate the distance to move the content (inverted for vertical scrollbar logic).
                var distance = Math.round(
                    ( 100 - scrollbarValue ) / 100 * ( this.scrollPane.height() - this.scrollContent.height() )
                );
                // Perform the actual animation.
                this._scrollVerticalDistance( distance, duration );
            } else {
                // If no scrollbar is needed, ensure content is at its original position.
                this.scrollContent.css( "margin-top", 0 );
            }
        },

        /**
         * Animates the horizontal scrolling of the content by a specific pixel distance.
         * @param {number} distance - The target margin-left distance in pixels.
         * @param {number} duration - The duration of the animation.
         */
        _scrollHorizontalDistance: function ( distance, duration ) {
            this.scrollContent.animate(
                {
                    // Animate the 'margin-left' CSS property.
                    "margin-left" : distance + "px"
                },
                {
                    // Animation options.
                    duration: duration / distance, // Adjust duration based on distance.
                    easing: this.options.easing
                }
            );
        },

        /**
         * Animates the vertical scrolling of the content by a specific pixel distance.
         * @param {number} distance - The target margin-top distance in pixels.
         * @param {number} duration - The duration of the animation.
         */
        _scrollVerticalDistance: function ( distance, duration ) {
            this.scrollContent.animate(
                {
                    // Animate the 'margin-top' CSS property.
                    "margin-top" : distance + "px"
                },
                {
                    // Animation options.
                    duration: duration / distance, // Adjust duration based on distance.
                    easing: this.options.easing
                }
            );
        },

        /**
         * Determines if a scrollbar is necessary and displays it if content overflows.
         * It also triggers content and scrollbar sizing.
         */
        _showScrollbar: function () {
            // Calculate the difference between container and content dimensions.
            var widthOffset     =   this.containerElement.width()  -   this.scrollContent.width();
            var heightOffset    =   this.containerElement.height() -   this.scrollContent.height();

            // Check if content is larger than the container in the relevant orientation.
            if ( ( ( this.options.orientation == "horizontal" ) && ( widthOffset < 0 ) ) ||
                 ( ( this.options.orientation == "vertical"   ) && ( heightOffset < 0 ) ) )
            {
                // If a scrollbar is needed:
                this.scrollbarActive = true; // Set flag to true.
                this.scrollbarWrapper.show(); // Make the scrollbar visible.
                this.scrollContent.addClass( 'with-scrollbar' ); // Add a class for styling.

                // Initialize scrollbar size with a slight delay.
                // A timeout is often necessary for correct rendering in some browsers (e.g., Safari).
                var self = this;
                setTimeout( function () { self._sizeScrollbar() }, 10 );
            } else {
                // If no scrollbar is needed, and it was previously active:
                if ( this.scrollbarActive === true ) {
                    this.scrollbarActive = false; // Set flag to false.
                    this.scrollbarWrapper.hide(); // Hide the scrollbar.
                    this.scrollContent.removeClass( '.with-scrollbar' ); // Remove the styling class.
                }
            }
            // Always ensure content is sized correctly, whether scrollbar is active or not.
            this._sizeContent();
        },

        /**
         * Resizes the content area to accommodate or remove space for a vertical scrollbar.
         * This method currently focuses on vertical scrollbars.
         *
         * TODO: Consider implementing similar logic for horizontal scrollbars if needed,
         *       though designs often account for horizontal scrollbar height implicitly.
         */
        _sizeContent: function () {
            if ( this.options.orientation == "horizontal" ) {
                // Horizontal content sizing currently not implemented.
                // TODO: Add logic here if horizontal scrollbar impacts content height.
            } else {
                // For vertical orientation:
                if ( this.scrollbarActive === true ) {
                    // If scrollbar is active, reduce content width to make space.
                    this.scrollContent.css( "width", this.scrollPane.width() - ( this.scrollbarWrapper.outerWidth( true ) ) );
                } else {
                    // If scrollbar is not active, content takes full width.
                    this.scrollContent.css( "width", "100%" );
                }
            }
        },

        /**
         * Sizes the scrollbar's track and handle proportionally to the content and pane sizes.
         */
        _sizeScrollbar: function () {
            if ( this.options.orientation == "horizontal" ) {
                // Calculate handle size for horizontal scrollbar.
                var handleSize = this._calcScrollBarSize( this.scrollContent.width(), this.scrollPane.width() );
                // Apply calculated size to the slider handle.
                this.scrollbar.find( ".ui-slider-handle" ).css({
                    width       : handleSize,
                    "margin-left" : -handleSize / 2 // Center the handle.
                });
                // Adjust the helper parent width.
                this.handleHelper.width( "" ).width( this.scrollbar.width() - handleSize );
            } else {
                // Calculate handle size for vertical scrollbar.
                var handleSize = this._calcScrollBarSize( this.scrollContent.height(), this.scrollPane.height() );
                // Apply calculated size to the slider handle.
                this.scrollbar.find( ".ui-slider-handle" ).css({
                    height      : handleSize,
                    "margin-top": -( handleSize / 2 ) // Center the handle.
                });
                // Adjust the helper parent height and top margin.
                this.handleHelper.height( "" ).height( this.scrollbar.height() - handleSize ).css( "margin-top", handleSize + 'px' );
            }
        },

        /**
         * Calculates the appropriate size for the scrollbar handle.
         * The handle size is proportional to the visible content area relative to the total content.
         * @param {number} content - The total size (width or height) of the scrollable content.
         * @param {number} pane - The size (width or height) of the visible scroll pane.
         * @returns {number} The calculated size for the scrollbar handle.
         */
        _calcScrollBarSize: function ( content, pane ) {
            var remainder   =   content - pane;     // Amount of content that is not visible.
            var proportion  =   remainder / content; // Proportion of content that is hidden.
            var handleSize  =   pane - ( proportion * pane ); // Calculate handle size based on visible pane.
            return handleSize;
        },

        /**
         * Resets the slider's value based on the current scroll position of the content.
         * This is useful when the content or container size changes.
         */
        _resetValue: function () {
            if ( this.options.orientation == "horizontal" ) {
                // For horizontal scrollbar.
                var remainder   =   this.scrollPane.width() - this.scrollContent.width();
                // Get current margin-left, defaulting to 0 if 'auto'.
                var leftVal     =   this.scrollContent.css( "margin-left" ) === "auto" ? 0 :
                                    parseInt( this.scrollContent.css( "margin-left" ) );
                // Calculate percentage for the slider value.
                var percentage  =   Math.round( leftVal / remainder * 100 );
                this.scrollbar.slider( "value", percentage ); // Update slider.
            } else {
                // For vertical scrollbar.
                var remainder   =   this.scrollPane.height() - this.scrollContent.height();
                // Get current margin-top, defaulting to 0 if 'auto'.
                var topVal      =   this.scrollContent.css( "margin-top" ) === "auto" ? 0 :
                                    parseInt( this.scrollContent.css( "margin-top" ) );
                // Calculate percentage, inverting for vertical scrollbar (top is 100, bottom is 0).
                var percentage  =   Math.round( topVal / remainder * 100 );
                this.scrollbar.slider( "value", 100 - percentage ); // Update slider.
            }
        },

        /**
         * Adjusts the content position to reveal more content if the container size increases,
         * preventing blank space from appearing at the end of the scrollable area.
         */
        _reflowContent: function () {
            if ( this.options.orientation == "horizontal" ) {
                // For horizontal content.
                // Calculate how much content is currently visible.
                var showing = this.scrollContent.width() + parseInt( this.scrollContent.css( "margin-left" ), 10 );
                var gap     = this.scrollPane.width() - showing; // Calculate any blank space.
                if ( gap > 0 ) {
                    // If there's a gap, adjust margin-left to fill it.
                    this.scrollContent.css( "margin-left", parseInt( this.scrollContent.css( "margin-left" ), 10 ) + gap );
                }
            } else {
                // For vertical content.
                // Calculate how much content is currently visible.
                var showing = this.scrollContent.height() + parseInt( this.scrollContent.css( "margin-top" ), 10 );
                var gap     = this.scrollPane.height() - showing; // Calculate any blank space.
                if ( gap > 0 ) {
                    // If there's a gap, adjust margin-top to fill it.
                    this.scrollContent.css( "margin-top", parseInt( this.scrollContent.css( "margin-top" ), 10 ) + gap );
                }
            }
        },

        /**
         * Public method to handle resizing events, ensuring the scrollbar and content
         * adapt correctly to new dimensions.
         */
        resize: function () {
            this._showScrollbar(); // Re-evaluate if scrollbar is needed and show/hide it.
            if ( this.scrollbarActive ) {
                // If scrollbar is active, reset its value and reflow content.
                this._resetValue();
                this._reflowContent();
            }
        },

        /**
         * Scrolls the content to a specific pixel offset.
         * @param {number} offset - The target pixel offset to scroll to.
         */
        scrollToOffset: function ( offset ) {
            if ( this.options.orientation == "horizontal" ) {
                // For horizontal scrolling, calculate the distance.
                var distance = this.calcDistanceToOffset( offset, this.scrollContent.width(), this.containerElement.width() );
                this._scrollHorizontalDistance( distance, this.options.animationDuration );
            } else {
                // For vertical scrolling, calculate the distance.
                var distance = this.calcDistanceToOffset( offset, this.scrollContent.height(), this.containerElement.height() );
                this._scrollVerticalDistance( distance, this.options.animationDuration );
            }
        },

        /**
         * Calculates the actual pixel distance to scroll to a given offset, considering view size.
         * This ensures the content doesn't scroll past its end.
         * @param {number} distance - The desired offset from the start of the content.
         * @param {number} contentSize - The total size (width or height) of the content.
         * @param {number} viewSize - The size (width or height) of the visible pane.
         * @returns {number} The adjusted actual distance to scroll.
         */
        calcDistanceToOffset: function ( distance, contentSize, viewSize ) {
            var contentRemainder    =   contentSize - distance; // Remaining content after the desired offset.
            var remainder           =   viewSize - contentRemainder; // How much of the remaining content fits in the view.
            var actualDistance      =   distance; // Initialize with desired distance.

            if ( remainder < 0 ) {
                // If the remainder is negative, it means the desired offset would show blank space.
                // Adjust the distance to align the end of the content with the end of the view.
                actualDistance = distance + remainder;
            }
            return actualDistance;
        },

        /**
         * Destroys the widget, restoring the DOM to its state before the scrollbar was initialized.
         */
        destroy: function () {
            this.containerChildren.detach(); // Detach the original children.
            this.containerElement.empty();   // Clear the container element.
            this.containerElement.append( this.containerChildren ); // Re-append original children.
        },

        /**
         * Allows setting options after the widget has been initialized.
         * Overrides the default jQuery UI Widget _setOption method.
         * @param {string} option - The name of the option to set.
         * @param {*} value - The new value for the option.
         */
        _setOption: function ( option, value ) {
            // Call the base jQuery UI Widget's _setOption method.
            $.Widget.prototype._setOption.apply( this, arguments );

            // Apply specific behavior for certain options.
            switch ( option ) {
                case 'contentHeight':
                    this.scrollContent.css( "height", value ); // Set content height.
                    this._sizeScrollbar(); // Recalculate scrollbar size.
                    break;
                // Add more cases here for other options that require specific actions.
            }
        }
    });

} )( jQuery );