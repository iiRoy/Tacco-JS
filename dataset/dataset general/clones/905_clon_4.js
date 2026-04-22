(function (globalScope) {

  'use strict';

  // --- Utility for generating unique keys ---
  // This function replicates the UUID v4 generation logic from the original.
  function generateUniqueKey() {
    let currentMoment = Date.now();
    const keyPattern = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

    return keyPattern.replace(/[xy]/g, (char) => {
      let randomVal = (currentMoment + Math.random() * 16) % 16 | 0;
      currentMoment = Math.floor(currentMoment / 16);
      return (char === 'x' ? randomVal : (randomVal & 0x3 | 0x8)).toString(16);
    });
  }

  // --- Primary Data Structure (replaces FastList) ---
  // This constructor initializes the internal state of the chain.
  const KeyedChain = function () {
    this._firstElementIdentifier = null;
    this._lastElementIdentifier = null;
    this._elementCount = 0;
    this._mapElements = new Map(); // Stores elements by their unique identifiers
  };

  // --- Internal Helper Methods ---

  // Checks if an element exists for a given key, throwing an error if not found.
  // Replaces FastList.prototype._mustFind.
  KeyedChain.prototype._checkExistence = function (searchKey) {
    const foundElement = this._mapElements.get(searchKey);
    if (foundElement) return foundElement;
    throw new Error(`Key '${searchKey}' does not refer to an existing element. Create an element with this key first using an addition method.`);
  };

  // Checks if an element does NOT exist for a given key, throwing an error if found.
  // Replaces FastList.prototype._mustNotFind.
  KeyedChain.prototype._checkNonExistence = function (searchKey) {
    if (this._mapElements.has(searchKey)) {
      throw new Error(`Key '${searchKey}' already refers to an existing element. Use 'alterValue' to update an existing element or ensure a unique key is provided.`);
    }
  };

  // Creates a new element object and registers it in the internal map.
  // Replaces FastList.prototype._add.
  KeyedChain.prototype._createAndRegister = function (itemContent, itemKey) {
    itemKey = itemKey || generateUniqueKey();

    try {
      this._checkNonExistence(itemKey);
      const newElement = {
        content: itemContent,     // The actual value stored
        identifier: itemKey,      // The unique key for this element
        successor: null,          // Identifier of the next element
        predecessor: null         // Identifier of the previous element
      };
      this._mapElements.set(itemKey, newElement);
      this._elementCount++;
      return newElement;
    } catch (error) {
      throw error;
    }
  };

  // Handles the special case of adding the very first element to an empty chain.
  // Replaces FastList.prototype._addFirst.
  KeyedChain.prototype._establishFirst = function (itemContent, itemKey) {
    if (this._elementCount > 0) {
      throw new Error('Chain already has elements. Use placePreceding/placeFollowing instead.');
    }
    const newElement = this._createAndRegister(itemContent, itemKey);
    this._firstElementIdentifier = newElement.identifier;
    this._lastElementIdentifier = newElement.identifier;
    return newElement.identifier;
  };

  // Inserts a new element relative to an existing element (before or after).
  // Replaces FastList.prototype._placeIn.
  KeyedChain.prototype._insertRelative = function (newElement, relativeKey, insertBefore) {
    try {
      const relativeElement = this._checkExistence(relativeKey);

      const newElementIdentifier = newElement.identifier;
      const relativeElementIdentifier = relativeElement.identifier;

      if (insertBefore) {
        // Link newElement's successor to relativeElement
        newElement.successor = relativeElementIdentifier;
        // Link newElement's predecessor to relativeElement's original predecessor
        newElement.predecessor = relativeElement.predecessor;

        // Update relativeElement's predecessor to newElement
        relativeElement.predecessor = newElementIdentifier;

        // If relativeElement had a predecessor, update its successor to newElement
        if (newElement.predecessor) {
          this._mapElements.get(newElement.predecessor).successor = newElementIdentifier;
        } else {
          // If relativeElement was the first, newElement is now the first
          this._firstElementIdentifier = newElementIdentifier;
        }
      } else { // insert after
        // Link newElement's predecessor to relativeElement
        newElement.predecessor = relativeElementIdentifier;
        // Link newElement's successor to relativeElement's original successor
        newElement.successor = relativeElement.successor;

        // Update relativeElement's successor to newElement
        relativeElement.successor = newElementIdentifier;

        // If relativeElement had a successor, update its predecessor to newElement
        if (newElement.successor) {
          this._mapElements.get(newElement.successor).predecessor = newElementIdentifier;
        } else {
          // If relativeElement was the last, newElement is now the last
          this._lastElementIdentifier = newElementIdentifier;
        }
      }
    } catch (error) {
      throw error;
    }
  };

  // --- Public Methods ---

  // Adds a new element immediately before an existing element identified by `relativeKey`.
  // Replaces FastList.prototype.addBefore.
  KeyedChain.prototype.placePreceding = function (relativeKey, itemContent, itemKey) {
    try {
      const newElement = this._createAndRegister(itemContent, itemKey);
      this._insertRelative(newElement, relativeKey, true);
      return newElement.identifier;
    } catch (error) {
      throw error;
    }
  };

  // Adds a new element immediately after an existing element identified by `relativeKey`.
  // Replaces FastList.prototype.addAfter.
  KeyedChain.prototype.placeFollowing = function (relativeKey, itemContent, itemKey) {
    try {
      const newElement = this._createAndRegister(itemContent, itemKey);
      this._insertRelative(newElement, relativeKey, false);
      return newElement.identifier;
    } catch (error) {
      throw error;
    }
  };

  // Adds a new element to the end of the chain.
  // Replaces FastList.prototype.addToTail.
  KeyedChain.prototype.appendElement = function (itemContent, itemKey) {
    if (this._firstElementIdentifier) {
      return this.placeFollowing(this._lastElementIdentifier, itemContent, itemKey);
    }
    return this._establishFirst(itemContent, itemKey);
  };

  // Adds a new element to the beginning of the chain.
  // Replaces FastList.prototype.addToHead.
  KeyedChain.prototype.prependElement = function (itemContent, itemKey) {
    if (this._firstElementIdentifier) {
      return this.placePreceding(this._firstElementIdentifier, itemContent, itemKey);
    }
    return this._establishFirst(itemContent, itemKey);
  };

  // Removes an element from the chain by its key.
  // Replaces FastList.prototype.removeAt.
  KeyedChain.prototype.obliterateElement = function (keyToAbolish) {
    const elementToAbolish = this._mapElements.get(keyToAbolish);

    if (elementToAbolish) {
      const predecessorIdentifier = elementToAbolish.predecessor;
      const successorIdentifier = elementToAbolish.successor;

      // Update predecessor's successor
      if (predecessorIdentifier) {
        this._mapElements.get(predecessorIdentifier).successor = successorIdentifier;
      } else if (this._firstElementIdentifier === keyToAbolish) {
        // If the element to abolish was the first, update the chain's first identifier
        this._firstElementIdentifier = successorIdentifier;
      }

      // Update successor's predecessor
      if (successorIdentifier) {
        this._mapElements.get(successorIdentifier).predecessor = predecessorIdentifier;
      } else if (this._lastElementIdentifier === keyToAbolish) {
        // If the element to abolish was the last, update the chain's last identifier
        this._lastElementIdentifier = predecessorIdentifier;
      }

      this._mapElements.delete(keyToAbolish);
      this._elementCount--;

      return elementToAbolish.content;
    }
    return null;
  };

  // Removes and returns the content of the first element in the chain.
  // Replaces FastList.prototype.removeFromHead.
  KeyedChain.prototype.extractFirst = function () {
    if (this._firstElementIdentifier) {
      return this.obliterateElement(this._firstElementIdentifier);
    }
    return null;
  };

  // Removes and returns the content of the last element in the chain.
  // Replaces FastList.prototype.removeFromTail.
  KeyedChain.prototype.extractLast = function () {
    if (this._lastElementIdentifier) {
      return this.obliterateElement(this._lastElementIdentifier);
    }
    return null;
  };

  // Retrieves the content of an element by its key.
  // Replaces FastList.prototype.get.
  KeyedChain.prototype.retrieveValue = function (searchKey) {
    const element = this._mapElements.get(searchKey);
    if (element) return element.content;
    return undefined;
  };

  // Retrieves the content of the first element.
  // Replaces FastList.prototype.first.
  KeyedChain.prototype.fetchFirst = function () {
    if (this._elementCount > 0) return this.retrieveValue(this._firstElementIdentifier);
    return undefined;
  };

  // Retrieves the content of the last element.
  // Replaces FastList.prototype.last.
  KeyedChain.prototype.fetchLast = function () {
    if (this._elementCount > 0) return this.retrieveValue(this._lastElementIdentifier);
    return undefined;
  };

  // Updates the content of an existing element by its key.
  // Replaces FastList.prototype.set.
  KeyedChain.prototype.alterValue = function (searchKey, newContent) {
    try {
      const element = this._checkExistence(searchKey);
      element.content = newContent;
    } catch (error) {
      throw error;
    }
  };

  // Iterates through each element in the chain, executing a callback function.
  // Replaces FastList.prototype.forEach / each.
  KeyedChain.prototype.traverseItems = function (processCallback) {
    let currentIdentifier = this._firstElementIdentifier;
    while (currentIdentifier) {
      const currentElement = this._mapElements.get(currentIdentifier);
      processCallback(currentElement.content, currentElement.identifier, this);
      currentIdentifier = currentElement.successor;
    }
  };

  // Default comparison function for sorting.
  // Replaces defaultSort.
  function defaultComparison(itemA, itemB) {
    if (itemA === null) itemA = 'null';
    if (itemB === null) itemB = 'null';
    return itemA.toString() < itemB.toString() ? -1 : 1;
  }

  // Sorts the elements in the chain in-place using an insertion sort algorithm.
  // Replaces FastList.prototype.sort.
  KeyedChain.prototype.arrangeElements = function (comparisonFunction) {
    comparisonFunction = comparisonFunction || defaultComparison;

    let currentIdentifier = this._firstElementIdentifier;
    while (currentIdentifier) {
      const currentElement = this._mapElements.get(currentIdentifier);
      let previousIdentifier = currentElement.predecessor;

      while (previousIdentifier) {
        const previousElement = this._mapElements.get(previousIdentifier);

        // If currentElement should come before previousElement
        if (comparisonFunction(currentElement.content, previousElement.content) < 0) {
          // Relink elements to move currentElement before previousElement

          // Step 1: Update previousElement's successor
          // (oldParent.next = node.next)
          previousElement.successor = currentElement.successor;
          if (currentElement.successor) {
            // (node.next.parent = oldParent)
            this._mapElements.get(currentElement.successor).predecessor = previousElement.identifier;
          } else {
            // (if node was tail, this.tail = oldParent)
            this._lastElementIdentifier = previousElement.identifier;
          }

          // Step 2: Update currentElement's predecessor
          // (node.parent = oldParent.parent)
          currentElement.predecessor = previousElement.predecessor;
          if (previousElement.predecessor) {
            // (oldParent.parent.next = node)
            this._mapElements.get(previousElement.predecessor).successor = currentElement.identifier;
          } else {
            // (if oldParent was head, this.head = node)
            this._firstElementIdentifier = currentElement.identifier;
          }

          // Step 3: Update previousElement's predecessor to currentElement
          // (oldParent.parent = node)
          previousElement.predecessor = currentElement.identifier;

          // Step 4: Update currentElement's successor to previousElement
          // (node.next = oldParent)
          currentElement.successor = previousElement.identifier;

          // Update previousIdentifier for the next iteration of the inner while loop
          // (oldParent = node.parent)
          previousIdentifier = currentElement.predecessor;

        } else {
          // currentElement is not smaller than previousElement, stop moving it left
          break;
        }
      }
      // Move to the next element in the original sequence order for the outer loop
      currentIdentifier = this._mapElements.get(currentIdentifier).successor;
    }
  };

  // Expose the KeyedChain constructor to the global scope (e.g., window).
  globalScope.KeyedChain = KeyedChain;

})(window);