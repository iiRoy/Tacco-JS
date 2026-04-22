const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let collectedSegments = [];

inputReader.on('line', (dataSegment) => {
    collectedSegments.push(dataSegment);
});

inputReader.on('close', () => {
    const allInputRows = collectedSegments;

    const quantityIdentifier = parseInt(allInputRows[0], 10);
    const initialNumericalSequence = allInputRows[1].split(' ').map(Number);

    const orderedNumericalSequence = [...initialNumericalSequence].sort((first, second) => first - second);

    const comparisonThresholdIndex = Math.floor((quantityIdentifier - 1) / 2);

    const valueIfHigherRank = orderedNumericalSequence[comparisonThresholdIndex];
    const valueIfLowerRank = orderedNumericalSequence[comparisonThresholdIndex + 1];

    const positionMapping = new Map();
    orderedNumericalSequence.forEach((currentValue, currentIndex) => {
        if (!positionMapping.has(currentValue)) {
            positionMapping.set(currentValue, []);
        }
        positionMapping.get(currentValue).push(currentIndex);
    });

    const finalOutputs = initialNumericalSequence.map((originalValue) => {
        const correspondingRank = positionMapping.get(originalValue).pop();

        if (correspondingRank <= comparisonThresholdIndex) {
            return valueIfLowerRank;
        } else {
            return valueIfHigherRank;
        }
    });

    finalOutputs.forEach(resultEntry => console.log(resultEntry));
});