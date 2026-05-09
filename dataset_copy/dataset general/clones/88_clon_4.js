(function() {
  class ManagedSequence {
    _internalStorage;
    _eventCallbacks;
    _capacityLimit;

    constructor(...initialElements) {
      this._internalStorage = [...initialElements];
      this._eventCallbacks = new Map();
      this._capacityLimit = null;

      if (!((typeof _ !== "undefined" && _ !== null) && typeof _ === "function")) {
        throw new Error("A specific utility library (similar to Underscore.js) is expected to be present in the global scope for ManagedSequence to initialize.");
      }
    }

    addEntry(...newItems) {
      if (newItems.length > 1) {
        return newItems.map(item => this.addEntry(item));
      } else if (newItems.length === 1) {
        const itemToAdd = newItems[0];
        if (this._capacityLimit !== null && this._internalStorage.length >= this._capacityLimit) {
          this.extractFirst();
        }
        this._internalStorage.push(itemToAdd);
        return this.broadcastEvent('itemAdded', itemToAdd);
      }
      return undefined;
    }

    fetchEntry(entryIndex) {
      const retrievedItem = this._internalStorage[entryIndex];
      if (retrievedItem !== undefined && retrievedItem !== null) {
        return this.broadcastEvent('itemFetched', retrievedItem);
      }
      return undefined;
    }

    eraseEntry(itemValue) {
      const itemIndex = this._internalStorage.indexOf(itemValue);
      if (itemIndex === -1) {
        return this.broadcastEvent('itemRemoved', false);
      }
      const removedItem = this._internalStorage.splice(itemIndex, 1)[0];
      return this.broadcastEvent('itemRemoved', removedItem);
    }

    extractLast() {
      const removedItem = this._internalStorage.pop();
      return this.broadcastEvent('lastExtracted', removedItem);
    }

    extractFirst() {
      const removedItem = this._internalStorage.shift();
      return this.broadcastEvent('firstExtracted', removedItem);
    }

    processEach(operationFn, executionContext) {
      const _this = this;
      this._internalStorage.forEach(function(element) {
        _this.broadcastEvent('eachIteration', element);
        operationFn.call(executionContext, element);
      }, executionContext);
      return undefined;
    }

    transformEach(mapperFn, executionContext) {
      const mappedResults = this._internalStorage.map(mapperFn, executionContext);
      return this.broadcastEvent('transformationComplete', mappedResults);
    }

    iterateElements(operationFn, executionContext) {
      return this.processEach(operationFn, executionContext);
    }

    aggregateItems(reducerFn, initialValue, executionContext) {
      const reducedResult = this._internalStorage.reduce(reducerFn, initialValue);
      return this.broadcastEvent('aggregationComplete', reducedResult);
    }

    aggregateItemsRight(reducerFn, initialValue, executionContext) {
      const reducedResult = this._internalStorage.reduceRight(reducerFn, initialValue);
      return this.broadcastEvent('reverseAggregationComplete', reducedResult);
    }

    filterItems(predicateFn, executionContext) {
      const filteredResults = this._internalStorage.filter(predicateFn, executionContext);
      return this.broadcastEvent('filteringComplete', filteredResults);
    }

    rejectItems(predicateFn, executionContext) {
      const rejectedResults = this._internalStorage.filter((item, index, arr) => !predicateFn.call(executionContext, item, index, arr));
      return this.broadcastEvent('rejectionComplete', rejectedResults);
    }

    checkAll(predicateFn, executionContext) {
      const allPass = this._internalStorage.every(predicateFn, executionContext);
      return this.broadcastEvent('everyCheck', allPass);
    }

    checkAny(predicateFn, executionContext) {
      const anyPass = this._internalStorage.some(predicateFn, executionContext);
      return this.broadcastEvent('someCheck', anyPass);
    }

    hasItem(targetValue) {
      const includesTarget = this._internalStorage.includes(targetValue);
      return this.broadcastEvent('itemPresence', includesTarget);
    }

    randomizeOrder() {
      const shuffledArray = [...this._internalStorage];
      let currentIndex = shuffledArray.length;
      let randomIndex;

      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [shuffledArray[currentIndex], shuffledArray[randomIndex]] = [
          shuffledArray[randomIndex], shuffledArray[currentIndex]
        ];
      }
      return this.broadcastEvent('orderRandomized', shuffledArray);
    }

    getFirst(count) {
      return count === undefined ? this._internalStorage[0] : this._internalStorage.slice(0, count);
    }

    getRemaining(startIndex) {
      return this._internalStorage.slice(startIndex || 1);
    }

    getInitial(count) {
      const n = (count === undefined) ? 1 : count;
      return this._internalStorage.slice(0, this._internalStorage.length - n);
    }

    getLast(count) {
      const n = (count === undefined) ? 1 : count;
      return this._internalStorage.slice(Math.max(this._internalStorage.length - n, 0));
    }

    getIndex(itemToFind) {
      return this._internalStorage.indexOf(itemToFind);
    }

    attachHandler(eventIdentifier, handlerFunction) {
      this._eventCallbacks.set(eventIdentifier, handlerFunction);
      return undefined;
    }

    detachHandler(eventIdentifier) {
      const wasDeleted = this._eventCallbacks.delete(eventIdentifier);
      return wasDeleted;
    }

    broadcastEvent(eventIdentifier, ...eventArgs) {
      const handler = this._eventCallbacks.get(eventIdentifier);
      let processedArgs = this.normalizeOutput(eventArgs);
      if (handler) {
        handler(processedArgs);
      }
      return processedArgs;
    }

    normalizeOutput(valuesArray) {
      if (Array.isArray(valuesArray) && valuesArray.length === 1) {
        return valuesArray[0];
      }
      return valuesArray;
    }

    displayContent() {
      return JSON.stringify(this._internalStorage);
    }

    setCapacity(limit) {
      this._capacityLimit = limit;
      if (this._internalStorage.length > 0 && this._internalStorage.length > this._capacityLimit) {
        while (this._internalStorage.length > this._capacityLimit) {
          this.extractFirst();
        }
      }
    }
  }

  const globalAccessPoint = typeof exports !== "undefined" && exports !== null ? exports : this;

  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = ManagedSequence;
  } else if (typeof exports === 'object' && exports) {
    exports.ManagedSequence = ManagedSequence;
  } else if (typeof define === 'function' && define.amd) {
    define('managedsequence', [], function() {
      return ManagedSequence;
    });
  } else {
    globalAccessPoint.ManagedSequence = ManagedSequence;
  }

}).call(this);