"use strict";

let TUBE_ASYNC_CALL      = false,
    TUBE_LITE_MODE       = false,
    TUBE_MONITOR         = null,
    TUBE_MAIN_PLAYER     = null,
    TUBE_PLAYER_WRAPPER  = null,
    TUBE_VIEW_AREA       = null,
    CURRENT_MEDIA_TIME   = 0,
    CURRENT_PLAYBACK_SPEED = 1,
    MEDIA_RELOAD_FLAG    = false,
    HTML5_MEDIA_CONTAINER = document.createElement("div"),
    HTML5_MEDIA_ELEMENT   = document.createElement("video"),
    INTERFACE_CONTROL_BAR = document.createElement("div"),
    INTERFACE_ACTIONS_GROUP = document.createElement("div"),
    INTERFACE_TOGGLE_INPUT = document.createElement("input"),
    INTERFACE_TOGGLE_TEXT  = document.createElement("label"),
    INTERFACE_SOURCE_DROPDOWN = document.createElement("select"),
    INTERFACE_REFRESH_BUTTON  = document.createElement("button"),
    INTERFACE_DOWNLOAD_ANCHOR = document.createElement("a"),
    INTERFACE_SPEED_TOGGLE    = document.createElement("input"),
    INTERFACE_SPEED_TEXT      = document.createElement("label"),
    INTERFACE_RATE_DROPDOWN   = document.createElement("select"),
    INTERFACE_SIZE_TOGGLE     = document.createElement("input"),
    INTERFACE_SIZE_TEXT       = document.createElement("label"),
    MSG_TOGGLE_OFF            = chrome.i18n.getMessage("toggle_unchecked"),
    MSG_TOGGLE_ON             = chrome.i18n.getMessage("toggle_checked"),
    MSG_TOGGLE_INACTIVE       = chrome.i18n.getMessage("toggle_disabled"),
    MSG_SOURCE_OPTION         = chrome.i18n.getMessage("source"),
    MSG_RELOAD_ACTION         = chrome.i18n.getMessage("reload"),
    MSG_DOWNLOAD_ACTION       = chrome.i18n.getMessage("download"),
    MSG_SPEED_NORMAL          = chrome.i18n.getMessage("speed_unchecked"),
    MSG_SPEED_CUSTOM          = chrome.i18n.getMessage("speed_checked"),
    MSG_PLAYBACK_RATE         = chrome.i18n.getMessage("rate"),
    MSG_SIZE_DEFAULT          = chrome.i18n.getMessage("size_unchecked"),
    MSG_SIZE_EXPANDED         = chrome.i18n.getMessage("size_checked");

/*
 * Section: Setup for HTML5 Media Element and its container
 * This part initializes the core video player components.
 */

HTML5_MEDIA_CONTAINER.id = "alt-media-player";
HTML5_MEDIA_CONTAINER.classList.add("player-height", "player-width", "off-screen-target", "watch-content", "player-api");
HTML5_MEDIA_CONTAINER.appendChild(HTML5_MEDIA_ELEMENT);

HTML5_MEDIA_ELEMENT.id = "alt-media-video";
HTML5_MEDIA_ELEMENT.autoplay = true;
HTML5_MEDIA_ELEMENT.controls = true;
HTML5_MEDIA_ELEMENT.preload  = true;

/* Event Handlers for Media Playback */

function updateTitleIcon(display) {
    const pageTitle = document.title.replace(/^\u25B6\s/, "");
    document.title = display ? "\u25B6 " + pageTitle : pageTitle;
}

function isWithinClickableArea(element, verticalCoord) {
    return ((parseInt(window.getComputedStyle(element).getPropertyValue("height"), 10) - 40) > verticalCoord);
}

function markVideoAsWatched() {
    try {
        let videoId, httpRequest;
        videoId = location.href.match(/[&|\?]v=([^&|#|$]+)/)[1];
        httpRequest = new XMLHttpRequest();
        httpRequest.open("GET", "https://www.youtube.com/user_watch?video_id=" + videoId);
        httpRequest.send(null);
    } catch (anError) { /* Silently ignore any errors during watched status update. */ }
}

HTML5_MEDIA_ELEMENT.addEventListener("click", function (eventObj) {
    if (isWithinClickableArea(this, eventObj.offsetY)) {
        if (this.paused || this.ended) {
            this.play();
        } else {
            this.pause();
        }
    }
});

HTML5_MEDIA_ELEMENT.addEventListener("dblclick", function (eventObj) {
    if (isWithinClickableArea(this, eventObj.offsetY)) {
        if (this.requestFullscreen) {
            this.requestFullscreen();
        } else {
            if (this.webkitRequestFullscreen) {
                this.webkitRequestFullscreen();
            }
        }
    }
});

HTML5_MEDIA_ELEMENT.addEventListener("loadedmetadata", function () {
    let parsedTime = parseInt(CURRENT_MEDIA_TIME, 10),
        minutes = 0,
        seconds = 0;
    if (!isNaN(parsedTime) && parsedTime > 0) {
        this.currentTime = parsedTime;
    } else {
        try { seconds = parseInt(location.href.match(/[&|\?|#]t=(\d*)(?:s|&|$)/)[1], 10); } catch (anError) { /* Ignore parsing errors */ }
        try { minutes = parseInt(location.href.match(/[&|\?|#]t=(\d*)m/)[1], 10); } catch (anError) { /* Ignore parsing errors */ }
        this.currentTime = ((minutes * 60) + seconds);
    }
});

HTML5_MEDIA_ELEMENT.addEventListener("play", function () {
    if (document.contains(this)) {
        this.playbackRate = parseFloat(CURRENT_PLAYBACK_SPEED) || 1;
        updateTitleIcon(true);
        markVideoAsWatched();
    } else {
        this.pause();
    }
});

HTML5_MEDIA_ELEMENT.addEventListener("pause", function () {
    if (document.contains(this)) {
        updateTitleIcon(false);
    }
});

HTML5_MEDIA_ELEMENT.addEventListener("timeupdate", function () {
    const currentTimeInt = parseInt(this.currentTime, 10);
    if (currentTimeInt > 0 && currentTimeInt % 5 === 0) {
        CURRENT_MEDIA_TIME = currentTimeInt;
    }
});

HTML5_MEDIA_ELEMENT.addEventListener("seeked", function () {
    const newTime = Math.max(parseInt(this.currentTime, 10) - 5, 0);
    CURRENT_MEDIA_TIME = newTime;
});

HTML5_MEDIA_ELEMENT.addEventListener("stalled", function () {
    if (document.contains(this) && (!this.paused || !this.ended)) {
        this.load();
    }
});

HTML5_MEDIA_ELEMENT.addEventListener("ended", function () {
    updateTitleIcon(false);
    const nextItem = document.querySelector(".playlist-behavior-controls .next-playlist-list-item"),
        autoplayButton = document.querySelector(".playlist-nav-controls .toggle-autoplay");
    if (nextItem && nextItem.href && autoplayButton && autoplayButton.classList.contains("yt-uix-button-toggled")) {
        window.location.href = nextItem.href;
    }
});

HTML5_MEDIA_ELEMENT.addEventListener("error", function (eventObj) {
    if (MEDIA_RELOAD_FLAG) {
        // This scenario often occurs if the video remains paused for an extended period.
        if (eventObj.target.error.code === eventObj.target.error.MEDIA_ERR_NETWORK) {
            this.load();
        }
    }
});

// Keyboard control for media playback (e.g., Spacebar for play/pause)
function handleMediaKeyInput(eventObj) {
    if (eventObj.shiftKey && eventObj.keyCode === 32) { // [spacebar]
        if (HTML5_MEDIA_ELEMENT.paused || HTML5_MEDIA_ELEMENT.ended) {
            HTML5_MEDIA_ELEMENT.play();
        } else {
            HTML5_MEDIA_ELEMENT.pause();
        }
    }
}

// Handler for document visibility changes
function onDocumentVisibilityChange() {
    const isHiddenProperty = (document.hidden === undefined) ? "webkitHidden" : "hidden";
    if (!document[isHiddenProperty] && document.contains(HTML5_MEDIA_ELEMENT) && HTML5_MEDIA_ELEMENT.autoplay && HTML5_MEDIA_ELEMENT.currentTime === 0) {
        HTML5_MEDIA_ELEMENT.play();
    }
}

// Conditional pause if the document tab is not visible
function pauseMediaIfHidden(eventObj) {
    const isHiddenProperty = (document.hidden === undefined) ? "webkitHidden" : "hidden";
    if (document[isHiddenProperty] && this.currentTime === 0) {
        this.pause();
        eventObj.stopPropagation();
    }
}

// Persist volume settings to local storage
function saveVolumeSettings() {
    chrome.storage.local.set({"muted": this.muted});
    chrome.storage.local.set({"volume": this.volume});
}

/*
 * Section: User Interface Toolbar Initialization
 * This block configures the custom toolbar elements.
 */

INTERFACE_CONTROL_BAR.id = "alt-control-bar";
INTERFACE_CONTROL_BAR.appendChild(INTERFACE_ACTIONS_GROUP);

INTERFACE_ACTIONS_GROUP.id = "alt-actions-group";
INTERFACE_ACTIONS_GROUP.appendChild(INTERFACE_TOGGLE_INPUT);
INTERFACE_ACTIONS_GROUP.appendChild(INTERFACE_TOGGLE_TEXT);
INTERFACE_ACTIONS_GROUP.appendChild(INTERFACE_SOURCE_DROPDOWN);
INTERFACE_ACTIONS_GROUP.appendChild(INTERFACE_REFRESH_BUTTON);
INTERFACE_ACTIONS_GROUP.appendChild(INTERFACE_DOWNLOAD_ANCHOR);
INTERFACE_ACTIONS_GROUP.appendChild(INTERFACE_SPEED_TOGGLE);
INTERFACE_ACTIONS_GROUP.appendChild(INTERFACE_SPEED_TEXT);
INTERFACE_ACTIONS_GROUP.appendChild(INTERFACE_RATE_DROPDOWN);
INTERFACE_ACTIONS_GROUP.appendChild(INTERFACE_SIZE_TOGGLE);
INTERFACE_ACTIONS_GROUP.appendChild(INTERFACE_SIZE_TEXT);

INTERFACE_TOGGLE_INPUT.id = "alt-toggle-input";
INTERFACE_TOGGLE_INPUT.type = "checkbox";
INTERFACE_TOGGLE_INPUT.title = MSG_TOGGLE_OFF;
INTERFACE_TOGGLE_INPUT.dataset.tooltipText = MSG_TOGGLE_OFF;
INTERFACE_TOGGLE_INPUT.classList.add("alt-btn", "yt-uix-tooltip");

INTERFACE_TOGGLE_TEXT.setAttribute("for", "alt-toggle-input");
INTERFACE_TOGGLE_TEXT.textContent = MSG_TOGGLE_OFF;

INTERFACE_SOURCE_DROPDOWN.id = "alt-source-dropdown";
INTERFACE_SOURCE_DROPDOWN.title = MSG_SOURCE_OPTION;
INTERFACE_SOURCE_DROPDOWN.dataset.tooltipText = MSG_SOURCE_OPTION;
INTERFACE_SOURCE_DROPDOWN.classList.add("yt-uix-tooltip");

INTERFACE_REFRESH_BUTTON.id = "alt-refresh-button";
INTERFACE_REFRESH_BUTTON.title = MSG_RELOAD_ACTION;
INTERFACE_REFRESH_BUTTON.dataset.tooltipText = MSG_RELOAD_ACTION;
INTERFACE_REFRESH_BUTTON.classList.add("alt-btn", "yt-uix-tooltip");
INTERFACE_REFRESH_BUTTON.textContent = MSG_RELOAD_ACTION;

INTERFACE_DOWNLOAD_ANCHOR.id = "alt-download-anchor";
INTERFACE_DOWNLOAD_ANCHOR.title = MSG_DOWNLOAD_ACTION;
INTERFACE_DOWNLOAD_ANCHOR.dataset.tooltipText = MSG_DOWNLOAD_ACTION;
INTERFACE_DOWNLOAD_ANCHOR.classList.add("alt-btn", "yt-uix-tooltip");
INTERFACE_DOWNLOAD_ANCHOR.textContent = MSG_DOWNLOAD_ACTION;

INTERFACE_SPEED_TOGGLE.id = "alt-speed-toggle";
INTERFACE_SPEED_TOGGLE.type = "checkbox";
INTERFACE_SPEED_TOGGLE.title = MSG_SPEED_NORMAL;
INTERFACE_SPEED_TOGGLE.dataset.tooltipText = MSG_SPEED_NORMAL;
INTERFACE_SPEED_TOGGLE.classList.add("alt-btn", "yt-uix-tooltip");

INTERFACE_SPEED_TEXT.setAttribute("for", "alt-speed-toggle");
INTERFACE_SPEED_TEXT.textContent = MSG_SPEED_NORMAL;

INTERFACE_RATE_DROPDOWN.id = "alt-rate-dropdown";
INTERFACE_RATE_DROPDOWN.title = MSG_PLAYBACK_RATE;
INTERFACE_RATE_DROPDOWN.dataset.tooltipText = MSG_PLAYBACK_RATE;
INTERFACE_RATE_DROPDOWN.classList.add("yt-uix-tooltip");

["0.25", "0.5", "1", "1.5", "2", "3"].forEach(function (rateValue) {
    const optionElement = document.createElement("option");
    optionElement.value = rateValue;
    optionElement.textContent = "x" + rateValue;
    if (rateValue === "1") {
        optionElement.selected = true;
    }
    INTERFACE_RATE_DROPDOWN.appendChild(optionElement);
});

INTERFACE_SIZE_TOGGLE.id = "alt-size-toggle";
INTERFACE_SIZE_TOGGLE.type = "checkbox";
INTERFACE_SIZE_TOGGLE.title = MSG_SIZE_DEFAULT;
INTERFACE_SIZE_TOGGLE.dataset.tooltipText = MSG_SIZE_DEFAULT;
INTERFACE_SIZE_TOGGLE.classList.add("alt-btn", "yt-uix-tooltip");

INTERFACE_SIZE_TEXT.setAttribute("for", "alt-size-toggle");
INTERFACE_SIZE_TEXT.textContent = MSG_SIZE_DEFAULT;

/* Event Handlers for Toolbar Controls */

INTERFACE_TOGGLE_INPUT.addEventListener("change", function () {
    if (this.disabled) {
        this.title = MSG_TOGGLE_INACTIVE;
        this.dataset.tooltipText = MSG_TOGGLE_INACTIVE;
        INTERFACE_TOGGLE_TEXT.textContent = MSG_TOGGLE_INACTIVE;
        return;
    }
    if (document.contains(HTML5_MEDIA_ELEMENT)) {
        if (TUBE_ASYNC_CALL) {
            location.reload(true);
        }
        TUBE_PLAYER_WRAPPER.replaceChild(TUBE_MAIN_PLAYER, HTML5_MEDIA_CONTAINER);
        document.body.classList.remove("alt-media");
        this.checked = false;
        this.title = MSG_TOGGLE_OFF;
        this.dataset.tooltipText = MSG_TOGGLE_OFF;
        INTERFACE_TOGGLE_TEXT.textContent = MSG_TOGGLE_OFF;
        updateTitleIcon(false);
    } else {
        TUBE_PLAYER_WRAPPER.replaceChild(HTML5_MEDIA_CONTAINER, TUBE_MAIN_PLAYER);
        document.body.classList.add("alt-media");
        this.checked = true;
        this.title = MSG_TOGGLE_ON;
        this.dataset.tooltipText = MSG_TOGGLE_ON;
        INTERFACE_TOGGLE_TEXT.textContent = MSG_TOGGLE_ON;
        if (HTML5_MEDIA_ELEMENT.autoplay) {
            HTML5_MEDIA_ELEMENT.play();
        }
    }
});

INTERFACE_SOURCE_DROPDOWN.addEventListener("change", function () {
    HTML5_MEDIA_ELEMENT.src = this.value;
});

INTERFACE_REFRESH_BUTTON.addEventListener("click", function () {
    if (HTML5_MEDIA_ELEMENT.ended) {
        HTML5_MEDIA_ELEMENT.currentTime = 0;
        HTML5_MEDIA_ELEMENT.play();
    } else {
        HTML5_MEDIA_ELEMENT.load();
    }
});

INTERFACE_DOWNLOAD_ANCHOR.addEventListener("click", function () {
    let fileExtension = "",
        pageTitle = document.title.replace(/^\u25B6\s/, "").replace(/^YouTube\s-\s/, ""),
        itagCode = INTERFACE_SOURCE_DROPDOWN.options[INTERFACE_SOURCE_DROPDOWN.selectedIndex].dataset.itag;
    if (itagCode) {
        switch (itagCode) {
        case "18":  // MP4 360p
        case "22":  // MP4 720p
        case "37":  // MP4 1080p
        case "38":  // MP4 4K
        case "135": // MP4 480p (no audio)
        case "137": // MP4 1080p (no audio)
        case "138": // MP4 4K (no audio)
        case "264": // MP4 1080p (no audio)
            fileExtension = ".mp4";
            break;
        case "43": // WebM 360p
        case "44": // WebM 480p
        case "45": // WebM 720p
        case "46": // WebM 1080p
            fileExtension = ".webm";
            break;
        case "139": // M4A 48kbps
        case "140": // M4A 128kbps
        case "141": // M4A 256kbps
            fileExtension = ".m4a";
            break;
        }
    }
    this.download =  (pageTitle || "YouTube video") + fileExtension;
    this.href = HTML5_MEDIA_ELEMENT.src;
});

INTERFACE_SPEED_TOGGLE.addEventListener("change", function () {
    if (this.checked) {
        CURRENT_PLAYBACK_SPEED = parseFloat(INTERFACE_RATE_DROPDOWN.value) || 1;
        this.title = MSG_SPEED_CUSTOM;
        this.dataset.tooltipText = MSG_SPEED_CUSTOM;
        INTERFACE_SPEED_TEXT.textContent = MSG_SPEED_CUSTOM;
    } else {
        CURRENT_PLAYBACK_SPEED = 1;
        this.title = MSG_SPEED_NORMAL;
        this.dataset.tooltipText = MSG_SPEED_NORMAL;
        INTERFACE_SPEED_TEXT.textContent = MSG_SPEED_NORMAL;
    }
    HTML5_MEDIA_ELEMENT.playbackRate = CURRENT_PLAYBACK_SPEED;
});

INTERFACE_RATE_DROPDOWN.addEventListener("change", function () {
    CURRENT_PLAYBACK_SPEED = parseFloat(this.value) || 1;
    HTML5_MEDIA_ELEMENT.playbackRate = CURRENT_PLAYBACK_SPEED;
});

INTERFACE_SIZE_TOGGLE.addEventListener("change", function () {
    const playerContainer = document.getElementById("watch7-container");
    if (this.checked) {
        if (TUBE_LITE_MODE) {
            document.body.classList.add("alt-media-feather-wide");
        } else {
            TUBE_VIEW_AREA.classList.remove("watch-small");
            TUBE_VIEW_AREA.classList.add("watch-medium", "watch-playlist-collapsed");
            playerContainer.classList.add("watch-wide");
        }
        this.title = MSG_SIZE_EXPANDED;
        this.dataset.tooltipText = MSG_SIZE_EXPANDED;
        INTERFACE_SIZE_TEXT.textContent = MSG_SIZE_EXPANDED;
    } else {
        if (TUBE_LITE_MODE) {
            document.body.classList.remove("alt-media-feather-wide");
        } else {
            playerContainer.classList.remove("watch-wide");
            TUBE_VIEW_AREA.classList.remove("watch-medium", "watch-large", "watch-playlist-collapsed");
            TUBE_VIEW_AREA.classList.add("watch-small");
        }
        this.title = MSG_SIZE_DEFAULT;
        this.dataset.tooltipText = MSG_SIZE_DEFAULT;
        INTERFACE_SIZE_TEXT.textContent = MSG_SIZE_DEFAULT;
    }
    chrome.storage.local.set({"embiggen": this.checked});
});

/*
 * Section: Initialization Routine
 * This function sets up the player and UI based on provided stream data and user preferences.
 */

function initializePlayer(mediaStreamData) {

    TUBE_MAIN_PLAYER    = null;
    TUBE_PLAYER_WRAPPER = null;
    TUBE_VIEW_AREA      = null;

    CURRENT_MEDIA_TIME   = 0;
    CURRENT_PLAYBACK_SPEED = 1;

    HTML5_MEDIA_ELEMENT.volume = 1;
    HTML5_MEDIA_ELEMENT.muted = false;
    HTML5_MEDIA_ELEMENT.playbackRate = 1;
    HTML5_MEDIA_ELEMENT.src = "";

    INTERFACE_TOGGLE_INPUT.disabled = false;
    INTERFACE_TOGGLE_INPUT.checked = false;
    INTERFACE_TOGGLE_INPUT.title = MSG_TOGGLE_OFF;
    INTERFACE_TOGGLE_INPUT.dataset.tooltipText = MSG_TOGGLE_OFF;
    INTERFACE_TOGGLE_TEXT.textContent = MSG_TOGGLE_OFF; // Changed from assignment to textContent

    INTERFACE_SOURCE_DROPDOWN.options.length = 0;

    INTERFACE_DOWNLOAD_ANCHOR.href = "";
    INTERFACE_DOWNLOAD_ANCHOR.download = "";

    INTERFACE_SPEED_TOGGLE.checked = false;
    INTERFACE_SPEED_TOGGLE.title = MSG_SPEED_NORMAL;
    INTERFACE_SPEED_TOGGLE.dataset.tooltipText = MSG_SPEED_NORMAL;
    INTERFACE_SPEED_TEXT.textContent = MSG_SPEED_NORMAL; // Changed from assignment to textContent

    INTERFACE_SIZE_TOGGLE.checked = false;
    INTERFACE_SIZE_TOGGLE.title = MSG_SIZE_DEFAULT;
    INTERFACE_SIZE_TOGGLE.dataset.tooltipText = MSG_SIZE_DEFAULT;
    INTERFACE_SIZE_TEXT.textContent = MSG_SIZE_DEFAULT;

    try {

        // Locate YouTube specific elements on the page
        TUBE_MAIN_PLAYER = document.getElementById("movie_player").parentNode;
        TUBE_PLAYER_WRAPPER = TUBE_MAIN_PLAYER.parentNode;
        TUBE_VIEW_AREA = TUBE_PLAYER_WRAPPER.parentNode;

        if (!TUBE_VIEW_AREA) {
            throw new Error("Could not find YouTube video player structure.");
        }

        // Insert the custom toolbar into the page
        let pageContentArea = document.getElementById("watch7-content");

        if (pageContentArea) {
            pageContentArea.insertBefore(INTERFACE_CONTROL_BAR, pageContentArea.firstElementChild);
            TUBE_LITE_MODE = false;
            document.body.classList.remove("alt-media-feather", "alt-media-feather-wide");
        } else {
            pageContentArea = document.getElementById("lc");
            if (pageContentArea) {
                pageContentArea.insertBefore(INTERFACE_CONTROL_BAR, document.getElementById("vc"));
                TUBE_LITE_MODE = true;
                document.body.classList.add("alt-media-feather");
            } else {
                throw new Error("Failed to insert the custom toolbar.");
            }
        }

        // Populate video source options
        if (!mediaStreamData) {
            throw new Error("No media stream data available.");
        }

        Object.keys(mediaStreamData).forEach(function (key) {
            const optionElement = document.createElement("option");
            optionElement.value = mediaStreamData[key].url;
            optionElement.dataset.itag = mediaStreamData[key].itag;
            optionElement.textContent = mediaStreamData[key].label;
            INTERFACE_SOURCE_DROPDOWN.appendChild(optionElement);
        });

        HTML5_MEDIA_ELEMENT.src = INTERFACE_SOURCE_DROPDOWN.options[INTERFACE_SOURCE_DROPDOWN.selectedIndex].value;

        // Apply initial size settings
        if (!TUBE_LITE_MODE) {
            if (!TUBE_VIEW_AREA.classList.contains("watch-small")) {
                INTERFACE_SIZE_TOGGLE.checked = true;
                INTERFACE_SIZE_TOGGLE.title = MSG_SIZE_EXPANDED;
                INTERFACE_SIZE_TOGGLE.dataset.tooltipText = MSG_SIZE_EXPANDED;
                INTERFACE_SIZE_TEXT.textContent = MSG_SIZE_EXPANDED; // Changed from assignment to textContent
            }
        }

        // Retrieve and apply user options from storage
        chrome.storage.local.get(null, function (userOptions) {

            const visibilityEventName = (document.hidden !== undefined) ?  "visibilitychange" : "webkitvisibilitychange";

            if (userOptions.visibility === true) {
                document.addEventListener(visibilityEventName, onDocumentVisibilityChange);