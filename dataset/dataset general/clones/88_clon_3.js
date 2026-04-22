// Type III clone of EventedArray
// This module provides an observable list-like structure, named MonitoredList.
// It tracks changes to its internal collection and allows external subscribers
// to react to various operations performed on the list.
(function() {
  // A local utility for converting the 'arguments' object into a true Array.
  // This helps in handling variadic function parameters consistently.
  var arrayFromArgs = [].slice;

  // Determines the global object context, enabling compatibility across different JavaScript environments
  // such as Node.js (exports), browser windows (this/window), and web workers.
  var globalContext = typeof exports !== "undefined" && exports !== null ? exports : this;

  // A small, internal utility object. It provides essential helper functions,
  // particularly for operations that might otherwise rely on external libraries
  // like Underscore.js. This design reduces external hard dependencies.
  var internalUtils = globalContext.utilityLib || {
    // Checks if a given object is a function.
    isFunction: function(checkTarget) {
      return typeof checkTarget === 'function';
    },
    // Implements the Fisher-Yates shuffle algorithm to randomize array elements.
    // It creates a shallow copy of the input array to avoid modifying the original.
    shuffle: function(arr) {
      if (!Array.isArray(arr)) {
        console.warn("MonitoredList: Shuffle utility received non-array input.");
        return [];
      }
      var currentIndex = arr.length,
        randomIndex;
      var newArr = arr.slice(); // Create a shallow copy for modification.

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element using array destructuring.
        [newArr[currentIndex], newArr[randomIndex]] = [newArr[randomIndex], newArr[currentIndex]];
      }
      return newArr;
    }
  };

  // The primary class definition for MonitoredList.
  // This class wraps a standard JavaScript array and augments it with eventing capabilities.
  var MonitoredList = (function() {
    // The constructor initializes a new MonitoredList instance.
    // It can accept initial items and sets up the internal state for data and event management.
    function MonitoredList() {
      // Collects all arguments passed to the constructor as initial items.
      var initialItems = arrayFromArgs.call(arguments);

      // Initializes the internal data store. If a single array was passed, it's used directly;
      // otherwise, all arguments are treated as individual items.
      this.dataStore = Array.isArray(initialItems[0]) && initialItems.length === 1 ? initialItems[0] : initialItems;

      // An object to store event subscriptions. Each key is an event name, and its value
      // is an array of handler functions subscribed to that event.
      this.subscriptions = {};

      // An internal property to manage the maximum allowed size (capacity) of the list.
      // A `null` value indicates no capacity limit is enforced.
      this._internalCapacity = null;

      // A unique identifier for each MonitoredList instance, helpful for debugging and tracking.
      this._instanceId = Math.random().toString(36).substring(2, 9);

      // Performs a soft check for the availability of critical internal utility functions.
      // If a function like `shuffle` is missing, a warning is logged, indicating potential
      // limitations without necessarily halting execution.
      if (!internalUtils.isFunction(internalUtils.shuffle)) {
        console.warn(`MonitoredList (ID:${this._instanceId}): Missing or incomplete utility functions detected. Some operations (e.g., shuffle) may not work as intended.`);
      }
    }

    // Adds one or more items to the end of the collection.
    // If a capacity limit is configured, older items may be automatically removed to maintain the limit.
    MonitoredList.prototype.addItem = function() {
      var incomingElements = arrayFromArgs.call(arguments);

      // If multiple items are provided, process each one individually to trigger events for each addition.
      if (incomingElements.length > 1) {
        var results = [];
        for (var i = 0; i < incomingElements.length; i++) {
          results.push(this.addItem(incomingElements[i]));
        }
        return results;
      }

      // If no items are supplied, log a notification and return failure.
      if (incomingElements.length === 0) {
        this.notifySubscribers('addItemFailed:noInput');
        return false;
      }

      var itemToInsert = incomingElements[0];

      // If a capacity limit is active, ensure the list does not exceed it.
      // Oldest items are removed until capacity is met before adding the new item.
      if (this._internalCapacity !== null && this.dataStore.length >= this._internalCapacity) {
        var removedOld = this.extractFirst(); // This action also triggers a 'firstItemExtracted' event.
        if (removedOld === undefined) {
          // If `extractFirst` failed (e.g., due to an empty list, which is unlikely given the check above),
          // notify about a capacity issue.
          this.notifySubscribers('addItemFailed:capacityIssue', itemToInsert);
          return false;
        }
      }

      // Add the new item to the data store.
      this.dataStore.push(itemToInsert);
      // Notify subscribers that an item has been added.
      this.notifySubscribers('itemAdded', itemToInsert);
      return true;
    };

    // Retrieves an item from the collection based on its numerical index.
    // Includes validation for the provided index to prevent out-of-bounds access.
    MonitoredList.prototype.retrieveItem = function(lookupIndex) {
      // Validate that the index is a valid number and within the bounds of the array.
      if (typeof lookupIndex !== 'number' || lookupIndex < 0 || lookupIndex >= this.dataStore.length) {
        this.notifySubscribers('retrieveFailed:invalidIndex', lookupIndex);
        return undefined; // Return undefined for invalid access attempts.
      }

      var retrievedElement = this.dataStore[lookupIndex];
      // Notify subscribers that an item has been accessed.
      this.notifySubscribers('itemAccessed', retrievedElement, lookupIndex);
      return retrievedElement;
    };

    // Removes the first occurrence of a specified item from the collection.
    // Returns `true` if the item was successfully removed, `false` otherwise.
    MonitoredList.prototype.deleteItem = function(itemToRemove) {
      // Basic validation: ensure an item to remove was actually specified.
      if (itemToRemove === null || itemToRemove === undefined) {
        this.notifySubscribers('deleteFailed:noItemSpecified');
        return false;
      }

      var foundIndex = this.dataStore.indexOf(itemToRemove);

      // If the item is not found in the data store, notify and return false.
      if (foundIndex === -1) {
        this.notifySubscribers('deleteFailed:notFound', itemToRemove);
        return false;
      }

      // Use `splice` to directly remove the item from the array, modifying it in place.
      var removedElement = this.dataStore.splice(foundIndex, 1)[0];

      // Notify subscribers that an item has been removed.
      this.notifySubscribers('itemRemoved', removedElement, foundIndex);
      return true;
    };

    // Removes and returns the last item from the collection (LIFO behavior).
    // Notifies subscribers of the removal. Returns `undefined` if the list is empty.
    MonitoredList.prototype.extractLast = function() {
      if (this.dataStore.length === 0) {
        this.notifySubscribers('extractLastFailed:emptyList');
        return undefined;
      }
      var poppedItem = this.dataStore.pop();
      this.notifySubscribers('lastItemExtracted', poppedItem);
      return poppedItem;
    };

    // Removes and returns the first item from the collection (FIFO behavior).
    // Notifies subscribers of the removal. Returns `undefined` if the list is empty.
    MonitoredList.prototype.extractFirst = function() {
      if (this.dataStore.length === 0) {
        this.notifySubscribers('extractFirstFailed:emptyList');
        return undefined;
      }
      var shiftedItem = this.dataStore.shift();
      this.notifySubscribers('firstItemExtracted', shiftedItem);
      return shiftedItem;
    };

    // Iterates over each item in the collection, executing a provided callback function.
    // This method is similar to `Array.prototype.forEach`.
    MonitoredList.prototype.processEach = function(callbackFn, executionContext) {
      if (!internalUtils.isFunction(callbackFn)) {
        this.notifySubscribers('processEachFailed:invalidCallback');
        console.error(`MonitoredList (ID:${this._instanceId}): 'processEach' requires a valid callback function.`);
        return;
      }
      var selfRef = this;
      this.dataStore.forEach(function(currentVal, idx) {
        selfRef.notifySubscribers('iteratingItem', currentVal, idx);
        // Call the user-provided function with the specified context.
        callbackFn.call(executionContext || this, currentVal, idx, selfRef.dataStore);
      }, executionContext);
    };

    // Creates a new array by applying a mapping function to each item in the collection.
    // This method is similar to `Array.prototype.map`.
    MonitoredList.prototype.transformElements = function(mappingFn, executionContext) {
      if (!internalUtils.isFunction(mappingFn)) {
        this.notifySubscribers('transformFailed:invalidMapping');
        console.error(`MonitoredList (ID:${this._instanceId}): 'transformElements' requires a valid mapping function.`);
        return [];
      }
      var transformedResult = this.dataStore.map(mappingFn, executionContext);
      this.notifySubscribers('elementsTransformed', transformedResult);
      return transformedResult;
    };

    // An alias for `processEach`, providing an alternative name for iterating through elements,
    // consistent with standard JavaScript array methods.
    MonitoredList.prototype.iterateElements = function(callbackFn, executionContext) {
      return this.processEach(callbackFn, executionContext);
    };

    // Reduces the collection to a single value by applying a reducer function from left to right.
    // This method is similar to `Array.prototype.reduce`.
    MonitoredList.prototype.foldLeft = function(reducerFn, initialAccumulator) {
      if (!internalUtils.isFunction(reducerFn)) {
        this.notifySubscribers('foldLeftFailed:invalidReducer');
        console.error(`MonitoredList (ID:${this._instanceId}): 'foldLeft' requires a valid reducer function.`);
        return initialAccumulator;
      }
      var finalResult = this.dataStore.reduce(reducerFn, initialAccumulator);
      this.notifySubscribers('collectionFolded', finalResult);
      return finalResult;
    };

    // Reduces the collection to a single value by applying a reducer function from right to left.
    // This method is similar to `Array.prototype.reduceRight`.
    MonitoredList.prototype.foldRight = function(reducerFn, initialAccumulator) {
      if (!internalUtils.isFunction(reducerFn)) {
        this.notifySubscribers('foldRightFailed:invalidReducer');
        console.error(`MonitoredList (ID:${this._instanceId}): 'foldRight' requires a valid reducer function.`);
        return initialAccumulator;
      }
      var finalResult = this.dataStore.reduceRight(reducerFn, initialAccumulator);
      this.notifySubscribers('collectionFoldedRight', finalResult);
      return finalResult;
    };

    // Creates a new array containing only the items that satisfy a given predicate function.
    // This method is similar to `Array.prototype.filter`.
    MonitoredList.prototype.selectMatching = function(predicateFn, executionContext) {
      if (!internalUtils.isFunction(predicateFn)) {
        this.notifySubscribers('selectFailed:invalidPredicate');
        console.error(`MonitoredList (ID:${this._instanceId}): 'selectMatching' requires a valid predicate function.`);
        return [];
      }
      var filteredResult = this.dataStore.filter(predicateFn, executionContext);
      this.notifySubscribers('elementsSelected', filteredResult);
      return filteredResult;
    };

    // Creates a new array containing only the items that do NOT satisfy a given predicate function.
    // This is essentially the inverse of `selectMatching`.
    MonitoredList.prototype.excludeMatching = function(predicateFn, executionContext) {
      if (!internalUtils.isFunction(predicateFn)) {
        this.notifySubscribers('excludeFailed:invalidPredicate');
        console.error(`MonitoredList (ID:${this._instanceId}): 'excludeMatching' requires a valid predicate function.`);
        return [];
      }
      var rejectedResult = this.dataStore.filter(function(item, index, array) {
        return !predicateFn.call(executionContext || this, item, index, array);
      }, executionContext);
      this.notifySubscribers('elementsExcluded', rejectedResult);
      return rejectedResult;
    };

    // Checks if all items in the collection pass a given predicate function.
    // This method is similar to `Array.prototype.every`.
    MonitoredList.prototype.checkAllPass = function(predicateFn, executionContext) {
      if (!internalUtils.isFunction(predicateFn)) {
        this.notifySubscribers('checkAllFailed:invalidPredicate');
        console.error(`MonitoredList (ID:${this._instanceId}): 'checkAllPass' requires a valid predicate function.`);
        return false;
      }
      var allPass = this.dataStore.every(predicateFn, executionContext);
      this.notifySubscribers('allElementsChecked', allPass);
      return allPass;
    };

    // Checks if at least one item in the collection passes a given predicate function.
    // This method is similar to `Array.prototype.some`.
    MonitoredList.prototype.checkAnyPass = function(predicateFn, executionContext) {
      if (!internalUtils.isFunction(predicateFn)) {
        this.notifySubscribers('checkAnyFailed:invalidPredicate');
        console.error(`MonitoredList (ID:${this._instanceId}): 'checkAnyPass' requires a valid predicate function.`);
        return false;
      }
      var anyPass = this.dataStore.some(predicateFn, executionContext);
      this.notifySubscribers('anyElementsChecked', anyPass);
      return anyPass;
    };

    // Determines if the collection contains a specific item.
    // This method is similar to `Array.prototype.includes`.
    MonitoredList.prototype.includesItem = function(targetElement) {
      var hasItem = this.dataStore.includes(targetElement);
      this.notifySubscribers('itemInclusionChecked', hasItem, targetElement);
      return hasItem;
    };

    // Returns a new array with the items of the collection in a randomized order.
    // The original collection remains unchanged.
    MonitoredList.prototype.randomizeOrder = function() {
      // Utilizes the internal shuffle utility.
      var shuffledArray = internalUtils.shuffle(this.dataStore);
      this.notifySubscribers('orderRandomized', shuffledArray);
      return shuffledArray;
    };

    // --- Accessor Methods (Non-Evented for Direct Data Access) ---
    // These methods provide quick access to parts of the collection without triggering events.

    // Retrieves the first N items, or just the first item if N is not specified.
    MonitoredList.prototype.retrieveFirst = function(numItems) {
      return numItems ? this.dataStore.slice(0, numItems) : this.dataStore[0];
    };

    // Retrieves all items except the first N, or all except the first if N is not specified.
    MonitoredList.prototype.retrieveTail = function(numToSkip) {
      return this.dataStore.slice(numToSkip || 1);
    };

    // Retrieves all items except the last N, or all except the last if N is not specified.
    MonitoredList.prototype.retrieveInitial = function(numToExclude) {
      return this.dataStore.slice(0, this.dataStore.length - (numToExclude || 1));
    };

    // Retrieves the last N items, or just the last item if N is not specified.
    MonitoredList.prototype.retrieveLast = function(numItems) {
      return numItems ? this.dataStore.slice(Math.max(this.dataStore.length - numItems, 0)) : this.dataStore[this.dataStore.length - 1];
    };

    // Finds the index of the first occurrence of a specified item.
    // Returns -1 if the item is not found.
    MonitoredList.prototype.findFirstIndex = function(targetItem) {
      return this.dataStore.indexOf(targetItem);
    };

    // --- Event Management System ---

    // Subscribes a handler function to a specified event.
    // An event can have multiple handlers, all of which will be invoked when the event is notified.
    MonitoredList.prototype.onEvent = function(eventName, handlerFunction) {
      if (!eventName || typeof eventName !== 'string') {
        console.error(`MonitoredList (ID:${this._instanceId}): Invalid event name provided for subscription.`);
        return false;
      }
      if (!internalUtils.isFunction(handlerFunction)) {
        console.error(`MonitoredList (ID:${this._instanceId}): Handler for event '${eventName}' must be a function.`);
        return false;
      }
      // Initialize an array for this event if it doesn't exist.
      if (!this.subscriptions[eventName]) {
        this.subscriptions[eventName] = [];
      }
      this.subscriptions[eventName].push(handlerFunction);
      return true;
    };

    // Unsubscribes a specific handler function from an event.
    // If no specific handler is provided, all handlers for that event are removed.
    MonitoredList.prototype.offEvent = function(eventName, handlerFunction) {
      if (!eventName || typeof eventName !== 'string') {
        console.error(`MonitoredList (ID:${this._instanceId}): Invalid event name provided for unsubscription.`);
        return false;
      }
      if (!this.subscriptions[eventName]) {
        return false; // No handlers are registered for this event.
      }

      if (handlerFunction) {
        // Filter out the specific handler function to remove it.
        this.subscriptions[eventName] = this.subscriptions[eventName].filter(function(h) {
          return h !== handlerFunction;
        });
        // If no handlers remain for this event, clean up the empty array.
        if (this.subscriptions[eventName].length === 0) {
          delete this.subscriptions[eventName];
        }
      } else {
        // If no specific handler is given, remove all handlers for the event.
        delete this.subscriptions[eventName];
      }
      return true;
    };

    // Notifies all subscribed handlers for a given event.
    // Any arguments provided after the event name are passed as payload to the handlers.
    MonitoredList.prototype.notifySubscribers = function() {
      var notificationArgs = arrayFromArgs.call(arguments);
      var eventName = notificationArgs.shift(); // The first argument is the event name.
      var eventPayload = this.normalizeNotificationPayload(notificationArgs); // Remaining arguments form the payload.

      if (!eventName || typeof eventName !== 'string') {
        console.warn(`MonitoredList (ID:${this._instanceId}): Attempted to notify with an invalid or missing event name.`);
        return;
      }

      var handlers = this.subscriptions[eventName];
      if (handlers && handlers.length > 0) {
        // Iterate through all registered handlers for the event and execute them.
        handlers.forEach(function(handler) {
          try {
            // Apply the payload arguments to each handler.
            handler.apply(null, eventPayload);
          } catch (e) {
            console.error(`MonitoredList (ID:${this._instanceId}): Error in event handler for '${eventName}':`, e);
          }
        });
      }
    };

    // A helper method to ensure event payloads are consistently formatted as arrays.
    // This simplifies handling arguments in event handlers.
    MonitoredList.prototype.normalizeNotificationPayload = function(inputArgs) {
      // Always return an array. If the input is not an array, wrap it in one.
      return Array.isArray(inputArgs) ? inputArgs : [inputArgs];
    };

    // Provides a custom string representation for the MonitoredList instance.
    // Useful for debugging, showing instance ID, size, and a JSON preview of its contents.
    MonitoredList.prototype.toString = function() {
      return `MonitoredList(ID:${this._instanceId}, Size:${this.dataStore.length}) [${JSON.stringify(this.dataStore)}]`;
    };

    // Configures or removes the maximum capacity limit for the list.
    // If a new limit is set and the current list size exceeds it, older items are automatically removed.
    MonitoredList.prototype.configureCapacity = function(newLimit) {
      // Validate the new capacity limit: it must be `null` (for no limit) or a non-negative integer.
      if (newLimit !== null && (typeof newLimit !== 'number' || newLimit < 0 || !Number.isInteger(newLimit))) {
        console.error(`MonitoredList (ID:${this._instanceId}): Invalid capacity limit provided. Must be null or a non-negative integer.`);
        this.notifySubscribers('capacityConfigFailed:invalidLimit', newLimit);
        return false;
      }

      this._internalCapacity = newLimit;
      this.notifySubscribers('capacityUpdated', newLimit);

      // If a capacity limit is active and the list currently exceeds it,
      // repeatedly remove the first item until the list fits the new capacity.
      while (this._internalCapacity !== null && this.dataStore.length > this._internalCapacity) {
        this.extractFirst(); // This method internally triggers the 'firstItemExtracted' event.
      }
      return true;
    };

    return MonitoredList;

  })();

  // --- Environment-Specific Export Logic for MonitoredList ---
  // This section ensures the MonitoredList class is correctly exposed
  // for different module systems (CommonJS, AMD) or as a global variable.

  // CommonJS environment (e.g., Node.js)
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = MonitoredList;
  }
  // Asynchronous Module Definition (AMD) environment (e.g., RequireJS)
  else if (typeof define === 'function' && define.amd) {
    define('monitoredlist', [], function() {
      return MonitoredList;
    });
  }
  // Browser global environment (fallback if no module system is detected)
  else {
    globalContext.MonitoredList = MonitoredList;
  }

}).call(this);