/*
 * This file contains JavaScript code for handling
 * custom fast-click events and measuring click times.
 * It strictly adheres to "use strict" mode.
 */
"use strict"
;

// Declaration of core DOM elements used throughout the script.

// Element representing the clickable area on the page.
var clickarea = document.getElementById( 'clickarea' )
;

// Element to display the result for 'fastclick' events.
var clickresultfast = document.getElementById( 'clickresultfast' )
;

// Element to display the result for standard 'click' events.
var clickresultslow = document.getElementById( 'clickresultslow' )
;


// -------------------------------------------------------------------------------------------------
// Event Listener Registrations
// -------------------------------------------------------------------------------------------------


// Register a listener for the custom 'fastclick' event.
clickarea.addEventListener( 'fastclick' , function ( e ) {

        // Ensure the event originated from the intended element.
        if ( e.detail == clickarea )
        {
            // Capture the current time in milliseconds.
            var currentTime = new Date().getMilliseconds()
            ;

            // Update the display with the calculated fast click duration.
            clickresultfast.innerText = 'Fast Click: ' + ( currentTime - touchStartTime ) + 'ms'
            ;
        }

    } , false )
;


// Register a listener for the standard 'click' event.
clickarea.addEventListener( 'click' , function ( e ) {

        // Confirm the target of the click event.
        if ( e.target == clickarea )
        {
            // Get the current time for calculation.
            var currentTime = new Date().getMilliseconds()
            ;

            // Display the duration for a normal click.
            clickresultslow.innerText = 'Normal Click: ' + ( currentTime - touchStartTime ) + 'ms'
            ;
        }

    } , false )
;


// -------------------------------------------------------------------------------------------------
// Touch Start Time Tracking
// -------------------------------------------------------------------------------------------------

// Variable to store the timestamp when a touch sequence begins.
var touchStartTime = false
;

// Attach a 'touchstart' listener to the document to record the start time.
document.addEventListener( 'touchstart' , function ( ) {

    // Record the current time in milliseconds.
    touchStartTime = new Date().getMilliseconds()
    ;

} , false )
;


/*
 * Self-executing anonymous function (IIFE) to encapsulate
 * the logic for creating and dispatching the custom "fastclick" event.
 * This prevents global variable pollution.
 */
( function ( ) {

    // Flag to determine if a touch sequence should result in a fast click.
    var touchClick = false
    ;

    // Listener for 'touchstart': Marks the beginning of a potential fast click.
    document.addEventListener( "touchstart" , function ( ) {
        touchClick = true
    } , false )
    ;

    // Listener for 'touchmove': If the finger moves, it's not a simple tap, so disable fast click.
    document.addEventListener( "touchmove" , function ( ) {
        touchClick = false
    } , false )
    ;

    // Listener for 'touchend': The final stage to decide if a fast click should be dispatched.
    document.addEventListener( "touchend" , function ( e ) {

        // Check if the touch sequence was a simple tap (no move).
        if ( touchClick )
        {
            // Reset the flag to prevent multiple dispatches for one touch sequence.
            touchClick = false
            ;

            // -------------------------------------------------------------------------------------
            // Send the custom "fastclick" event.
            // -------------------------------------------------------------------------------------

            // Create a new custom event object.
            var event = document.createEvent( "CustomEvent" )
            ;

            // Initialize the custom event:
            // - "fastclick" is the event name.
            // - true: event bubbles up the DOM tree.
            // - true: event is cancelable.
            // - e.target: the data payload, indicating the element that was touched.
            event.initCustomEvent( "fastclick" , true , true , e.target )
            ;

            // Dispatch the custom event on the element that was touched.
            e.target.dispatchEvent( event )
            ;
        }
    } , false )
    ;

}( ) )
;