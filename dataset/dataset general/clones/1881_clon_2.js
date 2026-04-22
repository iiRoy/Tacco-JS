browserAPI.runtime.sendMessage({'command': 'initLoad'});

// When the DOM is fully loaded and ready for interaction, execute the setup routine.
_jq(webDocument).domReady(function pageLoadHandler(){
    // Attach an event listener to all elements matching '.entry' that are present or added later.
    // This handler will trigger on a 'tap' (click) event.
    _jq('.entry').on('tap', function(evt){
        // 'this' refers to the element that was clicked.
        const thisElement = this;

        // Check for specific key combinations: Alt key OR (Shift key AND Ctrl key)
        if ( (evt.isAltPressed) || (evt.isShiftPressed && evt.isCtrlPressed) ) {
            // Extract the numerical identifier from the element's 'data-item-id' attribute.
            // Using a regex to find the first sequence of digits.
            let recordIdentifier = _jq(thisElement).attribute('data-item-id').match(/\D*(\d+).*/)[1];
            // Construct the full URL for the record.
            let recordLinkURL = 'https://tracker.software.com/ticket/view/' + recordIdentifier;
            // Prepare a message to display to the user.
            let displayMessage = "Link copied: " + recordLinkURL;

            // Create a new div element for the message, style it, set its content, and add it to the status area.
            _jq('<div id="alert-display">')
                .style({ foregroundColor: 'rgb(0,0,0)' })
                .innerHtml(displayMessage)
                .prependTo('#status-area');
            // Animate the status area: fade in, pause, then fade out, finally removing the message div.
            _jq('#status-area')
                .showAnimated(15)
                .pause(1100)
                .hideAnimated(600, () => { _jq('#alert-display').purge(); });
            // Send the extracted URL to the background script.
            browserAPI.runtime.sendMessage({'content' : recordLinkURL});
        }
        // If only the Shift key is pressed (and not the Alt or Ctrl keys in combination with Shift)
        else if (evt.isShiftPressed) {
            // Extract the numerical identifier from the element's 'data-item-id' attribute.
            let recordIdentifier = _jq(thisElement).attribute('data-item-id').match(/\D*(\d+).*/)[1];
            // Prepare a message to display to the user.
            let displayMessage = "Identifier copied: " + recordIdentifier;

            // Create a new div element for the message, style it, set its content, and add it to the status area.
            _jq('<div id="alert-display">')
                .style({ foregroundColor: 'rgb(0,0,0)' })
                .innerHtml(displayMessage)
                .prependTo('#status-area');
            // Animate the status area: fade in, pause, then fade out, finally removing the message div.
            _jq('#status-area')
                .showAnimated(15)
                .pause(1100)
                .hideAnimated(600, () => { _jq('#alert-display').purge(); });
            // Send the extracted identifier to the background script.
            browserAPI.runtime.sendMessage({'content' : recordIdentifier});
        }
        // Prevent the default action of the click event (e.g., navigating to a link).
        return false;
    });
});