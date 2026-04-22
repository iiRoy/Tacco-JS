if (!window.Nexus) {
    window.Nexus = {};

    window.Nexus.Config = {
        baseEndpoint: 'http://' + window.location.host,
        globalFaultHandler: {
            default: (faultMessage, faultCode, reqObject) => { /* console.error("Global system fault:", faultMessage, faultCode); */ }
        },
        formTransformer: function(elementSet) { return elementSet; }
    };

    const createPrototypicalObject = (baseObject) => {
        function IntermediateConstructor() {}
        IntermediateConstructor.prototype = baseObject;
        return new IntermediateConstructor();
    };

    const SystemBroadcaster = (() => {
        const eventListeners = new Map();
        return {
            emit: (eventLabel, dataPayload) => {
                if (eventListeners.has(eventLabel)) {
                    eventListeners.get(eventLabel).forEach(handlerFn => {
                        try { handlerFn(dataPayload, eventLabel); } catch (err) { console.error("Broadcaster handler error:", err); }
                    });
                }
            },
            register: (eventLabel, handlerFn) => {
                if (!eventListeners.has(eventLabel)) {
                    eventListeners.set(eventLabel, new Set());
                }
                eventListeners.get(eventLabel).add(handlerFn);
                return () => eventListeners.get(eventLabel).delete(handlerFn);
            }
        };
    })();

    window.Nexus.Toolkit = {
        identifyType: (valueToCheck) => {
            const typeString = typeof valueToCheck;
            if (typeString === 'object') {
                if (valueToCheck) {
                    if (Array.isArray(valueToCheck)) {
                        return 'array';
                    }
                } else {
                    return 'null';
                }
            }
            return typeString;
        },
        processInputPayload: (inputSource, operationContext) => {
            if (typeof inputSource === 'function') {
                return inputSource.call(operationContext);
            }
            if (inputSource instanceof HTMLElement || (typeof jQuery !== 'undefined' && inputSource instanceof jQuery)) {
                return window.Nexus.Toolkit.extractFormFields(inputSource);
            }
            return inputSource;
        },
        transformToQueryString: (dataStructure, baseKey = '') => {
            const segments = [];
            const dataType = window.Nexus.Toolkit.identifyType(dataStructure);

            if (dataType === 'array') {
                dataStructure.forEach(item => {
                    const encoded = window.Nexus.Toolkit.transformToQueryString(item, baseKey ? `${baseKey}[]` : '[]');
                    if (encoded !== null) segments.push(encoded);
                });
            } else if (dataType === 'object') {
                for (const key in dataStructure) {
                    if (Object.prototype.hasOwnProperty.call(dataStructure, key)) {
                        const encoded = window.Nexus.Toolkit.transformToQueryString(dataStructure[key], baseKey ? `${baseKey}[${encodeURIComponent(key)}]` : encodeURIComponent(key));
                        if (encoded !== null) segments.push(encoded);
                    }
                }
            } else if (dataType !== 'null') {
                return `${baseKey}=${encodeURIComponent(dataStructure)}`;
            }
            return segments.length ? segments.join('&') : null;
        },
        extractFormFields: (formElement, keyPrefix) => {
            const collectedData = {};
            const nativeForm = (typeof jQuery !== 'undefined' && formElement instanceof jQuery) ? formElement[0] : formElement;
            const elements = Array.from(nativeForm.elements || []);

            elements
                .filter(elem => elem.name && !elem.disabled &&
                    (elem.checked || /select|textarea/i.test(elem.nodeName) || /text|hidden|password|search/i.test(elem.type)))
                .filter(window.Nexus.Config.formTransformer)
                .forEach(elem => {
                    const value = elem.value;
                    if (value !== null) {
                        if (elem.name.endsWith('[]')) {
                            const rootKey = elem.name.slice(0, -2);
                            if (!collectedData[rootKey]) {
                                collectedData[rootKey] = [];
                            }
                            if (value !== "") {
                                collectedData[rootKey].push(value);
                            }
                        } else {
                            collectedData[elem.name] = value;
                        }
                    }
                });

            return keyPrefix ? { [keyPrefix]: collectedData } : collectedData;
        },
        assembleResourcePath: (segmentPart, entityReference) => {
            let currentPathFragment = segmentPart || "";
            currentPathFragment = entityReference.resourceSegment() + currentPathFragment;
            if (entityReference.parentEntity) {
                currentPathFragment = window.Nexus.Toolkit.assembleResourcePath(currentPathFragment, entityReference.parentEntity);
            }
            return currentPathFragment;
        },
        generateEventIdentifier: (handlerDetails) => `${handlerDetails.module.label}.${handlerDetails.operationName}`,
        getCurrentUnixTimestamp: () => Math.floor(Date.now() / 1000),
        countObjectEntries: (targetObject) => Object.keys(targetObject).length,
        locateActionHandler: (actionString, contextObject) => {
            const parts = actionString.split('.');
            if (parts.length === 2) {
                const [moduleName, functionName] = parts;
                const module = window.Nexus.Modules.ControllerContainer[moduleName] || window.Nexus.Modules.ViewContainer[moduleName] || window.Nexus.Modules.HelperContainer[moduleName];
                if (module && typeof module[functionName] === 'function') {
                    let preHook = () => {};
                    if (module.preExecutionHook) {
                        preHook = module[module.preExecutionHook];
                    }
                    return { module: module, handler: module[functionName], operationName: functionName, preCheck: preHook };
                }
            } else if (contextObject && typeof contextObject[actionString] === 'function') {
                return { module: contextObject, handler: contextObject[actionString], operationName: actionString, preCheck: () => {} };
            }
            if (actionString.startsWith("http://") || actionString.startsWith("https://")) {
                return { module: { type: 'external' }, handler: () => { window.location.href = actionString; }, operationName: 'redirection', preCheck: () => {} };
            }
            return { module: null, handler: () => { console.warn(`Action handler not found for: ${actionString}`); }, operationName: 'unknown', preCheck: () => {} };
        }
    };

    class DataResponseProcessor {
        constructor(successAction, errorAction, activeOperation) {
            this.onSuccess = successAction;
            this.onFailure = errorAction || {};
            this.currentOperation = activeOperation;
        }

        async handleFailure(xhrObject, statusText) {
            const executionContext = this.currentOperation ? this.currentOperation.displayComponent : this;
            let failureMessage = "";

            switch (xhrObject.status) {
                case 0:
                    failureMessage = "No connection to server; verify network status.";
                    break;
                case 200:
                    failureMessage = statusText === 'timeout' ? "Server request timed out." : "Server response parsing error.";
                    break;
                default:
                    try {
                        failureMessage = JSON.parse(xhrObject.responseText);
                    } catch (e) {
                        failureMessage = `HTTP Error ${xhrObject.status}: ${xhrObject.statusText}`;
                    }
            }

            const parameters = [failureMessage, xhrObj.status, xhrObj];

            if (typeof this.onFailure === 'function') {
                this.onFailure.apply(executionContext, parameters);
                return;
            }

            if (this.onFailure.all) {
                this.onFailure.all.apply(executionContext, parameters);
                return;
            }

            if (this.onFailure[xhrObject.status]) {
                this.onFailure[xhrObject.status].apply(executionContext, parameters);
                return;
            }

            if (window.Nexus.Config.globalFaultHandler[xhrObject.status]) {
                window.Nexus.Config.globalFaultHandler[xhrObject.status].apply(executionContext, parameters);
            }

            window.Nexus.Config.globalFaultHandler.default.apply(executionContext, parameters);
        }
    }

    class ResourceInterface {
        constructor(linkedEntity) {
            this.entityRef = linkedEntity;
        }

        fetchData(dataPayload, successCallback, errorCallback, options) {
            return this.dispatchRequest(null, 'GET', dataPayload, successCallback, errorCallback, options);
        }

        submitData(dataPayload, successCallback, errorCallback, options) {
            return this.dispatchRequest(null, 'POST', dataPayload, successCallback, errorCallback, options);
        }

        amendData(dataPayload, successCallback, errorCallback, options) {
            return this.dispatchRequest(null, 'PUT', dataPayload, successCallback, errorCallback, options);
        }

        deleteData(successCallback, errorCallback, options) {
            return this.dispatchRequest(null, 'DELETE', {}, successCallback, errorCallback, options);
        }

        getEntityPath(specificPath, entityReference) {
            if (!entityReference) { entityReference = this.entityRef; }
            return window.Nexus.Toolkit.assembleResourcePath(specificPath, entityReference);
        }

        dispatchRequest(requestUri, httpMethod, requestPayload, successProcessor, errorProcessor, options) {
            requestPayload = requestPayload || {};
            let currentActiveOperation = typeof window.Nexus.activeOperation === 'undefined' ? false : window.Nexus.activeOperation;

            if (currentActiveOperation) {
                requestPayload = currentActiveOperation.requestPayload = window.Nexus.Toolkit.processInputPayload(requestPayload, currentActiveOperation);
                errorProcessor = errorProcessor || currentActiveOperation.retrieveOption('on_error_hook');
            }

            errorProcessor = errorProcessor || (() => {});

            const responseHandler = new DataResponseProcessor(successProcessor, errorProcessor, currentActiveOperation);

            if (!requestUri) {
                requestUri = window.Nexus.Config.baseEndpoint + this.getEntityPath();
            }

            const fetchConfiguration = {
                method: httpMethod,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                cache: 'no-cache',
                ...options
            };

            let bodyContent = null;
            if (httpMethod !== 'GET' && httpMethod !== 'HEAD') {
                bodyContent = JSON.stringify(requestPayload);
            } else if (requestPayload) {
                const queryString = window.Nexus.Toolkit.transformToQueryString(requestPayload);
                if (queryString) {
                    requestUri += (requestUri.includes('?') ? '&' : '?') + queryString;
                }
            }
            if (bodyContent) {
                fetchConfiguration.body = bodyContent;
            }

            if (currentActiveOperation) {
                currentActiveOperation.preRequestHook();
            }

            return fetch(requestUri, fetchConfiguration)
                .then(response => {
                    if (currentActiveOperation) {
                        currentActiveOperation.postRequestHook();
                    }
                    if (!response.ok) {
                        const errorResponseDataPromise = response.json().catch(() => response.text()).then(data => ({
                            status: response.status,
                            statusText: response.statusText,
                            responseText: data
                        }));
                        return Promise.reject(errorResponseDataPromise);
                    }
                    return response.json();
                })
                .then(data => {
                    responseHandler.onSuccess.apply(currentActiveOperation || this, [data]);
                })
                .catch(async error => {
                    const resolvedError = await error;
                    if (resolvedError && resolvedError.status) {
                        responseHandler.handleFailure(resolvedError, resolvedError.statusText);
                    } else {
                        responseHandler.handleFailure({ status: 0, statusText: error.message, responseText: '' }, error.message);
                    }
                });
        }
    }

    class WorkflowContext {
        constructor(triggerSource, eventData, displayContext, behaviorOptions, completionHandler) {
            this.eventTargetElement = triggerSource;
            this.eventDetails = eventData;
            this.displayComponent = displayContext;
            this.behaviorConfig = behaviorOptions;
            this.requestPayload = {};
            this.actionHandlerDetails = window.Nexus.Toolkit.locateActionHandler(this.behaviorConfig.action, this.displayComponent);
            this.activeFetchCount = 0;
            this.contextIdentifier = window.Nexus.Toolkit.getCurrentUnixTimestamp();
            this.eventStopperFunction = null;
            this.actualEventTarget = eventData ? eventData.target : null;
            this.finalCompletionHandler = completionHandler;

            if (triggerSource && triggerSource.attributes) {
                Array.from(triggerSource.attributes).forEach(attr => {
                    if (attr.nodeName.endsWith('_id')) {
                        this[attr.nodeName] = parseInt(attr.nodeValue, 10);
                    }
                });
            }
        }

        proceedTo(subsequentAction) {
            const self = this;
            return (receivedData) => {
                self.requestPayload = receivedData;
                self.actionHandlerDetails = window.Nexus.Toolkit.locateActionHandler(`${self.actionHandlerDetails.module.label}.${subsequentAction}`, self.actionHandlerDetails.module);
                window.Nexus.activeOperation = self;
                self.executeWorkflow();
                if (self.activeFetchCount === 0) { self.completeWorkflow(); }
                delete window.Nexus.activeOperation;
            };
        }

        notifyListeners(payloadData) {
            this.requestPayload = payloadData;
            const notificationLabel = window.Nexus.Toolkit.generateEventIdentifier(this.actionHandlerDetails);
            if (this.behaviorConfig.subscribe) {
                this.displayComponent[this.behaviorConfig.callback].apply(this.displayComponent, [this], notificationLabel);
            }
            SystemBroadcaster.emit(notificationLabel, this);
        }

        collectParameters(prefixKey, scopeElement) {
            prefixKey = prefixKey || this.behaviorConfig.payloadPrefix;
            if (this.behaviorConfig.payloadContext) {
                scopeElement = this.behaviorConfig.payloadContext instanceof HTMLElement ? this.behaviorConfig.payloadContext : this.retrieveOption('payloadContext');
            }
            scopeElement = scopeElement || this.displayComponent.elementNode;

            let collectedParams = window.Nexus.Toolkit.extractFormFields(scopeElement, prefixKey);

            if (this.behaviorConfig.payloadProcessor) {
                const processorFunction = this.retrieveOption('payloadProcessor');
                collectedParams = processorFunction(collectedParams);
            }
            return collectedParams;
        }

        retrieveOption(optionKey) {
            const setting = this.behaviorConfig[optionKey];
            if (setting === undefined || setting === false) return false;
            if (setting === null || window.Nexus.Toolkit.identifyType(setting) === 'object') return setting;
            if (window.Nexus.Toolkit.identifyType(setting) === 'string') {
                const resolved = window.Nexus.Toolkit.locateActionHandler(setting, this.displayComponent);
                return resolved.handler;
            }
            return false;
        }

        executeWorkflow() {
            try {
                this.displayComponent.activeWorkflows[this.contextIdentifier] = this;
                if (this.actionHandlerDetails.module.category === 'display' || this.actionHandlerDetails.module.category === 'utility') {
                    this.actionHandlerDetails.handler.apply(this.displayComponent, [this]);
                } else {
                    this.moduleAgent = this.actionHandlerDetails.module;
                    this.actionHandlerDetails.preCheck.apply(this);
                    this.actionHandlerDetails.handler.apply(this);
                }
            } catch (exception) {
                if (exception === 'terminate') { return; }
                throw exception;
            }
        }

        preRequestHook() {
            if (this.behaviorConfig.onBeforeHttpRequest) {
                window.Nexus.Toolkit.locateActionHandler(this.behaviorConfig.onBeforeHttpRequest, this.displayComponent).handler.apply(this.displayComponent, [this]);
            }
            this.activeFetchCount++;
            if (this.behaviorConfig.blockEvents && this.activeFetchCount === 1) { this.activateEventBlocker(); }
            if (this.behaviorConfig.displayLoader) { this.displayComponent.showLoaderIndicator(); }
        }

        postRequestHook() {
            this.activeFetchCount--;
            if (this.behaviorConfig.onAfterHttpRequest) {
                window.Nexus.Toolkit.locateActionHandler(this.behaviorConfig.onAfterHttpRequest, this.displayComponent).handler.apply(this.displayComponent, [this]);
            }
            if (this.activeFetchCount === 0) {
                if (this.behaviorConfig.blockEvents) { this.deactivateEventBlocker(); }
                if (this.displayComponent.countActiveWorkflows() === 1) {
                    const postCompletion = this.behaviorConfig.onAllRequestsComplete || this.displayComponent.hideLoaderIndicator;
                    postCompletion.apply(this.displayComponent);
                }
                this.completeWorkflow();
            }
        }

        completeWorkflow() {
            this.releaseSelf();
        }

        releaseSelf() {
            delete this.displayComponent.activeWorkflows[this.contextIdentifier];
        }

        activateEventBlocker() {
            if (this.behaviorConfig.liveEventHandling) {
                this.eventStopperFunction = (ev) => { ev.stopImmediatePropagation(); return false; };
                this.actualEventTarget.addEventListener(this.eventDetails.type, this.eventStopperFunction, true);
            } else {
                this.eventTargetElement.removeEventListener(this.eventDetails.type, this.finalCompletionHandler);
            }
        }

        deactivateEventBlocker() {
            if (this.behaviorConfig.liveEventHandling) {
                this.actualEventTarget.removeEventListener(this.eventDetails.type, this.eventStopperFunction, true);
            } else {
                this.eventTargetElement.addEventListener(this.eventDetails.type, this.finalCompletionHandler);
            }
        }
    }

    const BaseEntityPrototype = {
        label: null,
        category: 'dataModel',
        resourceLink: null,
        relatedEntities: {},
        isStored: false,

        query: function(...queryArgs) {
            const firstArgument = queryArgs[0];
            const argumentType = window.Nexus.Toolkit.identifyType(firstArgument);

            if (argumentType === 'number') {
                const entityInstance = this.retrieveEntityInstance(firstArgument);
                const [, successHandler, errorHandler, configuration] = queryArgs;
                return successHandler ? entityInstance.resourceLink.fetchData(null, successHandler, errorHandler, configuration) : entityInstance;
            } else if (firstArgument === 'all') {
                const secondArgument = queryArgs[1];
                if (window.Nexus.Toolkit.identifyType(secondArgument) === 'function') {
                    const [, successHandler, errorHandler, configuration] = queryArgs;
                    return this.resourceLink.fetchData(null, successHandler, errorHandler, configuration);
                } else {
                    const [, dataPayload, successHandler, errorHandler, configuration] = queryArgs;
                    return this.resourceLink.fetchData(dataPayload, successHandler, errorHandler, configuration);
                }
            }
            throw new Error("Invalid query parameters.");
        },

        retrieveEntityInstance: function(entityId) {
            const instance = createPrototypicalObject(this);
            instance.entityId = entityId;
            instance.resourceLink = new ResourceInterface(instance);
            instance.isStored = true;
            return instance;
        },

        establishRecord: function(dataPayload, successHandler, errorHandler, configuration) {
            if (!this.isStored) {
                return this.resourceLink.submitData(dataPayload, successHandler, errorHandler, configuration);
            }
        },

        modifyRecord: function(dataPayload, successHandler, errorHandler, configuration) {
            if (this.isStored) {
                return this.resourceLink.amendData(dataPayload, successHandler, errorHandler, configuration);
            }
        },

        abolishRecord: function(successHandler, errorHandler, configuration) {
            if (this.isStored) {
                return this.resourceLink.deleteData(successHandler, errorHandler, configuration);
            }
        },

        resourceSegment: function() {
            if (this.entityId) {
                return `/${this.label}/${this.entityId}`;
            }
            return `/${this.label}`;
        }
    };

    window.Nexus.ModelRegister = function(entityLabel, inheritedBase, entityDefinition) {
        let inheritedRelations = {};
        let currentEntityDef = {};

        if (typeof inheritedBase === 'string') {
            const parentModel = window.Nexus.ModelRegister.registeredEntities[inheritedBase];
            if (parentModel && parentModel.relatedEntities) {
                inheritedRelations = parentModel.relatedEntities;
            }
            currentEntityDef = entityDefinition;
        } else {
            currentEntityDef = inheritedBase;
        }

        const newEntity = createPrototypicalObject(BaseEntityPrototype);
        newEntity.label = entityLabel;
        newEntity.resourceLink = new ResourceInterface(newEntity);

        newEntity.relatedEntities = { ...inheritedRelations, ...currentEntityDef.relatedEntities };
        Object.assign(newEntity, currentEntityDef);

        window.Nexus.ModelRegister.registeredEntities[entityLabel] = newEntity;
    };
    window.Nexus.ModelRegister.registeredEntities = {};

    window.Nexus.Modules = {};
    window.Nexus.Modules.ControllerContainer = {};
    window.Nexus.Modules.ViewContainer = {};
    window.Nexus.Modules.HelperContainer = {};

    window.Nexus.Modules.ControllerContainer.SampleProcessor = {
        label: 'SampleProcessor',
        category: 'controller',
        preExecutionHook: 'beforeAction',
        beforeAction: function() { /* console.log("SampleProcessor: beforeAction hook"); */ },
        doSomething: function() { /* console.log("SampleProcessor: doSomething action"); */ }
    };

    if (typeof window.jQuery === 'undefined') {
        window.jQuery = {
            makeArray: (arr) => Array.from(arr),
            extend: (target, ...sources) => Object.assign(target, ...sources)
        };
        window.$ = window.jQuery;
    }

    window.Nexus.DisplayContextStub = {
        elementNode: document.body,
        activeWorkflows: {},
        showLoaderIndicator: () => { /* console.log("Display: Showing loader"); */ },
        hideLoaderIndicator: () => { /* console.log("Display: Hiding loader"); */ },
        countActiveWorkflows: () => window.Nexus.Toolkit.countObjectEntries(window.Nexus.DisplayContextStub.activeWorkflows),
        label: 'DisplayContextStub',
        category: 'display'
    };
    window.Nexus.DisplayContextStub.elementNode.selector = 'body';

    window.Nexus.activeOperation = undefined;

    SystemBroadcaster.emit('framework.initialization', {
        name: 'NexusFramework',
        version: '1.0.0'
    });
}