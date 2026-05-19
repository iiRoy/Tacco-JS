const fileSystem = require('fs');
const rawInputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').split('\n');

const elementCount = Number(rawInputLines[0]);

const firstCardCollection = rawInputLines[1].split(' ');
const secondCardCollection = rawInputLines[1].split(' ');

// Helper to extract the first digit as a string for comparison,
// mimicking the original bubbleSort's behavior (which compares the first element of the match result array).
const obtainFirstDigitString = (cardIdentifier) => {
    const matchResult = cardIdentifier.match(/\d/);
    return matchResult ? matchResult[0] : '';
};

// Helper to extract the numeric value of the second character,
// mimicking the original selectionSort's behavior.
const obtainSecondCharNumericValue = (cardIdentifier) => Number(cardIdentifier[1]);

// Type IV clone of bubbleSort: Using Insertion Sort (stable)
function performStableSort(cardSet, setSize) {
    for (let currentPosition = 1; currentPosition < setSize; currentPosition++) {
        let keyElement = cardSet[currentPosition];
        let comparisonPosition = currentPosition - 1;

        // Comparison logic replicates original bubbleSort: string comparison of the first digit found.
        while (comparisonPosition >= 0 && obtainFirstDigitString(cardSet[comparisonPosition]) > obtainFirstDigitString(keyElement)) {
            cardSet[comparisonPosition + 1] = cardSet[comparisonPosition];
            comparisonPosition--;
        }
        cardSet[comparisonPosition + 1] = keyElement;
    }
}

// Type IV clone of selectionSort: Using Heap Sort (unstable)
function performUnstableSort(cardSet, setSize) {
    // Helper function to maintain heap property
    const heapifySubtree = (arr, heapSize, rootIndex) => {
        let largestElementIndex = rootIndex;
        let leftChildIndex = 2 * rootIndex + 1;
        let rightChildIndex = 2 * rootIndex + 2;

        // Comparison logic replicates original selectionSort: numeric comparison of the second character.
        if (leftChildIndex < heapSize && obtainSecondCharNumericValue(arr[leftChildIndex]) > obtainSecondCharNumericValue(arr[largestElementIndex])) {
            largestElementIndex = leftChildIndex;
        }

        // Comparison logic replicates original selectionSort: numeric comparison of the second character.
        if (rightChildIndex < heapSize && obtainSecondCharNumericValue(arr[rightChildIndex]) > obtainSecondCharNumericValue(arr[largestElementIndex])) {
            largestElementIndex = rightChildIndex;
        }

        if (largestElementIndex !== rootIndex) {
            [arr[rootIndex], arr[largestElementIndex]] = [arr[largestElementIndex], arr[rootIndex]];
            heapifySubtree(arr, heapSize, largestElementIndex);
        }
    };

    // Build a max-heap from the input array
    for (let i = Math.floor(setSize / 2) - 1; i >= 0; i--) {
        heapifySubtree(cardSet, setSize, i);
    }

    // Extract elements one by one from the heap
    for (let i = setSize - 1; i > 0; i--) {
        [cardSet[0], cardSet[i]] = [cardSet[i], cardSet[0]];
        heapifySubtree(cardSet, i, 0);
    }
}

performStableSort(firstCardCollection, elementCount);
console.log(firstCardCollection.join(' '));
console.log('Stable');

performUnstableSort(secondCardCollection, elementCount);
console.log(secondCardCollection.join(' '));
console.log((firstCardCollection.join(' ') === secondCardCollection.join(' ')) ? 'Stable' : 'Not stable');
