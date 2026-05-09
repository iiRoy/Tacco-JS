/*
 * This file contains logic for tracking page visibility and notifying users.
 * The core logic for visibility change detection is derived from a Stack Overflow answer.
 * See: http://stackoverflow.com/a/1060034/477045 for original inspiration.
 */

( function () { /* Start of the Immediately Invoked Function Expression (IIFE) */


    var hidden = "hidden"; // Variable to store the name of the hidden property, initialized to standard.


    // --- Section: Browser Compatibility Checks for Visibility API ---

    // Attempt to use the standard W3C Visibility API first.
    if ( hidden in document )
        document.addEventListener( "visibilitychange", onVisibilityChange );
    // Check for Mozilla's prefixed version.
    else if ( ( hidden = "mozHidden" ) in document )
        document.addEventListener( "mozvisibilitychange", onVisibilityChange );
    // Check for Webkit's prefixed version (Chrome, Safari, older Edge).
    else if ( ( hidden = "webkitHidden" ) in document )
        document.addEventListener( "webkitvisibilitychange", onVisibilityChange );
    // Check for Microsoft's prefixed version (IE10+, older Edge).
    else if ( ( hidden = "msHidden" ) in document )
        document.addEventListener( "msvisibilitychange", onVisibilityChange );

    // --- Fallback for Older Browsers ---

    // For Internet Explorer 9 and earlier, which use focus/blur events.
    else if ( 'onfocusin' in document )
        document.onfocusin = document.onfocusout = onVisibilityChange;
    // Generic fallback for all other browsers that do not support the above.
    else
        window.onpageshow = window.onpagehide
            = window.onfocus = window.onblur = onVisibilityChange;


    /**
     * Handles changes in page visibility or focus.
     * This function updates the application's page activity status.
     * @param {Event} evt - The event object, if available.
     */
    function onVisibilityChange ( evt ) {

        // Define constants for visibility states.
        var v = 'visible',
            h = 'hidden';

        // Map event types to their corresponding visibility states.
        var evtMap = {
            focus    : v,
            focusin  : v,
            pageshow : v,
            blur     : h,
            focusout : h,
            pagehide : h
        };

        // Normalize the event object for cross-browser compatibility.
        evt = evt || window.event;

        // Determine if the page is active based on event type or the hidden property.
        if ( evt.type == "focusout" || evt.type == "blur" || evt.type == "pagehige" || this[hidden] ) {
            // If any of these conditions are met, the page is considered inactive.
            App.isPageActive = false;
        }
        else {
            // Otherwise, the page is active.
            App.isPageActive = true;
            // Optionally, update the document title to reflect activity.
            document.title = "Mogo Chat";
        }

    } // End of onVisibilityChange function.

} )(); /* End of IIFE */


/*
 * This section defines a utility function within the global 'App' object
 * for playing a sound notification.
 */
App.notifyBySound = function () {

    // If the page is currently active, no sound notification is needed.
    if ( App.isPageActive )
        return;

    // Check if the document title already indicates a new notification.
    if ( !document.title.match( /[\+]/g ) ) {
        // Prepend a notification indicator to the document title.
        document.title = "[+] " + document.title;
    }

    // Get the audio element.
    $audio = $( "#app-audio" )[0];

    // Reload the audio element to ensure it plays from the beginning.
    $audio.load();

    // Play the audio notification.
    $audio.play();

}; // End of notifyBySound function definition.