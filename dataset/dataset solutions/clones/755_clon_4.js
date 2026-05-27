const processInputData = (rawData) => {
    const dataLines = rawData.trim().split('\n');
    let currentLineIndex = 0;

    const retrieveLine = () => dataLines[currentLineIndex++];
    const retrieveNumericValue = () => Number(retrieveLine());
    const retrieveNumericPair = () => retrieveLine().split(' ').map(Number);
    const retrieveOperationDetails = () => retrieveLine().split(' ');

    const initialUnusedValue = retrieveNumericValue(); // Corresponds to 'n'
    const [arithmeticStart, arithmeticDifference] = retrieveNumericPair(); // Corresponds to 'a', 'd'
    const operationCount = retrieveNumericValue(); // Corresponds to 'm'

    const allOperations = [];
    for (let i = 0; i < operationCount; i++) {
        allOperations.push(retrieveOperationDetails());
    }

    const finalLookupIdentifier = retrieveLine(); // Corresponds to 'k'

    return {
        arithmeticStart,
        arithmeticDifference,
        allOperations,
        finalLookupIdentifier
    };
};

const applyTransformations = (initialMapState, operationList) => {
    return operationList.reduce((currentMapping, [operationType, identifierA, identifierB]) => {
        if (operationType === '0') {
            // Bidirectional mapping or value swap logic
            const valueOfA = currentMapping.has(identifierA) ? currentMapping.get(identifierA) : identifierA;
            const valueOfB = currentMapping.has(identifierB) ? currentMapping.get(identifierB) : identifierB;
            currentMapping.set(identifierA, valueOfB);
            currentMapping.set(identifierB, valueOfA);
        } else { // operationType === '1'
            // Unidirectional mapping logic
            currentMapping.set(identifierA, currentMapping.has(identifierB) ? currentMapping.get(identifierB) : identifierB);
        }
        return currentMapping;
    }, initialMapState);
};

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const { arithmeticStart, arithmeticDifference, allOperations, finalLookupIdentifier } = processInputData(rawInputContent);

const transformationMap = applyTransformations(new Map(), allOperations);

let effectiveIdentifier = finalLookupIdentifier;
if (transformationMap.has(finalLookupIdentifier)) {
    effectiveIdentifier = transformationMap.get(finalLookupIdentifier);
}

const numericEffectiveIdentifier = Number(effectiveIdentifier);
const calculatedResult = arithmeticStart + ((numericEffectiveIdentifier - 1) * arithmeticDifference);

console.log(calculatedResult);
