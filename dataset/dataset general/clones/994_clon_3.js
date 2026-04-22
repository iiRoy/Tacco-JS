const diagnosticLogger = require('debug')('gcp-auth-service');
const cryptographyModule = require('crypto');
const fileSystemHandler = require('fs');
const httpRequestClient = require('request');

// Core service endpoints and static identifiers
const AUTH_SERVICE_ENDPOINT = 'https://accounts.google.com/o/oauth2/token';
const JWT_GRANT_TYPE_IDENTIFIER = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
const DEFAULT_AUTH_TOKEN_LIFESPAN_MS = 3600 * 1000; // One hour validity for the access token

/**
 * Provides an interface for obtaining Google Cloud Platform access tokens
 * through the service account JWT flow.
 */
const TokenManagementUtility = {};

/**
 * Orchestrates the acquisition of a Google OAuth2 access token.
 * This involves generating a signed JSON Web Token (JWT) and then
 * exchanging it with the Google OAuth2 endpoint for the actual access token.
 *
 * @param {object} authConfiguration The configuration object defining the JWT parameters.
 *   - `email`: The service account email address (e.g., 'service-123@project.iam.gserviceaccount.com').
 *   - `scopes`: An array of OAuth2 scope URIs (e.g., ['https://www.googleapis.com/auth/cloud-platform']).
 *   - `key`: The private key string for signing the JWT, or...
 *   - `keyFile`: The file path to the private key.
 *   - `expirationMillis`: Optional. The desired lifespan of the access token in milliseconds. Defaults to 1 hour.
 *   - `delegatedUserEmail`: Optional. An email address for which to impersonate.
 * @param {function(Error|null, string?): void} completionHandler A callback function to be invoked
 *   upon completion, receiving either an error or the acquired access token string.
 */
TokenManagementUtility.fetchAccessToken = function (authConfiguration, completionHandler) {
    // Ensure the completionHandler is a callable function, or provide a no-op fallback.
    const finalResultCallback = typeof completionHandler === 'function' ? completionHandler : () => { /* NOP */ };

    // Initial validation of input configuration object.
    if (!authConfiguration || typeof authConfiguration !== 'object') {
        diagnosticLogger('Error: Invalid authentication configuration provided.');
        return finalResultCallback(new Error('Authentication configuration object is required and must be valid.'));
    }

    diagnosticLogger('Initiating access token request flow for service account.');

    // Step 1: Generate the signed JSON Web Token (JWT).
    TokenManagementUtility.constructSignedJWT(authConfiguration, (jwtGenerationError, generatedJwtString) => {
        if (jwtGenerationError) {
            diagnosticLogger('JWT construction failed: %s', jwtGenerationError.message);
            return finalResultCallback(jwtGenerationError);
        }

        diagnosticLogger('JWT successfully constructed. Moving to token exchange phase.');

        // Prepare the HTTP request body for the OAuth2 token endpoint.
        const tokenExchangePayload = {
            grant_type: JWT_GRANT_TYPE_IDENTIFIER,
            assertion: generatedJwtString
        };

        // Define HTTP headers for the token exchange request.
        const httpHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json' // Explicitly request JSON response from the server.
        };

        // Step 2: Send the signed JWT to the Google OAuth2 token endpoint.
        httpRequestClient.post(AUTH_SERVICE_ENDPOINT, {
            headers: httpHeaders,
            form: tokenExchangePayload // 'form' option automatically encodes as application/x-www-form-urlencoded.
        }, (networkError, serverResponse, rawResponseContent) => {
            if (networkError) {
                diagnosticLogger('HTTP request to OAuth endpoint failed: %s', networkError.message);
                return finalResultCallback(networkError);
            }

            diagnosticLogger('Received raw response from OAuth server (HTTP %d): %s', serverResponse.statusCode, rawResponseContent);

            // Handle non-successful HTTP status codes.
            if (serverResponse.statusCode !== 200) {
                let parsedErrorDetails = {};
                try {
                    parsedErrorDetails = JSON.parse(rawResponseContent);
                } catch (jsonParseError) {
                    diagnosticLogger('Failed to parse error response content as JSON: %s', jsonParseError.message);
                    // Fallback if the error response itself isn't valid JSON.
                    parsedErrorDetails = { error: 'parsing_failed', description: `Non-JSON error response: ${rawResponseContent}` };
                }

                const httpError = new Error(
                    `Access token acquisition failed. Server responded with HTTP ${serverResponse.statusCode}. ` +
                    `Error: ${parsedErrorDetails.error || 'Unknown'}. Details: ${parsedErrorDetails.error_description || parsedErrorDetails.description || 'N/A'}`
                );
                httpError.responseStatusCode = serverResponse.statusCode;
                httpError.responseBody = parsedErrorDetails; // Attach parsed error details for further inspection.
                return finalResultCallback(httpError);
            }

            // Attempt to parse the successful JSON response content.
            let parsedResponseData;
            try {
                parsedResponseData = JSON.parse(rawResponseContent);
            } catch (jsonParsingIssue) {
                diagnosticLogger('JSON parsing of successful response content failed: %s', jsonParsingIssue.message);
                return finalResultCallback(new Error('Failed to parse successful OAuth server response: Invalid JSON format.'));
            }

            // Validate that the expected 'access_token' field exists in the response.
            if (!parsedResponseData || typeof parsedResponseData.access_token !== 'string' || parsedResponseData.access_token.trim() === '') {
                diagnosticLogger('OAuth response missing or contains an invalid "access_token" field: %j', parsedResponseData);
                return finalResultCallback(new Error('OAuth server response did not include a valid access_token.'));
            }

            diagnosticLogger('Access token successfully retrieved from OAuth server.');
            return finalResultCallback(null, parsedResponseData.access_token);
        });
    });
};

/**
 * Creates and signs a JSON Web Token (JWT) according to the provided configuration.
 * This JWT is then used as an assertion for requesting an access token.
 *
 * @param {object} jwtConfig The configuration for JWT generation.
 *   - `email`: Required. The issuer (service account) email.
 *   - `scopes`: Required. An array of string scope URIs.
 *   - `key`: Required (or `keyFile`). The private key as a string.
 *   - `keyFile`: Required (or `key`). The path to the private key file.
 *   - `expirationMillis`: Optional. The token's validity duration in milliseconds.
 *   - `delegatedUserEmail`: Optional. The subject (user) email for delegation.
 * @param {function(Error|null, string?): void} resultCallback The callback function
 *   to receive the signed JWT string or an error.
 */
TokenManagementUtility.constructSignedJWT = function (jwtConfig, resultCallback) {
    const processResult = typeof resultCallback === 'function' ? resultCallback : () => { /* silent failure */ };

    // --- Comprehensive Input Validation ---
    if (!jwtConfig || typeof jwtConfig !== 'object') {
        return processResult(new Error('JWT configuration object is mandatory.'));
    }
    if (typeof jwtConfig.email !== 'string' || jwtConfig.email.trim() === '') {
        return processResult(new Error('Configuration requires a non-empty "email" string (service account).'));
    }
    if (!Array.isArray(jwtConfig.scopes) || jwtConfig.scopes.length === 0 || jwtConfig.scopes.some(s => typeof s !== 'string' || s.trim() === '')) {
        return processResult(new Error('Configuration requires "scopes" as a non-empty array of valid string URIs.'));
    }
    const hasKeyString = typeof jwtConfig.key === 'string' && jwtConfig.key.trim() !== '';
    const hasKeyFilePath = typeof jwtConfig.keyFile === 'string' && jwtConfig.keyFile.trim() !== '';
    if (!hasKeyString && !hasKeyFilePath) {
        return processResult(new Error('Either "key" (private key string) or "keyFile" (path) must be provided in the configuration.'));
    }
    if (hasKeyString && hasKeyFilePath) {
        diagnosticLogger('Warning: Both "key" and "keyFile" are provided. "key" string will be prioritized.');
    }

    diagnosticLogger('Beginning JWT construction for issuer: %s', jwtConfig.email);

    // --- JWT Claim Set Generation ---
    const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
    const tokenDurationInSeconds = Math.floor((jwtConfig.expirationMillis || DEFAULT_AUTH_TOKEN_LIFESPAN_MS) / 1000);
    const expirationTimestampInSeconds = currentTimestampInSeconds + tokenDurationInSeconds;

    const jwtClaimPayload = {
        iss: jwtConfig.email,                     // Issuer: The service account email.
        scope: jwtConfig.scopes.join(' '),        // Scopes: Space-delimited string of requested permissions.
        aud: AUTH_SERVICE_ENDPOINT,               // Audience: The Google OAuth2 token endpoint URL.
        exp: expirationTimestampInSeconds,        // Expiration Time: When the token becomes invalid.
        iat: currentTimestampInSeconds            // Issued At: The time the token was issued.
    };

    // Include delegation subject if specified.
    if (jwtConfig.delegatedUserEmail && typeof jwtConfig.delegatedUserEmail === 'string' && jwtConfig.delegatedUserEmail.trim() !== '') {
        jwtClaimPayload.sub = jwtConfig.delegatedUserEmail; // Subject: The user being impersonated.
    }

    // --- JWT Header and Claim Encoding ---
    const jwtHeaderData = { alg: "RS256", typ: "JWT" }; // Standard header for RS256 signed JWTs.
    const encodedJwtHeader = Buffer.from(JSON.stringify(jwtHeaderData), 'utf8').toString('base64url');
    const encodedJwtClaims = Buffer.from(JSON.stringify(jwtClaimPayload), 'utf8').toString('base64url');

    const unsignedJwtBase = `${encodedJwtHeader}.${encodedJwtClaims}`;
    diagnosticLogger('Unsigned JWT segment generated.');

    // --- Private Key Retrieval and JWT Signing ---
    obtainPrivateKeyMaterial(jwtConfig, (keyAcquisitionError, privateKeyContent) => {
        if (keyAcquisitionError) {
            diagnosticLogger('Failed to acquire private key: %s', keyAcquisitionError.message);
            return processResult(keyAcquisitionError);
        }

        if (!privateKeyContent || privateKeyContent.length === 0) {
            return processResult(new Error('Acquired private key content is empty; cannot sign JWT.'));
        }

        try {
            // Create a signer using 'RSA-SHA256' algorithm.
            const jwtSigner = cryptographyModule.createSign('RSA-SHA256');
            jwtSigner.update(unsignedJwtBase); // Feed the unsigned JWT part to the signer.
            const signatureSegment = jwtSigner.sign(privateKeyContent, 'base64url'); // Sign and encode the signature.

            if (signatureSegment.length === 0) {
                return processResult(new Error('JWT signing produced an empty signature. Private key format might be incorrect.'));
            }

            const fullSignedJwt = `${unsignedJwtBase}.${signatureSegment}`;
            diagnosticLogger('JWT successfully signed and encoded.');
            return processResult(null, fullSignedJwt);

        } catch (signingExecutionError) {
            diagnosticLogger('An error occurred during the JWT signing process: %s', signingExecutionError.message);
            return processResult(new Error(`JWT signing failed: ${signingExecutionError.message}. Verify private key integrity.`));
        }
    });
};

/**
 * Internal helper function to retrieve the private key material.
 * It prioritizes a key string provided directly, otherwise attempts to read from a file.
 *
 * @param {object} configOptions The configuration object containing `key` or `keyFile`.
 * @param {function(Error|null, string?): void} keyMaterialCallback Callback to return the key string or an error.
 */
function obtainPrivateKeyMaterial(configOptions, keyMaterialCallback) {
    // Prioritize direct key string if available and valid.
    if (configOptions.key && typeof configOptions.key === 'string' && configOptions.key.trim() !== '') {
        diagnosticLogger('Using private key provided directly in configuration.');
        return keyMaterialCallback(null, configOptions.key.trim());
    } else if (configOptions.keyFile && typeof configOptions.keyFile === 'string' && configOptions.keyFile.trim() !== '') {
        // If key string is not available, try reading from the specified file path.
        const keyFilePath = configOptions.keyFile.trim();
        diagnosticLogger('Attempting to read private key from file: %s', keyFilePath);

        fileSystemHandler.readFile(keyFilePath, { encoding: 'utf8' }, (fileReadIssue, fileContents) => {
            if (fileReadIssue) {
                diagnosticLogger('Error reading private key file "%s": %s', keyFilePath, fileReadIssue.message);
                return keyMaterialCallback(new Error(`Failed to read private key from file '${keyFilePath}': ${fileReadIssue.message}`));
            }
            if (!fileContents || fileContents.trim() === '') {
                return keyMaterialCallback(new Error(`Private key file '${keyFilePath}' was found but is empty.`));
            }
            diagnosticLogger('Private key successfully loaded from file.');
            return keyMaterialCallback(null, fileContents.trim());
        });
    } else {
        // If neither option yielded a valid key.
        diagnosticLogger('No valid private key string or file path found in configuration.');
        return keyMaterialCallback(new Error(
            'Private key material is missing. Please provide it via "config.key" or "config.keyFile".'
        ));
    }
}

// Export the main utility object for external use.
module.exports = TokenManagementUtility;