var secureHttp = require('https')
  , utilityTools = require('util');

var accountOpsList =
  [
    'AddBankAccount',
    'AddPaymentCard',
    'CheckComplianceStatus',
    'CreateAccount',
    'GetUserAgreement',
    'GetVerifiedStatus',
    'SetFundingSourceConfirmed',
    'UpdateComplianceStatus'
  ];

var paymentOpsList =
  [
    'CancelPreapproval',
    'ConvertCurrency',
    'ExecutePayment',
    'GetFundingPlans',
    'GetShippingAddresses',
    'PreapprovalDetails',
    'SetPaymentOptions'
  ];

function combineProps(targetObj, sourceObj) {
  for (var propKey in sourceObj) {
    try {
      if (sourceObj[propKey].constructor === Object) {
        targetObj[propKey] = combineProps(targetObj[propKey], sourceObj[propKey]);
      } else {
        targetObj[propKey] = sourceObj[propKey];
      }
    } catch (mergeErr) {
      targetObj[propKey] = sourceObj[propKey];
    }
  }
  return targetObj;
}

function initialRequestEnvelope() {
  return {
    requestContext: {
      issueLocale: 'en_US',
      infoGranularity: 'ReturnAll'
    }
  };
}

function sendSecureRequest(requestConfig, completionHandler) {
  requestConfig.method = 'POST';
  requestConfig.headers = requestConfig.headers || {};

  var requestData = (typeof requestConfig.data !== 'string') ? JSON.stringify(requestConfig.data) : requestConfig.data;

  requestConfig.headers['Content-Length'] = Buffer.byteLength(requestData);

  var httpRequest = secureHttp.request(requestConfig);

  httpRequest.on('response', function (httpResponse) {
    var receivedBody = '';
    httpResponse.setEncoding('utf8');

    httpResponse.on('data', function (dataSegment) {
      receivedBody += dataSegment;
    });

    httpResponse.on('end', function () {
      return completionHandler(null, {
        statusCode: httpResponse.statusCode,
        body: receivedBody
      });
    });
  });

  httpRequest.on('error', function (requestError) {
    completionHandler(requestError);
  });

  if (requestData) {
    httpRequest.write(requestData);
  }

  httpRequest.end();
}

var FinancialGateway = function (settings) {
  if (!settings) throw new Error('Configuration object is mandatory');
  if (!settings.userId) throw new Error('Configuration must include userId');
  if (!settings.password) throw new Error('Configuration must include password');
  if (!settings.signature) throw new Error('Configuration must include signature');
  if (!settings.appId && !settings.sandbox) throw new Error('Configuration must include appId');

  var baseSettings = {
    inputFormat: 'JSON',
    outputFormat: 'JSON',
    testMode: false,
    liveHost: 'svcs.paypal.com',
    testHost: 'svcs.sandbox.paypal.com',
    applicationIdentifier: 'APP-80W284485P519543T',
    authorizationLink: 'https://www.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=%s',
    testAuthorizationLink: 'https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=%s',
    preAuthLink: 'https://www.paypal.com/webscr?cmd=_ap-preapproval&preapprovalkey=%s',
    testPreAuthLink: 'https://www.sandbox.paypal.com/webscr?cmd=_ap-preapproval&preapprovalkey=%s'
  };

  this.config = combineProps(baseSettings, settings);
};

FinancialGateway.prototype.invokeService = function (serviceEndpoint, requestPayload, resultHandler) {
  var currentSettings = this.config;

  var connectionOptions = {
    hostname: currentSettings.testMode ? currentSettings.testHost : currentSettings.liveHost,
    path: '/' + serviceEndpoint,
    data: requestPayload,
    headers: {
      'X-PAYPAL-SECURITY-USERID': currentSettings.userId,
      'X-PAYPAL-SECURITY-PASSWORD': currentSettings.password,
      'X-PAYPAL-SECURITY-SIGNATURE': currentSettings.signature,
      'X-PAYPAL-APPLICATION-ID': currentSettings.applicationIdentifier,
      'X-PAYPAL-REQUEST-DATA-FORMAT': currentSettings.inputFormat,
      'X-PAYPAL-RESPONSE-DATA-FORMAT': currentSettings.outputFormat
    }
  };

  if (currentSettings.sandboxEmailAddress)
    connectionOptions.headers['X-PAYPAL-SANDBOX-EMAIL-ADDRESS'] = currentSettings.sandboxEmailAddress;

  if (currentSettings.deviceIpAddress)
    connectionOptions.headers['X-PAYPAL-DEVICE-IPADDRESS'] = currentSettings.deviceIpAddress;

  sendSecureRequest(connectionOptions, function (operationError, serviceResponse) {
    if (operationError) {
      return resultHandler(operationError);
    }

    var responseBody = serviceResponse.body;
    var httpStatus = serviceResponse.statusCode;

    if (currentSettings.outputFormat === 'JSON') {
      try {
        responseBody = JSON.parse(responseBody);
      } catch (parseError) {
        var processingIssue = new Error('Invalid JSON Response Received');
        processingIssue.response = responseBody;
        processingIssue.responseStatus = serviceResponse.statusCode;
        return resultHandler(processingIssue);
      }
    }

    if (httpStatus < 200 || httpStatus >= 300) {
      operationError = new Error('Response Status: ' + httpStatus);
      operationError.response = responseBody;
      operationError.responseStatus = httpStatus;
      return resultHandler(operationError);
    }

    responseBody.responseStatus = httpStatus;

    if (/^(Success|SuccessWithWarning)$/.test(responseBody.responseEnvelope.ack)) {
      resultHandler(null, responseBody);
    } else {
      var processingIssue = new Error('Response ack is ' + responseBody.responseEnvelope.ack + '. Check the response for more info');
      return resultHandler(processingIssue, responseBody);
    }
  });
};

FinancialGateway.prototype.retrievePaymentChoice = function (paymentIdentifier, resultProcessor) {
  if (!paymentIdentifier) {
    return resultProcessor(new Error('Required "paymentIdentifier"'));
  }

  var requestData = initialRequestEnvelope();
  requestData.payKey = paymentIdentifier;

  this.invokeService('AdaptivePayments/GetPaymentOptions', requestData, resultProcessor);
};

FinancialGateway.prototype.fetchPaymentInfo = function (criteria, completionCallback) {
  if (!criteria.payKey && !criteria.transactionId && !criteria.trackingId) {
    return completionCallback(new Error('Required "payKey" or "transactionId" or "trackingId" on first param'));
  }

  var mergedData = combineProps(initialRequestEnvelope(), criteria);

  this.invokeService('AdaptivePayments/PaymentDetails', mergedData, completionCallback);
};

FinancialGateway.prototype.initiatePayment = function (transactionData, responseCallback) {
  var gatewayConfig = this.config;

  this.invokeService('AdaptivePayments/Pay', transactionData, function (paymentError, paymentResult) {
    if (paymentError) {
      return responseCallback(paymentError, paymentResult);
    }

    if (paymentResult.paymentExecStatus === 'CREATED') {
      var approvalDestination = gatewayConfig.testMode ? gatewayConfig.testAuthorizationLink : gatewayConfig.authorizationLink;
      paymentResult.paymentApprovalUrl = utilityTools.format(approvalDestination, paymentResult.payKey);
    }

    return responseCallback(null, paymentResult);
  });
};

FinancialGateway.prototype.requestPreAuthorization = function (preAuthData, finalCallback) {
  var gatewayConfig = this.config;

  this.invokeService('AdaptivePayments/Preapproval', preAuthData, function (preAuthError, preAuthResult) {
    if (preAuthError) {
      return finalCallback(preAuthError, preAuthResult);
    }

    if (preAuthResult.preapprovalKey) {
      var preAuthDestination = gatewayConfig.testMode ? gatewayConfig.testPreAuthLink : gatewayConfig.preAuthLink;
      preAuthResult.preapprovalUrl = utilityTools.format(preAuthDestination, preAuthResult.preapprovalKey);
    }

    return finalCallback(null, preAuthResult);
  });
};

FinancialGateway.prototype.processRefund = function (refundCriteria, refundCallback) {
  if (!refundCriteria.payKey && !refundCriteria.transactionId && !refundCriteria.trackingId) {
    return refundCallback(new Error('Required "payKey" or "transactionId" or "trackingId" on first param'));
  }

  var refundRequestData = combineProps(initialRequestEnvelope(), refundCriteria);

  this.invokeService('AdaptivePayments/Refund', refundRequestData, refundCallback);
};

paymentOpsList.forEach(function (operationName) {
  var memberFunctionName = operationName.charAt(0).toLowerCase() + operationName.slice(1);
  var serviceFunctionName = 'AdaptivePayments/' + operationName;
  FinancialGateway.prototype[memberFunctionName] = function (callData, callHandler) {
    this.invokeService(serviceFunctionName, callData, callHandler);
  };
});

accountOpsList.forEach(function (operationName) {
  var memberFunctionName = operationName.charAt(0).toLowerCase() + operationName.slice(1);
  var serviceFunctionName = 'AdaptiveAccounts/' + operationName;
  FinancialGateway.prototype[memberFunctionName] = function (callData, callHandler) {
    this.invokeService(serviceFunctionName, callData, callHandler);
  };
});

module.exports = FinancialGateway;