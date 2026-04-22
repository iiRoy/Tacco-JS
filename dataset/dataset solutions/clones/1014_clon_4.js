const obtainModule = (moduleName) => require(moduleName);

const outputChannel = {
    emitMessage: (content) => console.log(content)
};

const convertToInteger = (stringValue) => +stringValue;
const representAsString = (value) => `${value}`;

const appendElementToCollection = (collection, element) => {
    collection[collection.length] = element;
    return collection.length;
};

const invertCollectionOrder = (collection) => {
    let start = 0;
    let end = collection.length - 1;
    while (start < end) {
        const temp = collection[start];
        collection[start] = collection[end];
        collection[end] = temp;
        start++;
        end--;
    }
    return collection;
};

const transformCollectionElements = (collection, transformationFunction) => {
    const transformed = [];
    for (let i = 0; i < collection.length; i++) {
        appendElementToCollection(transformed, transformationFunction(collection[i]));
    }
    return transformed;
};

const concatenateCollectionWithSeparator = (collection, separator) => {
    if (collection.length === 0) return '';
    let result = representAsString(collection[0]);
    for (let i = 1; i < collection.length; i++) {
        result += separator + representAsString(collection[i]);
    }
    return result;
};

const extractSubCollection = (collection, startIndex, endIndex) => {
    const subCollection = [];
    for (let i = startIndex; i < endIndex; i++) {
        if (i < collection.length) {
            appendElementToCollection(subCollection, collection[i]);
        } else {
            break;
        }
    }
    return subCollection;
};

const inputProcessor = obtainModule('readline');

let acquiredTextualEntries = [];

const lineAcquirer = inputProcessor.createInterface({
    input: process.stdin,
    output: process.stdout
});

lineAcquirer.on('line', (entryData) => {
    appendElementToCollection(acquiredTextualEntries, entryData);
});

lineAcquirer.on('close', () => {
    processAcquiredData(acquiredTextualEntries);
});

const generateIntervalSequence = (maximumSize, currentSequence = [1]) => {
    const lastTerm = currentSequence[currentSequence.length - 1];
    const nextTermCandidate = 3 * lastTerm + 1;

    if (nextTermCandidate > maximumSize) {
        return currentSequence;
    } else {
        const updatedSequence = [...currentSequence];
        appendElementToCollection(updatedSequence, nextTermCandidate);
        return generateIntervalSequence(maximumSize, updatedSequence);
    }
};

const executeGapInsertion = (dataRef, currentInterval, shiftCounterRef) => {
    const dataContent = dataRef.values;
    const dataSize = dataContent.length;

    const iterateElements = (primaryIndex) => {
        if (primaryIndex >= dataSize) {
            return;
        }

        const valueForInsertion = dataContent[primaryIndex];
        let comparisonPoint = primaryIndex - currentInterval;

        const shiftAndCount = (comparisonPointCurrent) => {
            if (comparisonPointCurrent >= 0 && dataContent[comparisonPointCurrent] > valueForInsertion) {
                dataContent[comparisonPointCurrent + currentInterval] = dataContent[comparisonPointCurrent];
                shiftCounterRef.value++;
                shiftAndCount(comparisonPointCurrent - currentInterval);
            } else {
                dataContent[comparisonPointCurrent + currentInterval] = valueForInsertion;
            }
        };
        shiftAndCount(comparisonPoint);
        iterateElements(primaryIndex + 1);
    };
    iterateElements(currentInterval);
};

const performDisplacedSort = (collectionEnvelope, counterTracker) => {
    const itemSize = collectionEnvelope.values.length;
    const initialIntervals = generateIntervalSequence(itemSize);
    const orderedIntervals = invertCollectionOrder(initialIntervals);

    outputChannel.emitMessage(orderedIntervals.length);
    outputChannel.emitMessage(concatenateCollectionWithSeparator(
        transformCollectionElements(orderedIntervals, representAsString),
        ' '
    ));

    const applyPasses = (passIterator) => {
        if (passIterator >= orderedIntervals.length) {
            return;
        }
        const activeInterval = orderedIntervals[passIterator];
        executeGapInsertion(collectionEnvelope, activeInterval, counterTracker);
        applyPasses(passIterator + 1);
    };

    applyPasses(0);
    return collectionEnvelope.values;
};

const processAcquiredData = (inputRecords) => {
    const totalItemCount = convertToInteger(inputRecords[0]);
    const numericalEntries = transformCollectionElements(
        extractSubCollection(inputRecords, 1, totalItemCount + 1),
        convertToInteger
    );

    const shiftTally = { value: 0 };
    const mutableItemContainer = { values: numericalEntries };

    const finalizedArrangement = performDisplacedSort(mutableItemContainer, shiftTally);

    outputChannel.emitMessage(shiftTally.value);
    outputChannel.emitMessage(concatenateCollectionWithSeparator(
        transformCollectionElements(finalizedArrangement, representAsString),
        '\n'
    ));
};