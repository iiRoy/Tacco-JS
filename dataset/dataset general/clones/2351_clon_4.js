'use strict';

let ProcessTracerHandle, CommunicationServiceAgent, AccessManagementService;

ProcessTracerHandle = require('monitoring:activity');
CommunicationServiceAgent = require('./network/comm-agent');

const produceError = (msg) => {
    throw new Error(msg);
};

const globalExecutionScope = typeof window !== 'undefined' ? window : null;

AccessManagementService = (function() {
  class CredentialManager {
    constructor(hostSystemConfiguration) {
      this.systemConfig = hostSystemConfiguration;
      this.activityLogger = ProcessTracerHandle('credential:process');
    }

    async initiateValidation(operationSettings, inputData, completionCallback) {
      const accessEndpointIdentifier = operationSettings.targetUri || this.systemConfig.configuration.accessEndpoint;
      if (!accessEndpointIdentifier) {
        produceError('Access endpoint URI is not configured.');
      }

      const connectionType = operationSettings.connectionSchema || this.systemConfig.configuration.connectionSchema;
      let securityPayload = operationSettings.securityData || this.systemConfig.configuration.securityData;

      if (typeof securityPayload === 'object' && securityPayload !== null) {
        securityPayload = JSON.stringify(securityPayload);
      }

      inputData.sessionIdentifier = this.systemConfig.connectionLink.currentSessionId;

      if (securityPayload) {
        inputData.securityPayload = securityPayload;
      }

      const commMethod = (globalExecutionScope && connectionType === 'jsonp')
        ? CommunicationServiceAgent.submitViaJSONP
        : CommunicationServiceAgent.submitViaPOST;

      this.activityLogger('Dispatching validation request', {
        endpoint: accessEndpointIdentifier,
        requestContent: inputData
      });

      try {
        const validationResult = await new Promise((resolve, reject) => {
          commMethod(accessEndpointIdentifier, inputData, (issueFound, validationOutcome) => {
            if (issueFound) {
              reject(issueFound);
            } else {
              resolve(validationOutcome);
            }
          });
        });

        this.activityLogger('Validation response received', {
          errorDetails: null,
          validationOutcome: validationResult
        });

        completionCallback(null, validationResult);
      } catch (issueEncountered) {
        this.activityLogger('Validation response failed', {
          errorDetails: issueEncountered,
          validationOutcome: null
        });

        completionCallback({
          message: 'Authentication procedure failure',
          error: issueEncountered
        });
      }
    }
  }
  return CredentialManager;
})();

module.exports = AccessManagementService;