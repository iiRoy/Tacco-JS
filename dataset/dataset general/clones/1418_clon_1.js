/*
 * This is a modified version of the original twitter.js file.
 * The original source can be found at:
 * https://github.com/yssk22/node-twbot/
 *
 * This version includes various formatting changes and comments
 * but retains all core functionality and logic from the original.
 */
var util = require('util')
  , url = require('url')
  , querystring = require('querystring')
  , crypto = require('crypto')
  , http = require('http')
  , EventEmitter = require('events').EventEmitter
  , OAuth = require('oauth').OAuth
  ; /* End of require statements */

// Initialize debugging functionality.
var debug;
var debugLevel = parseInt(process.env.NODE_DEBUG, 16);

// Check if the debug flag is set for this module.
if (debugLevel & 0x4) {

  debug = function (x) {
    util.error('[twbot/Twitter]: ' + x);
  };

} else {

  debug = function () {
    /* No operation for debug when not enabled */
  };

}


/**
 *  OAuth Configuration constants. These define the endpoints and
 *  protocol details for Twitter's OAuth authentication process.
 */
var OAUTH_CONFIG = {
    RequestTokenUrl : 'https://api.twitter.com/oauth/request_token'
  , AccessTokenUrl  : 'https://api.twitter.com/oauth/access_token'
  , Version         : '1.0'
  , Method          : 'HMAC-SHA1'
};

/**
 *  Twitter API endpoint URLs. These are the base URLs for different
 *  parts of the Twitter API.
 */
var API_URL = 'https://api.twitter.com/1'
  , STREAM_URL = 'https://userstream.twitter.com/2'
  , AUTHORIZE_URL = 'https://twitter.com/oauth/authorize?oauth_token='
  ; /* API URLs defined */


/**
 * Twitter API Client constructor.
 * This function initializes a new Twitter client instance.
 *
 * @param {String} consumerKey    OAuth Consumer Key provided by Twitter.
 * @param {String} consumerSecret OAuth Consumer Secret provided by Twitter.
 * @param {Object} options        Optional configuration settings for the client.
 *
 */
function Twitter(consumerKey, consumerSecret, options) {

  // Ensure options object exists, initialize if not provided.
  if (!options) {
    options = {};
  }

  // Enforce instantiation with 'new' keyword.
  if (!(this instanceof Twitter)) {
    return new Twitter(consumerKey, consumerSecret, options);
  }

  // Initialize the OAuth object with consumer credentials and configuration.
  this._oa = new OAuth(
      OAUTH_CONFIG.RequestTokenUrl
    , OAUTH_CONFIG.AccessTokenUrl
    , consumerKey
    , consumerSecret
    , OAUTH_CONFIG.Version
    , null /* No callback URL needed for client-side */
    , OAUTH_CONFIG.Method
  );

  // Assign access tokens and results from options, if available.
  this.accessKey = options.accessKey;
  this.accessSecret = options.accessSecret;
  this._token = options._token;
  this._token_secret = options._token_secret;
  this._results = options._results;

  // Set API and Stream URLs, falling back to defaults if not provided in options.
  this._apiUrl = options._apiUrl || API_URL;
  this._streamUrl = options._streamUrl || STREAM_URL;
}

/**
 * Normalize an error object into a standard Error instance.
 * This function handles different types of errors returned by the API
 * and converts them into a consistent Error object format.
 *
 * @param {Object} err An object representing an error, possibly from an HTTP response.
 * @returns {Error} A normalized Error object.
 *
 */
function normalizeError(err) {

  if (err instanceof Error) {
    return err; // Already an Error object
  } else if (err.statusCode) {
    // Handle HTTP errors (e.g., 4xx, 5xx)
    var e = new Error(err.statusCode + ': ' + err.data);
    e.statusCode = err.statusCode;
    try {
      e.data = JSON.parse(err.data); // Attempt to parse error data as JSON
    } catch (er) {
      e.data = err.data; // Fallback if JSON parsing fails
    }
    return e;
  } else {
    // Handle other unknown error types
    return new Error(err);
  }
}

/**
 * Builds a URL string by appending query parameters.
 *
 * @param {String} path   The base path of the URL.
 * @param {Object} params Optional object containing query parameters.
 * @returns {String} The constructed URL string.
 */
function buildUrl(path, params) {

  var qs;

  if (typeof params == 'object') {
    qs = querystring.stringify(params); // Convert object to query string
  }

  // Append query string if it exists, otherwise return just the path.
  return qs ? path + '?' + qs : path;
}

/**
 * Initiates the OAuth request token flow.
 *
 * @param {Function} callback Callback function `(err, authorizeUrl)`
 */
Twitter.prototype.getRequestToken = function (callback) {

  var self = this; // Preserve context

  this._oa.getOAuthRequestToken(function (err, token, token_secret, results) {
    if (err) {
      // If an error occurred, normalize and pass to callback.
      if (callback) {
        callback(normalizeError(err));
      }
    } else {
      // Store the retrieved token and secret.
      self._token = token;
      self._token_secret = token_secret;
      self._token_results = results;

      // Construct the authorization URL and pass it to the callback.
      if (callback) {
        callback(null, AUTHORIZE_URL + token);
      }
    }
  });
};

/**
 * Exchanges the request token for an access token.
 *
 * @param {String}   verifier The OAuth verifier obtained after user authorization.
 * @param {Function} callback Callback function `(err, accessToken, accessSecret)`
 */
Twitter.prototype.getAccessToken = function (verifier, callback) {

  var self = this; // Preserve context

  this._oa.getOAuthAccessToken(
    self._token, self._token_secret, verifier,
    function (error, akey, asecret, results2) {
      if (error) {
        // If an error occurred, normalize and pass to callback.
        if (callback) {
          callback(normalizeError(error));
        }
      } else {
        // Store the access key and secret.
        self.accessKey = akey;
        self.accessSecret = asecret;
        self._results = results2;

        // Pass the access key and secret to the callback.
        if (callback) {
          callback(null, akey, asecret);
        }
      }
    });
};


/* -----------------------------------------------------------------------------
 * Tweets Resources - Methods for interacting with Tweet-related API endpoints.
 * ----------------------------------------------------------------------------- */

/**
 * Retrieves a single Tweet.
 *
 * @param {String}   id       The ID of the Tweet to retrieve.
 * @param {Object}   params   Optional parameters for the API request.
 * @param {Function} callback Callback function `(err, data, response)`
 */
Twitter.prototype.show = function (id, params, callback) {

  // Handle case where params is omitted and callback is passed directly.
  if (typeof params == 'function') {
    callback = params;
    params = {};
  }

  // Construct the API path for showing a status.
  var path = '/statuses/' + id + '.json';

  // Perform a GET request.
  return this._doGet(path, params, callback);
};

/**
 * Updates the authenticated user's status (posts a new Tweet).
 *
 * @param {Object|String} params   Either a string for the status text, or an object containing `status` and `in_reply_to_status_id`.
 * @param {Function}      callback Callback function `(err, data, response)`
 */
Twitter.prototype.update = function (params, callback) {

  // Normalize params if only a string status is provided.
  if (typeof params == 'string') {
    params = {
      status: params
    };
  } else {
    // Ensure params object has correct keys for API.
    params = {
        status: params.text
      , in_reply_to_status_id: params.in_reply_to_status_id
    };
  }

  // Perform a POST request to update status.
  return this._doPost('/statuses/update.json', params, callback);
};

/**
 * Destroys (deletes) the specified Tweet.
 *
 * @param {String}   id       The ID of the Tweet to destroy.
 * @param {Function} callback Callback function `(err, data, response)`
 */
Twitter.prototype.destroy = function (id, callback) {
  // Perform a POST request to destroy status.
  return this._doPost('/statuses/destroy/' + id + '.json', {}, callback);
};

/**
 * Retweets the specified Tweet.
 *
 * @param {String}   id       The ID of the Tweet to retweet.
 * @param {Function} callback Callback function `(err, data, response)`
 */
Twitter.prototype.retweet = function (id, callback) {
  // Perform a POST request to retweet.
  return this._doPost('/statuses/retweet/' + id + '.json', {}, callback);
};

/**
 * Retrieves up to 100 of the first retweets for a given tweet.
 *
 * @param {String}   id       The ID of the Tweet to retrieve retweets for.
 * @param {Function} callback Callback function `(err, data, response)`
 */
Twitter.prototype.retweets = function (id, callback) {
  // Perform a GET request for retweets.
  return this._doGet('/statuses/retweets/' + id + '.json', {}, callback);
};


/* -----------------------------------------------------------------------------
 * Friendship Resources - Methods for managing relationships between users.
 * ----------------------------------------------------------------------------- */

/**
 * Allows the authenticated user to follow another user.
 *
 * @param {Object|String} params   Either a user ID/screen name string, or an object with `user_id` or `screen_name`.
 * @param {Function}      callback Callback function `(err, data, response)`
 */
Twitter.prototype.follow = function (params, callback) {

  // Normalize params if only a user ID/screen name string is provided.
  if (typeof params == "string") {
    params = {
      user_id: params
    };
  }

  // Perform a POST request to create a friendship.
  this._doPost('/friendships/create.json', params, callback);
};

/**
 * Allows the authenticated user to unfollow another user.
 *
 * @param {Object|String} params   Either a user ID/screen name string, or an object with `user_id` or `screen_name`.
 * @param {Function}      callback Callback function `(err, data, response)`
 */
Twitter.prototype.unfollow = function (params, callback) {

  // Normalize params if only a user ID/screen name string is provided.
  if (typeof params == "string") {
    params = {
      user_id: params
    };
  }

  // Perform a POST request to destroy a friendship.
  this._doPost('/friendships/delete.json', params, callback);
};

/**
 * Retrieves the IDs of users following the specified user.
 *
 * @param {Object}   params   Optional parameters (e.g., `user_id`, `screen_name`).
 * @param {Function} callback Callback function `(err, data, response)`
 */
Twitter.prototype.followers = function (params, callback) {

  // Handle case where params is omitted and callback is passed directly.
  if (typeof params == 'function') {
    callback = params;
    params = {
      user_id: this._results.user_id // Default to current user's followers
    };
  }

  var path = '/followers/ids.json'; // API path for follower IDs.

  // Perform a GET request.
  this._doGet(path, params, callback);
};


/* -----------------------------------------------------------------------------
 * Tweets Resources (continued) - More methods related to Tweets.
 * ----------------------------------------------------------------------------- */

// Supported timeline types for the getTimeline method.
var supportedTLTypes = [
    'public_timeline'
  , 'home_timeline'
  , 'friends_timeline'
  , 'user_timeline'
  , 'mentions'
  , 'retweeted_by_me'
  , 'retweeted_to_me'
  , 'retweeted_of_me'
];

/**
 * Retrieves various types of timelines.
 *
 * @param {Object|String} params   Either a string specifying the timeline type, or an object with `type` and other parameters.
 * @param {Function}      callback Callback function `(err, data, response)`
 * @throws {TypeError} If params is not a string or object.
 * @throws {Error}     If an unsupported timeline type is requested.
 */
Twitter.prototype.getTimeline = function (params, callback) {

  // Normalize params based on type.
  if (typeof params == 'function') {
    callback = params;
    params = {
      type: 'home_timeline'
    }; // Default to home timeline.
  } else if (typeof params == 'string') {
    params = {
      type: params
    };
  } else if (typeof params == 'object') {
    params.type = params.type || 'home_timeline'; // Default type if not specified in object.
  } else {
    throw new TypeError('params must be string or object');
  }

  // Validate the requested timeline type.
  if (supportedTLTypes.indexOf(params.type) == -1) {
    throw new Error('timeline type must be one of (' + supportedTLTypes.join(',') + ') but ' + params.type + '.');
  }

  // Construct the API path.
  var path = '/statuses/' + params.type + '.json';

  // Remove the 'type' parameter as it's part of the path, not query string.
  delete (params.type);

  // Perform a GET request.
  this._doGet(path, params, callback);
};

/**
 * Retrieves the statuses from a specific list.
 *
 * @param {String}   user     The screen name or ID of the user who owns the list.
 * @param {String}   id       The ID of the list.
 * @param {Object}   params   Optional parameters for the API request.
 * @param {Function} callback Callback function `(err, data, response)`
 */
Twitter.prototype.getListStatuses = function (user, id, params, callback) {

  // Handle case where params is omitted and callback is passed directly.
  if (typeof (params) == 'function') {
    callback = params;
    params = {};
  }

  // Construct the API path for list statuses.
  var path = ['', user, 'lists', id, 'statuses'].join('/') + '.json';

  // Perform a GET request.
  this._doGet(path, params, callback);
};


/* -----------------------------------------------------------------------------
 * Account Resources - Methods related to the authenticated user's account.
 * ----------------------------------------------------------------------------- */

/**
 * Verifies the credentials of the authenticated user.
 *
 * @param {Object|Boolean} params   Optional parameters (e.g., `include_entities`), or a boolean for `include_entities`.
 * @param {Function}       callback Callback function `(err, data, response)`
 */
Twitter.prototype.getAccount = function (params, callback) {

  // Normalize params based on type.
  if (typeof params == 'boolean') {
    params = {
      include_entities: params
    };
  } else if (typeof params == 'function') {
    callback = params;
    params = {};
  }

  var path = '/account/verify_credentials.json'; // API path for account verification.

  // Perform a GET request.
  this._doGet(path, params, callback);
};


/* -----------------------------------------------------------------------------
 * Streaming Support - Functionality for connecting to Twitter's streaming APIs.
 * ----------------------------------------------------------------------------- */

/**
 * UserStream event class constructor.
 * This class represents a connection to the Twitter User Stream API.
 * It inherits from EventEmitter to emit data and error events.
 *
 * @param {Twitter} client  The Twitter client instance.
 * @param {http.ClientRequest} request The HTTP request object for the stream.
 */
function UserStream(client, request) {

  this._client = client;
  this._request = request;

  // Immediately end the request to send headers and start receiving data.
  this._request.end();

  // Event Binding for stream data.
  var self = this;

  /**
   * Internal helper function to process received data chunks.
   *
   * @param {String} jsonStr  A string that might contain JSON data.
   * @param {Object} response The HTTP response object.
   * @private
   */
  function _dataReceived(jsonStr, response) {
    if (jsonStr) {
      var obj = undefined;
      try {
        obj = JSON.parse(jsonStr); // Attempt to parse JSON.
      } catch (e) {
        // Ignore invalid JSON strings from twitter (e.g., keep-alive newlines).
      }

      if (obj) {
        debug('onData: ' + util.inspect(obj)); // Log parsed object.
        self.emit('data', obj); // Emit 'data' event.
      }
    }
  }

  // Attach error handler to the request.
  self._request.on('error', function (err) {
    this.emit('error', err, undefined);
  });

  // Attach response handler to the request.
  self._request.on('response', function (response) {
    self._response = response;
    response.setEncoding('utf8'); // Set encoding for data chunks.

    var isError = response.statusCode != 200; // Check if response indicates an error.
    var buff = ''; // Buffer to accumulate incomplete JSON lines.

    // Handle incoming data chunks.
    response.on('data', function (chunk) {
      if (isError) {
        buff += chunk; // Accumulate error data if status code indicates error.
      } else {
        // Process valid stream data.
        if (chunk.match(/\n/)) {
          // If a newline is found, it implies a data separator.
          var chunks = chunk.split(/\r?\n/);
          var jsonStr = buff + chunks.shift(); // Prepend buffer to the first chunk.
          _dataReceived(jsonStr, response); // Process the first complete JSON string.

          if (chunks) {
            buff = chunks.pop(); // The last chunk might be incomplete, move to buffer.
          }

          // Process all other complete chunks.
          for (var i = 0, len = chunks.length; i < len; i++) {
            _dataReceived(chunks[i], response);
          }
        } else {
          buff += chunk; // No newline, accumulate to buffer.
        }
      }
    });

    // Handle end of response.
    response.on('end', function () {
      if (isError) {
        // If it was an error, construct and emit an error object.
        var error = new Error(response.statusCode + ': ' + buff);
        error.statusCode = response.statusCode;
        try {
          error.data = JSON.parse(buff);
        } catch (e) {
          error.data = buff;
        }
        self.emit('error', error, response);
      } else {
        // If buffer contains remaining data, process it.
        if (buff) {
          _dataReceived(buff);
        }
        self.emit('end'); // Emit 'end' event for successful stream termination.
      }
    });
  });
}

// Inherit from EventEmitter to enable event handling.
util.inherits(UserStream, EventEmitter);

/**
 * Terminates the stream connection.
 *
 * @param {Function} callback Optional callback to execute after ending the stream.
 */
UserStream.prototype.end = function (callback) {
  // TODO: Refactor to gracefully handle stream termination.
  var self = this;
  if (self.started) {
    console.log('end'); // Log termination attempt.
    self._request.connection.destroy(); // Forcefully close the connection.
    if (callback) {
      callback();
    }
  } else {
    // If stream hasn't fully started, wait for response to close.
    this._request.on('response', function (response) {
      self._request.connection.destroy();
      if (callback) {
        callback();
      }
    });
  }
};

/**
 * Getter for the client associated with this stream.
 *
 * @returns {Twitter} The Twitter client instance.
 */
UserStream.prototype.__defineGetter__('client', function () {
  return this._client;
});


/**
 * Opens a User Stream connection.
 *
 * @param {Object}   params   Optional parameters for the stream API.
 * @param {Function} callback Optional callback (though UserStream uses events).
 * @returns {UserStream} A UserStream instance.
 */
Twitter.prototype.openUserStream = function (params, callback) {
  // TODO: Refactoring needed to align with other methods' callback patterns.

  // Build the URL for the user stream.
  var uri = buildUrl([this._streamUrl, '/user.json'].join(''), params);
  debug('GET ' + uri); // Log the stream request URL.

  // Make an OAuth GET request for the stream.
  var request = this._oa.get(uri, this.accessKey, this.accessSecret);

  // Return a new UserStream instance wrapping the request.
  return new UserStream(this, request);
};


/* -----------------------------------------------------------------------------
 * Private methods for the Twitter class - Internal utility functions.
 * ----------------------------------------------------------------------------- */

/**
 * Internal method to perform a GET request to the Twitter API.
 *
 * @param {String}   path     The API endpoint path.
 * @param {Object}   params   Query parameters for the request.
 * @param {Function} callback Callback function `(err, data, response)`
 * @private
 */
Twitter.prototype._doGet = function (path, params, callback) {

  path = buildUrl(path, params); // Build the full URL with query parameters.
  debug('GET ' + path); // Log the GET request.

  var url = [this._apiUrl, path].join(''); // Combine base API URL and path.

  // Execute the OAuth GET request.
  this._oa.get(url, this.accessKey, this.accessSecret,
    this._createResponseHandler(callback));
};

/**
 * Internal method to perform a POST request to the Twitter API.
 *
 * @param {String}   path     The API endpoint path.
 * @param {Object}   body     The request body (parameters for POST).
 * @param {Function} callback Callback function `(err, data, response)`
 * @private
 */
Twitter.prototype._doPost = function (path, body, callback) {

  debug('POST ' + path); // Log the POST request.
  debug('>> ' + util.inspect(body)); // Log the request body.

  var url = [this._apiUrl, path].join(''); // Combine base API URL and path.

  // Execute the OAuth POST request.
  this._oa.post(url, this.accessKey, this.accessSecret,
    body,
    this._createResponseHandler(callback));
};

/**
 * Creates a standardized response handler for OAuth requests.
 * This handler processes the raw response from the OAuth library
 * and passes normalized data/errors to the user-provided callback.
 *
 * @param {Function} callback The user-provided callback function.
 * @returns {Function} A new function that handles the OAuth response.
 * @private
 */
Twitter.prototype._createResponseHandler = function (callback) {

  return function (error, data, response) {
    if (error) {
      // If an error occurred, normalize it and pass to callback.
      return callback && callback(normalizeError(error), data, response);
    } else {
      var obj = undefined;
      if (data) {
        debug('<< ' + data); // Log raw response data.
        try {
          obj = JSON.parse(data); // Attempt to parse data as JSON.
        } catch (e) {
          obj = data; // If JSON parsing fails, keep raw data.
          return callback(e, data, response); // Pass parsing error to callback.
        }
        // Success: pass parsed object to callback.
        return callback && callback(undefined, obj, response);
      } else {
        // Success: no data returned.
        return callback && callback(undefined, data, response);
      }
    }
  };
};

// Export the Twitter constructor as the module's main export.
module.exports = Twitter;