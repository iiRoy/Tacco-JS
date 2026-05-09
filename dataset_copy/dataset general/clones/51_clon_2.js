Ext.namespace("Ext.app.remote");

/*
 * @class Ext.app.remote.RpcConnector
 * @extends Ext.data.DataProxy
 * @author new_dev
 * A specialized implementation of Ext.data.DataProxy that leverages Remote Procedure Calls (RPC)
 * via a DWR-like mechanism for server interactions.
 * It's important to note that not all original Ext.data.DataProxy configuration settings
 * are applicable or make sense for this RPC-based connector.
 * The following example demonstrates a complete configuration object for instantiation:
 * <code><pre>
 *	new Ext.app.remote.RpcConnector({
 *		// Inherited from Ext.data.DataProxy base class
 *		operationHandlers : {
 *			retrieve : {
 * 				remoteCallMethod : BackendService.fetchItems,
 *				// Define a custom function to transform paging parameters for the RPC call.
 *				argumentTransformer : function(currRequest) {
 *					var pageSettings = this.store.paramNames;
 *					var reqParameters = currRequest.requestParams;
 *					return [reqParameters[pageSettings.start], reqParameters[pageSettings.limit]];
 *				},
 *				// The execution context for the argumentTransformer is set to "this"
 *				// to allow access to the store's paging configuration.
 *				transformerContext : this
 *			},
 *			// These are optional if your connector only handles data retrieval.
 *			create : {
 *				// Uses the default argument transformation logic, which bundles all
 *				// objects to be created into a single array parameter.
 *				remoteCallMethod : BackendService.createItems
 *			},
 *			update : {
 *				remoteCallMethod : BackendService.updateItems
 *			},
 *			remove : {
 *				remoteCallMethod : BackendService.deleteItems,
 *				// Custom argument function to include authentication details
 *				// alongside the data records to be removed.
 *				argumentTransformer : function(currRequest, itemPayloads) {
 *					return [itemPayloads, this.username, this.authToken];
 *				},
 *				transformerContext : this
 *			}
 *		}
 *	});
 * </pre></code>
 * @constructor
 * @param {Object} connectorConfig The configuration object for the connector.
 */
Ext.app.remote.RpcConnector = function(connectorConfig) {

	if (!connectorConfig || !connectorConfig.operationHandlers) {
		throw new Error('The "operationHandlers" property must be defined within the connector configuration.');
	}

	// Initialize the map for operation-specific handlers.
	this.operationHandlers = {};
	Ext.iterate(Ext.data.Api.actions, function(opType) {
		var opProcessorConfig = connectorConfig.operationHandlers[opType];
		if (opProcessorConfig) {
			opProcessorConfig.operation = opType;
			this.operationHandlers[opType] = new Ext.app.remote.RpcConnector.CallProcessor(opProcessorConfig);
		}
	}, this);

	// The base Ext.data.DataProxy expects its "api" property to contain action mappings.
	// To satisfy this requirement and avoid errors, we map our internal operationHandlers
	// as they share common action keys ("create", "read", "update", "destroy").
	connectorConfig.api = this.operationHandlers;

	Ext.app.remote.RpcConnector.superclass.constructor.call(this, connectorConfig);
};
Ext.extend(Ext.app.remote.RpcConnector, Ext.data.DataProxy, {

	/**
	 * @cfg {Object} operationHandlers.
	 * A mapping of {@link Ext.data.Api} actions to their corresponding
	 * {@link Ext.app.remote.RpcConnector.CallProcessor} instances.
	 * This option is functionally similar to {@link Ext.data.DataProxy#api}, but
	 * uses different value types, hence a distinct name is used to avoid confusion
	 * and provide clearer semantics.
	 */
	operationHandlers: {},

	/**
	 * RpcConnector's implementation of the {@link Ext.data.DataProxy#doRequest} method.
	 * This method aims to mimic the behavior of {@link Ext.data.HttpProxy#doRequest} where appropriate.
	 * It invokes the specified argument transformation function for the given operation,
	 * then dispatches the RPC call using the configured remote method.
	 * Refer to {@link Ext.data.DataProxy#request} for details on input parameters.
	 * @private
	 * @param {String} opType The type of data operation (e.g., 'read', 'create').
	 * @param {Ext.data.Record[]} recordsToProcess An array of records relevant to the operation.
	 * @param {Object} callParameters An object containing parameters for the remote call.
	 * @param {Ext.data.DataReader} responseParser The reader to process the server's response.
	 * @param {Function} completionCallback A function to execute upon call completion.
	 * @param {Object} callbackScope The scope for the completionCallback.
	 * @param {Object} callOptions Additional options for the call.
	 */
	performCall: function(opType, recordsToProcess, callParameters, responseParser, completionCallback, callbackScope, callOptions) {
		var currentRequest = new Ext.app.remote.RpcConnector.CallRequest(opType, recordsToProcess, callParameters, responseParser, completionCallback, callbackScope, callOptions);
		var currentOpProcessor = this.operationHandlers[opType];
		if (!currentOpProcessor) {
			throw new Error('No RPC handler is defined for the operation type: ' + opType);
		}

		var rpcArguments = currentOpProcessor.argumentTransformer.call(
			currentOpProcessor.transformerContext,
			currentRequest,
			this.extractRecordPayloads(recordsToProcess),
			this.extractPriorRecordPayloads(recordsToProcess)
		) || [];
		rpcArguments.push(this.generateCallbackObject(currentRequest));
		currentOpProcessor.remoteCallMethod.apply(Object, rpcArguments); // The execution context for the remote method is often irrelevant; 'Object' is a safe default.
	},

	/**
	 * Extracts the raw data payload from an array of {@link Ext.data.Record} instances.
	 * @param {Ext.data.Record[]} recordCollection The records from which to extract data.
	 * @return {Object[]} An array containing the `data` property of each record.
	 * This ensures that only relevant data, not full record objects, is transmitted to the server.
	 */
	extractRecordPayloads: function(recordCollection) {
		return Ext.pluck(recordCollection, 'data') || [];
	},

	/**
	 * Retrieves the data as it existed *before* any updates for a given set of records.
	 * @param {Ext.data.Record[]} updatedRecords The records for which to get pre-update data.
	 * @return {Object[]} An array of objects representing the records' data prior to modification.
	 * This prevents sending extraneous record fields to the DWR backend.
	 */
	extractPriorRecordPayloads: function(updatedRecords) {
		var priorPayloads = [];
		Ext.each(updatedRecords, function(singleRecord) {
			// Construct the record's data as it was before being modified.
			priorPayloads.push(Ext.apply({}, singleRecord.modified, singleRecord.data));
		});
		return priorPayloads;
	},

	/**
	 * A utility method for `performCall` that produces a DWR-compatible callback object.
	 * The returned object contains two functions: one for successful completion and one for exceptions.
	 * This mirrors the `HttpProxy#createCallsback` functionality.
	 * DWR's design allows separate handlers for success and failure, which aligns with Ext's
	 * "response exception" model.
	 * @param {Ext.app.remote.RpcConnector.CallRequest} currentRequest The request arguments passed to `performCall`.
	 * @private
	 * @return {Object} An object containing `callback` and `exceptionHandler` functions.
	 */
	generateCallbackObject: function(currentRequest) {
		return {
			callback: function(rpcResponse) {
				if (currentRequest.operationType === Ext.data.Api.actions.read) {
					this.handleReadResult(currentRequest, rpcResponse);
				} else {
					this.handleWriteResult(currentRequest, rpcResponse);
				}
			}.createDelegate(this),
			exceptionHandler: function(errorMsg, errorObj) {
				// DWR typically doesn't provide a full 'response' object for exceptions,
				// so we pass the message and exception object directly.
				this.manageResponseError(currentRequest, errorMsg, errorObj);
			}.createDelegate(this)
		};
	},

	/**
	 * Helper function for `generateCallbackObject` to process 'read' operations.
	 * After creating records from the server response, it invokes the original
	 * callback function provided in the {@link Ext.app.remote.RpcConnector.CallRequest}.
	 * This mirrors `HttpProxy#onRead`.
	 * @param {Ext.app.remote.RpcConnector.CallRequest} currentRequest The request arguments from `performCall`.
	 * @param {Object} rpcResponse The data returned by the RPC call. Expected to be an object
	 *                 that the data reader can convert into {@link Ext.data.Records}.
	 * @private
	 */
	handleReadResult: function(currentRequest, rpcResponse) {
		var parsedDataBlock;
		try {
			// Use readRecords() directly because DWR already provides a JavaScript object,
			// bypassing the need for JSON decoding that read() would perform.
			parsedDataBlock = currentRequest.responseReader.readRecords(rpcResponse);
		} catch (e) {
			return this.manageResponseError(currentRequest, rpcResponse, e);
		}
		if (parsedDataBlock.success === false) {
			this.fireEvent("exception", this, 'remote', currentRequest.operationType, currentRequest.requestOptions, rpcResponse, null);
		} else {
			this.fireEvent("load", this, currentRequest, currentRequest.requestOptions);
		}
		currentRequest.finalCallback.call(currentRequest.callbackExecutionScope, parsedDataBlock, currentRequest.requestOptions, parsedDataBlock.success);
	},

	/**
	 * Helper function for `generateCallbackObject` to process 'create', 'update', and 'destroy' operations.
	 * This mirrors `HttpProxy#onWrite`.
	 * @param {Ext.app.remote.RpcConnector.CallRequest} currentRequest The request arguments from `performCall`.
	 * @param {Object} rpcResponse The data returned by the RPC call. Expected to be an object
	 *                 that the data reader can convert into {@link Ext.data.Records}.
	 * @private
	 */
	handleWriteResult: function(currentRequest, rpcResponse) {
		var parsedDataBlock;
		try {
			parsedDataBlock = currentRequest.responseReader.readResponse(currentRequest.operationType, rpcResponse);
		} catch (e) {
			return this.manageResponseError(currentRequest, rpcResponse, e);
		}
		if (parsedDataBlock.success === false) {
			this.fireEvent("exception", this, 'remote', currentRequest.operationType, currentRequest.requestOptions, rpcResponse, currentRequest.dataRecords);
		} else {
			this.fireEvent("write", this, currentRequest.operationType, parsedDataBlock.data, parsedDataBlock, currentRequest.dataRecords, currentRequest.requestOptions);
		}
		currentRequest.finalCallback.call(currentRequest.callbackExecutionScope, parsedDataBlock.data, parsedDataBlock, parsedDataBlock.success);
	},

	/**
	 * Centralized error handling for RPC responses.
	 * @param {Ext.app.remote.RpcConnector.CallRequest} currentRequest The request object associated with the error.
	 * @param {Object} rpcResponse The raw response from the RPC call (or an error message if response is unavailable).
	 * @param {Object} errorObj The exception object that was caught during processing.
	 */
	manageResponseError: function(currentRequest, rpcResponse, errorObj) {
		this.fireEvent("exception", this, 'response', currentRequest.operationType, currentRequest.requestOptions, rpcResponse, errorObj);
		currentRequest.finalCallback.call(currentRequest.callbackExecutionScope, null, currentRequest.requestOptions, false);
	}
});

/**
 * @class Ext.app.remote.RpcConnector.CallProcessor
 * Encapsulates the configuration and logic for handling a specific RPC operation type.
 * @constructor
 * @param {Object} spec The configuration object for this processor.
 * @cfg {String} operation [Required] The {@link Ext.data.Api} action type this handler manages.
 * @cfg {Function} remoteCallMethod [Required] The DWR-generated JavaScript function to invoke for this operation.
 * @cfg {Function} argumentTransformer [Optional] A custom function to prepare arguments for the `remoteCallMethod`.
 * This function will receive the following arguments:
 * - {@link Ext.app.remote.RpcConnector.CallRequest} The current request object, useful for all operation types.
 * - An `Array` of {@link Ext.data.Record#data} containing current (dirty) values.
 *   Applicable for all write operations (create, update, destroy).
 * - An `Array` of {@link Ext.data.Record#data} representing values before any changes.
 *   Primarily useful for 'update' operations.
 * The `argumentTransformer` must return an `Array` of arguments, ordered as expected by the `remoteCallMethod`.
 * This class will automatically append the DWR callback function as the final argument.
 * If `argumentTransformer` is not provided, default implementations from
 * {@link #defaultArgumentGenerators} are used.
 * @cfg {Object} transformerContext [Optional] The `scope` (this context) for executing `argumentTransformer`.
 * Defaults to `Object` if not specified.
 */
Ext.app.remote.RpcConnector.CallProcessor = function(spec) {
	Ext.apply(this, spec);
	if (!this.operation) {
		throw new Error('The "operation" property is not defined.');
	}
	if (!Ext.data.Api.isAction(this.operation)) {
		throw new Error(this.operation + ' is not a recognized Ext.data.Api action.');
	}
	if (!this.remoteCallMethod) {
		throw new Error('The "remoteCallMethod" property is not defined.');
	}
	if (!this.argumentTransformer) {
		this.argumentTransformer = this.defaultArgumentGenerators[this.operation];
	}
	if (!this.transformerContext) {
		this.transformerContext = Object;
	}
};
Ext.extend(Ext.app.remote.RpcConnector.CallProcessor, Object, {

	/*
	 * Internal properties
	 */
	defaultArgumentGenerators: {
		/**
		 * @return {Array} An empty array, indicating no arguments are passed for a simple read.
		 * @private
		 */
		read: function() {
			return [];
		},

		/**
		 * @param {Ext.app.remote.RpcConnector.CallRequest} currReq
		 * @param {Array} payloadArray Array of {@link Ext.data.Record#data} to be created.
		 * @return {Object[]} The `payloadArray` wrapped in another array, so the remote method
		 *                    receives a single parameter: a list of objects to create.
		 * @private
		 */
		create: function(currReq, payloadArray) {
			return [payloadArray];
		},

		/**
		 * @param {Ext.app.remote.RpcConnector.CallRequest} currReq
		 * @param {Array} payloadArray Array of {@link Ext.data.Record#data} with new values.
		 * @param {Array} previousPayloadArray Array of {@link Ext.data.Record#data} with old values.
		 * @return {Object[]} The `previousPayloadArray` and `payloadArray` wrapped in an array,
		 *                    providing two parameters: a list of items to update and their new states.
		 * @private
		 */
		update: function(currReq, payloadArray, previousPayloadArray) {
			return [previousPayloadArray, payloadArray];
		},

		/**
		 * @param {Ext.app.remote.RpcConnector.CallRequest} currReq
		 * @param {Array} payloadArray Array of {@link Ext.data.Record#data} representing items to destroy.
		 * @return {Object[]} The `payloadArray` wrapped in an array, supplying a single parameter:
		 *                    a list of objects to remove.
		 * @private
		 */
		destroy: function(currReq, payloadArray) {
			return [payloadArray];
		}
	}
});

Ext.namespace("Ext.app.remote.DataProxy");
/**
 * @class Ext.app.remote.RpcConnector.CallRequest
 * A container for the parameters passed to {@link Ext.data.DataProxy#request}.
 * @constructor
 * @param {String} operationType The CRUD operation type (e.g., 'create', 'read', 'update', 'destroy').
 * @param {Ext.data.Record/Ext.data.Record[]} dataRecords If the operation is 'read', this will be null.
 * @param {Object} requestParams An object containing properties to be used as parameters for the remote server request.
 * @param {Ext.data.DataReader} responseReader The {@link Ext.data.DataReader} instance responsible for converting
 *                                             the server's response into a "parsedDataBlock"
 *                                             (the result from {@link Ext.data.DataReader#read}).
 * @param {Function} finalCallback A function to be executed after the request completes.
 *                                 This callback receives the following arguments:
 *                                 <ul>
 *                                 <li>`parsedDataBlock`: The data object returned by {@link Ext.data.DataReader#read}.</li>
 *                                 <li>`requestOptions`: The options object (described below).</li>
 *                                 <li>`isSuccessful`: A boolean indicating the success status.</li>
 *                                 </ul>
 * @param {Object} callbackExecutionScope The `this` context in which to invoke the `finalCallback`.
 * @param {Object} requestOptions An optional argument passed as the second parameter to the `finalCallback`.
 */
Ext.app.remote.RpcConnector.CallRequest = function(operationType, dataRecords, requestParams, responseReader, finalCallback, callbackExecutionScope, requestOptions) {
	Ext.apply(this, {
		operationType: operationType,
		dataRecords: dataRecords,
		requestParams: requestParams,
		responseReader: responseReader,
		finalCallback: finalCallback,
		callbackExecutionScope: callbackExecutionScope,
		requestOptions: requestOptions
	});
};