(function(systemBuilder) {
    let globalDataSystem = systemBuilder();

    if (typeof define === 'function' && define.amd) {
        define([], function() {
            return globalDataSystem;
        });
    } else {
        let previousDataRealm = window.DataRealm;
        let previousDataRealmLower = window.dataRealm;

        window.DataRealm = window.dataRealm = globalDataSystem;

        globalDataSystem.releaseGlobals = function() {
            window.DataRealm = previousDataRealm;
            window.dataRealm = previousDataRealmLower;
            return globalDataSystem;
        };
    }

})(function() {
    class CentralDataStore {
        constructor() {
            this.networkLink = null;
            this.eventQueue = new Map();
            this.messageQueue = [];
            this.dataRegistries = new Map();
        }

        establishConnection(socketInstance) {
            this.networkLink = socketInstance;

            this.eventQueue.forEach((eventHandlersMap, registryIdentifier) => {
                const associatedCollection = this.dataRegistries.get(registryIdentifier);
                if (associatedCollection) {
                    eventHandlersMap.forEach((handlerFunction, eventKind) => {
                        this.networkLink.on(eventKind, (dataPayload) => handlerFunction.call(associatedCollection, dataPayload));
                    });
                }
            });
            this.eventQueue.clear();

            this.messageQueue.forEach(([eventKind, payloadOne, payloadTwo]) => {
                this.networkLink.emit(eventKind, payloadOne, payloadTwo);
            });
            this.messageQueue.length = 0;
        }

        fetchCollection(collectionIdentifier) {
            return this.dataRegistries.get(collectionIdentifier);
        }

        createCollection(collectionIdentifier, setupInitialization) {
            if (this.dataRegistries.has(collectionIdentifier)) {
                return this.dataRegistries.get(collectionIdentifier);
            }

            const newCollectionInstance = new DataCollection(collectionIdentifier, this);
            this.dataRegistries.set(collectionIdentifier, newCollectionInstance);

            if (typeof setupInitialization === 'function') {
                setupInitialization.call(newCollectionInstance);
            }

            return newCollectionInstance;
        }
    }

    class DataCollection {
        constructor(identifier, centralStoreReference) {
            this.registryIdentifier = identifier;
            this.centralStore = centralStoreReference;

            this.recordSet = [];
            this.nextRecordId = 0;

            this.preActions = new Map();
            this.postActions = new Map();
            this.notificationHandlers = new Map();
        }

        advanceIdentifier() {
            this.nextRecordId++;
            return this.nextRecordId;
        }

        listenFor(eventKind, callbackFunction) {
            if (!this.centralStore.networkLink) {
                if (!this.centralStore.eventQueue.has(this.registryIdentifier)) {
                    this.centralStore.eventQueue.set(this.registryIdentifier, new Map());
                }
                this.centralStore.eventQueue.get(this.registryIdentifier).set(eventKind, callbackFunction);
            } else {
                this.centralStore.networkLink.on(eventKind, (dataPayload) => callbackFunction.call(this, dataPayload));
            }
        }

        dispatchMessage(eventKind, payloadOne, payloadTwo) {
            if (!this.centralStore.networkLink) {
                this.centralStore.messageQueue.push([eventKind, payloadOne, payloadTwo]);
            } else {
                this.centralStore.networkLink.emit(eventKind, payloadOne, payloadTwo);
            }
        }

        applyPlugin(pluginFunction) {
            pluginFunction.call(this);
        }

        registerPreAction(actionType, callbackFunction) {
            if (Array.isArray(actionType)) {
                actionType.forEach(key => this.preActions.set(key, callbackFunction));
            } else if (typeof actionType === 'string') {
                this.preActions.set(actionType, callbackFunction);
            }
        }

        deregisterPreAction(actionType) {
            if (Array.isArray(actionType)) {
                actionType.forEach(key => this.preActions.set(key, () => {}));
            } else if (typeof actionType === 'string') {
                this.preActions.set(actionType, () => {});
            }
        }

        registerPostAction(actionType, callbackFunction) {
            if (Array.isArray(actionType)) {
                actionType.forEach(key => this.postActions.set(key, callbackFunction));
            } else if (typeof actionType === 'string') {
                this.postActions.set(actionType, callbackFunction);
            }
        }

        deregisterPostAction(actionType) {
            if (Array.isArray(actionType)) {
                actionType.forEach(key => this.postActions.set(key, () => {}));
            } else if (typeof actionType === 'string') {
                this.postActions.set(actionType, () => {});
            }
        }

        notifySubscribers(eventType, dataPayload) {
            if (this.notificationHandlers.has(eventType)) {
                this.notificationHandlers.get(eventType).call(this, dataPayload);
            }
        }

        subscribeToNotifications(eventType, callbackFunction) {
            if (Array.isArray(eventType)) {
                eventType.forEach(key => this.notificationHandlers.set(key, callbackFunction));
            } else if (typeof eventType === 'string') {
                this.notificationHandlers.set(eventType, callbackFunction);
            }
        }

        unsubscribeFromNotifications(eventType) {
            if (eventType === undefined || (Array.isArray(eventType) && eventType.length === 0)) {
                this.notificationHandlers.clear();
            } else if (Array.isArray(eventType)) {
                eventType.forEach(key => this.notificationHandlers.set(key, () => {}));
            } else if (typeof eventType === 'string') {
                this.notificationHandlers.set(eventType, () => {});
            }
        }

        replaceRecords(newRecordsArray) {
            if (!Array.isArray(newRecordsArray)) {
                console.error("Provided collection must be an array.");
                return;
            }

            this.recordSet.length = 0;

            newRecordsArray.forEach(record => {
                const augmentedRecord = { ...record,
                    __id: this.advanceIdentifier()
                };
                this.recordSet.push(augmentedRecord);
            });
        }

        _augmentEntry(dataEntry) {
            Object.defineProperty(dataEntry, 'persist', {
                value: async (userCallback) => this._executePersistence(dataEntry, userCallback),
                enumerable: false,
                writable: false,
                configurable: false
            });
            Object.defineProperty(dataEntry, 'discard', {
                value: async (userCallback) => this._executeDeletion(dataEntry, userCallback),
                enumerable: false,
                writable: false,
                configurable: false
            });
            Object.defineProperty(dataEntry, 'discardQuietly', {
                value: async (userCallback) => this._executeDeletionQuietly(dataEntry, userCallback),
                enumerable: false,
                writable: false,
                configurable: false
            });
            return dataEntry;
        }

        async _executePersistence(entryToPersist, userCallback) {
            const finalCallback = (typeof userCallback === 'function') ? userCallback : () => {};
            let currentOperationKind;

            const executePostActionsAndFinalCallback = async (error, result) => {
                if (this.postActions.has('save')) {
                    await new Promise(resolve => this.postActions.get('save').call(this, result, resolve));
                }
                if (currentOperationKind === 'create') {
                    this.notifySubscribers('create', result);
                } else if (currentOperationKind === 'update') {
                    this.notifySubscribers('update', [result]);
                }
                this.notifySubscribers('save', result);
                finalCallback.call(this, error, result);
            };

            const completeUpdateProcess = async (objectForUpdate) => {
                let resultingObject = objectForUpdate;
                await this.modifyRecordsQuietly({
                    '__id': objectForUpdate.__id
                }, objectForUpdate, async (error, results) => {
                    resultingObject = results[0];
                    if (this.postActions.has('update')) {
                        await new Promise(resolve => this.postActions.get('update').call(this, results, resolve));
                    }
                    await executePostActionsAndFinalCallback(error, resultingObject);
                });
            };

            const completeCreateProcess = async (objectForCreate) => {
                let resultingObject = objectForCreate;
                await this.produceRecordQuietly(objectForCreate, async (error, createdResult) => {
                    resultingObject = createdResult;
                    if (this.postActions.has('create')) {
                        await new Promise(resolve => this.postActions.get('create').call(this, objectForCreate, resolve));
                    }
                    await executePostActionsAndFinalCallback(error, resultingObject);
                });
            };

            const decideAndExecuteCRUD = async (object) => {
                if (!Object.prototype.hasOwnProperty.call(object, '__id')) {
                    currentOperationKind = 'create';
                    if (this.preActions.has('create')) {
                        await new Promise(resolve => this.preActions.get('create').call(this, object, resolve));
                    }
                    await completeCreateProcess(object);
                } else {
                    currentOperationKind = 'update';
                    if (this.preActions.has('update')) {
                        await new Promise(resolve => this.preActions.get('update').call(this, {
                            '__id': object.__id
                        }, object, resolve));
                    }
                    await completeUpdateProcess(object);
                }
            };

            if (this.preActions.has('save')) {
                await new Promise(resolve => this.preActions.get('save').call(this, entryToPersist, resolve));
            }
            await decideAndExecuteCRUD(entryToPersist);
        }

        async _executeDeletion(entryToDelete, userCallback) {
            const finalCallback = (typeof userCallback === 'function') ? userCallback : () => {};
            await this.eraseRecords(entryToDelete, finalCallback);
        }

        async _executeDeletionQuietly(entryToDelete, userCallback) {
            const finalCallback = (typeof userCallback === 'function') ? userCallback : () => {};
            await this.eraseRecordsQuietly(entryToDelete, finalCallback);
        }

        async produceRecord(elementData, userCallback) {
            const finalCallback = (typeof userCallback === 'function') ? userCallback : () => {};

            const executeCompletion = async (error, createdResult) => {
                if (this.postActions.has('create')) {
                    await new Promise(resolve => this.postActions.get('create').call(this, elementData, resolve));
                }
                this.notifySubscribers('create', createdResult);
                finalCallback.call(this, error, createdResult);
            };

            if (this.preActions.has('create')) {
                await new Promise(resolve => this.preActions.get('create').call(this, elementData, resolve));
            }
            await this.produceRecordQuietly(elementData, executeCompletion);
        }

        async produceRecordQuietly(elementData, userCallback) {
            const finalCallback = (typeof userCallback === 'function') ? userCallback : () => {};
            const newRecord = { ...elementData,
                __id: this.advanceIdentifier()
            };
            this.recordSet.push(newRecord);
            const augmentedRecord = this._augmentEntry(newRecord);
            finalCallback.call(this, null, augmentedRecord);
            return augmentedRecord;
        }

        obtainRecords(queryObject, userCallback) {
            const finalCallback = (typeof userCallback === 'function') ? userCallback : () => {};
            let matchingRecords = this.recordSet;

            if (queryObject) {
                matchingRecords = matchingRecords.filter(item => {
                    for (const key in queryObject) {
                        if (Object.prototype.hasOwnProperty.call(queryObject, key) && item[key] !== queryObject[key]) {
                            return false;
                        }
                    }
                    return true;
                });
            }
            const augmentedResults = matchingRecords.map(item => this._augmentEntry(item));
            finalCallback.call(this, null, augmentedResults);
            return augmentedResults;
        }

        obtainSingleRecord(queryObject, userCallback) {
            const finalCallback = (typeof userCallback === 'function') ? userCallback : () => {};
            const foundRecord = this.recordSet.find(item => {
                for (const key in queryObject) {
                    if (Object.prototype.hasOwnProperty.call(queryObject, key) && item[key] !== queryObject[key]) {
                        return false;
                    }
                }
                return true;
            });
            const augmentedResult = foundRecord ? this._augmentEntry(foundRecord) : null;
            finalCallback.call(this, null, augmentedResult);
            return augmentedResult;
        }

        async modifyRecords(queryObject, changesData, userCallback) {
            const finalCallback = (typeof userCallback === 'function') ? userCallback : () => {};
            let updatedItemsList = [];

            const executeCompletion = async (error, results) => {
                if (this.postActions.has('update')) {
                    await new Promise(resolve => this.postActions.get('update').call(this, results, resolve));
                }
                this.notifySubscribers('update', results);
                finalCallback.call(this, error, results);
            };

            if (this.preActions.has('update')) {
                await new Promise(resolve => this.preActions.get('update').call(this, queryObject, changesData, resolve));
            }
            updatedItemsList = await this.modifyRecordsQuietly(queryObject, changesData, executeCompletion);
            return updatedItemsList;
        }

        async modifyRecordsQuietly(queryObject, changesData, userCallback) {
            const finalCallback = (typeof userCallback === 'function') ? userCallback : () => {};
            const modifiedItems = [];
            this.recordSet = this.recordSet.map(item => {
                let matchesQuery = true;
                for (const key in queryObject) {
                    if (Object.prototype.hasOwnProperty.call(queryObject, key) && item[key] !== queryObject[key]) {
                        matchesQuery = false;
                        break;
                    }
                }
                if (matchesQuery) {
                    const updatedItem = { ...item,
                        ...changesData
                    };
                    modifiedItems.push(this._augmentEntry(updatedItem));
                    return updatedItem;
                }
                return item;
            });
            finalCallback.call(this, null, modifiedItems);
            return modifiedItems;
        }

        async eraseRecords(itemOrQuery, userCallback) {
            const finalCallback = (typeof userCallback === 'function') ? userCallback : () => {};
            let removedItemsList = [];

            const executeCompletion = async (error, results) => {
                if (this.postActions.has('delete')) {
                    await new Promise(resolve => this.postActions.get('delete').call(this, results, resolve));
                }
                this.notifySubscribers('delete', results);
                finalCallback.call(this, error, results);
            };

            if (this.preActions.has('delete')) {
                await new Promise(resolve => this.preActions.get('delete').call(this, itemOrQuery, resolve));
            }
            removedItemsList = await this.eraseRecordsQuietly(itemOrQuery, executeCompletion);
            return removedItemsList;
        }

        async eraseRecordsQuietly(itemOrQuery, userCallback) {
            const finalCallback = (typeof userCallback === 'function') ? userCallback : () => {};
            let removedItems = [];
            let effectiveQuery = {};

            if (itemOrQuery && typeof itemOrQuery === 'object' && Object.prototype.hasOwnProperty.call(itemOrQuery, '__id')) {
                effectiveQuery = {
                    __id: itemOrQuery.__id
                };
            } else if (typeof itemOrQuery === 'object' && itemOrQuery !== null) {
                effectiveQuery = itemOrQuery;
            }

            this.recordSet = this.recordSet.filter(item => {
                let matchesQuery = true;
                for (const key in effectiveQuery) {
                    if (Object.prototype.hasOwnProperty.call(effectiveQuery, key) && item[key] !== effectiveQuery[key]) {
                        matchesQuery = false;
                        break;
                    }
                }
                if (matchesQuery) {
                    removedItems.push(this._augmentEntry(item));
                    return false;
                }
                return true;
            });

            if (removedItems.length === 0 && itemOrQuery && typeof itemOrQuery === 'object' && Object.prototype.hasOwnProperty.call(itemOrQuery, '__id')) {
                const indexToRemove = this.recordSet.findIndex(item => item.__id === itemOrQuery.__id);
                if (indexToRemove !== -1) {
                    removedItems.push(this._augmentEntry(this.recordSet[indexToRemove]));
                    this.recordSet.splice(indexToRemove, 1);
                }
            }

            finalCallback.call(this, null, removedItems);
            return removedItems;
        }
    }

    const primaryDataStore = new CentralDataStore();

    const publicInterface = {
        connectSystem: function(socketObject) {
            primaryDataStore.establishConnection(socketObject);
        },
        disconnectSystem: function() {
            if (primaryDataStore.networkLink && typeof primaryDataStore.networkLink.disconnect === 'function') {
                primaryDataStore.networkLink.disconnect();
            }
            primaryDataStore.networkLink = null;
        },
        currentLink: function() {
            return primaryDataStore.networkLink;
        },
        Registry: function(identifier, setupFunction) {
            if (typeof setupFunction === 'function') {
                return primaryDataStore.createCollection(identifier, setupFunction);
            } else {
                return primaryDataStore.fetchCollection(identifier);
            }
        }
    };

    return publicInterface;
});