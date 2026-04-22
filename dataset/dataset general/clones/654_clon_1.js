/*
 * This file defines the core `theMovieDb` JavaScript API client.
 * It encapsulates various modules for interacting with The Movie Database API.
 *
 * This is a Type I clone, meaning all functional logic, identifiers,
 * and expressions are preserved exactly as in the original.
 * Only whitespace (indentation, spacing, blank lines) and comments have been
 * extensively modified to produce a visually distinct but functionally identical output.
 *
 * All methods enforce strict mode for safer JavaScript execution.
 */

var theMovieDb = { /* The global object for the Movie Database API client. */ };


// The 'common' module contains shared utilities, configurations, and the core API client logic.
theMovieDb.common = {

    // API key: This should be replaced with your actual TMDb API key.
    api_key: "",

    // The base URL for all API requests to TMDb v3.
    base_uri: "http://api.themoviedb.org/3/",

    // The base URL for constructing image paths.
    images_uri: "http://image.tmdb.org/t/p/",

    // Default timeout for HTTP requests in milliseconds.
    timeout: 5000,

    /**
     * Constructs a URL query string from a given options object.
     * It automatically includes the API key and handles other parameters,
     * excluding 'id' and 'body' which are typically part of the URL path or POST body.
     *
     * @param {object} options - An object containing key-value pairs for query parameters.
     * @returns {string} The URL-encoded query string, starting with '?'.
     */
    generateQuery: function (options) {
        'use strict'; // Enable strict mode for this function.

        var myOptions, // A local variable to hold the processed options.
            query,     // The string that will accumulate the query parameters.
            option;    // Loop iterator for object properties.

        // Ensure 'myOptions' is always an object, even if 'options' is null or undefined.
        myOptions = options || {};
        // Initialize the query string with the mandatory API key.
        query = "?api_key=" + theMovieDb.common.api_key;

        // Check if there are any additional options to append.
        if (Object.keys(myOptions).length > 0) {
            // Iterate through each property in the 'myOptions' object.
            for (option in myOptions) {
                // Ensure the property belongs to 'myOptions' itself (not its prototype chain)
                // and is not 'id' or 'body', which are special cases.
                if (myOptions.hasOwnProperty(option) && option !== "id" && option !== "body") {
                    // Append the option as '&key=value' to the query string.
                    query = query + "&" + option + "=" + myOptions[option];
                }
            }
        }
        // Return the final query string.
        return query;
    },

    /**
     * Validates that the provided success and error callbacks are indeed functions.
     * This ensures that the API client can safely invoke them.
     *
     * @param {Array<function>} callbacks - An array containing two function references: [successCallback, errorCallback].
     * @throws {string} An error message if either callback is not a function.
     */
    validateCallbacks: function (callbacks) {
        'use strict'; // Enable strict mode.
        // Perform type checking on both expected callback functions.
        if (typeof callbacks[0] !== "function" || typeof callbacks[1] !== "function") {
            // If validation fails, throw a descriptive error.
            throw "Success and error parameters must be functions!";
        }
    },

    /**
     * Validates the number of arguments passed to a method and checks for the presence
     * of required properties within an options object.
     *
     * @param {IArguments}      args      - The 'arguments' object from the calling function.
     * @param {number}          argsReq   - The exact number of arguments required by the method.
     * @param {object}          opt       - The options object passed to the method, if any.
     * @param {Array<string>}   optReq    - An array of string keys representing required properties within 'opt'.
     * @param {boolean}         allOpt    - A flag indicating if all options are considered optional, overriding 'optReq'.
     * @throws {string} An error message if argument count is incorrect or a required option is missing.
     */
    validateRequired: function (args, argsReq, opt, optReq, allOpt) {
        'use strict'; // Enable strict mode.
        var i,           // Loop counter for iterating through required options.
            allOptional; // Flag to store the 'allOpt' value, defaulting to false.

        // Assign 'allOptional' based on 'allOpt' parameter, defaulting to false.
        allOptional = allOpt || false;

        // First, check if the total number of arguments matches the required count.
        if (args.length !== argsReq) {
            throw "The method requires  " + argsReq + " arguments and you are sending " + args.length + "!";
        }

        // If 'allOptional' is true, we can skip checking individual options.
        if (allOptional) {
            return; // Exit the function early.
        }

        // Only proceed with checking required options if there are more than two arguments,
        // typically indicating that an options object is expected.
        if (argsReq > 2) {
            // Loop through each required option key.
            for (i = 0; i < optReq.length; i = i + 1) {
                // Check if the options object 'opt' has the current required property.
                if (!opt.hasOwnProperty(optReq[i])) {
                    throw optReq[i] + " is a required parameter and is not present in the options!";
                }
            }
        }
    },

    /**
     * Generates a full URL for an image asset based on size and file path.
     *
     * @param {object} options - An object containing 'size' (e.g., "w500") and 'file' (the image file path).
     * @returns {string} The complete URL to the image.
     */
    getImage: function (options) {
        'use strict'; // Enable strict mode.
        // Concatenate the image base URI, desired size, and the specific file path.
        return theMovieDb.common.images_uri + options.size + "/" + options.file;
    },

    /**
     * The core API client responsible for making HTTP requests to TMDb.
     * It handles request methods (GET/POST), URL construction, timeouts,
     * and dispatches to success or error callbacks based on the response.
     *
     * @param {object}   options   - An object containing request configuration:
     *                                 - `url`: The API endpoint path (e.g., "movie/popular").
     *                                 - `method`: HTTP method, defaults to "GET".
     *                                 - `status`: Expected HTTP status code for success, defaults to 200.
     *                                 - `body`: Request body for POST requests, will be JSON.stringified.
     * @param {function} success   - The callback function to execute on a successful API response.
     * @param {function} error     - The callback function to execute on an API error or timeout.
     */
    client: function (options, success, error) {
        'use strict'; // Enable strict mode.
        var method, // Stores the HTTP method (GET or POST).
            status, // Stores the expected HTTP status code for a successful response.
            xhr;    // The XMLHttpRequest object for making the HTTP request.

        // Determine the HTTP method; default to "GET" if not specified.
        method = options.method || "GET";
        // Determine the expected success status code; default to 200 if not specified.
        status = options.status || 200;
        // Create a new instance of XMLHttpRequest for the request.
        xhr = new XMLHttpRequest();

        // Set up the event handler for request timeouts.
        xhr.ontimeout = function () {
            // On timeout, call the error callback with a specific timeout error message.
            error('{"status_code":408,"status_message":"Request timed out"}');
        };

        // Open the HTTP request: specify method, full URL, and make it asynchronous.
        xhr.open(method, theMovieDb.common.base_uri + options.url, true);

        // If the request method is POST, set appropriate headers for JSON content.
        if (options.method === "POST") {
            xhr.setRequestHeader("Content-Type", "application/json"); // Indicate that the body is JSON.
            xhr.setRequestHeader("Accept", "application/json");       // Indicate that we prefer JSON responses.
        }

        // Set the timeout for the XMLHttpRequest based on the common configuration.
        xhr.timeout = theMovieDb.common.timeout;

        // Define the onload event handler, which triggers when the transaction completes.
        xhr.onload = function (e) {
            // Check if the request's readyState is 4 (DONE).
            if (xhr.readyState === 4) {
                // If the HTTP status code matches the expected success status.
                if (xhr.status === status) {
                    // Call the success callback with the response text.
                    success(xhr.responseText);
                }
                // If the status code does not match the expected success status.
                else {
                    // Call the error callback with the response text.
                    error(xhr.responseText);
                }
            }
            // If readyState is not 4 (shouldn't happen for onload, but included for robustness).
            else {
                // Treat as an error and pass the response text.
                error(xhr.responseText);
            }
        };

        // Define the onerror event handler, which triggers for network errors.
        xhr.onerror = function (e) {
            // Call the error callback with the response text (which might be empty for network errors).
            error(xhr.responseText);
        };

        // Send the request, including a body if the method is POST.
        if (options.method === "POST") {
            // For POST requests, stringify the 'body' object to JSON and send it.
            xhr.send(JSON.stringify(options.body));
        } else {
            // For other request methods (like GET), send null as there is no request body.
            xhr.send(null);
        }
    }
};

// The 'configurations' module provides access to general API configuration data.
theMovieDb.configurations = {

    /**
     * Retrieves the current API configuration, including image base URLs, sizes, etc.
     *
     * @param {function} success - The callback function for a successful response.
     * @param {function} error   - The callback function for an error response.
     */
    getConfiguration: function (success, error) {
        'use strict'; // Strict mode.

        // Validate that exactly two arguments (success, error) are provided.
        theMovieDb.common.validateRequired(arguments, 2);

        // Validate that both success and error are valid function callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make an API call using the common client.
        theMovieDb.common.client(
            {
                // Define the URL for the configuration endpoint, appending any query parameters.
                url: "configuration" + theMovieDb.common.generateQuery()
            },
            success, // Pass the success callback to the client.
            error    // Pass the error callback to the client.
        );
    }
};

// The 'account' module provides methods for interacting with a user's TMDb account.
theMovieDb.account = {

    /**
     * Retrieves details about the authenticated user's account.
     *
     * @param {object}   options   - An object that must contain 'session_id'.
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    getInformation: function (options, success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 3 required (options, success, error), and 'session_id' in options.
        theMovieDb.common.validateRequired(arguments, 3, options, ["session_id"]);

        // Validate the success and error callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Execute the API client request.
        theMovieDb.common.client(
            {
                // Construct the URL for account information, including session_id in query.
                url: "account" + theMovieDb.common.generateQuery(options)
            },
            success, // Success callback.
            error    // Error callback.
        );
    },

    /**
     * Retrieves lists created or managed by the authenticated user.
     *
     * @param {object}   options   - An object that must contain 'session_id' and 'id' (account ID).
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    getLists: function (options, success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 3 required, and 'session_id', 'id' in options.
        theMovieDb.common.validateRequired(arguments, 3, options, ["session_id", "id"]);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to fetch user lists.
        theMovieDb.common.client(
            {
                // Construct the URL for fetching lists associated with the account ID.
                url: "account/" + options.id + "/lists" + theMovieDb.common.generateQuery(options)
            },
            success, // Success callback.
            error    // Error callback.
        );
    },

    /**
     * Retrieves the favorite movies marked by the authenticated user.
     *
     * @param {object}   options   - An object that must contain 'session_id' and 'id' (account ID).
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    getFavoritesMovies: function (options, success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 3 required, and 'session_id', 'id' in options.
        theMovieDb.common.validateRequired(arguments, 3, options, ["session_id", "id"]);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to get favorite movies.
        theMovieDb.common.client(
            {
                // Construct the URL for favorite movies of a specific account.
                url: "account/" + options.id + "/favorite_movies" + theMovieDb.common.generateQuery(options)
            },
            success, // Success callback.
            error    // Error callback.
        );
    },

    /**
     * Adds or removes a movie from the authenticated user's favorite list.
     *
     * @param {object}   options   - An object containing:
     *                                 - 'session_id'
     *                                 - 'id' (account ID)
     *                                 - 'movie_id' (the movie to favorite/unfavorite)
     *                                 - 'favorite' (boolean: true to add, false to remove)
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    addFavorite: function (options, success, error) {
        'use strict'; // Strict mode.
        var body;     // Variable to hold the request body for the POST call.

        // Validate arguments: 3 required, and specific fields in options.
        theMovieDb.common.validateRequired(arguments, 3, options, ["session_id", "id", "movie_id", "favorite"]);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Prepare the request body as an object.
        body = {
            "movie_id": options.movie_id, // The ID of the movie being acted upon.
            "favorite": options.favorite  // The boolean status (add/remove).
        };

        // Make the API call to update the favorite status.
        theMovieDb.common.client(
            {
                // URL for the favorite movie endpoint.
                url: "account/" + options.id + "/favorite" + theMovieDb.common.generateQuery(options),
                status: 201,    // Expect a 201 Created status for success.
                method: "POST", // This is a POST request.
                body: body      // The prepared request body.
            },
            success, // Success callback.
            error    // Error callback.
        );
    },

    /**
     * Retrieves movies that the authenticated user has rated.
     *
     * @param {object}   options   - An object that must contain 'session_id' and 'id' (account ID).
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    getRatedMovies: function (options, success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 3 required, and 'session_id', 'id' in options.
        theMovieDb.common.validateRequired(arguments, 3, options, ["session_id", "id"]);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to get rated movies.
        theMovieDb.common.client(
            {
                // Construct the URL for rated movies of a specific account.
                url: "account/" + options.id + "/rated_movies" + theMovieDb.common.generateQuery(options)
            },
            success, // Success callback.
            error    // Error callback.
        );
    },

    /**
     * Retrieves the movie watchlist of the authenticated user.
     *
     * @param {object}   options   - An object that must contain 'session_id' and 'id' (account ID).
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    getWatchlist: function (options, success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 3 required, and 'session_id', 'id' in options.
        theMovieDb.common.validateRequired(arguments, 3, options, ["session_id", "id"]);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to get the movie watchlist.
        theMovieDb.common.client(
            {
                // Construct the URL for the movie watchlist of a specific account.
                url: "account/" + options.id + "/movie_watchlist" + theMovieDb.common.generateQuery(options)
            },
            success, // Success callback.
            error    // Error callback.
        );
    },

    /**
     * Adds or removes a movie from the authenticated user's watchlist.
     *
     * @param {object}   options   - An object containing:
     *                                 - 'session_id'
     *                                 - 'id' (account ID)
     *                                 - 'movie_id' (the movie to add/remove)
     *                                 - 'movie_watchlist' (boolean: true to add, false to remove)
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    addMovieToWatchlist: function (options, success, error) {
        'use strict'; // Strict mode.

        var body; // Variable to hold the request body for the POST call.

        // Validate arguments: 3 required, and specific fields in options.
        theMovieDb.common.validateRequired(arguments, 3, options, ["session_id", "id", "movie_id", "movie_watchlist"]);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Prepare the request body as an object.
        body = {
            "movie_id": options.movie_id,             // The ID of the movie.
            "movie_watchlist": options.movie_watchlist // The boolean status (add/remove).
        };

        // Make the API call to update the movie watchlist.
        theMovieDb.common.client(
            {
                // URL for the movie watchlist endpoint.
                url: "account/" + options.id + "/movie_watchlist" + theMovieDb.common.generateQuery(options),
                method: "POST", // This is a POST request.
                status: 201,    // Expect a 201 Created status for success.
                body: body      // The prepared request body.
            },
            success, // Success callback.
            error    // Error callback.
        );
    }
};

// The 'authentication' module handles user login, session creation, and guest sessions.
theMovieDb.authentication = {

    /**
     * Generates a new request token, which is the first step in the TMDb authentication flow.
     *
     * @param {function} success - The callback for a successful response, containing the token.
     * @param {function} error   - The callback for an error response.
     */
    generateToken: function (success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 2 required (success, error).
        theMovieDb.common.validateRequired(arguments, 2);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to request a new token.
        theMovieDb.common.client(
            {
                // URL for generating a new authentication token.
                url: "authentication/token/new" + theMovieDb.common.generateQuery()
            },
            success, // Success callback.
            error    // Error callback.
        );
    },

    /**
     * Redirects the user to TMDb's website to approve the request token.
     * This requires user interaction in a new browser window/tab.
     *
     * @param {object} options - An object containing 'token' (the generated request token)
     *                           and 'redirect_to' (the URL to return to after approval).
     */
    askPermissions: function (options) {
        'use strict'; // Strict mode.

        // Open a new window/tab to the TMDb authentication page with the token and redirect URL.
        window.open("https://www.themoviedb.org/authenticate/" + options.token + "?redirect_to=" + options.redirect_to);

    },

    /**
     * Validates a request token with a user's username and password.
     * This is a server-side step after the user has approved the token.
     *
     * @param {object}   options   - An object containing 'request_token', 'username', and 'password'.
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    validateUser: function (options, success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 3 required, and specific fields in options.
        theMovieDb.common.validateRequired(arguments, 3, options, ["request_token", "username", "password"]);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to validate the user.
        theMovieDb.common.client(
            {
                // URL for validating the token with user login credentials.
                url: "authentication/token/validate_with_login" + theMovieDb.common.generateQuery(options)
            },
            success, // Success callback.
            error    // Error callback.
        );
    },

    /**
     * Generates a new session ID from a validated request token.
     * This session ID is required for authenticated API calls.
     *
     * @param {object}   options   - An object that must contain 'request_token'.
     * @param {function} success   - The callback for a successful response, containing the session ID.
     * @param {function} error     - The callback for an error response.
     */
    generateSession: function (options, success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 3 required, and 'request_token' in options.
        theMovieDb.common.validateRequired(arguments, 3, options, ["request_token"]);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to create a new session.
        theMovieDb.common.client(
            {
                // URL for generating a new session ID from a validated token.
                url: "authentication/session/new" + theMovieDb.common.generateQuery(options)
            },
            success, // Success callback.
            error    // Error callback.
        );
    },

    /**
     * Generates a new guest session ID.
     * Guest sessions allow actions like rating without a full user account.
     *
     * @param {function} success - The callback for a successful response, containing the guest session ID.
     * @param {function} error   - The callback for an error response.
     */
    generateGuestSession: function (success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 2 required (success, error).
        theMovieDb.common.validateRequired(arguments, 2);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to generate a new guest session.
        theMovieDb.common.client(
            {
                // URL for generating a new guest session.
                url: "authentication/guest_session/new" + theMovieDb.common.generateQuery()
            },
            success, // Success callback.
            error    // Error callback.
        );
    }
};

// The 'certifications' module provides access to movie certification data.
theMovieDb.certifications = {

    /**
     * Retrieves a list of movie certifications (e.g., 'PG', 'R', 'U', '12A').
     *
     * @param {function} success - The callback for a successful response.
     * @param {function} error   - The callback for an error response.
     */
    getList: function (success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 2 required (success, error).
        theMovieDb.common.validateRequired(arguments, 2);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to get the certification list.
        theMovieDb.common.client(
            {
                // URL for movie certification list.
                url: "certification/movie/list" + theMovieDb.common.generateQuery()
            },
            success, // Success callback.
            error    // Error callback.
        );
    }
};

// The 'changes' module provides methods to retrieve recent changes to movie and person data.
theMovieDb.changes = {

    /**
     * Retrieves a list of movie IDs that have been changed recently.
     * Optional parameters can filter by date range.
     *
     * @param {object}   options   - Optional object for filtering changes (e.g., 'start_date', 'end_date').
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    getMovieChanges: function (options, success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 3 required, all options are optional (true).
        theMovieDb.common.validateRequired(arguments, 3, "", "", true);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to get movie changes.
        theMovieDb.common.client(
            {
                // URL for movie changes endpoint.
                url: "movie/changes" + theMovieDb.common.generateQuery(options)
            },
            success, // Success callback.
            error    // Error callback.
        );
    },

    /**
     * Retrieves a list of person IDs that have been changed recently.
     * Optional parameters can filter by date range.
     *
     * @param {object}   options   - Optional object for filtering changes (e.g., 'start_date', 'end_date').
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    getPersonChanges: function (options, success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 3 required, all options are optional (true).
        theMovieDb.common.validateRequired(arguments, 3, "", "", true);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to get person changes.
        theMovieDb.common.client(
            {
                // URL for person changes endpoint.
                url: "person/changes" + theMovieDb.common.generateQuery(options)
            },
            success, // Success callback.
            error    // Error callback.
        );
    }
};

// The 'collections' module provides methods for retrieving information about movie collections.
theMovieDb.collections = {

    /**
     * Retrieves the details of a specific movie collection by its ID.
     *
     * @param {object}   options   - An object that must contain 'id' (the collection ID).
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    getCollection: function (options, success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 3 required, and 'id' in options.
        theMovieDb.common.validateRequired(arguments, 3, options, ["id"]);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to get collection details.
        theMovieDb.common.client(
            {
                // URL for a specific collection.
                url: "collection/" + options.id + theMovieDb.common.generateQuery(options)
            },
            success, // Success callback.
            error    // Error callback.
        );
    },

    /**
     * Retrieves the images associated with a specific movie collection by its ID.
     *
     * @param {object}   options   - An object that must contain 'id' (the collection ID).
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    getCollectionImages: function (options, success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 3 required, and 'id' in options.
        theMovieDb.common.validateRequired(arguments, 3, options, ["id"]);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to get collection images.
        theMovieDb.common.client(
            {
                // URL for images of a specific collection.
                url: "collection/" + options.id + "/images" + theMovieDb.common.generateQuery(options)
            },
            success, // Success callback.
            error    // Error callback.
        );
    }

};

// The 'companies' module provides methods for retrieving information about production companies.
theMovieDb.companies = {

    /**
     * Retrieves the details of a specific production company by its ID.
     *
     * @param {object}   options   - An object that must contain 'id' (the company ID).
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    getCompany: function (options, success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 3 required, and 'id' in options.
        theMovieDb.common.validateRequired(arguments, 3, options, ["id"]);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to get company details.
        theMovieDb.common.client(
            {
                // URL for a specific company.
                url: "company/" + options.id + theMovieDb.common.generateQuery(options)
            },
            success, // Success callback.
            error    // Error callback.
        );
    },

    /**
     * Retrieves a list of movies produced by a specific company by its ID.
     *
     * @param {object}   options   - An object that must contain 'id' (the company ID).
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    getCompanyMovies: function (options, success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 3 required, and 'id' in options.
        theMovieDb.common.validateRequired(arguments, 3, options, ["id"]);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to get movies by a company.
        theMovieDb.common.client(
            {
                // URL for movies produced by a specific company.
                url: "company/" + options.id + "/movies" + theMovieDb.common.generateQuery(options)
            },
            success, // Success callback.
            error    // Error callback.
        );
    }

};

// The 'credits' module provides methods for retrieving detailed information about credits.
theMovieDb.credits = {

    /**
     * Retrieves the details of a specific credit (e.g., a cast or crew member's role) by its ID.
     *
     * @param {object}   options   - An object that must contain 'id' (the credit ID).
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    getCredit: function (options, success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 3 required, and 'id' in options.
        theMovieDb.common.validateRequired(arguments, 3, options, ["id"]);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to get credit details.
        theMovieDb.common.client(
            {
                // URL for a specific credit.
                url: "credit/" + options.id + theMovieDb.common.generateQuery(options)
            },
            success, // Success callback.
            error    // Error callback.
        );
    }
};

// The 'discover' module provides powerful methods for discovering movies and TV shows based on various criteria.
theMovieDb.discover = {

    /**
     * Discovers movies based on a wide range of filters and sorting options.
     * All options are optional for this method.
     *
     * @param {object}   options   - An optional object containing various filters (e.g., 'primary_release_year', 'with_genres').
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    getMovies: function (options, success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 3 required, all options are optional (true).
        theMovieDb.common.validateRequired(arguments, 3, "", "", true);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to discover movies.
        theMovieDb.common.client(
            {
                // URL for movie discovery endpoint.
                url: "discover/movie" + theMovieDb.common.generateQuery(options)
            },
            success, // Success callback.
            error    // Error callback.
        );
    },

    /**
     * Discovers TV shows based on a wide range of filters and sorting options.
     * All options are optional for this method.
     *
     * @param {object}   options   - An optional object containing various filters (e.g., 'first_air_date_year', 'with_networks').
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    getTvShows: function (options, success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 3 required, all options are optional (true).
        theMovieDb.common.validateRequired(arguments, 3, "", "", true);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to discover TV shows.
        theMovieDb.common.client(
            {
                // URL for TV show discovery endpoint.
                url: "discover/tv" + theMovieDb.common.generateQuery(options)
            },
            success, // Success callback.
            error    // Error callback.
        );
    }

};

// The 'find' module provides methods for finding TMDb entities using external IDs from other sources.
theMovieDb.find = {

    /**
     * Finds a movie, TV show, or person in TMDb using an external ID (e.g., IMDb ID, TVDB ID).
     *
     * @param {object}   options   - An object that must contain:
     *                                 - 'id' (the external ID to search for)
     *                                 - 'external_source' (the source of the external ID, e.g., 'imdb_id')
     * @param {function} success   - The callback for a successful response.
     * @param {function} error     - The callback for an error response.
     */
    getById: function (options, success, error) {
        'use strict'; // Strict mode.

        // Validate arguments: 3 required, and specific fields in options.
        theMovieDb.common.validateRequired(arguments, 3, options, ["id", "external_source"]);

        // Validate the callbacks.
        theMovieDb.common.validateCallbacks([success, error]);

        // Make the API call to find by external ID.
        theMovieDb.common.client(
            {
                // URL for the find endpoint, using the external ID.
                url: "find/" + options.id + theMovieDb.common.generateQuery(options)
            },
            success, // Success callback.
            error    // Error callback.
        );
    }
};