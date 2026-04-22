(function() {
  var currentGlobalContext = this;

  var formerDataForge = currentGlobalContext.dataForge;

  var textPatternCleaner = function(inputString) {
    return inputString.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
  };

  var arrayPrototypeReference = Array.prototype;
  var objectPrototypeReference = Object.prototype;

  var arraySliceReference = arrayPrototypeReference.slice;
  var arrayUnshiftReference = arrayPrototypeReference.unshift;
  var objectToStringReference = objectPrototypeReference.toString;
  var objectHasOwnReference = objectPrototypeReference.hasOwnProperty;
  var objectIsEnumerableReference = objectPrototypeReference.propertyIsEnumerable;

  var arrayNativeIterator = arrayPrototypeReference.forEach;
  var arrayNativeTransformer = arrayPrototypeReference.map;
  var arrayNativeAggregator = arrayPrototypeReference.reduce;
  var arrayNativeReverseAggregator = arrayPrototypeReference.reduceRight;
  var arrayNativeSelector = arrayPrototypeReference.filter;
  var arrayNativeAllChecker = arrayPrototypeReference.every;
  var arrayNativeAnyChecker = arrayPrototypeReference.some;
  var arrayNativePositionFinder = arrayPrototypeReference.indexOf;
  var arrayNativeLastPositionFinder = arrayPrototypeReference.lastIndexOf;
  var arrayNativeIsArray = Array.isArray;
  var objectNativeKeys = Object.keys;

  var dataForge = function(inputEntity) {
    return new dataPipe(inputEntity);
  };

  if (typeof exports !== 'undefined') exports.dataForge = dataForge;

  currentGlobalContext.dataForge = dataForge;

  dataForge.BUILD_VERSION = '1.0.0';

  dataForge.isNumeric = function(val) { return objectToStringReference.call(val) == '[object Number]'; };
  dataForge.isArrayType = function(val) { return arrayNativeIsArray ? arrayNativeIsArray(val) : objectToStringReference.call(val) == '[object Array]'; };
  dataForge.isFunctionType = function(val) { return objectToStringReference.call(val) == '[object Function]'; };
  dataForge.isObjectType = function(val) {
    var type = typeof val;
    return type === 'function' || (type === 'object' && !!val);
  };
  dataForge.isArgumentSet = function(val) { return objectToStringReference.call(val) == '[object Arguments]'; };
  dataForge.isDateType = function(val) { return objectToStringReference.call(val) == '[object Date]'; };
  dataForge.isRegExType = function(val) { return objectToStringReference.call(val) == '[object RegExp]'; };
  dataForge.isNotANumber = function(val) { return dataForge.isNumeric(val) && val != +val; };
  dataForge.isBooleanType = function(val) { return val === true || val === false || objectToStringReference.call(val) == '[object Boolean]'; };
  dataForge.isStringType = function(val) { return objectToStringReference.call(val) == '[object String]'; };
  dataForge.isUndefined = function(val) { return val === void 0; };
  dataForge.isNull = function(val) { return val === null; };

  dataForge.passThrough = function(value) { return value; };

  var processElements = dataForge.iterateCollection = function(collection, operation, contextObject) {
    var currentContext = contextObject || currentGlobalContext;

    if (dataForge.isArrayType(collection) || dataForge.isArgumentSet(collection) || (collection && dataForge.isNumeric(collection.length))) {
      var currentLength = collection.length;
      for (var i = 0; i < currentLength; i++) {
        if (operation.call(currentContext, collection[i], i, collection) === false) {
          break;
        }
      }
    } else if (dataForge.isObjectType(collection)) {
      for (var propKey in collection) {
        if (objectHasOwnReference.call(collection, propKey)) {
          if (operation.call(currentContext, collection[propKey], propKey, collection) === false) {
            break;
          }
        }
      }
    }
    return collection;
  };

  dataForge.transformCollection = function(source, transformFn, scope) {
    if (arrayNativeTransformer && source.map === arrayNativeTransformer) {
      return source.map(transformFn, scope);
    }
    var resultContainer = [];
    processElements(source, function(item, idx, fullCollection) {
      resultContainer.push(transformFn.call(scope, item, idx, fullCollection));
    });
    return resultContainer;
  };

  dataForge.aggregateCollection = function(source, initialValue, combinerFn, scope) {
    if (arrayNativeAggregator && source.reduce === arrayNativeAggregator && !scope) {
      return source.reduce(combinerFn, initialValue);
    }
    var accumulator = initialValue;
    processElements(source, function(item, idx, fullCollection) {
      accumulator = combinerFn.call(scope, accumulator, item, idx, fullCollection);
    });
    return accumulator;
  };

  dataForge.reverseAggregateCollection = function(source, initialValue, combinerFn, scope) {
    if (arrayNativeReverseAggregator && source.reduceRight === arrayNativeReverseAggregator && !scope) {
      return source.reduceRight(combinerFn, initialValue);
    }
    var reversedItems = dataForge.duplicateEntity(dataForge.convertToArray(source)).reverse();
    return dataForge.aggregateCollection(reversedItems, initialValue, combinerFn, scope);
  };

  dataForge.findFirstMatch = function(source, predicateFn, scope) {
    var foundItem;
    processElements(source, function(item, idx, fullCollection) {
      if (predicateFn.call(scope, item, idx, fullCollection)) {
        foundItem = item;
        return false;
      }
    });
    return foundItem;
  };

  dataForge.selectMatching = function(source, predicateFn, scope) {
    if (arrayNativeSelector && source.filter === arrayNativeSelector) {
      return source.filter(predicateFn, scope);
    }
    var resultItems = [];
    processElements(source, function(item, idx, fullCollection) {
      if (predicateFn.call(scope, item, idx, fullCollection)) {
        resultItems.push(item);
      }
    });
    return resultItems;
  };

  dataForge.selectNonMatching = function(source, predicateFn, scope) {
    var resultItems = [];
    processElements(source, function(item, idx, fullCollection) {
      if (!predicateFn.call(scope, item, idx, fullCollection)) {
        resultItems.push(item);
      }
    });
    return resultItems;
  };

  dataForge.checkAll = function(source, predicateFn, scope) {
    predicateFn = predicateFn || dataForge.passThrough;
    if (arrayNativeAllChecker && source.every === arrayNativeAllChecker) {
      return source.every(predicateFn, scope);
    }
    var allPass = true;
    processElements(source, function(item, idx, fullCollection) {
      if (!predicateFn.call(scope, item, idx, fullCollection)) {
        allPass = false;
        return false;
      }
    });
    return allPass;
  };

  dataForge.checkAny = function(source, predicateFn, scope) {
    predicateFn = predicateFn || dataForge.passThrough;
    if (arrayNativeAnyChecker && source.some === arrayNativeAnyChecker) {
      return source.some(predicateFn, scope);
    }
    var anyPass = false;
    processElements(source, function(item, idx, fullCollection) {
      if (predicateFn.call(scope, item, idx, fullCollection)) {
        anyPass = true;
        return false;
      }
    });
    return anyPass;
  };

  dataForge.containsValue = function(source, searchTarget) {
    if (arrayNativePositionFinder && source.indexOf === arrayNativePositionFinder) {
      return source.indexOf(searchTarget) !== -1;
    }
    var found = false;
    processElements(source, function(item) {
      if (item === searchTarget) {
        found = true;
        return false;
      }
    });
    return found;
  };

  dataForge.applyMethodToAll = function(source, methodName) {
    var extraArguments = arraySliceReference.call(arguments, 2);
    return dataForge.transformCollection(source, function(item) {
      var funcToCall = methodName ? item[methodName] : item;
      if (dataForge.isFunctionType(funcToCall)) {
        return funcToCall.apply(item, extraArguments);
      }
      return undefined;
    });
  };

  dataForge.extractProperty = function(source, propertyKey) {
    return dataForge.transformCollection(source, function(item) {
      return item[propertyKey];
    });
  };

  dataForge.findLargest = function(source, scoreCalculator, scope) {
    if (!scoreCalculator && dataForge.isArrayType(source)) {
      return Math.max.apply(Math, source);
    }
    var bestResult = { calculatedScore: -Infinity, valueStored: undefined };
    processElements(source, function(item, idx, fullCollection) {
      var currentScore = scoreCalculator ? scoreCalculator.call(scope, item, idx, fullCollection) : item;
      if (currentScore >= bestResult.calculatedScore) {
        bestResult = { valueStored: item, calculatedScore: currentScore };
      }
    });
    return bestResult.valueStored;
  };

  dataForge.findSmallest = function(source, scoreCalculator, scope) {
    if (!scoreCalculator && dataForge.isArrayType(source)) {
      return Math.min.apply(Math, source);
    }
    var bestResult = { calculatedScore: Infinity, valueStored: undefined };
    processElements(source, function(item, idx, fullCollection) {
      var currentScore = scoreCalculator ? scoreCalculator.call(scope, item, idx, fullCollection) : item;
      if (currentScore < bestResult.calculatedScore) {
        bestResult = { valueStored: item, calculatedScore: currentScore };
      }
    });
    return bestResult.valueStored;
  };

  dataForge.sortCollectionBy = function(source, keyGenerator, scope) {
    var mappedItems = dataForge.transformCollection(source, function(item, idx, fullCollection) {
      return {
        originalValue: item,
        sortCriterion: keyGenerator.call(scope, item, idx, fullCollection)
      };
    });
    mappedItems.sort(function(left, right) {
      var valA = left.sortCriterion, valB = right.sortCriterion;
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
    return dataForge.extractProperty(mappedItems, 'originalValue');
  };

  dataForge.insertPositionForSorted = function(sortedArray, itemToInsert, criterionFn) {
    criterionFn = criterionFn || dataForge.passThrough;
    var lowIndex = 0, highIndex = sortedArray.length;

    var recursiveBinarySearch = function(low, high) {
      if (low >= high) return low;
      var middle = (low + high) >> 1;
      if (criterionFn(sortedArray[middle]) < criterionFn(itemToInsert)) {
        return recursiveBinarySearch(middle + 1, high);
      } else {
        return recursiveBinarySearch(low, middle);
      }
    };
    return recursiveBinarySearch(lowIndex, highIndex);
  };

  dataForge.convertToArray = function(input) {
    if (!input) return [];
    if (input.toJSArray) return input.toJSArray();
    if (dataForge.isArrayType(input)) return input;
    if (dataForge.isArgumentSet(input)) return arraySliceReference.call(input);
    return dataForge.retrieveValues(input);
  };

  dataForge.countElements = function(input) {
    return dataForge.convertToArray(input).length;
  };

  dataForge.getHead = function(dataArray, count, isInternalGuard) {
    if (count && !isInternalGuard) {
      return arraySliceReference.call(dataArray, 0, count);
    }
    return dataArray[0];
  };

  dataForge.getTail = function(dataArray, startIndex, isInternalGuard) {
    var actualStartIndex = (dataForge.isUndefined(startIndex) || isInternalGuard) ? 1 : startIndex;
    return arraySliceReference.call(dataArray, actualStartIndex);
  };

  dataForge.getRear = function(dataArray) {
    return dataArray[dataArray.length - 1];
  };

  dataForge.removeFalsy = function(dataArray) {
    return dataForge.selectMatching(dataArray, function(val) { return !!val; });
  };

  dataForge.unrollDeep = function(dataArray) {
    var finalResult = [];
    var processingStack = [];
    for (var i = dataArray.length - 1; i >= 0; i--) {
      processingStack.push(dataArray[i]);
    }

    while (processingStack.length > 0) {
      var currentElement = processingStack.pop();
      if (dataForge.isArrayType(currentElement)) {
        for (var j = currentElement.length - 1; j >= 0; j--) {
          processingStack.push(currentElement[j]);
        }
      } else {
        finalResult.push(currentElement);
      }
    }
    return finalResult;
  };

  dataForge.excludeValues = function(dataArray) {
    var valuesToExclude = dataForge.getTail(arguments);
    return dataForge.selectMatching(dataArray, function(val) {
      return !dataForge.containsValue(valuesToExclude, val);
    });
  };

  dataForge.uniqueElements = function(dataArray, isAlreadySorted) {
    var resultList = [];
    processElements(dataArray, function(item, idx) {
      if (isAlreadySorted && idx > 0) {
        if (dataForge.getRear(resultList) !== item) {
          resultList.push(item);
        }
      } else {
        if (!dataForge.containsValue(resultList, item)) {
          resultList.push(item);
        }
      }
    });
    return resultList;
  };

  dataForge.commonElements = function(firstArray) {
    var otherArrays = dataForge.getTail(arguments);
    var uniqueFirst = dataForge.uniqueElements(firstArray);
    return dataForge.selectMatching(uniqueFirst, function(item) {
      return dataForge.checkAll(otherArrays, function(otherArr) {
        return dataForge.findPosition(otherArr, item) >= 0;
      });
    });
  };

  dataForge.combineAtIndices = function() {
    var inputArrays = dataForge.convertToArray(arguments);
    var maxLength = dataForge.findLargest(dataForge.extractProperty(inputArrays, 'length'));
    var finalStructure = new Array(maxLength);
    for (var i = 0; i < maxLength; i++) {
      finalStructure[i] = dataForge.extractProperty(inputArrays, String(i));
    }
    return finalStructure;
  };

  dataForge.findPosition = function(dataArray, searchItem) {
    if (arrayNativePositionFinder && dataArray.indexOf === arrayNativePositionFinder) {
      return dataArray.indexOf(searchItem);
    }
    var findRecursive = function(arr, item, index) {
      if (index >= arr.length) return -1;
      if (arr[index] === item) return index;
      return findRecursive(arr, item, index + 1);
    };
    return findRecursive(dataArray, searchItem, 0);
  };

  dataForge.findLastPosition = function(dataArray, searchItem) {
    if (arrayNativeLastPositionFinder && dataArray.lastIndexOf === arrayNativeLastPositionFinder) {
      return dataArray.lastIndexOf(searchItem);
    }
    var findRecursive = function(arr, item, index) {
      if (index < 0) return -1;
      if (arr[index] === item) return index;
      return findRecursive(arr, item, index - 1);
    };
    return findRecursive(dataArray, searchItem, dataArray.length - 1);
  };

  dataForge.generateSequence = function(startVal, endVal, stepVal) {
    var args = dataForge.convertToArray(arguments);
    var isSingleArg = args.length <= 1;
    var actualStart = isSingleArg ? 0 : args[0];
    var actualEnd = isSingleArg ? args[0] : args[1];
    var actualStep = args[2] || 1;

    var generatedNumbers = [];
    var currentNum = actualStart;
    while (true) {
      if ((actualStep > 0 && currentNum >= actualEnd) || (actualStep < 0 && currentNum <= actualEnd)) {
        break;
      }
      generatedNumbers.push(currentNum);
      currentNum += actualStep;
    }
    return generatedNumbers;
  };

  dataForge.createBoundFunction = function(targetFunction, contextObject) {
    var fixedArguments = dataForge.getTail(arguments, 2);
    return function() {
      var runtimeArguments = dataForge.convertToArray(arguments);
      return targetFunction.apply(contextObject || currentGlobalContext, fixedArguments.concat(runtimeArguments));
    };
  };

  dataForge.bindAllMethods = function(targetObject) {
    var methodNames = dataForge.getTail(arguments);
    if (methodNames.length === 0) methodNames = dataForge.retrieveFunctionNames(targetObject);
    processElements(methodNames, function(methodName) {
      targetObject[methodName] = dataForge.createBoundFunction(targetObject[methodName], targetObject);
    });
    return targetObject;
  };

  dataForge.scheduleDelayedCall = function(targetFunction, delayMilliseconds) {
    var callArguments = dataForge.getTail(arguments, 2);
    return setTimeout(function() {
      return targetFunction.apply(targetFunction, callArguments);
    }, delayMilliseconds);
  };

  dataForge.scheduleDeferredCall = function(targetFunction) {
    return dataForge.scheduleDelayedCall.apply(dataForge, [targetFunction, 1].concat(dataForge.getTail(arguments)));
  };

  dataForge.createWrappedFunction = function(originalFunction, wrapperFunction) {
    return function() {
      var combinedArguments = [originalFunction].concat(dataForge.convertToArray(arguments));
      return wrapperFunction.apply(wrapperFunction, combinedArguments);
    };
  };

  dataForge.combineFunctions = function() {
    var functionsToCombine = dataForge.convertToArray(arguments);
    return function() {
      var initialArgs = dataForge.convertToArray(arguments);
      var finalResultArray = dataForge.reverseAggregateCollection(functionsToCombine, initialArgs, function(memo, func) {
        return [func.apply(this, memo)];
      }, this);
      return finalResultArray[0];
    };
  };

  dataForge.retrievePropertyNames = objectNativeKeys || function(inputObject) {
    if (dataForge.isArrayType(inputObject)) {
      return dataForge.generateSequence(0, inputObject.length);
    }
    var keyList = [];
    for (var keyName in inputObject) {
      if (objectHasOwnReference.call(inputObject, keyName)) {
        keyList.push(keyName);
      }
    }
    return keyList;
  };

  dataForge.retrieveValues = function(inputObject) {
    return dataForge.transformCollection(inputObject, dataForge.passThrough);
  };

  dataForge.retrieveFunctionNames = function(inputObject) {
    return dataForge.selectMatching(dataForge.retrievePropertyNames(inputObject), function(propKey) {
      return dataForge.isFunctionType(inputObject[propKey]);
    }).sort();
  };

  dataForge.mergeProperties = function(destinationObject) {
    var sources = arraySliceReference.call(arguments, 1);

    var processSourceRecursively = function(idx) {
      if (idx >= sources.length) {
        return;
      }
      var currentSource = sources[idx];
      if (currentSource != null) {
        var allKeys = objectNativeKeys ? objectNativeKeys(currentSource) : dataForge.retrievePropertyNames(currentSource);
        processElements(allKeys, function(key) {
          var descriptor = Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(currentSource, key) : {value: currentSource[key], enumerable: true, configurable: true, writable: true};
          if (descriptor.get || descriptor.set) {
            if (Object.defineProperty) {
              Object.defineProperty(destinationObject, key, {
                get: descriptor.get,
                set: descriptor.set,
                enumerable: descriptor.enumerable,
                configurable: descriptor.configurable
              });
            } else {
              if (descriptor.get && destinationObject.__defineGetter__) {
                destinationObject.__defineGetter__(key, descriptor.get);
              }
              if (descriptor.set && destinationObject.__defineSetter__) {
                destinationObject.__defineSetter__(key, descriptor.set);
              }
            }
          } else if (destinationObject[key] !== descriptor.value) { // This matches original's `target !== d.value`
            destinationObject[key] = descriptor.value;
          }
        });
      }
      processSourceRecursively(idx + 1);
    };
    processSourceRecursively(0);
    return destinationObject;
  };

  dataForge.duplicateEntity = function(inputEntity) {
    if (dataForge.isArrayType(inputEntity)) {
      return arraySliceReference.call(inputEntity, 0);
    }
    return dataForge.mergeProperties({}, inputEntity);
  };

  dataForge.inspectAndReturn = function(dataValue, inspectorFunction) {
    inspectorFunction(dataValue);
    return dataValue;
  };

  dataForge.areEntitiesEquivalent = function(firstItem, secondItem) {
    if (firstItem === secondItem) return true;

    var typeA = objectToStringReference.call(firstItem);
    var typeB = objectToStringReference.call(secondItem);
    if (typeA !== typeB) return false;

    if (firstItem == secondItem) return true;

    if (dataForge.isObjectType(firstItem) !== dataForge.isObjectType(secondItem)) return false;

    if (dataForge.isDateType(firstItem)) {
      return firstItem.getTime() === secondItem.getTime();
    }
    if (dataForge.isNotANumber(firstItem)) {
      return dataForge.isNotANumber(secondItem);
    }
    if (dataForge.isRegExType(firstItem)) {
      return firstItem.source === secondItem.source &&
             firstItem.global === secondItem.global &&
             firstItem.ignoreCase === secondItem.ignoreCase &&
             firstItem.multiline === secondItem.multiline;
    }

    if (!dataForge.isObjectType(firstItem)) return false;

    return false;
  };

  var dataPipe = function(inputVal) {
    this.value = inputVal;
  };

  processElements(dataForge.retrieveFunctionNames(dataForge), function(methodName) {
    var originalFunction = dataForge[methodName];
    if (!methodName.startsWith('is') && methodName !== 'passThrough' && methodName !== 'iterateCollection' && methodName !== 'textPatternCleaner') {
      dataPipe.prototype[methodName] = function() {
        var args = [this.value].concat(arraySliceReference.call(arguments));
        this.value = originalFunction.apply(dataForge, args);
        return this;
      };
    }
  });

  dataPipe.prototype.extract = function() {
    return this.value;
  };
  dataPipe.prototype.chain = function() {
    return dataForge(this.value);
  };

})();