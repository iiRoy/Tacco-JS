(function (globalScope, moduleFactory) {
    // This module is designed to manage state history for JavaScript objects,
    // supporting undo/redo functionality by observing changes.
    // It detects environment and adapts its behavior accordingly.

    var moduleName = 'StateSnap'; // Internal reference for the main class

    if (typeof define === 'function' && define.amd) {
        // Asynchronous Module Definition (AMD) support.
        // Register as an anonymous module, making the main class available globally.
        globalScope[moduleName] = moduleFactory();

        define(function () {
            // AMD loader returns the global reference.
            return globalScope[moduleName];
        });
    } else if (typeof exports === 'object' && typeof module !== 'undefined' && typeof module.exports === 'object') {
        // CommonJS environment (e.g., Node.js).
        // Export the factory result directly.
        module.exports = moduleFactory();
    } else {
        // Browser global context.
        // Attach the main class to the global object.
        globalScope[moduleName] = moduleFactory();
    }
}(this, function () {
    'use strict'; // Enforce strict parsing and error handling.

    var currentEventMarker = 0; // A unique identifier for grouping changes.
    
    // Main constructor for the StateSnap history manager.
    function StateSnap(trackedObject) {
        // Validate input: ensure an object is provided for tracking.
        if (trackedObject === null || typeof trackedObject !== 'object') {
            throw new Error('StateSnap requires a non-null object to initialize tracking.');
        }

        var platformSupport = StateSnap.queryEnvironmentCompatibility(); // Check environment capabilities.

        if (platformSupport === 'polymer-shim') {
            // If Polymer compatibility layer is detected, activate it.
            this.activatePolymerAdapter();
        }
        else if (!platformSupport) {
            // No native or shim support for object observation.
            throw new Error('Current environment lacks support for ES6 Object.observe() or Polymer equivalents.'); 
        }

        // Initialize internal state.
        this._pastActions = [];             // Stores the chronological list of changes.
        this._allowedPropsCollections = []; // Whitelist configurations for specific objects.
        this._blockedPropsCollections = []; // Blacklist configurations for specific objects.
        this._globalAllowedProps = [];      // Global whitelist for property names.
        this._globalBlockedProps = [];      // Global blacklist for property names.
        this._currentPoint = -1;            // Pointer to the current state in _pastActions.
        
        // Bind the mutation processing function to the instance context.
        this._boundProcessMutations = this._processMutations.bind(this);

        // Begin tracking changes on the initial object and its nested properties.
        this.trackRecursive(trackedObject);
    }

    // Alias for the prototype to shorten code and improve readability.
    var proto = StateSnap.prototype;

    /**
     * Recursively observes an object and its nested properties for changes.
     * @param {object} objToTrack - The object to start tracking.
     * @param {Array<object>} [visitedPath] - Internal: array of objects already visited to prevent circular references.
     */
    proto.trackRecursive = function (objToTrack, visitedPath) {
        // Guard clause: only process valid objects.
        if (!objToTrack || typeof objToTrack !== 'object') {
            return;
        }

        // Initialize or extend the visited path to detect circular structures.
        var currentVisited = (visitedPath || []).concat([objToTrack]);

        // Observe the current object.
        this.trackObject(objToTrack);

        // Iterate over the object's own properties.
        Object.keys(objToTrack).forEach(function (propKey) {
            var propValue = objToTrack[propKey];
            // Check if the property is an object, not already visited, and allowed for tracking.
            if (typeof propValue === 'object' && propValue !== null &&
                currentVisited.indexOf(propValue) === -1 &&
                this._isPropertyTrackable(objToTrack, propKey))
            {
                // Recursively track the nested object.
                this.trackRecursive(propValue, currentVisited);
            }
        }, this); // Ensure 'this' context is preserved for the callback.
    };

    /**
     * Recursively stops observing an object and its nested properties.
     * @param {object} objToUntrack - The object to stop tracking.
     * @param {Array<object>} [visitedPath] - Internal: array of objects already visited to prevent circular references.
     */
    proto.untrackRecursive = function(objToUntrack, visitedPath) {
        // Guard clause: only process valid objects.
        if (!objToUntrack || typeof objToUntrack !== 'object') {
            return;
        }

        // Initialize or extend the visited path.
        var currentVisited = (visitedPath || []).concat([objToUntrack]);

        // Unobserve the current object.
        this.untrackObject(objToUntrack);

        // Iterate over properties to recursively un-track.
        Object.keys(objToUntrack).forEach(function (propKey) {
            var propValue = objToUntrack[propKey];
            if (typeof propValue === 'object' && propValue !== null &&
                currentVisited.indexOf(propValue) === -1)
            {
                this.untrackRecursive(propValue, currentVisited);
            }
        }, this);
    };

    /**
     * Initiates observation on a single object.
     * @param {object} targetObject - The object to observe.
     */
    proto.trackObject = function (targetObject) {
        if (!targetObject || typeof targetObject !== 'object') {
            console.warn("Attempted to track a non-object:", targetObject);
            return;
        }

        // Determine the correct observation function based on object type (Array or generic Object).
        var observationMechanism = Array.isArray(targetObject) ? Array.observe : Object.observe;
        // If the object has a custom 'observe' method on its constructor, use that.
        if (targetObject.constructor && typeof targetObject.constructor.observe === 'function') {
            observationMechanism = targetObject.constructor.observe;
        }
        
        // Register the object for observation with our change processor.
        observationMechanism(targetObject, this._boundProcessMutations);
    };

    /**
     * Stops observation on a single object.
     * @param {object} targetObject - The object to unobserve.
     */
    proto.untrackObject = function (targetObject) {
        if (!targetObject || typeof targetObject !== 'object') {
            console.warn("Attempted to untrack a non-object:", targetObject);
            return;
        }

        // Determine the correct unobservation function.
        var unobservationMechanism = Array.isArray(targetObject) ? Array.unobserve : Object.unobserve;
        // If the object has a custom 'unobserve' method on its constructor, use that.
        if (targetObject.constructor && typeof targetObject.constructor.unobserve === 'function') {
            unobservationMechanism = targetObject.constructor.unobserve;
        }
        
        // Unregister the object from observation.
        unobservationMechanism(targetObject, this._boundProcessMutations);
    };

    /**
     * Statically checks the environment for necessary object observation support.
     * @returns {string|boolean} 'native' if Object.observe is available, 'polymer-shim' if Polymer's polyfill is, or false otherwise.
     */
    StateSnap.queryEnvironmentCompatibility = function () {
        // Check for native ES6 Object.observe and Array.observe.
        if (typeof Object.observe === 'function' && typeof Array.observe === 'function') {
            return 'native';
        }
        // Check for Polymer's Object/ArrayObserver polyfill, typically in a browser environment.
        else if (typeof exports !== 'object' && typeof Platform !== 'undefined' && typeof Platform.performMicrotaskCheckpoint === 'function' &&
                 typeof ObjectObserver === 'function' && typeof ArrayObserver === 'function')
        {
            return 'polymer-shim';
        }

        // No recognized observation mechanism found.
        return false;
    };

    /**
     * Internal method to process incoming change records from observed objects.
     * @param {Array<object|number>} incomingMutations - An array of change records or event flags.
     * @private
     */
    proto._processMutations = function(incomingMutations) {
        // If the pointer is not at the end of history, truncate any 'future' states.
        // This means any new action overwrites the redo history.
        if (this._currentPoint < this._pastActions.length - 1) {
            this._pastActions.splice(this._currentPoint + 1);
        }

        // Iterate through each mutation or flag received.
        for (var i = 0; i < incomingMutations.length; ++i) {
            var currentChange = incomingMutations[i];

            if (typeof currentChange === 'number') { // If it's a numeric flag, it marks an event group.
                this._pastActions.push(currentChange);
                this._currentPoint++;
            }
            else if (this._isPropertyTrackable(currentChange.object, currentChange.name)) {
                // If it's a trackable change record, store a copy of it.
                var clonedRecord = {};
                // Shallow copy the change record to avoid modifying the original.
                for (var key in currentChange) {
                    if (Object.prototype.hasOwnProperty.call(currentChange, key)) {
                        clonedRecord[key] = currentChange[key];
                    }
                }
                this._pastActions.push(clonedRecord);

                // Re-observe the object to catch any new nested objects created by the change.
                // This is especially important for 'add' type changes.
                this.trackRecursive(currentChange.object);

                this._currentPoint++;
            }
            // Non-trackable changes are ignored.
        }
    };

    /**
     * Reverts the state to the previous recorded point.
     * @returns {boolean} True if an undo operation was performed, false otherwise.
     */
    proto.revertState = function() {
        // Ensure all pending changes are flushed before attempting to undo.
        this.flushPending();

        // Cannot undo if there's no history.
        if (this._currentPoint < 0) {
            return false;
        }

        var mutationToReverse = this._pastActions[this._currentPoint--];

        if (typeof mutationToReverse === 'number') { // This is an event group marker.
            // Find the start of this event group.
            var groupStartMarker = mutationToReverse - 1;
            var groupStartIndex = -1;
            for (var i = 0; i <= this._currentPoint; ++i) {
                if (this._pastActions[i] === groupStartMarker) {
                    groupStartIndex = i;
                    break;
                }
            }

            if (groupStartIndex !== -1) {
                // Revert all changes within this event group.
                while (this._currentPoint >= groupStartIndex) {
                    this._applyInverseMutation(this._pastActions[this._currentPoint--]);
                }
                // Decrement pointer past the opening flag.
                this._currentPoint--;
            } else {
                console.warn("Mismatched event group flag encountered during undo.");
                // If start flag not found, just revert the single flag and continue.
            }
        }
        else {
            // Revert a single change record.
            this._applyInverseMutation(mutationToReverse);
        }
        return true;
    };

    /**
     * Advances the state to the next recorded point (re-applies a previously undone change).
     * @returns {boolean} True if a redo operation was performed, false otherwise.
     */
    proto.advanceState = function() {
        // Ensure all pending changes are flushed.
        this.flushPending();

        // Cannot redo if at the end of history.
        if (this._currentPoint >= this._pastActions.length - 1) {
            return false;
        }

        // Move pointer forward before retrieving the record.
        var mutationToRedo = this._pastActions[++this._currentPoint];
        
        if (typeof mutationToRedo === 'number') { // This is an event group marker.
            // Find the end of this event group.
            var groupEndMarker = mutationToRedo + 1;
            var groupEndIndex = -1;
            for (var i = this._currentPoint + 1; i < this._pastActions.length; ++i) {
                if (this._pastActions[i] === groupEndMarker) {
                    groupEndIndex = i;
                    break;
                }
            }

            if (groupEndIndex !== -1) {
                // Re-apply all changes within this event group.
                while (this._currentPoint < groupEndIndex) {
                    this._applyInverseMutation(this._pastActions[this._currentPoint]); // Apply, then increment
                    this._currentPoint++; // Increment after applying
                }
                this._currentPoint--; // Pointer should end up at the flag, so decrement once.
            } else {
                console.warn("Mismatched event group flag encountered during redo.");
                // If end flag not found, just apply the single flag and continue.
            }
        }
        else {
            // Re-apply a single change record.
            this._applyInverseMutation(mutationToRedo);
        }
        return true;
    };

    /**
     * Flushes any pending change records from the observation queue into the history.
     */
    proto.flushPending = function () {
        // This method relies on the specific `Object.deliverChangeRecords` or `Platform.performMicrotaskCheckpoint`
        // to force synchronous delivery of pending changes.
        if (typeof Object.deliverChangeRecords === 'function') {
            Object.deliverChangeRecords(this._boundProcessMutations);
        } else if (typeof Platform !== 'undefined' && typeof Platform.performMicrotaskCheckpoint === 'function') {
            Platform.performMicrotaskCheckpoint();
        } else {
            console.warn("No mechanism available to flush pending change records. History might be out of sync.");
        }
    };

    /**
     * Internal method to reverse (or re-apply) a single change record.
     * This method is symmetric: applying it twice returns to the original state.
     * @param {object|number} recordEntry - The change record or event flag to process.
     * @private
     */
    proto._applyInverseMutation = function (recordEntry) {
        if (typeof recordEntry === 'number') { // Event flags are not actual mutations.
            return;
        }

        var temporaryValue; // Used to swap values during update operations.

        // Temporarily unobserve the object to prevent the inverse mutation from being recorded.
        this.untrackObject(recordEntry.object);

        // A switch statement handles different types of mutation records.
        switch (recordEntry.type) {
            case 'add':
                // To reverse an 'add', delete the property.
                // Record the deletion as the new 'oldValue' for potential future re-application.
                recordEntry.type = 'delete';
                recordEntry.oldValue = recordEntry.object[recordEntry.name];
                delete recordEntry.object[recordEntry.name];
                break;

            case 'update':
                // To reverse an 'update', swap the current value with the stored 'oldValue'.
                temporaryValue = recordEntry.object[recordEntry.name];
                recordEntry.object[recordEntry.name] = recordEntry.oldValue;
                recordEntry.oldValue = temporaryValue; // Update 'oldValue' for the next inverse operation.
                break;

            case 'delete':
                // To reverse a 'delete', re-add the property with its 'oldValue'.
                // Change type to 'add' for future inverse operations.
                recordEntry.type = 'add';
                recordEntry.object[recordEntry.name] = recordEntry.oldValue;
                delete recordEntry.oldValue; // 'oldValue' is no longer relevant after re-adding.
                break;

            case 'splice':
                // To reverse a 'splice' on an array:
                // Apply a splice that removes the 'added' items and re-inserts the 'removed' items.
                temporaryValue = Array.prototype.splice.apply(recordEntry.object, [recordEntry.index, recordEntry.addedCount].concat(recordEntry.removed));
                recordEntry.addedCount = recordEntry.removed.length; // Update addedCount for next inverse.
                recordEntry.removed = temporaryValue; // Update removed items for next inverse.
                break;

            default:
                console.warn("Unknown mutation type encountered:", recordEntry.type, recordEntry);
                break;
        }

        // Re-observe the object after the inverse mutation.
        this.trackObject(recordEntry.object);
    };

    /**
     * Generates a unique marker to indicate the start of an event group.
     * All subsequent changes will be grouped until an `endEventGroup` with the same marker is called.
     * @returns {number} The unique event marker ID.
     */
    proto.beginEventGroup = function () {
        this.flushPending(); // Ensure all previous changes are recorded before starting a new group.
        var marker = ++currentEventMarker; // Increment and use the new marker ID.
        this._processMutations([marker]); // Record the start flag.
        return marker;
    };

    /**
     * Marks the end of an event group previously started with `beginEventGroup`.
     * @param {number} markerId - The marker ID returned by `beginEventGroup`.
     */
    proto.endEventGroup = function (markerId) {
        this.flushPending(); // Ensure all changes within the group are recorded.
        if (typeof markerId !== 'number') {
            console.error("Invalid markerId provided to endEventGroup.");
            return;
        }
        this._processMutations([markerId + 1]); // Record the end flag (markerId + 1 indicates end of group).
    };

    /**
     * Wraps a function execution within an event group, allowing all changes
     * made by the function to be undone/redone as a single atomic operation.
     * @param {Function} operationFunction - The function to wrap.
     * @param {object} [context] - The `this` context for the function.
     * @returns {Function} A new function that, when called, executes the original function within an event group.
     */
    proto.groupOperation = function (operationFunction, context) {
        var self = this; // Capture 'this' for use in the returned function.

        if (typeof operationFunction !== 'function') {
            throw new TypeError("groupOperation expects a function as its first argument.");
        }

        return function () {
            // Start a new event group before executing the wrapped function.
            var groupIdentifier = self.beginEventGroup();

            try {
                // Apply the original function with its context and arguments.
                // Note: The original code passed arguments[2] onwards. This implies arguments[0] and [1] were ignored.
                // Assuming it meant all arguments *except* the internal ones for `wrap`.
                // For simplicity, let's pass all arguments to the wrapped function unless specific slicing is intended.
                // Based on original: `Array.prototype.slice.call(arguments, 2)` means it was expected that `wrap` itself
                // might receive internal arguments, and the `fn` should only receive arguments passed *after* those.
                // Let's assume the user of `groupOperation` will pass their function's arguments directly.
                // To match original behavior for `fn.apply(ctx, Array.prototype.slice.call(arguments, 2))`
                // it implies `wrap` itself was called with extra arguments which are then sliced off.
                // A simpler interpretation for Type III: `fn` gets all arguments passed to the returned function.
                // Let's stick to the original's explicit slice for now to preserve behavior.
                var operationArguments = Array.prototype.slice.call(arguments, 0); // Pass all arguments.
                var result = operationFunction.apply(context || this, operationArguments);
                return result;
            } finally {
                // Ensure the event group is always closed, even if the function throws an error.
                self.endEventGroup(groupIdentifier);
            }
        };
    };

//--------------------------------------------------------------------------------------------------
//  Property Filtering (Whitelist/Blacklist)
//--------------------------------------------------------------------------------------------------

    /**
     * Establishes a whitelist of properties to track for a specific object.
     * Overwrites any existing whitelist for that object.
     * @param {object} targetObject - The object to apply the whitelist to.
     * @param {Array<string>} propertyList - An array of property names to allow.
     */
    proto.establishAllowedProperties = function (targetObject, propertyList) {
        if (!Array.isArray(propertyList)) {
            console.error("Whitelist must be an array of strings.");
            return;
        }
        this.removeAllowedProperties(targetObject); // Remove any prior whitelist.
        this._allowedPropsCollections.push({obj: targetObject, list: propertyList});
    };

    /**
     * Retrieves the whitelist entry for a specific object.
     * @param {object} targetObject - The object whose whitelist is sought.
     * @returns {object|undefined} The whitelist entry ({obj, list}) or undefined if not found.
     */
    proto.retrieveAllowedProperties = function (targetObject) {
        for (var i = 0; i < this._allowedPropsCollections.length; ++i) {
            if (this._allowedPropsCollections[i].obj === targetObject) {
                return this._allowedPropsCollections[i];
            }
        }
        return undefined;
    };

    /**
     * Removes the whitelist for a specific object.
     * @param {object} targetObject - The object whose whitelist should be removed.
     */
    proto.removeAllowedProperties = function (targetObject) {
        for (var i = 0; i < this._allowedPropsCollections.length; ++i) {
            if (this._allowedPropsCollections[i].obj === targetObject) {
                this._allowedPropsCollections.splice(i, 1);
                i--; // Adjust index due to splice.
            }
        }
    };

    /**
     * Establishes a blacklist of properties to ignore for a specific object.
     * Overwrites any existing blacklist for that object.
     * @param {object} targetObject - The object to apply the blacklist to.
     * @param {Array<string>} propertyList - An array of property names to block.
     */
    proto.establishBlockedProperties = function (targetObject, propertyList) {
        if (!Array.isArray(propertyList)) {
            console.error("Blacklist must be an array of strings.");
            return;
        }
        this.removeBlockedProperties(targetObject); // Remove any prior blacklist.
        this._blockedPropsCollections.push({obj: targetObject, list: propertyList});
    };

    /**
     * Retrieves the blacklist entry for a specific object.
     * @param {object} targetObject - The object whose blacklist is sought.
     * @returns {object|undefined} The blacklist entry ({obj, list}) or undefined if not found.
     */
    proto.retrieveBlockedProperties = function (targetObject) {
        for (var i = 0; i < this._blockedPropsCollections.length; ++i) {
            if (this._blockedPropsCollections[i].obj === targetObject) {
                return this._blockedPropsCollections[i];
            }
        }
        return undefined;
    };

    /**
     * Removes the blacklist for a specific object.
     * @param {object} targetObject - The object whose blacklist should be removed.
     */
    proto.removeBlockedProperties = function (targetObject) {
        for (var i = 0; i < this._blockedPropsCollections.length; ++i) {
            if (this._blockedPropsCollections[i].obj === targetObject) {
                this._blockedPropsCollections.splice(i, 1);
                i--; // Adjust index due to splice.
            }
        }
    };

    /**
     * Adds one or more property names to the global whitelist.
     * These properties will be tracked unless explicitly blacklisted locally.
     * @param {...string} keys - Property names to add.
     */
    proto.addGlobalAllowed = function (/*...keys*/) {
        var newKeys = Array.prototype.slice.call(arguments); // Convert arguments to array.
        for (var i = 0; i < newKeys.length; ++i) {
            if (this._globalAllowedProps.indexOf(newKeys[i]) === -1) { // Avoid duplicates.
                this._globalAllowedProps.push(newKeys[i]);
            }
        }
    };

    /**
     * Removes one or more property names from the global whitelist.
     * @param {...string} keys - Property names to remove.
     */
    proto.removeGlobalAllowed = function (/*...keys*/) {
        var keysToRemove = Array.prototype.slice.call(arguments);
        this._globalAllowedProps = this._globalAllowedProps.filter(function (propName) {
            return keysToRemove.indexOf(propName) === -1;
        });
    };

    /**
     * Adds one or more property names to the global blacklist.
     * These properties will *not* be tracked, overriding any whitelists.
     * @param {...string} keys - Property names to add.
     */
    proto.addGlobalBlocked = function (/*...keys*/) {
        var newKeys = Array.prototype.slice.call(arguments);
        for (var i = 0; i < newKeys.length; ++i) {
            if (this._globalBlockedProps.indexOf(newKeys[i]) === -1) { // Avoid duplicates.
                this._globalBlockedProps.push(newKeys[i]);
            }
        }
    };

    /**
     * Removes one or more property names from the global blacklist.
     * @param {...string} keys - Property names to remove.
     */
    proto.removeGlobalBlocked = function (/*...keys*/) {
        var keysToRemove = Array.prototype.slice.call(arguments);
        this._globalBlockedProps = this._globalBlockedProps.filter(function (propName) {
            return keysToRemove.indexOf(propName) === -1;
        });
    };

    /**
     * Internal helper to determine if a specific property on an object should be tracked.
     * Applies local whitelists/blacklists first, then global ones.
     * @param {object} containingObject - The object that owns the property.
     * @param {string} propertyName - The name of the property.
     * @returns {boolean} True if the property should be tracked, false otherwise.
     * @private
     */
    proto._isPropertyTrackable = function (containingObject, propertyName) {
        var localWhitelist = this.retrieveAllowedProperties(containingObject);
        var localBlacklist = this.retrieveBlockedProperties(containingObject);

        // If a local whitelist exists, the property MUST be in it.
        if (localWhitelist && localWhitelist.list.indexOf(propertyName) === -1) {
            return false;
        }
        
        // If a local blacklist exists, the property MUST NOT be in it.
        if (localBlacklist && localBlacklist.list.indexOf(propertyName) !== -1) {
            return false;
        }

        // If a global whitelist exists AND is not empty, the property MUST be in it.
        if (this._globalAllowedProps.length > 0 && this._globalAllowedProps.indexOf(propertyName) === -1) {
            return false;
        }

        // If a global blacklist exists, the property MUST NOT be in it.
        if (this._globalBlockedProps.indexOf(propertyName) !== -1) {
            return false;
        }

        // If all checks pass, the property is trackable.
        return true;
    };

//--------------------------------------------------------------------------------------------------
//  Polymer Compatibility Adapter
//--------------------------------------------------------------------------------------------------
    
    /**
     * Activates the Polymer shim for object observation if the environment supports it.
     * This redefines `trackObject`, `untrackObject`, and `flushPending` to use Polymer's observer APIs.
     */
    proto.activatePolymerAdapter = function () {
        // Prevent re-initialization of the shim.
        if (this._isPolymerShimInitialized) {
            return;
        }
        this._isPolymerShimInitialized = true;
        this.usingPolymerShim = true; // Public flag to indicate shim usage.

        var activeObservers = []; // Stores ObjectObserver/ArrayObserver instances.
        var observedTargets = []; // Stores the objects being observed.

        // Redefine flushPending to use Polymer's microtask checkpoint.
        this.flushPending = function () {
            if (typeof Platform !== 'undefined' && typeof Platform.performMicrotaskCheckpoint === 'function') {
                Platform.performMicrotaskCheckpoint();
            } else {
                console.warn("Polymer shim active but Platform.performMicrotaskCheckpoint is missing.");
            }
        };

        // Redefine trackObject for Polymer's Object/ArrayObserver.
        this.trackObject = function (objInstance) {
            if (!objInstance || typeof objInstance !== 'object') {
                console.warn("Polymer shim: attempted to track non-object.", objInstance);
                return;
            }
            if (isAlreadyObserved(objInstance)) {
                return; // Already tracking this object.
            }

            var currentThis = this; // Capture 'this' for the observer callback.
            var observerInstance;

            if (Array.isArray(objInstance)) {
                observerInstance = new ArrayObserver(objInstance);
            } else {
                observerInstance = new ObjectObserver(objInstance);
            }

            observedTargets.push(objInstance);
            activeObservers.push(observerInstance);

            // Open the observer and provide a callback to process changes.
            observerInstance.open(function(addedProperties, removedProperties, changedProperties, getOldValueCallback) {
                var collectedChanges = [];

                // Process 'add' changes.
                Object.keys(addedProperties).forEach(function(propertyKey) {
                    collectedChanges.push({object: objInstance, type: 'add', name: propertyKey});
                });

                // Process 'delete' changes.
                Object.keys(removedProperties).forEach(function(propertyKey) {
                    collectedChanges.push({object: objInstance, type: 'delete', name: propertyKey, oldValue: getOldValueCallback(propertyKey)});
                });

                // Process 'update' changes.
                Object.keys(changedProperties).forEach(function(propertyKey) {
                    collectedChanges.push({object: objInstance, type: 'update', name: propertyKey, oldValue: getOldValueCallback(propertyKey)});
                });

                // For array splices, Polymer's ArrayObserver provides a single 'splice' record.
                // The original code only handles `splice` in `_reverseRecord`, but not its capture here.
                // Assuming Polymer's `ArrayObserver` would generate distinct add/delete/update for array elements if needed.
                // If a full `splice` record is expected, this part would need adjustment.
                // The original code's `Array.observe` would emit `splice` records directly.
                // Polymer's `ArrayObserver` typically gives `added`, `removed`, `changed` for individual items,
                // and a `splices` array for the actual array mutations.
                // To maintain compatibility with `_applyInverseMutation`, we need to adapt.
                // The original `Array.observe` API provides a 'splice' type change record.
                // Polymer's `ArrayObserver` provides a `splices` array in its callback.
                // Let's add handling for Polymer's `splices` array to mimic `Array.observe` behavior.
                if (Array.isArray(objInstance) && arguments.length > 4 && Array.isArray(arguments[4])) { // arguments[4] would be 'splices' in Polymer's ArrayObserver
                    var splices = arguments[4];
                    splices.forEach(function(spliceRecord) {
                        collectedChanges.push({
                            object: objInstance,
                            type: 'splice',
                            index: spliceRecord.index,
                            removed: spliceRecord.removed,
                            addedCount: spliceRecord.addedCount
                        });
                    });
                }


                // Pass the collected changes to the main history processing function.
                currentThis._boundProcessMutations(collectedChanges);
            });
        };

        // Redefine untrackObject for Polymer's Object/ArrayObserver.
        this.untrackObject = function (objInstance) {
            var index = observedTargets.indexOf(objInstance);

            if (index !== -1) {
                // Remove from tracking lists and close the observer.
                observedTargets.splice(index, 1);
                activeObservers.splice(index, 1)[0].close();
            }
        };

        // Helper function to check if an object is already being observed by the shim.
        function isAlreadyObserved(objToCheck) {
            return observedTargets.indexOf(objToCheck) !== -1;
        }
    };

    // Return the main class constructor.
    return StateSnap;
}));