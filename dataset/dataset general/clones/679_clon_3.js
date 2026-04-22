(function() {
    /**
     * @module lastFmIntegration
     * @description Encapsulates functionality for interacting with the Last.fm API.
     * This module ensures a robust and configurable approach to fetching user data.
     */

    // Acquire a reference to a DOM manipulation utility, preferring jQuery if available.
    // This acts as a primary dependency check for the module's core functionality.
    const domUtility = window.jQuery || window.$;

    // Essential guard clause: if no suitable DOM utility is found,
    // the module cannot perform its intended network operations, so we exit.
    if (!domUtility || typeof domUtility.getJSON !== 'function') {
        console.error("Initialization failure: Required 'jQuery' or compatible DOM utility with .getJSON method not detected. Module cannot proceed.");
        return; // Terminate execution of the IIFE.
    }

    // --- API Configuration Settings ---
    // Centralized constants for Last.fm API access.
    // This improves maintainability and readability by avoiding magic strings.
    const API_CONFIG = Object.freeze({
        BASE_ENDPOINT: 'https://ws.audioscrobbler.com/2.0/',
        API_ACCESS_KEY: '09a22381ce7a9913af88204c5c12bf04', // Public API key for Last.fm.
        TOP_ALBUMS_METHOD: 'user.gettopalbums',
        RESPONSE_DATA_FORMAT: 'json',
        JSONP_CALLBACK_IDENTIFIER: 'callback' // Specifies the JSONP callback parameter.
    });

    /**
     * @namespace lastFmApiConnector
     * @description Manages all API calls to the Last.fm service.
     */
    const lastFmApiConnector = {
        /**
         * Asynchronously retrieves the top album collections for a specified user.
         *
         * @param {string} userIdentifier - The unique username for the Last.fm account.
         * @param {Function} dataConsumer - A callback function to process the API response (success or failure).
         * @returns {void}
         */
        retrieveUserTopCollections: function(userIdentifier, dataConsumer) {
            // Input validation: Ensure the userIdentifier is a non-empty string after trimming.
            if (typeof userIdentifier !== 'string' || userIdentifier.trim() === '') {
                console.warn("Attempted to fetch data with an invalid or empty user identifier. Operation aborted.");
                // Invoke the consumer with an error object for consistent handling.
                if (typeof dataConsumer === 'function') {
                    dataConsumer({ error: "InvalidUserIdentifier", message: "User identifier must be a non-empty string." });
                }
                return; // Early exit due to invalid input.
            }

            // Validate the dataConsumer: it must be a function. Provide a default if not.
            const effectiveDataConsumer = typeof dataConsumer === 'function'
                ? dataConsumer
                : (payload) => console.info("No specific data consumer provided. Default logging response:", payload);

            // Construct the complete API request URL using template literals for clarity.
            // encodeURIComponent ensures special characters in the username are handled correctly.
            const requestUrl = `${API_CONFIG.BASE_ENDPOINT}?method=${API_CONFIG.TOP_ALBUMS_METHOD}&user=${encodeURIComponent(userIdentifier.trim())}&api_key=${API_CONFIG.API_ACCESS_KEY}&format=${API_CONFIG.RESPONSE_DATA_FORMAT}&${API_CONFIG.JSONP_CALLBACK_IDENTIFIER}=?`;

            console.log(`Initiating Last.fm API request for user: '${userIdentifier}'...`);

            // Execute the JSONP request using the domUtility (e.g., jQuery.getJSON).
            // This returns a Deferred object, allowing for .done() and .fail() handlers.
            domUtility.getJSON(requestUrl)
                .done(function(responseData) {
                    console.info(`Successfully received data for '${userIdentifier}'.`);
                    effectiveDataConsumer(responseData); // Pass the successful response.
                })
                .fail(function(xhrObject, textStatus, errorThrown) {
                    // Comprehensive error handling for network or API issues.
                    console.error(`Last.fm API request failed for '${userIdentifier}'. Status: ${textStatus}, Error: ${errorThrown}`);
                    // Provide detailed error information to the consumer.
                    effectiveDataConsumer({
                        error: "APIRequestFailed",
                        status: textStatus,
                        details: errorThrown,
                        xhr: xhrObject
                    });
                });
        }
    };

    /**
     * @namespace presentationLayer
     * @description Contains utility functions for rendering UI components related to music data.
     */
    const presentationLayer = {
        /**
         * Creates and returns a DOM element representing a single album entry,
         * or logs its details if no target is provided.
         *
         * @param {Object} albumInformation - An object containing album details (e.g., name, artist).
         * @param {HTMLElement|string} [targetContainer=null] - Optional. A DOM element or selector string
         *                                                     where the album element should be appended.
         * @returns {HTMLElement|null} The created album DOM element, or null if rendering to console.
         */
        constructAlbumDisplay: function(albumInformation, targetContainer = null) {
            // Basic validation for input data.
            if (!albumInformation || typeof albumInformation !== 'object' || !albumInformation.name) {
                console.warn("Invalid album information provided for display. Cannot construct element.");
                return null;
            }

            const albumTitle = albumInformation.name;
            const artistName = (albumInformation.artist && albumInformation.artist.name) ? albumInformation.artist.name : 'Unknown Artist';
            const albumImage = (albumInformation.image && albumInformation.image.length > 0) ? albumInformation.image[0]['#text'] : ''; // Assuming smallest image

            // If a target container is specified, attempt to build and append a DOM element.
            if (targetContainer) {
                const $container = domUtility(targetContainer);
                if ($container.length === 0) {
                    console.warn(`Target container '${targetContainer}' not found. Logging album details instead.`);
                    console.log(`Album: "${albumTitle}" by "${artistName}" (Image: ${albumImage})`, albumInformation);
                    return null; // Could not find container, so didn't render to DOM.
                }

                // Create a new DOM element for the album using the domUtility.
                const $albumElement = domUtility('<div>')
                    .addClass('music-collection-item')
                    .append(domUtility('<h3>').text(albumTitle))
                    .append(domUtility('<p>').text(`Artist: ${artistName}`));

                if (albumImage) {
                    $albumElement.prepend(domUtility('<img>').attr('src', albumImage).attr('alt', `${albumTitle} cover`));
                }

                $container.append($albumElement);
                console.log(`Successfully appended album '${albumTitle}' to container.`);
                return $albumElement[0]; // Return the raw DOM element.
            } else {
                // If no target container, simply log the album details to the console.
                console.log(`Displaying album details (no DOM target): "${albumTitle}" by "${artistName}" (Image: ${albumImage})`, albumInformation);
                return null;
            }
        }
    };

    // Example of how to use the services (commented out by default in a module definition).
    /*
    // Assume there's a div with id="album-list" in the HTML.
    const targetElementId = '#album-list';

    lastFmApiConnector.retrieveUserTopCollections("rj", (response) => {
        if (response && response.topalbums && Array.isArray(response.topalbums.album)) {
            console.log(`Found ${response.topalbums.album.length} top albums.`);
            // Process and display the first 3 albums.
            const albumsToDisplay = response.topalbums.album.slice(0, 3);
            albumsToDisplay.forEach(album => {
                presentationLayer.constructAlbumDisplay(album, targetElementId);
            });
        } else if (response && response.error) {
            console.error("API returned an error:", response.message || response.error);
        } else {
            console.warn("No albums found or unexpected response structure.");
        }
    });

    // Example with an invalid user to demonstrate error handling.
    lastFmApiConnector.retrieveUserTopCollections("", (errorResponse) => {
        if (errorResponse.error) {
            console.error("Handled invalid user input:", errorResponse.message);
        }
    });
    */

}());