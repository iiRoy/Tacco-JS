/*
 * This file provides utilities for managing transactional observable data using Knockout.js.
 * It allows for staging changes to observable values and objects, which can then be
 * either committed to the underlying data or discarded.
 */

// Ensure the Knockout.js library is available. If not, a basic placeholder is created
// to prevent immediate errors, though full functionality would require Knockout.
if (typeof ko === 'undefined') {
    window.ko = {};
    console.warn("Knockout.js (ko) not found. Data guarding features may not function correctly.");
}

// Custom namespace for our data management utilities.
const dataGuard = {};

/**
 * Constructs a specialized Knockout observable that supports a two-phase commit process.
 * Changes to this observable are initially "staged" and only become permanent
 * when explicitly committed, or can be reverted to the last committed state.
 *
 * @param {any} initialDataValue The initial value to be managed by this guarded observable.
 * @returns {ko.pureComputed & {commit: Function, revertStaged: Function, staged: Function}}
 *          A Knockout pureComputed observable with additional methods for transaction control.
 */
dataGuard.guardedData = function (initialDataValue) {
    // The core Knockout observable holding the last officially committed value.
    const currentObservableState = ko.observable(initialDataValue);
    // A temporary variable to hold changes before they are committed or discarded.
    let stagedValueCandidate = initialDataValue;

    // Helper predicate to determine if two values are distinct.
    const areValuesDifferent = (valA, valB) => valA !== valB;

    // The public-facing observable interface. Reads always show the committed state,
    // while writes update the staged candidate.
    const guardedValueInstance = ko.pureComputed({
        // The 'read' function exposes the currently committed value.
        read: () => currentObservableState(),
        // The 'write' function updates the temporary staged value, not the committed one.
        write: (incomingValue) => {
            stagedValueCandidate = incomingValue;
        }
    });

    /**
     * Attempts to commit the currently staged value. If the staged value differs
     * from the currently committed value, the committed value is updated.
     */
    guardedValueInstance.commit = function () {
        if (areValuesDifferent(stagedValueCandidate, currentObservableState())) {
            currentObservableState(stagedValueCandidate);
        }
    };

    /**
     * Discards any pending staged changes by resetting the staged value
     * back to the last committed value. This also forces a notification to
     * subscribers, ensuring UI elements reflect the reverted state.
     */
    guardedValueInstance.revertStaged = function () {
        // Force a UI refresh for subscribers, even if the value ends up being the same.
        currentObservableState.valueHasMutated();
        // Synchronize the staged value back to the committed value.
        stagedValueCandidate = currentObservableState();
    };

    /**
     * Allows inspection of the currently staged (pending) value without affecting
     * the committed state.
     * @returns {any} The value that is currently staged and awaiting commit or revert.
     */
    guardedValueInstance.staged = () => stagedValueCandidate;

    return guardedValueInstance;
};

/**
 * Transforms a standard JavaScript object into a "guarded" object. Each own enumerable
 * property of the input object is converted into a `dataGuard.guardedData` instance.
 * This pattern facilitates transactional editing for entire data models.
 *
 * @param {Object} inputObject The source object whose properties will be guarded.
 * @returns {Object & {applyAllChanges: Function, discardAllChanges: Function}}
 *          A new object where properties are guarded observables, plus methods for
 *          batch committing or reverting all changes within the object.
 * @throws {Error} Throws an error if the input is not a valid non-array object.
 */
dataGuard.guardedDataObject = function (inputObject) {
    // Input validation: ensure a proper object is provided.
    if (typeof inputObject !== 'object' || inputObject === null || Array.isArray(inputObject)) {
        throw new Error("dataGuard.guardedDataObject: Invalid input. Expected a non-null, non-array object. Received: " + typeof inputObject);
    }

    // A constructor-like function to build the guarded item, offering better encapsulation.
    const GuardedItemBuilder = function (sourceData) {
        // Iterate over the source object's direct properties and create guarded observables for each.
        Object.keys(sourceData).forEach(memberKey => {
            this[memberKey] = dataGuard.guardedData(sourceData[memberKey]);
        });

        /**
         * Iterates through all guarded properties of this object and commits
         * their staged values to their respective underlying observables.
         */
        this.applyAllChanges = function () {
            for (const memberKey in this) {
                // Ensure it's an own property and that it has a 'commit' method (i.e., it's a guardedData instance).
                if (Object.prototype.hasOwnProperty.call(this, memberKey) && typeof this[memberKey].commit === 'function') {
                    this[memberKey].commit();
                }
            }
        };

        /**
         * Iterates through all guarded properties of this object and reverts
         * any staged changes, restoring them to their last committed state.
         */
        this.discardAllChanges = function () {
            Object.keys(this).forEach(memberKey => {
                if (Object.prototype.hasOwnProperty.call(this, memberKey) && typeof this[memberKey].revertStaged === 'function') {
                    this[memberKey].revertStaged();
                }
            });
        };
    };

    return new GuardedItemBuilder(inputObject);
};

/**
 * Transforms an array of plain JavaScript objects into an array of
 * `dataGuard.guardedDataObject` instances. This is ideal for managing
 * transactional edits within collections of data models.
 *
 * @param {Array<Object>} sourceCollection The array of objects to be converted.
 * @returns {Array<Object> & {commitAll: Function, revertAll: Function}}
 *          An array where each element is a `dataGuard.guardedDataObject`,
 *          with additional methods to commit or revert changes across the entire collection.
 * @throws {Error} Throws an error if the input is not a valid array.
 */
dataGuard.createGuardedCollection = function (sourceCollection) {
    // Input validation: ensure the source is an array.
    if (!Array.isArray(sourceCollection)) {
        throw new Error("dataGuard.createGuardedCollection: Input must be an array. Received: " + typeof sourceCollection);
    }

    // Use the standard Array.prototype.map method to transform each item.
    // Each original item is converted into a guardedDataObject.
    const transformedItems = sourceCollection.map(individualItem => {
        return dataGuard.guardedDataObject(individualItem);
    });

    /**
     * Adds a convenience method to the returned array to commit changes
     * for all guarded data objects within the collection.
     */
    transformedItems.commitAll = function() {
        this.forEach(guardedObj => {
            if (typeof guardedObj.applyAllChanges === 'function') {
                guardedObj.applyAllChanges();
            }
        });
    };

    /**
     * Adds a convenience method to the returned array to revert changes
     * for all guarded data objects within the collection.
     */
    transformedItems.revertAll = function() {
        this.forEach(guardedObj => {
            if (typeof guardedObj.discardAllChanges === 'function') {
                guardedObj.discardAllChanges();
            }
        });
    };

    return transformedItems;
};