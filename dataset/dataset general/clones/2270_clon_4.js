const _globalObserverBridge = (function() {
    function _verifyObservable(item) {
        return typeof ko !== 'undefined' && ko.isObservable(item);
    }

    function _verifyWritable(item) {
        return typeof ko !== 'undefined' && ko.isWriteableObservable(item);
    }

    function _extractRawValue(item) {
        return typeof ko !== 'undefined' ? ko.utils.unwrapObservable(item) : item;
    }

    function _convertToJsonString(item) {
        return typeof ko !== 'undefined' ? ko.toJSON(item) : JSON.stringify(item);
    }

    function _convertToPlainObject(item) {
        return typeof ko !== 'undefined' ? ko.toJS(item) : JSON.parse(JSON.stringify(item));
    }

    function _deepStringify(item) {
        return typeof ko !== 'undefined' ? ko.utils.stringifyJson(item) : JSON.stringify(item);
    }

    function _establishObservable(initialPayload) {
        if (typeof ko !== 'undefined') {
            const obsRef = ko.observable(initialPayload);
            if (!obsRef.hasOwnProperty('equivalenceChecker')) {
                Object.defineProperty(obsRef, 'equivalenceChecker', {
                    writable: true,
                    value: (alpha, beta) => alpha === beta
                });
            }
            if (!obsRef.hasOwnProperty('valueHasChanged')) {
                Object.defineProperty(obsRef, 'valueHasChanged', {
                    writable: true,
                    value: () => {
                        if (typeof obsRef.valueHasMutated === 'function') {
                            obsRef.valueHasMutated();
                        }
                    }
                });
            }
            return obsRef;
        } else {
            const mockObs = function(val) {
                if (arguments.length > 0) {
                    mockObs._currentValue = val;
                }
                return mockObs._currentValue;
            };
            mockObs._currentValue = initialPayload;
            mockObs.subscribe = () => {};
            mockObs.peek = () => mockObs._currentValue;
            mockObs.hasOwnProperty = Object.prototype.hasOwnProperty;
            Object.defineProperty(mockObs, 'equivalenceChecker', {
                writable: true,
                value: (alpha, beta) => alpha === beta
            });
            Object.defineProperty(mockObs, 'valueHasChanged', {
                writable: true,
                value: () => {}
            });
            return mockObs;
        }
    }

    return {
        isObserved: _verifyObservable,
        isWritable: _verifyWritable,
        extractValue: _extractRawValue,
        toJson: _convertToJsonString,
        toFlatObject: _convertToPlainObject,
        deepStringify: _deepStringify,
        makeObserved: _establishObservable
    };
})();

const _jqueryMimicry = (function() {
    function _filterCollection(sourceCollection, conditionFunction) {
        if (typeof $ !== 'undefined' && typeof $.grep === 'function') {
            return $.grep(sourceCollection, conditionFunction);
        }
        return sourceCollection.filter(conditionFunction);
    }

    function _mergeObjects(targetObject, ...sourceObjects) {
        if (typeof $ !== 'undefined' && typeof $.extend === 'function') {
            return $.extend(targetObject, ...sourceObjects);
        }
        return Object.assign(targetObject, ...sourceObjects);
    }

    function _initiatePost(endpointUri, postPayload, successHandler, resultFormat) {
        if (typeof $ !== 'undefined' && typeof $.post === 'function') {
            return $.post(endpointUri, postPayload, successHandler, resultFormat);
        }
        console.warn('jQuery $.post not found. Simulating post request.');
        return new Promise(resolve => setTimeout(() => {
            successHandler({ status: 'SIMULATED_SUCCESS', data: postPayload });
            resolve();
        }, 100));
    }

    function _initiateGet(endpointUri, getParameters, successHandler, resultFormat) {
        if (typeof $ !== 'undefined' && typeof $.get === 'function') {
            return $.get(endpointUri, getParameters, successHandler, resultFormat);
        }
        console.warn('jQuery $.get not found. Simulating get request.');
        return new Promise(resolve => setTimeout(() => {
            successHandler({ status: 'SIMULATED_SUCCESS', data: getParameters });
            resolve();
        }, 100));
    }

    return {
        filterCollection: _filterCollection,
        mergeObjects: _mergeObjects,
        initiatePost: _initiatePost,
        initiateGet: _initiateGet
    };
})();

const _requestQueueFacade = (function() {
    function _enqueueRequest(requestPromise, requestTag) {
        if (typeof RQ !== 'undefined' && typeof RQ.add === 'function') {
            return RQ.add(requestPromise, requestTag);
        }
        console.warn('RQ.add not found. Request tracking disabled.');
        return requestPromise;
    }

    function _terminateRequests(patternRegex) {
        if (typeof RQ !== 'undefined' && typeof RQ.killByRegex === 'function') {
            return RQ.killByRegex(patternRegex);
        }
        console.warn('RQ.killByRegex not found. Request cancellation disabled.');
        return [];
    }

    return {
        enqueueRequest: _enqueueRequest,
        terminateRequests: _terminateRequests
    };
})();

const _htmlEntityDecoder = (function() {
    function _decodeText(encodedText) {
        if (encodedText.length === 0) {
            return encodedText;
        }
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(encodedText, 'text/html');
            return doc.documentElement.textContent;
        } catch (e) {
            const tempDivElement = document.createElement("div");
            tempDivElement.innerHTML = encodedText;
            return tempDivElement.childNodes.length > 0 ? tempDivElement.childNodes[0].nodeValue : encodedText;
        }
    }
    return {
        decodeText: _decodeText
    };
})();

class _IdentifierCache {
    #storedEntities = new Map();

    locateEntry(identificationKey, queryParameters) {
        const fullKey = `${identificationKey}_${_globalObserverBridge.deepStringify(queryParameters)}`;
        const found = this.#storedEntities.get(fullKey);
        return found ? found.payload : undefined; // Return only the data payload
    }

    saveEntry(identificationKey, queryParameters, dataPayload) {
        const fullKey = `${identificationKey}_${_globalObserverBridge.deepStringify(queryParameters)}`;
        this.#storedEntities.set(fullKey, {
            identity: identificationKey,
            parameters: queryParameters,
            payload: dataPayload
        });
    }
}

const _routePatternResolver = (function() {
    function _replacePlaceholders(routeTemplate, dataValues) {
        const tempAnchor = document.createElement("a");
        tempAnchor.href = routeTemplate;

        tempAnchor.pathname = tempAnchor.pathname.replace(/:([a-zA-Z0-9_]+)/g, (match, paramName) => {
            const value = dataValues[paramName];
            delete dataValues[paramName];
            return value;
        });

        return tempAnchor.href;
    }
    return {
        resolve: _replacePlaceholders
    };
})();

class ResourceEntity {
    static #universalPathRegistry = new Map();
    static #initialPropertyDefaults = new Map();
    static #ignoredCloneParameters = new Set();
    static #postActionCallbacks = new Map();
    static #globalDataStore = new _IdentifierCache();

    static #primitiveValueComparator = (firstValue, secondValue) => {
        const baseTypes = { 'undefined': true, 'boolean': true, 'number': true, 'string': true };
        const isFirstPrimitive = (firstValue === null) || baseTypes[typeof firstValue];
        return isFirstPrimitive ? firstValue === secondValue : false;
    };

    #instancePathRegistry = new Map();
    #lastKnownState = {};

    constructor(startingData = {}) {
        this.#instancePathRegistry = new Map(ResourceEntity.#universalPathRegistry);
        this.#lastKnownState = {};

        this.setupEntity(startingData);
    }

    setupEntity(initialAttributes = {}) {
        for (const attributeName in initialAttributes) {
            if (Object.prototype.hasOwnProperty.call(initialAttributes, attributeName)) {
                this[attributeName] = initialAttributes[attributeName];
            }
        }

        for (const propertyKey in this) {
            if (Object.prototype.hasOwnProperty.call(this, propertyKey) ||
                Object.prototype.hasOwnProperty.call(ResourceEntity.prototype, propertyKey)) {
                const propertyValue = this[propertyKey];

                if (typeof propertyValue === 'function' || propertyKey === 'instancePathRegistry' || propertyKey === 'lastKnownState') {
                    continue;
                }

                if (_globalObserverBridge.isObserved(propertyValue)) {
                    propertyValue.equivalenceChecker = ResourceEntity.#primitiveValueComparator;
                }

                if (!ResourceEntity.#initialPropertyDefaults.has(propertyKey)) {
                    ResourceEntity.#initialPropertyDefaults.set(propertyKey, _globalObserverBridge.extractValue(propertyValue));
                }
            }
        }
    }

    declareRoute(routeId, targetLink, isCommon = true) {
        this.#instancePathRegistry.set(routeId, targetLink);
        if (isCommon === true) {
            ResourceEntity.#universalPathRegistry.set(routeId, targetLink);
        }
    }

    retrieveAttribute(attributeKey) {
        return _globalObserverBridge.extractValue(this[attributeKey]);
    }

    assignAttributes(inputMap) {
        const currentContext = this;
        for (const keyId in inputMap) {
            if (!Object.prototype.hasOwnProperty.call(inputMap, keyId)) continue;

            let incomingValue = inputMap[keyId];
            if (typeof incomingValue === "string" && incomingValue.match(/&[^\s]*;/)) {
                incomingValue = _htmlEntityDecoder.decodeText(incomingValue);
            }

            if (_globalObserverBridge.isWritable(currentContext[keyId])) {
                if (incomingValue !== currentContext[keyId]()) {
                    currentContext[keyId](incomingValue);
                }
            } else if (currentContext[keyId] !== undefined && !_globalObserverBridge.isObserved(currentContext[keyId])) {
                currentContext[keyId] = incomingValue;
            }
        }
        return currentContext;
    }

    postData(destinationRoute, parameters = {}, successAction = null, responseFormat = "json") {
        let finalEndpoint;
        if (destinationRoute.match(/^https?:\/\//) === null) {
            finalEndpoint = this.#instancePathRegistry.get(destinationRoute);
        } else {
            finalEndpoint = destinationRoute;
        }
        return this.#performPostRequest(finalEndpoint, parameters, successAction, responseFormat);
    }

    getData(sourceRoute, parameters = {}, successAction = null, responseFormat = "json") {
        let finalEndpoint;
        if (sourceRoute.match(/^https?:\/\//) === null) {
            finalEndpoint = this.#instancePathRegistry.get(sourceRoute);
        } else {
            finalEndpoint = sourceRoute;
        }
        return this.#performGetRequest(finalEndpoint, parameters, successAction, responseFormat);
    }

    #performPostRequest(uriPath, dataParams, callbackFunction, dataType) {
        const resolvedUri = _routePatternResolver.resolve(uriPath, dataParams);
        const entityClassName = this.constructor.name;
        const hookRegistry = ResourceEntity.#postActionCallbacks;

        const apiRequest = _jqueryMimicry.initiatePost(resolvedUri, dataParams, (returnedData) => {
            try {
                if (typeof hookRegistry.get(uriPath) === "function") {
                    hookRegistry.get(uriPath)(returnedData);
                }
                if (typeof callbackFunction === "function") {
                    callbackFunction(returnedData);
                }
            } catch (err) {
                // Ignore error as per original pattern
            }
        }, dataType);

        return _requestQueueFacade.enqueueRequest(apiRequest, `operation_${entityClassName}_${new Date().getTime()}`);
    }

    #performGetRequest(uriPath, dataParams, callbackFunction, dataType) {
        const resolvedUri = _routePatternResolver.resolve(uriPath, dataParams);
        const entityClassName = this.constructor.name;
        const hookRegistry = ResourceEntity.#postActionCallbacks;
        const cacheSystem = ResourceEntity.#globalDataStore;

        const cacheActive = dataParams["__cache"] === true;
        if (cacheActive) {
            delete dataParams["__cache"];
        }

        let cachedContent = null;
        if (cacheActive) {
            cachedContent = cacheSystem.locateEntry(`${entityClassName}#${uriPath}`, dataParams);
        }

        if (cachedContent != null) {
            if (typeof callbackFunction === "function") {
                return callbackFunction(cachedContent);
            }
        } else {
            const temporaryParams = _jqueryMimicry.mergeObjects({}, dataParams);
            temporaryParams["__no_cache_buster_id"] = new Date().getTime();

            const apiRequest = _jqueryMimicry.initiateGet(resolvedUri, temporaryParams, (returnedData) => {
                if (cacheActive) {
                    cacheSystem.saveEntry(`${entityClassName}#${uriPath}`, dataParams, returnedData);
                }
                try {
                    if (typeof hookRegistry.get(uriPath) === "function") {
                        hookRegistry.get(uriPath)(returnedData);
                    }
                    if (typeof callbackFunction === "function") {
                        callbackFunction(returnedData);
                    }
                } catch (err) {
                    // Ignore error as per original pattern
                }
            }, dataType);

            return _requestQueueFacade.enqueueRequest(apiRequest, `fetch_${entityClassName}_${new Date().getTime()}`);
        }
    }

    static buildEntityList(dataItems, itemProcessor = null) {
        const entityList = [];
        for (const singleItem of dataItems) {
            const newEntity = new this();
            if (typeof itemProcessor === "function") {
                newEntity.assignAttributes(itemProcessor(singleItem));
            } else {
                newEntity.assignAttributes(singleItem);
            }
            entityList.push(newEntity);
        }
        return entityList;
    }

    clearAttributes() {
        const resetValues = {};
        ResourceEntity.#initialPropertyDefaults.forEach((val, key) => {
            resetValues[key] = val;
        });
        return this.assignAttributes(resetValues);
    }

    refreshData(completionHook) {
        return this.viewRecord((responsePayload) => {
            if (responsePayload && responsePayload.status === "SUCCESS") {
                this.assignAttributes(responsePayload);
            }
            if (typeof completionHook === "function") {
                completionHook(responsePayload);
            }
        });
    }

    exportToJson(optionsConfig) {
        return _globalObserverBridge.toJson(this.replicateInstance(optionsConfig));
    }

    exportToPlainObject(optionsConfig) {
        return _globalObserverBridge.toFlatObject(this.replicateInstance(optionsConfig));
    }

    replicateInstance(replicationOptions = {}) {
        const excludedAttributes = {
            'instancePathRegistry': false,
            'lastKnownState': false
        };

        ResourceEntity.#ignoredCloneParameters.forEach(param => {
            excludedAttributes[param] = false;
        });

        const finalOptions = _jqueryMimicry.mergeObjects({}, excludedAttributes, replicationOptions);
        const duplicatedObject = {};

        for (const propIdentifier in this) {
            if (!Object.prototype.hasOwnProperty.call(this, propIdentifier)) continue;

            if (finalOptions[propIdentifier] === true || finalOptions[propIdentifier] === undefined) {
                duplicatedObject[propIdentifier] = this.retrieveAttribute(propIdentifier);
            }
        }
        return duplicatedObject;
    }

    saveCurrentState() {
        this.#lastKnownState = this.exportToPlainObject();
        return this.#lastKnownState;
    }

    restorePreviousState() {
        this.assignAttributes(this.#lastKnownState);
        this.#lastKnownState = {};
        return this;
    }

    initiateBatchUpdate() {
        const modifiedPropertyKeys = [];
        for (const propIdentifier in this) {
            if (!Object.prototype.hasOwnProperty.call(this, propIdentifier)) continue;
            const propertyRef = this[propIdentifier];
            if (_globalObserverBridge.isObserved(propertyRef) && typeof propertyRef.equivalenceChecker === "function") {
                propertyRef.equivalenceChecker = () => true;
                modifiedPropertyKeys.push(propIdentifier);
            }
        }
        return modifiedPropertyKeys;
    }

    finalizeBatchUpdate() {
        const updatedPropertyKeys = [];
        for (const propIdentifier in this) {
            if (!Object.prototype.hasOwnProperty.call(this, propIdentifier)) continue;
            const propertyRef = this[propIdentifier];
            if (_globalObserverBridge.isObserved(propertyRef) && typeof propertyRef.equivalenceChecker === "function") {
                propertyRef.equivalenceChecker = ResourceEntity.#primitiveValueComparator;
                if (typeof propertyRef.valueHasChanged === "function") {
                    propertyRef.valueHasChanged();
                    updatedPropertyKeys.push(propIdentifier);
                }
            }
        }
        return updatedPropertyKeys;
    }

    isTransient() {
        const val = this.retrieveAttribute("id");
        return val === null || val === undefined || val === "";
    }

    isValid() {
        return true;
    }

    persistRecord(...operationArgs) {
        if (this.isValid() === true) {
            if (this.isTransient() === true) {
                return this.createRecord(...operationArgs);
            } else {
                return this.updateRecord(...operationArgs);
            }
        } else {
            const [requestData, requestHandler] = this.#processOperationArguments(operationArgs);
            if (typeof requestHandler === "function") {
                return requestHandler({ status: "ERROR", message: "Invalid object" });
            }
        }
    }

    #processOperationArguments(inputArguments) {
        let payload = {};
        let handler = null;
        if (typeof inputArguments[0] === "function") {
            handler = inputArguments[0];
        } else if (typeof inputArguments[0] === "object") {
            payload = inputArguments[0];
            if (typeof inputArguments[1] === "function") {
                handler = inputArguments[1];
            }
        }
        return [payload, handler];
    }

    createRecord(...operationArgs) {
        const [requestData, requestHandler] = this.#processOperationArguments(operationArgs);
        const finalPayload = _jqueryMimicry.mergeObjects(requestData, this.exportToPlainObject());
        return this.postData("create", finalPayload, requestHandler);
    }

    updateRecord(...operationArgs) {
        const [requestData, requestHandler] = this.#processOperationArguments(operationArgs);
        const finalPayload = _jqueryMimicry.mergeObjects(requestData, this.exportToPlainObject());
        return this.postData("update", finalPayload, requestHandler);
    }

    removeRecord(...operationArgs) {
        const [requestData, requestHandler] = this.#processOperationArguments(operationArgs);
        const finalPayload = _jqueryMimicry.mergeObjects(requestData, this.exportToPlainObject());
        return this.postData("destroy", finalPayload, requestHandler);
    }

    viewRecord(...operationArgs) {
        const [requestData, requestHandler] = this.#processOperationArguments(operationArgs);
        const finalPayload = _jqueryMimicry.mergeObjects(requestData, { id: this.retrieveAttribute("id") });
        return this.getData("show", finalPayload, requestHandler);
    }

    listRecords(...operationArgs) {
        const [requestData, requestHandler] = this.#processOperationArguments(operationArgs);
        return this.getData("index", requestData, requestHandler);
    }

    static terminateAllPending(entityTag) {
        return _requestQueueFacade.terminateRequests(new RegExp(`^operation_|fetch_${entityTag}_`));
    }
}