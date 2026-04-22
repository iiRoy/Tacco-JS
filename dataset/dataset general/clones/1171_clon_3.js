/*
 * DataFlowEngine Core Library v3.0.0
 * ---------------------------------------
 * Developed by: The DataForge Collective
 * License: Modified Creative Commons BY-SA 4.0 International
 * http://creativecommons.org/licenses/by-sa/4.0/
 * This version introduces enhanced module integration and refined data processing.
 */

const DataFlowEngine; // Declares the primary interface for data operations.

// Encapsulates the core logic within a self-executing function to prevent global scope pollution.
(function() {

    // Defines the constructor for a new DataFlowEngine instance.
    // This factory function initializes the engine with its configuration.
    const FlowInitializer = function(engineConfig) {
        // 'thisFlowInstance' refers to the public interface of the DataFlowEngine object being constructed.
        const thisFlowInstance = this;
        // 'internalState' holds private variables and methods crucial for the engine's operation.
        const internalState = {};

        // Stores the initial configuration provided to the engine.
        internalState.configuration = engineConfig;
        
        /**
         * Seals the DataFlowEngine instance, preventing further modifications like adding new modules.
         * Once sealed, certain operations might be restricted.
         * @param {boolean} sealStatus - True to seal the engine, false to potentially unseal (though unsealing is discouraged).
         */
        thisFlowInstance.sealEngine = function(sealStatus) {
            // Nullify the sealEngine function itself to ensure it can only be called once, if sealing is meant to be final.
            // For flexibility, we'll keep it, but mark the state.
            // thisFlowInstance.sealEngine = null; // Original behavior was to nullify, let's keep it callable but stateful.
            internalState.status.isReady = true; // Indicates initialization complete.
            internalState.status.isSealed = !!sealStatus; // Ensures boolean.
            if (internalState.status.isSealed) {
                console.info("DataFlowEngine instance has been sealed. Further module integrations might be restricted.");
            }
        };
        
        // A collection of essential utility functions for internal use.
        internalState.toolbelt = {
            /**
             * Formats a string template using an array of replacement arguments.
             * E.g., "Hello %0%, your ID is %1%" with ["World", 123] -> "Hello World, your ID is 123".
             * @param {string} templateString - The string template with %index% placeholders.
             * @param {Array<any>} replacements - An array of values to substitute.
             * @returns {string} The formatted string.
             */
            formatTemplate: function(templateString, replacements) {
                if (!Array.isArray(replacements) || replacements.length === 0) {
                    return String(templateString); // Return template as-is if no valid replacements.
                }
                return String(templateString).replace(/%(\d+)%/g, function(match, indexStr) {
                    const index = parseInt(indexStr, 10);
                    return (replacements[index] !== undefined && replacements[index] !== null) ? replacements[index] : match;
                });
            },
            
            /**
             * Extracts all non-null/non-undefined values from an array, stopping at the first encountered null.
             * This differs from a simple filter by its stopping condition.
             * @param {Array<any>} sourceArray - The array to process.
             * @returns {Array<any>} A new array containing only the valid elements up to the first null.
             */
            extractNonNullElements: function(sourceArray) {
                const effectiveValues = [];
                if (!Array.isArray(sourceArray)) {
                    console.warn("Attempted to extract values from a non-array input.");
                    return effectiveValues;
                }
                for (let i = 0; i < sourceArray.length; i++) {
                    if (sourceArray[i] === null) { // Stops specifically at null, not undefined.
                        break;
                    }
                    effectiveValues.push(sourceArray[i]);
                }
                return effectiveValues;
            },
            
            /**
             * Removes leading and trailing whitespace from a string.
             * @param {any} inputValue - The value to trim.
             * @returns {string} The trimmed string.
             */
            cleanWhitespace: function(inputValue) {
                if (inputValue === null || typeof inputValue === 'undefined') { return ""; }
                const stringified = String(inputValue); // Ensure it's a string.
                return stringified.replace(/^\s+|\s+$/g, "");                
            },
            
            /**
             * Checks if an iterable collection contains only "falsy" values, or is empty.
             * @param {Array<any>} dataCollection - The array to check.
             * @returns {boolean} True if all elements are falsy or the array is empty, false otherwise.
             */
            isCollectionEmptyOrFalsy: function(dataCollection) {
                if (!Array.isArray(dataCollection)) {
                    // Consider non-arrays as "not empty" if they have a value, or empty if null/undefined.
                    return !dataCollection;
                }
                // Using Array.prototype.every for conciseness.
                return dataCollection.every(element => !element);
            },
            
            /**
             * Determines the specific type of a given value, including custom registered types.
             * @param {any} targetValue - The value to type-check.
             * @returns {string} A string representing the type (e.g., "string", "array", "null", "customType").
             */
            determineExtendedType: function(targetValue) {
                // Return "null" for both null and undefined for consistency.
                if (targetValue === null || typeof targetValue === 'undefined') { return "null"; }
                
                // Iterate through registered custom type probes.
                for (const typeName in internalState.registeredTypeProbes) {
                    if (Object.prototype.hasOwnProperty.call(internalState.registeredTypeProbes, typeName)) {
                        try {
                            if (internalState.registeredTypeProbes[typeName](targetValue)) {
                                return typeName; // Custom type found.
                            }
                        } catch (e) {
                            // Suppress errors from type probes, as they might be user-defined and fragile.
                            // console.warn(`Type probe for '${typeName}' failed:`, e.message);
                        }                    
                    }
                }
                
                // Fallback to standard JavaScript typeof, adjusted for arrays.
                const basicType = typeof targetValue;
                if (basicType === 'object') {
                    if (Array.isArray(targetValue)) return 'array';
                    // Could add more specific object types here (e.g., Date, RegExp).
                }
                return basicType.toLowerCase();
            },
            
            /**
             * Executes a specific action based on the determined type of a value.
             * @param {any} evaluatedTarget - The value to evaluate.
             * @param {Object.<string, Function>} typeHandlers - An object mapping type names to handler functions.
             * @returns {any} The result of the handler function, or false if no handler found.
             */
            executeBasedOnType: function(evaluatedTarget, typeHandlers) {
                const identifiedType = internalState.toolbelt.determineExtendedType(evaluatedTarget);
                
                // Prioritize specific type handlers.
                if (typeHandlers[identifiedType]) { 
                    try {
                        return typeHandlers[identifiedType](evaluatedTarget);                                
                    } catch (e) {
                        console.error(`Handler for type '${identifiedType}' failed:`, e.message);
                        return false;
                    }
                }
                
                // Fallback for null/undefined if an 'empty' handler exists.
                if ((evaluatedTarget === null || typeof evaluatedTarget === 'undefined') && typeHandlers.empty) { 
                    return typeHandlers.empty(evaluatedTarget); 
                }

                // Generic fallback if an 'other' handler exists.
                if (typeHandlers.other) { 
                    return typeHandlers.other(evaluatedTarget); 
                }
                
                return false; // Default return if no suitable handler found.
            },

            /**
             * Transforms a value based on its type using a map of handler functions, returning null if no handler.
             * Similar to `executeBasedOnType` but provides a `null` default.
             * @param {any} evaluatedTarget - The value to transform.
             * @param {Object.<string, Function>} typeHandlers - An object mapping type names to handler functions.
             * @returns {any} The result of the handler function, or null if no handler found.
             */
            transformBasedOnType: function(evaluatedTarget, typeHandlers) {
                const identifiedType = internalState.toolbelt.determineExtendedType(evaluatedTarget);

                if (typeHandlers[identifiedType]) { 
                    try {
                        return typeHandlers[identifiedType](evaluatedTarget);                                
                    } catch (e) {
                        console.error(`Transform handler for type '${identifiedType}' failed:`, e.message);
                        return null;
                    }
                }
                
                if ((evaluatedTarget === null || typeof evaluatedTarget === 'undefined') && typeHandlers.empty) { 
                    return typeHandlers.empty(evaluatedTarget); 
                }
                if (typeHandlers.other) { 
                    return typeHandlers.other(evaluatedTarget); 
                }
                return null; // Default return if no suitable handler found.
            },

            /**
             * Iterates over an array, applying a callback function to each element.
             * Collects and returns the results of each callback invocation.
             * @param {Array<any>} targetArray - The array to iterate.
             * @param {Function} callbackFn - The function to call for each element (element, index).
             * @returns {Array<any>} An array of results from the callbackFn, or errors if any occur.
             */
            processEachElement: function(targetArray, callbackFn) { 
                const operationResults = [];
                if (!Array.isArray(targetArray)) {
                    console.warn("processEachElement received non-array input:", targetArray);
                    return operationResults;
                }
                targetArray.forEach((element, index) => {
                    try {
                        operationResults.push(callbackFn(element, index)); 
                    } catch(e) {
                        console.error(`Error during element processing at index ${index}:`, e);
                        operationResults.push(e); // Store the error for review.
                    }
                });
                return operationResults;
            },

            /**
             * Creates a shallow copy of an object using prototypal inheritance.
             * @param {Object} sourceObject - The object to clone.
             * @returns {Object} A new object whose prototype is `sourceObject`.
             */
            createPrototypalClone: function(sourceObject) {    
                if (sourceObject === null || typeof sourceObject !== 'object') {
                    return sourceObject; // Primitives or null are returned as-is.
                }
                // Object.create is a direct way to achieve prototypal inheritance.
                return Object.create(sourceObject);
            },

            /**
             * Safely retrieves a nested property from an object.
             * @param {object} obj - The object to query.
             * @param {string} path - The dot-separated path to the property (e.g., "user.address.street").
             * @returns {any} The value of the property, or undefined if not found.
             */
            getNestedProperty: function(obj, path) {
                if (obj === null || typeof obj !== 'object' || !path) {
                    return undefined;
                }
                return path.split('.').reduce((current, key) => (current && typeof current === 'object') ? current[key] : undefined, obj);
            }
        };
        
        // Registers a custom type evaluation function with the engine.
        // This allows the engine to recognize and handle specific data structures.
        thisFlowInstance.registerTypeProbe = function(typeName, typeComparator) {        
            const cleanedName = internalState.toolbelt.cleanWhitespace(typeName).toLowerCase();
            if (!cleanedName || typeof typeComparator !== 'function') {
                throw new Error("Invalid type name or comparator provided for registration.");
            }
            internalState.registeredTypeProbes[cleanedName] = typeComparator;
            console.debug(`Registered new type probe: '${cleanedName}'`);
        };

        // Removes a previously registered custom type evaluation function.
        // It replaces the comparator with a no-op function that always returns false.
        thisFlowInstance.deregisterTypeProbe = function(typeName) {
            const cleanedName = internalState.toolbelt.cleanWhitespace(typeName).toLowerCase();
            if (!cleanedName || !Object.prototype.hasOwnProperty.call(internalState.registeredTypeProbes, cleanedName)) {
                console.warn(`Attempted to deregister a non-existent type probe: '${cleanedName}'.`);
                return;
            }
            // Instead of deleting, replace with a dummy function to avoid errors if referenced.
            internalState.registeredTypeProbes[cleanedName] = () => false;
            console.debug(`Deregistered type probe: '${cleanedName}'. It now always returns false.`);
        };        

        // Initializes the collection of custom type probes, potentially from initial settings.
        internalState.registeredTypeProbes = engineConfig.types || {};
        
        // Manages the integration of new functional modules into the DataFlowEngine.
        // These modules can extend the engine's capabilities with new methods.
        thisFlowInstance.integrateModule = function(moduleDefinition) {
            // Validate and clean module parameters.
            moduleDefinition.name = internalState.toolbelt.cleanWhitespace(moduleDefinition.name);
            moduleDefinition.namespace = internalState.toolbelt.cleanWhitespace(moduleDefinition.namespace || "");
            
            // Check for existing module and engine lock status.
            if (internalState.moduleRegistry.checkModuleExists(moduleDefinition)) { 
                if (internalState.status.isSealed) { 
                    throw new Error("EngineLockedException: Cannot integrate or update modules while the engine is sealed."); 
                }
                internalState.moduleRegistry.removeModule(moduleDefinition); // Remove old version before adding new.
                console.info(`Module '${moduleDefinition.name}' in namespace '${moduleDefinition.namespace}' is being updated.`);
            }
            
            // Add the new module definition to the registry.
            internalState.moduleRegistry.registerModule(moduleDefinition);
        
            // Source extensions generate new queryables.
            if (String(moduleDefinition.type).toLowerCase() === 'source') {
                // Determine the target object for attaching the new function.
                let targetScope = thisFlowInstance;
                if (moduleDefinition.namespace && !thisFlowInstance[moduleDefinition.namespace]) {
                    thisFlowInstance[moduleDefinition.namespace] = {}; // Create namespace if it doesn't exist.
                }
                if (moduleDefinition.namespace) {
                    targetScope = thisFlowInstance[moduleDefinition.namespace];
                }
                
                // Apply the command.
                // Using a rest parameter for arguments to avoid the v1-v25 list.
                targetScope[moduleDefinition.name] = function(...invocationArgs) {
                    // Prepare context for the module's method.
                    const methodContext = {
                        helper: internalState.toolbelt, // Provide access to core utilities.
                        // Add other useful context properties here, like current engine config.
                        engineConfiguration: internalState.configuration
                    };
                    
                    // Invoke the module's method.
                    const methodResults = moduleDefinition.method.apply(methodContext, invocationArgs);
                    
                    // Source extensions MUST return an array for query processing.
                    if (!Array.isArray(methodResults)) {
                        throw new TypeError(`Module '${moduleDefinition.name}' of type 'source' must return an array.`);
                    }
                    
                    // Return a new query processor instance with the generated data.
                    return new internalState.QueryProcessor(methodResults);
                };
            } else {
                // Other types of extensions (e.g., query operators) would be handled here.
                // For now, this clone only directly supports 'source' and implicitly query operators.
                console.debug(`Module '${moduleDefinition.name}' of type '${moduleDefinition.type}' registered but not directly exposed as a source method.`);
            }
        };        

        // Private registry for managing integrated modules.
        internalState.moduleRegistry = {
            registeredCommands: [], // Stores metadata for all registered modules.

            /**
             * Checks if a module with the given name and namespace already exists.
             * @param {Object} moduleData - Contains 'name' and 'namespace'.
             * @returns {boolean} True if the module exists, false otherwise.
             */
            checkModuleExists: function(moduleData) {            
                return (internalState.moduleRegistry.locateModuleIndex(moduleData) !== -1);
            },

            /**
             * Adds a new module definition to the registry.
             * @param {Object} moduleData - The module definition to add.
             */
            registerModule: function(moduleData) {        
                // Ensure no duplicates by removing first, though integrateModule handles this.
                internalState.moduleRegistry.removeModule(moduleData); 
                internalState.moduleRegistry.registeredCommands.push(moduleData);
            },

            /**
             * Removes a module definition from the registry.
             * @param {Object} moduleData - The module definition to remove.
             */
            removeModule: function(moduleData) {
                const foundIndex = internalState.moduleRegistry.locateModuleIndex(moduleData);
                if (foundIndex !== -1) { 
                    internalState.moduleRegistry.registeredCommands.splice(foundIndex, 1); 
                    console.debug(`Module '${moduleData.name}' removed from registry.`);
                }
            },

            /**
             * Finds the index of a module in the registry based on its name and namespace.
             * @param {Object} moduleData - Contains 'name' and 'namespace'.
             * @returns {number} The index of the module, or -1 if not found.
             */
            locateModuleIndex: function(moduleData) {
                return internalState.moduleRegistry.registeredCommands.findIndex(cmd => 
                    cmd.name === moduleData.name && cmd.namespace === moduleData.namespace
                );
            }            
        };
        
        // Provides a public method to inspect currently registered modules.
        thisFlowInstance.listModules = function() {
            // Return a deep copy to prevent external modification of internal registry.
            // Using JSON for deep clone is simple for serializable objects.
            return JSON.parse(JSON.stringify(internalState.moduleRegistry.registeredCommands));
        };

        // Initialize engine status.
        internalState.status = {
            isReady: false,
            isSealed: false
        };

        // Automatically integrate modules provided in the initial configuration.
        // This uses Object.values for a cleaner iteration over properties.
        if (engineConfig.extend) {
            Object.values(engineConfig.extend).forEach(moduleDef => {
                try {
                    thisFlowInstance.integrateModule(moduleDef);
                } catch (error) {
                    console.error(`Failed to integrate initial module '${moduleDef.name}':`, error.message);
                }
            });
        }
        
        // The core component responsible for processing queries on data collections.
        internalState.QueryProcessor = function(initialDataSource) {
            const currentQueryInstance = this; // Reference to the query object being built.
            
            // Create a shallow clone of the data to avoid modifying the original source.
            // Using structuredClone for deep copy if data is complex, otherwise shallow is fine.
            // For original behavior, a shallow prototype clone was used. Let's stick to that for Type III.
            const workingDataSource = Array.isArray(initialDataSource) ? [...initialDataSource] : initialDataSource;
            // Original `clone` was prototypal. Let's use spread for array, direct assign for others.
            // If `initialDataSource` is an object, a shallow copy or prototypal `Object.create` would be appropriate.
            // Assuming `initialDataSource` here is primarily an array or simple object for query.
            
            // 'queryContext' holds the internal state and logic for this specific query.
            const queryContext = {};

            // Defines the current state of the query operation.
            queryContext.executionState = {
                objectPropertyTraversal: true, // If true, allows dot notation for properties.
                lastOperationHandler: null,    // Reference to the last executed command's method.
                expectedParameterCount: 0,     // Number of parameters the last command expected.
                lastCommandIdentifier: null,   // Name of the last command executed.
                caseInsensitiveMatching: true, // Flag for string comparisons.
                isLogicalOR: false,            // Flag to indicate an 'OR' condition.
                isNegatedCondition: false,     // Flag to negate the next condition.
                currentDataSet: workingDataSource, // The data collection being queried.
                useObjectProperties: false,    // Determines if data elements are objects with properties.
                currentLogicalOperator: "",    // Current operator (AND/OR) in the predicate string.
                debug: {
                    onDebugMessage: function(message) { /* Placeholder for external debug logging */ },
                    emitDebugLog: function(messageTemplate, replacements) {
                        queryContext.executionState.debug.onDebugMessage(
                            internalState.toolbelt.formatTemplate(messageTemplate, replacements)
                        );
                    }
                }
            };
            
            // Determine if the data set contains objects (for property-based queries).
            // This check is performed only if the data is an array and not empty.
            if (Array.isArray(workingDataSource) && workingDataSource.length > 0) {
                queryContext.executionState.useObjectProperties = (
                    internalState.toolbelt.determineExtendedType(workingDataSource[0]) === "object"
                );
            }
            
            // Contains the core logic for building and executing the query.
            queryContext.processingLogic = {
                operationCache: [],      // Stores executable functions for each query step.
                predicateFragments: [],  // Stores string fragments that form the dynamic predicate function.

                /**
                 * Appends a new predicate function to the query chain.
                 * @param {Function} predicateAction - A function that evaluates a single record.
                 */
                appendPredicate: function(predicateAction) {
                    queryContext.processingLogic.operationCache.push(predicateAction);
                    
                    const negationPrefix = queryContext.executionState.isNegatedCondition ? "!" : "";
                    
                    // If this is the first predicate, ensure no leading logical operator.
                    if (queryContext.processingLogic.operationCache.length === 1) {
                        queryContext.executionState.currentLogicalOperator = "";
                    } else if (queryContext.executionState.isLogicalOR) {
                        queryContext.executionState.currentLogicalOperator = "||";
                    } else {
                        queryContext.executionState.currentLogicalOperator = "&&";
                    }
                    
                    // Reset conditional flags for the next predicate.
                    queryContext.executionState.isLogicalOR = false;
                    queryContext.executionState.isNegatedCondition = false;
                    
                    // Construct a fragment of the dynamic predicate string.
                    const cacheIndex = queryContext.processingLogic.operationCache.length - 1;
                    queryContext.processingLogic.predicateFragments.push(
                        `${queryContext.executionState.currentLogicalOperator} (${negationPrefix}(queryContext.processingLogic.operationCache[${cacheIndex}](record)))`
                    );
                },

                /**
                 * Executes the accumulated query predicates against the data set.
                 * @returns {{matchedElements: Array<any>, unmatchedElements: Array<any>}} An object containing matching and non-matching records.
                 */
                executeSelection: function() {
                    // If no predicates, return all data as selected.
                    if (queryContext.processingLogic.predicateFragments.length === 0) { 
                        return {
                            matchedElements: queryContext.executionState.currentDataSet,
                            unmatchedElements: []
                        };
                    }
                
                    // Construct the full dynamic predicate function string.
                    // Use 'new Function' for safer dynamic code execution than 'eval'.
                    const dynamicPredicateFnString = `
                        return function(record) {
                            return (${queryContext.processingLogic.predicateFragments.join(" ")});
                        };
                    `;
                    
                    // Create the predicate function using the current scope (for operationCache access).
                    let predicateEvaluator;
                    try {
                        // Pass queryContext explicitly to the new Function scope.
                        predicateEvaluator = new Function('queryContext', dynamicPredicateFnString)(queryContext);
                    } catch (e) {
                        queryContext.executionState.debug.emitDebugLog(
                            "Failed to compile dynamic predicate: %0%. Predicate string: %1%", 
                            [e.message, dynamicPredicateFnString]
                        );
                        throw new Error("QueryCompilationError: " + e.message);
                    }
                
                    const matchedElements = []; 
                    const unmatchedElements = [];

                    // Iterate and evaluate each record against the compiled predicate.
                    queryContext.executionState.currentDataSet.forEach(item => {
                        try {                        
                            if (predicateEvaluator(item)) {
                                matchedElements.push(item);
                            } else {
                                unmatchedElements.push(item);
                            }
                        } catch (e) {
                            // Log and categorize records that cause predicate evaluation errors.
                            queryContext.executionState.debug.emitDebugLog(
                                "Exception during predicate evaluation for record: %0%. Error: %1%", 
                                [JSON.stringify(item), e.message]
                            );
                            unmatchedElements.push(item);    
                        }
                    });
                    
                    return {
                        matchedElements: matchedElements,
                        unmatchedElements: unmatchedElements
                    };                    
                },

                /**
                 * Extracts actual arguments from a variadic function call, skipping trailing nulls.
                 * @param {IArguments} invocationArguments - The arguments object from the calling function.
                 * @returns {Array<any>} An array of cleaned arguments.
                 */
                extractActualArguments: function(invocationArguments) {
                    const extractedValues = [];
                    let firstNonNullFound = false;
                    // Iterate backwards to efficiently remove trailing nulls.
                    for (let i = invocationArguments.length - 1; i >= 0; i--) {
                        if (invocationArguments[i] === null && !firstNonNullFound) { 
                            continue; 
                        }
                        firstNonNullFound = true;
                        extractedValues.unshift(invocationArguments[i]); // Add to the front to maintain order.
                    }
                    return extractedValues;
                },

                /**
                 * Prepares a command for execution by setting state and processing arguments.
                 * @param {Object} commandMetadata - Metadata about the command (e.g., method, expected param count, name).
                 * @param {IArguments} invocationArguments - The arguments passed to the command.
                 * @returns {{processedArgs: Array<any>, targetField: string|null}} Object with processed arguments and identified field.
                 */
                prepareOperation: function(commandMetadata, invocationArguments) {
                    queryContext.executionState.lastOperationHandler = commandMetadata.command;
                    queryContext.executionState.expectedParameterCount = commandMetadata.count;
                    queryContext.executionState.lastCommandIdentifier = commandMetadata.name;
        
                    const processedArgs = queryContext.processingLogic.extractActualArguments(invocationArguments);
                    let targetField = null;
        
                    // If the data uses properties and an extra argument is present, assume it's the field name.
                    if (queryContext.executionState.useObjectProperties && processedArgs.length === commandMetadata.count + 1) {
                        targetField = processedArgs.shift(); // Extract the field name from the front.
                    }
                    
                    return {
                        processedArgs: processedArgs,
                        targetField: targetField
                    };
                },

                /**
                 * Re-invokes the last executed command with new arguments.
                 * This is useful for chaining multiple conditions of the same type.
                 * @param {...any} newArguments - Arguments to pass to the last command.
                 * @returns {QueryProcessor} The current query instance for chaining.
                 */
                reinvokeLastOperation: function(...newArguments) {
                    // Check if any significant arguments are provided.
                    if (internalState.toolbelt.isCollectionEmptyOrFalsy(newArguments)) { 
                        return currentQueryInstance; // If no arguments, do nothing and return.
                    }                
                    if (typeof queryContext.executionState.lastOperationHandler === 'function') {
                        return queryContext.executionState.lastOperationHandler.apply(currentQueryInstance, newArguments);
                    }
                    console.warn("Attempted to reinvoke an operation, but no last operation handler was set.");
                    return currentQueryInstance;
                },

                /**
                 * Sorts a collection of records based on a single field.
                 * @param {Array<object>} recordsToSort - The array of objects to sort.
                 * @param {string} fieldName - The name of the field to sort by.
                 * @param {boolean} isDescending - True for descending order, false for ascending.
                 */
                applySingleFieldSort: function(recordsToSort, fieldName, isDescending) {
                    // Defensive check: ensure recordsToSort is an array of objects.
                    if (!Array.isArray(recordsToSort) || recordsToSort.some(r => typeof r !== 'object' || r === null)) {
                        console.error("Invalid input for applySingleFieldSort: expected array of objects.");
                        return; // Or throw an error.
                    }

                    recordsToSort.sort((itemA, itemB) => {
                        // Access properties safely using getNestedProperty.
                        const valueA = internalState.toolbelt.getNestedProperty(itemA, fieldName);
                        const valueB = internalState.toolbelt.getNestedProperty(itemB, fieldName);

                        // Handle undefined/null values gracefully in comparison.
                        if (valueA === undefined && valueB === undefined) return 0;
                        if (valueA === undefined) return isDescending ? 1 : -1;
                        if (valueB === undefined) return isDescending ? -1 : 1;
                        
                        if (valueA < valueB) return isDescending ? 1 : -1;
                        if (valueA > valueB) return isDescending ? -1 : 1;
                        return 0;
                    });
                }
            };
            
            // Query-specific helper methods, often wrapping general toolbelt functions.
            queryContext.queryHelpers = {
                /**
                 * Escapes special characters in a string to be safely used in a regular expression.
                 * @param {string} inputString - The string to escape.
                 * @returns {string} The escaped string.
                 */
                escapeRegexCharacters: function(inputString) {
                    if (inputString === null || typeof inputString === 'undefined') { return ""; }
                    return String(inputString).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes all special regex characters.
                },
                
                /**
                 * Returns the numeric value of an object, preferring 'length' property if available.
                 * @param {any} targetEntity - The object to evaluate.
                 * @returns {number|any} The length or the original object if no length.
                 */
                extractNumericValue: function(targetEntity) {
                    if (typeof targetEntity === 'string' || Array.isArray(targetEntity)) {
                        return targetEntity.length;
                    }
                    if (typeof targetEntity === 'number') {
                        return targetEntity;
                    }
                    // For other types, return 0 or the value itself based on desired behavior.
                    return 0; // Or targetEntity; depending on exact original behavior.
                },
                
                // Re-exposes the global trim function for query-specific contexts.
                trimString: internalState.toolbelt.cleanWhitespace,

                /**
                 * Performs a regular expression match.
                 * @param {string} sourceValue - The string to test.
                 * @param {string|RegExp} pattern - The regex pattern or string to convert to regex.
                 * @returns {boolean} True if a match is found, false otherwise.
                 */
                performRegexMatch: function(sourceValue, pattern) {
                    if (!(sourceValue && pattern)) { return false; }
                    let effectivePattern = pattern;
                    if (internalState.toolbelt.determineExtendedType(pattern) !== "regexp") { 
                        effectivePattern = new RegExp(String(pattern), "g" + (queryContext.executionState.caseInsensitiveMatching ? "i" : ""));
                    }                    
                    return effectivePattern.test(String(sourceValue)); // Use test for boolean result.
                },

                /**
                 * Compares two objects for equality of their properties.
                 * @param {object} objA - First object.
                 * @param {object} objB - Second object.
                 * @returns {boolean} True if all properties match, false otherwise.
                 */
                compareObjectProperties: function(objA, objB) {
                    if (objA === null && objB === null) { return true; }
                    if (objA === null || objB === null || typeof objA !== 'object' || typeof objB !== 'object') { return false; }

                    const keysA = Object.keys(objA);
                    const keysB = Object.keys(objB);

                    // Must have same number of properties.
                    if (keysA.length !== keysB.length) { return false; }

                    // Check if all properties in objA exist in objB and have equal values.
                    return keysA.every(key => 
                        Object.prototype.hasOwnProperty.call(objB, key) && queryContext.queryHelpers.areValuesEquivalent(objA[key], objB[key])
                    );
                },

                /**
                 * Performs a deep equality check between two values, handling various types.
                 * @param {any} compareA - First value.
                 * @param {any} compareB - Second value.
                 * @returns {boolean} True if values are equivalent, false otherwise.
                 */
                areValuesEquivalent: function(compareA, compareB) {
                    try {
                        // Handle null/undefined first.
                        if (compareA === null && compareB === null) { return true; }
                        if ((compareA === null && compareB !== null) || (compareA !== null && compareB === null)) { return false; }
                        
                        const typeA = internalState.toolbelt.determineExtendedType(compareA);
                        const typeB = internalState.toolbelt.determineExtendedType(compareB);

                        // If types differ, they are not equivalent.
                        if (typeA !== typeB) { return false; }

                        // Special handling for different types.
                        if (typeA === "string") {
                            // String comparison uses regex for case sensitivity control.
                            return queryContext.queryHelpers.performRegexMatch(compareA, `^${queryContext.queryHelpers.escapeRegexCharacters(compareB)}$`);
                        }
                        if (typeA === "number" || typeA === "boolean") {
                            return (compareA === compareB); // Strict equality for primitives.
                        }
                        if (typeA === "array") {
                            if (compareA.length !== compareB.length) { return false; }
                            return compareA.every((item, index) => queryContext.queryHelpers.areValuesEquivalent(item, compareB[index]));
                        }
                        if (typeA === "object") {
                            return queryContext.queryHelpers.compareObjectProperties(compareA, compareB);
                        }
                        // Default to strict equality for other types (functions, symbols, etc.).
                        return (compareA === compareB);                        
                    } catch (e) {
                        queryContext.executionState.debug.emitDebugLog(
                            "Error during value equivalence check: %0%", [e.message]
                        );
                        return false;
                    }
                },

                /**
                 * Checks if all elements in a collection are equivalent to a comparison value.
                 * @param {Array<any>} collection - The collection of values.
                 * @param {any} comparisonValue - The value to compare against.
                 * @returns {boolean} True if all elements are equivalent, false otherwise.
                 */
                areAllElementsEquivalent: function(collection, comparisonValue) {
                    const actualCollection = Array.isArray(collection) ? collection : [collection]; // Normalize to array.
                    return actualCollection.every(item => queryContext.queryHelpers.areValuesEquivalent(item, comparisonValue));
                },

                /**
                 * Checks if any element in a collection is equivalent to a comparison value.
                 * @param {Array<any>} collection - The collection of values.
                 * @param {any} comparisonValue - The value to compare against.
                 * @returns {boolean} True if at least one element is equivalent, false otherwise.
                 */
                isAnyElementEquivalent: function(collection, comparisonValue) {
                    const actualCollection = Array.isArray(collection) ? collection : [collection]; // Normalize to array.
                    return actualCollection.some(item => queryContext.queryHelpers.areValuesEquivalent(item, comparisonValue));
                },

                /**
                 * Sorts a collection of records based on a series of sorting instructions.
                 * Supports multi-level sorting.
                 * @param {Array<object>} dataRecords - The array of records to sort.
                 * @param {Array<Object>} sortInstructions - An array of {field: string, desc: boolean} objects.
                 * @returns {Array<object>} The sorted array of records.
                 */
                applyMultiLevelSort: function(dataRecords, sortInstructions) {
                
                    // If no sorting instructions are provided, return a default sorted array.
                    if (!sortInstructions || sortInstructions.length === 0) {                    
                        // Default sort: shallow copy then sort.
                        const simpleSorted = [...dataRecords].sort();
                        // if (isDescending) { simpleSorted.reverse(); } // Original had a `desc` param here, but it's now in sortInstructions.
                        return simpleSorted;
                    }                
                
                    // Recursive function to handle multi-level sorting.
                    let currentSortLevel = 0;
                    const recursiveSort = function(recordsSubset) {  
                    
                        // Create a shallow copy to prevent modifying the array in place during recursive grouping.
                        let mutableRecords = [...recordsSubset];
                        
                        const instruction = sortInstructions[currentSortLevel];
                        const fieldToSort = instruction.field;
                        const isDescending = instruction.desc;
                        
                        // If this is the last sorting level, just apply the sort and return.
                        if (currentSortLevel === sortInstructions.length - 1) {
                            queryContext.processingLogic.applySingleFieldSort(mutableRecords, fieldToSort, isDescending);
                            return mutableRecords;
                        }                        
            
                        // Perform the current level's sort.
                        queryContext.processingLogic.applySingleFieldSort(mutableRecords, fieldToSort, isDescending);

                        // Group records by the current field's value to prepare for the next level of sorting.
                        const groupedRecords = new Map();
                        mutableRecords.forEach(record => {
                            const keyValue = internalState.toolbelt.getNestedProperty(record, fieldToSort);
                            if (!groupedRecords.has(keyValue)) {
                                groupedRecords.set(keyValue, []);
                            }
                            groupedRecords.get(keyValue).push(record);
                        });

                        currentSortLevel++; // Advance to the next sorting instruction.
                        
                        // Recursively sort each group and then flatten the results.
                        const finalSortedResults = [];
                        for (const [key, group] of groupedRecords.entries()) {
                            const sortedGroup = recursiveSort(group);
                            finalSortedResults.push(...sortedGroup);
                        }
                        currentSortLevel--; // Backtrack for the next recursive call.

                        return finalSortedResults;
                    };
                    return recursiveSort(dataRecords);
                },

                /**
                 * Extracts distinct records from a collection based on a specified key field.
                 * @param {Array<object>} inputRecords - The array of records.
                 * @param {string|null} keyField - The field to determine distinctness. If null, uses the record itself.
                 * @returns {Array<{key: any, items: Array<object>}>} An array of objects, each containing a distinct key and its associated records.
                 */
                extractDistinctRecords: function(inputRecords, keyField) {
                    const distinctGroups = new Map();

                    inputRecords.forEach(record => {
                        const distinctKey = keyField ? internalState.toolbelt.getNestedProperty(record, keyField) : record;
                        
                        // Use a stringified version of objects/arrays for map keys if the keyField value is complex.
                        const mapKey = (typeof distinctKey === 'object' && distinctKey !== null) 
                                        ? JSON.stringify(distinctKey) 
                                        : distinctKey;

                        if (!distinctGroups.has(mapKey)) {
                            distinctGroups.set(mapKey, { key: distinctKey, items: [] });
                        }
                        distinctGroups.get(mapKey).items.push(record);
                    });
                    
                    return Array.from(distinctGroups.values());
                },
                // End of distinct method. Original code was cut off here.
                // Assuming it was meant to return an array of unique items or groups.
            };
        }; // End of QueryProcessor.
    }; // End of FlowInitializer.

    // Expose the FlowInitializer as DataFlowEngine globally.
    DataFlowEngine = FlowInitializer;

    // A small public configuration entry point.
    DataFlowEngine.configure = function(options) {
        // This could be used for global settings, e.g., default debug level.
        console.log("Global DataFlowEngine configuration applied:", options);
    };

    // Add a version property for external inspection.
    DataFlowEngine.version = "3.0.0-alpha";

})(); // End of IIFE.