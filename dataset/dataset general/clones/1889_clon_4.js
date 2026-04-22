(function() {
  const Utl = globalThis.Utl = {
    releaseId: "alpha-0.1.0"
  };

  if (!globalThis.getCurrentTimestamp) {
    globalThis.getCurrentTimestamp = () => new Date().getTime();
  }

  try {
    const temporaryElement = document.createElement("div");
    temporaryElement.style.setProperty("flexGrow", 0, "");
    if (temporaryElement.style.getPropertyValue("flexGrow") !== "0") {
      const originalStyleSetter = CSSStyleDeclaration.prototype.setProperty;
      Object.defineProperty(CSSStyleDeclaration.prototype, "setProperty", {
        value: function(propName, propValue, prio) {
          originalStyleSetter.call(this, propName, String(propValue), prio);
        },
        configurable: true
      });
    }
  } catch (err) {
    if (!globalThis.CSSStyleDeclaration || !CSSStyleDeclaration.prototype.setProperty) {
      CSSStyleDeclaration.prototype.setProperty = function(propName, propValue, prio) {
        this.cssText += `${propName}: ${String(propValue)}${prio ? ' !' + prio : ''};`;
      };
    } else {
      const originalStyleSetter = CSSStyleDeclaration.prototype.setProperty;
      CSSStyleDeclaration.prototype.setProperty = function(propName, propValue, prio) {
        originalStyleSetter.call(this, propName, String(propValue), prio);
      };
    }
  }

  function _enhanceConstructor(constructorRef, memberCollection) {
    try {
      Object.keys(memberCollection).forEach(keyId => {
        Object.defineProperty(constructorRef.prototype, keyId, {
          value: memberCollection[keyId],
          enumerable: false,
          writable: true,
          configurable: true
        });
      });
    } catch (errorDetail) {
      Object.assign(constructorRef.prototype, memberCollection);
    }
  }

  let _collectionConverter;
  try {
    Array.from(document.documentElement.childNodes)[0].nodeType;
    _collectionConverter = (inputCollection) => Array.from(inputCollection);
  } catch (e) {
    _collectionConverter = (inputCollection) => {
      const outputArray = [];
      for (let i = 0; i < inputCollection.length; ++i) {
        outputArray.push(inputCollection[i]);
      }
      return outputArray;
    };
  }
  Utl.toList = _collectionConverter;

  Utl.augmentArray = (() => {
    if (Object.setPrototypeOf) {
      return (targetArray, additionalPrototype) => {
        Object.setPrototypeOf(targetArray, additionalPrototype);
        return targetArray;
      };
    } else {
      return (targetArray, additionalPrototype) => {
        for (let prop in additionalPrototype) {
          if (Object.prototype.hasOwnProperty.call(additionalPrototype, prop)) {
            targetArray[prop] = additionalPrototype[prop];
          }
        }
        return targetArray;
      };
    }
  })();

  class KeyValueStore {
    constructor() {
      this._internalStorage = {};
      this._keyPrefix = "__kv_";
    }

    has(keyId) {
      return Object.prototype.hasOwnProperty.call(this._internalStorage, this._keyPrefix + keyId);
    }

    retrieve(keyId) {
      return this._internalStorage[this._keyPrefix + keyId];
    }

    store(keyId, dataValue) {
      this._internalStorage[this._keyPrefix + keyId] = dataValue;
      return dataValue;
    }

    discard(keyId) {
      const actualKey = this._keyPrefix + keyId;
      if (Object.prototype.hasOwnProperty.call(this._internalStorage, actualKey)) {
        delete this._internalStorage[actualKey];
        return true;
      }
      return false;
    }

    getKeys() {
      const allKeys = [];
      for (let storedKey in this._internalStorage) {
        if (storedKey.startsWith(this._keyPrefix)) {
          allKeys.push(storedKey.substring(this._keyPrefix.length));
        }
      }
      return allKeys;
    }

    getValues() {
      const allValues = [];
      for (let storedKey in this._internalStorage) {
        if (storedKey.startsWith(this._keyPrefix)) {
          allValues.push(this._internalStorage[storedKey]);
        }
      }
      return allValues;
    }

    getEntries() {
      const allEntries = [];
      for (let storedKey in this._internalStorage) {
        if (storedKey.startsWith(this._keyPrefix)) {
          allEntries.push({
            identifier: storedKey.substring(this._keyPrefix.length),
            payload: this._internalStorage[storedKey]
          });
        }
      }
      return allEntries;
    }

    processEach(callbackFn) {
      for (let storedKey in this._internalStorage) {
        if (storedKey.startsWith(this._keyPrefix)) {
          callbackFn.call(this, storedKey.substring(this._keyPrefix.length), this._internalStorage[storedKey]);
        }
      }
    }
  }

  Utl.Dictionary = globalThis.Map || KeyValueStore;

  Utl.createDictionary = (sourceObject) => {
    const dict = new Utl.Dictionary();
    if (sourceObject && typeof dict.set === 'function') {
      for (let key in sourceObject) {
        dict.set(key, sourceObject[key]);
      }
    } else if (sourceObject) {
      for (let key in sourceObject) {
        dict.store(key, sourceObject[key]);
      }
    }
    return dict;
  };

  const _identityTransform = (val) => val;
  const _currentScope = function() { return this; };
  const _alwaysAffirmative = () => true;
  Utl.valueOrFunction = (inputVal) => typeof inputVal === "function" ? inputVal : () => inputVal;

  Utl.transferOperations = (recipient, origin, ...operationNames) => {
    operationNames.forEach(opName => {
      const originalMethod = origin[opName];
      if (typeof originalMethod === 'function') {
        recipient[opName] = function(...args) {
          const result = originalMethod.apply(origin, args);
          return args.length > 0 ? recipient : result;
        };
      }
    });
    return recipient;
  };

  Utl.sortAscending = (valA, valB) => {
    if (valA < valB) return -1;
    if (valA > valB) return 1;
    if (valA >= valB) return 0;
    return NaN;
  };
  Utl.sortDescending = (valA, valB) => {
    if (valB < valA) return -1;
    if (valB > valA) return 1;
    if (valB >= valA) return 0;
    return NaN;
  };

  const _isValidNumber = (value) => typeof value === 'number' && !isNaN(value) && value !== null;

  Utl.computeAverage = (dataset, propertyExtractor) => {
    let accumulator = 0;
    let count = 0;
    dataset.forEach((item, index) => {
      const value = propertyExtractor ? propertyExtractor(item, index) : item;
      if (_isValidNumber(value)) {
        accumulator += (value - accumulator) / ++count;
      }
    });
    return count ? accumulator : undefined;
  };

  Utl.findMinimum = (dataset, propertyExtractor) => {
    let currentMin = undefined;
    dataset.forEach((item, index) => {
      const value = propertyExtractor ? propertyExtractor(item, index) : item;
      if (_isValidNumber(value)) {
        if (currentMin === undefined || value < currentMin) {
          currentMin = value;
        }
      }
    });
    return currentMin;
  };

  Utl.findMaximum = (dataset, propertyExtractor) => {
    let currentMax = undefined;
    dataset.forEach((item, index) => {
      const value = propertyExtractor ? propertyExtractor(item, index) : item;
      if (_isValidNumber(value)) {
        if (currentMax === undefined || value > currentMax) {
          currentMax = value;
        }
      }
    });
    return currentMax;
  };

  Utl.getExtremes = (dataset, propertyExtractor) => {
    let currentMin = undefined;
    let currentMax = undefined;
    dataset.forEach((item, index) => {
      const value = propertyExtractor ? propertyExtractor(item, index) : item;
      if (_isValidNumber(value)) {
        if (currentMin === undefined || value < currentMin) {
          currentMin = value;
        }
        if (currentMax === undefined || value > currentMax) {
          currentMax = value;
        }
      }
    });
    return [currentMin, currentMax];
  };

  Utl.calculateTotal = (dataset, propertyExtractor) => {
    return dataset.reduce((sum, item, index) => {
      const value = propertyExtractor ? propertyExtractor(item, index) : item;
      return _isValidNumber(value) ? sum + value : sum;
    }, 0);
  };

  Utl.determineQuantile = (sortedNumericalValues, rank) => {
    const dataSize = sortedNumericalValues.length;
    if (dataSize === 0) return undefined;
    const index = (dataSize - 1) * rank;
    const lowerIndex = Math.floor(index);
    const remainder = index - lowerIndex;
    const value1 = sortedNumericalValues[lowerIndex];
    const value2 = sortedNumericalValues[lowerIndex + 1];
    return remainder ? value1 + remainder * (value2 - value1) : value1;
  };

  Utl.findMiddleValue = (dataset, propertyExtractor) => {
    let processedValues = dataset;
    if (propertyExtractor) {
      processedValues = dataset.map(propertyExtractor);
    }
    processedValues = processedValues.filter(_isValidNumber).sort(Utl.sortAscending);
    return processedValues.length ? Utl.determineQuantile(processedValues, 0.5) : undefined;
  };

  Utl.RandomGenerator = {
    gaussian: (average = 0, standardDeviation = 1) => {
      return () => {
        let valX, valY, radiusSq;
        do {
          valX = Math.random() * 2 - 1;
          valY = Math.random() * 2 - 1;
          radiusSq = valX * valX + valY * valY;
        } while (!radiusSq || radiusSq > 1);
        return average + standardDeviation * valX * Math.sqrt(-2 * Math.log(radiusSq) / radiusSq);
      };
    }
  };

  Utl.transposeMatrix = (matrixInput) => {
    if (!matrixInput || matrixInput.length === 0 || matrixInput[0].length === 0) return [];
    return matrixInput[0].map((_, colIdx) => matrixInput.map(row => row[colIdx]));
  };

  Utl.interleaveArrays = (...sourceArrays) => {
    if (sourceArrays.length === 0) return [];
    const minLength = Math.min(...sourceArrays.map(arr => arr.length));
    const result = [];
    for (let i = 0; i < minLength; ++i) {
      result.push(sourceArrays.map(arr => arr[i]));
    }
    return result;
  };

  Utl.createSearcher = (keyAccessor) => {
    const searcher = {
      findInsertIndexLeft: (orderedArray, searchVal, startIndex = 0, endIndex = orderedArray.length) => {
        while (startIndex < endIndex) {
          const midPoint = (startIndex + endIndex) >>> 1;
          if (keyAccessor(orderedArray[midPoint], midPoint) < searchVal) {
            startIndex = midPoint + 1;
          } else {
            endIndex = midPoint;
          }
        }
        return startIndex;
      },
      findInsertIndexRight: (orderedArray, searchVal, startIndex = 0, endIndex = orderedArray.length) => {
        while (startIndex < endIndex) {
          const midPoint = (startIndex + endIndex) >>> 1;
          if (searchVal < keyAccessor(orderedArray[midPoint], midPoint)) {
            endIndex = midPoint;
          } else {
            startIndex = midPoint + 1;
          }
        }
        return startIndex;
      }
    };
    return searcher;
  };

  const _defaultSearcher = Utl.createSearcher(_identityTransform);
  Utl.searchForLeft = _defaultSearcher.findInsertIndexLeft;
  Utl.searchForRight = _defaultSearcher.findInsertIndexRight;
  Utl.search = Utl.searchForRight;

  Utl.findFirstMatch = (collection, comparisonFn = Utl.sortAscending) => {
    if (!collection || collection.length === 0) return undefined;
    return collection.reduce((currentBest, currentItem) => {
      return comparisonFn(currentBest, currentItem) > 0 ? currentItem : currentBest;
    }, collection[0]);
  };

  Utl.findLastMatch = (collection, comparisonFn = Utl.sortAscending) => {
    if (!collection || collection.length === 0) return undefined;
    return collection.reduce((currentBest, currentItem) => {
      return comparisonFn(currentBest, currentItem) <= 0 ? currentItem : currentBest;
    }, collection[0]);
  };

  class DataAggregator {
    constructor() {
      this._groupingKeys = [];
      this._keySorters = [];
      this._valueSorter = null;
      this._finalReducer = null;
    }

    addKey(keyFn) {
      this._groupingKeys.push(keyFn);
      return this;
    }

    setKeyOrder(orderFn) {
      if (this._groupingKeys.length > 0) {
        this._keySorters[this._groupingKeys.length - 1] = orderFn;
      }
      return this;
    }

    setValueOrder(orderFn) {
      this._valueSorter = orderFn;
      return this;
    }

    setFinalReducer(reducerFn) {
      this._finalReducer = reducerFn;
      return this;
    }

    _processData(dataArray, depthIndex) {
      if (depthIndex >= this._groupingKeys.length) {
        return this._finalReducer ? this._finalReducer.call(this, dataArray) : (this._valueSorter ? dataArray.sort(this._valueSorter) : dataArray);
      }

      const currentKeyFn = this._groupingKeys[depthIndex];
      const groupedMap = new Utl.Dictionary();

      dataArray.forEach(item => {
        const itemKey = currentKeyFn(item);
        if (groupedMap.has(itemKey)) {
          groupedMap.retrieve(itemKey).push(item);
        } else {
          groupedMap.store(itemKey, [item]);
        }
      });

      const resultObject = {};
      if (groupedMap.forEach) {
        groupedMap.forEach((key, valueList) => {
          resultObject[key] = this._processData(valueList, depthIndex + 1);
        });
      } else {
        const keys = groupedMap.getKeys();
        keys.forEach(key => {
          resultObject[key] = this._processData(groupedMap.retrieve(key), depthIndex + 1);
        });
      }

      return resultObject;
    }

    _extractEntries(processedMap, depthIndex) {
      if (depthIndex >= this._groupingKeys.length) {
        return processedMap;
      }

      const entriesList = [];
      const currentKeySorter = this._keySorters[depthIndex];

      for (let key in processedMap) {
        if (Object.prototype.hasOwnProperty.call(processedMap, key)) {
          entriesList.push({
            groupKey: key,
            groupedItems: this._extractEntries(processedMap[key], depthIndex + 1)
          });
        }
      }

      if (currentKeySorter) {
        entriesList.sort((a, b) => currentKeySorter(a.groupKey, b.groupKey));
      }

      return entriesList;
    }

    groupAsObject(inputData) {
      return this._processData(inputData, 0);
    }

    groupAsList(inputData) {
      return this._extractEntries(this._processData(inputData, 0), 0);
    }
  }
  Utl.createAggregator = () => new DataAggregator();

  Utl.extractKeys = (inputObject) => Object.keys(inputObject);
  Utl.extractValues = (inputObject) => Object.values(inputObject);
  Utl.extractKeyValues = (inputObject) => Object.entries(inputObject).map(([key, val]) => ({ id: key, content: val }));

  Utl.reorderArray = (sourceArray, orderIndices) => orderIndices.map(idx => sourceArray[idx]);

  Utl.flattenArrays = (arrayOfArrays) => [].concat(...arrayOfArrays);

  const _isPartitionDelimiter = (item) => item === null || item === undefined;
  Utl.partitionArray = (inputArray, delimiterCheck = _isPartitionDelimiter) => {
    const partitions = [];
    let currentPartition = [];

    inputArray.forEach(item => {
      if (delimiterCheck(item)) {
        if (currentPartition.length > 0) {
          partitions.push(currentPartition);
          currentPartition = [];
        }
      } else {
        currentPartition.push(item);
      }
    });
    if (currentPartition.length > 0) {
      partitions.push(currentPartition);
    }
    return partitions;
  };

  const _condenseWhitespace = (textString) => textString.trim().replace(/\s+/g, " ");

  const _getDecimalCorrectionFactor = (num) => {
    let factor = 1;
    while (num * factor % 1 !== 0) factor *= 10;
    return factor;
  };

  Utl.generateSequence = (startNum, endNum, stepSize) => {
    if (arguments.length < 3) {
      stepSize = 1;
      if (arguments.length < 2) {
        endNum = startNum;
        startNum = 0;
      }
    }
    if (stepSize === 0) throw new Error("Step size cannot be zero for sequence generation.");
    if (Math.abs((endNum - startNum) / stepSize) === Infinity) throw new Error("Infinite sequence detected.");

    const sequence = [];
    const correctionFactor = _getDecimalCorrectionFactor(Math.abs(stepSize));
    let current = startNum * correctionFactor;
    const stopAt = endNum * correctionFactor;
    const stepScaled = stepSize * correctionFactor;

    if (stepScaled < 0) {
      while (current > stopAt) {
        sequence.push(current / correctionFactor);
        current += stepScaled;
      }
    } else {
      while (current < stopAt) {
        sequence.push(current / correctionFactor);
        current += stepScaled;
      }
    }
    return sequence;
  };

  const _regexSpecialChars = /[.*+?^${}()|[\]\\]/g;
  Utl.escapeRegexCharacters = (inputString) => inputString.replace(_regexSpecialChars, "\\$&");

  Utl.roundToPrecision = (numberVal, decimalPlaces = 0) => {
    if (decimalPlaces === 0) return Math.round(numberVal);
    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(numberVal * multiplier) / multiplier;
  };

  Utl.fetchRemote = (resourceURL, mediaType) => {
    return new Promise((resolve, reject) => {
      const httpRequest = new XMLHttpRequest();
      if (mediaType && httpRequest.overrideMimeType) {
        httpRequest.overrideMimeType(mediaType);
      }
      httpRequest.open("GET", resourceURL, true);
      if (mediaType) {
        httpRequest.setRequestHeader("Accept", mediaType);
      }
      httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          const status = httpRequest.status;
          if ((status >= 200 && status < 300) || status === 304 || (!status && httpRequest.response)) {
            resolve(httpRequest);
          } else {
            reject(new Error(`Failed to load resource: ${resourceURL} (Status: ${status})`));
          }
        }
      };
      httpRequest.onerror = () => reject(new Error(`Network error during fetch of: ${resourceURL}`));
      httpRequest.send(null);
    });
  };

})();