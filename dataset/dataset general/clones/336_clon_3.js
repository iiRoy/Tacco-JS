(function(dataVaultAPI){
    // DataVault.js 1.1.0-alpha
    // (c) 2024 Reimagined by AI Assistant
    // DataVault.js is distributed under a permissive open-source license.

    // Internal configuration and state
    const _vaultConfig = {
        version: '1.1.0-alpha',
        defaultCollectionName: 'unlabeled_data',
        idPrefix: 'dv_',
        storageKeyPrefix: 'dv_store_',
        enableLogging: true,
        enableEventDispatch: true
    };

    // Check for browser's local storage capabilities.
    let _canUseLocalStorage = (() => {
        try {
            const testKey = '__dv_test_key__';
            if (typeof window === 'undefined' || !window.localStorage) {
                return false;
            }
            window.localStorage.setItem(testKey, testKey);
            window.localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            if (_vaultConfig.enableLogging) {
                console.warn('DataVault: Local storage access denied or not available.', e);
            }
            return false;
        }
    })();

    // Internal event dispatcher system
    const _eventSubscribers = new Map(); // Using Map for better performance and clarity

    /**
     * Executes all registered callbacks for a given event.
     * @param {string} eventIdentifier - The name of the event.
     * @param {any} [payload] - Optional data to pass to event handlers.
     * @private
     */
    const _dispatchVaultEvent = (eventIdentifier, payload = null) => {
        if (!_vaultConfig.enableEventDispatch) return;

        const handlers = _eventSubscribers.get(eventIdentifier) || [];
        if (handlers.length === 0) return;

        for (const handlerFn of handlers) {
            try {
                handlerFn.call(dataVaultAPI, payload); // Use .call to set 'this' context
            } catch (error) {
                if (_vaultConfig.enableLogging) {
                    console.error(`DataVault: Error executing handler for event "${eventIdentifier}":`, error);
                }
            }
        }
    };

    // Custom error logging for vault operations.
    const _logVaultError = (errorCode, contextInfo, additionalDetails = '') => {
        if (!_vaultConfig.enableLogging) return;

        let message = '';
        switch (errorCode) {
            case 'DV-001':
                message = `Collection "${contextInfo}" not found or empty. Use createCollection() first.`;
                break;
            case 'DV-002':
                message = `Collection "${contextInfo}" already exists.`;
                break;
            case 'DV-003':
                message = `Invalid data provided for operation: ${additionalDetails}`;
                break;
            case 'DV-004':
                message = `Local storage not accessible. Operation failed: ${contextInfo}`;
                break;
            case 'DV-005':
                message = `Operation requires a valid collection name (string): ${contextInfo}`;
                break;
            case 'DV-006':
                message = `Object ID not found for update/delete in collection "${contextInfo}".`;
                break;
            default:
                message = `An unexpected DataVault error occurred (Code: ${errorCode}): ${contextInfo}.`;
                break;
        }
        console.error(`DataVault Error ${errorCode}: ${message}`);
    };

    /**
     * Retrieves and parses a collection from local storage.
     * @param {string} collectionLabel - The name of the collection.
     * @returns {Array|null} Parsed array of objects or null if not found/error.
     * @private
     */
    const _fetchCollectionData = (collectionLabel) => {
        if (!_canUseLocalStorage) {
            _logVaultError('DV-004', `_fetchCollectionData(${collectionLabel})`);
            return null;
        }
        if (typeof collectionLabel !== 'string' || collectionLabel.trim() === '') {
            _logVaultError('DV-005', collectionLabel);
            return null;
        }

        const fullKey = _vaultConfig.storageKeyPrefix + collectionLabel;
        try {
            const rawData = window.localStorage.getItem(fullKey);
            if (rawData === null) {
                return null; // Collection not found
            }
            return JSON.parse(rawData);
        } catch (error) {
            _logVaultError('DV-003', `Failed to parse collection "${collectionLabel}" data.`, error.message);
            return null;
        }
    };

    /**
     * Serializes and stores a collection in local storage.
     * @param {string} collectionLabel - The name of the collection.
     * @param {Array} dataToStore - The array of objects to store.
     * @returns {boolean} True if successful, false otherwise.
     * @private
     */
    const _persistCollectionData = (collectionLabel, dataToStore) => {
        if (!_canUseLocalStorage) {
            _logVaultError('DV-004', `_persistCollectionData(${collectionLabel})`);
            return false;
        }
        if (typeof collectionLabel !== 'string' || collectionLabel.trim() === '') {
            _logVaultError('DV-005', collectionLabel);
            return false;
        }
        if (!Array.isArray(dataToStore)) {
            _logVaultError('DV-003', 'Attempted to store non-array data.', `Collection: ${collectionLabel}`);
            return false;
        }

        const fullKey = _vaultConfig.storageKeyPrefix + collectionLabel;
        try {
            window.localStorage.setItem(fullKey, JSON.stringify(dataToStore));
            return true;
        } catch (error) {
            _logVaultError('DV-003', `Failed to serialize or store collection "${collectionLabel}".`, error.message);
            return false;
        }
    };

    /**
     * Generates a unique identifier for a data entry and adds a timestamp.
     * @param {object} entryObject - The object to assign an ID and timestamp to.
     * @returns {object} The modified object with an ID and timestamp.
     * @private
     */
    const _assignUniqueMetadata = (entryObject) => {
        if (typeof entryObject !== 'object' || entryObject === null) {
            _logVaultError('DV-003', 'Cannot assign metadata to non-object.', entryObject);
            return entryObject;
        }

        const workingObject = { ...entryObject }; // Create a shallow copy to avoid direct mutation of input

        if (!workingObject.id) {
            // Using a more robust ID generation (random string + timestamp)
            const randomPart = Math.random().toString(36).substring(2, 11); // 9 chars
            const timestampPart = Date.now().toString(36); // Base 36 for shorter string
            workingObject.id = `${_vaultConfig.idPrefix}${randomPart}_${timestampPart}`;
        }
        if (!workingObject.creationTime) {
            workingObject.creationTime = new Date().toISOString(); // ISO string for better readability/sorting
        }
        return workingObject;
    };

    // Public API functions

    /**
     * Registers a callback function for a specific DataVault event.
     * @param {string} eventName - The name of the event (e.g., 'collectionCreated', 'itemAdded').
     * @param {Function} callbackFn - The function to execute when the event is dispatched.
     */
    dataVaultAPI.subscribe = (eventName, callbackFn) => {
        if (typeof eventName !== 'string' || eventName.trim() === '') {
            _logVaultError('DV-003', 'Invalid event name provided for subscription.', eventName);
            return;
        }
        if (typeof callbackFn !== 'function') {
            _logVaultError('DV-003', `Callback for event "${eventName}" must be a function.`, callbackFn);
            return;
        }

        if (!_eventSubscribers.has(eventName)) {
            _eventSubscribers.set(eventName, []);
        }
        _eventSubscribers.get(eventName).push(callbackFn);
    };

    /**
     * Checks if a collection exists in storage.
     * @param {string} collectionName - The name of the collection.
     * @returns {boolean} True if the collection exists and is not empty, false otherwise.
     */
    dataVaultAPI.hasCollection = (collectionName) => {
        if (typeof collectionName !== 'string' || collectionName.trim() === '') {
            _logVaultError('DV-005', collectionName, 'hasCollection()');
            return false;
        }
        const data = _fetchCollectionData(collectionName);
        return Array.isArray(data) && data.length > 0;
    };

    /**
     * Retrieves all items from a specified collection.
     * @param {string} collectionName - The name of the collection.
     * @returns {Array} An array of objects from the collection, or an empty array if not found/error.
     */
    dataVaultAPI.retrieveAll = (collectionName) => {
        if (typeof collectionName !== 'string' || collectionName.trim() === '') {
            _logVaultError('DV-005', collectionName, 'retrieveAll()');
            return [];
        }

        const items = _fetchCollectionData(collectionName);
        if (items === null) {
            _logVaultError('DV-001', collectionName, 'retrieveAll()');
            return [];
        }
        _dispatchVaultEvent('retrievedAll', { collection: collectionName, count: items.length });
        return items;
    };

    /**
     * Filters a collection and returns items matching a key-value pair.
     * @param {string} collectionName - The name of the collection.
     * @param {string} keyAttribute - The attribute to match against.
     * @param {any} desiredValue - The value to match.
     * @returns {Array} An array of matching objects, or an empty array if none found.
     */
    dataVaultAPI.filterBy = (collectionName, keyAttribute, desiredValue) => {
        if (typeof collectionName !== 'string' || collectionName.trim() === '') {
            _logVaultError('DV-005', collectionName, 'filterBy()');
            return [];
        }
        if (typeof keyAttribute !== 'string' || keyAttribute.trim() === '') {
            _logVaultError('DV-003', `Invalid keyAttribute for filterBy: ${keyAttribute}`);
            return [];
        }

        const allItems = dataVaultAPI.retrieveAll(collectionName);
        if (!Array.isArray(allItems) || allItems.length === 0) {
            return [];
        }

        const matchingItems = allItems.filter(item => item && item[keyAttribute] === desiredValue);
        _dispatchVaultEvent('filteredCollection', { collection: collectionName, key: keyAttribute, value: desiredValue, count: matchingItems.length });
        return matchingItems;
    };

    /**
     * Retrieves a single item by its unique ID from a collection.
     * @param {string} collectionName - The name of the collection.
     * @param {string} itemIdentifier - The 'id' of the item to retrieve.
     * @returns {object|null} The matching object, or null if not found.
     */
    dataVaultAPI.fetchOne = (collectionName, itemIdentifier) => {
        if (typeof itemIdentifier !== 'string' && typeof itemIdentifier !== 'number') {
            _logVaultError('DV-003', `Invalid itemIdentifier for fetchOne: ${itemIdentifier}`);
            return null;
        }

        const results = dataVaultAPI.filterBy(collectionName, 'id', itemIdentifier);
        const foundItem = results.length > 0 ? results[0] : null;

        _dispatchVaultEvent('fetchedOne', { collection: collectionName, id: itemIdentifier, found: !!foundItem });
        return foundItem;
    };

    /**
     * Adds one or more new items to a collection.
     * Assigns unique IDs and timestamps if not present.
     * @param {string} collectionName - The name of the collection.
     * @param {object|Array<object>} newEntryData - The item(s) to add.
     * @returns {Array<object>} The items that were successfully added, or an empty array on failure.
     */
    dataVaultAPI.addItems = (collectionName, newEntryData) => {
        if (typeof collectionName !== 'string' || collectionName.trim() === '') {
            _logVaultError('DV-005', collectionName, 'addItems()');
            return [];
        }
        if (!newEntryData || (typeof newEntryData !== 'object' && !Array.isArray(newEntryData))) {
            _logVaultError('DV-003', 'New entry data must be an object or array of objects.', newEntryData);
            return [];
        }

        let currentItems = _fetchCollectionData(collectionName);
        if (currentItems === null) {
            _logVaultError('DV-001', collectionName, 'addItems() - Collection does not exist. Use createCollection() first.');
            return [];
        }

        const itemsToAdd = Array.isArray(newEntryData) ? newEntryData : [newEntryData];
        const processedItems = [];

        for (let item of itemsToAdd) {
            if (typeof item === 'object' && item !== null) {
                const itemWithMetadata = _assignUniqueMetadata(item);
                currentItems.push(itemWithMetadata);
                processedItems.push(itemWithMetadata);
            } else {
                _logVaultError('DV-003', 'Skipping invalid item in addItems batch.', item);
            }
        }

        if (processedItems.length > 0) {
            if (_persistCollectionData(collectionName, currentItems)) {
                _dispatchVaultEvent('itemsAdded', { collection: collectionName, addedCount: processedItems.length, items: processedItems.map(i => i.id) });
                return processedItems;
            }
        }
        return [];
    };

    /**
     * Creates a new collection or initializes an existing one with provided data.
     * If the collection already exists and `overwrite` is false, it appends data.
     * If `overwrite` is true, it replaces the collection entirely.
     * @param {string} collectionName - The name of the collection.
     * @param {object|Array<object>} [initialData=[]] - Initial data for the collection.
     * @param {boolean} [overwrite=false] - Whether to overwrite an existing collection.
     * @returns {boolean} True if the collection was created/updated, false otherwise.
     */
    dataVaultAPI.createCollection = (collectionName, initialData = [], overwrite = false) => {
        if (typeof collectionName !== 'string' || collectionName.trim() === '') {
            _logVaultError('DV-005', collectionName, 'createCollection()');
            return false;
        }

        let currentData = _fetchCollectionData(collectionName);
        let collectionExists = currentData !== null;
        let dataToStore = [];
        let itemsAddedCount = 0;

        if (collectionExists && !overwrite) {
            // Append to existing collection
            dataToStore = currentData;
            if (_vaultConfig.enableLogging) {
                console.info(`DataVault: Appending to existing collection "${collectionName}".`);
            }
        } else if (collectionExists && overwrite) {
            // Overwrite existing collection
            if (_vaultConfig.enableLogging) {
                console.info(`DataVault: Overwriting existing collection "${collectionName}".`);
            }
        } else {
            // New collection
            if (_vaultConfig.enableLogging) {
                console.info(`DataVault: Creating new collection "${collectionName}".`);
            }
        }

        const initialItems = Array.isArray(initialData) ? initialData : (initialData ? [initialData] : []);
        for (let item of initialItems) {
            if (typeof item === 'object' && item !== null) {
                dataToStore.push(_assignUniqueMetadata(item));
                itemsAddedCount++;
            } else {
                _logVaultError('DV-003', 'Skipping invalid initial item during collection creation.', item);
            }
        }

        if (_persistCollectionData(collectionName, dataToStore)) {
            _dispatchVaultEvent('collectionCreated', { collection: collectionName, initialCount: itemsAddedCount, overwritten: overwrite });
            return true;
        }
        return false;
    };

    /**
     * Removes an entire collection from local storage.
     * @param {string} collectionName - The name of the collection to remove.
     * @returns {boolean} True if removed, false if not found or error.
     */
    dataVaultAPI.dropCollection = (collectionName) => {
        if (typeof collectionName !== 'string' || collectionName.trim() === '') {
            _logVaultError('DV-005', collectionName, 'dropCollection()');
            return false;
        }
        if (!_canUseLocalStorage) {
            _logVaultError('DV-004', `dropCollection(${collectionName})`);
            return false;
        }

        const fullKey = _vaultConfig.storageKeyPrefix + collectionName;
        if (window.localStorage.getItem(fullKey) === null) {
            _logVaultError('DV-001', collectionName, 'dropCollection()');
            return false; // Collection doesn't exist
        }

        try {
            window.localStorage.removeItem(fullKey);
            _dispatchVaultEvent('collectionDropped', { collection: collectionName });
            return true;
        } catch (error) {
            _logVaultError('DV-003', `Failed to remove collection "${collectionName}".`, error.message);
            return false;
        }
    };

    /**
     * Removes a specific item from a collection based on its ID.
     * @param {string} collectionName - The name of the collection.
     * @param {string} itemID - The ID of the item to remove.
     * @param {Function} [onComplete] - Optional callback function to execute after removal.
     * @returns {boolean} True if the item was removed, false otherwise.
     */
    dataVaultAPI.removeItem = (collectionName, itemID, onComplete = null) => {
        if (typeof collectionName !== 'string' || collectionName.trim() === '') {
            _logVaultError('DV-005', collectionName, 'removeItem()');
            return false;
        }
        if (typeof itemID !== 'string' && typeof itemID !== 'number') {
            _logVaultError('DV-003', `Invalid itemID for removeItem: ${itemID}`);
            return false;
        }

        let currentItems = _fetchCollectionData(collectionName);
        if (currentItems === null || currentItems.length === 0) {
            _logVaultError('DV-001', collectionName, 'removeItem()');
            return false;
        }

        const initialLength = currentItems.length;
        const updatedItems = currentItems.filter(item => item && item.id !== itemID);

        if (updatedItems.length === initialLength) {
            _logVaultError('DV-006', collectionName, `Item ID: ${itemID}`);
            return false; // Item not found
        }

        if (_persistCollectionData(collectionName, updatedItems)) {
            _dispatchVaultEvent('itemRemoved', { collection: collectionName, id: itemID, newCount: updatedItems.length });
            if (typeof onComplete === 'function') {
                onComplete(updatedItems);
            }
            return true;
        }
        return false;
    };

    /**
     * Updates an existing item in a collection. If the item doesn't exist, it's added.
     * @param {string} collectionName - The name of the collection.
     * @param {object} updatedItemData - The item object with its 'id' property.
     * @returns {boolean} True if the item was updated/added, false otherwise.
     */
    dataVaultAPI.updateItem = (collectionName, updatedItemData) => {
        if (typeof collectionName !== 'string' || collectionName.trim() === '') {
            _logVaultError('DV-005', collectionName, 'updateItem()');
            return false;
        }
        if (typeof updatedItemData !== 'object' || updatedItemData === null || !updatedItemData.id) {
            _logVaultError('DV-003', 'Updated item must be an object with an "id" property.', updatedItemData);
            return false;
        }

        let currentItems = _fetchCollectionData(collectionName);
        if (currentItems === null) {
            // If collection doesn't exist, create it and add the item
            if (_vaultConfig.enableLogging) {
                console.info(`DataVault: Collection "${collectionName}" not found, creating it and adding item.`);
            }
            return dataVaultAPI.createCollection(collectionName, updatedItemData);
        }

        let itemFound = false;
        const processedItem = _assignUniqueMetadata(updatedItemData); // Ensure timestamp is updated or assigned
        const updatedCollection = currentItems.map(item => {
            if (item && item.id === processedItem.id) {
                itemFound = true;
                return { ...item, ...processedItem, lastModified: new Date().toISOString() }; // Merge and add last modified timestamp
            }
            return item;
        });

        if (!itemFound) {
            updatedCollection.push(processedItem); // Add if not found
            if (_vaultConfig.enableLogging) {
                console.info(`DataVault: Item with ID "${processedItem.id}" not found in "${collectionName}", adding it.`);
            }
        }

        if (_persistCollectionData(collectionName, updatedCollection)) {
            _dispatchVaultEvent('itemUpdated', { collection: collectionName, id: processedItem.id, wasAdded: !itemFound });
            return true;
        }
        return false;
    };

    /**
     * Adds an empty array property to all items in a collection, useful for linking.
     * @param {string} primaryCollection - The collection to modify.
     * @param {string} linkPropertyName - The name of the new array property to add.
     * @returns {boolean} True if successful, false otherwise.
     */
    dataVaultAPI.establishLinkField = (primaryCollection, linkPropertyName) => {
        if (typeof primaryCollection !== 'string' || primaryCollection.trim() === '') {
            _logVaultError('DV-005', primaryCollection, 'establishLinkField()');
            return false;
        }
        if (typeof linkPropertyName !== 'string' || linkPropertyName.trim() === '') {
            _logVaultError('DV-003', 'Link property name must be a non-empty string.', linkPropertyName);
            return false;
        }

        let collectionItems = _fetchCollectionData(primaryCollection);
        if (collectionItems === null) {
            _logVaultError('DV-001', primaryCollection, 'establishLinkField()');
            return false;
        }

        const modifiedItems = collectionItems.map(item => {
            if (typeof item === 'object' && item !== null && !item.hasOwnProperty(linkPropertyName)) {
                return { ...item, [linkPropertyName]: [] };
            }
            return item;
        });

        if (_persistCollectionData(primaryCollection, modifiedItems)) {
            _dispatchVaultEvent('linkFieldEstablished', { collection: primaryCollection, field: linkPropertyName });
            return true;
        }
        return false;
    };

    /**
     * Clears all DataVault-managed collections from local storage.
     * Requires explicit confirmation.
     * @param {boolean} confirmClear - Must be true to proceed with clearing.
     * @returns {boolean} True if cleared, false otherwise.
     */
    dataVaultAPI.clearAllVaultData = (confirmClear) => {
        if (!confirmClear) {
            if (_vaultConfig.enableLogging) {
                console.warn('DataVault: clearAllVaultData() requires explicit confirmation (pass true as argument).');
            }
            return false;
        }
        if (!_canUseLocalStorage) {
            _logVaultError('DV-004', 'clearAllVaultData()');
            return false;
        }

        const keysToRemove = [];
        for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key.startsWith(_vaultConfig.storageKeyPrefix)) {
                keysToRemove.push(key);
            }
        }

        if (keysToRemove.length === 0) {
            if (_vaultConfig.enableLogging) {
                console.info('DataVault: No vault data found to clear.');
            }
            return true;
        }

        try {
            for (const key of keysToRemove) {
                window.localStorage.removeItem(key);
            }
            _dispatchVaultEvent('allVaultDataCleared', { count: keysToRemove.length });
            if (_vaultConfig.enableLogging) {
                console.info(`DataVault: Cleared ${keysToRemove.length} collections.`);
            }
            return true;
        } catch (error) {
            _logVaultError('DV-003', 'Failed to clear all vault data.', error.message);
            return false;
        }
    };

    // --- Internal Cache Management (expanded from original) ---
    dataVaultAPI.internalCache = new Map(); // Using a Map for better cache management

    /**
     * Populates the internal cache for a specific collection.
     * @param {string} collectionName - The name of the collection to cache.
     * @returns {boolean} True if cached, false if collection not found.
     */
    dataVaultAPI.cacheCollection = (collectionName) => {
        if (typeof collectionName !== 'string' || collectionName.trim() === '') {
            _logVaultError('DV-005', collectionName, 'cacheCollection()');
            return false;
        }
        const items = dataVaultAPI.retrieveAll(collectionName);
        if (items.length > 0) {
            dataVaultAPI.internalCache.set(collectionName, items);
            _dispatchVaultEvent('collectionCached', { collection: collectionName, count: items.length });
            return true;
        }
        _logVaultError('DV-001', collectionName, 'cacheCollection() - No items to cache.');
        return false;
    };

    /**
     * Retrieves an item from the internal cache based on an attribute and value.
     * @param {string} collectionName - The name of the collection in cache.
     * @param {string} attributeKey - The attribute to search by.
     * @param {any} searchValue - The value to match.
     * @returns {object|null} The cached item, or null if not found.
     */
    dataVaultAPI.retrieveFromCache = (collectionName, attributeKey, searchValue) => {
        if (typeof collectionName !== 'string' || collectionName.trim() === '') {
            _logVaultError('DV-005', collectionName, 'retrieveFromCache()');
            return null;
        }
        if (typeof attributeKey !== 'string' || attributeKey.trim() === '') {
            _logVaultError('DV-003', `Invalid attributeKey for retrieveFromCache: ${attributeKey}`);
            return null;
        }

        const cachedCollection = dataVaultAPI.internalCache.get(collectionName);
        if (!cachedCollection || cachedCollection.length === 0) {
            if (_vaultConfig.enableLogging) {
                console.warn(`DataVault: Collection "${collectionName}" not found or empty in internal cache.`);
            }
            return null;
        }

        for (const item of cachedCollection) {
            if (item && item[attributeKey] === searchValue) {
                _dispatchVaultEvent('itemRetrievedFromCache', { collection: collectionName, key: attributeKey, value: searchValue });
                return item;
            }
        }
        return null;
    };

    /**
     * Clears a specific collection from the internal cache, or all if no name provided.
     * @param {string} [collectionName] - The name of the collection to clear from cache. If omitted, clears all.
     * @returns {boolean} True if cleared.
     */
    dataVaultAPI.clearCache = (collectionName) => {
        if (collectionName) {
            if (typeof collectionName !== 'string' || collectionName.trim() === '') {
                _logVaultError('DV-005', collectionName, 'clearCache()');
                return false;
            }
            const wasDeleted = dataVaultAPI.internalCache.delete(collectionName);
            if (wasDeleted) {
                _dispatchVaultEvent('cacheCleared', { collection: collectionName });
            }
            return wasDeleted;
        } else {
            dataVaultAPI.internalCache.clear();
            _dispatchVaultEvent('cacheCleared', { collection: 'all' });
            return true;
        }
    };

    // Expose configuration for external inspection/modification (with caution)
    dataVaultAPI.config = _vaultConfig;

    // Initial check and logging
    if (!_canUseLocalStorage && _vaultConfig.enableLogging) {
        console.warn('DataVault: Local storage is not available. All operations will fail silently or log errors.');
    } else if (_vaultConfig.enableLogging) {
        console.info(`DataVault.js v${_vaultConfig.version} initialized. Local storage available.`);
    }

}(this.dataVault = this.dataVault || {}));