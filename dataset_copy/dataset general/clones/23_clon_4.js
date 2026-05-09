class DataPersistence {
    constructor(keyPrefix) {
        this.prefix = keyPrefix || '__dv__';
    }

    fetch(key) {
        try {
            const storedValue = localStorage.getItem(this.prefix + key);
            return storedValue ? JSON.parse(storedValue) : null;
        } catch (e) {
            console.error('DataPersistence: Retrieval or parsing error for key:', key, e);
            return null;
        }
    }

    deposit(key, content) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(content));
        } catch (e) {
            console.error('DataPersistence: Storage error for key:', key, e);
        }
    }

    erase(key) {
        localStorage.removeItem(this.prefix + key);
    }

    purgeAll() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
}

function createUniqueId() {
    return (
        Math.random().toString(36).substring(2, 10) +
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 10)
    );
}

function isObjectVacant(obj) {
    return Object.keys(obj).length === 0;
}

function matchesCriteria(item, criteria) {
    if (!criteria || isObjectVacant(criteria)) {
        return true;
    }
    for (const property in criteria) {
        if (Object.prototype.hasOwnProperty.call(criteria, property)) {
            if (item[property] !== criteria[property]) {
                return false;
            }
        }
    }
    return true;
}

class DataEntry {
    constructor(associatedContainer, fields) {
        this._associatedContainer = associatedContainer;
        Object.assign(this, fields);
    }

    persist(completionHandler) {
        this._associatedContainer._updateSingleEntry(this);
        if (typeof completionHandler === 'function') {
            completionHandler();
        }
    }

    deleteEntry(completionHandler) {
        if (this.recordId) {
            this._associatedContainer._removeSingleEntry(this.recordId);
        }
        if (typeof completionHandler === 'function') {
            completionHandler();
        }
    }
}

class DataContainer {
    constructor(vaultInstance, nameOfContainer) {
        this._vaultReference = vaultInstance;
        this.containerName = nameOfContainer;
        this.storageKey = vaultInstance._persistenceAgent.prefix + 'dataset_' + nameOfContainer;
        this.entries = this._vaultReference._persistenceAgent.fetch('dataset_' + nameOfContainer) || [];

        this._registerContainer();
    }

    _registerContainer() {
        if (!this._vaultReference._registeredContainerNames.includes(this.containerName)) {
            this._vaultReference._registeredContainerNames.push(this.containerName);
            this._vaultReference._persistenceAgent.deposit(
                this._vaultReference._metaKey,
                this._vaultReference._registeredContainerNames
            );
        }
    }

    _updateSingleEntry(entryToUpdate) {
        this.entries = this._vaultReference._persistenceAgent.fetch('dataset_' + this.containerName) || [];
        let found = false;
        this.entries.forEach((existingEntry, idx) => {
            if (existingEntry.recordId === entryToUpdate.recordId) {
                this.entries[idx] = Object.assign({}, existingEntry, entryToUpdate);
                found = true;
            }
        });
        if (!found) {
            this.entries.push(Object.assign({ recordId: createUniqueId() }, entryToUpdate));
        }
        this._vaultReference._persistenceAgent.deposit('dataset_' + this.containerName, this.entries);
    }

    _removeSingleEntry(recordIdentifier) {
        this.entries = this._vaultReference._persistenceAgent.fetch('dataset_' + this.containerName) || [];
        this.entries = this.entries.filter(entry => entry.recordId !== recordIdentifier);
        this._vaultReference._persistenceAgent.deposit('dataset_' + this.containerName, this.entries);
    }

    retrieve(criteria = {}, completionHandler) {
        this.entries = this._vaultReference._persistenceAgent.fetch('dataset_' + this.containerName) || [];
        const matchingEntries = this.entries.filter(entry => matchesCriteria(entry, criteria));
        const recordInstances = matchingEntries.map(entry => new DataEntry(this, entry));

        if (typeof completionHandler === 'function') {
            completionHandler(recordInstances);
        }
        return recordInstances;
    }

    add(payload, completionHandler) {
        this.entries = this._vaultReference._persistenceAgent.fetch('dataset_' + this.containerName) || [];
        const newEntries = Array.isArray(payload) ? payload : [payload];
        
        newEntries.forEach(entry => {
            if (!entry.recordId) {
                entry.recordId = createUniqueId();
            }
            this.entries.push(entry);
        });

        this._vaultReference._persistenceAgent.deposit('dataset_' + this.containerName, this.entries);

        if (typeof completionHandler === 'function') {
            const addedRecordInstances = newEntries.map(entry => new DataEntry(this, entry));
            completionHandler(addedRecordInstances.length === 1 ? addedRecordInstances[0] : addedRecordInstances);
        }
    }

    modify(criteria, updates, options = {}, completionHandler) {
        this.entries = this._vaultReference._persistenceAgent.fetch('dataset_' + this.containerName) || [];
        let affectedEntries = this.entries.filter(entry => matchesCriteria(entry, criteria));

        if (affectedEntries.length > 0) {
            affectedEntries.forEach(entry => {
                Object.assign(entry, updates);
            });
        } else if (options.upsert) {
            const newEntry = Object.assign({}, criteria, updates);
            if (!newEntry.recordId) {
                newEntry.recordId = createUniqueId();
            }
            this.entries.push(newEntry);
            affectedEntries = [newEntry];
        }

        this._vaultReference._persistenceAgent.deposit('dataset_' + this.containerName, this.entries);

        if (typeof completionHandler === 'function') {
            const recordInstances = affectedEntries.map(entry => new DataEntry(this, entry));
            completionHandler(recordInstances);
        }
    }

    remove(criteria, completionHandler) {
        this.entries = this._vaultReference._persistenceAgent.fetch('dataset_' + this.containerName) || [];
        const initialCount = this.entries.length;
        this.entries = this.entries.filter(entry => !matchesCriteria(entry, criteria));
        const removedCount = initialCount - this.entries.length;

        this._vaultReference._persistenceAgent.deposit('dataset_' + this.containerName, this.entries);

        if (typeof completionHandler === 'function') {
            completionHandler(removedCount);
        }
    }

    empty() {
        this.entries = [];
        this._vaultReference._persistenceAgent.deposit('dataset_' + this.containerName, this.entries);
    }
}

class DataVaultSystem {
    constructor(vaultIdentifier = 'default') {
        if (DataVaultSystem.instance && DataVaultSystem.instance.vaultId === vaultIdentifier) {
            return DataVaultSystem.instance;
        }

        this.vaultId = vaultIdentifier;
        this._persistenceAgent = new DataPersistence(vaultIdentifier + '_');
        this._metaKey = 'containers_list';
        this._registeredContainerNames = this._persistenceAgent.fetch(this._metaKey) || [];
        this._activeContainers = new Map();

        this.systemVersion = '2.0';

        DataVaultSystem.instance = this;
    }

    getContainer(name) {
        if (!this._activeContainers.has(name)) {
            const newContainer = new DataContainer(this, name);
            this._activeContainers.set(name, newContainer);
        }
        return this._activeContainers.get(name);
    }

    listAllContainerNames() {
        return [...this._registeredContainerNames];
    }

    resetAllData() {
        this._persistenceAgent.purgeAll();
        this._registeredContainerNames = [];
        this._activeContainers.clear();
        this._persistenceAgent.deposit(this._metaKey, this._registeredContainerNames);
    }
}

(function(globalScope) {
    if (typeof globalScope.DataVault === 'undefined') {
        globalScope.DataVault = new DataVaultSystem('primary');
    }
})(typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : global);

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DataVaultSystem;
    }
    exports.DataVault = (typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : global).DataVault;
}