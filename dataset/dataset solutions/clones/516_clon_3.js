const systemInputProvider = require('fs');
const rawContentBuffer = systemInputProvider.readFileSync('/dev/stdin', 'utf8');

let processedInputLines = rawContentBuffer.trim().split('\n');

const extractNumericSequence = (lineString) => {
    if (typeof lineString !== 'string' || lineString.length === 0) {
        return [];
    }
    return lineString.split(' ').map(segment => Number.parseInt(segment.trim(), 10)).filter(num => !isNaN(num));
};

let currentReadPointer = 0;
while (true) {
    if (currentReadPointer >= processedInputLines.length || processedInputLines[currentReadPointer].trim() === '') {
        break;
    }
    const primaryItemCountString = processedInputLines[currentReadPointer++];
    const initialItemQuantity = Number.parseInt(primaryItemCountString, 10);

    if (initialItemQuantity === 0) {
        break;
    }

    const scoreBaseLine = processedInputLines[currentReadPointer++];
    const baseScoreComponents = extractNumericSequence(scoreBaseLine);

    const adjustmentFactorsLine = processedInputLines[currentReadPointer++];
    let incrementalAdjustments = extractNumericSequence(adjustmentFactorsLine);

    let totalCurrentScore = baseScoreComponents.reduce((acc, currentVal) => acc + currentVal, 0);

    incrementalAdjustments.sort((valA, valB) => valB - valA);

    let highestAchievedProduct = totalCurrentScore * initialItemQuantity;

    let mutableItemCounter = initialItemQuantity;

    while (incrementalAdjustments.length > 0) {
        mutableItemCounter--;

        const currentAdjustmentValue = incrementalAdjustments.shift();
        totalCurrentScore += currentAdjustmentValue;

        const potentialNewProduct = totalCurrentScore * mutableItemCounter;

        highestAchievedProduct = Math.max(highestAchievedProduct, potentialNewProduct);
    }

    console.log(highestAchievedProduct);
}