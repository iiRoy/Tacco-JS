(function (globalScope, moduleCreator) {
    if (typeof define === 'function' && define.amd) {
        globalScope.MutableSnapshot = moduleCreator();

        define(function () {
            return globalScope.MutableSnapshot;
        });
    } else if (typeof exports === 'object') {
        module.exports = moduleCreator();
    } else {
        globalScope.MutableSnapshot = moduleCreator();
    }
}(this, function () {
    'use strict';

    const proxiedEntities = new WeakMap(); // Maps original object to its proxy
    const originalEntities = new WeakMap(); // Maps proxy to original object
    const untrackedEntities = new WeakSet(); // Stores original objects that should not be tracked

    var eventMarkerCounter = 0;

    function Agent(sourceData) { // Renamed from LazyJsonUndoRedo(obj)

        var supportCheck = Agent.verifyCapabilities();

        if (!supportCheck) {
            throw Error('This environment does not support ES6 Proxy for change detection.');
        }

        this.pastMoments = []; // Renamed from _history
        this.currentMomentIndex = -1; // Renamed from _pointer
        this.entityRules = []; // Renamed from _whitelists
        this.attributeRules = []; // Renamed from _blacklists
        this.universalEntityRules = []; // Renamed from _globalWhitelist
        this.universalAttributeRules = []; // Renamed from _globalBlacklist
        this.isHistoryApplication = false; // Flag to prevent logging during undo/redo operations

        // The object passed to the constructor is the root of the tracked data.
        // It's immediately wrapped in a proxy.
        this.trackedData = this.activateTracking(sourceData); // Renamed from observeTree(obj)
    }

    var proto = Agent.prototype; // Renamed from p

    // Renamed from observeTree
    proto.activateTracking = function (targetObject) {
        if (!targetObject || typeof targetObject !== 'object' || targetObject instanceof Date || untrackedEntities.has(targetObject)) {
            return targetObject; // Don't proxy primitives, Dates, or explicitly untracked objects
        }
        if (proxiedEntities.has(targetObject)) {
            return proxiedEntities.get(targetObject); // Return existing proxy if already proxied
        }

        const self = this;
        const handler = {
            get(target, field, receiver) {
                // If it's an array method, wrap it to detect mutations
                if (Array.isArray(target) && typeof target[field] === 'function' &&
                    ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill'].includes(field)) {
                    return function(...args) {
                        if (self.isHistoryApplication || untrackedEntities.has(target)) {
                            return Reflect.apply(target[field], target, args);
                        }

                        const oldArray = Array.from(target);
                        const result = Reflect.apply(target[field], target, args);
                        const newArray = Array.from(target);

                        // Only log if the array actually changed
                        if (JSON.stringify(oldArray) !== JSON.stringify(newArray)) {
                            self.logAlteration([{
                                type: 'array_mutation',
                                subject: target,
                                field: field, // The method called
                                args: args, // Arguments passed to the method
                                previous: oldArray,
                                current: newArray
                            }]);
                        }
                        return result;
                    };
                }

                const value = Reflect.get(target, field, receiver);
                // Recursively proxy nested objects/arrays on access
                if (value && typeof value === 'object' && value !== null && !untrackedEntities.has(value)) {
                    return self.activateTracking(value);
                }
                return value;
            },
            set(target, field, value, receiver) {
                if (self.isHistoryApplication || untrackedEntities.has(target)) {
                    return Reflect.set(target, field, value, receiver);
                }

                if (!self.isPermitted(target, field)) { // Renamed from _isListenable
                    return Reflect.set(target, field, value, receiver);
                }

                const oldValue = Reflect.get(target, field, receiver);
                let proxiedValue = value;

                // Proxy new objects/arrays being set
                if (value && typeof value === 'object' && value !== null && !untrackedEntities.has(value)) {
                    proxiedValue = self.activateTracking(value);
                }

                const success = Reflect.set(target, field, proxiedValue, receiver);

                if (success && oldValue !== value) {
                    self.logAlteration([{
                        type: 'attribute_update', // Renamed from 'update'
                        subject: target, // Renamed from 'object'
                        field: field, // Renamed from 'name'
                        pastValue: oldValue, // Renamed from 'oldValue'
                        newValue: value // New field
                    }]);
                }
                return success;
            },
            deleteProperty(target, field) {
                if (self.isHistoryApplication || untrackedEntities.has(target)) {
                    return Reflect.deleteProperty(target, field);
                }

                if (!self.isPermitted(target, field)) {
                    return Reflect.deleteProperty(target, field);
                }

                const oldValue = Reflect.get(target, field);
                const success = Reflect.deleteProperty(target, field);

                if (success) {
                    self.logAlteration([{
                        type: 'attribute_removal', // Renamed from 'delete'
                        subject: target,
                        field: field,
                        pastValue: oldValue
                    }]);
                }
                return success;
            }
        };

        const currentProxy = new Proxy(targetObject, handler);
        proxiedEntities.set(targetObject, currentProxy);
        originalEntities.set(currentProxy, targetObject);
        return currentProxy;
    };

    // Renamed from unobserveTree
    proto.deactivateTrackingRecursive = function(entity, visited = new WeakSet()) {
        const original = originalEntities.has(entity) ? originalEntities.get(entity) : entity;
        if (!original || typeof original !== 'object' || visited.has(original)) {
            return;
        }
        visited.add(original);

        this.deactivateTracking(original); // Untrack the current entity

        for (const key in original) {
            if (Object.prototype.hasOwnProperty.call(original, key)) {
                const value = original[key];
                if (value && typeof value === 'object' && value !== null) {
                    this.deactivateTrackingRecursive(value, visited);
                }
            }
        }
    };

    // Renamed from observe
    proto.deactivateTracking = function (entity) {
        const original = originalEntities.has(entity) ? originalEntities.get(entity) : entity;
        if (original && typeof original === 'object') {
            untrackedEntities.add(original);
        }
    };

    // Renamed from unobserve
    proto.activateEntityTracking = function (entity) {
        const original = originalEntities.has(entity) ? originalEntities.get(entity) : entity;
        if (original && typeof original === 'object') {
            untrackedEntities.delete(original);
            // Ensure it's proxied if it wasn't already (e.g., if it was explicitly untracked)
            if (!proxiedEntities.has(original)) {
                this.activateTracking(original);
            }
        }
    };

    // Renamed from LazyJsonUndoRedo.checkSupport
    Agent.verifyCapabilities = function () {
        return typeof Proxy === 'function';
    };

    // Renamed from _recChanges
    proto.logAlteration = function(alterations) {
        if (this.isHistoryApplication) return;

        if (this.currentMomentIndex < this.pastMoments.length - 1) {
            this.pastMoments.splice(this.currentMomentIndex + 1);
        }

        alterations.forEach(alteration => {
            if (typeof alteration === 'number') { // It's a flag
                this.pastMoments.push(alteration);
                this.currentMomentIndex++;
            } else if (this.isPermitted(alteration.subject, alteration.field)) {
                this.pastMoments.push(alteration);
                this.currentMomentIndex++;
            }
        });
    };

    // Renamed from undo
    proto.revertChange = function() {
        this.capturePending(); // Call equivalent to original's rec()

        if (this.currentMomentIndex < 0) {
            return false;
        }

        const alteration = this.pastMoments[this.currentMomentIndex--];

        if (typeof alteration === 'number') { // It's a flag
            const startFlagVal = alteration - 1; // Original uses flagCounter++ then flag, so start flag is one less
            let stepsBack = 0;
            // Find the corresponding start flag (or beginning of history)
            while (this.currentMomentIndex >= 0 && this.pastMoments[this.currentMomentIndex] !== startFlagVal) {
                this.applyReverseAlteration(this.pastMoments[this.currentMomentIndex--]);
                stepsBack++;
            }
            if (this.currentMomentIndex >= 0 && this.pastMoments[this.currentMomentIndex] === startFlagVal) {
                this.currentMomentIndex--; // Move past the start flag
            }
        } else {
            this.applyReverseAlteration(alteration);
        }
    };

    // Renamed from redo
    proto.advanceChange = function() {
        this.capturePending(); // Call equivalent to original's rec()

        if (this.currentMomentIndex >= this.pastMoments.length - 1) {
            return false;
        }

        const alteration = this.pastMoments[++this.currentMomentIndex];

        if (typeof alteration === 'number') { // It's a flag
            const endFlagVal = alteration; // This flag itself marks the end
            let stepsForward = 0;
            while (this.currentMomentIndex < this.pastMoments.length && this.pastMoments[this.currentMomentIndex] !== endFlagVal) {
                this.applyForwardAlteration(this.pastMoments[this.currentMomentIndex]);
                this.currentMomentIndex++;
                stepsForward++;
            }
        } else {
            this.applyForwardAlteration(alteration);
        }
    };

    // Renamed from rec
    proto.capturePending = function () {
        // With Proxy, changes are synchronous. This function primarily serves
        // as a placeholder to match the original's API, ensuring any
        // pending change records are processed before undo/redo.
        // For Proxy, there are no "pending change records" to deliver.
        return null;
    };

    // Renamed from _reverseRecord
    proto.applyReverseAlteration = function (alteration) {
        if (typeof alteration === 'number') { // It's a flag
            return;
        }

        this.isHistoryApplication = true;
        // Use the original object to modify it without triggering new proxy traps
        const target = originalEntities.has(alteration.subject) ? originalEntities.get(alteration.subject) : alteration.subject;

        switch (alteration.type) {
            case 'attribute_update':
                // For 'add' type, oldValue would be undefined, so setting it back effectively removes it.
                // For 'update', it restores the old value.
                if (alteration.pastValue === undefined) {
                    delete target[alteration.field];
                } else {
                    target[alteration.field] = alteration.pastValue;
                }
                break;
            case 'attribute_removal': // Original 'delete'
                // Re-add the deleted property
                target[alteration.field] = alteration.pastValue;
                break;
            case 'array_mutation':
                // Restore the entire array to its state before the mutation
                if (Array.isArray(target) && Array.isArray(alteration.previous)) {
                    target.length = 0; // Clear current array
                    alteration.previous.forEach(item => target.push(item)); // Restore previous state
                }
                break;
        }
        this.isHistoryApplication = false;
    };

    proto.applyForwardAlteration = function (alteration) {
        if (typeof alteration === 'number') { // It's a flag
            return;
        }

        this.isHistoryApplication = true;
        // Use the original object to modify it without triggering new proxy traps
        const target = originalEntities.has(alteration.subject) ? originalEntities.get(alteration.subject) : alteration.subject;

        switch (alteration.type) {
            case 'attribute_update':
                target[alteration.field] = alteration.newValue;
                break;
            case 'attribute_removal':
                delete target[alteration.field];
                break;
            case 'array_mutation':
                // Restore the entire array to its state after the mutation
                if (Array.isArray(target) && Array.isArray(alteration.current)) {
                    target.length = 0;
                    alteration.current.forEach(item => target.push(item));
                }
                break;
        }
        this.isHistoryApplication = false;
    };

    // Renamed from startFlag
    proto.markBeginning = function () {
        this.capturePending();
        const currentFlag = eventMarkerCounter++;
        this.logAlteration([currentFlag]);
        return currentFlag;
    };

    // Renamed from endFlag
    proto.markCompletion = function (flag) {
        this.capturePending();
        this.logAlteration([flag]);
    };

    // Renamed from wrap
    proto.encapsulateAction = function (actionFunction, context) {
        const that = this;

        return function (...args) {
            const endFlag = that.markBeginning();

            actionFunction.apply(context, args);

            that.markCompletion(endFlag);
        };
    };

//--------------------------------------------------------------------------------------------------
//  White- and blacklisting (Renamed from Whitelisting/Blacklisting)
//--------------------------------------------------------------------------------------------------

    // Renamed from setWhitelist
    proto.defineEntityRules = function (entity, list) {
        this.removeEntityRules(entity);
        this.entityRules.push({entity: entity, list: list});
    };

    // Renamed from getWhitelist
    proto.retrieveEntityRules = function (entity) {
        for (let i = 0, l = this.entityRules.length; i < l; ++i) {
            if (this.entityRules[i].entity === entity) {
                return this.entityRules[i];
            }
        }
        return null;
    };

    // Renamed from removeWhitelist
    proto.removeEntityRules = function (entity) {
        for (let i = 0; i < this.entityRules.length; ++i) {
            if (this.entityRules[i].entity === entity) {
                this.entityRules.splice(i--, 1);
            }
        }
    };

    // Renamed from setBlacklist
    proto.defineAttributeRules = function (entity, list) {
        this.removeAttributeRules(entity);
        this.attributeRules.push({entity: entity, list: list});
    };

    // Renamed from getBlacklist
    proto.retrieveAttributeRules = function (entity) {
        for (let i = 0, l = this.attributeRules.length; i < l; ++i) {
            if (this.attributeRules[i].entity === entity) {
                return this.attributeRules[i];
            }
        }
        return null;
    };

    // Renamed from removeBlacklist
    proto.removeAttributeRules = function (entity) {
        for (let i = 0; i < this.attributeRules.length; ++i) {
            if (this.attributeRules[i].entity === entity) {
                this.attributeRules.splice(i--, 1);
            }
        }
    };

    // Renamed from addToGlobalWhitelist
    proto.addUniversalEntityRules = function (/*...keys*/) {
        const args = arguments;
        for (let i = 0, l = args.length; i < l; ++i) {
            this.universalEntityRules.push(args[i]);
        }
    };

    // Renamed from removeFromGlobalWhitelist
    proto.removeUniversalEntityRules = function (/*...keys*/) {
        const args = arguments;
        this.universalEntityRules = this.universalEntityRules.filter(function (paramName) {
            return Array.prototype.indexOf.call(args, paramName) === -1;
        });
    };

    // Renamed from addToGlobalBlacklist
    proto.addUniversalAttributeRules = function (/*...keys*/) {
        const args = arguments;
        for (let i = 0, l = args.length; i < l; ++i) {
            this.universalAttributeRules.push(args[i]);
        }
    };

    // Renamed from removeFromGlobalBlacklist
    proto.removeUniversalAttributeRules = function (/*...keys*/) {
        const args = arguments;
        this.universalAttributeRules = this.universalAttributeRules.filter(function (paramName) {
            return Array.prototype.indexOf.call(args, paramName) === -1;
        });
    };

    // Renamed from _isListenable
    proto.isPermitted = function (entity, attributeName) {
        const localEntityRules = this.retrieveEntityRules(entity);
        const localAttributeRules = this.retrieveAttributeRules(entity);

        if (localEntityRules && localEntityRules.list.indexOf(attributeName) === -1) {
            return false;
        }
        
        if (localAttributeRules && localAttributeRules.list.indexOf(attributeName) !== -1) {
            return false;
        }

        if (this.universalEntityRules.length !== 0 && this.universalEntityRules.indexOf(attributeName) === -1) {
            return false;
        }

        if (this.universalAttributeRules.indexOf(attributeName) !== -1) {
            return false;
        }

        return true;
    };

    return Agent;
}));