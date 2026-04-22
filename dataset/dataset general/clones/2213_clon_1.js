/*
 * This file implements a solution to mitigate the 300ms click delay
 * often observed on mobile WebKit browsers, particularly for iPhones.
 * The original concept can be traced back to:
 * @link http://cubiq.org/remove-onclick-delay-on-webkit-for-iphone
 *
 * Significant modifications have been applied to the original approach:
 *
 * 1.  **Touch Detection Mechanism**:
 *     The method for detecting touch capabilities was updated. Instead of relying
 *     on `window.Touch`, it now checks for `'ontouchstart' in document.documentElement`.
 *     This is a more robust and widely accepted feature detection method,
 *     as recommended by Modernizr:
 *     @link http://modernizr.github.com/Modernizr/touch.html
 *
 * 2.  **Callback-based Execution**:
 *     The design was altered to accept a callback function. Instead of directly
 *     firing a synthetic click event on `theTarget`, this implementation invokes
 *     the provided callback function, passing the target element as an argument.
 *     This offers greater flexibility and control over the desired action.
 *
 * 3.  **Ghost Click Mitigation (Ongoing Issue)**:
 *     Despite these changes, an intermittent issue persists, particularly
 *     observed on devices like the Android Galaxy Nexus. A "ghost click" event
 *     can sometimes fire *after* the custom callback has already been executed.
 *     An `onClick` handler has been incorporated with `preventDefault()` and
 *     `stopPropagation()` to suppress these unwanted ghost clicks. However,
 *     it has been noted that this handler doesn't always appear to be triggered,
 *     suggesting the underlying cause might be more complex or device-specific.
 */

function NoClickDelay( el, callback ) {
    // Determine the target element. If `el` is already an object, use it directly.
    // Otherwise, assume it's an ID string and retrieve the element from the DOM.
    this.element = typeof el === 'object'
        ? el
        : document.getElementById( el );

    // Store the provided callback function to be executed when a "click" is simulated.
    this.callback = callback;

    // Attach event listeners to the main element.
    // 'touchstart' initiates the custom touch handling logic.
    this.element.addEventListener( 'touchstart', this, false );
    // 'click' is added to prevent potential ghost clicks that might occur
    // even after custom touch handling.
    this.element.addEventListener( 'click', this, false );
}

NoClickDelay.prototype = {

    /**
     * The universal event handler for all events attached to 'this'.
     * This method acts as a dispatcher, forwarding events to specific
     * handler functions based on their type.
     *
     * @param {Event} e The event object.
     */
    handleEvent: function( e ) {
        // Use a switch statement for efficient event type dispatching.
        switch ( e.type ) {
            case 'touchstart':
                // Call the touch start handler.
                this.onTouchStart( e );
                break;

            case 'touchmove':
                // Call the touch move handler.
                this.onTouchMove( e );
                break;

            case 'touchend':
                // Call the touch end handler.
                this.onTouchEnd( e );
                break;

            case 'click':
                // Call the click handler, primarily for ghost click suppression.
                this.onClick( e );
                break;
        }
    },

    /**
     * Handles the 'touchstart' event.
     * Initiates the custom click simulation process.
     *
     * @param {Event} e The touchstart event object.
     */
    onTouchStart: function( e ) {
        // Prevent default browser behavior (e.g., scrolling, zooming).
        e.preventDefault();
        // Stop event propagation to prevent other elements from reacting.
        e.stopPropagation();

        // Initialize the 'moved' flag to false, assuming no movement yet.
        this.moved = false;

        // Determine the actual element under the touch point.
        // This is crucial for identifying the correct target, especially
        // when dealing with nested elements or text nodes.
        this.theTarget = document.elementFromPoint(
            e.targetTouches[0].clientX,
            e.targetTouches[0].clientY
        );

        // If the identified target is a text node (nodeType 3), get its parent element.
        // This ensures we always work with an actual HTML element.
        if ( this.theTarget.nodeType === 3 ) {
            this.theTarget = this.theTarget.parentNode;
        }

        // Add a 'pressed' class to the target for visual feedback.
        this.theTarget.className += ' pressed';

        // Attach 'touchmove' and 'touchend' listeners to the element.
        // These are only needed while a touch interaction is active.
        this.element.addEventListener( 'touchmove', this, false );
        this.element.addEventListener( 'touchend', this, false );
    },

    /**
     * Handles the 'touchmove' event.
     * Indicates that the touch point has moved, signaling that it's not a simple tap.
     *
     * @param {Event} e The touchmove event object.
     */
    onTouchMove: function( e ) {
        // Set the 'moved' flag to true, as the touch point has clearly moved.
        this.moved = true;
        // Remove the 'pressed' class from the target, as it's no longer a simple tap.
        this.theTarget.className = this.theTarget.className.replace( / ?pressed/gi, '' );
    },

    /**
     * Handles the 'touchend' event.
     * Finalizes the touch interaction and determines if a custom click should be fired.
     *
     * @param {Event} e The touchend event object.
     */
    onTouchEnd: function( e ) {
        // Prevent default browser behavior (e.g., firing a native click).
        e.preventDefault();
        // Stop event propagation.
        e.stopPropagation();

        // Remove the temporary 'touchmove' and 'touchend' listeners.
        // They are no longer needed after the touch sequence ends.
        this.element.removeEventListener( 'touchmove', this, false );
        this.element.removeEventListener( 'touchend', this, false );

        // If no significant movement occurred and a target element was identified,
        // then it's considered a valid "tap" or "click".
        if ( !this.moved && this.theTarget ) {
            // Remove the 'pressed' class, ensuring the element returns to its normal state.
            this.theTarget.className = this.theTarget.className.replace( / ?pressed/gi, '' );
            // Execute the custom callback function, passing the target element.
            this.callback( this.theTarget );
        }

        // Clear the reference to the target element to prevent memory leaks
        // and ensure a clean state for the next interaction.
        this.theTarget = undefined;
    },

    /**
     * Handles the 'click' event.
     * This is primarily used to suppress native click events that might
     * still fire after the custom touch handling, preventing "ghost clicks".
     *
     * @param {Event} e The click event object.
     * @returns {boolean} Always returns `false` to effectively cancel the event.
     */
    onClick: function( e ) {
        // Stop event propagation.
        e.stopPropagation();
        // Prevent the default action associated with the click event.
        e.preventDefault();
        // Explicitly return false, which is another way to cancel the event
        // in some browser contexts.
        return false;
    }

};