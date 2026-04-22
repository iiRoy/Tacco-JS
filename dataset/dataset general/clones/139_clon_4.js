const httpCore = require('https'); // Renamed from 'https'

// Helper for deep merging objects, replacing the original 'merge' function.
// Uses a functional recursive approach with Object.entries and reduce.
function deepCombine(baseObject, newProperties) {
    const combinedResult = { ...baseObject }; // Start with a shallow copy

    for (const key in newProperties) {
        if (Object.prototype.hasOwnProperty.call(newProperties, key)) {
            // Check if both properties are non-null, non-array objects before recursing
            const isObject = val => val && typeof val === 'object' && !Array.isArray(val);
            if (isObject(newProperties[key]) && isObject(combinedResult[key])) {
                combinedResult[key] = deepCombine(combinedResult[key], newProperties[key]);
            } else {
                combinedResult[key] = newProperties[key]; // Overwrite or add
            }
        }
    }
    return combinedResult;
}

// Helper for simple string formatting, replacing 'util.format' for '%s'
function substitutePlaceholders(templateString, ...replacements) {
    let replacementIndex = 0;
    return templateString.replace(/%s/g, () => {
        if (replacementIndex < replacements.length) {
            return String(replacements[replacementIndex++]);
        }
        return '%s'; // If no replacement, leave original %s
    });
}

// Helper for making HTTPS POST requests, replacing 'httpsPost'
// Uses Promises/async-await instead of callbacks for a different control flow.
async function makeNetworkRequest(requestConfiguration) {
    return new Promise((resolve, reject) => {
        const { targetHost, targetPath, payloadData, requestHeaders } = requestConfiguration;

        const requestOptions = {
            hostname: targetHost,
            path: targetPath,
            method: 'POST',
            headers: requestHeaders || {},
        };

        // Ensure payload is a string and calculate byte length
        const serializedPayload = (typeof payloadData !== 'string') ? JSON.stringify(payloadData) : payloadData;
        requestOptions.headers['Content-Length'] = Buffer.byteLength(serializedPayload);

        const clientRequest = httpCore.request(requestOptions, (serverResponse) => {
            let responseBuffer = '';
            serverResponse.setEncoding('utf8');

            serverResponse.on('data', (chunk) => {
                responseBuffer += chunk;
            });

            serverResponse.on('end', () => {
                resolve({
                    statusValue: serverResponse.statusCode,
                    bodyContent: responseBuffer
                });
            });
        });

        clientRequest.on('error', (err) => {
            reject(err);
        });

        if (serializedPayload) {
            clientRequest.write(serializedPayload);
        }

        clientRequest.end();
    });
}

// Default request envelope, replacing 'defaultPayload'
const defaultSystemEnvelope = Object.freeze({
    requestEnvelope: {
        errorLanguage: 'en_US',
        detailLevel: 'ReturnAll'
    }
});

// Main class, replacing 'Paypal'
class FinancialGateway {
    #settings; // Private class field for configuration

    constructor(clientConfiguration) {
        if (!clientConfiguration) throw new Error('Configuration object is mandatory');
        if (!clientConfiguration.userIdentifier) throw new Error('Configuration must provide userIdentifier');
        if (!clientConfiguration.passcode) throw new Error('Configuration must provide passcode');
        if (!clientConfiguration.authSignature) throw new Error('Configuration must provide authSignature');
        if (!clientConfiguration.applicationId && !clientConfiguration.isSandboxMode) throw new Error('Configuration must provide applicationId');

        const defaultGatewaySettings = {
            requestDataFormat: 'JSON',
            responseDataFormat: 'JSON',
            isSandboxMode: false,
            productionDomain: 'svcs.paypal.com',
            sandboxDomain: 'svcs.sandbox.paypal.com',
            applicationId: 'APP-99999999999999999', // Divergent ID
            paymentApprovalTemplate: 'https://www.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=%s',
            sandboxPaymentApprovalTemplate: 'https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=%s',
            preApprovalTemplate: 'https://www.paypal.com/webscr?cmd=_ap-preapproval&preapprovalkey=%s',
            sandboxPreApprovalTemplate: 'https://www.sandbox.paypal.com/webscr?cmd=_ap-preapproval&preapprovalkey=%s'
        };

        this.#settings = deepCombine(defaultGatewaySettings, clientConfiguration);
    }

    // Core API call logic, replacing 'callApi', using async/await and private method
    async #performApiCall(endpointPath, requestPayload) {
        const currentSettings = this.#settings;

        const requestDetails = {
            targetHost: currentSettings.isSandboxMode ? currentSettings.sandboxDomain : currentSettings.productionDomain,
            targetPath: '/' + endpointPath,
            payloadData: requestPayload,
            requestHeaders: {
                'X-PAYPAL-SECURITY-USERID': currentSettings.userIdentifier,
                'X-PAYPAL-SECURITY-PASSWORD': currentSettings.passcode,
                'X-PAYPAL-SECURITY-SIGNATURE': currentSettings.authSignature,
                'X-PAYPAL-APPLICATION-ID': currentSettings.applicationId,
                'X-PAYPAL-REQUEST-DATA-FORMAT': currentSettings.requestDataFormat,
                'X-PAYPAL-RESPONSE-DATA-FORMAT': currentSettings.responseDataFormat
            }
        };

        if (currentSettings.sandboxEmailAccount)
            requestDetails.requestHeaders['X-PAYPAL-SANDBOX-EMAIL-ADDRESS'] = currentSettings.sandboxEmailAccount;

        if (currentSettings.clientIpAddress)
            requestDetails.requestHeaders['X-PAYPAL-DEVICE-IPADDRESS'] = currentSettings.clientIpAddress;

        try {
            const { statusValue, bodyContent } = await makeNetworkRequest(requestDetails);

            let processedBody = bodyContent;
            if (currentSettings.responseDataFormat === 'JSON') {
                try {
                    processedBody = JSON.parse(processedBody);
                } catch (e) {
                    const parseError = new Error('Invalid JSON data received');
                    parseError.rawResponse = bodyContent;
                    parseError.httpStatus = statusValue;
                    throw parseError;
                }
            }

            if (statusValue < 200 || statusValue >= 300) {
                const httpError = new Error('HTTP Status: ' + statusValue);
                httpError.responseBody = processedBody;
                httpError.httpStatus = statusValue;
                throw httpError;
            }

            // Attach HTTP status to the response object, as done in original
            processedBody.httpStatus = statusValue;

            // Check 'ack' status; using direct comparison instead of regex
            const ackStatus = processedBody?.responseEnvelope?.ack;
            if (ackStatus === 'Success' || ackStatus === 'SuccessWithWarning') {
                return processedBody;
            } else {
                const apiError = new Error(`API response acknowledgement is '${ackStatus}'. See responseBody for details`);
                apiError.responseBody = processedBody;
                throw apiError;
            }

        } catch (err) {
            throw err; // Re-throw errors for upstream handling
        }
    }

    // Cloned specific API methods, explicitly defined instead of dynamic generation.
    // All methods are now async and throw errors instead of using callbacks.

    async fetchPaymentOptions(keyForPayment) { // Clone of getPaymentOptions
        if (!keyForPayment) {
            throw new Error('Mandatory "keyForPayment" parameter missing');
        }
        const requestData = { ...defaultSystemEnvelope }; // Clone default envelope
        requestData.payKey = keyForPayment;
        return await this.#performApiCall('AdaptivePayments/GetPaymentOptions', requestData);
    }

    async retrievePaymentDetails(queryParameters) { // Clone of paymentDetails
        if (!queryParameters.payKey && !queryParameters.transactionId && !queryParameters.trackingId) {
            throw new Error('One of "payKey", "transactionId", or "trackingId" is required');
        }
        const requestData = deepCombine({ ...defaultSystemEnvelope }, queryParameters);
        return await this.#performApiCall('AdaptivePayments/PaymentDetails', requestData);
    }

    async executePayment(paymentData) { // Clone of pay
        const currentSettings = this.#settings;
        const response = await this.#performApiCall('AdaptivePayments/Pay', paymentData);

        if (response.paymentExecStatus === 'CREATED') {
            const baseUrl = currentSettings.isSandboxMode ? currentSettings.sandboxPaymentApprovalTemplate : currentSettings.paymentApprovalTemplate;
            response.paymentApprovalUrl = substitutePlaceholders(baseUrl, response.payKey);
        }
        return response;
    }

    async establishPreapproval(preapprovalData) { // Clone of preapproval
        const currentSettings = this.#settings;
        const response = await this.#performApiCall('AdaptivePayments/Preapproval', preapprovalData);

        if (response.preapprovalKey) {
            const baseUrl = currentSettings.isSandboxMode ? currentSettings.sandboxPreApprovalTemplate : currentSettings.preApprovalTemplate;
            response.preapprovalUrl = substitutePlaceholders(baseUrl, response.preapprovalKey);
        }
        return response;
    }

    async processRefund(refundParameters) { // Clone of refund
        if (!refundParameters.payKey && !refundParameters.transactionId && !refundParameters.trackingId) {
            throw new Error('One of "payKey", "transactionId", or "trackingId" is required for refund');
        }
        const requestData = deepCombine({ ...defaultSystemEnvelope }, refundParameters);
        return await this.#performApiCall('AdaptivePayments/Refund', requestData);
    }

    // Explicitly defined Adaptive Payments Methods (replacing forEach loop)
    async cancelPreapproval(data) { return await this.#performApiCall('AdaptivePayments/CancelPreapproval', data); }
    async convertCurrency(data) { return await this.#performApiCall('AdaptivePayments/ConvertCurrency', data); }
    async performPaymentExecution(data) { return await this.#performApiCall('AdaptivePayments/ExecutePayment', data); } // Renamed to avoid clash with executePayment above
    async retrieveFundingPlans(data) { return await this.#performApiCall('AdaptivePayments/GetFundingPlans', data); }
    async retrieveShippingAddresses(data) { return await this.#performApiCall('AdaptivePayments/GetShippingAddresses', data); }
    async getPreapprovalDetails(data) { return await this.#performApiCall('AdaptivePayments/PreapprovalDetails', data); }
    async configurePaymentOptions(data) { return await this.#performApiCall('AdaptivePayments/SetPaymentOptions', data); }

    // Explicitly defined Adaptive Accounts Methods (replacing forEach loop)
    async registerBankAccount(data) { return await this.#performApiCall('AdaptiveAccounts/AddBankAccount', data); }
    async registerPaymentCard(data) { return await this.#performApiCall('AdaptiveAccounts/AddPaymentCard', data); }
    async queryComplianceStatus(data) { return await this.#performApiCall('AdaptiveAccounts/CheckComplianceStatus', data); }
    async generateAccount(data) { return await this.#performApiCall('AdaptiveAccounts/CreateAccount', data); }
    async retrieveUserAgreement(data) { return await this.#performApiCall('AdaptiveAccounts/GetUserAgreement', data); }
    async checkVerificationStatus(data) { return await this.#performApiCall('AdaptiveAccounts/GetVerifiedStatus', data); }
    async confirmFundingSource(data) { return await this.#performApiCall('AdaptiveAccounts/SetFundingSourceConfirmed', data); }
    async refreshComplianceStatus(data) { return await this.#performApiCall('AdaptiveAccounts/UpdateComplianceStatus', data); }
}

module.exports = FinancialGateway;