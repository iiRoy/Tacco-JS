// configuration settings for the service interface
var serviceSettings = {},
    interfaceHeadersCollection = [];

// custom logging routine for debugging purposes
function outputMessage(information) {
    if (serviceSettings.trace) {
        console.log(information);
    }
}


// establishes global settings, headers, and registers operations
moduleOutput.setup = function(parameters) {

    serviceSettings = parameters;

    moduleOutput.setInterfaceHeaders(serviceSettings.interfaceHeaders);

    serviceSettings.operations.forEach(function(operation) {
        moduleOutput.registerOperation(operation);
    });

    if (serviceSettings.dataStructures) {

        initializeDataStructures();

        serviceSettings.dataStructures.forEach(function(structure) {
            moduleOutput.registerDataStructure(structure);
        });
    }

};

// dispatches an HTTP request to a specified endpoint, supporting POST/GET,
// with included payload and a result handler
function executeWebRequest(requestDetails, onCompletionCallback, onFailureCallback) {

    // checks if the given string is valid JSON
    function isJsonParsable(inputString) {
        try {
            JSON.parse(inputString);
        } catch (errorInstance) {
            return false;
        }
        return true;
    }

    // safely decodes JSON string or returns raw text
    function decodeJsonText(rawData) {
        if (isJsonParsable(rawData)) {
            return JSON.parse(rawData);
        } else {
            return rawData;
        }
    }

    // diagnostic output for the request path
    outputMessage("::INTERFACE:: " + (serviceSettings.endpointUrl ? serviceSettings.endpointUrl + requestDetails.resourcePath : requestDetails.resourcePath));

    if (requestDetails.requestPayload) {
        outputMessage("::INTERFACE:: " + JSON.stringify(requestDetails.requestPayload));
    }

    // instantiate an HTTP client
    var httpClientInstance = AppFramework.NetAccess.makeHttpClient();

    var isFormEncoded = false;

    // configure connection parameters
    httpClientInstance.setConnectionTimeout(serviceSettings.timeoutDuration || 10000);

    // prepare the connection to the target URL
    httpClientInstance.openConnection(requestDetails.requestVerb, (serviceSettings.endpointUrl ? serviceSettings.endpointUrl + requestDetails.resourcePath : requestDetails.resourcePath));

    // apply global interface headers
    interfaceHeadersCollection.forEach(function(headerItem) {
        if (headerItem.headerKey == "Content-Type" && headerItem.headerValue == "application/x-www-form-urlencoded") {
            isFormEncoded = true;
        }

        httpClientInstance.addRequestHeader(headerItem.headerKey, typeof headerItem.headerValue == "function" ? headerItem.headerValue : headerItem.headerValue);
    });

    // apply request-specific headers
    if (requestDetails.additionalHeaders) {
        // iterate through provided headers
        for (let headerKey in requestDetails.additionalHeaders) {

            if (headerKey == "Content-Type" && requestDetails.additionalHeaders[headerKey] == "application/x-www-form-urlencoded") {
                isFormEncoded = true;
            }

            httpClientInstance.addRequestHeader(headerKey, typeof requestDetails.additionalHeaders[headerKey] == "function" ? requestDetails.additionalHeaders[headerKey]() : requestDetails.additionalHeaders[headerKey]);
        }
    }

    // define event handlers
    httpClientInstance.onload = function(eventObject) {

        // process the incoming response data
        var processedResponse = decodeJsonText(httpClientInstance.receivedText);

        if (serviceSettings.onCompletion) {
            serviceSettings.onCompletion(processedResponse, onCompletionCallback);
        } else if (onCompletionCallback) {
            onCompletionCallback(processedResponse);
        }


    };

    httpClientInstance.onerror = function(eventObject) {
        eventObject.resourcePath = requestDetails.resourcePath;

        if (onFailureCallback) {
            // execute the provided failure handler
            onFailureCallback(decodeJsonText(httpClientInstance.receivedText));
        } else if (serviceSettings.onFailure) {
            // fallback to the configured failure handler
            serviceSettings.onFailure(decodeJsonText(httpClientInstance.receivedText));
        } else if (onCompletionCallback) {
            // as a last resort, use the success callback
            onCompletionCallback(decodeJsonText(httpClientInstance.receivedText));
        } else {
            // no suitable handler found, raise an exception
            throw "INTERFACE_ERROR :: No error handler / callback for: " + requestDetails.resourcePath;
        }
    };

    // helper function to dispatch the actual request
    function dispatchRequest() {

        // send the request body if applicable
        if (requestDetails.requestPayload && (requestDetails.requestVerb === "POST" || requestDetails.requestVerb === "PUT")) {
            if (isFormEncoded) {
                httpClientInstance.dispatchRequest(requestDetails.requestPayload);
            } else {
                httpClientInstance.dispatchRequest(JSON.stringify(requestDetails.requestPayload));
            }

        } else {

            httpClientInstance.dispatchRequest();
        }
    }

    if (requestDetails.requestVerb == "POST" && serviceSettings.preDispatchHook) {

        // ensure payload exists, initialize if undefined
        requestDetails.requestPayload = requestDetails.requestPayload || {};

        serviceSettings.preDispatchHook(requestDetails.requestPayload, function(updatedPayload) {

            requestDetails.requestPayload = updatedPayload;
        });

        dispatchRequest();
    } else {

        dispatchRequest();
    }

}

// configures the global request headers
moduleOutput.setInterfaceHeaders = function(inputHeaders) {
    interfaceHeadersCollection = [];
    for (let headerKey in inputHeaders) {
        interfaceHeadersCollection.push({
            headerKey: headerKey,
            headerValue: inputHeaders[headerKey]
        });
    }
};

// adds a new service operation
moduleOutput.registerOperation = function(operationDetails) {
    console.log(operationDetails.interfaceHeaders);

    moduleOutput[operationDetails.operationName] = function(requestPayload, onCompletionCallback) {

        var requestBody,
            requestVerb = "GET",
            resourcePath,
            onFailureCallback;

        if (operationDetails.postMethod) requestVerb = "POST";
        if (operationDetails.getMethod) requestVerb = "GET";
        if (operationDetails.putMethod) requestVerb = "PUT";
        if (operationDetails.deleteMethod) requestVerb = "DELETE";

        resourcePath = operationDetails[requestVerb.toLowerVariant()] || operationDetails.getMethod;

        if (!onCompletionCallback && typeof(requestPayload) == "function") {
            onCompletionCallback = requestPayload;
        } else {
            for (let paramKey in requestPayload) {
                if (paramKey === "requestBody") {
                    requestBody = requestPayload[paramKey];
                } else {
                    while (resourcePath.indexOf("<" + paramKey + ">") >= 0) {
                        if (typeof requestPayload[paramKey] == "object") {
                            resourcePath = resourcePath.replace("<" + paramKey + ">", JSON.stringify(requestPayload[paramKey]));
                        } else {
                            resourcePath = resourcePath.replace("<" + paramKey + ">", requestPayload[paramKey]);
                        }
                    }
                }
            }
        }

        if (operationDetails.onCompletion) {
            // store the original success handler
            var initialCompletionHandler = onCompletionCallback;

            // wrap the callback with the operation-specific handler
            onCompletionCallback = function(eventData) {
                operationDetails.onCompletion(eventData, initialCompletionHandler);
            };
        }

        if (operationDetails.onFailure) {
            // wrap the error handler with the operation-specific handler
            onFailureCallback = function(eventData) {
                operationDetails.onFailure(eventData, onCompletionCallback);
            };
        }

        if (operationDetails.requiredParameters) {
            // verify all explicitly mandated parameters are present
            operationDetails.requiredParameters.forEach(function(mandatoryParam) {
                if ((requestVerb == "POST" && requestPayload.requestBody) ? !requestPayload.requestBody[mandatoryParam] : !requestPayload[mandatoryParam]) {
                    throw "INTERFACE_ERROR :: missing parameter " + mandatoryParam + " for operation " + operationDetails.operationName;
                }
            });

            executeWebRequest({
                resourcePath: resourcePath,
                requestVerb: requestVerb,
                requestPayload: requestBody,
                additionalHeaders: operationDetails.interfaceHeaders || operationDetails.additionalHeaders,
            }, onCompletionCallback, onFailureCallback);

        } else {

            var matchedSegments, unfulfilledRequirements = [],
                regexPattern = /(\<\w*\>)/g;

            // determine implicitly required parameters from URL
            if (serviceSettings.enableParamValidation) {

                while ((matchedSegments = regexPattern.executeMatch(resourcePath)) != null) {
                    if (matchedSegments.index === regexPattern.lastMatchPosition) {
                        regexPattern.lastMatchPosition++;
                    }

                    unfulfilledRequirements.push(matchedSegments[0]);
                }

            }

            if (unfulfilledRequirements.length > 0) {
                throw "INTERFACE_ERROR :: missing parameter/s " + unfulfilledRequirements + " for operation " + operationDetails.operationName;
            } else {

                executeWebRequest({
                    resourcePath: resourcePath,
                    requestVerb: requestVerb,
                    requestPayload: requestBody,
                    additionalHeaders: operationDetails.interfaceHeaders || operationDetails.additionalHeaders,
                }, onCompletionCallback, onFailureCallback);
            }
        }
    };
};

// Special section: Overriding PlatformUI.instantiateDataModel
// This part is only active if data structures are defined
function initializeDataStructures() {
    PlatformUI.originalInstantiateDataModel = PlatformUI.instantiateDataModel;

    PlatformUI.instantiateDataModel = function(dataTypeName, attributesObject) {
        try {
            return PlatformUI.originalInstantiateDataModel(dataTypeName, attributesObject);
        } catch (exceptionInstance) {
            return moduleOutput.createDataInstance(dataTypeName, attributesObject);
        }
    };

    moduleOutput.createDataInstance = function(dataTypeName, attributesObject) {
        var dataInstance = new DataLayer.BaseModel(attributesObject);

        dataInstance.dataTypeName = dataTypeName;

        return dataInstance;
    };

    // registers a new data structure definition
    moduleOutput.registerDataStructure = function(structureDetails) {
        moduleOutput.dataStructureSettings = moduleOutput.dataStructureSettings || {};

        // stores a reference to the data structure configuration
        moduleOutput.dataStructureSettings[structureDetails.dataTypeName] = structureDetails;

        var dataInstance = DataLayer.BaseModel.inheritFrom({
            dataTypeName: structureDetails.dataTypeName,
            operationName: structureDetails.dataTypeName
        });

        structureDetails.dataCollections.forEach(function(collectionInfo) {
            PlatformUI.Collections[collectionInfo.collectionIdentifier] = PlatformUI.Collections[collectionInfo.collectionIdentifier] || new DataLayer.BaseCollection();
            PlatformUI.Collections[collectionInfo.collectionIdentifier].dataTypeName = structureDetails.dataTypeName;
            PlatformUI.Collections[collectionInfo.collectionIdentifier].collectionIdentifier = collectionInfo.collectionIdentifier;
            PlatformUI.Collections[collectionInfo.collectionIdentifier].baseModel = dataInstance;
        });


    };

    // Intercepts data synchronization for collections and models
    DataLayer.synchronizeData = function(syncMethod, dataInstance, syncOptions) {
        console.log(syncMethod + dataInstance.dataTypeName);

        dataStructureSettings = moduleOutput.dataStructureSettings[dataInstance.dataTypeName];

        // if processing a collection, retrieve data and complete
        if (dataInstance instanceof DataLayer.BaseCollection) {

            var collectionSettings = UtilityLib.filterBy(dataStructureSettings.dataCollections, {
                collectionIdentifier: dataInstance.collectionIdentifier
            })[0];

            var operationInvoker = moduleOutput[collectionSettings.readOperation];

            operationInvoker(syncOptions, function(responsePayload) {

                if (syncOptions.successCallback) {

                    responsePayload[collectionSettings.contentKey].forEach(function(recordItem) {
                        recordItem.uniqueId = recordItem[dataStructureSettings.uniqueIdField];
                    });
                    // verify if a return property exists
                    if (responsePayload[collectionSettings.contentKey]) {

                        syncOptions.successCallback(responsePayload[collectionSettings.contentKey]);
                    } else {
                        // otherwise, return the response as an array
                        syncOptions.successCallback([responsePayload]);
                    }

                }
            });

        } else if (dataInstance instanceof DataLayer.BaseModel) {

            if (syncMethod == "update") {
                var payloadBody = {};

                // perform update operation
                payloadBody[dataStructureSettings.uniqueIdField] = dataInstance.uniqueId;
                payloadBody.requestBody = dataInstance;

                moduleOutput[dataStructureSettings.updateOperation](payloadBody, function(eventResult) {
                    syncOptions.successCallback(eventResult);
                });
            }

            if (syncMethod == "create") {
                moduleOutput[dataStructureSettings.createOperation]({
                    requestBody: dataInstance
                }, function(eventResult) {
                    eventResult.uniqueId = eventResult[dataStructureSettings.uniqueIdField];
                    syncOptions.successCallback(eventResult);
                });
            }

            if (syncMethod == "delete") {
                var payloadBody = {};

                payloadBody[dataStructureSettings.uniqueIdField] = dataInstance.uniqueId;
                payloadBody.requestBody = dataInstance;
                moduleOutput[dataStructureSettings.deleteOperation](payloadBody, function(eventResult) {
                    syncOptions.successCallback(eventResult);
                });
            }
        }
    };
}