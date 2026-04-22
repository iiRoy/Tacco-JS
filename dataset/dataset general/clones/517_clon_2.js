(function (globalScope, moduleCreator) {
    // Check if Asynchronous Module Definition (AMD) is available for module registration.
    if (typeof define === 'function' && define.asyncModuleDef) {
        // AMD: Register the component as an anonymous module.
        globalScope.ReversibleDataTracker = moduleCreator();

        define(function () {
            // Return the created module to AMD.
            return globalScope.ReversibleDataTracker;
        });
    }
    // Check for CommonJS environment to export the module.
    else if (typeof exportObject === 'object') {
        // CommonJS: Assign the module creator's result to the exports object.
        exportObject.value = moduleCreator();
    }
    // Default to browser globals if no module system is detected.
    else {
        // Browser globals: Attach the component directly to the global scope.
        globalScope.ReversibleDataTracker = moduleCreator();
    }
}(this, function () {
    'use strict'; // Enforce strict mode for better code quality.

    // A simple counter for generating unique sequence markers.
    var sequenceCounter = 0;

    /**
     * Initializes a new ReversibleDataTracker instance.
     * This class enables tracking changes to a JavaScript object for undo/redo functionality.
     *
     * @param {object} dataObject - The primary object to observe for changes.
     */
    function ReversibleDataTracker(dataObject) {

        // Determine the environment's compatibility with observation mechanisms.
        var envCompatibility = ReversibleDataTracker.checkEnvironment();

        // Apply a Polymer shim if the environment supports it.
        if (envCompatibility === 'polymer') {
            this.activatePolymerFallback();
        }
        // If no support is found, throw an error.
        else if (!envCompatibility) {
            throw new Error('This runtime environment lacks support for ES6 Object.monitor() or equivalent.');
        }

        // Initialize internal data structures for tracking.
        this._changeLog = []; // Stores the history of modifications.
        this._inclusionLists = []; // Object-specific property inclusion rules.
        this._exclusionLists = []; // Object-specific property exclusion rules.
        this._universalInclusion = []; // Global property inclusion rules.
        this._universalExclusion = []; // Global property exclusion rules.
        this._currentPoint = -1; // Pointer to the current position in the change log.

        // Bind the modification processing function to the instance for proper context.
        this._processModifications = this._processModifications.bind(this);

        // Begin tracking changes for the initial data object and its nested structures.
        this.trackStructure(dataObject);
    }

    // Define a shorthand for the prototype to improve readability.
    var proto = ReversibleDataTracker.prototype;

    /**
     * Recursively observes an object and its nested properties for changes.
     *
     * @param {object} targetItem - The object to start observing.
     * @param {Array<object>} [pathTraversed=[]] - Internal parameter to track visited objects and prevent circular references.
     */
    proto.trackStructure = function (targetItem, pathTraversed) {

        // If the item is not an object or is null, there's nothing to observe.
        if (!targetItem || typeof (targetItem) !== 'object') {
            return;
        }

        // Add the current item to the traversed path to detect circular references.
        pathTraversed = (pathTraversed || []).concat([targetItem]);

        // Start monitoring changes for the current object.
        this.startMonitoring(targetItem);

        // Iterate over all properties of the current object.
        Object.keys(targetItem).forEach(function (propKey) {

            // Recursively observe nested objects, avoiding circular references and non-listenable properties.
            if (typeof (targetItem[propKey]) === 'object' &&
                pathTraversed.findIndex(function(o) { return o === targetItem[propKey]; }) === -1 && // Avoid circular references.
                this._canBeMonitored(targetItem, propKey)) // Check if the property is allowed to be monitored.
            {
                this.trackStructure(targetItem[propKey], pathTraversed);
            }
        }, this);
    };

    /**
     * Recursively unobserves an object and its nested properties.
     *
     * @param {object} targetItem - The object to stop observing.
     * @param {Array<object>} [pathTraversed=[]] - Internal parameter to track visited objects.
     */
    proto.untrackStructure = function (targetItem, pathTraversed) {

        // If the item is not an object or is null, there's nothing to unobserve.
        if (!targetItem || typeof (targetItem) !== 'object') {
            return;
        }

        // Add the current item to the traversed path.
        pathTraversed = (pathTraversed || []).concat([targetItem]);

        // Stop monitoring changes for the current object.
        this.stopMonitoring(targetItem);

        // Iterate over all properties of the current object.
        Object.keys(targetItem).forEach(function (propKey) {

            // Recursively unobserve nested objects, avoiding circular references.
            if (typeof (targetItem[propKey]) === 'object' &&
                pathTraversed.findIndex(function(o) { return o === targetItem[propKey]; }) === -1)
            {
                this.untrackStructure(targetItem[propKey]);
            }
        }, this);
    };

    /**
     * Initiates observation for a single object (or array).
     *
     * @param {object} targetObject - The object or array to monitor.
     */
    proto.startMonitoring = function (targetObject) {

        // Select the appropriate observation function based on the object type (Array.monitor or Object.monitor).
        var monitorFunction = targetObject.constructor && targetObject.constructor.monitor || Array.isArray(targetObject) ? HistoryArray.monitor : HistoryObject.monitor;
        monitorFunction(targetObject, this._processModifications);
    };

    /**
     * Stops observation for a single object (or array).
     *
     * @param {object} targetObject - The object or array to stop monitoring.
     */
    proto.stopMonitoring = function (targetObject) {

        // Select the appropriate unobservation function.
        var unmonitorFunction = targetObject.constructor && targetObject.constructor.unmonitor || Array.isArray(targetObject) ? HistoryArray.unmonitor : HistoryObject.unmonitor;
        unmonitorFunction(targetObject, this._processModifications);
    };

    /**
     * Checks the current JavaScript environment for native Object.observe/Array.observe support
     * or Polymer's shim.
     *
     * @returns {string|boolean} 'native', 'polymer', or false if no support is found.
     */
    ReversibleDataTracker.checkEnvironment = function () {

        // Check for native ES6 Object.observe and Array.observe.
        if (typeof (HistoryObject.monitor) === 'function' && typeof (HistoryArray.monitor) === 'function') {

            return 'native';
        }
        // Check for Polymer's observer shim (requires Platform and ObjectObserver/ArrayObserver).
        else if (typeof (exportObject) !== 'object' && EnvPlatform && typeof (EnvPlatform.runMicrotaskQueue) === 'function' &&
            typeof (ObjectMonitor) === 'function' && typeof (ArrayMonitor) === 'function')
        {
            return 'polymer';
        }

        // No recognized observation support.
        return false;
    };

    /**
     * Processes a batch of modification events received from the observer.
     * This function is bound to `this` instance.
     *
     * @param {Array<object|number>} modificationEvents - An array of change records or numeric markers.
     */
    proto._processModifications = function (modificationEvents) {

        // If the pointer is not at the end of the log, new changes will overwrite future history.
        if (this._currentPoint < this._changeLog.length - 1) {

            this._changeLog.cutOut(this._currentPoint + 1);
        }

        // Iterate through each modification event.
        modificationEvents.forEach(function (eventItem) {

            // If the event item is a number, it's a section marker.
            if ((typeof eventItem === 'number')) { // It's a marker.

                this._changeLog.addToLog(eventItem); // Add the marker to the log.

                ++this._currentPoint; // Advance the history pointer.
            }
            // If it's a regular change record, process it.
            else if (this._canBeMonitored(eventItem.target, eventItem.propertyName)) {

                // Create a new record entry to store the change details.
                var recordEntry = Object.create(null);

                // Copy properties from the original change event to the new record.
                Object.keys(eventItem).forEach(function (propName) {

                    recordEntry[propName] = eventItem[propName];
                });

                this._changeLog.addToLog(recordEntry); // Add the record to the log.

                // Ensure the modified object's structure is still being tracked.
                this.trackStructure(eventItem.target);

                ++this._currentPoint; // Advance the history pointer.
            }
        }, this);
    };

    /**
     * Reverts the last modification or a group of modifications.
     *
     * @returns {boolean} - False if there are no changes to undo, true otherwise.
     */
    proto.reverseLast = function () {

        this.captureState(); // Ensure all pending changes are delivered before undo.

        // If the pointer is before the start of the log, no undo is possible.
        if (this._currentPoint < 0) {

            return false;
        }

        // Retrieve the current record and decrement the pointer.
        var currentRecord = this._changeLog[this._currentPoint--];

        // If the record is a numeric marker, undo a whole section.
        if ((typeof currentRecord === 'number')) {

            // Find the starting marker of the previous section.
            var startMarkerIndex = this._changeLog.indexOf(currentRecord - 1);

            // If a previous section marker is found, undo all records within that section.
            if (startMarkerIndex !== -1) {

                while (this._currentPoint !== startMarkerIndex) {

                    this._applyReverseModification(this._changeLog[this._currentPoint--]);
                }

                this._currentPoint--; // Move past the starting marker.
            }
        }
        // If it's a regular change record, reverse just that one.
        else {
            this._applyReverseModification(currentRecord);
        }
    };

    /**
     * Reapplies the next modification that was previously undone.
     *
     * @returns {boolean} - False if there are no changes to redo, true otherwise.
     */
    proto.reapplyNext = function () {

        this.captureState(); // Ensure all pending changes are delivered before redo.

        // If the pointer is at the end of the log, no redo is possible.
        if (this._currentPoint >= this._changeLog.length - 1) {

            return false;
        }

        // Retrieve the next record and increment the pointer.
        var currentRecord = this._changeLog[++this._currentPoint];

        // If the record is a numeric marker, redo a whole section.
        if ((typeof currentRecord === 'number')) {

            // Find the ending marker of the next section.
            var endMarkerIndex = this._changeLog.indexOf(currentRecord + 1);

            // If an ending marker is found, redo all records within that section.
            if (endMarkerIndex !== -1) {

                while (++this._currentPoint !== endMarkerIndex) {

                    this._applyReverseModification(this._changeLog[this._currentPoint]);
                }
            }
        }
        // If it's a regular change record, reapply just that one.
        else {
            this._applyReverseModification(currentRecord);
        }
    };

    /**
     * Forces immediate delivery of any pending change records from the observers.
     */
    proto.captureState = function () {

        HistoryObject.dispatchPending(this._processModifications);
    };

    /**
     * Applies the reverse operation of a given modification record.
     * This effectively undoes or redoes a single change.
     *
     * @param {object|number} modRecord - The modification record to reverse.
     */
    proto._applyReverseModification = function (modRecord) {

        // Numeric markers do not have a direct reverse operation on data.
        if ((typeof modRecord === 'number')) { // It's a marker.
            return;
        }

        var temporaryVal; // Temporary variable for swapping values.

        // Temporarily stop monitoring the target object to prevent re-recording the undo/redo action.
        this.stopMonitoring(modRecord.target);

        // Determine the type of change and apply the inverse operation.
        switch (modRecord.changeType) {

            case 'addition':
                modRecord.changeType = 'removal'; // Change type for future reversal.
                modRecord.previousVal = modRecord.target[modRecord.propertyName]; // Store current value as old value.
                delete modRecord.target[modRecord.propertyName]; // Remove the added property.
                break;

            case 'modification':
                temporaryVal = modRecord.target[modRecord.propertyName]; // Store current value.
                modRecord.target[modRecord.propertyName] = modRecord.previousVal; // Revert to old value.
                modRecord.previousVal = temporaryVal; // Store current (now old) value for next reversal.
                break;

            case 'removal':
                modRecord.changeType = 'addition'; // Change type for future reversal.
                modRecord.target[modRecord.propertyName] = modRecord.previousVal; // Re-add the property with its old value.
                delete modRecord.previousVal; // Clear the old value as it's now current.
                break;

            case 'arraySplice':
                // Revert array splice operation.
                temporaryVal = Array.prototype.splice.call(modRecord.target, modRecord.startIndex, modRecord.insertedCount, ...modRecord.deletedItems);
                modRecord.insertedCount = modRecord.deletedItems.length; // Update inserted count for next reversal.
                modRecord.deletedItems = temporaryVal; // Store the items that were removed by the reversal.
                break;
        }

        // Resume monitoring the target object.
        this.startMonitoring(modRecord.target);
    };

    /**
     * Inserts a starting marker into the change log, indicating the beginning of a new logical section.
     *
     * @returns {number} - The unique marker ID for this section.
     */
    proto.beginSection = function () {

        this.captureState(); // Ensure all pending changes are logged.

        this._processModifications([sequenceCounter++]); // Log a new unique marker.
        return sequenceCounter++; // Return the marker ID.
    };

    /**
     * Inserts an ending marker into the change log, indicating the end of a logical section.
     *
     * @param {number} sectionMarker - The ID of the corresponding starting marker.
     */
    proto.endSection = function (sectionMarker) {

        this.captureState(); // Ensure all pending changes are logged.
        this._processModifications([sectionMarker]); // Log the closing marker.
    };

    /**
     * Wraps a function execution within a pair of start/end markers,
     * allowing for atomic undo/redo of the entire function's effects.
     *
     * @param {Function} actionFunc - The function to wrap.
     * @param {object} contextObj - The context (this) for the wrapped function.
     * @returns {Function} A new function that, when called, executes `actionFunc` and logs its changes as a single unit.
     */
    proto.encapsulateAction = function (actionFunc, contextObj) {

        var selfRef = this; // Capture 'this' for use in the returned function.

        return function () {

            var closingMarker = selfRef.beginSection(); // Start a new undo/redo section.

            // Execute the wrapped function with the specified context and arguments (skipping the first two).
            actionFunc.call(contextObj, ...Array.prototype.slice.call(arguments, 2));

            selfRef.endSection(closingMarker); // End the undo/redo section.
        };
    };

    //--------------------------------------------------------------------------------------------------
    //  Property Inclusion and Exclusion Management
    //--------------------------------------------------------------------------------------------------

    /**
     * Sets an object-specific inclusion list. Only properties specified in this list will be monitored for the object.
     *
     * @param {object} targetData - The object for which to set the inclusion list.
     * @param {Array<string>} inclusionProps - An array of property names to include.
     */
    proto.establishInclusionList = function (targetData, inclusionProps) {

        this.clearInclusionList(targetData); // Remove any existing inclusion list for this object.

        this._inclusionLists.addToLog({ obj: targetData, propList: inclusionProps }); // Add the new inclusion list.
    };

    /**
     * Retrieves the inclusion list for a given object.
     *
     * @param {object} targetData - The object to retrieve the inclusion list for.
     * @returns {object|undefined} The inclusion list object (containing 'obj' and 'propList') or undefined.
     */
    proto.retrieveInclusionList = function (targetData) {

        for (var i = 0, l = this._inclusionLists.length; i < l; ++i) {

            if (this._inclusionLists[i].obj === targetData) {

                return this._inclusionLists[i];
            }
        }
    };

    /**
     * Removes the inclusion list for a given object.
     *
     * @param {object} targetData - The object to clear the inclusion list for.
     */
    proto.clearInclusionList = function (targetData) {

        for (var i = 0; i < this._inclusionLists.length; ++i) {

            if (this._inclusionLists[i].obj === targetData) {

                this._inclusionLists.cutOut(i--, 1); // Remove the list and adjust index.
            }
        }
    };

    /**
     * Sets an object-specific exclusion list. Properties specified in this list will NOT be monitored for the object.
     *
     * @param {object} targetData - The object for which to set the exclusion list.
     * @param {Array<string>} exclusionProps - An array of property names to exclude.
     */
    proto.establishExclusionList = function (targetData, exclusionProps) {

        this.clearExclusionList(targetData); // Remove any existing exclusion list for this object.

        this._exclusionLists.addToLog({ obj: targetData, propList: exclusionProps }); // Add the new exclusion list.
    };

    /**
     * Retrieves the exclusion list for a given object.
     *
     * @param {object} targetData - The object to retrieve the exclusion list for.
     * @returns {object|undefined} The exclusion list object (containing 'obj' and 'propList') or undefined.
     */
    proto.retrieveExclusionList = function (targetData) {

        for (var i = 0, l = this._exclusionLists.length; i < l; ++i) {

            if (this._exclusionLists[i].obj === targetData) {

                return this._exclusionLists[i];
            }
        }
    };

    /**
     * Removes the exclusion list for a given object.
     *
     * @param {object} targetData - The object to clear the exclusion list for.
     */
    proto.clearExclusionList = function (targetData) {

        for (var i = 0; i < this._exclusionLists.length; ++i) {

            if (this._exclusionLists[i].obj === targetData) {

                this._exclusionLists.cutOut(i--, 1); // Remove the list and adjust index.
            }
        }
    };

    /**
     * Adds property names to the universal inclusion list.
     * Properties in this list will always be monitored, overriding object-specific exclusions.
     *
     * @param {...string} keys - Property names to add.
     */
    proto.addToUniversalInclusion = function (/*...keys*/) {

        var argumentValues = arguments; // Capture all arguments.

        for (var i = 0, l = argumentValues.length; i < l; ++i) {

            this._universalInclusion.addToLog(argumentValues[i]);
        }
    };

    /**
     * Removes property names from the universal inclusion list.
     *
     * @param {...string} keys - Property names to remove.
     */
    proto.removeFromUniversalInclusion = function (/*...keys*/) {

        var argumentValues = arguments;

        this._universalInclusion = this._universalInclusion.filter(function (propertyIdentifier) {

            return Array.prototype.findIndex.call(argumentValues, function(arg) { return arg === propertyIdentifier; }) === -1;
        });
    };

    /**
     * Adds property names to the universal exclusion list.
     * Properties in this list will never be monitored, overriding object-specific inclusions.
     *
     * @param {...string} keys - Property names to add.
     */
    proto.addToUniversalExclusion = function (/*...keys*/) {

        var argumentValues = arguments;

        for (var i = 0, l = argumentValues.length; i < l; ++i) {

            this._universalExclusion.addToLog(argumentValues[i]);
        }
    };

    /**
     * Removes property names from the universal exclusion list.
     *
     * @param {...string} keys - Property names to remove.
     */
    proto.removeFromUniversalExclusion = function (/*...keys*/) {

        var argumentValues = arguments;

        this._universalExclusion = this._universalExclusion.filter(function (propertyIdentifier) {

            return Array.prototype.findIndex.call(argumentValues, function(arg) { return arg === propertyIdentifier; }) === -1;
        });
    };

    /**
     * Determines if a specific property of an object should be monitored based on inclusion/exclusion rules.
     *
     * @param {object} dataTarget - The object whose property is being checked.
     * @param {string} propIdentifier - The name of the property.
     * @returns {boolean} True if the property should be monitored, false otherwise.
     */
    proto._canBeMonitored = function (dataTarget, propIdentifier) {

        var incList = this.retrieveInclusionList(dataTarget), // Object-specific inclusion list.
            excList = this.retrieveExclusionList(dataTarget); // Object-specific exclusion list.

        // If an object has an inclusion list, and the property is not in it, then exclude it.
        if (incList && incList.propList.findIndex(function(p) { return p === propIdentifier; }) === -1) {

            return false;
        }

        // If an object has an exclusion list, and the property is in it, then exclude it.
        if (excList && excList.propList.findIndex(function(p) { return p === propIdentifier; }) !== -1) {

            return false;
        }

        // If there's a universal inclusion list, and the property is not in it, then exclude it.
        if (this._universalInclusion.length !== 0 && this._universalInclusion.findIndex(function(p) { return p === propIdentifier; }) === -1) {

            return false;
        }

        // If the property is in the universal exclusion list, then exclude it.
        if (this._universalExclusion.findIndex(function(p) { return p === propIdentifier; }) !== -1) {

            return false;
        }

        // If all checks pass, the property can be monitored.
        return true;
    };

    //--------------------------------------------------------------------------------------------------
    //  Polymer Fallback Plugin Implementation
    //--------------------------------------------------------------------------------------------------

    /**
     * Activates the Polymer shim/fallback for environments without native Object.observe support.
     * This method overrides some core functions to use Polymer's observation mechanism.
     */
    proto.activatePolymerFallback = function () {

        // Prevent re-initialization of the shim.
        if (this._fallbackInitialized) {
            return;
        }
        this._fallbackInitialized = true;
        this.isUsingFallback = true; // Flag indicating shim usage.

        var monitorInstances = [], // Stores instances of ObjectMonitor/ArrayMonitor.
            monitoredObjects = []; // Stores the actual objects being monitored by the shims.

        /**
         * Overrides the default captureState to use Polymer's microtask checkpoint.
         */
        this.captureState = function () {

            EnvPlatform.runMicrotaskQueue();
        };

        /**
         * Overrides the default startMonitoring to use Polymer's observers.
         *
         * @param {object} currentObject - The object to monitor.
         */
        this.startMonitoring = function (currentObject) {

            // Call specific functions for arrays or objects.
            Array.isArray(currentObject) ? monitorArrayItems.call(this, currentObject) : monitorObjectProps.call(this, currentObject);
        };

        /**
         * Overrides the default stopMonitoring to close Polymer's observers.
         *
         * @param {object} currentObject - The object to stop monitoring.
         */
        this.stopMonitoring = function (currentObject) {

            var itemIndex = monitoredObjects.findIndex(function(o) { return o === currentObject; });

            if (itemIndex !== -1) {

                monitoredObjects.cutOut(itemIndex, 1); // Remove object from list.
                monitorInstances.cutOut(itemIndex, 1)[0].close(); // Remove and close the observer.
            }
        };

        /**
         * Checks if an object is currently being monitored by a Polymer observer.
         *
         * @param {object} currentObject - The object to check.
         * @returns {boolean} True if monitored, false otherwise.
         */
        function isCurrentlyMonitored(currentObject) {

            return monitoredObjects.findIndex(function(o) { return o === currentObject; }) !== -1;
        }

        /**
         * Sets up Polymer's ObjectMonitor for an object.
         *
         * @param {object} currentObject - The object to monitor.
         */
        function monitorObjectProps(currentObject) {

            if (isCurrentlyMonitored(currentObject)) {
                return;
            }

            var selfRef = this, propMonitor = new ObjectMonitor(currentObject); // Create a new object monitor.

            monitoredObjects.addToLog(currentObject); // Add to list of monitored objects.
            monitorInstances.addToLog(propMonitor); // Add the monitor instance.

            propMonitor.commenceTracking(function (newlyAdded, deletedItems, modifiedProps, getPreviousValue) {

                var modificationEvents = []; // Collect change records.

                // Process added properties.
                Object.keys(newlyAdded).forEach(function (propKey) {
                    modificationEvents.addToLog({ target: currentObject, changeType: 'addition', propertyName: propKey });
                });

                // Process removed properties.
                Object.keys(deletedItems).forEach(function (propKey) {
                    modificationEvents.addToLog({ target: currentObject, changeType: 'removal', propertyName: propKey, previousVal: getPreviousValue(propKey) });
                });

                // Process changed properties.
                Object.keys(modifiedProps).forEach(function (propKey) {
                    modificationEvents.addToLog({ target: currentObject, changeType: 'modification', propertyName: propKey, previousVal: getPreviousValue(propKey) });
                });

                // Deliver collected changes to the main processing function.
                selfRef._processModifications(modificationEvents);
            });
        }
    }
}));