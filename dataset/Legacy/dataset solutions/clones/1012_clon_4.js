const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const contentLines = sourceData.split('\n');
const elementCount = parseInt(contentLines[0], 10);

const initialCards = contentLines[1].split(' ').map(cardString => ({
    original: cardString,
    sortKey: parseInt(cardString[1], 10)
}));

let firstSortArray = initialCards.map(item => ({ ...item }));

function performMergeSort(itemsCollection) {
    if (itemsCollection.length <= 1) {
        return itemsCollection;
    }

    const midPoint = Math.floor(itemsCollection.length / 2);
    const leftSegment = itemsCollection.slice(0, midPoint);
    const rightSegment = itemsCollection.slice(midPoint);

    const sortedLeft = performMergeSort(leftSegment);
    const sortedRight = performMergeSort(rightSegment);

    return combineSortedSegments(sortedLeft, sortedRight);
}

function combineSortedSegments(leftCollection, rightCollection) {
    let combinedResult = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < leftCollection.length && rightIndex < rightCollection.length) {
        if (leftCollection[leftIndex].sortKey <= rightCollection[rightIndex].sortKey) {
            combinedResult.push(leftCollection[leftIndex]);
            leftIndex++;
        } else {
            combinedResult.push(rightCollection[rightIndex]);
            rightIndex++;
        }
    }

    return combinedResult.concat(leftCollection.slice(leftIndex)).concat(rightCollection.slice(rightIndex));
}

const sortedByMerge = performMergeSort(firstSortArray);
const firstOutputStrings = sortedByMerge.map(item => item.original);

console.log(firstOutputStrings.join(' '));
console.log('Stable');

let secondSortArray = initialCards.map(item => ({ ...item }));

function exchangeElements(arr, indexA, indexB) {
    const temporary = arr[indexA];
    arr[indexA] = arr[indexB];
    arr[indexB] = temporary;
}

function partitionArray(arr, lowerBound, upperBound) {
    const pivotItem = arr[upperBound];
    let smallerElementIndex = (lowerBound - 1);

    for (let currentElementIndex = lowerBound; currentElementIndex < upperBound; currentElementIndex++) {
        if (arr[currentElementIndex].sortKey <= pivotItem.sortKey) {
            smallerElementIndex++;
            exchangeElements(arr, smallerElementIndex, currentElementIndex);
        }
    }

    exchangeElements(arr, smallerElementIndex + 1, upperBound);
    return smallerElementIndex + 1;
}

function performQuickSort(arr, lowerBound, upperBound) {
    if (lowerBound < upperBound) {
        const partitionIndex = partitionArray(arr, lowerBound, upperBound);

        performQuickSort(arr, lowerBound, partitionIndex - 1);
        performQuickSort(arr, partitionIndex + 1, upperBound);
    }
}

performQuickSort(secondSortArray, 0, secondSortArray.length - 1);
const secondOutputStrings = secondSortArray.map(item => item.original);

console.log(secondOutputStrings.join(' '));

const firstResultRepresentation = firstOutputStrings.join(' ');
const secondResultRepresentation = secondOutputStrings.join(' ');

console.log(firstResultRepresentation === secondResultRepresentation ? 'Stable' : 'Not stable');
