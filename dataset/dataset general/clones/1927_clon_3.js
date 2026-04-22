// This module is responsible for managing background operations for a browser extension
// that interacts with an online game platform. It handles opening game tabs and
// monitoring for user's turn in active games.

// A global identifier for an interval timer used for periodic game status checks.
// It's assigned upon script initialization.
let globalPollingIntervalId;

// This variable is currently a placeholder and not actively used in the current logic.
// It could be repurposed for tracking specific game board states or removed if truly unnecessary.
let pendingGameIdentifiers = []; // Original: boardsToMove (unused)

// Stores an array of game IDs that are pending to be opened in new browser tabs.
// This list is updated periodically based on notifications from the game server.
let activeGameSessions = []; // Original: gamesToOpen

/**
 * A utility constant for the notification type indicating it's the user's turn.
 * Using a constant helps prevent typos and improves maintainability.
 */
const YOUR_MOVE_NOTIFICATION_TYPE = 'yourMove';

/**
 * Updates the text displayed on the browser action icon (e.g., the extension's button).
 * This function encapsulates the `chrome.browserAction.setBadgeText` call.
 * @param {string | number} badgeContent - The text or number to display. An empty string clears the badge.
 */
const updateBrowserActionButtonBadge = (badgeContent) => {
    // Ensure the content is always a string, converting numbers if necessary.
    const normalizedContent = String(badgeContent || '');
    chrome.browserAction.setBadgeText({ text: normalizedContent });
};

/**
 * Opens browser tabs according to user preferences and the list of active game sessions.
 * This function is typically invoked when the user clicks the extension's browser action icon.
 */
function launchInteractiveSessions() {
    // Retrieve user preference for opening the chat window.
    const chatInitiationPreference = localStorage.getItem('chatAtGamesOpen');
    const shouldOpenChatCompanion = chatInitiationPreference === 'true';

    // If chat is enabled, attempt to open the chat page in a new tab.
    if (shouldOpenChatCompanion) {
        try {
            chrome.tabs.create({ url: 'https://online-go.com/chat' });
        } catch (tabCreationError) {
            console.error('Failed to open the chat tab:', tabCreationError);
            // Non-critical error, continue with game tab opening.
        }
    }

    // Determine the user's preferred mode for opening game tabs.
    // Possible values: null (default), 'summary', 'firstGame'.
    const sessionLaunchMode = localStorage.getItem('open');

    // Check if there are no games queued or if the user prefers to see the main summary page.
    const isGameQueueEmpty = activeGameSessions.length === 0;
    const isSummaryOrDefaultMode = sessionLaunchMode === null || sessionLaunchMode === 'summary';

    // If either condition is true, open the main Online-Go.com site.
    if (isGameQueueEmpty || isSummaryOrDefaultMode) {
        try {
            chrome.tabs.create({ url: 'https://online-go.com/' });
        } catch (mainTabError) {
            console.error('Error opening the main OGS site:', mainTabError);
            // If the main site fails to open, we still want to reset state.
        } finally {
            // Regardless of success or failure, clear the game queue and badge.
            activeGameSessions = [];
            updateBrowserActionButtonBadge('');
            return; // Exit early as specific game tabs won't be opened in this scenario.
        }
    }

    // If we've reached here, there are games in the queue and the user wants to open them.
    // Iterate through the identified game IDs and open them in new tabs.
    for (let gameIndex = 0; gameIndex < activeGameSessions.length; gameIndex++) {
        const currentGameId = activeGameSessions[gameIndex];
        const gamePageUrl = `https://online-go.com/game/${currentGameId}`;

        try {
            chrome.tabs.create({ url: gamePageUrl });
        } catch (gameTabError) {
            console.warn(`Could not open game tab for ID ${currentGameId}:`, gameTabError);
            // Log a warning but continue to attempt opening other games.
        }

        // If the user's preference is to open only the first game, terminate the loop.
        if (sessionLaunchMode === 'firstGame') {
            break;
        }
    }
    
    // After attempting to open all relevant tabs, reset the queue and the badge.
    activeGameSessions = [];
    updateBrowserActionButtonBadge('');
}

/**
 * Sends a request to the remote game server to fetch the current user's notifications.
 * This is the primary function for checking for new moves.
 */
function pollRemoteGameStatus() {
    // Utilizes jQuery's AJAX functionality for fetching data.
    // A more modern approach might use the `fetch` API.
    $.get(
        "https://online-go.com/api/v1/me/notifications",
        (retrievedData) => processNotificationPayload(retrievedData), // Success callback function
        "json" // Specifies that the expected response format is JSON
    ).fail((jqXHR, textStatus, errorThrown) => {
        console.error("Failed to retrieve game notifications:", textStatus, errorThrown);
        // Indicate an error state on the badge if the API call fails.
        updateBrowserActionButtonBadge('!');
    });
}

/**
 * Processes the notification data received from the game server.
 * It identifies games where it's the user's turn and updates the extension's state.
 * @param {Array<Object>} incomingAlerts - An array of notification objects.
 */
function processNotificationPayload(incomingAlerts) {
    // Validate the incoming data to ensure it's an array.
    if (!Array.isArray(incomingAlerts)) {
        console.error('Received invalid notification payload (not an array):', incomingAlerts);
        // Reset state if data is malformed to avoid incorrect badge display.
        activeGameSessions = [];
        updateBrowserActionButtonBadge('');
        return;
    }

    // Log the full payload for detailed debugging, if needed.
    // console.debug('Full notification payload:', JSON.stringify(incomingAlerts, null, 2));

    let turnPendingCount = 0; // Counter for games requiring a move.
    const identifiedGameIDsForOpening = []; // Temporarily stores IDs of games to be opened.

    // Iterate through each notification object using a `for...of` loop for conciseness.
    for (const currentNotification of incomingAlerts) {
        // Ensure the notification object is valid and its type matches 'yourMove'.
        if (currentNotification && currentNotification.type === YOUR_MOVE_NOTIFICATION_TYPE) {
            turnPendingCount++;
            // Only add the game ID if it exists in the notification object.
            if (currentNotification.game_id) {
                identifiedGameIDsForOpening.push(currentNotification.game_id);
            } else {
                console.warn('Found a "yourMove" notification without a game_id:', currentNotification);
            }
        }
    }
    
    // console.debug(`Detected ${turnPendingCount} games where it's the player's turn.`);

    // Construct the badge text: display the count if greater than zero, otherwise an empty string.
    const currentBadgeText = turnPendingCount > 0 ? String(turnPendingCount) : '';
    updateBrowserActionButtonBadge(currentBadgeText);
    
    // Update the global list of games that are queued for opening.
    activeGameSessions = identifiedGameIDsForOpening;
}

// Attach the `launchInteractiveSessions` function as a listener to the browser action click event.
// This makes the extension respond to user clicks on its icon.
chrome.browserAction.onClicked.addListener(launchInteractiveSessions);

// Define a constant for one minute in milliseconds for clarity in interval settings.
const ONE_MINUTE_MS = 60 * 1000;

// Set up a recurring timer to periodically check for game status updates.
// The `globalPollingIntervalId` stores the ID returned by `setInterval`,
// which could be used to clear the interval later if necessary.
globalPollingIntervalId = window.setInterval(pollRemoteGameStatus, ONE_MINUTE_MS);
console.info(`Game status polling interval established: every ${ONE_MINUTE_MS / 1000} seconds.`);

// Perform an initial check at browser startup for opening the chat window.
const initialChatLaunchEnabled = localStorage.getItem('chatAtStartup');
if (initialChatLaunchEnabled === 'true') {
    try {
        chrome.tabs.create({ url: 'https://online-go.com/chat' });
    } catch (startupChatError) {
        console.error('Failed to open chat tab during startup:', startupChatError);
    }
}

// Execute an immediate game status check when the background script first loads.
// This ensures that the extension's badge is up-to-date right after installation or browser launch.
pollRemoteGameStatus();
console.info("Online Game Status Monitor background script has successfully initialized.");