(function (globalScope) {

  'use strict';

  // --- Core Data Structure: IndexedSequence ---
  //
  // This class implements a doubly linked list with O(1) keyed access.
  // It relies on the LinkElement constructor and the createGuid function
  // defined later in this module.
  //

  const IndexedSequence = function () {
    // Initialize the sequence state
    this._front = null; // Reference to the first LinkElement in the sequence
    this._back = null;  // Reference to the last LinkElement in the sequence
    this._size = 0;     // Current count of elements in the sequence
    this._registry = Object.create(null); // Map of keys to LinkElements for fast lookup
    this._version = 0; // Internal version counter for potential concurrent modification detection
  };

  /**
   * Internal helper to ensure a key exists in the registry.
   * @param {string} lookupKey - The key to search for.
   * @returns {LinkElement} The found LinkElement.
   * @throws {Error} If the key does not correspond to an existing element.
   */
  IndexedSequence.prototype._ensurePresent = function(lookupKey) {
    const foundElement = this._registry[lookupKey];
    if (foundElement) {
      return foundElement;
    }
    // Provide a more descriptive error, suggesting next steps.
    throw new Error(`Key '${lookupKey}' is not registered. Please use an insertion method first.`);
  };

  /**
   * Internal helper to assert that a key does NOT exist in the registry.
   * @param {string} testKey - The key to check for absence.
   * @throws {Error} If the key already exists.
   */
  IndexedSequence.prototype._assertUnique = function(testKey) {
    if (this._registry[testKey]) {
      // Differentiate between creation and update scenarios.
      throw new Error(`Key '${testKey}' already in use. Use 'updateValue' to modify existing elements.`);
    }
  };

  /**
   * Internal method to create a new LinkElement and register it.
   * Handles key generation if not provided, and updates internal state.
   * @param {*} payloadData - The value to store in the new element.
   * @param {string} [elementKey] - Optional key for the new element.
   * @returns {LinkElement} The newly created and registered LinkElement.
   * @throws {Error} If the provided key already exists.
   */
  IndexedSequence.prototype._createAndRegister = function(payloadData, elementKey = createGuid()) {
    this._assertUnique(elementKey); // Ensure the key is unique
    const newElement = new LinkElement({
      content: payloadData,
      elementKey: elementKey
    });
    this._registry[elementKey] = newElement;
    this._size++; // Increment the element count
    this._version++; // Update the version
    return newElement;
  };

  /**
   * Internal method to add the very first element to an empty sequence.
   * @param {*} payloadData - The value for the first element.
   * @param {string} [elementKey] - Optional key.
   * @returns {string} The identifier of the newly added element.
   * @throws {Error} If the sequence is not empty.
   */
  IndexedSequence.prototype._establishInitial = function(payloadData, elementKey) {
    if (this._size > 0) {
      throw new Error('Sequence already contains elements. Use \'prepend\' or \'append\' instead.');
    }
    const firstElement = this._createAndRegister(payloadData, elementKey);
    this._front = this._back = firstElement;
    return firstElement.identifier;
  };

  /**
   * Internal method to insert a new element adjacent to an existing one.
   * @param {LinkElement} newElement - The element to insert.
   * @param {string} targetKey - The key of the existing element.
   * @param {boolean} insertBeforeTarget - True to insert before, false to insert after.
   */
  IndexedSequence.prototype._positionNode = function (newElement, targetKey, insertBeforeTarget) {
    const targetElement = this._ensurePresent(targetKey); // Get the reference element

    if (insertBeforeTarget) { // Insert newElement BEFORE targetElement
      newElement.successor = targetElement;
      newElement.predecessor = targetElement.predecessor;

      if (targetElement.predecessor) {
        targetElement.predecessor.successor = newElement;
      } else {
        this._front = newElement; // New element is the new front
      }
      targetElement.predecessor = newElement;
    } else { // Insert newElement AFTER targetElement
      newElement.predecessor = targetElement;
      newElement.successor = targetElement.successor;

      if (targetElement.successor) {
        targetElement.successor.predecessor = newElement;
      } else {
        this._back = newElement; // New element is the new back
      }
      targetElement.successor = newElement;
    }
    this._version++; // Update the version due to structural change
  };

  /**
   * Inserts a new element into the sequence immediately before a specified existing element.
   * @param {string} targetKey - The key of the element to insert before.
   * @param {*} payloadData - The value to store in the new element.
   * @param {string} [elementKey] - Optional key for the new element.
   * @returns {string} The identifier of the newly inserted element.
   * @throws {Error} If targetKey is not found or elementKey already exists.
   */
  IndexedSequence.prototype.insertBefore = function (targetKey, payloadData, elementKey) {
    const newElement = this._createAndRegister(payloadData, elementKey);
    this._positionNode(newElement, targetKey, true);
    return newElement.identifier;
  };

  /**
   * Inserts a new element into the sequence immediately after a specified existing element.
   * @param {string} targetKey - The key of the element to insert after.
   * @param {*} payloadData - The value to store in the new element.
   * @param {string} [elementKey] - Optional key for the new element.
   * @returns {string} The identifier of the newly inserted element.
   * @throws {Error} If targetKey is not found or elementKey already exists.
   */
  IndexedSequence.prototype.insertAfter = function (targetKey, payloadData, elementKey) {
    const newElement = this._createAndRegister(payloadData, elementKey);
    this._positionNode(newElement, targetKey, false);
    return newElement.identifier;
  };

  /**
   * Adds a new element to the end of the sequence.
   * @param {*} payloadData - The value to store.
   * @param {string} [elementKey] - Optional key.
   * @returns {string} The identifier of the newly added element.
   * @throws {Error} If elementKey already exists.
   */
  IndexedSequence.prototype.append = function (payloadData, elementKey) {
    if (this._size === 0) {
      return this._establishInitial(payloadData, elementKey);
    }
    // Delegate to insertAfter using the current back element's key.
    return this.insertAfter(this._back.identifier, payloadData, elementKey);
  };

  /**
   * Adds a new element to the beginning of the sequence.
   * @param {*} payloadData - The value to store.
   * @param {string} [elementKey] - Optional key.
   * @returns {string} The identifier of the newly added element.
   * @throws {Error} If elementKey already exists.
   */
  IndexedSequence.prototype.prepend = function (payloadData, elementKey) {
    if (this._size === 0) {
      return this._establishInitial(payloadData, elementKey);
    }
    // Delegate to insertBefore using the current front element's key.
    return this.insertBefore(this._front.identifier, payloadData, elementKey);
  };

  /**
   * Removes an element from the sequence by its key.
   * Adjusts links of adjacent elements and updates front/back pointers.
   * @param {string} keyToRemove - The key of the element to remove.
   * @returns {*} The payload data of the removed element, or null if not found.
   */
  IndexedSequence.prototype.deleteByKey = function (keyToRemove) {
    const elementToRemove = this._registry[keyToRemove];

    if (!elementToRemove) {
      return null; // Element not found, nothing to remove
    }

    // Update predecessor's successor
    if (elementToRemove.predecessor) {
      elementToRemove.predecessor.successor = elementToRemove.successor;
    } else {
      this._front = elementToRemove.successor; // Element was the front
    }

    // Update successor's predecessor
    if (elementToRemove.successor) {
      elementToRemove.successor.predecessor = elementToRemove.predecessor;
    } else {
      this._back = elementToRemove.predecessor; // Element was the back
    }

    delete this._registry[keyToRemove]; // Remove from the registry
    this._size--; // Decrement count
    this._version++; // Update version

    // Clean up references on the removed element to prevent memory leaks
    elementToRemove.predecessor = null;
    elementToRemove.successor = null;

    return elementToRemove.content; // Return the stored data
  };

  /**
   * Removes and returns the first element's data from the sequence.
   * @returns {*} The data of the removed front element, or null if empty.
   */
  IndexedSequence.prototype.popFront = function () {
    return this._front ? this.deleteByKey(this._front.identifier) : null;
  };

  /**
   * Removes and returns the last element's data from the sequence.
   * @returns {*} The data of the removed back element, or null if empty.
   */
  IndexedSequence.prototype.popBack = function () {
    return this._back ? this.deleteByKey(this._back.identifier) : null;
  };

  /**
   * Retrieves the payload data associated with a given key.
   * @param {string} lookupKey - The key of the element to retrieve.
   * @returns {*} The payload data, or undefined if the key is not found.
   */
  IndexedSequence.prototype.retrieveValue = function (lookupKey) {
    const element = this._registry[lookupKey];
    return element ? element.content : undefined;
  };

  /**
   * Returns the payload data of the first element without removing it.
   * @returns {*} The data of the front element, or undefined if empty.
   */
  IndexedSequence.prototype.peekFront = function () {
    return this._front ? this._front.content : undefined;
  };

  /**
   * Returns the payload data of the last element without removing it.
   * @returns {*} The data of the back element, or undefined if empty.
   */
  IndexedSequence.prototype.peekBack = function () {
    return this._back ? this._back.content : undefined;
  };

  /**
   * Updates the payload data of an existing element identified by its key.
   * @param {string} targetKey - The key of the element to update.
   * @param {*} newData - The new payload data.
   * @throws {Error} If the targetKey is not found.
   */
  IndexedSequence.prototype.updateValue = function (targetKey, newData) {
    const elementToModify = this._ensurePresent(targetKey);
    // Only update if data is different to avoid unnecessary version increments.
    if (elementToModify.content !== newData) {
      elementToModify.content = newData;
      this._version++; // Data changed, update version
    }
  };

  // --- Utility Methods ---

  /**
   * Iterates over each element in the sequence, calling a callback function.
   * @param {function(data: *, key: string, sequence: IndexedSequence)} callback - Function to call for each element.
   */
  IndexedSequence.prototype.traverse = function (callback) {
    let currentElement = this._front;
    let index = 0; // Optional: provide an index if useful for callback
    while (currentElement) {
      callback(currentElement.content, currentElement.identifier, this, index++);
      currentElement = currentElement.successor;
    }
  };

  /**
   * Default comparison function for sorting.
   * Handles null/undefined values by converting to string.
   * @param {*} a - First value.
   * @param {*} b - Second value.
   * @returns {number} -1 if a < b, 1 if a > b, 0 if a == b.
   */
  function standardComparator (a, b) {
    // Coerce null/undefined to empty strings for consistent comparison.
    const valA = (a === null || a === undefined) ? '' : String(a);
    const valB = (b === null || b === undefined) ? '' : String(b);
    return valA.localeCompare(valB); // Use localeCompare for robust string comparison.
  }

  /**
   * Sorts the elements of the sequence in place using an insertion sort algorithm.
   * @param {function(*, *): number} [comparatorFn] - Optional comparison function.
   */
  IndexedSequence.prototype.reorder = function (comparatorFn = standardComparator) {
    if (this._size < 2) {
      return; // No need to sort if 0 or 1 element
    }

    let current = this._front.successor; // Start from the second element
    while (current) {
      let insertionPoint = current.predecessor;
      const elementToMove = current;
      current = current.successor; // Advance current before moving elementToMove

      // Disconnect elementToMove from its current position
      if (elementToMove.predecessor) {
        elementToMove.predecessor.successor = elementToMove.successor;
      }
      if (elementToMove.successor) {
        elementToMove.successor.predecessor = elementToMove.predecessor;
      }

      // Update front/back if elementToMove was at an extremity
      if (elementToMove === this._front) {
        this._front = elementToMove.successor;
      }
      if (elementToMove === this._back) {
        this._back = elementToMove.predecessor;
      }

      // Find the correct insertion point by moving backwards
      while (insertionPoint && comparatorFn(elementToMove.content, insertionPoint.content) < 0) {
        insertionPoint = insertionPoint.predecessor;
      }

      // Insert elementToMove at the found position
      if (!insertionPoint) { // Insert at the very beginning
        elementToMove.predecessor = null;
        elementToMove.successor = this._front;
        if (this._front) this._front.predecessor = elementToMove;
        this._front = elementToMove;
      } else { // Insert after insertionPoint
        elementToMove.predecessor = insertionPoint;
        elementToMove.successor = insertionPoint.successor;
        if (insertionPoint.successor) insertionPoint.successor.predecessor = elementToMove;
        insertionPoint.successor = elementToMove;
      }

      // If the original 'current' was the tail, and elementToMove was moved,
      // we need to ensure the tail is correctly updated.
      if (!this._back || (elementToMove.successor === null && elementToMove !== this._back)) {
          this._back = elementToMove;
      }
      this._version++; // Structural change due to sort
    }
  };


  // --- Link Element Constructor ---
  //
  // Represents a single node in the doubly linked list.
  // Stores the actual data, its unique key, and references to
  // the previous and next elements in the sequence.
  //
  function LinkElement (elementConfig) {
    this.content = elementConfig.content; // The actual data payload
    this.successor = elementConfig.successor || null; // Reference to the next element
    this.predecessor = elementConfig.predecessor || null; // Reference to the previous element
    this.identifier = elementConfig.elementKey; // Unique key for this element
  }

  globalScope.IndexedSequence = IndexedSequence;

  // --- Unique Identifier Generation ---
  //
  // Provides a method to generate a UUID-like string.
  // This is used internally when no explicit key is provided for an element.
  //
  function createGuid(){
    // Use a more robust time source if available, or just Date.now()
    let timestamp = Date.now();

    // The UUID format is 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    // 'x' is a random hex digit, 'y' is a random hex digit from 8, 9, A, or B
    const generatedId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
        const randomVal = (timestamp + Math.random() * 16) % 16 | 0;
        timestamp = Math.floor(timestamp / 16); // Shift timestamp for next character
        return (char === 'x' ? randomVal : (randomVal & 0x3 | 0x8)).toString(16);
    });

    return generatedId;
  }

})(typeof window !== 'undefined' ? window : globalThis);