const ioModule = require('node:fs');
const receivedData = ioModule.readFileSync('/dev/stdin', 'utf8').split('\n');

const elementCount = Number(receivedData[0]);
const numericSequence = receivedData[1].split(' ').map(val => parseInt(val, 10));

if (elementCount < 2) {
    console.log(null);
} else {
    let overallSum = 0;
    for (let k = 0; k < numericSequence.length; k++) {
        overallSum += numericSequence[k];
    }

    let currentPartitionSum = 0;
    let smallestDiscrepancy = Infinity;

    for (let splitPoint = 0; splitPoint < elementCount - 1; splitPoint++) {
        currentPartitionSum += numericSequence[splitPoint];
        const remainingSum = overallSum - currentPartitionSum;
        const absoluteDifference = Math.abs(currentPartitionSum - remainingSum);

        if (absoluteDifference < smallestDiscrepancy) {
            smallestDiscrepancy = absoluteDifference;
        }
    }
    console.log(smallestDiscrepancy);
}