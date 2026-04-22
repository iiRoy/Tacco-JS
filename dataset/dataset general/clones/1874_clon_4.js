const obtainKind = (subject) => {
  if (subject === null) return 'Null';
  if (subject === undefined) return 'Undefined';
  return Object.prototype.toString.call(subject).slice(8, -1);
};

const isOfKind = (desiredKind, subject) => obtainKind(subject) === desiredKind;

const invokeWithContext = (contextObject, functionReference, ...invocationArguments) =>
  functionReference.apply(contextObject, invocationArguments);

const fetchProperty = (entity, propertyIdentifier) => entity[propertyIdentifier];

const oneIndexed = (element, zeroBasedIndex) => zeroBasedIndex + 1;

const retrieveFinalElement = (dataStructure) => {
  if (dataStructure && typeof dataStructure.length === 'number' && dataStructure.length > 0) {
    return dataStructure[dataStructure.length - 1];
  }
  return undefined; // Consistent with accessing out-of-bounds
};

const findMinimum = (numericCollection) => {
  if (!numericCollection || typeof numericCollection.length !== 'number' || numericCollection.length === 0) {
    return Infinity;
  }
  return Math.min(...Array.from(numericCollection));
};

const findMaximum = (numericCollection) => {
  if (!numericCollection || typeof numericCollection.length !== 'number' || numericCollection.length === 0) {
    return -Infinity;
  }
  return Math.max(...Array.from(numericCollection));
};

const iterateOver = (collection, operation, ...extraArguments) => {
  if (collection === null || typeof collection === 'undefined') return;

  const iterationKeys = [];
  if (Array.isArray(collection) || (typeof collection === 'object' && typeof collection.length === 'number' && collection.length >= 0)) {
    // Covers actual arrays and array-like objects (e.g., arguments, NodeList)
    for (let i = 0; i < collection.length; i++) {
      iterationKeys.push(i);
    }
  } else if (typeof collection === 'object') {
    // Covers plain objects, ensures own enumerable properties
    Object.keys(collection).forEach(key => iterationKeys.push(key));
  }

  iterationKeys.forEach(key => {
    operation(collection[key], key, ...extraArguments);
  });
};

const transformCollection = (dataCollection, transformer, ...additionalParameters) => {
  const results = [];
  if (dataCollection === null || typeof dataCollection === 'undefined' || typeof dataCollection.length !== 'number') {
    return results;
  }
  for (let i = 0; i < dataCollection.length; i++) {
    results.push(transformer(dataCollection[i], i, ...additionalParameters));
  }
  return results;
};

const filterElements = (sourceCollection, predicate, ...additionalParameters) => {
  const results = [];
  if (sourceCollection === null || typeof sourceCollection === 'undefined' || typeof sourceCollection.length !== 'number') {
    return results;
  }
  for (let i = 0; i < sourceCollection.length; i++) {
    if (predicate(sourceCollection[i], i, ...additionalParameters)) {
      results.push(sourceCollection[i]);
    }
  }
  return results;
};

const combineProperties = (targetObject, sourceObject) => {
  // Original iterates sourceObject's properties and assigns to targetObject
  // Object.assign provides equivalent behavior for enumerable own properties
  return Object.assign(targetObject, sourceObject);
};

const extractValues = (collection) => {
  const results = [];
  iterateOver(collection, (item) => results.push(item));
  return results;
};

const extractIdentifiers = (collection) => {
  const results = [];
  iterateOver(collection, (item, key) => results.push(key));
  return results;
};

const replicateObject = (originalSource, propertyNames) => {
  const designatedProperties = propertyNames || extractIdentifiers(originalSource);
  const freshCopy = {};
  designatedProperties.forEach(prop => {
    if (Object.prototype.hasOwnProperty.call(originalSource, prop)) {
      freshCopy[prop] = originalSource[prop];
    }
  });
  return freshCopy;
};

const createMapping = (inputList, valueProducer) => {
  const resultantObject = {};
  if (inputList === null || typeof inputList === 'undefined' || typeof inputList.length !== 'number') {
    return resultantObject;
  }
  for (let i = 0; i < inputList.length; i++) {
    const entry = inputList[i];
    resultantObject[entry] = valueProducer ? valueProducer(entry, i) : true;
  }
  return resultantObject;
};

const calculateTotal = (numericArray) => {
  let sumValue = 0;
  if (numericArray === null || typeof numericArray === 'undefined' || typeof numericArray.length !== 'number') {
    return sumValue;
  }
  for (let i = 0; i < numericArray.length; i++) {
    sumValue += numericArray[i];
  }
  return sumValue;
};