/* =========================================================================================================
 * This JavaScript file implements a modal component for user interfaces.
 * Original source: bootstrap-modal.js v2.0.2
 * Project URL: http://twitter.github.com/bootstrap/javascript.html#modals
 *
 * This code is part of the Bootstrap framework, originally developed by Twitter.
 *
 * Copyright (c) 2012 Twitter, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at:
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================================================================= */

// This is a self-executing anonymous function.
// It creates a new scope to prevent variables from leaking into the global scope.
// The jQuery object is passed as '$' for convenience and minification.
!function( $ ) {

    // Enforce strict mode for better error handling and cleaner code practices.
    "use strict"

    /*
     * MODAL CLASS DEFINITION
     * ----------------------
     * This section defines the primary Modal class.
     * It serves as the constructor for all modal instances.
     */

    var Modal = function ( content, options ) {
        // Store the configuration options provided to the modal instance.
        this.options = options;
        // Wrap the content element with jQuery.
        // Delegate a click event to any element within the modal that has 'data-dismiss="modal"'.
        // This event will trigger the 'hide' method of the current modal instance.
        this.$element = $(content)
            .delegate( '[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy( this.hide, this ) );
    }

    // Define the prototype methods for the Modal class.
    // These methods are shared among all instances of Modal.
    Modal.prototype = {

        // The constructor property explicitly points back to the Modal function.
        constructor: Modal,

        // Toggles the visibility state of the modal.
        // If the modal is currently shown, it will hide it; otherwise, it will show it.
        toggle: function () {
            return this[ !this.isShown ? 'show' : 'hide' ]();
        },

        // Displays the modal to the user.
        show: function () {
            var that = this; // Cache 'this' to avoid scope issues in nested functions and callbacks.

            // If the modal is already visible, exit early to prevent redundant operations.
            if ( this.isShown ) return;

            // Add the 'modal-open' class to the body.
            // This class typically modifies body overflow to prevent background scrolling.
            $( 'body' ).addClass( 'modal-open' );

            this.isShown = true; // Update the internal state to reflect that the modal is now shown.
            this.$element.trigger( 'show' ); // Trigger a custom 'show' event on the modal element.

            // Call the 'escape' function to set up keyboard event listeners (e.g., for the 'escape' key).
            escape.call( this );
            // Call the 'backdrop' function to display the modal's background overlay.
            // A callback is provided to execute once the backdrop is in place.
            backdrop.call( this, function () {
                // Determine if CSS transitions are supported and if the modal has the 'fade' class.
                // This dictates whether animations should be applied.
                var transition = $.support.transition && that.$element.hasClass( 'fade' );

                // If the modal element is not currently a child of any parent, append it to the document body.
                // This ensures the modal is correctly positioned in the DOM without moving it unnecessarily if it's already there.
                !that.$element.parent().length && that.$element.appendTo( document.body );

                // Make the modal element visible (e.g., by setting display: block).
                that.$element
                    .show();

                // If transitions are enabled, forcing an `offsetWidth` read can trigger a browser reflow.
                // This is crucial to ensure that CSS transitions (like 'fade in') apply correctly from the initial state.
                if ( transition ) {
                    that.$element[0].offsetWidth; // Force reflow.
                }

                // Add the 'in' class to the modal element.
                // This class typically triggers the CSS fade-in animation for the modal content.
                that.$element.addClass( 'in' );

                // If transitions are being used, wait for the transition to complete before triggering the 'shown' event.
                // Otherwise, trigger the 'shown' event immediately.
                transition
                    ? that.$element.one( $.support.transition.end, function () { that.$element.trigger( 'shown' ); } )
                    : that.$element.trigger( 'shown' );

            } ); // End of backdrop callback.
        },

        // Hides the modal from the user.
        hide: function ( e ) {
            // If an event object is provided, prevent its default action (e.g., preventing a link from navigating).
            e && e.preventDefault();

            // If the modal is not currently shown, exit early.
            if ( !this.isShown ) return;

            var that = this; // Cache 'this'.
            this.isShown = false; // Update the internal state to reflect that the modal is now hidden.

            // Remove the 'modal-open' class from the body, restoring normal scrolling behavior.
            $( 'body' ).removeClass( 'modal-open' );

            // Call the 'escape' function to remove keyboard event listeners.
            escape.call( this );

            // Trigger the 'hide' event on the modal element.
            // Remove the 'in' class to initiate the CSS fade-out animation.
            this.$element
                .trigger( 'hide' )
                .removeClass( 'in' );

            // Check if CSS transitions are supported and if the modal has the 'fade' class.
            // If both are true, use the transition-based hiding mechanism; otherwise, hide immediately.
            $.support.transition && this.$element.hasClass( 'fade' )
                ? hideWithTransition.call( this )
                : hideModal.call( this );
        }

    }; // End of Modal.prototype object.


    /*
     * MODAL PRIVATE METHODS
     * ---------------------
     * These functions are internal helper methods used by the Modal class.
     * They are not directly exposed on the Modal.prototype.
     */

    // Handles the hiding of the modal when CSS transitions are involved.
    function hideWithTransition() {
        var that = this; // Cache 'this'.
        // Set a fallback timeout. If the transitionend event doesn't fire for some reason,
        // this timeout will ensure the modal is hidden after a certain delay.
        var timeout = setTimeout( function () {
            that.$element.off( $.support.transition.end ); // Remove the transitionend listener.
            hideModal.call( that ); // Proceed to immediately hide the modal.
        }, 500 ); // The timeout is set for 500 milliseconds.

        // Listen for the CSS transition end event on the modal element.
        this.$element.one( $.support.transition.end, function () {
            clearTimeout( timeout ); // Clear the fallback timeout, as the transition completed.
            hideModal.call( that ); // Proceed to immediately hide the modal.
        } );
    }

    // Immediately hides the modal element and triggers the 'hidden' event.
    // This function does not involve CSS transitions.
    function hideModal( that ) {
        // Hide the modal element (e.g., by setting display: none).
        // Trigger the 'hidden' event, indicating the modal is no longer visible.
        this.$element
            .hide()
            .trigger( 'hidden' );

        // Call the 'backdrop' function without a callback.
        // When 'isShown' is false, this will remove the backdrop.
        backdrop.call( this );
    }

    // Manages the modal's backdrop (the semi-transparent overlay behind the modal).
    function backdrop( callback ) {
        var that = this; // Cache 'this'.
        // Determine the animation class for the backdrop based on whether the modal itself has a 'fade' class.
        var animate = this.$element.hasClass( 'fade' ) ? 'fade' : '';

        // Condition 1: If the modal is shown and a backdrop is configured in options.
        if ( this.isShown && this.options.backdrop ) {
            // Check if backdrop animation is supported (CSS transitions are active).
            var doAnimate = $.support.transition && animate;

            // Create a new div element for the backdrop, add appropriate classes, and append it to a specific target.
            this.$backdrop = $( '<div class="modal-backdrop ' + animate + '" />' )
                .appendTo( ".bootstrap-force" ); // Appends to an element with class .bootstrap-force.

            // If the backdrop option is not 'static', allow clicks on the backdrop to hide the modal.
            if ( this.options.backdrop != 'static' ) {
                this.$backdrop.click( $.proxy( this.hide, this ) );
            }

            // If animation is enabled, force a reflow for the backdrop to ensure CSS transitions apply.
            if ( doAnimate ) this.$backdrop[0].offsetWidth; // Force reflow.

            // Add the 'in' class to the backdrop to trigger its fade-in animation.
            this.$backdrop.addClass( 'in' );

            // If animation is enabled, wait for the backdrop's transition to end before executing the callback.
            // Otherwise, execute the callback immediately.
            doAnimate
                ? this.$backdrop.one( $.support.transition.end, callback )
                : callback();

        } // Condition 2: If the modal is not shown but a backdrop currently exists.
        else if ( !this.isShown && this.$backdrop ) {
            this.$backdrop.removeClass( 'in' ); // Remove the 'in' class to initiate the backdrop's fade-out.

            // If transitions are supported and the modal has a 'fade' class, wait for the backdrop's transition to end
            // before removing it from the DOM. Otherwise, remove it immediately.
            $.support.transition && this.$element.hasClass( 'fade' )
                ? this.$backdrop.one( $.support.transition.end, $.proxy( removeBackdrop, this ) )
                : removeBackdrop.call( this );

        } // Condition 3: If no backdrop is needed or present, but a callback was provided.
        else if ( callback ) {
            callback(); // Execute the callback directly.
        }
    }

    // Removes the modal backdrop element from the DOM and clears its reference.
    function removeBackdrop() {
        this.$backdrop.remove(); // Remove the jQuery object from the DOM.
        this.$backdrop = null; // Set the reference to null to free up memory.
    }

    // Handles keyboard events, specifically for dismissing the modal with the 'escape' key.
    function escape() {
        var that = this; // Cache 'this'.
        // If the modal is shown and keyboard dismissal is enabled in the options.
        if ( this.isShown && this.options.keyboard ) {
            // Bind a 'keyup' event listener to the document.
            // This listener is namespaced ('keyup.dismiss.modal') to allow easy unbinding.
            $( document ).on( 'keyup.dismiss.modal', function ( e ) {
                // If the pressed key's 'which' property (key code) is 27 (Escape key), hide the modal.
                e.which == 27 && that.hide();
            } );
        } // If the modal is not shown.
        else if ( !this.isShown ) {
            // Unbind the previously attached 'keyup' event listener for modal dismissal.
            $( document ).off( 'keyup.dismiss.modal' );
        }
    }


    /*
     * MODAL PLUGIN DEFINITION
     * -----------------------
     * This section integrates the Modal class into jQuery as a plugin.
     * This allows users to create and control modals using standard jQuery syntax (e.g., $(selector).modal()).
     */

    // Define the 'modal' plugin on jQuery's prototype.
    $.fn.modal = function ( option ) {
        // Iterate over each element in the current jQuery selection.
        return this.each( function () {
            var $this = $( this ); // The current DOM element wrapped in jQuery.
            var data = $this.data( 'modal' ); // Retrieve any existing modal instance data associated with this element.
            // Merge default options with data attributes on the element, and then with any explicitly provided options.
            var options = $.extend( {}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option );

            // If no modal instance exists for this element, create a new one and store it in the element's data.
            if ( !data ) $this.data( 'modal', ( data = new Modal( this, options ) ) );
            // If the 'option' argument is a string, assume it's a method name and call it on the modal instance.
            if ( typeof option == 'string' ) data[option]();
            // If the 'show' option is true, display the modal.
            else if ( options.show ) data.show();
        } );
    };

    // Define the default options for the modal plugin.
    // These defaults can be overridden by data attributes or explicit options.
    $.fn.modal.defaults = {
        backdrop: true, // Boolean: If true, a modal-backdrop element will be shown.
        keyboard: true, // Boolean: If true, the escape key will dismiss the modal.
        show: true      // Boolean: If true, the modal will be shown immediately when initialized.
    };

    // Expose the Modal constructor directly on the plugin.
    // This allows users to access the constructor if they need to extend or instantiate Modal directly.
    $.fn.modal.Constructor = Modal;


    /*
     * MODAL DATA-API
     * --------------
     * This section enables automatic modal functionality via data attributes.
     * It allows modals to be triggered without writing any JavaScript.
     */

    // Execute this function once the DOM is fully loaded.
    $( function () {
        // Delegate a click event listener to the body.
        // This listener targets any element with 'data-toggle="modal"'.
        $( 'body' ).on( 'click.modal.data-api', '[data-toggle="modal"]', function ( e ) {
            var $this = $( this ); // The element that was clicked.
            var href; // Variable to hold the href attribute if needed.
            // Determine the target modal element.
            // It looks for 'data-target' first, then falls back to the 'href' attribute.
            // The regex strips off the base URL for IE7 compatibility if href is a full URL with a hash.
            var $target = $( $this.attr( 'data-target' ) || ( href = $this.attr( 'href' ) ) && href.replace( /.*(?=#[^\s]+$)/, '' ) );
            // Determine the option to pass to the modal plugin.
            // If the target already has modal data, use 'toggle'; otherwise, merge data attributes from target and clicked element.
            var option = $target.data( 'modal' ) ? 'toggle' : $.extend( {}, $target.data(), $this.data() );

            e.preventDefault(); // Prevent the default action of the clicked element (e.g., navigating to a hash).
            $target.modal( option ); // Initialize or interact with the modal on the target element.
        } );
    } );

}( window.jQuery ); // Pass the global jQuery object to the self-executing function.