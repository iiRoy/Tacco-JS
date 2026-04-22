// ==CompilerSettings==
// @optimization_level ADVANCED_OPTIMIZATIONS
// @output_file_name compiled.js
// @language ES5
// ==/CompilerSettings==

/*
 * Author: Chris Scott <chris.scott@factmint.com>
 * Distributed with and licensed under the MIT license terms.
 */
window['$dataFlux'] = {};

$dataFlux.$coreModules = {};

/**
 * Attaches a top-level property getter and setter to an object's member.
 * This is distinct from deep property handling, as it ensures the entire view is re-rendered.
 * View updates should primarily occur at this level, as controllers might depend on various model parts.
 *
 * @param {object} targetObj The object to which the property will be added.
 * @param {string} fieldName The name of the property to define.
 */
$dataFlux.$coreModules.attachDataField = function(targetObj, fieldName) {
    Object.defineProperty(targetObj, fieldName, {
        enumerable: true,
        configurable: true,
        get: function() {
            return this._valStore[fieldName];
        },
        set: function(newValue) {
            this.refreshDisplay(fieldName, newValue);
            this._valStore[fieldName] = newValue;
            $dataFlux.$coreModules.propagateCallbacks(newValue, this, [fieldName], newValue);
        }
    });
};

/**
 * Recursively scans through a data structure to apply property setters.
 * Setters are applied via a separate method to ensure proper closure scoping.
 *
 * @param {object|array} currentEntity The current object or array being processed.
 * @param {object} viewMgr The main view manager instance.
 * @param {string[]} pathSegments An array representing the current path to 'currentEntity'.
 * @param {object} rootEntity The original top-level entity.
 */
$dataFlux.$coreModules.propagateCallbacks = function(currentEntity, viewMgr, pathSegments, rootEntity) {
    if (currentEntity instanceof Object || currentEntity instanceof Array) {
        for (var subPropKey in currentEntity) {
            $dataFlux.$coreModules.registerDeepProperty(currentEntity, subPropKey, viewMgr, pathSegments);
            var nextPath = pathSegments.concat([subPropKey]);
            $dataFlux.$coreModules.propagateCallbacks(currentEntity[subPropKey], viewMgr, nextPath, rootEntity);
        }

        if (currentEntity instanceof Array) {
            // Overhaul array mutating methods like push, pop, etc.
            $dataFlux.$coreModules.enhanceArrayMethods(currentEntity, viewMgr, pathSegments);
        }
    }
};

/**
 * Defines a getter and setter for a nested property within the data model.
 * It maintains references to the root controller and the full path to the current property.
 * This allows retrieving values from the internal "_valStore" and triggering view updates on the controller.
 *
 * @param {object} targetObject The object containing the nested property.
 * @param {string} keyName The name of the nested property.
 * @param {object} controllerInstance The main controller managing the data flow.
 * @param {string[]} propertyPath The array of keys forming the path to 'targetObject'.
 */
$dataFlux.$coreModules.registerDeepProperty = function(targetObject, keyName, controllerInstance, propertyPath) {
    controllerInstance._valStore[propertyPath.concat([keyName]).join('.')] = targetObject[keyName];
    Object.defineProperty(targetObject, keyName, {
        enumerable: true,
        configurable: true,
        get: function() {
            return controllerInstance._valStore[propertyPath.concat([keyName]).join('.')];
        },
        set: function(dataValue) {
            controllerInstance._valStore[propertyPath.concat([keyName]).join('.')] = dataValue;
            // Recursively process child members to ensure consistency
            $dataFlux.$coreModules.recursivelyUpdateChildren(targetObject, controllerInstance, propertyPath);

            // Since the setter is already established, we simply update the view.
            // This differs from array modifications which might require a full model member reset.
            // Note: A full update like controllerInstance[propertyPath[0]] = controllerInstance[propertyPath[0]]
            // would cause an infinite loop if applied within an array push scenario.
            controllerInstance.refreshDisplay(propertyPath[0], controllerInstance[propertyPath[0]]);
        }
    });
};

/**
 * Recursively updates internal storage for all child members of an object or array.
 *
 * @param {object|array} containerObj The parent object or array whose children need updating.
 * @param {object} controlUnit The primary control unit instance.
 * @param {string[]} elementPath The path leading to 'containerObj'.
 */
$dataFlux.$coreModules.recursivelyUpdateChildren = function(containerObj, controlUnit, elementPath) {
    if (containerObj instanceof Object || containerObj instanceof Array) {
        for (var itemKey in containerObj) {
            var childPath = elementPath.concat([itemKey]);
            controlUnit._valStore[childPath.join('.')] = containerObj[itemKey];
            $dataFlux.$coreModules.recursivelyUpdateChildren(containerObj[itemKey], controlUnit, childPath);
        }
    }
};

/**
 * Enhances standard array methods (push, pop, etc.) to trigger model updates.
 * While the array itself has a setter (changing it to another array updates the view),
 * adding new elements directly (e.g., `arr[n+1] = value`) won't trigger view updates
 * unless the entire array's root member is reassigned. This function addresses common mutating methods.
 *
 * @param {Array} dataArray The array whose methods are to be overridden.
 * @param {object} viewController The instance managing the view updates.
 * @param {string[]} currentPath The path to the 'dataArray' within the model.
 */
$dataFlux.$coreModules.enhanceArrayMethods = function(dataArray, viewController, currentPath) {
    // Override standard array mutating methods to ensure view synchronization
    dataArray.addItem = function() {
        var resultValue = Array.prototype.push.apply(this, arguments);
        viewController[currentPath[0]] = viewController[currentPath[0]];
        return resultValue;
    };

    dataArray.removeItem = function() {
        // The item returned must be a deep copy to prevent issues if it was still linked to the array.
        var removedItem = $dataFlux.$coreModules.deepCopy(Array.prototype.pop.call(dataArray));
        viewController[currentPath[0]] = viewController[currentPath[0]];
        return removedItem;
    };

    dataArray.prependItem = function() {
        // Essential to clone the array; otherwise, due to getter behavior,
        // setting index 'n' might incorrectly affect index 'n+1'.
        var temporaryStorage = $dataFlux.$coreModules.deepCopy(this);
        var idx = 0;
        for (; idx < arguments.length; idx++) {
            this[idx] = arguments[idx];
        }
        for (var j = 0; j < temporaryStorage.length; j++) {
            this[idx++] = temporaryStorage[j];
        }
        viewController[currentPath[0]] = viewController[currentPath[0]];
        return this.length;
    };

    dataArray.extractFirst = function() {
        // The return value must be a deep copy; otherwise, it might remain linked to the array's first element.
        var firstElement = $dataFlux.$coreModules.deepCopy(Array.prototype.shift.call(this));
        viewController[currentPath[0]] = viewController[currentPath[0]];
        return firstElement;
    };

    dataArray.invertOrder = function() {
        // Cloning is crucial. Without it, the getter mechanism could lead to incorrect reversals.
        // E.g., for [A,B,C], C moves to [0], then A (from original [0]) moves to [2], but now C is also at [0].
        var tempArr = $dataFlux.$coreModules.deepCopy(this);
        for (var k = 0; k < this.length; k++) {
            this[k] = tempArr[this.length - 1 - k];
        }
        return this;
    };

    dataArray.orderElements = function() {
        // Cloning is vital to prevent getters from causing unexpected side effects during sorting.
        // A direct sort could cause setting one index to alter another due to shared references.
        var sortedTemp = $dataFlux.$coreModules.deepCopy(this);
        Array.prototype.sort.apply(sortedTemp, arguments);
        for (var l = 0; l < this.length; l++) {
            this[l] = sortedTemp[l];
        }
        return this;
    };

    dataArray.modifySegments = function() {
        // Cloning is essential to maintain getter synchronization during splice operations.
        var interimArray = $dataFlux.$coreModules.deepCopy(this);
        var elemIndex = 0;
        for (; elemIndex < interimArray.length && elemIndex < arguments[0]; elemIndex++) {
            this[elemIndex] = interimArray[elemIndex];
        }
        for (var m = 2; m < arguments.length; m++) {
            this[elemIndex++] = arguments[m];
        }
        for (var n = (arguments[0] + arguments[1]); n < interimArray.length; n++) {
            this[elemIndex++] = interimArray[n];
        }
        for (var p = elemIndex; p < interimArray.length; p++) {
            this.removeItem(); // Use the overridden pop method
        }
        viewController[currentPath[0]] = viewController[currentPath[0]];
        return this;
    };
};

/**
 * Performs a deep copy of an object or array.
 * This is necessary in several cases to avoid infinite recursion
 * or unintended reference issues due to custom setters.
 *
 * @param {object|array} sourceObject The object or array to be cloned.
 * @returns {object|array} A new, deep-copied instance of the source.
 */
$dataFlux.$coreModules.deepCopy = function(sourceObject) {
    var duplicate;
    if (sourceObject instanceof Array) {
        duplicate = [];
    } else {
        duplicate = {};
    }
    for (var propName in sourceObject) {
        if (sourceObject[propName] instanceof Object || sourceObject[propName] instanceof Array)
            duplicate[propName] = $dataFlux.$coreModules.deepCopy(sourceObject[propName]);
        else
            duplicate[propName] = sourceObject[propName];
    }
    return duplicate;
};

/**
 * Main DataFlowController constructor.
 * This is internally aliased by the public DataFlux function.
 *
 * @param {object} dataObject The initial data model.
 * @param {HTMLElement} displayElement The DOM element associated with this controller, defaults to document.body.
 * @param {object} controlHandlers Custom handlers for specific model properties.
 */
$dataFlux.$coreModules.DataFlowController = function(dataObject, displayElement, controlHandlers) {
    this.displayElement = (displayElement) ? displayElement : document.body;
    this.controlHandlers = (controlHandlers) ? controlHandlers : {};
    for (var i = 0; i < this.startupRoutines.length; i++) {
        if (this.startupRoutines[i] instanceof Function) {
            this.startupRoutines[i](this.displayElement);
        }
    }
    // Finally, set the data model, which triggers property registration
    this.dataObject = dataObject;
};

$dataFlux.$coreModules.DataFlowController.prototype = {
    // The "_valStore" object holds direct references to all model members and sub-members,
    // bypassing custom getters and setters for internal access.
    "_valStore": {},

    // Prototypal setter for the top-level data model.
    // This is the entry point for defining or updating the entire model.
    set dataObject(inputModel) {
        for (var memberKey in inputModel) {
            $dataFlux.$coreModules.attachDataField(this, memberKey);
            this[memberKey] = inputModel[memberKey];
        }
    },

    /**
     * Triggers an update to the associated view.
     *
     * @param {string} propKey The name of the property that changed.
     * @param {*} dataValue The new value of the property.
     */
    refreshDisplay: function(propKey, dataValue) {
        for (var j = 0; j < this.defaultHandlers.length; j++) {
            if (this.defaultHandlers[j] instanceof Function) {
                this.defaultHandlers[j](propKey, dataValue, this.displayElement);
            }
        }
        if (typeof(this.controlHandlers[propKey]) !== 'undefined' && this.controlHandlers[propKey] instanceof Function) {
            this.controlHandlers[propKey](dataValue, this.displayElement);
        }
    },

    // An array to hold default view handlers, acting as plugins.
    "defaultHandlers": [],
    // An array for startup routines or initialization plugins.
    "startupRoutines": []
};

// Expose internal components for plugin development
$dataFlux["defaultHandlers"] = $dataFlux.$coreModules.DataFlowController.prototype.defaultHandlers;
$dataFlux["startupRoutines"] = $dataFlux.$coreModules.DataFlowController.prototype.startupRoutines;
$dataFlux["dataRegistry"] = {};

/*
 * This represents the public-facing interface of the framework.
 *
 * Example Usage:
 *      var productData = new DataFlux({
 *          productId: 101,
 *          vendorInfo: {
 *              name: "MegaCorp",
 *              code: "MC-007",
 *              taxId: "XYZ123"
 *          },
 *          productName: "Quantum Widget",
 *          descriptionText: "A cutting-edge device.",
 *          retailers: []
 *      });
 *
 *      productData.productName = "Super Widget"; // This will trigger view updates.
 *
 * By default, the associated view is the document's body, but any valid DOM element can be specified.
 *
 * The 'eventHandlers' parameter is an object mapping top-level model properties to functions.
 * Each function will execute when its corresponding model property is updated.
 * An empty object is the default, allowing plugins (via 'defaultHandlers') to manage updates.
 */
window["DataFlux"] = function(inputModel, targetView, eventHandlers) {
    return new $dataFlux.$coreModules.DataFlowController(inputModel, targetView, eventHandlers);
};