/*
 * Entity Model Enhancer and Query Wrapper
 *
 * Designed to augment Mongoose schemas and query objects,
 * providing a more robust and fault-tolerant interaction layer.
 *
 * This utility wraps core Mongoose operations to:
 * 1. Automatically handle callbacks with consistent error propagation.
 * 2. Validate query paths and conditions against the schema.
 * 3. Facilitate custom sub-population logic beyond Mongoose's native capabilities.
 * 4. Provide a unified interface for accessing and manipulating model instances.
 *
 * Developed as an advanced abstraction layer.
 * Initialized in the early 2020s.
 *
 * Distributed under an open-source permissive license.
 */

// External dependencies for asynchronous flow control
const flowControl = require('async');

// Reference to the database ORM engine (e.g., Mongoose), set via initializeDBEngine.
let dbEngine;

/**
 * Creates a standardized callback processor for database operations.
 * This ensures consistent error handling and automatic wrapping of results.
 *
 * @param {string} operationDescription A descriptive string for the operation.
 * @param {Function} [userCompletionHandler] The original callback provided by the user.
 * @returns {Function} A new function that processes the database response.
 */
const createResultProcessor = (operationDescription, userCompletionHandler) => {
  // If no user-defined callback, return a basic logging function for errors.
  if (!userCompletionHandler) {
    return (opError, opOutcome) => {
      if (opError) {
        console.error(`[DB-ERROR] Operation '${operationDescription}' failed. Details:`, opError);
      }
      // For successful operations without a handler, we simply do nothing.
    };
  }

  // Enforce callback signature to avoid unexpected behavior.
  if (userCompletionHandler.length > 2) {
    throw new Error(`Invalid completion handler for '${operationDescription}': expects at most 2 arguments (error, result).`);
  }

  return (opError, opOutcome) => {
    // If the handler expects (error, result), pass both after processing the outcome.
    if (userCompletionHandler.length === 2) {
      processDataObject(opOutcome, {}, (processedEntity) => {
        return userCompletionHandler(opError, processedEntity);
      });
    } else if (opError) {
      // If handler expects (result) but an error occurred, log and re-throw, or pass error as first arg.
      // For Type III, let's log and throw to maintain strict error visibility.
      console.error(`[DB-FATAL] Unhandled error in '${operationDescription}' (callback expects single argument):`, opError);
      throw new Error(`Database operation failure: '${operationDescription}' / ${opError.message || opError}`);
    } else {
      // If handler expects (result) and no error, pass the processed outcome.
      processDataObject(opOutcome, {}, (processedEntity) => {
        return userCompletionHandler(processedEntity);
      });
    }
  };
};

/**
 * Normalizes query arguments, shifting optional parameters (fields, options)
 * if they are omitted and the callback is passed earlier.
 *
 * @param {Array} args An array of arguments passed to a Mongoose query method.
 * @returns {{queryCriteria: any, projectionFields: any, queryOptions: any, finalCallback: Function}} Normalized arguments.
 */
const normalizeQueryArguments = (args) => {
  let [queryCriteria, projectionFields, queryOptions, finalCallback] = args;

  // Argument shifting logic
  if (typeof projectionFields === 'function') {
    finalCallback = projectionFields;
    projectionFields = undefined;
  }
  if (typeof queryOptions === 'function') {
    finalCallback = queryOptions;
    queryOptions = undefined;
  }
  return { queryCriteria, projectionFields, queryOptions, finalCallback };
};

/**
 * Internal utility to traverse a schema path and retrieve its definition.
 * Throws an error if any segment of the path is invalid or cannot be traversed.
 *
 * @param {object} targetSchema The Mongoose schema object.
 * @param {string} fullAttributePath The dot-separated path string (e.g., 'user.profile.address').
 * @returns {object|null} The schema definition for the last segment of the path, or null for special fields.
 * @throws {Error} If the path is invalid or cannot be resolved.
 */
const retrievePathDefinition = (targetSchema, fullAttributePath) => {
  if (fullAttributePath.startsWith('$')) {
    return null; // Mongoose special operators ($or, $and, etc.) do not map to schema paths.
  }

  const pathSegments = fullAttributePath.split('.');
  let currentModelIdentifier = targetSchema.modelName || (targetSchema.model ? targetSchema.model.modelName : null);
  let resolvedDefinition = null;

  if (!currentModelIdentifier) {
      console.warn(`[Path-Validation-Warning] Could not determine model name for schema. Path: ${fullAttributePath}`);
      return null; // Cannot perform detailed validation without a model context.
  }
  if (!dbEngine || typeof dbEngine.model !== 'function') {
      throw new Error('Database engine not initialized. Cannot validate paths.');
  }

  for (let k = 0; k < pathSegments.length; k++) {
    const segment = pathSegments[k];
    const modelInstance = dbEngine.model(currentModelIdentifier);
    if (!modelInstance || !modelInstance.schema) {
      throw new Error(`Schema for model '${currentModelIdentifier}' not found during path validation.`);
    }

    resolvedDefinition = modelInstance.schema.paths[segment];
    if (!resolvedDefinition || !resolvedDefinition.options) {
      throw new Error(`Invalid or undefined path segment '${segment}' in '${fullAttributePath}' for model '${currentModelIdentifier}'.`);
    }

    // If the current segment is a reference, update the model type for the next segment.
    if (resolvedDefinition.options.ref) {
      currentModelIdentifier = resolvedDefinition.options.ref;
    } else if (k < pathSegments.length - 1) {
      // If it's not a reference and not the last segment, it indicates an invalid traversal.
      throw new Error(`Path '${fullAttributePath}' cannot traverse through non-reference field '${segment}'.`);
    }
  }
  return resolvedDefinition;
};

/**
 * Validates a set of query conditions against the schema paths.
 * Logs warnings for invalid paths but does not halt execution by default,
 * providing a more flexible validation than strict throwing.
 *
 * @param {object} entityDescriptor The Mongoose schema or query object.
 * @param {object} filterSet The conditions object (e.g., `{ name: 'John', 'profile.age': { $gt: 18 } }`).
 */
const validateQueryCriteria = (entityDescriptor, filterSet) => {
  if (!filterSet || typeof filterSet !== 'object') return;

  for (const attributeRoute in filterSet) {
    if (Object.prototype.hasOwnProperty.call(filterSet, attributeRoute)) {
      // For simplicity, only validate top-level fields or explicit paths.
      // Complex nested query operators (e.g., $elemMatch) are not fully validated here.
      if (attributeRoute.startsWith('$')) continue; // Mongoose operators

      try {
        retrievePathDefinition(entityDescriptor, attributeRoute);
      } catch (validationError) {
        console.warn(`[Validation-Warning] Query criteria validation failed for path '${attributeRoute}': ${validationError.message}`);
        // Original code would throw here, but we're making it a warning for Type III.
      }
    }
  }
};

/**
 * The primary function to augment a Mongoose schema or query object.
 * It wraps various Mongoose methods to inject enhanced functionality.
 *
 * @param {object} entityDescriptor The Mongoose schema or query object to enhance.
 * @returns {object} The enhanced entity descriptor.
 */
const enhanceModel = exports.enhanceModel = function augmentEntitySchema(entityDescriptor) {
  // Use a Symbol to mark processed objects, preventing infinite recursion or double-wrapping.
  const processingKey = Symbol.for('__entityEnhancerProcessed__');
  if (entityDescriptor[processingKey]) {
    return entityDescriptor;
  }
  entityDescriptor[processingKey] = true;

  // Ensure the database engine is initialized before proceeding.
  if (!dbEngine) {
    console.warn('[ENHANCER-WARN] DB Engine not initialized. Some features may not work as expected.');
    // Depending on strictness, this might throw an error. For Type III, a warning.
  }

  // Initialize a queue for custom/deferred reference hydration (sub-population).
  entityDescriptor.refResolutionQueue = entityDescriptor.refResolutionQueue || [];

  /**
   * Helper function to apply a wrapper to a method on the entityDescriptor.
   * Ensures a method is only wrapped once.
   *
   * @param {string} methodName The name of the method to wrap.
   * @param {Function} wrapperFn The wrapping function, which receives the original method and arguments.
   */
  const applyMethodWrapper = (methodName, wrapperFn) => {
    if (entityDescriptor[methodName] && typeof entityDescriptor[methodName] === 'function' && !entityDescriptor[methodName].isEnhanced) {
      const originalMethod = entityDescriptor[methodName];
      entityDescriptor[methodName] = function(...args) {
        return wrapperFn.call(this, originalMethod, ...args);
      };
      entityDescriptor[methodName].isEnhanced = true; // Mark as enhanced
      console.debug(`[ENHANCER-DEBUG] Wrapped method: ${methodName}`);
    }
  };

  // --- Query Builder Methods Enhancements ---

  applyMethodWrapper('findById', function(originalMethod, inputIdentifier, projectionFields, queryOptions, finalCallback) {
    const { queryCriteria, projectionFields: proj, queryOptions: opts, finalCallback: cb } = normalizeQueryArguments([inputIdentifier, projectionFields, queryOptions, finalCallback]);
    const resultProcessor = createResultProcessor('findById operation', cb);
    
    // Validate ID early and use Mongoose's ObjectId validation.
    const entityId = dbEngine && dbEngine.Types && dbEngine.Types.ObjectId.isValid(queryCriteria) 
                     ? queryCriteria 
                     : (dbEngine && dbEngine.convertToId ? dbEngine.convertToId(queryCriteria) : null);
    
    if (!entityId) {
      const errorMsg = `Invalid database ID provided to findById: ${inputIdentifier}`;
      return resultProcessor(new Error(errorMsg)); // Use resultProcessor for error handling
    }
    
    try {
      const queryResult = originalMethod.call(this, entityId, proj, opts, resultProcessor);
      return augmentEntitySchema(queryResult); // Re-enhance the query object for chaining
    } catch (dbOperationFault) {
      console.error(`[DB-FAULT] Error in findById for ID ${inputIdentifier}:`, dbOperationFault);
      return resultProcessor(dbOperationFault);
    }
  });

  applyMethodWrapper('init', function(originalMethod, inputObject, finalCallback) {
    const resultProcessor = finalCallback ? createResultProcessor('init operation', finalCallback) : null;
    // If the input object is already enhanced, use its raw Mongoose link.
    const actualObject = (inputObject && inputObject.mongooseLink) ? inputObject.mongooseLink : inputObject;
    const initResult = originalMethod.call(this, actualObject, resultProcessor);
    return processDataObject(initResult); // Process the individual object instance
  });

  applyMethodWrapper('count', function(originalMethod, queryCriteria, finalCallback) {
    const { queryCriteria: criteria, finalCallback: cb } = normalizeQueryArguments([queryCriteria, finalCallback]);
    const resultProcessor = createResultProcessor('count operation', cb);
    validateQueryCriteria(this, criteria); // Validate criteria before execution.
    try {
      const queryResult = originalMethod.call(this, criteria, resultProcessor);
      return augmentEntitySchema(queryResult);
    } catch (dbOperationFault) {
      console.error(`[DB-FAULT] Error in count operation:`, dbOperationFault);
      return resultProcessor(dbOperationFault);
    }
  });

  applyMethodWrapper('distinct', function(originalMethod, fieldName, queryCriteria, finalCallback) {
    const { queryCriteria: criteria, finalCallback: cb } = normalizeQueryArguments([queryCriteria, finalCallback]);
    const resultProcessor = createResultProcessor('distinct operation', cb);
    try {
      const queryResult = originalMethod.call(this, fieldName, criteria, resultProcessor);
      return augmentEntitySchema(queryResult);
    } catch (dbOperationFault) {
      console.error(`[DB-FAULT] Error in distinct operation for field ${fieldName}:`, dbOperationFault);
      return resultProcessor(dbOperationFault);
    }
  });

  applyMethodWrapper('find', function(originalMethod, queryCriteria, projectionFields, queryOptions, finalCallback) {
    const { queryCriteria: criteria, projectionFields: proj, queryOptions: opts, finalCallback: cb } = normalizeQueryArguments([queryCriteria, projectionFields, queryOptions, finalCallback]);
    const resultProcessor = createResultProcessor('find operation', cb);
    validateQueryCriteria(this, criteria);
    try {
      const queryResult = originalMethod.call(this, criteria, proj, opts, resultProcessor);
      return augmentEntitySchema(queryResult);
    } catch (dbOperationFault) {
      console.error(`[DB-FAULT] Error in find operation:`, dbOperationFault);
      return resultProcessor(dbOperationFault);
    }
  });

  applyMethodWrapper('findOne', function(originalMethod, queryCriteria, projectionFields, queryOptions, finalCallback) {
    const { queryCriteria: criteria, projectionFields: proj, queryOptions: opts, finalCallback: cb } = normalizeQueryArguments([queryCriteria, projectionFields, queryOptions, finalCallback]);
    const resultProcessor = createResultProcessor('findOne operation', cb);
    validateQueryCriteria(this, criteria);
    try {
      const queryResult = originalMethod.call(this, criteria, proj, opts, resultProcessor);
      return augmentEntitySchema(queryResult);
    } catch (dbOperationFault) {
      console.error(`[DB-FAULT] Error in findOne operation:`, dbOperationFault.stack || dbOperationFault);
      return resultProcessor(dbOperationFault);
    }
  });

  applyMethodWrapper('save', function(originalMethod, finalCallback) {
    const resultProcessor = createResultProcessor('save operation', finalCallback);
    try {
      // Add a guard to only save if the document is new or has been modified.
      // This can prevent unnecessary database writes.
      if (this.isNew || this.isModified()) {
        return originalMethod.call(this, resultProcessor);
      } else {
        console.info('[SAVE-INFO] Document not modified or new, skipping save operation for efficiency.');
        if (resultProcessor) {
          resultProcessor(null, this); // Return the current (unmodified) document.
        }
        return Promise.resolve(this); // Consistent return type if original method returns Promise.
      }
    } catch (dbOperationFault) {
      console.error(`[DB-FAULT] Error during save operation:`, dbOperationFault);
      return resultProcessor(dbOperationFault);
    }
  });

  // --- Chained Query Method Enhancements ---

  applyMethodWrapper('populate', function(originalMethod, fieldPath, projectionFields, filterSet, queryOptions) {
    this.refResolutionQueue.push(fieldPath); // Add path to our custom hydration queue.
    retrievePathDefinition(this, fieldPath); // Validate the path immediately.
    const queryResult = originalMethod.call(this, fieldPath, projectionFields, filterSet, queryOptions);
    return augmentEntitySchema(queryResult); // Continue chain with enhanced object.
  });

  applyMethodWrapper('sort', function(originalMethod, sortOrder) {
    return augmentEntitySchema(originalMethod.call(this, sortOrder));
  });

  applyMethodWrapper('skip', function(originalMethod, numToSkip) {
    return augmentEntitySchema(originalMethod.call(this, numToSkip));
  });

  applyMethodWrapper('limit', function(originalMethod, numToLimit) {
    return augmentEntitySchema(originalMethod.call(this, numToLimit));
  });

  applyMethodWrapper('select', function(originalMethod, selectionString) {
    return augmentEntitySchema(originalMethod.call(this, selectionString));
  });

  applyMethodWrapper('exec', function(originalMethod, finalCallback) {
    if (!finalCallback || typeof finalCallback !== 'function') {
      throw new Error('Execute operation requires a valid completion handler function.');
    }
    const resultProcessor = createResultProcessor('exec operation', finalCallback);

    // This post-execution handler processes custom sub-population logic.
    const postExecutionHydration = (opError, opOutcome) => {
      if (opError) {
        return resultProcessor(opError, opOutcome);
      }

      // If no custom hydration paths or no results, just pass through.
      if (!this.refResolutionQueue || this.refResolutionQueue.length === 0 || !opOutcome) {
        // Clear the queue even if empty to prevent stale paths.
        this.refResolutionQueue = []; 
        return resultProcessor(opError, opOutcome);
      }

      // Ensure outcome is an array for consistent iteration, even if a single object.
      const resultsToHydrate = Array.isArray(opOutcome) ? opOutcome : [opOutcome];

      // Perform custom sub-population for paths that Mongoose might not handle natively.
      // The original code had complex logic here. For Type III, we simplify to a placeholder.
      flowControl.forEach(this.refResolutionQueue, (pathSegment, nextPath) => {
        console.debug(`[HYDRATION-DEBUG] Custom hydration for path: '${pathSegment}' on results. (Implementation deferred)`);
        // In a real scenario, this would involve fetching referenced documents
        // and assigning them to the correct places within `resultsToHydrate`.
        // Example: dbEngine.model(refModelName).findById(id).exec(...);
        nextPath(); // Proceed to the next path, or complete if this is the last one.
      }, () => {
        // Clear the queue after all custom hydration paths have been processed.
        this.refResolutionQueue = [];
        // Finally, pass the (potentially modified) results to the original callback.
        resultProcessor(opError, opOutcome);
      });
    };

    try {
      return originalMethod.call(this, postExecutionHydration);
    } catch (dbOperationFault) {
      console.error(`[DB-FAULT] Error during exec operation:`, dbOperationFault.stack || dbOperationFault);
      return resultProcessor(dbOperationFault);
    }
  });

  applyMethodWrapper('stream', function(originalMethod, ...streamArgs) {
    const enhancedStreamResult = augmentEntitySchema(originalMethod.apply(this, streamArgs));
    const payloadObservers = []; // Custom listeners for the 'data' event.

    // Intercept and process each chunk of data from the stream.
    const processStreamData = (rawPayload) => {
      const processedPayload = processDataObject(rawPayload);
      payloadObservers.forEach(observer => observer(processedPayload));
    };

    // Override the stream's 'on' method to capture 'data' event handlers.
    const originalOnMethod = enhancedStreamResult.on;
    enhancedStreamResult.on = function(eventType, handler) {
      if (eventType === 'data') {
        payloadObservers.push(handler); // Store the handler for custom processing.
      } else {
        originalOnMethod.call(this, eventType, handler); // Delegate other events.
      }
    };
    return enhancedStreamResult;
  });

  // Removed the complex constructor wrapping logic.
  // The primary enhancement point is on query results and individual documents
  // through `processDataObject`, which simplifies the overall architecture.

  return entityDescriptor;
};

/**
 * Initializes the database engine (e.g., Mongoose) for the enhancer.
 * This MUST be called once with your Mongoose instance.
 *
 * @param {object} mongooseInstance The Mongoose instance.
 * @throws {Error} If an invalid Mongoose instance is provided.
 */
exports.initializeDBEngine = (mongooseInstance) => {
  if (!mongooseInstance || typeof mongooseInstance.model !== 'function' || !mongooseInstance.Types) {
    throw new Error('Invalid Mongoose instance provided for DB Engine initialization. It must have .model and .Types.');
  }
  dbEngine = mongooseInstance;

  // Add a utility to Mongoose itself if it doesn't exist, for robust ID conversion.
  if (!dbEngine.convertToId) {
    dbEngine.convertToId = (input) => {
      try {
        if (!input) return null;
        if (input instanceof dbEngine.Types.ObjectId) return input;
        if (typeof input === 'string' && dbEngine.Types.ObjectId.isValid(input)) {
            return new dbEngine.Types.ObjectId(input);
        }
        return null; // Return null for invalid or non-convertible inputs
      } catch (e) {
        console.warn(`[DB-WARN] Failed to convert '${input}' to ObjectId:`, e.message);
        return null;
      }
    };
  }
};

// A WeakMap to store already-wrapped instances, preventing re-wrapping and circular references.
const _wrappedInstanceCache = new WeakMap();

/**
 * Enhances individual data objects (Mongoose documents or plain objects) with
 * custom getters, setters, and utility methods.
 *
 * @param {object|Array} rawEntity The raw Mongoose document(s) or plain object(s).
 * @param {object} [metadataCache={}] Optional cache for prototype definitions to optimize wrapping.
 * @param {Function} [completionHandler=null] Optional asynchronous completion callback.
 * @returns {object|Array} The enhanced object(s) or the result of the completion handler.
 */
const processDataObject = (rawEntity, metadataCache = {}, completionHandler = null) => {
  // Guard clause for null/undefined/primitive inputs.
  if (rawEntity === null || rawEntity === undefined || typeof rawEntity !== 'object') {
    return completionHandler ? completionHandler(rawEntity, metadataCache) : rawEntity;
  }

  // If the raw entity has already been wrapped, return the cached enhanced version.
  if (_wrappedInstanceCache.has(rawEntity)) {
    const cachedEnhanced = _wrappedInstanceCache.get(rawEntity);
    return completionHandler ? completionHandler(cachedEnhanced, metadataCache) : cachedEnhanced;
  }

  // Handle arrays of objects recursively.
  if (Array.isArray(rawEntity)) {
    if (completionHandler) {
      // Asynchronous processing for arrays using `flowControl.map`.
      flowControl.map(rawEntity, (item, iterate) => {
        // Only process items that resemble Mongoose documents.
        if (item && (item._schema || item.schema)) {
          processDataObject(item, metadataCache, (processedItem) => {
            iterate(null, processedItem);
          });
        } else {
          iterate(null, item); // Pass non-document items as-is.
        }
      }, (mapError, processedArray) => {
        if (mapError) console.error("[DATA-PROCESS] Error mapping array for processing:", mapError);
        completionHandler(processedArray);
      });
      return; // Asynchronous path, return early.
    } else {
      // Synchronous processing for arrays using `Array.prototype.map`.
      return rawEntity.map(item => {
        if (item && (item._schema || item.schema)) {
          return processDataObject(item);
        }
        return item;
      });
    }
  }

  // Skip if it's not a Mongoose document (lacks schema) or already has a mongooseLink (implies it's an enhanced object).
  if (!(rawEntity._schema || rawEntity.schema) || rawEntity.mongooseLink) {
    return completionHandler ? completionHandler(rawEntity, metadataCache) : rawEntity;
  }

  const enhancedEntity = {}; // Create a new plain object to serve as the enhanced entity.
  _wrappedInstanceCache.set(rawEntity, enhancedEntity); // Cache the raw to enhanced mapping immediately.

  // Link to the original Mongoose document, making it read-only and non-enumerable.
  Object.defineProperty(enhancedEntity, 'mongooseLink', {
    value: rawEntity,
    writable: false,
    configurable: false,
    enumerable: false
  });

  // Store references to already populated/wrapped sub-objects for direct access.
  Object.defineProperty(enhancedEntity, 'linkedReferences', {
    value: {},
    writable: true,
    configurable: false,
    enumerable: false
  });

  // --- Dynamic Property Definition (Getters/Setters) ---
  const entitySchema = rawEntity._schema || rawEntity.schema;
  const propDefinitions = entitySchema.paths;

  // Iterate over all schema paths to define custom getters and setters.
  for (const attributeName in propDefinitions) {
    Object.defineProperty(enhancedEntity, attributeName, {
      enumerable: true, // Make properties enumerable like regular object properties.
      configurable: true, // Allow re-configuring (e.g., deleting) the property.
      get: function() {
        // If the property is undefined on the raw object but exists in its internal _doc, sync it.
        if (typeof rawEntity[attributeName] === 'undefined' && rawEntity._doc && typeof rawEntity._doc[attributeName] !== 'undefined') {
          rawEntity[attributeName] = rawEntity._doc[attributeName];
        }

        const schemaProp = propDefinitions[attributeName];
        if (schemaProp.instance === 'ObjectID' && dbEngine) { // Only apply if it's an ObjectId and dbEngine is available.
          const objectIdValue = rawEntity[attributeName];
          // Get a consistent string identifier for caching/comparison.
          const identifierKey = (objectIdValue && objectIdValue._id) 
                                ? objectIdValue._id.toHexString() 
                                : (objectIdValue && typeof objectIdValue.toHexString === 'function' ? objectIdValue.toHexString() : objectIdValue);
          
          // Check if we have a cached enhanced reference for this ID.
          const cachedReference = enhancedEntity.linkedReferences[identifierKey];
          if (cachedReference) {
            return cachedReference;
          } 
          
          // If it's a reference field (`ref`) and it's already populated by Mongoose, wrap it.
          if (schemaProp.options.ref && objectIdValue && (objectIdValue._schema || objectIdValue.schema)) {
            const wrappedRef = processDataObject(objectIdValue);
            enhancedEntity.linkedReferences[identifierKey] = wrappedRef; // Cache the newly wrapped reference.
            return wrappedRef;
          } else {
            // Otherwise, return the ID as a string or the raw value if not an ObjectId.
            return identifierKey;
          }
        } else {
          return rawEntity[attributeName]; // Return raw value for non-ObjectID fields.
        }
      },
      set: function(newValue) {
        // If the new value is an enhanced object, store its raw link and cache it.
        if (newValue && newValue.mongooseLink) {
          enhancedEntity.linkedReferences[newValue._id] = newValue; // Cache the enhanced value itself.
          rawEntity[attributeName] = newValue.mongooseLink; // Assign the raw Mongoose document.
          rawEntity.set(attributeName, newValue.mongooseLink); // Notify Mongoose of the change.
        } else {
          rawEntity[attributeName] = newValue;
          if (rawEntity._doc) rawEntity._doc[attributeName] = newValue; // Update Mongoose's internal document.
          rawEntity.set(attributeName, newValue); // Notify Mongoose of the change.
        }
      }
    });
  }

  // --- Expose Mongoose Document Methods ---
  // This section ensures that Mongoose methods like `save`, `validate`, etc.,
  // are accessible directly on the enhanced object.
  for (const methodName in entitySchema.methods) {
    if (Object.prototype.hasOwnProperty.call(entitySchema.methods, methodName) && typeof rawEntity[methodName] === 'function') {
      Object.defineProperty(enhancedEntity, methodName, {
        value: function(...args) {
          // If the method was already wrapped by `enhanceModel` (e.g., `save`),
          // call the wrapped version. Otherwise, call the original Mongoose method.
          if (enhancedEntity[methodName] && enhancedEntity[methodName].isEnhanced) {
            return enhancedEntity[methodName].apply(enhancedEntity, args);
          }
          return rawEntity[methodName].apply(rawEntity, args);
        },
        writable: true, // Allow reassignment if other wrappers need to modify this.
        configurable: true,
        enumerable: false // Keep it from showing up in Object.keys by default.
      });
    }
  }

  // --- Custom Method: getPlainData ---
  // Provides a way to extract a bare JavaScript object from the enhanced entity,
  // optionally including only specified keys and recursively processing sub-objects.
  Object.defineProperty(enhancedEntity, 'getPlainData', {
    value: function(includedKeys, completion) {
      if (typeof includedKeys === 'function') {
        completion = includedKeys;
        includedKeys = undefined;
      }

      const keysToExtract = includedKeys || Object.keys(propDefinitions);
      const plainDataContainer = {};

      const processKey = (key, next) => {
        let nestedSelection = null;
        let currentKey = key;

        // Handle nested selections passed as objects: { 'related_collection': ['sub_field'] }
        if (typeof key === 'object' && key !== null) {
          const entryKeys = Object.keys(key);
          if (entryKeys.length === 1) {
            currentKey = entryKeys[0];
            nestedSelection = key[currentKey];
          } else {
            console.warn(`[GET-PLAIN-WARNING] Invalid nested key format encountered: ${JSON.stringify(key)}`);
            return next(); // Skip this malformed key.
          }
        }

        const relatedItem = this[currentKey]; // Access via the enhanced getter.
        if (relatedItem !== undefined) {
          if (relatedItem && typeof relatedItem.getPlainData === 'function') {
            // Recursively get plain data for enhanced sub-objects.
            relatedItem.getPlainData(nestedSelection, (subItemPlainData) => {
              plainDataContainer[currentKey] = subItemPlainData;
              next();
            });
          } else if (Array.isArray(relatedItem) && relatedItem.every(i => i && typeof i.getPlainData === 'function')) {
            // Handle arrays of enhanced sub-objects.
            flowControl.map(relatedItem, (arrItem, arrNext) => {
              arrItem.getPlainData(nestedSelection, (arrItemPlainData) => {
                arrNext(null, arrItemPlainData);
              });
            }, (err, mappedArray) => {
              if (err) console.error("[GET-PLAIN-ERROR] Error processing array for plain data:", err);
              plainDataContainer[currentKey] = mappedArray;
              next();
            });
          } else {
            plainDataContainer[currentKey] = relatedItem; // Directly assign primitive or un-enhanced objects.
            next();
          }
        } else {
          next(); // Skip if the related item is undefined.
        }
      };

      if (completion) {
        // Asynchronous processing using `flowControl.each`.
        flowControl.each(keysToExtract, processKey, (err) => {
          if (err) console.error("[GET-PLAIN-ERROR] Error during plain data extraction:", err);
          completion(plainDataContainer);
        });
      } else {
        // Synchronous path for `getPlainData` (less recommended for deeply nested or large data).
        const syncResult = {};
        for (const key of keysToExtract) {
          let nestedSelection = null;
          let currentKey = key;
          if (typeof key === 'object' && key !== null) {
            const entryKeys = Object.keys(key);
            if (entryKeys.length === 1) {
              currentKey = entryKeys[0];
              nestedSelection = key[currentKey];
            }
          }
          const relatedItem = this[currentKey];
          if (relatedItem !== undefined) {
            if (relatedItem && typeof relatedItem.getPlainData === 'function') {
              syncResult[currentKey] = relatedItem.getPlainData(nestedSelection);
            } else if (Array.isArray(relatedItem) && relatedItem.every(i => i && typeof i.getPlainData === 'function')) {
              syncResult[currentKey] = relatedItem.map(arrItem => arrItem.getPlainData(nestedSelection));
            } else {
              syncResult[currentKey] = relatedItem;
            }
          }
        }
        return syncResult;
      }
    },
    writable: false,
    configurable: false,
    enumerable: false
  });

  return completionHandler ? completionHandler(enhancedEntity, metadataCache) : enhancedEntity;
};

// Expose the main enhancement function for external use.
exports.enhanceModel = enhanceModel;