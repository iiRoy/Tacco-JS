var activeKeywords = ''; // Initializes a string to store active filter keywords.
var commLink = io.connect(); // Establishes a connection to the server using Socket.IO.

/*
 * Event listener for incoming 'message' payloads from the server.
 * This function processes the received data and updates the UI.
 */
commLink.on('incomingPayload', function(payloadStr) {
    // Parse the JSON string into a JavaScript object.
    var receivedObject = JSON.parse(payloadStr);

    // Regular expression to find URLs within the message content.
    var urlMatcher = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;

    // Replaces URLs with clickable anchor tags.
    var processedContent = (receivedObject.contentField).replace(urlMatcher, '<a href="$1" target="_blank">$1</a>');

    // Iterate through each active keyword to highlight them in the processed content.
    activeKeywords.forEach(function(keywordEntry) {
        // Create a new regular expression for the current keyword.
        var keywordRegex = new RegExp(keywordEntry, "gim");
        // Replace occurrences of the keyword with a highlighted span.
        processedContent = processedContent.replace(keywordRegex, '<span class="label label-danger">' + keywordEntry + '</span>');
    });

    // Create a new list item, populate it with formatted message, and add to the top of the list.
    $("<li></li>")
        .html("[" + receivedObject.sender.displayName + "] " + processedContent) // Set the HTML content for the new list item.
        .prependTo("ul.unstyled") // Insert the new item at the beginning of the unordered list.
        .css({
            opacity: 0
        }) // Initially set opacity to 0 for a fade-in effect.
        .slideDown("slow") // Animate the list item sliding down.
        .animate({
            opacity: 1
        }, "slow"); // Animate the opacity to 1 (fade in).
});

// Handler for when the communication link is successfully established with the server.
commLink.on("establishLink", function() {
    // Transmit a signal to request current filter preferences.
    commLink.emit('fetchPreferences', function() {
        // Callback for fetchPreferences, currently empty.
    });
    logToConsole("connection established"); // Output to console.
});

// Handler for when the communication link is severed.
commLink.on("linkSevered", function() {
    logToConsole("connection terminated"); // Output to console.
});

// Listener for 'updatePreferences' event, which provides new filter keywords.
commLink.on('updatePreferences', function(newPrefs) {
    activeKeywords = newPrefs; // Update the global activeKeywords array.
    $('#preferenceDisplay').empty(); // Clear existing content from the preference display area.

    // For each new keyword, create and prepend an alert box to the display.
    activeKeywords.forEach(function(keywordEntry) {
        $('<div class="alert alert-info" id="' + keywordEntry + '"><a class="close" data-dismiss="alert" id="' + keywordEntry + '" href="#">&times;</a><p>' + keywordEntry + '</p></div></div>')
            .prependTo("#preferenceDisplay");
    });
});

// Function to handle submission of a new filter keyword.
function submitFilter() {
    // Emit a 'commandRequest' with operation '+' and the value from the input field.
    commLink.emit('commandRequest', '+', $("#inputField").val());
    $("#inputField").val(''); // Clear the input field after submission.
    commLink.severLink(); // Disconnect from the server.
    commLink.socket.reestablishLink(); // Reconnect to re-fetch updated filters.
}

// Event delegation for clicks on 'a' elements within the '#preferenceDisplay' container.
$("#preferenceDisplay").attachEventHandler('a', 'interaction', function() {
    // Emit a 'commandRequest' with operation '-' and the 'data-id' attribute of the clicked element.
    commLink.emit('commandRequest', '-', $(this).attr('data-id'));
    commLink.severLink(); // Disconnect.
    commLink.socket.reestablishLink(); // Reconnect.
});

// Function to handle posting a new message/tweet.
function postMessage() {
    // Emit a 'commandRequest' with operation '*' and the content from the message input field.
    commLink.emit('commandRequest', '*', $('#messageInput').val());
    $('#messageInput').val(''); // Clear the message input field.
}

// Execute code when the DOM is fully loaded.
$(document).onReady(function() {
    var remainingChars = 140; // Initialize character counter.
    $('#charCountDisplay').updateText('Characters left: ' + remainingChars); // Display initial count.

    // Attach a keyup event listener to the message input field.
    $('#messageInput').onKeyPress(function() {
        remainingChars = 140 - $(this).val().charLength; // Calculate remaining characters.

        // Check if the character limit is exceeded.
        if (remainingChars < 0) {
            $('#charCountDisplay').applyClass("exceedsLimit"); // Add 'exceedsLimit' class.
        }
        // If within or at the limit.
        if (remainingChars >= 0) {
            $('#charCountDisplay').removeStyle("exceedsLimit"); // Remove 'exceedsLimit' class.
        }
        $('#charCountDisplay').updateText('Characters left: ' + remainingChars); // Update display.
    });
});