var DataPipe;
(function() {

    // Helper for safely accessing nested object properties
    const getNestedProperty = (obj, path) => {
        if (obj === null || typeof obj !== 'object' || !path) return undefined;
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
            if (current === null || typeof current !== 'object' || !current.hasOwnProperty(part)) {
                return undefined; // Property not found or path broken
            }
            current = current[part];
        }
        return current;
    };

    // Internal collection of general utilities
    const utilityKit = {
        // Formats a string with indexed arguments (e.g., "Hello %0%, %1%")
        renderText: (textFragment, inputArgs) => {
            return String(textFragment).replace(/%[0-9]+%/gi, (match) => {
                const index = parseInt(match.replace(/%/gi, ""), 10);
                return inputArgs[index];
            });
        },
        // Extracts non-null/undefined values from the start of an array
        extractNonNullValues: (sourceList) => {
            const collected = [];
            for (let k = 0; k < sourceList.length; k++) {
                if (sourceList[k] === null || sourceList[k] === undefined) {
                    return collected;
                }
                collected.push(sourceList[k]);
            }
            return collected;
        },
        // Removes leading/trailing whitespace from a string
        stripWhitespace: (val) => {
            if (val === null || val === undefined) { return ""; }
            return String(val).replace(/^\s+|\s+$/g, "");
        },
        // Checks if all elements in a list are falsy (null, undefined, 0, "", false)
        areAllFalsy: (checkList) => {
            return checkList.every(item => !item);
        },
        // Determines the type of a value, considering custom evaluators
        resolveValueType: (val, customTypeEvaluators) => {
            if (val === null || val === undefined) { return "null"; } // Original returns "null" for undefined
            
            for (const typeName in customTypeEvaluators) {
                try {
                    if (customTypeEvaluators[typeName](val)) {
                        return typeName;
                    }
                } catch (e) { /* Ignore errors in type evaluators */ }
            }
            if (Array.isArray(val)) { return "array"; }
            return (typeof val).toLowerCase();
        },
        // Dispatches to a function based on value type, similar to switch-case
        dispatchByType: (val, actionMap, customTypeEvaluators, defaultReturn = false) => {
            const typeKey = utilityKit.resolveValueType(val, customTypeEvaluators);
            if (actionMap[typeKey]) {
                try { return actionMap[typeKey](val); } catch (e) { return defaultReturn; }
            }
            if ((val === null || val === undefined) && actionMap.empty) {
                return actionMap.empty(val);
            }
            if (actionMap.other) { return actionMap.other(val); }
            return defaultReturn;
        },
        // Iterates over an array, applies a function, and collects results
        processEach: (targetArray, processingAction) => {
            const outcomes = [];
            for (let i = 0; i < targetArray.length; i++) {
                try { outcomes.push(processingAction(targetArray[i], i)); } catch (e) { outcomes.push(e); }
            }
            return outcomes;
        },
        // Creates a shallow copy of an object or array
        duplicateObject: (sourceObj) => {
            if (sourceObj === null || typeof sourceObj !== 'object') { return sourceObj; }
            if (Array.isArray(sourceObj)) { return [...sourceObj]; }
            return Object.assign({}, sourceObj);
        },
        // Escapes characters in a string to be safe for use in a RegExp constructor
        prepareForPattern: (inputStr) => {
            if (inputStr === null || inputStr === undefined) { return ""; }
            return String(inputStr).replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|\=\!\<\>\&\%\#\@\~]/g, "\\$&");
        },
        // Performs regular expression matching
        performPatternMatch: (value, pattern, caseInsensitive) => {
            if (!value || !pattern) { return false; }
            let regexPattern = pattern;
            if (utilityKit.resolveValueType(pattern, {}) === "regexp") {
                regexPattern = pattern.source;
            }
            const flags = "g" + (caseInsensitive ? "i" : "");
            const regex = new RegExp(regexPattern, flags);
            return String(value).match(regex);
        },
        // Compares properties of two objects for equality
        compareObjectProperties: (obj1, obj2, equalityChecker) => {
            if (obj1 === null && obj2 === null) { return true; }
            if (obj1 === null || obj2 === null) { return false; }
            const keys1 = Object.keys(obj1);
            for (const propName of keys1) {
                if (obj2[propName] === undefined) { return false; }
                if (!equalityChecker(obj1[propName], obj2[propName])) { return false; }
            }
            return true;
        },
        // Checks if all values in an array are equal to a target value
        checkAllEqual: (sourceVals, targetVal, equalityChecker) => {
            const valsArray = Array.isArray(sourceVals) ? sourceVals : [sourceVals];
            return valsArray.every(item => equalityChecker(item, targetVal));
        },
        // Checks if any value in an array is equal to a target value
        checkAnyEqual: (sourceVals, targetVal, equalityChecker) => {
            const valsArray = Array.isArray(sourceVals) ? sourceVals : [sourceVals];
            return valsArray.some(item => equalityChecker(item, targetVal));
        },
        // Groups records by a specified field, returning unique keys and their associated items
        groupRecordsByField: (records, fieldName, typeResolver) => {
            const groups = new Map();
            for (const record of records) {
                // Key extraction handles nested properties
                const key = fieldName ? (getNestedProperty(record, fieldName) !== undefined ? getNestedProperty(record, fieldName) : record) : record;
                // Handle complex types for map keys by stringifying objects/arrays
                const mapKey = (typeResolver(key, {}) === 'object' || typeResolver(key, {}) === 'array') ? JSON.stringify(key) : key;
                if (!groups.has(mapKey)) {
                    groups.set(mapKey, { key: key, items: [] });
                }
                groups.get(mapKey).items.push(record);
            }
            return Array.from(groups.values());
        }
    };

    // Main library initialization function
    const establish = function(initialConfig) {
        const flowEngine = this; // The DataPipe instance
        const engineInternals = {};
        engineInternals.initialConfig = initialConfig;
        
        // Locks the engine from further modifications
        flowEngine.seal = (isLocked) => {
            flowEngine.seal = null; // Remove method after first call as per original
            engineInternals.isLoaded = true;
            engineInternals.isLocked = isLocked;
        };

        // Manages custom type evaluators
        engineInternals.typeResolution = initialConfig.types || {};
        flowEngine.registerType = (typeName, comparatorFunc) => {
            const nameKey = utilityKit.stripWhitespace(typeName).toLowerCase();
            engineInternals.typeResolution[nameKey] = comparatorFunc;
        };
        flowEngine.deregisterType = (typeName) => {
            const nameKey = utilityKit.stripWhitespace(typeName).toLowerCase();
            engineInternals.typeResolution[nameKey] = () => false; // Effectively removes by making it always return false
        };

        // Manages custom extensions (commands)
        engineInternals.extensionManager = {
            operationDefinitions: [],
            checkExists: (opParams) => {
                return engineInternals.extensionManager.findOperation(opParams) !== null;
            },
            addOperation: (opParams) => {
                engineInternals.extensionManager.removeOperation(opParams); // Remove existing if found
                engineInternals.extensionManager.operationDefinitions.push(opParams);
            },
            removeOperation: (opParams) => {
                const idx = engineInternals.extensionManager.findOperation(opParams);
                if (idx !== null) {
                    engineInternals.extensionManager.operationDefinitions.splice(idx, 1);
                }
            },
            findOperation: (opParams) => {
                for (let i = 0; i < engineInternals.extensionManager.operationDefinitions.length; i++) {
                    const method = engineInternals.extensionManager.operationDefinitions[i];
                    if (method.name === opParams.name && method.namespace === opParams.namespace) {
                        return i;
                    }
                }
                return null;
            }
        };

        // Integrates new functionality into the DataPipe engine
        flowEngine.integrate = (params) => {
            params.name = utilityKit.stripWhitespace(params.name);
            params.namespace = utilityKit.stripWhitespace(params.namespace);

            if (engineInternals.extensionManager.checkExists(params)) {
                if (engineInternals.isLocked) {
                    throw new Error("Exception: Library is locked.");
                }
                engineInternals.extensionManager.removeOperation(params);
            }
            engineInternals.extensionManager.addOperation(params);

            // "Source" extensions are immediately added as methods to the DataPipe instance or its namespace
            if (params.type && params.type.match(/source/i)) {
                let targetObject = params.namespace === "" ? flowEngine : (flowEngine[params.namespace] = flowEngine[params.namespace] || {});
                
                targetObject[params.name] = (...funcArgs) => {
                    const helperContext = {
                        helper: { // Provide a subset of utilities for source methods
                            renderText: utilityKit.renderText,
                            stripWhitespace: utilityKit.stripWhitespace,
                            resolveValueType: (val) => utilityKit.resolveValueType(val, engineInternals.typeResolution),
                            areAllFalsy: utilityKit.areAllFalsy,
                            dispatchByType: (val, actionMap, defaultReturn = false) => utilityKit.dispatchByType(val, actionMap, engineInternals.typeResolution, defaultReturn),
                            processEach: utilityKit.processEach,
                            duplicateObject: utilityKit.duplicateObject,
                            prepareForPattern: utilityKit.prepareForPattern,
                            getNestedProperty: getNestedProperty
                        }
                    };
                    const resultData = params.method(helperContext, ...funcArgs);

                    if (utilityKit.resolveValueType(resultData, engineInternals.typeResolution) !== "array") {
                        throw new Error("Exception: A 'Source' extension must return an array for a data pipe query.");
                    }
                    return new QueryFlow(resultData, flowEngine, initialConfig);
                };
            }
        };

        // Returns a copy of the registered operations
        flowEngine.listOperations = () => {
            return utilityKit.duplicateObject(engineInternals.extensionManager.operationDefinitions);
        };

        // Initialize extensions from the initial configuration
        for (const opKey in initialConfig.extend) {
            flowEngine.integrate(initialConfig.extend[opKey]);
        }

        // QueryFlow Class: Manages the state and execution of a query pipeline
        function QueryFlow(sourceData, parentEngine, parentConfig) {
            const currentFlow = this;
            const flowState = {};

            // Internal configuration for this query chain instance
            flowState.config = {
                propertiesEnabled: true,
                lastCommandFn: null,
                lastFieldName: null,
                lastCommandIdentifier: null,
                argumentCount: 0,
                ignoreCase: true, // Default case-insensitive
                orLogic: false,
                notLogic: false,
                currentData: utilityKit.duplicateObject(sourceData), // Start with a duplicated copy of the source data
                useObjectProperties: false,
                logicalOperator: "", // Stores "&&" or "||" for predicate combining
                debug: {
                    eventEmitter: (message) => { /* Default silent, can be overridden */ },
                    logMessage: (msg, args) => {
                        flowState.config.debug.eventEmitter(utilityKit.renderText(msg, args));
                    }
                }
            };
            flowState.engine = parentEngine; // Reference to the parent DataPipe instance

            // Determine if data elements are objects for property access
            if (flowState.config.currentData && flowState.config.currentData.length > 0) {
                flowState.config.useObjectProperties = (utilityKit.resolveValueType(flowState.config.currentData[0], engineInternals.typeResolution) === "object");
            }

            // Stores predicate functions and their string representations for dynamic function generation
            flowState.predicateFunctions = []; // Actual predicate functions
            flowState.predicateSourceStrings = []; // String fragments like "&& !(P[0](item))"

            // Core query processing logic
            flowState.processor = {
                // Appends a new predicate function to the evaluation sequence
                addPredicate: (predicateFunc) => {
                    flowState.predicateFunctions.push(predicateFunc);
                    const notPrefix = flowState.config.notLogic ? "!" : "";
                    
                    let currentOperator = flowState.config.logicalOperator;
                    if (flowState.predicateFunctions.length === 1) {
                         currentOperator = ""; // First predicate has no preceding operator
                    } else if (currentOperator === "") {
                        currentOperator = "&&"; // Default to AND if not explicitly set
                    }
                    
                    flowState.predicateSourceStrings.push(`${currentOperator} ${notPrefix}(P[${flowState.predicateFunctions.length - 1}](item))`);

                    // Reset OR/NOT state for the next command
                    flowState.config.orLogic = false;
                    flowState.config.notLogic = false;
                    flowState.config.logicalOperator = "&&"; // Default for subsequent predicates
                },

                // Executes the constructed query pipeline (filters data)
                executePipeline: () => {
                    if (flowState.predicateSourceStrings.length === 0) {
                        return {
                            selectedRecords: flowState.config.currentData,
                            remainingRecords: []
                        };
                    }
                    
                    const combinedPredicateString = flowState.predicateSourceStrings.join(" ");
                    let evaluationFunction;
                    try {
                        // Dynamically create a function to evaluate the combined predicate string.
                        // This allows for complex logical combinations (AND/OR/NOT) defined by the query chain,
                        // similar to the original's `eval` approach.
                        evaluationFunction = new Function('item', 'P', `try { return (${combinedPredicateString}); } catch(e) { return false; }`);
                    } catch (e) {
                        flowState.config.debug.logMessage("Error creating evaluation function: %0%. Predicate string: %1%", [e.message, combinedPredicateString]);
                        throw new Error("Failed to compile query predicate: " + e.message);
                    }

                    const selected = [];
                    const remaining = [];
                    for (const item of flowState.config.currentData) {
                        try {
                            if (evaluationFunction(item, flowState.predicateFunctions)) {
                                selected.push(item);
                            } else {
                                remaining.push(item);
                            }
                        } catch (e) {
                            flowState.config.debug.logMessage("Exception when evaluating query for selection: %0%. Item: %1%", [e, item]);
                            remaining.push(item);
                        }
                    }

                    return {
                        selectedRecords: selected,
                        remainingRecords: remaining
                    };
                },

                // Cleans up arguments by removing trailing null/undefined values
                normalizeArguments: (rawArgs) => {
                    const cleanArgs = [];
                    let foundRealArg = false;
                    for (let i = rawArgs.length - 1; i >= 0; i--) {
                        if ((rawArgs[i] === null || rawArgs[i] === undefined) && !foundRealArg) {
                            continue;
                        }
                        foundRealArg = true;
                        cleanArgs.unshift(rawArgs[i]);
                    }
                    return cleanArgs;
                },

                // Prepares context for a command execution
                prepareOperationContext: (opDetails, inputArgs) => {
                    flowState.config.lastCommandFn = opDetails.command; // Store for repeat functionality
                    flowState.config.argumentCount = opDetails.count;
                    flowState.config.lastCommandIdentifier = opDetails.name;

                    const processedArgs = flowState.processor.normalizeArguments(inputArgs);

                    let fieldForOperation = null;
                    // If object properties are used and one extra argument is present, it's the field name
                    if (flowState.config.useObjectProperties && processedArgs.length === opDetails.count + 1) {
                        fieldForOperation = processedArgs.shift(); // Remove and return the first argument as the field
                    }

                    return {
                        operationArgs: processedArgs,
                        targetField: fieldForOperation
                    };
                },

                // Re-executes the last command with new arguments
                replicateLastOperation: (...newArgs) => {
                    if (utilityKit.areAllFalsy(newArgs)) { return currentFlow; }
                    return flowState.config.lastCommandFn(...newArgs);
                },

                // Sorts a list of records by a given field (supports nested properties)
                arrangeRecordsByField: (records, field, descending) => {
                    records.sort((recA, recB) => {
                        let valA = field ? getNestedProperty(recA, field) : recA;
                        let valB = field ? getNestedProperty(recB, field) : recB;
                        // Handle undefined/null for consistent sorting behavior
                        if (valA === undefined || valA === null) valA = "";
                        if (valB === undefined || valB === null) valB = "";
                        
                        return (valA < valB) ? -1 : (valA > valB) ? 1 : 0;
                    });
                    if (descending) { records.reverse(); }
                }
            };

            // Helper functions available to query commands within QueryFlow context
            flowState.assistant = {
                stripWhitespace: utilityKit.stripWhitespace,
                prepareForPattern: utilityKit.prepareForPattern,
                // `performPatternMatch` uses the QueryFlow instance's `ignoreCase` setting
                performPatternMatch: (value, pattern) => utilityKit.performPatternMatch(value, pattern, flowState.config.ignoreCase),
                // `compareObjectProperties` uses QueryFlow's `checkValueEquality`
                compareObjectProperties: (obj1, obj2) => utilityKit.compareObjectProperties(obj1, obj2, flowState.assistant.checkValueEquality),
                // `resolveValueType` uses the engine's custom type evaluators
                resolveValueType: (val) => utilityKit.resolveValueType(val, engineInternals.typeResolution),
                // `checkValueEquality` is a recursive value comparison, considering `ignoreCase`
                checkValueEquality: (valA, valB) => utilityKit.checkValueEquality(valA, valB, (v, t) => utilityKit.resolveValueType(v, t), flowState.config.ignoreCase, engineInternals.typeResolution),
                checkAllEqual: (sourceVals, targetVal) => utilityKit.checkAllEqual(sourceVals, targetVal, flowState.assistant.checkValueEquality),
                checkAnyEqual: (sourceVals, targetVal) => utilityKit.checkAnyEqual(sourceVals, targetVal, flowState.assistant.checkValueEquality),
                groupUnique: (records, fieldName) => utilityKit.groupRecordsByField(records, fieldName, (v,t) => utilityKit.resolveValueType(v,t)),
                extractSizeValue: (obj) => { // Returns length for array/string, otherwise the object itself
                    if (obj && typeof obj.length === 'number') { return obj.length; }
                    return obj;
                },
                getNestedProperty: getNestedProperty,
                // Handles multi-level sorting based on an array of criteria
                orchestrateSorting: (records, sortCriteria, descending) => {
                    if (!sortCriteria) { // If no specific sorting criteria provided
                        records.sort();
                        if (descending) { records.reverse(); }
                        return records;
                    }

                    let sortIndex = 0;
                    const recursiveSort = (currentRecords) => {
                        // Clone to prevent issues with in-place sort and grouping (e.g., IE7 bug mentioned in original)
                        let clonedRecords = utilityKit.duplicateObject(currentRecords);

                        const criterion = sortCriteria[sortIndex];
                        const fieldName = criterion.field;
                        const isDescending = criterion.desc;

                        // If this is the last sorting criterion, perform final sort and return
                        if (sortIndex === sortCriteria.length - 1) {
                            flowState.processor.arrangeRecordsByField(clonedRecords, fieldName, isDescending);
                            return clonedRecords;
                        }

                        // Perform sort for the current criterion
                        flowState.processor.arrangeRecordsByField(clonedRecords, fieldName, isDescending);
                        
                        // Group by the current field's value to process sub-groups independently
                        const distinctGroups = flowState.assistant.groupUnique(clonedRecords, fieldName);
                        sortIndex++; // Move to the next criterion for recursive calls

                        const sortedResult = [];
                        for (const group of distinctGroups) {
                            const subSorted = recursiveSort(group.items); // Recursively sort sub-group
                            sortedResult.push(...subSorted);
                        }
                        return sortedResult;
                    };
                    
                    return recursiveSort(records);
                }
            };

            // Public methods for QueryFlow instances
            // Method to add a filter predicate
            currentFlow.addFilter = (predicateCreator, ...args) => {
                const helperContext = { helper: flowState.assistant };
                const predicateFunction = predicateCreator(helperContext, ...args);
                flowState.processor.addPredicate(predicateFunction);
                return currentFlow;
            };

            // Configures the next predicate to be combined with OR logic
            currentFlow.or = () => {
                flowState.config.orLogic = true;
                flowState.config.logicalOperator = "||";
                return currentFlow;
            };
            // Configures the next predicate to be negated
            currentFlow.not = () => {
                flowState.config.notLogic = true;
                return currentFlow;
            };
            // Sets or toggles case-insensitivity for string comparisons
            currentFlow.ignoreCase = (enable) => {
                flowState.config.ignoreCase = (enable === undefined || enable === null) ? true : !!enable;
                return currentFlow;
            };

            // Executes the pipeline and returns the selected records as an array
            currentFlow.toArray = () => {
                return flowState.processor.executePipeline().selectedRecords;
            };

            // Sets a callback for debug messages
            currentFlow.debug = (callback) => {
                flowState.config.debug.eventEmitter = callback;
                return currentFlow;
            };

            // Dynamically generates query methods from registered extensions (except 'source' types)
            for (const opDef of engineInternals.extensionManager.operationDefinitions) {
                if (!opDef.type || opDef.type.match(/source/i)) { continue; }

                let targetObject = opDef.namespace === "" ? currentFlow : (currentFlow[opDef.namespace] = currentFlow[opDef.namespace] || {});
                
                targetObject[opDef.name] = (...methodArgs) => {
                    const operationContext = flowState.processor.prepareOperationContext(opDef, methodArgs);
                    
                    const helperContext = {
                        helper: flowState.assistant,
                        targetField: operationContext.targetField
                    };

                    const commandResult = opDef.method(helperContext, ...operationContext.operationArgs);

                    if (opDef.type && opDef.type.match(/filter/i)) {
                        flowState.processor.addPredicate(commandResult);
                    } else if (opDef.type && opDef.type.match(/transform|order|distinct|select|aggregate/i)) {
                        // For transformational operations, apply changes directly to currentData
                        if (opDef.type.match(/order/i)) {
                            // commandResult is an array of sorting criteria
                            flowState.config.currentData = flowState.assistant.orchestrateSorting(
                                flowState.config.currentData, commandResult, false // Descending is handled per criterion
                            );
                        } else if (opDef.type.match(/distinct/i)) {
                            // commandResult is the field name for distinction
                            const distinctGroups = flowState.assistant.groupUnique(flowState.config.currentData, commandResult);
                            flowState.config.currentData = distinctGroups.map(g => g.key);
                        } else if (opDef.type.match(/select/i)) {
                            // commandResult is a mapping function
                            flowState.config.currentData = flowState.config.currentData.map(commandResult);
                        } else if (opDef.type.match(/aggregate/i)) {
                            // Aggregate functions return a single value, not a QueryFlow
                            return commandResult(flowState.config.currentData);
                        } else { // Generic transform
                            flowState.config.currentData = commandResult(flowState.config.currentData);
                        }
                    }
                    
                    return currentFlow; // Return current QueryFlow for chaining
                };
            }
        }
    }

    // Global variable assignment: DataPipe is the constructor for the library
    DataPipe = function(config) {
        const instance = {};
        establish.call(instance, config);
        return instance;
    };

})();