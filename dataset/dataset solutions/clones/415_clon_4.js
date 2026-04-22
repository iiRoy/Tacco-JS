function processInputString(original) {
    const characterMapping = new Map([['r', '0'], ['g', '1'], ['b', '2']]);
    return original.split('').map(char => characterMapping.get(char) || char).join('');
}

function verifyHomogeneity(textSegment) {
    if (textSegment.length <= 1) return true;
    const initialCharacter = textSegment[0];
    return textSegment.split('').every(char => char === initialCharacter);
}

const colorTransformationRegistry = new Map([
    ['01', '2'], ['02', '1'], ['12', '0']
]);

function deriveTransformedColor(componentA, componentB) {
    const sortedPair = [componentA, componentB].sort().join('');
    return colorTransformationRegistry.get(sortedPair);
}

function determineMinimumConversions(startingState) {
    const explorationQueue = [];
    const recordedDepths = new Map(); // string -> number of operations

    explorationQueue.push(startingState);
    recordedDepths.set(startingState, 0);

    let queuePointer = 0;

    while (queuePointer < explorationQueue.length) {
        const currentConfiguration = explorationQueue[queuePointer++];
        const currentOperationCount = recordedDepths.get(currentConfiguration);

        if (verifyHomogeneity(currentConfiguration)) {
            return currentOperationCount;
        }

        for (let position = 0; position < currentConfiguration.length - 1; ++position) {
            const charAtPosition = currentConfiguration[position];
            const charAtNextPosition = currentConfiguration[position + 1];

            if (charAtPosition === charAtNextPosition) {
                continue;
            }

            const newCommonColor = deriveTransformedColor(charAtPosition, charAtNextPosition);
            
            const nextConfiguration = currentConfiguration.substring(0, position) + newCommonColor.repeat(2) + currentConfiguration.substring(position + 2);

            if (!recordedDepths.has(nextConfiguration)) {
                recordedDepths.set(nextConfiguration, currentOperationCount + 1);
                explorationQueue.push(nextConfiguration);
            }
        }
    }

    return "NA";
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split('\n');

let lineIterator = 0;
while (true) {
    const currentInputLine = inputLines[lineIterator++];
    if (currentInputLine === '0') {
        break;
    }

    const processedInput = processInputString(currentInputLine);
    const finalOutcome = determineMinimumConversions(processedInput);
    console.log(finalOutcome);
}