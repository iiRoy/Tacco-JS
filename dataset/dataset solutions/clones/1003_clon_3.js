// Configuration for input/output operations, including encoding for file reading.
const applicationSettings = {
    sourcePath: '/dev/stdin', // Defines the standard input file path for the system.
    lineDelimiter: '\n',      // Specifies the character sequence used to separate lines in the input.
    inputEncoding: 'utf-8'    // Sets the character encoding for reading the input file content.
};

// Import the Node.js file system module using the 'node:' prefix for clarity.
const fsModule = require('node:fs');

// Global counter to track the number of comparisons made during the sorting process.
let comparisonCount = 0;

/**
 * Recursively inserts a given numeric element into an array that is assumed to be already sorted.
 * This function ensures the sorted order is maintained by bubbling elements as necessary.
 *
 * @param {number} elementToPlace - The individual number that needs to be inserted into the sorted array.
 * @param {number[]} sortedSegment - The array segment that is already in sorted order.
 * @returns {number[]} A new array containing the 'elementToPlace' correctly positioned within the sorted segment.
 * @throws {TypeError} If the provided 'sortedSegment' is not an array.
 */
const insertIntoSortedSegment = (elementToPlace, sortedSegment) => {
    // Type III Addition: Input validation for robustness.
    if (!Array.isArray(sortedSegment)) {
        throw new TypeError("The 'sortedSegment' parameter must be an array of numbers.");
    }

    // Base case: If the sorted segment is empty, the element to place becomes the sole member.
    if (sortedSegment.length === 0) {
        return [elementToPlace];
    }

    // Extract the first element of the segment and the remainder of the segment.
    const currentFirst = sortedSegment[0];
    const remainingSegment = sortedSegment.slice(1); // Creates a new array for the rest.

    // Compare the element to be placed with the current first element of the segment.
    if (elementToPlace < currentFirst) {
        // If 'elementToPlace' is smaller, it precedes 'currentFirst'.
        // Recursively insert 'currentFirst' into the rest of the segment.
        return [elementToPlace, ...insertIntoSortedSegment(currentFirst, remainingSegment)];
    } else {
        // If 'elementToPlace' is greater than or equal, 'currentFirst' remains in its position.
        // Increment the global comparison counter as a positional decision has been made.
        comparisonCount++;
        // Recursively insert 'elementToPlace' into the remaining segment.
        return [currentFirst, ...insertIntoSortedSegment(elementToPlace, remainingSegment)];
    }
};

/**
 * Implements a recursive insertion sort algorithm to sort an array of numbers.
 * It works by taking the first element, recursively sorting the rest of the array,
 * and then inserting the first element into its correct position within the sorted remainder.
 *
 * @param {number[]} unsortedCollection - The array of numbers that needs to be sorted.
 * @returns {number[]} A new array containing all elements from 'unsortedCollection' in ascending order.
 * @throws {TypeError} If the provided 'unsortedCollection' is not an array.
 */
const performRecursiveInsertionSort = (unsortedCollection) => {
    // Type III Addition: Input validation for robustness.
    if (!Array.isArray(unsortedCollection)) {
        throw new TypeError("The 'unsortedCollection' parameter must be an array of numbers.");
    }

    // Base case: An array with zero or one element is considered already sorted.
    if (unsortedCollection.length <= 1) {
        return [...unsortedCollection]; // Return a shallow copy to maintain immutability.
    }

    // Deconstruct the array: separate the first element from the rest of the collection.
    const primaryElement = unsortedCollection[0];
    const subCollectionForSorting = unsortedCollection.slice(1);

    // Recursively sort the sub-collection first to obtain a sorted segment.
    const sortedSubCollection = performRecursiveInsertionSort(subCollectionForSorting);

    // Insert the primary element into its correct place within the now sorted sub-collection.
    return insertIntoSortedSegment(primaryElement, sortedSubCollection);
};

/**
 * Orchestrates the entire sorting process: reading input, parsing data,
 * executing the sorting algorithm, and displaying the results, along with performance metrics.
 * (Type III Addition: Encapsulating main logic in a dedicated function for better structure.)
 */
const executeSortingProcess = () => {
    // Type III Addition: Reset the global counter at the start of each execution.
    comparisonCount = 0;

    // Read the entire content of the specified input source synchronously.
    const rawInputContent = fsModule.readFileSync(applicationSettings.sourcePath, applicationSettings.inputEncoding);
    // Split the raw content into an array of lines based on the defined delimiter.
    const rawInputLines = rawInputContent.split(applicationSettings.lineDelimiter);

    // Type III Addition: Basic input validation to ensure sufficient data.
    if (rawInputLines.length < 2) {
        console.error("Error: Input data is incomplete. Expected at least two lines for processing.");
        process.exit(1); // Terminate the process with an error code.
    }

    // Parse the second line of input: split by space and convert each part to a number.
    // Using `Number()` for type conversion (Type II Update).
    const numericArrayToSort = rawInputLines[1].split(' ').map(currentStringValue => Number(currentStringValue));

    // Type III Addition: Start a timer to measure the execution duration of the sorting algorithm.
    const startTime = Date.now();

    // Execute the recursive insertion sort algorithm on the prepared numeric array.
    const sortedResultArray = performRecursiveInsertionSort(numericArrayToSort);

    // Type III Addition: End the timer and calculate the duration.
    const endTime = Date.now();
    const executionDurationMs = endTime - startTime;

    // Output the sorted array elements, joined back into a single string with spaces.
    // Explicitly mapping numbers to strings for robust output (Type II Update).
    console.log(sortedResultArray.map(num => String(num)).join(' '));

    // Output the final count of comparison operations performed.
    console.log(comparisonCount);

    // Type III Addition: Log the performance metric for the sorting operation.
    console.log(`// Sorting routine completed in ${executionDurationMs} milliseconds.`);
};

// Initiate the main sorting process upon script execution.
executeSortingProcess();