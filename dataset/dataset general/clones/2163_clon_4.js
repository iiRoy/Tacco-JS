const URL_PROCESSOR = require('url');
const OAUTH_FACILITATOR = require('oauth').OAuth;
const QUERY_BUILDER = require('querystring');
const SECURE_ENCODER = require('serializer');

const API_BASE_URL = 'https://api.fitbit.com/1';

class FitbitService {
  #encoderInstance;
  #oauthHandler;
  #requestDispatcher;
  #clientVersion = '0.3.1';
  #authorizationRedirectUri;

  constructor(apiKey, apiSecret, redirectUri, measurementSystem) {
    this.#authorizationRedirectUri = redirectUri;
    this.#encoderInstance = SECURE_ENCODER.createSecureSerializer(apiKey, apiSecret);

    const initialHeaders = new Map([
      ['Accept', '*/*'],
      ['Connection', 'close'],
      ['User-Agent', `fitbit-js-clone ${this.#clientVersion}`]
    ]);

    if (measurementSystem !== undefined && measurementSystem !== null) {
      initialHeaders.set('Accept-Language', measurementSystem);
    }

    const headerObject = Object.fromEntries(initialHeaders);

    this.#oauthHandler = new OAUTH_FACILITATOR(
      'https://api.fitbit.com/oauth/request_token',
      'https://api.fitbit.com/oauth/access_token',
      apiKey,
      apiSecret,
      '1.0',
      this.#authorizationRedirectUri,
      'HMAC-SHA1',
      null,
      headerObject
    );

    const httpGet = this.#performGet.bind(this);
    const httpPost = this.#performPost.bind(this);
    const httpDelete = this.#performDelete.bind(this);

    this.#requestDispatcher = new Map([
      ['GET', httpGet],
      ['POST', httpPost],
      ['DELETE', httpDelete]
    ]);
  }

  #createResponseProcessor(completionCallback) {
    return (errorObject, rawData, serverResponse) => {
      if (errorObject) {
        return completionCallback(errorObject, rawData);
      }
      let parsedData = null;
      let parseError = null;
      try {
        parsedData = JSON.parse(rawData);
      } catch (parsingException) {
        parseError = parsingException;
      }
      completionCallback(parseError, serverResponse, parsedData);
    };
  }

  #performGet(resourcePath, queryParameters, authCredentials, completionCallback) {
    const fullUrl = API_BASE_URL + resourcePath + '?' + QUERY_BUILDER.stringify(queryParameters);
    this.#oauthHandler.get(
      fullUrl,
      authCredentials.oauth_token,
      authCredentials.oauth_token_secret,
      this.#createResponseProcessor(completionCallback)
    );
  }

  #performPost(resourcePath, postBody, authCredentials, completionCallback) {
    this.#oauthHandler.post(
      API_BASE_URL + resourcePath,
      authCredentials.oauth_token,
      authCredentials.oauth_token_secret,
      postBody,
      null,
      this.#createResponseProcessor(completionCallback)
    );
  }

  #performDelete(resourcePath, queryParameters, authCredentials, completionCallback) {
    // The `queryParameters` argument is accepted here for consistency with other methods,
    // but the underlying `oauth.delete` method does not use it.
    // This mirrors the original `oAuthDelete` function's behavior.
    this.#oauthHandler.delete(
      API_BASE_URL + resourcePath,
      authCredentials.oauth_token,
      authCredentials.oauth_token_secret,
      this.#createResponseProcessor(completionCallback)
    );
  }

  initiateApiRequest(httpMethod, endpointPath, requestParams, completionCallback) {
    const { credentialToken, ...remainingParams } = requestParams;
    const handler = this.#requestDispatcher.get(httpMethod);
    if (!handler) {
      return completionCallback(new Error(`Unsupported HTTP method: ${httpMethod}`));
    }
    handler(endpointPath, remainingParams, credentialToken, completionCallback);
  }

  obtainSessionCredentials(request, response, completionCallback) {
    let storedSession = null;
    if (request.cookies && request.cookies.fitbit_client) {
      try {
        storedSession = this.#encoderInstance.parse(request.cookies.fitbit_client);
      } catch(parsingError) { /* Ignore parsing errors for robustness */ }
    }

    const urlComponents = URL_PROCESSOR.parse(request.url, true);
    const urlQueryData = urlComponents.query;

    const tokenExistsInQuery = !!urlQueryData && !!urlQueryData.oauth_token;
    const secretExistsInSession = !!storedSession && !!storedSession.token_secret;

    if (tokenExistsInQuery && secretExistsInSession) {
      this.#oauthHandler.getOAuthAccessToken(
        urlQueryData.oauth_token,
        storedSession.token_secret,
        urlQueryData.oauth_verifier,
        (accessError, accessToken, accessSecret) => {
          if (accessError) {
            return completionCallback(accessError, null);
          }
          completionCallback(null, {
            oauth_token: accessToken,
            oauth_token_secret: accessSecret
          });
        }
      );
    } else {
      this.#oauthHandler.getOAuthRequestToken(
        { oauth_callback: this.#authorizationRedirectUri },
        (requestError, requestToken, requestSecret) => {
          if (requestError) {
            return completionCallback(requestError, null);
          }

          response.cookie(
            'fitbit_client',
            this.#encoderInstance.stringify({
              token_secret: requestSecret
            }),
            {
              path: '/',
              httpOnly: false,
              secure: request.protocol === 'https'
            }
          );

          response.redirect(
            'https://www.fitbit.com/oauth/authorize?oauth_token=' + requestToken
          );
        }
      );
    }
  }
}

module.exports = (apiKey, apiSecret, redirectUri, measurementSystem) => {
  return new FitbitService(apiKey, apiSecret, redirectUri, measurementSystem);
};