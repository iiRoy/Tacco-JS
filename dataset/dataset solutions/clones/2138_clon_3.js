/**
 * @class MinHeapUtility
 * @description Implements a min-heap data structure to efficiently manage ordered elements.
 *              The smallest element is always at the root. This structure ensures that
 *              retrieving the minimum element is an O(1) operation.
 */
class MinHeapUtility {
    // Using a private class field for the internal array to encapsulate data.
    #dataElements;

    /**
     * Initializes a new empty MinHeapUtility instance.
     */
    constructor() {
        this.#dataElements = [];
    }

    /**
     * Inserts a new numerical value into the heap, maintaining the min-heap property.
     * The new value is initially placed at the end and then "bubbled up" by
     * repeatedly comparing it with its parent and swapping if necessary,
     * until its correct position is found.
     * @param {number} newValue The numerical value to be inserted into the heap.
     */
    insertValue(newValue) {
        const currentElements = this.#dataElements;
        let currentIndex = currentElements.length;
        currentElements.push(newValue); // Add to the end first

        // Bubble up the new value to maintain the min-heap property.
        // Loop continues as long as the current node has a parent and is smaller than its parent.
        while (currentIndex > 0) {
            const parentIndex = Math.floor((currentIndex - 1) / 2); // Calculate parent index
            const parentValue = currentElements[parentIndex];

            // If the parent is smaller or equal to the new value, the heap property is satisfied.
            if (parentValue <= newValue) {
                break;
            }

            // Otherwise, swap the current element with its parent.
            currentElements[currentIndex] = parentValue;
            currentIndex = parentIndex; // Move up to the parent's position
        }
        currentElements[currentIndex] = newValue; // Place the new value in its final position
    }

    /**
     * Extracts and returns the minimum value from the heap (which is always at the root).
     * After removal, the last element of the heap is moved to the root, and then
     * "bubbled down" to restore the min-heap property by comparing it with its children
     * and swapping with the smaller child until its correct position is found.
     * @returns {number|undefined} The minimum value in the heap, or `undefined` if the heap is empty.
     */
    extractMinimum() {
        const currentElements = this.#dataElements;
        // Handle empty heap case.
        if (currentElements.length === 0) {
            return undefined;
        }
        // Handle single element heap case.
        if (currentElements.length === 1) {
            return currentElements.pop();
        }

        const minimumValue = currentElements[0]; // The smallest element is always at the root.
        const lastElement = currentElements.pop(); // Remove the last element.
        currentElements[0] = lastElement; // Place the last element at the root temporarily.

        let currentIndex = 0;
        const halfLength = Math.floor(currentElements.length / 2); // Optimization: only need to check nodes with children.

        // Bubble down the new root element to maintain the min-heap property.
        while (currentIndex < halfLength) {
            const leftChildIndex = 2 * currentIndex + 1;
            const rightChildIndex = 2 * currentIndex + 2;
            let smallestChildIndex = leftChildIndex; // Assume left child is smaller initially.

            // Determine if the right child exists and is smaller than the left child.
            if (rightChildIndex < currentElements.length && currentElements[rightChildIndex] < currentElements[leftChildIndex]) {
                smallestChildIndex = rightChildIndex;
            }

            // If the element being bubbled down is smaller than or equal to its smallest child,
            // the heap property is restored.
            if (lastElement <= currentElements[smallestChildIndex]) {
                break;
            }

            // Otherwise, swap the current element with its smallest child.
            currentElements[currentIndex] = currentElements[smallestChildIndex];
            currentIndex = smallestChildIndex; // Move down to the child's position.
        }
        currentElements[currentIndex] = lastElement; // Place the bubbled-down element in its final position.
        return minimumValue;
    }

    /**
     * Returns the total number of elements currently stored in the heap.
     * @returns {number} The count of elements in the heap.
     */
    countElements() {
        return this.#dataElements.length;
    }

    /**
     * Returns the minimum element of the heap without removing it.
     * @returns {number|undefined} The minimum value, or `undefined` if the heap is empty.
     */
    peekMinimum() {
        if (this.#dataElements.length === 0) {
            return undefined; // Heap is empty, no minimum to peek.
        }
        return this.#dataElements[0]; // The minimum element is always at index 0.
    }

    /**
     * Checks if the heap is currently empty.
     * @returns {boolean} `true` if the heap contains no elements, `false` otherwise.
     */
    isEmpty() {
        return this.#dataElements.length === 0;
    }
}

/**
 * A utility function for numerical sorting, typically used with Array.prototype.sort().
 * It sorts numbers in ascending order.
 * @param {number} valA The first number for comparison.
 * @param {number} valB The second number for comparison.
 * @returns {number} A negative value if valA < valB, zero if valA == valB, or a positive value if valA > valB.
 */
const numericOrderComparator = (valA, valB) => {
    return valA - valB;
};

/**
 * Calculates the sum of squared differences between each number in an array
 * and a given candidate value. This is often used in statistical contexts
 * (e.g., least squares).
 * @param {number[]} numbersArray The array of numerical data points.
 * @param {number} candidate The candidate value to subtract from each number.
 * @returns {number} The sum of (number - candidate)^2 for all numbers in the array.
 */
function calculateSquaredDeviationSum(numbersArray, candidate) {
    let currentTotalSquaredDeviation = 0;
    // Iterate through each data point to calculate its squared difference.
    for (const dataPoint of numbersArray) {
        const difference = dataPoint - candidate;
        currentTotalSquaredDeviation += Math.pow(difference, 2); // Calculate square of the difference.
    }
    return currentTotalSquaredDeviation;
}

/**
 * Main function to process input data, perform calculations involving sum of squared
 * differences, and output the minimum result. It reads numerical data, sorts it,
 * then iterates through a range of candidate values to find the one that yields
 * the minimum sum of squared deviations from the initial data points.
 * @param {string} rawInputString The raw input string, expected to contain N on the first line
 *                                  and K space-separated numbers on the second line.
 */
function ProcessInputData(rawInputString) {
    // --- Input Validation and Parsing ---
    if (typeof rawInputString !== 'string' || rawInputString.trim() === '') {
        console.error("Runtime Error: The provided input is either not a string or is empty.");
        return;
    }

    const inputLines = rawInputString.trim().split('\n');

    if (inputLines.length < 2) {
        console.error("Runtime Error: Insufficient input lines. Expected at least two lines (N and K values).");
        return;
    }

    // Parse the total count of numbers (N) from the first line.
    const elementCount = parseInt(inputLines[0], 10);
    if (isNaN(elementCount) || elementCount < 1) {
        console.error(`Runtime Error: Invalid or missing element count (N): '${inputLines[0]}'. Must be a positive integer.`);
        return;
    }

    // Parse the array of initial values (K) from the second line.
    // Use filter(Boolean) to remove any empty strings that might result from multiple spaces.
    const initialValues = inputLines[1].split(/\s+/).filter(Boolean).map(Number);

    // Validate that all parsed values are indeed numbers.
    if (initialValues.some(isNaN)) {
        console.error("Runtime Error: One or more initial values are not valid numbers.");
        return;
    }
    // Check if the actual count matches the declared count.
    if (initialValues.length !== elementCount) {
        console.warn(`Data Warning: Declared element count (${elementCount}) does not match the actual number of parsed values (${initialValues.length}). Proceeding with actual count.`);
        // For robustness, we'll proceed using the actual length of initialValues.
    }
    if (initialValues.length === 0) {
        console.info("Info: No initial values provided after parsing. Cannot perform calculations.");
        return;
    }

    // --- Core Logic ---
    // Sort the initial values in ascending order. This is crucial for determining the iteration range.
    initialValues.sort(numericOrderComparator);

    // Initialize our custom min-heap structure to store the calculated sums of squared deviations.
    const resultHeap = new MinHeapUtility();

    // Determine the range for the candidate values.
    // The problem specifies iterating from the smallest K value up to (but not including) the largest K value.
    const smallestOriginalValue = initialValues[0];
    const largestOriginalValue = initialValues[initialValues.length - 1];

    // Iterate through all possible integer candidate values within the identified range.
    // The loop runs from smallestOriginalValue up to (largestOriginalValue - 1).
    for (let currentCandidate = smallestOriginalValue; currentCandidate < largestOriginalValue; currentCandidate++) {
        // Calculate the sum of squared differences for the current candidate value.
        const sumOfSquaredDifferences = calculateSquaredDeviationSum(initialValues, currentCandidate);
        // Insert this sum into our min-heap. The heap will automatically maintain order.
        resultHeap.insertValue(sumOfSquaredDifferences);
    }

    // --- Output Result ---
    // After all calculations, the minimum sum of squared differences will be at the top of the heap.
    const finalMinimumResult = resultHeap.peekMinimum();

    if (finalMinimumResult === undefined) {
        // This case would occur if the loop never ran (e.g., initialValues had only one unique element,
        // making smallestOriginalValue == largestOriginalValue, or if initialValues was empty, though
        // that's guarded earlier).
        console.info("No valid calculations were performed, or the result heap is unexpectedly empty. Check input data range.");
    } else {
        console.log(finalMinimumResult); // Output the smallest calculated sum.
    }
}

// --- Script Execution Entry Point ---
// Read input from standard input and invoke the main processing function.
// A try-catch block is used for graceful error handling during file system operations.
try {
    const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
    ProcessInputData(fileContents);
} catch (ioError) {
    console.error("File System Error: Failed to read input from /dev/stdin. Details:", ioError.message);
}