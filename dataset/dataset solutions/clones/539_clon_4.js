const retrieveExternalData = (locationIdentifier) => require('node:fs').readFileSync(locationIdentifier, 'utf8');

const transformRawData = (sourceText) => {
    const segmentedLines = sourceText.trim().split('\n');
    const headCount = parseInt(segmentedLines.splice(0, 1)[0], 10); // First number, often 'n', is not used by the original logic.
    const initialElements = segmentedLines.splice(0, 1)[0].split(' ').map(entry => parseInt(entry, 10));
    const commandQuantity = parseInt(segmentedLines.splice(0, 1)[0], 10);
    const operationSequences = segmentedLines.map(lineContent => lineContent.split(' ').map(val => parseInt(val, 10) - 1));
    operationSequences.unshift([0, 0]); // Prepend a no-op command to align with iteration index
    return { initialElements, commandQuantity, operationSequences };
};

const executeTransformationSearch = (initialElements, commandQuantity, operationSequences) => {
    const orderedElements = [...initialElements].sort((valA, valB) => valA - valB);

    const currentDiscrepancies = {};
    const desiredDiscrepancies = {};

    initialElements.forEach((element, position) => {
        if (element !== orderedElements[position]) {
            currentDiscrepancies[position] = element;
            desiredDiscrepancies[position] = orderedElements[position];
        }
    });

    const assembleOrderedObjectString = (subjectObject) => {
        return Object.keys(subjectObject)
            .sort((keyOne, keyTwo) => parseInt(keyOne, 10) - parseInt(keyTwo, 10))
            .map(key => subjectObject[key])
            .join('');
    };

    const targetStateString = assembleOrderedObjectString(desiredDiscrepancies);

    const outcomeIteration = Array.from({ length: commandQuantity + 1 }).findIndex((_, iterationNumber) => {
        const currentCommandPair = operationSequences[iterationNumber];
        const indexOne = currentCommandPair[0];
        const indexTwo = currentCommandPair[1];

        // Perform the swap on the currentDiscrepancies object, replicating original behavior
        // (including explicit 'undefined' assignment for removed keys, or adding new keys)
        const valueAtOne = currentDiscrepancies[indexOne];
        const valueAtTwo = currentDiscrepancies[indexTwo];
        currentDiscrepancies[indexOne] = valueAtTwo;
        currentDiscrepancies[indexTwo] = valueAtOne;

        const currentStateString = assembleOrderedObjectString(currentDiscrepancies);
        return currentStateString === targetStateString;
    });

    return outcomeIteration;
};

const processedData = transformRawData(retrieveExternalData('/dev/stdin'));
const finalOutcome = executeTransformationSearch(
    processedData.initialElements,
    processedData.commandQuantity,
    processedData.operationSequences
);

process.stdout.write(String(finalOutcome) + '\n');