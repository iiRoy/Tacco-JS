class DataStreamConnector {
    _protocolVersions = ["pre1"];
    _endpointUri;
    _socketInstance;

    _requestRegistry = new Map();
    _subscriptionMap = new Map();
    _collectionObservers = new Map();
    _localDataCache = new Map();

    _lastGeneratedId = 0;

    _messageDispatchMap = new Map();

    constructor(addressIdentifier) {
        this._endpointUri = addressIdentifier;
        this._initializeMessageHandlers();
    }

    _initializeMessageHandlers() {
        this._messageDispatchMap.set('result', this._processOperationResult.bind(this));
        this._messageDispatchMap.set('updated', () => {});
        this._messageDispatchMap.set('changed', this._processDataChange.bind(this));
        this._messageDispatchMap.set('added', this._processDataAddition.bind(this));
        this._messageDispatchMap.set('removed', this._processDataRemoval.bind(this));
        this._messageDispatchMap.set('ready', this._processSubscriptionReady.bind(this));
        this._messageDispatchMap.set('nosub', this._processSubscriptionFailure.bind(this));
        this._messageDispatchMap.set('addedBefore', this._processDataAddition.bind(this));
        this._messageDispatchMap.set('movedBefore', () => {});
    }

    _generateUniqueId() {
        this._lastGeneratedId++;
        return String(this._lastGeneratedId);
    }

    establishConnection() {
        return new Promise((fulfillConnection, rejectConnection) => {
            this._socketInstance = new WebSocket(this._endpointUri);

            this._socketInstance.onopen = () => {
                this.transmitPayload({
                    command: 'connect',
                    version: this._protocolVersions[0],
                    supported: this._protocolVersions
                });
            };

            this._socketInstance.onerror = (errorEvent) => {
                rejectConnection(errorEvent);
            };

            this._socketInstance.onmessage = (messageEvent) => {
                const parsedData = JSON.parse(messageEvent.data);
                const msgType = parsedData.command;

                if (msgType === 'connected') {
                    fulfillConnection(parsedData);
                } else {
                    const handler = this._messageDispatchMap.get(msgType);
                    if (handler) {
                        handler(parsedData);
                    }
                }
            };
        });
    }

    _processOperationResult(payload) {
        const requestIdentifier = payload.identification;
        const pendingRequest = this._requestRegistry.get(requestIdentifier);

        if (!pendingRequest) return;

        if (payload.failure) {
            pendingRequest.reject(payload.failure.explanation || 'Operation failed');
        } else if (payload.outcome !== undefined) {
            pendingRequest.fulfill(payload.outcome);
        }
        this._requestRegistry.delete(requestIdentifier);
    }

    _processSubscriptionFailure(payload) {
        const requestIdentifier = payload.identification;
        const pendingRequest = this._requestRegistry.get(requestIdentifier);

        if (!pendingRequest) return;

        if (payload.failure) {
            pendingRequest.reject(payload.failure.explanation || 'Subscription not found');
        } else {
            pendingRequest.fulfill();
        }
        this._requestRegistry.delete(requestIdentifier);
    }

    _processSubscriptionReady(payload) {
        const identifiers = payload.subscriptions;
        identifiers.forEach(requestIdentifier => {
            const pendingRequest = this._requestRegistry.get(requestIdentifier);
            if (pendingRequest) {
                pendingRequest.fulfill();
                this._requestRegistry.delete(requestIdentifier);
            }
        });
    }

    _processDataChange(payload) {
        const collectionName = payload.entityGroup;
        const documentIdentifier = payload.identification;
        const newFields = payload.attributes;
        const clearedFields = payload.removedAttributes;

        let targetCollection = this._localDataCache.get(collectionName);
        if (!targetCollection) {
            targetCollection = new Map();
            this._localDataCache.set(collectionName, targetCollection);
        }

        let targetDocument = targetCollection.get(documentIdentifier);
        if (!targetDocument) {
            targetDocument = {};
            targetCollection.set(documentIdentifier, targetDocument);
        }

        if (newFields) {
            Object.assign(targetDocument, newFields);
        }

        if (clearedFields && Array.isArray(clearedFields)) {
            clearedFields.forEach(attributeName => {
                delete targetDocument[attributeName];
            });
        }

        this._alertObservers(collectionName, targetDocument, documentIdentifier, payload.command);
    }

    _processDataAddition(payload) {
        const collectionName = payload.entityGroup;
        const documentIdentifier = payload.identification;
        const documentAttributes = payload.attributes;

        if (!this._localDataCache.has(collectionName)) {
            this._localDataCache.set(collectionName, new Map());
        }
        const targetCollection = this._localDataCache.get(collectionName);

        targetCollection.set(documentIdentifier, documentAttributes || {});

        const updatedDocument = targetCollection.get(documentIdentifier);
        this._alertObservers(collectionName, updatedDocument, documentIdentifier, payload.command);
    }

    _processDataRemoval(payload) {
        const collectionName = payload.entityGroup;
        const documentIdentifier = payload.identification;

        const targetCollection = this._localDataCache.get(collectionName);
        if (!targetCollection) return;

        const removedDocument = targetCollection.get(documentIdentifier);
        if (!removedDocument) return;

        const documentSnapshot = JSON.parse(JSON.stringify(removedDocument));

        targetCollection.delete(documentIdentifier);
        this._alertObservers(collectionName, documentSnapshot, documentIdentifier, payload.command);
    }

    _alertObservers(entityGroup, changedEntity, entityId, notificationType) {
        const entityClone = JSON.parse(JSON.stringify(changedEntity));
        entityClone.uniqueId = entityId;

        const observers = this._collectionObservers.get(entityGroup);
        if (observers) {
            observers.forEach(callback => {
                callback(entityClone, notificationType);
            });
        }
    }

    _dispatchRequest(operationType, operationName, parameters) {
        const requestIdentifier = this._generateUniqueId();
        let fulfiller, rejecter;
        const operationPromise = new Promise((fulfill, reject) => {
            fulfiller = fulfill;
            rejecter = reject;
        });
        this._requestRegistry.set(requestIdentifier, { fulfill: fulfiller, reject: rejecter });

        const argumentsArray = parameters || [];

        const outgoingPayload = {
            command: operationType,
            arguments: argumentsArray,
            identification: requestIdentifier
        };

        if (operationType === 'method') {
            outgoingPayload.procedure = operationName;
        } else if (operationType === 'sub') {
            outgoingPayload.designation = operationName;
            this._subscriptionMap.set(operationName, requestIdentifier);
        }

        this.transmitPayload(outgoingPayload);
        return operationPromise;
    }

    invokeRemoteMethod(procedureName, argumentsList) {
        return this._dispatchRequest('method', procedureName, argumentsList);
    }

    startSubscription(designationName, argumentsList) {
        return this._dispatchRequest('sub', designationName, argumentsList);
    }

    endSubscription(designationName) {
        let fulfiller, rejecter;
        const unsubscriptionPromise = new Promise((fulfill, reject) => {
            fulfiller = fulfill;
            rejecter = reject;
        });

        const unsubscriptionRequestId = this._generateUniqueId();
        this._requestRegistry.set(unsubscriptionRequestId, { fulfill: fulfiller, reject: rejecter });

        const existingSubscriptionId = this._subscriptionMap.get(designationName);

        if (!existingSubscriptionId) {
            rejecter(designationName + " was never active");
            this._requestRegistry.delete(unsubscriptionRequestId);
        } else {
            const outgoingPayload = {
                command: 'unsub',
                identification: existingSubscriptionId
            };
            this.transmitPayload(outgoingPayload);
            // The promise for this unsubscription will remain pending as per the original's behavior.
        }
        return unsubscriptionPromise;
    }

    registerObserver(entityGroup, callbackFunction) {
        if (!this._collectionObservers.has(entityGroup)) {
            this._collectionObservers.set(entityGroup, new Set());
        }
        this._collectionObservers.get(entityGroup).add(callbackFunction);
    }

    retrieveCollectionData(entityGroup) {
        const dataMap = this._localDataCache.get(entityGroup);
        if (dataMap) {
            return Object.fromEntries(dataMap);
        }
        return null;
    }

    retrieveDocumentData(entityGroup, documentIdentifier) {
        const dataMap = this._localDataCache.get(entityGroup);
        if (dataMap) {
            const doc = dataMap.get(documentIdentifier);
            return doc || null;
        }
        return null;
    }

    transmitPayload(payloadObject) {
        this._socketInstance.send(JSON.stringify(payloadObject));
    }

    terminateConnection() {
        this._socketInstance.close();
    }
}