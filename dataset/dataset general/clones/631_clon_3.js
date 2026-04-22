'use strict';

const jwtSigner = require('jws');
const fileSystem = require('fs');
const httpClient = require('request');

const GOOGLE_OAUTH2_TOKEN_ENDPOINT = 'https://accounts.google.com/o/oauth2/token';
const JWT_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
const JWT_ALGORITHM = 'RS256';
const JWT_TYPE = 'JWT';
const JWT_CLAIM_VALIDITY_SECONDS = 3600; // JWT 'exp' claim is 1 hour from 'iat'

/**
 * @class GoogleAuthService
 * @description Manages Google API authentication for service accounts, handling token caching and refresh.
 * @param {object} serviceConfig - Configuration object for the authentication service.
 * @param {string} serviceConfig.issuerId - The email address of the service account.
 * @param {string} serviceConfig.accessScope - The space-delimited list of requested OAuth 2.0 scopes.
 * @param {string} [serviceConfig.subjectEmail] - The email address of the user for whom the access token is being requested (for impersonation).
 * @param {string} [serviceConfig.principalEmail] - Deprecated alias for subjectEmail.
 * @param {string} [serviceConfig.privateKeyPath] - Path to the service account's private key file.
 * @param {string} [serviceConfig.privateKeyContent] - The actual private key content as a string.
 * @param {function} initializationCallback - Callback function invoked after initialization (err)
 */
const GoogleAuthService = function (serviceConfig, initializationCallback) {
    this.cachedAccessToken = null;
    this.tokenExpiryMillis = null;

    this.issuerId = serviceConfig.issuerId;
    this.accessScope = serviceConfig.accessScope;
    this.subjectEmail = serviceConfig.subjectEmail || serviceConfig.principalEmail; // Allow both, prefer subjectEmail

    if (!this.issuerId || !this.accessScope) {
        return initializationCallback(new Error("AuthService: Configuration error - 'issuerId' and 'accessScope' are mandatory."));
    }

    const instanceReference = this; // Preserve 'this' context for async operations.

    if (serviceConfig.privateKeyPath) {
        process.nextTick(() => { // Defer file read to prevent blocking constructor.
            fileSystem.readFile(serviceConfig.privateKeyPath, 'utf8', (readErr, fileData) => {
                if (readErr) {
                    console.error(`AuthService: Failed to load private key from file '${serviceConfig.privateKeyPath}':`, readErr.message);
                    return initializationCallback(readErr);
                }
                instanceReference.privateSigningKey = fileData;
                initializationCallback();
            });
        });
    } else if (serviceConfig.privateKeyContent) {
        this.privateSigningKey = serviceConfig.privateKeyContent;
        process.nextTick(initializationCallback); // Maintain async consistency.
    } else {
        initializationCallback(new Error("AuthService: No private key source provided. Use 'privateKeyPath' or 'privateKeyContent'."));
    }
};

/**
 * @private
 * @description Constructs the standard JWT claims payload required for Google's OAuth2 token request.
 * @param {GoogleAuthService} context - The 'this' context of the GoogleAuthService instance.
 * @param {number} issuedAtSeconds - The current timestamp in seconds (for 'iat' claim).
 * @returns {object} The JWT payload object.
 */
function _buildJwtClaimsPayload(context, issuedAtSeconds) {
    const claims = {
        iss: context.issuerId,
        scope: context.accessScope,
        aud: GOOGLE_OAUTH2_TOKEN_ENDPOINT,
        exp: issuedAtSeconds + JWT_CLAIM_VALIDITY_SECONDS,
        iat: issuedAtSeconds
    };

    if (context.subjectEmail) {
        claims.sub = context.subjectEmail;
    }
    return claims;
}

/**
 * @method retrieveAuthToken
 * @memberof GoogleAuthService.prototype
 * @description Fetches an access token. Returns a cached token if available and not expired, otherwise requests a new one.
 * @param {function} completionHandler - Callback function (err, token).
 */
GoogleAuthService.prototype.retrieveAuthToken = function (completionHandler) {
    const currentTimeMillis = Date.now();
    const TOKEN_EXPIRY_BUFFER_MILLIS = 5000; // Request a new token 5 seconds before actual expiry

    if (this.cachedAccessToken && this.tokenExpiryMillis && (currentTimeMillis < (this.tokenExpiryMillis - TOKEN_EXPIRY_BUFFER_MILLIS))) {
        console.log("AuthService: Returning cached access token, still valid.");
        completionHandler(null, this.cachedAccessToken);
    } else {
        console.log("AuthService: Cached token is expired or not present. Initiating new token request.");
        this.requestNewAccessToken(completionHandler);
    }
};

/**
 * @method requestNewAccessToken
 * @memberof GoogleAuthService.prototype
 * @description Makes an HTTP POST request to Google's OAuth2 token endpoint to obtain a new access token.
 * @param {function} completionHandler - Callback function (err, accessToken).
 */
GoogleAuthService.prototype.requestNewAccessToken = function (completionHandler) {
    const serviceInstance = this;
    const issuedAtSeconds = Math.floor(Date.now() / 1000);

    const jwtPayload = _buildJwtClaimsPayload(serviceInstance, issuedAtSeconds);

    const signedAssertion = jwtSigner.sign({
        header: { alg: JWT_ALGORITHM, typ: JWT_TYPE },
        payload: jwtPayload,
        secret: serviceInstance.privateSigningKey
    });

    const httpRequestOptions = {
        url: GOOGLE_OAUTH2_TOKEN_ENDPOINT,
        method: 'POST',
        strictSSL: false, // Per original implementation; consider making configurable or true for production.
        form: {
            'grant_type': JWT_GRANT_TYPE,
            'assertion': signedAssertion
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'GoogleAuthService-NodeJS/v1.1.0' // Custom User-Agent
        },
        timeout: 10000 // 10 second timeout for the HTTP request
    };

    httpClient(httpRequestOptions, (requestError, apiResponse, responseBody) => {
        // Always clear internal token state on any request outcome to ensure a clean slate for the next attempt.
        serviceInstance.cachedAccessToken = null;
        serviceInstance.tokenExpiryMillis = null;

        if (requestError) {
            console.error("AuthService: Network or HTTP request error:", requestError.message);
            return completionHandler(requestError);
        }

        // Validate HTTP status code before attempting to parse the body.
        if (apiResponse.statusCode && (apiResponse.statusCode < 200 || apiResponse.statusCode >= 300)) {
            const httpError = new Error(`AuthService: Google API responded with HTTP status ${apiResponse.statusCode}. Body: ${responseBody}`);
            console.error(httpError.message);
            return completionHandler(httpError);
        }

        try {
            const parsedResponse = JSON.parse(responseBody);

            if (parsedResponse.error) {
                console.error("AuthService: Google API reported an error:", parsedResponse.error, parsedResponse.error_description);
                return completionHandler(new Error(parsedResponse.error_description || parsedResponse.error));
            } else if (parsedResponse.access_token && parsedResponse.expires_in) {
                serviceInstance.cachedAccessToken = parsedResponse.access_token;
                // Calculate actual expiry time in milliseconds from 'now' plus 'expires_in' seconds.
                serviceInstance.tokenExpiryMillis = Date.now() + (parsedResponse.expires_in * 1000);

                console.log(`AuthService: Successfully acquired new access token. Valid for ${parsedResponse.expires_in} seconds.`);
                completionHandler(null, serviceInstance.cachedAccessToken);
            } else {
                console.error("AuthService: Unexpected response format from token endpoint:", responseBody);
                completionHandler(new Error("AuthService: Invalid or incomplete token response from Google API."));
            }
        } catch (parseError) {
            console.error("AuthService: Failed to parse JSON response from Google API:", parseError.message, "Raw body:", responseBody);
            completionHandler(parseError);
        }
    });
};

module.exports = GoogleAuthService;