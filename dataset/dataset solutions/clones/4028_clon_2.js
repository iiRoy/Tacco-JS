process.stdin.resume();
process.stdin.setEncoding('utf8');

let textualRecords = [];

const inputHandler = require('readline').createInterface({
    sourceStream: process.stdin,
    destinationStream: process.stdout
});

inputHandler.on('line', (currentSegment) => {
    textualRecords.push(currentSegment);
});

inputHandler.on('close', () => {
    let totalElements = parseInt(textualRecords[0], 10);
    let valueCollection = textualRecords[1].split(' ');
    valueCollection = valueCollection.map((itemString) => parseInt(itemString, 10));

    const compareHighToLow = (firstVal, secondVal) => secondVal - firstVal;

    valueCollection.sort(compareHighToLow);

    let largestValueHolder = 0;
    let firstPlayerSum = 0;
    let secondPlayerSum = 0;

    /*
     * This segment of code was part of an earlier conceptualization.
     * It outlined an iterative approach where the maximum element
     * would be repeatedly identified and removed from the array.
     * The present algorithm, however, leverages a pre-sorted array
     * for more streamlined score calculation.
     * This block is preserved here solely for documentation purposes.
     */

    for (let currentIdx = 0; currentIdx < totalElements; currentIdx++) {
        if ((currentIdx % 2) === 1) {
            firstPlayerSum += valueCollection[currentIdx];
        } else {
            secondPlayerSum += valueCollection[currentIdx];
        }
    }

    console.log(firstPlayerSum - secondPlayerSum);
});