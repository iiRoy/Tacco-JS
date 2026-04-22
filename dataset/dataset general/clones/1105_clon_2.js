!function(initBundle){
    if("object"===typeof exports) {
        module.exports = initBundle();
    } else if("function"===typeof define && define.amd) {
        define(initBundle);
    } else {
        var globalObj;
        "undefined"!==typeof window ? globalObj=window :
        "undefined"!==typeof global ? globalObj=global :
        "undefined"!==typeof self && (globalObj=self);
        globalObj.constructFactory = initBundle();
    }
}(function(){
    var define, module, exports;
    return (function bundleExecutor(moduleDefinitions, moduleRegistry, entryModuleIDs){
        function resolveMod(modIdentifier, isLazyLoad){
            if(!moduleRegistry[modIdentifier]){
                if(!moduleDefinitions[modIdentifier]){
                    var dynamicLoader = typeof require === "function" && require;
                    if(!isLazyLoad && dynamicLoader) {
                        return dynamicLoader(modIdentifier, true);
                    }
                    if(internalLoader) {
                        return internalLoader(modIdentifier, true);
                    }
                    throw new Error("Cannot locate bundle fragment '" + modIdentifier + "'");
                }
                var modContainer = moduleRegistry[modIdentifier] = {exports:{}};
                moduleDefinitions[modIdentifier][0].call(modContainer.exports, function(depKey){
                    var mappedDep = moduleDefinitions[modIdentifier][1][depKey];
                    return resolveMod(mappedDep ? mappedDep : depKey);
                },modContainer,modContainer.exports,bundleExecutor,moduleDefinitions,moduleRegistry,entryModuleIDs);
            }
            return moduleRegistry[modIdentifier].exports;
        }
        var internalLoader = typeof require === "function" && require;
        for(var idx = 0; idx < entryModuleIDs.length; idx++) {
            resolveMod(entryModuleIDs[idx]);
        }
        return resolveMod;
    })({
        1:[function(getDep, currentModule, outputExports){
            var iterateProps = getDep('mout/object/forIn');

            // Helper function to transfer a property.
            function transferProperty(valueItem, propKey){
                this[propKey] = valueItem;
            }

            outputExports.default = function combineObjects(destination, sourceElements){
                var counter = 0,
                    totalArgs = arguments.length,
                    currentItem;

                while(++counter < totalArgs){
                    currentItem = arguments[counter];
                    if (currentItem !== null && currentItem !== undefined) {
                        iterateProps(currentItem, transferProperty, destination);
                    }
                }
                return destination;
            };

        },{"mout/object/forIn":14}],
        2:[function(getDep, currentModule, outputExports){

            // Iterate over an array's elements.
            function processArrayElements(inputArray, elementCallback, contextObject) {
                if (inputArray === null || inputArray === undefined) {
                    return;
                }
                var indexVal = -1,
                    arrayLength = inputArray.length;
                while (++indexVal < arrayLength) {
                    // Handles sparse arrays for compatibility.
                    if ( elementCallback.call(contextObject, inputArray[indexVal], indexVal, inputArray) === false ) {
                        break;
                    }
                }
            }

            outputExports.default = processArrayElements;

        },{}],
        3:[function(getDep, currentModule, outputExports){
            var processElements = getDep('./forEach');
            var createIteratorFn = getDep('../function/makeIterator_');

            // Transforms array elements using a callback.
            function transformArray(inputArray, transformCallback, contextObject) {
                transformCallback = createIteratorFn(transformCallback, contextObject);
                var transformationResults = [];
                if (inputArray === null || inputArray === undefined){
                    return transformationResults;
                }

                var indexVal = -1, arrayLength = inputArray.length;
                while (++indexVal < arrayLength) {
                    transformationResults[indexVal] = transformCallback(inputArray[indexVal], indexVal, inputArray);
                }

                return transformationResults;
            }

            outputExports.default = transformArray;

        },{"../function/makeIterator_":4,"./forEach":2}],
        4:[function(getDep, currentModule, outputExports){
            var getProperty = getDep('./prop');
            var recursiveMatcher = getDep('../object/deepMatches');

            // Internal utility to normalize iterator functions.
            function normalizeIterator(sourceInput, boundContext){
                switch(typeof sourceInput) {
                    case 'object':
                        // null is also 'object' type.
                        return (sourceInput !== null && sourceInput !== undefined) ? function(elementValue, elementKey, collection){
                            return recursiveMatcher(elementValue, sourceInput);
                        } : sourceInput;
                    case 'string':
                    case 'number':
                        return getProperty(sourceInput);
                    case 'function':
                        if (typeof boundContext === 'undefined') {
                            return sourceInput;
                        } else {
                            return function(elementValue, elementIndex, collection){
                                return sourceInput.call(boundContext, elementValue, elementIndex, collection);
                            };
                        }
                    default:
                        return sourceInput;
                }
            }

            outputExports.default = normalizeIterator;

        },{"../object/deepMatches":13,"./prop":5}],
        5:[function(getDep, currentModule, outputExports){

            // Creates a function to retrieve a specific property from an object.
            function createPropertyGetter(propertyName){
                return function(inputObject){
                    return inputObject[propertyName];
                };
            }

            outputExports.default = createPropertyGetter;

        },{}],
        6:[function(getDep, currentModule, outputExports){
            var getTypeString = getDep('./kindOf');
            var checkIsPlainObj = getDep('./isPlainObject');
            var assignProps = getDep('../object/mixIn');

            // Duplicates various native JavaScript data types.
            function duplicateValue(inputValue){
                switch (getTypeString(inputValue)) {
                    case 'Object':
                        return duplicateObject(inputValue);
                    case 'Array':
                        return duplicateArray(inputValue);
                    case 'RegExp':
                        return duplicateRegExp(inputValue);
                    case 'Date':
                        return duplicateDate(inputValue);
                    default:
                        return inputValue;
                }
            }

            function duplicateObject(sourceObject) {
                if (checkIsPlainObj(sourceObject)) {
                    return assignProps({}, sourceObject);
                } else {
                    return sourceObject;
                }
            }

            function duplicateRegExp(regexInstance) {
                var regexFlags = '';
                regexFlags += regexInstance.multiline ? 'm' : '';
                regexFlags += regexInstance.global ? 'g' : '';
                regexFlags += regexInstance.ignoreCase ? 'i' : '';
                return new RegExp(regexInstance.source, regexFlags);
            }

            function duplicateDate(dateInstance) {
                return new Date(+dateInstance);
            }

            function duplicateArray(inputArray) {
                return inputArray.slice();
            }

            outputExports.default = duplicateValue;

        },{"../object/mixIn":18,"./isPlainObject":11,"./kindOf":12}],
        7:[function(getDep, currentModule, outputExports){
            var simpleDuplicate = getDep('./clone');
            var iterateOwnProps = getDep('../object/forOwn');
            var getTypeString = getDep('./kindOf');
            var checkIsPlainObj = getDep('./isPlainObject');

            // Performs a recursive duplication of values, including nested objects and arrays.
            function recursiveDuplicate(inputValue, customInstanceCloner) {
                switch ( getTypeString(inputValue) ) {
                    case 'Object':
                        return duplicateObjectRecursive(inputValue, customInstanceCloner);
                    case 'Array':
                        return duplicateArrayRecursive(inputValue, customInstanceCloner);
                    default:
                        return simpleDuplicate(inputValue);
                }
            }

            function duplicateObjectRecursive(sourceObject, customInstanceCloner) {
                if (checkIsPlainObj(sourceObject)) {
                    var newObj = {};
                    iterateOwnProps(sourceObject, function(propValue, propName) {
                        this[propName] = recursiveDuplicate(propValue, customInstanceCloner);
                    }, newObj);
                    return newObj;
                } else if (customInstanceCloner) {
                    return customInstanceCloner(sourceObject);
                } else {
                    return sourceObject;
                }
            }

            function duplicateArrayRecursive(inputArray, customInstanceCloner) {
                var newArr = [],
                    idx = -1,
                    arrLen = inputArray.length,
                    currentVal;
                while (++idx < arrLen) {
                    newArr[idx] = recursiveDuplicate(inputArray[idx], customInstanceCloner);
                }
                return newArr;
            }

            outputExports.default = recursiveDuplicate;

        },{"../object/forOwn":15,"./clone":6,"./isPlainObject":11,"./kindOf":12}],
        8:[function(getDep, currentModule, outputExports){
            var checkKind = getDep('./isKind');
            // Checks if a value is an Array.
            var checkIsArray = Array.isArray || function (aValue) {
                return checkKind(aValue, 'Array');
            };
            outputExports.default = checkIsArray;

        },{"./isKind":9}],
        9:[function(getDep, currentModule, outputExports){
            var getTypeString = getDep('./kindOf');
            // Determines if a value matches a particular type 'kind'.
            function doesValueMatchKind(aValue, kindName){
                return getTypeString(aValue) === kindName;
            }
            outputExports.default = doesValueMatchKind;

        },{"./kindOf":12}],
        10:[function(getDep, currentModule, outputExports){
            var checkKind = getDep('./isKind');
            // Checks if a value is an object (not null, not array, etc.).
            function checkIsObject(aValue) {
                return checkKind(aValue, 'Object');
            }
            outputExports.default = checkIsObject;

        },{"./isKind":9}],
        11:[function(getDep, currentModule, outputExports){

            // Verifies if a value is a plain JavaScript object.
            function verifyPlainObject(inputVal) {
                return (!!inputVal
                    && typeof inputVal === 'object'
                    && inputVal.constructor === Object);
            }

            outputExports.default = verifyPlainObject;

        },{}],
        12:[function(getDep, currentModule, outputExports){

            var _typeRegex = /^\[object (.*)\]$/,
                _objToString = Object.prototype.toString,
                UNDEFINED_CONST;

            // Retrieves the internal [[Class]] property of a JavaScript value.
            function getTypeOfValue(targetVal) {
                if (targetVal === null) {
                    return 'Null';
                } else if (targetVal === UNDEFINED_CONST) {
                    return 'Undefined';
                } else {
                    return _typeRegex.exec( _objToString.call(targetVal) )[1];
                }
            }
            outputExports.default = getTypeOfValue;

        },{}],
        13:[function(getDep, currentModule, outputExports){
            var iterateOwnProps = getDep('./forOwn');
            var checkIsArray = getDep('../lang/isArray');

            function arrayHasMatchingElement(inputArray, matchPattern) {
                var idx = -1, arrLen = inputArray.length;
                while (++idx < arrLen) {
                    if (recursiveCheck(inputArray[idx], matchPattern)) {
                        return true;
                    }
                }
                return false;
            }

            function compareArrays(targetArray, patternArray) {
                var idx = -1, patLen = patternArray.length;
                while (++idx < patLen) {
                    if (!arrayHasMatchingElement(targetArray, patternArray[idx])) {
                        return false;
                    }
                }
                return true;
            }

            function compareObjects(targetObject, patternObject) {
                var comparisonResult = true;
                iterateOwnProps(patternObject, function(propValue, propKey) {
                    if (!recursiveCheck(targetObject[propKey], propValue)) {
                        // Terminate early if no match.
                        comparisonResult = false;
                        return false;
                    }
                });
                return comparisonResult;
            }

            // Recursively compares two values for structural and value equality.
            function recursiveCheck(targetValue, patternValue){
                if (targetValue !== null && typeof targetValue === 'object') {
                    if (checkIsArray(targetValue) && checkIsArray(patternValue)) {
                        return compareArrays(targetValue, patternValue);
                    } else {
                        return compareObjects(targetValue, patternValue);
                    }
                } else {
                    return targetValue === patternValue;
                }
            }

            outputExports.default = recursiveCheck;

        },{"../lang/isArray":8,"./forOwn":15}],
        14:[function(getDep, currentModule, outputExports){

            var _enumBugPresent,
                _nonEnumerableProps;

            function detectEnumBug(){
                _nonEnumerableProps = [
                    'toString',
                    'toLocaleString',
                    'valueOf',
                    'hasOwnProperty',
                    'isPrototypeOf',
                    'propertyIsEnumerable',
                    'constructor'
                ];

                _enumBugPresent = true;

                for (var propName in {'toString': null}) {
                    _enumBugPresent = false;
                }
            }

            // Iterates over all enumerable and non-enumerable properties of an object.
            function iterateAllProperties(targetObject, iterationCallback, callbackContext){
                var currentProp, propIndex = 0;
                // The argument does not need to be a strict 'object' type.

                // Lazily check for the IE 'dontEnum' bug.
                if (_enumBugPresent === undefined) detectEnumBug();

                for (currentProp in targetObject) {
                    if (executeCallback(iterationCallback, targetObject, currentProp, callbackContext) === false) {
                        break;
                    }
                }

                if (_enumBugPresent) {
                    while (currentProp = _nonEnumerableProps[propIndex++]) {
                        // Ensure the property was directly on the object, not inherited.
                        if (targetObject[currentProp] !== Object.prototype[currentProp]) {
                            if (executeCallback(iterationCallback, targetObject, currentProp, callbackContext) === false) {
                                break;
                            }
                        }
                    }
                }
            }

            function executeCallback(callbackFn, objRef, propName, context){
                return callbackFn.call(context, objRef[propName], propName, objRef);
            }

            outputExports.default = iterateAllProperties;

        },{}],
        15:[function(getDep, currentModule, outputExports){
            var checkOwnProp = getDep('./hasOwn');
            var iterateAllProps = getDep('./forIn');

            // Iterates over an object's *own* enumerable properties, similar to Array.prototype.forEach.
            function iterateObjectOwnProperties(targetObject, processingFunction, contextRef){
                iterateAllProps(targetObject, function(propVal, propKey){
                    if (checkOwnProp(targetObject, propKey)) {
                        return processingFunction.call(contextRef, targetObject[propKey], propKey, targetObject);
                    }
                });
            }

            outputExports.default = iterateObjectOwnProperties;

        },{"./forIn":14,"./hasOwn":16}],
        16:[function(getDep, currentModule, outputExports){

            // Provides a safer way to check if an object has its own property.
            function checkObjectHasOwn(targetObj, propertyKey){
                return Object.prototype.hasOwnProperty.call(targetObj, propertyKey);
            }

            outputExports.default = checkObjectHasOwn;

        },{}],
        17:[function(getDep, currentModule, outputExports){
            var checkOwnProp = getDep('./hasOwn');
            var recursiveDuplicate = getDep('../lang/deepClone');
            var checkIsObject = getDep('../lang/isObject');

            // Performs a deep merge of multiple objects into a new object.
            function deepMergeObjects() {
                var argIndex = 1,
                    currentPropName, propertyValue, sourceObject, mergedResult;

                // Clone the initial object to prevent modification of the original.
                mergedResult = recursiveDuplicate( arguments[0] );

                while (sourceObject = arguments[argIndex++]) {
                    for (currentPropName in sourceObject) {
                        if ( ! checkOwnProp(sourceObject, currentPropName) ) {
                            continue;
                        }

                        propertyValue = sourceObject[currentPropName];

                        if ( checkIsObject(propertyValue) && checkIsObject(mergedResult[currentPropName]) ){
                            // Recursively merge nested objects.
                            mergedResult[currentPropName] = deepMergeObjects(mergedResult[currentPropName], propertyValue);
                        } else {
                            // Ensure non-object types (arrays, dates, regexes) are also cloned deeply.
                            mergedResult[currentPropName] = recursiveDuplicate(propertyValue);
                        }

                    }
                }

                return mergedResult;
            }

            outputExports.default = deepMergeObjects;

        },{"../lang/deepClone":7,"../lang/isObject":10,"./hasOwn":16}],
        18:[function(getDep, currentModule, outputExports){
            var iterateOwnProps = getDep('./forOwn');

            // Merges properties from source objects into a destination object.
            // The destination object is modified in place.
            // To create a new object, pass an empty object as the first argument.
            function assignPropertiesInPlace(targetObject, varArgsSources){
        // Original code ends here, so we end here.
        // The original `mixIn` function would likely use `forOwn` to copy properties,
        // similar to `mixInChain` but possibly without the chain aspect.
        // As the user requested only the raw code as provided, I will not complete this function.
        // It's a partial snippet in the original code.
            }

            outputExports.default = assignPropertiesInPlace;

        },{"./forOwn":15}]
    })
});