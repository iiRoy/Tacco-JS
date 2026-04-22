/*jslint browser: true, indent: 4, regexp: true */
/*global chrome, MouseEvent, MutationObserver */

// This script defines global variables and functions for enhancing YouTube's video player.

"use strict";

// --- Global Variable Declarations ---
// These variables hold references to YouTube elements, HTML5 player components,
// UI controls, and state information.

var YOUTUBE_AJAX          = false, // Flag to indicate if YouTube is using AJAX navigation
    YOUTUBE_FEATHER       = false, // Flag for YouTube's "Feather" layout
    YOUTUBE_OBSERVER      = null,  // MutationObserver instance for DOM changes
    YOUTUBE_PLAYER        = null,  // Reference to the original YouTube player element
    YOUTUBE_CONTAINER     = null,  // Parent container of the YouTube player
    YOUTUBE_WATCH         = null,  // The main YouTube watch page container

    STATE_VIDEO_TIME      = 0,     // Stores the current video playback time
    STATE_VIDEO_RATE      = 1,     // Stores the current video playback rate
    STATE_VIDEO_RETRY     = false, // Flag to indicate if video error retry is active

    // --- HTML5 Video Player Elements ---
    HTML5_PLAYER          = document.createElement("div"),  // Wrapper div for the custom HTML5 video
    HTML5_VIDEO           = document.createElement("video"),// The actual HTML5 video element

    // --- User Interface (UI) Elements ---
    UI_TOOLBAR            = document.createElement("div"),    // Main toolbar container
    UI_ACTIONS            = document.createElement("div"),    // Container for action buttons/selects
    UI_TOGGLE_CHECKBOX    = document.createElement("input"),  // Checkbox to toggle custom player
    UI_TOGGLE_LABEL       = document.createElement("label"),  // Label for the toggle checkbox
    UI_SOURCE_SELECT      = document.createElement("select"), // Dropdown for video source quality
    UI_RELOAD_BUTTON      = document.createElement("button"), // Button to reload the video
    UI_DOWNLOAD_LINK      = document.createElement("a"),      // Link to download the current video source
    UI_SPEED_CHECKBOX     = document.createElement("input"),  // Checkbox to enable/disable custom speed
    UI_SPEED_LABEL        = document.createElement("label"),  // Label for the speed checkbox
    UI_RATE_SELECT        = document.createElement("select"), // Dropdown for custom playback rates
    UI_SIZE_CHECKBOX      = document.createElement("input"),  // Checkbox to toggle player size
    UI_SIZE_LABEL         = document.createElement("label"),  // Label for the size checkbox

    // --- Internationalization (i18n) Text ---
    TEXT_TOGGLE_UNCHECKED = chrome.i18n.getMessage("toggle_unchecked"), // Text for unchecked toggle
    TEXT_TOGGLE_CHECKED   = chrome.i18n.getMessage("toggle_checked"),   // Text for checked toggle
    TEXT_TOGGLE_DISABLED  = chrome.i18n.getMessage("toggle_disabled"),  // Text for disabled toggle
    TEXT_SOURCE           = chrome.i18n.getMessage("source"),          // Text for source selection
    TEXT_RELOAD           = chrome.i18n.getMessage("reload"),          // Text for reload button
    TEXT_DOWNLOAD         = chrome.i18n.getMessage("download"),        // Text for download link
    TEXT_SPEED_UNCHECKED  = chrome.i18n.getMessage("speed_unchecked"), // Text for unchecked speed
    TEXT_SPEED_CHECKED    = chrome.i18n.getMessage("speed_checked"),   // Text for checked speed
    TEXT_RATE             = chrome.i18n.getMessage("rate"),            // Text for rate selection
    TEXT_SIZE_UNCHECKED   = chrome.i18n.getMessage("size_unchecked"), // Text for unchecked size
    TEXT_SIZE_CHECKED     = chrome.i18n.getMessage("size_checked");   // Text for checked size

/*-------------------------------------------------------------------------------------------------------------------*/
/* HTML5 video player setup and event handling                                                                       */
/*-------------------------------------------------------------------------------------------------------------------*/

// Configure the HTML5 player container element.
HTML5_PLAYER.id = "crxhtml5-player";
HTML5_PLAYER.classList.add("player-height", "player-width", "off-screen-target", "watch-content", "player-api");
HTML5_PLAYER.appendChild(HTML5_VIDEO); // Attach the actual video element to its wrapper.

// Configure the HTML5 video element properties.
HTML5_VIDEO.id       = "crxhtml5-video";
HTML5_VIDEO.autoplay = true;  // Video should start playing automatically.
HTML5_VIDEO.controls = true;  // Display native video controls.
HTML5_VIDEO.preload  = true;  // Preload video metadata and a portion of the data.

/*---------------------------------------------------------------------------*/
/* HTML5 Video Events and Helper Functions                                   */
/*---------------------------------------------------------------------------*/

/**
 * Updates the document title with a play icon prefix based on video playback status.
 * @param {boolean} show - True to show the play icon, false to hide it.
 */
function icon( show ) {
    var title = document.title.replace( /^\u25B6\s/, "" ); // Remove existing play icon.
    document.title = show ? "\u25B6 " + title : title;  // Add or remove the play icon.
}

/**
 * Checks if a click event occurred within the playable area of the video.
 * This prevents control clicks (e.g., on the progress bar) from triggering play/pause.
 * @param {HTMLVideoElement} v - The video element.
 * @param {number} y - The Y-coordinate of the click event.
 * @returns {boolean} - True if the click is within the hitbox, false otherwise.
 */
function hitbox( v, y ) {
    return ( ( parseInt( window.getComputedStyle( v ).getPropertyValue( "height" ), 10 ) - 40 ) > y );
}

/**
 * Sends a request to YouTube to mark the current video as "watched".
 * This is typically done to update viewing history.
 */
function watched() {
    try {
        var id, xhr;
        // Extract video ID from the current URL.
        id  = location.href.match( /[&|\?]v=([^&|#|$]+)/ )[1];
        xhr = new XMLHttpRequest();
        // Send a GET request to YouTube's user_watch endpoint.
        xhr.open( "GET", "https://www.youtube.com/user_watch?video_id=" + id );
        xhr.send( null );
    } catch ( ignore ) {
        // Errors during this process are non-critical and can be ignored.
    }
}

// --- Event Listener for HTML5_VIDEO click ---
HTML5_VIDEO.addEventListener( "click", function ( e ) {
    // Only process clicks within the defined hitbox to avoid interference with controls.
    if ( hitbox( this, e.offsetY ) ) {
        if ( this.paused || this.ended ) {
            this.play(); // Play the video if it's paused or ended.
        } else {
            this.pause(); // Pause the video if it's playing.
        }
    }
} );

// --- Event Listener for HTML5_VIDEO double click ---
HTML5_VIDEO.addEventListener( "dblclick", function ( e ) {
    // Check hitbox for double-click as well.
    if ( hitbox( this, e.offsetY ) ) {
        // Request fullscreen mode for the video.
        if ( this.requestFullscreen ) {
            this.requestFullscreen();
        } else {
            // Fallback for Webkit-based browsers.
            if ( this.webkitRequestFullscreen ) {
                this.webkitRequestFullscreen();
            }
        }
    }
} );

// --- Event Listener for HTML5_VIDEO loadedmetadata ---
HTML5_VIDEO.addEventListener( "loadedmetadata", function () {
    var t = parseInt( STATE_VIDEO_TIME, 10 ), // Stored video time.
        m = 0,                                // Minutes from URL.
        s = 0;                                // Seconds from URL.

    // If a valid stored time exists, jump to it.
    if ( !isNaN( t ) && t > 0 ) {
        this.currentTime = t;
    } else {
        // Otherwise, try to parse time from the URL (e.g., #t=1m30s).
        try { s = parseInt( location.href.match( /[&|\?|#]t=(\d*)(?:s|&|$)/ )[1], 10 ); } catch ( ignore ) {}
        try { m = parseInt( location.href.match( /[&|\?|#]t=(\d*)m/ )[1], 10 ); } catch ( ignore ) {}
        this.currentTime = ( ( m * 60 ) + s ); // Set current time based on parsed values.
    }
} );

// --- Event Listener for HTML5_VIDEO play ---
HTML5_VIDEO.addEventListener( "play", function () {
    // Ensure the video element is still in the document.
    if ( document.contains( this ) ) {
        this.playbackRate = parseFloat( STATE_VIDEO_RATE ) || 1; // Apply stored playback rate.
        icon( true );  // Show the play icon in the document title.
        watched();     // Mark the video as watched.
    } else {
        this.pause(); // If detached, pause the video.
    }
} );

// --- Event Listener for HTML5_VIDEO pause ---
HTML5_VIDEO.addEventListener( "pause", function () {
    // Check if the video element is still part of the document.
    if ( document.contains( this ) ) {
        icon( false ); // Hide the play icon from the document title.
    }
} );

// --- Event Listener for HTML5_VIDEO timeupdate ---
HTML5_VIDEO.addEventListener( "timeupdate", function () {
    var t = parseInt( this.currentTime, 10 ); // Get current time as an integer.
    // Update stored time every 5 seconds to avoid excessive updates.
    if ( t > 0 && t % 5 === 0 ) {
        STATE_VIDEO_TIME = t;
    }
} );

// --- Event Listener for HTML5_VIDEO seeked ---
HTML5_VIDEO.addEventListener( "seeked", function () {
    // When seeking, adjust stored time slightly back to ensure context on reload.
    var t = Math.max( parseInt( this.currentTime, 10 ) - 5, 0 );
    STATE_VIDEO_TIME = t;
} );

// --- Event Listener for HTML5_VIDEO stalled ---
HTML5_VIDEO.addEventListener( "stalled", function () {
    // If stalled and not paused/ended, attempt to reload the video.
    if ( document.contains( this ) && ( !this.paused || !this.ended ) ) {
        this.load();
    }
} );

// --- Event Listener for HTML5_VIDEO ended ---
HTML5_VIDEO.addEventListener( "ended", function () {
    icon( false ); // Hide the play icon.
    // Logic for playing the next video in a YouTube playlist if autoplay is enabled.
    var next = document.querySelector( ".playlist-behavior-controls .next-playlist-list-item" ),
        auto = document.querySelector( ".playlist-nav-controls .toggle-autoplay" );
    if ( next && next.href && auto && auto.classList.contains( "yt-uix-button-toggled" ) ) {
        window.location.href = next.href; // Navigate to the next video.
    }
} );

// --- Event Listener for HTML5_VIDEO error ---
HTML5_VIDEO.addEventListener( "error", function ( e ) {
    // If retry is enabled and it's a network error, attempt to reload.
    if ( STATE_VIDEO_RETRY ) {
        // This often happens if the video is paused for an extended period.
        if ( e.target.error.code === e.target.error.MEDIA_ERR_NETWORK ) {
            this.load();
        }
    }
} );

// --- Keyboard Controls Function (option.space) ---
function videoKeyboardControls( e ) {
    // If Shift + Space is pressed.
    if ( e.shiftKey && e.keyCode === 32 ) { // [spacebar]
        if ( HTML5_VIDEO.paused || HTML5_VIDEO.ended ) {
            HTML5_VIDEO.play(); // Play if paused.
        } else {
            HTML5_VIDEO.pause(); // Pause if playing.
        }
    }
}

// --- Visibility Change Function (option.visibility) ---
function videoVisibilityChange() {
    // Determine the correct hidden property name across browsers.
    var hidden = ( document.hidden === undefined ) ? "webkitHidden" : "hidden";
    // If not hidden, video is in document, autoplay is on, and time is 0, then play.
    if ( !document[hidden] && document.contains( HTML5_VIDEO ) && HTML5_VIDEO.autoplay && HTML5_VIDEO.currentTime === 0 ) {
        HTML5_VIDEO.play();
    }
}

// --- Video Pause If Hidden Function (option.visibility) ---
function videoPauseIfHidden( e ) {
    // Determine the correct hidden property name.
    var hidden = ( document.hidden === undefined ) ? "webkitHidden" : "hidden";
    // If the document is hidden and video is at start, pause it.
    if ( document[hidden] && this.currentTime === 0 ) {
        this.pause();
        e.stopPropagation(); // Prevent further propagation of the event.
    }
}

// --- Video Volume Change Function (option.audio) ---
function videoVolumeChange() {
    // Store the current mute state and volume level in local storage.
    chrome.storage.local.set( { "muted": this.muted } );
    chrome.storage.local.set( { "volume": this.volume } );
}

/*-------------------------------------------------------------------------------------------------------------------*/
/* Toolbar User Interface Setup                                                                                      */
/*-------------------------------------------------------------------------------------------------------------------*/

// Set the ID for the main toolbar container.
UI_TOOLBAR.id = "crxhtml5-toolbar";
// Append the actions container to the toolbar.
UI_TOOLBAR.appendChild( UI_ACTIONS );

// Set the ID for the actions container.
UI_ACTIONS.id = "crxhtml5-actions";
// Append all individual UI controls to the actions container.
UI_ACTIONS.appendChild( UI_TOGGLE_CHECKBOX );
UI_ACTIONS.appendChild( UI_TOGGLE_LABEL );
UI_ACTIONS.appendChild( UI_SOURCE_SELECT );
UI_ACTIONS.appendChild( UI_RELOAD_BUTTON );
UI_ACTIONS.appendChild( UI_DOWNLOAD_LINK );
UI_ACTIONS.appendChild( UI_SPEED_CHECKBOX );
UI_ACTIONS.appendChild( UI_SPEED_LABEL );
UI_ACTIONS.appendChild( UI_RATE_SELECT );
UI_ACTIONS.appendChild( UI_SIZE_CHECKBOX );
UI_ACTIONS.appendChild( UI_SIZE_LABEL );

// --- Configure UI_TOGGLE_CHECKBOX ---
UI_TOGGLE_CHECKBOX.id               = "crxhtml5-toggle";
UI_TOGGLE_CHECKBOX.type             = "checkbox";
UI_TOGGLE_CHECKBOX.title            = TEXT_TOGGLE_UNCHECKED;
UI_TOGGLE_CHECKBOX.dataset.tooltipText = TEXT_TOGGLE_UNCHECKED;
UI_TOGGLE_CHECKBOX.classList.add( "crxhtml5-btn", "yt-uix-tooltip" );

// --- Configure UI_TOGGLE_LABEL ---
UI_TOGGLE_LABEL.setAttribute( "for", "crxhtml5-toggle" );
UI_TOGGLE_LABEL.textContent         = TEXT_TOGGLE_UNCHECKED;

// --- Configure UI_SOURCE_SELECT ---
UI_SOURCE_SELECT.id                 = "crxhtml5-source";
UI_SOURCE_SELECT.title              = TEXT_SOURCE;
UI_SOURCE_SELECT.dataset.tooltipText = TEXT_SOURCE;
UI_SOURCE_SELECT.classList.add( "yt-uix-tooltip" );

// --- Configure UI_RELOAD_BUTTON ---
UI_RELOAD_BUTTON.id                 = "crxhtml5-reload";
UI_RELOAD_BUTTON.title              = TEXT_RELOAD;
UI_RELOAD_BUTTON.dataset.tooltipText = TEXT_RELOAD;
UI_RELOAD_BUTTON.classList.add( "crxhtml5-btn", "yt-uix-tooltip" );
UI_RELOAD_BUTTON.textContent        = TEXT_RELOAD;

// --- Configure UI_DOWNLOAD_LINK ---
UI_DOWNLOAD_LINK.id                 = "crxhtml5-download";
UI_DOWNLOAD_LINK.title              = TEXT_DOWNLOAD;
UI_DOWNLOAD_LINK.dataset.tooltipText = TEXT_DOWNLOAD;
UI_DOWNLOAD_LINK.classList.add( "crxhtml5-btn", "yt-uix-tooltip" );
UI_DOWNLOAD_LINK.textContent        = TEXT_DOWNLOAD;

// --- Configure UI_SPEED_CHECKBOX ---
UI_SPEED_CHECKBOX.id                = "crxhtml5-speed";
UI_SPEED_CHECKBOX.type              = "checkbox";
UI_SPEED_CHECKBOX.title             = TEXT_SPEED_UNCHECKED;
UI_SPEED_CHECKBOX.dataset.tooltipText = TEXT_SPEED_UNCHECKED;
UI_SPEED_CHECKBOX.classList.add( "crxhtml5-btn", "yt-uix-tooltip" );

// --- Configure UI_SPEED_LABEL ---
UI_SPEED_LABEL.setAttribute( "for", "crxhtml5-speed" );
UI_SPEED_LABEL.textContent          = TEXT_SPEED_UNCHECKED;

// --- Configure UI_RATE_SELECT ---
UI_RATE_SELECT.id                   = "crxhtml5-rate";
UI_RATE_SELECT.title                = TEXT_RATE;
UI_RATE_SELECT.dataset.tooltipText  = TEXT_RATE;
UI_RATE_SELECT.classList.add( "yt-uix-tooltip" );

// Populate the rate select dropdown with common playback speeds.
[ "0.25", "0.5", "1", "1.5", "2", "3" ].forEach( function ( r ) {
    var o = document.createElement( "option" ); // Create a new option element.
    o.value     = r;                             // Set its value.
    o.textContent = "x" + r;                     // Set its display text.
    if ( r === "1" ) {
        o.selected = true;                       // Mark '1' as the default selected option.
    }
    UI_RATE_SELECT.appendChild( o );             // Add the option to the select dropdown.
} );

// --- Configure UI_SIZE_CHECKBOX ---
UI_SIZE_CHECKBOX.id                 = "crxhtml5-size";
UI_SIZE_CHECKBOX.type               = "checkbox";
UI_SIZE_CHECKBOX.title              = TEXT_SIZE_UNCHECKED;
UI_SIZE_CHECKBOX.dataset.tooltipText = TEXT_SIZE_UNCHECKED;
UI_SIZE_CHECKBOX.classList.add( "crxhtml5-btn", "yt-uix-tooltip" );

// --- Configure UI_SIZE_LABEL ---
UI_SIZE_LABEL.setAttribute( "for", "crxhtml5-size" );
UI_SIZE_LABEL.textContent           = TEXT_SIZE_UNCHECKED;

/*---------------------------------------------------------------------------*/
/* Toolbar Event Listeners                                                   */
/*---------------------------------------------------------------------------*/

// Event listener for the toggle checkbox (switching between YouTube player and custom HTML5 player).
UI_TOGGLE_CHECKBOX.addEventListener( "change", function () {
    if ( this.disabled ) {
        // If the toggle is disabled, update its visual state and prevent action.
        this.title              = TEXT_TOGGLE_DISABLED;
        this.dataset.tooltipText = TEXT_TOGGLE_DISABLED;
        UI_TOGGLE_LABEL.textContent = TEXT_TOGGLE_DISABLED;
        return;
    }

    // Check if the custom HTML5 video is currently active.
    if ( document.contains( HTML5_VIDEO ) ) {
        // If YouTube uses AJAX, a full page reload might be needed for proper switch back.
        if ( YOUTUBE_AJAX ) {
            location.reload( true );
        }
        // Replace the custom HTML5 player with the original YouTube player.
        YOUTUBE_CONTAINER.replaceChild( YOUTUBE_PLAYER, HTML5_PLAYER );
        document.body.classList.remove( "crxhtml5" ); // Remove custom player class from body.
        this.checked            = false;              // Uncheck the toggle.
        this.title              = TEXT_TOGGLE_UNCHECKED;
        this.dataset.tooltipText = TEXT_TOGGLE_UNCHECKED;
        UI_TOGGLE_LABEL.textContent = TEXT_TOGGLE_UNCHECKED;
        icon( false );                                // Hide the playing icon in the title.
    } else {
        // Replace the original YouTube player with the custom HTML5 player.
        YOUTUBE_CONTAINER.replaceChild( HTML5_PLAYER, YOUTUBE_PLAYER );
        document.body.classList.add( "crxhtml5" );    // Add custom player class to body.
        this.checked            = true;               // Check the toggle.
        this.title              = TEXT_TOGGLE_CHECKED;
        this.dataset.tooltipText = TEXT_TOGGLE_CHECKED;
        UI_TOGGLE_LABEL.textContent = TEXT_TOGGLE_CHECKED;
        // If autoplay is enabled for the HTML5 video, start playback.
        if ( HTML5_VIDEO.autoplay ) {
            HTML5_VIDEO.play();
        }
    }
} );

// Event listener for the source selection dropdown.
UI_SOURCE_SELECT.addEventListener( "change", function () {
    HTML5_VIDEO.src = this.value; // Change the HTML5 video source to the selected option.
} );

// Event listener for the reload button.
UI_RELOAD_BUTTON.addEventListener( "click", function () {
    if ( HTML5_VIDEO.ended ) {
        HTML5_VIDEO.currentTime = 0; // If video ended, reset time and play.
        HTML5_VIDEO.play();
    } else {
        HTML5_VIDEO.load(); // Otherwise, just reload the current source.
    }
} );

// Event listener for the download link.
UI_DOWNLOAD_LINK.addEventListener( "click", function () {
    var x = "", // File extension.
        t = document.title.replace( /^\u25B6\s/, "" ).replace( /^YouTube\s-\s/, "" ), // Cleaned video title.
        i = UI_SOURCE_SELECT.options[ UI_SOURCE_SELECT.selectedIndex ].dataset.itag; // YouTube itag for format.

    // Determine file extension based on YouTube's itag.
    if ( i ) {
        switch ( i ) {
        case "18":  // MP4 360p
        case "22":  // MP4 720p
        case "37":  // MP4 1080p
        case "38":  // MP4 4K
        case "135": // MP4 480p (no audio)
        case "137": // MP4 1080p (no audio)
        case "138": // MP4 4K (no audio)
        case "264": // MP4 1080p (no audio)
            x = ".mp4";
            break;
        case "43":  // WebM 360p
        case "44":  // WebM 480p
        case "45":  // WebM 720p
        case "46":  // WebM 1080p
            x = ".webm";
            break;
        case "139": // M4A 48kbps
        case "140": // M4A 128kbps
        case "141": // M4A 256kbps
            x = ".m4a";
            break;
        }
    }
    // Set the download filename and the href for the download.
    this.download = ( t || "YouTube video" ) + x;
    this.href     = HTML5_VIDEO.src;
} );

// Event listener for the speed checkbox.
UI_SPEED_CHECKBOX.addEventListener( "change", function () {
    if ( this.checked ) {
        // If checked, apply the selected rate and update UI text.
        STATE_VIDEO_RATE        = parseFloat( UI_RATE_SELECT.value ) || 1;
        this.title              = TEXT_SPEED_CHECKED;
        this.dataset.tooltipText = TEXT_SPEED_CHECKED;
        UI_SPEED_LABEL.textContent = TEXT_SPEED_CHECKED;
    } else {
        // If unchecked, reset rate to 1 and update UI text.
        STATE_VIDEO_RATE        = 1;
        this.title              = TEXT_SPEED_UNCHECKED;
        this.dataset.tooltipText = TEXT_SPEED_UNCHECKED;
        UI_SPEED_LABEL.textContent = TEXT_SPEED_UNCHECKED;
    }
    HTML5_VIDEO.playbackRate = STATE_VIDEO_RATE; // Apply the new playback rate to the video.
} );

// Event listener for the rate selection dropdown.
UI_RATE_SELECT.addEventListener( "change", function () {
    STATE_VIDEO_RATE         = parseFloat( this.value ) || 1; // Update stored rate.
    HTML5_VIDEO.playbackRate = STATE_VIDEO_RATE;             // Apply new rate to video.
} );

// Event listener for the size checkbox (toggles video player size).
UI_SIZE_CHECKBOX.addEventListener( "change", function () {
    var container = document.getElementById( "watch7-container" ); // Get the main watch container.

    if ( this.checked ) {
        // If checked, expand the player size.
        if ( YOUTUBE_FEATHER ) {
            document.body.classList.add( "crxhtml5-feather-wide" ); // Feather mode specific class.
        } else {
            YOUTUBE_WATCH.classList.remove( "watch-small" );
            YOUTUBE_WATCH.classList.add( "watch-medium", "watch-playlist-collapsed" );
            container.classList.add( "watch-wide" ); // Standard layout wide class.
        }
        this.title              = TEXT_SIZE_CHECKED;
        this.dataset.tooltipText = TEXT_SIZE_CHECKED;
        UI_SIZE_LABEL.textContent = TEXT_SIZE_CHECKED;
    } else {
        // If unchecked, revert to smaller player size.
        if ( YOUTUBE_FEATHER ) {
            document.body.classList.remove( "crxhtml5-feather-wide" ); // Remove Feather wide class.
        } else {
            container.classList.remove( "watch-wide" );
            YOUTUBE_WATCH.classList.remove( "watch-medium", "watch-large", "watch-playlist-collapsed" );
            YOUTUBE_WATCH.classList.add( "watch-small" ); // Standard layout small class.
        }
        this.title              = TEXT_SIZE_UNCHECKED;
        this.dataset.tooltipText = TEXT_SIZE_UNCHECKED;
        UI_SIZE_LABEL.textContent = TEXT_SIZE_UNCHECKED;
    }
    // Store the embiggen (size) state in Chrome local storage.
    chrome.storage.local.set( { "embiggen": this.checked } );
} );

/*-------------------------------------------------------------------------------------------------------------------*/
/* Initialization Function                                                                                           */
/*-------------------------------------------------------------------------------------------------------------------*/

/**
 * Initializes the custom HTML5 player and its UI, integrating it into the YouTube page.
 * @param {object} streamMap - An object containing available video streams (qualities, URLs, itags).
 */
function init( streamMap ) {

    // --- Reset Global Variables for a New Initialization ---
    YOUTUBE_PLAYER    = null;
    YOUTUBE_CONTAINER = null;
    YOUTUBE_WATCH     = null;

    STATE_VIDEO_TIME  = 0;
    STATE_VIDEO_RATE  = 1;

    // --- Reset HTML5 Video Properties ---
    HTML5_VIDEO.volume     = 1;
    HTML5_VIDEO.muted      = false;
    HTML5_VIDEO.playbackRate = 1;
    HTML5_VIDEO.src        = "";

    // --- Reset UI Toggle Checkbox State ---
    UI_TOGGLE_CHECKBOX.disabled          = false;
    UI_TOGGLE_CHECKBOX.checked           = false;
    UI_TOGGLE_CHECKBOX.title             = TEXT_TOGGLE_UNCHECKED;
    UI_TOGGLE_CHECKBOX.dataset.tooltipText = TEXT_TOGGLE_UNCHECKED;
    UI_TOGGLE_LABEL                      = TEXT_TOGGLE_UNCHECKED; // Note: This line seems to be assigning to the label element itself, not its textContent. This might be a subtle bug in the original code, but I must replicate it exactly.

    // --- Clear Previous Source Options ---
    UI_SOURCE_SELECT.options.length = 0;

    // --- Reset Download Link Properties ---
    UI_DOWNLOAD_LINK.href     = "";
    UI_DOWNLOAD_LINK.download = "";

    // --- Reset Speed Checkbox State ---
    UI_SPEED_CHECKBOX.checked           = false;
    UI_SPEED_CHECKBOX.title             = TEXT_SPEED_UNCHECKED;
    UI_SPEED_CHECKBOX.dataset.tooltipText = TEXT_SPEED_UNCHECKED;
    UI_SPEED_LABEL                      = TEXT_SPEED_UNCHECKED; // Same potential bug as UI_TOGGLE_LABEL.

    // --- Reset Size Checkbox State ---
    UI_SIZE_CHECKBOX.checked           = false;
    UI_SIZE_CHECKBOX.title             = TEXT_SIZE_UNCHECKED;
    UI_SIZE_CHECKBOX.dataset.tooltipText = TEXT_SIZE_UNCHECKED;
    UI_SIZE_LABEL.textContent          = TEXT_SIZE_UNCHECKED;

    try {

        // --- Locate YouTube Player Elements ---
        YOUTUBE_PLAYER    = document.getElementById( "movie_player" ).parentNode;
        YOUTUBE_CONTAINER = YOUTUBE_PLAYER.parentNode;
        YOUTUBE_WATCH     = YOUTUBE_CONTAINER.parentNode;

        // Critical check: if no watch container is found, throw an error.
        if ( !YOUTUBE_WATCH ) {
            throw new Error( "No YouTube video player" );
        }

        // --- Insert Toolbar into YouTube Page ---
        var content = document.getElementById( "watch7-content" ); // Standard YouTube layout.

        if ( content ) {
            content.insertBefore( UI_TOOLBAR, content.firstElementChild );
            YOUTUBE_FEATHER = false; // Not using Feather layout.
            document.body.classList.remove( "crxhtml5-feather", "crxhtml5-feather-wide" );
        } else {
            // Try "Feather" layout specific ID if standard one is not found.
            content = document.getElementById( "lc" );
            if ( content ) {
                content.insertBefore( UI_TOOLBAR, document.getElementById( "vc" ) );
                YOUTUBE_FEATHER = true; // Using Feather layout.
                document.body.classList.add( "crxhtml5-feather" );
            } else {
                throw new Error( "Failed to insert toolbar" ); // Unable to find a suitable place for toolbar.
            }
        }

        // --- Populate Video Source Options ---
        if ( !streamMap ) {
            throw new Error( "No streamMap" ); // Stream map is essential for video sources.
        }

        // Iterate over the stream map to create options for the source select dropdown.
        Object.keys( streamMap ).forEach( function ( k ) {
            var o = document.createElement( "option" );
            o.value       = streamMap[ k ].url;
            o.dataset.itag = streamMap[ k ].itag;
            o.textContent = streamMap[ k ].label;
            UI_SOURCE_SELECT.appendChild( o );
        } );

        // Set the initial HTML5 video source to the first option in the dropdown.
        HTML5_VIDEO.src = UI_SOURCE_SELECT.options[ UI_SOURCE_SELECT.selectedIndex ].value;

        // --- Initialize Player Size State ---
        if ( !YOUTUBE_FEATHER ) { // Only for standard layout.
            // If the YouTube player is already in a "not small" state, mark our size checkbox as checked.
            if ( !YOUTUBE_WATCH.classList.contains( "watch-small" ) ) {
                UI_SIZE_CHECKBOX.checked           = true;
                UI_SIZE_CHECKBOX.title             = TEXT_SIZE_CHECKED;
                UI_SIZE_CHECKBOX.dataset.tooltipText = TEXT_SIZE_CHECKED;
                UI_SIZE_LABEL                      = TEXT_SIZE_CHECKED; // Same potential bug.
            }
        }

        // --- Load User Options from Chrome Storage ---
        chrome.storage.local.get( null, function ( options ) {

            // Determine the correct event name for visibility changes.
            var visibilityChange = ( document.hidden !== undefined ) ? "visibilitychange" : "webkitvisibilitychange";

            // Apply visibility option if enabled.
            if ( options.visibility === true ) {
                document.addEventListener( visibilityChange, videoVisibilityChange );
                // Add event listener to HTML5 video to pause if tab is hidden.
                HTML5_VIDEO.addEventListener( "play", videoPauseIfHidden );
            }
            // Apply spacebar control option if enabled.
            if ( options.space === true ) {
                document.addEventListener( "keydown", videoKeyboardControls );
            }
            // Apply audio (volume/mute) option if enabled.
            if ( options.audio === true ) {
                HTML5_VIDEO.addEventListener( "volumechange", videoVolumeChange );
                // Restore volume and mute state from storage.
                if ( options.volume !== undefined ) {
                    HTML5_VIDEO.volume = options.volume;
                }
                if ( options.muted !== undefined ) {
                    HTML5_VIDEO.muted = options.muted;
                }
            }
            // Apply autoplay option.
            if ( options.autoplay !== undefined ) {
                HTML5_VIDEO.autoplay = options.autoplay;
            }
            // Apply video retry option.
            if ( options.retry !== undefined ) {
                STATE_VIDEO_RETRY = options.retry;
            }
            // Apply embiggen (player size) option.
            if ( options.embiggen === true ) {
                UI_SIZE_CHECKBOX.click(); // Simulate a click to apply the size change.
            }
            // Apply playback rate option.
            if ( options.rate !== undefined ) {
                UI_RATE_SELECT.value = options.rate;
                UI_RATE_SELECT.dispatchEvent( new Event( "change" ) ); // Trigger change event.
                UI_SPEED_CHECKBOX.checked = true;
                UI_SPEED_CHECKBOX.dispatchEvent( new Event( "change" ) ); // Trigger change event.
            }

            // --- Initial Player Activation (if enabled) ---
            if ( options.player === true ) {
                // If the custom player is set as default, activate it.
                // This will trigger the UI_TOGGLE_CHECKBOX change event.
                UI_TOGGLE_CHECKBOX.click();
            } else {
                // If not activated, ensure the original player is visible.
                YOUTUBE_CONTAINER.replaceChild( YOUTUBE_PLAYER, HTML5_PLAYER );
                document.body.classList.remove( "crxhtml5" );
            }
        } );

    } catch ( err ) {
        // Log any errors during initialization and disable the toggle.
        console.error( "CRXHTML5: " + err );
        UI_TOGGLE_CHECKBOX.disabled          = true;
        UI_TOGGLE_CHECKBOX.title             = TEXT_TOGGLE_DISABLED;
        UI_TOGGLE_CHECKBOX.dataset.tooltipText = TEXT_TOGGLE_DISABLED;
        UI_TOGGLE_LABEL.textContent          = TEXT_TOGGLE_DISABLED;
    }
}