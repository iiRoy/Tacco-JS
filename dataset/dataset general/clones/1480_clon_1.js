var url = require('url')
  , https = require('https')
  , http = require('http')
  , querystring = require('querystring')
  , sax = require('sax')
  , MemoryCache = require('./cache/memory') // Default cache implementation module


module.exports = Client; // Export the Client class for external use


/**
 * EVE API client. This class provides a structured way to interact with the EVE Online API.
 *
 * The constructor accepts an options object to configure its behavior.
 * The following list of options are recognized by the Client:
 * <ul>
 *   <li><strong>url</strong>: Fully qualified HTTP(s) URL pointing to the EVE API server endpoint.
 *                              Defaults to 'https://api.eveonline.com' if not specified.</li>
 *   <li><strong>cache</strong>: An instance of a cache object that handles persisting and retrieving
 *                                 results from a caching mechanism. If not provided, a new
 *                                 MemoryCache instance will be used by default.</li>
 *   <li><strong>params</strong>: An object containing default query parameters to be sent with
 *                                 every API request.</li>
 * </ul>
 *
 * @exports Client as hamster.Client // This indicates the intended export name in a larger project context.
 * @param {Object} options Client initialization options. Can be an empty object.
 * @see hamster.cache.FileCache // Reference to another cache implementation.
 * @constructor // Marks this as a constructor function.
 */
function Client(options) {
  // Ensure options is an object, even if not provided.
  options = options || {};

  // Initialize internal parameters storage.
  this._params = {};

  // Set the base URL for API requests.
  // Uses provided URL or a default EVE API endpoint.
  this.setUrl(options.url || 'https://api.eveonline.com');

  // Set any default parameters provided in the options.
  this.setParams(options.params || {});

  // Configure the caching mechanism.
  // Uses provided cache object or a new MemoryCache instance.
  this.setCache(options.cache || new MemoryCache());
}


/**
 * Sets the base URL for all subsequent API requests made by this client instance.
 * The URL can be provided as a string or an object (though string is more common here).
 *
 * @param {String|Object} urlStr The URL string or object to be parsed and set.
 */
Client.prototype.setUrl = function (urlStr) {
  // Parse the URL string into a URL object for easier manipulation.
  this._url = url.parse(urlStr);
};


/**
 * Retrieves the currently configured server URL.
 *
 * @param  {Boolean} returnUrlObj If true, returns the URL as a parsed object; otherwise,
 *                                returns it as a formatted string. Defaults to false.
 * @return {String|Object}        The URL string or the parsed URL object, depending on the
 *                                `returnUrlObj` parameter.
 */
Client.prototype.getUrl = function (returnUrlObj) {
  // Return the URL object directly or format it back into a string.
  return returnUrlObj ? this._url : url.format(this._url);
};


/**
 * Sets a single default parameter that will be included in all API requests
 * unless explicitly overridden by request-specific parameters.
 *
 * @param {String} param The name of the parameter to set.
 * @param {String} value The value to associate with the parameter name.
 */
Client.prototype.setParam = function (param, value) {
  // Assign the value to the specified parameter name in the internal parameters object.
  this._params[param] = value;
};


/**
 * Sets multiple default parameters from a given object.
 * Each key-value pair in the `params` object will be set as a default parameter.
 * This method iterates over the provided object and calls `setParam` for each entry.
 *
 * @param {object} params An object containing key-value pairs of parameters.
 */
Client.prototype.setParams = function (params) {
  // Iterate over properties of the `params` object.
  for (var param in params) {
    // Ensure the property belongs to the object itself, not its prototype chain.
    if (params.hasOwnProperty(param)) {
      // Set each parameter using the `setParam` method.
      this.setParam(param, params[param]);
    }
  }
};


/**
 * Retrieves the value of a specific default parameter.
 *
 * @param  {String} param The name of the parameter to retrieve.
 * @return {String|undefined} The value of the parameter if it exists, otherwise `undefined`.
 */
Client.prototype.getParam = function (param) {
  // Check if the parameter is defined in the internal parameters object.
  if (typeof this._params[param] !== 'undefined') {
    return this._params[param]; // Return the parameter's value.
  }
  // If not found, implicitly returns undefined.
};


/**
 * Returns the entire object containing all currently set default parameters.
 *
 * @return {Object} An object where keys are parameter names and values are their respective values.
 */
Client.prototype.getParams = function () {
  return this._params; // Return the internal parameters object.
};


/**
 * Clears all currently set default parameters.
 * This effectively removes all key-value pairs from the internal parameters object.
 */
Client.prototype.clearParams = function () {
  // Iterate over all properties in the internal parameters object.
  for (var param in this._params) {
    // Ensure the property is directly on the object.
    if (this._params.hasOwnProperty(param)) {
      // Delete each parameter. Note: `params` should be `this._params`. This is a bug in original code if params is not defined.
      // Assuming `params` is a typo and should be `this._params` based on context.
      delete this._params[param]; // Corrected: `delete this._params[param]`
    }
  }
};


/**
 * Sets the cache object to be used by this client instance.
 *
 * The provided `cache` object must implement at least two methods:
 * <tt>set(key, value, duration)</tt> for storing items, and
 * <tt>get(key)</tt> for retrieving items.
 *
 * @param {Object} cache An object conforming to the cache interface.
 */
Client.prototype.setCache = function (cache) {
  this._cache = cache; // Store the provided cache object internally.
};


/**
 * Retrieves the currently configured cache object.
 *
 * @return {Object} The cache object instance being used by this client.
 */
Client.prototype.getCache = function () {
  return this._cache; // Return the internal cache object.
};


/**
 * Constructs a full path name for an API endpoint, relative to the client's base URL.
 *
 * This method also supports a shorthand syntax for path names. For example,
 * <tt>'server:ServerStatus'</tt> will be translated to <tt>/server/ServerStatus.xml.aspx</tt>.
 * The method ensures consistent path formatting with leading/trailing slashes.
 *
 * @param  {String} path The relative path or shorthand path to the API endpoint.
 * @return {String}      The fully constructed path name, including the base path if any.
 */
Client.prototype.getPathName = function (path) {
  // Get the base pathname from the URL object, removing leading/trailing slashes.
  var basePath = this.getUrl(true).pathname.replace(/^\/*|\/*$/g, '');

  // Check if the path uses the shorthand syntax (does not start with '/').
  if (path[0] !== '/') {
    // Replace ':' with '/' and append the standard EVE API file extension.
    path = path.replace(':', '/') + '.xml.aspx';
  }

  // Prepend a slash to the basePath if it's not empty, forming a root-relative path.
  if (basePath) {
    basePath = '/' + basePath;
  }

  // Combine the basePath and the processed path, ensuring proper slash handling.
  return basePath + '/' + path.replace(/^\/*|\/*$/g, '');
};


/**
 * Generates a complete URL object for an API request, combining the base URL,
 * the specified path, and any query string parameters (default and specific).
 *
 * @param  {String} path   The API endpoint path (e.g., 'account:Characters').
 * @param  {Object} params Optional object containing query string parameters specific to this request.
 * @return {Object}        A URL object representing the full request URL.
 */
Client.prototype.getRequestUrl = function (path, params) {
  // Ensure params is an object, even if not provided.
  params = params || {};

  var hasParams = false; // Flag to track if any parameters exist.
  var baseUrl = this.getUrl(true); // Get the base URL as an object.
  var requestUrl = {}; // Object to build the new request URL.
  var defaultParams = this.getParams(); // Retrieve the client's default parameters.

  // Merge default parameters with request-specific parameters.
  // Request-specific parameters take precedence.
  for (var param in defaultParams) {
    if (typeof params[param] === 'undefined') {
      params[param] = defaultParams[param];
    }
  }

  // Check if there are any parameters after merging.
  for (var param in params) {
    hasParams = true; // Set flag if at least one parameter is found.
    break; // No need to check further, we just need to know if it's not empty.
  }

  // Copy all properties from the base URL object to the request URL object.
  for (var key in baseUrl) {
    requestUrl[key] = baseUrl[key];
  }

  // Set the pathname and path properties of the request URL.
  // `getPathName` handles the EVE API specific path formatting.
  requestUrl.pathname = this.getPathName(path);
  requestUrl.path = requestUrl.pathname;

  // If parameters exist, stringify them and append to the URL.
  if (hasParams) {
    requestUrl.search = '?' + querystring.stringify(params); // Format query string.
    requestUrl.path += requestUrl.search; // Append query to the full path.
  }

  return requestUrl; // Return the fully constructed URL object.
};


/**
 * Generates a consistent cache key from a URL object.
 *
 * This method ensures that the query string parameters are sorted alphabetically
 * before forming the URL string. This guarantees that URLs with the same parameters
 * but in a different order will produce the same cache key.
 *
 * @param  {Object} urlObj The URL object from which to generate the cache key.
 * @return {String}        A string representation of the URL, suitable for use as a cache key.
 */
Client.prototype.getCacheKey = function (urlObj) {
  var keys = []; // Array to store sorted query parameter keys.
  var newUrlObj = {}; // A new URL object to build with sorted query.
  var newQuery = {}; // An object to hold the sorted query parameters.
  var oldQuery; // Placeholder for the original parsed query object.

  // Clone the original URL object to avoid modifying it directly.
  for (var key in urlObj) {
    newUrlObj[key] = urlObj[key];
  }

  // If the URL object has a search (query) component.
  if (urlObj.search) {
    // Parse the existing query string (remove leading '?').
    oldQuery = querystring.parse(urlObj.search.substr(1));

    // Collect all keys from the old query.
    for (var key in oldQuery) {
      keys.push(key);
    }

    // Sort the keys alphabetically to ensure consistent order.
    keys.sort().forEach(function (key) {
      newQuery[key] = oldQuery[key]; // Reconstruct the query with sorted keys.
    });

    // Node.js's querystring.stringify guarantees insertion order for object properties.
    // So, if `newQuery` has properties inserted in alphabetical order, stringify will preserve it.
    newUrlObj.search = '?' + querystring.stringify(newQuery);
    // Update the full path to include the newly sorted query string.
    newUrlObj.path = newUrlObj.pathname + newUrlObj.search;
  }

  // Format the modified URL object back into a string for the cache key.
  return url.format(newUrlObj);
};


/**
 * Parses an EVE API response, which can be provided either as an XML string or a readable stream.
 * The parsing is performed using a SAX parser to handle XML events.
 * Upon completion, a callback function is invoked with either an error or the parsed result object.
 *
 * @param  {String|Stream} xml The API response content, either as an XML string or a stream.
 * @param  {Function}      cb  The callback function: `cb(err, result)`. `err` is null on success.
 */
Client.prototype.parse = function (xml, cb) {
  // Initialize SAX parser in strict mode with trimming.
  var parser = sax.createStream(true, {trim: true});
  var result = {}; // Stores the final parsed data.
  var current = result; // Points to the current object being built in the result tree.
  var parents = []; // Stack to keep track of parent elements during parsing.
  var currentTag; // Holds the current tag object from the parser.
  var keys; // Used to store keys for rowset parsing.

  // Handle parsing errors.
  parser.on('error', function (err) {
    cb(err); // Pass the error to the callback.
  });

  // Handle the end of the XML document.
  parser.on('end', function () {
    var err = null; // Initialize error to null.
    var res = undefined; // Initialize result to undefined.

    // Check for EVE API specific error structure.
    if (result && result.eveapi && result.eveapi.error) {
      err = new Error(result.eveapi.error); // Create a new error object.
      err.code = result.eveapi.errorCode; // Attach the EVE API error code.
    } else if (!result || !result.eveapi || !result.eveapi.result) {
      // Handle cases where the basic API response structure is invalid.
      err = new Error('Invalid API response structure.');
    } else {
      // If no error, process the result.
      // Move currentTime and cachedUntil from eveapi to result.
      if (result.eveapi.currentTime) result.eveapi.result.currentTime = result.eveapi.currentTime;
      if (result.eveapi.cachedUntil) result.eveapi.result.cachedUntil = result.eveapi.cachedUntil;
      res = result.eveapi.result; // Extract the actual result data.
    }

    cb(err, res); // Invoke the callback with the final error and result.
  });

  // Handle opening XML tags.
  parser.on('opentag', function (tag) {
    currentTag = tag; // Store the current tag.
    tag.alias = tag.name; // Default alias is the tag name.
    tag.result = current; // Store a reference to the current parsing context.
    parents.push(tag); // Push the tag onto the parents stack.

    // Special handling for 'row' tags within a 'rowset'.
    if (tag.name === 'row') {
      // Construct a unique key for the row based on 'keys' defined in the parent rowset.
      var key = keys.map(function (key) {
        return tag.attributes[key];
      }).join(':');
      current[key] = {}; // Create an object for this row.
      current = current[key]; // Move current context into this new row object.

      // Copy all attributes of the row tag into the current row object.
      for (var attr in tag.attributes) {
        current[attr] = tag.attributes[attr];
      }
    } else {
      // General handling for other tags.
      if (tag.name === 'rowset') {
        // For 'rowset', extract the 'key' attribute to define row identifiers.
        keys = tag.attributes.key.split(',');
        tag.alias = tag.attributes.name; // Use 'name' attribute as alias for rowset.
      } else if (tag.name === 'error') {
        // For 'error' tags, extract the 'code' attribute.
        current.errorCode = tag.attributes.code ? tag.attributes.code : null;
      }

      current[tag.alias] = {}; // Create a new empty object under the alias.
      current = current[tag.alias]; // Move current context into this new object.
    }
  });

  // Handle closing XML tags.
  parser.on('closetag', function (tagName) {
    // Pop the current tag from the stack and restore the previous context.
    current = parents.pop().result;
    var parentTag = parents[parents.length - 1]; // Get the new top of the stack.

    // If the parent tag is a 'rowset', re-evaluate 'keys' for nested rowsets or for safety.
    if (parentTag && parentTag.name === 'rowset') {
      keys = parentTag.attributes.key.split(',');
    }
  });

  // Handle text content within tags.
  parser.on('text', function (text) {
    // Assign the text content to the property named after the tag in the parent's result object.
    parents[parents.length - 1].result[currentTag.name] = text;
  });

  // Determine if the input is a stream or a string.
  if (xml.pipe) {
    xml.pipe(parser); // Pipe the stream directly to the parser.
  } else {
    parser.write(xml); // Write the XML string to the parser.
    parser.end(); // Signal the end of the XML document.
  }
};


/**
 * Sends an HTTP request to the EVE API server and parses the response.
 * This method also incorporates caching logic: it first attempts to read from cache,
 * and if a fresh response is not found, it makes an actual HTTP request.
 * The parsed result is then written back to the cache.
 *
 * @param  {String}   path   The API endpoint path (e.g., 'account:Characters').
 * @param  {Object}   params Query string parameters specific to this request.
 *                           Can be omitted if no parameters are needed.
 * @param  {Function} cb     The callback function: `cb(err, result)`. `err` is null on success.
 */
Client.prototype.fetch = function (path, params, cb) {
  // Handle optional `params` argument.
  if (!cb) {
    cb = params; // If `params` is actually the callback, reassign.
    params = {}; // Set `params` to an empty object.
  }

  // Get the full request URL object.
  var options = this.getRequestUrl(path, params);
  // Generate a cache key for this specific request.
  var cacheKey = this.getCacheKey(options);
  // Get the configured cache object.
  var cache = this.getCache();
  // Store `this` for use in nested callbacks.
  var self = this;

  // Attempt to read the response from cache first.
  cache.read(cacheKey, function (err, value) {
    if (err) return cb(err); // If cache read fails, propagate the error.
    if (typeof value === 'string') return cb(null, JSON.parse(value)); // If cached value found, parse JSON and return it.

    // If not in cache, proceed with making an HTTP request.
    var httpObj = options.protocol === 'https:' ? https : http; // Determine HTTP or HTTPS module.
    var request = httpObj.get(options); // Make the GET request.

    // Set a User-Agent header for the request.
    options.headers = {'User-Agent': 'hamster.js'};

    // Handle request errors (e.g., network issues).
    request.on('error', function (err) {
      cb(err); // Pass the request error to the callback.
    });

    // Handle the HTTP response.
    request.on('response', function (response) {
      // Check for successful HTTP status code.
      if (response.statusCode !== 200) {
        var err = new Error('Unsupported HTTP response: ' + response.statusCode);
        err.response = response; // Attach the response object to the error.
        cb(err); // Propagate the HTTP error.
      } else {
        // Parse the successful response body.
        self.parse(response, function (err, result) {
          if (err) return cb(err); // If parsing fails, propagate the error.

          // Calculate cache duration based on API response's currentTime and cachedUntil.
          var currentTime = Date.parse(result.currentTime);
          var cachedUntil = Date.parse(result.cachedUntil);
          var duration = cachedUntil - currentTime; // Duration in milliseconds.

          // Write the parsed result to the cache.
          cache.write(cacheKey, JSON.stringify(result), duration, function (err) {
            if (err) return cb(err); // If cache write fails, propagate the error.
            cb(null, result); // Finally, return the successful result.
          });
        });
      }
    });
  });
};