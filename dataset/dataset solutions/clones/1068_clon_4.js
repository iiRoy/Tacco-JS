const dataStream = require('node:fs').readFileSync('/dev/stdin', 'utf8').split('\n');

function consolidateSortedSegments(segmentA, segmentB) {
    let mergedCollection = [];
    let ptrA = 0;
    let ptrB = 0;

    while (ptrA < segmentA.length && ptrB < segmentB.length) {
        if (segmentA[ptrA] < segmentB[ptrB]) {
            mergedCollection.push(segmentA[ptrA]);
            ptrA++;
        } else {
            mergedCollection.push(segmentB[ptrB]);
            ptrB++;
        }
    }

    return mergedCollection.concat(segmentA.slice(ptrA)).concat(segmentB.slice(ptrB));
}

function orderSequence(inputCollection) {
    if (inputCollection.length <= 1) {
        return inputCollection;
    }

    const midPoint = Math.floor(inputCollection.length / 2);
    const leftPart = inputCollection.slice(0, midPoint);
    const rightPart = inputCollection.slice(midPoint);

    const sortedLeftPart = orderSequence(leftPart);
    const sortedRightPart = orderSequence(rightPart);

    return consolidateSortedSegments(sortedLeftPart, sortedRightPart);
}

const numericalValues = dataStream[1].split(' ').map(Number);
console.log(orderSequence(numericalValues).join(' '));