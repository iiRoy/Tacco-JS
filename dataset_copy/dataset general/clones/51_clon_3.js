var App = App || {};
App.remote = App.remote || {};
App.remote.adapters = App.remote.adapters || {};
App.data = App.data || {};

/**
 * Utility function to mimic Ext.extend for classical inheritance.
 * @param {Function} subclass The class to be extended.
 * @param {Function} superclass The base class.
 * @param {Object} overrides An object containing properties and methods to add to the subclass prototype.
 */
App.extend = function(subclass, superclass, overrides) {
    var TempConstructor = function() {};
    TempConstructor.prototype = superclass.prototype;
    subclass.prototype = new TempConstructor();
    subclass.prototype.constructor = subclass;
    subclass.superclass = superclass.prototype; // Reference to superclass prototype
    if (superclass.prototype.constructor === Object.prototype.constructor) {
        superclass.prototype.constructor = superclass;
    }
    Object.assign(subclass.prototype, overrides);
};

/**
 * @class App.data.AbstractSource
 * A foundational class for data proxies, providing basic configuration and event handling.
 * This class serves as a substitute for Ext.data.DataProxy.
 * @constructor
 * @param {Object} cfg Configuration object.
 */
App.data.AbstractSource = function(cfg) {
    this.config = cfg || {};
    this.api = cfg.api || {}; // Mimic Ext.data.DataProxy's API property
    this.eventListeners = {}; // Simple event system for this proxy

    /**
     * Fires an event with the given name and arguments.
     * @param {String} eventName The name of the event to fire.
     * @param {...*} args Any arguments to pass to the event handlers.
     */
    this.fireEvent = function(eventName) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName].forEach(function(handlerInfo) {
                handlerInfo.handler.apply(handlerInfo.scope, args);
            });
        }
    };

    /**
     * Registers an event handler.
     * @param {String} eventName The name of the event.
     * @param {Function} handler The function to call when the event fires.
     * @param {Object} [scope] The scope (`this` context) for the handler. Defaults to this proxy instance.
     */
    this.on = function(eventName, handler, scope) {
        this.eventListeners[eventName] = this.eventListeners[eventName] || [];
        this.eventListeners[eventName].push({
            handler: handler,
            scope: scope || this
        });
    };
};

/**
 * @class App.data.ServiceOperations
 * Defines a set of standard data operation types and utility methods for them.
 * This replaces Ext.data.Api.
 */
App.data.ServiceOperations = {
    types: {
        FETCH: 'fetch', // Corresponds to 'read'
        CREATE: 'create',
        UPDATE: 'update',
        DELETE: 'delete' // Corresponds to 'destroy'
    },

    /**
     * Checks if a given string is a valid service operation type.
     * @param {String} opType The operation type string to validate.
     * @return {Boolean} True if valid, false otherwise.
     */
    isValid: function(opType) {
        return Object.values(this.types).includes(opType);
    }
};

/**
 * @class App.remote.adapters.AsyncDataBridge
 * @extends App.data.AbstractSource
 * @author re-engineered by AI
 * A sophisticated data proxy designed to interface with DWR (Direct Web Remoting) services.
 * This component acts as a bridge, translating abstract data operations into concrete
 * DWR method invocations and managing their lifecycle, including argument generation,
 * callback handling, and response processing.
 *
 * Constructor initialization example:
 * <pre><code>
 * new App.remote.adapters.AsyncDataBridge({
 *     operationHandlers: {
 *         fetch: {
 *             dwrServiceMethod: DwrInterface.fetchData,
 *             argumentGenerator: function(context) {
 *                 const pagination = this.store.pagingConfig;
 *                 const params = context.callParameters;
 *                 return [params[pagination.startParam], params[pagination.limitParam]];
 *             },
 *             argumentScope: this // 'this' refers to the store instance
 *         },
 *         create: {
 *             dwrServiceMethod: DwrInterface.createEntities
 *         },
 *         update: {
 *             dwrServiceMethod: DwrInterface.updateEntities
 *         },
 *         delete: {
 *             dwrServiceMethod: DwrInterface.removeEntities,
 *             argumentGenerator: function(context, currentPayloads) {
 *                 return [currentPayloads, this.authKey, this.sessionID];
 *             },
 *             argumentScope: this
 *         }
 *     }
 * });
 * </code></pre>
 * @constructor
 * @param {Object} bridgeConfig The configuration object for this data bridge.
 */
App.remote.adapters.AsyncDataBridge = function(bridgeConfig) {
    if (!(bridgeConfig && bridgeConfig.operationHandlers)) {
        console.error("AsyncDataBridge configuration error: 'operationHandlers' property is mandatory.");
        throw new Error("Initialization failed: 'operationHandlers' must be defined.");
    }

    this.operationHandlers = {};
    const definedOperations = Object.values(App.data.ServiceOperations.types);

    // Instantiate an OperationHandler for each configured operation type
    definedOperations.forEach(opType => {
        const handlerConfig = bridgeConfig.operationHandlers[opType];
        if (handlerConfig) {
            handlerConfig.operationType = opType; // Ensure type is set within handler config
            this.operationHandlers[opType] = new App.remote.adapters.AsyncDataBridge.OperationHandler(handlerConfig);
        }
    });

    // Align the base proxy's API property for compatibility with generic data stores.
    // This provides a consistent interface where keys are operation types.
    bridgeConfig.api = this.operationHandlers;

    App.remote.adapters.AsyncDataBridge.superclass.constructor.call(this, bridgeConfig);
};

// Extend from App.data.AbstractSource
App.extend(App.remote.adapters.AsyncDataBridge, App.data.AbstractSource, {

    /**
     * @property {Object} operationHandlers
     * A dictionary mapping {@link App.data.ServiceOperations} types to their
     * respective {@link App.remote.adapters.AsyncDataBridge.OperationHandler} instances.
     * This defines the DWR service method and argument generation logic for each operation.
     */
    operationHandlers: {},

    /**
     * Initiates a remote data operation by constructing DWR arguments and invoking the DWR service method.
     * This function serves as the primary entry point for all DWR-based data requests,
     * abstracting the intricacies of DWR interaction.
     *
     * @param {String} operationKind The type of operation (e.g., 'fetch', 'create').
     * @param {Array<Object>} dataEntities The data entities pertinent to the operation.
     * @param {Object} queryParameters Additional parameters for the remote call.
     * @param {Object} responseParser The parser responsible for interpreting the DWR response.
     * @param {Function} completionCallback Function to execute once the operation concludes.
     * @param {Object} callbackExecutionScope The context (`this`) for the completion callback.
     * @param {Object} callOptions Supplementary options for the call.
     * @private
     */
    executeOperation: function(operationKind, dataEntities, queryParameters, responseParser, completionCallback, callbackExecutionScope, callOptions) {
        const callContext = new App.remote.adapters.AsyncDataBridge.RequestContext(
            operationKind, dataEntities, queryParameters, responseParser, completionCallback, callbackExecutionScope, callOptions
        );

        const activeHandler = this.operationHandlers[operationKind];
        if (!activeHandler) {
            console.error(`AsyncDataBridge: No handler configured for operation type: '${operationKind}'.`);
            throw new Error(`Missing operation handler for '${operationKind}'.`);
        }

        let dwrMethodArguments = [];
        try {
            dwrMethodArguments = activeHandler.argumentGenerator.call(
                activeHandler.argumentScope,
                callContext,
                this.extractEntryPayloads(dataEntities),
                this.getPriorEntryStates(dataEntities)
            ) || [];
        } catch (argGenError) {
            console.error(`AsyncDataBridge: Failed to generate DWR arguments for '${operationKind}':`, argGenError);
            // Re-throw to indicate a critical setup error or a misconfigured argumentGenerator
            throw new Error(`Argument generation failed for operation '${operationKind}'.`);
        }

        // The DWR callback object must always be the last argument.
        dwrMethodArguments.push(this.composeDwrCallbacks(callContext));

        // Execute the DWR service method. The 'Object' scope is typically inconsequential for DWR functions.
        activeHandler.dwrServiceMethod.apply(null, dwrMethodArguments);
    },

    /**
     * Extracts the core data objects from an array of App.data.Entry instances.
     * This is crucial to prevent sending full client-side record objects to DWR,
     * which may contain unnecessary or incompatible fields for the backend.
     * @param {Array<Object>} entries The data entries (e.g., App.data.Entry instances).
     * @return {Array<Object>} An array containing only the raw data objects.
     */
    extractEntryPayloads: function(entries) {
        if (!Array.isArray(entries)) {
            console.warn("AsyncDataBridge: Expected an array of data entries, but received non-array input.");
            return [];
        }
        return entries.map(entry => entry.data) || [];
    },

    /**
     * Retrieves the data state of entries as they existed *before* any modifications.
     * This is particularly relevant for 'update' operations, where the backend might need
     * both the original and current state for comparison or optimistic locking.
     * @param {Array<Object>} entries The data entries that have potentially been modified.
     * @return {Array<Object>} An array of objects representing the data state prior to update.
     */
    getPriorEntryStates: function(entries) {
        const previousStates = [];
        if (!Array.isArray(entries)) {
            return previousStates;
        }

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            // If 'modified' exists, it contains the old values of changed fields.
            // We combine it with the current 'data' to reconstruct the state before update.
            // This is a common pattern for ExtJS records.
            previousStates.push(Object.assign({}, entry.data, entry.modified));
        }
        return previousStates;
    },

    /**
     * Creates a DWR-compatible callback object. This object encapsulates two functions:
     * a success handler (`callback`) and an error handler (`exceptionHandler`).
     * These functions internally route to the appropriate response processing methods
     * of this AsyncDataBridge instance.
     * @param {App.remote.adapters.AsyncDataBridge.RequestContext} context The request context.
     * @return {Object} An object with `callback` and `exceptionHandler` properties.
     * @private
     */
    composeDwrCallbacks: function(context) {
        const self = this; // Preserve the context of this proxy instance

        return {
            callback: function(dwrResponse) {
                if (context.operationType === App.data.ServiceOperations.types.FETCH) {
                    self.processFetchResult(context, dwrResponse);
                } else {
                    self.processMutationResult(context, dwrResponse);
                }
            }.bind(this), // Bind to the proxy instance
            exceptionHandler: function(errorMessage, exceptionDetails) {
                console.error(`DWR Service Exception for operation '${context.operationType}':`, errorMessage, exceptionDetails);
                // DWR's exception handler doesn't provide a full 'response' object, so we pass available info.
                self.manageCallFailure(context, errorMessage, exceptionDetails);
            }.bind(this) // Bind to the proxy instance
        };
    },

    /**
     * Processes the successful response from a 'fetch' (read) DWR operation.
     * It uses the configured `responseParser` to interpret the DWR payload
     * and triggers relevant success or exception events.
     * @param {App.remote.adapters.AsyncDataBridge.RequestContext} context The request context.
     * @param {Object} dwrResponse The raw object returned by the DWR service.
     * @private
     */
    processFetchResult: function(context, dwrResponse) {
        let parsedResultBlock;
        try {
            // Call readRecords() as DWR typically returns a pre-parsed object, not raw JSON.
            parsedResultBlock = context.responseParser.readRecords(dwrResponse);
        } catch (parsingError) {
            console.error("AsyncDataBridge: Error during DWR fetch response parsing:", parsingError);
            return this.manageCallFailure(context, dwrResponse, parsingError);
        }

        if (parsedResultBlock && parsedResultBlock.success === false) {
            this.fireEvent("exception", this, 'remote', context.operationType, context.callConfiguration, dwrResponse, null);
        } else {
            this.fireEvent("load", this, context, context.callConfiguration);
        }
        
        // Always invoke the original completion callback
        if (typeof context.completionCallback === 'function') {
            context.completionCallback.call(context.callbackScope, parsedResultBlock, context.callConfiguration, parsedResultBlock ? parsedResultBlock.success : false);
        }
    },

    /**
     * Handles the response for 'create', 'update', and 'delete' DWR operations.
     * It utilizes the `responseParser` to process the DWR response and dispatches
     * appropriate success or failure events.
     * @param {App.remote.adapters.AsyncDataBridge.RequestContext} context The request context.
     * @param {Object} dwrResponse The raw object returned by the DWR service.
     * @private
     */
    processMutationResult: function(context, dwrResponse) {
        let parsedResultBlock;
        try {
            parsedResultBlock = context.responseParser.readResponse(context.operationType, dwrResponse);
        } catch (parsingError) {
            console.error("AsyncDataBridge: Error during DWR mutation response parsing:", parsingError);
            return this.manageCallFailure(context, dwrResponse, parsingError);
        }

        if (parsedResultBlock && parsedResultBlock.success === false) {
            this.fireEvent("exception", this, 'remote', context.operationType, context.callConfiguration, dwrResponse, context.entities);
        } else {
            this.fireEvent("write", this, context.operationType, parsedResultBlock ? parsedResultBlock.data : null, parsedResultBlock, context.entities, context.callConfiguration);
        }
        
        // Always invoke the original completion callback
        if (typeof context.completionCallback === 'function') {
             context.completionCallback.call(context.callbackScope, parsedResultBlock ? parsedResultBlock.data : null, parsedResultBlock, parsedResultBlock ? parsedResultBlock.success : false);
        }
    },

    /**
     * Provides centralized handling for DWR call failures or exceptions during response processing.
     * This method ensures an 'exception' event is fired and the request's original callback
     * is invoked with a clear failure status.
     * @param {App.remote.adapters.AsyncDataBridge.RequestContext} context The request context.
     * @param {Object} errorPayload The DWR response or error message.
     * @param {Object} actualException The actual JavaScript exception object, if one occurred.
     */
    manageCallFailure: function(context, errorPayload, actualException) {
        this.fireEvent("exception", this, 'response', context.operationType, context.callConfiguration, errorPayload, actualException);
        if (typeof context.completionCallback === 'function') {
            context.completionCallback.call(context.callbackScope, null, context.callConfiguration, false);
        }
    }
});

/**
 * @class App.remote.adapters.AsyncDataBridge.OperationHandler
 * @author re-engineered by AI
 * A specialized handler for a single data operation type within the AsyncDataBridge.
 * It encapsulates the specific DWR method to call and the logic for generating
 * its arguments based on the operation context.
 * @constructor
 * @param {Object} handlerConfig The configuration object for this operation handler.
 * @cfg {String} operationType [Mandatory] The {@link App.data.ServiceOperations} type this handler manages.
 * @cfg {Function} dwrServiceMethod [Mandatory] The DWR-generated function to be called.
 * @cfg {Function} argumentGenerator [Optional] A custom function that dynamically generates
 * the arguments for `dwrServiceMethod`. This function receives:
 * - {@link App.remote.adapters.AsyncDataBridge.RequestContext} (the call context)
 * - `Array<Object>` currentPayloads (raw data from current records)
 * - `Array<Object>` priorPayloads (raw data from records before update, if applicable)
 * It must return an `Array` of arguments for the DWR method.
 * If omitted, a default generator from `defaultArgumentCreators` will be used.
 * @cfg {Object} argumentScope [Optional] The `this` context for `argumentGenerator`. Defaults to `null`.
 */
App.remote.adapters.AsyncDataBridge.OperationHandler = function(handlerConfig) {
    Object.assign(this, handlerConfig);

    // Enforce mandatory configuration properties
    if (!this.operationType) {
        throw new Error("OperationHandler configuration error: 'operationType' is required.");
    }
    if (!App.data.ServiceOperations.isValid(this.operationType)) {
        throw new Error(`'${this.operationType}' is not a recognized service operation type.`);
    }
    if (typeof this.dwrServiceMethod !== 'function') {
        throw new Error(`OperationHandler for '${this.operationType}' requires 'dwrServiceMethod' to be a function.`);
    }

    // Assign default argument generator if none is provided
    if (typeof this.argumentGenerator !== 'function') {
        this.argumentGenerator = this.defaultArgumentCreators[this.operationType];
        if (typeof this.argumentGenerator !== 'function') {
             console.warn(`OperationHandler: No specific or default argument generator found for '${this.operationType}'. A no-argument generator will be used.`);
             this.argumentGenerator = () => []; // Fallback to a function returning an empty array
        }
    }

    // Set a default scope for the argument generator if not specified
    this.argumentScope = this.argumentScope || null;
};

// Extend from base Object
App.extend(App.remote.adapters.AsyncDataBridge.OperationHandler, Object, {

    /**
     * @property {Object} defaultArgumentCreators
     * A collection of default functions for generating DWR arguments. These are
     * used by `OperationHandler` when a custom `argumentGenerator` is not supplied.
     * @private
     */
    defaultArgumentCreators: {
        /**
         * Default argument generator for 'fetch' operations.
         * By default, fetch operations send no custom arguments if not specified.
         * @return {Array} An empty array.
         * @private
         */
        fetch: function() {
            return [];
        },

        /**
         * Default argument generator for 'create' operations.
         * It passes the array of current data payloads as the sole argument.
         * @param {App.remote.adapters.AsyncDataBridge.RequestContext} context The request context.
         * @param {Array} currentPayloads Raw data for entities to be created.
         * @return {Array} An array containing `currentPayloads`.
         * @private
         */
        create: function(context, currentPayloads) {
            return [currentPayloads];
        },

        /**
         * Default argument generator for 'update' operations.
         * It passes both the prior and current data payloads.
         * @param {App.remote.adapters.AsyncDataBridge.RequestContext} context The request context.
         * @param {Array} currentPayloads Raw data for entities after modification.
         * @param {Array} priorPayloads Raw data for entities before modification.
         * @return {Array} An array containing `priorPayloads` followed by `currentPayloads`.
         * @private
         */
        update: function(context, currentPayloads, priorPayloads) {
            return [priorPayloads, currentPayloads];
        },

        /**
         * Default argument generator for 'delete' operations.
         * It passes the array of data payloads for entities to be deleted.
         * @param {App.remote.adapters.AsyncDataBridge.RequestContext} context The request context.
         * @param {Array} currentPayloads Raw data for entities to be deleted.
         * @return {Array} An array containing `currentPayloads`.
         * @private
         */
        delete: function(context, currentPayloads) {
            return [currentPayloads];
        }
    }
});

/**
 * @class App.remote.adapters.AsyncDataBridge.RequestContext
 * Encapsulates all parameters and contextual information for a single DWR data request.
 * This object is passed around internally to maintain state throughout the request lifecycle.
 * @constructor
 * @param {String} operationType The type of CRUD operation (e.g., 'fetch', 'create').
 * @param {Array<Object>} entities The data entities involved in this request.
 * @param {Object} callParameters An object holding additional parameters for the DWR call.
 * @param {Object} responseParser The parser to use for interpreting the DWR response.
 * @param {Function} completionCallback A callback function to execute upon request completion.
 * @param {Object} callbackScope The scope (`this` context) for `completionCallback`.
 * @param {Object} callConfiguration Optional configuration options for the call.
 */
App.remote.adapters.AsyncDataBridge.RequestContext = function(operationType, entities, callParameters, responseParser, completionCallback, callbackScope, callConfiguration) {
    // Basic validation and default assignments for robustness
    if (!operationType || !App.data.ServiceOperations.isValid(operationType)) {
        console.warn("RequestContext created with an invalid or missing 'operationType':", operationType);
    }
    if (typeof responseParser !== 'object' || responseParser === null) {
        console.warn("RequestContext created with an invalid or missing 'responseParser':", responseParser);
    }

    Object.assign(this, {
        operationType: operationType,
        entities: entities || [], // Ensure it's an array, even if empty
        callParameters: callParameters || {}, // Ensure it's an object
        responseParser: responseParser,
        completionCallback: completionCallback,
        callbackScope: callbackScope || null, // Default to null if no scope is provided
        callConfiguration: callConfiguration || {}
    });
};