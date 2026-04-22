const srvUtils = require('util');
const endpointParser = require('url');
const queryBuilder = require('querystring');
const dataHasher = require('crypto');
const httpComm = require('http');
const EventDispatcher = require('events').EventEmitter;
const AuthProvider = require('oauth').OAuth;

// Internal logging mechanism
let loggerFn;
const logThreshold = parseInt(process.env.APP_VERBOSE, 16) || 0;
if (logThreshold & 0x8) {
  loggerFn = (msg) => { srvUtils.error(`[SocialClient/DEBUG]: ${msg}`); };
} else {
  loggerFn = () => {};
}

/**
 * Fundamental OAuth configuration settings.
 * These define the standard endpoints and protocols for authentication.
 */
const AUTH_SETTINGS = {
  RequestTokenEP: 'https://api.twitter.com/oauth/request_token',
  AccessGrantEP: 'https://api.twitter.com/oauth/access_token',
  ProtocolVer: '1.0',
  SigningAlgo: 'HMAC-SHA1'
};

/**
 * Core API service URLs for the microblogging platform.
 */
const PRIMARY_API_BASE = 'https://api.twitter.com/1';
const LIVE_DATA_FEED_BASE = 'https://userstream.twitter.com/2';
const AUTH_REDIRECT_BASE = 'https://twitter.com/oauth/authorize?oauth_token=';

/**
 * Microblogging Platform Client
 * Facilitates interaction with the platform's API.
 *
 * @param appKey {String} The application's consumer key (OAuth)
 * @param appSecret {String} The application's consumer secret (OAuth)
 * @param configOpts {Object} Behavioral options for the client instance
 * @returns {MicroblogConnector}
 */
function MicroblogConnector(appKey, appSecret, configOpts){
  const currentConfig = configOpts || {};

  if (!(this instanceof MicroblogConnector)) {
    return new MicroblogConnector(appKey, appSecret, currentConfig);
  }

  if (!appKey || !appSecret) {
    throw new Error('Application key and secret are mandatory for client initialization.');
  }

  this.oauthHandler = new AuthProvider(
    AUTH_SETTINGS.RequestTokenEP,
    AUTH_SETTINGS.AccessGrantEP,
    appKey,
    appSecret,
    AUTH_SETTINGS.ProtocolVer,
    null,
    AUTH_SETTINGS.SigningAlgo
  );

  this.userAccessKey = currentConfig.userAccessKey || null;
  this.userAccessSecret = currentConfig.userAccessSecret || null;
  this.reqToken = currentConfig.reqToken || null;
  this.reqTokenSecret = currentConfig.reqTokenSecret || null;
  this.authResults = currentConfig.authResults || {};

  this.mainApiUrl = currentConfig.mainApiUrl || PRIMARY_API_BASE;
  this.streamApiUrl = currentConfig.streamApiUrl || LIVE_DATA_FEED_BASE;
}

/**
 * Standardizes an incoming error object into a consistent Error instance.
 * This function helps in handling various types of errors returned by the API or OAuth library.
 *
 * @param rawIssue {Object} The original error structure to be processed.
 * @returns {Error} A normalized Error object.
 */
function standardizeIssue(rawIssue){
  if (rawIssue instanceof Error) {
    return rawIssue;
  }

  if (rawIssue && typeof rawIssue.statusCode === 'number') {
    const detailedError = new Error(`${rawIssue.statusCode}: ${rawIssue.data || 'Unknown API Error'}`);
    detailedError.httpStatus = rawIssue.statusCode;
    try {
      detailedError.responseData = JSON.parse(rawIssue.data);
    } catch (parseErr) {
      detailedError.responseData = rawIssue.data;
      loggerFn(`Failed to parse error response data: ${parseErr.message}`);
    }
    return detailedError;
  }

  return new Error(`An unexpected error occurred: ${rawIssue ? JSON.stringify(rawIssue) : 'No error details'}`);
}

/**
 * Constructs a complete URL string with optional query parameters.
 *
 * @param pathSegment {String} The base path for the URL.
 * @param queryParams {Object} (Optional) An object containing key-value pairs for query parameters.
 * @returns {String} The fully formed URL.
 */
function composeResourceUri(pathSegment, queryParams){
  let queryStringPart = '';
  if (queryParams && typeof queryParams === 'object' && Object.keys(queryParams).length > 0) {
    queryStringPart = queryBuilder.stringify(queryParams);
  }
  return queryStringPart ? `${pathSegment}?${queryStringPart}` : pathSegment;
}

/**
 * Attaches a callback function to an OAuth operation's response.
 * This handles error normalization and JSON parsing before invoking the user's callback.
 *
 * @param userCallback {Function} The original callback provided by the user.
 * @returns {Function} A wrapped callback handler.
 */
function createApiCallback(userCallback){
  return (err, responseData, httpResponse) => {
    if (err) {
      return userCallback?.(standardizeIssue(err), responseData, httpResponse);
    } else {
      let parsedObject = undefined;
      if (responseData) {
        loggerFn(`Received data: ${responseData.substring(0, 200)}...`);
        try {
          parsedObject = JSON.parse(responseData);
        } catch (jsonParseErr) {
          loggerFn(`JSON parsing failed: ${jsonParseErr.message}`);
          return userCallback?.(standardizeIssue(jsonParseErr), responseData, httpResponse);
        }
        return userCallback?.(null, parsedObject, httpResponse);
      } else {
        return userCallback?.(null, null, httpResponse);
      }
    }
  };
}

MicroblogConnector.prototype.fetchRequestToken = function(callbackFunction){
  const instanceRef = this;
  this.oauthHandler.getOAuthRequestToken(function(err, tokenValue, tokenSecretValue, interimResults){
    if (err) {
      return callbackFunction?.(standardizeIssue(err));
    } else {
      instanceRef.reqToken = tokenValue;
      instanceRef.reqTokenSecret = tokenSecretValue;
      instanceRef.authResults.interim = interimResults;
      const authorizationUrl = AUTH_REDIRECT_BASE + tokenValue;
      return callbackFunction?.(null, authorizationUrl);
    }
  });
};

MicroblogConnector.prototype.obtainAccessToken = function(verificationCode, completionCallback){
  const clientContext = this;
  if (!clientContext.reqToken || !clientContext.reqTokenSecret) {
    return completionCallback?.(new Error('Request token not available. Please call fetchRequestToken first.'));
  }

  this.oauthHandler.getOAuthAccessToken(
    clientContext.reqToken,
    clientContext.reqTokenSecret,
    verificationCode,
    function(authErr, finalKey, finalSecret, finalResults){
      if (authErr) {
        return completionCallback?.(standardizeIssue(authErr));
      } else {
        clientContext.userAccessKey = finalKey;
        clientContext.userAccessSecret = finalSecret;
        clientContext.authResults.final = finalResults;
        return completionCallback?.(null, finalKey, finalSecret);
      }
    });
};

// -----------------------------------------------------------------------------
// Content Interaction Endpoints (e.g., Tweets)
// -----------------------------------------------------------------------------

MicroblogConnector.prototype.retrieveContentById = function(contentId, queryOptions, responseHandler){
  let actualCallback = responseHandler;
  let actualParams = queryOptions;

  if (typeof queryOptions === 'function') {
    actualCallback = queryOptions;
    actualParams = {};
  }

  const endpointPath = `/statuses/${contentId}.json`;
  return this._invokeGetRequest(endpointPath, actualParams, actualCallback);
};

MicroblogConnector.prototype.publishUpdate = function(updatePayload, completionCallback){
  let postData = {};

  if (typeof updatePayload === 'string') {
    postData.status = updatePayload;
  } else if (typeof updatePayload === 'object' && updatePayload !== null) {
    postData.status = updatePayload.text || updatePayload.message;
    if (updatePayload.inReplyToId) {
      postData.in_reply_to_status_id = updatePayload.inReplyToId;
    }
    if (updatePayload.mediaIds) {
        postData.media_ids = updatePayload.mediaIds.join(',');
    }
  } else {
      return completionCallback?.(new TypeError('Update payload must be a string or an object.'));
  }

  if (!postData.status) {
      return completionCallback?.(new Error('Cannot publish an empty status update.'));
  }

  return this._invokePostRequest('/statuses/update.json', postData, completionCallback);
};

MicroblogConnector.prototype.removeContent = function(contentIdentifier, finalCallback){
  const deletePath = `/statuses/destroy/${contentIdentifier}.json`;
  return this._invokePostRequest(deletePath, {}, finalCallback);
};

MicroblogConnector.prototype.repostContent = function(originalContentId, resultCallback){
  const repostPath = `/statuses/retweet/${originalContentId}.json`;
  return this._invokePostRequest(repostPath, {}, resultCallback);
};

MicroblogConnector.prototype.listReposts = function(contentRefId, options, handler){
    let finalHandler = handler;
    let requestOptions = options;
    if (typeof options === 'function') {
        finalHandler = options;
        requestOptions = {};
    }
  const fetchPath = `/statuses/retweets/${contentRefId}.json`;
  return this._invokeGetRequest(fetchPath, requestOptions, finalHandler);
};


// -----------------------------------------------------------------------------
// Connection Management Endpoints (e.g., Friendships)
// -----------------------------------------------------------------------------

MicroblogConnector.prototype.establishConnection = function(targetUser, responseCallback){
  let postBody = {};
  if (typeof targetUser === "string") {
    postBody.user_id = targetUser;
  } else if (typeof targetUser === 'object' && targetUser !== null && targetUser.userId) {
    postBody.user_id = targetUser.userId;
  } else {
    return responseCallback?.(new TypeError('Target user must be a user ID string or an object with userId.'));
  }
  this._invokePostRequest('/friendships/create.json', postBody, responseCallback);
};

MicroblogConnector.prototype.terminateConnection = function(targetUser, responseCallback){
  let deleteBody = {};
  if (typeof targetUser === "string") {
    deleteBody.user_id = targetUser;
  } else if (typeof targetUser === 'object' && targetUser !== null && targetUser.userId) {
    deleteBody.user_id = targetUser.userId;
  } else {
    return responseCallback?.(new TypeError('Target user must be a user ID string or an object with userId.'));
  }
  this._invokePostRequest('/friendships/delete.json', deleteBody, responseCallback);
};

MicroblogConnector.prototype.getFollowerIds = function(optionsOrCb, completionHandler){
  let finalCallback = completionHandler;
  let requestOptions = optionsOrCb;

  if (typeof optionsOrCb === 'function') {
    finalCallback = optionsOrCb;
    requestOptions = {};
  }

  if (!requestOptions.user_id && this.authResults && this.authResults.final && this.authResults.final.user_id) {
    requestOptions.user_id = this.authResults.final.user_id;
  }

  const resourcePath = '/followers/ids.json';
  this._invokeGetRequest(resourcePath, requestOptions, finalCallback);
};

// -----------------------------------------------------------------------------
// Content Retrieval Endpoints (e.g., Timelines)
// -----------------------------------------------------------------------------

const validTimelineTypes = [
  'public_timeline', 'home_timeline', 'friends_timeline', 'user_timeline',
  'mentions', 'retweeted_by_me', 'retweeted_to_me', 'retweeted_of_me', 'list_timeline'
];

MicroblogConnector.prototype.fetchTimeline = function(paramsInput, resultCallback){
  let requestParams = {};
  let actualCallback = resultCallback;

  if (typeof paramsInput === 'function') {
    actualCallback = paramsInput;
    requestParams.type = 'home_timeline';
  } else if (typeof paramsInput === 'string') {
    requestParams.type = paramsInput;
  } else if (typeof paramsInput === 'object' && paramsInput !== null) {
    Object.assign(requestParams, paramsInput);
    requestParams.type = requestParams.type || 'home_timeline';
  } else {
    return actualCallback?.(new TypeError('Parameters must be a string, an object, or omitted.'));
  }

  if (!validTimelineTypes.includes(requestParams.type)) {
    const errorMessage = `Invalid timeline type: '${requestParams.type}'. Must be one of: (${validTimelineTypes.join(', ')}).`;
    return actualCallback?.(new Error(errorMessage));
  }

  const apiPath = `/statuses/${requestParams.type}.json`;
  delete requestParams.type;

  this._invokeGetRequest(apiPath, requestParams, actualCallback);
};

MicroblogConnector.prototype.retrieveListItems = function(ownerHandle, listId, listOptions, callbackHandler){
  let finalHandler = callbackHandler;
  let currentOptions = listOptions;

  if (typeof listOptions === 'function') {
    finalHandler = listOptions;
    currentOptions = {};
  }

  if (!ownerHandle || !listId) {
      return finalHandler?.(new Error('Both list owner handle and list ID are required.'));
  }

  const listPath = `/${ownerHandle}/lists/${listId}/statuses.json`;
  this._invokeGetRequest(listPath, currentOptions, finalHandler);
};

// -----------------------------------------------------------------------------
// User Account Endpoints
// -----------------------------------------------------------------------------

MicroblogConnector.prototype.getAccountInfo = function(configParam, resultHandler){
  let finalHandler = resultHandler;
  let queryConfig = {};

  if (typeof configParam === 'boolean') {
    queryConfig.include_entities = configParam;
  } else if (typeof configParam === 'function') {
    finalHandler = configParam;
  } else if (typeof configParam === 'object' && configParam !== null) {
      Object.assign(queryConfig, configParam);
  }

  const infoPath = '/account/verify_credentials.json';
  this._invokeGetRequest(infoPath, queryConfig, finalHandler);
};


// -----------------------------------------------------------------------------
// Live Streaming Data Support
// -----------------------------------------------------------------------------

/**
 * Handles continuous data streams from the platform.
 */
function ActivityFeedHandler(clientInstance, httpRequest){
  this.sourceClient = clientInstance;
  this.activeRequest = httpRequest;
  this.activeRequest.end();

  const streamContext = this;

  const processStreamChunk = (jsonString, httpResponse) => {
    if (!jsonString || jsonString.trim().length === 0) {
      loggerFn('Received empty or whitespace-only stream chunk.');
      return;
    }

    let parsedData = null;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (e) {
      loggerFn(`Stream data JSON parse error: ${e.message} for chunk: ${jsonString.substring(0, 100)}...`);
      return;
    }

    if (parsedData) {
      loggerFn(`Emitting data: ${srvUtils.inspect(parsedData).substring(0, 200)}...`);
      streamContext.emit('data', parsedData);
    }
  };

  this.activeRequest.on('error', (requestError) => {
    streamContext.emit('error', requestError, undefined);
  });

  this.activeRequest.on('response', (serverResponse) => {
    streamContext.currentResponse = serverResponse;
    serverResponse.setEncoding('utf8');

    const isHttpError = serverResponse.statusCode !== 200;
    let dataBuffer = '';

    serverResponse.on('data', (incomingChunk) => {
      if (isHttpError) {
        dataBuffer += incomingChunk;
      } else {
        const lines = incomingChunk.split(/\r?\n/);
        const firstLine = dataBuffer + lines.shift();
        if (firstLine.trim().length > 0) {
            processStreamChunk(firstLine, serverResponse);
        }

        for (let i = 0; i < lines.length - 1; i++) {
            if (lines[i].trim().length > 0) {
                processStreamChunk(lines[i], serverResponse);
            }
        }

        dataBuffer = lines[lines.length - 1] || '';
      }
    });

    serverResponse.on('end', () => {
      if (isHttpError) {
        const streamError = new Error(`${serverResponse.statusCode}: ${dataBuffer || 'No error details provided.'}`);
        streamError.httpStatus = serverResponse.statusCode;
        try {
          streamError.responseData = JSON.parse(dataBuffer);
        } catch (e) {
          streamError.responseData = dataBuffer;
          loggerFn(`Failed to parse error stream data: ${e.message}`);
        }
        streamContext.emit('error', streamError, serverResponse);
      } else {
        if (dataBuffer.trim().length > 0) {
          processStreamChunk(dataBuffer);
        }
        streamContext.emit('end');
      }
    });
  });
}
srvUtils.inherits(ActivityFeedHandler, EventDispatcher);

ActivityFeedHandler.prototype.terminateStream = function(completionCb){
  const streamRef = this;
  if (streamRef.streamActive) {
    loggerFn('Terminating active stream connection.');
    streamRef.activeRequest.connection.destroy();
    streamRef.streamActive = false;
    if (completionCb) { completionCb(); }
  } else {
    this.activeRequest.on('response', () => {
      loggerFn('Stream response received, then immediately destroying connection.');
      streamRef.activeRequest.connection.destroy();
      streamRef.streamActive = false;
      if (completionCb) { completionCb(); }
    });
  }
};

Object.defineProperty(ActivityFeedHandler.prototype, 'associatedClient', {
  get: function() {
    return this.sourceClient;
  },
  enumerable: true,
  configurable: true
});

MicroblogConnector.prototype.initiateUserStream = function(streamParams, streamHandlerCallback){
  const actualParams = streamParams || {};

  const streamUri = composeResourceUri([this.streamApiUrl, '/user.json'].join(''), actualParams);
  loggerFn(`Initiating GET stream: ${streamUri}`);

  const streamHttpRequest = this.oauthHandler.get(streamUri, this.userAccessKey, this.userAccessSecret);

  const newStreamInstance = new ActivityFeedHandler(this, streamHttpRequest);

  if (streamHandlerCallback && typeof streamHandlerCallback === 'function') {
      streamHandlerCallback(null, newStreamInstance);
  }

  return newStreamInstance;
};

// -----------------------------------------------------------------------------
// Internal API Communication Methods
// -----------------------------------------------------------------------------

MicroblogConnector.prototype._invokeGetRequest = function(resourcePath, queryData, responseCallback){
  const fullPath = composeResourceUri(resourcePath, queryData);
  loggerFn(`Executing GET: ${fullPath}`);
  const targetUrl = [this.mainApiUrl, fullPath].join('');

  this.oauthHandler.get(targetUrl, this.userAccessKey, this.userAccessSecret,
      createApiCallback(responseCallback));
};

MicroblogConnector.prototype._invokePostRequest = function(resourcePath, postBody, responseCallback){
  loggerFn(`Executing POST: ${resourcePath}`);
  loggerFn(`Payload: ${srvUtils.inspect(postBody).substring(0, 200)}...`);

  const targetUrl = [this.mainApiUrl, resourcePath].join('');

  this.oauthHandler.post(targetUrl, this.userAccessKey, this.userAccessSecret,
      postBody,
      createApiCallback(responseCallback));
};

module.exports = MicroblogConnector;