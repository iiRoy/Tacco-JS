// A reimagined suite of utility functions for JavaScript collections and objects.
// This set of tools introduces a custom invocation method on Object.prototype for streamlined functional programming.
// For further context on custom prototype methods, see: https://example.com/custom-js-prototypes (fictional URL for Type II comment change)

var extractParameters = function(allArguments) {
  // Discards the first argument, returning the rest as an array.
  // This is often used to get arguments passed *after* the primary function in a custom invocation.
  return Array.prototype.slice.call(allArguments, 1);
};

// Augments Object.prototype with an 'execute' method.
// This allows any object to 'call' a function, setting the object as the function's 'this' context,
// and passing subsequent arguments to the function.
Object.prototype.execute = function(targetFunction) {
  if (typeof targetFunction !== 'function') {
    console.warn("Attempted to execute a non-function. Operation skipped.");
    return; // Guard clause: do nothing if targetFunction is not a function
  }
  // Apply the target function using this object as context,
  // and the remaining arguments from the execute call as parameters.
  return targetFunction.apply(this, extractParameters(arguments));
};

var getCollectionValues = function() {
  // Retrieves the values of the current object/collection.
  // Utilizes the custom 'execute' method with a simple identity function.
  return this.execute(processEachElement, function(elementVal) { return elementVal; });
};

var getCollectionKeys = function() {
  // Fetches the keys (property names) of the current object/collection.
  // Employs 'execute' with 'processEachElement' to iterate and extract keys.
  return this.execute(processEachElement, function(elementVal, elementKey) { return elementKey; });
};

var invokeMethodOnObject = function(targetObj, methodName, methodToApply) {
  // A utility to invoke a specific method on an object with additional arguments.
  // The 'methodToApply' is typically ignored, but kept for signature compatibility if needed.
  if (!targetObj || typeof targetObj[methodName] !== 'function') {
    console.error(`Method '${methodName}' not found or not a function on target object.`);
    return undefined; // Guard clause
  }
  var methodArgs = Array.prototype.slice.call(arguments, 3);
  return targetObj[methodName].apply(targetObj, methodArgs);
};

var retrieveProperty = function(contextItem, propertyKey, optionalAttribute) {
  // Accesses a property of an item. 'optionalAttribute' is a redundant parameter here.
  if (contextItem === null || typeof contextItem === 'undefined') {
    return undefined; // Guard clause
  }
  return contextItem[propertyKey];
};

var incrementIndex = function(dataItem, currentIndex) {
  // Returns the current index incremented by one.
  return currentIndex + 1;
};

var findMinimum = function() {
  // Determines the smallest numeric value within the collection.
  // Utilizes Math.min with the collection elements as arguments.
  var currentCollection = this;
  if (!Array.isArray(currentCollection) && !(currentCollection && typeof currentCollection.length === 'number')) {
    console.warn("Attempted to find minimum on a non-array-like object.");
    return NaN; // Guard clause
  }
  return Math.min.apply(null, currentCollection);
};

var findMaximum = function() {
  // Identifies the largest numeric value within the collection.
  // Leverages Math.max with the collection elements.
  var dataSet = this;
  if (!Array.isArray(dataSet) && !(dataSet && typeof dataSet.length === 'number')) {
    console.warn("Attempted to find maximum on a non-array-like object.");
    return NaN; // Guard clause
  }
  return Math.max.apply(undefined, dataSet);
};

var getLastElement = function() {
  // Retrieves the final element of an array-like structure.
  var sourceArray = this;
  if (!sourceArray || sourceArray.length === 0) {
    return undefined; // Guard clause
  }
  return sourceArray[sourceArray.length - 1];
};

var checkTypeMatch = function(expectedClass, subjectObject) {
  // Verifies if an object's internal class tag matches a specified class.
  var actualClassTag = obtainInternalClass(subjectObject);
  return actualClassTag === expectedClass;
};

var obtainInternalClass = function(inputObject) {
  // Extracts the internal [[Class]] property from an object.
  // Handles null and undefined explicitly.
  if (inputObject === null) {
    return "Null";
  }
  if (typeof inputObject === 'undefined') {
    return "Undefined";
  }
  var rawTag = Object.prototype.toString.call(inputObject);
  // Extracts the class name from "[object ClassName]"
  return rawTag.substring(8, rawTag.length - 1);
};

var processEachElement = function(elementProcessor) {
  // Iterates over enumerable properties of 'this' object, applying a processor function.
  // This version focuses on object properties, not array indices.
  var resultArray = [];
  var selfReference = this;

  if (typeof elementProcessor !== 'function') {
    console.error("Processor must be a function for processEachElement.");
    return resultArray; // Guard clause
  }

  for (var propKey in selfReference) {
    // Ensure the property belongs to the object itself, not its prototype chain.
    if (selfReference.execute(Object.hasOwnProperty, propKey)) {
      // Apply the processor, passing value, key, and any extra arguments from the initial call.
      var processorArguments = [selfReference[propKey], propKey].concat(extractParameters(arguments));
      var processedValue = elementProcessor.apply(selfReference, processorArguments);
      resultArray.push(processedValue);
    }
  }
  return resultArray;
};

var transformItems = function(transformationFunction) {
  // Transforms each element in an array-like object using a provided function.
  // Designed for array-like structures with a 'length' property.
  var transformedResult = [];
  var currentCollection = this;

  if (typeof transformationFunction !== 'function') {
    console.error("Transformation function must be provided.");
    return transformedResult; // Guard clause
  }

  // Ensure 'this' is array-like
  if (currentCollection === null || typeof currentCollection.length !== 'number') {
    console.warn("Cannot transform a non-array-like object.");
    return transformedResult;
  }

  var collectionLength = currentCollection.length;
  for (var i = 0; i < collectionLength; i++) {
    // Collect arguments for the transformation function, including the extra ones.
    var argsForTransform = [currentCollection[i], i].concat(extractParameters(arguments));
    transformedResult.push(transformationFunction.apply(currentCollection, argsForTransform));
  }
  return transformedResult;
};

var filterCollection = function(predicateFunction) {
  // Selects elements from a collection that satisfy a given predicate function.
  var matchingElements = [];
  var currentContext = this;

  if (typeof predicateFunction !== 'function') {
    console.error("A predicate function is required for filtering.");
    return matchingElements; // Guard clause
  }

  // Use transformItems as an internal iterator, but with a side effect for filtering.
  var filterProcessor = function(itemValue, itemIndex) {
    var argsForPredicate = [itemValue, itemIndex].concat(extractParameters(arguments));
    if (predicateFunction.apply(currentContext, argsForPredicate)) {
      matchingElements.push(itemValue);
    }
    // Return value of this internal function is discarded, as the result is built via side effect.
    return null;
  };
  
  // The 'transformItems' call handles the iteration, the actual filtering happens in 'filterProcessor'.
  // We pass along any extra arguments from the original 'filterCollection' call.
  currentContext.execute(transformItems, filterProcessor, ...extractParameters(arguments));

  return matchingElements;
};

var assimilateProperties = function(sourceObject) {
  // Merges properties from a source object into the current object ('this').
  // Existing properties on 'this' will be overwritten by properties from 'sourceObject'.
  var destinationObject = this;
  if (!sourceObject || typeof sourceObject !== 'object') {
    console.warn("Source object for assimilation must be a valid object.");
    return destinationObject; // Guard clause
  }

  // Iterate over the source object's properties using the custom 'execute' and 'processEachElement'.
  sourceObject.execute(processEachElement, function(valueFromSource, keyFromSource) {
    destinationObject[keyFromSource] = valueFromSource;
  });
  return destinationObject;
};

var duplicateStructure = function(specificAttributes) {
  // Creates a shallow clone of the current object, optionally restricted to specific attributes.
  // If 'specificAttributes' is not provided, all enumerable own properties are cloned.
  var sourceObject = this;
  var targetClone = {};
  var attributesToCopy;

  if (specificAttributes) {
    // If attributes are specified, ensure it's an array-like structure.
    if (!Array.isArray(specificAttributes)) {
      console.warn("Specific attributes for cloning should be provided as an array.");
      attributesToCopy = sourceObject.execute(getCollectionKeys); // Fallback to all keys
    } else {
      attributesToCopy = specificAttributes;
    }
  } else {
    // No specific attributes, so get all keys from the source object.
    attributesToCopy = sourceObject.execute(getCollectionKeys);
  }

  // Use 'transformItems' to iterate over the attribute names and copy them.
  attributesToCopy.execute(transformItems, function(attrName) {
    // Ensure the attribute actually exists on the source object before copying.
    if (sourceObject.hasOwnProperty(attrName)) {
      targetClone[attrName] = sourceObject[attrName];
    }
  });
  return targetClone;
};

var indexByValue = function(keyGenerationFunction) {
  // Creates an object where keys are derived from collection items, and values are generated.
  // If no keyGenerationFunction is provided, items become keys with a value of 'true'.
  var resultDictionary = {};
  var currentItems = this;
  
  // Ensure 'this' is array-like for iteration.
  if (currentItems === null || typeof currentItems.length !== 'number') {
    console.warn("Cannot index a non-array-like object.");
    return resultDictionary;
  }

  currentItems.execute(transformItems, function(itemElement, elementIndex) {
    var generatedKey;
    var generatedValue;

    if (typeof keyGenerationFunction === 'function') {
      // If a function is provided, use it to generate the value.
      generatedKey = itemElement; // Item itself is the key
      generatedValue = keyGenerationFunction(itemElement, elementIndex);
    } else {
      // Default behavior: item is key, value is true.
      generatedKey = itemElement;
      generatedValue = true;
    }
    resultDictionary[generatedKey] = generatedValue;
  });
  return resultDictionary;
};

var calculateTotal = function() {
  // Computes the sum of all numeric elements in the collection.
  var runningTotal = 0;
  var dataElements = this;

  // Use transformItems to iterate and accumulate the sum.
  dataElements.execute(transformItems, function(numItem) {
    if (typeof numItem === 'number' && !isNaN(numItem)) { // Validation: only sum numbers
      runningTotal += numItem;
    } else {
      console.warn(`Non-numeric item encountered: ${numItem}. Skipping.`);
    }
  });
  return runningTotal;
};