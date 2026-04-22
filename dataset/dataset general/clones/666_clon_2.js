// This script facilitates switching between legacy and modern media players on a video platform.
// It includes functionality to check for HTML5 support and manage UI elements.

// Begin asynchronous check for WebM player availability.
initiateHttpRequest('http://www.youtube.com/html5', function (securityToken) {
    let postData;
    const httpServiceRequest = new XMLHttpRequest();

    postData = 'enable_html5=true&session_token=' + securityToken;

    httpServiceRequest.open("POST", 'http://www.youtube.com/html5', true);
    httpServiceRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    httpServiceRequest.send(postData);

    httpServiceRequest.onreadystatechange = function () {
        if (httpServiceRequest.readyState === 4) {
            // Processing complete, no specific action needed here for this request's success.
        }
    };
});


let stateToggle = 0; // Flag to track current player state (0: legacy, 1: modern).
let mediaPlayerBackup; // Stores the original player's HTML content.

// Define paths for player mode icons.
const legacyPlayerIcon = chrome.runtime.getURL('../images/htmlify.png');
const modernPlayerIcon = chrome.runtime.getURL('../images/htmlhov.png');

// Check if a modern HTML5 player is already present on the page.
if ($('.modern-video-element').length > 0) {

    // Append a button to the interactive controls panel.
    $("#interactive-buttons-container").append(
        $('<img>')
            .attr({
                'class': 'yt-uix-button yt-uix-button-icon yt-uix-button-empty',
                'type': 'image',
                'id': 'modernToggleBtn',
                'src': modernPlayerIcon
            })
            .val("Switch to WebM")
            .click(function () {
                notifyAlreadyActive(); // Inform user if HTML5 is already active.
            })
            .css({
                'border-style': 'none',
                'padding-bottom': '5px'
            })
    );

    // Set up hover effects for the button, showing HTML5 icon for both initial and hover states.
    configureHoverEffects(modernPlayerIcon, modernPlayerIcon);

    return; // Exit if HTML5 player is already detected.
}

// If no modern player, append the button to switch from Flash to HTML5.
$("#interactive-buttons-container").append(
    $('<img>')
        .attr({
            'class': 'yt-uix-button yt-uix-button-icon yt-uix-button-empty',
            'type': 'image',
            'id': 'modernToggleBtn',
            'src': legacyPlayerIcon
        })
        .val("Switch to WebM")
        .click(function () {
            toggleMediaPlayer(); // Activate the media player switching logic.
        })
        .css({
            'border-style': 'none',
            'padding-bottom': '5px'
        })
);

// Configure hover effects for the button, showing Flash initially, HTML5 on hover.
configureHoverEffects(legacyPlayerIcon, modernPlayerIcon);

// Function to switch between legacy (Flash) and modern (HTML5) media players.
function toggleMediaPlayer() {
    if (stateToggle) {

        // Current state is HTML5, switch back to legacy.
        $('#modern_media_element').remove(); // Remove the HTML5 iframe.

        const videoSourceUrl = "http://www.youtube.com/embed/" + getVideoIdentifier() + "?autoplay=1"; // Redundant, but keeping structure.

        // Restore the original player content from backup.
        document.getElementById('media-container-area').innerHTML = mediaPlayerBackup;

        // Reset hover effects to show Flash icon initially.
        configureHoverEffects(legacyPlayerIcon, modernPlayerIcon);

        stateToggle = 0; // Update state flag to legacy.

    } else {

        // Current state is legacy, switch to HTML5.
        mediaPlayerBackup = $("#media-container-area").html(); // Save current player HTML.
        $('#legacy_media_element').remove(); // Remove the Flash player object.

        const videoSourceUrl = "http://www.youtube.com/embed/" + getVideoIdentifier() + "?feature=player_detailpage&html5=1&autoplay=1&cc_load_policy=1";

        // Create and insert the HTML5 iframe player.
        generateMediaElement('iframe', 'modern_media_element', videoSourceUrl);

        // Update hover effects to show HTML5 icon initially.
        configureHoverEffects(modernPlayerIcon, legacyPlayerIcon);

        stateToggle = 1; // Update state flag to modern.

    }
}

// Extracts the video ID from the current page URL.
function getVideoIdentifier() {
    const currentLocationHref = $(window.location).attr('href');
    const urlParts = currentLocationHref.split("v=");
    return urlParts[1].split("&")[0];
}

// Dynamically creates and appends a media player element.
function generateMediaElement(elementTag, elementId, sourceLink) {
    const newPlayerElement = document.createElement(elementTag);
    newPlayerElement.setAttribute('style', 'width:100%; height:100%;');
    newPlayerElement.setAttribute('src', sourceLink);
    newPlayerElement.setAttribute('id', elementId);
    newPlayerElement.setAttribute('frameborder', '0');
    newPlayerElement.setAttribute('allowfullscreen', '');

    document.getElementById('media-container-area').appendChild(newPlayerElement);
}

// Configures mouse hover effects for the player toggle button.
function configureHoverEffects(defaultImage, activeImage) {
    $("#modernToggleBtn").hover(
        function () {
            // On mouse enter, change button content and add a highlight.
            $("#modernToggleBtn").css("content", "url(" + activeImage + ")");
            $("#modernToggleBtn").css("border-bottom", "3px solid #930");
            $("#modernToggleBtn").css("border-radius", "0px");


        },
        function () {
            // On mouse leave, revert button content and remove highlight.
            $("#modernToggleBtn").css("content", "url(" + defaultImage + ")");
            $("#modernToggleBtn").css("border-bottom-color", "#FFF");
        }
    );
}

// Sends an asynchronous HTTP GET request to check HTML5 status.
function initiateHttpRequest(targetUrl, responseHandler) {
    const httpRequestObject = new XMLHttpRequest();
    httpRequestObject.open("GET", 'http://www.youtube.com/html5', true);
    httpRequestObject.send();

    httpRequestObject.onreadystatechange = function () {
        if (httpRequestObject.readyState === 4) {
            // Evaluate the response for HTML5 status.
            if (httpRequestObject.responseText.indexOf("disable_html5") === -1) {

                // If "disable_html5" is not found, HTML5 is likely enabled or can be.
                const securityToken = httpRequestObject.responseText.split("XSRF_TOKEN': '")[1].split("'")[0];

                responseHandler(securityToken); // Pass the token to the callback.

            }
        }
    };
}

// Displays a message indicating the player is already in HTML5 mode.
function notifyAlreadyActive() {
    alert("This content is already being presented in WebM format!");
}