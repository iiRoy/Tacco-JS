// Generic Library for Reversible Operations
// Version 1.0
//
// Copyright (c)2023 Your Name Here
// Licensed under the Custom Open Source License
//
// More info at:
// https://your.repo.example/library

( function ( moduleFactory ) {
	if ( typeof define === "function" && define.amd ) {
		// Asynchronous Module Definition (AMD) support
		define( [ "lodash", "backbone" ], moduleFactory );
	} else if ( typeof exports !== 'undefined' ) {
		// CommonJS / Node.js environment
		module.exports = moduleFactory;
	} else {
		// Direct browser global execution
		moduleFactory( _, Backbone );
	}
} )( function ( _util, _Backbone ) {

	var std_array_part = Array.prototype.slice;

	/**
	 * Executes a given function within a specified context, passing arguments.
	 * This implementation prioritizes 'call' for a small number of arguments
	 * for potential performance gains, falling back to 'apply' for more.
	 *
	 * @param  {Function} callbackFunc       The function intended for execution.
	 * @param  {Object}   executionContext   The 'this' context for the function call.
	 * @param  {Array}    argArray           An array containing arguments to be passed to the function.
	 * @return {any}                         The result returned by the executed function.
	 */
	function invokeWithArguments( callbackFunc, executionContext, argArray ) {
		return argArray.length <= 4 ?
			callbackFunc.call( executionContext, argArray[ 0 ], argArray[ 1 ], argArray[ 2 ], argArray[ 3 ] ) :
			callbackFunc.apply( executionContext, argArray );
	}

	/**
	 * Creates a new array by extracting a portion of an existing array or array-like object.
	 *
	 * @param  {Array|Object} sourceArray      The array or array-like structure to be sliced.
	 * @param  {Number}       [startPosition]  The zero-based index at which to begin extraction. Defaults to 0.
	 * @return {Array}                         A new array containing the extracted elements.
	 */
	function splitArray( sourceArray, startPosition ) {
		return std_array_part.call( sourceArray, startPosition );
	}

	/**
	 * Determines if an object possesses one or more specified properties.
	 * Properties do not necessarily need to be owned directly by the object.
	 * This function can be invoked with property names as an array or as separate arguments.
	 *
	 * @example
	 * checkObjectProperties(myObj, ["propA", "propB"])
	 * checkObjectProperties(myObj, "propA", "propB")
	 *
	 * @param  {Object}  targetObject      The object to inspect.
	 * @param  {Array}   propertyNames     An array of property keys to check for.
	 * @return {Boolean}                   True if the target object has all specified properties; otherwise, false.
	 */
	function checkObjectProperties( targetObject, propertyNames ) {
		if ( targetObject == null ) return false;
		if ( !_util.isCollection( propertyNames ) ) {
			propertyNames = splitArray( arguments, 1 );
		}
		return _util.allMatch( propertyNames, function ( keyIdentifier ) {
			return keyIdentifier in targetObject;
		} );
	}

	/**
	 * Provides a numerical identifier that is unique within a single JavaScript execution cycle.
	 * This identifier increments only after the current call stack has fully processed.
	 *
	 * @return {number} An identifier representing the current execution cycle.
	 */
	var getUniqueExecutionCycleIdentifier = ( function () {
		// When multiple modifications (e.g., adding several models, setting multiple attributes)
		// occur within a single logical operation (like a single function call),
		// traditional undo mechanisms might treat each modification as a separate undoable step.
		// This can lead to an undesirable user experience where "undo" only reverses the very last micro-action.
		// To group these related micro-actions into a single logical "undo" step,
		// we need a way to identify actions that originated from the same top-level execution context.
		// Standard timestamps are insufficient due to variable execution times.
		// Leveraging JavaScript's single-threaded nature, we can assign a unique identifier
		// to all actions that occur within the same "turn" of the event loop.

		var cycleMarked = false, uniqueCycleIndex = -1;
		function incrementCycleIdentifier() {
			uniqueCycleIndex++;
			cycleMarked = true;
			_util.deferExecution( function () {
				// This callback is scheduled for the next tick of the event loop.
				// When it runs, it signifies that the current call stack has completed,
				// allowing us to reset the flag for the next cycle.
				cycleMarked = false;
			} );
		}
		return function () {
			if ( !cycleMarked ) {
				incrementCycleIdentifier();
			}
			return uniqueCycleIndex;
		};
	} )();

	/**
	 * Manages the tracking of objects to ensure event listeners are not redundantly bound.
	 *
	 * @constructor
	 */
	function EntityTracker() {
		// This mechanism uses a dual storage approach:
		// 1. For objects possessing a 'cid' (common in Backbone.js),
		//    the 'cid' is used as a direct property key in 'trackedEntities'.
		//    This provides fast lookup and avoids modifying the array's length.
		// 2. For objects without a 'cid', they are stored directly in the array.
		// This strategy optimizes for Backbone objects while still supporting generic objects.
		this.trackedEntities = [];
		// To efficiently retrieve a list of all tracked entities,
		// we maintain a separate array of 'cid's for cid-indexed objects.
		this.entityIdentifiers = [];
	}
	EntityTracker.prototype = {
		/**
		 * Checks if a given object is already being tracked by this EntityTracker.
		 *
		 * @this    {EntityTracker}
		 * @param   {Object}        entity   The object to verify.
		 * @return  {Boolean}                True if the entity is tracked, false otherwise.
		 */
		isEntityTracked: function ( entity ) {
			// Fast lookup via 'cid' property for Backbone-like objects.
			// Otherwise, perform a linear search in the array for generic objects.
			return entity && entity.entityId ? this.trackedEntities[ entity.entityId ] : _util.includes( this.trackedEntities, entity );
		},
		/**
		 * Adds an object to be tracked by this EntityTracker.
		 *
		 * @this    {EntityTracker}
		 * @param   {Object}        entity   The object to begin tracking.
		 * @return  {Boolean}                True if the entity was newly tracked, false if it was already tracked.
		 */
		trackEntity: function ( entity ) {
			if ( !this.isEntityTracked( entity ) ) {
				if ( entity && entity.entityId ) {
					this.trackedEntities[ entity.entityId ] = entity;
					this.entityIdentifiers.push( entity.entityId );
				} else {
					this.trackedEntities.push( entity );
				}
				return true;
			}
			return false;
		},
		/**
		 * Removes an object from being tracked by this EntityTracker.
		 *
		 * @this    {EntityTracker}
		 * @param   {Object}        entity   The object to cease tracking.
		 * @return  {Boolean}                True if the entity was untracked, false if it was not found.
		 */
		untrackEntity: function ( entity ) {
			if ( this.isEntityTracked( entity ) ) {
				if ( entity && entity.entityId ) {
					delete this.trackedEntities[ entity.entityId ];
					this.entityIdentifiers.splice( _util.indexOf( this.entityIdentifiers, entity.entityId ), 1 );
				} else {
					var position = _util.indexOf( this.trackedEntities, entity );
					this.trackedEntities.splice( position, 1 );
				}
				return true;
			}
			return false;
		},
		/**
		 * Retrieves an array containing all objects currently tracked by this EntityTracker.
		 *
		 * @return {Array} An array of all tracked entities.
		 */
		retrieveAllTracked: function () {
			return ( _util.map( this.entityIdentifiers, function ( idKey ) { return this.trackedEntities[ idKey ]; }, this ) ).concat( this.trackedEntities );
		}
	};

	/**
	 * Attaches or detaches a universal event listener ("all") for a collection of objects.
	 * This helper manages the registration status of objects with the EntityTracker.
	 *
	 * @param  {String}     actionType      Specifies the operation: "on" to attach, "off" to detach.
	 * @param  {Object[]}   subjectEntities An array of objects to apply the listener to.
	 * @param  {Function}   [eventHandler]  The function to bind/unbind. Required for "on".
	 * @param  {Object}     [contextInstance] The context ('this') for the eventHandler.
	 * @return {undefined}
	 */
	function manageEventListeners( actionType, subjectEntities, eventHandler, contextInstance ) {
		for ( var i = 0, len = subjectEntities.length, currentEntity; i < len; i++ ) {
			currentEntity = subjectEntities[ i ];
			if ( !currentEntity ) continue;

			if ( actionType === "on" ) {
				if ( !contextInstance.entityTracker.trackEntity( currentEntity ) ) {
					// If tracking returned false, the entity was already registered, so skip.
					continue;
				}
			} else { // actionType === "off"
				if ( !contextInstance.entityTracker.untrackEntity( currentEntity ) ) {
					// If untracking returned false, the entity wasn't registered, so skip.
					continue;
				}
			}
			if ( _util.isFunction( currentEntity[ actionType ] ) ) {
				currentEntity[ actionType ]( "all", eventHandler, contextInstance );
			}
		}
	}

	/**
	 * Invokes the specific undo or redo function for a given operation.
	 *
	 * @param  {String} operationType      Indicates "undo" or "redo".
	 * @param  {Object} operationDetails   An object containing the attributes of the operation.
	 * @return {undefined}
	 */
	function executeOperationReversal( operationType, operationDetails ) {
		var detailType = operationDetails.type, reversalTypes = operationDetails.reversalTypes, operationFunction = !reversalTypes[ detailType ] || reversalTypes[ detailType ][ operationType ];
		if ( _util.isFunction( operationFunction ) ) {
			operationFunction( operationDetails.object, operationDetails.before, operationDetails.after, operationDetails.options );
		}
	}

	/**
	 * The core logic for performing an undo or redo action on the history stack.
	 *
	 * @param  {String}       opKind          Either "undo" or "redo".
	 * @param  {Object}       historyManager  The history manager instance to trigger events on.
	 * @param  {Object}       historyStack    The stack of operations to manipulate.
	 * @param  {Boolean}      groupedActions  If true, processes all actions with the same unique cycle identifier.
	 * @param  {Boolean}      allOperations   If true, processes all available actions until stack limits.
	 * @return {undefined}
	 */
	function performManagerOperation( opKind, historyManager, historyStack, groupedActions, allOperations ) {
		if ( historyStack.isProcessingReversal ||
			( opKind === "undo" && historyStack.currentPosition === -1 ) ||
			( opKind === "redo" && historyStack.currentPosition === historyStack.totalLength - 1 ) ) {
			// Already in a reversal process, or reached the end/beginning of the stack.
			return;
		}
		historyStack.isProcessingReversal = true;
		var currentOperation, operationList, isReversal = opKind === "undo";
		if ( allOperations ) {
			// Process all steps from current position to either the start or end of the stack.
			operationList = ( isReversal && historyStack.currentPosition === historyStack.totalLength - 1 ) || // If at the stack's end and calling undo
					        ( !isReversal && historyStack.currentPosition === -1 ) ? // or at the stack's beginning and calling redo
					        _util.duplicate( historyStack.items ) : // => Take all items. Otherwise:
					        std_array_part.apply( historyStack.items, isReversal ? [ 0, historyStack.currentPosition ] : [ historyStack.currentPosition, historyStack.totalLength - 1 ] );
		} else {
			// Process only a single logical step.
			currentOperation = historyStack.getItemAt( isReversal ? historyStack.currentPosition : historyStack.currentPosition + 1 );
			operationList = groupedActions ? historyStack.findItems( { "uniqueExecutionCycleIdentifier": currentOperation.get( "uniqueExecutionCycleIdentifier" ) } ) : [ currentOperation ];
		}
		
		historyStack.currentPosition += ( isReversal ? -1 : 1 ) * operationList.length;
		while ( currentOperation = isReversal ? operationList.pop() : operationList.shift() ) {
			// Call the operation's specific undo/redo method.
			currentOperation[ opKind ]();
		}
		historyStack.isProcessingReversal = false;

		historyManager.trigger( opKind, historyManager );
	}

	/**
	 * Determines whether a new reversal record should be created based on configured conditions.
	 * It checks the 'condition' property within the reversal type configuration:
	 * - If 'condition' is not set, it returns true.
	 * - If 'condition' is a boolean, it returns that boolean value.
	 * - If 'condition' is a function, it executes the function with provided arguments and returns its boolean result.
	 *
	 * @param  {Object}    reversalTypeConfig    The configuration object for a specific event type (e.g., "change").
	 * @param  {Arguments} invocationArguments   The arguments to pass to the 'condition' function if it's callable.
	 * @return {Boolean}                         True if a reversal record should be created; otherwise, false.
	 */
	function shouldCreateReversalRecord( reversalTypeConfig, invocationArguments ) {
		var creationCondition = reversalTypeConfig.condition, conditionType = typeof creationCondition;
		return conditionType === "function" ? !!invokeWithArguments( creationCondition, reversalTypeConfig, invocationArguments ) :
			conditionType === "boolean" ? creationCondition : true;
	}

	/**
	 * Appends a new reversal operation record to the history stack.
	 * This function ensures that the operation meets tracking criteria and handles stack overflow.
	 *
	 * @param {Object}    targetStack             The history stack where the record should be stored.
	 * @param {String}    eventType               The type of event (e.g., "add", "change").
	 * @param {Arguments} eventArguments          The arguments passed during the event's occurrence.
	 * @param {Object}    reversalTypeDefinitions The object containing reversal handler definitions.
	 * @return {undefined}
	 */
	function appendRecordToHistory( targetStack, eventType, eventArguments, reversalTypeDefinitions ) {
		if ( targetStack.trackingEnabled && !targetStack.isProcessingReversal && eventType in reversalTypeDefinitions &&
			shouldCreateReversalRecord( reversalTypeDefinitions[ eventType ], eventArguments ) ) {
			// A new reversal record is deemed necessary.
			var operationResult = invokeWithArguments( reversalTypeDefinitions[ eventType ][ "on" ], reversalTypeDefinitions[ eventType ], eventArguments ), diffCount;
			if ( checkObjectProperties( operationResult, "object", "before", "after" ) ) {
				operationResult.type = eventType;
				operationResult.uniqueExecutionCycleIdentifier = getUniqueExecutionCycleIdentifier();
				operationResult.reversalTypes = reversalTypeDefinitions;
				if ( targetStack.currentPosition < targetStack.totalLength - 1 ) {
					// If new operations are added when the stack pointer is not at the end,
					// it means previous operations were undone. All subsequent "future" operations
					// must be discarded to maintain a linear history.
					diffCount = targetStack.totalLength - targetStack.currentPosition - 1;
					while ( diffCount-- ) {
						targetStack.removeLast();
					}
				}
				targetStack.currentPosition = targetStack.totalLength;
				targetStack.insertRecord( operationResult );
				if ( targetStack.totalLength > targetStack.maxCapacity ) {
					targetStack.removeFirst();
					targetStack.currentPosition--;
				}
			}
		}
	}


	/**
	 * Predefined configurations for various reversal operation types.
	 * This object contains default handlers for common Backbone.js events.
	 * @type {Object}
	 */
	var ReversalOperationTypes = {
		"add": {
			"undo": function ( entityCollection, ignoredParam, entityModel, operationOptions ) {
				// To undo an "add" operation, the model is removed from the collection.
				entityCollection.remove( entityModel, operationOptions );
			},
			"redo": function ( entityCollection, ignoredParam, entityModel, operationOptions ) {
				// To redo an "add" operation, the model is re-added to the collection.
				if ( operationOptions.index ) {
					operationOptions.at = operationOptions.index;
				}
				entityCollection.add( entityModel, operationOptions );
			},
			"on": function ( entityModel, entityCollection, operationOptions ) {
				return {
					object: entityCollection,
					before: undefined,
					after: entityModel,
					options: _util.duplicate( operationOptions )
				};
			}
		},
		"remove": {
			"undo": function ( entityCollection, entityModel, ignoredParam, operationOptions ) {
				// To undo a "remove" operation, the model is re-added, preserving its original index if available.
				if ( "index" in operationOptions ) {
					operationOptions.at = operationOptions.index;
				}
				entityCollection.add( entityModel, operationOptions );
			},
			"redo": function ( entityCollection, entityModel, ignoredParam, operationOptions ) {
				// To redo a "remove" operation, the model is removed again.
				entityCollection.remove( entityModel, operationOptions );
			},
			"on": function ( entityModel, entityCollection, operationOptions ) {
				return {
					object: entityCollection,
					before: entityModel,
					after: undefined,
					options: _util.duplicate( operationOptions )
				};
			}
		},
		"change": {
			"undo": function ( entityModel, priorProperties, currentProperties, operationOptions ) {
				// To undo a "change", revert attributes to their previous state.
				if ( _util.isEmpty( priorProperties ) ) {
					// If prior state was empty, it means attributes were newly set, so unset them.
					_util.forEach( _util.getPropertyNames( currentProperties ), entityModel.clearProperty, entityModel );
				} else {
					// Otherwise, set back to previous values.
					entityModel.updateProperties( priorProperties );
					if ( operationOptions && operationOptions.clearedData && operationOptions.clearedData.before && operationOptions.clearedData.before.length ) {
						_util.forEach( operationOptions.clearedData.before, entityModel.clearProperty, entityModel );
					}
				}
			},
			"redo": function ( entityModel, priorProperties, currentProperties, operationOptions ) {
				// To redo a "change", re-apply attributes to their current state.
				if ( _util.isEmpty( currentProperties ) ) {
					// If current state is empty, it implies attributes were cleared, so clear them.
					_util.forEach( _util.getPropertyNames( priorProperties ), entityModel.clearProperty, entityModel );
				} else {
					// Otherwise, set to the current values.
					entityModel.updateProperties( currentProperties );
					if ( operationOptions && operationOptions.clearedData && operationOptions.clearedData.after && operationOptions.clearedData.after.length ) {
						_util.forEach( operationOptions.clearedData.after, entityModel.clearProperty, entityModel );
					}
				}
			},
			"on": function ( entityModel, operationOptions ) {
				var
				currentProperties = entityModel.changedAttributes(),
				currentPropertyNames = _util.getPropertyNames( currentProperties ),
				priorProperties = _util.selectProperties( entityModel.previousAttributes(), currentPropertyNames ),
				priorPropertyNames = _util.getPropertyNames( priorProperties ),
				clearedData = ( operationOptions || ( operationOptions = {} ) ).clearedData = {
					after: [],
					before: []
				};

				if ( currentPropertyNames.length != priorPropertyNames.length ) {
					// Detect if new attributes were added or old ones were unset.
					if ( currentPropertyNames.length > priorPropertyNames.length ) {
						// Attributes were newly introduced.
						_util.forEach( currentPropertyNames, function ( attributeKey ) {
							if ( !( attributeKey in priorProperties ) ) {
								clearedData.before.push( attributeKey );
							}
						}, this );
					} else {
						// Existing attributes were removed/unset.
						_util.forEach( priorPropertyNames, function ( attributeKey ) {
							if ( !( attributeKey in currentProperties ) ) {
								clearedData.after.push( attributeKey );
							}
						} );
					}
				}
				return {
					object: entityModel,
					before: priorProperties,
					after: currentProperties,
					options: _util.duplicate( operationOptions )
				};
			}
		},
		"reset": {
			"undo": function ( entityCollection, priorState, currentState ) {
				// To undo a "reset", reinitialize the collection to its state before the reset.
				entityCollection.reinitialize( priorState );
			},
			"redo": function ( entityCollection, priorState, currentState ) {
				// To redo a "reset", reinitialize the collection to its state after the reset.
				entityCollection.reinitialize( currentState );
			},
			"on": function ( entityCollection, operationOptions ) {
				return {
					object: entityCollection,
					before: operationOptions.previousModels,
					after: _util.duplicate( entityCollection.items )
				};
			}
		}
	};

	/**
	 * Represents a set of reversal definitions that can inherit from a global set
	 * but also be customized individually.
	 *
	 * @constructor
	 */
	function CustomReversalDefinitions() {}
	CustomReversalDefinitions.prototype = ReversalOperationTypes;

	/**
	 * Modifies, adds, or removes a reversal definition within a target definitions object.
	 * This function supports single operations or bulk operations via objects/arrays.
	 *
	 * @example
	 * adjustReversalDefinition(1, "myEvent", {"on": function () {}}, myDefinitions) // Change single
	 * adjustReversalDefinition(1, {"myEvent": {"on": function () {}}}, myDefinitions) // Bulk change
	 * adjustReversalDefinition(2, ["eventA", "eventB"], myDefinitions) // Bulk remove
	 *
	 * @param  {Number}                adjustmentKind         Indicates the type of adjustment: 0 for add, 1 for change, 2 for remove.
	 * @param  {String|Object|Array}   definitionKey          The key for the definition, or an object/array for bulk actions.
	 * @param  {Object}                [definitionFunctions]  Object containing the functions to add/change. Optional if definitionKey is an object.
	 * @param  {Object}                targetDefinitionsObject The definitions object to modify.
	 * @return {undefined}
	 */
	function adjustReversalDefinition( adjustmentKind, definitionKey, definitionFunctions, targetDefinitionsObject ) {
		// adjustmentKind:
		// 0: add new definition
		// 1: modify existing definition
		// 2: remove definition
		// This function's body is not provided in the original code,
		// so its structure is maintained as per the original.
	}
} );