const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\n/);
let elementCount = Number(sourceData[0]);
let dataArray = sourceData[1].split(' ').map(Number);
let exchangeTally = 0;

function sortAndCountExchanges(targetCollection, collectionSize) {
    let currentIteration = 0;
    while (currentIteration < collectionSize) {
        let smallestElementAbsoluteIndex = currentIteration;

        // Find the minimum element's index in the unsorted part of the array.
        // This uses a functional approach (reduce) on a dynamically created slice.
        const remainingElements = targetCollection.slice(currentIteration);
        const relativeMinimumIndex = remainingElements.reduce((minRelativeIdx, currentValue, currentIndex) => {
            if (currentValue < remainingElements[minRelativeIdx]) {
                return currentIndex;
            }
            return minRelativeIdx;
        }, 0); // Initialize with the index of the first element in the slice

        smallestElementAbsoluteIndex = currentIteration + relativeMinimumIndex;

        // Perform the swap if the element at the current position is not already the minimum
        if (targetCollection[currentIteration] !== targetCollection[smallestElementAbsoluteIndex]) {
            const temporaryHolder = targetCollection[currentIteration];
            targetCollection[currentIteration] = targetCollection[smallestElementAbsoluteIndex];
            targetCollection[smallestElementAbsoluteIndex] = temporaryHolder;
            exchangeTally++; // Increment the global counter for swaps
        }
        currentIteration++;
    }
}

sortAndCountExchanges(dataArray, elementCount);
console.log(dataArray.join(' '));
console.log(exchangeTally);
