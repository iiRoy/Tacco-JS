const YOUTUBE_API_BASE_URL = "http://gdata.youtube.com/feeds/api/";
const VIDEO_DETAILS_PATH = "videos/";
const RELATED_VIDS_PATH_SUFFIX = "/related";
const API_VERSION_PARAMS = "alt=json&v=2&format=5&key=AI39si4kMMM_MKoBruLHD17_U6_NqOf-qFOc5iqpzpH-G67oD3iCtuVv8F51GKJiD3I3bIuCy5Eo4-Pjf1rwMoNmfc6MUS4aOw";
const MAXIMUM_RELATED_RESULTS = 7;

/*
 * This module facilitates interaction with the YouTube GData API
 * for retrieving video information and managing playback.
 * It includes functionality for fetching related videos,
 * displaying video metadata, and initializing the video player.
 */

function VideoManager() {
    // Internal counter for API requests made by this instance.
    this.apiCallCounter = 0;
    // Timestamp of the last API request.
    this.lastApiRequestTime = null;
}

// Internal helper to convert seconds into a human-readable time format (HH:MM:SS or MM:SS).
VideoManager.prototype._convertSecondsToTime = function(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return "00:00"; // Default for invalid input
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');
    if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
};

// Internal helper to format numerical values with comma separators for readability.
VideoManager.prototype._formatNumberWithCommas = function(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return "N/A";
    }
    return value.toLocaleString();
};

// Initiates an asynchronous request to retrieve videos related to a given content ID.
VideoManager.prototype.fetchRelatedContent = function(contentIdentifier, responseCallback) {
    if (!contentIdentifier || typeof contentIdentifier !== 'string' || contentIdentifier.trim() === '') {
        console.error("Validation failed: A valid string 'contentIdentifier' is required.");
        return;
    }
    if (typeof responseCallback !== 'function') {
        console.error("Validation failed: 'responseCallback' must be a function.");
        return;
    }

    this.apiCallCounter++;
    this.lastApiRequestTime = new Date();

    const requestEndpoint = `${YOUTUBE_API_BASE_URL}${VIDEO_DETAILS_PATH}${contentIdentifier}${RELATED_VIDS_PATH_SUFFIX}?max-results=${MAXIMUM_RELATED_RESULTS}&${API_VERSION_PARAMS}`;

    $.ajax({
        url: requestEndpoint,
        dataType: 'json',
        method: 'GET',
        success: (responseData) => {
            if (responseData && responseData.feed && Array.isArray(responseData.feed.entry)) {
                responseCallback(responseData.feed.entry);
            } else {
                console.info("No related video entries found or malformed response.");
                responseCallback([]);
            }
        },
        error: (xhr, status, errorMsg) => {
            console.error(`API request error for related content (ID: ${contentIdentifier}): ${status} - ${errorMsg}`);
            responseCallback([]); // Invoke callback with empty array on error
        }
    });
};

// Renders the provided list of video entries into the designated UI blocks.
VideoManager.prototype.displayRelatedItems = function(itemEntries) {
    if (!Array.isArray(itemEntries) || itemEntries.length === 0) {
        console.info("No video entries provided to display. Skipping rendering.");
        return;
    }

    itemEntries.forEach((currentEntry, index) => {
        // Only process up to the maximum number of related results to fit UI.
        if (index >= MAXIMUM_RELATED_RESULTS) {
            return;
        }

        const containerElement = $(`#related_video_block_${index + 1}`);
        if (containerElement.length === 0) {
            console.warn(`UI container for related video block ${index + 1} was not found.`);
            return;
        }

        const thumbElement = containerElement.children(".thumbnail");
        const infoPane = containerElement.children(".information");

        containerElement.data("video-payload", JSON.stringify(currentEntry));

        const firstThumbnailUrl = currentEntry.media$group?.media$thumbnail?.[0]?.url;
        thumbElement.children("img").attr("src", firstThumbnailUrl || "images/default_thumb.jpg"); // Fallback thumbnail

        const durationInSeconds = parseInt(currentEntry.media$group?.yt$duration?.seconds || '0', 10);
        thumbElement.children(".video_time").html(this._convertSecondsToTime(durationInSeconds));

        this.updateRatingDisplay(currentEntry, infoPane.children(".progress_bar"));

        const videoTitle = currentEntry.title?.$t;
        infoPane.children(".title").html(videoTitle || "Untitled Video");

        const viewCountValue = parseInt(currentEntry.yt$statistics?.viewCount || '0', 10);
        infoPane.children(".view_count").html(`${this._formatNumberWithCommas(viewCountValue)} total views`);
    });
};

// Updates the visual representation of a video's rating (likes/dislikes) in the UI.
VideoManager.prototype.updateRatingDisplay = function(videoDataEntry, targetSelector) {
    if (!videoDataEntry || !targetSelector || targetSelector.length === 0) {
        console.warn("Invalid inputs for 'updateRatingDisplay'. Skipping.");
        return;
    }

    let positiveVotes = 0;
    let negativeVotes = 0;
    let calculatedRatingPercentage = 0;

    const ratingDetails = videoDataEntry.yt$rating;

    if (ratingDetails && ratingDetails.numLikes !== undefined && ratingDetails.numDislikes !== undefined) {
        positiveVotes = parseFloat(ratingDetails.numLikes);
        negativeVotes = parseFloat(ratingDetails.numDislikes);

        const cumulativeVotes = positiveVotes + negativeVotes;

        if (cumulativeVotes > 0) {
            calculatedRatingPercentage = Math.round((positiveVotes / cumulativeVotes) * 100);
        }

        targetSelector.css({"background-color": "rgba(144, 238, 144, 0.7)", "border": "1px solid #66bb6a"}); // Lighter green
        targetSelector.progressbar({value: calculatedRatingPercentage});
    } else {
        // Default visual state for unavailable rating data.
        targetSelector.css({"background-color": "rgba(238, 238, 238, 0.7)", "border": "1px dashed #aaaaaa"});
        targetSelector.progressbar({value: 0});
    }

    const feedbackTextElement = targetSelector.siblings(".likes_text");
    if (feedbackTextElement.length > 0) {
        feedbackTextElement.html(`${this._formatNumberWithCommas(positiveVotes)} positive, ${this._formatNumberWithCommas(negativeVotes)} negative`);
    } else {
        console.warn("Corresponding feedback text element for rating display not found.");
    }
};

// Initiates the process of playing a video by its unique identifier.
VideoManager.prototype.startVideoPlaybackById = function(mediaId) {
    if (!mediaId || typeof mediaId !== 'string' || mediaId.trim() === '') {
        console.error("Validation failed: A valid 'mediaId' string is required for playback.");
        return;
    }

    const currentModuleInstance = this;

    const videoDetailUrl = `${YOUTUBE_API_BASE_URL}${VIDEO_DETAILS_PATH}${mediaId}?${API_VERSION_PARAMS}`;

    $.ajax({
        url: videoDetailUrl,
        dataType: 'json',
        method: 'GET',
        success: (apiData) => {
            const videoEntryData = apiData?.entry;
            if (videoEntryData) {
                currentModuleInstance.activateVideoPlayer(videoEntryData);
            } else {
                console.error(`Video entry not found in API response for ID: ${mediaId}`);
            }
        },
        error: (xhr, status, errorMsg) => {
            console.error(`Failed to fetch video details for ID ${mediaId}: ${status} - ${errorMsg}`);
        }
    });
};

// Activates the SWF video player and populates associated UI elements with video metadata.
VideoManager.prototype.activateVideoPlayer = function(contentEntry) {
    if (!contentEntry || !contentEntry.media$group) {
        console.error("Invalid 'contentEntry' provided for player activation. Missing media group.");
        return;
    }

    const mainVideoSourceUrl = contentEntry.media$group?.media$content?.[0]?.url;
    if (!mainVideoSourceUrl) {
        console.error("Video source URL is missing from the content entry.");
        return;
    }

    const playerConfiguration = {
        allowfullscreen: 'true',
        wmode: 'transparent',
        bgcolor: '#000000', // Added a default background color for the player
        quality: 'high' // Added a new parameter
    };

    const playerEmbeddedParams = `&rel=0&border=0&fs=1&autoplay=1&controls=1&modestbranding=1`; // Modified and added params
    const targetPlayerElementId = 'player-area-main-div'; // Renamed target div ID
    const playerOutputWidth = '720'; // Changed dimensions
    const playerOutputHeight = '450'; // Changed dimensions

    swfobject.embedSWF(
        mainVideoSourceUrl + playerEmbeddedParams,
        targetPlayerElementId,
        playerOutputWidth,
        playerOutputHeight,
        '9.0.0',
        false,
        {}, // FlashVars are not directly used here
        playerConfiguration
    );

    // Helper function for safely updating text content in UI elements.
    const updateUiText = (selector, textValue) => {
        const uiElement = $(selector);
        if (uiElement.length > 0) {
            uiElement.html(textValue);
        } else {
            console.warn(`UI element with selector '${selector}' not found for text update.`);
        }
    };

    const videoHeadline = contentEntry.title?.$t || "Unknown Video Title";
    const detailedDescription = contentEntry.media$group?.media$description?.$t || "No detailed description available.";
    const totalViews = parseInt(contentEntry.yt$statistics?.viewCount || '0', 10);

    updateUiText(".playback_heading_text", videoHeadline);
    updateUiText(".playback_description_area", detailedDescription);
    updateUiText(".playback_view_counter", `${this._formatNumberWithCommas(totalViews)} total views`);

    this.updateRatingDisplay(contentEntry, $(".main_player_rating_bar"));
};