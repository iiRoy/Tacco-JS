const appSettings = {
    sourceFile: '/dev/stdin', // Defines the path for reading input data
    lineBreakChar: '\n'       // Specifies the character used to separate lines in the input
};

// Reads the entire content of the specified input file, decodes it as UTF-8,
// and then splits the content into an array of strings based on the line break character.
const inputDataRows = require('fs').readFileSync(appSettings.sourceFile, 'utf-8').split(appSettings.lineBreakChar);

let comparisonSwaps = 0; // A global counter to track specific comparison-based operations

/**
 * Recursively inserts a given numeric element into a sorted array, maintaining the sorted order.
 * This function also increments a global counter (`comparisonSwaps`) when an element
 * is placed after an existing element (indicating a "swap" in the context of this algorithm).
 *
 * @param {number} elementToInsert - The number that needs to be inserted into the array.
 * @param {number[]} currentArray - The array (assumed to be sorted) into which the element is inserted.
 * @returns {number[]} A new array with the element inserted in its correct sorted position.
 */
const insertAndCount = (elementToInsert, currentArray) => {
    // Base case: If the array is empty, the element becomes the sole member of a new array.
    if (currentArray.length === 0) {
        return [elementToInsert];
    }

    // Deconstruct the array into its first element and the rest of the elements.
    const firstItem = currentArray[0];
    const remainingItems = currentArray.slice(1);

    // If the element to insert is smaller than the first item,
    // it should come before the first item. Recursively insert the first item into the rest.
    if (elementToInsert < firstItem) {
        return [elementToInsert].concat(insertAndCount(firstItem, remainingItems));
    }
    // Otherwise (if elementToInsert is greater than or equal to firstItem),
    // the first item stays in its place. Increment the swap counter and
    // recursively insert the elementToInsert into the remaining items.
    else {
        comparisonSwaps++; // Increment the counter for this specific type of comparison/placement.
        return [firstItem].concat(insertAndCount(elementToInsert, remainingItems));
    }
};

/**
 * Implements a recursive sorting algorithm that sorts an array of numbers.
 * It works by taking the first element, recursively sorting the rest of the array,
 * and then inserting the first element into the now-sorted remainder using `insertAndCount`.
 *
 * @param {number[]} inputCollection - The array of numbers to be sorted.
 * @returns {number[]} A new array containing the sorted numbers.
 */
const performRecursiveSort = (inputCollection) => {
    // Base case: An array with 0 or 1 element is considered already sorted.
    if (inputCollection.length <= 1) {
        return inputCollection;
    }

    // Separate the very first element from the rest of the collection.
    const initialElement = inputCollection[0];
    const subsequentElements = inputCollection.slice(1);

    // Recursively sort the subsequent elements, then insert the initial element
    // into the resulting sorted sub-array using the helper function.
    return insertAndCount(initialElement, performRecursiveSort(subsequentElements));
};

// The second line of inputDataRows (index 1) contains the numbers to be sorted.
// It's split by spaces, each part is converted to an integer, then the resulting
// array of numbers is sorted using `performRecursiveSort`. Finally, the sorted
// numbers are joined back into a single string with spaces and printed to console.
console.log(performRecursiveSort(inputDataRows[1].split(' ').map(itemStr => parseInt(itemStr))).join(' '));

// The final value of the comparisonSwaps counter is printed to the console.
console.log(comparisonSwaps);
