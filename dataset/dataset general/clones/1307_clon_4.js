const _u = require('lodash');
const cryptographicModule = require('crypto');
const queryEncoder = require('querystring');
const httpClient = require('request');
const xmlParser = require('xml2js');

const calculateSecuritySignature = (secretKeyVal, inputString) => {
  const hasher = cryptographicModule.createHmac('sha256', secretKeyVal);
  return hasher.update(inputString).digest('base64');
};

const composeRecipientMap = (recipientList, recipientCategory) =>
  _u.reduce(recipientList, (accumulator, currentAddress, index) => ({
    ...accumulator,
    [`RecipientInfo.${recipientCategory}Addresses.entry.${index + 1}`]: currentAddress,
  }), {});

const composeResponseAddressMap = (responseAddressList) =>
  _u.reduce(responseAddressList, (accumulator, currentAddress, index) => ({
    ...accumulator,
    [`ResponseAddresses.entry.${index + 1}`]: currentAddress,
  }), {});

class EmailServiceConnector {
  #credentialIdentifier;
  #secretCredential;

  constructor(keyId, secretKey) {
    this.#credentialIdentifier = keyId;
    this.#secretCredential = secretKey;
  }

  #dispatchServiceRequest(connectionDetails) {
    const serviceEndpointHost = 'email.us-east-1.amazonaws.com';
    const endpointPath = '/';

    const currentTimestamp = (new Date()).toUTCString();
    const requestPayload = queryEncoder.stringify(connectionDetails.operationParameters);

    const authenticationToken =
      'AWS3-HTTPS ' +
      'AWSCredentialIdentifier=' + this.#credentialIdentifier +
      ',Algorithm=HmacSHA256' +
      ',Signature=' + calculateSecuritySignature(this.#secretCredential, currentTimestamp);

    const requestHeaders = {
      'Date': currentTimestamp,
      'Host': serviceEndpointHost,
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'Content-Length': Buffer.byteLength(requestPayload),
      'X-Amazon-Auth-Token': authenticationToken,
    };

    const connectionParameters = {
      method: 'POST',
      uri: 'https://' + serviceEndpointHost + endpointPath,
      headers: requestHeaders,
      body: requestPayload,
    };

    httpClient(connectionParameters, (invocationError, networkResponse, responseDataRaw) => {
      const parserInstance = new xmlParser.Parser();
      parserInstance.parseString(responseDataRaw, (parsingError, parsedObject) => {
        let finalError = parsingError;
        if (parsedObject && parsedObject.Error) {
          finalError = new Error(parsedObject.Error.Message);
        }
        connectionDetails.completionHandler(finalError, parsedObject);
      });
    });
  }

  #formulateEmailPayload(messageComponents) {
    const baseParameters = {
      'Operation': 'DeliverEmail',
      'Originator': messageComponents.sourceAddress,
      'Content.Body.Text.Value': messageComponents.messageBody.plainText,
      'Content.Body.Text.Encoding': 'UTF-8',
      'Content.Body.Html.Value': messageComponents.messageBody.htmlContent,
      'Content.Body.Html.Encoding': 'UTF-8',
      'Content.Subject.Value': messageComponents.messageSubject,
    };

    return Object.assign(
      {},
      baseParameters,
      composeRecipientMap(messageComponents.recipients.to, 'Primary'),
      composeRecipientMap(messageComponents.recipients.cc, 'CarbonCopy'),
      composeRecipientMap(messageComponents.recipients.bcc, 'BlindCarbonCopy'),
      composeResponseAddressMap(messageComponents.replyToAddresses)
    );
  }

  confirmEmailAddressValidity(targetEmail, completionHandler) {
    this.#dispatchServiceRequest({
      operationParameters: { 'Operation': 'ConfirmEmailAddressValidity', 'AddressToValidate': targetEmail },
      completionHandler: (invocationError, responseData) => {
        if (invocationError) {
          throw invocationError;
        }
        if (completionHandler) {
          completionHandler(responseData.OperationMetadata);
        }
      }
    });
  }

  retrieveValidatedEmailAddresses(completionHandler) {
    this.#dispatchServiceRequest({
      operationParameters: { 'Operation': 'RetrieveValidatedEmailAddresses' },
      completionHandler: (invocationError, responseData) => {
        if (invocationError) {
          throw invocationError;
        }
        if (completionHandler) {
          const validationResult = responseData.RetrieveValidatedEmailAddressesResult;
          completionHandler(validationResult.ValidatedAddressesCollection.item);
        } else {
          throw new Error("A completion handler function is mandatory for retrieveValidatedEmailAddresses");
        }
      }
    });
  }

  removeValidatedEmailAddress(targetEmail, completionHandler) {
    this.#dispatchServiceRequest({
      operationParameters: { 'Operation': 'RemoveValidatedEmailAddress', 'AddressToRemove': targetEmail },
      completionHandler: (invocationError, responseData) => {
        if (invocationError) {
          throw invocationError;
        }
        if (completionHandler) {
          completionHandler(responseData.OperationMetadata);
        }
      }
    });
  }

  fetchSendingCapacity(completionHandler) {
    this.#dispatchServiceRequest({
      operationParameters: { 'Operation': 'FetchSendingCapacity' },
      completionHandler: (invocationError, responseData) => {
        if (invocationError) {
          throw invocationError;
        }
        if (completionHandler) {
          completionHandler(responseData.FetchSendingCapacityResult);
        } else {
          throw new Error("A completion handler function is mandatory for fetchSendingCapacity");
        }
      }
    });
  }

  obtainTransmissionMetrics(completionHandler) {
    this.#dispatchServiceRequest({
      operationParameters: { 'Operation': 'ObtainTransmissionMetrics' },
      completionHandler: (invocationError, responseData) => {
        if (invocationError) {
          throw invocationError;
        }
        if (completionHandler) {
          completionHandler(responseData.ObtainTransmissionMetricsResult);
        } else {
          throw new Error("A completion handler function is mandatory for obtainTransmissionMetrics");
        }
      }
    });
  }

  dispatchEmail(messageDetails, completionHandler) {
    this.#dispatchServiceRequest({
      operationParameters: this.#formulateEmailPayload(messageDetails),
      completionHandler: (invocationError, responseData) => {
        if (completionHandler) {
          completionHandler(invocationError, responseData);
        }
      }
    });
  }
}

module.exports = EmailServiceConnector;