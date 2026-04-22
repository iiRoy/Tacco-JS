/*
 * StateReverter.js v1.0.1
 *
 * Copyright (c)2024 Advanced Development Team
 * Licensed under the Apache License, Version 2.0
 *
 * Comprehensive documentation and usage examples are available at
 * https://github.com/your-org/StateReverter.js
 */

(function (moduleFactory) {
    if (typeof define === "function" && define.amd) {
        // Asynchronous Module Definition support
        define(["underscore", "backbone"], moduleFactory);
    } else if (typeof exports === 'object' && typeof module !== 'undefined') {
        // CommonJS environment support
        module.exports = moduleFactory;
    } else {
        // Global scope execution (browser)
        moduleFactory(_, Backbone);
    }
})(function (_util, ModelFramework) {

    var baseArraySlicer = Array.prototype.slice;

    /**
     * Executes a given function with provided arguments, optimizing for small argument counts.
     * This method is generally faster than `Function.prototype.apply` for a limited number of arguments.
     *
     * @param  {Function} targetFunc  The function to be invoked.
     * @param  {Object}   execContext The context (`this`) in which the function should be called.
     * @param  {Array}    funcArguments An array of arguments to pass to the function.
     * @returns {*} Returns the result of the invoked function.
     */
    function executeFunctionWithArgs(targetFunc, execContext, funcArguments) {
        var argCount = funcArguments ? funcArguments.length : 0;
        if (argCount === 0) return targetFunc.call(execContext);
        if (argCount === 1) return targetFunc.call(execContext, funcArguments[0]);
        if (argCount === 2) return targetFunc.call(execContext, funcArguments[0], funcArguments[1]);
        if (argCount === 3) return targetFunc.call(execContext, funcArguments[0], funcArguments[1], funcArguments[2]);
        if (argCount === 4) return targetFunc.call(execContext, funcArguments[0], funcArguments[1], funcArguments[2], funcArguments[3]);
        // Fallback to apply for larger argument lists
        return targetFunc.apply(execContext, funcArguments);
    }

    /**
     * Extracts a portion of an array or an array-like object into a new array.
     *
     * @param  {Array|Object} sourceCollection The array or array-like object to slice.
     * @param  {Number}       [startIndex=0]   The zero-based index at which to begin extraction.
     * @returns {Array} A new array containing the extracted elements.
     */
    function extractSubArray(sourceCollection, startIndex) {
        return baseArraySlicer.call(sourceCollection, startIndex || 0);
    }

    /**
     * Determines if an object possesses one or more specified keys.
     * The keys do not necessarily need to be direct own properties.
     * This function supports two calling conventions:
     * 1. `checkObjectProperties(myObject, ["keyA", "keyB"])`
     * 2. `checkObjectProperties(myObject, "keyA", "keyB")`
     *
     * @param  {Object}   targetObject The object to inspect.
     * @param  {Array|...String}  candidateKeys  An array of keys or multiple string arguments representing keys to check for.
     * @returns {Boolean} `true` if the object contains all specified keys; otherwise, `false`.
     */
    function checkObjectProperties(targetObject, candidateKeys) {
        if (targetObject == null) {
            return false;
        }

        var keysToCheck = Array.isArray(candidateKeys) ? candidateKeys : extractSubArray(arguments, 1);

        // Ensure all keys exist in the object (even if inherited)
        return keysToCheck.every(function (keyName) {
            return keyName in targetObject;
        });
    }

    /**
     * Generates a numerical identifier that is unique within a single JavaScript call stack execution.
     * This identifier increments only after the current call stack has fully unwound.
     *
     * This mechanism helps group related state changes that occur "simultaneously"
     * within the same logical operation (e.g., multiple attribute sets in one function call)
     * into a single undo/redo unit.
     *
     * @returns {number} A unique numerical identifier for the current execution flow.
     */
    var getUniqueExecutionId = (function () {
        var flowIdUpdatedThisCycle = false;
        var currentExecutionIdentifier = -1;

        function refreshFlowIdentifier() {
            currentExecutionIdentifier++;
            flowIdUpdatedThisCycle = true;
            // Schedule reset for the next event loop tick, ensuring it runs after current stack completes.
            _util.defer(function () {
                flowIdUpdatedThisCycle = false;
            });
        }

        return function () {
            if (!flowIdUpdatedThisCycle) {
                refreshFlowIdentifier();
            }
            return currentExecutionIdentifier;
        };
    })();

    /**
     * A utility for tracking objects to prevent redundant event listener bindings.
     * It uses a dual storage strategy:
     * - For Backbone-like objects with a `cid`, it uses the `cid` as an object property for fast lookup.
     * - For other objects, it stores them directly in an array.
     *
     * @constructor
     */
    function ManagedObjectTracker() {
        /**
         * Stores objects. `cid`-based objects are stored as properties,
         * others are pushed into this array.
         * @type {Array<Object>}
         */
        this.trackedEntities = [];

        /**
         * Stores the `cid`s of Backbone-like objects to facilitate retrieval of all tracked items.
         * @type {Array<string>}
         */
        this.cidKeys = [];
    }

    ManagedObjectTracker.prototype = {
        /**
         * Checks if a given object is already being tracked by this registry.
         *
         * @param  {Object}   candidateObject The object to verify.
         * @returns {Boolean} `true` if the object is tracked; otherwise, `false`.
         */
        isEntityTracked: function (candidateObject) {
            if (!candidateObject) {
                return false; // Guard against null/undefined input
            }
            if (candidateObject.cid) {
                return !!this.trackedEntities[candidateObject.cid];
            } else {
                return this.trackedEntities.includes(candidateObject); // ES6 Array.prototype.includes
            }
        },

        /**
         * Adds an object to the tracking registry if it's not already present.
         *
         * @param  {Object}   objectToEnroll The object to add.
         * @returns {Boolean} `true` if the object was newly enrolled; `false` if it was already tracked.
         */
        enrollEntity: function (objectToEnroll) {
            if (!objectToEnroll) {
                return false; // Cannot enroll null/undefined
            }
            if (!this.isEntityTracked(objectToEnroll)) {
                if (objectToEnroll.cid) {
                    this.trackedEntities[objectToEnroll.cid] = objectToEnroll;
                    this.cidKeys.push(objectToEnroll.cid);
                } else {
                    this.trackedEntities.push(objectToEnroll);
                }
                return true;
            }
            return false; // Object was already tracked
        },

        /**
         * Removes an object from the tracking registry.
         *
         * @param  {Object}   objectToDeregister The object to remove.
         * @returns {Boolean} `true` if the object was successfully deregistered; `false` if it was not found.
         */
        deregisterEntity: function (objectToDeregister) {
            if (!objectToDeregister) {
                return false; // Cannot deregister null/undefined
            }
            if (this.isEntityTracked(objectToDeregister)) {
                if (objectToDeregister.cid) {
                    delete this.trackedEntities[objectToDeregister.cid];
                    var cidIndex = this.cidKeys.indexOf(objectToDeregister.cid);
                    if (cidIndex !== -1) {
                        this.cidKeys.splice(cidIndex, 1);
                    }
                } else {
                    var arrayIndex = this.trackedEntities.indexOf(objectToDeregister);
                    if (arrayIndex !== -1) {
                        this.trackedEntities.splice(arrayIndex, 1);
                    }
                }
                return true;
            }
            return false; // Object was not found/registered
        },

        /**
         * Retrieves an array containing all objects currently held in this registry.
         *
         * @returns {Array<Object>} An array of all tracked objects.
         */
        retrieveAllTracked: function () {
            var cidObjects = this.cidKeys.map(function (cid) {
                return this.trackedEntities[cid];
            }, this);
            var nonCidObjects = this.trackedEntities.filter(function(item) {
                return !item || !item.cid; // Filter out sparse array elements and cid-based objects
            });

            return cidObjects.concat(nonCidObjects);
        }
    };

    /**
     * Attaches or detaches a universal event listener ("all") to a collection of objects.
     * This function manages object registration/deregistration within the provided context's `objectRegistry`.
     *
     * @param  {String}     operationType "on" to bind, "off" to unbind.
     * @param  {Array<Object>}  targetObjects An array of objects to apply the operation to.
     * @param  {Function}   eventHandler The function to be bound/unbound.
     * @param  {Object}     operationContext The context (`this`) for the event handler and containing `objectRegistry`.
     * @returns {void}
     */
    function toggleEventMonitoring(operationType, targetObjects, eventHandler, operationContext) {
        if (!targetObjects || targetObjects.length === 0) {
            return; // No objects to process
        }

        targetObjects.forEach(function (currentObject) {
            if (!currentObject) {
                return; // Skip null or undefined objects
            }

            var success = false;
            if (operationType === "on") {
                success = operationContext.objectRegistry.enrollEntity(currentObject);
            } else { // operationType === "off"
                success = operationContext.objectRegistry.deregisterEntity(currentObject);
            }

            // Only proceed if registration/deregistration was successful or not applicable
            if (success || (operationType === "on" && !success) || (operationType === "off" && !success)) {
                if (typeof currentObject[operationType] === "function") {
                    currentObject[operationType]("all", eventHandler, operationContext);
                }
            }
        });
    }

    /**
     * Invokes the appropriate 'revert' or 'reapply' method for a specific reversal action.
     *
     * @param  {String} actionDirection "revert" or "reapply".
     * @param  {Object} reversalAction The attributes of the reversal action.
     * @returns {void}
     */
    function performReversalStep(actionDirection, reversalAction) {
        var actionKind = reversalAction.type;
        var operationDefinitions = reversalAction.reversalOperations;
        var handlerFunction = operationDefinitions && operationDefinitions[actionKind] ? operationDefinitions[actionKind][actionDirection] : null;

        if (typeof handlerFunction === "function") {
            handlerFunction(reversalAction.object, reversalAction.priorState, reversalAction.postState, reversalAction.options);
        }
    }

    /**
     * Core function for managing undo/redo operations on a reversal history stack.
     *
     * @param  {String}     direction       "revert" or "reapply".
     * @param  {UndoManager}    managerInstance The UndoManager instance triggering the event.
     * @param  {UndoStack}  historyStack    The history stack to operate on.
     * @param  {Boolean}    groupActions    If `true`, processes all actions sharing the same `executionFlowIdentifier`.
     * @param  {Boolean}    processAll      If `true`, processes all available actions until the stack end/beginning.
     * @returns {void}
     */
    function coordinateReversalProcess(direction, managerInstance, historyStack, groupActions, processAll) {
        var isRevertOperation = (direction === "revert");

        // Pre-check for invalid states or stack boundaries
        if (historyStack.isCurrentlyReversing ||
            (isRevertOperation && historyStack.pointer === -1) ||
            (!isRevertOperation && historyStack.pointer === historyStack.length - 1)) {
            return;
        }

        historyStack.isCurrentlyReversing = true;
        var actionsToProcess;
        var currentAction;

        if (processAll) {
            // Process all actions up to the pointer or the entire stack
            if (isRevertOperation) {
                // Revert all from current pointer to beginning
                actionsToProcess = extractSubArray(historyStack.models, 0).slice(0, historyStack.pointer + 1);
            } else {
                // Reapply all from next action to end
                actionsToProcess = extractSubArray(historyStack.models, historyStack.pointer + 1);
            }
        } else {
            // Process a single action or a group of actions
            var targetIndex = isRevertOperation ? historyStack.pointer : historyStack.pointer + 1;
            currentAction = historyStack.at(targetIndex);

            if (!currentAction) { // No action at target index
                historyStack.isCurrentlyReversing = false;
                return;
            }

            actionsToProcess = groupActions ?
                historyStack.models.filter(function(model) {
                    return model.get("executionFlowIdentifier") === currentAction.get("executionFlowIdentifier");
                }) :
                [currentAction];
            
            // Adjust actionsToProcess for revert/reapply to only include relevant ones based on pointer
            if (groupActions) {
                actionsToProcess = actionsToProcess.filter(function(model) {
                    var modelIndex = historyStack.indexOf(model);
                    return isRevertOperation ? (modelIndex <= historyStack.pointer) : (modelIndex > historyStack.pointer);
                });
            }
        }

        // Update the stack pointer based on the number of actions processed
        historyStack.pointer += (isRevertOperation ? -1 : 1) * actionsToProcess.length;

        // Execute each action in the correct order
        if (isRevertOperation) {
            while ((currentAction = actionsToProcess.pop())) {
                performReversalStep(direction, currentAction.attributes);
            }
        } else {
            while ((currentAction = actionsToProcess.shift())) {
                performReversalStep(direction, currentAction.attributes);
            }
        }

        historyStack.isCurrentlyReversing = false;
        managerInstance.trigger(direction, managerInstance);
    }

    /**
     * Evaluates whether a reversal action should be generated for a specific event.
     * This check uses a 'condition' property within the event type's definition in `reversalOperations`.
     * The condition can be a boolean, a function, or absent (defaulting to `true`).
     *
     * @param  {Object}    eventDefinition The object within `StandardReversalOperations` (or custom) for a given event type.
     * @param  {Array<*>}  eventArguments  The arguments passed to the 'capture' handler.
     * @returns {Boolean} `true` if a reversal action should be created; otherwise, `false`.
     */
    function shouldReversalActionBeCreated(eventDefinition, eventArguments) {
        var actionCondition = eventDefinition.condition;
        var conditionType = typeof actionCondition;

        if (conditionType === "function") {
            return !!executeFunctionWithArgs(actionCondition, eventDefinition, eventArguments);
        } else if (conditionType === "boolean") {
            return actionCondition;
        }
        return true; // Default to true if no condition is specified or type is unknown
    }

    /**
     * Appends a new reversal action to the history stack.
     * This function performs checks to ensure tracking is enabled,
     * the event type is supported, and conditions for action creation are met.
     * It also manages stack length and pointer adjustments.
     *
     * @param {ModelFramework.Collection} historyStack The history stack (Backbone Collection) to add the action to.
     * @param {String}                    eventType    The name of the event (e.g., "add", "change").
     * @param {Array<*>}                  eventArgs    The arguments received by the event listener.
     * @param {Object}                    reversalDefinitions The object containing reversal operation definitions.
     * @returns {void}
     */
    function appendReversalActionToHistory(historyStack, eventType, eventArgs, reversalDefinitions) {
        // Ensure tracking is active, not currently reversing, and the event type has defined operations.
        if (!historyStack.track || historyStack.isCurrentlyReversing || !(eventType in reversalDefinitions)) {
            return;
        }

        var typeDefinition = reversalDefinitions[eventType];
        if (!shouldReversalActionBeCreated(typeDefinition, eventArgs)) {
            return; // Condition for creating action not met
        }

        var captureResult = executeFunctionWithArgs(typeDefinition.capture, typeDefinition, eventArgs);

        // A valid reversal action must have 'object', 'priorState', and 'postState'.
        if (checkObjectProperties(captureResult, ["object", "priorState", "postState"])) {
            var newActionAttributes = Object.assign({}, captureResult, {
                type: eventType,
                executionFlowIdentifier: getUniqueExecutionId(),
                reversalOperations: reversalDefinitions // Reference to the operations for execution
            });

            // If the pointer is not at the end, subsequent actions are discarded.
            if (historyStack.pointer < historyStack.length - 1) {
                var itemsToRemove = historyStack.length - historyStack.pointer - 1;
                for (var i = 0; i < itemsToRemove; i++) {
                    historyStack.pop(); // Remove from the end of the collection
                }
            }

            historyStack.pointer = historyStack.length; // Update pointer to new end
            historyStack.add(newActionAttributes); // Add the new action model

            // Enforce maximum stack length
            if (historyStack.length > historyStack.maximumStackLength) {
                historyStack.shift(); // Remove the oldest action from the beginning
                historyStack.pointer--; // Adjust pointer since an item was removed from the start
            }
        }
    }


    /**
     * Defines standard reversal operations for common Backbone events.
     * These operations serve as default handlers for undoing and redoing state changes.
     * @type {Object}
     */
    var StandardReversalOperations = {
        "add": {
            /** Reverts an 'add' operation by removing the model from the collection. */
            revert: function (targetCollection, ignorePrior, addedModel, operationOptions) {
                targetCollection.remove(addedModel, operationOptions);
            },
            /** Reapplies an 'add' operation by adding the model back to the collection. */
            reapply: function (targetCollection, ignorePrior, addedModel, operationOptions) {
                var reapplyOptions = Object.assign({}, operationOptions);
                if (typeof reapplyOptions.index === 'number') {
                    reapplyOptions.at = reapplyOptions.index; // Use 'at' for re-insertion
                }
                targetCollection.add(addedModel, reapplyOptions);
            },
            /** Captures the necessary state for an 'add' operation. */
            capture: function (addedModel, targetCollection, operationOptions) {
                return {
                    object: targetCollection,
                    priorState: undefined, // No prior state for an add
                    postState: addedModel,
                    options: Object.assign({}, operationOptions) // Clone options to prevent mutation
                };
            }
        },
        "remove": {
            /** Reverts a 'remove' operation by adding the model back to its original position. */
            revert: function (targetCollection, removedModel, ignorePost, operationOptions) {
                var revertOptions = Object.assign({}, operationOptions);
                if (typeof revertOptions.index === 'number') {
                    revertOptions.at = revertOptions.index; // Re-insert at original index
                }
                targetCollection.add(removedModel, revertOptions);
            },
            /** Reapplies a 'remove' operation by removing the model from the collection again. */
            reapply: function (targetCollection, removedModel, ignorePost, operationOptions) {
                targetCollection.remove(removedModel, operationOptions);
            },
            /** Captures the necessary state for a 'remove' operation. */
            capture: function (removedModel, targetCollection, operationOptions) {
                return {
                    object: targetCollection,
                    priorState: removedModel,
                    postState: undefined, // No post state for a remove
                    options: Object.assign({}, operationOptions)
                };
            }
        },
        "change": {
            /** Reverts a 'change' operation by setting attributes back to their prior values. */
            revert: function (targetModel, priorAttributes, postAttributes, operationOptions) {
                if (Object.keys(priorAttributes).length === 0) {
                    // If prior state was empty, it implies attributes were newly set, so unset them.
                    Object.keys(postAttributes).forEach(function(key) {
                        targetModel.unset(key, { silent: true }); // Use silent to avoid triggering more change events
                    });
                } else {
                    targetModel.set(priorAttributes, { silent: true });
                    // Handle attributes that were unset as part of the change
                    if (operationOptions && operationOptions.unsetData && operationOptions.unsetData.prior && operationOptions.unsetData.prior.length) {
                        operationOptions.unsetData.prior.forEach(function(key) {
                            targetModel.unset(key, { silent: true });
                        });
                    }
                }
            },
            /** Reapplies a 'change' operation by setting attributes back to their post-change values. */
            reapply: function (targetModel, priorAttributes, postAttributes, operationOptions) {
                if (Object.keys(postAttributes).length === 0) {
                    // If post state was empty, it implies attributes were unset, so unset them again.
                    Object.keys(priorAttributes).forEach(function(key) {
                        targetModel.unset(key, { silent: true });
                    });
                } else {
                    targetModel.set(postAttributes, { silent: true });
                    // Handle attributes that were unset as part of the change
                    if (operationOptions && operationOptions.unsetData && operationOptions.unsetData.post && operationOptions.unsetData.post.length) {
                        operationOptions.unsetData.post.forEach(function(key) {
                            targetModel.unset(key, { silent: true });
                        });
                    }
                }
            },
            /** Captures the necessary state for a 'change' operation. */
            capture: function (targetModel, operationOptions) {
                var currentChangedAttributes = targetModel.changedAttributes();
                var keysChanged = Object.keys(currentChangedAttributes);
                var attributesBeforeChange = {};
                
                // Manually filter previousAttributes for only the changed keys
                keysChanged.forEach(function(key) {
                    if (targetModel.previousAttributes().hasOwnProperty(key)) {
                        attributesBeforeChange[key] = targetModel.previousAttributes()[key];
                    }
                });
                
                var keysBeforeChange = Object.keys(attributesBeforeChange);
                var unsetData = (operationOptions = operationOptions || {}).unsetData = {
                    prior: [], // Attributes that were newly set (didn't exist before)
                    post: []   // Attributes that were unset (existed before, now gone)
                };

                if (keysChanged.length !== keysBeforeChange.length) {
                    // Detect newly added attributes (exist in currentChanged, not in previous for those keys)
                    keysChanged.forEach(function(key) {
                        if (!attributesBeforeChange.hasOwnProperty(key)) {
                            unsetData.prior.push(key);
                        }
                    });
                    // Detect attributes that were unset (exist in previous for those keys, not in currentChanged)
                    keysBeforeChange.forEach(function(key) {
                        if (!currentChangedAttributes.hasOwnProperty(key)) {
                            unsetData.post.push(key);
                        }
                    });
                }

                return {
                    object: targetModel,
                    priorState: attributesBeforeChange,
                    postState: currentChangedAttributes,
                    options: Object.assign({}, operationOptions)
                };
            }
        },
        "reset": {
            /** Reverts a 'reset' operation by restoring the collection to its prior models. */
            revert: function (targetCollection, priorModels, postModels) {
                targetCollection.reset(priorModels);
            },
            /** Reapplies a 'reset' operation by restoring the collection to its post-reset models. */
            reapply: function (targetCollection, priorModels, postModels) {
                targetCollection.reset(postModels);
            },
            /** Captures the necessary state for a 'reset' operation. */
            capture: function (targetCollection, operationOptions) {
                // `previousModels` is a Backbone-specific option passed during 'reset'
                var priorModelsSnapshot = operationOptions ? operationOptions.previousModels : [];
                var currentModelsSnapshot = targetCollection.models.slice(); // Clone current models array

                return {
                    object: targetCollection,
                    priorState: priorModelsSnapshot,
                    postState: currentModelsSnapshot,
                    options: Object.assign({}, operationOptions)
                };
            }
        }
    };

    /**
     * Represents a set of reversal operation definitions specific to an UndoManager instance.
     * This object inherits from `StandardReversalOperations`, allowing for global defaults
     * while enabling instance-specific overrides or additions.
     *
     * @constructor
     */
    function CustomReversalOperations() {}
    CustomReversalOperations.prototype = StandardReversalOperations;

    /**
     * Modifies the reversal operation definitions for a given `CustomReversalOperations` instance.
     * This function supports adding, changing, or removing definitions for event types.
     *
     * Usage patterns:
     * - `updateReversalOperationDefinition(0, "customEvent", { revert: fn, reapply: fn, capture: fn }, myCustomOps)` (Add)
     * - `updateReversalOperationDefinition(1, {"customEvent": { revert: fn }}, myCustomOps)` (Change)
     * - `updateReversalOperationDefinition(2, ["customEvent1", "customEvent2"], null, myCustomOps)` (Remove)
     *
     * @param  {Number}                   modificationType      0 for add, 1 for change, 2 for remove.
     * @param  {String|Object|Array<String>} eventIdentifier     The event type key(s) or an object mapping keys to definitions.
     * @param  {Object}                   [newDefinitions]      Object containing `revert`, `reapply`, `capture` functions.
     * @param  {CustomReversalOperations} targetDefinitionsInstance The `CustomReversalOperations` instance to modify.
     * @returns {void}
     */
    function updateReversalOperationDefinition(modificationType, eventIdentifier, newDefinitions, targetDefinitionsInstance) {
        var processDefinition = function(key, defs) {
            if (modificationType === 0 || modificationType === 1) { // Add or Change
                targetDefinitionsInstance[key] = Object.assign({}, StandardReversalOperations[key], defs);
            } else if (modificationType === 2) { // Remove
                // To remove, we delete the own property, allowing it to fall back to prototype (StandardReversalOperations)
                if (targetDefinitionsInstance.hasOwnProperty(key)) {
                    delete targetDefinitionsInstance[key];
                }
            }
        };

        if (typeof eventIdentifier === 'string') {
            processDefinition(eventIdentifier, newDefinitions);
        } else if (Array.isArray(eventIdentifier)) {
            eventIdentifier.forEach(function(key) {
                processDefinition(key, null); // For array, newDefinitions is irrelevant for remove type
            });
        } else if (typeof eventIdentifier === 'object' && eventIdentifier !== null) {
            Object.keys(eventIdentifier).forEach(function(key) {
                processDefinition(key, eventIdentifier[key]);
            });
        }
    }
});