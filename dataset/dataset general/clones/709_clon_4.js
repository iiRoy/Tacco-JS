'use strict';

// --- Custom Event Dispatcher ---
class EventDispenser {
    constructor() {
        this.listeners = new Map();
    }
    on(signalName, handlerFunction) {
        if (!this.listeners.has(signalName)) {
            this.listeners.set(signalName, []);
        }
        this.listeners.get(signalName).push(handlerFunction);
    }
    once(signalName, handlerFunction) {
        const temporaryWrapper = (...args) => {
            handlerFunction(...args);
            this.off(signalName, temporaryWrapper);
        };
        this.on(signalName, temporaryWrapper);
    }
    off(signalName, handlerFunction) {
        if (this.listeners.has(signalName)) {
            const currentHandlers = this.listeners.get(signalName);
            this.listeners.set(signalName, currentHandlers.filter(listener => listener !== handlerFunction));
        }
    }
    emit(signalName, ...args) {
        if (this.listeners.has(signalName)) {
            // Make a copy to prevent issues if a listener removes itself or others
            [...this.listeners.get(signalName)].forEach(handlerFunction => handlerFunction(...args));
        }
    }
}

// --- Mock for DatabaseFactory (DataNexusManager) ---
class DataVaultHandler extends EventDispenser {
    constructor() {
        super();
        this.activeVaults = new Map(); // Simulates currently open databases
    }

    async initiateAccess(vaultId, requestedVersion = 1) {
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async delay
        let targetVault = this.activeVaults.get(vaultId);
        let isNewVault = false;
        let requiresUpgrade = false;

        if (!targetVault) {
            isNewVault = true;
            targetVault = {
                identifier: vaultId,
                version: requestedVersion,
                collections: new Map(), // Mock object stores
            };
            this.activeVaults.set(vaultId, targetVault);
        } else if (requestedVersion > targetVault.version) {
            requiresUpgrade = true;
            targetVault.version = requestedVersion;
        }

        // Simulate native DB open to trigger upgradeneeded if applicable
        const nativeAccessRequest = NATIVE_DATA_MANAGER.open(vaultId, targetVault.version);
        await new Promise((resolve, reject) => {
            nativeAccessRequest.onsuccess = (evt) => {
                evt.target.result.close();
                resolve();
            };
            nativeAccessRequest.onerror = (evt) => reject(evt.target.error);
            nativeAccessRequest.onupgradeneeded = (evt) => {
                // This implies a schema change, so the internal state of NATIVE_DATA_MANAGER
                // has been updated by its own logic.
                evt.target.result.close();
                resolve();
            };
        });

        if (isNewVault || requiresUpgrade) {
            this.emit('upgraded', targetVault);
        }
        this.emit('opened', targetVault);

        // Attach schema modification methods to the returned vault object
        targetVault.createCollection = async (label) => {
            await new Promise(resolve => setTimeout(resolve, 10));
            const newCollection = {
                label: label,
                indices: new Map(),
                createLocator: async (tag, keyAttr, options) => {
                    await new Promise(resolve => setTimeout(resolve, 10));
                    const newLocator = { tag, keyAttr, options };
                    newCollection.indices.set(tag, newLocator);
                    // Inform the native manager's internal schema
                    NATIVE_DATA_MANAGER._internalUpdateDbSchema(targetVault.identifier, label, tag, keyAttr, options);
                    return newLocator;
                },
                get indexNames() { return Array.from(this.indices.keys()); } // Note: 'this' here refers to newCollection
            };
            targetVault.collections.set(label, newCollection);
            // Inform the native manager's internal schema about the new store
            NATIVE_DATA_MANAGER._internalUpdateDbSchema(targetVault.identifier, label);
            return newCollection;
        };
        Object.defineProperty(targetVault, 'objectStoreNames', { // Define as a getter
            get() { return Array.from(targetVault.collections.keys()); }
        });

        return targetVault;
    }

    async removeVault(vaultId) {
        await new Promise(resolve => setTimeout(resolve, 50));
        if (this.activeVaults.delete(vaultId)) {
            this.emit('deleted', vaultId);
            // The original returns a Promise, so we should too, and ensure native deletion is simulated
            const nativeDeleteRequest = NATIVE_DATA_MANAGER.deleteDatabase(vaultId);
            await new Promise((resolve, reject) => {
                nativeDeleteRequest.onsuccess = () => resolve();
                nativeDeleteRequest.onerror = (evt) => reject(evt.target.error);
            });
            return { identifier: vaultId };
        }
        throw new Error(`Vault '${vaultId}' not found for deletion.`);
    }
}

const GlobalDataNexus = new DataVaultHandler();

// --- Mock for indexedDB (NativeDataStore) ---
const NATIVE_DATA_MANAGER = (() => {
    // Represents the actual IndexedDB state in a virtual environment
    const virtualDatabases = new Map(); // {name: {version, stores: {storeName: {indices: {indexName: {keyPath, options}}}}}}

    class MockNativeDatabase {
        constructor(name, version) {
            this.name = name;
            this.version = version;
            this.isClosed = false;
            this._objectStores = new Map(); // {name: MockNativeObjectStore}

            // Populate stores and indices from virtual state
            const dbState = virtualDatabases.get(name);
            if (dbState && dbState.stores) {
                for (const [storeName, storeState] of Object.entries(dbState.stores)) {
                    const mockStore = new MockNativeObjectStore(storeName);
                    if (storeState.indices) {
                        for (const [idxName, idxState] of Object.entries(storeState.indices)) {
                            mockStore._indices.set(idxName, new MockNativeIndex(idxName, idxState.keyPath, idxState.options));
                        }
                    }
                    this._objectStores.set(storeName, mockStore);
                }
            }
        }
        close() {
            this.isClosed = true;
        }
        transaction(storeLabels, mode) {
            return new MockNativeTransaction(this, storeLabels, mode);
        }
        get objectStoreNames() {
            return Array.from(this._objectStores.keys());
        }
    }

    class MockNativeTransaction {
        constructor(db, storeLabels, mode) {
            this._database = db;
            this._storeLabels = Array.isArray(storeLabels) ? storeLabels : [storeLabels];
            this._accessMode = mode;
        }
        objectStore(storeLabel) {
            if (!this._storeLabels.includes(storeLabel)) {
                throw new Error(`Access to object store '${storeLabel}' not permitted in this transaction.`);
            }
            const store = this._database._objectStores.get(storeLabel);
            if (!store) {
                throw new Error(`Object store '${storeLabel}' not found.`);
            }
            return store;
        }
    }

    class MockNativeObjectStore {
        constructor(name) {
            this.name = name;
            this._indices = new Map(); // {name: MockNativeIndex}
        }
        index(name) {
            const idx = this._indices.get(name);
            if (!idx) {
                throw new Error(`Index '${name}' not found in object store '${this.name}'.`);
            }
            return idx;
        }
    }

    class MockNativeIndex {
        constructor(name, keyPath, options) {
            this.name = name;
            this.keyPath = keyPath;
            this.options = options;
        }
    }

    class MockNativeRequest {
        constructor() {
            this.onsuccess = null;
            this.onerror = null;
            this.onupgradeneeded = null;
            this.readyState = 'pending';
            this.result = null;
            this.error = null;
            this.target = this; // Mimic event.target
        }

        _triggerSuccess(data) {
            this.readyState = 'done';
            this.result = data;
            if (this.onsuccess) {
                this.onsuccess({ target: this });
            }
        }

        _triggerError(err) {
            this.readyState = 'done';
            this.error = err;
            if (this.onerror) {
                this.onerror({ target: this });
            }
        }

        _triggerUpgrade(data) {
            this.readyState = 'done';
            this.result = data;
            if (this.onupgradeneeded) {
                this.onupgradeneeded({ target: this });
            }
        }

        addEventListener(eventName, handler) {
            if (eventName === 'upgradeneeded') {
                this.onupgradeneeded = handler;
            } else if (eventName === 'success') { // Not standard, but for compatibility
                this.onsuccess = handler;
            } else if (eventName === 'error') { // Not standard, but for compatibility
                this.onerror = handler;
            }
        }
        removeEventListener(eventName, handler) {
            // Simplified, not critical for these tests
        }
    }

    return {
        open: (name, version) => {
            const request = new MockNativeRequest();
            setTimeout(() => { // Simulate async
                let dbState = virtualDatabases.get(name);
                if (!dbState) {
                    // New database or deleted database, trigger upgradeneeded
                    dbState = { name, version, stores: {} };
                    virtualDatabases.set(name, dbState);
                    const newDb = new MockNativeDatabase(name, version);
                    request._triggerUpgrade(newDb);
                } else if (version && version > dbState.version) {
                    // Upgrade database
                    dbState.version = version;
                    virtualDatabases.set(name, dbState);
                    const upgradedDb = new MockNativeDatabase(name, version);
                    request._triggerUpgrade(upgradedDb);
                } else {
                    // Open existing database without upgrade
                    const existingDb = new MockNativeDatabase(name, dbState.version);
                    request._triggerSuccess(existingDb);
                }
            }, 10);
            return request;
        },
        deleteDatabase: (name) => {
            const request = new MockNativeRequest();
            setTimeout(() => {
                if (virtualDatabases.delete(name)) {
                    request._triggerSuccess({ name }); // Mimic success for deletion
                } else {
                    request._triggerError(new Error(`Database '${name}' not found for deletion.`));
                }
            }, 10);
            return request;
        },
        // Internal method to update the virtual schema, used by DataVaultHandler
        _internalUpdateDbSchema: (dbName, storeLabel, indexTag = null, locatorKeyAttribute = null, options = {}) => {
            let dbState = virtualDatabases.get(dbName);
            if (!dbState) {
                dbState = { name: dbName, version: 1, stores: {} };
                virtualDatabases.set(dbName, dbState);
            }
            if (!dbState.stores[storeLabel]) {
                dbState.stores[storeLabel] = { indices: {} };
            }
            if (indexTag) {
                dbState.stores[storeLabel].indices[indexTag] = { keyPath: locatorKeyAttribute, options: options };
            }
        }
    };
})();

// --- Assertion Utility (ProofAgent) ---
const ProofAgent = {
    assertionLog: [],
    currentEvaluationName: '',
    totalEvaluations: 0,
    failedAssertions: 0,

    _documentAssertion(type, message, details = {}) {
        this.assertionLog.push({ evaluation: this.currentEvaluationName, type, message, ...details });
        if (type === 'failure') {
            this.failedAssertions++;
        }
    },

    produceReport() {
        console.log(`\n=== Evaluation Summary ===`);
        console.log(`Total evaluation units: ${this.totalEvaluations}`);
        console.log(`Individual assertions:`);
        this.assertionLog.forEach(record => {
            const detailStr = record.expected !== undefined ? ` (Expected: ${JSON.stringify(record.expected)}, Actual: ${JSON.stringify(record.actual)})` : '';
            console.log(`  [${record.evaluation}] ${record.type.toUpperCase()}: ${record.message}${detailStr}`);
        });
        console.log(`\nFailed assertions: ${this.failedAssertions}`);
        console.log(`Overall Status: ${this.failedAssertions === 0 ? 'SUCCESS' : 'FAILURE'}`);
        return this.failedAssertions === 0;
    },

    confirm(message) {
        this._documentAssertion('success', message);
    },
    verifyEquality(actualValue, expectedValue, message) {
        if (actualValue === expectedValue) {
            this._documentAssertion('success', message || `Values are identical: ${actualValue}`);
        } else {
            this._documentAssertion('failure', message || `Values differ`, { actual: actualValue, expected: expectedValue });
        }
    },
    validateTruth(value, message) {
        if (!!value) {
            this._documentAssertion('success', message || `Value is truthy`);
        } else {
            this._documentAssertion('failure', message || `Value is falsy`, { actual: value, expected: true });
        }
    },
    indicateFailure(message) {
        this._documentAssertion('failure', message || `Explicit failure indicated`);
    }
};

// --- Test Orchestrator ---
const TestOrchestrator = {
    evaluationUnits: [],
    addUnit(name, unitFunction) {
        this.evaluationUnits.push({ name, unitFunction });
    },
    async commenceExecution() {
        console.log('Initiating test suite...');
        ProofAgent.totalEvaluations = this.evaluationUnits.length;
        for (const unit of this.evaluationUnits) {
            ProofAgent.currentEvaluationName = unit.name;
            try {
                // Each unit function receives ProofAgent and a signal to indicate completion
                await new Promise(resolve => {
                    unit.unitFunction(ProofAgent, resolve);
                });
            } catch (e) {
                ProofAgent.indicateFailure(`Uncaught exception in evaluation '${unit.name}': ${e.message}`);
                console.error(`Error in evaluation '${unit.name}':`, e);
            }
        }
        ProofAgent.produceReport();
    }
};

// --- Constants (Access Modes) ---
const ACCESS_MODES = {
    OBSERVE_MODE: 'readonly',
    ALTER_MODE: 'readwrite'
};

// --- Test Cases (Evaluation Units) ---

// Corresponds to 'test opendb'
TestOrchestrator.addUnit('verify_vault_initiation', async (proof_agent, completion_signal) => {
    const dataVaultIdentifier = "first_access_point";
    let opened_signal_received = false;
    let upgraded_signal_received = false;

    GlobalDataNexus.once('opened', (vault) => {
        opened_signal_received = true;
        proof_agent.confirm('Vault initiated signal received');
        proof_agent.verifyEquality(dataVaultIdentifier, vault.identifier, 'Vault identifier matches for initiated signal');
    });

    GlobalDataNexus.once('upgraded', (vault) => {
        upgraded_signal_received = true;
        proof_agent.confirm('Vault schema updated signal received');
        proof_agent.verifyEquality(dataVaultIdentifier, vault.identifier, 'Vault identifier matches for schema updated signal');
    });

    try {
        const primaryVault = await GlobalDataNexus.initiateAccess(dataVaultIdentifier);

        proof_agent.validateTruth(opened_signal_received, 'Initiated signal must have been received');
        proof_agent.validateTruth(upgraded_signal_received, 'Schema updated signal must have been received for a new vault');

        // Now verify using the simulated native data store
        const nativeRequest = NATIVE_DATA_MANAGER.open(primaryVault.identifier, primaryVault.version);

        await new Promise((resolve, reject) => {
            nativeRequest.onsuccess = (evt) => {
                proof_agent.confirm('Native vault access successful');
                proof_agent.verifyEquality(evt.target.result.name, primaryVault.identifier, 'Native vault identifier matches');
                evt.target.result.close();
                resolve();
            };
            nativeRequest.onerror = (evt) => {
                proof_agent.indicateFailure('Native vault access failed: ' + (evt.target.error ? evt.target.error.message : 'Unknown error'));
                reject(evt.target.error);
            };
            nativeRequest.addEventListener("upgradeneeded", () => {
                proof_agent.indicateFailure('No schema update should be required for an existing native vault');
                reject(new Error('Unexpected upgradeneeded event'));
            });
        });
    } catch (e) {
        proof_agent.indicateFailure(`Unexpected error during vault initiation evaluation: ${e.message}`);
    } finally {
        completion_signal();
    }
});

// Corresponds to 'test deletedb'
TestOrchestrator.addUnit('verify_vault_removal', async (proof_agent, completion_signal) => {
    const dataVaultIdentifier = "second_access_point";
    let removal_signal_received = false;

    GlobalDataNexus.once('deleted', (name) => {
        removal_signal_received = true;
        proof_agent.confirm('Vault removal signal dispatched');
        proof_agent.verifyEquality(dataVaultIdentifier, name, 'Vault identifier matches for removal signal');
    });

    try {
        await GlobalDataNexus.initiateAccess(dataVaultIdentifier); // Ensure it exists first
        await GlobalDataNexus.removeVault(dataVaultIdentifier);

        proof_agent.validateTruth(removal_signal_received, 'Removal signal must have been received');

        // Now try to open it natively to confirm deletion (should trigger upgradeneeded)
        const nativeRequest = NATIVE_DATA_MANAGER.open(dataVaultIdentifier, 1);

        await new Promise((resolve, reject) => {
            nativeRequest.onsuccess = (evt) => {
                proof_agent.indicateFailure('Native vault access succeeded unexpectedly after deletion');
                evt.target.result.close();
                resolve();
            };
            nativeRequest.addEventListener("upgradeneeded", (evt) => {
                proof_agent.confirm('Native schema update required, confirming vault deletion');
                evt.target.result.close();
                resolve();
            });
            nativeRequest.onerror = (evt) => {
                proof_agent.indicateFailure('Native vault access failed after deletion: ' + (evt.target.error ? evt.target.error.message : 'Unknown error'));
                reject(evt.target.error);
            };
        });
    } catch (e) {
        proof_agent.indicateFailure(`Unexpected error during vault removal evaluation: ${e.message}`);
    } finally {
        completion_signal();
    }
});

// Corresponds to 'test open high version db'
TestOrchestrator.addUnit('verify_versioned_vault_access', async (proof_agent, completion_signal) => {
    const dataVaultIdentifier = "versioned_access_point";
    const desiredVersion = 10;

    try {
        // First, open natively to establish a high version
        const nativeRequest = NATIVE_DATA_MANAGER.open(dataVaultIdentifier, desiredVersion);

        await new Promise((resolve, reject) => {
            nativeRequest.onsuccess = (evt) => {
                proof_agent.confirm(`Native vault created with version ${evt.target.result.version}`);
                evt.target.result.close();
                resolve();
            };
            nativeRequest.onerror = (evt) => {
                proof_agent.indicateFailure('Native vault creation failed: ' + (evt.target.error ? evt.target.error.message : 'Unknown error'));
                reject(evt.target.error);
            };
            nativeRequest.addEventListener("upgradeneeded", () => {
                proof_agent.confirm('Native schema update triggered for versioned vault');
                nativeRequest.result.close();
                resolve();
            });
        });

        // Now, open with our custom factory and check version
        const obtainedVault = await GlobalDataNexus.initiateAccess(dataVaultIdentifier);
        proof_agent.verifyEquality(desiredVersion, obtainedVault.version, 'Vault accessed by factory should reflect the correct version');

    } catch (e) {
        proof_agent.indicateFailure(`Unexpected error during versioned vault access evaluation: ${e.message}`);
    } finally {
        completion_signal();
    }
});

// Corresponds to 'test create index'
TestOrchestrator.addUnit('verify_locator_creation', async (proof_agent, completion_signal) => {
    const dataVaultIdentifier = "structure_test_vault",
          containerLabel = "item_container",
          locatorTag = "price_locator",
          locatorKeyAttribute = "value_field",
          configuration = {};

    try {
        const primaryVault = await GlobalDataNexus.initiateAccess(dataVaultIdentifier);
        const itemContainer = await primaryVault.createCollection(containerLabel);
        const priceLocator = await itemContainer.createLocator(locatorTag, locatorKeyAttribute, configuration);

        proof_agent.validateTruth(priceLocator !== null, 'Locator object should be created');
        proof_agent.verifyEquality(priceLocator.tag, locatorTag, 'Locator tag matches');
        proof_agent.verifyEquality(priceLocator.keyAttr, locatorKeyAttribute, 'Locator key attribute matches');

        // Verify using the simulated native data store
        const nativeRequest = NATIVE_DATA_MANAGER.open(dataVaultIdentifier, primaryVault.version);

        await new Promise((resolve, reject) => {
            nativeRequest.onsuccess = ({ target }) => {
                const nativeVault = target.result;
                try {
                    const transaction = nativeVault.transaction(containerLabel, ACCESS_MODES.OBSERVE_MODE);
                    const objectContainer = transaction.objectStore(containerLabel);
                    const nativeLocator = objectContainer.index(locatorTag);

                    proof_agent.validateTruth(nativeLocator !== null, 'Native locator should exist');
                    proof_agent.verifyEquality(nativeLocator.name, locatorTag, 'Native locator name matches');
                    proof_agent.verifyEquality(nativeLocator.keyPath, locatorKeyAttribute, 'Native locator key path matches');
                    nativeVault.close();
                    resolve();
                } catch (e) {
                    proof_agent.indicateFailure(`Error accessing native locator: ${e.message}`);
                    nativeVault.close();
                    reject(e);
                }
            };
            nativeRequest.onerror = () => {
                proof_agent.indicateFailure('Failed to open native vault for locator verification');
                reject(new Error('Native vault open error'));
            };
            nativeRequest.addEventListener("upgradeneeded", () => {
                proof_agent.indicateFailure('No schema update should be needed for locator verification');
                reject(new Error('Unexpected upgradeneeded event'));
            });
        });

    } catch (e) {
        proof_agent.indicateFailure(`Unexpected error during locator creation evaluation: ${e.message}`);
    } finally {
        completion_signal();
    }
});

// --- Initiate Execution ---
TestOrchestrator.commenceExecution();