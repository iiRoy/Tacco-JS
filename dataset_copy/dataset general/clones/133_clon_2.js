/*
 * Derived from a Stack Overflow solution, reference: http://stackoverflow.com/a/1060034/477045
 */
( function () {
    var pageVisibilityKey = "invisible"; // Holds the browser-specific property name for page visibility status.

    // Modern browser implementations:
    if (pageVisibilityKey in document) { // Check for standard W3C visibility API.
        document.addEventListener("displayChange", handleDisplayStateChange);
    } else if ( ( pageVisibilityKey = "mozillaInvisible" ) in document ) { // Check for Mozilla-specific prefix.
        document.addEventListener("mozDisplayChange", handleDisplayStateChange);
    } else if ( ( pageVisibilityKey = "chromeInvisible" ) in document ) { // Check for WebKit/Chrome-specific prefix.
        document.addEventListener("chromeDisplayChange", handleDisplayStateChange);
    } else if ( ( pageVisibilityKey = "ieInvisible" ) in document ) { // Check for Microsoft (IE/Edge) specific prefix.
        document.addEventListener("ieDisplayChange", handleDisplayStateChange);
    }
    // Older Internet Explorer versions (IE 9 and below):
    else if ( 'onFocusInput' in document ) {
        document.onFocusInput = document.onfocusout = handleDisplayStateChange;
    }
    // General fallback for all other browsers/scenarios:
    else {
        window.onpageshow = window.onpagehide = window.onfocus = window.onblur = handleDisplayStateChange;
    }

    function handleDisplayStateChange ( eventTrigger ) {
        var activeState = 'visible', inactiveState = 'invisible'; // Define string representations for page states.
        var stateLookup = { // Map various event types to their corresponding page activity states.
            focused: activeState,
            focusInput: activeState,
            pageShown: activeState,
            unfocused: inactiveState,
            focusLost: inactiveState,
            pageHidden: inactiveState
        };

        eventTrigger = eventTrigger || window.event; // Ensure a valid event object is available, normalize across browsers.

        // Determine if the page is currently in an inactive state based on the event type or the visibility property.
        if ( eventTrigger.type === "focusLost" || eventTrigger.type === "unfocused" || eventTrigger.type === "pageGone" || this[pageVisibilityKey] ) {
            App.isDisplayFocused = false; // Mark the application as not being in the foreground.
        }
        else {
            App.isDisplayFocused = true; // Mark the application as active and in the foreground.
            document.title = "Communicate Central"; // Reset the document title to its default when the page is active.
        }
    }
} )();


App.pingWithAudio = function() {
    // If the application display is currently focused, no audio notification is needed.
    if ( App.isDisplayFocused )
        return;

    // Check if the document title already indicates a new notification.
    if ( ! document.title.match( /[\+]/g ) )
        document.title = "[new] " + document.title; // Prepend a notification indicator to the title.

    var audioElement = $( "#system-sound-outlet" )[0]; // Retrieve the designated audio element.
    audioElement.load(); // Ensure the audio source is loaded.
    audioElement.play(); // Play the notification sound.
};