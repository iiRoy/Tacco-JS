const fileSystemUtil = require('fs');
const cryptographyHandler = require('crypto');
const networkRequester = require('request');
const diagnosticsLogger = require('debug')('authorization-token-generator');

// Centralized endpoint for OAuth2 token acquisition
const OAUTH_TOKEN_LOCATION = 'https://accounts.google.com/o/oauth2/token';

/**
 * Initiates the authentication flow to secure an access token.
 * This involves sending a digitally signed JWT to the designated Google OAuth2 service.
 *
 * @param {Object} settingsObject Configuration parameters for JWT generation.
 * @param {Function} completionCallback The function to call once the token is obtained or an error occurs.
 */
module.exports.acquireToken = function ( settingsObject, completionCallback ) {

    // Ensure a valid callback is available, providing a no-op default if none is supplied.
    completionCallback = completionCallback || function () {};

    // First, generate the JSON Web Token based on provided configuration.
    module.exports.composeAuthToken(settingsObject, function (issue, tokenString) {

        // If an issue occurred during JWT composition, propagate it immediately.
        if ( issue ) {
            return completionCallback(issue);
        }

        // Proceed to make an HTTP POST request to the OAuth2 endpoint.
        // The JWT is sent as an assertion for the grant type.
        return networkRequester.post(
            OAUTH_TOKEN_LOCATION,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded' // Specify content type for the request body.
                },
                form: {
                    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', // OAuth2 grant type for JWT assertion.
                    assertion: tokenString // The signed JWT.
                }
            },
            function (issue, serverReply, contentBody) {

                // Handle any network or request-level errors.
                if ( issue ) {
                    return completionCallback(issue);
                } else {
                    // Log the server's response for diagnostic purposes.
                    diagnosticsLogger('OAuth server response: HTTP %d -> %j', serverReply.statusCode, contentBody);
                }

                // If the server did not return a successful status code (e.g., 200 OK).
                if ( serverReply.statusCode !== 200 ) {
                    let problem = new Error(
                        'Failed to retrieve an authentication token. The request terminated with HTTP status ' +
                        serverReply.statusCode + ': ' + contentBody.error
                    );
                    problem.statusCode = serverReply.statusCode; // Attach the HTTP status code to the error.
                    problem.body = contentBody; // Include the raw response body with the error.
                    return completionCallback(problem);
                }

                try {
                    // Attempt to parse the JSON response from the server.
                    contentBody = JSON.parse(contentBody);
                }
                catch (parseError) {
                    // If JSON parsing fails, report it.
                    return completionCallback(new Error('Unable to parse server response data: ' + contentBody));
                }

                // Successfully obtained and parsed the token. Return the access token.
                return completionCallback(null, contentBody.access_token);

            }
        );
    });
};

/**
 * Generates a signed JSON Web Token (JWT) based on the provided configuration options.
 * This token serves as an authentication request for a designated user and is cryptographically signed
 * using a private key to confirm its authenticity and integrity.
 *
 * The available configuration parameters are:
 *   `settingsObject.accountEmail`: The service account's email address (mandatory).
 *   `settingsObject.permittedScopes`: An array of URI strings specifying the desired access permissions (mandatory).
 *   `settingsObject.signingKey` or `settingsObject.signingKeyFile`: The private key data or path to the key file for signing (mandatory).
 *   `settingsObject.tokenDuration`: The validity period of the requested token, in milliseconds (default: 3600000ms / 1 hour).
 *   `settingsObject.delegateEmail`: An optional email address for which access is being granted on behalf of.
 *
 * @param {Object} settingsObject The configuration object used to construct the JWT.
 * @param {Function} resultHandler The function to call with the generated JSON Web Token (JWT) or an error.
 */
module.exports.composeAuthToken = function ( settingsObject, resultHandler ) {

    // --- Input Validation ---
    if (!settingsObject) throw new Error('Configuration object is a mandatory parameter.');
    if (!settingsObject.accountEmail) throw new Error('settingsObject.accountEmail is required.');
    if (!settingsObject.permittedScopes) throw new Error('settingsObject.permittedScopes is required.');
    if (!Array.isArray(settingsObject.permittedScopes)) throw new Error('settingsObject.permittedScopes must be an array.');
    if (settingsObject.permittedScopes.length === 0) throw new Error('settingsObject.permittedScopes must contain at least one scope URI.');
    if (!settingsObject.signingKey && !settingsObject.signingKeyFile) throw new Error('Either settingsObject.signingKey or settingsObject.signingKeyFile must be provided.');
    // --- End Input Validation ---

    resultHandler = resultHandler || function () {}; // Default callback if none provided.

    diagnosticsLogger('Preparing to generate JWT for configuration: %j', settingsObject);

    var creationTimestamp = Math.floor(new Date().getTime() / 1000); // Current time in seconds since epoch.
    var validUntil = creationTimestamp + Math.floor((settingsObject.tokenDuration || 3600 * 1000) / 1000); // Expiration time in seconds.

    var payloadClaims = {
            iss: settingsObject.accountEmail, // Issuer: service account email.
            scope: settingsObject.permittedScopes.join(' '), // Requested access scopes, space-separated.
            aud: OAUTH_TOKEN_LOCATION, // Audience: the token endpoint URL.
            exp: validUntil, // Expiration time.
            iat: creationTimestamp // Issued at time.
        };

    // If delegation is requested, add the 'sub' (subject) claim.
    if (settingsObject.delegateEmail) {
        payloadClaims.sub = settingsObject.delegateEmail;
    }

    // Construct the JWT header and claims set, then base64 encode them.
    var tokenHeader = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString('base64');
    var tokenClaims = Buffer.from(JSON.stringify(payloadClaims)).toString('base64');
    var rawJwtData = [tokenHeader, tokenClaims].join('.'); // The unsigned part of the JWT.

    // Obtain the private signing key. This might involve reading from a file.
    fetchSigningMaterial(function (issue, privateCredential) {

        if (issue) {
            return resultHandler(issue); // Propagate key acquisition errors.
        }

        // Sign the unsigned JWT data using RSA-SHA256 and the private key.
        var tokenSignature = cryptographyHandler.createSign('RSA-SHA256').update(rawJwtData).sign(privateCredential, 'base64');
        var finalSignedToken = [rawJwtData, tokenSignature].join('.'); // Combine all parts to form the complete signed JWT.

        // Check if the signature generation was successful.
        if (tokenSignature === '') {
            return resultHandler(new Error('Signature generation failed; the provided private key is likely invalid.'));
        }

        diagnosticsLogger('Successfully generated signed JWT: %s', finalSignedToken);
        return resultHandler(null, finalSignedToken); // Return the complete signed JWT.

    });

    /**
     * Helper function to retrieve the private signing key.
     * It can be provided directly as a string or loaded from a file.
     * @param {Function} keyCallback The callback to invoke with the key or an error.
     */
    function fetchSigningMaterial(keyCallback) {
        if (settingsObject.signingKey && settingsObject.signingKey !== '') {
            // Key is directly provided as a string in the settings.
            return keyCallback(null, settingsObject.signingKey);
        } else if (settingsObject.signingKeyFile) {
            // Key needs to be read from a file specified in the settings.
            return fileSystemUtil.readFile(settingsObject.signingKeyFile, keyCallback);
        }
        // If neither a key string nor a key file path is provided, throw an error.
        return keyCallback(new Error(
            'No signing key specified. Please use "settingsObject.signingKey" for a direct key string or "settingsObject.signingKeyFile" for a file path.'
        ));
    }

};