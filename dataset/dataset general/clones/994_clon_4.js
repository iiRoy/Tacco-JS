const fileSystemModule = require('node:fs/promises');
const cryptographyTool = require('node:crypto');
const httpAgent = require('axios');
const diagnosticOutput = require('debug')('token-provider-service');

const convertToBase64Url = (input) => Buffer.from(input).toString('base64url');

class SecureTokenProvider {
    static OAUTH2_AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/token';
    static DEFAULT_TOKEN_LIFESPAN_MS = 3600 * 1000;

    constructor() {}

    async obtainAccessCredential(requestConfig) {
        if (!requestConfig || typeof requestConfig !== 'object') {
            throw new Error('Authorization request configuration is mandatory.');
        }

        try {
            const signedWebToken = await this.generateSignedWebToken(requestConfig);
            return await this.sendCredentialRequest(signedWebToken);
        } catch (operationError) {
            diagnosticOutput('Credential acquisition process failed: %O', operationError);
            throw operationError;
        }
    }

    async generateSignedWebToken(tokenSettings) {
        const {
            serviceAccountIdentifier: emailAddress,
            requestedScopes: scopeList,
            signingKeyString: secretKey,
            signingKeyFilePath: secretKeyFile,
            tokenValidityDurationMs: lifespan,
            delegateForUser: delegatedUserEmail
        } = tokenSettings;

        if (!emailAddress) throw new Error('Service account identifier (serviceAccountIdentifier) is required.');
        if (!scopeList || !Array.isArray(scopeList) || scopeList.length === 0) {
            throw new Error('Requested scopes (requestedScopes) must be a non-empty array.');
        }
        if (!secretKey && !secretKeyFile) {
            throw new Error('Either signing key content (signingKeyString) or file path (signingKeyFilePath) is required.');
        }

        diagnosticOutput('Constructing web token for %s with scopes %j', emailAddress, scopeList);

        const currentTimestampSeconds = Math.floor(Date.now() / 1000);
        const expiryTimestampSeconds = currentTimestampSeconds + Math.floor((lifespan || SecureTokenProvider.DEFAULT_TOKEN_LIFESPAN_MS) / 1000);

        const tokenPayload = {
            iss: emailAddress,
            scope: scopeList.join(' '),
            aud: SecureTokenProvider.OAUTH2_AUTHORIZATION_ENDPOINT,
            exp: expiryTimestampSeconds,
            iat: currentTimestampSeconds,
        };

        if (delegatedUserEmail) {
            tokenPayload.sub = delegatedUserEmail;
        }

        const tokenHeaderEncoded = convertToBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
        const tokenPayloadEncoded = convertToBase64Url(JSON.stringify(tokenPayload));
        const unsignedTokenStructure = `${tokenHeaderEncoded}.${tokenPayloadEncoded}`;

        const privateSigningMaterial = await this.fetchSigningMaterial(secretKey, secretKeyFile);

        const tokenSigner = cryptographyTool.createSign('RSA-SHA256');
        tokenSigner.update(unsignedTokenStructure);
        const tokenSignatureEncoded = tokenSigner.sign(privateSigningMaterial, 'base64url');

        if (!tokenSignatureEncoded) {
            throw new Error('Failed to generate web token signature. The provided signing material might be invalid.');
        }

        const finalSignedToken = `${unsignedTokenStructure}.${tokenSignatureEncoded}`;
        diagnosticOutput('Successfully generated signed web token: %s', finalSignedToken);
        return finalSignedToken;
    }

    async fetchSigningMaterial(keyContent, keyPath) {
        if (keyContent && keyContent !== '') {
            return keyContent;
        } else if (keyPath) {
            try {
                const fileBuffer = await fileSystemModule.readFile(keyPath, { encoding: 'utf8' });
                return fileBuffer;
            } catch (readOperationError) {
                diagnosticOutput('Failed to read signing key file %s: %O', keyPath, readOperationError);
                throw new Error(`Could not read private signing key from file: ${keyPath}`);
            }
        }
        throw new Error('No valid signing key content or file path was supplied.');
    }

    async sendCredentialRequest(jwtAssertion) {
        try {
            const formParameters = new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwtAssertion
            }).toString();

            const serviceResponse = await httpAgent.post(SecureTokenProvider.OAUTH2_AUTHORIZATION_ENDPOINT, formParameters, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: 'json'
            });

            diagnosticOutput('Authorization service response: HTTP %d -> %O', serviceResponse.status, serviceResponse.data);

            if (serviceResponse.status !== 200) {
                const errorDetails = serviceResponse.data || {};
                const authenticationFailure = new Error(
                    `Authentication request failed with HTTP ${serviceResponse.status}: ${errorDetails.error || 'Unknown service error'}`
                );
                authenticationFailure.httpStatusCode = serviceResponse.status;
                authenticationFailure.responsePayload = errorDetails;
                throw authenticationFailure;
            }

            return serviceResponse.data.access_token;

        } catch (networkOrHttpError) {
            if (networkOrHttpError.response) {
                const errorDetails = networkOrHttpError.response.data || {};
                const authenticationFailure = new Error(
                    `Authorization server responded with error HTTP ${networkOrHttpError.response.status}: ${errorDetails.error || 'Unknown server error'}`
                );
                authenticationFailure.httpStatusCode = networkOrHttpError.response.status;
                authenticationFailure.responsePayload = errorDetails;
                throw authenticationFailure;
            } else if (networkOrHttpError.request) {
                throw new Error(`Network issue encountered during authorization request: ${networkOrHttpError.message}`);
            } else {
                throw new Error(`Problem setting up authorization request: ${networkOrHttpError.message}`);
            }
        }
    }
}

const tokenServiceInstance = new SecureTokenProvider();

module.exports.acquireToken = async (configData) => {
    return await tokenServiceInstance.obtainAccessCredential(configData);
};

module.exports.composeWebToken = async (configData) => {
    return await tokenServiceInstance.generateSignedWebToken(configData);
};