/*
 * toe.js - A JavaScript library for handling touch and pointer events.
 *
 * Version: 3.0.6
 *
 * Author: Damien Antipa
 *
 * Project Repository: https://github.com/dantipa/toe.js
 *
 * This file contains the core logic for normalizing touch and pointer events
 * and providing a framework for gesture recognition.
 *
 * The code is structured as an Immediately Invoked Function Expression (IIFE)
 * to encapsulate its scope and prevent global variable pollution.
 * It depends on jQuery for DOM manipulation and utility functions like $.each and $.extend.
 *
 */
( function ( $,
             window,
             undefined ) {
    // Define internal state variables
    var state,
        gestures = {}, // Object to store registered gesture handlers
        isTouch = 'ontouchstart' in window, // Feature detection for touch support
        touch = { /** @lends $.toe */
            // The main 'touch' object, which will be exposed as $.toe

            /**
             * Flag to indicate if the touch event tracking mechanism is currently
             * active. When true, event listeners are bound to the document.
             *
             * @type {Boolean}
             */
            active: false,

            /**
             * Initializes the touch event tracking.
             * This method binds the necessary event listeners to the `document` object
             * for 'touchstart', 'touchmove', and 'touchend' events, including
             * their MSPointer and standard Pointer Event equivalents for broader compatibility.
             *
             * This function is implicitly called when `toe.js` is included in a page.
             */
            on: function () {
                // Bind touch start events
                $(document)
                    .on('touchstart MSPointerDown pointerdown', touchstart)
                    // Bind touch move events
                    .on('touchmove MSPointerMove MSPointerHover pointermove', touchmove)
                    // Bind touch end/cancel events
                    .on('touchend touchcancel MSPointerUp MSPointerCancel pointerup pointercancel', touchend);

                // Update the active status flag
                touch.active = true;
            },

            /**
             * Deactivates the touch event tracking.
             * This method unbinds all previously attached touch and pointer event
             * listeners from the `document` object, effectively stopping gesture recognition.
             */
            off: function () {
                // Unbind touch start events
                $(document)
                    .off('touchstart MSPointerDown pointerdown', touchstart)
                    // Unbind touch move events
                    .off('touchmove MSPointerMove MSPointerHover pointermove ', touchmove)
                    // Unbind touch end/cancel events
                    .off('touchend touchcancel MSPointerUp MSPointerCancel pointerup pointercancel', touchend);

                // Update the active status flag
                touch.active = false;
            },

            /**
             * Registers a new gesture handler with the `toe.js` system.
             * Each gesture must provide handler functions for 'touchstart', 'touchmove', and 'touchend'.
             *
             * @param  {String} namespace   A unique string identifier for the gesture (e.g., 'swipe', 'pinch').
             * @param  {Object} gesture     An object containing the handler functions for touch events.
             * @param  {Function} gesture.touchstart  Function to be called when a touch/pointer event starts.
             * @param  {Function} gesture.touchmove   Function to be called when a touch/pointer event moves.
             * @param  {Function} gesture.touchend    Function to be called when a touch/pointer event ends or is cancelled.
             */
            track: function ( namespace, gesture ) {
                gestures[ namespace ] = gesture; // Store the gesture object under its namespace
            },

            /**
             * Adds normalized event parameters to an existing event object.
             * This function calculates `pageX`, `pageY`, `offsetX`, and `offsetY`
             * based on the event's first touch point and the target element's offset.
             *
             * @param  {Event}  event    The original DOM event object.
             * @param  {Object} extra    Optional additional parameters to extend the result with.
             * @return {Object}          An object containing normalized position parameters.
             */
            addEventParam: function ( event, extra ) {
                var $t = $(event.target), // jQuery wrapped target element
                    pos = $t.offset(), // Position of the target element relative to the document
                    param = {
                        pageX: event.point[0].x, // X coordinate of the first touch point
                        pageY: event.point[0].y, // Y coordinate of the first touch point
                        offsetX: pos.left - event.point[0].x, // X offset relative to the element
                        offsetY: pos.top - event.point[0].y // Y offset relative to the element
                    };

                // Extend the 'param' object with any 'extra' parameters provided
                return $.extend( param, extra );
            },

            /**
             * Normalizes a raw DOM event object into a simplified internal format.
             * This ensures consistency across different event types (Touch, MSPointer, PointerEvent).
             *
             * @param  {Event} event  The original DOM event object (e.g., TouchEvent, MSPointerEvent).
             * @return {Object}       A normalized event object with `type`, `timestamp`, `target`, and `point` properties.
             */
            Event: function ( event ) { // This function normalizes and simplifies the raw event object
                var normalizedEvent = {
                    type: event.type, // The original event type string
                    timestamp: new Date().getTime(), // Timestamp of when the event occurred
                    target: event.target, // The DOM element that triggered the event (consistent across phases)
                    point: [] // Array to store normalized touch/pointer points
                };

                var points = []; // Temporary array to hold raw touch/pointer data

                // Check if it's a standard Touch event
                if ( event.type.indexOf('touch') > -1 ) {
                    // For touch events, prefer changedTouches, then originalEvent.changedTouches, then touches
                    points = event.changedTouches || event.originalEvent.changedTouches || event.touches || event.originalEvent.touches;
                }
                // Check if it's an MSPointer or standard Pointer event
                else if ( event.type.match(/.*?pointer.*?/i) ) {
                    // Pointer events often have the point data directly on the event object itself
                    points = [event.originalEvent];
                }

                // Iterate over the raw points and normalize their coordinates
                $.each(points, function ( i, e ) {
                    normalizedEvent.point.push({x: e.pageX, y: e.pageY});
                });

                return normalizedEvent;
            },

            /**
             * Creates a new state object for tracking a gesture's progression.
             * The state object holds the initial touch point and will accumulate
             * move events, eventually storing the end event.
             *
             * @param  {Object} start  The normalized start event object (from `touch.Event`).
             * @return {Object}        A new state object initialized with the start event.
             */
            State: function ( start ) {
                var p = start.point[0]; // Get the first point from the start event

                return {
                    start: start, // The initial normalized touch event
                    move: [], // An array to store subsequent normalized move events
                    end: null // Will store the normalized end touch event
                };
            },

            /**
             * Provides a collection of mathematical utility methods for point arithmetic.
             * These methods are crucial for calculating gesture properties like duration,
             * distance, angle, direction, scale, and rotation.
             *
             * @type {Object}
             */
            calc: {
                /**
                 * Calculates the duration (time difference) between two normalized event points.
                 *
                 * @param  {Object} start  The starting normalized event object.
                 * @param  {Object} end    The ending normalized event object.
                 * @return {Number}        The time elapsed in milliseconds.
                 */
                getDuration: function ( start, end ) {
                    return end.timestamp - start.timestamp;
                },

                /**
                 * Calculates the Euclidean distance between two points in a 2D plane.
                 *
                 * @param  {Object} start  The starting point object with `x` and `y` properties.
                 * @param  {Object} end    The ending point object with `x` and `y` properties.
                 * @return {Number}        The distance in pixels.
                 */
                getDistance: function ( start, end ) {
                    // Uses the Pythagorean theorem: sqrt((x2-x1)^2 + (y2-y1)^2)
                    return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
                },

                /**
                 * Calculates the angle (in degrees) between two points relative to the x-axis.
                 *
                 * @param  {Object} start  The starting point object with `x` and `y` properties.
                 * @param  {Object} end    The ending point object with `x` and `y` properties.
                 * @return {Number}        The angle in degrees, ranging from -180 to 180.
                 */
                getAngle: function ( start, end ) {
                    // Uses atan2 to get the angle in radians, then converts to degrees
                    return Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
                },

                /**
                 * Determines the cardinal direction of a movement based on its angle.
                 *
                 * @param  {Number} angle  The angle of movement in degrees.
                 * @return {String}        'up', 'down', 'left', 'right', or 'unknown'.
                 */
                getDirection: function ( angle ) {
                    // Categorize angle into cardinal directions
                    return angle < -45 && angle > -135 ? 'up' : // -135 to -45 degrees
                        angle >= -45 && angle <= 45 ? 'right' : // -45 to 45 degrees
                            angle >= 45 && angle < 135 ? 'down' : // 45 to 135 degrees
                                angle >= 135 || angle <= -135 ? 'left' : // 135 to 180 or -180 to -135 degrees
                                    'unknown'; // Fallback for undefined angles
                },

                /**
                 * Calculates the scale factor of a multi-touch transformation (e.g., pinch-to-zoom).
                 * Requires two touch points for both start and move events.
                 *
                 * @param  {Object} start  The normalized start event object.
                 * @param  {Object} move   The normalized move event object.
                 * @return {Number}        The scale factor (e.g., 1.5 for 50% zoom in, 0.5 for 50% zoom out).
                 */
                getScale: function ( start, move ) {
                    var sp = start.point, // Start points array
                        mp = move.point; // Move points array

                    // Ensure both start and move events have exactly two touch points
                    if ( sp.length === 2 && mp.length === 2 ) {
                        // Calculate distance between two points at 'move' and divide by distance at 'start'
                        return (Math.sqrt(Math.pow(mp[0].x - mp[1].x, 2) + Math.pow(mp[0].y - mp[1].y, 2)) /
                                Math.sqrt(Math.pow(sp[0].x - sp[1].x, 2) + Math.pow(sp[0].y - sp[1].y, 2)))
                            .toFixed(2); // Return fixed to two decimal places
                    }

                    return 0; // Return 0 if not a two-finger gesture
                },

                /**
                 * Calculates the rotation angle (in degrees) of a multi-touch transformation.
                 * Requires two touch points for both start and move events.
                 *
                 * @param  {Object} start  The normalized start event object.
                 * @param  {Object} move   The normalized move event object.
                 * @return {Number}        The rotation angle in degrees.
                 */
                getRotation: function ( start, move ) {
                    var sp = start.point, // Start points array
                        mp = move.point; // Move points array

                    // Ensure both start and move events have exactly two touch points
                    if ( sp.length === 2 && mp.length === 2 ) {
                        // Calculate the angle formed by the two fingers at 'move' and subtract the angle at 'start'
                        return ((Math.atan2(mp[0].y - mp[1].y, mp[0].x - mp[1].x) * 180 / Math.PI) -
                                (Math.atan2(sp[0].y - sp[1].y, sp[0].x - sp[1].x) * 180 / Math.PI))
                            .toFixed(2); // Return fixed to two decimal places
                    }

                    return 0; // Return 0 if not a two-finger gesture
                }
            }

        }; // End of 'touch' object definition

    /**
     * Helper function to iterate over all registered gesture handlers
     * and call their respective touch event methods.
     *
     * @private
     * @param  {String}   type   The name of the handler method to call (e.g., 'touchstart', 'touchmove').
     * @param  {Event}    event  The original DOM event object.
     * @param  {Object}   state  The current gesture state object.
     * @param  {Object}   point  The normalized point object for the current event.
     */
    function loopHandler( type, event, state, point ) {
        // Iterate through each registered gesture
        $.each(gestures, function ( i, g ) {
            // Call the corresponding method on the gesture handler,
            // ensuring 'this' context is the gesture object itself.
            g[ type ].call( this, event, state, point );
        });
    }

    /**
     * Event handler for 'touchstart', 'MSPointerDown', and 'pointerdown' events.
     * This marks the beginning of a potential gesture.
     *
     * @private
     * @param  {Object} event  The original DOM touch/pointer start event object.
     */
    function touchstart( event ) {
        // Normalize the raw event data
        var start = touch.Event(event);
        // Create a new state object for this gesture session
        state = touch.State(start); // The global 'state' variable is updated

        // Notify all registered gesture handlers about the touch start
        loopHandler('touchstart', event, state, start);
    }

    /**
     * Event handler for 'touchmove', 'MSPointerMove', and 'pointermove' events.
     * This function is triggered as a touch or pointer moves across the screen.
     *
     * @private
     * @param  {Object} event  The original DOM touch/pointer move event object.
     */
    function touchmove( event ) {
        // If there's no active state (i.e., no touchstart occurred), ignore the move event
        if ( !state ) {
            return;
        }

        // Normalize the raw event data for the current move
        var move = touch.Event(event);
        // Add the normalized move event to the state's 'move' history
        state.move.push(move);

        // Notify all registered gesture handlers about the touch move
        loopHandler('touchmove', event, state, move);
    }

    /**
     * Event handler for 'touchend', 'touchcancel', 'MSPointerUp', 'MSPointerCancel',
     * 'pointerup', and 'pointercancel' events. This signifies the end of a gesture.
     *
     * @private
     * @param  {Object} event  The original DOM touch/pointer end or cancel event object.
     */
    function touchend( event ) {
        // Normalize the raw event data for the end event
        var end = touch.Event(event);
        // Store the normalized end event in the state object
        state.end = end;

        // Notify all registered gesture handlers about the touch end
        loopHandler('touchend', event, state, end);
    }

    // Initialize touch event tracking immediately upon script loading.
    // This allows gestures to be tracked as soon as the page is ready.
    touch.on();


    // Expose the 'touch' object under the jQuery namespace as '$.toe'.
    // This makes the functionality accessible to other scripts.
    $.toe = touch;

}( jQuery, this ) ); // Pass jQuery and the global 'this' (window) object to the IIFE