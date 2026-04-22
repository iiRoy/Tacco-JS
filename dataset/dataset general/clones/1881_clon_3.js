// Initialize communication with the browser extension upon script load.
// This ensures that the page acknowledges its presence to the extension system.
// We perform a check for the existence of the 'chrome.extension' API first.
if (typeof chrome !== 'undefined' && chrome.extension) {
    chrome.extension.sendRequest({ 'initialization_event': 'pageLoadComplete' });
}

// Execute code only after the entire Document Object Model (DOM) is fully loaded.
// Using the jQuery shorthand for document ready to ensure all elements are accessible.
jQuery(function($) {

    // Helper function: Extracts a numerical identifier from a given DOM element's ID string.
    // It's designed to find the first sequence of digits within the string.
    function retrieveNumericIdentifier(elementDOMId) {
        // Validation: Ensure the input is a non-empty string.
        if (!elementDOMId || typeof elementDOMId !== 'string') {
            console.warn("Invalid or missing ID string provided for identifier extraction:", elementDOMId);
            return null; // Return null if input is not valid.
        }
        // Use a regular expression to find digits. \D* matches non-digits, (\d+) captures digits.
        const numericMatch = elementDOMId.match(/\D*(\d+)\D*/);
        // Return the captured group (the digits) if a match is found, otherwise null.
        return numericMatch && numericMatch[1] ? numericMatch[1] : null;
    }

    // Helper function: Displays a fleeting notification message to the user on the page.
    // It dynamically creates a message element, styles it, displays it, and then removes it.
    function showEphemeralNotification(messageTextContent, targetContainerSelector) {
        const notificationElementIdentifier = 'temp-user-feedback'; // Unique ID for the temporary message element.
        const targetContainer = $(targetContainerSelector); // Locate the parent container for the message.

        // Pre-check: Verify that the target container exists in the DOM.
        if (!targetContainer.length) {
            console.error("Notification target container not found in the DOM:", targetContainerSelector);
            return; // Abort if the container is missing.
        }

        // Clean up: Remove any previously displayed temporary notification to prevent duplicates.
        $('#' + notificationElementIdentifier).remove();

        // Create a new paragraph element to house the notification text.
        // Apply inline styles for visual presentation and ensure it's on top of other content.
        $('<p>', { id: notificationElementIdentifier })
            .css({
                color: '#333',              // Dark grey text for readability.
                backgroundColor: '#e0ffe0', // Light green background for a "success" feel.
                padding: '5px 10px',        // Internal spacing.
                borderRadius: '3px',        // Slightly rounded corners.
                border: '1px solid #c0ffc0',// Subtle border.
                fontWeight: 'bold',         // Bold text.
                position: 'absolute',       // Allows precise positioning if needed by parent.
                zIndex: '9999',             // Ensures it renders above most other elements.
                // Optionally add top/left/right/bottom for specific positioning within the targetContainer
            })
            .text(messageTextContent) // Use .text() to safely insert content, preventing XSS.
            .prependTo(targetContainer); // Add the message to the beginning of the target container.

        // Animate the notification: quick fade-in, a brief pause, then fade-out and removal.
        targetContainer.fadeIn(20).delay(1200).fadeOut(600, function() {
            $('#' + notificationElementIdentifier).remove(); // Remove the element from the DOM after fading out.
        });
    }

    // Helper function: Dispatches data to the browser extension using its messaging API.
    function postDataToExtension(payloadObject) {
        // Verify that the Chrome extension API is available and the sendRequest method exists.
        if (typeof chrome !== 'undefined' && chrome.extension && chrome.extension.sendRequest) {
            chrome.extension.sendRequest(payloadObject);
            console.log("Payload successfully dispatched to browser extension:", payloadObject);
        } else {
            console.warn("Browser extension API not accessible for sending data. Data not sent:", payloadObject);
        }
    }

    // Attach an event listener to elements that represent story items.
    // Using jQuery's .on() method for event delegation, which is efficient for dynamic content.
    // The event is delegated from the 'body' element to '.story-item-card' elements.
    $('body').on('click', '.story-item-card', function(domEvent) {
        // Crucial: Prevent the browser's default action for the clicked element (e.g., following a link).
        domEvent.preventDefault();
        // Crucial: Stop the event from bubbling up the DOM tree to parent elements.
        domEvent.stopPropagation();

        const currentElement = $(this); // Reference to the clicked DOM element wrapped in jQuery.
        const elementRawId = currentElement.attr('id'); // Retrieve the raw 'id' attribute.
        const entityIdentifier = retrieveNumericIdentifier(elementRawId); // Extract the numeric part.

        // Guard clause: If no valid numeric identifier could be extracted, log a warning,
        // display an error message, and exit the event handler.
        if (!entityIdentifier) {
            console.warn("Unable to obtain a valid entity identifier from element ID:", elementRawId);
            showEphemeralNotification("Error: Identifier acquisition failed!", '#notification-area');
            return;
        }

        let contentToSendToExtension = null; // Variable to hold the data destined for the extension.
        let userNotificationMessage = "";     // Variable to hold the message for the user.

        // Conditional logic based on keyboard modifier keys pressed during the click event.
        // Scenario 1: Alt key is pressed OR (Shift key AND Control key are both pressed).
        if (domEvent.altKey || (domEvent.shiftKey && domEvent.ctrlKey)) {
            const pivotalTrackerBaseURL = 'https://www.pivotaltracker.com/story/show/';
            const fullResourceURL = pivotalTrackerBaseURL + entityIdentifier;
            userNotificationMessage = "Full resource link copied: " + fullResourceURL;
            contentToSendToExtension = fullResourceURL;
        }
        // Scenario 2: Only the Shift key is pressed (checked if Scenario 1 is false).
        else if (domEvent.shiftKey) {
            userNotificationMessage = "Story ID copied: " + entityIdentifier;
            contentToSendToExtension = entityIdentifier;
        }

        // Final action: If content was determined (i.e., a relevant modifier key was pressed).
        if (contentToSendToExtension) {
            showEphemeralNotification(userNotificationMessage, '#notification-area');
            postDataToExtension({ 'copied_payload': contentToSendToExtension });
        } else {
            // Optional: Provide a console message if no specific action was triggered.
            console.info("No specific action was triggered by the combination of modifier keys.");
            // showEphemeralNotification("No action performed.", '#notification-area'); // Could uncomment for user feedback.
        }
    });
});