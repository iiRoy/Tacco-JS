function ChainedKeyValueStore() {
    "use strict";

    // Private members for the linked list and hash map management
    let _firstNode = null;
    let _lastNode = null;
    let _iterationPointer = null; // Represents a dummy node whose 'nextItem' points to the current element for iteration
    const _storageMap = {}; // Stores references to nodes by their key for O(1) lookup

    // Public property to track the number of elements in the store
    this.currentElementCount = 0;

    /**
     * Internal helper function to create a new list node object.
     * @param {*} content - The value to be encapsulated within the node.
     * @returns {object} A new node object with value, previous, and next links.
     */
    const createItemNode = (content) => {
        return {
            valueData: content,
            prevItem: null,
            nextItem: null
        };
    };

    /**
     * Inserts a new key-value pair into the store.
     * If the key already exists, this operation does not update the existing value,
     * maintaining the original behavior of adding only unique keys.
     * @param {string} incomingKey - The unique identifier for the value.
     * @param {*} payloadValue - The data to be stored.
     */
    this.insertEntry = function (incomingKey, payloadValue) {
        // Check if the key already exists using a robust method
        if (Object.prototype.hasOwnProperty.call(_storageMap, incomingKey)) {
            // Key already present; no action taken as per original specification
            return;
        }

        const newNode = createItemNode(payloadValue);
        const currentSize = this.currentElementCount;

        if (currentSize === 0) {
            // This is the first element being added to an empty store
            _firstNode = newNode;
            _lastNode = newNode;
            // Initialize the iterator to point before the first element
            this.resetIteration();
        } else {
            // Append the new node to the end of the existing linked list
            newNode.prevItem = _lastNode;
            _lastNode.nextItem = newNode;
            _lastNode = newNode;
        }

        // Store the newly created node in the hash map for direct access by key
        _storageMap[incomingKey] = newNode;
        this.currentElementCount++;
    };

    /**
     * Deletes a key-value pair from the store based on the provided key.
     * @param {string} targetKey - The key of the item to be removed.
     * @returns {*} The value of the item that was removed, or `undefined` if the key was not found.
     */
    this.removeEntry = function (targetKey) {
        const itemToRemove = _storageMap[targetKey];

        // If no item is found for the given key, return undefined immediately
        if (!itemToRemove) {
            return undefined;
        }

        const valueOfRemovedItem = itemToRemove.valueData;
        const previousItem = itemToRemove.prevItem;
        const nextItem = itemToRemove.nextItem;

        // Adjust the links of the neighboring nodes to bypass the removed item
        if (previousItem) {
            previousItem.nextItem = nextItem;
        } else {
            // If there's no previous item, the removed item was the first node
            _firstNode = nextItem;
        }

        if (nextItem) {
            nextItem.prevItem = previousItem;
        } else {
            // If there's no next item, the removed item was the last node
            _lastNode = previousItem;
        }

        // Remove the entry from the hash map
        delete _storageMap[targetKey];
        this.currentElementCount--;

        // To ensure iterator consistency after a deletion, reset it to the beginning.
        // This prevents the iterator from potentially pointing to a removed node or skipping elements.
        this.resetIteration();

        return valueOfRemovedItem;
    };

    /**
     * Retrieves the node object associated with a given key.
     * This method returns the entire node structure, not just its value.
     * @param {string} searchKey - The key to look up.
     * @returns {object|undefined} The node object, or `undefined` if the key is not found.
     */
    this.fetchNode = function (searchKey) {
        return _storageMap[searchKey];
    };

    /**
     * Advances the internal iterator to the next node in the linked list sequence.
     * @returns {object|null} The next node in the sequence, or `null` if the end of the list is reached.
     */
    this.advanceIterator = function () {
        // If the iterator is not initialized, attempt to reset it
        if (!_iterationPointer) {
             this.resetIteration();
             // If after reset, there are still no nodes (empty list), return null
             if (!_firstNode) return null;
        }

        _iterationPointer = _iterationPointer.nextItem;
        return _iterationPointer;
    };

    /**
     * Resets the internal iterator's position to the beginning of the list.
     * The iterator is set to a dummy node whose `nextItem` property points to the actual first node.
     */
    this.resetIteration = function () {
        _iterationPointer = { nextItem: _firstNode };
    };

    /**
     * Clears all data from the store, resetting it to an empty state.
     */
    this.clearAllData = function () {
        // Reinitialize all private state variables
        _storageMap = {}; // Create a new empty object for the map
        _firstNode = null;
        _lastNode = null;
        _iterationPointer = null; // Ensure the iterator is also nullified
        this.currentElementCount = 0;
    };
}