/*
 *  This module facilitates data acquisition, processing, and comparative sorting.
 *  It's designed to read input from a predefined system path, parse numeric and
 *  string identifiers, and then apply two distinct recursive sorting algorithms:
 *  a bubble sort variant and a selection sort variant. Finally, it evaluates
 *  if the sequence of original identifiers matches between the two sorted outputs.
 */

// Global configuration object for input/output operations.
const applicationSettings = {

    // Specifies the source file location for input data.
    sourceFileLocation:     '/dev/stdin',

    // Defines the character sequence used to delineate lines in the input.
    lineBreakCharacter: '\n'
};


// Acquire the Node.js built-in file system utility module.
const fileSystemUtility = require('fs');

// Read the complete content of the specified input file synchronously.
// The content is decoded using UTF-8 and then segmented into an array of strings,
// where each string corresponds to a line, separated by the configured line break.
const rawInputTextLines = fileSystemUtility.readFileSync(applicationSettings.sourceFileLocation, 'utf-8').
                                            split(applicationSettings.lineBreakCharacter);

// Process the second line of the input data (index 1).
// This line is first divided into individual item strings based on spaces.
// Each item string (e.g., "A1") is then transformed into a two-element array:
//   - The first element is an integer parsed from the second character of the item string (e.g., '1' from "A1").
//   - The second element is the original item string itself (e.g., "A1").
// This operation creates a collection of [numericalValue, originalIdentifier] pairs.
const parsedElementCollection = rawInputTextLines[1].split(' ').map(  currentItemString => [  parseInt(currentItemString[1]), currentItemString  ]  );


/**
 *  Executes a single recursive pass of a bubble-like comparison and exchange.
 *  It processes the first two elements of a sequence, swapping them based on their
 *  numeric values if out of order, and then recursively handles the remainder.
 *
 * @param {Array<Array<number|string>>} inputSequence - The array of [value, identifier] pairs.
 * @returns {Array<Array<number|string>>} A new array reflecting the result of the comparison/swap
 *                                        and the recursively processed tail.
 */
const performBubbleSwap = (inputSequence) => {
    // Termination condition: A sequence of one element is considered ordered for this operation.
    if (inputSequence.length === 1) { return inputSequence; }

    // Isolate the initial two elements and the rest of the sequence.
    const firstItem = inputSequence[0];
    const secondItem = inputSequence[1];
    const tailRemainder = inputSequence.slice(2);

    // Compare the primary numeric values of the two elements.
    if (firstItem[0] > secondItem[0]) {
        // If the first item's value is greater, swap their positions and
        // continue the recursive comparison with the rest of the sequence,
        // placing the original first item before the tail.
        return [secondItem, ...performBubbleSwap([firstItem, ...tailRemainder])];
    }
    else {
        // If they are in order (or equal), maintain their positions and
        // continue the recursive comparison with the rest of the sequence,
        // placing the original second item before the tail.
        return [firstItem, ...performBubbleSwap([secondItem, ...tailRemainder])];
    }
};

/**
 *  Implements a recursive bubble sort algorithm. This function iteratively
 *  applies the `performBubbleSwap` operation to progressively move the
 *  largest unsorted element to its correct final position in each pass.
 *
 * @param {Array<Array<number|string>>} inputList - The collection of [value, identifier] pairs to be sorted.
 * @returns {Array<Array<number|string>>} A new array containing the elements sorted by numeric value.
 */
const executeRecursiveBubbleSort = (inputList) => {
    // Base condition: An empty list requires no sorting.
    if (inputList.length === 0) { return []; }

    // Execute one full bubble swap pass over the current list.
    // This action ensures that the largest element within the current `inputList`
    // will "bubble up" to the end of the `bubbleExchangedPortion`.
    const bubbleExchangedPortion = performBubbleSwap(inputList);

    // Divide the result into the sorted last element and the remaining unsorted leading elements.
    const leadingElements = bubbleExchangedPortion.slice(0, bubbleExchangedPortion.length - 1);
    const lastElement = bubbleExchangedPortion[bubbleExchangedPortion.length - 1];

    // Recursively sort the leading elements and then append the now correctly placed last element.
    return [...executeRecursiveBubbleSort(leadingElements), lastElement];
};


/**
 *  Performs a recursive selection sort on a collection of elements.
 *  This method identifies the minimum element in the current collection,
 *  places it at the beginning, and then recursively sorts the remaining elements.
 *  It includes a specific mechanism to handle duplicates for stability considerations.
 *
 * @param {Array<Array<number|string>>} sourceCollection - The array of [value, identifier] pairs to sort.
 * @returns {Array<Array<number|string>>} A new array with elements sorted by their numeric value.
 */
const executeRecursiveSelectionSort = (sourceCollection) => {
    // Base case: An empty collection is inherently sorted.
    if (sourceCollection.length === 0) { return []; }

    // Locate the element with the smallest numeric value within the entire collection.
    const minimumEntry = sourceCollection.reduce(  (currentMinCandidate, itemBeingChecked) =>
                                                    currentMinCandidate[0] > itemBeingChecked[0] ? itemBeingChecked : currentMinCandidate
                                                 );

    // Preserve a reference to the very first element of the original `sourceCollection`.
    // This is vital for maintaining relative order of duplicate elements in the `map` operation below.
    const firstItemInCollection = sourceCollection[0];

    // Construct a new list from the `sourceCollection` (excluding its first element).
    // During this transformation, if an element's original identifier matches that of the `minimumEntry`,
    // it is replaced by `firstItemInCollection`. This specific handling is crucial for simulating
    // how selection sort might affect stability.
    const remainingItemsAfterSelection = sourceCollection.slice(1).map(  currentElement =>
                                                                                currentElement[1] === minimumEntry[1] ? firstItemInCollection : currentElement
                                                                             );

    // Recursively sort the `remainingItemsAfterSelection` and prepend the `minimumEntry`.
    return [minimumEntry, ...executeRecursiveSelectionSort(remainingItemsAfterSelection)];
};


/**
 *  Evaluates if two sorted arrays, specifically based on their original string identifiers,
 *  are identical in sequence. This function compares the elements at corresponding indices
 *  in both arrays using their original string identifiers (`[1]` property).
 *
 * @param {Array<Array<number|string>>} firstSortedOutput - The first sorted array to compare.
 * @param {Array<Array<number|string>>} secondSortedOutput - The second sorted array to compare against.
 * @returns {boolean} `true` if the sequence of original identifiers is identical in both arrays, `false` otherwise.
 */
const verifySortingStability = (firstSortedOutput, secondSortedOutput) =>
    secondSortedOutput.every( (itemFromSecondOutput, currentPositionIndex) =>
        // Check if the original string identifier of the element at `currentPositionIndex`
        // in `firstSortedOutput` matches that in `secondSortedOutput`.
        firstSortedOutput[currentPositionIndex][1] === itemFromSecondOutput[1]
    );


// --- Operational Sequence ---

// Execute the recursive bubble sort on the parsed input data.
const resultOfBubbleSort = executeRecursiveBubbleSort(parsedElementCollection);

// Execute the recursive selection sort on the parsed input data.
const resultOfSelectionSort = executeRecursiveSelectionSort(parsedElementCollection);

// Print the original string identifiers of the elements after bubble sort,
// joined by a space, to the console.
console.log(  resultOfBubbleSort.map(  sortedItem => sortedItem[1]  ).join(' ')  );

// Output a fixed string indicating the stability of the bubble sort.
// (Bubble sort is generally considered a stable sorting algorithm.)
console.log('Stable');

// Print the original string identifiers of the elements after selection sort,
// joined by a space, to the console.
console.log(  resultOfSelectionSort.map(  selectedItem => selectedItem[1]  ).join(' ')  );

// Evaluate if the sequence of original identifiers in the bubble-sorted output
// is identical to that in the selection-sorted output.
// Output 'Stable' if they match, 'Not stable' otherwise.
// (Selection sort, as implemented, often exhibits unstable behavior with duplicates.)
console.log(  verifySortingStability(resultOfBubbleSort, resultOfSelectionSort) ? 'Stable' : 'Not stable'  );