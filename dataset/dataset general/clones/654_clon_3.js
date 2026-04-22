const filmLibrary = {};

/**
 * Core utilities and configuration for the film data access library.
 * This module handles API key, base URLs, request timeouts,
 * query parameter generation, and request validation.
 */
filmLibrary.utilities = {
  // Public API key required for accessing the TMDb API.
  apiKey: null,
  // Base URL for API requests.
  apiBaseEndpoint: "https://api.themoviedb.org/3/",
  // Base URL for image assets.
  imageServiceUrl: "https://image.tmdb.org/t/p/",
  // Default timeout for HTTP requests in milliseconds.
  requestTimeoutMs: 7000, // Increased timeout slightly

  /**
   * Constructs a URL query string from an options object.
   * Filters out specific keys like 'id' and 'body'.
   * @param {Object} queryParams - An object containing key-value pairs for query parameters.
   * @returns {string} The generated query string, starting with "?api_key=..."
   */
  buildQueryParams: (queryParams = {}) => {
    let constructedQuery = `?api_key=${filmLibrary.utilities.apiKey}`;

    // Ensure queryParams is an object before proceeding
    if (typeof queryParams !== 'object' || queryParams === null) {
      console.warn("Invalid query parameters provided; expected an object.");
      return constructedQuery;
    }

    const forbiddenKeys = ['id', 'body', 'success', 'error']; // Added success/error as they are callbacks, not query params

    for (const key in queryParams) {
      // Use Object.prototype.hasOwnProperty.call for safer property check
      if (Object.prototype.hasOwnProperty.call(queryParams, key) && !forbiddenKeys.includes(key)) {
        constructedQuery += `&${key}=${queryParams[key]}`;
      }
    }
    return constructedQuery;
  },

  /**
   * Ensures that the provided success and error callbacks are valid functions.
   * @param {Array<Function>} callbackHandlers - An array containing [successCallback, errorCallback].
   * @throws {Error} if either callback is not a function.
   */
  ensureCallbacksValid: (callbackHandlers) => {
    if (!Array.isArray(callbackHandlers) || callbackHandlers.length < 2) {
      throw new Error("Callback handlers must be an array of at least two functions: [onSuccess, onError]!");
    }
    const [onSuccess, onError] = callbackHandlers;
    if (typeof onSuccess !== "function" || typeof onError !== "function") {
      throw new Error("Success and error parameters must both be functions!");
    }
  },

  /**
   * Validates the number of arguments and presence of required options.
   * @param {IArguments} callArgs - The `arguments` object from the calling function.
   * @param {number} expectedArgCount - The number of arguments the method expects.
   * @param {Object} [optionSet={}] - The options object passed to the method.
   * @param {Array<string>} [requiredOptionKeys=[]] - An array of keys that must be present in `optionSet`.
   * @param {boolean} [allOptionsOptional=false] - If true, `requiredOptionKeys` are ignored.
   * @throws {Error} if validation fails.
   */
  checkRequiredArgs: (callArgs, expectedArgCount, optionSet = {}, requiredOptionKeys = [], allOptionsOptional = false) => {
    if (callArgs.length < expectedArgCount) { // Changed from `!==` to `<` to allow for optional trailing args
      throw new Error(`Method expects at least ${expectedArgCount} arguments, but received ${callArgs.length}.`);
    }

    if (allOptionsOptional) {
      return; // Skip option validation if all are optional
    }

    // Only validate options if there are more than 2 arguments (usually means options object is present)
    if (expectedArgCount > 2 && requiredOptionKeys.length > 0) {
      for (const mandatoryKey of requiredOptionKeys) {
        if (!Object.prototype.hasOwnProperty.call(optionSet, mandatoryKey)) {
          throw new Error(`Required parameter '${mandatoryKey}' is missing from the options object!`);
        }
      }
    }
  },

  /**
   * Generates a full image URL based on size and file path.
   * @param {Object} imgOptions - Options object containing `imageSize` and `imageFilePath`.
   * @returns {string} The complete URL for the image.
   */
  constructImageUrl: (imgOptions) => {
    // Adding basic validation for image options
    if (!imgOptions || !imgOptions.imageSize || !imgOptions.imageFilePath) {
      console.error("Invalid image options provided. Requires 'imageSize' and 'imageFilePath'.");
      return ""; // Return empty string or a default image URL
    }
    return `${filmLibrary.utilities.imageServiceUrl}${imgOptions.imageSize}/${imgOptions.imageFilePath}`;
  },

  /**
   * A generic HTTP client for making API requests.
   * @param {Object} requestConfig - Configuration for the HTTP request.
   * @param {string} requestConfig.url - The API endpoint path (e.g., "account/123/lists").
   * @param {string} [requestConfig.httpMethod="GET"] - The HTTP method (GET, POST).
   * @param {number} [requestConfig.expectedStatus=200] - The expected HTTP status code for success.
   * @param {Object} [requestConfig.requestBody] - The request body for POST requests.
   * @param {Function} onSuccess - Callback function for successful responses.
   * @param {Function} onError - Callback function for error responses.
   */
  httpClient: (requestConfig, onSuccess, onError) => {
    const {
      url,
      httpMethod = "GET",
      expectedStatus = 200,
      requestBody
    } = requestConfig;

    if (!url) {
      return onError(JSON.stringify({
        status_code: 400,
        status_message: "Request URL is missing."
      }));
    }

    const xmlHttpRequest = new XMLHttpRequest();
    xmlHttpRequest.timeout = filmLibrary.utilities.requestTimeoutMs;

    xmlHttpRequest.ontimeout = () => {
      onError(JSON.stringify({
        status_code: 408,
        status_message: "API request timed out."
      }));
    };

    xmlHttpRequest.open(httpMethod, filmLibrary.utilities.apiBaseEndpoint + url, true);

    // Set request headers for POST operations
    if (httpMethod === "POST") {
      xmlHttpRequest.setRequestHeader("Content-Type", "application/json");
      xmlHttpRequest.setRequestHeader("Accept", "application/json");
    }

    xmlHttpRequest.onload = () => {
      // Check for readyState before status, as status is only valid when readyState is 4
      if (xmlHttpRequest.readyState === XMLHttpRequest.DONE) {
        if (xmlHttpRequest.status === expectedStatus) {
          onSuccess(xmlHttpRequest.responseText);
        } else {
          // If status is not as expected, treat it as an error
          onError(xmlHttpRequest.responseText);
        }
      } else {
        // Handle cases where readyState is not DONE (e.g., network error before completion)
        // This 'else' block might be redundant if onerror handles network issues,
        // but it's good for clarity for other non-DONE states.
        onError(JSON.stringify({
          status_code: xmlHttpRequest.status,
          status_message: "Request not completed successfully."
        }));
      }
    };

    xmlHttpRequest.onerror = () => {
      // This handles network errors, CORS issues, etc.
      onError(JSON.stringify({
        status_code: xmlHttpRequest.status || 0, // 0 for network errors
        status_message: "Network error or request failed."
      }));
    };

    // Send the request, including body for POST
    if (httpMethod === "POST") {
      xmlHttpRequest.send(JSON.stringify(requestBody));
    } else {
      xmlHttpRequest.send(); // No body for GET
    }
  },

  /**
   * Helper to perform a GET request using the httpClient.
   * @param {string} endpointUrl - The API path.
   * @param {Object} [queryParams={}] - Query parameters.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  get: (endpointUrl, queryParams = {}, onSuccess, onError) => {
    filmLibrary.utilities.httpClient({
      url: endpointUrl + filmLibrary.utilities.buildQueryParams(queryParams),
      httpMethod: "GET"
    }, onSuccess, onError);
  },

  /**
   * Helper to perform a POST request using the httpClient.
   * @param {string} endpointUrl - The API path.
   * @param {Object} [queryParams={}] - Query parameters.
   * @param {Object} requestBody - The body of the POST request.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   * @param {number} [expectedStatus=200] - Expected status for success.
   */
  post: (endpointUrl, queryParams = {}, requestBody, onSuccess, onError, expectedStatus = 200) => {
    filmLibrary.utilities.httpClient({
      url: endpointUrl + filmLibrary.utilities.buildQueryParams(queryParams),
      httpMethod: "POST",
      requestBody: requestBody,
      expectedStatus: expectedStatus
    }, onSuccess, onError);
  }
};

/**
 * Module for retrieving global API configuration.
 */
filmLibrary.configModule = {
  /**
   * Fetches the global configuration from the API.
   * @param {Function} onSuccess - Callback for successful data retrieval.
   * @param {Function} onError - Callback for error during retrieval.
   */
  retrieveConfig: (onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 2);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get("configuration", {}, onSuccess, onError);
  }
};

/**
 * Module for user account-related API interactions.
 */
filmLibrary.userAccount = {
  /**
   * Fetches details for a specific user account.
   * @param {Object} options - Options object.
   * @param {string} options.session_id - User session ID.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  fetchAccountDetails: (options, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, ["session_id"]);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get("account", options, onSuccess, onError);
  },

  /**
   * Retrieves lists created by a user.
   * @param {Object} options - Options object.
   * @param {string} options.session_id - User session ID.
   * @param {number} options.id - Account ID.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  getUserLists: (options, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, ["session_id", "id"]);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get(`account/${options.id}/lists`, options, onSuccess, onError);
  },

  /**
   * Gets the favorite films of a user.
   * @param {Object} options - Options object.
   * @param {string} options.session_id - User session ID.
   * @param {number} options.id - Account ID.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  getFavoriteFilms: (options, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, ["session_id", "id"]);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get(`account/${options.id}/favorite_movies`, options, onSuccess, onError);
  },

  /**
   * Marks a film as favorite or unfavorite for a user.
   * @param {Object} options - Options object.
   * @param {string} options.session_id - User session ID.
   * @param {number} options.id - Account ID.
   * @param {number} options.movie_id - ID of the film to mark.
   * @param {boolean} options.favorite - True to mark as favorite, false to unfavorite.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  markAsFavorite: (options, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, ["session_id", "id", "movie_id", "favorite"]);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    const requestBody = {
      media_type: "movie", // Explicitly define media type
      media_id: options.movie_id,
      favorite: options.favorite
    };

    filmLibrary.utilities.post(`account/${options.id}/favorite`, options, requestBody, onSuccess, onError, 201);
  },

  /**
   * Retrieves films rated by a user.
   * @param {Object} options - Options object.
   * @param {string} options.session_id - User session ID.
   * @param {number} options.id - Account ID.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  getRatedFilms: (options, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, ["session_id", "id"]);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get(`account/${options.id}/rated_movies`, options, onSuccess, onError);
  },

  /**
   * Retrieves a user's watchlist.
   * @param {Object} options - Options object.
   * @param {string} options.session_id - User session ID.
   * @param {number} options.id - Account ID.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  getWatchList: (options, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, ["session_id", "id"]);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get(`account/${options.id}/movie_watchlist`, options, onSuccess, onError);
  },

  /**
   * Adds or removes a film from a user's watchlist.
   * @param {Object} options - Options object.
   * @param {string} options.session_id - User session ID.
   * @param {number} options.id - Account ID.
   * @param {number} options.movie_id - ID of the film.
   * @param {boolean} options.movie_watchlist - True to add, false to remove.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  addToWatchList: (options, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, ["session_id", "id", "movie_id", "movie_watchlist"]);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    const requestBody = {
      media_type: "movie",
      media_id: options.movie_id,
      watchlist: options.movie_watchlist
    };

    filmLibrary.utilities.post(`account/${options.id}/movie_watchlist`, options, requestBody, onSuccess, onError, 201);
  }
};

/**
 * Module for handling user authentication and session management.
 */
filmLibrary.authModule = {
  /**
   * Requests a new authentication token from the API.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  requestNewToken: (onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 2);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get("authentication/token/new", {}, onSuccess, onError);
  },

  /**
   * Redirects the user to the TMDb website to grant permissions for an application.
   * @param {Object} authOptions - Authentication options.
   * @param {string} authOptions.token - The request token obtained from `requestNewToken`.
   * @param {string} authOptions.redirect_to - The URL to redirect to after user approval.
   */
  redirectToAuthPage: (authOptions) => {
    if (!authOptions || !authOptions.token || !authOptions.redirect_to) {
      console.error("Authentication options (token, redirect_to) are required for redirection.");
      return;
    }
    window.open(`https://www.themoviedb.org/authenticate/${authOptions.token}?redirect_to=${authOptions.redirect_to}`);
  },

  /**
   * Validates an authentication token with user credentials (username and password).
   * @param {Object} options - Options object.
   * @param {string} options.request_token - The request token.
   * @param {string} options.username - User's username.
   * @param {string} options.password - User's password.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  validateTokenWithLogin: (options, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, ["request_token", "username", "password"]);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get("authentication/token/validate_with_login", options, onSuccess, onError);
  },

  /**
   * Generates a new session ID from a validated request token.
   * @param {Object} options - Options object.
   * @param {string} options.request_token - The validated request token.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  createSession: (options, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, ["request_token"]);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get("authentication/session/new", options, onSuccess, onError);
  },

  /**
   * Generates a new guest session ID.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  createGuestSession: (onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 2);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get("authentication/guest_session/new", {}, onSuccess, onError);
  }
};

/**
 * Module for retrieving certification data.
 */
filmLibrary.certificationModule = {
  /**
   * Fetches the list of movie certifications.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  fetchCertificationList: (onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 2);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get("certification/movie/list", {}, onSuccess, onError);
  }
};

/**
 * Module for accessing change logs of various entities.
 */
filmLibrary.changeLog = {
  /**
   * Retrieves changes for movies.
   * @param {Object} options - Optional query parameters like `start_date`, `end_date`, `page`.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  getFilmChangeLog: (options = {}, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, [], true); // all options are truly optional
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get("movie/changes", options, onSuccess, onError);
  },

  /**
   * Retrieves changes for persons (actors/crew).
   * @param {Object} options - Optional query parameters.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  getPersonChangeLog: (options = {}, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, [], true);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get("person/changes", options, onSuccess, onError);
  }
};

/**
 * Module for interacting with film collections.
 */
filmLibrary.filmCollections = {
  /**
   * Fetches details for a specific film collection.
   * @param {Object} options - Options object.
   * @param {number} options.id - The ID of the collection.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  fetchCollectionDetails: (options, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, ["id"]);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get(`collection/${options.id}`, options, onSuccess, onError);
  },

  /**
   * Retrieves images associated with a film collection.
   * @param {Object} options - Options object.
   * @param {number} options.id - The ID of the collection.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  fetchCollectionImages: (options, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, ["id"]);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get(`collection/${options.id}/images`, options, onSuccess, onError);
  }
};

/**
 * Module for production company data.
 */
filmLibrary.productionCompanies = {
  /**
   * Fetches details for a specific production company.
   * @param {Object} options - Options object.
   * @param {number} options.id - The ID of the company.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  getCompanyDetails: (options, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, ["id"]);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get(`company/${options.id}`, options, onSuccess, onError);
  },

  /**
   * Retrieves movies produced by a specific company.
   * @param {Object} options - Options object.
   * @param {number} options.id - The ID of the company.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  getCompanyFilms: (options, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, ["id"]);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get(`company/${options.id}/movies`, options, onSuccess, onError);
  }
};

/**
 * Module for accessing credit details (cast/crew).
 */
filmLibrary.filmCredits = {
  /**
   * Fetches details for a specific credit entry.
   * @param {Object} options - Options object.
   * @param {string} options.id - The ID of the credit.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  getFilmCreditDetails: (options, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, ["id"]);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get(`credit/${options.id}`, options, onSuccess, onError);
  }
};

/**
 * Module for discovering movies and TV shows based on various criteria.
 */
filmLibrary.discoveryEngine = {
  /**
   * Discovers movies based on provided criteria.
   * @param {Object} options - Optional query parameters for discovery (e.g., `sort_by`, `primary_release_year`).
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  exploreFilms: (options = {}, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, [], true);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get("discover/movie", options, onSuccess, onError);
  },

  /**
   * Discovers TV series based on provided criteria.
   * @param {Object} options - Optional query parameters.
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  exploreTvSeries: (options = {}, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, [], true);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get("discover/tv", options, onSuccess, onError);
  }
};

/**
 * Module for searching content by external IDs.
 */
filmLibrary.searchEngine = {
  /**
   * Finds a movie, TV show, or person by an external ID.
   * @param {Object} options - Options object.
   * @param {string} options.id - The external ID.
   * @param {string} options.external_source - The source of the external ID (e.g., `imdb_id`, `tvdb_id`).
   * @param {Function} onSuccess - Success callback.
   * @param {Function} onError - Error callback.
   */
  findById: (options, onSuccess, onError) => {
    filmLibrary.utilities.checkRequiredArgs(arguments, 3, options, ["id", "external_source"]);
    filmLibrary.utilities.ensureCallbacksValid([onSuccess, onError]);

    filmLibrary.utilities.get(`find/${options.id}`, options, onSuccess, onError);
  }
};