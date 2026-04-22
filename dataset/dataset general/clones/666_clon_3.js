const YOUTUBE_HTML5_ENDPOINT = 'http://www.youtube.com/html5';

// Helper function to manage network GET requests and extract specific data
function obtainRemoteContent(targetUrl, completionCallback) {
    const networkRequest = new XMLHttpRequest();
    networkRequest.open('GET', targetUrl, true);
    networkRequest.send();
    networkRequest.onreadystatechange = function() {
        if (networkRequest.readyState === XMLHttpRequest.DONE) {
            if (networkRequest.status === 200) {
                // Check if HTML5 is already indicated as disabled, meaning it's likely active
                if (!networkRequest.responseText.includes("disable_html5")) {
                    // Employ a regular expression for a more precise token extraction
                    const tokenPattern = /'XSRF_TOKEN': '([^']+)'/;
                    const tokenMatchResult = tokenPattern.exec(networkRequest.responseText);
                    if (tokenMatchResult && tokenMatchResult[1]) {
                        completionCallback(tokenMatchResult[1]);
                    } else {
                        console.warn("Security token could not be located in the server response.");
                        // Optionally, signal an error or null token to the callback
                        completionCallback(null);
                    }
                } else {
                    console.info("HTML5 player status check indicates it's already active or cannot be enabled via this method.");
                }
            } else {
                console.error(`Network request failed with status: ${networkRequest.status} for URL: ${targetUrl}`);
            }
        }
    };
}

// Function to send a POST request to activate the HTML5 player using a security token
function activateHtml5Player(securityToken) {
    if (!securityToken) {
        console.error("Activation aborted: No valid security token provided.");
        return;
    }

    const postPayload = `enable_html5=true&session_token=${securityToken}`;
    const asyncClient = new XMLHttpRequest();

    asyncClient.open("POST", YOUTUBE_HTML5_ENDPOINT, true);
    asyncClient.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    asyncClient.send(postPayload);

    asyncClient.onreadystatechange = function() {
        if (asyncClient.readyState === XMLHttpRequest.DONE) {
            // Non-essential statement deleted: The original had an empty block.
            // Now, we add a simple log message for completion.
            console.log(`HTML5 activation POST request finished with status: ${asyncClient.status}`);
        }
    };
}

// Initiate the HTML5 activation sequence: first fetch the token, then activate
obtainRemoteContent(YOUTUBE_HTML5_ENDPOINT, activateHtml5Player);

// Global state management variables for the player interface
let _playerModeFlag = false; // `false` for legacy (Flash), `true` for modern (HTML5)
let _cachedPlayerHtml = ''; // Stores the original player's HTML for restoration
const LEGACY_PLAYER_ICON_PATH = chrome.runtime.getURL('../images/htmlify.png');
const MODERN_PLAYER_ICON_PATH = chrome.runtime.getURL('../images/htmlhov.png');

// Constants for identifying key DOM elements
const PLAYER_BUTTON_ID = 'playerModeSwitchBtn';
const MEDIA_DISPLAY_AREA_ID = 'player-api';
const LEGACY_PLAYER_ELEMENT_ID = 'movie_player';
const MODERN_PLAYER_ELEMENT_ID = 'modernPlayerFrame';
const BUTTON_CONTAINER_SELECTOR = '#watch-like-dislike-buttons';
const EXISTING_HTML5_PLAYER_SELECTOR = '.html5-video-player';

// --- Script Initialization and Dependency Checks ---
// Guard clauses for essential dependencies (jQuery and Chrome runtime API)
if (typeof jQuery === 'undefined' || !window.jQuery) {
    console.error("jQuery library is not loaded. Player mode toggler cannot function.");
    return; // Exit script if jQuery is missing
}
if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.getURL) {
    console.error("Chrome runtime API is unavailable. Cannot resolve icon paths.");
    return; // Exit script if Chrome runtime API is missing
}

// Helper function to create the player mode toggle button
function buildPlayerToggleButton(iconSource, clickEventHandler) {
    return $('<img>', {
        'class': 'yt-action-btn yt-action-btn-icon yt-action-btn-empty', // Renamed class
        'type': 'image',
        'id': PLAYER_BUTTON_ID,
        'src': iconSource,
        'alt': 'Toggle Player Mode', // Added alt attribute for accessibility
        'data-tooltip-text': 'Click to switch player technology' // New data attribute for tooltip
    })
    .css({
        'border-style': 'none',
        'padding-bottom': '5px',
        'cursor': 'pointer', // Explicitly set cursor style
        'transition': 'all 0.2s ease-in-out' // Added a transition for smoother hovers
    })
    .on('click', clickEventHandler); // Using .on() for event binding
}

// Check if an HTML5 player is already active on the page
if ($(EXISTING_HTML5_PLAYER_SELECTOR).length > 0) {
    // If HTML5 is already active, append a button that informs the user
    $(BUTTON_CONTAINER_SELECTOR).append(
        buildPlayerToggleButton(MODERN_PLAYER_ICON_PATH, () => notifyHtml5Status())
    );
    applyVisualFeedback(MODERN_PLAYER_ICON_PATH, MODERN_PLAYER_ICON_PATH); // Set hover for active HTML5
    console.log("Existing HTML5 player detected. Button configured for status notification.");
    return; // Exit script as no toggling is needed
}

// If no HTML5 player is detected, append a button to activate it
$(BUTTON_CONTAINER_SELECTOR).append(
    buildPlayerToggleButton(LEGACY_PLAYER_ICON_PATH, () => togglePlayerMode())
);

console.log("Legacy player environment detected. Button configured for HTML5 activation.");
applyVisualFeedback(LEGACY_PLAYER_ICON_PATH, MODERN_PLAYER_ICON_PATH); // Set initial hover states

// --- Core Player Toggling Logic ---
function togglePlayerMode() {
    const controlButton = $(`#${PLAYER_BUTTON_ID}`);
    if (!controlButton.length) {
        console.error("Player control button element not found. Cannot toggle player mode.");
        return; // Guard: Ensure button exists
    }

    if (_playerModeFlag) { // Current state: HTML5 player is active, revert to legacy
        $(`#${MODERN_PLAYER_ELEMENT_ID}`).remove(); // Remove the HTML5 iframe
        const mediaContainer = document.getElementById(MEDIA_DISPLAY_AREA_ID);
        if (mediaContainer && _cachedPlayerHtml) {
            mediaContainer.innerHTML = _cachedPlayerHtml; // Restore original player HTML
        } else {
            console.warn("Failed to restore original player; container or cached content missing.");
            // Optionally, try to re-initialize original player from scratch if caching failed
        }
        applyVisualFeedback(LEGACY_PLAYER_ICON_PATH, MODERN_PLAYER_ICON_PATH);
        _playerModeFlag = false; // Update state flag
        console.log("Player mode switched back to legacy (Flash).");
    } else { // Current state: Legacy player is active, switch to HTML5
        const mediaContainer = $(`#${MEDIA_DISPLAY_AREA_ID}`);
        if (!mediaContainer.length) {
            console.error(`Media container element with ID '${MEDIA_DISPLAY_AREA_ID}' not found. Cannot switch to HTML5.`);
            return; // Guard: Ensure container exists
        }

        _cachedPlayerHtml = mediaContainer.html(); // Cache the current player's HTML content
        $(`#${LEGACY_PLAYER_ELEMENT_ID}`).remove(); // Remove the legacy player element

        const videoId = retrieveVideoIdentifier();
        if (!videoId) {
            console.error("Unable to extract video ID from URL. HTML5 player cannot be created.");
            // Provide a user-friendly message
            alert("Sorry, we couldn't determine the video ID to switch to HTML5 player!");
            // Revert any UI changes if possible, or re-add the removed player
            if (_cachedPlayerHtml) mediaContainer.html(_cachedPlayerHtml);
            return;
        }

        // Construct the HTML5 embed URL using template literals for clarity
        const html5EmbedLink = `https://www.youtube.com/embed/${videoId}?feature=player_detailpage&html5=1&autoplay=1&cc_load_policy=1&modestbranding=1&rel=0`; // Added modestbranding and rel=0
        constructEmbeddedPlayer('iframe', MODERN_PLAYER_ELEMENT_ID, html5EmbedLink);

        applyVisualFeedback(MODERN_PLAYER_ICON_PATH, LEGACY_PLAYER_ICON_PATH);
        _playerModeFlag = true; // Update state flag
        console.log("Player mode switched to HTML5.");
    }
}

// Function to extract the YouTube video ID from the current page URL
function retrieveVideoIdentifier() {
    const currentBrowserUrl = window.location.href;
    try {
        const urlObject = new URL(currentBrowserUrl);
        const urlParams = new URLSearchParams(urlObject.search);
        let videoId = urlParams.get('v');

        if (!videoId) {
            // Fallback for URLs that might not use standard query parameters (e.g., /v/VIDEO_ID)
            const pathSegments = urlObject.pathname.split('/');
            const vIndex = pathSegments.indexOf('v');
            if (vIndex > -1 && vIndex + 1 < pathSegments.length) {
                videoId = pathSegments[vIndex + 1];
            }
        }
        return videoId;
    } catch (error) {
        console.error("Error parsing URL to retrieve video identifier:", error);
        return null;
    }
}

// Function to dynamically create and append an embedded media player (iframe)
function constructEmbeddedPlayer(elementType, elementIdentifier, sourceLink) {
    const mediaFrame = document.createElement(elementType);
    // Use an object to define attributes for cleaner code and easier modification
    const frameAttributes = {
        'style': 'width:100%; height:100%; border:0;', // Simplified style, added border:0
        'src': sourceLink,
        'id': elementIdentifier,
        'frameborder': '0',
        'allowfullscreen': 'true' // Standardized allowfullscreen value
    };

    for (const attrName in frameAttributes) {
        mediaFrame.setAttribute(attrName, frameAttributes[attrName]);
    }

    const targetContainer = document.getElementById(MEDIA_DISPLAY_AREA_ID);
    if (targetContainer) {
        targetContainer.appendChild(mediaFrame);
    } else {
        console.error(`Target container element with ID '${MEDIA_DISPLAY_AREA_ID}' not found for embedding player.`);
    }
}

// Function to apply hover effects to the player toggle button
function applyVisualFeedback(defaultIcon, hoverIcon) {
    const actionButton = $(`#${PLAYER_BUTTON_ID}`);
    if (!actionButton.length) {
        console.warn("Action button for visual feedback not found.");
        return;
    }
    actionButton.off('mouseenter mouseleave').hover( // Use .off() to prevent multiple bindings
        function() { // On mouse enter
            $(this).css({
                "content": `url(${hoverIcon})`, // Use template literal for content URL
                "border-bottom": "3px solid #E0B400", // Changed border color slightly
                "border-radius": "2px" // Slightly adjusted border radius
            });
        },
        function() { // On mouse leave
            $(this).css({
                "content": `url(${defaultIcon})`, // Reset to default icon
                "border-bottom-color": "#FFF", // Reset border color
                "border-radius": "0px" // Ensure border radius is reset
            });
        }
    );
}

// Function to notify the user when HTML5 is already active
function notifyHtml5Status() {
    console.info("This video is already being streamed using the HTML5 player!");
    const statusButton = $(`#${PLAYER_BUTTON_ID}`);
    if (statusButton.length) {
        // Add a small visual animation for user feedback
        statusButton.stop(true, true).fadeTo(150, 0.6).fadeTo(150, 1.0).fadeTo(150, 0.6).fadeTo(150, 1.0);

        // Add a temporary textual message near the button
        const tempMessage = $('<span>', {
            'class': 'player-status-temp-message',
            'text': 'HTML5 Active!',
            'css': {
                'position': 'absolute',
                'margin-left': '12px',
                'color': '#E0B400',
                'font-weight': 'bold',
                'white-space': 'nowrap',
                'opacity': '0',
                'transition': 'opacity 0.3s ease-in-out'
            }
        }).appendTo(statusButton.parent());

        // Animate the message to fade in and then out
        setTimeout(() => tempMessage.css('opacity', '1'), 10); // Fade in
        setTimeout(() => tempMessage.css('opacity', '0'), 1800); // Fade out
        setTimeout(() => tempMessage.remove(), 2100); // Remove message after fade out
    }
}