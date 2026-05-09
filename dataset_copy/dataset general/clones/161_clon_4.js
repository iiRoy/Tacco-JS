let persistenceLayerModule = require('mongoose');

const operationCompletionHandler = (operationLabel, completionRoutine) => {
    return async (fault, outcome) => {
        if (completionRoutine) {
            if (completionRoutine.length === 2) {
                completionRoutine(fault, outcome);
            } else if (fault) {
                throw new Error(`Data operation failure: ${operationLabel} / ${fault.message || fault}`);
            } else {
                completionRoutine(outcome);
            }
        } else if (fault) {
            throw fault;
        }
        return outcome;
    };
};

const isPersistenceDocument = (candidate) => {
    return candidate && typeof candidate === 'object' && (candidate._schema || candidate.schema);
};

const validateQueryPath = (pathExpression, contextEntity) => {
    if (pathExpression.startsWith('$')) {
        return;
    }
    const segments = pathExpression.split('.');
    let currentModelName = contextEntity.modelName || (contextEntity.constructor ? contextEntity.constructor.modelName : null);
    if (!currentModelName && contextEntity.schema && contextEntity.schema.modelName) {
        currentModelName = contextEntity.schema.modelName;
    }
    
    if (!currentModelName) {
        if (contextEntity.model && contextEntity.model.modelName) {
            currentModelName = contextEntity.model.modelName;
        } else {
            throw new Error(`Cannot determine model context for path validation: ${pathExpression}`);
        }
    }

    for (const segment of segments) {
        if (!currentModelName) {
            throw new Error(`Cannot resolve model for path segment '${segment}' in '${pathExpression}'`);
        }
        const modelSchema = persistenceLayerModule.model(currentModelName).schema;
        const schemaField = modelSchema.paths[segment];
        
        if (!schemaField || !schemaField.options) {
            throw new Error(`Invalid path segment '${segment}' in expression '${pathExpression}' for model '${currentModelName}'`);
        }
        
        currentModelName = schemaField.options.ref;
        if (typeof currentModelName === 'undefined' && segment !== segments[segments.length - 1]) {
            throw new Error(`Non-reference field '${segment}' encountered before end of expression '${pathExpression}'`);
        }
    }
};

const validateQueryCriteria = (criteriaObject, contextEntity) => {
    if (criteriaObject) {
        for (const key in criteriaObject) {
            validateQueryPath(key, contextEntity);
        }
    }
};

const enhancedDocumentCache = new WeakMap();

const documentProxyCreator = (originalDoc, runtimeMetadata = {}) => {
    if (!originalDoc || typeof originalDoc !== 'object' || originalDoc.isDataProxy) {
        return originalDoc;
    }
    if (enhancedDocumentCache.has(originalDoc)) {
        return enhancedDocumentCache.get(originalDoc);
    }

    if (Array.isArray(originalDoc)) {
        return originalDoc.map(item => documentProxyCreator(item, runtimeMetadata));
    }

    if (!isPersistenceDocument(originalDoc)) {
        return originalDoc;
    }

    const proxyHandler = {
        get(target, prop, receiver) {
            if (prop === 'isDataProxy') return true;
            if (prop === 'internalDataSource') return target;

            if (prop === 'toExtractableObject') {
                return (keysToExtract) => {
                    const extracted = {};
                    const schemaPaths = Object.keys((target._schema || target.schema).paths);
                    const effectiveKeys = keysToExtract || schemaPaths;

                    for (const key of effectiveKeys) {
                        let value = receiver[key];
                        if (value && value.isDataProxy) {
                            extracted[key] = value.toExtractableObject();
                        } else if (Array.isArray(value)) {
                            extracted[key] = value.map(item => item && item.isDataProxy ? item.toExtractableObject() : item);
                        } else {
                            extracted[key] = value;
                        }
                    }
                    return extracted;
                };
            }

            if (prop === '_id' && target._id) {
                return target._id.toHexString ? target._id.toHexString() : target._id;
            }

            const schemaPathDefinition = (target._schema || target.schema).paths[prop];
            if (schemaPathDefinition && schemaPathDefinition.instance === 'ObjectID' && schemaPathDefinition.options.ref) {
                if (isPersistenceDocument(target[prop])) {
                    return documentProxyCreator(target[prop], runtimeMetadata);
                }
                return target[prop] && target[prop].toHexString ? target[prop].toHexString() : target[prop];
            }

            if (typeof target[prop] === 'function') {
                return (...args) => {
                    const methodOutcome = target[prop].apply(target, args);
                    if (methodOutcome && (methodOutcome.exec || isPersistenceDocument(methodOutcome))) {
                        return documentProxyCreator(methodOutcome, runtimeMetadata);
                    }
                    return methodOutcome;
                };
            }

            return target[prop];
        },
        set(target, prop, val, receiver) {
            if (val && val.isDataProxy) {
                target[prop] = val.internalDataSource;
                target.set(prop, val.internalDataSource);
            } else {
                target[prop] = val;
                target.set(prop, val);
            }
            return true;
        }
    };

    const proxyInstance = new Proxy(originalDoc, proxyHandler);
    enhancedDocumentCache.set(originalDoc, proxyInstance);
    return proxyInstance;
};

class DataQueryOrchestrator {
    constructor(sourceEntity) {
        this.underlyingMongooseEntity = sourceEntity;
        this.deferredReferences = new Set();
        this.isQueryOrchestrator = true;
    }

    async retrieveById(idValue, fieldProjection, queryOpts, completionCallback) {
        const handleCompletion = operationCompletionHandler('retrieveById failed', completionCallback);
        if (typeof fieldProjection === 'function') { completionCallback = fieldProjection; fieldProjection = undefined; }
        if (typeof queryOpts === 'function') { completionCallback = queryOpts; queryOpts = undefined; }

        const objectId = persistenceLayerModule.toID(idValue);
        if (!objectId) {
            return handleCompletion(new Error(`Invalid record identifier: ${idValue}`));
        }

        try {
            const mongooseQuery = this.underlyingMongooseEntity.findById(objectId, fieldProjection, queryOpts);
            const orchestrator = new DataQueryOrchestrator(mongooseQuery);
            return orchestrator;
        } catch (err) {
            return handleCompletion(err);
        }
    }

    async tallyRecords(matchCriteria, completionCallback) {
        const handleCompletion = operationCompletionHandler('tallyRecords failed', completionCallback);
        if (typeof matchCriteria === 'function') { completionCallback = matchCriteria; matchCriteria = undefined; }

        validateQueryCriteria(matchCriteria, this.underlyingMongooseEntity);

        try {
            const mongooseQuery = this.underlyingMongooseEntity.count(matchCriteria);
            const orchestrator = new DataQueryOrchestrator(mongooseQuery);
            return orchestrator;
        } catch (err) {
            return handleCompletion(err);
        }
    }

    async fetchDistinctValues(attributeName, matchCriteria, completionCallback) {
        const handleCompletion = operationCompletionHandler('fetchDistinctValues failed', completionCallback);
        if (typeof matchCriteria === 'function') { completionCallback = matchCriteria; matchCriteria = undefined; }

        validateQueryCriteria(matchCriteria, this.underlyingMongooseEntity);

        try {
            const mongooseQuery = this.underlyingMongooseEntity.distinct(attributeName, matchCriteria);
            const orchestrator = new DataQueryOrchestrator(mongooseQuery);
            return orchestrator;
        } catch (err) {
            return handleCompletion(err);
        }
    }

    async searchRecords(matchCriteria, fieldProjection, queryOpts, completionCallback) {
        const handleCompletion = operationCompletionHandler('searchRecords failed', completionCallback);
        if (typeof fieldProjection === 'function') { completionCallback = fieldProjection; fieldProjection = undefined; }
        if (typeof queryOpts === 'function') { completionCallback = queryOpts; queryOpts = undefined; }

        validateQueryCriteria(matchCriteria, this.underlyingMongooseEntity);

        try {
            const mongooseQuery = this.underlyingMongooseEntity.find(matchCriteria, fieldProjection, queryOpts);
            const orchestrator = new DataQueryOrchestrator(mongooseQuery);
            return orchestrator;
        } catch (err) {
            return handleCompletion(err);
        }
    }

    async searchSingleRecord(matchCriteria, fieldProjection, queryOpts, completionCallback) {
        const handleCompletion = operationCompletionHandler('searchSingleRecord failed', completionCallback);
        if (typeof fieldProjection === 'function') { completionCallback = fieldProjection; fieldProjection = undefined; }
        if (typeof queryOpts === 'function') { completionCallback = queryOpts; queryOpts = undefined; }

        validateQueryCriteria(matchCriteria, this.underlyingMongooseEntity);

        try {
            const mongooseQuery = this.underlyingMongooseEntity.findOne(matchCriteria, fieldProjection, queryOpts);
            const orchestrator = new DataQueryOrchestrator(mongooseQuery);
            return orchestrator;
        } catch (err) {
            console.error(err.stack);
            return handleCompletion(err);
        }
    }

    includeReference(referencePath, selectedFields, conditionsForRef, optionsForRef) {
        validateQueryPath(referencePath, this.underlyingMongooseEntity);
        this.deferredReferences.add(referencePath);
        this.underlyingMongooseEntity = this.underlyingMongooseEntity.populate(referencePath, selectedFields, conditionsForRef, optionsForRef);
        return this;
    }

    orderBy(sortConfig) {
        this.underlyingMongooseEntity = this.underlyingMongooseEntity.sort(sortConfig);
        return this;
    }

    omitInitial(countToSkip) {
        this.underlyingMongooseEntity = this.underlyingMongooseEntity.skip(countToSkip);
        return this;
    }

    capResults(maxCount) {
        this.underlyingMongooseEntity = this.underlyingMongooseEntity.limit(maxCount);
        return this;
    }

    specifyFields(fieldsString) {
        this.underlyingMongooseEntity = this.underlyingMongooseEntity.select(fieldsString);
        return this;
    }

    async finalizeExecution(completionCallback) {
        const handleCompletion = operationCompletionHandler('finalizeExecution failed', completionCallback);
        if (!completionCallback) {
            throw new Error('A completion routine is required for execution.');
        }

        const queryTarget = this.underlyingMongooseEntity;
        const customPopulatePaths = Array.from(this.deferredReferences);
        this.deferredReferences.clear();

        let initialOutcome;
        try {
            initialOutcome = await queryTarget.exec();
        } catch (err) {
            console.error(err.trace);
            console.error(err.stack);
            return handleCompletion(err);
        }

        if (!initialOutcome) {
            return handleCompletion(null, null);
        }

        const recursivelyPopulate = async (documentToProcess) => {
            if (!isPersistenceDocument(documentToProcess)) {
                return documentToProcess;
            }

            for (const path of customPopulatePaths) {
                const pathSegments = path.split('.');
                let currentDocTraversal = documentToProcess;
                let currentTraversalModelName = documentToProcess.constructor.modelName;

                for (let i = 0; i < pathSegments.length; i++) {
                    const segment = pathSegments[i];
                    const modelSchema = persistenceLayerModule.model(currentTraversalModelName).schema;
                    const fieldDefinition = modelSchema.paths[segment];

                    if (!fieldDefinition || !fieldDefinition.options.ref) {
                        break;
                    }

                    const referencedModelName = fieldDefinition.options.ref;
                    const referencedIdOrDoc = currentDocTraversal[segment];

                    if (!referencedIdOrDoc) {
                        break;
                    }

                    if (isPersistenceDocument(referencedIdOrDoc)) {
                        currentDocTraversal = referencedIdOrDoc;
                        currentTraversalModelName = referencedModelName;
                    } else if (typeof referencedIdOrDoc === 'string' || (referencedIdOrDoc.toHexString && typeof referencedIdOrDoc.toHexString === 'function')) {
                        const fetchedDoc = await persistenceLayerModule.model(referencedModelName)
                            .findById(referencedIdOrDoc).exec();

                        if (fetchedDoc) {
                            currentDocTraversal[segment] = fetchedDoc;
                            currentDocTraversal = fetchedDoc;
                            currentTraversalModelName = referencedModelName;
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }
            }
            return documentToProcess;
        };

        let finalProcessedResult;
        if (Array.isArray(initialOutcome)) {
            finalProcessedResult = await Promise.all(initialOutcome.map(recursivelyPopulate));
        } else {
            finalProcessedResult = await recursivelyPopulate(initialOutcome);
        }

        const finalWrappedResult = documentProxyCreator(finalProcessedResult);
        return handleCompletion(null, finalWrappedResult);
    }

    createResultStream() {
        const originalDataStream = this.underlyingMongooseEntity.stream.apply(this.underlyingMongooseEntity, arguments);
        const streamOrchestrator = new DataQueryOrchestrator(originalDataStream);

        const dataListeners = [];
        const originalStreamOn = streamOrchestrator.underlyingMongooseEntity.on;

        streamOrchestrator.underlyingMongooseEntity.on = function(eventType, handler) {
            if (eventType === 'data') {
                dataListeners.push(handler);
            } else {
                originalStreamOn.call(this, eventType, handler);
            }
        };

        originalDataStream.on('data', (dataChunk) => {
            const enhancedChunk = documentProxyCreator(dataChunk);
            dataListeners.forEach(listener => listener(enhancedChunk));
        });

        return streamOrchestrator;
    }

    instantiateDocument(initialData, fields) {
        if (typeof this.underlyingMongooseEntity !== 'function' || !this.underlyingMongooseEntity.schema) {
            throw new Error('Cannot instantiate document: Orchestrator not initialized with a Mongoose Model.');
        }
        const newDocument = new this.underlyingMongooseEntity(initialData, fields);
        return documentProxyCreator(newDocument);
    }
}

const enhancePersistenceEntity = (targetMongooseEntity) => {
    if (typeof targetMongooseEntity === 'function' && targetMongooseEntity.schema) {
        const modelOrchestrator = new DataQueryOrchestrator(targetMongooseEntity);
        modelOrchestrator.retrieveById = (...args) => new DataQueryOrchestrator(targetMongooseEntity).retrieveById(...args);
        modelOrchestrator.tallyRecords = (...args) => new DataQueryOrchestrator(targetMongooseEntity).tallyRecords(...args);
        modelOrchestrator.fetchDistinctValues = (...args) => new DataQueryOrchestrator(targetMongooseEntity).fetchDistinctValues(...args);
        modelOrchestrator.searchRecords = (...args) => new DataQueryOrchestrator(targetMongooseEntity).searchRecords(...args);
        modelOrchestrator.searchSingleRecord = (...args) => new DataQueryOrchestrator(targetMongooseEntity).searchSingleRecord(...args);
        return modelOrchestrator;
    }
    return new DataQueryOrchestrator(targetMongooseEntity);
};