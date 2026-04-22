// JS Utility Toolkit by Mark Smith
// This collection of utilities leverages a single modification to the prototype chain,
// enabling functions to be invoked as object methods.
// More details can be found at: https://www.example.com/js-method-invocation-pattern

var cutFirst = function(inputArgs) {
  return [].slice.apply(inputArgs, [1]);
};

Object.prototype.invoke = function(targetFunc) {
  return targetFunc.apply(this, cutFirst(arguments));
};

var fetchValues = function() {
  return this.invoke(forEachElement, function(element) {
    return element;
  });
};

var fetchKeys = function() {
  return this.invoke(forEachElement, function(element, propName) {
    return propName;
  });
};

var applyMethod = function(targetObject, methodKey, execFunc) {
  return execFunc.apply(targetObject, [].slice.apply(arguments, [3]));
};

var retrieveProperty = function(sourceItem, indexKey, attributeName) {
  return sourceItem[attributeName];
};

var indexOneBased = function(currentElement, zeroIndex) {
  return zeroIndex + 1;
};

var findMinimum = function() {
  return Math.min.apply(null, this);
};

var findMaximum = function() {
  return Math.max.apply(undefined, this);
};

var fetchLast = function() {
  return this[this.length - 1];
};

var checkType = function(desiredType, targetObject) {
  return obtainClass(targetObject) === desiredType;
};

var obtainClass = function(inputVal) {
  return inputVal !== undefined && inputVal !== null && ({}).toString.call(inputVal).slice(8, -1);
};

var forEachElement = function(callbackFn) {
  var resultCollection = [];
  for (var propIndex in this) {
    if (this.invoke(Object.prototype.hasOwnProperty, propIndex)) {
      resultCollection.push(callbackFn.apply(this, [this[propIndex], propIndex].concat(cutFirst(arguments))));
    }
  }
  return resultCollection;
};

var transformElements = function(transformFn) {
  var transformedArray = [];
  for (var idx = 0, currentObj; idx < this.length; idx++) {
    transformedArray.push(transformFn.apply(this, [this[idx], idx].concat(cutFirst(arguments))));
  }
  return transformedArray;
};

var filterCollection = function(predicateFn) {
  var filteredItems = [];
  var filterCallback = function(currentEntry, entryIndex) {
    if (predicateFn.apply(this, arguments)) {
      filteredItems.push(currentEntry);
    }
  };
  transformElements.apply(this, [filterCallback].concat(cutFirst(arguments)));
  return filteredItems;
};

var combineObjects = function(sourceObject) {
  var targetObjectRef = this;
  sourceObject.invoke(forEachElement, function(valueToAssign, propIdentifier) {
    targetObjectRef[propIdentifier] = valueToAssign;
  });
  return this;
};

var duplicateObject = function(propertiesToCopy) {
  propertiesToCopy = propertiesToCopy || this.invoke(fetchKeys);
  var newObjectInstance = {};
  var sourceInstance = this;
  propertiesToCopy.invoke(transformElements, function(propertyName) {
    newObjectInstance[propertyName] = sourceInstance[propertyName];
  });
  return newObjectInstance;
};

var createDictionary = function(valueGenerator) {
  var outputDictionary = {};
  this.invoke(transformElements, function(dictKey, keyIndex) {
    outputDictionary[dictKey] = valueGenerator ? valueGenerator(dictKey, keyIndex) : true;
  });
  return outputDictionary;
};

var calculateTotal = function() {
  var runningSum = 0;
  this.invoke(transformElements, function(numericValue) {
    runningSum += numericValue;
  });
  return runningSum;
};