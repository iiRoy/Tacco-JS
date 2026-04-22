(function ( globalScope, absentValue ) {
    const GeneralKit = function( selectorIdentifier, contextReference ) {
        return new GeneralKit.factory.init( selectorIdentifier, contextReference, globalScope.document );
    };

    const typeIdentity = (input) => {
        if (input === null) {
            return "null";
        }
        const detectedType = typeof input;
        if (detectedType === "object") {
            if (Array.isArray(input)) {
                return "array";
            }
            return detectedType;
        }
        return detectedType;
    };

    const optionsParser = (flagString) => {
        const parsed = {};
        if (flagString) {
            flagString.split(/\s+/).forEach(flag => {
                if (flag) parsed[flag] = true;
            });
        }
        return parsed;
    };

    const parsedOptionCache = new Map();

    class SubscriptionManager {
        #subscribers = [];
        #pastActivation = null;
        #isCurrentlyDispatching = false;
        #dispatchQueue = [];
        #options;
        #isPermanentlyDisabled = false;
        #isPermanentlySealed = false;

        constructor(inputOptions) {
            let actualOptions;
            if (typeof inputOptions === 'string') {
                if (parsedOptionCache.has(inputOptions)) {
                    actualOptions = parsedOptionCache.get(inputOptions);
                } else {
                    actualOptions = optionsParser(inputOptions);
                    parsedOptionCache.set(inputOptions, actualOptions);
                }
            } else {
                actualOptions = inputOptions || {};
            }
            this.#options = actualOptions;
        }

        #executeSubscribers(context, args) {
            this.#isCurrentlyDispatching = true;
            let currentSubscribersSnapshot = [...this.#subscribers];

            if (this.#options.memory) {
                this.#pastActivation = [context, args];
            }

            for (let idx = 0; idx < currentSubscribersSnapshot.length; idx++) {
                const currentSubscriber = currentSubscribersSnapshot[idx];
                if (currentSubscriber.apply(context, args) === false && this.#options.stopOnFalse) {
                    this.#pastActivation = true;
                    break;
                }
            }

            this.#isCurrentlyDispatching = false;

            if (!this.#isPermanentlyDisabled) {
                if (this.#options.once) {
                    if (this.#pastActivation === true) {
                        this.deactivate();
                    } else {
                        this.#subscribers = [];
                    }
                } else if (this.#dispatchQueue.length > 0) {
                    const nextActivation = this.#dispatchQueue.shift();
                    this.triggerWith(nextActivation[0], nextActivation[1]);
                }
            }
        }

        enroll(...callbacks) {
            if (this.#isPermanentlyDisabled) {
                return this;
            }

            const initialLength = this.#subscribers.length;

            const processCallback = (cb) => {
                const identifiedType = GeneralKit.identifyType(cb);
                if (identifiedType === "array") {
                    cb.forEach(processCallback);
                } else if (identifiedType === "function") {
                    if (!this.#options.unique || !this.contains(cb)) {
                        this.#subscribers.push(cb);
                    }
                }
            };

            callbacks.forEach(processCallback);

            if (!this.#isCurrentlyDispatching && this.#options.memory && this.#pastActivation && this.#pastActivation !== true) {
                for (let i = initialLength; i < this.#subscribers.length; i++) {
                    this.#subscribers[i].apply(this.#pastActivation[0], this.#pastActivation[1]);
                }
            }

            return this;
        }

        expel(...callbacks) {
            if (this.#isPermanentlyDisabled) {
                return this;
            }

            let newSubscribers = [];
            for (let i = 0; i < this.#subscribers.length; i++) {
                const currentSubscriber = this.#subscribers[i];
                let shouldKeep = true;
                for (const cbToRemove of callbacks) {
                    if (currentSubscriber === cbToRemove) {
                        shouldKeep = false;
                        if (this.#options.unique) {
                            break;
                        }
                    }
                }
                if (shouldKeep) {
                    newSubscribers.push(currentSubscriber);
                }
            }
            this.#subscribers = newSubscribers;

            return this;
        }

        contains(callback) {
            if (this.#isPermanentlyDisabled) {
                return false;
            }
            return this.#subscribers.includes(callback);
        }

        clear() {
            if (this.#isPermanentlyDisabled) {
                return this;
            }
            this.#subscribers = [];
            return this;
        }

        deactivate() {
            this.#subscribers = [];
            this.#dispatchQueue = [];
            this.#pastActivation = absentValue;
            this.#isPermanentlyDisabled = true;
            return this;
        }

        isDeactivated() {
            return this.#isPermanentlyDisabled;
        }

        seal() {
            this.#dispatchQueue = absentValue;
            if (!this.#pastActivation || this.#pastActivation === true) {
                this.deactivate();
            }
            this.#isPermanentlySealed = true;
            return this;
        }

        isSealed() {
            return this.#isPermanentlySealed;
        }

        triggerWith(context, args) {
            if (this.#isPermanentlySealed) {
                return this;
            }

            if (this.#isCurrentlyDispatching) {
                if (!this.#options.once) {
                    this.#dispatchQueue.push([context, args]);
                }
            } else if (!(this.#options.once && this.#pastActivation)) {
                this.#executeSubscribers(context, args);
            }
            return this;
        }

        trigger(...args) {
            this.triggerWith(this, args);
            return this;
        }

        wasTriggered() {
            return !!this.#pastActivation;
        }
    }

    class TaskResult {
        #onCompletion = new SubscriptionManager("once memory");
        #onFailure = new SubscriptionManager("once memory");
        #onProgressUpdate = new SubscriptionManager("memory");
        #currentStatus = "awaiting";

        constructor(initializerFunc) {
            const publicInterface = {
                onSuccess: this.#onCompletion.enroll.bind(this.#onCompletion),
                onFailure: this.#onFailure.enroll.bind(this.#onFailure),
                onUpdate: this.#onProgressUpdate.enroll.bind(this.#onProgressUpdate),

                getStatus: () => this.#currentStatus,

                hasSucceeded: this.#onCompletion.wasTriggered.bind(this.#onCompletion),
                hasFailed: this.#onFailure.wasTriggered.bind(this.#onFailure),

                chain: function(successCb, failureCb, progressCb) {
                    this.onSuccess(successCb);
                    this.onFailure(failureCb);
                    this.onUpdate(progressCb);
                    return this;
                },
                everytime: function(...cbs) {
                    this.onSuccess(...cbs);
                    this.onFailure(...cbs);
                    return this;
                },
                transform: function(successFn, failureFn, progressFn) {
                    const parentDeferred = this;
                    return new TaskResult(newOutcome => {
                        const handlers = {
                            success: [successFn, "complete"],
                            fail: [failureFn, "fail"],
                            progress: [progressFn, "update"]
                        };

                        Object.keys(handlers).forEach(key => {
                            const [fn, action] = handlers[key];
                            if (GeneralKit.identifyType(fn) === 'function') {
                                parentDeferred[`on${key === 'success' ? 'Success' : key === 'fail' ? 'Failure' : 'Update'}`](function() {
                                    const result = fn.apply(this, arguments);
                                    if (result && typeof result.getPromise === 'function') {
                                        result.getPromise().chain(newOutcome.complete, newOutcome.fail, newOutcome.update);
                                    } else {
                                        newOutcome[`${action}With`](this === parentDeferred ? newOutcome : this, [result]);
                                    }
                                });
                            } else {
                                parentDeferred[`on${key === 'success' ? 'Success' : key === 'fail' ? 'Failure' : 'Update'}`](newOutcome[action]);
                            }
                        });
                    }).getPromise();
                },
                getPromise: function(targetObject) {
                    if (targetObject == null) {
                        return publicInterface;
                    } else {
                        for (const prop in publicInterface) {
                            if (typeof publicInterface[prop] === 'function') {
                                targetObject[prop] = publicInterface[prop].bind(publicInterface);
                            } else {
                                targetObject[prop] = publicInterface[prop];
                            }
                        }
                        return targetObject;
                    }
                }
            };

            const internalControl = publicInterface.getPromise({});
            internalControl.complete = this.#onCompletion.trigger.bind(this.#onCompletion);
            internalControl.completeWith = this.#onCompletion.triggerWith.bind(this.#onCompletion);
            internalControl.fail = this.#onFailure.trigger.bind(this.#onFailure);
            internalControl.failWith = this.#onFailure.triggerWith.bind(this.#onFailure);
            internalControl.update = this.#onProgressUpdate.trigger.bind(this.#onProgressUpdate);
            internalControl.updateWith = this.#onProgressUpdate.triggerWith.bind(this.#onProgressUpdate);

            internalControl.onSuccess(() => {
                this.#currentStatus = "completed";
            }, this.#onFailure.deactivate.bind(this.#onFailure), this.#onProgressUpdate.seal.bind(this.#onProgressUpdate));

            internalControl.onFailure(() => {
                this.#currentStatus = "failed";
            }, this.#onCompletion.deactivate.bind(this.#onCompletion), this.#onProgressUpdate.seal.bind(this.#onProgressUpdate));

            if (initializerFunc) {
                initializerFunc.call(internalControl, internalControl);
            }

            return internalControl;
        }
    }

    const truePredicate = () => true;
    const falsePredicate = () => false;

    GeneralKit.identifyType = typeIdentity;
    GeneralKit.SubscriptionManager = SubscriptionManager;
    GeneralKit.TaskResult = TaskResult;

    GeneralKit.DomEventFabric = function(sourceEvent, additionalProperties) {
        if (!(this instanceof GeneralKit.DomEventFabric)) {
            return new GeneralKit.DomEventFabric(sourceEvent, additionalProperties);
        }

        if (sourceEvent && sourceEvent.type) {
            this.originalEvent = sourceEvent;
            this.kind = sourceEvent.type;
            this.isDefaultPrevented = (sourceEvent.defaultPrevented || sourceEvent.returnValue === false ||
                (sourceEvent.getPreventDefault && sourceEvent.getPreventDefault())) ? truePredicate : falsePredicate;
        } else {
            this.kind = sourceEvent;
        }

        if (additionalProperties) {
            Object.assign(this, additionalProperties);
        }

        this.moment = sourceEvent && sourceEvent.timeStamp || Date.now();
        this[`_kit_id_`] = true;
    };

    GeneralKit.storageInternal = function(elementNode, keyName, valueData) {
        if (!elementNode._kit_data_storage) {
            elementNode._kit_data_storage = {};
        }
        if (valueData !== absentValue) {
            elementNode._kit_data_storage[keyName] = valueData;
        }
        return elementNode._kit_data_storage[keyName];
    };

    GeneralKit.markActivity = function(elementNode, activityType) {
        if (elementNode) {
            const markerKey = (activityType || "animation") + "marker";
            const currentValue = GeneralKit.storageInternal(elementNode, markerKey) || 0;
            GeneralKit.storageInternal(elementNode, markerKey, currentValue + 1);
        }
    };

    GeneralKit.clearActivityMark = function(shouldForce, elementNode, activityType) {
        if (shouldForce !== true) {
            activityType = elementNode;
            elementNode = shouldForce;
            shouldForce = false;
        }
        if (elementNode) {
            const markerKey = (activityType || "animation") + "marker";
            const currentCount = shouldForce ? 0 : ((GeneralKit.storageInternal(elementNode, markerKey) || 1) - 1);
            if (currentCount) {
                GeneralKit.storageInternal(elementNode, markerKey, currentCount);
            } else {
                if (elementNode._kit_data_storage) {
                    delete elementNode._kit_data_storage[markerKey];
                }
            }
        }
    };

    GeneralKit.allowsDataStore = function(elementNode) {
        return true;
    };

    GeneralKit.propertyAccessor = function(elementsCollection, propertyName, propertyValue, executeCallback, valueHandler, passThrough) {
        const collectionLength = elementsCollection.length;

        if (GeneralKit.identifyType(propertyName) === "object") {
            for (const attributeKey in propertyName) {
                GeneralKit.propertyAccessor(elementsCollection, attributeKey, propertyName[attributeKey], executeCallback, valueHandler, propertyValue);
            }
            return elementsCollection;
        }

        if (propertyValue !== absentValue) {
            executeCallback = !passThrough && executeCallback && GeneralKit.identifyType(propertyValue) === "function";

            for (let idx = 0; idx < collectionLength; idx++) {
                valueHandler(elementsCollection[idx], propertyName, executeCallback ? propertyValue.call(elementsCollection[idx], idx, valueHandler(elementsCollection[idx], propertyName)) : propertyValue, passThrough);
            }
            return elementsCollection;
        }

        return collectionLength ? valueHandler(elementsCollection[0], propertyName) : absentValue;
    };

    GeneralKit.activeRequestsCount = 0;

    GeneralKit.asyncRequest = function(destinationUrl, requestSettings) {
        let currentSettings = requestSettings || {};
        let urlString = destinationUrl;

        if (GeneralKit.identifyType(destinationUrl) === "object") {
            currentSettings = destinationUrl;
            urlString = absentValue;
        }

        const requestOutcome = new GeneralKit.TaskResult();

        // This is a minimal stub to match the async nature.
        // A full implementation would involve actual network requests.
        setTimeout(() => {
            requestOutcome.complete("Simulated success for " + (urlString || JSON.stringify(currentSettings)));
        }, 100);

        return requestOutcome;
    };

    GeneralKit.factory = GeneralKit.prototype = {
        constructor: GeneralKit,
        init: function( selectorIdentifier, contextReference, rootElement ) {
            this.length = 0;
            if (selectorIdentifier) {
                if (typeof selectorIdentifier === 'string') {
                    this[0] = rootElement || document.body;
                    this.length = 1;
                } else if (selectorIdentifier.nodeType) {
                    this[0] = selectorIdentifier;
                    this.length = 1;
                }
            }
            return this;
        }
    };

    GeneralKit.factory.init.prototype = GeneralKit.factory;

    globalScope.GeneralKit = GeneralKit;
    globalScope.$GK = GeneralKit;
})( window, undefined );