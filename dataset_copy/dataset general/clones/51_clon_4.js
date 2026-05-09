const EventDispatcher = function() {
    this._listeners = {};
};

EventDispatcher.prototype.on = function(signalName, handlerFn, handlerContext) {
    if (!this._listeners[signalName]) {
        this._listeners[signalName] = [];
    }
    this._listeners[signalName].push({ func: handlerFn, context: handlerContext });
};

EventDispatcher.prototype.emitSignal = function(signalName, ...payload) {
    if (this._listeners[signalName]) {
        this._listeners[signalName].forEach(listener => {
            listener.func.apply(listener.context || this, payload);
        });
    }
    return true;
};

const AbstractDataInterface = function(initialConfiguration) {
    this.initialConfiguration = initialConfiguration || {};
    EventDispatcher.call(this);
};
Object.setPrototypeOf(AbstractDataInterface.prototype, EventDispatcher.prototype);

Object.assign(AbstractDataInterface.prototype, {
    initiateTransfer: function(operation, entities, parameters, parser, handler, context, opts) {
        throw new Error("initiateTransfer must be implemented by concrete data interfaces.");
    },

    processReadOutcome: function(requestObject, serviceResponse) {
        let structuredBlock;
        try {
            structuredBlock = requestObject.parser.extractRecords(serviceResponse);
        } catch(e) {
            return this.handleServiceFailure(requestObject, serviceResponse, e);
        }
        if (structuredBlock.success === false) {
            this.emitSignal("issue", this, 'remote', requestObject.operation, requestObject.options, serviceResponse, null);
        } else {
            this.emitSignal("retrieved", this, requestObject, requestObject.options);
        }
        requestObject.handler.call(requestObject.context, structuredBlock, requestObject.options, structuredBlock.success);
    },

    processWriteOutcome: function(requestObject, serviceResponse) {
        let structuredBlock;
        try {
            structuredBlock = requestObject.parser.extractResponse(requestObject.operation, serviceResponse);
        } catch (e) {
            return this.handleServiceFailure(requestObject, serviceResponse, e);
        }
        if (structuredBlock.success === false) {
            this.emitSignal("issue", this, 'remote', requestObject.operation, requestObject.options, serviceResponse, requestObject.entities);
        } else {
            this.emitSignal("persisted", this, requestObject.operation, structuredBlock.data, structuredBlock, requestObject.entities, requestObject.options);
        }
        requestObject.handler.call(requestObject.context, structuredBlock.data, structuredBlock, structuredBlock.success);
    },

    handleServiceFailure: function(requestObject, serviceResponse, errorObject) {
        this.emitSignal("issue", this, 'response', requestObject.operation, requestObject.options, serviceResponse, errorObject);
        requestObject.handler.call(requestObject.context, null, requestObject.options, false);
    }
});

const DataOperations = {
    retrieve: 'retrieve',
    add: 'add',
    alter: 'alter',
    remove: 'remove'
};

const isValidOperation = function(op) {
    return Object.values(DataOperations).includes(op);
};

const extractEntityPayload = (entityCollection) => {
    return (entityCollection || []).map(entity => entity.currentPayload || {});
};

const extractPriorEntityPayload = (entityCollection) => {
    const priorPayloads = [];
    (entityCollection || []).forEach(entity => {
        priorPayloads.push(Object.assign({}, entity.changedPayload, entity.currentPayload));
    });
    return priorPayloads;
};

const ServiceRequest = function(operation, entities, parameters, parser, handler, context, opts) {
    Object.assign(this, {
        operation: operation,
        entities: entities,
        parameters: parameters,
        parser: parser,
        handler: handler,
        context: context,
        options: opts
    });
};

const OperationProcessor = function(configObj) {
    Object.assign(this, configObj);
    if (!this.operation) {
        throw new Error('"operation" property is mandatory.');
    }
    if (!isValidOperation(this.operation)) {
        throw new Error(this.operation + ' is not a recognized data operation.');
    }
    if (!this.serviceMethod) {
        throw new Error('"serviceMethod" property is mandatory.');
    }
    if (!this.argumentMapper) {
        this.argumentMapper = this.defaultArgumentMappers[this.operation];
    }
    if (!this.mapperContext) {
        this.mapperContext = null;
    }
};

OperationProcessor.prototype.defaultArgumentMappers = {
    retrieve: function() {
        return [];
    },
    add: function(reqObj, entityPayloadArray) {
        return [entityPayloadArray];
    },
    alter: function(reqObj, entityPayloadArray, oldEntityPayloadArray) {
        return [oldEntityPayloadArray, entityPayloadArray];
    },
    remove: function(reqObj, entityPayloadArray) {
        return [entityPayloadArray];
    }
};

const RemoteDataGateway = function(config) {
    if (!config || !config.operationProcessorsMap) {
        throw new Error('"operationProcessorsMap" is not defined within configuration.');
    }

    this.operationProcessors = {};
    Object.keys(DataOperations).forEach(opKey => {
        const processorConfig = config.operationProcessorsMap[DataOperations[opKey]];
        if (processorConfig) {
            processorConfig.operation = DataOperations[opKey];
            this.operationProcessors[DataOperations[opKey]] = new OperationProcessor(processorConfig);
        }
    });

    const baseConfig = Object.assign({}, config, { serviceMap: this.operationProcessors });
    AbstractDataInterface.call(this, baseConfig);
};
Object.setPrototypeOf(RemoteDataGateway.prototype, AbstractDataInterface.prototype);

RemoteDataGateway.prototype.initiateTransfer = function(operation, entities, parameters, parser, handler, context, opts) {
    const requestObject = new ServiceRequest(operation, entities, parameters, parser, handler, context, opts);
    const processor = this.operationProcessors[operation];
    if (!processor) {
        throw new Error('No operation processor defined for operation: ' + operation);
    }

    const methodArguments = processor.argumentMapper.call(
        processor.mapperContext,
        requestObject,
        extractEntityPayload(entities),
        extractPriorEntityPayload(entities)
    ) || [];

    methodArguments.push(this.createDwrCompatibleCallbacks(requestObject));
    processor.serviceMethod.apply(null, methodArguments);
};

RemoteDataGateway.prototype.createDwrCompatibleCallbacks = function(requestObject) {
    const currentInstance = this;
    return {
        callback: function(responsePayload) {
            if (requestObject.operation === DataOperations.retrieve) {
                currentInstance.processReadOutcome(requestObject, responsePayload);
            } else {
                currentInstance.processWriteOutcome(requestObject, responsePayload);
            }
        },
        exceptionHandler: function(message, exceptionDetails) {
            currentInstance.handleServiceFailure(requestObject, message, exceptionDetails);
        }
    };
};