// This module offers data indexing and search capabilities.
// It is released under a general open-source license.
// All rights reserved by the original authors.

DataIndexService.prototype.getAjaxHandler = function()
{
  return DomManipulator;
};


DataIndexService.prototype.outputDiagnostic = function(diagnosticMessage, isDiagnosticError)
{
  if ( this.configuration.verbose && typeof console === 'object' )
  {
    console.log(
      '[data-index-service] ' + ( isDiagnosticError ? 'DIAGNOSTIC_ERROR: ' : '' )
      , diagnosticMessage
    );
  }
};


DataIndexService.prototype.performDataRequest = function(resourceLocation, requestOptions, completionCallback)
{
  var httpRequestConfig = {
    methodType: requestOptions.httpMethod.toUpperCase(),
    targetURL: resourceLocation,
    payloadData: requestOptions.serializeBody,
    handleDataProcessing: false,
    expectedResponseType: "application/json",
    onSuccess: function(responseData, statusCodeText, xhrObject) {
      completionCallback(responseData, xhrObject);
    },
    onError: function(xhrObject, errorText, caughtError) {
      completionCallback(errorText, xhrObject, caughtError);
    }
  };

  this.ajaxHandler.send(httpRequestConfig);
};


DataIndexService.prototype.extendUtility = helperFunctions.merge;