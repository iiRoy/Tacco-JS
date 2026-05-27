const fileSystem = require('fs');

const calculateRequiredSegments = (maximumSumPerSegment, sourceNumbers) => {
    if (sourceNumbers.some(value => value > maximumSumPerSegment)) {
        return Infinity;
    }

    let currentPartitionTotal = 0;
    let partitionCounter = 1;

    for (const numberValue of sourceNumbers) {
        if (currentPartitionTotal + numberValue <= maximumSumPerSegment) {
            currentPartitionTotal += numberValue;
        } else {
            partitionCounter++;
            currentPartitionTotal = numberValue;
        }
    }
    return partitionCounter;
};

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLineArray = rawInputContent.trim().split('\n');

let currentLineIndex = 0;
while (true) {
    const configurationLine = inputLineArray[currentLineIndex++];
    if (configurationLine === '0 0') break;

    const [allowedPartitions, numberOfElements] = configurationLine.split(' ').map(Number);

    const numericDataElements = [];
    for (let i = 0; i < numberOfElements; i++) {
        numericDataElements.push(Number(inputLineArray[currentLineIndex++]));
    }

    let searchLowerBound = 0;
    let searchUpperBound = 1500000; 
    let optimalMaximumSum = 0;

    while (searchLowerBound <= searchUpperBound) {
        const midValue = Math.floor((searchLowerBound + searchUpperBound) / 2);
        
        const segmentsNeeded = calculateRequiredSegments(midValue, numericDataElements);

        if (segmentsNeeded <= allowedPartitions) {
            optimalMaximumSum = midValue;
            searchUpperBound = midValue - 1;
        } else {
            searchLowerBound = midValue + 1;
        }
    }
    console.log(optimalMaximumSum);
}
