const uriParser = require('url');
const secureTransporter = require('https');
const insecureTransporter = require('http');
const querySerializer = require('querystring');
const xmlStreamParser = require('sax');

// Internal caching mechanism.
const VolatileStorage = require('./cache/memory-store');

// Expose the primary API interface class.
module.exports = ApiConnector;

// Default base URL for the EVE Online API service.
const DEFAULT_API_ENDPOINT = 'https://api.eveonline.com';

// A simple custom error class for API response parsing issues.
class ApiParseError extends Error {
  constructor(message, code = null) {
    super(message);
    this.name = 'ApiParseError';
    this.errorCode = code;
  }
}

// Helper function to normalize path segments by removing leading/trailing slashes.
const normalizePathSegment = (segment) => (segment || '').replace(/^\/+|\/+$/g, '');

// Helper function to calculate cache duration from API response timestamps.
const calculateCacheDuration = (apiResult) => {
  if (!apiResult || !apiResult.currentTime || !apiResult.cachedUntil) {
    return 0; // No caching if timestamps are missing or invalid.
  }
  const currentTimestamp = Date.parse(apiResult.currentTime);
  const cachedUntilTimestamp = Date.parse(apiResult.cachedUntil);
  const durationMs = cachedUntilTimestamp - currentTimestamp;
  return Math.max(0, durationMs); // Ensure duration is non-negative.
};

/**
 * Initializes a new instance of the EVE API data retrieval client.
 * This connector manages API endpoint configuration, request parameters,
 * caching, and XML response parsing.
 *
 * @class ApiConnector
 * @param {object} [config={}] Configuration settings for the connector.
 * @param {string} [config.baseUrl] The root URL of the EVE API server.
 * @param {object} [config.parameters] Default query parameters to include in requests.
 * @param {object} [config.dataStore] A caching object to manage API response persistence.
 * @constructor
 */
function ApiConnector(config = {}) {
  // Ensure configuration is an object, even if null/undefined is passed.
  if (typeof config !== 'object' || config === null) {
    config = {};
  }

  // Internal state for managing client configuration.
  this._requestParameters = {}; // Stores default query parameters.
  this._serviceEndpoint = null; // Parsed URL object of the API endpoint.
  this._responseCache = null;   // Reference to the cache implementation.

  // Apply initial settings.
  this.setServiceUrl(config.baseUrl || DEFAULT_API_ENDPOINT);
  this.configureRequestParameters(config.parameters || {});
  this.assignCacheProvider(config.dataStore || new VolatileStorage());

  // Optional: Add a simple validation for base URL format post-initialization.
  if (!this._serviceEndpoint || !this._serviceEndpoint.protocol || !this._serviceEndpoint.hostname) {
      console.warn("ApiConnector initialized with an invalid or incomplete base URL, requests may fail.");
  }
}

/**
 * Updates the base service endpoint for API requests.
 * @param {string} endpointString The new base URL string.
 * @throws {Error} If an invalid endpoint URL is provided.
 */
ApiConnector.prototype.setServiceUrl = function (endpointString) {
  if (typeof endpointString !== 'string' || !endpointString.trim()) {
    throw new Error('Invalid endpoint URL provided. Must be a non-empty string.');
  }
  this._serviceEndpoint = uriParser.parse(endpointString.trim());
};

/**
 * Fetches the currently configured service endpoint.
 * @param {boolean} [asParsedObject=false] If true, returns the parsed URL object; otherwise, returns a formatted string.
 * @returns {string|object} The service endpoint URL.
 */
ApiConnector.prototype.retrieveServiceUrl = function (asParsedObject = false) {
  if (!this._serviceEndpoint) {
    return asParsedObject ? {} : ''; // Return empty object/string if not set.
  }
  return asParsedObject ? this._serviceEndpoint : uriParser.format(this._serviceEndpoint);
};

/**
 * Sets a single default query parameter for all subsequent requests.
 * @param {string} paramKey The name of the parameter.
 * @param {string|number|boolean} paramValue The value of the parameter.
 */
ApiConnector.prototype.setDefaultQueryParam = function (paramKey, paramValue) {
  if (typeof paramKey !== 'string' || !paramKey.trim()) {
    console.warn('Attempted to set a default query parameter with an invalid key:', paramKey);
    return;
  }
  this._requestParameters[paramKey.trim()] = String(paramValue); // Ensure value is string.
};

/**
 * Configures multiple default query parameters from an object.
 * Existing parameters will be overwritten if keys match.
 * @param {object} parameterMap An object mapping parameter names to values.
 */
ApiConnector.prototype.configureRequestParameters = function (parameterMap) {
  if (typeof parameterMap !== 'object' || parameterMap === null) {
    console.warn('Attempted to configure request parameters with a non-object value; ignoring.');
    return;
  }
  // Use Object.assign to merge new parameters, overwriting existing ones.
  Object.assign(this._requestParameters, parameterMap);
};

/**
 * Retrieves the value of a specific default query parameter.
 * @param {string} paramKey The name of the parameter to retrieve.
 * @returns {string|undefined} The parameter's value, or undefined if not set.
 */
ApiConnector.prototype.getDefaultQueryParam = function (paramKey) {
  return this._requestParameters[paramKey];
};

/**
 * Returns a shallow copy of all currently configured default query parameters.
 * @returns {object} An object containing all default query parameters.
 */
ApiConnector.prototype.getAllDefaultQueryParams = function () {
  return { ...this._requestParameters }; // Return a clone to prevent external modification.
};

/**
 * Clears all currently set default query parameters, resetting the parameter list.
 */
ApiConnector.prototype.resetQueryParams = function () {
  this._requestParameters = {}; // Reassigning is more efficient than deleting one by one.
};

/**
 * Assigns a cache provider to this client. The provider must implement
 * `read(key, callback)` and `write(key, value, duration, callback)` methods.
 * @param {object} cacheProvider The object responsible for caching API responses.
 * @throws {Error} If the provided cache provider does not implement required methods.
 */
ApiConnector.prototype.assignCacheProvider = function (cacheProvider) {
  if (!cacheProvider || typeof cacheProvider.read !== 'function' || typeof cacheProvider.write !== 'function') {
    throw new Error('Provided cache provider does not implement required `read` and `write` methods.');
  }
  this._responseCache = cacheProvider;
};

/**
 * Retrieves the currently assigned cache provider.
 * @returns {object} The cache provider object.
 */
ApiConnector.prototype.retrieveCacheProvider = function () {
  return this._responseCache;
};

/**
 * Constructs the full API path from a relative segment, applying EVE API conventions.
 * Supports shorthand like 'category:Action' which translates to '/category/Action.xml.aspx'.
 * @param {string} relativeSegment The relative path or shorthand string.
 * @returns {string} The fully qualified API path name.
 * @throws {Error} If an invalid path segment is provided.
 */
ApiConnector.prototype.resolveApiPath = function (relativeSegment) {
  if (typeof relativeSegment !== 'string' || !relativeSegment.trim()) {
    throw new Error('Invalid path segment provided for API path resolution.');
  }

  const currentBaseUrlPath = normalizePathSegment(this.retrieveServiceUrl(true).pathname);
  let processedSegment = normalizePathSegment(relativeSegment);

  // Apply shorthand convention: 'category:Action' -> 'category/Action.xml.aspx'
  if (!processedSegment.startsWith('/') && processedSegment.includes(':')) {
    processedSegment = processedSegment.replace(':', '/') + '.xml.aspx';
  } else if (!processedSegment.endsWith('.xml.aspx') && !processedSegment.endsWith('.aspx') && !processedSegment.endsWith('.xml')) {
    // Ensure paths end with a common API extension if not already present.
    processedSegment += '.xml.aspx';
  }

  // Combine base path and segment, ensuring correct slashes.
  const finalPath = currentBaseUrlPath ? `/${currentBaseUrlPath}/${processedSegment}` : `/${processedSegment}`;

  return finalPath.replace(/\/\/+/g, '/'); // Remove any double slashes.
};

/**
 * Generates a complete request URL object for a given API resource and parameters.
 * Merges default parameters with any custom parameters provided.
 * @param {string} resourcePath The relative API path (e.g., 'character:Sheet').
 * @param {object} [customQueryParams={}] Additional query parameters specific to this request.
 * @returns {object} A parsed URL object suitable for an HTTP request.
 * @throws {Error} If the API resource path is invalid.
 */
ApiConnector.prototype.composeRequestUri = function (resourcePath, customQueryParams = {}) {
  if (typeof resourcePath !== 'string' || !resourcePath.trim()) {
    throw new Error('API resource path must be a non-empty string.');
  }
  if (typeof customQueryParams !== 'object' || customQueryParams === null) {
    console.warn('Provided custom query parameters are not an object; ignoring and using empty object.');
    customQueryParams = {};
  }

  const baseEndpointDetails = this.retrieveServiceUrl(true);
  // Create a new object to avoid modifying the original base URL object.
  const composedUri = { ...baseEndpointDetails };

  // Merge default parameters with custom parameters, custom ones take precedence.
  const effectiveQueryParams = { ...this.getAllDefaultQueryParams(), ...customQueryParams };

  composedUri.pathname = this.resolveApiPath(resourcePath);
  composedUri.path = composedUri.pathname; // Initialize path with pathname.

  const paramKeys = Object.keys(effectiveQueryParams);
  if (paramKeys.length > 0) {
    composedUri.search = '?' + querySerializer.stringify(effectiveQueryParams);
    composedUri.path += composedUri.search;
  }

  // Ensure 'host' is present if 'hostname' is, especially important for Node.js http.request.
  if (composedUri.hostname && !composedUri.host) {
      composedUri.host = composedUri.hostname + (composedUri.port ? `:${composedUri.port}` : '');
  }

  return composedUri;
};

/**
 * Creates a consistent cache key (identifier) for a given URL object.
 * This ensures that URLs with the same parameters, but in a different order,
 * map to the same cache entry by sorting query parameters alphabetically.
 * @param {object} uriDetails A parsed URL object (e.g., from `uriParser.parse`).
 * @returns {string} A unique string representing the resource for caching.
 * @throws {Error} If an invalid URI details object is provided.
 */
ApiConnector.prototype.generateCacheIdentifier = function (uriDetails) {
  if (typeof uriDetails !== 'object' || uriDetails === null) {
    throw new Error('Invalid URI details object provided for cache key generation.');
  }

  // Create a mutable copy of the URI object.
  const normalizedUri = { ...uriDetails };

  if (normalizedUri.search) {
    const rawQuery = normalizedUri.search.substring(1); // Remove leading '?'
    const parsedQuery = querySerializer.parse(rawQuery);

    // Sort query parameters by key for consistent cache keys.
    const sortedParamKeys = Object.keys(parsedQuery).sort();
    const sortedQuery = {};
    for (const key of sortedParamKeys) {
      sortedQuery[key] = parsedQuery[key];
    }

    normalizedUri.search = '?' + querySerializer.stringify(sortedQuery);
    normalizedUri.path = normalizedUri.pathname + normalizedUri.search;
  }

  return uriParser.format(normalizedUri);
};

/**
 * Parses an XML response from the EVE API, converting it into a structured JavaScript object.
 * This method handles both XML strings and readable streams. It extracts data
 * and propagates top-level metadata like `currentTime` and `cachedUntil`.
 * @param {string|ReadableStream} xmlSource The XML content to parse.
 * @param {function(Error|null, object|null): void} completionCallback Callback (error, result).
 */
ApiConnector.prototype.processApiResponseXml = function (xmlSource, completionCallback) {
  if (!xmlSource) {
    return completionCallback(new ApiParseError('No XML source provided for parsing.'));
  }

  const xmlParser = xmlStreamParser.createStream(true, { trim: true, normalize: true });
  let finalParsedOutput = {}; // The root object being built.
  let activeDataNode = finalParsedOutput; // Points to the object currently being populated.
  const nodeStack = []; // Stack of parent nodes: { node: ..., rowsetKeys: ... }.
  let lastOpenedTag = null; // The XML tag object for the most recently opened element.
  let currentRowsetKeys = null; // Stores `key` attributes for the active <rowset>.

  xmlParser.on('error', (parseErr) => {
    xmlParser.removeAllListeners(); // Prevent further events to avoid multiple callbacks.
    completionCallback(new ApiParseError(`XML stream processing error: ${parseErr.message}`));
  });

  xmlParser.on('end', () => {
    let responseError = null;
    let extractedResult = null;

    const apiWrapper = finalParsedOutput.eveapi;
    if (!apiWrapper || typeof apiWrapper !== 'object') {
      responseError = new ApiParseError('Missing or malformed <eveapi> root element in response.');
    } else if (apiWrapper.error) {
      responseError = new ApiParseError(apiWrapper.error.message || 'An API error occurred.', apiWrapper.error.code);
    } else if (!apiWrapper.result) {
      responseError = new ApiParseError('API response is missing the <result> section.');
    } else {
      extractedResult = apiWrapper.result;
      // Propagate top-level meta-info to the result object.
      if (apiWrapper.currentTime) extractedResult.currentTime = apiWrapper.currentTime;
      if (apiWrapper.cachedUntil) extractedResult.cachedUntil = apiWrapper.cachedUntil;
    }
    completionCallback(responseError, extractedResult);
  });

  xmlParser.on('opentag', (xmlTag) => {
    lastOpenedTag = xmlTag; // Keep reference to the current tag.
    xmlTag.alias = xmlTag.name; // Store a mutable alias, can be changed for rowsets.

    // Store the current `activeDataNode` and `currentRowsetKeys` before descending.
    nodeStack.push({ node: activeDataNode, rowsetKeys: currentRowsetKeys, xmlTag: xmlTag });

    if (xmlTag.name === 'row') {
      let rowObject = {};
      if (currentRowsetKeys && currentRowsetKeys.length > 0) {
        // Generate a composite key for the row based on configured rowset keys.
        const rowIdentifier = currentRowsetKeys.map(key => xmlTag.attributes[key] || '').join(':');
        activeDataNode[rowIdentifier] = rowObject; // Assign row to the parent (rowset) object.
      } else {
        // If no rowset keys, or not under a rowset, append as a generic 'row' object.
        // This scenario might lead to overwriting if multiple rows exist without keys.
        if (Array.isArray(activeDataNode)) {
            activeDataNode.push(rowObject);
        } else {
            // Default to an object if parent is not an array.
            activeDataNode[xmlTag.alias] = rowObject;
        }
      }

      // Add all XML attributes of the row as properties to the row object.
      for (const attrName in xmlTag.attributes) {
        rowObject[attrName] = xmlTag.attributes[attrName];
      }
      activeDataNode = rowObject; // Descend into the new row object.
    } else {
      // For non-'row' elements:
      if (xmlTag.name === 'rowset') {
        xmlTag.alias = xmlTag.attributes.name || 'rowset'; // Use 'name' attribute as property name.
        currentRowsetKeys = (xmlTag.attributes.key || '').split(',').map(k => k.trim()).filter(k => k);
      } else if (xmlTag.name === 'error') {
        // For an error tag, create an object to hold message and code.
        activeDataNode[xmlTag.alias] = { message: '', code: xmlTag.attributes.code || null };
        activeDataNode = activeDataNode[xmlTag.alias]; // Descend into the error object.
        return; // Skip default object creation below for error tag.
      }

      // Create a new property on the active node and descend into it.
      activeDataNode[xmlTag.alias] = {};
      activeDataNode = activeDataNode[xmlTag.alias];
    }
  });

  xmlParser.on('closetag', (closedTagName) => {
    const previousState = nodeStack.pop();
    activeDataNode = previousState.node; // Restore previous active node.
    currentRowsetKeys = previousState.rowsetKeys; // Restore previous rowset keys context.
    lastOpenedTag = nodeStack.length > 0 ? nodeStack[nodeStack.length - 1].xmlTag : null; // Update last opened tag.
  });

  xmlParser.on('text', (elementText) => {
    const trimmedText = elementText.trim();
    if (lastOpenedTag && trimmedText.length > 0) {
      // The `text` event reports text for the element that was *just opened*.
      // The `activeDataNode` has already descended into that element.
      // We need to assign the text to the *parent's property* that represents the current element.
      const parentState = nodeStack[nodeStack.length - 1]; // Get the state of the parent.
      if (parentState && parentState.node) {
        const parentNode = parentState.node;
        const currentElementAlias = lastOpenedTag.alias;

        // If the current element is an error message, assign text to its 'message' property.
        if (lastOpenedTag.name === 'error' && typeof parentNode[currentElementAlias] === 'object' && parentNode[currentElementAlias] !== null) {
            parentNode[currentElementAlias].message = trimmedText;
        } else if (typeof parentNode[currentElementAlias] === 'object' && Object.keys(parentNode[currentElementAlias]).length === 0) {
            // If it's an empty object (meaning no attributes or children), replace it with text.
            parentNode[currentElementAlias] = trimmedText;
        } else {
            // If it's an object with attributes/children, text is often ignored or appended
            // depending on desired behavior. Original API client overwrites the object.
            parentNode[currentElementAlias] = trimmedText;
        }
      }
    }
  });

  // Decide whether to pipe a stream or write a string directly.
  if (typeof xmlSource.pipe === 'function') {
    xmlSource.pipe(xmlParser);
  } else {
    xmlParser.write(xmlSource);
    xmlParser.end();
  }
};

/**
 * Executes an HTTP request to the EVE API, handles caching, and parses the XML response.
 * This is the primary method for interacting with the API.
 * @param {string} apiResource The API path to request (e.g., 'Char:CharacterSheet').
 * @param {object} [requestParams={}] Query parameters specific to this request.
 * @param {function(Error|null, object|null): void} completionHandler Callback (error, result).
 * @throws {Error} If a completion handler function is not provided.
 */
ApiConnector.prototype.retrieveApiData = function (apiResource, requestParams, completionHandler) {
  // Argument shifting for optional requestParams.
  if (typeof requestParams === 'function' && !completionHandler) {
    completionHandler = requestParams;
    requestParams = {};
  }
  requestParams = requestParams || {}; // Ensure it's an object.

  if (typeof completionHandler !== 'function') {
    throw new Error('A completion handler function is required for retrieveApiData.');
  }

  const requestConfiguration = this.composeRequestUri(apiResource, requestParams);
  const resourceIdentifier = this.generateCacheIdentifier(requestConfiguration);
  const dataStore = this.retrieveCacheProvider();
  const connectorInstance = this; // Capture 'this' for use in callbacks.

  // Attempt to retrieve from cache first.
  dataStore.read(resourceIdentifier, (cacheErr, cachedValue) => {
    if (cacheErr) {
      console.error(`Cache read error for ${resourceIdentifier}:`, cacheErr.message);
      // Log the cache error but continue to fetch live data if cache fails.
    }

    if (typeof cachedValue === 'string' && cachedValue.length > 0) {
      try {
        const parsedCachedResult = JSON.parse(cachedValue);
        // Add an extra check to ensure cached data is still valid, though cache.read should handle expiry.
        const now = Date.now();
        if (parsedCachedResult.cachedUntil && Date.parse(parsedCachedResult.cachedUntil) > now) {
            return completionHandler(null, parsedCachedResult); // Serve from cache.
        } else {
            console.log(`Cached item for ${resourceIdentifier} expired, fetching new data.`);
        }
      } catch (jsonParseError) {
        console.error(`Failed to parse cached JSON for ${resourceIdentifier}:`, jsonParseError.message);
        // Fall through to live request if cached data is malformed.
      }
    }

    // Determine protocol handler (HTTP or HTTPS).
    const protocolHandler = requestConfiguration.protocol === 'https:' ? secureTransporter : insecureTransporter;

    // Set default User-Agent header and explicitly request XML.
    requestConfiguration.headers = {
      'User-Agent': 'EVE-API-Connector.js/1.1',
      'Accept': 'application/xml, text/xml', // Explicitly request XML.
      ...requestConfiguration.headers // Allow custom headers to override.
    };

    const apiRequest = protocolHandler.get(requestConfiguration, (apiResponse) => {
      const { statusCode, statusMessage, headers } = apiResponse;

      if (statusCode && (statusCode < 200 || statusCode >= 300)) {
        // Handle non-successful HTTP status codes.
        let errorMessage = `API request failed with HTTP status: ${statusCode}`;
        if (statusMessage) {
            errorMessage += ` - ${statusMessage}`;
        }
        const httpError = new Error(errorMessage);
        httpError.statusCode = statusCode;
        httpError.responseHeaders = headers;
        apiResponse.resume(); // Consume response data to free up memory.
        return completionHandler(httpError);
      }

      // Parse the XML response stream.
      connectorInstance.processApiResponseXml(apiResponse, (parseErr, apiResult) => {
        if (parseErr) {
          return completionHandler(parseErr);
        }

        const cacheDurationMs = calculateCacheDuration(apiResult);

        // Store the result in cache if a valid duration is present.
        if (cacheDurationMs > 0) {
          dataStore.write(resourceIdentifier, JSON.stringify(apiResult), cacheDurationMs, (writeErr) => {
            if (writeErr) {
              console.error(`Cache write error for ${resourceIdentifier}:`, writeErr.message);
              // Do not fail the request if caching fails, just log the issue.
            }
            completionHandler(null, apiResult);
          });
        } else {
          // No caching needed or duration is zero.
          completionHandler(null, apiResult);
        }
      });
    });

    apiRequest.on('error', (networkErr) => {
      completionHandler(new Error(`Network communication error during API request to ${requestConfiguration.host}: ${networkErr.message}`));
    });

    // Add a timeout for the request to prevent hanging indefinitely.
    const REQUEST_TIMEOUT_MS = 15000; // 15 seconds.
    apiRequest.setTimeout(REQUEST_TIMEOUT_MS, () => {
        apiRequest.destroy(new Error(`API request to ${requestConfiguration.host} timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds.`));
    });
  });
};