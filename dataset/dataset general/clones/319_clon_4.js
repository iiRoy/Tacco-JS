var utilityCore = (function() {
    // Internal helper functions (uniquely named and implemented)

    // Helper for deep cloning, with circular reference detection
    function createRecursiveCopy(sourceValue, depthLimit, currentDepth, visitedRefs) {
        if (sourceValue === null || typeof sourceValue !== 'object') {
            return sourceValue;
        }

        // Handle circular references
        if (visitedRefs.has(sourceValue)) {
            return visitedRefs.get(sourceValue);
        }

        let newContainer;
        if (Array.isArray(sourceValue)) {
            newContainer = [];
        } else if (Object.prototype.toString.call(sourceValue) === '[object Date]') {
            newContainer = new Date(sourceValue.getTime()); // Specific handling for Date objects
        } else if (Object.prototype.toString.call(sourceValue) === '[object RegExp]') {
            newContainer = new RegExp(sourceValue.source, sourceValue.flags); // Specific handling for RegExp objects
        } else {
            // For plain objects and other generic objects
            newContainer = Object.create(Object.getPrototypeOf(sourceValue));
        }
        visitedRefs.set(sourceValue, newContainer);

        // Depth limit check (for partial deep copies)
        if (typeof depthLimit === 'number' && currentDepth >= depthLimit) {
            return newContainer; // Return shallow copy if depth limit reached
        }

        const enumerationKeys = Array.isArray(sourceValue) ? Array.from({length: sourceValue.length}, (_, i) => i) : Object.keys(sourceValue);
        for (let i = 0; i < enumerationKeys.length; ++i) {
            const currentKey = enumerationKeys[i];
            newContainer[currentKey] = createRecursiveCopy(sourceValue[currentKey], depthLimit, currentDepth + 1, visitedRefs);
        }
        return newContainer;
    }

    // Helper for determining if something is a plain object literal
    function isSimpleObject(val) {
        if (typeof val !== 'object' || val === null) {
            return false;
        }
        const proto = Object.getPrototypeOf(val);
        return proto === null || proto === Object.prototype;
    }

    // Helper for deep equality comparison (for complex types in tests like uniq, without)
    function checkEquality(val1, val2) {
        if (val1 === val2) return true;

        // Special handling for NaN (NaN !== NaN)
        if (val1 !== val1 && val2 !== val2) return true;

        if (val1 === null || val2 === null || typeof val1 !== 'object' || typeof val2 !== 'object') {
            return false;
        }

        if (Array.isArray(val1) && Array.isArray(val2)) {
            if (val1.length !== val2.length) return false;
            for (let i = 0; i < val1.length; ++i) {
                if (!checkEquality(val1[i], val2[i])) return false;
            }
            return true;
        }

        if (isSimpleObject(val1) && isSimpleObject(val2)) {
            const keys1 = Object.keys(val1);
            const keys2 = Object.keys(val2);
            if (keys1.length !== keys2.length) return false;
            for (let i = 0; i < keys1.length; ++i) {
                const key = keys1[i];
                if (!Object.prototype.hasOwnProperty.call(val2, key) || !checkEquality(val1[key], val2[key])) {
                    return false;
                }
            }
            return true;
        }

        // For other objects (Date, RegExp, etc.), rely on strict equality if not covered above.
        // The tests don't require specific deep comparison for these.
        return false;
    }

    // General purpose deep collection traversal helper
    function scanCollectionDeeply(collectionElement, visitorCallback, depthConfig, currentIterationLevel = 0, noArrayTraversal = false, noObjectTraversal = false) {
        if (collectionElement === null || typeof collectionElement !== 'object') {
            return;
        }

        const maxScanDepth = depthConfig === true ? Infinity : (typeof depthConfig === 'number' ? depthConfig : 0);

        if (maxScanDepth > 0 && currentIterationLevel > maxScanDepth) {
            return;
        }

        visitorCallback(collectionElement, currentIterationLevel);

        if (maxScanDepth > 0 && currentIterationLevel < maxScanDepth) {
            const currentKeys = Array.isArray(collectionElement) ? Array.from({length: collectionElement.length}, (_, i) => i) : Object.keys(collectionElement);
            for (let i = 0; i < currentKeys.length; ++i) {
                const key = currentKeys[i];
                const value = collectionElement[key];
                const isValueArray = Array.isArray(value);
                const isValueObject = typeof value === 'object' && value !== null && !isValueArray;

                if ((isValueArray && !noArrayTraversal) || (isValueObject && !noObjectTraversal)) {
                    scanCollectionDeeply(value, visitorCallback, depthConfig, currentIterationLevel + 1, noArrayTraversal, noObjectTraversal);
                }
            }
        }
    }

    // The main utility object
    const moduleScope = {};

    // ARRAY METHODS

    // Clone of _.at
    moduleScope.getValueSet = function(inputCollection, targets, deepMode) {
        const outcomeList = [];
        const targetKeys = Array.isArray(targets) ? targets : [targets];
        const maxDepth = deepMode === true ? Infinity : (typeof deepMode === 'number' ? deepMode : 0);

        // Special handling for single numeric index, implying a "path-deep" behavior
        const isSingleNumericIndexPath = targetKeys.length === 1 && typeof targetKeys[0] === 'number';

        function processAndRecurse(currentEntity, currentLevel) {
            if (currentEntity === null || typeof currentEntity !== 'object') {
                return;
            }

            if (maxDepth > 0 && currentLevel > maxDepth) {
                return;
            }

            if (isSingleNumericIndexPath) {
                const singleKey = targetKeys[0];
                if (Object.prototype.hasOwnProperty.call(currentEntity, singleKey)) {
                    outcomeList.push(currentEntity[singleKey]);
                }
                // Recurse only on the element at the singleKey path
                const nextEntity = currentEntity[singleKey];
                if ((Array.isArray(nextEntity) || isSimpleObject(nextEntity)) && maxDepth > 0 && currentLevel < maxDepth) {
                    processAndRecurse(nextEntity, currentLevel + 1);
                }
            } else {
                // For multiple keys or non-numeric keys, apply all targetKeys to current level
                for (let i = 0; i < targetKeys.length; ++i) {
                    const currentKey = targetKeys[i];
                    if (Object.prototype.hasOwnProperty.call(currentEntity, currentKey)) {
                        outcomeList.push(currentEntity[currentKey]);
                    }
                }

                // Then, for deep mode, iterate ALL children of currentEntity
                if (maxDepth > 0 && currentLevel < maxDepth) {
                    const keysToScan = Array.isArray(currentEntity) ? Array.from({length: currentEntity.length}, (_, i) => i) : Object.keys(currentEntity);
                    for (let j = 0; j < keysToScan.length; ++j) {
                        const innerKey = keysToScan[j];
                        const innerItem = currentEntity[innerKey];
                        if (Array.isArray(innerItem) || isSimpleObject(innerItem)) {
                            processAndRecurse(innerItem, currentLevel + 1);
                        }
                    }
                }
            }
        }

        processAndRecurse(inputCollection, 0);
        return outcomeList;
    };

    // Clone of _.compact
    moduleScope.filterFalsey = function(sourceArray, removeEmptyComplex = false, deepProcess = false, depthLimit = Infinity) {
        const result = [];

        function filterNode(nodeValue, currentDepth) {
            if (deepProcess && (typeof depthLimit === 'number' && currentDepth > depthLimit)) {
                return nodeValue; // Return as is if depth limit reached for deep processing
            }

            if (Array.isArray(nodeValue)) {
                const tempArr = [];
                for (let i = 0; i < nodeValue.length; ++i) {
                    const processed = filterNode(nodeValue[i], currentDepth + 1);
                    if (processed !== null) { // null signifies item was removed
                         tempArr.push(processed);
                    }
                }
                if (removeEmptyComplex && tempArr.length === 0) {
                    return null; // Remove empty array if option is true
                }
                return tempArr;
            } else if (isSimpleObject(nodeValue)) {
                const tempObj = {};
                let hasValidProps = false;
                for (const key in nodeValue) {
                    if (Object.prototype.hasOwnProperty.call(nodeValue, key)) {
                        const processed = filterNode(nodeValue[key], currentDepth + 1);
                        if (processed !== null) {
                            tempObj[key] = processed;
                            hasValidProps = true;
                        }
                    }
                }
                if (removeEmptyComplex && !hasValidProps) {
                    return null; // Remove empty object if option is true
                }
                return tempObj;
            } else {
                if (!nodeValue) { // Check for falsy values
                    return null; // Remove falsy primitive
                }
                return nodeValue;
            }
        }

        // Process top-level array elements
        for (let i = 0; i < sourceArray.length; ++i) {
            const processedItem = filterNode(sourceArray[i], 0);
            if (processedItem !== null) {
                result.push(processedItem);
            }
        }
        return result;
    };

    // Clone of _.difference
    moduleScope.deductCollections = function(primaryArray, ...comparisonArraysAndDeep) {
        let deepMode = false;
        let scanDepth = Infinity;
        const lastArg = comparisonArraysAndDeep[comparisonArraysAndDeep.length - 1];

        if (typeof lastArg === 'boolean') {
            deepMode = lastArg;
            comparisonArraysAndDeep.pop();
        } else if (typeof lastArg === 'number') {
            scanDepth = lastArg;
            deepMode = true;
            comparisonArraysAndDeep.pop();
        }

        // Flatten comparison arrays based on deepMode and scanDepth
        const comparisonElements = [];
        for (let i = 0; i < comparisonArraysAndDeep.length; ++i) {
            const currentCompArr = comparisonArraysAndDeep[i];
            if (!Array.isArray(currentCompArr)) continue;

            scanCollectionDeeply(currentCompArr, (item, level) => {
                if (!Array.isArray(item) && !isSimpleObject(item)) { // Only collect primitives
                    comparisonElements.push(item);
                }
            }, deepMode ? scanDepth : 0);
        }
        const comparisonSet = new Set(comparisonElements);

        const resultArray = [];
        // Process primary array, flattening elements if deepMode allows
        scanCollectionDeeply(primaryArray, (item, level) => {
            if (Array.isArray(item) || isSimpleObject(item)) {
                // For collections, only check if deepMode is active and current level is the limit
                // Otherwise, its contents are processed by the recursive call.
                // This handles `[1, [6, [7]]]` where `[6,[7]]` is not flattened.
                if (deepMode && (typeof scanDepth === 'number' && level === scanDepth)) {
                    let isContained = false;
                    for (const compVal of comparisonSet) {
                         if (checkEquality(item, compVal)) {
                             isContained = true;
                             break;
                         }
                    }
                    if (!isContained) {
                        resultArray.push(item);
                    }
                }
                // If deepMode is active and level < scanDepth, its contents will be processed by recursive calls
            } else { // Primitive value
                if (!comparisonSet.has(item)) {
                    resultArray.push(item);
                }
            }
        }, deepMode ? scanDepth : 0);

        return resultArray;
    };

    // Clone of _.first
    moduleScope.retrieveFirstElements = function(sourceList, count = 1, deepScan = false, depthLimit = Infinity) {
        const obtained = [];
        let itemsToFetch = count;
        if (count === 0) return [];

        function gatherElements(entity, currentLevel) {
            if (itemsToFetch <= 0) return;

            if (entity === null || typeof entity !== 'object') {
                if (itemsToFetch > 0) {
                    obtained.push(entity); // Add primitive directly
                    itemsToFetch--;
                }
                return;
            }

            if (deepScan && (typeof depthLimit === 'number' && currentLevel > depthLimit)) {
                return; // Stop deeper scan
            }

            const currentKeys = Array.isArray(entity) ? Array.from({length: entity.length}, (_, i) => i) : Object.keys(entity);
            for (let i = 0; i < currentKeys.length; ++i) {
                if (itemsToFetch <= 0) return;
                const value = entity[currentKeys[i]];
                const isValueCollection = Array.isArray(value) || isSimpleObject(value);

                if (deepScan && isValueCollection && (typeof depthLimit === 'boolean' || currentLevel < depthLimit)) {
                    gatherElements(value, currentLevel + 1); // Recurse
                } else if (!isValueCollection || !deepScan) { // Add non-collections or if not deep scanning
                    obtained.push(value);
                    itemsToFetch--;
                }
            }
        }

        gatherElements(sourceList, 0);
        return obtained;
    };

    // Clone of _.indexOf
    moduleScope.findValuePosition = function(targetCollection, soughtValue, startIndex = 0, deepSearch = false) {
        let foundPath = null; // Stores "2.0" format for deep
        let foundIndex = -1; // Stores numeric index for non-deep

        function search(entity, value, currentPath, currentLevel) {
            if (foundPath !== null || foundIndex !== -1 || entity === null || typeof entity !== 'object') {
                return;
            }

            const keys = Array.isArray(entity) ? Array.from({length: entity.length}, (_, i) => i) : Object.keys(entity);

            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                const element = entity[key];
                const newPathSegment = currentPath ? `${currentPath}.${key}` : String(key);

                if (checkEquality(element, value)) {
                    if (deepSearch) {
                        foundPath = newPathSegment;
                    } else if (currentLevel === 0 && parseInt(key) >= startIndex) { // Only consider top-level for non-deep
                        foundIndex = parseInt(key);
                    }
                    return; // Found, stop search
                }

                if (deepSearch && (Array.isArray(element) || isSimpleObject(element))) {
                    search(element, value, newPathSegment, currentLevel + 1);
                    if (foundPath !== null) return; // If found in deeper level, stop
                }
            }
        }

        if (deepSearch) {
            search(targetCollection, soughtValue, '', 0);
            return foundPath;
        } else {
            if (Array.isArray(targetCollection)) {
                for (let i = startIndex; i < targetCollection.length; ++i) {
                    if (checkEquality(targetCollection[i], soughtValue)) {
                        return i;
                    }
                }
            }
            return -1; // Not found
        }
    };

    // Clone of _.initial
    moduleScope.getStartingElements = function(sourceArray, numToExclude = 1, deepMode = false) {
        if (!Array.isArray(sourceArray)) return [];

        if (deepMode) {
            const flatItems = [];
            scanCollectionDeeply(sourceArray, (item, level) => {
                if (!Array.isArray(item) && !isSimpleObject(item)) { // Only collect primitives
                    flatItems.push(item);
                }
            }, true); // Fully flatten

            if (numToExclude >= flatItems.length) {
                return [];
            }
            return flatItems.slice(0, flatItems.length - numToExclude);
        } else {
            if (numToExclude >= sourceArray.length) {
                return [];
            }
            return sourceArray.slice(0, sourceArray.length - numToExclude);
        }
    };

    // Clone of _.intersection
    moduleScope.findCommonality = function(firstArray, ...otherArraysAndDeep) {
        let deepMode = false;
        const lastArg = otherArraysAndDeep[otherArraysAndDeep.length - 1];

        if (typeof lastArg === 'boolean') {
            deepMode = lastArg;
            otherArraysAndDeep.pop();
        }

        const allArrays = [firstArray, ...otherArraysAndDeep];
        const flatItemSets = [];

        for (let arrIndex = 0; arrIndex < allArrays.length; ++arrIndex) {
            const currentArray = allArrays[arrIndex];
            const currentItems = [];
            if (deepMode) {
                scanCollectionDeeply(currentArray, (item, level) => {
                    if (!Array.isArray(item) && !isSimpleObject(item)) {
                        currentItems.push(item);
                    }
                }, true); // Fully flatten for deep intersection
            } else {
                for (let i = 0; i < currentArray.length; ++i) {
                    currentItems.push(currentArray[i]);
                }
            }
            flatItemSets.push(new Set(currentItems));
        }

        if (flatItemSets.length === 0) return [];

        const commonItems = new Set();
        for (const item of flatItemSets[0]) {
            let inAll = true;
            for (let i = 1; i < flatItemSets.length; ++i) {
                if (!flatItemSets[i].has(item)) {
                    inAll = false;
                    break;
                }
            }
            if (inAll) {
                commonItems.add(item);
            }
        }
        return Array.from(commonItems);
    };

    // Clone of _.last
    moduleScope.retrieveFinalElements = function(sourceList, count = 1, deepScan = false) {
        if (count === 0) return [];

        if (deepScan) {
            const flatItems = [];
            scanCollectionDeeply(sourceList, (item, level) => {
                if (!Array.isArray(item) && !isSimpleObject(item)) {
                    flatItems.push(item);
                }
            }, true); // Fully flatten

            if (count >= flatItems.length) {
                return flatItems;
            }
            return flatItems.slice(flatItems.length - count);
        } else {
            if (count >= sourceList.length) {
                return Array.from(sourceList);
            }
            return sourceList.slice(sourceList.length - count);
        }
    };

    // Clone of _.lastIndexOf
    moduleScope.findLastValuePosition = function(targetCollection, soughtValue, fromIndex = -1, deepSearch = false) {
        let foundPath = null;
        let found = false;

        function search(entity, value, currentPath, currentLevel) {
            if (found || entity === null || typeof entity !== 'object') {
                return;
            }

            const keys = Array.isArray(entity) ? Array.from({length: entity.length}, (_, i) => i) : Object.keys(entity);

            // Iterate in reverse for lastIndexOf behavior
            for (let i = keys.length - 1; i >= 0; --i) {
                const key = keys[i];
                const element = entity[key];
                const newPathSegment = currentPath ? `${currentPath}.${key}` : String(key);

                if (deepSearch) {
                    if ((Array.isArray(element) || isSimpleObject(element))) {
                        // Recurse first to find the deepest, rightmost match
                        search(element, value, newPathSegment, currentLevel + 1);
                        if (found) return; // If found in deeper level, stop
                    }
                    if (checkEquality(element, value) && !found) { // Only set if not already found
                        foundPath = newPathSegment;
                        found = true;
                        return;
                    }
                }
            }
        }

        if (deepSearch) {
            search(targetCollection, soughtValue, '', 0);
            return foundPath;
        } else {
            if (Array.isArray(targetCollection)) {
                let actualFromIndex = fromIndex < 0 ? targetCollection.length + fromIndex : fromIndex;
                if (actualFromIndex < 0) actualFromIndex = 0; // Ensure it's not negative after adjustment

                for (let i = Math.min(actualFromIndex, targetCollection.length - 1); i >= 0; --i) {
                    if (checkEquality(targetCollection[i], soughtValue)) {
                        return i;
                    }
                }
            }
            return -1;
        }
    };

    // Clone of _.object / _.toObject
    moduleScope.assembleObject = moduleScope.transformToObject = function(...sources) {
        const finalObject = {};

        if (sources.length === 1 && Array.isArray(sources[0])) {
            // Single array: ['one',1,'two',2]
            const sourceArr = sources[0];
            for (let i = 0; i < sourceArr.length; i += 2) {
                if (i + 1 < sourceArr.length) {
                    finalObject[sourceArr[i]] = sourceArr[i+1];
                }
            }
        } else if (sources.length === 2 && Array.isArray(sources[0]) && Array.isArray(sources[1])) {
            // Two arrays: ['one','two'], [1,2]
            const keys = sources[0];
            const values = sources[1];
            for (let i = 0; i < keys.length; ++i) {
                finalObject[keys[i]] = values[i];
            }
        } else {
            // Multiple arrays: ['one',1], ['two',2]
            for (let i = 0; i < sources.length; ++i) {
                const pair = sources[i];
                if (Array.isArray(pair) && pair.length >= 2) {
                    finalObject[pair[0]] = pair[1];
                }
            }
        }
        return finalObject;
    };

    // Clone of _.rest / _.tail
    moduleScope.getRemainingElements = moduleScope.getEndingSection = function(sourceArray, startIndex = 1, deepMode = false) {
        if (!Array.isArray(sourceArray)) return [];

        if (deepMode) {
            const flatItems = [];
            scanCollectionDeeply(sourceArray, (item, level) => {
                if (!Array.isArray(item) && !isSimpleObject(item)) {
                    flatItems.push(item);
                }
            }, true); // Fully flatten

            if (startIndex >= flatItems.length) {
                return [];
            }
            return flatItems.slice(startIndex);
        } else {
            if (startIndex >= sourceArray.length) {
                return [];
            }
            return sourceArray.slice(startIndex);
        }
    };

    // Clone of _.union
    moduleScope.mergeUnique = function(...inputArrays) {
        const uniqueValues = [];
        const seenValues = new Set();
        const seenComplex = [];

        for (let i = 0; i < inputArrays.length; ++i) {
            const currentArray = inputArrays[i];
            if (Array.isArray(currentArray)) {
                for (let j = 0; j < currentArray.length; ++j) {
                    const item = currentArray[j];
                    if (typeof item !== 'object' || item === null) {
                        if (!seenValues.has(item)) {
                            seenValues.add(item);
                            uniqueValues.push(item);
                        }
                    } else {
                        let alreadyPresent = false;
                        for (let k = 0; k < seenComplex.length; ++k) {
                            if (checkEquality(seenComplex[k], item)) {
                                alreadyPresent = true;
                                break;
                            }
                        }
                        if (!alreadyPresent) {
                            seenComplex.push(item);
                            uniqueValues.push(item);
                        }
                    }
                }
            }
        }
        return uniqueValues;
    };

    // Clone of _.uniq
    moduleScope.removeDuplicates = function(inputCollection, iteratorOrDeep = null, context = null) {
        const uniqueItems = [];
        const seenProcessedValues = new Set();
        const seenProcessedComplex = [];

        let applyIterator = null;
        let deepMode = false;

        if (typeof iteratorOrDeep === 'function') {
            applyIterator = iteratorOrDeep;
        } else if (typeof iteratorOrDeep === 'boolean' && iteratorOrDeep === true) {
            deepMode = true;
        }

        const itemsToEvaluate = [];
        if (deepMode) {
            scanCollectionDeeply(inputCollection, (item, level) => {
                if (!Array.isArray(item) && !isSimpleObject(item)) {
                    itemsToEvaluate.push(item);
                }
            }, true); // Fully flatten for deep mode
        } else if (Array.isArray(inputCollection)) {
            for (let i = 0; i < inputCollection.length; ++i) {
                itemsToEvaluate.push(inputCollection[i]);
            }
        } else if (isSimpleObject(inputCollection)) {
            for (const key in inputCollection) {
                if (Object.prototype.hasOwnProperty.call(inputCollection, key)) {
                    itemsToEvaluate.push(inputCollection[key]);
                }
            }
        }

        for (let i = 0; i < itemsToEvaluate.length; ++i) {
            const item = itemsToEvaluate[i];
            const processedItem = applyIterator ? applyIterator.call(context, item) : item;

            if (typeof processedItem !== 'object' || processedItem === null) {
                if (!seenProcessedValues.has(processedItem)) {
                    seenProcessedValues.add(processedItem);
                    uniqueItems.push(processedItem);
                }
            } else {
                let alreadySeen = false;
                for (let j = 0; j < seenProcessedComplex.length; ++j) {
                    if (checkEquality(seenProcessedComplex[j], processedItem)) {
                        alreadySeen = true;
                        break;
                    }
                }
                if (!alreadySeen) {
                    seenProcessedComplex.push(processedItem);
                    uniqueItems.push(processedItem);
                }
            }
        }
        return uniqueItems;
    };

    // Clone of _.without / _.exclude
    moduleScope.filterOutValues = moduleScope.removeSpecific = function(sourceArray, valuesToExclude, deepMode = false) {
        const result = [];
        const excludePrimitives = new Set();
        const excludeComplex = [];

        // Populate exclusion sets/arrays
        for (let i = 0; i < valuesToExclude.length; ++i) {
            const item = valuesToExclude[i];
            if (typeof item !== 'object' || item === null) {
                excludePrimitives.add(item);
            } else {
                excludeComplex.push(item);
            }
        }

        const itemsToProcess = [];
        if (deepMode) {
            scanCollectionDeeply(sourceArray, (item, level) => {
                if (!Array.isArray(item) && !isSimpleObject(item)) {
                    itemsToProcess.push(item);
                }
            }, true); // Fully flatten for deep mode
        } else {
            for (let i = 0; i < sourceArray.length; ++i) {
                itemsToProcess.push(sourceArray[i]);
            }
        }

        for (let i = 0; i < itemsToProcess.length; ++i) {
            const item = itemsToProcess[i];
            let shouldExclude = false;

            if (typeof item !== 'object' || item === null) {
                if (excludePrimitives.has(item)) {
                    shouldExclude = true;
                }
            } else {
                for (let j = 0; j < excludeComplex.length; ++j) {
                    if (checkEquality(excludeComplex[j], item)) {
                        shouldExclude = true;
                        break;
                    }
                }
            }

            if (!shouldExclude) {
                result.push(item);
            }
        }
        return result;
    };

    // Clone of _.zip
    moduleScope.interleaveCollections = function(...arraysToZip) {
        if (arraysToZip.length === 0) return [];
        const longestLength = Math.max(...arraysToZip.map(arr => Array.isArray(arr) ? arr.length : 0));
        const zippedResult = [];

        for (let i = 0; i < longestLength; ++i) {
            const currentTuple = [];
            for (let j = 0; j < arraysToZip.length; ++j) {
                if (Array.isArray(arraysToZip[j]) && i < arraysToZip[j].length) {
                    currentTuple.push(arraysToZip[j][i]);
                } else {
                    currentTuple.push(undefined);
                }
            }
            zippedResult.push(currentTuple);
        }
        return zippedResult;
    };


    // COLLECTIONS

    // Clone of _.add
    moduleScope.insertElement = function(targetCollection, insertionIndex, valueToInsert, deepMode = false) {
        let maxRecurDepth = deepMode === true ? Infinity : (typeof deepMode === 'number' ? deepMode : 0);

        function recursiveAdd(currentCollection, targetKey, value, currentRecurDepth) {
            if (currentCollection === null || typeof currentCollection !== 'object') {
                return;
            }

            if (maxRecurDepth > 0 && currentRecurDepth > maxRecurDepth) {
                return;
            }

            // Attempt to add at current level if key/index doesn't exist
            if (!Object.prototype.hasOwnProperty.call(currentCollection, targetKey)) {
                if (Array.isArray(currentCollection)) {
                    if (targetKey === currentCollection.length) { // Only add if it's the next available index
                        currentCollection.push(value);
                    }
                } else if (isSimpleObject(currentCollection)) {
                    currentCollection[targetKey] = value;
                }
            }

            // Recurse for deep
            if (maxRecurDepth > 0 && currentRecurDepth < maxRecurDepth) {
                const keysToIterate = Array.isArray(currentCollection) ? Array.from({length: currentCollection.length}, (_, i) => i) : Object.keys(currentCollection);
                for (let i = 0; i < keysToIterate.length; ++i) {
                    const key = keysToIterate[i];
                    const item = currentCollection[key];
                    if (Array.isArray(item) || isSimpleObject(item)) {
                        recursiveAdd(item, targetKey, value, currentRecurDepth + 1);
                    }
                }
            }
        }
        recursiveAdd(targetCollection, insertionIndex, valueToInsert, 0);
        return targetCollection; // Modifies in place
    };

    // Clone of _.all / _.every
    moduleScope.allPassTest = moduleScope.everyPassTest = function(collection, predicate, context, deepMode = false) {
        let allSatisfy = true;
        const maxScanDepth = deepMode === true ? Infinity : (typeof deepMode === 'number' ? deepMode : 0);

        function check(entity, currentLevel) {
            if (!allSatisfy) return; // Optimization: stop if one fails

            if (entity === null || typeof entity !== 'object') {
                return;
            }

            if (maxScanDepth > 0 && currentLevel > maxScanDepth) {
                return;
            }

            // Apply predicate to values at current level
            const keys = Array.isArray(entity) ? Array.from({length: entity.length}, (_, i) => i) : Object.keys(entity);
            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                const value = entity[key];
                if (!predicate.call(context, value)) {
                    allSatisfy = false;
                    return;
                }
            }

            // Recurse for nested arrays/objects
            if (maxScanDepth > 0 && currentLevel < maxScanDepth) {
                for (let i = 0; i < keys.length; ++i) {
                    const key = keys[i];
                    const value = entity[key];
                    if (Array.isArray(value) || isSimpleObject(value)) {
                        check(value, currentLevel + 1);
                        if (!allSatisfy) return;
                    }
                }
            }
        }

        check(collection, 0);
        return allSatisfy;
    };

    // Clone of _.any / _.some
    moduleScope.anyPassTest = moduleScope.somePassTest = function(collection, predicate, context, deepMode = false) {
        let anySatisfy = false;
        const maxScanDepth = deepMode === true ? Infinity : (typeof deepMode === 'number' ? deepMode : 0);

        function check(entity, currentLevel) {
            if (anySatisfy) return; // Optimization: stop if one passes

            if (entity === null || typeof entity !== 'object') {
                return;
            }

            if (maxScanDepth > 0 && currentLevel > maxScanDepth) {
                return;
            }

            // Apply predicate to values at current level
            const keys = Array.isArray(entity) ? Array.from({length: entity.length}, (_, i) => i) : Object.keys(entity);
            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                const value = entity[key];
                if (predicate.call(context, value)) {
                    anySatisfy = true;
                    return;
                }
            }

            // Recurse for nested arrays/objects
            if (maxScanDepth > 0 && currentLevel < maxScanDepth) {
                for (let i = 0; i < keys.length; ++i) {
                    const key = keys[i];
                    const value = entity[key];
                    if (Array.isArray(value) || isSimpleObject(value)) {
                        check(value, currentLevel + 1);
                        if (anySatisfy) return;
                    }
                }
            }
        }

        check(collection, 0);
        return anySatisfy;
    };

    // Clone of _.average
    moduleScope.calculateMean = function(inputCollection, transformationFn = null, deepMode = false) {
        let totalSum = 0;
        let valueCount = 0;

        function processNumericValue(val) {
            let processedVal = transformationFn ? transformationFn(val) : val;
            if (typeof processedVal === 'number' && !isNaN(processedVal)) {
                totalSum += processedVal;
                valueCount++;
            }
        }

        if (deepMode) {
            scanCollectionDeeply(inputCollection, (item, level) => {
                if (!Array.isArray(item) && !isSimpleObject(item)) { // Only process primitives
                    processNumericValue(item);
                }
            }, true); // Fully flatten for deep mode
        } else {
            const values = Array.isArray(inputCollection) ? inputCollection : Object.values(inputCollection);
            for (let i = 0; i < values.length; ++i) {
                processNumericValue(values[i]);
            }
        }

        return valueCount === 0 ? 0 : totalSum / valueCount;
    };

    // Clone of _.clear
    moduleScope.depleteCollection = function(targetCollection, deepMode = false) {
        if (targetCollection === null || typeof targetCollection !== 'object') {
            return targetCollection;
        }

        function clearNode(node) {
            if (Array.isArray(node)) {
                for (let i = 0; i < node.length; ++i) {
                    node[i] = undefined;
                }
            } else if (isSimpleObject(node)) {
                for (const key in node) {
                    if (Object.prototype.hasOwnProperty.call(node, key)) {
                        node[key] = undefined;
                    }
                }
            }
        }

        if (deepMode) {
            scanCollectionDeeply(targetCollection, (item, level) => {
                clearNode(item);
            }, true); // Fully deep clear
        } else {
            clearNode(targetCollection);
        }
        return targetCollection; // Modifies in place
    };

    // Clone of _.clone
    moduleScope.duplicateStructure = function(source, deepCopy = false) {
        if (!deepCopy) {
            if (Array.isArray(source)) {
                return Array.from(source);
            } else if (isSimpleObject(source)) {
                return Object.assign({}, source);
            }
            return source; // Return primitives as is
        } else {
            return createRecursiveCopy(source, Infinity, 0, new Map());
        }
    };

    // Clone of _.contains / _.inArray
    moduleScope.hasValue = moduleScope.checkInArray = function(collection, valueToFind, deepMode = false) {
        let found = false;

        function search(entity, targetValue, currentLevel) {
            if (found || entity === null || typeof entity !== 'object') {
                return;
            }

            const keys = Array.isArray(entity) ? Array.from({length: entity.length}, (_, i) => i) : Object.keys(entity);
            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                const item = entity[key];
                if (checkEquality(item, targetValue)) {
                    found = true;
                    return;
                }
                if (deepMode && (Array.isArray(item) || isSimpleObject(item))) {
                    search(item, targetValue, currentLevel + 1);
                    if (found) return;
                }
            }
        }

        if (deepMode) {
            search(collection, valueToFind, 0);
        } else {
            const values = Array.isArray(collection) ? collection : Object.values(collection);
            for (let i = 0; i < values.length; ++i) {
                if (checkEquality(values[i], valueToFind)) {
                    found = true;
                    break;
                }
            }
        }
        return found;
    };

    // Clone of _.count
    moduleScope.tallyMatches = function(collection, predicate, context, deepMode = false) {
        let matchCount = 0;

        function count(entity, currentLevel) {
            if (entity === null || typeof entity !== 'object') {
                return;
            }

            const keys = Array.isArray(entity) ? Array.from({length: entity.length}, (_, i) => i) : Object.keys(entity);
            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                const value = entity[key];
                if (predicate.call(context, value)) {
                    matchCount++;
                }
                if (deepMode && (Array.isArray(value) || isSimpleObject(value))) {
                    count(value, currentLevel + 1);
                }
            }
        }

        count(collection, 0);
        return matchCount;
    };

    // Clone of _.countBy
    moduleScope.groupAndCount = function(collection, classifierFn, context) {
        const counts = {};

        function processItem(item) {
            const key = classifierFn.call(context, item);
            counts[key] = (counts[key] || 0) + 1;
        }

        if (Array.isArray(collection)) {
            for (let i = 0; i < collection.length; ++i) {
                processItem(collection[i]);
            }
        } else if (isSimpleObject(collection)) {
            for (const key in collection) {
                if (Object.prototype.hasOwnProperty.call(collection, key)) {
                    processItem(collection[key]);
                }
            }
        }
        return counts;
    };

    // Clone of _.deep
    moduleScope.traverseDeep = function(optionsOrCollection, processingFn, maxDepth = Infinity, additionalArgs = [], noArrays = false, noObjects = false) {
        let targetCollection;
        let visitorFn;
        let depthParam;
        let extraArgs;
        let excludeArrays;
        let excludeObjects;

        if (isSimpleObject(optionsOrCollection) && optionsOrCollection.obj) {
            // Options object format: {obj: collection, fn: function, noArrays: bool, noObjects: bool, args: array, depth: number}
            targetCollection = optionsOrCollection.obj;
            visitorFn = optionsOrCollection.fn;
            excludeArrays = optionsOrCollection.noArrays || false;
            excludeObjects = optionsOrCollection.noObjects || false;
            extraArgs = optionsOrCollection.args || [];
            depthParam = optionsOrCollection.depth || Infinity;
        } else {
            // Direct arguments format: collection, function, depth, args
            targetCollection = optionsOrCollection;
            visitorFn = processingFn;
            depthParam = maxDepth;
            extraArgs = additionalArgs;
            excludeArrays = noArrays;
            excludeObjects = noObjects;
        }

        // Custom walker to match _.deep's callback signature (d, i, v, r, a)
        function specificWalker(currentEntity, currentLevel) {
            if (currentEntity === null || typeof currentEntity !== 'object') {
                return;
            }
            
            const currentKeys = Array.isArray(currentEntity) ? Array.from({length: currentEntity.length}, (_, i) => i) : Object.keys(currentEntity);
            for (let i = 0; i < currentKeys.length; ++i) {
                const key = currentKeys[i];
                const value = currentEntity[key];
                visitorFn(currentLevel, key, value, currentEntity, ...extraArgs); // Call with specific arguments

                const isValueArray = Array.isArray(value);
                const isValueObject = typeof value === 'object' && value !== null && !isValueArray;

                if ((isValueArray && !excludeArrays) || (isValueObject && !excludeObjects)) {
                    if (depthParam === true || (typeof depthParam === 'number' && currentLevel < depthParam)) {
                        // Recurse, but only if the nested item itself is an array/object
                        specificWalker(value, currentLevel + 1);
                    }
                }
            }
        }
        specificWalker(targetCollection, 0);
    };

    // Clone of _.each / _.forEach
    moduleScope.iterateElements = moduleScope.forEveryItem = function(collection, iterator, context) {
        if (Array.isArray(collection)) {
            for (let i = 0; i < collection.length; ++i) {
                iterator.call(context, collection[i], i, collection);
            }
        } else if (isSimpleObject(collection)) {
            for (const key in collection) {
                if (Object.prototype.hasOwnProperty.call(collection, key)) {
                    iterator.call(context, collection[key], key, collection);
                }
            }
        }
    };

    // Clone of _.empty (same as clearContents)
    moduleScope.clearContents = function(targetCollection, deepMode = false) {
        if (targetCollection === null || typeof targetCollection !== 'object') {
            return targetCollection;
        }

        function clearNode(node) {
            if (Array.isArray(node)) {
                for (let i = 0; i < node.length; ++i) {
                    node[i] = undefined;
                }
            } else if (isSimpleObject(node)) {
                for (const key in node) {
                    if (Object.prototype.hasOwnProperty.call(node, key)) {
                        node[key] = undefined;
                    }
                }
            }
        }

        if (deepMode) {
            scanCollectionDeeply(targetCollection, (item, level) => {
                clearNode(item);
            }, true);
        } else {
            clearNode(targetCollection);
        }
        return targetCollection;
    };

    // Clone of _.filter
    moduleScope.selectMatching = function(collection, predicate, context) {
        const result = [];
        const values = Array.isArray(collection) ? collection : Object.values(collection);
        for (let i = 0; i < values.length; ++i) {
            const value = values[i];
            if (predicate.call(context, value)) {
                result.push(value);
            }
        }
        return result;
    };

    // Clone of _.find
    moduleScope.locateFirst = function(collection, predicate, deepMode = false) {
        let foundValue = undefined;
        let isFound = false;

        function search(entity, currentLevel) {
            if (isFound || entity === null || typeof entity !== 'object') {
                return;
            }

            const keys = Array.isArray(entity) ? Array.from({length: entity.length}, (_, i) => i) : Object.keys(entity);
            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                const value = entity[key];
                if (predicate.call(null, value)) { // Context is null in _.find tests
                    foundValue = value;
                    isFound = true;
                    return;
                }
                if (deepMode && (Array.isArray(value) || isSimpleObject(value))) {
                    search(value, currentLevel + 1);
                    if (isFound) return;
                }
            }
        }

        search(collection, 0);
        return foundValue;
    };

    // Clone of _.findKey
    moduleScope.locateFirstKey = function(collection, predicate, deepMode = false) {
        let foundKeyPath = undefined;
        let isFound = false;

        function search(entity, currentPath, currentLevel) {
            if (isFound || entity === null || typeof entity !== 'object') {
                return;
            }

            const keys = Array.isArray(entity) ? Array.from({length: entity.length}, (_, i) => i) : Object.keys(entity);
            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                const value = entity[key];
                const pathSegment = currentPath ? `${currentPath}.${key}` : String(key);

                if (predicate.call(null, value)) { // Context is null in _.findKey tests
                    foundKeyPath = pathSegment;
                    isFound = true;
                    return;
                }
                if (deepMode && (Array.isArray(value) || isSimpleObject(value))) {
                    search(value, pathSegment, currentLevel + 1);
                    if (isFound) return;
                }
            }
        }

        search(collection, '', 0);
        return foundKeyPath;
    };

    // Clone of _.flatten
    moduleScope.levelOut = function(inputCollection, depthLimit = Infinity) {
        const flattened = [];

        function recursiveFlatten(item, currentDepth) {
            if (depthLimit !== true && typeof depthLimit === 'number' && currentDepth > depthLimit) {
                flattened.push(item);
                return;
            }

            if (Array.isArray(item)) {
                for (let i = 0; i < item.length; ++i) {
                    recursiveFlatten(item[i], currentDepth + 1);
                }
            } else if (isSimpleObject(item)) {
                for (const key in item) {
                    if (Object.prototype.hasOwnProperty.call(item, key)) {
                        recursiveFlatten(item[key], currentDepth + 1);
                    }
                }
            } else {
                flattened.push(item);
            }
        }
        recursiveFlatten(inputCollection, 0);
        return flattened;
    };

    // Clone of _.groupBy
    moduleScope.categorizeBy = function(collection, classifier, context) {
        const groups = {};

        function processItem(item) {
            let key;
            if (typeof classifier === 'function') {
                key = classifier.call(context, item);
            } else if (typeof classifier === 'string') {
                key = item[classifier];
            } else {
                key = item; // Default to grouping by item itself
            }

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        }

        if (Array.isArray(collection)) {
            for (let i = 0; i < collection.length; ++i) {
                processItem(collection[i]);
            }
        } else if (isSimpleObject(collection)) {
            for (const key in collection) {
                if (Object.prototype.hasOwnProperty.call(collection, key)) {
                    processItem(collection[key]);
                }
            }
        }
        return groups;
    };

    // Clone of _.groupsOf
    moduleScope.chunkItems = function(collection, groupSize, paddingValue = undefined) {
        const resultChunks = [];
        const items = Array.isArray(collection) ? collection : Object.values(collection);

        for (let i = 0; i < items.length; i += groupSize) {
            const chunk = items.slice(i, i + groupSize);
            while (chunk.length < groupSize && paddingValue !== undefined) {
                chunk.push(paddingValue);
            }
            resultChunks.push(chunk);
        }
        return resultChunks;
    };

    // Clone of _.has / _.keyExists
    moduleScope.possessesKey = moduleScope.keyPresent = function(targetCollection, searchKey, deepMode = false) {
        let found = false;

        function search(entity, currentLevel) {
            if (found || entity === null || typeof entity !== 'object') {
                return;
            }

            if (Object.prototype.hasOwnProperty.call(entity, searchKey)) {
                found = true;
                return;
            }
            
            if (deepMode) {
                const keys = Array.isArray(entity) ? Array.from({length: entity.length}, (_, i) => i) : Object.keys(entity);
                for (let i = 0; i < keys.length; ++i) {
                    const key = keys[i];
                    const value = entity[key];
                    if (Array.isArray(value) || isSimpleObject(value)) {
                        search(value, currentLevel + 1);
                        if (found) return;
                    }
                }
            }
        }

        search(targetCollection, 0);
        return found;
    };

    // Clone of _.invert
    moduleScope.flipKeyValuePairs = function(inputObject) {
        const inverted = {};
        if (Array.isArray(inputObject)) {
            for (let i = 0; i < inputObject.length; ++i) {
                inverted[inputObject[i]] = String(i); // Convert index to string key
            }
        } else if (isSimpleObject(inputObject)) {
            for (const key in inputObject) {
                if (Object.prototype.hasOwnProperty.call(inputObject, key)) {
                    inverted[inputObject[key]] = key;
                }
            }
        }
        return inverted;
    };

    // Clone of _.invoke
    moduleScope.executeMethod = function(collection, methodFn, argsArray = []) {
        const results = [];
        const values = Array.isArray(collection) ? collection : Object.values(collection);

        for (let i = 0; i < values.length; ++i) {
            const item = values[i];
            results.push(methodFn.call(null, item, ...argsArray));
        }
        return results;
    };

    // Clone of _.isEmpty
    moduleScope.isCollectionEmpty = function(input) {
        if (input === null || typeof input === 'undefined') {
            return true;
        }
        if (Array.isArray(input)) {
            return input.length === 0;
        }
        if (isSimpleObject(input)) {
            return Object.keys(input).length === 0;
        }
        return false; // Non-empty for non-collection types or non-plain objects
    };

    // Clone of _.isUnique
    moduleScope.checkUniqueness = function(collection, valueToCheck) {
        let count = 0;
        const values = Array.isArray(collection) ? collection : Object.values(collection);

        for (let i = 0; i < values.length; ++i) {
            if (checkEquality(values[i], valueToCheck)) {
                count++;
            }
            if (count > 1) {
                return false; // Not unique if found more than once
            }
        }
        return count === 1; // True only if found exactly once
    };

    // Helper for `_.isNumber` used in `_.all` and `_.any` tests
    moduleScope.isNumberValue = function(val) { return typeof val === 'number'; };

    return moduleScope;
})();