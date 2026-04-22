/*
 * This module demonstrates the capabilities of the Audio Service Client.
 * It showcases various API interactions, including library retrieval,
 * search operations, playlist management, and direct stream URL fetching.
 *
 * All rights are waived under the CC0 1.0 Universal Public Domain Dedication.
 * For more details, refer to: https://creativecommons.org/publicdomain/zero/1.0/
 */

const fileSystemUtility = require('fs');
// The core client module for interacting with the music service API.
const MusicServiceClient = require('../'); // Assuming the path is still relevant

// Define a constant for the configuration file path.
const CONFIG_FILE_PATH = "config.json";

// Helper function for consistent logging of errors.
const logError = (issueDetails, operationName = "Unknown Operation") => {
    console.error(`[ERROR] During ${operationName}:`, issueDetails);
};

// Helper function for consistent logging of successful data.
const logSuccess = (message, dataPayload) => {
    console.info(`[SUCCESS] ${message}`, dataPayload);
};

// Function to load client configuration from a file.
function retrieveClientConfiguration(filePath) {
    try {
        // Guard clause: check if the configuration file exists before attempting to read.
        if (!fileSystemUtility.existsSync(filePath)) {
            throw new Error(`Configuration file not found at: ${filePath}`);
        }
        const configRawData = fileSystemUtility.readFileSync(filePath, 'utf8');
        return JSON.parse(configRawData);
    } catch (parseError) {
        logError(parseError, `Loading configuration from ${filePath}`);
        // In a real application, this might retry or provide a default.
        // For this example, we'll exit on critical configuration failure.
        process.exit(1);
    }
}

// Instantiate the music service client.
const mediaServiceHandler = new MusicServiceClient();

// Load the necessary configuration for the client.
const clientOptions = retrieveClientConfiguration(CONFIG_FILE_PATH);

// Commence the initialization of the media service handler.
mediaServiceHandler.init(clientOptions, (initializationError) => {
    if (initializationError) {
        logError(initializationError, "Client Initialization");
        return; // Halt further execution if initialization fails.
    }
    logSuccess("Client initialized successfully.", null);

    // --- SECTION 1: LIBRARY BROWSING ---
    // Fetch the entire media library.
    mediaServiceHandler.getLibrary((libraryFetchError, mediaCatalog) => {
        if (libraryFetchError) {
            logError(libraryFetchError, "Library Fetch");
            return;
        }

        const availableTracks = mediaCatalog?.data?.items; // Use optional chaining for robustness
        if (!availableTracks || availableTracks.length === 0) {
            console.warn("[WARNING] No tracks found in the media library.");
            return;
        }

        // Retrieve the last track from the collection. Using direct index access.
        const lastTrackInCollection = availableTracks[availableTracks.length - 1];
        if (lastTrackInCollection) {
            logSuccess("Last track retrieved from library:", lastTrackInCollection);
            // Request the streaming URL for this specific track.
            mediaServiceHandler.getStreamUrl(lastTrackInCollection.id, (streamError, playbackLink) => {
                if (streamError) {
                    logError(streamError, `Stream URL for ID ${lastTrackInCollection.id}`);
                    return;
                }
                logSuccess("Playback link for last library track:", playbackLink);
            });
        } else {
            console.warn("[WARNING] Could not identify a last track in the library (possibly empty).");
        }
    });

    // --- SECTION 2: MEDIA SEARCHING ---
    const searchKeyword = "coldplay fix you"; // Changed search query
    const maxResults = 3; // Reduced number of results to fetch
    
    // A comparator function for sorting search results by score in descending order.
    const trackScoreComparator = (firstEntry, secondEntry) => {
        return secondEntry.score - firstEntry.score;
    };

    mediaServiceHandler.search(searchKeyword, maxResults, (queryResults) => {
        if (!queryResults || !queryResults.entries || queryResults.entries.length === 0) {
            console.warn(`[WARNING] No results found for search query "${searchKeyword}".`);
            return;
        }

        // Create a shallow copy and sort entries by score using the defined comparator.
        const sortedEntries = [...queryResults.entries].sort(trackScoreComparator);
        const topSearchResult = sortedEntries[0]; // Get the highest scoring result

        if (topSearchResult && topSearchResult.track) {
            logSuccess(`Top search result for "${searchKeyword}":`, topSearchResult);
            // Introduce an intermediate variable for clarity and potential validation.
            const trackIdentifier = topSearchResult.track.nid;
            if (trackIdentifier) {
                mediaServiceHandler.getStreamUrl(trackIdentifier, (streamIssue, mediaPlaybackPath) => {
                    if (streamIssue) {
                        logError(streamIssue, `Stream URL for search result ID ${trackIdentifier}`);
                        return;
                    }
                    logSuccess("Playback path for top search result:", mediaPlaybackPath);
                });
            } else {
                console.warn("[WARNING] Top search result track is missing its network ID (nid).");
            }
        } else {
            console.warn("[WARNING] Top search result or its track data is invalid/missing.");
        }
    }, (searchFailure) => {
        logError(searchFailure, `Media Search for "${searchKeyword}"`);
    });

    // --- SECTION 3: PLAYLIST MANAGEMENT ---
    // Retrieve all user-defined playlists.
    mediaServiceHandler.getPlayLists((playlistError, playlistData) => {
        if (playlistError) {
            logError(playlistError, "Playlists Fetch");
            return;
        }
        if (playlistData?.data?.items) { // Use optional chaining
            logSuccess("Retrieved user playlists:", playlistData.data.items);
            // Add a check for empty playlists
            if (playlistData.data.items.length === 0) {
                console.info("[INFO] No user playlists found.");
            }
        } else {
            console.warn("[WARNING] Playlists data structure is unexpected or empty.");
        }
    });

    // Retrieve entries for all playlists.
    mediaServiceHandler.getPlayListEntries((entriesError, playlistEntriesData) => {
        if (entriesError) {
            logError(entriesError, "Playlist Entries Fetch");
            return;
        }
        if (playlistEntriesData?.data?.items) { // Use optional chaining
            logSuccess("Retrieved playlist entries:", playlistEntriesData.data.items);
            // Add a check for empty playlist entries
            if (playlistEntriesData.data.items.length === 0) {
                console.info("[INFO] No playlist entries found.");
            }
        } else {
            console.warn("[WARNING] Playlist entries data structure is unexpected or empty.");
        }
    });

    // --- SECTION 4: DIRECT STREAMING ---
    const specificTrackId = "T0123456789abcdefghijklmnopqrstuvwxyz"; // Changed the hardcoded ID
    
    // Basic validation for the ID format (example: 30-40 alphanumeric characters)
    const idValidationRegex = /^[A-Za-z0-9]{30,40}$/;
    if (!idValidationRegex.test(specificTrackId)) {
        console.warn(`[WARNING] Provided track ID "${specificTrackId}" does not match expected format. Proceeding with caution.`);
        // In a strict application, you might `return` or throw an error here.
    }

    mediaServiceHandler.getStreamUrl(specificTrackId, (directStreamError, directPlaybackLink) => {
        if (directStreamError) {
            logError(directStreamError, `Direct Stream URL for ID ${specificTrackId}`);
            return;
        }
        logSuccess(`Direct playback link for ID ${specificTrackId}:`, directPlaybackLink);
    });

    // Add a final log to indicate all operations have been queued.
    console.log("\n[INFO] All primary service operations have been initiated.");
});

// Add a catch-all for unhandled promise rejections or uncaught exceptions
// (though this code is primarily callback-based, it's good practice for robustness).
process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL ERROR] Unhandled Promise Rejection at:', promise, 'reason:', reason);
    // Application specific error handling here, e.g., logging to an external service.
});

process.on('uncaughtException', (error) => {
    console.error('[CRITICAL ERROR] Uncaught Exception:', error);
    // Application specific error handling here.
    process.exit(1); // Mandatory exit for uncaught exceptions to prevent undefined state.
});