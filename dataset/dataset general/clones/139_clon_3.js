const secureHttp = require('https');
const utilityModule = require('util');

function deepObjectMerge(targetObj, sourceObj) {
    if (typeof targetObj !== 'object' || targetObj === null) {
        targetObj = {};
    }
    if (typeof sourceObj !== 'object' || sourceObj === null) {
        return targetObj;
    }

    const mergedResult = { ...targetObj };

    for (const propKey in sourceObj) {
        if (Object.prototype.hasOwnProperty.call(sourceObj, propKey)) {
            const sourceValue = sourceObj[propKey];
            const targetValue = mergedResult[propKey];

            if (typeof sourceValue === 'object' && sourceValue !== null &&
                typeof targetValue === 'object' && targetValue !== null &&
                !Array.isArray(sourceValue) && !Array.isArray(targetValue)) {
                mergedResult[propKey] = deepObjectMerge(targetValue, sourceValue);
            } else {
                mergedResult[propKey] = sourceValue;
            }
        }
    }
    return mergedResult;
}

function createStandardRequestEnvelope(customLanguage = 'en_US', detailLevel = 'ReturnAll') {
    return {
        requestEnvelope: {
            errorLanguage: customLanguage,
            detailLevel: detailLevel,
            clientRequestId: utilityModule.randomUUID ? utilityModule.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        }
    };
}

class PaymentClientError extends Error {
    constructor(message, httpStatus, responseBody = null, errorCode = null) {
        super(message);
        this.name = 'PaymentClientError';
        this.httpStatusCode = httpStatus;
        this.responseContent = responseBody;
        this.apiErrorCode = errorCode;
        Error.captureStackTrace(this, PaymentClientError);
    }
}

function performSecureHttpRequest(requestConfig, completionHandler) {
    const isDebugMode = requestConfig.debugMode || false;
    const requestMethod = 'POST';
    const requestHeaders = requestConfig.headers || {};

    let requestBodyString;
    if (requestConfig.requestPayload === undefined || requestConfig.requestPayload === null) {
        requestBodyString = '';
    } else if (typeof requestConfig.requestPayload !== 'string') {
        try {
            requestBodyString = JSON.stringify(requestConfig.requestPayload);
            requestHeaders['Content-Type'] = 'application/json';
        } catch (serializationError) {
            return completionHandler(new PaymentClientError('Failed to serialize request payload.', 0, null, 'PAYLOAD_SERIALIZATION_ERROR'));
        }
    } else {
        requestBodyString = requestConfig.requestPayload;
        if (!requestHeaders['Content-Type']) {
            requestHeaders['Content-Type'] = 'text/plain';
        }
    }

    requestHeaders['Content-Length'] = Buffer.byteLength(requestBodyString, 'utf8');

    const httpOptions = {
        hostname: requestConfig.hostname,
        path: requestConfig.path,
        method: requestMethod,
        headers: requestHeaders,
        timeout: requestConfig.timeout || 10000
    };

    if (isDebugMode) {
        console.debug('Outgoing HTTP Request:', {
            method: httpOptions.method,
            hostname: httpOptions.hostname,
            path: httpOptions.path,
            headers: httpOptions.headers,
            body: requestBodyString.substring(0, 500) + (requestBodyString.length > 500 ? '...' : '')
        });
    }

    const outgoingRequest = secureHttp.request(httpOptions, (incomingResponse) => {
        let responseBuffer = '';
        incomingResponse.setEncoding('utf8');

        incomingResponse.on('data', (chunk) => {
            responseBuffer += chunk;
        });

        incomingResponse.on('end', () => {
            if (isDebugMode) {
                console.debug('Incoming HTTP Response:', {
                    statusCode: incomingResponse.statusCode,
                    headers: incomingResponse.headers,
                    body: responseBuffer.substring(0, 500) + (responseBuffer.length > 500 ? '...' : '')
                });
            }

            if (incomingResponse.statusCode >= 400) {
                const errorMessage = `HTTP Error ${incomingResponse.statusCode}: ${incomingResponse.statusMessage || 'Unknown error'}`;
                return completionHandler(new PaymentClientError(errorMessage, incomingResponse.statusCode, responseBuffer, 'HTTP_STATUS_ERROR'));
            }

            completionHandler(null, {
                httpStatusCode: incomingResponse.statusCode,
                responseBodyContent: responseBuffer
            });
        });
    });

    outgoingRequest.on('error', (networkError) => {
        if (isDebugMode) {
            console.error('HTTP Request Network Error:', networkError);
        }
        completionHandler(new PaymentClientError(`Network connectivity issue: ${networkError.message}`, 0, null, 'NETWORK_ERROR'));
    });

    outgoingRequest.on('timeout', () => {
        outgoingRequest.destroy(new PaymentClientError('Request timed out after ' + httpOptions.timeout + 'ms', 0, null, 'REQUEST_TIMEOUT'));
        if (isDebugMode) {
            console.warn('HTTP Request Timeout:', httpOptions.timeout + 'ms');
        }
    });

    if (requestBodyString) {
        outgoingRequest.write(requestBodyString);
    }

    outgoingRequest.end();
}

const accountServiceEndpoints = [
    'AddBankAccount',
    'AddPaymentCard',
    'CheckComplianceStatus',
    'CreateAccount',
    'GetUserAgreement',
    'GetVerifiedStatus',
    'SetFundingSourceConfirmed',
    'UpdateComplianceStatus'
];

const paymentServiceEndpoints = [
    'CancelPreapproval',
    'ConvertCurrency',
    'ExecutePayment',
    'GetFundingPlans',
    'GetShippingAddresses',
    'PreapprovalDetails',
    'SetPaymentOptions'
];

class PayPalClient {
    constructor(initialSettings) {
        if (!initialSettings) {
            throw new PaymentClientError('Client configuration is mandatory.', 0, null, 'CONFIG_MISSING');
        }
        const requiredKeys = ['userId', 'password', 'signature'];
        for (const key of requiredKeys) {
            if (!initialSettings[key]) {
                throw new PaymentClientError(`Missing required configuration setting: ${key}`, 0, null, `CONFIG_MISSING_${key.toUpperCase()}`);
            }
        }
        if (!initialSettings.appId && !initialSettings.sandbox) {
            throw new PaymentClientError('Configuration must include an application ID or enable sandbox mode.', 0, null, 'CONFIG_MISSING_APPID_OR_SANDBOX');
        }

        const baseClientSettings = {
            payloadFormat: 'JSON',
            resultFormat: 'JSON',
            isSandboxMode: false,
            prodServiceHost: 'svcs.paypal.com',
            sandboxServiceHost: 'svcs.sandbox.paypal.com',
            applicationIdentifier: 'APP-80W284485P519543T',
            requestTimeoutMs: 15000,
            debugLoggingEnabled: false,

            _urlTemplates: {
                paymentApproval: 'https://www.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=%s',
                sandboxPaymentApproval: 'https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=%s',
                preapproval: 'https://www.paypal.com/webscr?cmd=_ap-preapproval&preapprovalkey=%s',
                sandboxPreapproval: 'https://www.sandbox.paypal.com/webscr?cmd=_ap-preapproval&preapprovalkey=%s'
            }
        };

        this.clientSettings = Object.freeze(deepObjectMerge(baseClientSettings, initialSettings));

        if (this.clientSettings.debugLoggingEnabled && typeof console.debug === 'undefined') {
            console.debug = console.log;
        }
    }

    get _currentServiceHost() {
        return this.clientSettings.isSandboxMode ? this.clientSettings.sandboxServiceHost : this.clientSettings.prodServiceHost;
    }

    _buildAuthHeaders(currentSettings) {
        const headers = {
            'X-PAYPAL-SECURITY-USERID': currentSettings.userId,
            'X-PAYPAL-SECURITY-PASSWORD': currentSettings.password,
            'X-PAYPAL-SECURITY-SIGNATURE': currentSettings.signature,
            'X-PAYPAL-APPLICATION-ID': currentSettings.applicationIdentifier,
            'X-PAYPAL-REQUEST-DATA-FORMAT': currentSettings.payloadFormat,
            'X-PAYPAL-RESPONSE-DATA-FORMAT': currentSettings.resultFormat
        };

        if (currentSettings.sandboxEmailAddress) {
            headers['X-PAYPAL-SANDBOX-EMAIL-ADDRESS'] = currentSettings.sandboxEmailAddress;
        }
        if (currentSettings.deviceIpAddress) {
            headers['X-PAYPAL-DEVICE-IPADDRESS'] = currentSettings.deviceIpAddress;
        }
        return headers;
    }

    _processApiResponse(rawResponse, currentSettings) {
        let parsedContent = rawResponse.responseBodyContent;
        const httpStatus = rawResponse.httpStatusCode;

        if (currentSettings.resultFormat === 'JSON') {
            try {
                parsedContent = JSON.parse(parsedContent);
            } catch (jsonParseError) {
                throw new PaymentClientError('Invalid JSON response received from API.', httpStatus, rawResponse.responseBodyContent, 'JSON_PARSE_ERROR');
            }
        }

        if (httpStatus < 200 || httpStatus >= 300) {
            const apiError = parsedContent.responseEnvelope && parsedContent.responseEnvelope.error
                ? parsedContent.responseEnvelope.error[0].message : 'Unknown API error';
            throw new PaymentClientError(`API returned HTTP status ${httpStatus}: ${apiError}`, httpStatus, parsedContent, 'API_HTTP_ERROR');
        }

        parsedContent.httpStatusCode = httpStatus;

        const recognizedAckStatuses = new Set(['Success', 'SuccessWithWarning']);
        if (!parsedContent.responseEnvelope || !recognizedAckStatuses.has(parsedContent.responseEnvelope.ack)) {
            const ackStatus = parsedContent.responseEnvelope ? parsedContent.responseEnvelope.ack : 'MISSING_ACK';
            throw new PaymentClientError(`API operation not successful. Acknowledgment status: ${ackStatus}.`, httpStatus, parsedContent, 'API_ACK_FAILURE');
        }

        return parsedContent;
    }

    invokeServiceOperation(fullServicePath, requestPayload, completionHandler) {
        const currentSettings = this.clientSettings;

        const requestOptions = {
            hostname: this._currentServiceHost,
            path: `/${fullServicePath}`,
            requestPayload: requestPayload,
            headers: this._buildAuthHeaders(currentSettings),
            timeout: currentSettings.requestTimeoutMs,
            debugMode: currentSettings.debugLoggingEnabled
        };

        performSecureHttpRequest(requestOptions, (operationError, serviceResponse) => {
            if (operationError) {
                return completionHandler(operationError);
            }

            try {
                const processedResult = this._processApiResponse(serviceResponse, currentSettings);
                completionHandler(null, processedResult);
            } catch (processingIssue) {
                completionHandler(processingIssue);
            }
        });
    }

    _composeRequestPayload(customParams) {
        return deepObjectMerge(createStandardRequestEnvelope(), customParams);
    }

    _getPaymentApprovalUrl(paymentIdentifier) {
        const urlTemplate = this.clientSettings.isSandboxMode
            ? this.clientSettings._urlTemplates.sandboxPaymentApproval
            : this.clientSettings._urlTemplates.paymentApproval;
        return utilityModule.format(urlTemplate, paymentIdentifier);
    }

    _getPreapprovalPageUrl(preapprovalKey) {
        const urlTemplate = this.clientSettings.isSandboxMode
            ? this.clientSettings._urlTemplates.sandboxPreapproval
            : this.clientSettings._urlTemplates.preapproval;
        return utilityModule.format(urlTemplate, preapprovalKey);
    }

    retrievePaymentOptions(paymentIdentifier, completionHandler) {
        if (!paymentIdentifier) {
            return completionHandler(new PaymentClientError('Payment identifier ("paymentKeyId") is required.', 0, null, 'MISSING_PAYMENT_ID'));
        }

        const requestPayload = this._composeRequestPayload({ paymentKeyId: paymentIdentifier });
        this.invokeServiceOperation('AdaptivePayments/GetPaymentOptions', requestPayload, completionHandler);
    }

    queryPaymentDetails(identificationParams, completionHandler) {
        if (!identificationParams || (!identificationParams.paymentKeyId && !identificationParams.transactionReference && !identificationParams.trackingIdentifier)) {
            return completionHandler(new PaymentClientError('One of "paymentKeyId", "transactionReference", or "trackingIdentifier" must be provided.', 0, null, 'MISSING_IDENTIFIER'));
        }

        const requestPayload = this._composeRequestPayload(identificationParams);
        this.invokeServiceOperation('AdaptivePayments/PaymentDetails', requestPayload, completionHandler);
    }

    initiatePayment(paymentData, completionHandler) {
        this.invokeServiceOperation('AdaptivePayments/Pay', paymentData, (operationError, serviceResult) => {
            if (operationError) {
                return completionHandler(operationError, serviceResult);
            }

            if (serviceResult && serviceResult.paymentExecStatus === 'CREATED' && serviceResult.payKey) {
                serviceResult.paymentApprovalLink = this._getPaymentApprovalUrl(serviceResult.payKey);
            }

            return completionHandler(null, serviceResult);
        });
    }

    startPreapproval(preapprovalData, completionHandler) {
        this.invokeServiceOperation('AdaptivePayments/Preapproval', preapprovalData, (operationError, serviceResult) => {
            if (operationError) {
                return completionHandler(operationError, serviceResult);
            }

            if (serviceResult && serviceResult.preapprovalKey) {
                serviceResult.preapprovalLink = this._getPreapprovalPageUrl(serviceResult.preapprovalKey);
            }

            return completionHandler(null, serviceResult);
        });
    }

    processRefund(refundParameters, completionHandler) {
        if (!refundParameters || (!refundParameters.paymentKeyId && !refundParameters.transactionReference && !refundParameters.trackingIdentifier)) {
            return completionHandler(new PaymentClientError('One of "paymentKeyId", "transactionReference", or "trackingIdentifier" must be provided for refund.', 0, null, 'MISSING_REFUND_IDENTIFIER'));
        }

        const requestPayload = this._composeRequestPayload(refundParameters);
        this.invokeServiceOperation('AdaptivePayments/Refund', requestPayload, completionHandler);
    }

    static _defineDynamicApiMethod(serviceName, operationName) {
        const clientMethodAlias = operationName.charAt(0).toLowerCase() + operationName.slice(1);
        const fullServicePath = `${serviceName}/${operationName}`;

        if (Object.prototype.hasOwnProperty.call(PayPalClient.prototype, clientMethodAlias)) {
            // Check if debug logging is enabled before accessing clientSettings
            // This is a static method, so 'this' refers to PayPalClient, not an instance.
            // A more robust way would be to pass a logger or debug flag.
            // For this clone, we'll assume `console` is always available.
            if (console.warn) {
                 console.warn(`Attempted to redefine method: ${clientMethodAlias}. Skipping.`);
            }
            return;
        }

        Object.defineProperty(PayPalClient.prototype, clientMethodAlias, {
            value: function (requestPayload, completionHandler) {
                this.invokeServiceOperation(fullServicePath, requestPayload, completionHandler);
            },
            writable: true,
            configurable: true,
            enumerable: false
        });
    }
}

paymentServiceEndpoints.forEach(operationName => {
    try {
        PayPalClient._defineDynamicApiMethod('AdaptivePayments', operationName);
    } catch (e) {
        console.error(`Failed to define AdaptivePayments method ${operationName}:`, e.message);
    }
});

accountServiceEndpoints.forEach(operationName => {
    try {
        PayPalClient._defineDynamicApiMethod('AdaptiveAccounts', operationName);
    } catch (e) {
        console.error(`Failed to define AdaptiveAccounts method ${operationName}:`, e.message);
    }
});

module.exports = PayPalClient;