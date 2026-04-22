const sourceConfiguration = {
    resourcePath: '/dev/stdin',
    lineSeparator: '\n'
};

const fileUtility = require('node:fs');

const rawContent = fileUtility.readFileSync(sourceConfiguration.resourcePath, 'ascii');

const contentLines = rawContent.split(sourceConfiguration.lineSeparator);
const numericalSequence = contentLines[1].split(' ').map(Number);

function processAndCountInversions(dataCollection) {

    function mergeSortAndCount(arr, startBound, endBound) {
        if (startBound >= endBound) {
            return 0;
        }

        const midPoint = Math.floor((startBound + endBound) / 2);
        let currentInversions = 0;

        currentInversions += mergeSortAndCount(arr, startBound, midPoint);
        currentInversions += mergeSortAndCount(arr, midPoint + 1, endBound);

        currentInversions += mergeAndCount(arr, startBound, midPoint, endBound);

        return currentInversions;
    }

    function mergeAndCount(arr, start, mid, end) {
        const leftSegment = arr.slice(start, mid + 1);
        const rightSegment = arr.slice(mid + 1, end + 1);

        let leftPointer = 0;
        let rightPointer = 0;
        let mainArrayPointer = start;
        let inversionCount = 0;

        while (leftPointer < leftSegment.length && rightPointer < rightSegment.length) {
            if (leftSegment[leftPointer] <= rightSegment[rightPointer]) {
                arr[mainArrayPointer++] = leftSegment[leftPointer++];
            } else {
                arr[mainArrayPointer++] = rightSegment[rightPointer++];
                inversionCount += (leftSegment.length - leftPointer);
            }
        }

        while (leftPointer < leftSegment.length) {
            arr[mainArrayPointer++] = leftSegment[leftPointer++];
        }

        while (rightPointer < rightSegment.length) {
            arr[mainArrayPointer++] = rightSegment[rightPointer++];
        }

        return inversionCount;
    }

    return mergeSortAndCount(dataCollection, 0, dataCollection.length - 1);
}

const totalInversions = processAndCountInversions(numericalSequence);

console.log(numericalSequence.join(' '));
console.log(totalInversions);