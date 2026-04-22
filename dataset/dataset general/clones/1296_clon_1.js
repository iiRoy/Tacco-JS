/*
 * This file defines the setupKnob function which initializes event listeners
 * for a given knob element, supporting both touch and mouse interactions.
 * It manages active knob states for multi-touch scenarios.
 */

// Global object to keep track of currently active knobs, identified by touch ID.
var activeKnobs = {
};


function setupKnob ( knob, container )
{

    // Retrieve the bounding rectangle of the container element.
    var rect = container.getBoundingClientRect ( );

    /*
     * Set the initial position of the knob based on the container's
     * left and top coordinates, adjusted by clientLeft and clientTop.
     */
    knob.setPosition ( rect.left + container.clientLeft,
                       rect.top + container.clientTop );

    // Set the dimensions (width and height) of the knob to match its container.
    knob.setDimensions ( container.clientWidth,
                         container.clientHeight );


    /*
     * Check if the client environment is touch-capable
     * by looking for 'ontouchstart' in the window object.
     */
    if ( 'ontouchstart' in window )
    {

        // --- Touch event handlers ---

        // Listener for the 'touchstart' event on the container.
        container.addEventListener ( 'touchstart', function ( e )
        {
            // Normalize timeStamp for consistent behavior.
            var timeStamp = e.timeStamp.getTime ? e.timeStamp.getTime ( ) : e.timeStamp;

            // Store the knob in activeKnobs, using the first touch's identifier.
            activeKnobs[ e.targetTouches[0].identifier ] = knob;

            // Delegate the actual touch start logic to the knob object.
            knob.doTouchStart ( e.targetTouches, timeStamp );

            // Prevent default browser actions like scrolling or zooming.
            e.preventDefault ( );
        }, false );


        // Listener for the 'touchmove' event on the document.
        document.addEventListener ( 'touchmove', function ( e )
        {
            // Normalize timeStamp.
            var timeStamp = e.timeStamp.getTime ? e.timeStamp.getTime ( ) : e.timeStamp;

            // Iterate through all changed touches to find corresponding active knobs.
            for ( var i = 0, l = e.changedTouches.length; i < l; i++ )
            {
                var k = activeKnobs[ e.changedTouches[i].identifier ];
                // If a knob is found for the current touch identifier, update its state.
                if ( typeof k !== "undefined" )
                {
                    k.doTouchMove ( [ e.changedTouches[i] ], timeStamp, e.scale );
                }
            }

        }, false );


        // Listener for the 'touchend' event on the document.
        document.addEventListener ( 'touchend', function ( e )
        {
            // Normalize timeStamp.
            var timeStamp = e.timeStamp.getTime ? e.timeStamp.getTime ( ) : e.timeStamp;

            // Signal the knob that a touch sequence has ended.
            knob.doTouchEnd ( timeStamp );
        }, false );


        // Listener for the 'touchcancel' event on the document.
        document.addEventListener ( 'touchcancel', function ( e )
        {
            // Normalize timeStamp.
            var timeStamp = e.timeStamp.getTime ? e.timeStamp.getTime ( ) : e.timeStamp;

            // Treat touch cancellation as an end event for the knob.
            knob.doTouchEnd ( timeStamp );
        }, false );

    } // End of touch-capable client block.
    else
    {
        // --- Mouse event handlers (for non-touch devices) ---

        // Flag to track if the mouse button is currently pressed down.
        var mousedown = false;

        // Listener for the 'mousedown' event on the container.
        container.addEventListener ( 'mousedown', function ( e )
        {
            // Simulate a touch start event using mouse coordinates.
            knob.doTouchStart ( [
                {
                    pageX: e.pageX,
                    pageY: e.pageY
                }
            ], e.timeStamp );

            // Set the mousedown flag to true.
            mousedown = true;
        }, false );

        // Listener for the 'mousemove' event on the document.
        document.addEventListener ( 'mousemove', function ( e )
        {
            // Only process mousemove if a mouse button is pressed.
            if ( !mousedown )
            {
                return;
            }

            // Simulate a touch move event.
            knob.doTouchMove ( [
                {
                    pageX: e.pageX,
                    pageY: e.pageY
                }
            ], e.timeStamp );

            // Ensure mousedown remains true (it should, but just in case).
            mousedown = true;

            // Prevent default text selection during drag operations.
            if ( e.preventDefault )
                e.preventDefault ( );
            e.returnValue = false; // For older IE.
        }, false );

        // Listener for the 'mouseup' event on the document.
        document.addEventListener ( 'mouseup', function ( e )
        {
            // Only process mouseup if a mouse button was previously pressed.
            if ( !mousedown )
            {
                return;
            }

            // Signal the knob that the mouse interaction has ended.
            knob.doTouchEnd ( e.timeStamp );

            // Reset the mousedown flag.
            mousedown = false;
        }, false );

        // Listener for the 'mousewheel' event on the container (primarily for WebKit/Blink).
        container.addEventListener ( 'mousewheel', function ( e )
        {
            // Delegate mouse scroll action to the knob.
            knob.doMouseScroll ( e.wheelDelta, e.timeStamp, e.pageX, e.pageY );
            // Prevent default page scrolling.
            if ( e.preventDefault )
                e.preventDefault ( );
            e.returnValue = false; // For older IE.
        }, false );

        // Listener for the 'DOMMouseScroll' event on the container (for Gecko/Firefox).
        // The original code had a commented-out 'MozMousePixelScroll' which is not standard and thus ignored.
        container.addEventListener ( 'DOMMouseScroll', function ( e )
        {
            // Delegate mouse scroll action, adjusting detail for consistency.
            knob.doMouseScroll ( -4 * e.detail, e.timeStamp, e.pageX, e.pageY );
            // Prevent default page scrolling.
            if ( e.preventDefault )
                e.preventDefault ( );
            e.returnValue = false; // For older IE.
        }, false );

    } // End of non-touch client block.

} // End of setupKnob function definition.