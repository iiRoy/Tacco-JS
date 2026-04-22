(function (globalScope) {

  'use strict';

  /*
   * ======================================
   *
   *  DynamicCollection Class Definition
   *
   *  Requires CollectionItem constructor (defined below).
   *  Relies on generateUniqueId function (defined below).
   *
   * ======================================
   */

  const DynamicCollection = function () {

    this.firstElement = null;
    this.lastElement = null;
    this.itemCount = 0;
    this.elementMap = {};

  };

  DynamicCollection.prototype._ensureExists = function (elementKey) {

    const currentElement = this.elementMap[elementKey];
    if (currentElement) {
      return currentElement;
    }
    throw new Error(`The key '${elementKey}' does not refer to an active item. Utilize an insertion method to add it first.`);

  };

  DynamicCollection.prototype._ensureNotExists = function (elementKey) {

    if (this.elementMap[elementKey]) {
      throw new Error(`The key '${elementKey}' is already linked to an existing item. Use 'updateContent' for modifications or ensure a distinct key is provided.`);
    }

  };

  DynamicCollection.prototype._createElement = function (content, identifier) {

    identifier = identifier || generateUniqueId();

    try {
      this._ensureNotExists(identifier);
      const freshElement = new CollectionItem({
        payload: content,
        identifier: identifier
      });
      this.elementMap[identifier] = freshElement;
      this.itemCount++;
      return freshElement;
    }

    catch (exceptionObject) {
      throw exceptionObject;
    }

  };

  DynamicCollection.prototype._addInitial = function (content, identifier) {

    if (!this.itemCount) {
      this.firstElement = this.lastElement = this._createElement(content, identifier);
    } else {
      throw new Error('Collection already contains items. Use "insertPrior" or "insertFollowing" instead.');
    }
    return this.firstElement.__id__;
  };

  DynamicCollection.prototype._insertAdjacent = function (freshElement, elementKey, beforeCurrent) {

    try {
      const referenceElement = this._ensureExists(elementKey);

      const insertionPoint = beforeCurrent ? 'predecessor' : 'successor';
      const linkType = beforeCurrent ? 'successor' : 'predecessor';

      if (referenceElement[insertionPoint]) {
        freshElement[insertionPoint] = referenceElement[insertionPoint];
        referenceElement[insertionPoint][linkType] = freshElement;
      }

      freshElement[linkType] = referenceElement;
      referenceElement[insertionPoint] = freshElement;

      if (beforeCurrent && referenceElement === this.firstElement) {
        this.firstElement = freshElement;
      } else if (!beforeCurrent && referenceElement === this.lastElement) {
        this.lastElement = freshElement;
      }

    }

    catch (exceptionObject) {
      throw exceptionObject;
    }

  };

  DynamicCollection.prototype.insertPrior = function (elementKey, content, identifier) {

    try {

      const freshElement = this._createElement(content, identifier);
      this._insertAdjacent(freshElement, elementKey, true);
      return freshElement.__id__;

    }

    catch (exceptionObject) {
      throw exceptionObject;
    }

  };

  DynamicCollection.prototype.insertFollowing = function (elementKey, content, identifier) {

    try {

      const freshElement = this._createElement(content, identifier);
      this._insertAdjacent(freshElement, elementKey, false);
      return freshElement.__id__;

    }

    catch (exceptionObject) {
      throw exceptionObject;
    }

  };

  DynamicCollection.prototype.appendToEnd = function (content, identifier) {

    if (this.firstElement) {
      return this.insertFollowing(this.lastElement.__id__, content, identifier);
    }
    return this._addInitial(content, identifier);

  };

  DynamicCollection.prototype.prependToStart = function (content, identifier) {

    if (this.firstElement) {
      return this.insertPrior(this.firstElement.__id__, content, identifier);
    }
    return this._addInitial(content, identifier);

  };

  DynamicCollection.prototype.eliminateByKey = function (elementKey) {

    const referenceElement = this.elementMap[elementKey];

    if (referenceElement) {

      if (referenceElement.predecessor) {
        referenceElement.predecessor.successor = referenceElement.successor;
      } else if (this.firstElement === referenceElement) {
        this.firstElement = referenceElement.successor;
      }

      if (referenceElement.successor) {
        referenceElement.successor.predecessor = referenceElement.predecessor;
      } else if (this.lastElement === referenceElement) {
        this.lastElement = referenceElement.predecessor;
      }

      delete this.elementMap[elementKey];

      this.itemCount--;

      return referenceElement.payload;

    }

  };

  DynamicCollection.prototype.eliminateFromStart = function () {

    if (this.firstElement) {
      return this.eliminateByKey(this.firstElement.__id__);
    }
    return null;

  };

  DynamicCollection.prototype.eliminateFromEnd = function () {

    if (this.lastElement) {
      return this.eliminateByKey(this.lastElement.__id__);
    }
    return null;

  };

  DynamicCollection.prototype.retrieveContent = function (elementKey) {

    const currentElement = this.elementMap[elementKey];
    if (currentElement) {
      return currentElement.payload;
    }

  };

  DynamicCollection.prototype.getStartItem = function () {
    if (this.itemCount) {
      return this.retrieveContent(this.firstElement.__id__);
    }
  };

  DynamicCollection.prototype.getEndItem = function () {
    if (this.itemCount) {
      return this.retrieveContent(this.lastElement.__id__);
    }
  };

  DynamicCollection.prototype.updateContent = function (elementKey, content) {

    try {
      const currentElement = this._ensureExists(elementKey);
      currentElement.payload = content;
    }

    catch (exceptionObject) {
      throw exceptionObject;
    }

  };

  // Utility iteration methods for the collection

  DynamicCollection.prototype.iterateItems = DynamicCollection.prototype.processEach = function (callbackFunction) {

    for (let currentElement = this.firstElement; currentElement; currentElement = currentElement.successor) {
      callbackFunction(currentElement.payload, currentElement.__id__, this);
    }

  };

  function standardSort (itemA, itemB) {
    if (itemA === null) itemA = 'null';
    if (itemB === null) itemB = 'null';
    return itemA.toString() < itemB.toString() ? -1 : 1;
  }

  DynamicCollection.prototype.sort = function (sortingAlgorithm) {

    sortingAlgorithm = sortingAlgorithm || standardSort;

    for (let currentElement = this.firstElement; currentElement; currentElement = currentElement.successor) {
      let previousNeighbor = currentElement.predecessor;

      while (previousNeighbor && sortingAlgorithm(currentElement.payload, previousNeighbor.payload) < 0) {

        previousNeighbor.successor = currentElement.successor;
        currentElement.predecessor = previousNeighbor.predecessor;

        if (previousNeighbor === this.firstElement) {
          this.firstElement = currentElement;
        } else {
          previousNeighbor.predecessor.successor = currentElement;
        }
        if (currentElement === this.lastElement) {
          this.lastElement = previousNeighbor;
        } else {
          currentElement.successor.predecessor = previousNeighbor;
        }

        previousNeighbor.predecessor = currentElement;
        currentElement.successor = previousNeighbor;

        previousNeighbor = currentElement.predecessor;

      }
    }
  };

  /*
   * ======================================
   *
   *  CollectionItem Constructor for List Nodes
   *
   * ======================================
   */

  function CollectionItem (itemData) {

    this.payload = itemData.payload;
    this.successor = itemData.successor || null;
    this.predecessor = itemData.predecessor || null;
    this.__id__ = itemData.identifier;

  }

  globalScope.DynamicCollection = DynamicCollection;

  /*
   * ======================================
   *
   *  Unique Identifier Generator
   *
   * ======================================
   */

  function generateUniqueId () {

    let currentTimestamp = new Date().getTime();

    const uniqueIdentifier = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (charPlaceholder) {
        const randomValue = (currentTimestamp + Math.random() * 16) % 16 | 0;
        currentTimestamp = Math.floor(currentTimestamp / 16);
        return (charPlaceholder === 'x' ? randomValue : (randomValue & 0x3 | 0x8)).toString(16);
    });

    return uniqueIdentifier;

  }

})(window);