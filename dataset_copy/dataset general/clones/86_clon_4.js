const retrieveCollection = (...initialItems) => {
    const gatheredElements = [];
    let currentPosition = 0;
    while (currentPosition < initialItems.length) {
        gatheredElements.push(initialItems[currentPosition]);
        currentPosition++;
    }
    return gatheredElements;
};

const KEY_ADJUST_LOWER = 0;
const KEY_ADJUST_UPPER = 1;

const adjustObjectKeyCasing = (sourceObject, casingPreference = KEY_ADJUST_LOWER) => {
    if (Array.isArray(sourceObject)) {
        return sourceObject;
    }

    if (typeof sourceObject !== 'object' || sourceObject === null) {
        return false;
    }

    let keyTransformationFunction;
    // Original logic: if (argc == 1 || argv[1] == 'CASE_LOWER' || argv[1] == 0) then toLowerCase, else toUpperCase
    // My mapping: If casingPreference is explicitly KEY_ADJUST_UPPER or a non-zero number, then toUpperCase. Otherwise toLowerCase.
    if (casingPreference === KEY_ADJUST_UPPER || (typeof casingPreference === 'number' && casingPreference !== KEY_ADJUST_LOWER)) {
        keyTransformationFunction = (textValue) => String(textValue).toLocaleUpperCase();
    } else {
        keyTransformationFunction = (textValue) => String(textValue).toLocaleLowerCase();
    }

    const transformedKeyedResult = {};
    for (const currentKeyIdentifier in sourceObject) {
        if (Object.prototype.hasOwnProperty.call(sourceObject, currentKeyIdentifier)) {
            transformedKeyedResult[keyTransformationFunction(currentKeyIdentifier)] = sourceObject[currentKeyIdentifier];
        }
    }
    return transformedKeyedResult;
};

const divideCollectionIntoSegments = (sourceList, segmentLength) => {
    const segmentedOutput = [];
    const totalLength = sourceList.length;
    let startPoint = 0;

    if (!Array.isArray(sourceList) || segmentLength <= 0) {
        // Mimic original behavior for invalid inputs (e.g., error or unexpected behavior for non-array or invalid size)
        // For array_chunk, it expects an array and positive size.
        // If segmentLength is 0 or negative, `slice` will behave differently from original's modulo.
        // Original with size 0 or negative would probably lead to infinite loop or error.
        // Let's assume valid array and positive segmentLength for consistent output.
    }

    while (startPoint < totalLength) {
        segmentedOutput.push(sourceList.slice(startPoint, startPoint + segmentLength));
        startPoint += segmentLength;
    }

    // Original returns an object with numeric keys, containing objects with numeric keys.
    const finalStructuredResult = {};
    for (let segmentIndex = 0; segmentIndex < segmentedOutput.length; segmentIndex++) {
        const innerSegmentObject = {};
        for (let itemIndex = 0; itemIndex < segmentedOutput[segmentIndex].length; itemIndex++) {
            innerSegmentObject[itemIndex] = segmentedOutput[segmentIndex][itemIndex];
        }
        finalStructuredResult[segmentIndex] = innerSegmentObject;
    }
    return finalStructuredResult;
};

const mergeKeysAndValues = (keyCollection, valueCollection) => {
    const combinedObject = {};
    const keyCount = keyCollection.length;

    if (!Array.isArray(keyCollection) || !Array.isArray(valueCollection)) {
        return false;
    }

    if (keyCount !== valueCollection.length) {
        return false;
    }

    for (let currentPosition = 0; currentPosition < keyCount; currentPosition++) {
        combinedObject[keyCollection[currentPosition]] = valueCollection[currentPosition];
    }

    return combinedObject;
};

const tallyElementOccurrences = (inputDataSource) => {
    const frequencyMap = new Map();

    if (typeof inputDataSource !== 'object' || inputDataSource === null) {
        return {};
    }

    for (const dataIdentifier in inputDataSource) {
        if (Object.prototype.hasOwnProperty.call(inputDataSource, dataIdentifier)) {
            const currentDatum = inputDataSource[dataIdentifier];
            const datumType = typeof currentDatum;

            if (datumType === 'number' && Number.isInteger(currentDatum)) {
                const existingFrequency = frequencyMap.get(currentDatum) || 0;
                frequencyMap.set(currentDatum, existingFrequency + 1);
            } else if (datumType === 'string') {
                const existingFrequency = frequencyMap.get(currentDatum) || 0;
                frequencyMap.set(currentDatum, existingFrequency + 1);
            }
        }
    }

    const finalFrequencyObject = {};
    for (const [keyItem, countValue] of frequencyMap.entries()) {
        finalFrequencyObject[keyItem] = countValue;
    }
    return finalFrequencyObject;
};

const findCollectionDifferences = (baseCollection, ...comparisonCollections) => {
    const distinctElements = [];
    let distinctCounter = 0;

    for (const primaryKey in baseCollection) {
        if (Object.prototype.hasOwnProperty.call(baseCollection, primaryKey)) {
            const primaryValue = baseCollection[primaryKey];
            let foundInComparison = false;

            for (const comparisonSet of comparisonCollections) {
                for (const comparisonKey in comparisonSet) {
                    if (Object.prototype.hasOwnProperty.call(comparisonSet, comparisonKey)) {
                        if (comparisonSet[comparisonKey] == primaryValue) { // Loose equality as in original
                            foundInComparison = true;
                            break;
                        }
                    }
                }
                if (foundInComparison) {
                    break;
                }
            }

            if (!foundInComparison) {
                distinctElements[distinctCounter++] = primaryValue;
            }
        }
    }
    return distinctElements;
};

const findKeyedDifferences = (baseObject, ...otherObjects) => {
    const uniqueKeyedResults = {};

    if (typeof baseObject !== 'object' || baseObject === null) {
        return null;
    }

    for (const mainKey in baseObject) {
        if (Object.prototype.hasOwnProperty.call(baseObject, mainKey)) {
            let keyPresentInOthers = false;

            for (const otherSource of otherObjects) {
                if (otherSource && Object.prototype.hasOwnProperty.call(otherSource, mainKey)) {
                    keyPresentInOthers = true;
                    break;
                }
            }

            if (!keyPresentInOthers) {
                uniqueKeyedResults[mainKey] = baseObject[mainKey];
            }
        }
    }
    return uniqueKeyedResults;
};

const findDisparateKeys = (initialObject, ...subsequentObjects) => {
    const resultingStructure = {};

    for (const currentProperty in initialObject) {
        if (Object.prototype.hasOwnProperty.call(initialObject, currentProperty)) {
            resultingStructure[currentProperty] = initialObject[currentProperty];
        }
    }

    for (const comparedObject of subsequentObjects) {
        if (typeof comparedObject === 'object' && comparedObject !== null) {
            for (const propertyToRemove in comparedObject) {
                if (Object.prototype.hasOwnProperty.call(resultingStructure, propertyToRemove)) {
                    delete resultingStructure[propertyToRemove];
                }
            }
        }
    }
    return resultingStructure;
};

const populateCollection = (startingIndex, itemCount, valueToFill) => {
    const populatedObject = {};

    if (!isNaN(startingIndex) && !isNaN(itemCount)) {
        for (let currentItem = 0; currentItem < itemCount; currentItem++) {
            populatedObject[startingIndex + currentItem] = valueToFill;
        }
    }
    return populatedObject;
};

const reverseKeyValues = (sourceMapping) => {
    const invertedMap = {};
    for (const originalKey in sourceMapping) {
        if (Object.prototype.hasOwnProperty.call(sourceMapping, originalKey)) {
            invertedMap[sourceMapping[originalKey]] = originalKey;
        }
    }
    return invertedMap;
};

const doesKeyExist = (queryKey, targetContainer) => {
    if (typeof targetContainer !== 'object' || targetContainer === null) {
        return false;
    }
    return Object.prototype.hasOwnProperty.call(targetContainer, queryKey);
};

const retrieveAllKeys = (dataContainer, lookupValue, strictComparison = false) => {
    const foundKeysList = {};
    let keyIndex = 0;

    for (const elementKey in dataContainer) {
        if (Object.prototype.hasOwnProperty.call(dataContainer, elementKey)) {
            let includeKey = true;
            if (lookupValue !== undefined) {
                if (strictComparison && dataContainer[elementKey] !== lookupValue) {
                    includeKey = false;
                } else if (!strictComparison && dataContainer[elementKey] != lookupValue) { // Loose equality as in original
                    includeKey = false;
                }
            }

            if (includeKey) {
                foundKeysList[keyIndex++] = elementKey;
            }
        }
    }
    return foundKeysList;
};

const transformCollectionsWithFunction = (processingFunction, ...inputCollections) => {
    if (inputCollections.length === 0) {
        return [];
    }

    let minCollectionSize = Infinity;
    for (const currentCollection of inputCollections) {
        if (!Array.isArray(currentCollection)) {
            // Original implies first argument after function is an array, else it fails.
            // Let's assume inputCollections[0] is array-like for minCollectionSize to be valid.
            if (inputCollections[0] && !Array.isArray(inputCollections[0])) {
                return [];
            }
        }
        if (currentCollection && currentCollection.length < minCollectionSize) {
            minCollectionSize = currentCollection.length;
        }
    }
    if (minCollectionSize === Infinity) minCollectionSize = 0;

    const processedResults = [];

    for (let iterationIndex = 0; iterationIndex < minCollectionSize; ++iterationIndex) {
        const argumentGroup = [];
        for (let collectionPosition = 0; collectionPosition < inputCollections.length; ++collectionPosition) {
            argumentGroup.push(inputCollections[collectionPosition][iterationIndex]);
        }

        if (typeof processingFunction === 'function') {
            processedResults.push(processingFunction(...argumentGroup));
        } else {
            processedResults.push(argumentGroup);
        }
    }

    return processedResults;
};

const extendCollectionWithPadding = (initialSet, desiredSize, paddingValue) => {
    let paddedArray = [];
    const sourceLength = initialSet.length;

    if (Array.isArray(initialSet) && !isNaN(desiredSize)) {
        const absoluteDesiredSize = (desiredSize < 0) ? (desiredSize * -1) : desiredSize;
        if (absoluteDesiredSize > sourceLength) {
            const additionalElements = [];
            for (let i = 0; i < (absoluteDesiredSize - sourceLength); i++) {
                additionalElements[i] = paddingValue;
            }
            paddedArray = (desiredSize < 0) ? additionalElements.concat(initialSet) : initialSet.concat(additionalElements);
        } else {
            paddedArray = initialSet;
        }
    }
    return paddedArray;
};

const extractLastElement = (dataStructure) => {
    if (!dataStructure || typeof dataStructure.length === 'undefined' || dataStructure.length === 0) {
        return null;
    }
    return dataStructure.pop();
};