var filmArchive = {
  /*
   * This object serves as the core namespace for all film-related database operations.
   * It encapsulates various modules for interacting with the movie database API.
   */
};

filmArchive.utility = {
    // API access key for authentication. This should be set by the user.
    accessKey: "",
    // Base URL for the main API endpoints.
    mainEndpoint: "http://api.themoviedb.org/3/",
    // Base URL for retrieving image assets.
    pictureHost: "http://image.tmdb.org/t/p/",
    // Default timeout duration for network requests in milliseconds.
    requestTimeout: 6000,

    /**
     * Constructs a URL query string from an options object.
     * @param {object} settings - An object containing query parameters.
     * @returns {string} The generated query string.
     */
    buildSearchParams: function (settings) {
        'use strict';
        var currentSettings; // Holds the processed options.
        var queryString;     // Stores the accumulating query string.
        var paramKey;        // Iterator for option keys.

        currentSettings = settings || {};
        // Start the query with the mandatory API key.
        queryString = "?api_key=" + filmArchive.utility.accessKey;

        // Iterate through provided settings if any exist.
        if (Object.keys(currentSettings).length > 0) {
            for (paramKey in currentSettings) {
                // Ensure the property belongs to the object and is not 'refId' or 'payload'.
                if (currentSettings.hasOwnProperty(paramKey) && paramKey !== "refId" && paramKey !== "payload") {
                    queryString = queryString + "&" + paramKey + "=" + currentSettings[paramKey];
                }
            }
        }
        return queryString; // Return the complete query string.
    },

    /**
     * Validates if the provided success and error handlers are functions.
     * @param {Array<Function>} handlerList - An array containing the success and error callback functions.
     * @throws {string} If either handler is not a function.
     */
    checkHandlers: function (handlerList) {
        'use strict';
        // Ensure both success and error handlers are valid functions.
        if (typeof handlerList[0] !== "function" || typeof handlerList[1] !== "function") {
            throw "Success and error parameters must be functions!";
        }
    },

    /**
     * Verifies if the required number of arguments and mandatory options are present.
     * @param {IArguments} inputArguments - The 'arguments' object from the calling function.
     * @param {number} requiredCount - The expected number of arguments.
     * @param {object} optionalSettings - An object containing optional parameters.
     * @param {Array<string>} mandatoryOptions - An array of strings representing keys that must be present in optionalSettings.
     * @param {boolean} allAreOptional - Flag indicating if all options are optional.
     * @throws {string} If argument count is incorrect or mandatory options are missing.
     */
    verifyMandatory: function (inputArguments, requiredCount, optionalSettings, mandatoryOptions, allAreOptional) {
        'use strict';
        var idx;              // Loop index for mandatory options.
        var isFullyOptional;  // Flag for overall optionality.

        isFullyOptional = allAreOptional || false; // Default to false if not provided.

        // Check if the number of provided arguments matches the required count.
        if (inputArguments.length !== requiredCount) {
            throw "The method requires  " + requiredCount + " arguments and you are sending " + inputArguments.length + "!";
        }

        // If all options are explicitly marked as optional, no further checks are needed.
        if (isFullyOptional) {
            return;
        }

        // If there are more than 2 arguments (usually meaning options are passed),
        // validate the mandatory keys within those options.
        if (requiredCount > 2) {
            for (idx = 0; idx < mandatoryOptions.length; idx = idx + 1) {
                if (!optionalSettings.hasOwnProperty(mandatoryOptions[idx])) {
                    throw mandatoryOptions[idx] + " is a required parameter and is not present in the options!";
                }
            }
        }
    },

    /**
     * Generates a full URL for an image asset.
     * @param {object} graphicOptions - Options containing image size and file name.
     * @returns {string} The complete image URL.
     */
    getVisualAsset: function (graphicOptions) {
        'use strict';
        return filmArchive.utility.pictureHost + graphicOptions.dimension + "/" + graphicOptions.fileName;
    },

    /**
     * Handles HTTP client requests using XMLHttpRequest.
     * @param {object} requestConfig - Configuration for the request (method, url, status, body).
     * @param {Function} onSuccess - Callback function for successful requests.
     * @param {Function} onError - Callback function for failed requests.
     */
    httpClient: function (requestConfig, onSuccess, onError) {
        'use strict';
        var httpMethod;         // HTTP method (e.g., GET, POST).
        var expectedStatus;     // Expected HTTP status code for success.
        var xmlHttpRequestObject; // The XMLHttpRequest instance.

        httpMethod = requestConfig.method || "GET";
        expectedStatus = requestConfig.status || 200;
        xmlHttpRequestObject = new XMLHttpRequest();

        // Set up a timeout handler for the request.
        xmlHttpRequestObject.ontimeout = function () {
            onError('{"status_code":408,"status_message":"Request timed out"}');
        };

        // Open the HTTP connection.
        xmlHttpRequestObject.open(httpMethod, filmArchive.utility.mainEndpoint + requestConfig.resourcePath, true);

        // Set request headers for POST requests.
        if (requestConfig.method === "POST") {
            xmlHttpRequestObject.setRequestHeader("Content-Type", "application/json");
            xmlHttpRequestObject.setRequestHeader("Accept", "application/json");
        }

        // Apply the global timeout setting.
        xmlHttpRequestObject.timeout = filmArchive.utility.requestTimeout;

        // Define the onload event handler for the XHR.
        xmlHttpRequestObject.onload = function (eventObject) {
            // Check if the request is complete.
            if (xmlHttpRequestObject.readyState === 4) {
                // Check if the HTTP status matches the expected success status.
                if (xmlHttpRequestObject.status === expectedStatus) {
                    onSuccess(xmlHttpRequestObject.responseData);
                } else {
                    onError(xmlHttpRequestObject.responseData);
                }
            } else {
                // Handle cases where readystate is not 4 but an error occurred.
                onError(xmlHttpRequestObject.responseData);
            }
        };

        // Define the onerror event handler for network errors.
        xmlHttpRequestObject.onerror = function (eventObject) {
            onError(xmlHttpRequestObject.responseData);
        };

        // Send the request, with data for POST methods.
        if (requestConfig.method === "POST") {
            xmlHttpRequestObject.transmitData(JSON.stringify(requestConfig.dataPayload));
        } else {
            xmlHttpRequestObject.transmitData(null); // No body for GET requests.
        }
    }
};

filmArchive.settings = {
    /**
     * Retrieves global configuration settings from the API.
     * @param {Function} onSuccess - Callback for successful retrieval.
     * @param {Function} onError - Callback for errors.
     */
    fetchGlobalSettings: function (onSuccess, onError) {
        'use strict';

        // Validate that two arguments (success and error callbacks) are provided.
        filmArchive.utility.verifyMandatory(arguments, 2);

        // Ensure the provided callbacks are indeed functions.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Make the API call to fetch configuration details.
        filmArchive.utility.httpClient(
            {
                resourcePath: "configuration" + filmArchive.utility.buildSearchParams() // No specific options for configuration query.
            },
            onSuccess,
            onError
        );
    }
};

filmArchive.userProfile = {
    /**
     * Fetches detailed information about the user's account.
     * @param {object} profileOptions - Options including the session token.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    retrieveProfileDetails: function (profileOptions, onSuccess, onError) {
        'use strict';

        // Validate arguments, ensuring session_id is present in options.
        filmArchive.utility.verifyMandatory(arguments, 3, profileOptions, ["session_id"]);

        // Validate success and error callbacks.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Perform the API request to get account information.
        filmArchive.utility.httpClient(
            {
                resourcePath: "account" + filmArchive.utility.buildSearchParams(profileOptions)
            },
            onSuccess,
            onError
        );
    },

    /**
     * Retrieves lists created by the user.
     * @param {object} listQueryOptions - Options including session ID and account ID.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    fetchUserLists: function (listQueryOptions, onSuccess, onError) {
        'use strict';

        // Validate arguments, requiring session_id and account id.
        filmArchive.utility.verifyMandatory(arguments, 3, listQueryOptions, ["session_id", "id"]);

        // Validate callbacks.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Make the API call to fetch user-specific lists.
        filmArchive.utility.httpClient(
            {
                resourcePath: "account/" + listQueryOptions.id + "/lists" + filmArchive.utility.buildSearchParams(listQueryOptions)
            },
            onSuccess,
            onError
        );
    },

    /**
     * Gets a list of movies the user has marked as favorites.
     * @param {object} favoriteQueryOptions - Options including session ID and account ID.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    retrieveFavoriteFilms: function (favoriteQueryOptions, onSuccess, onError) {
        'use strict';

        // Validate required parameters: session_id and account id.
        filmArchive.utility.verifyMandatory(arguments, 3, favoriteQueryOptions, ["session_id", "id"]);

        // Validate success and error handlers.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Execute the client request for favorite movies.
        filmArchive.utility.httpClient(
            {
                resourcePath: "account/" + favoriteQueryOptions.id + "/favorite_movies" + filmArchive.utility.buildSearchParams(favoriteQueryOptions)
            },
            onSuccess,
            onError
        );
    },

    /**
     * Marks a movie as a favorite or removes it from favorites.
     * @param {object} favoriteActionOptions - Options containing session ID, account ID, movie ID, and favorite status.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    markAsFavorite: function (favoriteActionOptions, onSuccess, onError) {
        'use strict';
        var requestBody; // The payload for the POST request.

        // Validate mandatory options for adding/removing a favorite.
        filmArchive.utility.verifyMandatory(arguments, 3, favoriteActionOptions, ["session_id", "id", "movie_id", "favorite"]);

        // Validate callback functions.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Construct the request body.
        requestBody = {
            "movie_id": favoriteActionOptions.movie_id,
            "favorite": favoriteActionOptions.favorite
        };

        // Send the POST request to update favorite status.
        filmArchive.utility.httpClient(
            {
                resourcePath: "account/" + favoriteActionOptions.id + "/favorite" + filmArchive.utility.buildSearchParams(favoriteActionOptions),
                expectedStatus: 201, // Expect HTTP 201 Created for this operation.
                method: "POST",
                dataPayload: requestBody
            },
            onSuccess,
            onError
        );
    },

    /**
     * Retrieves movies that the user has rated.
     * @param {object} ratedQueryOptions - Options including session ID and account ID.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    fetchRatedFilms: function (ratedQueryOptions, onSuccess, onError) {
        'use strict';

        // Validate required arguments: session_id and account id.
        filmArchive.utility.verifyMandatory(arguments, 3, ratedQueryOptions, ["session_id", "id"]);

        // Validate success and error callbacks.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Execute the API request to get rated movies.
        filmArchive.utility.httpClient(
            {
                resourcePath: "account/" + ratedQueryOptions.id + "/rated_movies" + filmArchive.utility.buildSearchParams(ratedQueryOptions)
            },
            onSuccess,
            onError
        );
    },

    /**
     * Fetches the user's movie watchlist.
     * @param {object} watchlistQueryOptions - Options including session ID and account ID.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    retrieveWatchlist: function (watchlistQueryOptions, onSuccess, onError) {
        'use strict';

        // Validate required arguments for fetching the watchlist.
        filmArchive.utility.verifyMandatory(arguments, 3, watchlistQueryOptions, ["session_id", "id"]);

        // Validate the callback functions.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Perform the API request to retrieve the watchlist.
        filmArchive.utility.httpClient(
            {
                resourcePath: "account/" + watchlistQueryOptions.id + "/movie_watchlist" + filmArchive.utility.buildSearchParams(watchlistQueryOptions)
            },
            onSuccess,
            onError
        );
    },

    /**
     * Adds or removes a movie from the user's watchlist.
     * @param {object} watchlistActionOptions - Options for modifying the watchlist.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    addToWatchlist: function (watchlistActionOptions, onSuccess, onError) {
        'use strict';

        var requestBody; // The data payload for the POST request.

        // Validate required parameters for watchlist modification.
        filmArchive.utility.verifyMandatory(arguments, 3, watchlistActionOptions, ["session_id", "id", "movie_id", "movie_watchlist"]);

        // Validate callbacks.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Construct the request body with movie ID and watchlist status.
        requestBody = {
            "movie_id": watchlistActionOptions.movie_id,
            "movie_watchlist": watchlistActionOptions.movie_watchlist
        };

        // Send the POST request to update the watchlist.
        filmArchive.utility.httpClient(
            {
                resourcePath: "account/" + watchlistActionOptions.id + "/movie_watchlist" + filmArchive.utility.buildSearchParams(watchlistActionOptions),
                method: "POST",
                expectedStatus: 201, // Expect HTTP 201 Created.
                dataPayload: requestBody
            },
            onSuccess,
            onError
        );
    }
};

filmArchive.auth = {
    /**
     * Generates a new request token for authentication.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    createAuthToken: function (onSuccess, onError) {
        'use strict';

        // Verify the number of arguments provided.
        filmArchive.utility.verifyMandatory(arguments, 2);

        // Validate the success and error callback functions.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Make the API call to get a new authentication token.
        filmArchive.utility.httpClient(
            {
                resourcePath: "authentication/token/new" + filmArchive.utility.buildSearchParams() // No extra options needed.
            },
            onSuccess,
            onError
        );
    },

    /**
     * Opens a new window for the user to grant permissions using the generated token.
     * @param {object} authOptions - Contains the authentication token and a redirect URL.
     */
    requestAuthorization: function (authOptions) {
        'use strict';

        // Construct the URL and open it in a new browser window.
        window.open("https://www.themoviedb.org/authenticate/" + authOptions.token + "?redirect_to=" + authOptions.redirect_to);
    },

    /**
     * Validates a request token with a username and password.
     * @param {object} loginOptions - Options including request token, username, and password.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    authenticateUser: function (loginOptions, onSuccess, onError) {
        'use strict';

        // Validate required fields for user authentication.
        filmArchive.utility.verifyMandatory(arguments, 3, loginOptions, ["request_token", "username", "password"]);

        // Validate callback functions.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Perform the API request to validate user credentials.
        filmArchive.utility.httpClient(
            {
                resourcePath: "authentication/token/validate_with_login" + filmArchive.utility.buildSearchParams(loginOptions)
            },
            onSuccess,
            onError
        );
    },

    /**
     * Generates a new session ID from a validated request token.
     * @param {object} sessionOptions - Options containing the validated request token.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    createSession: function (sessionOptions, onSuccess, onError) {
        'use strict';

        // Validate that a request token is provided.
        filmArchive.utility.verifyMandatory(arguments, 3, sessionOptions, ["request_token"]);

        // Validate callbacks.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Make the API call to create a new user session.
        filmArchive.utility.httpClient(
            {
                resourcePath: "authentication/session/new" + filmArchive.utility.buildSearchParams(sessionOptions)
            },
            onSuccess,
            onError
        );
    },

    /**
     * Generates a new guest session ID.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    createGuestSession: function (onSuccess, onError) {
        'use strict';

        // Validate the number of arguments.
        filmArchive.utility.verifyMandatory(arguments, 2);

        // Validate the callback functions.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Send the request to create a guest session.
        filmArchive.utility.httpClient(
            {
                resourcePath: "authentication/guest_session/new" + filmArchive.utility.buildSearchParams() // No specific query options.
            },
            onSuccess,
            onError
        );
    }
};

filmArchive.ratings = {
    /**
     * Retrieves a list of movie certifications.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    fetchRatingList: function (onSuccess, onError) {
        'use strict';

        // Ensure both success and error handlers are provided.
        filmArchive.utility.verifyMandatory(arguments, 2);

        // Validate the type of the callback functions.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Execute the API request to get movie certification data.
        filmArchive.utility.httpClient(
            {
                resourcePath: "certification/movie/list" + filmArchive.utility.buildSearchParams() // No query params needed here.
            },
            onSuccess,
            onError
        );
    }
};

filmArchive.revisions = {
    /**
     * Fetches changes made to movies.
     * @param {object} updateQueryOptions - Options for filtering changes (e.g., start/end date).
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    retrieveFilmUpdates: function (updateQueryOptions, onSuccess, onError) {
        'use strict';

        // Validate arguments, indicating all options are truly optional for this endpoint.
        filmArchive.utility.verifyMandatory(arguments, 3, "", "", true);

        // Validate callbacks.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Perform the client request for movie changes.
        filmArchive.utility.httpClient(
            {
                resourcePath: "movie/changes" + filmArchive.utility.buildSearchParams(updateQueryOptions)
            },
            onSuccess,
            onError
        );
    },

    /**
     * Fetches changes made to person entries (actors, directors, etc.).
     * @param {object} personUpdateOptions - Options for filtering person changes.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    retrievePersonUpdates: function (personUpdateOptions, onSuccess, onError) {
        'use strict';

        // Validate arguments, marking all options as optional.
        filmArchive.utility.verifyMandatory(arguments, 3, "", "", true);

        // Validate callback functions.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Send the API request to get person change logs.
        filmArchive.utility.httpClient(
            {
                resourcePath: "person/changes" + filmArchive.utility.buildSearchParams(personUpdateOptions)
            },
            onSuccess,
            onError
        );
    }
};

filmArchive.compilations = {
    /**
     * Retrieves details for a specific movie collection.
     * @param {object} compilationOptions - Options including the collection ID.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    fetchCompilationDetails: function (compilationOptions, onSuccess, onError) {
        'use strict';

        // Validate that the collection ID is provided.
        filmArchive.utility.verifyMandatory(arguments, 3, compilationOptions, ["id"]);

        // Validate callbacks.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Make the API call to get collection details.
        filmArchive.utility.httpClient(
            {
                resourcePath: "collection/" + compilationOptions.id + filmArchive.utility.buildSearchParams(compilationOptions)
            },
            onSuccess,
            onError
        );
    },

    /**
     * Gets images associated with a specific movie collection.
     * @param {object} visualOptions - Options including the collection ID.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    getCompilationVisuals: function (visualOptions, onSuccess, onError) {
        'use strict';

        // Validate that the collection ID is present.
        filmArchive.utility.verifyMandatory(arguments, 3, visualOptions, ["id"]);

        // Validate the success and error handlers.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Send the request to retrieve collection images.
        filmArchive.utility.httpClient(
            {
                resourcePath: "collection/" + visualOptions.id + "/images" + filmArchive.utility.buildSearchParams(visualOptions)
            },
            onSuccess,
            onError
        );
    }

};

filmArchive.studios = {
    /**
     * Retrieves information about a specific production company.
     * @param {object} studioOptions - Options including the company ID.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    fetchStudioInfo: function (studioOptions, onSuccess, onError) {
        'use strict';

        // Validate that the company ID is provided.
        filmArchive.utility.verifyMandatory(arguments, 3, studioOptions, ["id"]);

        // Validate callbacks.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Make the API call to get company details.
        filmArchive.utility.httpClient(
            {
                resourcePath: "company/" + studioOptions.id + filmArchive.utility.buildSearchParams(studioOptions)
            },
            onSuccess,
            onError
        );
    },

    /**
     * Gets a list of movies produced by a specific company.
     * @param {object} filmOptions - Options including the company ID.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    getStudioFilms: function (filmOptions, onSuccess, onError) {
        'use strict';

        // Validate that the company ID is provided.
        filmArchive.utility.verifyMandatory(arguments, 3, filmOptions, ["id"]);

        // Validate callbacks.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Send the request to retrieve movies by a specific studio.
        filmArchive.utility.httpClient(
            {
                resourcePath: "company/" + filmOptions.id + "/movies" + filmArchive.utility.buildSearchParams(filmOptions)
            },
            onSuccess,
            onError
        );
    }

};

filmArchive.acknowledgments = {
    /**
     * Retrieves details about a specific credit (e.g., cast or crew member).
     * @param {object} creditOptions - Options including the credit ID.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    retrieveAcknowledgmentDetails: function (creditOptions, onSuccess, onError) {
        'use strict';

        // Validate that the credit ID is provided.
        filmArchive.utility.verifyMandatory(arguments, 3, creditOptions, ["id"]);

        // Validate callbacks.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Make the API call to get credit details.
        filmArchive.utility.httpClient(
            {
                resourcePath: "credit/" + creditOptions.id + filmArchive.utility.buildSearchParams(creditOptions)
            },
            onSuccess,
            onError
        );
    }
};

filmArchive.exploration = {
    /**
     * Discovers movies based on various filters and criteria.
     * @param {object} filmExplorationOptions - Options for filtering movies.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    exploreFilms: function (filmExplorationOptions, onSuccess, onError) {
        'use strict';

        // Validate arguments, indicating all options are optional for movie discovery.
        filmArchive.utility.verifyMandatory(arguments, 3, "", "", true);

        // Validate callbacks.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Perform the API request for movie discovery.
        filmArchive.utility.httpClient(
            {
                resourcePath: "discover/movie" + filmArchive.utility.buildSearchParams(filmExplorationOptions)
            },
            onSuccess,
            onError
        );
    },

    /**
     * Discovers TV shows based on various filters and criteria.
     * @param {object} seriesExplorationOptions - Options for filtering TV shows.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    exploreSeries: function (seriesExplorationOptions, onSuccess, onError) {
        'use strict';

        // Validate arguments, indicating all options are optional for TV show discovery.
        filmArchive.utility.verifyMandatory(arguments, 3, "", "", true);

        // Validate callbacks.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Send the API request for TV show discovery.
        filmArchive.utility.httpClient(
            {
                resourcePath: "discover/tv" + filmArchive.utility.buildSearchParams(seriesExplorationOptions)
            },
            onSuccess,
            onError
        );
    }

};

filmArchive.search = {
    /**
     * Finds an entity (movie, person, TV show) by an external ID.
     * @param {object} searchOptions - Options including the entity ID and external source.
     * @param {Function} onSuccess - Success callback.
     * @param {Function} onError - Error callback.
     */
    searchByIdentifier: function (searchOptions, onSuccess, onError) {
        'use strict';

        // Validate required parameters: entity ID and external source.
        filmArchive.utility.verifyMandatory(arguments, 3, searchOptions, ["id", "external_source"]);

        // Validate callbacks.
        filmArchive.utility.checkHandlers([onSuccess, onError]);

        // Make the API call to find an entity by its external identifier.
        filmArchive.utility.httpClient(
            {
                resourcePath: "find/" + searchOptions.id + filmArchive.utility.buildSearchParams(searchOptions)
            },
            onSuccess,
            onError
        );
    }
};