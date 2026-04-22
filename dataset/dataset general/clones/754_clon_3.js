let RankedQueue = function(capacity) {
  const queueInstance = {}; // The object that will be returned
  let storageBuckets;       // Array of arrays to hold items based on their rank
  let itemCounter = null;   // Cache for the total number of elements in the queue

  // Validate and initialize the queue's capacity
  const maxCapacity = Math.max(Number.parseInt(capacity, 10) || 1, 1);

  // Prepare the internal storage structure
  storageBuckets = Array.from({ length: maxCapacity }, () => []);

  /**
   * Retrieves the current total number of items stored in the queue.
   * Caches the result for efficiency.
   * @returns {number} The total count of items.
   */
  queueInstance.getCurrentItemCount = function () {
    if (itemCounter === null) {
      itemCounter = storageBuckets.reduce((sum, bucket) => sum + bucket.length, 0);
    }
    return itemCounter;
  };

  /**
   * Adds an item to the queue with a specified rank.
   * @param {any} itemPayload - The item to be added.
   * @param {number} itemRank - The priority rank (lower numbers = higher priority).
   */
  queueInstance.addWithRank = function (itemPayload, itemRank) {
    if (itemPayload === undefined || itemPayload === null) {
      console.warn("Attempted to enqueue a null/undefined item. Skipping.");
      return;
    }

    // Normalize rank to an integer, defaulting to 0 if invalid.
    let effectiveRank = Number.parseInt(itemRank, 10);
    if (Number.isNaN(effectiveRank) || effectiveRank < 0) {
      effectiveRank = 0;
    }

    // Invalidate the cached total item count.
    itemCounter = null;

    // Adjust rank to fit within the available buckets.
    // Invalid ranks are clamped to the lowest priority bucket.
    if (effectiveRank >= maxCapacity) {
      console.error(`Invalid rank value: ${itemRank}. Clamping to max allowed rank (${maxCapacity - 1}).`);
      effectiveRank = maxCapacity - 1; // Put at the end of the line
    }

    // Add the item to the corresponding bucket.
    storageBuckets[effectiveRank].push(itemPayload);
  };

  /**
   * Removes and returns the highest priority item from the queue.
   * @returns {any|null} The extracted item, or null if the queue is empty.
   */
  queueInstance.extractNextItem = function () {
    let retrievedItem = null;

    // Invalidate the cached total item count.
    itemCounter = null;

    // Iterate through buckets from highest priority (index 0) to lowest.
    for (let currentBucketIdx = 0; currentBucketIdx < maxCapacity; currentBucketIdx++) {
      if (storageBuckets[currentBucketIdx].length > 0) {
        retrievedItem = storageBuckets[currentBucketIdx].shift(); // Get first item (FIFO within bucket)
        break; // Found an item, no need to check further buckets.
      }
    }
    return retrievedItem;
  };

  return queueInstance;
};

/**
 * Creates a managed pool for reusable resources.
 *
 * @param {object} configSpec - Configuration object for the resource pool.
 * @param {string} configSpec.name - Identifier for logging purposes.
 * @param {Function} configSpec.create - Function to create new resources.
 * @param {Function} configSpec.destroy - Function to clean up resources.
 * @param {Function} configSpec.validate - Function to check resource validity.
 * @param {number} configSpec.max - Maximum number of resources in the pool.
 * @param {number} configSpec.min - Minimum number of resources to maintain.
 * @param {number} configSpec.idleTimeoutMillis - Duration after which idle resources are destroyed.
 * @param {number} configSpec.reapIntervalMillis - Frequency of idle resource cleanup.
 * @param {boolean|Function} configSpec.log - Logging preference or custom logger function.
 * @param {number} configSpec.priorityRange - The range for resource request priorities.
 * @param {boolean} configSpec.refreshIdle - Whether idle resources should be periodically replaced.
 * @param {boolean} [configSpec.returnToFront=false] - If true, released resources are added to the front of the idle list.
 * @returns {object} An instance of the resource pool manager.
 */
exports.ResourceAllocator = function (configSpec) {
  const poolManager = {}; // The main pool object to be returned

  // Default values and configuration normalization
  const idleExpirationDuration = configSpec.idleTimeoutMillis || 30000;
  const cleanupFrequency = configSpec.reapIntervalMillis || 1000;
  const shouldRefreshIdle = ('refreshIdle' in configSpec) ? configSpec.refreshIdle : true;
  const putBackToFront = configSpec.returnToFront || false;

  let availableResources = [];               // List of idle resources
  let pendingRequests = new RankedQueue(configSpec.priorityRange || 1); // Queue for waiting clients
  let totalResourceCount = 0;                // Total number of resources (idle + in-use)
  let isIdleCleanupScheduled = false;        // Flag to prevent multiple cleanup schedules
  let idleCleanupTimerRef = null;            // Timer ID for scheduled idle cleanup
  let isPoolDraining = false;                // Flag indicating the pool is shutting down

  // Setup logging utility
  const loggerFunc = configSpec.log ?
    (message, level = 'info') => {
      if (typeof configSpec.log === 'function') {
        configSpec.log(message, level);
      } else {
        console.log(`${level.toUpperCase()} pool ${configSpec.name || 'UnnamedPool'} - ${message}`);
      }
    } :
    () => {}; // No-op logger

  // Ensure validation function is present
  configSpec.validate = configSpec.validate || (() => true);

  // Parse and validate max/min resource counts
  let maxResources = Number.parseInt(configSpec.max, 10);
  let minResources = Number.parseInt(configSpec.min, 10);

  maxResources = Number.isNaN(maxResources) ? 1 : Math.max(maxResources, 1);
  minResources = Number.isNaN(minResources) ? 0 : Math.min(minResources, maxResources - 1);

  // Update configSpec with normalized values
  configSpec.max = maxResources;
  configSpec.min = minResources;

  /**
   * Destroys a given resource and removes it from the pool's tracking.
   * This should be called within an obtainResource() block as an alternative to returnResource().
   * @param {object} resourceToDestroy - The resource object to be destroyed.
   */
  poolManager.releaseAndDestroy = function(resourceToDestroy) {
    totalResourceCount--;

    // Remove the resource from the available list if it's there
    const initialAvailableSize = availableResources.length;
    availableResources = availableResources.filter(resWrapper => resWrapper.resourceObject !== resourceToDestroy);
    if (availableResources.length === initialAvailableSize) {
      loggerFunc(`Resource ${resourceToDestroy} was not found in available list for destruction.`, 'warn');
    }

    configSpec.destroy(resourceToDestroy);
    loggerFunc(`Destroyed resource: ${resourceToDestroy}`, 'verbose');

    maintainMinimumResources();
  };

  /**
   * Checks and removes idle resources that have exceeded their timeout.
   */
  function performIdleResourceCleanup() {
    const resourcesToEliminate = [];
    const currentTime = Date.now();

    isIdleCleanupScheduled = false;

    // Iterate through idle resources to identify expired ones
    for (let i = 0; i < availableResources.length; i++) {
      const resourceWrapper = availableResources[i];
      if (currentTime >= resourceWrapper.expirationTime) {
        resourcesToEliminate.push(resourceWrapper.resourceObject);
        loggerFunc(`Idle resource expired. Destroying: ${resourceWrapper.resourceObject}`, 'verbose');
      } else if (!shouldRefreshIdle && (totalResourceCount - configSpec.min) <= resourcesToEliminate.length) {
        // If not refreshing idle, and we have enough to remove to reach min, stop.
        // This ensures we don't destroy resources if we're already at or below min,
        // unless refreshIdle is true, in which case all idle resources are fair game.
        break;
      }
    }

    // Remove identified resources
    resourcesToEliminate.forEach(res => poolManager.releaseAndDestroy(res));

    // Update availableResources to only include non-expired ones
    availableResources = availableResources.filter(resWrapper => !resourcesToEliminate.includes(resWrapper.resourceObject));

    if (availableResources.length > 0) {
      loggerFunc(`Remaining idle resources: ${availableResources.length}`, 'verbose');
      initiateIdleCleanupSchedule();
    } else {
      loggerFunc("No idle resources remaining after cleanup.", 'verbose');
    }
  }

  /**
   * Schedules the next idle resource cleanup if not already scheduled.
   */
  function initiateIdleCleanupSchedule() {
    if (!isIdleCleanupScheduled) {
      isIdleCleanupScheduled = true;
      idleCleanupTimerRef = setTimeout(performIdleResourceCleanup, cleanupFrequency);
    }
  }

  /**
   * Invokes a callback function, adapting to its expected argument count.
   * @param {Function} callbackFn - The callback function.
   * @param {Error|null} errorObj - An error object, if any.
   * @param {any} resultObj - The result object.
   */
  function invokeCallbackSafely(callbackFn, errorObj, resultObj) {
    if (typeof callbackFn !== 'function') return;
    if (callbackFn.length <= 1) {
      callbackFn(resultObj); // Single argument (result)
    } else {
      callbackFn(errorObj, resultObj); // Two arguments (error, result)
    }
  }

  /**
   * Attempts to fulfill pending resource requests by providing available
   * resources or provisioning new ones.
   */
  function processPendingRequests() {
    loggerFunc(`Processing requests. Pending: ${pendingRequests.getCurrentItemCount()}, Idle: ${availableResources.length}`, 'info');

    // While there are pending requests AND available resources
    while (pendingRequests.getCurrentItemCount() > 0 && availableResources.length > 0) {
      const resourceWrapper = availableResources.shift(); // Take from front (FIFO for idle resources)
      const resource = resourceWrapper.resourceObject;

      // Validate the resource before handing it out
      if (!configSpec.validate(resource)) {
        loggerFunc(`Resource ${resource} failed validation. Destroying.`, 'warn');
        poolManager.releaseAndDestroy(resource);
        continue; // Try next available resource
      }

      loggerFunc(`Reusing idle resource: ${resource}`, 'verbose');
      const clientCallback = pendingRequests.extractNextItem();
      invokeCallbackSafely(clientCallback, null, resource);
      return; // Fulfills one request, then re-evaluates
    }

    // If there are still pending requests and we haven't hit max capacity, create a new resource
    if (pendingRequests.getCurrentItemCount() > 0 && totalResourceCount < configSpec.max) {
      provisionNewResource();
    }
  }

  /**
   * Creates a new resource using the factory's create function.
   */
  function provisionNewResource() {
    totalResourceCount++;
    loggerFunc(`Provisioning new resource. Total: ${totalResourceCount}, Min: ${configSpec.min}, Max: ${configSpec.max}`, 'verbose');

    configSpec.create((...args) => {
      let creationError = null;
      let createdResource = null;

      // Handle common callback patterns (err, obj) or (obj) or (err)
      if (args.length > 1) {
        creationError = args[0];
        createdResource = args[1];
      } else if (args.length === 1) {
        if (args[0] instanceof Error) {
          creationError = args[0];
        } else {
          createdResource = args[0];
        }
      }

      const clientCallback = pendingRequests.extractNextItem();

      if (creationError) {
        totalResourceCount--; // Creation failed, decrement count
        loggerFunc(`Resource creation failed: ${creationError.message}`, 'error');
        if (clientCallback) {
          invokeCallbackSafely(clientCallback, creationError, createdResource);
        }
        // Attempt to fulfill other requests if possible
        setTimeout(processPendingRequests, 0); // Use setTimeout for non-blocking re-evaluation
      } else {
        loggerFunc(`Successfully created resource: ${createdResource}`, 'verbose');
        if (clientCallback) {
          invokeCallbackSafely(clientCallback, null, createdResource);
        } else {
          // No one was waiting, return it to the pool as idle
          poolManager.returnResource(createdResource);
        }
      }
    });
  }

  /**
   * Ensures that the minimum number of resources are available in the pool.
   * Provisions new resources if the total count falls below the minimum.
   */
  function maintainMinimumResources() {
    if (isPoolDraining) {
      loggerFunc("Pool is draining, skipping minimum resource maintenance.", 'verbose');
      return;
    }

    const resourcesNeeded = configSpec.min - totalResourceCount;
    if (resourcesNeeded > 0) {
      loggerFunc(`Maintaining minimum resources. Need ${resourcesNeeded} more.`, 'info');
      for (let i = 0; i < resourcesNeeded; i++) {
        provisionNewResource();
      }
    }
  }

  /**
   * Requests a resource from the pool. The provided callback will be invoked
   * with the resource once it becomes available.
   *
   * @param {Function} completionCallback - Callback function to receive the acquired resource.
   * @param {number} [requestRank=0] - Optional. Priority of this request (lower number = higher priority).
   * @returns {boolean} `true` if the request was accepted, `false` if the pool is draining.
   */
  poolManager.obtainResource = function (completionCallback, requestRank = 0) {
    if (isPoolDraining) {
      throw new Error("Resource pool is currently draining and cannot accept new requests.");
    }
    if (typeof completionCallback !== 'function') {
      loggerFunc("obtainResource called without a valid callback function.", 'error');
      throw new Error("A callback function is required to obtain a resource.");
    }

    pendingRequests.addWithRank(completionCallback, requestRank);
    processPendingRequests();
    return true; // Request is always accepted unless draining
  };

  /**
   * Deprecated: Use `obtainResource` instead.
   * @deprecated
   */
  poolManager.fetchResource = function (cb, rank) {
    loggerFunc("fetchResource() is deprecated. Please use obtainResource() instead.", 'warn');
    poolManager.obtainResource(cb, rank);
  };

  /**
   * Returns a resource to the pool, making it available for reuse.
   * @param {object} returnedResource - The resource object to be returned.
   */
  poolManager.returnResource = function (returnedResource) {
    if (returnedResource === null || returnedResource === undefined) {
      loggerFunc("Attempted to return a null/undefined resource to the pool.", 'warn');
      return;
    }
    // Check if resource is already in the available pool to prevent double-release
    const isAlreadyIdle = availableResources.some(resWrapper => resWrapper.resourceObject === returnedResource);
    if (isAlreadyIdle) {
      loggerFunc(`Resource ${returnedResource} was returned multiple times. Stack: ${new Error().stack}`, 'error');
      return;
    }

    const resourceWrapper = {
      resourceObject: returnedResource,
      expirationTime: Date.now() + idleExpirationDuration
    };

    if (putBackToFront) {
      availableResources.unshift(resourceWrapper); // Add to the beginning
    } else {
      availableResources.push(resourceWrapper);    // Add to the end
    }

    loggerFunc(`Resource ${returnedResource} returned to pool. Next expiration: ${resourceWrapper.expirationTime}`, 'verbose');
    processPendingRequests();
    initiateIdleCleanupSchedule();
  };

  /**
   * Deprecated: Use `returnResource` instead.
   * @deprecated
   */
  poolManager.restoreResource = function (res) {
    loggerFunc("restoreResource() is deprecated. Please use returnResource() instead.", 'warn');
    poolManager.returnResource(res);
  };

  /**
   * Initiates a graceful shutdown of the pool. No new requests will be accepted.
   * The callback is invoked once all outstanding requests are fulfilled and
   * all in-use resources are returned.
   * @param {Function} [completionCallback] - Callback when draining is complete.
   */
  poolManager.emptyPool = function(completionCallback) {
    loggerFunc("Initiating pool draining process.", 'info');

    isPoolDraining = true;
    clearTimeout(idleCleanupTimerRef); // Stop idle cleanup during draining
    isIdleCleanupScheduled = false;

    const checkDrainStatus = () => {
      if (pendingRequests.getCurrentItemCount() > 0) {
        loggerFunc(`Draining: Still ${pendingRequests.getCurrentItemCount()} pending requests. Waiting...`, 'verbose');
        setTimeout(checkDrainStatus, 100);
      } else if (availableResources.length !== totalResourceCount) {
        loggerFunc(`Draining: Still ${totalResourceCount - availableResources.length} resources in use. Waiting...`, 'verbose');
        setTimeout(checkDrainStatus, 100);
      } else {
        loggerFunc("Pool draining complete. All resources returned or fulfilled.", 'info');
        if (typeof completionCallback === 'function') {
          completionCallback();
        }
      }
    };
    checkDrainStatus();
  };

  /**
   * Forcibly destroys all currently managed resources, regardless of their state.
   * This should typically be called after `emptyPool()` if all resources must be
   * deallocated immediately.
   * @param {Function} [completionCallback] - Callback invoked after all resources are destroyed.
   */
  poolManager.forceDestroyAll = function(completionCallback) {
    loggerFunc("Forcibly destroying all resources in the pool.", 'info');

    // Clear any pending idle cleanup
    clearTimeout(idleCleanupTimerRef);
    isIdleCleanupScheduled = false;

    // Move all available resources to a temporary list for destruction
    const resourcesToDestroy = availableResources;
    availableResources = []; // Clear the main list

    // Destroy each resource
    let resourceWrapper;
    while ((resourceWrapper = resourcesToDestroy.shift()) !== undefined) {
      poolManager.releaseAndDestroy(resourceWrapper.resourceObject);
    }
    totalResourceCount = 0; // Reset count as all are destroyed

    loggerFunc("All resources forcibly destroyed.", 'info');
    if (typeof completionCallback === 'function') {
      completionCallback();
    }
  };

  /**
   * Wraps a given function, automatically obtaining a resource,
   * passing it as the first argument, and returning it upon completion.
   *
   * @param {Function} originalFunction - The function to be decorated. It should accept
   *   the resource as its first argument, and optionally a callback as its last.
   * @param {number} [invocationRank=0] - Optional priority rank for resource acquisition.
   * @returns {Function} A new function that handles resource pooling.
   */
  poolManager.wrapWithPooling = function(originalFunction, invocationRank = 0) {
    if (typeof originalFunction !== 'function') {
      throw new Error("Cannot wrap a non-function with pooling.");
    }

    return function(...callerArguments) {
      // Determine if the last argument is a callback
      const lastArg = callerArguments[callerArguments.length - 1];
      const hasCallerCallback = typeof lastArg === 'function';
      const callerCompletionCallback = hasCallerCallback ? lastArg : null;

      poolManager.obtainResource((acquireError, acquiredResource) => {
        if (acquireError) {
          loggerFunc(`Failed to acquire resource for wrapped function: ${acquireError.message}`, 'error');
          if (callerCompletionCallback) {
            callerCompletionCallback(acquireError);
          }
          return;
        }

        // Prepare arguments for the original function: [resource, ...originalArgs, completionCallback]
        const argsForOriginal = [acquiredResource];
        // Add original arguments, excluding the caller's callback if present
        argsForOriginal.push(...callerArguments.slice(0, hasCallerCallback ? -1 : undefined));

        // Create a wrapper callback to release the resource
        const resourceReleaseCallback = (...resultArgs) => {
          poolManager.returnResource(acquiredResource); // Always release the resource
          if (callerCompletionCallback) {
            callerCompletionCallback(...resultArgs); // Invoke the caller's original callback
          }
        };
        argsForOriginal.push(resourceReleaseCallback);

        // Execute the original function with the acquired resource
        try {
          originalFunction.apply(null, argsForOriginal);
        } catch (execError) {
          loggerFunc(`Error in wrapped function execution: ${execError.message}`, 'error');
          poolManager.returnResource(acquiredResource); // Ensure resource is released even on sync error
          if (callerCompletionCallback) {
            callerCompletionCallback(execError);
          } else {
            throw execError; // Re-throw if no caller callback to handle it
          }
        }
      }, invocationRank);
    };
  };

  poolManager.getCurrentlyActiveCount = () => totalResourceCount;
  poolManager.getPoolIdentifier = () => configSpec.name;
  poolManager.getIdleResourceCount = () => availableResources.length;
  poolManager.getPendingRequestCount = () => pendingRequests.getCurrentItemCount();
  poolManager.getMaximumResourceLimit = () => configSpec.max;

  // Initialize the pool by ensuring the minimum number of resources
  maintainMinimumResources();

  return poolManager;
};