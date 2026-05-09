jQuery(function () {

    // Declare persistent WebSocket instances and their associated interval identifiers.
    let newsStreamSocket, tweetStreamSocket;
    let newsScrollIntervalId = null, tweetScrollIntervalId = null;

    // Cache frequently accessed jQuery elements to enhance performance.
    const $connectionForm = jQuery('#connectionSetupForm');
    const $disconnectionForm = jQuery('#sessionTerminationForm');
    const $statusLogDisplay = jQuery('#statusLogDisplay');
    const $connectButton = jQuery('#connectionInitiatorBtn');
    const $disconnectButton = jQuery('#disconnectSessionBtn');
    const $newsFeedContainer = jQuery('#newsFeedContainer');
    const $tweetFeedContainer = jQuery('#tweetFeedContainer');
    const $newsDisplaySection = jQuery('#newsDisplaySection');
    const $tweetDisplaySection = jQuery('#tweetDisplaySection');

    /**
     * Helper function to append status or error messages to the application's log display.
     * @param {string} messageText - The text content of the message to log.
     * @param {boolean} [isError=false] - True if the message represents an error, false otherwise.
     */
    const logApplicationStatus = (messageText, isError = false) => {
        const logEntryClass = isError ? 'error-log-entry' : 'status-log-entry';
        $statusLogDisplay.append(`<p class="${logEntryClass}">${messageText}</p>`);
        // Automatically scroll to the bottom to show the latest log entries.
        $statusLogDisplay.scrollTop($statusLogDisplay[0].scrollHeight);
    };

    /**
     * Updates the user interface elements based on the current connection state.
     * This includes showing/hiding buttons and content sections.
     * @param {boolean} isConnected - True if connections are active, false if disconnected.
     */
    const updateUiForConnectionState = (isConnected) => {
        if (isConnected) {
            $connectButton.fadeOut('slow'); // Hide the connect button
            $disconnectButton.fadeIn('slow'); // Show the disconnect button
            // Make the content display sections visible.
            $newsDisplaySection.slideDown('fast');
            $tweetDisplaySection.slideDown('fast');
        } else {
            $disconnectButton.fadeOut('slow'); // Hide the disconnect button
            $connectButton.fadeIn('slow'); // Show the connect button
            // Hide the content display sections and clear their content.
            $newsDisplaySection.slideUp('fast');
            $tweetDisplaySection.slideUp('fast', () => {
                // Clear content only after the animation completes
                $newsFeedContainer.empty();
                $tweetFeedContainer.empty();
            });
        }
    };

    // Initialize the UI to a disconnected state upon application load.
    updateUiForConnectionState(false);

    // Attach an event listener for the connection form submission.
    $connectionForm.on('submit', function (evt) {
        // Prevent the browser's default form submission behavior.
        evt.preventDefault();

        // Retrieve the WebSocket endpoint URLs from their respective input fields.
        const newsSourceUrl = jQuery("#newsFeedUrlInput").val();
        const tweetSourceUrl = jQuery("#tweetFeedUrlInput").val();

        // Implement basic input validation: ensure both URLs are provided.
        if (!newsSourceUrl || newsSourceUrl.trim() === '' || !tweetSourceUrl || tweetSourceUrl.trim() === '') {
            logApplicationStatus("Error: Both News Feed and Tweet Feed URLs must be provided to initiate connections.", true);
            return; // Stop execution if validation fails.
        }

        // Attempt to establish new WebSocket connections.
        try {
            newsStreamSocket = new WebSocket(newsSourceUrl);
            tweetStreamSocket = new WebSocket(tweetSourceUrl);
        } catch (err) {
            logApplicationStatus(`Failed to create WebSocket instances due to: ${err.message}. Please check URLs.`, true);
            return;
        }

        // --- News Stream Socket Event Handlers ---
        newsStreamSocket.onopen = function () {
            logApplicationStatus(`News Stream: Connection successfully established. Socket State: ${this.readyState} (OPEN)`);
            // Start the periodic scrolling mechanism for news items only if not already running.
            if (newsScrollIntervalId === null) {
                newsScrollIntervalId = setInterval(cycleNewsFeedDisplay, 6000); // Cycle every 6 seconds.
            }
            // Update the UI to reflect the active connection status.
            updateUiForConnectionState(true);
        };

        newsStreamSocket.onmessage = function (incomingPayload) {
            // Process the incoming news data.
            try {
                const parsedNewsItem = JSON.parse(incomingPayload.data);

                // Extract and provide default values for news item fields.
                const stockSymbol = parsedNewsItem.symbol || 'N/A';
                const articleHeadline = parsedNewsItem.title || 'Untitled Article';
                const thumbnailImageSrc = parsedNewsItem.picture || '';
                const detailedDescription = parsedNewsItem.info || 'No detailed description available.';

                // Dynamically construct a new list item element for the news feed.
                const newsListItemElement = jQuery("<li>");
                if (thumbnailImageSrc) {
                    newsListItemElement.append(`<img src='${thumbnailImageSrc}' width='55' height='55' alt='${stockSymbol} thumbnail' class='news-thumbnail' />`);
                }
                newsListItemElement.append(`<span class='news-symbol'>${stockSymbol}</span> : <span class='news-headline'>${articleHeadline}</span><br/>`);
                newsListItemElement.append(`<p class='news-description'>${detailedDescription}</p>`);

                // Append the newly created news item to the news feed container.
                newsListItemElement.appendTo($newsFeedContainer);
            } catch (parseError) {
                logApplicationStatus(`News Stream: Error parsing received message data: ${parseError.message}`, true);
            }
        };

        newsStreamSocket.onerror = function (errorEvent) {
            logApplicationStatus(`News Stream: An unexpected error occurred. Error Code: ${errorEvent.code || 'N/A'}`, true);
            // Attempt to gracefully close the socket if it's still open.
            if (this.readyState === WebSocket.OPEN) {
                this.close();
            }
        };

        newsStreamSocket.onclose = function (closeEvent) {
            logApplicationStatus(`News Stream: Connection terminated. Socket State: ${this.readyState} (CLOSED). Code: ${closeEvent.code}`);
            // Clear the news scrolling interval if it was active.
            if (newsScrollIntervalId !== null) {
                clearInterval(newsScrollIntervalId);
                newsScrollIntervalId = null;
            }
            // If the tweet socket is also closed or not initialized, update the UI to disconnected state.
            if (!tweetStreamSocket || tweetStreamSocket.readyState !== WebSocket.OPEN) {
                updateUiForConnectionState(false);
            }
        };

        // --- Tweet Stream Socket Event Handlers ---
        tweetStreamSocket.onopen = function () {
            logApplicationStatus(`Tweet Stream: Connection successfully established. Socket State: ${this.readyState} (OPEN)`);
            // Start the periodic scrolling mechanism for tweet items only if not already running.
            if (tweetScrollIntervalId === null) {
                tweetScrollIntervalId = setInterval(cycleTweetFeedDisplay, 4500); // Cycle every 4.5 seconds.
            }
            // Update the UI to reflect the active connection status.
            updateUiForConnectionState(true);
        };

        tweetStreamSocket.onmessage = function (incomingPayload) {
            // Process the incoming tweet data.
            try {
                const parsedTweetData = JSON.parse(incomingPayload.data);

                // Extract the tweet content, providing a default if missing.
                const tweetContentText = parsedTweetData.tweet || 'Empty Tweet Received';

                // Dynamically construct a new list item element for the tweet feed.
                const tweetListItemElement = jQuery("<li>");
                // Use .text() for safer insertion of user-generated content.
                tweetListItemElement.text(tweetContentText);
                tweetListItemElement.appendTo($tweetFeedContainer);
            } catch (parseError) {
                logApplicationStatus(`Tweet Stream: Error parsing received message data: ${parseError.message}`, true);
            }
        };

        tweetStreamSocket.onerror = function (errorEvent) {
            logApplicationStatus(`Tweet Stream: An unexpected error occurred. Error Code: ${errorEvent.code || 'N/A'}`, true);
            if (this.readyState === WebSocket.OPEN) {
                this.close();
            }
        };

        tweetStreamSocket.onclose = function (closeEvent) {
            logApplicationStatus(`Tweet Stream: Connection terminated. Socket State: ${this.readyState} (CLOSED). Code: ${closeEvent.code}`);
            // Clear the tweet scrolling interval if it was active.
            if (tweetScrollIntervalId !== null) {
                clearInterval(tweetScrollIntervalId);
                tweetScrollIntervalId = null;
            }
            // If the news socket is also closed or not initialized, update the UI to disconnected state.
            if (!newsStreamSocket || newsStreamSocket.readyState !== WebSocket.OPEN) {
                updateUiForConnectionState(false);
            }
        };
    });


    // Attach an event listener for the disconnection form submission.
    $disconnectionForm.on('submit', function (evt) {
        // Prevent the browser's default form submission behavior.
        evt.preventDefault();

        // Attempt to close the news stream socket if it's currently open.
        if (newsStreamSocket && newsStreamSocket.readyState === WebSocket.OPEN) {
            newsStreamSocket.close();
            logApplicationStatus("Initiating News Stream disconnection.");
        } else if (newsStreamSocket) {
             logApplicationStatus(`News Stream: Already in state ${newsStreamSocket.readyState} (not OPEN), no action taken.`);
        }

        // Attempt to close the tweet stream socket if it's currently open.
        if (tweetStreamSocket && tweetStreamSocket.readyState === WebSocket.OPEN) {
            tweetStreamSocket.close();
            logApplicationStatus("Initiating Tweet Stream disconnection.");
        } else if (tweetStreamSocket) {
            logApplicationStatus(`Tweet Stream: Already in state ${tweetStreamSocket.readyState} (not OPEN), no action taken.`);
        }

        // Clear any active scrolling intervals to stop animations.
        if (newsScrollIntervalId !== null) {
            clearInterval(newsScrollIntervalId);
            newsScrollIntervalId = null;
            logApplicationStatus("News scrolling interval cleared.");
        }
        if (tweetScrollIntervalId !== null) {
            clearInterval(tweetScrollIntervalId);
            tweetScrollIntervalId = null;
            logApplicationStatus("Tweet scrolling interval cleared.");
        }

        // Update the UI to reflect a fully disconnected state.
        updateUiForConnectionState(false);
    });


    /**
     * Animates the news feed by moving the first list item to the end, creating a continuous scroll effect.
     */
    function cycleNewsFeedDisplay() {
        const firstNewsItem = $newsFeedContainer.children('li:first');
        // Only perform animation if there are items in the list.
        if (firstNewsItem.length) {
            firstNewsItem.slideUp('fast', function () {
                jQuery(this).appendTo($newsFeedContainer).slideDown('fast');
            });
        }
    }

    /**
     * Animates the tweet feed by moving the first list item to the end, creating a continuous scroll effect.
     */
    function cycleTweetFeedDisplay() {
        const firstTweetItem = $tweetFeedContainer.children('li:first');
        // Only perform animation if there are items in the list.
        if (firstTweetItem.length) {
            firstTweetItem.slideUp('fast', function () {
                jQuery(this).appendTo($tweetFeedContainer).slideDown('fast');
            });
        }
    }

    // Initialize the jQuery UI tabs component for the main application interface.
    jQuery("#mainApplicationTabs").tabs();
});