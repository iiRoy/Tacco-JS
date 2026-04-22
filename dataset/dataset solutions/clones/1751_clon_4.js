'use strict';

function transformNumericalData(incomingStream) {
    const dataSegments = incomingStream.trim().split('\n');

    const quantityOfInitialElements = Number(dataSegments[0]);
    
    const initialElementValues = dataSegments[1]
        .split(' ')
        .map((digitString) => BigInt(digitString));

    const numberOfModificationOperations = Number(dataSegments[2]);

    const modificationInstructions = dataSegments.slice(3).map(
        (instructionLine) => {
            const parts = instructionLine.split(' ');
            return [BigInt(parts[0]), BigInt(parts[1])];
        }
    );

    const elementFrequencies = new Map();

    initialElementValues.forEach((val) => {
        elementFrequencies.set(val, (elementFrequencies.get(val) || 0n) + 1n);
    });

    let currentTotalSum = 0n;
    for (const [valueKey, countValue] of elementFrequencies.entries()) {
        currentTotalSum += valueKey * countValue;
    }

    for (const [sourceValue, destinationValue] of modificationInstructions) {
        const countAtSource = elementFrequencies.get(sourceValue) || 0n;

        const deltaSum = (destinationValue - sourceValue) * countAtSource;
        currentTotalSum += deltaSum;

        console.log(String(currentTotalSum));

        const countAtDestination = elementFrequencies.get(destinationValue) || 0n;
        elementFrequencies.set(destinationValue, countAtDestination + countAtSource);
        elementFrequencies.delete(sourceValue);
    }
}

transformNumericalData(require('fs').readFileSync('/dev/stdin', 'utf8'));