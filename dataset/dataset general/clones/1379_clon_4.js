((globalSpace) => {
  const applicationCore = globalSpace.SolutionKit || {};
  applicationCore.RELEASE_HASH = "1.0.8";
  globalSpace.SolutionKit = applicationCore;
})(this);

(() => {
  const globalContext = this;
  const priorUtilityKit = globalContext.UtilityKit;

  const loopTerminationSignal = {};

  const arrayPrototype = Array.prototype,
    objectPrototype = Object.prototype,
    functionPrototype = Function.prototype;

  const extractSubsegment = arrayPrototype.slice,
    addFront = arrayPrototype.unshift,
    getTypeTag = objectPrototype.toString,
    checkOwnProperty = objectPrototype.hasOwnProperty;

  const platformForEach = arrayPrototype.forEach,
    platformMap = arrayPrototype.map,
    platformReduce = arrayPrototype.reduce,
    platformReduceRight = arrayPrototype.reduceRight,
    platformFilter = arrayPrototype.filter,
    platformEvery = arrayPrototype.every,
    platformSome = arrayPrototype.some,
    platformIndexOf = arrayPrototype.indexOf,
    platformLastIndexOf = arrayPrototype.lastIndexOf,
    platformIsArray = Array.isArray,
    platformGetKeys = Object.keys,
    platformBindFunction = functionPrototype.bind;

  const dataContainer = function(dataUnit) {
    this.wrappedData = dataUnit;
  };

  const utilityKit = function(dataUnit) {
    return new dataContainer(dataUnit);
  };

  if (typeof moduleExports !== 'undefined') { // Using moduleExports to avoid 'exports' identifier
    if (typeof module !== 'undefined' && module.exports) {
      moduleExports = module.exports = utilityKit;
    }
    moduleExports.UtilityKit = utilityKit;
  } else {
    globalContext['UtilityKit'] = utilityKit;
  }

  utilityKit.RELEASE_MARK = '1.3.3';

  // Core Utility Helpers
  utilityKit.isExecutable = function(potentialFunction) {
    return getTypeTag.call(potentialFunction) === '[object Function]';
  };

  utilityKit.isAnArray = platformIsArray || function(candidate) {
    return getTypeTag.call(candidate) === '[object Array]';
  };

  utilityKit.isArgumentsObject = function(candidateArgs) {
    return getTypeTag.call(candidateArgs) === '[object Arguments]';
  };

  utilityKit.possessesKey = function(itemSet, attributeName) {
    return checkOwnProperty.call(itemSet, attributeName);
  };

  utilityKit.selfReturn = function(param) {
    return param;
  };

  // Collection Operations
  const processCollection = utilityKit.processCollection = utilityKit.iterateCollection = function(dataCollection, operationCallback, executionScope) {
    if (dataCollection == null) return;
    if (platformForEach && dataCollection.forEach === platformForEach) {
      dataCollection.forEach(operationCallback, executionScope);
    } else if (typeof dataCollection.length === 'number' && dataCollection.length >= 0 && dataCollection.length === +dataCollection.length) {
      for (let idx = 0, len = dataCollection.length; idx < len; idx++) {
        if (idx in dataCollection && operationCallback.call(executionScope, dataCollection[idx], idx, dataCollection) === loopTerminationSignal) return;
      }
    } else {
      for (const propName in dataCollection) {
        if (utilityKit.possessesKey(dataCollection, propName)) {
          if (operationCallback.call(executionScope, dataCollection[propName], propName, dataCollection) === loopTerminationSignal) return;
        }
      }
    }
  };

  utilityKit.transformCollection = utilityKit.gatherTransformed = function(sourceSet, transformCallback, executionEnvironment) {
    const transformedItems = [];
    if (sourceSet == null) return transformedItems;
    if (platformMap && sourceSet.map === platformMap) return sourceSet.map(transformCallback, executionEnvironment);
    processCollection(sourceSet, (itemValue, itemIndex, sourceList) => {
      transformedItems.push(transformCallback.call(executionEnvironment, itemValue, itemIndex, sourceList));
    });
    if (typeof sourceSet.length === 'number' && sourceSet.length >= 0 && sourceSet.length === +sourceSet.length) {
      transformedItems.length = sourceSet.length;
    }
    return transformedItems;
  };

  utilityKit.aggregateElements = utilityKit.foldLeft = utilityKit.injectValue = function(dataCollection, aggregatorFn, initialAccumulator, executionEnv) {
    let hasInitialValue = arguments.length > 2;
    if (dataCollection == null) dataCollection = [];
    if (platformReduce && dataCollection.reduce === platformReduce) {
      if (executionEnv) aggregatorFn = utilityKit.attachContext(aggregatorFn, executionEnv);
      return hasInitialValue ? dataCollection.reduce(aggregatorFn, initialAccumulator) : dataCollection.reduce(aggregatorFn);
    }
    processCollection(dataCollection, (itemValue, itemIndex, sourceList) => {
      if (!hasInitialValue) {
        initialAccumulator = itemValue;
        hasInitialValue = true;
      } else {
        initialAccumulator = aggregatorFn.call(executionEnv, initialAccumulator, itemValue, itemIndex, sourceList);
      }
    });
    if (!hasInitialValue) throw new TypeError('Aggregation of empty array with no initial value');
    return initialAccumulator;
  };

  utilityKit.aggregateElementsRight = utilityKit.foldRight = function(dataCollection, aggregatorFn, initialAccumulator, executionEnv) {
    let hasInitialValue = arguments.length > 2;
    if (dataCollection == null) dataCollection = [];
    if (platformReduceRight && dataCollection.reduceRight === platformReduceRight) {
      if (executionEnv) aggregatorFn = utilityKit.attachContext(aggregatorFn, executionEnv);
      return hasInitialValue ? dataCollection.reduceRight(aggregatorFn, initialAccumulator) : dataCollection.reduceRight(aggregatorFn);
    }
    const invertedList = utilityKit.convertInputToArray(dataCollection).reverse();
    if (executionEnv && !hasInitialValue) aggregatorFn = utilityKit.attachContext(aggregatorFn, executionEnv);
    return hasInitialValue ? utilityKit.aggregateElements(invertedList, aggregatorFn, initialAccumulator, executionEnv) : utilityKit.aggregateElements(invertedList, aggregatorFn);
  };

  const checkExistence = utilityKit.hasAny = utilityKit.checkAny = function(dataGroup, predicateFn, evaluationZone) {
    predicateFn = predicateFn || utilityKit.selfReturn;
    let matchFound = false;
    if (dataGroup == null) return matchFound;
    if (platformSome && dataGroup.some === platformSome) return dataGroup.some(predicateFn, evaluationZone);
    processCollection(dataGroup, (itemValue, itemIndex, sourceList) => {
      if (matchFound || (matchFound = predicateFn.call(evaluationZone, itemValue, itemIndex, sourceList))) return loopTerminationSignal;
    });
    return !!matchFound;
  };

  utilityKit.locateElement = utilityKit.discernElement = function(dataGroup, predicateFn, evaluationZone) {
    let foundItem;
    checkExistence(dataGroup, (itemValue, itemIndex, sourceList) => {
      if (predicateFn.call(evaluationZone, itemValue, itemIndex, sourceList)) {
        foundItem = itemValue;
        return true;
      }
    });
    return foundItem;
  };

  utilityKit.selectMatching = utilityKit.chooseElements = function(dataGroup, predicateFn, evaluationZone) {
    const selectedItems = [];
    if (dataGroup == null) return selectedItems;
    if (platformFilter && dataGroup.filter === platformFilter) return dataGroup.filter(predicateFn, evaluationZone);
    processCollection(dataGroup, (itemValue, itemIndex, sourceList) => {
      if (predicateFn.call(evaluationZone, itemValue, itemIndex, sourceList)) selectedItems.push(itemValue);
    });
    return selectedItems;
  };

  utilityKit.discardNonMatching = function(dataGroup, predicateFn, evaluationZone) {
    const retainedItems = [];
    if (dataGroup == null) return retainedItems;
    processCollection(dataGroup, (itemValue, itemIndex, sourceList) => {
      if (!predicateFn.call(evaluationZone, itemValue, itemIndex, sourceList)) retainedItems.push(itemValue);
    });
    return retainedItems;
  };

  utilityKit.allElementsMatch = utilityKit.checkAll = function(dataGroup, predicateFn, evaluationZone) {
    let allTrue = true;
    if (dataGroup == null) return allTrue;
    if (platformEvery && dataGroup.every === platformEvery) return dataGroup.every(predicateFn, evaluationZone);
    processCollection(dataGroup, (itemValue, itemIndex, sourceList) => {
      if (!(allTrue = allTrue && predicateFn.call(evaluationZone, itemValue, itemIndex, sourceList))) return loopTerminationSignal;
    });
    return !!allTrue;
  };

  utilityKit.containsElement = utilityKit.hasElement = function(dataUnit, soughtItem) {
    let isItemPresent = false;
    if (dataUnit == null) return isItemPresent;
    if (platformIndexOf && dataUnit.indexOf === platformIndexOf) return dataUnit.indexOf(soughtItem) !== -1;
    isItemPresent = checkExistence(dataUnit, (itemValue) => {
      return itemValue === soughtItem;
    });
    return isItemPresent;
  };

  utilityKit.applyMethodOnEach = function(dataGroup, methodIdentifier) {
    const invocationArgs = extractSubsegment.call(arguments, 2);
    return utilityKit.transformCollection(dataGroup, (itemValue) => {
      return (utilityKit.isExecutable(methodIdentifier) ? methodIdentifier || itemValue : itemValue[methodIdentifier]).apply(itemValue, invocationArgs);
    });
  };

  utilityKit.extractProperty = function(dataGroup, propertyName) {
    return utilityKit.transformCollection(dataGroup, (itemValue) => itemValue[propertyName]);
  };

  utilityKit.findMaximum = function(dataGroup, criteriaGenerator, evaluationZone) {
    if (!criteriaGenerator && utilityKit.isAnArray(dataGroup) && dataGroup.length > 0 && typeof dataGroup[0] === 'number') {
      return Math.max.apply(Math, dataGroup);
    }
    if (!criteriaGenerator && utilityKit.getElementCount(dataGroup) === 0) return -Infinity;
    let resultStore = {
      evaluatedValue: -Infinity
    };
    processCollection(dataGroup, (itemValue, itemIndex, sourceList) => {
      const currentEvaluated = criteriaGenerator ? criteriaGenerator.call(evaluationZone, itemValue, itemIndex, sourceList) : itemValue;
      if (currentEvaluated >= resultStore.evaluatedValue) {
        resultStore = {
          item: itemValue,
          evaluatedValue: currentEvaluated
        };
      }
    });
    return resultStore.item;
  };

  utilityKit.findMinimum = function(dataGroup, criteriaGenerator, evaluationZone) {
    if (!criteriaGenerator && utilityKit.isAnArray(dataGroup) && dataGroup.length > 0 && typeof dataGroup[0] === 'number') {
      return Math.min.apply(Math, dataGroup);
    }
    if (!criteriaGenerator && utilityKit.getElementCount(dataGroup) === 0) return Infinity;
    let resultStore = {
      evaluatedValue: Infinity
    };
    processCollection(dataGroup, (itemValue, itemIndex, sourceList) => {
      const currentEvaluated = criteriaGenerator ? criteriaGenerator.call(evaluationZone, itemValue, itemIndex, sourceList) : itemValue;
      if (currentEvaluated < resultStore.evaluatedValue) {
        resultStore = {
          item: itemValue,
          evaluatedValue: currentEvaluated
        };
      }
    });
    return resultStore.item;
  };

  utilityKit.randomizeOrder = function(dataGroup) {
    const randomizedSequence = [];
    processCollection(dataGroup, (itemValue, itemIndex) => {
      const randomPosition = Math.floor(Math.random() * (itemIndex + 1));
      randomizedSequence[itemIndex] = randomizedSequence[randomPosition];
      randomizedSequence[randomPosition] = itemValue;
    });
    return randomizedSequence;
  };

  utilityKit.sortCollectionBy = function(dataGroup, criteriaGenerator, evaluationZone) {
    const actualCriteriaGen = utilityKit.isExecutable(criteriaGenerator) ? criteriaGenerator : (item) => item[criteriaGenerator];
    const sortedMapped = utilityKit.transformCollection(dataGroup, (itemValue, itemIndex, sourceList) => {
      return {
        originalItem: itemValue,
        sortCriterion: actualCriteriaGen.call(evaluationZone, itemValue, itemIndex, sourceList)
      };
    }).sort((leftItem, rightItem) => {
      const criterionA = leftItem.sortCriterion,
        criterionB = rightItem.sortCriterion;
      if (criterionA === undefined) return 1;
      if (criterionB === undefined) return -1;
      return criterionA < criterionB ? -1 : criterionA > criterionB ? 1 : 0;
    });
    return utilityKit.extractProperty(sortedMapped, 'originalItem');
  };

  utilityKit.groupCollectionBy = function(dataGroup, criteriaGenerator) {
    const groupedResult = {};
    const actualCriteriaGen = utilityKit.isExecutable(criteriaGenerator) ? criteriaGenerator : (item) => item[criteriaGenerator];
    processCollection(dataGroup, (itemValue, itemIndex) => {
      const groupKey = actualCriteriaGen(itemValue, itemIndex);
      (groupedResult[groupKey] || (groupedResult[groupKey] = [])).push(itemValue);
    });
    return groupedResult;
  };

  utilityKit.findInsertionIndex = function(orderedArray, targetElement, comparisonFn) {
    comparisonFn = comparisonFn || utilityKit.selfReturn;
    let lowerBound = 0,
      upperBound = orderedArray.length;
    while (lowerBound < upperBound) {
      const middleIndex = (lowerBound + upperBound) >> 1;
      if (comparisonFn(orderedArray[middleIndex]) < comparisonFn(targetElement)) {
        lowerBound = middleIndex + 1;
      } else {
        upperBound = middleIndex;
      }
    }
    return lowerBound;
  };

  utilityKit.retrieveValues = function(entity) {
    return utilityKit.transformCollection(entity, utilityKit.selfReturn);
  };

  utilityKit.convertInputToArray = function(sourceEntity) {
    if (!sourceEntity) return [];
    if (utilityKit.isAnArray(sourceEntity)) return extractSubsegment.call(sourceEntity);
    if (utilityKit.isArgumentsObject(sourceEntity)) return extractSubsegment.call(sourceEntity);
    if (sourceEntity.toArray && utilityKit.isExecutable(sourceEntity.toArray)) return sourceEntity.toArray();
    return utilityKit.retrieveValues(sourceEntity);
  };

  utilityKit.getElementCount = function(sourceEntity) {
    return utilityKit.isAnArray(sourceEntity) ? sourceEntity.length : platformGetKeys(sourceEntity).length;
  };

  // Array Operations
  utilityKit.getFirstElement = utilityKit.getHead = utilityKit.takeElements = function(sourceArray, count, isGuarded) {
    return (count != null) && !isGuarded ? extractSubsegment.call(sourceArray, 0, count) : sourceArray[0];
  };

  utilityKit.getInitialElements = function(sourceArray, count, isGuarded) {
    const effectiveCount = (count == null) || isGuarded ? 1 : count;
    return extractSubsegment.call(sourceArray, 0, sourceArray.length - effectiveCount);
  };

  utilityKit.getLastElement = function(sourceArray, count, isGuarded) {
    if ((count != null) && !isGuarded) {
      return extractSubsegment.call(sourceArray, Math.max(sourceArray.length - count, 0));
    } else {
      return sourceArray[sourceArray.length - 1];
    }
  };

  utilityKit.getRemainingElements = utilityKit.getTail = function(sourceArray, startIndex, isGuarded) {
    const effectiveIndex = (startIndex == null) || isGuarded ? 1 : startIndex;
    return extractSubsegment.call(sourceArray, effectiveIndex);
  };

  utilityKit.removeFalsy = function(sourceArray) {
    return utilityKit.selectMatching(sourceArray, (itemValue) => !!itemValue);
  };

  utilityKit.unrollArray = function(sourceArray, isShallow) {
    return utilityKit.aggregateElements(sourceArray, (accumulator, itemValue) => {
      if (utilityKit.isAnArray(itemValue)) return accumulator.concat(isShallow ? itemValue : utilityKit.unrollArray(itemValue));
      accumulator.push(itemValue);
      return accumulator;
    }, []);
  };

  utilityKit.excludeValues = function(sourceArray) {
    const valuesToExclude = utilityKit.unrollArray(extractSubsegment.call(arguments, 1), true);
    return utilityKit.selectMatching(sourceArray, (itemValue) => !utilityKit.containsElement(valuesToExclude, itemValue));
  };

  utilityKit.uniqueElements = utilityKit.distinctElements = function(sourceArray, isSorted, valueExtractor) {
    const intermediateValues = valueExtractor ? utilityKit.transformCollection(sourceArray, valueExtractor) : sourceArray;
    const finalResults = [];
    if (sourceArray.length < 3) isSorted = true; // Optimization from original
    utilityKit.aggregateElements(intermediateValues, (processedValues, itemValue, itemIndex) => {
      if (isSorted ? utilityKit.getLastElement(processedValues) !== itemValue || processedValues.length === 0 : !utilityKit.containsElement(processedValues, itemValue)) {
        processedValues.push(itemValue);
        finalResults.push(sourceArray[itemIndex]);
      }
      return processedValues;
    }, []);
    return finalResults;
  };

  utilityKit.combineUnique = function() {
    return utilityKit.uniqueElements(utilityKit.unrollArray(arguments, true));
  };

  utilityKit.findCommonElements = utilityKit.getIntersection = function(firstArray) {
    const otherArrays = extractSubsegment.call(arguments, 1);
    return utilityKit.selectMatching(utilityKit.uniqueElements(firstArray), (currentElement) => {
      return utilityKit.allElementsMatch(otherArrays, (otherCollection) => {
        return utilityKit.findElementIndex(otherCollection, currentElement) >= 0;
      });
    });
  };

  utilityKit.findDifference = function(firstArray) {
    const comparisonSet = utilityKit.unrollArray(extractSubsegment.call(arguments, 1), true);
    return utilityKit.selectMatching(firstArray, (itemValue) => !utilityKit.containsElement(comparisonSet, itemValue));
  };

  utilityKit.interleaveCollections = function() {
    const inputCollections = extractSubsegment.call(arguments);
    const maxLength = utilityKit.findMaximum(utilityKit.extractProperty(inputCollections, 'length'));
    const interleavedResult = new Array(maxLength);
    for (let i = 0; i < maxLength; i++) interleavedResult[i] = utilityKit.extractProperty(inputCollections, "" + i);
    return interleavedResult;
  };

  utilityKit.findElementIndex = function(sourceArray, soughtItem, isSorted) {
    if (sourceArray == null) return -1;
    if (isSorted) {
      const insertionPoint = utilityKit.findInsertionIndex(sourceArray, soughtItem);
      return sourceArray[insertionPoint] === soughtItem ? insertionPoint : -1;
    }
    if (platformIndexOf && sourceArray.indexOf === platformIndexOf) return sourceArray.indexOf(soughtItem);
    for (let idx = 0, len = sourceArray.length; idx < len; idx++) {
      if (idx in sourceArray && sourceArray[idx] === soughtItem) return idx;
    }
    return -1;
  };

  utilityKit.findLastElementIndex = function(sourceArray, soughtItem) {
    if (sourceArray == null) return -1;
    if (platformLastIndexOf && sourceArray.lastIndexOf === platformLastIndexOf) return sourceArray.lastIndexOf(soughtItem);
    let idx = sourceArray.length;
    while (idx--) {
      if (idx in sourceArray && sourceArray[idx] === soughtItem) return idx;
    }
    return -1;
  };

  utilityKit.generateRange = function(rangeStart, rangeEnd, rangeStep) {
    if (arguments.length <= 1) {
      rangeEnd = rangeStart || 0;
      rangeStart = 0;
    }
    rangeStep = arguments[2] || 1;

    const rangeLength = Math.max(Math.ceil((rangeEnd - rangeStart) / rangeStep), 0);
    const generatedSequence = new Array(rangeLength);
    let currentIndex = 0;

    while (currentIndex < rangeLength) {
      generatedSequence[currentIndex++] = rangeStart;
      rangeStart += rangeStep;
    }

    return generatedSequence;
  };

  // Function Operations
  utilityKit.attachContext = function(methodToExecute, desiredContext, ...fixedArguments) {
    if (!utilityKit.isExecutable(methodToExecute)) {
      throw new TypeError("First argument must be a callable entity.");
    }

    const boundExecution = function(...incomingArguments) {
      const combinedArguments = fixedArguments.concat(incomingArguments);

      // Differentiate between function call and constructor invocation
      if (this instanceof boundExecution) {
        // If called with 'new', create a new object whose prototype chain includes the original function's prototype
        const newObjectInstance = Object.create(methodToExecute.prototype);
        // Call the original function as a constructor on the new instance
        const constructorResult = methodToExecute.apply(newObjectInstance, combinedArguments);
        // If the constructor returned an object or function, use that; otherwise, use the new instance
        return (typeof constructorResult === 'object' && constructorResult !== null) || typeof constructorResult === 'function' ? constructorResult : newObjectInstance;
      } else {
        // Regular function call, apply with the specified context
        return methodToExecute.apply(desiredContext, combinedArguments);
      }
    };

    return boundExecution;
  };

})();