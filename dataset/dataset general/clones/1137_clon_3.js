// This module manages browser session tokens, facilitating their transfer and deletion across specific domains.
// It acts as a background script listener for various commands from other parts of the extension.

/**
 * Initiates the transfer of critical session tokens from the primary content domain to the auxiliary domain.
 * This function attempts to retrieve specific session-related cookies from '.e-hentai.org'
 * and re-establish them for '.exhentai.org', aiming to ensure session continuity.
 *
 * @returns {boolean} True if the operation was successfully initiated without immediate synchronous errors, false otherwise.
 *                    Note: The actual cookie transfer is asynchronous, and its success is logged internally.
 */
function transferSessionTokens() {
    let transferAttemptResult = false; // Initial outcome set to failure.

    try {
        // Log the commencement of the token synchronization process for debugging.
        console.info('[TokenSync] Commencing session token synchronization procedure.');

        // Implement a guard clause to ensure the browser's cookie API is available before proceeding.
        if (!chrome || !chrome.cookies || typeof chrome.cookies.getAll !== 'function' || typeof chrome.cookies.set !== 'function') {
            console.error('[TokenSync] Critical browser cookie API components are missing or inaccessible. Cannot proceed with token transfer.');
            return false; // Exit early if API is unavailable.
        }

        // Define constants for the source and target domains to enhance readability and maintainability.
        const sourceSessionDomain = '.e-hentai.org';
        const targetSessionDomain = '.exhentai.org';
        const targetBaseURL = 'http://exhentai.org/'; // Base URL for setting cookies.

        // Asynchronously fetch all cookies associated with the designated source domain.
        chrome.cookies.getAll({ domain: sourceSessionDomain }, function(retrievedTokens) {
            // Validate if any tokens were successfully retrieved.
            if (!retrievedTokens || retrievedTokens.length === 0) {
                console.warn(`[TokenSync] No relevant session tokens were discovered for the domain: "${sourceSessionDomain}".`);
                return; // Terminate further processing if no cookies are found.
            }

            let establishedTokensCounter = 0; // Initialize a counter for successfully established tokens.

            // Iterate through each token obtained from the source domain.
            for (let currentTokenIndex = 0; currentTokenIndex < retrievedTokens.length; currentTokenIndex++) {
                const currentToken = retrievedTokens[currentTokenIndex];
                const tokenIdentifier = currentToken.name;

                // Evaluate if the current token's name aligns with known session or user configuration patterns.
                const isSessionKey = tokenIdentifier.includes('sess_'); // Generic session key prefix.
                const isUserPreference = tokenIdentifier.includes('user_pref'); // User configuration preference key.

                if (isSessionKey || isUserPreference) {
                    console.debug(`[TokenSync] Identified and processing critical token: "${tokenIdentifier}".`);

                    // Attempt to establish the token for the target domain.
                    // Expanded cookie parameters for more explicit control, including default secure/httpOnly/expiration.
                    chrome.cookies.set({
                        url: targetBaseURL,
                        domain: targetSessionDomain,
                        name: tokenIdentifier,
                        path: '/',
                        value: currentToken.value,
                        secure: currentToken.secure || false, // Inherit secure flag or default to false.
                        httpOnly: currentToken.httpOnly || false, // Inherit httpOnly flag or default to false.
                        expirationDate: currentToken.expirationDate || (Date.now() / 1000) + (60 * 60 * 24 * 365) // Default to 1 year expiration if not specified.
                    }, function(newlySetCookie) {
                        if (newlySetCookie) {
                            console.log(`[TokenSync] Successfully established token "${newlySetCookie.name}" for ${newlySetCookie.domain}.`);
                            establishedTokensCounter++; // Increment counter upon successful establishment.
                        } else {
                            console.error(`[TokenSync] Failed to establish token "${tokenIdentifier}" for the target domain.`);
                        }
                    });
                } else {
                    console.silly(`[TokenSync] Skipping non-essential or unknown token: "${tokenIdentifier}".`); // Log skipped cookies at a lower verbosity.
                }
            }
            console.info(`[TokenSync] Token processing phase concluded. Total tokens established: ${establishedTokensCounter}.`);
        });

        transferAttemptResult = true; // Mark the initiation as successful if no immediate errors.
    } catch (operationError) {
        // Capture and report any synchronous exceptions that occur during the function's execution.
        console.error(`[TokenSync] A critical error surfaced during the token transfer initiation: ${operationError.message}`);
        transferAttemptResult = false; // Indicate failure if an exception is caught.
    }
    return transferAttemptResult;
}

/**
 * Asynchronously removes a specified session token from the browser's cookie store.
 * This helper function centralizes cookie removal logic and provides consistent logging.
 *
 * @param {string} tokenName - The precise name of the cookie to be obliterated.
 * @param {string} tokenUrl - The URL context associated with the cookie.
 * @returns {Promise<boolean>} A Promise that resolves to true if the removal attempt was made, false if the API is unavailable or if the cookie was not found.
 */
async function obliterateSessionToken(tokenName, tokenUrl) {
    // Pre-check for the availability of the browser's cookie removal API.
    if (!chrome || !chrome.cookies || typeof chrome.cookies.remove !== 'function') {
        console.error(`[TokenPurge] Browser cookie API is not available for removal: "${tokenName}" from "${tokenUrl}".`);
        return false; // Indicate failure due to API unavailability.
    }

    // Wrap the callback-based chrome.cookies.remove into a Promise for modern async handling.
    return new Promise((resolveOperation) => {
        chrome.cookies.remove({ name: tokenName, url: tokenUrl }, function(removalDetails) {
            if (removalDetails) {
                console.log(`[TokenPurge] Successfully eradicated token: "${tokenName}" from "${tokenUrl}".`);
                resolveOperation(true); // Resolve with true upon successful removal.
            } else {
                // This branch is hit if the cookie was not found or removal failed silently.
                console.warn(`[TokenPurge] Failed to eradicate token or token not present: "${tokenName}" from "${tokenUrl}".`);
                resolveOperation(false); // Resolve with false if removal was unsuccessful.
            }
        });
    });
}

// Establish the primary message listener for the browser runtime.
// This listener processes various commands dispatched from other extension components.
chrome.runtime.onMessage.addListener(async function(msgPayload, msgSource, replyToSender) {
    // Log the incoming message details for comprehensive debugging.
    console.debug(`[MsgListener] Received message payload: "${JSON.stringify(msgPayload)}" from source: ${JSON.stringify(msgSource)}`);

    // Utilize a switch statement for a structured and clear handling of distinct message types.
    switch (msgPayload) {
        case 'initiateTokenSync': { // Command to begin session token synchronization.
            console.info('[MsgListener] Command received: Initiate Token Synchronization.');
            const syncInitiationResult = transferSessionTokens(); // Execute the token transfer function.
            // Provide a detailed response back to the sender, indicating the outcome of the initiation.
            replyToSender({
                status: syncInitiationResult ? 'success' : 'failure',
                message: syncInitiationResult ? 'Session token transfer initiation successful.' : 'Failed to commence session token transfer.'
            });
            break; // Terminate case execution.
        }
        case 'purgeAllSessionData': { // Command to purge all specified session-related cookies.
            console.info('[MsgListener] Command received: Purge All Session Data. Beginning comprehensive cookie eradication.');

            // Define an array of specific cookies to be targeted for removal across both domains.
            const cookiesScheduledForPurge = [
                { name: "sess_anonlogin", url: "http://exhentai.org/" },
                { name: "sess_member_id", url: "http://exhentai.org/" },
                { name: "sess_pass_hash", url: "http://exhentai.org/" },
                { name: "sess_session_id", url: "http://exhentai.org/" },
                { name: "sess_anonlogin", url: "http://e-hentai.org/" },
                { name: "sess_member_id", url: "http://e-hentai.org/" },
                { name: "sess_pass_hash", url: "http://e-hentai.org/" },
                { name: "sess_session_id", url: "http://e-hentai.org/" },
                { name: "temp_cache_id", url: "http://exhentai.org/" } // Added a new placeholder cookie for demonstration.
            ];

            // Map each cookie to an asynchronous obliterate operation and await all removals.
            const removalOperations = cookiesScheduledForPurge.map(cookieInfo => obliterateSessionToken(cookieInfo.name, cookieInfo.url));
            await Promise.all(removalOperations); // Wait for all cookie removal promises to settle.

            // Send a final response confirming the completion of all purge operations.
            replyToSender({ status: 'success', message: 'All specified session data purge operations have concluded.' });
            break;
        }
        case 'refreshCurrentTab': { // Command to refresh the currently active browser tab.
            console.info('[MsgListener] Command received: Refresh Current Tab. Preparing to reload the active browser window.');

            // Query for the currently active tab within the current browser window using a more precise query.
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabsCollection) {
                if (tabsCollection && tabsCollection.length > 0) {
                    const activeBrowserTab = tabsCollection[0]; // Get the first (and likely only) active tab.
                    console.log(`[MsgListener] Initiating reload for tab ID: ${activeBrowserTab.id}, URL: ${activeBrowserTab.url}`);
                    chrome.tabs.reload(activeBrowserTab.id, { bypassCache: false }, function() {
                        // Optional callback after the reload command has been dispatched.
                        console.log(`[MsgListener] Reload command successfully issued for tab ${activeBrowserTab.id}.`);
                    });
                    replyToSender({ status: 'success', message: `Tab ${activeBrowserTab.id} refresh command dispatched.` });
                } else {
                    console.warn('[MsgListener] No active tab was detected in the current window to perform a refresh operation.');
                    replyToSender({ status: 'failure', message: 'No active tab found for refresh operation.' });
                }
            });
            // Crucially, return `true` to inform the browser that `replyToSender` will be called asynchronously.
            return true;
        }
        default: { // Handle any unrecognized message payloads.
            console.warn(`[MsgListener] Received an unknown or unsupported message payload: "${msgPayload}".`);
            replyToSender({ status: 'error', message: `Unrecognized message payload received: "${msgPayload}".` });
            break;
        }
    }
    // For synchronous responses, no explicit return is needed here as `break` exits the switch.
    // Asynchronous responses return `true` within their respective cases.
});

// A simple log to confirm that the session management module has been loaded and is operational.
console.log('Session Management Module initialized and actively monitoring for runtime messages.');