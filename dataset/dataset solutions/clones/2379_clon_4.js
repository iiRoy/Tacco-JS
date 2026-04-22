const fileSystemModule = require('fs');
let dataBuffer = '';
try {
    dataBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
} catch (e) {
    // Fallback for environments where /dev/stdin might not exist or be readable
    // For example, local testing without piping input, this provides a default
    // Example: 4 elements, sequence 0, 1, 0, 2
    dataBuffer = `4\n0 1 0 2`;
}

const incomingTextLines = dataBuffer.trim().split('\n');
let currentLinePosition = 0;

const accessNextValue = () => {
    if (currentLinePosition >= incomingTextLines.length) {
        throw new Error("Source Exhausted: No further input can be retrieved.");
    }
    return incomingTextLines[currentLinePosition++];
};

const obtainInteger = () => parseInt(accessNextValue(), 10);
const obtainNumericArray = () => accessNextValue().split(' ').map(Number);

const displayResult = (content) => console.log(content);

const calculateCombinations = () => {
    const totalCount = obtainInteger();
    const sequenceOfNumbers = obtainNumericArray();
    const calculationModulus = 1000000007;

    if (sequenceOfNumbers[0] !== 0) {
        displayResult(0);
        return;
    }

    const initialProcessingState = {
        redIndicator: 1,
        blueIndicator: 0,
        greenIndicator: 0,
        accumulatedOutcome: 3
    };

    const finalProcessingState = sequenceOfNumbers.slice(1).reduce((currentState, currentElementValue) => {
        let matchingPointers = 0;

        if (currentElementValue === currentState.redIndicator) {
            matchingPointers++;
        }
        if (currentElementValue === currentState.blueIndicator) {
            matchingPointers++;
        }
        if (currentElementValue === currentState.greenIndicator) {
            matchingPointers++;
        }

        let nextRedIndicator = currentState.redIndicator;
        let nextBlueIndicator = currentState.blueIndicator;
        let nextGreenIndicator = currentState.greenIndicator;

        if (currentElementValue === currentState.redIndicator) {
            nextRedIndicator++;
        } else if (currentElementValue === currentState.blueIndicator) {
            nextBlueIndicator++;
        } else if (currentElementValue === currentState.greenIndicator) {
            nextGreenIndicator++;
        }

        const nextAccumulatedOutcome = (currentState.accumulatedOutcome * matchingPointers) % calculationModulus;

        return {
            redIndicator: nextRedIndicator,
            blueIndicator: nextBlueIndicator,
            greenIndicator: nextGreenIndicator,
            accumulatedOutcome: nextAccumulatedOutcome
        };
    }, initialProcessingState);

    displayResult(finalProcessingState.accumulatedOutcome);
};

calculateCombinations();