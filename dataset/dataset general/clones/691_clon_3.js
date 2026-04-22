// == Core Framework Directives ==
// @module_name NucleusEngine
// @version 1.1.0
// @license MIT

/**
 * The Nucleus Engine - A lightweight model-view-viewcontroller (MVVC) library.
 * Copyright (c) 2023 [Your Name/Org]
 */
window['Nucleus'] = {}; // Global API entry point
Nucleus._core_ = {}; // Internal utilities and private methods

/**
 * Creates a unique path string from an array of segments.
 * @param {Array<string>} segments - Path components.
 * @returns {string} The joined path string.
 */
Nucleus._core_.getPathString = function(segments) {
    if (!Array.isArray(segments) || segments.length === 0) {
        return '';
    }
    return segments.join('.');
};

/**
 * Establishes a top-level accessor (getter/setter) for a primary model attribute.
 * This ensures that changes to root properties trigger a view update and deep observation.
 * @param {object} parentObject - The MVVC instance.
 * @param {string} attributeName - The name of the attribute to observe.
 */
Nucleus._core_.establishRootAccessor = function(parentObject, attributeName) {
    if (!parentObject || typeof attributeName !== 'string' || attributeName.length === 0) {
        console.error("Invalid arguments for establishRootAccessor.");
        return;
    }

    Object.defineProperty(parentObject, attributeName, {
        enumerable: true, // Ensure it's visible in enumerations
        configurable: true, // Allow redefinition if needed
        get: function() {
            // Retrieve the actual data from the internal state store
            const fullPath = Nucleus._core_.getPathString([attributeName]);
            return this._stateStore_[fullPath];
        },
        set: function(newValue) {
            // Validate input for non-null/undefined
            if (newValue === undefined) {
                console.warn(`Setting root attribute '${attributeName}' to undefined.`);
            }

            // Trigger view update before state change to reflect pending state
            this.notifyObservers(attributeName, newValue);

            // Update the internal state store directly
            const fullPath = Nucleus._core_.getPathString([attributeName]);
            this._stateStore_[fullPath] = newValue;

            // Recursively apply observers to nested structures
            Nucleus._core_.processNestedObservables(newValue, this, [attributeName], newValue);
        }
    });
};

/**
 * Recursively traverses data structures to apply deep observation.
 * This method ensures that all nested objects and arrays within a model
 * are properly instrumented for change detection.
 * @param {object|Array} dataSegment - The current part of the model being processed.
 * @param {object} mvvcContext - The main MVVC instance.
 * @param {Array<string>} currentPathSegments - The path from the root to the current data segment.
 * @param {*} rootModelValue - The value of the top-level model member (for context).
 */
Nucleus._core_.processNestedObservables = function(dataSegment, mvvcContext, currentPathSegments, rootModelValue) {
    // Only process objects or arrays; primitives don't need deep observation
    if (dataSegment === null || typeof dataSegment !== 'object') {
        return;
    }

    // Iterate over properties/elements
    const keys = Array.isArray(dataSegment) ? Array.from({length: dataSegment.length}, (_, i) => i.toString()) : Object.keys(dataSegment);

    keys.forEach(subKey => {
        // Ensure we're not processing inherited properties
        if (!Object.prototype.hasOwnProperty.call(dataSegment, subKey)) {
            return;
        }

        const newPath = currentPathSegments.concat([subKey]);
        Nucleus._core_.configureNestedAccessor(dataSegment, subKey, mvvcContext, currentPathSegments);
        Nucleus._core_.processNestedObservables(dataSegment[subKey], mvvcContext, newPath, rootModelValue);
    });

    // Special handling for arrays to override mutating methods
    if (Array.isArray(dataSegment)) {
        Nucleus._core_.instrumentArrayMethods(dataSegment, mvvcContext, currentPathSegments);
    }
};

/**
 * Configures a getter and setter for a nested property within the data model.
 * This allows for deep observation and ensures the internal state store is kept consistent.
 * @param {object} parentContainer - The object holding the nested property.
 * @param {string} nestedPropKey - The name of the nested property.
 * @param {object} mvvcContext - The main MVVC instance.
 * @param {Array<string>} pathToParent - The path segments leading to the parent container.
 */
Nucleus._core_.configureNestedAccessor = function(parentContainer, nestedPropKey, mvvcContext, pathToParent) {
    if (!parentContainer || typeof nestedPropKey !== 'string' || nestedPropKey.length === 0 || !mvvcContext || !Array.isArray(pathToParent)) {
        console.error("Invalid arguments for configureNestedAccessor.");
        return;
    }

    const fullPropertyPath = Nucleus._core_.getPathString(pathToParent.concat([nestedPropKey]));
    // Initial sync of the nested property's value into the internal state store
    if (mvvcContext._stateStore_ && parentContainer[nestedPropKey] !== undefined) {
        mvvcContext._stateStore_[fullPropertyPath] = parentContainer[nestedPropKey];
    }

    Object.defineProperty(parentContainer, nestedPropKey, {
        enumerable: true,
        configurable: true,
        get: function() {
            // Retrieve value from the internal state store for consistency
            return mvvcContext._stateStore_[fullPropertyPath];
        },
        set: function(newValue) {
            // Update the internal state store first
            mvvcContext._stateStore_[fullPropertyPath] = newValue;

            // Propagate changes to any child members if the new value is an object/array
            Nucleus._core_.replicateChildStates(parentContainer, mvvcContext, pathToParent);

            // Trigger notification for the top-level model member
            // This is a common pattern to ensure view updates, even for deep changes.
            // It effectively re-assigns the root property to itself, triggering its setter.
            if (pathToParent.length > 0) {
                const rootPropertyIdentifier = pathToParent[0];
                mvvcContext.dataModel[rootPropertyIdentifier] = mvvcContext.dataModel[rootPropertyIdentifier];
            } else {
                console.warn("Attempted to update root property without a path. This should be handled by establishRootAccessor.");
            }
        }
    });
};

/**
 * Recursively copies values from an object/array into the internal state store.
 * This is primarily used when a nested property's value is updated to an object/array,
 * ensuring all its children are also accounted for in the state store.
 * @param {object|Array} sourceEntity - The object or array whose children need replication.
 * @param {object} mvvcContext - The main MVVC instance.
 * @param {Array<string>} currentBasePath - The path segments leading to the sourceEntity.
 */
Nucleus._core_.replicateChildStates = function(sourceEntity, mvvcContext, currentBasePath) {
    if (sourceEntity === null || typeof sourceEntity !== 'object') {
        return; // Only process objects or arrays
    }

    const keysToProcess = Array.isArray(sourceEntity) ? Array.from({length: sourceEntity.length}, (_, i) => i.toString()) : Object.keys(sourceEntity);

    keysToProcess.forEach(key => {
        if (!Object.prototype.hasOwnProperty.call(sourceEntity, key)) {
            return;
        }
        const childPath = currentBasePath.concat([key]);
        const childFullPathString = Nucleus._core_.getPathString(childPath);

        mvvcContext._stateStore_[childFullPathString] = sourceEntity[key];
        Nucleus._core_.replicateChildStates(sourceEntity[key], mvvcContext, childPath);
    });
};

/**
 * Overrides mutating array methods (`push`, `pop`, etc.) to trigger model updates.
 * This ensures that direct array manipulations also notify observers.
 * @param {Array} targetArray - The array to instrument.
 * @param {object} mvvcContext - The main MVVC instance.
 * @param {Array<string>} pathToArray - The path segments leading to the targetArray.
 */
Nucleus._core_.instrumentArrayMethods = function(targetArray, mvvcContext, pathToArray) {
    if (!Array.isArray(targetArray) || !mvvcContext || !Array.isArray(pathToArray) || pathToArray.length === 0) {
        console.error("Invalid arguments for instrumentArrayMethods.");
        return;
    }

    const rootModelKey = pathToArray[0];

    // Helper to trigger the root model property's setter
    const triggerRootUpdate = () => {
        mvvcContext.dataModel[rootModelKey] = mvvcContext.dataModel[rootModelKey];
    };

    // Store original methods to call them
    const originalPush = Array.prototype.push;
    const originalPop = Array.prototype.pop;
    const originalUnshift = Array.prototype.unshift;
    const originalShift = Array.prototype.shift;
    const originalReverse = Array.prototype.reverse;
    const originalSort = Array.prototype.sort;
    const originalSplice = Array.prototype.splice;

    targetArray.push = function(...args) {
        const result = originalPush.apply(this, args);
        triggerRootUpdate(); // Notify after mutation
        return result;
    };

    targetArray.pop = function() {
        const poppedItem = originalPop.call(this);
        const clonedItem = Nucleus._core_.deepCopy(poppedItem); // Clone return value to avoid reference issues
        triggerRootUpdate();
        return clonedItem;
    };

    targetArray.unshift = function(...args) {
        const result = originalUnshift.apply(this, args);
        triggerRootUpdate();
        return result;
    };

    targetArray.shift = function() {
        const shiftedItem = originalShift.call(this);
        const clonedItem = Nucleus._core_.deepCopy(shiftedItem); // Clone return value
        triggerRootUpdate();
        return clonedItem;
    };

    targetArray.reverse = function() {
        originalReverse.call(this); // Perform the reversal
        triggerRootUpdate();
        return this; // Return the array itself
    };

    targetArray.sort = function(compareFn) {
        originalSort.call(this, compareFn); // Perform the sort
        triggerRootUpdate();
        return this; // Return the array itself
    };

    targetArray.splice = function(...args) {
        const removedItems = originalSplice.apply(this, args);
        // The original implementation had a custom splice that was quite complex.
        // Using native splice and then triggering update is generally safer.
        triggerRootUpdate();
        return removedItems.map(item => Nucleus._core_.deepCopy(item)); // Return cloned removed items
    };
};

/**
 * Performs a deep copy of an object or array.
 * Essential for array methods that need to work with detached copies to prevent infinite loops
 * or unexpected side effects due to getters/setters.
 * @param {*} source - The item to copy.
 * @returns {*} A deep copy of the source.
 */
Nucleus._core_.deepCopy = function(source) {
    if (source === null || typeof source !== 'object') {
        return source; // Return primitives directly
    }

    let clonedEntity;
    if (Array.isArray(source)) {
        clonedEntity = [];
        for (let i = 0; i < source.length; i++) {
            clonedEntity[i] = Nucleus._core_.deepCopy(source[i]);
        }
    } else {
        clonedEntity = {};
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                clonedEntity[key] = Nucleus._core_.deepCopy(source[key]);
            }
        }
    }
    return clonedEntity;
};

/**
 * Main constructor for the ViewModelManager.
 * This class orchestrates the observation of a data model and its interaction with views and controllers.
 * @param {object} initialModel - The initial data model to manage.
 * @param {HTMLElement} [renderingTarget=document.body] - The DOM element associated with this view model.
 * @param {object} [customEventHandlers={}] - An object mapping model properties to handler functions.
 */
Nucleus._core_.ViewModelManager = function(initialModel, renderingTarget, customEventHandlers) {
    // Validate initial model
    if (typeof initialModel !== 'object' || initialModel === null) {
        console.error("ViewModelManager requires a non-null object as its initial model.");
        this._isInvalid_ = true; // Mark instance as invalid
        return;
    }

    this.renderTarget = renderingTarget instanceof HTMLElement ? renderingTarget : document.body;
    this.customEventHandlers = customEventHandlers && typeof customEventHandlers === 'object' ? customEventHandlers : {};

    // Execute any registered setup hooks for the view
    this.setupHooks.forEach(hook => {
        if (typeof hook === 'function') {
            hook(this.renderTarget);
        }
    });

    // Finally, assign the model which triggers the observation setup
    this.dataModel = initialModel;
};

/**
 * Prototype methods and properties for ViewModelManager.
 */
Nucleus._core_.ViewModelManager.prototype = {
    // Internal flat store for raw data values, bypassing getters/setters.
    // Using Object.create(null) prevents prototype chain pollution.
    _stateStore_: Object.create(null),

    // ES6 style setter for the 'dataModel' property.
    // This is the primary entry point for assigning a new data model.
    set dataModel(newModel) {
        if (typeof newModel !== 'object' || newModel === null) {
            console.error("Attempted to set dataModel to a non-object or null value.");
            return;
        }
        // Iterate over the new model's properties and establish observation
        for (const memberKey in newModel) {
            if (Object.prototype.hasOwnProperty.call(newModel, memberKey)) {
                Nucleus._core_.establishRootAccessor(this, memberKey);
                // Assigning here triggers the setter we just defined for 'memberKey'
                this[memberKey] = newModel[memberKey];
            }
        }
    },

    // Method to notify all relevant observers (global and custom) about a change.
    /**
     * Notifies registered handlers about a change to a model property.
     * @param {string} changedProperty - The name of the property that changed.
     * @param {*} updatedValue - The new value of the property.
     */
    notifyObservers: function(changedProperty, updatedValue) {
        if (typeof changedProperty !== 'string' || changedProperty.length === 0) {
            console.warn("notifyObservers called with invalid property name.");
            return;
        }

        // Execute global, framework-level handlers
        this.globalHandlers.forEach(handler => {
            if (typeof handler === 'function') {
                handler(changedProperty, updatedValue, this.renderTarget);
            }
        });

        // Execute custom, instance-specific handlers
        const specificHandler = this.customEventHandlers[changedProperty];
        if (typeof specificHandler === 'function') {
            specificHandler(updatedValue, this.renderTarget);
        }
    },

    // Array to hold globally registered view controller functions (plugins).
    "globalHandlers": [],

    // Array to hold functions that run once when the ViewModelManager is initialized.
    "setupHooks": []
};

// Expose core arrays for plugin registration via the global Nucleus object.
Nucleus["globalHandlers"] = Nucleus._core_.ViewModelManager.prototype.globalHandlers;
Nucleus["setupHooks"] = Nucleus._core_.ViewModelManager.prototype.setupHooks;
Nucleus["dataCache"] = {}; // A general-purpose store accessible by plugins/external code.

/*
 * This is the public facing factory function for creating new Nucleus instances.
 *
 * Example Usage:
 *		const myProduct = new NucleusEngine({
 *			id: "P123",
 *			details: {
 *				name: "Gizmo",
 *				price: 99.99
 *			},
 *			tags: ["electronic", "gadget"]
 *		}, document.getElementById('product-display'));
 *
 *		myProduct.details.price = 109.99; // This change will trigger observers
 *
 * The 'renderingTarget' can be any DOM element, defaulting to 'document.body'.
 * The 'customEventHandlers' object allows defining specific functions for top-level
 * model property changes. These run in addition to any global handlers.
 */
window["NucleusEngine"] = function(modelData, targetElement, eventHandlers) {
    const instance = new Nucleus._core_.ViewModelManager(modelData, targetElement, eventHandlers);
    if (instance._isInvalid_) {
        // Return null or throw an error if the instance was not properly initialized
        return null;
    }
    return instance;
};