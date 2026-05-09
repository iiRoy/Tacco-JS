let DEBUG_ENABLED = true;

const globalConsole = {
    log: function(...args) {
        if (DEBUG_ENABLED) {
            console.log(...args);
        }
    },
    always: function(...args) {
        console.log(...args);
    },
    setDebugMode: function(mode) {
        DEBUG_ENABLED = mode;
    }
};

if (!String.prototype.trimValue) {
    String.prototype.trimValue = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

function executeSafely(callback) {
    if (typeof callback === 'function') {
        callback();
    }
}

let DatastoreOrchestrator;
let DataStoreInterface;

function buildPromiseResultHandler(operationKey, successProcessor = (data) => data) {
    return function(error, result) {
        const promiseController = this;

        if (error) {
            globalConsole.log(`Cloud operation "${operationKey}" encountered an issue`, error);
            promiseController.reject(error);
        } else {
            globalConsole.log(`Cloud operation "${operationKey}" completed successfully`, result);
            try {
                const processedResult = successProcessor(result);
                promiseController.resolve(processedResult);
            } catch (processingIssue) {
                globalConsole.log(`Cloud operation "${operationKey}" processing issue`, processingIssue);
                promiseController.reject(processingIssue);
            }
        }
    };
}

function DataEntryAdapter(sourceRecord, attributeIdentifier) {
    const internalRecordReference = sourceRecord;
    const propertyKey = attributeIdentifier;

    return {
        get dataField() {
            globalConsole.log(`Accessing field: ${propertyKey} from record`, internalRecordReference);
            return internalRecordReference.get(propertyKey);
        },
        set dataField(value) {
            globalConsole.log(`Updating field: ${propertyKey} in record`, internalRecordReference);
            internalRecordReference.set(propertyKey, value === null || value === undefined ? '' : value);
        }
    };
}

class CloudStorageAgent {
    constructor(promiseConstructor, orchestratorConstructor, outputLogger) {
        this.promiseFactory = promiseConstructor;
        this.orchestratorFactory = orchestratorConstructor;
        this.output = outputLogger;

        this.output.log('Initializing CloudStorageAgent');
        this.connectedClient = null;
    }

    establishConnection(connectionOptions) {
        this.connectedClient = new Dropbox.Client(connectionOptions);
        return this;
    }

    initiateAuthentication(authOptions) {
        return new this.promiseFactory((resolve, reject) => {
            const authSuccessProcessor = (clientInstance) => {
                return new this.orchestratorFactory(this.connectedClient, this.promiseFactory, this.output);
            };
            this.connectedClient.authenticate(authOptions, buildPromiseResultHandler('authentication', authSuccessProcessor).bind({ resolve, reject }));
        });
    }

    retrieveOrchestrator() {
        if (!this.connectedClient) {
            return this.promiseFactory.reject(new Error("Client not connected. Call establishConnection first."));
        }
        return new this.orchestratorFactory(this.connectedClient, this.promiseFactory, this.output);
    }

    terminateSession(sessionOptions) {
        return new this.promiseFactory((resolve, reject) => {
            this.connectedClient.signOut(sessionOptions, buildPromiseResultHandler('signOut').bind({ resolve, reject }));
        });
    }

    fetchAccountDetails(accountOptions) {
        return new this.promiseFactory((resolve, reject) => {
            this.connectedClient.getAccountInfo(accountOptions, buildPromiseResultHandler('getAccountInfo').bind({ resolve, reject }));
        });
    }

    retrieveUserId(...args) {
        if (!this.connectedClient) return undefined;
        return this.connectedClient.dropboxUid(...args);
    }

    getCredentials(...args) {
        if (!this.connectedClient) return undefined;
        return this.connectedClient.credentials(...args);
    }

    isAuthorized(...args) {
        if (!this.connectedClient) return false;
        return this.connectedClient.isAuthenticated(...args);
    }

    retrieveUserDetails(...args) {
        if (!this.connectedClient) return undefined;
        return this.connectedClient.getUserInfo(...args);
    }
}

DatastoreOrchestrator = class DatastoreOrchestrator {
    constructor(dropboxClient, promiseConstructor, outputLogger) {
        this.clientReference = dropboxClient;
        this.promiseFactory = promiseConstructor;
        this.output = outputLogger;

        this.output.log('Initializing DatastoreOrchestrator');
        this.orchestratorInstance = this.clientReference.getDatastoreManager();
    }

    openDefaultUnit() {
        return new this.promiseFactory((resolve, reject) => {
            const successProcessor = (datastoreObject) => {
                return new DataStoreInterface(this, datastoreObject, this.promiseFactory, this.output);
            };
            this.orchestratorInstance.openDefaultDatastore(buildPromiseResultHandler('openDefaultDatastore', successProcessor).bind({ resolve, reject }));
        });
    }

    openSpecificUnit(unitIdentifier) {
        return new this.promiseFactory((resolve, reject) => {
            const successProcessor = (datastoreObject) => {
                return new DataStoreInterface(this, datastoreObject, this.promiseFactory, this.output);
            };
            this.orchestratorInstance.openDatastore(unitIdentifier, buildPromiseResultHandler('openDatastore', successProcessor).bind({ resolve, reject }));
        });
    }

    createUnit() {
        return new this.promiseFactory((resolve, reject) => {
            const successProcessor = (datastoreObject) => {
                return new DataStoreInterface(this, datastoreObject, this.promiseFactory, this.output);
            };
            this.orchestratorInstance.createDatastore(buildPromiseResultHandler('createDatastore', successProcessor).bind({ resolve, reject }));
        });
    }

    removeUnit(unitIdentifier) {
        return new this.promiseFactory((resolve, reject) => {
            this.orchestratorInstance.deleteDatastore(unitIdentifier, buildPromiseResultHandler('deleteDatastore').bind({ resolve, reject }));
        });
    }

    listUnitIdentifiers() {
        return new this.promiseFactory((resolve, reject) => {
            this.orchestratorInstance.listDatastoreIds(buildPromiseResultHandler('listDatastoreIds').bind({ resolve, reject }));
        });
    }

    terminate() {
        return this.orchestratorInstance.close();
    }

    subscribeUnitListChanges(eventCallback) {
        const wrappedCallback = (eventData) => {
            executeSafely(() => {
                eventCallback(eventData);
            });
        };
        this.orchestratorInstance.datastoreListChanged.addListener(wrappedCallback);
        return wrappedCallback;
    }

    unsubscribeUnitListChanges(callbackReference) {
        this.orchestratorInstance.datastoreListChanged.removeListener(callbackReference);
    }
}

DataStoreInterface = class DataStoreInterface {
    constructor(orchestratorInstance, dropboxDatastore, promiseConstructor, outputLogger) {
        this.orchestratorReference = orchestratorInstance;
        this.storageUnit = dropboxDatastore;
        this.promiseFactory = promiseConstructor;
        this.output = outputLogger;

        this.output.log('Initializing DataStoreInterface');
    }

    accessTable(...args) {
        return this.storageUnit.getTable(...args);
    }

    listTableNames(...args) {
        return this.storageUnit.listTableIds(...args);
    }

    shutdown(...args) {
        return this.storageUnit.close(...args);
    }

    getIdentifier(...args) {
        return this.storageUnit.getId(...args);
    }

    getSynchronizationStatus(...args) {
        return this.storageUnit.getSyncStatus(...args);
    }

    subscribeRecordModifications(eventCallback, tableIdentifier = null) {
        const wrappedCallback = (eventData) => {
            executeSafely(() => {
                if (tableIdentifier) {
                    const affectedRecords = eventData.affectedRecordsForTable(tableIdentifier);
                    eventCallback(affectedRecords);
                } else {
                    eventCallback(eventData);
                }
            });
        };
        this.storageUnit.recordsChanged.addListener(wrappedCallback);
        return wrappedCallback;
    }

    subscribeSynchronizationStatus(eventCallback) {
        const wrappedCallback = (eventData) => {
            executeSafely(() => {
                eventCallback(eventData);
            });
        };
        this.storageUnit.syncStatusChanged.addListener(wrappedCallback);
        return wrappedCallback;
    }

    unsubscribeSynchronizationStatus(callbackReference) {
        this.storageUnit.syncStatusChanged.removeListener(callbackReference);
    }
}

globalConsole.setDebugMode(true);