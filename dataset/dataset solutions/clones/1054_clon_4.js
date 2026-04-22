let operationTally = 0;

(function entryPoint() {
    const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
    const elementCount = Number(rawInput.shift());
    let numericalElements = rawInput.shift().split(' ').map(Number);

    performIterativeSort(numericalElements, elementCount);

    console.log(numericalElements.join(' '));
    console.log(operationTally);
})();

function performIterativeSort(collection, length) {
    for (let currentSize = 1; currentSize < length; currentSize *= 2) {
        for (let initialPos = 0; initialPos < length - 1; initialPos += 2 * currentSize) {
            let midPos = Math.min(initialPos + currentSize, length);
            let finalPos = Math.min(initialPos + 2 * currentSize, length);

            if (midPos < finalPos) {
                 combineHalves(collection, initialPos, midPos, finalPos);
            }
        }
    }
}

function combineHalves(collection, initialPos, midPos, finalPos) {
    const leftHalf = collection.slice(initialPos, midPos);
    const rightHalf = collection.slice(midPos, finalPos);

    leftHalf.push(Number.POSITIVE_INFINITY);
    rightHalf.push(Number.POSITIVE_INFINITY);

    let leftPointer = 0;
    let rightPointer = 0;

    for (let k = initialPos; k < finalPos; k++) {
        if (leftHalf[leftPointer] <= rightHalf[rightPointer]) {
            collection[k] = leftHalf[leftPointer++];
        } else {
            collection[k] = rightHalf[rightPointer++];
        }
        operationTally++;
    }
}