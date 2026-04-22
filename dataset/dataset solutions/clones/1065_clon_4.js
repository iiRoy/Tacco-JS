function arrangeElements(sourceCollection, targetStorage, maximumValue) {
    const workingCopy = Array.from(sourceCollection);
    const collectionSize = workingCopy.length;
    const auxiliarySpace = new Array(collectionSize);

    function divideAndMerge(dataArray, initialIndex, finalIndex, tempBuffer) {
        if (initialIndex >= finalIndex) {
            return;
        }

        const midPoint = Math.floor((initialIndex + finalIndex) / 2);

        divideAndMerge(dataArray, initialIndex, midPoint, tempBuffer);
        divideAndMerge(dataArray, midPoint + 1, finalIndex, tempBuffer);

        combinePortions(dataArray, initialIndex, midPoint, finalIndex, tempBuffer);
    }

    function combinePortions(dataArray, leftStart, leftEnd, rightEnd, tempBuffer) {
        let leftPtr = leftStart;
        let rightPtr = leftEnd + 1;
        let fillPtr = leftStart;

        while (leftPtr <= leftEnd && rightPtr <= rightEnd) {
            if (dataArray[leftPtr] <= dataArray[rightPtr]) {
                tempBuffer[fillPtr++] = dataArray[leftPtr++];
            } else {
                tempBuffer[fillPtr++] = dataArray[rightPtr++];
            }
        }

        while (leftPtr <= leftEnd) {
            tempBuffer[fillPtr++] = dataArray[leftPtr++];
        }

        while (rightPtr <= rightEnd) {
            tempBuffer[fillPtr++] = dataArray[rightPtr++];
        }

        for (let idx = leftStart; idx <= rightEnd; idx++) {
            dataArray[idx] = tempBuffer[idx];
        }
    }

    divideAndMerge(workingCopy, 0, collectionSize - 1, auxiliarySpace);

    for (let idx = 0; idx < collectionSize; idx++) {
        targetStorage[idx] = workingCopy[idx];
    }
}

var sourceInput = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataLines = sourceInput.split('\n');

var elementCount = +dataLines.shift();
var sequence = dataLines.shift().split(' ').map(function(numString){return +numString;});
var resultContainer = [];

arrangeElements(sequence, resultContainer, elementCount);

console.log(resultContainer.join(' '));