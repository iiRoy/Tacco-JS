(function( coreUtility, moduleAlias, globalContext ) {
    "use strict";

    // Core Extensions for Object prototype
    coreUtility.extender.register( 'Object', function( ObjectConstructor ) {

        /**
         * Compares two arrays for deep equivalence.
         * @param {Array} firstArr - The first array.
         * @param {Array} secondArr - The second array.
         * @returns {boolean} True if arrays are deeply equal, false otherwise.
         */
        function areArraysIdentical( firstArr, secondArr ) {
            if (firstArr.length !== secondArr.length) {
                return false; // Early exit for different lengths
            }
            // Ensure array-like objects are treated as arrays for iteration
            const tempArr = coreUtility.type.toArray(firstArr);
            return tempArr.every((value, index) => ObjectConstructor.checkEquivalence(secondArr[index], value));
        }

        /**
         * Compares two objects for deep equivalence of their own enumerable properties.
         * @param {object} objA - The first object.
         * @param {object} objB - The second object.
         * @returns {boolean} True if objects are deeply equal, false otherwise.
         */
        function compareObjects( objA, objB ) {
            const keysA = ObjectConstructor.getEnumerableKeys(objA);
            const keysB = ObjectConstructor.getEnumerableKeys(objB);

            if (keysA.length !== keysB.length) {
                return false; // Different number of enumerable properties
            }

            // Iterate over keys from objA
            for (const propKey of keysA) {
                // objB must have the same own enumerable property
                if (!Object.prototype.hasOwnProperty.call(objB, propKey)) {
                    return false;
                }
                // Recursively check equivalence of property values
                if (!ObjectConstructor.checkEquivalence(objA[propKey], objB[propKey])) {
                    return false;
                }
            }
            return true;
        }

        coreUtility.defineProperties( ObjectConstructor, {
            /**
             * Reduces the properties of an object to a single value by executing a callback function for each.
             * @param {object} sourceObject - The object to iterate over.
             * @param {*} initialValue - The initial value of the accumulator.
             * @param {function} callbackFn - The callback function (accumulator, value, key, object, index).
             * @param {object} [contextObj] - The `this` context for the callback.
             * @returns {*} The aggregated value.
             */
            reduceProperties : function( sourceObject, initialValue, callbackFn, contextObj ) {
                if (!coreUtility.type.isObject(sourceObject)) {
                    console.warn("reduceProperties expects an object as its first argument.");
                    return initialValue;
                }
                const executionContext = contextObj || sourceObject;
                return ObjectConstructor.getEnumerableKeys(sourceObject).reduce( (accumulator, key, index) => {
                    return callbackFn.call(executionContext, accumulator, sourceObject[key], key, sourceObject, index);
                }, initialValue);
            },

            /**
             * Removes all own enumerable properties from an object.
             * @param {object} targetObj - The object to clear.
             * @returns {object} The cleared object.
             */
            emptyObject : function( targetObj ) {
                if (!coreUtility.type.isObject(targetObj)) return targetObj;
                ObjectConstructor.getEnumerableKeys(targetObj).forEach( prop => { delete targetObj[prop]; });
                return targetObj;
            },

            /**
             * Checks if two values are deeply equivalent.
             * @param {*} valueA - The first value.
             * @param {*} valueB - The second value.
             * @returns {boolean} True if values are equivalent, false otherwise.
             */
            checkEquivalence   : function( valueA, valueB ) {
                const typeA = coreUtility.type.identify(valueA);
                const typeB = coreUtility.type.identify(valueB);

                // If types are fundamentally different, they are not equivalent, except for explicit cases.
                if (typeA !== typeB) {
                    return false;
                }

                switch (typeA) {
                    case 'array'  : return Array.isArray(valueB) && areArraysIdentical( valueA, valueB );
                    case 'object' : return coreUtility.type.isObject(valueB) && compareObjects( valueA, valueB );
                    case 'date'   : return valueA.getTime() === valueB.getTime();
                    case 'function':
                    case 'regexp':
                        return valueA.toString() === valueB.toString(); // Simple string comparison for functions/regexps
                    case 'number':
                        if (Number.isNaN(valueA) && Number.isNaN(valueB)) return true; // NaN is special
                        return valueA === valueB;
                    // For primitives (string, boolean, symbol, bigint, undefined, null)
                    default       : return valueA === valueB;
                }
            },

            /**
             * Returns an array of all own property names (enumerable or not) of an object.
             * @param {object} inputObject - The object to inspect.
             * @returns {string[]} An array of property names.
             */
            getOwnKeys   : function( inputObject ) {
                if (!coreUtility.type.isObject(inputObject)) {
                    return [];
                }
                return Object.getOwnPropertyNames( inputObject );
            },

            /**
             * Returns the count of all own property names of an object.
             * @param {object} inputObject - The object to inspect.
             * @returns {number} The number of own properties.
             */
            getOwnKeyCount    : function( inputObject ) {
                return ObjectConstructor.getOwnKeys( inputObject ).length;
            },

            /**
             * Returns an array of an object's own enumerable string-keyed property names.
             * @param {object} inputObject - The object to inspect.
             * @returns {string[]} An array of enumerable property names.
             */
            getEnumerableKeys: function(inputObject) {
                if (!coreUtility.type.isObject(inputObject)) {
                    return [];
                }
                return Object.keys(inputObject);
            }
        }, 'w' );
    });

    // Enhancements for Function objects
    coreUtility.extender.register( 'Function', function( FunctionConstructor ) {
        const argumentExtractionRegex = /^(?:async\s*)?(?:function\*?\s*\w*)?\s*\(([^)]*)\)/; // Handles async and generator functions too
        const argumentSplitter = /\s*,\s*/;

        coreUtility.defineProperty( FunctionConstructor, 'ensureCallable', coreUtility.descriptor( function ensureCallable( inputVal ) {
            return coreUtility.type.isFunction( inputVal ) ? inputVal : () => inputVal;
        }, { writable: true, configurable: true } ) );

        coreUtility.defineProperties( FunctionConstructor.prototype, {
            // properties
            /**
             * Gets the names of the parameters of the function.
             * @returns {string[]} An array of parameter names.
             */
            parameterNames : { get : function() {
                const funcString = String(this);
                const matchResult = funcString.match(argumentExtractionRegex);

                if (!matchResult || !matchResult[1]) {
                    return [];
                }
                const names = matchResult[1].trim().split(argumentSplitter);
                return names.length === 1 && names[0] === '' ? [] : names;
            } },

            // methods
            /**
             * Attempts to execute the function within a try-catch block, returning the result or the error.
             * @param {object} [contextScope] - The `this` context for the function.
             * @param {...*} extraArguments - Arguments to pass to the function.
             * @returns {*} The function's return value or the caught error.
             */
            tryExecute   : function( contextScope, ...extraArguments ) {
                const currentFunction = this;
                try {
                    return currentFunction.apply( contextScope || this, extraArguments );
                } catch (error) {
                    return error;
                }
            },

            /**
             * Creates a new function that, when called, prepends its `this` context to the arguments
             * before calling the original function. The result is cached.
             * @returns {function} The self-bound function.
             */
            autoApplyThis : function() {
                const boundKey = '__selfBound';
                const originalFunc = this;

                if (originalFunc[boundKey]) {
                    return originalFunc[boundKey];
                }

                const newBoundFunc = function(...args) {
                    return originalFunc.apply(this, [this].concat(args));
                };

                Object.defineProperty(newBoundFunc, 'name', {
                    value: originalFunc.name ? originalFunc.name + 'SelfBound' : 'anonymousSelfBound',
                    configurable: true
                });

                coreUtility.defineProperty(originalFunc, boundKey, coreUtility.descriptor(newBoundFunc, {
                    writable: false,
                    enumerable: false,
                    configurable: true
                }));

                return newBoundFunc;
            },

            /**
             * Schedules the function to be executed in the next tick (Node.js) or with a minimal delay (browsers).
             * @param {object} [executionContext] - The `this` context for the function.
             * @param {...*} invocationArgs - Arguments to pass to the function.
             * @returns {*} The result of `process.nextTick` or `scheduleExecution`'s control object.
             */
            queueForNextTick : coreUtility.env.isNode
                ? function( executionContext, ...invocationArgs ) {
                    if (typeof process === 'undefined' || !process.nextTick) {
                        return this.scheduleExecution( 1, executionContext, ...invocationArgs );
                    }
                    return process.nextTick( this.bind( executionContext, ...invocationArgs ) );
                }
                : function( executionContext, ...invocationArgs ) {
                    return this.scheduleExecution( 1, executionContext, ...invocationArgs );
                },

            /**
             * Schedules the function to be executed after a specified delay. Returns a control object
             * with a `cancelPending` method.
             * @param {number} delayMillis - The delay in milliseconds.
             * @param {object} [executionContext] - The `this` context for the function.
             * @param {...*} invocationArgs - Arguments to pass to the function.
             * @returns {function & {cancelPending: Function, isScheduled: Function}} A wrapper function with control methods.
             */
            scheduleExecution : function( delayMillis, executionContext, ...invocationArgs ) {
                const originalCallable = this;
                let timerIdentifier = null;

                const executionWrapper = function() {
                    executionWrapper.cancelPending();
                    return originalCallable.apply(executionContext || this, invocationArgs);
                };

                const controlInterface = {
                    cancelPending : function() {
                        if (timerIdentifier !== null) {
                            clearTimeout(timerIdentifier);
                            timerIdentifier = null;
                        }
                        return originalCallable;
                    },
                    isScheduled : () => timerIdentifier !== null
                };

                timerIdentifier = setTimeout(executionWrapper, delayMillis);

                return coreUtility.assign(executionWrapper, controlInterface);
            },

            /**
             * Creates a memoized version of the function, caching results based on arguments.
             * @param {object} [contextObj] - The `this` context for the function.
             * @param {object} [cacheStorage] - An optional object to use as the cache.
             * @returns {function & {releaseMemoization: Function, clearCache: Function}} The memoized function.
             */
            createMemoized : function( contextObj, cacheStorage ) {
                const targetFunction = this;
                const actualCache = coreUtility.type.isObject(cacheStorage) ? cacheStorage : coreUtility.createEmptyObject();

                const memoizedFunc = function(...invocationArgs) {
                    let cacheKey;
                    try {
                        cacheKey = JSON.stringify(invocationArgs);
                    } catch (e) {
                        cacheKey = invocationArgs.map(arg => String(arg)).join('|');
                        console.warn("Memoization key generation failed for complex arguments, falling back to string coercion. Consider a custom key generator for better accuracy.", invocationArgs);
                    }

                    if (Object.prototype.hasOwnProperty.call(actualCache, cacheKey)) {
                        return actualCache[cacheKey];
                    }

                    const result = targetFunction.apply(contextObj, invocationArgs);
                    actualCache[cacheKey] = result;
                    return result;
                };

                memoizedFunc.releaseMemoization = () => targetFunction;
                memoizedFunc.clearCache = () => {
                    for (const key in actualCache) {
                        if (Object.prototype.hasOwnProperty.call(actualCache, key)) {
                            delete actualCache[key];
                        }
                    }
                };

                return memoizedFunc;
            },

            /**
             * A no-operation method that simply returns the function itself.
             * @returns {function} The original function.
             */
            noOperation : function() { return this; },

            /**
             * Wraps the current function with a decorator function. The decorator receives
             * the bound original function as its first argument.
             * @param {function} decoratorFunction - The function that will decorate the current function.
             * @param {...*} decoratorArgs - Additional arguments to pass to the decorator.
             * @returns {function} The new decorated function.
             */
            decorateWith : function( decoratorFunction, ...decoratorArgs ) {
                const decoratedTarget = this;

                if (!coreUtility.type.isFunction(decoratorFunction)) {
                    console.error("Decorator must be a function.");
                    return decoratedTarget;
                }

                const newDecoratedFunc = function(...executionArgs) {
                    const boundOriginal = decoratedTarget.bind(this);
                    return decoratorFunction.apply(this, [boundOriginal].concat(decoratorArgs).concat(executionArgs));
                };

                Object.defineProperty(newDecoratedFunc, 'name', {
                    value: (decoratorFunction.name || 'anonymousDecorator') + 'For' + (decoratedTarget.name || 'Anonymous'),
                    configurable: true
                });

                return newDecoratedFunc;
            }
        }, 'w' );
    });

    // Array prototype extensions for enhanced collection manipulation
    coreUtility.extender.register( 'Array', function( ArrayConstructor ) {
        const getGroupKeyFromFunction = ( predicate, item ) => predicate( item ) ? 'match' : 'no_match';
        const getGroupKeyFromRegex = ( pattern, item ) => pattern.test( item ) ? 'match' : 'no_match';
        const getGroupKeyFromString = ( propertyPath, item ) => coreUtility.object.getValue( item, propertyPath ) || 'other';

        const filterOutFalsey = item => item ? item : undefined;
        const extractOriginalValue = tuple => tuple[0];
        const prepareForSorting = function( item ) {
            const sortKey = ( coreUtility.type.isFunction(this) ? this(item) : coreUtility.object.getValue(item, this) );
            return [item, sortKey];
        };

        const ARRAY_PROTOTYPE = ArrayConstructor.prototype;
        const comparisonFunctions = {
            descending : ( itemA, itemB ) => {
                if (itemA[1] == null && itemB[1] == null) return 0;
                if (itemA[1] == null) return 1;
                if (itemB[1] == null) return -1;
                if (itemA[1] === itemB[1]) return 0;
                return itemA[1] < itemB[1] ? 1 : -1;
            },
            ascending  : ( itemA, itemB ) => {
                if (itemA[1] == null && itemB[1] == null) return 0;
                if (itemA[1] == null) return -1;
                if (itemB[1] == null) return 1;
                if (itemA[1] === itemB[1]) return 0;
                return itemA[1] > itemB[1] ? 1 : -1;
            }
        };

        comparisonFunctions['true'] = comparisonFunctions[1] = comparisonFunctions.ascending;
        comparisonFunctions['false'] = comparisonFunctions[0] = comparisonFunctions.descending;
        comparisonFunctions.default = comparisonFunctions.ascending;

        coreUtility.defineProperty( ArrayConstructor, 'sortComparators', coreUtility.descriptor( { value : comparisonFunctions }, { writable: true } ) );

        coreUtility.defineProperties( ArrayConstructor.prototype, {
            /**
             * Iterates over array elements, reducing them to a single value.
             * @param {*} initialAccumulator - The initial value for the accumulator.
             * @param {function} processingCallback - Callback (accumulator, item, index, array).
             * @param {object} [executionContext] - The `this` context for the callback.
             * @returns {*} The accumulated value.
             */
            reduceEach : function( initialAccumulator, processingCallback, executionContext ) {
                const currentArray = this;
                if (!coreUtility.type.isArray(currentArray)) {
                    console.warn("reduceEach called on a non-array object.");
                    return initialAccumulator;
                }
                return ARRAY_PROTOTYPE.reduce.call( currentArray, (accumulator, item, index, arr) => {
                    const contextForCall = executionContext || item;
                    return processingCallback.call(contextForCall, accumulator, item, index, arr);
                }, initialAccumulator );
            },

            /**
             * Creates an object by associating elements of the array with keys from another array.
             * @param {Array} keysArray - An array of keys to use for the new object.
             * @param {function} [valueTransformFn] - Callback (value, index, array) to transform values.
             * @param {object} [contextScope] - The `this` context for the transformer.
             * @returns {object} The new object.
             */
            mapToObjects : function( keysArray, valueTransformFn, contextScope ) {
                const thisArray = this;
                const transformer = coreUtility.ensureCallable(valueTransformFn || coreUtility.identity);
                const context = contextScope || thisArray;

                if (!coreUtility.type.isArray(keysArray) || keysArray.length < thisArray.length) {
                    console.warn("Keys array is invalid or too short for association. Some values might be skipped.");
                }

                return ARRAY_PROTOTYPE.reduce.call( thisArray, (resultObject, value, index) => {
                    const key = keysArray[index];
                    if (key !== undefined && key !== null && String(key).trim() !== '') {
                        resultObject[key] = transformer.call(context, value, index, thisArray);
                    }
                    return resultObject;
                }, coreUtility.createEmptyObject() );
            },

            /**
             * Clears all elements from the array by setting its length to 0.
             * @returns {Array} The empty array.
             */
            emptyAll  : function() { this.length = 0; return this; },

            /**
             * Creates a shallow copy of the array.
             * @returns {Array} A new array containing the same elements.
             */
            duplicate : function() { return ARRAY_PROTOTYPE.slice.call( this ); },

            /**
             * Creates a new array with all falsey values (null, undefined, 0, false, '') removed.
             * Optionally removes only null and undefined.
             * @param {boolean} [includeUndefinedAndNull=false] - If true, only null and undefined are removed.
             * @returns {Array} A new array with falsey values removed.
             */
            removeFalsey : function( includeUndefinedAndNull ) {
                const filterCallback = includeUndefinedAndNull ? filterOutFalsey : coreUtility.identity;
                return this.filterMap(filterCallback);
            },

            /**
             * Checks if the array contains a specific item.
             * @param {*} searchElement - The element to search for.
             * @returns {boolean} True if the element is found, false otherwise.
             */
            includesItem : function( searchElement ) {
                return ARRAY_PROTOTYPE.includes.call( this, searchElement );
            },

            /**
             * Executes a provided function once for each array element.
             * @param {function} callback - Function to execute for each element.
             * @param {object} [contextObject] - The `this` context for the callback.
             * @returns {Array} The original array.
             */
            forEachElement : function( callback, contextObject ) {
                ARRAY_PROTOTYPE.forEach.call( this, callback, contextObject || this );
                return this;
            },

            /**
             * Flattens a nested array up to a specified depth.
             * @param {number} [depthLimit=Infinity] - The maximum depth to flatten.
             * @returns {Array} A new flattened array.
             */
            deepFlatten : function( depthLimit ) {
                let currentDepth = depthLimit;
                if ( coreUtility.type.isNumber(currentDepth) ) {
                    if (currentDepth <= 0) {
                        return this.duplicate();
                    }
                    currentDepth--;
                } else {
                    currentDepth = Infinity;
                }

                return this.reduceEach( [], (accumulator, currentItem) => {
                    if (ArrayConstructor.isArray(currentItem) && currentDepth >= 0) {
                        accumulator.push(...currentItem.deepFlatten(currentDepth));
                    } else {
                        accumulator.push(currentItem);
                    }
                    return accumulator;
                });
            },

            /**
             * Filters array elements based on a regular expression or string pattern, then transforms them.
             * @param {RegExp|string} pattern - The regex or string pattern to match.
             * @param {function} [transformCallback] - Callback (item, index, array) to transform matched items.
             * @param {object} [contextObject] - The `this` context for the callback.
             * @returns {Array} A new array of transformed, matched items.
             */
            filterByPattern : function( pattern, transformCallback, contextObject ) {
                const sourceArray = this;
                const transformer = coreUtility.ensureCallable(transformCallback || coreUtility.identity);
                const context = contextObject || sourceArray;

                let actualPattern = pattern;
                if (coreUtility.type.isString(pattern)) {
                    actualPattern = new RegExp(pattern.escapeRegexSpecialChars(), 'g');
                } else if (!coreUtility.type.isRegExp(pattern)) {
                    console.warn("filterByPattern expects a RegExp or string pattern. Returning empty array.");
                    return [];
                }

                return sourceArray.reduceEach( [], (results, item, index) => {
                    if (actualPattern.test(item)) {
                        results.push(transformer.call(context, item, index, sourceArray));
                    }
                    return results;
                });
            },

            /**
             * Groups elements of the array based on a key selector (function, regex, or string/number property path).
             * @param {function|RegExp|string|number} keySelector - Logic to determine the group key for each element.
             * @param {function} [valueMapper] - Callback (item, index, array) to map items before grouping.
             * @param {object} [contextScope] - The `this` context for the mapper.
             * @returns {object} An object where keys are group names and values are arrays of grouped elements.
             */
            groupElements : function( keySelector, valueMapper, contextScope ) {
                const currentCollection = this;
                const mapper = coreUtility.ensureCallable(valueMapper || coreUtility.identity);
                const context = contextScope || currentCollection;
                const resultGroups = {};

                let keyResolver;
                switch( coreUtility.type.identify( keySelector ) ) {
                    case 'function' : keyResolver = getGroupKeyFromFunction; break;
                    case 'regexp'   : keyResolver = getGroupKeyFromRegex; break;
                    case 'string'   :
                    case 'number'   : keyResolver = getGroupKeyFromString; break;
                    default         : throw new TypeError( 'Grouping key selector must be a Function, RegExp, or String/Number (for property path).' );
                }

                if (coreUtility.type.isFunction(keySelector) || coreUtility.type.isRegExp(keySelector)) {
                    resultGroups['match'] = [];
                    resultGroups['no_match'] = [];
                }

                return currentCollection.reduceEach( resultGroups, (accumulator, item, index) => {
                    const groupKey = keyResolver( keySelector, item );
                    if (!accumulator[groupKey]) {
                        accumulator[groupKey] = [];
                    }
                    accumulator[groupKey].push( mapper.call( context, item, index, currentCollection ) );
                    return accumulator;
                });
            },

            /**
             * Adds an item to the array only if it's not already present.
             * @param {*} newItem - The item to add.
             * @returns {boolean} True if the item was added, false otherwise.
             */
            addUnique : function( newItem ) {
                if (this.includesItem(newItem)) {
                    return false;
                }
                this.push(newItem);
                return true;
            },

            /**
             * Invokes a specified method on each object in the array and returns the results.
             * Non-existent or non-function methods are skipped.
             * @param {string} methodName - The name of the method to invoke.
             * @param {...*} methodArgs - Arguments to pass to the invoked method.
             * @returns {Array} A new array containing the results of the invoked methods.
             */
            invokeMethodOnEach : function( methodName, ...methodArgs ) {
                if (!coreUtility.type.isString(methodName) || methodName.trim() === '') {
                    console.error("invokeMethodOnEach requires a valid method name (string).");
                    return [];
                }

                return this.filterMap( (item) => {
                    const targetMethod = item && item[methodName];
                    if (coreUtility.type.isFunction(targetMethod)) {
                        return targetMethod.apply(item, methodArgs);
                    }
                    return undefined;
                });
            },

            /**
             * Retrieves an element from the array, supporting negative indices (from the end).
             * @param {number} index - The index of the element to retrieve.
             * @returns {*} The element at the specified index, or undefined if out of bounds.
             */
            getElementAt : function( index ) {
                if (!coreUtility.type.isNumber(index) || !Number.isInteger(index)) {
                    console.warn("getElementAt expects an integer index.");
                    return undefined;
                }
                const effectiveIndex = index < 0 ? this.length + index : index;
                if (effectiveIndex < 0 || effectiveIndex >= this.length) {
                    return undefined;
                }
                return this[effectiveIndex];
            },

            /**
             * Returns the last element of the array.
             * @returns {*} The last element, or undefined if the array is empty.
             */
            getLastElement : function() {
                if (this.length === 0) return undefined;
                return this[this.length - 1];
            },

            /**
             * Maps each element of the array using a transformation function, then filters out
             * any `null` or `undefined` results.
             * @param {function} transformationFn - The function to transform each element.
             * @param {object} [contextScope] - The `this` context for the transformation function.
             * @returns {Array} A new array containing only the non-null/undefined transformed results.
             */
            filterMap : function( transformationFn, contextScope ) {
                const context = contextScope || this;
                const callableTransform = coreUtility.ensureCallable(transformationFn);

                return ARRAY_PROTOTYPE.reduce.call( this, (results, item, index, arr) => {
                    const transformed = callableTransform.call(context, item, index, arr);
                    if (coreUtility.existsAndNotNull(transformed)) {
                        results.push(transformed);
                    }
                    return results;
                }, [] );
            },

            /**
             * Removes all occurrences of specified items from the array in-place.
             * @param {...*} itemsToRemove - The items to delete from the array.
             * @returns {Array} An array of the elements that were removed.
             */
            deleteMatching : function( ...itemsToRemove ) {
                const removedElements = [];
                let itemToProcess;

                while ( (itemToProcess = itemsToRemove.shift()) !== undefined ) {
                    let foundPosition;
                    while ((foundPosition = ARRAY_PROTOTYPE.indexOf.call(this, itemToProcess)) !== -1) {
                        removedElements.push(ARRAY_PROTOTYPE.splice.call(this, foundPosition, 1)[0]);
                    }
                }
                return removedElements;
            },

            /**
             * Sorts the array based on a derived key and a specified direction (ascending/descending).
             * Uses a Schwartzian transform for efficiency.
             * @param {function|string|number} keyExtractor - A function to extract the sorting key, or a property path.
             * @param {function|string|number|boolean} [direction='asc'] - 'asc', 'desc', true (asc), false (desc), or a custom comparator.
             * @returns {Array} A new sorted array.
             */
            sortWithKey : function( keyExtractor, direction ) {
                if (!keyExtractor && !coreUtility.type.isFunction(keyExtractor) && !coreUtility.type.isString(keyExtractor) && !coreUtility.type.isNumber(keyExtractor)) {
                    console.warn("sortWithKey requires a key extractor (function, string, or number). Returning unsorted duplicate.");
                    return this.duplicate();
                }

                const sortingPairs = ARRAY_PROTOTYPE.map.call( this, prepareForSorting, keyExtractor );

                let comparator;
                if (coreUtility.type.isFunction(direction)) {
                    comparator = direction;
                } else {
                    const dirKey = String(direction).toLowerCase();
                    comparator = ArrayConstructor.sortComparators[dirKey] || ArrayConstructor.sortComparators.default;
                }

                sortingPairs.sort(comparator);

                return ARRAY_PROTOTYPE.map.call( sortingPairs, extractOriginalValue );
            },

            /**
             * Assigns a property to each object in the array.
             * If `propertyValueOrArray` is an array, it assigns the value at the corresponding index.
             * @param {string|symbol} propertyName - The name of the property to assign.
             * @param {*} propertyValueOrArray - The value to assign, or an array of values.
             * @returns {Array} The original array with properties assigned.
             */
            assignProperty : function( propertyName, propertyValueOrArray ) {
                if (!coreUtility.type.isString(propertyName) && !coreUtility.type.isSymbol(propertyName)) {
                    console.warn("assignProperty requires a valid property name (string or symbol).");
                    return this;
                }

                const isValueArray = ArrayConstructor.isArray( propertyValueOrArray );
                return this.forEachElement( (item, index) => {
                    if (coreUtility.type.isObject(item) || coreUtility.type.isArray(item)) {
                        item[propertyName] = isValueArray ? propertyValueOrArray[index] : propertyValueOrArray;
                    }
                });
            },

            /**
             * Returns a new array containing only the unique elements from the original array.
             * @returns {Array} A new array with unique elements.
             */
            getUniqueElements : function() {
                const seen = new Set();
                return this.filter( item => {
                    if (seen.has(item)) {
                        return false;
                    }
                    seen.add(item);
                    return true;
                });
            },

            /**
             * Returns a new array with specified items excluded. The original array is not modified.
             * @param {...*} itemsToExclude - The items to exclude from the new array.
             * @returns {Array} A new array without the excluded items.
             */
            excludingItems : function( ...itemsToExclude ) {
                const workingCopy = this.duplicate();
                workingCopy.deleteMatching(...itemsToExclude);
                return workingCopy;
            },

            /**
             * Interleaves elements from the current array with elements from other arrays.
             * @param {...Array} otherArrays - Other arrays to interleave with.
             * @returns {Array[]} A new array of arrays, where each inner array contains elements at the same index
             *                    from all input arrays.
             */
            interleave : function( ...otherArrays ) {
                const allCollections = [this, ...otherArrays];
                const maxLength = Math.max(...allCollections.map(arr => arr.length));
                const interleavedResult = [];

                for (let i = 0; i < maxLength; i++) {
                    const currentTuple = [];
                    for (let j = 0; j < allCollections.length; j++) {
                        currentTuple.push(allCollections[j][i]);
                    }
                    interleavedResult.push(currentTuple);
                }
                return interleavedResult;
            }
        }, 'w' );
    });

    // Numeric utility functions
    coreUtility.extender.register( 'Number', function( NumberConstructor ) {
        const absoluteValue = Math.abs;
        const MAX_SAFE_INTEGER_VALUE = Number.MAX_SAFE_INTEGER || 9007199254740991;
        const MIN_SAFE_INTEGER_VALUE = Number.MIN_SAFE_INTEGER || -9007199254740991;
        const floatFloor = Math.floor;

        coreUtility.defineProperties( NumberConstructor, {
            /**
             * Checks if a value is an integer within the safe integer range.
             * @param {*} valueCandidate - The value to check.
             * @returns {boolean} True if the value is a safe integer, false otherwise.
             */
            isWholeNumber : function( valueCandidate ) {
                if (coreUtility.type.identify(valueCandidate) !== 'number' || !Number.isFinite(valueCandidate)) {
                    return false;
                }
                if (NumberConstructor.isInteger) {
                    return NumberConstructor.isInteger(valueCandidate);
                }
                return valueCandidate >= MIN_SAFE_INTEGER_VALUE && valueCandidate <= MAX_SAFE_INTEGER_VALUE && floatFloor(valueCandidate) === valueCandidate;
            },

            /**
             * Converts a value to an integer, truncating any fractional part.
             * @param {*} inputNumeric - The value to convert.
             * @returns {number} The integer representation of the value.
             */
            convertToInteger : function( inputNumeric ) {
                let processedValue = Number(inputNumeric);
                if (Number.isNaN(processedValue)) {
                    return 0;
                }
                if (processedValue === 0 || !Number.isFinite(processedValue)) {
                    return processedValue;
                }

                if (NumberConstructor.trunc) {
                    return NumberConstructor.trunc(processedValue);
                }

                return processedValue < 0 ? Math.ceil(processedValue) : floatFloor(processedValue);
            }
        }, 'w' );

        coreUtility.defineProperties( NumberConstructor.prototype, {
            /**
             * Pads the number with leading zeros to reach a target length.
             * @param {number} targetLength - The desired total length of the string.
             * @param {number} [base=10] - The numeral system base (e.g., 10 for decimal, 16 for hexadecimal).
             * @returns {string} The zero-padded string representation of the number.
             */
            zeroPad : function( targetLength, base ) {
                const numString = this.toString( base || 10 );
                const paddingNeeded = targetLength - numString.length;
                if (paddingNeeded <= 0) return numString;
                return '0'.repeat(paddingNeeded) + numString;
            },

            /**
             * Executes a callback function a number of times equal to the number's value.
             * @param {function} iterationCallback - Callback (index, originalNumber) for each iteration.
             * @param {object} [contextScope] - The `this` context for the callback.
             * @returns {Number} The original number.
             */
            iterateRange : function( iterationCallback, contextScope ) {
                const limit = NumberConstructor.convertToInteger(this);
                if (limit <= 0) {
                    return this;
                }
                const effectiveContext = contextScope || coreUtility.globalObject;
                for (let i = 0; i < limit; i++) {
                    iterationCallback.call(effectiveContext, i, this);
                }
                return this;
            },

            /**
             * Converts the number to a two-digit hexadecimal string, padded with a leading zero if necessary.
             * @returns {string} The two-digit hexadecimal string.
             */
            toTwoDigitHex : function() { return this.zeroPad( 2, 16 ); }
        }, 'w' );
    });

    // String manipulation utilities
    coreUtility.extender.register( 'String', function( StringConstructor ) {
        const characterCache = coreUtility.createEmptyObject();
        const sliceRegexCache = coreUtility.createEmptyObject();
        const regexSpecialChars = /[.*+?^${}()|[\]\\]/g;
        const regexSpecialCharReplacement = '\\$&';
        const uppercaseLetterRegex = /([A-Z])/g;
        const hexValueRegex = /^#?([0-9a-fA-F]{1,6})$/;
        const rgbComponentRegex = /(\d{1,3})/g;
        const wordBoundarySplitRegex = /[\sA-Z_-]+/;
        const trailingWhitespaceRegex = /(.*?)\s*$/;

        const insertDelimiterForCaseChange = (match, p1) => `-${p1.toLowerCase()}`;

        /**
         * Splits a string into an array of words, handling camelCase, snake_case, and kebab-case.
         * @param {string} inputString The string to split.
         * @returns {string[]} An array of word segments.
         */
        function extractWords( inputString ) {
            const trimmedString = inputString.trim();
            if (trimmedString.length === 0) {
                return [];
            }

            const firstChar = trimmedString.charAt(0);
            const secondChar = trimmedString.charAt(1);
            let initialSegmentLength = 1;

            if (firstChar.toLowerCase() === firstChar && secondChar && secondChar !== ' ' && secondChar.toUpperCase() === secondChar) {
                initialSegmentLength = 2;
            }

            const leadingPart = trimmedString.substring(0, initialSegmentLength);
            const remainingPart = trimmedString.substring(initialSegmentLength);

            const processedRemaining = remainingPart.replace(uppercaseLetterRegex, insertDelimiterForCaseChange);

            const parts = (leadingPart + processedRemaining).split(wordBoundarySplitRegex).filter(Boolean);

            return parts;
        }

        /**
         * Renaming and structural changes are applied to ensure distinctness from potential future native implementations.
         */
        coreUtility.defineProperties( StringConstructor.prototype, {
            /**
             * Checks if the string is empty or contains only whitespace.
             * @returns {boolean} True if empty or whitespace-only, false otherwise.
             */
            isEmptyOrWhitespace : function() {
                return this.trim().length === 0;
            },

            /**
             * Capitalizes the first letter of the string and lowercases the rest.
             * @returns {string} The title-cased string.
             */
            toTitleCase  : function() {
                if (this.length === 0) {
                    return '';
                }
                return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
            },

            /**
             * Replaces multiple occurrences of a separator character with a single one,
             * and trims leading/trailing separators.
             * @param {string} [separatorChar=' '] - The character to normalize.
             * @returns {string} The cleaned string.
             */
            normalizeSpaces : function( separatorChar = ' ' ) {
                const charConfig = characterCache[separatorChar] || ( characterCache[separatorChar] = {
                    regex : new RegExp( `(${String(separatorChar).escapeRegexSpecialChars()}){2,}`, 'g' ),
                    filler : separatorChar
                });

                const collapsedSeparators = this.replace(charConfig.regex, charConfig.filler);

                return collapsedSeparators.split(charConfig.filler)
                                          .filter(part => !part.isEmptyOrWhitespace())
                                          .join(charConfig.filler);
            },

            /**
             * Checks if the string contains a given substring.
             * @param {string} sub - The substring to search for.
             * @returns {boolean} True if the substring is found, false otherwise.
             */
            hasSubstring : function( sub ) {
                return this.indexOf(sub) !== -1;
            },

            /**
             * Checks if the string is completely empty (length 0).
             * @returns {boolean} True if the string is empty, false otherwise.
             */
            isCompletelyEmpty : function() { return this === ''; },

            /**
             * Checks if the string ends with a specific suffix.
             * @param {string} suffix - The suffix to check.
             * @returns {boolean} True if the string ends with the suffix, false otherwise.
             */
            terminatesWith : function( suffix ) {
                if (suffix === null || suffix === undefined || suffix.length === 0) {
                    return true;
                }
                if (this.length < suffix.length) {
                    return false;
                }
                return this.slice(-suffix.length) === suffix;
            },

            /**
             * Formats a string by replacing placeholders with provided arguments.
             * (Assumes coreUtility.formatString exists and is compatible)
             */
            interpolate : coreUtility.formatString.autoApplyThis(),

            /**
             * Globally replaces all occurrences of a pattern with a replacement.
             * (Assumes coreUtility.globalSubstitute exists and is compatible)
             */
            globalReplace : coreUtility.globalSubstitute.autoApplyThis(),

            /**
             * Converts the string to kebab-case (e.g., "my-string-example").
             * @returns {string} The kebab-cased string.
             */
            toKebabCase : function() {
                return extractWords(this).join('-').toLowerCase();
            },

            /**
             * Checks if the string includes a substring, ignoring case.
             * @param {string} searchTarget - The substring to search for.
             * @returns {boolean} True if the substring is found (case-insensitive), false otherwise.
             */
            caseInsensitiveIncludes : function( searchTarget ) {
                if (!coreUtility.existsAndNotNull(searchTarget)) {
                    return false;
                }
                return this.toLowerCase().hasSubstring(String(searchTarget).toLowerCase());
            },

            /**
             * Extracts an array of matches or capturing groups from the string using a regex pattern.
             * @param {RegExp} regexPattern - The regular expression to use for matching.
             * @returns {string[]} An array of extracted matches/groups.
             */
            extractMatches : function( regexPattern ) {
                const matchResults = this.match(regexPattern);
                if (!matchResults) {
                    return [];
                }
                if (matchResults.length === 1 && matchResults[0] === this) {
                    return [];
                }
                if (matchResults[0] === this && matchResults.length > 1) {
                    return matchResults.slice(1);
                }
                return Array.from(matchResults);
            },

            /**
             * Escapes special characters in a string so it can be used safely within a regular expression.
             * @returns {string} The escaped string.
             */
            escapeRegexSpecialChars : function() {
                return this.replace(regexSpecialChars, regexSpecialCharReplacement);
            },

            /**
             * Chunks the string into an array of substrings of a specified length.
             * @param {number} chunkSize - The desired length of each chunk.
             * @returns {string[]} An array of string chunks.
             */
            chunkByLength : function( chunkSize ) {
                const parsedSize = Number.convertToInteger(chunkSize);
                if (Number.isNaN(parsedSize) || parsedSize <= 0 || this.length === 0) {
                    return [StringConstructor(this)];
                }
                if (this.length < parsedSize) {
                    return [StringConstructor(this)];
                }
                const regex = sliceRegexCache[parsedSize] || (sliceRegexCache[parsedSize] = new RegExp(`(.{1,${parsedSize}})`, 'g'));
                return this.match(regex);
            },

            /**
             * Checks if the string begins with a specific prefix.
             * @param {string} prefix - The prefix to check.
             * @returns {boolean} True if the string begins with the prefix, false otherwise.
             */
            beginsWith   : function( prefix ) {
                if (prefix === null || prefix === undefined || prefix.length === 0) {
                    return true;
                }
                if (this.length < prefix.length) {
                    return false;
                }
                return this.indexOf(prefix) === 0;
            },

            /**
             * Repeats the string a specified number of times.
             * @param {number} count - The number of times to repeat the string.
             * @returns {string} The repeated string.
             */
            repeatString : function( count ) {
                const repeatCount = Number.convertToInteger(count);
                if (repeatCount <= 0 || this.length === 0) {
                    return '';
                }
                if (StringConstructor.prototype.repeat) {
                    return this.repeat(repeatCount);
                }
                return new Array(repeatCount + 1).join(this);
            },

            /**
             * Converts the string to dromedaryCase (camelCase, with the first letter lowercase).
             * @returns {string} The dromedary-cased string.
             */
            toDromedaryCase : function() {
                const segments = extractWords(this);
                if (segments.length === 0) {
                    return '';
                }
                const firstSegment = segments.shift();
                return segments.reduce( (resultParts, segment) => {
                    resultParts.push(segment.toTitleCase());
                    return resultParts;
                }, [firstSegment.toLowerCase()] ).join('');
            },

            /**
             * Converts a string representing a color (RGB or hex) to its hex color code.
             * @returns {string|null} The hex color code (e.g., "#RRGGBB") or null if conversion fails.
             */
            toHexColor   : ( function() {
                const componentToHex = val => Number.convertToInteger(val).toTwoDigitHex();
                return function() {
                    const rgbMatches = this.match(rgbComponentRegex);
                    if (rgbMatches && rgbMatches.length > 0) {
                        const hexComponents = rgbMatches.map(componentToHex);
                        if (hexComponents.length === 1) {
                            if (hexComponents[0].length === 1) {
                                return `#${hexComponents[0].repeat(6)}`;
                            } else if (hexComponents[0].length === 2) {
                                return `#${hexComponents[0].repeat(3)}`;
                            }
                        }
                        return `#${hexComponents.join('')}`;
                    }

                    const hexMatch = this.match(hexValueRegex);
                    if (hexMatch && hexMatch[1]) {
                        let hexVal = hexMatch[1];
                        if (hexVal.length === 3) {
                            hexVal = hexVal.split('').map(c => c + c).join('');
                        }
                        return `#${hexVal}`;
                    }

                    return null;
                };
            }() ),

            /**
             * Parses a JSON string into a JavaScript object.
             * (Assumes JSON.parse.autoApplyThis() is correctly defined)
             */
            parseJsonString : JSON.parse.autoApplyThis(),

            /**
             * Converts a hex or RGB color string to an RGB color string or array.
             * @param {boolean} [returnAsArray=false] - If true, returns an array `[R, G, B]`.
             * @returns {string|number[]|null} The RGB color string or array, or null if conversion fails.
             */
            toRgbColor : function( returnAsArray ) {
                const hexMatch = this.match(hexValueRegex);
                if (!hexMatch || !hexMatch[1]) {
                    const rgbStringMatch = this.match(/rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/);
                    if (rgbStringMatch && rgbStringMatch.length === 4) {
                        const parsedRgb = [parseInt(rgbStringMatch[1], 10), parseInt(rgbStringMatch[2], 10), parseInt(rgbStringMatch[3], 10)];
                        return returnAsArray ? parsedRgb : `rgb(${parsedRgb.join(', ')})`;
                    }
                    return returnAsArray ? [] : null;
                }

                let hexValue = hexMatch[1];
                switch( hexValue.length ) {
                    case 6  : break;
                    case 3  : hexValue = hexValue.split('').map(c => c + c).join(''); break;
                    case 2  : hexValue = hexValue.repeatString(3); break;
                    case 1  : hexValue = hexValue.repeatString(6); break;
                    default : hexValue = hexValue.substring(0, 6);
                }

                const rgbComponents = hexValue.chunkByLength(2).map( chunk => parseInt(chunk, 16) );

                if (returnAsArray === true) {
                    return rgbComponents;
                }
                return `rgb(${rgbComponents.join(', ')})`;
            },

            /**
             * Removes any trailing whitespace from the string.
             * @returns {string} The string with trailing whitespace removed.
             */
            trimTrailingWhitespace : function() {
                return this.replace(trailingWhitespaceRegex, '$1');
            },

            /**
             * Truncates the string to a maximum length, appending an ellipsis if truncated.
             * @param {number} [maxLength=50] - The maximum desired length.
             * @param {string} [ellipsis='...'] - The string to append if truncated.
             * @returns {string} The truncated string.
             */
            limitLength : function( maxLength = 50, ellipsis = '...' ) {
                if (this.length <= maxLength) {
                    return StringConstructor(this);
                }
                const actualEllipsis = coreUtility.type.isString(ellipsis) ? ellipsis : '...';

                return this.substring(0, maxLength).trimTrailingWhitespace() + actualEllipsis;
            },

            /**
             * Converts the string to snake_case (e.g., "my_string_example").
             * @returns {string} The snake-cased string.
             */
            toSnakeCase : function() {
                return extractWords(this).join('_').toLowerCase();
            }
        }, 'w' );
    });

    // Module exposure and initialization logic

    function moduleInitializer() {
        coreUtility.extender.apply( coreUtility, arguments );
        return moduleInitializer;
    }

    function extendType( ConstructorRef, extensionLogic ) {
        if (!ConstructorRef || !ConstructorRef.name) {
            console.error("Invalid constructor provided for extension.");
            return moduleInitializer;
        }
        coreUtility.extender.register( ConstructorRef.name, extensionLogic ).applyExtensions( ConstructorRef );
        return moduleInitializer;
    }

    // Determine the global context or module export target
    if (!coreUtility.type.isIterable(globalContext) && !coreUtility.type.isObject(globalContext)) {
        globalContext = coreUtility.env.isNode ? module : coreUtility.globalObject;
    }

    // Expose the library's public interface
    const exposedLibrary = coreUtility.exposeModule( moduleInitializer, moduleAlias, globalContext );
    coreUtility.defineProperties( exposedLibrary, {
        utilities : coreUtility,
        extender  : extendType
    }, 'readOnly' );

    coreUtility.exposeModule( coreUtility, exposedLibrary );

    // Automatically apply all registered core extensions to their respective prototypes
    coreUtility.extender.applyAllRegistered( Object, Array, Function, Number, String );

}( typeof m8 !== 'undefined' ? m8 : (typeof require !== 'undefined' && typeof module !== 'undefined' && module.exports) ? require('m8') : null, 'n8iv', typeof exports !== 'undefined' ? exports : this ));