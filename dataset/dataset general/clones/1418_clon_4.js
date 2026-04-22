const { createHmac, randomBytes } = require('crypto');
const { URL, URLSearchParams } = require('url');
const { parse, stringify } = require('querystring');
const { EventEmitter } = require('events');
const fetch = require('node-fetch');

let systemLog;
const traceLevel = parseInt(process.env.NODE_DEBUG, 16);
if (traceLevel & 0x4) {
  systemLog = (message) => console.error(`[SocialConnector]: ${message}`);
} else {
  systemLog = () => {};
}

const AUTHENTICATION_SETTINGS = Object.freeze({
  REQUEST_TOKEN_ENDPOINT: 'https://api.twitter.com/oauth/request_token',
  ACCESS_TOKEN_ENDPOINT: 'https://api.twitter.com/oauth/access_token',
  PROTOCOL_VERSION: '1.0',
  SIGNATURE_ALGORITHM: 'HMAC-SHA1'
});

const PRIMARY_SERVICE_URL = 'https://api.twitter.com/1';
const LIVE_FEED_SERVICE_URL = 'https://userstream.twitter.com/2';
const USER_AUTHORIZATION_URL = 'https://twitter.com/oauth/authorize?oauth_token=';

class RemoteServiceError extends Error {
  constructor(detailMessage, httpStatus, rawResponseData) {
    super(detailMessage);
    this.name = 'RemoteServiceError';
    this.httpStatusCode = httpStatus;
    try {
      this.responsePayload = JSON.parse(rawResponseData);
    } catch (e) {
      this.responsePayload = rawResponseData;
    }
  }
}

function encodeOAuthComponent(value) {
  if (value === null || value === undefined) return '';
  return encodeURIComponent(value)
    .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function constructOAuthSignatureHeader(requestMethod, targetResourceUrl, requestParameters, userToken, userSecret, clientKey, clientSecret) {
  const temporaryOAuthParams = {
    oauth_consumer_key: clientKey,
    oauth_nonce: randomBytes(16).toString('hex'),
    oauth_signature_method: AUTHENTICATION_SETTINGS.SIGNATURE_ALGORITHM,
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: AUTHENTICATION_SETTINGS.PROTOCOL_VERSION
  };

  if (userToken) {
    temporaryOAuthParams.oauth_token = userToken;
  }

  const combinedParameters = { ...temporaryOAuthParams };

  const parsedUrl = new URL(targetResourceUrl);
  parsedUrl.searchParams.forEach((val, key) => {
    combinedParameters[key] = val;
  });

  for (const key in requestParameters) {
    if (Object.prototype.hasOwnProperty.call(requestParameters, key)) {
      combinedParameters[key] = requestParameters[key];
    }
  }

  const sortedParamKeys = Object.keys(combinedParameters).sort();
  const serializedParameters = sortedParamKeys
    .map(key => `${encodeOAuthComponent(key)}=${encodeOAuthComponent(combinedParameters[key])}`)
    .join('&');

  const signatureBaseString = [
    requestMethod.toUpperCase(),
    encodeOAuthComponent(parsedUrl.origin + parsedUrl.pathname),
    encodeOAuthComponent(serializedParameters)
  ].join('&');

  const signingCredential = `${encodeOAuthComponent(clientSecret)}&${encodeOAuthComponent(userSecret || '')}`;
  const hmacGenerator = createHmac('sha1', signingCredential);
  hmacGenerator.update(signatureBaseString);
  temporaryOAuthParams.oauth_signature = hmacGenerator.digest('base64');

  const headerComponents = Object.keys(temporaryOAuthParams)
    .sort()
    .map(key => `${encodeOAuthComponent(key)}="${encodeOAuthComponent(temporaryOAuthParams[key])}"`);

  return `OAuth ${headerComponents.join(', ')}`;
}

function generateServiceUrl(baseUrl, resourcePath, queryData) {
  const fullEndpoint = new URL(baseUrl + resourcePath);
  if (queryData) {
    for (const key in queryData) {
      if (Object.prototype.hasOwnProperty.call(queryData, key) && queryData[key] !== undefined) {
        fullEndpoint.searchParams.append(key, queryData[key]);
      }
    }
  }
  return fullEndpoint.toString();
}

class MicroblogClient {
  constructor(applicationKeyId, applicationSecretCode, options = {}) {
    this.appKey = applicationKeyId;
    this.appSecret = applicationSecretCode;
    this.userAccessToken = options.userAccessToken;
    this.userAccessSecret = options.userAccessSecret;
    this.authenticationResults = options.authenticationResults;

    this.apiBaseUrl = options.apiBaseUrl || PRIMARY_SERVICE_URL;
    this.streamBaseUrl = options.streamBaseUrl || LIVE_FEED_SERVICE_URL;
  }

  async retrieveRequestCredential(callbackFunction) {
    const authorizationHeader = constructOAuthSignatureHeader(
      'GET',
      AUTHENTICATION_SETTINGS.REQUEST_TOKEN_ENDPOINT,
      {},
      null,
      null,
      this.appKey,
      this.appSecret
    );

    try {
      const serverResponse = await fetch(AUTHENTICATION_SETTINGS.REQUEST_TOKEN_ENDPOINT, {
        method: 'GET',
        headers: {
          'Authorization': authorizationHeader
        }
      });
      const responseData = await serverResponse.text();

      if (!serverResponse.ok) {
        throw new RemoteServiceError(`Failed to obtain request token`, serverResponse.status, responseData);
      }

      const parsedResponse = parse(responseData);

      this.requestTokenValue = parsedResponse.oauth_token;
      this.requestTokenSecretValue = parsedResponse.oauth_token_secret;
      this.requestTokenMetadata = parsedResponse;

      const redirectionUrl = USER_AUTHORIZATION_URL + this.requestTokenValue;
      callbackFunction(null, redirectionUrl);
    } catch (operationError) {
      callbackFunction(operationError);
    }
  }

  async completeAccessCredentialExchange(verificationCode, callbackFunction) {
    const postBody = `oauth_verifier=${encodeOAuthComponent(verificationCode)}`;
    const authorizationHeader = constructOAuthSignatureHeader(
      'POST',
      AUTHENTICATION_SETTINGS.ACCESS_TOKEN_ENDPOINT,
      { oauth_verifier: verificationCode },
      this.requestTokenValue,
      this.requestTokenSecretValue,
      this.appKey,
      this.appSecret
    );

    try {
      const serverResponse = await fetch(AUTHENTICATION_SETTINGS.ACCESS_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': authorizationHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: postBody
      });
      const responseData = await serverResponse.text();

      if (!serverResponse.ok) {
        throw new RemoteServiceError(`Failed to finalize access token`, serverResponse.status, responseData);
      }

      const parsedResponse = parse(responseData);

      this.userAccessToken = parsedResponse.oauth_token;
      this.userAccessSecret = parsedResponse.oauth_token_secret;
      this.authenticationResults = parsedResponse;

      callbackFunction(null, this.userAccessToken, this.userAccessSecret);
    } catch (operationError) {
      callbackFunction(operationError);
    }
  }

  async executeGetRequest(resourcePath, queryParameters, callbackFunction) {
    const fullResourceUrl = generateServiceUrl(this.apiBaseUrl, resourcePath, queryParameters);
    systemLog(`GET ${fullResourceUrl}`);

    try {
      const authorizationHeader = constructOAuthSignatureHeader(
        'GET',
        fullResourceUrl,
        queryParameters,
        this.userAccessToken,
        this.userAccessSecret,
        this.appKey,
        this.appSecret
      );

      const serverResponse = await fetch(fullResourceUrl, {
        method: 'GET',
        headers: {
          'Authorization': authorizationHeader
        }
      });
      const responseText = await serverResponse.text();

      if (!serverResponse.ok) {
        throw new RemoteServiceError(`Data retrieval failed for ${resourcePath}`, serverResponse.status, responseText);
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(responseText);
      } catch (jsonParsingError) {
        systemLog(`JSON parsing failed for GET ${resourcePath}: ${jsonParsingError.message}`);
        return callbackFunction(new RemoteServiceError(`Invalid JSON format in response`, 200, responseText), responseText, serverResponse);
      }

      callbackFunction(null, parsedContent, serverResponse);
    } catch (operationError) {
      callbackFunction(operationError);
    }
  }

  async executePostRequest(resourcePath, bodyParameters, callbackFunction) {
    const fullResourceUrl = generateServiceUrl(this.apiBaseUrl, resourcePath);
    systemLog(`POST ${fullResourceUrl} with payload: ${JSON.stringify(bodyParameters)}`);

    try {
      const authorizationHeader = constructOAuthSignatureHeader(
        'POST',
        fullResourceUrl,
        bodyParameters,
        this.userAccessToken,
        this.userAccessSecret,
        this.appKey,
        this.appSecret
      );

      const serverResponse = await fetch(fullResourceUrl, {
        method: 'POST',
        headers: {
          'Authorization': authorizationHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: stringify(bodyParameters)
      });
      const responseText = await serverResponse.text();

      if (!serverResponse.ok) {
        throw new RemoteServiceError(`Data modification failed for ${resourcePath}`, serverResponse.status, responseText);
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(responseText);
      } catch (jsonParsingError) {
        systemLog(`JSON parsing failed for POST ${resourcePath}: ${jsonParsingError.message}`);
        if (responseText === '') {
            return callbackFunction(null, null, serverResponse);
        }
        return callbackFunction(new RemoteServiceError(`Invalid JSON format in response`, 200, responseText), responseText, serverResponse);
      }

      callbackFunction(null, parsedContent, serverResponse);
    } catch (operationError) {
      callbackFunction(operationError);
    }
  }

  async retrievePostDetails(postIdentifier, queryOptions, completionHandler) {
    if (typeof queryOptions === 'function') {
      completionHandler = queryOptions;
      queryOptions = {};
    }
    const endpoint = `/statuses/${postIdentifier}.json`;
    return this.executeGetRequest(endpoint, queryOptions, completionHandler);
  }

  async submitNewStatus(statusPayload, completionHandler) {
    let requestBody;
    if (typeof statusPayload === 'string') {
      requestBody = { status: statusPayload };
    } else {
      requestBody = {
        status: statusPayload.text,
        in_reply_to_status_id: statusPayload.in_reply_to_status_id
      };
    }
    return this.executePostRequest('/statuses/update.json', requestBody, completionHandler);
  }

  async removeExistingPost(itemIdentifier, completionHandler) {
    return this.executePostRequest(`/statuses/destroy/${itemIdentifier}.json`, {}, completionHandler);
  }

  async republishContent(originalItemIdentifier, completionHandler) {
    return this.executePostRequest(`/statuses/retweet/${originalItemIdentifier}.json`, {}, completionHandler);
  }

  async fetchRepublishedItems(originalItemIdentifier, completionHandler) {
    return this.executeGetRequest(`/statuses/retweets/${originalItemIdentifier}.json`, {}, completionHandler);
  }

  async beginFollowing(targetUserIdentifier, completionHandler) {
    let payloadData;
    if (typeof targetUserIdentifier === 'string') {
      payloadData = { user_id: targetUserIdentifier };
    } else {
      payloadData = targetUserIdentifier;
    }
    this.executePostRequest('/friendships/create.json', payloadData, completionHandler);
  }

  async ceaseFollowing(targetUserIdentifier, completionHandler) {
    let payloadData;
    if (typeof targetUserIdentifier === 'string') {
      payloadData = { user_id: targetUserIdentifier };
    } else {
      payloadData = targetUserIdentifier;
    }
    this.executePostRequest('/friendships/delete.json', payloadData, completionHandler);
  }

  async obtainFollowerIds(parameters, completionHandler) {
    if (typeof parameters === 'function') {
      completionHandler = parameters;
      parameters = { user_id: this.authenticationResults.user_id };
    }
    const endpoint = '/followers/ids.json';
    this.executeGetRequest(endpoint, parameters, completionHandler);
  }

  async queryUserFeed(feedParameters, completionHandler) {
    const permittedFeedTypes = ['public_timeline', 'home_timeline', 'friends_timeline', 'user_timeline', 'mentions', 'retweeted_by_me', 'retweeted_to_me', 'retweeted_of_me'];
    let feedConfiguration = {};

    if (typeof feedParameters === 'function') {
      completionHandler = feedParameters;
      feedConfiguration.type = 'home_timeline';
    } else if (typeof feedParameters === 'string') {
      feedConfiguration.type = feedParameters;
    } else if (typeof feedParameters === 'object') {
      Object.assign(feedConfiguration, feedParameters);
      feedConfiguration.type = feedConfiguration.type || 'home_timeline';
    } else {
      throw new TypeError('Feed parameters must be a string or object');
    }

    if (!permittedFeedTypes.includes(feedConfiguration.type)) {
      throw new Error(`Invalid feed type: must be one of (${permittedFeedTypes.join(', ')}) but received ${feedConfiguration.type}.`);
    }

    const endpoint = `/statuses/${feedConfiguration.type}.json`;
    delete feedConfiguration.type;
    this.executeGetRequest(endpoint, feedConfiguration, completionHandler);
  }

  async fetchListContent(designation, listId, listParameters, completionHandler) {
    if (typeof listParameters === 'function') {
      completionHandler = listParameters;
      listParameters = {};
    }
    const endpoint = `/${designation}/lists/${listId}/statuses.json`;
    this.executeGetRequest(endpoint, listParameters, completionHandler);
  }

  async getAccountInformation(accountParameters, completionHandler) {
    if (typeof accountParameters === 'boolean') {
      accountParameters = { include_entities: accountParameters };
    } else if (typeof accountParameters === 'function') {
      completionHandler = accountParameters;
      accountParameters = {};
    }
    const endpoint = '/account/verify_credentials.json';
    this.executeGetRequest(endpoint, accountParameters, completionHandler);
  }

  initiateRealtimeFeed(streamConfiguration, completionHandler) {
    const feedUrl = generateServiceUrl(this.streamBaseUrl, '/user.json', streamConfiguration);
    systemLog(`OPENING LIVE FEED: ${feedUrl}`);

    const authorizationHeader = constructOAuthSignatureHeader(
      'GET',
      feedUrl,
      streamConfiguration,
      this.userAccessToken,
      this.userAccessSecret,
      this.appKey,
      this.appSecret
    );

    const requestInitiation = fetch(feedUrl, {
      method: 'GET',
      headers: {
        'Authorization': authorizationHeader
      }
    });

    const feedProcessor = new RealtimeFeedProcessor(this, requestInitiation);

    if (completionHandler) {
      requestInitiation
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => {
              completionHandler(new RemoteServiceError(`Failed to establish stream connection`, response.status, text));
            });
          }
          completionHandler(null, feedProcessor);
        })
        .catch(error => completionHandler(error));
    }

    return feedProcessor;
  }
}

class RealtimeFeedProcessor extends EventEmitter {
  constructor(parentClient, fetchPromise) {
    super();
    this.parentClient = parentClient;
    this.fetchPromise = fetchPromise;
    this.feedOperational = false;
    this.responseHandle = null;
    this.streamReader = null;

    this.beginFeedProcessing();
  }

  async beginFeedProcessing() {
    try {
      const response = await this.fetchPromise;
      this.responseHandle = response;

      if (!response.ok) {
        const errorDetails = await response.text();
        const connectionError = new RemoteServiceError(`Live feed connection problem`, response.status, errorDetails);
        this.emit('error', connectionError, response);
        return;
      }

      this.feedOperational = true;
      this.streamReader = response.body.getReader();
      let dataBuffer = '';
      const textDecoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await this.streamReader.read();
        if (done) {
          systemLog('Live feed processing concluded.');
          break;
        }

        dataBuffer += textDecoder.decode(value, { stream: true });

        let newlineSeparator;
        while ((newlineSeparator = dataBuffer.indexOf('\n')) !== -1) {
          const jsonSegment = dataBuffer.substring(0, newlineSeparator).trim();
          dataBuffer = dataBuffer.substring(newlineSeparator + 1);

          if (jsonSegment) {
            systemLog(`Received feed segment: ${jsonSegment}`);
            try {
              const parsedData = JSON.parse(jsonSegment);
              this.emit('data', parsedData);
            } catch (parsingException) {
              systemLog(`Feed JSON parsing failure: ${parsingException.message} for segment: ${jsonSegment}`);
              this.emit('parsingError', parsingException, jsonSegment);
            }
          }
        }
      }
      this.emit('end');
    } catch (processingException) {
      systemLog(`Live feed processor encountered an error: ${processingException.message}`);
      this.emit('error', processingException, this.responseHandle);
    }
  }

  haltFeed(completionHandler) {
    if (this.streamReader) {
      this.streamReader.cancel('Feed termination invoked').then(() => {
        systemLog('Live feed reader canceled.');
        if (completionHandler) completionHandler();
      }).catch(err => {
        systemLog(`Error during reader cancellation: ${err.message}`);
        if (completionHandler) completionHandler(err);
      });
    } else {
      systemLog('No active reader to halt.');
      if (completionHandler) completionHandler();
    }
  }

  get associatedClient() {
    return this.parentClient;
  }
}

module.exports = MicroblogClient;