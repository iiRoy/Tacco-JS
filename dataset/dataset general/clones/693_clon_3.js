"use strict";

const isAjaxPage            = false; // Indicates if the page uses AJAX navigation
let   isFeatherMode         = false; // True if YouTube's "Feather" mode is active
let   domMonitor            = null;  // MutationObserver instance
let   originalVideoPlayer   = null;  // Reference to the original YouTube player element
let   playerWrapper         = null;  // Parent container of the original player
let   watchPageMain         = null;  // Main content area of the YouTube watch page
let   currentPlaybackTime   = 0;     // Stores the video's current time for state restoration
let   playbackSpeedSetting  = 1;     // Stores the user's preferred playback speed
let   allowVideoReload      = false; // Flag to enable video reload on certain errors

// Core HTML elements for the custom player and controls
const customPlayerContainer = document.createElement("div");
const videoElement          = document.createElement("video");
const controlBar            = document.createElement("div");
const controlGroup          = document.createElement("div");

// UI components for interaction
const togglePlayerCheckbox  = document.createElement("input");
const togglePlayerLabel     = document.createElement("label");
const videoSourceSelector   = document.createElement("select");
const reloadMediaButton     = document.createElement("button");
const downloadMediaLink     = document.createElement("a");
const speedControlToggle    = document.createElement("input");
const speedControlLabel     = document.createElement("label");
const playbackRateSelector  = document.createElement("select");
const playerSizeToggle      = document.createElement("input");
const playerSizeLabel       = document.createElement("label");

// Localized text messages retrieved from browser extension API
const msgToggleOff          = chrome.i18n.getMessage("toggle_unchecked");
const msgToggleOn           = chrome.i18n.getMessage("toggle_checked");
const msgToggleDisabled     = chrome.i18n.getMessage("toggle_disabled");
const msgSourceLabel        = chrome.i18n.getMessage("source");
const msgReloadLabel        = chrome.i18n.getMessage("reload");
const msgDownloadLabel      = chrome.i18n.getMessage("download");
const msgSpeedOff           = chrome.i18n.getMessage("speed_unchecked");
const msgSpeedOn            = chrome.i18n.getMessage("speed_checked");
const msgRateLabel          = chrome.i18n.getMessage("rate");
const msgSizeOff            = chrome.i18n.getMessage("size_unchecked");
const msgSizeOn             = chrome.i18n.getMessage("size_checked");

/**
 * Updates the page title with a play indicator.
 * @param {boolean} shouldShow - True to show the indicator, false to hide.
 */
const updatePageTitleIndicator = (shouldShow) => {
    let currentTitle = document.title.replace(/^\u25B6\s/, "");
    document.title = shouldShow ? `\u25B6 ${currentTitle}` : currentTitle;
};

/**
 * Checks if a mouse event occurred within the main video playback area.
 * This helps distinguish clicks on video controls from clicks on the video itself.
 * @param {HTMLVideoElement} targetVideo - The video element.
 * @param {number} eventOffsetY - The Y-coordinate of the mouse event relative to the element.
 * @returns {boolean} True if the click is within the playable area, false otherwise.
 */
const isClickWithinVideoArea = (targetVideo, eventOffsetY) => {
    const videoHeightStr = window.getComputedStyle(targetVideo).getPropertyValue("height");
    const videoHeight    = parseInt(videoHeightStr, 10);
    // Assuming controls take up roughly the bottom 40 pixels
    return (videoHeight - 40) > eventOffsetY;
};

/**
 * Sends an asynchronous request to YouTube to mark the current video as watched.
 * This function handles potential errors gracefully.
 */
const notifyVideoWatched = async () => {
    try {
        const videoIdMatch = location.href.match(/[?&]v=([^&|#$]+)/);
        if (!videoIdMatch || !videoIdMatch[1]) {
            console.warn("Could not extract video ID for 'watched' notification.");
            return;
        }
        const videoIdentifier = videoIdMatch[1];
        const response = await fetch(`https://www.youtube.com/user_watch?video_id=${videoIdentifier}`);
        if (!response.ok) {
            console.warn(`Failed to notify YouTube about watched video: ${response.status} ${response.statusText}`);
        }
    } catch (err) {
        console.error("Error sending watched notification:", err);
    }
};

/**
 * Helper to set text content, title, and tooltip for a UI element.
 * @param {HTMLElement} element - The target UI element.
 * @param {HTMLElement} labelElement - The associated label element.
 * @param {string} text - The text to set.
 */
const updateUiText = (element, labelElement, text) => {
    element.title = text;
    element.dataset.tooltipText = text;
    if (labelElement) {
        labelElement.textContent = text;
    }
};

/**
 * Configures the HTML5 video element with its default attributes and appends it to its container.
 */
const setupVideoElement = () => {
    customPlayerContainer.id = "alt-media-player-container";
    customPlayerContainer.classList.add("player-height", "player-width", "off-screen-target", "watch-content", "player-api");
    customPlayerContainer.appendChild(videoElement);

    videoElement.id = "alt-media-element";
    videoElement.autoplay = true;
    videoElement.controls = true;
    videoElement.preload  = "auto"; // Changed from 'true' to 'auto' for clarity and standard HTML5
};

/**
 * Attaches all necessary event listeners to the video element.
 */
const attachVideoEventListeners = () => {
    videoElement.addEventListener("click", (evt) => {
        if (isClickWithinVideoArea(videoElement, evt.offsetY)) {
            if (videoElement.paused || videoElement.ended) {
                videoElement.play();
            } else {
                videoElement.pause();
            }
        }
    });

    videoElement.addEventListener("dblclick", (evt) => {
        if (isClickWithinVideoArea(videoElement, evt.offsetY)) {
            if (videoElement.requestFullscreen) {
                videoElement.requestFullscreen();
            } else if (videoElement.webkitRequestFullscreen) { // Safari/Chrome prefix
                videoElement.webkitRequestFullscreen();
            }
        }
    });

    videoElement.addEventListener("loadedmetadata", () => {
        let seekTime = parseInt(currentPlaybackTime, 10);
        if (isNaN(seekTime) || seekTime <= 0) {
            // Attempt to parse 't' parameter from URL
            const urlParams = new URLSearchParams(location.search);
            let timeParam = urlParams.get('t');
            if (timeParam) {
                let totalSeconds = 0;
                // Supports formats like 1m30s, 90s, 2m
                const minutesMatch = timeParam.match(/(\d+)m/);
                const secondsMatch = timeParam.match(/(\d+)s/);
                if (minutesMatch) totalSeconds += parseInt(minutesMatch[1], 10) * 60;
                if (secondsMatch) totalSeconds += parseInt(secondsMatch[1], 10);
                if (totalSeconds > 0) {
                    seekTime = totalSeconds;
                }
            }
        }
        if (seekTime > 0 && seekTime < videoElement.duration) {
            videoElement.currentTime = seekTime;
        }
    });

    videoElement.addEventListener("play", () => {
        if (document.body.contains(videoElement)) {
            videoElement.playbackRate = parseFloat(playbackSpeedSetting) || 1;
            updatePageTitleIndicator(true);
            notifyVideoWatched();
        } else {
            videoElement.pause(); // Ensure video doesn't play if it's not in the DOM
        }
    });

    videoElement.addEventListener("pause", () => {
        if (document.body.contains(videoElement)) {
            updatePageTitleIndicator(false);
        }
    });

    videoElement.addEventListener("timeupdate", () => {
        const timeInSeconds = Math.floor(videoElement.currentTime);
        if (timeInSeconds > 0 && timeInSeconds % 5 === 0) { // Update every 5 seconds
            currentPlaybackTime = timeInSeconds;
        }
    });

    videoElement.addEventListener("seeked", () => {
        currentPlaybackTime = Math.max(Math.floor(videoElement.currentTime) - 5, 0); // Adjust stored time slightly after seek
    });

    let stalledRetryCount = 0;
    videoElement.addEventListener("stalled", () => {
        if (document.body.contains(videoElement) && (!videoElement.paused || !videoElement.ended) && stalledRetryCount < 3) {
            console.warn("Video stalled, attempting to reload media source.");
            videoElement.load();
            stalledRetryCount++;
        } else if (stalledRetryCount >= 3) {
            console.error("Video stalled multiple times, giving up on automatic reload.");
        }
    });
    videoElement.addEventListener("playing", () => stalledRetryCount = 0); // Reset retry count on successful play

    videoElement.addEventListener("ended", () => {
        updatePageTitleIndicator(false);
        const nextVideoLink = document.querySelector(".playlist-behavior-controls .next-playlist-list-item");
        const autoplayToggle = document.querySelector(".playlist-nav-controls .toggle-autoplay");

        // Check if autoplay is enabled and a next video exists
        if (nextVideoLink && nextVideoLink.href && autoplayToggle && autoplayToggle.classList.contains("yt-uix-button-toggled")) {
            console.log("Autoplay enabled, navigating to next video in playlist.");
            window.location.href = nextVideoLink.href;
        }
    });

    videoElement.addEventListener("error", (errEvt) => {
        if (allowVideoReload && errEvt.target && errEvt.target.error) {
            const error = errEvt.target.error;
            // MEDIA_ERR_NETWORK (code 2) can happen if video is paused for too long or network issues
            if (error.code === error.MEDIA_ERR_NETWORK) {
                console.warn("Video network error, attempting to reload.");
                videoElement.load();
            } else {
                console.error("Video playback error:", error.message, "(Code:", error.code + ")");
            }
        } else {
            console.error("Video playback error (no retry):", errEvt.target?.error?.message || "Unknown error");
        }
    });
};

/**
 * Handles keyboard shortcuts for video playback control (e.g., Spacebar for play/pause).
 * @param {KeyboardEvent} keyEvent - The keyboard event object.
 */
const handleKeyboardShortcuts = (keyEvent) => {
    // Shift + Spacebar to toggle play/pause
    if (keyEvent.shiftKey && keyEvent.code === "Space") {
        keyEvent.preventDefault(); // Prevent default browser scroll behavior
        if (videoElement.paused || videoElement.ended) {
            videoElement.play();
        } else {
            videoElement.pause();
        }
    }
};

/**
 * Manages video playback based on tab visibility.
 */
const handleVisibilityChange = () => {
    const isHidden = document.hidden || document.webkitHidden; // Cross-browser hidden state check
    // If tab becomes visible, video is autoplaying, and it's at the start, play it.
    if (!isHidden && document.body.contains(videoElement) && videoElement.autoplay && videoElement.currentTime === 0) {
        videoElement.play();
    }
};

/**
 * Pauses the video if the tab becomes hidden and the video is at the beginning.
 * @param {Event} playEvent - The play event object.
 */
const pauseOnHiddenTab = (playEvent) => {
    const isHidden = document.hidden || document.webkitHidden;
    if (isHidden && videoElement.currentTime === 0) {
        videoElement.pause();
        playEvent.stopPropagation(); // Prevent the play event from propagating further
    }
};

/**
 * Saves current volume settings to local storage.
 */
const saveVolumeSettings = () => {
    chrome.storage.local.set({ "muted": videoElement.muted });
    chrome.storage.local.set({ "volume": videoElement.volume });
};

/**
 * Initializes and configures the control bar and its components.
 */
const setupControlBar = () => {
    controlBar.id = "alt-control-panel";
    controlBar.appendChild(controlGroup);

    controlGroup.id = "alt-control-actions";
    // Append elements in a more structured way or using a loop
    [
        togglePlayerCheckbox, togglePlayerLabel, videoSourceSelector,
        reloadMediaButton, downloadMediaLink, speedControlToggle,
        speedControlLabel, playbackRateSelector, playerSizeToggle,
        playerSizeLabel
    ].forEach(el => controlGroup.appendChild(el));

    // Player Toggle Checkbox
    togglePlayerCheckbox.id = "alt-toggle-checkbox";
    togglePlayerCheckbox.type = "checkbox";
    updateUiText(togglePlayerCheckbox, togglePlayerLabel, msgToggleOff);
    togglePlayerCheckbox.classList.add("mod-btn", "yt-uix-tooltip");

    togglePlayerLabel.setAttribute("for", "alt-toggle-checkbox");
    togglePlayerLabel.textContent = msgToggleOff;

    // Video Source Selector
    videoSourceSelector.id = "alt-source-select";
    updateUiText(videoSourceSelector, null, msgSourceLabel); // No direct label for select
    videoSourceSelector.classList.add("yt-uix-tooltip");

    // Reload Button
    reloadMediaButton.id = "alt-reload-button";
    updateUiText(reloadMediaButton, null, msgReloadLabel);
    reloadMediaButton.classList.add("mod-btn", "yt-uix-tooltip");
    reloadMediaButton.textContent = msgReloadLabel;

    // Download Link
    downloadMediaLink.id = "alt-download-link";
    updateUiText(downloadMediaLink, null, msgDownloadLabel);
    downloadMediaLink.classList.add("mod-btn", "yt-uix-tooltip");
    downloadMediaLink.textContent = msgDownloadLabel;

    // Speed Control Checkbox
    speedControlToggle.id = "alt-speed-checkbox";
    speedControlToggle.type = "checkbox";
    updateUiText(speedControlToggle, speedControlLabel, msgSpeedOff);
    speedControlToggle.classList.add("mod-btn", "yt-uix-tooltip");

    speedControlLabel.setAttribute("for", "alt-speed-checkbox");
    speedControlLabel.textContent = msgSpeedOff;

    // Playback Rate Selector
    playbackRateSelector.id = "alt-rate-select";
    updateUiText(playbackRateSelector, null, msgRateLabel);
    playbackRateSelector.classList.add("yt-uix-tooltip");

    // Populate playback rate options
    const standardRates = ["0.25", "0.5", "1", "1.5", "2", "3"];
    for (const rateValue of standardRates) {
        const option = document.createElement("option");
        option.value = rateValue;
        option.textContent = `x${rateValue}`;
        if (rateValue === "1") {
            option.selected = true;
        }
        playbackRateSelector.appendChild(option);
    }

    // Player Size Toggle
    playerSizeToggle.id = "alt-size-checkbox";
    playerSizeToggle.type = "checkbox";
    updateUiText(playerSizeToggle, playerSizeLabel, msgSizeOff);
    playerSizeToggle.classList.add("mod-btn", "yt-uix-tooltip");

    playerSizeLabel.setAttribute("for", "alt-size-checkbox");
    playerSizeLabel.textContent = msgSizeOff;
};

/**
 * Attaches event listeners to the control bar elements.
 */
const attachControlBarEventListeners = () => {
    togglePlayerCheckbox.addEventListener("change", () => {
        if (togglePlayerCheckbox.disabled) {
            updateUiText(togglePlayerCheckbox, togglePlayerLabel, msgToggleDisabled);
            return;
        }

        const currentVideoContainer = document.body.contains(videoElement) ? customPlayerContainer : originalVideoPlayer;
        const targetVideoContainer  = document.body.contains(videoElement) ? originalVideoPlayer : customPlayerContainer;

        if (playerWrapper) {
             playerWrapper.replaceChild(targetVideoContainer, currentVideoContainer);
        } else {
            console.error("Player wrapper not found, cannot toggle player.");
            return;
        }

        if (document.body.contains(videoElement)) { // Custom player is now active
            document.body.classList.add("alt-player-active");
            updateUiText(togglePlayerCheckbox, togglePlayerLabel, msgToggleOn);
            if (videoElement.autoplay) {
                videoElement.play();
            }
        } else { // Original player is now active
            document.body.classList.remove("alt-player-active");
            togglePlayerCheckbox.checked = false; // Ensure checkbox reflects state
            updateUiText(togglePlayerCheckbox, togglePlayerLabel, msgToggleOff);
            updatePageTitleIndicator(false);
            if (isAjaxPage) {
                console.log("AJAX navigation detected, reloading page after player toggle.");
                location.reload(true); // Force a full reload for AJAX pages
            }
        }
    });

    videoSourceSelector.addEventListener("change", () => {
        videoElement.src = videoSourceSelector.value;
        videoElement.load(); // Force load new source
    });

    reloadMediaButton.addEventListener("click", () => {
        if (videoElement.ended) {
            videoElement.currentTime = 0;
            videoElement.play();
        } else {
            videoElement.load();
        }
    });

    downloadMediaLink.addEventListener("click", () => {
        const currentSourceOption = videoSourceSelector.options[videoSourceSelector.selectedIndex];
        const itag = currentSourceOption ? currentSourceOption.dataset.itag : null;

        const title = document.title
            .replace(/^\u25B6\s/, "")
            .replace(/^YouTube\s-\s/, "")
            .trim() || "YouTube video";

        const extensionMap = {
            "18": "mp4", "22": "mp4", "37": "mp4", "38": "mp4",
            "135": "mp4", "137": "mp4", "138": "mp4", "264": "mp4",
            "43": "webm", "44": "webm", "45": "webm", "46": "webm",
            "139": "m4a", "140": "m4a", "141": "m4a"
        };
        const fileExtension = itag ? `.${extensionMap[itag] || "mp4"}` : ".mp4"; // Default to mp4

        downloadMediaLink.download = `${title}${fileExtension}`;
        downloadMediaLink.href = videoElement.src;
    });

    speedControlToggle.addEventListener("change", () => {
        if (speedControlToggle.checked) {
            playbackSpeedSetting = parseFloat(playbackRateSelector.value) || 1;
            updateUiText(speedControlToggle, speedControlLabel, msgSpeedOn);
        } else {
            playbackSpeedSetting = 1;
            updateUiText(speedControlToggle, speedControlLabel, msgSpeedOff);
        }
        videoElement.playbackRate = playbackSpeedSetting;
    });

    playbackRateSelector.addEventListener("change", () => {
        playbackSpeedSetting = parseFloat(playbackRateSelector.value) || 1;
        videoElement.playbackRate = playbackSpeedSetting;
        // If speed control toggle is active, update its text to reflect current rate
        if (speedControlToggle.checked) {
            updateUiText(speedControlToggle, speedControlLabel, msgSpeedOn);
        }
    });

    playerSizeToggle.addEventListener("change", () => {
        const container = document.getElementById("watch7-container") || document.querySelector("#page.watch"); // Broader selector
        if (!container || !watchPageMain) {
            console.warn("Could not find watch container or main watch page for size toggle.");
            return;
        }

        if (playerSizeToggle.checked) {
            if (isFeatherMode) {
                document.body.classList.add("alt-feather-wide");
            } else {
                watchPageMain.classList.remove("watch-small", "watch-playlist-collapsed"); // Remove small, keep others if present
                watchPageMain.classList.add("watch-medium", "watch-playlist-collapsed"); // Ensure medium + collapsed
                container.classList.add("watch-wide");
            }
            updateUiText(playerSizeToggle, playerSizeLabel, msgSizeOn);
        } else {
            if (isFeatherMode) {
                document.body.classList.remove("alt-feather-wide");
            } else {
                container.classList.remove("watch-wide");
                watchPageMain.classList.remove("watch-medium", "watch-large", "watch-playlist-collapsed");
                watchPageMain.classList.add("watch-small");
            }
            updateUiText(playerSizeToggle, playerSizeLabel, msgSizeOff);
        }
        chrome.storage.local.set({ "embiggen": playerSizeToggle.checked });
    });
};

/**
 * Resets the state of all global variables and UI elements.
 */
const resetModuleState = () => {
    originalVideoPlayer   = null;
    playerWrapper         = null;
    watchPageMain         = null;
    currentPlaybackTime   = 0;
    playbackSpeedSetting  = 1;
    allowVideoReload      = false;

    videoElement.volume = 1;
    videoElement.muted = false;
    videoElement.playbackRate = 1;
    videoElement.src = "";
    videoElement.removeAttribute("src"); // Ensure src is completely cleared

    togglePlayerCheckbox.disabled = false;
    togglePlayerCheckbox.checked = false;
    updateUiText(togglePlayerCheckbox, togglePlayerLabel, msgToggleOff);

    // Clear existing options from source selector
    videoSourceSelector.innerHTML = "";

    downloadMediaLink.href = "";
    downloadMediaLink.download = "";

    speedControlToggle.checked = false;
    updateUiText(speedControlToggle, speedControlLabel, msgSpeedOff);

    playerSizeToggle.checked = false;
    updateUiText(playerSizeToggle, playerSizeLabel, msgSizeOff);

    // Ensure body classes are clean
    document.body.classList.remove("alt-player-active", "alt-feather-layout", "alt-feather-wide");
};

/**
 * Populates the video source selector with options from the stream map.
 * @param {Object} streamData - An object mapping quality keys to video stream details.
 */
const populateSourceSelector = (streamData) => {
    if (!streamData || Object.keys(streamData).length === 0) {
        console.warn("No stream data provided for source selector.");
        return;
    }

    // Sort streams by quality or some other metric if desired
    const sortedStreamKeys = Object.keys(streamData).sort((a, b) => {
        // Example sorting: higher quality (e.g., larger itag or resolution label) first
        const getQualityValue = (key) => {
            const label = streamData[key].label;
            if (label.includes("1080p")) return 3;
            if (label.includes("720p")) return 2;
            if (label.includes("480p")) return 1;
            return 0; // Default or unknown quality
        };
        return getQualityValue(b) - getQualityValue(a);
    });

    for (const key of sortedStreamKeys) {
        const streamInfo = streamData[key];
        const option = document.createElement("option");
        option.value = streamInfo.url;
        option.dataset.itag = streamInfo.itag;
        option.textContent = streamInfo.label;
        videoSourceSelector.appendChild(option);
    }

    // Select the first available option by default
    if (videoSourceSelector.options.length > 0) {
        videoSourceSelector.selectedIndex = 0;
        videoElement.src = videoSourceSelector.options[0].value;
    }
};

/**
 * Main initialization function for the player module.
 * @param {Object} videoStreamMap - Map of available video streams and their properties.
 */
const initializePlayerModule = (videoStreamMap) => {
    resetModuleState(); // Start with a clean slate

    try {
        // Locate YouTube player elements using more robust selectors
        originalVideoPlayer = document.getElementById("movie_player") || document.querySelector(".html5-video-player");
        if (!originalVideoPlayer) {
            throw new Error("Could not find the original YouTube player element.");
        }
        playerWrapper = originalVideoPlayer.parentNode;
        if (!playerWrapper) {
            throw new Error("Original player has no parent wrapper.");
        }

        // Find the main watch page container
        watchPageMain = playerWrapper.closest("#page.watch, #watch7-main"); // Look for common watch page IDs/classes
        if (!watchPageMain) {
            throw new Error("Could not locate the main YouTube watch page container.");
        }

        // Set up the custom video element and its container
        setupVideoElement();

        // Toolbar setup
        setupControlBar();
        attachControlBarEventListeners();

        let toolbarInsertionPoint = document.getElementById("watch7-content");
        if (toolbarInsertionPoint) {
            toolbarInsertionPoint.insertBefore(controlBar, toolbarInsertionPoint.firstElementChild);
            isFeatherMode = false;
        } else {
            // Attempt feather mode insertion point
            toolbarInsertionPoint = document.getElementById("lc"); // Feather mode container
            const videoColumn = document.getElementById("vc");
            if (toolbarInsertionPoint && videoColumn) {
                toolbarInsertionPoint.insertBefore(controlBar, videoColumn);
                isFeatherMode = true;
                document.body.classList.add("alt-feather-layout");
            } else {
                throw new Error("Failed to find a suitable insertion point for the toolbar.");
            }
        }

        // Populate video sources
        populateSourceSelector(videoStreamMap);

        // Initialize player size state
        if (!isFeatherMode) {
            // Check if YouTube's default player is already "large" or "medium"
            if (!watchPageMain.classList.contains("watch-small")) {
                playerSizeToggle.checked = true;
                updateUiText(playerSizeToggle, playerSizeLabel, msgSizeOn);
            }
        }

        // Load user options from storage
        chrome.storage.local.get(null, (options) => {
            // Visibility change handling
            const visibilityEventName = (document.hidden !== undefined) ? "visibilitychange" : "webkitvisibilitychange";
            if (options.visibility === true) {
                document.addEventListener(visibilityEventName, handleVisibilityChange);
                videoElement.addEventListener("play", pauseOnHiddenTab); // Pause if tab hidden on play
            } else {
                document.removeEventListener(visibilityEventName, handleVisibilityChange);
                videoElement.removeEventListener("play", pauseOnHiddenTab);
            }

            // Keyboard controls
            if (options.space === true) {
                document.addEventListener("keydown", handleKeyboardShortcuts);
            } else {
                document.removeEventListener("keydown", handleKeyboardShortcuts);
            }

            // Volume persistence
            if (options.audio === true) {
                if (options.volume !== undefined) videoElement.volume = options.volume;
                if (options.muted !== undefined) videoElement.muted = options.muted;
                videoElement.addEventListener("volumechange", saveVolumeSettings);
            } else {
                videoElement.removeEventListener("volumechange", saveVolumeSettings);
            }

            // Apply saved size preference
            if (options.embiggen === true && !playerSizeToggle.checked) {
                playerSizeToggle.click(); // Simulate click to trigger size change
            }

            // Ensure video element event listeners are attached after options are loaded
            attachVideoEventListeners();
        });

    } catch (error) {
        console.error("Initialization failed:", error.message);
        // Disable the toggle if initialization fails
        togglePlayerCheckbox.disabled = true;
        updateUiText(togglePlayerCheckbox, togglePlayerLabel, msgToggleDisabled);
    }
};

// --- Main execution block ---
document.addEventListener("DOMContentLoaded", () => {
    // This part would typically interact with a background script or content script to get `streamMap`.
    // For a standalone example, we'll simulate `streamMap` or assume it's passed.
    // Example: chrome.runtime.onMessage.addListener(...) or similar.
    // For now, let's assume `initializePlayerModule` is called with data from another part of the extension.
    // e.g., on a message from the background script.
    //
    // Example placeholder:
    /*
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "initPlayerWithStreams" && message.streamData) {
            initializePlayerModule(message.streamData);
            sendResponse({ status: "Player initialized" });
        }
    });
    */
    // For demonstration, directly calling init with a dummy map if no real data is available.
    // In a real extension, this would be triggered by content script logic.
    console.log("DOM Content Loaded. Waiting for stream data to initialize player module.");
});

// A simple MutationObserver to re-initialize if the page content changes (e.g., AJAX navigation on YouTube)
domMonitor = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        // Look for changes in the main video player container
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            const playerContainer = document.getElementById("movie_player") || document.querySelector(".html5-video-player");
            // If the player container is added, and it's not our custom player, re-initialize.
            // This is a heuristic and might need refinement depending on YouTube's dynamic loading.
            if (playerContainer && !playerContainer.contains(videoElement)) {
                console.log("YouTube player container detected, re-initializing module.");
                isAjaxPage = true; // Indicate AJAX navigation
                // Need to get stream data again here. This part depends on extension architecture.
                // For demonstration, we'll just call init without stream data, which will fail gracefully.
                // In a real scenario, you'd send a message to background script to fetch new stream data.
                // initializePlayerModule(null); // Or fetch actual stream data here.
                break;
            }
        }
    }
});

// Start observing the document body for changes
domMonitor.observe(document.body, { childList: true, subtree: true });

// Expose the initialization function if needed by other parts of the extension
// window.altPlayerInitialize = initializePlayerModule;