// This document presents a revised implementation of a social media client,
// drawing inspiration from a prior version found at
// https://github.com/yssk22/node-twbot/
var toolkit       = require('util'),
    webAddress    = require('url'),
    queryEncoder  = require('querystring'),
    cipher        = require('crypto'),
    webClient     = require('http'),
    EventDispatcher = require('events').EventEmitter,
    AuthService   = require('oauth').OAuth;

// For internal logging purposes
var logger,
    logLevel = parseInt(process.env.APP_DEBUG_FLAG, 16);
if (logLevel & 0x4) {
  logger = function (message) { toolkit.error('[socialConnect/Platform]: ' + message); };
} else {
  logger = function () { };
}

/**
 * OAuth authentication parameters
 */
var AUTH_SETTINGS = {
  ReqTokenEndpoint : 'https://api.twitter.com/oauth/request_token',
  AccTokenEndpoint : 'https://api.twitter.com/oauth/access_token',
  ProtocolVer : '1.0',
  AuthAlgo  : 'HMAC-SHA1'
};

/**
 * Base URLs for the social platform API
 */
var PLATFORM_API_BASE = 'https://api.twitter.com/1',
    STREAM_API_BASE = 'https://userstream.twitter.com/2',
    AUTH_REDIRECT_URL = 'https://twitter.com/oauth/authorize?oauth_token=';

/**
 * Initializes a new SocialPlatformClient instance.
 *
 * @param clientKey {String} OAuth Consumer Key for the application
 * @param clientSecret {String} OAuth Consumer Secret for the application
 * @param configParams {Object} Configuration options for the client
 *
 */
function SocialPlatformClient(clientKey, clientSecret, configParams){
  if( !configParams ) {
    configParams = {};
  }

  if( !(this instanceof SocialPlatformClient) ) { // Ensure constructor is called with 'new'
    return new SocialPlatformClient(clientKey, clientSecret, configParams);
  }

  this._authHandler = new AuthService(
    AUTH_SETTINGS.ReqTokenEndpoint,
    AUTH_SETTINGS.AccTokenEndpoint,
    clientKey,
    clientSecret,
    AUTH_SETTINGS.ProtocolVer,
    null,
    AUTH_SETTINGS.AuthAlgo
    );

  this.accessId = configParams.accessKey;
  this.accessSecretKey = configParams.accessSecret;
  this._reqToken = configParams._token;
  this._reqSecret = configParams._token_secret;
  this._authResults = configParams._results;

  this._apiBaseUri = configParams._apiUrl || PLATFORM_API_BASE;
  this._streamBaseUri = configParams._streamUrl || STREAM_API_BASE;
}

/**
 * Converts a raw error object into a standardized Error instance.
 *
 * @param errorObj {Object} The error object to be processed
 *
 */
function standardizeFault(errorObj){
  if( errorObj instanceof Error ){
    return errorObj;
  }
  else if( errorObj.statusCode ){
    // Handle HTTP 4XX/5XX status errors
    var standardError = new Error(errorObj.statusCode + ': ' + errorObj.data);
    standardError.statusCode = errorObj.statusCode;
    try{
      standardError.data = JSON.parse(errorObj.data);
    }catch(parseError){
      standardError.data = errorObj.data;
    }
    return standardError;
  }
  else{
    // For any other unrecognized error format
    return new Error(errorObj);
  }
}

/**
 * Assembles a complete URI from a resource path and optional query parameters.
 *
 * @param resourcePath {String} The base path for the resource.
 * @param queryParams {Object} (Optional) An object containing key-value query parameters.
 */
function constructUri(resourcePath, queryParams){
  var queryString;
  if( typeof queryParams == 'object' ){
    queryString = queryEncoder.encode(queryParams);
  }
  return queryString ? resourcePath + '?' + queryString : resourcePath;
}


SocialPlatformClient.prototype.fetchRequestToken = function(responseCallback){
  var instanceRef = this;
  this._authHandler.getOAuthRequestToken(function(fault, reqToken, reqTokenSecret, reqResults){
    if(fault){
      if(responseCallback){
        responseCallback(standardizeFault(fault));
      }
    }else{
      instanceRef._reqToken = reqToken;
      instanceRef._reqSecret = reqTokenSecret;
      instanceRef._reqTokenResults = reqResults;
      if(responseCallback){
        responseCallback(null, AUTH_REDIRECT_URL + reqToken);
      }
    }
  });
};


SocialPlatformClient.prototype.obtainAccessToken = function(verificationCode, responseCallback){
  var instanceRef = this;
  this._authHandler.getOAuthAccessToken(
    instanceRef._reqToken, instanceRef._reqSecret, verificationCode,
    function(fault, accKey, accSecret, accResults){
      if(fault){
        if(responseCallback){
          responseCallback(standardizeFault(fault));
        }
      }else{
        instanceRef.accessId = accKey;
        instanceRef.accessSecretKey = accSecret;
        instanceRef._authResults = accResults;
        if(responseCallback){
          responseCallback(null, accKey, accSecret);
        }
      }
    });
};

// -----------------------------------------------------------------------------
// Methods for interacting with status updates (tweets)
// -----------------------------------------------------------------------------
SocialPlatformClient.prototype.displayStatus = function(statusId, queryParams, responseCallback){
  if( typeof queryParams == 'function' ){
    responseCallback = queryParams;
    queryParams = {};
  }
  var resourceIdentifier = '/statuses/' + statusId + '.json';
  return this._executeGet(resourceIdentifier, queryParams, responseCallback);
};

SocialPlatformClient.prototype.postStatus = function(queryParams, responseCallback){
  if( typeof queryParams == 'string' ){
    queryParams = {
      textContent: queryParams
    };
  } else {
    queryParams = {textContent: queryParams.text, replyToId: queryParams.in_reply_to_status_id};
  }
  return this._executePost('/statuses/update.json', queryParams, responseCallback);
};

SocialPlatformClient.prototype.deleteStatus = function(statusId, responseCallback){
  return this._executePost('/statuses/destroy/' + statusId + '.json', {}, responseCallback);
};

SocialPlatformClient.prototype.repostStatus = function(statusId, responseCallback){
  return this._executePost('/statuses/retweet/' + statusId + '.json', {}, responseCallback);
};

SocialPlatformClient.prototype.getReposts = function(statusId, responseCallback){
  return this._executeGet('/statuses/retweets/' + statusId + '.json', {}, responseCallback);
};

// -----------------------------------------------------------------------------
// Functions related to managing friendships (follows)
// -----------------------------------------------------------------------------
SocialPlatformClient.prototype.initiateFriendship = function(queryParams, responseCallback){
  if( typeof queryParams == "string" ){
    queryParams = {
      userId: queryParams
    };
  }
  this._executePost('/friendships/create.json', queryParams, responseCallback);
};

SocialPlatformClient.prototype.terminateFriendship = function(queryParams, responseCallback){
  if( typeof queryParams == "string" ){
    queryParams = {
      userId: queryParams
    };
  }
  this._executePost('/friendships/delete.json', queryParams, responseCallback);
};

SocialPlatformClient.prototype.getFollowerIds = function(queryParams, responseCallback){
  if( typeof queryParams == 'function' ){
    responseCallback = queryParams;
    queryParams = {
      userId: this._authResults.user_id
    };
  }
  var resourceIdentifier = '/followers/ids.json';
  this._executeGet(resourceIdentifier, queryParams, responseCallback);
};

// -----------------------------------------------------------------------------
// Timeline and List Retrieval Methods
// -----------------------------------------------------------------------------
var validTimelineKinds = ['public_timeline', 'home_timeline', 'friends_timeline', 'user_timeline','mentions','retweeted_by_me','retweeted_to_me','retweeted_of_me'];

SocialPlatformClient.prototype.retrieveTimeline = function(queryParams, responseCallback){
  if( typeof queryParams == 'function' ){
    responseCallback = queryParams;
    queryParams = {
      feedType: 'home_timeline'
    };
  }else if( typeof queryParams == 'string' ){
    queryParams = {
      feedType: queryParams
    };
  }else if( typeof queryParams == 'object') {
    queryParams.feedType = queryParams.feedType || 'home_timeline';
  }else {
    throw new TypeError('Input parameters must be a string or an object.');
  }

  if( validTimelineKinds.indexOf(queryParams.feedType) == -1 ){
    throw new Error('The specified timeline type must be one of the following: (' + validTimelineKinds.join(',') + ') but received ' + queryParams.feedType + '.');
  }

  var resourceIdentifier = '/statuses/' + queryParams.feedType + '.json';
  delete(queryParams.feedType);
  this._executeGet(resourceIdentifier, queryParams, responseCallback);
};

SocialPlatformClient.prototype.fetchListUpdates = function(userHandle, listId, queryParams, responseCallback){
  if( typeof(queryParams) == 'function' ){
    responseCallback = queryParams;
    queryParams = {};
  }
  var resourceIdentifier = ['', userHandle, 'lists', listId, 'statuses'].join('/') + '.json';
  this._executeGet(resourceIdentifier, queryParams, responseCallback);
};

// -----------------------------------------------------------------------------
// Account Management Functions
// -----------------------------------------------------------------------------
SocialPlatformClient.prototype.fetchAccountInfo = function(queryParams, responseCallback){
  if( typeof queryParams == 'boolean' ){
    queryParams = {includeDetails: queryParams};
  }else if(typeof queryParams == 'function'){
    responseCallback = queryParams;
    queryParams = {};
  }
  var resourceIdentifier = '/account/verify_credentials.json';
  this._executeGet(resourceIdentifier, queryParams, responseCallback);
};


// -----------------------------------------------------------------------------
// Live Stream Processing Capabilities
// -----------------------------------------------------------------------------
/**
 * Represents a live data stream from the platform.
 */
function LiveFeedProcessor(hostClient, httpRequest){
  this._hostClient = hostClient;
  this._httpRequest = httpRequest;
  this._httpRequest.end();

  // Establish event handlers
  var instanceRef = this;
  function _processIncomingData(jsonString, httpResponse){
    if( jsonString ){
      var parsedObject = undefined;
      try{
        parsedObject = JSON.parse(jsonString);
      }catch(jsonParseError){
        // Silently ignore malformed JSON data from the stream.
      }
      if( parsedObject ){
        logger('onData: ' + toolkit.inspect(parsedObject));
        instanceRef.emit('data', parsedObject);
      }
    }
  }

  instanceRef._httpRequest.on('error', function(fault){
    this.emit('error', fault, undefined);
  });

  instanceRef._httpRequest.on('response', function(httpResponse){
    instanceRef._httpResponse = httpResponse;
    httpResponse.setEncoding('utf8');
    var hasError = httpResponse.statusCode != 200;
    var dataBuffer = '';

    httpResponse.on('data', function(dataChunk){
      if( hasError ){
        dataBuffer += dataChunk;
      }else{
        // A valid data stream has commenced
        if( dataChunk.match(/\n/) ){
          // Newline implies a data record separator.
          var dataChunks = dataChunk.split(/\r?\n/);
          var jsonString = dataBuffer + dataChunks.shift(); // First segment
          _processIncomingData(jsonString, httpResponse);
          if( dataChunks.length > 0 ){
            dataBuffer = dataChunks.pop(); // Last segment might be incomplete, buffer it
          }
          // Process remaining complete segments
          for(var idx=0, length=dataChunks.length; idx<length; idx++){
            _processIncomingData(dataChunks[idx], httpResponse);
          }
        }else{
          dataBuffer += dataChunk;
        }
      }
    });

    httpResponse.on('end', function(){
      if( hasError ){
        var fault = new Error(httpResponse.statusCode + ': ' + dataBuffer);
        fault.statusCode = httpResponse.statusCode;
        try{
          fault.data = JSON.parse(dataBuffer);
        }catch(jsonParseError){
          fault.data = dataBuffer;
        }
        instanceRef.emit('error', fault, httpResponse);
      }else{
        if( dataBuffer ){
          _processIncomingData(dataBuffer);
        }
        instanceRef.emit('end');
      }
    });
  });
}

toolkit.inherits(LiveFeedProcessor, EventDispatcher);

LiveFeedProcessor.prototype.terminate = function(responseCallback){
  // Force the stream connection to close.
  var instanceRef = this;
  if( instanceRef.isStreamActive ){
    console.log('Stream termination requested.');
    instanceRef._httpRequest.connection.destroy();
    if(responseCallback){
      responseCallback();
    }
  }else{
    this._httpRequest.on('response', function(httpResponse){
      instanceRef._httpRequest.connection.destroy();
      if(responseCallback){
        responseCallback();
      }
    });
  }
};

LiveFeedProcessor.prototype.__defineGetter__('associatedClient', function(){
  return this._hostClient;
});


SocialPlatformClient.prototype.startUserFeed = function(queryParams, responseCallback){
  // Consider refactoring for consistency with other methods.
  var requestUri = constructUri([this._streamBaseUri, '/user.json'].join(''), queryParams);
  logger('GET ' + requestUri);
  var streamRequest = this._authHandler.get(requestUri, this.accessId, this.accessSecretKey);
  return new LiveFeedProcessor(this, streamRequest);
};

// -----------------------------------------------------------------------------
// Internal helper methods for the SocialPlatformClient class
// -----------------------------------------------------------------------------

SocialPlatformClient.prototype._executeGet = function(resourcePath, queryParams, responseCallback){
  resourcePath = constructUri(resourcePath, queryParams);
  logger('GET ' + resourcePath);
  var fullUrl = [this._apiBaseUri, resourcePath].join('');
  this._authHandler.get(fullUrl, this.accessId, this.accessSecretKey,
      this._generateResultHandler(responseCallback));
};

SocialPlatformClient.prototype._executePost = function(resourcePath, requestBody, responseCallback){
  logger('POST ' + resourcePath);
  logger('>> ' + toolkit.inspect(requestBody));
  var fullUrl = [this._apiBaseUri, resourcePath].join('');
  this._authHandler.post(fullUrl, this.accessId, this.accessSecretKey,
      requestBody,
      this._generateResultHandler(responseCallback));
};

SocialPlatformClient.prototype._generateResultHandler = function(responseCallback){
  return function(fault, responseData, httpResponse){
    if( fault ){
      return responseCallback && responseCallback(standardizeFault(fault), responseData, httpResponse);
    }else{
      var parsedObject = undefined;
      if( responseData ){
        logger('<< ' + responseData);
        try{
          parsedObject = JSON.parse(responseData);
        }catch(jsonParseError){
          parsedObject = responseData;
          return responseCallback(jsonParseError, responseData, httpResponse);
        }
        return responseCallback && responseCallback(undefined, parsedObject, httpResponse);
      }else{
        return responseCallback && responseCallback(undefined, responseData, httpResponse);
      }
    }
  };
};

module.exports = SocialPlatformClient;