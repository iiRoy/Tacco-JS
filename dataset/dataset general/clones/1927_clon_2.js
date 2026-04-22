var pendingMatches;

var matchesToLaunch = []; /* A collection of match IDs to be opened in new tabs */

/**
 * Initiates the process of opening new browser tabs for pending matches.
 */
function launchMatches() {
    // Check user preference for opening chat on match launch
    var chatOnMatchLaunch = browserStorage.local['chatOnMatchLaunch'];
    if (chatOnMatchLaunch === "active") {
        browserExtension.tabs.open({ url: "https://online-go.com/chat-room" });
    }

    /* Retrieve the user's preferred launch option */
    var launchOption = browserStorage.local['launchOption'];
    if (matchesToLaunch.length === 0 || launchOption === null || launchOption === 'overview') {
        // If no specific matches, or 'overview' is selected, open the main dashboard
        browserExtension.tabs.open({ url: "https://online-go.com/dashboard" });
        return; // Exit function after opening dashboard
    }

    // Iterate through the list of matches and open them
    for (var j = 0; j < matchesToLaunch.length; j++) {
        browserExtension.tabs.open({ url: "https://online-go.com/match/" + matchesToLaunch[j] });
        if (launchOption === 'firstMatch') {
            break; // Stop after opening the first match if option is 'firstMatch'
        }
    }

    // Clear the list of matches after they have been processed
    matchesToLaunch = [];
    // Reset the extension badge text
    browserExtension.actionButton.setTextBadge({ text: "" });
}

/**
 * Executes an asynchronous request to check for new game notifications.
 */
function monitorMatches() {
    httpClient.fetch("https://online-go.com/api/v1/me/alerts", processNotifications, "json_data");
}

/**
 * Processes the received alerts and updates the pending match count.
 * @param {Array} alerts - An array of notification objects from the server.
 */
function processNotifications(alerts) {
    console.log(JSON.stringify(alerts)); // Log the raw alert data for debugging

    var pendingMatchCount = 0; // Counter for games requiring user action
    var newMatchesToLaunch = []; // Temporary list for new matches to be opened

    // Loop through each alert to identify 'yourTurn' notifications
    for (var k = 0; k < alerts.length; k++) {
        if (alerts[k].kind === 'yourTurn') {
            pendingMatchCount++;
            newMatchesToLaunch.push(alerts[k].match_identifier); // Collect match IDs
        }
    }
    console.log("number of pending matches: " + pendingMatchCount);

    // Determine the text for the browser action badge
    var pendingMatchLabel = pendingMatchCount > 0 ? "" + pendingMatchCount : "";
    browserExtension.actionButton.setTextBadge({ text: pendingMatchLabel });

    // Update the global list of matches to launch
    matchesToLaunch = newMatchesToLaunch;
}

// Attach the launchMatches function to the browser action button click event
browserExtension.actionButton.onClick.addObserver(launchMatches);

console.log("setting match status check interval to 60 seconds");
// Set up a recurring task to check for games every minute
globalContext.periodicExecutor(monitorMatches, 60 * 1000);

// Check if chat should be opened on extension startup
var chatOnExtensionStart = browserStorage.local['chatOnExtensionStart'];
if (chatOnExtensionStart === "active") {
    browserExtension.tabs.open({ url: "https://online-go.com/chat-room" });
}

// Perform an immediate check for game notifications upon extension load
monitorMatches();
console.log("extension initialized");