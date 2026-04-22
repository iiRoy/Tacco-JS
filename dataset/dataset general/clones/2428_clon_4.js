class VaultConfig {
    constructor() {
        this.vaultName = '';
        this.vaultRevision = 1;
        this.debugFlag = false;
        this.onRevisionUpgrade = null;
        this.onTransactionCompleted = () => { if (this.debugFlag) console.log('Operation transaction completed.'); };
        this.onTransactionAborted = (e) => {
            if (this.debugFlag) console.warn('Operation transaction aborted: ' + (e.target.webkitErrorMessage || (e.target.error && e.target.error.message) || e.target.errorCode));
        };
        this.onTransactionFailed = (e) => {
            if (this.debugFlag) console.error('Operation transaction failed: ' + (e.target.webkitErrorMessage || (e.target.error && e.target.error.message) || e.target.errorCode));
        };
        this.onVaultError = (e) => {
            if (this.debugFlag) console.error("Data vault error: " + (e.target.webkitErrorMessage || (e.target.error && e.target.error.message) || e.target.errorCode));
        };
        this.onVaultBlocked = (e) => {
            if (this.debugFlag) console.warn("Data vault is blocked. Please close other tabs and retry.");
        };
    }

    setVaultName(name) {
        this.vaultName = name;
        return this;
    }

    setRevisionUpgrade(revision, callback) {
        this.vaultRevision = revision;
        this.onRevisionUpgrade = callback;
        return this;
    }

    enableDebugging(enable) {
        this.debugFlag = enable;
        return this;
    }

    onCompletion(callback) { this.onTransactionCompleted = callback; return this; }
    onAbort(callback) { this.onTransactionAborted = callback; return this; }
    onFailure(callback) { this.onTransactionFailed = callback; return this; }
    onVaultProblem(callback) { this.onVaultError = callback; return this; }
    onVaultBlockage(callback) { this.onVaultBlocked = callback; return this; }
}

const StoreAccessMode = {
    READ_ONLY_ACCESS: "readonly",
    READ_WRITE_ACCESS: "readwrite",
    VERSION_UPDATE_ACCESS: "versionchange"
};

const CursorMovement = {
    FORWARD: "next",
    FORWARD_UNIQUE: "nextunique",
    BACKWARD: "prev",
    BACKWARD_UNIQUE: "prevunique"
};

const getIndexedDB = () => {
    return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
};

const getKeyRange = () => {
    return window.IDBKeyRange || window.mozIDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
};

class RangeConstructor {
    static lessThan(value, exclusive = false) {
        return getKeyRange().upperBound(value, exclusive);
    }
    static greaterThan(value, exclusive = false) {
        return getKeyRange().lowerBound(value, exclusive);
    }
    static equals(value) {
        return getKeyRange().only(value);
    }
    static between(lower, upper, excludeLower = false, excludeUpper = false) {
        return getKeyRange().bound(lower, upper, excludeLower, excludeUpper);
    }
}

const defaultCursorQuerySettings = {
    indexName: undefined,
    keyBound: null,
    direction: CursorMovement.FORWARD
};

class DataVaultService {
    constructor(configInstance) {
        if (!(configInstance instanceof VaultConfig)) {
            throw new Error("Configuration must be an instance of VaultConfig.");
        }
        this.configuration = configInstance;
        this.databaseHandle = null;
        this.databaseConnectionPromise = null;
        this.indexedDB = getIndexedDB();

        if (!this.indexedDB) {
            console.error("IndexedDB is not supported in this browser.");
        }
    }

    async #establishConnection() {
        if (this.databaseConnectionPromise) {
            return this.databaseConnectionPromise;
        }

        if (!this.indexedDB) {
            return Promise.reject(new Error("IndexedDB not supported."));
        }
        if (!this.configuration.vaultName) {
            return Promise.reject(new Error("Data vault name not set."));
        }

        this.databaseConnectionPromise = new Promise((resolve, reject) => {
            const request = this.indexedDB.open(this.configuration.vaultName, this.configuration.vaultRevision);

            request.onsuccess = (event) => {
                this.databaseHandle = event.target.result;
                resolve(this.databaseHandle);
            };

            request.onerror = (event) => {
                this.configuration.onVaultError(event);
                reject(event.target.error);
            };

            request.onblocked = (event) => {
                this.configuration.onVaultBlocked(event);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const transaction = event.target.transaction;
                if (this.configuration.debugFlag) {
                    console.log(`Upgrading data vault "${db.name}" from version ${event.oldVersion} to ${event.newVersion}...`);
                }
                if (this.configuration.onRevisionUpgrade) {
                    this.configuration.onRevisionUpgrade(event, db, transaction);
                }
            };
        });

        return this.databaseConnectionPromise;
    }

    async #getStoreForOperation(storeIdentifier, accessMode) {
        const db = await this.#establishConnection();
        return new Promise((resolve, reject) => {
            try {
                const transaction = db.transaction([storeIdentifier], accessMode);
                transaction.oncomplete = this.configuration.onTransactionCompleted;
                transaction.onabort = this.configuration.onTransactionAborted;
                transaction.onerror = (event) => {
                    this.configuration.onTransactionFailed(event);
                    reject(event.target.error);
                };
                const store = transaction.objectStore(storeIdentifier);
                resolve(store);
            } catch (error) {
                reject(error);
            }
        });
    }

    getRecordManager(storeIdentifier) {
        if (!storeIdentifier || typeof storeIdentifier !== 'string') {
            throw new Error("Store identifier must be a non-empty string.");
        }
        return new RecordManager(storeIdentifier, this.#getStoreForOperation.bind(this));
    }
}

class RecordManager {
    constructor(storeIdentifier, getObjectStoreFn) {
        this.storeIdentifier = storeIdentifier;
        this.getObjectStore = getObjectStoreFn;
    }

    async #executeBatchOperation(dataCollection, operation) {
        const store = await this.getObjectStore(this.storeIdentifier, StoreAccessMode.READ_WRITE_ACCESS);

        return new Promise((resolve, reject) => {
            let pendingRequests = 0;
            let firstError = null;
            let lastResult = undefined;

            const processItem = (item) => {
                pendingRequests++;
                const request = operation(store, item);

                request.onsuccess = (event) => {
                    lastResult = event.target.result;
                    pendingRequests--;
                    if (pendingRequests === 0 && !firstError) {
                        resolve(lastResult);
                    }
                };

                request.onerror = (event) => {
                    if (!firstError) {
                        firstError = event.target.error;
                        reject(firstError);
                    }
                    pendingRequests--;
                };
            };

            if (Array.isArray(dataCollection)) {
                if (dataCollection.length === 0) {
                    resolve(undefined);
                    return;
                }
                dataCollection.forEach(processItem);
            } else {
                processItem(dataCollection);
            }
        });
    }

    async deposit(entryData) {
        return this.#executeBatchOperation(entryData, (store, item) => store.add(item));
    }

    async updateOrDeposit(entryData) {
        return this.#executeBatchOperation(entryData, (store, item) => store.put(item));
    }

    async remove(key) {
        const store = await this.getObjectStore(this.storeIdentifier, StoreAccessMode.READ_WRITE_ACCESS);
        return new Promise((resolve, reject) => {
            const request = store.delete(key);
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async purge() {
        const store = await this.getObjectStore(this.storeIdentifier, StoreAccessMode.READ_WRITE_ACCESS);
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async countRecords() {
        const store = await this.getObjectStore(this.storeIdentifier, StoreAccessMode.READ_ONLY_ACCESS);
        return new Promise((resolve, reject) => {
            const request = store.count();
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async fetchSingle(primaryKeyOrIndexName, indexKey) {
        const store = await this.getObjectStore(this.storeIdentifier, StoreAccessMode.READ_ONLY_ACCESS);
        return new Promise((resolve, reject) => {
            let request;
            if (indexKey !== undefined) {
                request = store.index(primaryKeyOrIndexName).get(indexKey);
            } else {
                request = store.get(primaryKeyOrIndexName);
            }
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async fetchAll() {
        const store = await this.getObjectStore(this.storeIdentifier, StoreAccessMode.READ_ONLY_ACCESS);
        return new Promise((resolve, reject) => {
            if (store.getAll) {
                const request = store.getAll();
                request.onsuccess = (event) => resolve(event.target.result);
                request.onerror = (event) => reject(event.target.error);
            } else {
                const results = [];
                const request = store.openCursor();
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                };
                request.onerror = (event) => reject(event.target.error);
            }
        });
    }

    async traverse(processEntryCallback, queryParameters = defaultCursorQuerySettings) {
        const store = await this.getObjectStore(this.storeIdentifier, StoreAccessMode.READ_WRITE_ACCESS);
        return new Promise((resolve, reject) => {
            let request;
            const effectiveQuery = { ...defaultCursorQuerySettings, ...queryParameters };

            if (effectiveQuery.indexName) {
                request = store.index(effectiveQuery.indexName).openCursor(effectiveQuery.keyBound, effectiveQuery.direction);
            } else {
                request = store.openCursor(effectiveQuery.keyBound, effectiveQuery.direction);
            }

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    processEntryCallback(cursor);
                    cursor.continue();
                } else {
                    resolve(null);
                }
            };
            request.onerror = (event) => reject(event.target.error);
        });
    }
}