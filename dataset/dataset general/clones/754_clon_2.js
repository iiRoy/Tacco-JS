var OrderedCollection = function (capacity) {
  var instance = {},
    storageBuckets,
    idx,
    cachedCount = null;

  // Set up storage arrays for elements
  capacity = Math.max(parseInt(capacity, 10) || 0, 1);
  storageBuckets = [];
  for (idx = 0; idx < capacity; idx += 1) {
    storageBuckets.push([]);
  }

  // Exported methods
  instance.getCurrentCount = function () {
    var j;
    if (cachedCount === null) {
      cachedCount = 0;
      for (j = 0; j < capacity; j += 1) {
        cachedCount += storageBuckets[j].length;
      }
    }
    return cachedCount;
  };

  instance.addItem = function (itemToAdd, itemRank) {
    var originalRankValue;

    // Ensure itemRank is an integer, default to zero
    itemRank = itemRank && +itemRank | 0 || 0;

    // Invalidate cached total
    cachedCount = null;
    if (itemRank) {
      originalRankValue = itemRank;
      if (itemRank < 0 || itemRank >= capacity) {
        itemRank = (capacity - 1);
        // Place item at the lowest priority if rank is out of bounds
        console.warn("Rank out of bounds: " + originalRankValue + ". Adjusting to " + itemRank + ".");
      }
    }

    storageBuckets[itemRank].push(itemToAdd);
  };

  instance.takeItem = function (completionHandler) {
    var retrievedItem = null,
      j,
      bucketCount = storageBuckets.length;

    // Reset cached count
    cachedCount = null;
    for (j = 0; j < bucketCount; j += 1) {
      if (storageBuckets[j].length) {
        retrievedItem = storageBuckets[j].shift();
        break;
      }
    }
    return retrievedItem;
  };

  return instance;
};

module.exports.ResourceReservoir = function (configurator) {
  var reservoirInstance = {},

    inactiveItemRetentionMs = configurator.idleTimeoutMillis || 30000,
    cleanupIntervalMs = configurator.reapIntervalMillis || 1000,
    rejuvenateInactive = ('refreshIdle' in configurator) ? configurator.refreshIdle : true,
    readyItems = [],
    pendingRequests = new OrderedCollection(configurator.priorityRange || 1),
    totalItemsInUse = 0,
    cleanupScheduledFlag = false,
    cleanupTimerHandle = null,
    shutdownInProgress = false,
    addReleasedToFront = configurator.returnToHead || false,

    // Set up a custom logging mechanism.
    eventLogger = configurator.log ?
      (function (messageText, logSeverity) {
        if (typeof configurator.log === 'function') {
          configurator.log(messageText, logSeverity);
        } else {
          console.info(logSeverity.toUpperCase() + " reservoir " + configurator.name + " - " + messageText);
        }
      }) :
      function () {};

  configurator.verifyValidity = configurator.validate || function () { return true; };

  configurator.maximumCapacity = parseInt(configurator.max, 10);
  configurator.minimumCapacity = parseInt(configurator.min, 10);

  configurator.maximumCapacity = Math.max(isNaN(configurator.maximumCapacity) ? 1 : configurator.maximumCapacity, 1);
  configurator.minimumCapacity = Math.min(isNaN(configurator.minimumCapacity) ? 0 : configurator.minimumCapacity, configurator.maximumCapacity - 1);

  /**
   * Instructs a client resource to be completely removed.
   * Calls the configurator's discard method.
   *
   * This should be used within an obtainResource() block as an alternative to returnResource().
   *
   * @param {Object} resourceToDiscard
   *   The resource obtained from the reservoir to be permanently removed.
   */
  reservoirInstance.discardItem = function (resourceToDiscard) {
    totalItemsInUse -= 1;
    readyItems = readyItems.filter(function (timedResource) {
      return (timedResource.item !== resourceToDiscard);
    });
    configurator.destroy(resourceToDiscard);

    maintainMinimum();
  };

  /**
   * Examines and removes available (idle) resources that have exceeded their inactive time.
   */
  function purgeInactive() {
    var itemsForDisposal = [],
      currentTimestamp = new Date().getTime(),
      idx,
      activeLength, disposalCount,
      expiryTimestamp;

    cleanupScheduledFlag = false;

    // Iterate through idle resources, checking for expiry
    for (idx = 0, activeLength = readyItems.length; idx < activeLength && (rejuvenateInactive || (totalItemsInUse - configurator.minimumCapacity > itemsForDisposal.length)); idx += 1) {
      expiryTimestamp = readyItems[idx].expiry;
      if (currentTimestamp >= expiryTimestamp) {
        // Resource expired, mark for destruction.
        eventLogger("purgeInactive() removing item - now:" + currentTimestamp + " expiry:" + expiryTimestamp, 'detail');
        itemsForDisposal.push(readyItems[idx].item);
      }
    }

    for (idx = 0, disposalCount = itemsForDisposal.length; idx < disposalCount; idx += 1) {
      reservoirInstance.discardItem(itemsForDisposal[idx]);
    }

    // Update the list of available items.
    activeLength = readyItems.length;

    if (activeLength > 0) {
      eventLogger("readyItems.length=" + activeLength, 'detail');
      arrangeCleanup();
    } else {
      eventLogger("purgeInactive() all items removed", 'detail');
    }
  }

  /**
   * Arranges the scheduled removal of inactive items from the reservoir.
   *
   * Only one such schedule can be active at a time.
   */
  function arrangeCleanup() {
    if (!cleanupScheduledFlag) {
      cleanupScheduledFlag = true;
      cleanupTimerHandle = setTimeout(purgeInactive, cleanupIntervalMs);
    }
  }

  /**
   * Manages callback invocation, adapting to single or dual argument signatures.
   * Determines argument count based on `callbackFunction.length`.
   */
  function adaptCallbackArguments(callbackFunction, errorObject, resultObject) {
    if (!callbackFunction) return;
    if (callbackFunction.length <= 1) {
      callbackFunction(resultObject);
    } else {
      callbackFunction(errorObject, resultObject);
    }
  }

  /**
   * Attempts to provide a new resource for use, and cleans up any idle reservoir items.
   *
   *  - If idle resources are available, the first one is retrieved (LIFO) and its callback invoked.
   *  - If no idle resources, a new one is provisioned if capacity allows.
   *  - If maximum capacity is reached, the request is added to the pending list.
   */
  function distributeResource() {
    var retrievedItem = null,
      itemWithExpiry = null,
      errorObject = null,
      requestCallback = null,
      pendingCount = pendingRequests.getCurrentCount();

    eventLogger("distributeResource() pending=" + pendingCount + " ready=" + readyItems.length, 'info');
    if (pendingCount > 0) {
      while (readyItems.length > 0) {
        eventLogger("distributeResource() - reusing item", 'detail');
        itemWithExpiry = readyItems[0];
        if (!configurator.verifyValidity(itemWithExpiry.item)) {
          reservoirInstance.discardItem(itemWithExpiry.item);
          continue;
        }
        readyItems.shift();
        requestCallback = pendingRequests.takeItem();
        return adaptCallbackArguments(requestCallback, errorObject, itemWithExpiry.item);
      }
      if (totalItemsInUse < configurator.maximumCapacity) {
        provisionResource();
      }
    }
  }

  function provisionResource() {
    totalItemsInUse += 1;
    eventLogger("provisionResource() - creating item - total=" + totalItemsInUse + " min=" + configurator.minimumCapacity + " max=" + configurator.maximumCapacity, 'detail');
    configurator.create(function () {
      var errorObject, resultObject;
      var requestCallback = pendingRequests.takeItem();
      if (arguments.length > 1) {
        errorObject = arguments[0];
        resultObject = arguments[1];
      } else {
        errorObject = (arguments[0] instanceof Error) ? arguments[0] : null;
        resultObject = (arguments[0] instanceof Error) ? null : arguments[0];
      }
      if (errorObject) {
        totalItemsInUse -= 1;
        if (requestCallback) {
          adaptCallbackArguments(requestCallback, errorObject, resultObject);
        }
        setImmediate(function () {
          distributeResource();
        });
      } else {
        if (requestCallback) {
          adaptCallbackArguments(requestCallback, errorObject, resultObject);
        } else {
          reservoirInstance.returnResource(resultObject);
        }
      }
    });
  }

  function maintainMinimum() {
    var idx, differenceAmount;
    if (!shutdownInProgress && (totalItemsInUse < configurator.minimumCapacity)) {
      differenceAmount = configurator.minimumCapacity - totalItemsInUse;
      for (idx = 0; idx < differenceAmount; idx++) {
        provisionResource();
      }
    }
  }

  /**
   * Requests a new client resource. The provided callback will be invoked
   * once a client becomes available, passing the client as an argument.
   *
   * @param {Function} completionCallback
   *   Function to be called upon successful acquisition.
   *   Receives the acquired resource as its primary argument.
   *
   * @param {Number} requestPriority
   *   Optional. Integer between 0 and (priorityRange - 1). Defines the request's urgency.
   *   Lower numbers indicate higher priority.
   *
   * @returns {Object} `true` if reservoir is not at full capacity, `false` otherwise.
   */
  reservoirInstance.obtainResource = function (completionCallback, requestPriority) {
    if (shutdownInProgress) {
      throw new Error("Reservoir is shutting down and cannot fulfill new requests.");
    }
    pendingRequests.addItem(completionCallback, requestPriority);
    distributeResource();
    return (totalItemsInUse < configurator.maximumCapacity);
  };

  reservoirInstance.requestResource = function (completionCallback, requestPriority) {
    eventLogger("requestResource() is deprecated. Use obtainResource() instead.", 'warning');
    reservoirInstance.obtainResource(completionCallback, requestPriority);
  };

  /**
   * Returns a resource to the reservoir when it is no longer needed.
   *
   * @param {Object} returnedItem
   *   The resource previously obtained from the reservoir to be returned.
   */
  reservoirInstance.returnResource = function (returnedItem) {
    // Verify if this item has already been returned
    if (readyItems.some(function (timedResource) { return (timedResource.item === returnedItem); })) {
      eventLogger("returnResource called multiple times for the same item: " + (new Error().stack), 'error');
      return;
    }
    var itemWithExpiry = { item: returnedItem, expiry: (new Date().getTime() + inactiveItemRetentionMs) };
    if (addReleasedToFront) {
      readyItems.splice(0, 0, itemWithExpiry);
    } else {
      readyItems.push(itemWithExpiry);
    }
    eventLogger("expiry: " + itemWithExpiry.expiry, 'detail');
    distributeResource();
    arrangeCleanup();
  };

  reservoirInstance.depositResource = function (returnedItem) {
    eventLogger("depositResource() is deprecated. Use returnResource() instead.", 'warning');
    reservoirInstance.returnResource(returnedItem);
  };

  /**
   * Prevents new requests and allows existing backlog to clear.
   *
   * @param {Function} completionCallback
   *   Optional. Invoked when all operations are complete and resources released.
   */
  reservoirInstance.initiateShutdown = function (completionCallback) {
    eventLogger("initiating shutdown", 'info');

    // Disable accepting new work
    shutdownInProgress = true;

    var shutdownCheck = function () {
      if (pendingRequests.getCurrentCount() > 0) {
        // Await satisfaction of all pending requests.
        setTimeout(shutdownCheck, 100);
      } else if (readyItems.length != totalItemsInUse) {
        // Await release of all in-use resources.
        setTimeout(shutdownCheck, 100);
      } else {
        if (completionCallback) {
          completionCallback();
        }
      }
    };
    shutdownCheck();
  };

  /**
   * Immediately destroys all existing client resources, irrespective of their expiry.
   * Intended for use as part of a shutdown process. This does not block the creation
   * of new resources by subsequent obtainResource calls.
   *
   * Note: If configurator.minimumCapacity > 0, the reservoir will dispose of all idle
   * resources but then re-provision new ones up to the specified minimum. To avoid this,
   * set configurator.minimumCapacity to zero before calling forceDiscardAll().
   *
   * @param {Function} completionCallback
   *   Optional. Invoked after all current resources have been destroyed.
   */
  reservoirInstance.forceDiscardAll = function (completionCallback) {
    eventLogger("forcing destruction of all items", 'info');
    var expiringItems = readyItems;
    readyItems = [];
    var currentItem = expiringItems.shift();
    while (currentItem !== null && currentItem !== undefined) {
      reservoirInstance.discardItem(currentItem.item);
      currentItem = expiringItems.shift();
    }
    cleanupScheduledFlag = false;
    clearTimeout(cleanupTimerHandle);
    if (completionCallback) {
      completionCallback();
    }
  };

  /**
   * Wraps a function to automatically acquire and release a resource from the pool.
   *
   * @param {Function} targetFunction
   *   The function to be wrapped; it should accept an acquired resource as its first argument,
   *   and optionally a callback as its final argument.
   *
   * @param {Number} requestPriority
   *   Optional. Integer between 0 and (priorityRange - 1). Specifies the priority
   *   of the request if no resources are immediately available. Lower numbers mean higher priority.
   */
  reservoirInstance.decorateWithPooling = function (targetFunction, requestPriority) {
    return function () {
      var invocationArguments = arguments;
      var finalCallback = invocationArguments[invocationArguments.length - 1];
      var hasFinalCallback = typeof finalCallback === 'function';
      reservoirInstance.obtainResource(function (errorObject, acquiredClient) {
        if (errorObject) {
          if (hasFinalCallback) {
            finalCallback(errorObject);
          }
          return;
        }

        var modifiedArguments = [acquiredClient].concat(Array.prototype.slice.call(invocationArguments, 0, hasFinalCallback ? -1 : undefined));
        modifiedArguments.push(function () {
          reservoirInstance.returnResource(acquiredClient);
          if (hasFinalCallback) {
            finalCallback.apply(null, arguments);
          }
        });

        targetFunction.apply(null, modifiedArguments);
      }, requestPriority);
    };
  };

  reservoirInstance.getCurrentSize = function () {
    return totalItemsInUse;
  };

  reservoirInstance.getIdentifier = function () {
    return configurator.componentIdentifier;
  };

  reservoirInstance.getAvailableCount = function () {
    return readyItems.length;
  };

  reservoirInstance.getPendingRequestCount = function () {
    return pendingRequests.getCurrentCount();
  };

  reservoirInstance.getMaximumSize = function () {
    return configurator.maximumCapacity;
  };

  // Provision initial resources if minimum capacity is set
  maintainMinimum();

  return reservoirInstance;
};