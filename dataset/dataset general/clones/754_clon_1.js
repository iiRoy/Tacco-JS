var     PriorityQueue   =   function (  size  )   {
    // This defines a priority queue data structure.
    // It allows elements to be added with a specific priority.
    var   me    =   {  }  ,   slots  ,   i  ,   total   =   null  ;

    // The size determines the number of priority levels.
    // Ensure size is at least 1 and an integer.
    size  =   Math  .  max  (  +  size   |   0  ,   1  )  ;
    slots   =   [  ]  ;

    // Initialize the internal arrays, one for each priority slot.
    for   (  i   =   0  ;   i   <   size  ;   i   +=   1  )   {
        slots  .  push  (  [  ]  )  ;
    }

    /*
     * Public methods for the PriorityQueue instance.
     * These methods provide the core functionality of the queue.
     */
    me  .  size   =   function   (  )   {
        var   i  ;
        // If total count is not cached, calculate it.
        if   (  total   ===   null  )   {
            total   =   0  ;
            for   (  i   =   0  ;   i   <   size  ;   i   +=   1  )   {
                total   +=   slots  [  i  ]  .  length  ;
            }
        }
        return   total  ;
    }  ;

    me  .  enqueue   =   function   (  obj  ,   priority  )   {
        var   priorityOrig  ;

        // Convert priority to an integer. Default to 0 if not provided or invalid.
        priority   =   priority   &&   +   priority   |   0   ||   0  ;

        // Invalidate the cached total size as an item is being added.
        total   =   null  ;

        if   (  priority  )   {
            priorityOrig   =   priority  ;
            /*
             * If the provided priority is out of the valid range (0 to size-1),
             * adjust it to the highest possible priority (size-1) and log an error.
             */
            if   (  priority   <   0   ||   priority   >=   size  )   {
                priority   =   (  size   -   1  )  ;
                // Object is placed at the end of the queue's highest priority slot.
                console  .  error  (  "invalid priority: "   +   priorityOrig   +   " must be between 0 and "   +   priority  )  ;
            }
        }

        // Add the object to the appropriate priority slot.
        slots  [  priority  ]  .  push  (  obj  )  ;
    }  ;

    me  .  dequeue   =   function   (  callback  )   {
        var   obj   =   null  ,   i  ,   sl   =   slots  .  length  ;

        // Invalidate the cached total size as an item is being removed.
        total   =   null  ;

        // Iterate through priority slots from highest to lowest.
        for   (  i   =   0  ;   i   <   sl  ;   i   +=   1  )   {
            if   (  slots  [  i  ]  .  length  )   {
                // Remove and return the first object from the first non-empty slot.
                obj   =   slots  [  i  ]  .  shift  (  )  ;
                break  ; // Found an object, so stop searching.
            }
        }
        return   obj  ;
    }  ;

    return   me  ;
}  ;

/*
 * This module exports a Pool constructor.
 * It creates an object pool using a provided factory.
 *
 * @param { Object } factory - Configuration object for the pool.
 * @param { String } factory.name - Identifier for the factory, useful for logging.
 * @param { Function } factory.create - Function to create new items. It should accept a callback.
 * @param { Function } factory.destroy - Function to clean up and destroy items.
 * @param { Function } factory.validate - Optional. Checks if an item is still valid before use. Defaults to always true.
 * @param { Number } factory.max - Maximum number of items allowed in the pool. Defaults to 1.
 * @param { Number } factory.min - Minimum number of idle items to maintain in the pool. Defaults to 0.
 * @param { Number } factory.idleTimeoutMillis - Time in milliseconds after which an idle item is destroyed.
 * @param { Number } factory.reapIntervalMillis - Interval for checking and destroying idle items.
 * @param { Boolean|Function } factory.log - If true, enables console logging; if a function, it's used for logging.
 * @param { Number } factory.priorityRange - Defines the range of priorities for waiting clients. Default is 1.
 * @param { Boolean } factory.refreshIdle - If true, idle resources are destroyed and recreated periodically. Default: true.
 * @param { Boolean } [factory.returnToHead=false] - If true, released objects are added to the front of the available list.
 * @returns { Object } The newly created object pool instance.
 */
exports  .  Pool   =   function   (  factory  )   {

    var   me   =   {  }  ,
        idleTimeoutMillis   =   factory  .  idleTimeoutMillis   ||   30000  ,
        reapInterval   =   factory  .  reapIntervalMillis   ||   1000  ,
        refreshIdle   =   (  'refreshIdle'   in   factory  )   ?   factory  .  refreshIdle   :   true  ,
        availableObjects   =   [  ]  ,
        waitingClients   =   new   PriorityQueue  (  factory  .  priorityRange   ||   1  )  ,
        count   =   0  ,
        removeIdleScheduled   =   false  ,
        removeIdleTimer   =   null  ,
        draining   =   false  ,
        returnToHead   =   factory  .  returnToHead   ||   false  ,

        // Initialize the logging mechanism based on factory settings.
        log   =   factory  .  log   ?
            (  function   (  str  ,   level  )   {
                if   (  typeof   factory  .  log   ===   'function'  )   {
                    factory  .  log  (  str  ,   level  )  ;
                }
                else   {
                    console  .  log  (  level  .  toUpperCase  (  )   +   " pool "   +   factory  .  name   +   " - "   +   str  )  ;
                }
            }
            )   :
            function   (  )   {  }  ;

    // Ensure a validation function exists.
    factory  .  validate   =   factory  .  validate   ||   function   (  )   {   return   true  ;   }  ;

    // Parse max and min values as integers.
    factory  .  max   =   parseInt  (  factory  .  max  ,   10  )  ;
    factory  .  min   =   parseInt  (  factory  .  min  ,   10  )  ;

    // Validate max and min values, ensuring max is at least 1 and min is non-negative and less than max.
    factory  .  max   =   Math  .  max  (  isNaN  (  factory  .  max  )   ?   1   :   factory  .  max  ,   1  )  ;
    factory  .  min   =   Math  .  min  (  isNaN  (  factory  .  min  )   ?   0   :   factory  .  min  ,   factory  .  max   -   1  )  ;

    /*-----------------------------------------------------------------------------------------------------------------*/

    /**
     * Decrements the count of active items and removes the specified object
     * from the pool's internal tracking, then calls the factory's destroy method.
     * After destruction, it attempts to maintain the minimum pool size.
     *
     * @param { Object } obj - The item to be destroyed.
     */
    me  .  destroy   =   function   (  obj  )   {
        count   -=   1  ;
        // Filter out the object that is being destroyed from the available objects list.
        availableObjects   =   availableObjects  .  filter  (  function   (  objWithTimeout  )   {
            return   (  objWithTimeout  .  obj   !==   obj  )  ;
        }  )  ;
        factory  .  destroy  (  obj  )  ;

        // Ensure the pool still meets its minimum size requirements after destruction.
        ensureMinimum  (  )  ;
    }  ;

    /**
     * Periodically checks for and removes idle objects from the pool that have exceeded their `idleTimeoutMillis`.
     * This function is scheduled by `scheduleRemoveIdle()`.
     */
    function   removeIdle   (  )   {
        var   toRemove   =   [  ]  ,
            now   =   new   Date  (  )  .  getTime  (  )  ,
            i  ,
            al  ,   tr  ,
            timeout  ;

        removeIdleScheduled   =   false  ; // Reset flag as this execution starts.

        // Iterate through the currently available (idle) objects.
        // Collect objects that have timed out based on `idleTimeoutMillis`.
        for   (  i   =   0  ,   al   =   availableObjects  .  length  ;
                i   <   al   &&   (  refreshIdle   ||   (  count   -   factory  .  min   >   toRemove  .  length  )  )  ;
                i   +=   1  )   {
            timeout   =   availableObjects  [  i  ]  .  timeout  ;
            if   (  now   >=   timeout  )   {
                // This client has timed out, mark it for destruction.
                log  (  "removeIdle() destroying obj - now:"   +   now   +   " timeout:"   +   timeout  ,   'verbose'  )  ;
                toRemove  .  push  (  availableObjects  [  i  ]  .  obj  )  ;
            }
        }

        // Destroy all the identified timed-out objects.
        for   (  i   =   0  ,   tr   =   toRemove  .  length  ;   i   <   tr  ;   i   +=   1  )   {
            me  .  destroy  (  toRemove  [  i  ]  )  ;
        }

        // Update the length of available objects after destruction.
        al   =   availableObjects  .  length  ;

        if   (  al   >   0  )   {
            log  (  "availableObjects.length="   +   al  ,   'verbose'  )  ;
            scheduleRemoveIdle  (  )  ; // Reschedule for the next cleanup cycle if objects remain.
        }
        else   {
            log  (  "removeIdle() all objects removed"  ,   'verbose'  )  ;
        }
    }


    /**
     * Schedules the next run of `removeIdle` using `setTimeout`.
     * Ensures that only one idle removal timer is active at any given time.
     */
    function   scheduleRemoveIdle   (  )   {
        if   (  !   removeIdleScheduled  )   {
            removeIdleScheduled   =   true  ;
            // Set a timer to call removeIdle after `reapInterval` milliseconds.
            removeIdleTimer   =   setTimeout  (  removeIdle  ,   reapInterval  )  ;
        }
    }

    /**
     * Adapts a callback function to receive either a single argument (the object)
     * or two arguments (error, object), based on the callback's declared arity (`cb.length`).
     *
     * @param { Function } cb - The callback function to be invoked.
     * @param { Error|null } err - An error object, if any.
     * @param { Object|null } obj - The object to pass to the callback.
     */
    function   adjustCallback   (  cb  ,   err  ,   obj  )   {
        if   (  !   cb  )   {
            return  ;
        }
        if   (  cb  .  length   <=   1  )   {
            cb  (  obj  )  ; // Call with only the object if callback expects one argument.
        }
        else   {
            cb  (  err  ,   obj  )  ; // Call with both error and object.
        }
    }

    /**
     * Manages the distribution of resources from the pool to waiting clients.
     * It attempts to satisfy waiting clients by either reusing an available object
     * or creating a new one if capacity allows.
     */
    function   dispense   (  )   {
        var   obj   =   null  ,
            objWithTimeout   =   null  ,
            err   =   null  ,
            clientCb   =   null  ,
            waitingCount   =   waitingClients  .  size  (  )  ;

        log  (  "dispense() clients="   +   waitingCount   +   " available="   +   availableObjects  .  length  ,   'info'  )  ;

        if   (  waitingCount   >   0  )   {
            // First, try to fulfill requests from available (idle) objects.
            while   (  availableObjects  .  length   >   0  )   {
                log  (  "dispense() - reusing obj"  ,   'verbose'  )  ;
                objWithTimeout   =   availableObjects  [  0  ]  ;

                // Validate the object before reusing it. If invalid, destroy and continue.
                if   (  !   factory  .  validate  (  objWithTimeout  .  obj  )  )   {
                    me  .  destroy  (  objWithTimeout  .  obj  )  ;
                    continue  ;
                }
                availableObjects  .  shift  (  )  ; // Remove from available pool.
                clientCb   =   waitingClients  .  dequeue  (  )  ; // Get the next waiting client's callback.
                return   clientCb  (  err  ,   objWithTimeout  .  obj  )  ; // Fulfill the request.
            }

            // If no available objects and capacity allows, create a new resource.
            if   (  count   <   factory  .  max  )   {
                createResource  (  )  ;
            }
        }
    }

    /**
     * Initiates the creation of a new resource using the factory.
     * Increments the active count and handles the callback from the factory.
     */
    function   createResource   (  )   {
        count   +=   1  ; // Increment the count of managed resources.
        log  (  "createResource() - creating obj - count="   +   count   +   " min="   +   factory  .  min   +   " max="   +   factory  .  max  ,   'verbose'  )  ;

        factory  .  create  (  function   (  )   {
            var   err  ,   obj  ;
            var   clientCb   =   waitingClients  .  dequeue  (  )  ; // See if there's a client waiting for this new resource.

            // Handle factory.create's callback arguments (either (err, obj) or (obj) or (err)).
            if   (  arguments  .  length   >   1  )   {
                err   =   arguments  [  0  ]  ;
                obj   =   arguments  [  1  ]  ;
            }
            else   {
                err   =   (  arguments  [  0  ]   instanceof   Error  )   ?   arguments  [  0  ]   :   null  ;
                obj   =   (  arguments  [  0  ]   instanceof   Error  )   ?   null   :   arguments  [  0  ]  ;
            }

            if   (  err  )   {
                count   -=   1  ; // If creation failed, decrement count.
                if   (  clientCb  )   {
                    clientCb  (  err  ,   obj  )  ; // Notify the waiting client of the error.
                }
                // Attempt to dispense again in the next tick, in case other clients are waiting.
                process  .  nextTick  (  function   (  )   {
                    dispense  (  )  ;
                }  )  ;
            }
            else   {
                if   (  clientCb  )   {
                    clientCb  (  err  ,   obj  )  ; // Fulfill the waiting client's request with the new object.
                }
                else   {
                    me  .  release  (  obj  )  ; // If no one was waiting, release it back to the pool.
                }
            }
        }  )  ;
    }

    /**
     * Ensures that the pool maintains at least `factory.min` number of resources.
     * If the current count falls below this minimum, new resources are created.
     */
    function   ensureMinimum   (  )   {
        var   i  ,   diff  ;
        // Only create new resources if the pool is not draining and below the minimum.
        if   (  !   draining   &&   (  count   <   factory  .  min  )  )   {
            diff   =   factory  .  min   -   count  ;
            for   (  i   =   0  ;   i   <   diff  ;   i  ++  )   {
                createResource  (  )  ; // Create resources until minimum is met.
            }
        }
    }

    /**
     * Requests an item from the pool.
     * The provided callback will be invoked with the acquired item once it becomes available.
     *
     * @param { Function } callback - Function to call with the acquired item. It can accept (err, obj) or (obj).
     * @param { Number } [priority] - Optional. An integer priority (0 is highest). Used if no items are immediately available.
     * @returns { Boolean } Returns `true` if the pool has capacity to create more items, `false` otherwise.
     * @throws { Error } If the pool is draining, an error is thrown.
     */
    me  .  acquire   =   function   (  callback  ,   priority  )   {
        if   (  draining  )   {
            throw   new   Error  (  "pool is draining and cannot accept work"  )  ;
        }
        waitingClients  .  enqueue  (  callback  ,   priority  )  ; // Add the client to the waiting queue.
        dispense  (  )  ; // Attempt to fulfill the request immediately.
        return   (  count   <   factory  .  max  )  ; // Indicate if more resources can be created.
    }  ;

    /**
     * Deprecated: Use `acquire()` instead.
     * This function simply proxies to `me.acquire`.
     *
     * @param { Function } callback - Callback function.
     * @param { Number } priority - Priority for the request.
     */
    me  .  borrow   =   function   (  callback  ,   priority  )   {
        log  (  "borrow() is deprecated. use acquire() instead"  ,   'warn'  )  ;
        me  .  acquire  (  callback  ,   priority  )  ;
    }  ;

    /**
     * Returns an acquired item back to the pool, making it available for other requests.
     * The item is marked with a timeout for potential future idle destruction.
     *
     * @param { Object } obj - The object to be returned to the pool.
     */
    me  .  release   =   function   (  obj  )   {
        // Check if the object is already in the available pool to prevent double-release issues.
        if   (  availableObjects  .  some  (  function   (  objWithTimeout  )   {   return   (  objWithTimeout  .  obj   ===   obj  )  ;   }  )  )   {
            log  (  "release called twice for the same resource: "   +   (  new   Error  (  )  .  stack  )  ,   'error'  )  ;
            return  ;
        }

        // Create an object wrapper with a timeout for idle tracking.
        var   objWithTimeout   =   {   obj  :   obj  ,   timeout  :   (  new   Date  (  )  .  getTime  (  )   +   idleTimeoutMillis  )   }  ;

        if   (  returnToHead  )   {
            // If configured, add the object to the beginning of the available list (LIFO).
            availableObjects  .  splice  (  0  ,   0  ,   objWithTimeout  )  ;
        }
        else   {
            // Otherwise, add to the end (FIFO).
            availableObjects  .  push  (  objWithTimeout  )  ;
        }

        log  (  "timeout: "   +   objWithTimeout  .  timeout  ,   'verbose'  )  ;
        dispense  (  )  ; // Attempt to fulfill waiting requests with the newly released object.
        scheduleRemoveIdle  (  )  ; // Ensure idle cleanup is scheduled.
    }  ;

    /**
     * Deprecated: Use `release()` instead.
     * This function simply proxies to `me.release`.
     *
     * @param { Object } obj - The object to return.
     */
    me  .  returnToPool   =   function   (  obj  )   {
        log  (  "returnToPool() is deprecated. use release() instead"  ,   'warn'  )  ;
        me  .  release  (  obj  )  ;
    }  ;

    /**
     * Initiates a graceful shutdown of the pool.
     * New `acquire` requests will be rejected.
     * The pool will wait until all pending requests are fulfilled and all
     * acquired items are released back to the pool before invoking the callback.
     *
     * @param { Function } [callback] - Optional. Function to call once draining is complete.
     */
    me  .  drain   =   function   (  callback  )   {
        log  (  "draining"  ,   'info'  )  ;

        // Set the draining flag to prevent new acquire requests.
        draining   =   true  ;

        var   check   =   function   (  )   {
            if   (  waitingClients  .  size  (  )   >   0  )   {
                // Still waiting for client requests to be satisfied.
                setTimeout  (  check  ,   100  )  ;
            }
            else   if   (  availableObjects  .  length   !=   count  )   {
                // Still waiting for all acquired objects to be released.
                setTimeout  (  check  ,   100  )  ;
            }
            else   {
                // All requests handled and objects released.
                if   (  callback  )   {
                    callback  (  )  ;
                }
            }
        }  ;
        check  (  )  ; // Start the polling check.
    }  ;

    /**
     * Forcibly destroys all currently managed items in the pool,
     * regardless of their idle timeout status. This is often used
     * in conjunction with `drain`. Note that if `factory.min` is greater
     * than zero, new items will be created immediately to meet that minimum.
     * To prevent this, set `factory.min` to 0 before calling this method.
     *
     * @param { Function } [callback] - Optional. Function to call once all items are destroyed.
     */
    me  .  destroyAllNow   =   function   (  callback  )   {
        log  (  "force destroying all objects"  ,   'info'  )  ;

        var   willDie   =   availableObjects  ; // Take a snapshot of current available objects.
        availableObjects   =   [  ]  ; // Clear the available objects list.

        var   obj   =   willDie  .  shift  (  )  ;
        while   (  obj   !==   null   &&   obj   !==   undefined  )   {
            me  .  destroy  (  obj  .  obj  )  ; // Destroy each object.
            obj   =   willDie  .  shift  (  )  ;
        }

        removeIdleScheduled   =   false  ; // Cancel any pending idle removal schedules.
        clearTimeout  (  removeIdleTimer  )  ;

        if   (  callback  )   {
            callback  (  )  ;
        }
    }  ;

    /**
     * Creates a decorated version of a function that automatically acquires an item from the pool,
     * passes it as the first argument to the original function, and then releases it back to the pool
     * after the original function's (optional) callback is invoked.
     *
     * @param { Function } decorated - The original function to be decorated. It should accept the acquired item as its first argument.
     * @param { Number } [priority] - Optional. Priority for acquiring the item from the pool.
     * @returns { Function } A new function that wraps the original `decorated` function with pool logic.
     */
    me  .  pooled   =   function   (  decorated  ,   priority  )   {
        return   function   (  )   {
            var   callerArgs   =   arguments  ;
            var   callerCallback   =   callerArgs  [  callerArgs  .  length   -   1  ]  ;
            var   callerHasCallback   =   typeof   callerCallback   ===   'function'  ;

            me  .  acquire  (  function   (  err  ,   client  )   {
                if   (  err  )   {
                    if   (  callerHasCallback  )   {
                        callerCallback  (  err  )  ;
                    }
                    return  ;
                }

                // Prepare arguments for the decorated function: [client, ...originalArgs, releaseCallback]
                var   args   =   [  client  ]  .  concat  (  Array  .  prototype  .  slice  .  call  (  callerArgs  ,   0  ,   callerHasCallback   ?   -1   :   undefined  )  )  ;
                args  .  push  (  function   (  )   {
                    me  .  release  (  client  )  ; // Release the client back to the pool.
                    if   (  callerHasCallback  )   {
                        callerCallback  .  apply  (  null  ,   arguments  )  ; // Invoke the original caller's callback.
                    }
                }  )  ;

                decorated  .  apply  (  null  ,   args  )  ; // Call the decorated function with the acquired client.
            }  ,   priority  )  ;
        }  ;
    }  ;

    /**
     * Returns the current total number of items managed by the pool (in-use + available).
     * @returns { Number } The current pool size.
     */
    me  .  getPoolSize   =   function   (  )   {
        return   count  ;
    }  ;

    /**
     * Returns the name of the factory associated with this pool.
     * @returns { String } The factory name.
     */
    me  .  getName   =   function   (  )   {
        return   factory  .  name  ;
    }  ;

    /**
     * Returns the number of currently available (idle) items in the pool.
     * @returns { Number } Count of available objects.
     */
    me  .  availableObjectsCount   =   function   (  )   {
        return   availableObjects  .  length  ;
    }  ;

    /**
     * Returns the number of clients currently waiting for an item from the pool.
     * @returns { Number } Count of waiting clients.
     */
    me  .  waitingClientsCount   =   function   (  )   {
        return   waitingClients  .  size  (  )  ;
    }  ;

    /**
     * Returns the maximum number of items this pool can manage.
     * @returns { Number } The maximum pool size.
     */
    me  .  getMaxPoolSize   =   function   (  )   {
        return   factory  .  max  ;
    }

    // Initialize the pool by creating resources up to the `factory.min` value.
    ensureMinimum  (  )  ;

    return   me  ; // Return the configured pool instance.
}  ;