( function (factory) {
	/*
	 * Define marilyn using AMD (Asynchronous Module Definition).
	 * This checks if 'define' is a function and if 'define.amd' exists.
	 */
	if (typeof define === 'function' && define.amd) {
		define(['underscore'], factory); // Use Underscore.js as a dependency.
	}
	/*
	 * If AMD is not available, define marilyn by adding it to the global
	 * window object.
	 */
	else {
		window.Marilyn = window.marilyn = factory(_); // Assign to both Marilyn and marilyn.
	}
})(function (_) {
	// Private variable: _socketConnection
	// This connection object is intended to be shared across all model instances.
	// It represents a single, persistent connection to the server-side.
	var _socketConnection;
	// Private variable: _onEventBuffer
	// This buffer stores 'on' event handlers until the socketConnection is established.
	// Socket.IO's 'on' function cannot be used until a valid socket connection exists.
	// Once the connection is available, all buffered 'on' events will be attached.
	var _onEventBuffer = {};
	// Private variable: _emitEventBuffer
	// This buffer stores 'emit' events until the socketConnection is established.
	// Socket.IO's 'emit' function cannot be used until a valid socket connection exists.
	// Once the connection is available, all buffered 'emit' events will be sent.
	var _emitEventBuffer = [];
	// Private variable: _models
	// This object serves as a registry to store all initialized models.
	// It allows for easy retrieval of models by their names using getter functions.
	var _models = {};
	// Private function: _modelGet
	// Retrieves a specific Model instance from the global _models registry.
	// @param {string} modelName - The name of the model to retrieve.
	// @returns {object} The requested Model instance.
	var _modelGet = function (modelName) {
		return _models[modelName];
	};
	// Private function: _modelSet
	// Creates and initializes a new Model, then assigns it to the global _models registry.
	// @param {string} modelName - The name to assign to the new model.
	// @param {function} init - An initialization function (currently unused in this snippet).
	var _modelSet = function (modelName, init) {
		// Internal function: _resultSave
		// Handles saving changes to an object, either creating a new one or updating an existing one.
		// It orchestrates 'before' and 'after' hooks for save, create, and update operations.
		// @param {function} callback - An optional callback function to execute after the save operation completes.
		var _resultSave = function (callback) {
			// Ensure the callback is a valid function; otherwise, provide a no-op function.
			callback = (callback && _.isFunction(callback)) ? callback : function () {};
			// Variable to determine the type of save operation (create or update).
			var saveType;
			// Internal function: runCallback
			// Executes the final callback after all 'after' hooks have completed.
			// It also informs relevant receivers about the operation (create, update, save).
			// @param {Error} err - An error object, if any occurred during the operation.
			// @param {object} result - The result of the save operation.
			var runCallback = function (err, result) {
				// Inform 'create' receivers if a new object was created.
				if (saveType === 'create') {
					Model.inform('create', result);
				}
				// Inform 'update' receivers if an existing object was updated.
				else if (saveType === 'update') {
					Model.inform('update', [result]); // Note: 'update' expects an array.
				}
				// Always inform 'save' receivers.
				Model.inform('save', result);
				// Execute the user-provided callback. The Model instance is bound as 'this'.
				callback.call(Model, err, result);
			};
			// Internal function: runSaves
			// Manages the 'after save' hooks.
			// @param {Error} err - An error object.
			// @param {object} result - The result of the operation.
			var runSaves = function (err, result) {
				// Check if any 'after save' hooks are defined for this Model.
				if (Model._afters.hasOwnProperty('save')) {
					// Call the 'after save' hook. The Model is 'this'.
					// Pass the result and a continuation function to ensure runCallback is called afterwards.
					Model._afters.save.call(Model, result, function () {
						runCallback(err, result);
					});
				} else {
					// If no 'after save' hook, proceed directly to the final callback.
					runCallback(err, result);
				}
			};
			// Internal function: runUpdateComplete
			// Handles the completion of an update operation, including 'after update' hooks.
			// @param {object} object - The object that was updated.
			var runUpdateComplete = function (object) {
				// Perform a silent update on the Model's collection.
				Model.updateSilent({
					'__id': object.__id
				}, object, function (err, results) {
					var result = results[0]; // Assuming updateSilent returns an array, take the first element.
					// Check for 'after update' hooks.
					if (Model._afters.hasOwnProperty('update')) {
						// Call the 'after update' hook.
						Model._afters.update.call(Model, results, function () {
							runSaves(err, result); // Then proceed to 'after save' hooks.
						});
					} else {
						// If no 'after update' hook, proceed directly to 'after save' hooks.
						runSaves(err, result);
					}
				});
			};
			// Internal function: runCreateComplete
			// Handles the completion of a create operation, including 'after create' hooks.
			// @param {object} object - The object that was created.
			var runCreateComplete = function (object) {
				// Perform a silent create operation.
				Model.createSilent(object, function (err, result) {
					// Check for 'after create' hooks.
					if (Model._afters.hasOwnProperty('create')) {
						// Call the 'after create' hook.
						Model._afters.create.call(Model, object, function () {
							runSaves(err, result); // Then proceed to 'after save' hooks.
						});
					} else {
						// If no 'after create' hook, proceed directly to 'after save' hooks.
						runSaves(err, result);
					}
				});
			};
			// Internal function: runCRUD
			// Determines whether to perform a create or update operation based on the object's '__id' property.
			// It also manages 'before create' and 'before update' hooks.
			// @param {object} object - The object to be saved (created or updated).
			var runCRUD = function (object) {
				// CREATE operation: if the object does not have an '__id'.
				if (!object.hasOwnProperty('__id')) {
					saveType = 'create'; // Set the save type.
					// Check for 'before create' hooks.
					if (Model._befores.hasOwnProperty('create')) {
						// Call the 'before create' hook.
						Model._befores.create.call(Model, object, function () {
							runCreateComplete(object); // Proceed to create completion.
						});
					} else {
						runCreateComplete(object); // If no hook, proceed directly.
					}
				}
				// UPDATE operation: if the object has an '__id', indicating it's an existing record.
				else {
					saveType = 'update'; // Set the save type.
					// Check for 'before update' hooks.
					if (Model._befores.hasOwnProperty('update')) {
						// Call the 'before update' hook.
						Model._befores.update.call(Model, {
							'__id': object.__id
						}, object, function () {
							runUpdateComplete(object); // Proceed to update completion.
						});
					} else {
						runUpdateComplete(object); // If no hook, proceed directly.
					}
				}
			};
			// The object being saved (either 'this' context from a model instance or a new object).
			var _this = this || {};
			// The save process will trigger 'before save' hooks first, then delegate to CRUD.
			// Regardless of create/update, all 'before save' and 'after save' hooks are always triggered.
			// Check for 'before save' hooks.
			if (Model._befores.hasOwnProperty('save')) {
				// Call the 'before save' hook.
				Model._befores.save.call(Model, _this, function () {
					runCRUD(_this); // After 'before save', execute the appropriate CRUD operation.
				});
			} else {
				runCRUD(_this); // If no 'before save' hook, proceed directly to CRUD.
			}
		};
		// Private function: _resultDelete
		// Deletes the current object (referenced by 'this') using the Model's 'del' method.
		// @param {function} callback - An optional callback function.
		var _resultDelete = function (callback) {
			callback = (callback && _.isFunction(callback)) ? callback : function () {};
			// The 'this' context refers to the item to be deleted.
			Model.del(this, callback);
		};
		// Private function: _resultDeleteSilent
		// Deletes the current object silently using the Model's 'delSilent' method.
		// @param {function} callback - An optional callback function.
		var _resultDeleteSilent = function (callback) {
			callback = (callback && _.isFunction(callback)) ? callback : function () {};
			// The 'this' context refers to the item to be deleted silently.
			Model.delSilent(this, callback);
		};
		// The main Model constructor function.
		// It will contain all CRUD and other related functionalities.
		// This is assigned to _models[modelName] and is returned by _modelSet.
		var Model = _models[modelName] = function (object) {
			object = object || {}; // Ensure object is initialized, even if null/undefined.
			// Attach the _resultSave method to the object, allowing it to save itself.
			object.save = _resultSave;
			// The delete methods (_resultDelete, _resultDeleteSilent) are not added directly here.
			// They are typically added when the 'save' method is called, or when an object
			// is retrieved from the collection (read/readOne).
			return object;
		};
		/*
		 * PRIVATE PROPERTIES OF THE MODEL
		 * These properties store the internal state and configuration for each Model.
		 */
		// _collection: An array to hold all data records managed by this Model.
		Model._collection = [];
		// _id: A counter for generating unique IDs for new records.
		Model._id = 0;
		// _befores: An object to store 'before' event hooks (e.g., beforeCreate, beforeUpdate, beforeSave).
		Model._befores = {};
		// _afters: An object to store 'after' event hooks (e.g., afterCreate, afterUpdate, afterSave).
		Model._afters = {};
		// _receivers: An object to store 'inform' event receivers (e.g., on create, on update, on save).
		Model._receivers = {};
		// _name: The string name of this Model, useful for identification and debugging.
		Model._name = modelName;
		/*
		 * PRIVATE METHODS OF THE MODEL
		 * These methods are internal helpers for the Model's functionality.
		 */
		// _nextId: Generates and returns the next unique ID for a new record.
		Model._nextId = function () {
			Model._id++; // Increment the ID counter.
			return Model._id; // Return the new ID.
		};
		/*
		 * PUBLIC METHODS OF THE MODEL
		 * These methods constitute the public API for interacting with the Model.
		 */
		// SOCKET.IO EVENT HANDLING
		// 'on': Registers a Socket.IO event listener for this Model.
		// If _socketConnection is not yet available, events are buffered.
		// @param {string} eventType - The name of the event to listen for.
		// @param {function} callback - The callback function to execute when the event occurs.
		Model.on = function (eventType, callback) {
			// If the socket connection hasn't been established yet, buffer the 'on' event.
			if (!_socketConnection) {
				// Initialize the buffer for this Model's name if it doesn't exist.
				if (!_onEventBuffer.hasOwnProperty(Model._name)) {
					_onEventBuffer[Model._name] = {};
				}
				// Store the callback in the buffer, indexed by event type.
				_onEventBuffer[Model._name][eventType] = callback;
			} else {
				// If _socketConnection is available, directly attach the event listener.
				_socketConnection.on(eventType, function (data) {
					callback.call(Model, data); // Execute callback, binding Model as 'this'.
				});
			}
		};
		// 'emit': Emits a Socket.IO event with associated data.
		// If _socketConnection is not yet available, events are buffered.
		// @param {string} eventType - The name of the event to emit.
		// @param {*} data - The primary data payload for the event.
		// @param {*} data2 - An optional secondary data payload.
		Model.emit = function (eventType, data, data2) {
			// If the socket connection hasn't been established yet, buffer the 'emit' event.
			if (!_socketConnection) {
				// Push the event details into the emit buffer.
				_emitEventBuffer.push([eventType, data, data2]);
			} else {
				// If _socketConnection is available, directly emit the event.
				_socketConnection.emit(eventType, data, data2);
			}
		};
		// INTERNAL EVENTS AND HOOKS
		// 'use': Integrates a plugin with the Model.
		// @param {function} pluginCallback - The plugin's initialization function.
		Model.use = function (pluginCallback) {
			// Call the plugin's callback, binding the Model instance as 'this'.
			pluginCallback.call(Model);
		};
		// 'before': Registers a 'before' event hook.
		// These hooks run before a specific operation (e.g., create, update, save).
		// @param {string|Array<string>} eventType - The event name(s) to attach the hook to.
		// @param {function} callback - The callback function for the hook.
		Model.before = function (eventType, callback) {
			// Handle a single event type (string).
			if (_.isString(eventType)) {
				Model._befores[eventType] = callback;
			}
			// Handle multiple event types (array of strings).
			else if (_.isArray(eventType)) {
				_.each(eventType, function (key) {
					Model._befores[key] = callback;
				});
			}
		};
		// 'beforeRemove': Removes a 'before' event hook by replacing it with a no-op function.
		// @param {string|Array<string>} eventType - The event name(s) of the hook(s) to remove.
		Model.beforeRemove = function (eventType) {
			// Remove a single event type.
			if (_.isString(eventType)) {
				Model._befores[eventType] = function () {};
			}
			// Remove multiple event types.
			else if (_.isArray(eventType)) {
				_.each(eventType, function (key) {
					Model._befores[key] = function () {};
				});
			}
		};
		// 'after': Registers an 'after' event hook.
		// These hooks run after a specific operation has completed.
		// @param {string|Array<string>} eventType - The event name(s) to attach the hook to.
		// @param {function} callback - The callback function for the hook.
		Model.after = function (eventType, callback) {
			// Handle a single event type.
			if (_.isString(eventType)) {
				Model._afters[eventType] = callback;
			}
			// Handle multiple event types.
			else if (_.isArray(eventType)) {
				_.each(eventType, function (key) {
					Model._afters[key] = callback;
				});
			}
		};
		// 'afterRemove': Removes an 'after' event hook.
		// @param {string|Array<string>} eventType - The event name(s) of the hook(s) to remove.
		Model.afterRemove = function (eventType) {
			// Remove a single event type.
			if (_.isString(eventType)) {
				Model._afters[eventType] = function () {};
			}
			// Remove multiple event types.
			else if (_.isArray(eventType)) {
				_.each(eventType, function (key) {
					Model._afters[key] = function () {};
				});
			}
		};
		// 'inform': Triggers a 'receive' event, notifying registered receivers.
		// @param {string} eventType - The type of event to inform about.
		// @param {*} data - The data payload to pass to receivers.
		Model.inform = function (eventType, data) {
			// Check if there are any receivers registered for this event type.
			if (Model._receivers[eventType]) {
				// Call the receiver's callback, binding the Model as 'this'.
				Model._receivers[eventType].call(Model, data);
			}
		};
		// 'receive': Registers a callback to listen for 'inform' events.
		// @param {string|Array<string>} eventType - The event name(s) to listen for.
		// @param {function} callback - The callback function to execute when the event is informed.
		Model.receive = function (eventType, callback) {
			// Register for a single event type.
			if (_.isString(eventType)) {
				Model._receivers[eventType] = callback;
			}
			// Register for multiple event types.
			else if (_.isArray(eventType)) {
				_.each(eventType, function (key) {
					Model._receivers[key] = callback;
				});
			}
		};
		// 'receiveRemove': Removes a 'receive' event listener.
		// Can remove all listeners or specific ones.
		// @param {string|Array<string>} [eventType] - The event name(s) of the listener(s) to remove.
		Model.receiveRemove = function (eventType) {
			// If no eventType is specified, remove all receivers.
			if (_.isEmpty(eventType)) {
				Model._receivers = {};
			}
			// Remove specific receivers.
			else {
				// Remove a single event type.
				if (_.isString(eventType)) {
					Model._receivers[eventType] = function () {};
				}
				// Remove multiple event types.
				else if (_.isArray(eventType)) {
					_.each(eventType, function (key) {
						Model._receivers[key] = function () {};
					});
				}
			}
		};
		// QUERY METHODS
		// 'collection': Replaces the Model's internal data collection.
		// It assigns unique '__id' properties to each item and is designed to be data-binding friendly.
		// @param {Array<object>} collection - The new array of objects to set as the collection.
		Model.collection = function (collection) {
			// Validate that the provided collection is an array.
			if (!_.isArray(collection)) {
				// TODO: Implement proper error handling here.
				return;
			}
			// Clear the existing collection in a way that is friendly to data-binding frameworks
			// (i.e., by modifying the existing array reference rather than reassigning).
			while (Model._collection.length > 0) {
				Model._collection.pop();
			}
			// Iterate through the new collection, assign '__id's, and push items to the internal collection.
			for (var i = 0, j = collection.length; i < j; i++) {
				collection[i].__id = Model._nextId(); // Assign a unique ID.
				Model._collection.push(collection[i]); // Add to the collection.
			}
		};
		// CREATE OPERATION
		// 'create': Creates a new record in the Model's collection.
		// It manages 'before create' and 'after create' hooks and informs receivers.
		// @param {object} element - The data object to create.
		// @param {function} callback - An optional callback function to execute after creation.
		Model.create = function (element, callback) {
			// Ensure the callback is a valid function.
			callback = (callback && _.isFunction(callback)) ? callback : function () {};
			// Internal function: runCallback
			// Executes the final callback and informs 'create' receivers.
			// @param {Error} err - An error object.
			// @param {object} result - The created object.
			var runCallback = function (err, result) {
				Model.inform('create', result); // Inform 'create' receivers.
				// Execute the user-provided callback, binding Model as 'this'.
				callback.call(Model, err, result);
			};
			// Internal function: runComplete
			// Handles the completion of the create operation, including 'after create' hooks.
			var runComplete = function () {
				// Perform a silent create operation.
				Model.createSilent(element, function (err, result) {
					// Check for 'after create' hooks.
					if (Model._afters.hasOwnProperty('create')) {
						// Call the 'after create' hook.
						Model._afters.create.call(Model, element, function () {
							runCallback(err, result); // Then proceed to the final callback.
						});
					} else {
						runCallback(err, result); // If no hook, proceed directly.
					}
				});
			};