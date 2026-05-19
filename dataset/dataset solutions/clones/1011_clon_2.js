let rawData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// Initialize two distinct arrays from the second line of input for separate sorting operations.
let firstArray = rawData[1].split(' ');
let secondArray = rawData[1].split(' ');

// Parse the first line of input to determine the size of the arrays.
let arraySize = Number(rawData[0]);

/**
 * Sorts an array using the Bubble Sort algorithm.
 * This implementation compares elements based on their first numeric character.
 *
 * @param {Array<string>} dataCollection - The array of strings to be sorted.
 * @param {number} collectionLength - The total number of elements in the array.
 *                                    Note: The original code uses the global 'arraySize' instead of this parameter.
 */
function sortWithBubble(dataCollection, collectionLength) {
    // Outer loop controls the number of passes.
    for (let outerIndex = 0; outerIndex < arraySize; outerIndex++) {
        // Inner loop performs comparisons and swaps for each pass.
        for (let innerIndex = arraySize - 1; innerIndex > outerIndex; innerIndex--) {
            // Compare the numeric part of adjacent string elements.
            if (dataCollection[innerIndex].match(/\d/) < dataCollection[innerIndex - 1].match(/\d/)) {
                // Swap elements if they are in the wrong order.
                let temporaryValue = dataCollection[innerIndex];
                dataCollection[innerIndex] = dataCollection[innerIndex - 1];
                dataCollection[innerIndex - 1] = temporaryValue;
            }
        }
    }
}

/**
 * Sorts an array using the Selection Sort algorithm.
 * This implementation compares elements based on the numeric value of their second character.
 *
 * @param {Array<string>} dataSet - The array of strings to be sorted.
 * @param {number} dataCount - The total number of elements in the array.
 */
function sortWithSelection(dataSet, dataCount) {
    // Iterate through the array to find the minimum element.
    for (let mainIterator = 0; mainIterator <= dataCount - 1; mainIterator++) {
        let minIndex = mainIterator; // Assume the current element is the minimum.
        // Inner loop to find the actual minimum element in the unsorted part.
        for (let subIterator = mainIterator; subIterator <= dataCount - 1; subIterator++) {
            // Compare elements based on the numeric value of their second character.
            if (dataSet[subIterator][1] - 0 < dataSet[minIndex][1] - 0) {
                minIndex = subIterator; // Update the index of the minimum element found.
            }
        }
        // Swap the found minimum element with the element at the current position,
        // but only if they are different to maintain relative order of equal elements.
        if (dataSet[mainIterator][1] - 0 !== dataSet[minIndex][1] - 0) {
            // Note: 'tempHolder' is implicitly global, mirroring the original code's behavior.
            tempHolder = dataSet[mainIterator];
            dataSet[mainIterator] = dataSet[minIndex];
            dataSet[minIndex] = tempHolder;
        }
    }
}

// Execute Bubble Sort on the first array.
sortWithBubble(firstArray, arraySize);
// Output the sorted first array.
console.log(firstArray.join(' '));
// Indicate the general stability characteristic of Bubble Sort.
console.log('Stable');

// Execute Selection Sort on the second array.
sortWithSelection(secondArray, arraySize);
// Output the sorted second array.
console.log(secondArray.join(' '));

// Compare the results of both sorting algorithms to determine if Selection Sort maintained stability for this specific input.
console.log((firstArray.join(' ') === secondArray.join(' ')) ? 'Stable' : 'Not stable');
