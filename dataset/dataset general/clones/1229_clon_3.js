let activeKeywordList = [];

const realtimeClient = io.connect();

function hyperlinkifyUrls(rawText) {
    const urlDetectionPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    return rawText.replace(urlDetectionPattern, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

function applyKeywordHighlighting(sourceText, keywordsToHighlight) {
    let highlightedOutput = sourceText;
    if (!Array.isArray(keywordsToHighlight) || keywordsToHighlight.length === 0) {
        return highlightedOutput;
    }
    keywordsToHighlight.forEach(function(currentFilterTerm) {
        const termSearchPattern = new RegExp(currentFilterTerm, "gim");
        highlightedOutput = highlightedOutput.replace(termSearchPattern, '<span class="label label-danger text-highlight">'+currentFilterTerm+'</span>');
    });
    return highlightedOutput;
}

realtimeClient.on('message', function(incomingDataString) {
    if (!incomingDataString || typeof incomingDataString !== 'string') {
        console.warn('Received an empty or invalid message payload. Skipping processing.');
        return;
    }

    let eventDetails;
    try {
        eventDetails = JSON.parse(incomingDataString);
    } catch (parseError) {
        console.error('Failed to parse incoming message JSON:', parseError);
        return;
    }

    if (!eventDetails || !eventDetails.text || !eventDetails.user || !eventDetails.user.screen_name) {
        console.warn('Received incomplete message data structure:', eventDetails);
        return;
    }

    let processedContentHtml = hyperlinkifyUrls(eventDetails.text);
    processedContentHtml = applyKeywordHighlighting(processedContentHtml, activeKeywordList);

    const displayUsername = eventDetails.user.screen_name;
    const constructedListItemHtml = `<span>[${displayUsername}] ${processedContentHtml}</span>`;

    const messageListContainer = $("ul.unstyled");
    if (!messageListContainer.length) {
        console.warn("Message display list (ul.unstyled) not found.");
        return;
    }

    const newMessageElement = $("<li></li>")
        .html(constructedListItemHtml)
        .css({opacity:0}); // Start invisible for animation.

    newMessageElement.prependTo(messageListContainer)
        .slideDown("slow", function() {
            $(this).animate({opacity:1},"slow");
        });
});

realtimeClient.on("connect", function() {
    console.log("Real-time client connection established.");
    realtimeClient.emit('getfilter', () => {
        console.info('Requested current filter list from server.');
    });
});

realtimeClient.on("disconnect", function() {
    console.log("Real-time client disconnected from server.");
});

realtimeClient.on('pushfilter', function(updatedTrackingList) {
    if (!Array.isArray(updatedTrackingList)) {
        console.error('Received invalid filter list format; expected an array.', updatedTrackingList);
        return;
    }
    activeKeywordList = updatedTrackingList;

    const trackerDisplayArea = $('#tracker');
    if (!trackerDisplayArea.length) {
        console.warn("Tracker display area (#tracker) not found in DOM.");
        return;
    }

    trackerDisplayArea.empty(); // Clear existing filter visualizations.

    if (activeKeywordList.length === 0) {
        trackerDisplayArea.append('<div class="alert alert-info no-filters-message">No keywords are currently being monitored.</div>');
    } else {
        activeKeywordList.forEach(function(currentFilterTerm) {
            const safeFilterId = encodeURIComponent(currentFilterTerm);
            const filterDisplayHtml = `
                <div class="alert alert-info filter-item" id="filter-${safeFilterId}">
                    <a class="close" data-dismiss="alert" aria-label="Remove filter" href="#" data-filter-value="${currentFilterTerm}">&times;</a>
                    <p>${currentFilterTerm}</p>
                </div>`;
            trackerDisplayArea.prepend(filterDisplayHtml);
        });
    }
});

function initiateFilterAddition() {
    const termInput = $("#data");
    const newTrackingTerm = termInput.val().trim();

    if (newTrackingTerm.length === 0) {
        alert("Please provide a keyword to begin tracking.");
        termInput.focus();
        return;
    }

    if (activeKeywordList.includes(newTrackingTerm)) {
        alert(`"${newTrackingTerm}" is already being tracked.`);
        termInput.focus();
        return;
    }

    realtimeClient.emit('data', '+', newTrackingTerm);
    console.log(`Sending request to add tracking term: "${newTrackingTerm}"`);
    termInput.val(''); // Clear the input field.
    // Removed unnecessary connection cycling.
}

$("#tracker").delegate('a.close', 'click', function(event) {
    event.preventDefault();
    const clickedAnchor = $(this);
    const filterValueToRemove = clickedAnchor.data('filter-value');

    if (!filterValueToRemove) {
        console.error('Could not determine filter value from clicked element for removal.');
        return;
    }

    realtimeClient.emit('data', '-', filterValueToRemove);
    console.log(`Sending request to remove tracking term: "${filterValueToRemove}"`);

    // Optimistically remove the display item from the UI.
    clickedAnchor.closest('.filter-item').remove();
    // Removed unnecessary connection cycling.
});

function updateTweetCharacterCounter(inputElement) {
    const characterLimit = 140;
    const currentTweetLength = inputElement.val().length;
    let charactersRemaining = characterLimit - currentTweetLength;

    const counterDisplayElement = $('#text_counter');
    if (!counterDisplayElement.length) {
        console.warn('Tweet character counter display element (#text_counter) not found.');
        return;
    }

    counterDisplayElement.text(`Characters left: ${charactersRemaining}`);

    if (charactersRemaining < 0) {
        counterDisplayElement.addClass("overlimit");
    } else {
        counterDisplayElement.removeClass("overlimit");
    }
}

function dispatchUserMessage() {
    const tweetInputField = $('#tweet');
    const userMessageContent = tweetInputField.val().trim();
    const maxTweetLength = 140;

    if (userMessageContent.length === 0) {
        alert("Your message cannot be empty. Please type something.");
        tweetInputField.focus();
        return;
    }

    if (userMessageContent.length > maxTweetLength) {
        alert(`Your message is too long! It exceeds the ${maxTweetLength}-character limit by ${userMessageContent.length - maxTweetLength} characters.`);
        tweetInputField.focus();
        return;
    }

    realtimeClient.emit('data', '*', userMessageContent);
    console.log(`User message dispatched: "${userMessageContent}"`);
    tweetInputField.val(''); // Clear the input after sending.
    updateTweetCharacterCounter(tweetInputField); // Reset counter.
}

$(document).ready(function() {
    const tweetInputTarget = $('#tweet');
    const initialCharacterCount = 140;

    const charCounterDisplay = $('#text_counter');
    if (charCounterDisplay.length) {
        charCounterDisplay.text(`Characters left: ${initialCharacterCount}`);
    } else {
        console.warn('Character counter display (#text_counter) not found on page load.');
    }

    tweetInputTarget.on('keyup', function() {
        updateTweetCharacterCounter($(this));
    });

    // Initial update for any pre-filled text or to ensure display is correct.
    updateTweetCharacterCounter(tweetInputTarget);

    // Optional: Attach event listeners to buttons if not done via inline HTML.
    // Example: $('#addTrackButton').on('click', initiateFilterAddition);
    // Example: $('#sendTweetButton').on('click', dispatchUserMessage);
});

// A quick check to ensure the Socket.IO client library is loaded.
if (typeof io === 'undefined') {
    console.error("The Socket.IO client library (io) was not found. Real-time functionalities may not work.");
}