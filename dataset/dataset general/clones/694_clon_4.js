const crypto = require('crypto');
const https = require('https');
const { URLSearchParams } = require('url');

function establishConnection(initialSettings) {

    if (initialSettings === null || typeof initialSettings !== 'object') {
        const problemMessage = "Client initialization requires a settings object. Refer to documentation for configuration details.";
        throw new Error(problemMessage);
    }

    const connectionSettings = { ...initialSettings };

    if (connectionSettings.displayDebugInfo !== false) {
        connectionSettings.displayDebugInfo = true;
    }

    const logIfVerbose = (messageContent) => {
        if (connectionSettings.displayDebugInfo) {
            console.log(messageContent);
        }
    };

    const retrieveShopDomain = () => {
        const parts = connectionSettings.shopIdentifier.split('.');
        return parts[0] + '.myshopify.com';
    };

    const obtainRequestPort = () => 443;

    const formulateAuthLink = () => {
        const queryParameters = new URLSearchParams();
        queryParameters.append('client_id', connectionSettings.clientKey);
        queryParameters.append('scope', connectionSettings.permissionScope);
        queryParameters.append('redirect_uri', connectionSettings.returnUrl);

        return `https://${retrieveShopDomain()}/admin/oauth/authorize?${queryParameters.toString()}`;
    };

    const storeCredential = (tokenValue) => {
        connectionSettings.currentAccessToken = tokenValue;
    };

    const verifyHeaderExistence = (responseObject, headerName) => {
        return Object.prototype.hasOwnProperty.call(responseObject.headers, headerName);
    };

    const checkSignatureValidity = (receivedParameters) => {
        const incomingSignatureValue = receivedParameters['signature'];
        const parameterKeys = Object.keys(receivedParameters);

        const relevantParameters = parameterKeys.filter(paramKey => paramKey !== 'signature');

        const signatureComponents = relevantParameters
            .map(paramKey => `${paramKey}=${receivedParameters[paramKey]}`);

        const sortedComponents = signatureComponents.sort();
        const concatenatedString = connectionSettings.sharedSecret + sortedComponents.join('');

        const computedHashString = crypto.createHash('md5').update(concatenatedString).digest('hex');

        return (computedHashString === incomingSignatureValue);
    };

    const dispatchHttpRequest = (apiPath, httpMethod, requestPayload, retryAttempt = 0) => {
        return new Promise((resolve, reject) => {
            const payloadAsString = requestPayload ? JSON.stringify(requestPayload) : '';

            const requestOptions = {
                hostname: retrieveShopDomain(),
                path: apiPath,
                method: httpMethod.toLowerCase() || 'get',
                port: obtainRequestPort(),
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (connectionSettings.currentAccessToken) {
                requestOptions.headers['X-Shopify-Access-Token'] = connectionSettings.currentAccessToken;
            }

            if (['post', 'put', 'delete'].includes(requestOptions.method)) {
                requestOptions.headers['Content-Length'] = Buffer.byteLength(payloadAsString, 'utf8');
            }

            const outgoingRequest = https.request(requestOptions, (incomingResponse) => {
                logIfVerbose(`RESPONSE_STATUS: ${incomingResponse.statusCode}`);
                logIfVerbose(`RESPONSE_HEADERS: ${JSON.stringify(incomingResponse.headers)}`);

                if (incomingResponse.headers && incomingResponse.headers['http_x_shopify_shop_api_call_limit']) {
                    logIfVerbose(`API_LIMIT_HEADER: ${incomingResponse.headers['http_x_shopify_shop_api_call_limit']}`);
                }

                incomingResponse.setEncoding('utf8');
                let responseBodyAccumulator = '';

                incomingResponse.on('data', (dataChunk) => {
                    logIfVerbose(`BODY_CHUNK: ${dataChunk}`);
                    responseBodyAccumulator += dataChunk;
                });

                incomingResponse.on('end', () => {
                    let pauseDuration = 0;

                    if (incomingResponse.statusCode === 429) {
                        const delayForRateLimit = connectionSettings.rateLimitDelay || 10000;
                        logIfVerbose(`Rate limit hit (429). Retrying in ${delayForRateLimit}ms.`);
                        return setTimeout(() => {
                            dispatchHttpRequest(apiPath, httpMethod, requestPayload, retryAttempt + 1)
                                .then(resolve).catch(reject);
                        }, delayForRateLimit);
                    }

                    if (incomingResponse.statusCode === 200 && verifyHeaderExistence(incomingResponse, 'http_x_shopify_shop_api_call_limit')) {
                        const callLimitInfo = incomingResponse.headers['http_x_shopify_shop_api_call_limit'];
                        const currentApiCallCount = parseInt(callLimitInfo.split('/')[0], 10);
                        if (currentApiCallCount >= (connectionSettings.backoffThreshold || 35)) {
                            pauseDuration = connectionSettings.backoffPause || 1000;
                            logIfVerbose(`API call limit approaching. Pausing for ${pauseDuration}ms.`);
                        }
                    }

                    setTimeout(() => {
                        let parsedJsonContent = {};
                        let operationError = null;

                        try {
                            if (responseBodyAccumulator.trim() !== '') {
                                parsedJsonContent = JSON.parse(responseBodyAccumulator);
                                if (parsedJsonContent.hasOwnProperty('error') || parsedJsonContent.hasOwnProperty('errors')) {
                                    operationError = {
                                        issue: (parsedJsonContent.error || parsedJsonContent.errors),
                                        status: incomingResponse.statusCode
                                    };
                                }
                            }
                        } catch (parsingError) {
                            operationError = parsingError;
                        }

                        if (operationError) {
                            reject(operationError);
                        } else {
                            resolve({ body: parsedJsonContent, headers: incomingResponse.headers });
                        }
                    }, pauseDuration);
                });
            });

            outgoingRequest.on('error', (networkError) => {
                logIfVerbose(`NETWORK_ERROR: ${networkError.message}`);
                if (connectionSettings.enableErrorRetry && retryAttempt === 0) {
                    const errorRetryDelay = connectionSettings.errorRetryInterval || 10000;
                    logIfVerbose(`Retrying request in ${errorRetryDelay}ms due to error.`);
                    setTimeout(() => {
                        dispatchHttpRequest(apiPath, httpMethod, requestPayload, 1)
                            .then(resolve).catch(reject);
                    }, errorRetryDelay);
                } else {
                    reject(networkError);
                }
            });

            if (['post', 'put', 'delete'].includes(requestOptions.method) && payloadAsString) {
                outgoingRequest.write(payloadAsString);
            }

            outgoingRequest.end();
        });
    };

    const processTempToken = (queryParameters) => {
        return new Promise((resolve, reject) => {
            if (!checkSignatureValidity(queryParameters)) {
                return reject(new Error("Signature validation failed. Request deemed inauthentic."));
            }

            const tokenRequestPayload = {
                client_id: connectionSettings.clientKey,
                client_secret: connectionSettings.sharedSecret,
                code: queryParameters['code']
            };

            dispatchHttpRequest('/admin/oauth/access_token', 'POST', tokenRequestPayload)
                .then(({ body }) => {
                    if (body && body.access_token) {
                        storeCredential(body.access_token);
                        resolve(body);
                    } else {
                        reject(new Error("Failed to retrieve access token."));
                    }
                })
                .catch(reject);
        });
    };

    return {
        obtainAuthLink: formulateAuthLink,
        saveAccessToken: storeCredential,
        checkSignatureValidity: checkSignatureValidity,
        processTempToken: processTempToken,

        performGet: (apiPath, requestPayload = null) => {
            return dispatchHttpRequest(apiPath, 'GET', requestPayload)
                .then(({ body }) => body);
        },
        performPost: (apiPath, requestPayload) => {
            return dispatchHttpRequest(apiPath, 'POST', requestPayload)
                .then(({ body }) => body);
        },
        performPut: (apiPath, requestPayload) => {
            return dispatchHttpRequest(apiPath, 'PUT', requestPayload)
                .then(({ body }) => body);
        },
        performDelete: (apiPath, requestPayload = null) => {
            return dispatchHttpRequest(apiPath, 'DELETE', requestPayload)
                .then(({ body }) => body);
        }
    };
}

module.exports = establishConnection;