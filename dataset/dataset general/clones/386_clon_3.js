(function(moduleCreator) {
    // Check for AMD loader and define the module if available.
    if (typeof defineModule === 'function' && defineModule.amd) {
        defineModule(['lodash'], moduleCreator);
    }
    // Otherwise, expose the core functionality globally.
    else {
        // Assign the generated core library to the global window object under two distinct keys.
        window.DataHub = window.dataHub = moduleCreator(window._);
    }
})(function(utility) { // The 'utility' parameter is expected to be a library like Lodash/Underscore.

    // --- Core Global State Management ---

    // A single network connection instance, intended to be shared across all data models.
    // This connection manages all server-side interactions for the application.
    let networkConnection = null;

    // A temporary storage for 'on' event listeners that are registered before the
    // network connection becomes active. It maps model identifiers to a map of events.
    // Structure: Map<schemaIdentifier, Map<eventSignal, Function>>
    const bufferedListeners = new Map();

    // A queue for 'emit' events that are waiting for the network connection to be established.
    // Each entry is an array containing the event signal and its associated payloads.
    // Structure: Array<[eventSignal, payload, additionalPayload]>
    const queuedEmissions = [];

    // The central registry for all data model schemas defined within the application.
    // Key: schemaIdentifier (string), Value: DataStore constructor (Function).
    const registeredModels = new Map();

    // --- Utility Functions for Core Operations ---

    /**
     * Ensures that a given input is a callable function. If not, it returns a no-operation function.
     * This prevents errors when optional callbacks are not provided or are invalid.
     * @param {*} potentialFn - The value to be checked and potentially wrapped.
     * @returns {Function} A guaranteed callable function.
     */
    const ensureCallable = (potentialFn) => typeof potentialFn === 'function' ? potentialFn : () => {};

    /**
     * Retrieves a previously registered data model schema by its unique identifier.
     * @param {string} schemaIdentifier - The unique name (key) of the data model.
     * @returns {Function|undefined} The DataStore constructor if found, otherwise undefined.
     */
    const fetchModelInstance = (schemaIdentifier) => registeredModels.get(schemaIdentifier);

    /**
     * Establishes and registers a new data model schema. This function is responsible for
     * defining the structure, behavior, and lifecycle hooks for a specific data entity type.
     * @param {string} schemaIdentifier - The unique name for this new data model.
     * @param {Function} [initializationFn] - An optional function for initial setup; currently unused.
     * @returns {Function} The newly created DataStore constructor for the defined schema.
     */
    const establishModelSchema = (schemaIdentifier, initializationFn) => {

        // Validate the presence of the utility library (e.g., Lodash).
        // Provide a minimal fallback if the utility library is not available.
        if (!utility) {
            console.error(`DataHub: Utility library (lodash or similar) not found. Some functionality may be limited for model '${schemaIdentifier}'.`);
            utility = {
                isFunction: (f) => typeof f === 'function',
                isString: (s) => typeof s === 'string',
                isArray: Array.isArray,
                each: Array.prototype.forEach,
                isEmpty: (obj) => Object.keys(obj).length === 0,
                assign: Object.assign
            };
        }

        // --- Instance-level persistence logic ---
        // This function orchestrates the saving of changes to a specific entity instance,
        // managing before/after hooks and determining if it's a create or update operation.
        const instancePersister = function(completionFn) {
            const finalCompletionHandler = ensureCallable(completionFn);

            // The 'this' context refers to the entity object on which 'persist' was called.
            const boundEntity = this;

            // Guard against invalid entity data to prevent unexpected behavior.
            if (typeof boundEntity !== 'object' || boundEntity === null) {
                return finalCompletionHandler(new Error('Persistence error: Invalid entity object provided for saving.'));
            }

            let operationKind; // This variable will track if the operation is 'create' or 'update'.

            /**
             * Dispatches the final callback after all persistence operations and post-hooks have concluded.
             * It also notifies internal subscribers about the specific and generic save events.
             * @param {Error|null} issue - Any error that occurred during the persistence process.
             * @param {Object} outcome - The resulting object after the persistence operation.
             */
            const dispatchCompletion = (issue, outcome) => {
                // Inform subscribers about the specific operation (create/update) and a generic save.
                if (operationKind === 'create') {
                    DataStore.notifySubscribers('create', outcome);
                } else if (operationKind === 'update') {
                    DataStore.notifySubscribers('update', [outcome]); // Update often expects an array of results.
                }
                DataStore.notifySubscribers('save', outcome);

                // Invoke the original completion handler, binding 'this' to the DataStore.
                finalCompletionHandler.call(DataStore, issue, outcome);
            };

            /**
             * Executes any registered post-save hooks before calling the final completion handler.
             * This allows for additional logic to run after a save operation.
             * @param {Error|null} issue - Any error from preceding steps in the save process.
             * @param {Object} outcome - The result of the persistence operation.
             */
            const executePostSaveHooks = (issue, outcome) => {
                if (DataStore.postHooks.has('save')) {
                    DataStore.postHooks.get('save').call(DataStore, outcome, () => {
                        dispatchCompletion(issue, outcome);
                    });
                } else {
                    dispatchCompletion(issue, outcome);
                }
            };

            /**
             * Finalizes an update operation, including calling the silent update method and
             * executing any registered post-update hooks.
             * @param {Object} entityObject - The object that was updated.
             */
            const processUpdateTransaction = (entityObject) => {
                DataStore.updateSilent({
                    '_internalId': entityObject._internalId
                }, entityObject, (issue, results) => {
                    const updateOutcome = results[0]; // Assuming updateSilent returns an array of results.

                    if (DataStore.postHooks.has('update')) {
                        DataStore.postHooks.get('update').call(DataStore, results, () => {
                            executePostSaveHooks(issue, updateOutcome);
                        });
                    } else {
                        executePostSaveHooks(issue, updateOutcome);
                    }
                });
            };

            /**
             * Finalizes a create operation, including calling the silent create method and
             * executing any registered post-create hooks.
             * @param {Object} entityObject - The object that was created.
             */
            const processCreateTransaction = (entityObject) => {
                DataStore.createSilent(entityObject, (issue, createOutcome) => {
                    if (DataStore.postHooks.has('create')) {
                        DataStore.postHooks.get('create').call(DataStore, entityObject, () => {
                            executePostSaveHooks(issue, createOutcome);
                        });
                    } else {
                        executePostSaveHooks(issue, createOutcome);
                    }
                });
            };

            /**
             * Coordinates the CRUD workflow. It determines if the entity is new (CREATE)
             * or existing (UPDATE) based on its '_internalId', and then executes the
             * appropriate pre-hooks and transaction processing.
             * @param {Object} entityObject - The entity to be processed for persistence.
             */
            const coordinateCrudWorkflow = (entityObject) => {
                // Determine if this is a new entity (lacks an _internalId) or an existing one.
                if (!entityObject._internalId) {
                    operationKind = 'create';
                    if (DataStore.preHooks.has('create')) {
                        DataStore.preHooks.get('create').call(DataStore, entityObject, () => {
                            processCreateTransaction(entityObject);
                        });
                    } else {
                        processCreateTransaction(entityObject);
                    }
                } else { // It's an existing entity, so perform an UPDATE.
                    operationKind = 'update';
                    if (DataStore.preHooks.has('update')) {
                        DataStore.preHooks.get('update').call(DataStore, {
                            '_internalId': entityObject._internalId
                        }, entityObject, () => {
                            processUpdateTransaction(entityObject);
                        });
                    } else {
                        processUpdateTransaction(entityObject);
                    }
                }
            };

            // Execute any pre-save hooks before initiating the core CRUD workflow.
            if (DataStore.preHooks.has('save')) {
                DataStore.preHooks.get('save').call(DataStore, boundEntity, () => {
                    coordinateCrudWorkflow(boundEntity);
                });
            } else {
                coordinateCrudWorkflow(boundEntity);
            }
        };

        // --- Instance-level deletion logic ---
        // This function handles the standard deletion of an entity instance.
        const instanceDeleter = function(completionFn) {
            const finalCompletionHandler = ensureCallable(completionFn);
            // 'this' refers to the entity instance to be deleted.
            DataStore.deleteEntity(this, finalCompletionHandler);
        };

        // --- Instance-level silent deletion logic ---
        // This function handles the deletion of an entity instance without triggering all hooks.
        const instanceSilentDeleter = function(completionFn) {
            const finalCompletionHandler = ensureCallable(completionFn);
            // 'this' refers to the entity instance to be silently deleted.
            DataStore.deleteEntitySilent(this, finalCompletionHandler);
        };

        // --- DataStore Constructor Definition ---
        // This constructor function serves as the primary interface for creating new entity instances
        // and is exposed as the model for this schema.
        const DataStore = function(initialData = {}) { // Default parameter for initial data.
            // Attach instance-specific methods (persist, discard, silentDiscard) non-enumerably.
            // This keeps the entity's data properties clean while providing functionality.
            Object.defineProperty(initialData, 'persist', {
                value: instancePersister,
                writable: true,
                configurable: true
            });
            Object.defineProperty(initialData, 'discard', {
                value: instanceDeleter,
                writable: true,
                configurable: true
            });
            Object.defineProperty(initialData, 'silentDiscard', {
                value: instanceSilentDeleter,
                writable: true,
                configurable: true
            });

            return initialData;
        };

        // --- Private Properties of the DataStore ---
        // These properties manage the internal state and configuration specific to this DataStore.
        DataStore.entityCollection = []; // An array storing all managed entities for this schema.
        DataStore.nextEntityId = 0; // A counter for assigning unique IDs to new entities within this store.

        DataStore.preHooks = new Map(); // Stores functions to run BEFORE specific events (e.g., 'create', 'update').
        DataStore.postHooks = new Map(); // Stores functions to run AFTER specific events.
        DataStore.messageHandlers = new Map(); // Stores callbacks for internal event notifications (e.g., 'inform').

        DataStore.schemaKey = schemaIdentifier; // The unique identifier string for this specific DataStore.

        // --- Private Methods of the DataStore ---

        /**
         * Generates the next unique identifier for an entity within this specific DataStore instance.
         * This ensures that each new entity gets a distinct ID.
         * @returns {number} The newly generated unique ID.
         */
        DataStore.generateNextIdentifier = () => {
            DataStore.nextEntityId++;
            return DataStore.nextEntityId;
        };

        /**
         * A helper function to consistently register various event hooks (pre, post, receive).
         * It handles both single event strings and arrays of event strings.
         * @param {Map} hookMap - The map (e.g., preHooks, postHooks, messageHandlers) to register the hooks in.
         * @param {string|string[]} eventSignal - The name(s) of the event(s) to hook into.
         * @param {Function} handler - The callback function to be executed when the event occurs.
         */
        const registerEventHooks = (hookMap, eventSignal, handler) => {
            if (typeof eventSignal === 'string') {
                hookMap.set(eventSignal, handler);
            } else if (Array.isArray(eventSignal)) {
                eventSignal.forEach(signal => hookMap.set(signal, handler));
            } else {
                console.warn(`DataHub: Invalid event signal type for hook registration for model '${DataStore.schemaKey}'. Must be string or array of strings.`);
            }
        };

        /**
         * A helper function to consistently remove various event hooks.
         * It handles both single event strings and arrays of event strings.
         * @param {Map} hookMap - The map to remove hooks from.
         * @param {string|string[]} eventSignal - The name(s) of the event(s) to remove hooks for.
         */
        const removeEventHooks = (hookMap, eventSignal) => {
            if (typeof eventSignal === 'string') {
                hookMap.delete(eventSignal);
            } else if (Array.isArray(eventSignal)) {
                eventSignal.forEach(signal => hookMap.delete(signal));
            } else {
                console.warn(`DataHub: Invalid event signal type for hook removal for model '${DataStore.schemaKey}'. Must be string or array of strings.`);
            }
        };

        // --- Public Methods of the DataStore ---

        // --- Socket.IO Integration ---

        /**
         * Registers a listener for a specific socket event. If the network connection is not
         * yet established, the listener is buffered and applied once the connection is ready.
         * @param {string} eventSignal - The name of the socket event to listen for.
         * @param {Function} completionFn - The callback function to execute when the event fires.
         */
        DataStore.onSocketEvent = (eventSignal, completionFn) => {
            const handler = ensureCallable(completionFn);
            if (!networkConnection) {
                // Ensure a map exists for this schema's buffered listeners.
                if (!bufferedListeners.has(DataStore.schemaKey)) {
                    bufferedListeners.set(DataStore.schemaKey, new Map());
                }
                bufferedListeners.get(DataStore.schemaKey).set(eventSignal, handler);
            } else {
                networkConnection.on(eventSignal, (payload) => {
                    handler.call(DataStore, payload);
                });
            }
        };

        /**
         * Emits a socket event with optional data. If the network connection is not yet
         * established, the event and its data are queued and sent once the connection is ready.
         * @param {string} eventSignal - The name of the socket event to emit.
         * @param {*} payload - Primary data to send with the event.
         * @param {*} [additionalPayload] - Optional secondary data to send.
         */
        DataStore.emitSocketEvent = (eventSignal, payload, additionalPayload) => {
            if (!networkConnection) {
                queuedEmissions.push([eventSignal, payload, additionalPayload]);
            } else {
                networkConnection.emit(eventSignal, payload, additionalPayload);
            }
        };

        /**
         * Processes all buffered socket event listeners and queued emissions. This method
         * is typically called once the global network connection has been successfully established.
         */
        DataStore.flushBufferedNetworkEvents = () => {
            // Register buffered 'on' listeners for this specific model.
            if (bufferedListeners.has(DataStore.schemaKey)) {
                bufferedListeners.get(DataStore.schemaKey).forEach((handler, eventSignal) => {
                    if (networkConnection) { // Double-check connection before registering.
                        networkConnection.on(eventSignal, (payload) => {
                            handler.call(DataStore, payload);
                        });
                    }
                });
                bufferedListeners.get(DataStore.schemaKey).clear(); // Clear listeners for this schema after flushing.
            }

            // Emit buffered 'emit' events.
            while (queuedEmissions.length > 0) {
                const [eventSignal, payload, additionalPayload] = queuedEmissions.shift();
                if (networkConnection) { // Double-check connection before emitting.
                    networkConnection.emit(eventSignal, payload, additionalPayload);
                }
            }
        };

        // --- Internal Event/Hook Management ---

        /**
         * Applies a plugin (extension module) to this DataStore. The plugin function
         * receives the DataStore as its 'this' context, allowing it to extend functionality.
         * @param {Function} extensionModule - The plugin function to execute.
         */
        DataStore.applyPlugin = (extensionModule) => {
            if (typeof extensionModule === 'function') {
                extensionModule.call(DataStore); // The DataStore becomes 'this' for the plugin.
            } else {
                console.warn(`DataHub: Attempted to apply an invalid plugin to model '${DataStore.schemaKey}'. Plugin must be a function.`);
            }
        };

        /**
         * Registers a pre-hook (callback) to run before a specific event or set of events.
         * @param {string|string[]} eventSignal - The event name(s) to hook into.
         * @param {Function} handler - The callback function to execute before the event.
         */
        DataStore.registerPreHook = (eventSignal, handler) => registerEventHooks(DataStore.preHooks, eventSignal, handler);

        /**
         * Removes a previously registered pre-hook for a specific event or set of events.
         * @param {string|string[]} eventSignal - The event name(s) to remove hooks from.
         */
        DataStore.removePreHook = (eventSignal) => removeEventHooks(DataStore.preHooks, eventSignal);

        /**
         * Registers a post-hook (callback) to run after a specific event or set of events.
         * @param {string|string[]} eventSignal - The event name(s) to hook into.
         * @param {Function} handler - The callback function to execute after the event.
         */
        DataStore.registerPostHook = (eventSignal, handler) => registerEventHooks(DataStore.postHooks, eventSignal, handler);

        /**
         * Removes a previously registered post-hook for a specific event or set of events.
         * @param {string|string[]} eventSignal - The event name(s) to remove hooks from.
         */
        DataStore.removePostHook = (eventSignal) => removeEventHooks(DataStore.postHooks, eventSignal);

        /**
         * Notifies all internal subscribers of a specific event. The registered handlers
         * for that event will be invoked with the provided payload.
         * @param {string} eventSignal - The name of the event to inform subscribers about.
         * @param {*} payload - Data associated with the event, passed to the handlers.
         */
        DataStore.notifySubscribers = (eventSignal, payload) => {
            if (DataStore.messageHandlers.has(eventSignal)) {
                DataStore.messageHandlers.get(eventSignal).call(DataStore, payload);
            }
        };

        /**
         * Subscribes to an internal event, registering a handler to be called when the event is notified.
         * @param {string|string[]} eventSignal - The event name(s) to subscribe to.
         * @param {Function} handler - The callback function to execute when the event is notified.
         */
        DataStore.subscribeToEvents = (eventSignal, handler) => registerEventHooks(DataStore.messageHandlers, eventSignal, handler);

        /**
         * Unsubscribes from specific internal events or, if no event is specified, removes all handlers.
         * @param {string|string[]} [eventSignal] - The event name(s) to unsubscribe from. If omitted, all handlers are removed.
         */
        DataStore.unsubscribeFromEvents = (eventSignal) => {
            if (utility.isEmpty(eventSignal)) { // Check if no specific event is provided using the utility library.
                DataStore.messageHandlers.clear(); // If empty, clear all message handlers.
            } else {
                removeEventHooks(DataStore.messageHandlers, eventSignal);
            }
        };

        // --- Query Methods ---

        /**
         * Replaces the internal collection of entities with a new array of objects.
         * Each object in the new collection will be assigned a unique internal ID.
         * This method is designed to be data-binding friendly by modifying the existing array.
         * @param {Array<Object>} inputCollection - The new array of objects to populate the collection.
         * @throws {TypeError} If the input is not a valid array.
         */
        DataStore.resetCollection = (inputCollection) => {
            if (!Array.isArray(inputCollection)) {
                throw new TypeError(`DataHub: Invalid collection provided for model '${DataStore.schemaKey}'. Expected an array.`);
            }

            // Clear the existing collection efficiently to trigger data-binding updates.
            DataStore.entityCollection.splice(0);

            // Iterate over the new input collection and add items, ensuring each has a unique ID.
            inputCollection.forEach(item => {
                if (typeof item === 'object' && item !== null) {
                    item._internalId = DataStore.generateNextIdentifier(); // Assign a unique internal ID.
                    DataStore.entityCollection.push(item);
                } else {
                    console.warn(`DataHub: Skipping non-object item in collection for model '${DataStore.schemaKey}'. Item:`, item);
                }
            });
        };

        // --- CRUD Operations (Public) ---

        /**
         * Creates a new entity record within this DataStore. This method orchestrates
         * the execution of pre-create hooks, the actual creation process, and post-create hooks.
         * @param {Object} newRecord - The data object for the new entity to be created.
         * @param {Function} [completionFn] - Optional callback function (err, result) for when the operation completes.
         */
        DataStore.createEntity = (newRecord, completionFn) => {
            const finalCompletionHandler = ensureCallable(completionFn);

            // Validate the input record data to ensure it's a valid object.
            if (typeof newRecord !== 'object' || newRecord === null) {
                return finalCompletionHandler(new TypeError('Creation error: Invalid record data provided.'));
            }

            /**
             * Dispatches the final completion callback after the create operation and any post-hooks.
             * It also notifies internal subscribers about the 'create' event.
             * @param {Error|null} issue - Any error that occurred during the creation process.
             * @param {Object} outcome - The newly created entity object.
             */
            const dispatchCreateCompletion = (issue, outcome) => {
                DataStore.notifySubscribers('create', outcome);
                finalCompletionHandler.call(DataStore, issue, outcome);
            };

            /**
             * Initiates the silent creation process and handles the subsequent post-create hooks.
             */
            const initiateCreationProcess = () => {
                DataStore.createSilent(newRecord, (issue, outcome) => {
                    if (DataStore.postHooks.has('create')) {
                        DataStore.postHooks.get('create').call(DataStore, newRecord, () => {
                            dispatchCreateCompletion(issue, outcome);
                        });
                    } else {
                        dispatchCreateCompletion(issue, outcome);
                    }
                });
            };

            // Execute any pre-create hooks before proceeding with the actual creation.
            if (DataStore.preHooks.has('create')) {
                DataStore.preHooks.get('create').call(DataStore, newRecord, initiateCreationProcess);
            } else {
                initiateCreationProcess();
            }
        };

        // --- Register the DataStore and return it ---
        registeredModels.set(schemaIdentifier, DataStore);
        return DataStore;
    };

    // --- Public API of the DataHub ---
    // This section defines the global interface for interacting with the DataHub.

    return {
        /**
         * Sets the global network connection instance. This is crucial for enabling
         * real-time communication. Upon setting, it also flushes any buffered events.
         * @param {Object} conn - The socket connection object (e.g., from a Socket.IO client).
         */
        setNetworkConnection: (conn) => {
            networkConnection = conn;
            // Iterate over all registered models and instruct them to flush their buffered events.
            registeredModels.forEach(model => {
                if (typeof model.flushBufferedNetworkEvents === 'function') {
                    model.flushBufferedNetworkEvents();
                }
            });
        },
        /**
         * Retrieves a specific data model schema by its identifier.
         * @param {string} schemaIdentifier - The unique name of the model to retrieve.
         * @returns {Function|undefined} The DataStore constructor for the specified schema.
         */
        getModel: fetchModelInstance,
        /**
         * Defines and registers a new data model schema with the DataHub.
         * @param {string} schemaIdentifier - The unique name for the new model.
         * @returns {Function} The constructor for the newly defined DataStore.
         */
        defineModel: establishModelSchema
    };

});