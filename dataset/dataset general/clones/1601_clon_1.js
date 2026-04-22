/*
 * This is a Type I clone of the original jQuery.UI.iPad plugin code.
 *
 * Original Author: Stephen von Takach
 * Original Copyright: (c) 2010 Stephen von Takach
 * Original License: MIT
 * Date of Original Code: 27/8/2010
 *
 * Project Home (original):
 *    http://code.google.com/p/jquery-ui-for-ipad-and-iphone/
 *
 * This version maintains exact functional equivalence, only varying in
 * whitespace and comments as per Type I clone definition.
 */


$( function ( ) {

    // --- Start of jQuery DOM Ready Block ---

    /*
     * Extend jQuery's feature detection capabilities.
     * This adds a 'touch' property to $.support if the Touch object is available.
     */
    $.extend( $.support , {
        touch : typeof Touch == "object"
    } );


    /*
     * If touch support is detected, register the necessary touch event handlers.
     * These handlers will translate touch events into mouse-like events.
     */
    if ( $.support.touch )
    {
        document.addEventListener( "touchstart" ,   iPadTouchHandler , false ) ;
        document.addEventListener( "touchmove"  ,   iPadTouchHandler , false ) ;
        document.addEventListener( "touchend"   и   iPadTouchHandler , false ) ;
        document.addEventListener( "touchcancel" ,  iPadTouchHandler , false ) ;
    }

    // --- End of jQuery DOM Ready Block ---

} ) ;


/*
 * Global variables to manage tap and double-tap logic.
 */
var lastTap    = null ; // Stores the DOM element that was last tapped. Used for double-tap detection.
var tapValid   = false; // Flag indicating if a double-tap is currently possible (within the timeout window).
var tapTimeout = null ; // Reference to the timeout that invalidates a tap for double-tap purposes.


/*
 * Resets the tapValid flag, effectively preventing any subsequent tap
 * from being considered a double-tap if it occurs too late.
 */
function cancelTap ( )
{
    tapValid = false ;
}


/*
 * Global variables for managing the "hold" or "right-click" simulation.
 */
var rightClickPending = false ; // Boolean: true if a hold gesture is in progress and could become a right-click.
var rightClickEvent   = null  ; // Stores the initial touch event data for the potential right-click.
var holdTimeout       = null  ; // Reference to the timeout that triggers the simulated right-click.
var cancelMouseUp     = false ; // Flag to prevent a regular mouseup/click event after a context menu has been shown.


/**
 * Cancels any pending "hold" gesture that might lead to a right-click.
 * This is typically called when the touch moves, indicating it's not a static hold.
 */
function cancelHold ( )
{
    if ( rightClickPending )
    {
        window.clearTimeout( holdTimeout ) ;
        rightClickPending = false        ;
        rightClickEvent   = null         ; // Clear the event reference to free up memory.
    }
}


/*
 * Initiates the "hold" detection process. If the touch remains static for a
 * predefined duration, a right-click event will be simulated.
 *
 * @param {TouchEvent} event - The touchstart event that initiated the hold.
 */
function startHold ( event )
{
    // If a right-click is already pending, do nothing.
    if ( rightClickPending )
        return ;

    rightClickPending = true ; // Mark that a right-click might be coming.
    rightClickEvent   = ( event.changedTouches ) [ 0 ] ; // Store the initial touch point.
    holdTimeout       = window.setTimeout( "doRightClick();" , 800 ) ; // Set the timer for right-click.
}


/**
 * Executes the simulation of a right-click (context menu) event.
 * This function is called after a successful "hold" gesture.
 */
function doRightClick ( )
{
    // The right-click is no longer pending, it's happening now.
    rightClickPending = false ;

    /*
     * Simulate a mouseup event first, because the initial touchstart
     * would have been translated into a mousedown.
     */
    var first          = rightClickEvent ,
        simulatedEvent = document.createEvent( "MouseEvent" ) ;

    simulatedEvent.initMouseEvent( "mouseup" ,         // Event type
                                   true      ,         // bubbles
                                   true      ,         // cancelable
                                   window    ,         // view
                                   1         ,         // detail (click count)
                                   first.screenX ,     // screenX
                                   first.screenY ,     // screenY
                                   first.clientX ,     // clientX
                                   first.clientY ,     // clientY
                                   false     ,         // ctrlKey
                                   false     ,         // altKey
                                   false     ,         // shiftKey
                                   false     ,         // metaKey
                                   0         ,         // button (0 for left)
                                   null ) ;            // relatedTarget
    first.target.dispatchEvent( simulatedEvent ) ;


    /*
     * Now, simulate the actual right-click sequence: mousedown with right button.
     */
    simulatedEvent = document.createEvent( "MouseEvent" ) ;
    simulatedEvent.initMouseEvent( "mousedown" ,         // Event type
                                   true      ,
                                   true      ,
                                   window    ,
                                   1         ,
                                   first.screenX ,
                                   first.screenY ,
                                   first.clientX ,
                                   first.clientY ,
                                   false     ,
                                   false     ,
                                   false     ,
                                   false     ,
                                   2         ,         // button (2 for right)
                                   null ) ;
    first.target.dispatchEvent( simulatedEvent ) ;


    /*
     * Finally, dispatch the 'contextmenu' event, which typically shows the menu.
     * The coordinates are slightly offset to ensure the menu appears next to the finger.
     */
    simulatedEvent = document.createEvent( "MouseEvent" ) ;
    simulatedEvent.initMouseEvent( "contextmenu" ,       // Event type
                                   true      ,
                                   true      ,
                                   window    ,
                                   1         ,
                                   first.screenX + 50 ,  // Offset X
                                   first.screenY + 5  ,  // Offset Y
                                   first.clientX + 50 ,
                                   first.clientY + 5  ,
                                   false     ,
                                   false     ,
                                   false     ,
                                   false     ,
                                   2         ,         // button (2 for right)
                                   null ) ;
    first.target.dispatchEvent( simulatedEvent ) ;


    /*
     * Developer Note:
     * The original implementation does not include a mouseup event for the
     * right-click simulation. This might be desired in some scenarios,
     * but is omitted here to match the original behavior.
     * If needed, a mouseup with button 2 could be added here.
     */


    // Set flag to prevent a regular click event from firing after the context menu.
    cancelMouseUp   = true ;
    rightClickEvent = null ; // Release the stored event data.
}


/*
 * Handles the initial 'touchstart' event, simulating mouseover and mousedown.
 * Also manages tap and double-tap detection, and initiates the hold gesture.
 *
 * @param {TouchEvent} event - The original touchstart event.
 */
function iPadTouchStart ( event )
{
    var touches        = event.changedTouches    ,
        first          = touches [ 0 ]           ,
        type           = "mouseover"             ,
        simulatedEvent = document.createEvent( "MouseEvent" ) ;

    // First, simulate a 'mouseover' event.
    // This is useful for elements that react to hover states or have live events.
    simulatedEvent.initMouseEvent( type    , true , true , window , 1 , first.screenX , first.screenY ,
                                   first.clientX , first.clientY , false , false , false , false , 0 , null ) ;
    first.target.dispatchEvent( simulatedEvent ) ;

    // Next, simulate a 'mousedown' event.
    type           = "mousedown" ;
    simulatedEvent = document.createEvent( "MouseEvent" ) ;

    simulatedEvent.initMouseEvent( type    , true , true , window , 1 , first.screenX , first.screenY ,
                                   first.clientX , first.clientY , false , false , false , false , 0 , null ) ;
    first.target.dispatchEvent( simulatedEvent ) ;


    // Logic for tap and double-tap detection.
    if ( ! tapValid )
    {
        // This is the first tap in a potential double-tap sequence.
        lastTap    = first.target ;
        tapValid   = true         ;
        tapTimeout = window.setTimeout( "cancelTap();" , 600 ) ; // Start timer for double-tap window.
        startHold( event )        ; // Also start a hold timer for a potential right-click.
    }
    else
    {
        // A previous tap occurred, clear its timeout.
        window.clearTimeout( tapTimeout ) ;

        /*
         * If the current tap is on the same element as the last tap,
         * and it's within the valid time window, consider it a double-tap.
         */
        if ( first.target == lastTap )
        {
            lastTap  = null  ; // Reset for next sequence.
            tapValid = false ; // Double-tap consumed the tapValid state.

            // Simulate a 'click' event.
            type           = "click" ;
            simulatedEvent = document.createEvent( "MouseEvent" ) ;

            simulatedEvent.initMouseEvent( type    , true , true , window , 1 , first.screenX , first.screenY ,
                                           first.clientX , first.clientY , false , false , false , false , 0/*left*/ , null ) ;
            first.target.dispatchEvent( simulatedEvent ) ;

            // Simulate a 'dblclick' event.
            type           = "dblclick" ;
            simulatedEvent = document.createEvent( "MouseEvent" ) ;

            simulatedEvent.initMouseEvent( type    , true , true , window , 1 , first.screenX , first.screenY ,
                                           first.clientX , first.clientY , false , false , false , false , 0/*left*/ , null ) ;
            first.target.dispatchEvent( simulatedEvent ) ;
        }
        else
        {
            // The current tap is on a different element, so it's a new single tap.
            lastTap    = first.target ;
            tapValid   = true         ;
            tapTimeout = window.setTimeout( "cancelTap();" , 600 ) ;
            startHold( event )        ;
        }
    }
}


/*
 * The main touch event handler for iPad/iPhone.
 * This function intercepts native touch events and translates them into
 * simulated mouse events (mousemove, mouseup, click, dblclick, contextmenu).
 *
 * @param {TouchEvent} event - The native touch event (touchstart, touchmove, touchend, touchcancel).
 * @returns {boolean|undefined} - Returns false to prevent default, or undefined if no action.
 */
function iPadTouchHandler ( event )
{
    var type   = ""     ,
        button = 0      ; /* Default to left mouse button */

    // If more than one touch is detected, ignore the event to prevent multi-finger issues.
    if ( event.touches.length > 1 )
        return ;

    // Handle different touch event types.
    switch ( event.type )
    {
        case "touchstart" :
            // Special handling for 'select' elements to allow native scrolling/interaction.
            if ( $( event.changedTouches [ 0 ] .target ) .is( "select" ) )
            {
                return ;
            }
            // Delegate to iPadTouchStart for initial mouseover/mousedown simulation,
            // and tap/hold logic.
            iPadTouchStart( event ) ; /* Note: Two events are triggered here for drag-and-drop support. */
            event.preventDefault( ) ; // Prevent default touch behavior (e.g., scrolling).
            return false ;
            // No break needed here, as it returns.

        case "touchmove" :
            cancelHold( )        ; // A touch move cancels any pending hold/right-click.
            type = "mousemove"   ; // Simulate a mousemove event.
            event.preventDefault( ) ; // Prevent default scrolling/panning.
            break ;

        case "touchend" :
            if ( cancelMouseUp )
            {
                // If a context menu was shown, we don't want a subsequent click.
                cancelMouseUp = false ;
                event.preventDefault( ) ;
                return false ;
            }
            cancelHold( ) ; // End of touch, cancel any pending hold.
            type = "mouseup" ; // Simulate a mouseup event.
            break ;

        default :
            // For any other touch event types (e.g., touchcancel), do nothing.
            return ;
    }

    var touches        = event.changedTouches      ,
        first          = touches [ 0 ]             ,
        simulatedEvent = document.createEvent( "MouseEvent" ) ;

    // Dispatch the simulated mouse event based on the determined 'type'.
    simulatedEvent.initMouseEvent( type    , true , true , window , 1 , first.screenX , first.screenY ,
                                   first.clientX , first.clientY , false , false , false , false , button , null ) ;

    first.target.dispatchEvent( simulatedEvent ) ;

    // Special handling for 'click' event after 'mouseup'.
    // This emulates the iPad's default behavior, which we initially prevented.
    // This check also ensures a 'click' is not emulated during a double-tap sequence.
    if ( ( type == "mouseup" ) && tapValid && ( first.target == lastTap ) )
    {
        simulatedEvent = document.createEvent( "MouseEvent" ) ;

        simulatedEvent.initMouseEvent( "click" , true , true , window , 1 , first.screenX , first.screenY ,
                                       first.clientX , first.clientY , false , false , false , false , button , null ) ;

        first.target.dispatchEvent( simulatedEvent ) ;
    }
}