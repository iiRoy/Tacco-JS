/*
 * This file implements the longpress jQuery plugin.
 *
 * It provides functionality to detect long press events on various devices,
 * including standard desktop browsers and mobile touch-enabled devices.
 *
 * Plugin Name: longpress
 * Version:     0.1.2
 *
 * Dependencies:
 *   - jQuery library (version 1.2.3 or higher is required).
 *
 * Author: Vaidik Kapoor
 * Contact: kapoor [dot] vaidik -[at]- gmail [dot] com
 *
 * License: MIT License
 *          Details: http://www.opensource.org/licenses/mit-license.php
 *
 * For detailed usage instructions, examples, and further documentation,
 * please refer to the project's README file available at:
 * http://github.com/vaidik/jquery-longpress/
 *
 * Copyright (c) 2008-2013, Vaidik Kapoor. All rights reserved.
 *
 */

( function ( $ ) {
    // This is the core plugin definition, extending jQuery's prototype.
    $.fn.longpress = function ( longCallback, shortCallback, duration ) {

        // If the duration for the long press event is not explicitly provided,
        // a default value of 500 milliseconds (half a second) is used.
        if ( typeof duration === "undefined" ) {

            duration = 500; // Default long press duration in ms.
        }


        // The 'each' method ensures that the longpress functionality
        // is applied to every element in the jQuery collection.
        return this.each( function ( ) {

            var $this = $( this ); // Cache the jQuery object for the current element.

            // These variables are essential for tracking the state of the press event.
            // mouse_down_time will store the timestamp when the press started.
            var mouse_down_time;

            // timeout will hold the ID of the setTimeout call, allowing it to be cleared.
            var timeout;


            /**
             * Handles the initial 'mousedown' or 'touchstart' event.
             * This function initiates the long press timer.
             * @param {Event} e - The event object.
             */
            function mousedown_callback ( e ) {

                // Record the exact time when the mouse button was pressed down
                // or the touch event started.
                mouse_down_time = new Date( ).getTime( );

                // Store the context of the element that triggered the event.
                // This will be passed to the callback functions.
                var context = $( this );

                // Set up a timer. If the mouse button remains pressed (or touch remains active)
                // for the specified 'duration', the long press callback will be invoked.
                timeout = setTimeout(
                    function ( ) {
                        // Check if a valid longCallback function was provided.
                        if ( typeof longCallback === "function" ) {

                            // Execute the long press callback in the context of the element,
                            // passing the original event object.
                            longCallback.call( context, e );

                        } else {
                            // If no valid long press callback is supplied, an error is thrown.
                            $.error( 'A valid callback function is absolutely required for the long press event. You provided: ' + typeof longCallback );
                        }
                    },
                    duration // The time in milliseconds after which the long press callback should fire.
                ); // End of setTimeout call.

            } // End of mousedown_callback function.


            /**
             * Handles the 'mouseup' or 'touchend' event.
             * This function determines if the press was a 'short' press or a 'long' press.
             * @param {Event} e - The event object.
             */
            function mouseup_callback ( e ) {

                // Calculate the total duration for which the mouse button was held down
                // or the touch was active.
                var press_time = new Date( ).getTime( ) - mouse_down_time;

                // If the press duration is less than the defined 'duration' for long press,
                // then it's considered a short press.
                if ( press_time < duration ) {

                    // It's crucial to cancel the pending long press timeout,
                    // as the press was released before the long press duration elapsed.
                    clearTimeout( timeout );

                    // If a specific callback for a short press was provided, invoke it.
                    if ( typeof shortCallback === "function" ) {

                        // Call the short press callback in the context of the element.
                        shortCallback.call( $( this ), e );

                    }
                    // If shortCallback was explicitly undefined (meaning no short press action),
                    // we do nothing. The semicolon here represents an empty statement.
                    else if ( typeof shortCallback === "undefined" ) { ; }

                    // If shortCallback was provided but is not a function, throw an error.
                    else {
                        $.error( 'The optional callback for a short press event must be a function type.' );
                    }
                } // End of if (press_time < duration) block.

            } // End of mouseup_callback function.


            /**
             * Handles 'mousemove' or 'touchmove' events.
             * If the mouse or finger moves significantly during a press,
             * the long press event should be canceled.
             * @param {Event} e - The event object.
             */
            function move_callback ( e ) {

                // Clear the timeout for the long press. Any movement during a press
                // invalidates a potential long press event.
                clearTimeout( timeout );

            } // End of move_callback function.


            // --- Event Bindings for Desktop Browsers ---

            // Bind the mousedown event to initiate the long press detection.
            $this.on( 'mousedown', mousedown_callback );

            // Bind the mouseup event to determine if it was a short or long press.
            $this.on( 'mouseup',   mouseup_callback   );

            // Bind the mousemove event to cancel the long press if the mouse drifts.
            $this.on( 'mousemove', move_callback      );


            // --- Event Bindings for Mobile / Touch Devices ---

            // Bind the touchstart event, analogous to mousedown for touch.
            $this.on( 'touchstart', mousedown_callback );

            // Bind the touchend event, analogous to mouseup for touch.
            $this.on( 'touchend',   mouseup_callback   );

            // Bind the touchmove event to cancel if the finger moves.
            $this.on( 'touchmove',  move_callback      );

        } ); // End of this.each function.

    }; // End of $.fn.longpress definition.

} ( jQuery ) ); // End of the IIFE (Immediately Invoked Function Expression).