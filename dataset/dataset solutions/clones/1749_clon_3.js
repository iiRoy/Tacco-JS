const fileSystem = require('fs');

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

let inputLineSegments = rawInputData.split('\n');

const initialArrayDimension = Number.parseInt(inputLineSegments.shift(), 10);

let primaryNumericCollection = inputLineSegments.shift().split(' ').map(str => Number.parseInt(str, 10));

const totalOperationCount = Number.parseInt(inputLineSegments.shift(), 10);

if (inputLineSegments.length > 0 && inputLineSegments[inputLineSegments.length - 1] === '') {
    inputLineSegments.pop();
}

const aggregateValues = (currentAccumulator, currentValue) => currentAccumulator + currentValue;

let valueFrequencyMap = new Map();
for (const num of primaryNumericCollection) {
    valueFrequencyMap.set(num, (valueFrequencyMap.get(num) || 0) + 1);
}

let currentOverallSum = primaryNumericCollection.reduce(aggregateValues, 0);

for (let operationIndex = 0; operationIndex < totalOperationCount; operationIndex++) {
    const operationParameters = inputLineSegments[operationIndex].split(' ');
    const targetValueToReplace = Number.parseInt(operationParameters[0], 10);
    const replacementValue = Number.parseInt(operationParameters[1], 10);

    if (valueFrequencyMap.has(targetValueToReplace)) {
        const occurrencesOfTarget = valueFrequencyMap.get(targetValueToReplace);

        currentOverallSum = currentOverallSum - (occurrencesOfTarget * targetValueToReplace) + (occurrencesOfTarget * replacementValue);

        valueFrequencyMap.delete(targetValueToReplace);
        valueFrequencyMap.set(replacementValue, (valueFrequencyMap.get(replacementValue) || 0) + occurrencesOfTarget);
    }
    
    console.log(currentOverallSum);
}