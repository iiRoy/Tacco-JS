const jsonWebSignature = require('jws');
const fileSystemPromises = require('fs').promises;
const makeRequest = require('node-fetch');

function createServiceAgent(config, onReady) {
    let _cachedToken = null;
    let _tokenExpiresAt = null; // Milliseconds timestamp
    let _issuer = config.iss;
    let _scope = config.scope;
    let _subject = config.sub;
    let _principal = config.prn;
    let _privateKey = null;

    async function performApiCall(assertionContent) {
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion': assertionContent
            }).toString()
        };

        const apiEndpoint = 'https://accounts.google.com/o/oauth2/token';
        const apiResponse = await makeRequest(apiEndpoint, fetchOptions);

        if (!apiResponse.ok) {
            let errorDetails = `Service communication error: ${apiResponse.status} ${apiResponse.statusText}`;
            try {
                const errorJson = await apiResponse.json();
                errorDetails += `: ${errorJson.error_description || errorJson.error || JSON.stringify(errorJson)}`;
            } catch (jsonParseError) {
                // If JSON parsing fails, use the default error message
            }
            throw new Error(errorDetails);
        }

        const dataPayload = await apiResponse.json();

        if (dataPayload.error) {
            throw new Error(dataPayload.error_description || dataPayload.error);
        }

        return dataPayload;
    }

    async function acquireNewCredential() {
        const currentTimestampSeconds = Math.floor(Date.now() / 1000);

        const claimsObject = {
            iss: _issuer,
            scope: _scope,
            aud: 'https://accounts.google.com/o/oauth2/token',
            exp: currentTimestampSeconds + 3600, // Token expires in 1 hour
            iat: currentTimestampSeconds
        };

        if (_subject) {
            claimsObject.sub = _subject;
        }

        if (_principal) {
            claimsObject.prn = _principal;
        }

        const signedAssertion = jsonWebSignature.sign({
            header: { alg: 'RS256', typ: 'JWT' },
            payload: claimsObject,
            secret: _privateKey
        });

        let tokenData;
        try {
            tokenData = await performApiCall(signedAssertion);
        } catch (issue) {
            _cachedToken = null;
            _tokenExpiresAt = null;
            throw issue;
        }

        _cachedToken = tokenData.access_token;
        _tokenExpiresAt = (currentTimestampSeconds + 3600) * 1000; // Store expiry in milliseconds

        return _cachedToken;
    }

    async function retrieveAccessString() {
        if (_cachedToken && _tokenExpiresAt && (Date.now() < _tokenExpiresAt)) {
            return _cachedToken;
        } else {
            return acquireNewCredential();
        }
    }

    const loadKeyMaterial = async () => {
        if (config.keyFilePath) {
            _privateKey = await fileSystemPromises.readFile(config.keyFilePath, 'utf8');
        } else if (config.signingKey) {
            _privateKey = config.signingKey;
        } else {
            throw new Error("Initialization error: 'signingKey' or 'keyFilePath' option must be supplied!");
        }
    };

    (async () => {
        try {
            await loadKeyMaterial();
            onReady(null, { retrieveAccessString });
        } catch (initializationError) {
            onReady(initializationError);
        }
    })();
}

module.exports = createServiceAgent;