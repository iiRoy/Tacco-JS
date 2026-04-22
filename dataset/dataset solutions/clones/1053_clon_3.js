// A utility object to keep track of sorting metrics, particularly comparisons.
const sortMetrics = {
    comparisonOperations: 0, // Counts the number of comparisons made during the merge phase.
    reset: function() {
        this.comparisonOperations = 0;
    }
};

/**
 * Reads raw input from stdin and parses the second line into an array of numbers.
 * @returns {number[]} An array of numbers from the input.
 */
const extractNumericalSequence = () => {
    // Acquire the raw input from standard input, decode it as UTF-8, and split into lines.
    // Using file descriptor 0 for stdin is a common practice in Node.js for competitive programming.
    const rawInputLines = require('fs').readFileSync(0, 'utf-8').split('\n');

    // Basic validation for input lines.
    if (!rawInputLines || rawInputLines.length < 2) {
        console.error("Error: Insufficient input lines provided. Expected at least two lines.");
        return [];
    }

    // The actual data sequence is expected on the second line (index 1).
    const dataString = rawInputLines[1];

    if (!dataString || dataString.trim() === "") {
        console.error("Error: Data line (second line) is empty or contains only whitespace.");
        return [];
    }

    // Split the string by spaces and convert each part to a number.
    // Filter out any non-numeric or empty string results from splitting to ensure data integrity.
    const processedNumbers = dataString.split(' ').map(val => Number(val)).filter(val => !isNaN(val));

    // Optional warning if the input line contained text but no valid numbers.
    if (processedNumbers.length === 0 && dataString.trim() !== "") {
        console.warn("Warning: No valid numbers found in the provided input line after parsing.");
    }

    return processedNumbers;
};


/**
 * Merges two sorted subarrays back into the main array.
 * This function is the core of the merge sort algorithm, performing the actual sorting work
 * by combining two pre-sorted segments into a single sorted segment.
 * @param {number[]} primaryArray The array containing the two sorted subarrays to be merged.
 * @param {number} startPoint The starting index (inclusive) of the left subarray.
 * @param {number} splitPoint The index marking the end (exclusive) of the left subarray and start (inclusive) of the right.
 * @param {number} endPoint The ending index (exclusive) of the right subarray.
 */
const integrateSortedIntervals = (primaryArray, startPoint, splitPoint, endPoint) => {
    // Calculate the sizes of the left and right segments for clarity, though not strictly used for loop bounds anymore.
    const sizeLeftSegment = splitPoint - startPoint;
    const sizeRightSegment = endPoint - splitPoint;

    // Create temporary buffers for the left and right segments using Array.prototype.slice().
    // This is a concise way to create copies of the relevant portions of the array.
    const temporaryLeftBuffer = primaryArray.slice(startPoint, splitPoint);
    const temporaryRightBuffer = primaryArray.slice(splitPoint, endPoint);

    // Add sentinel values (positive Infinity) to the end of each temporary buffer.
    // These sentinels simplify the merge loop by ensuring that we don't run out of elements
    // in one buffer while the other still has elements, avoiding explicit boundary checks.
    temporaryLeftBuffer.push(Infinity);
    temporaryRightBuffer.push(Infinity);

    let leftBufferPointer = 0;  // Pointer for tracking the current element in the left temporary buffer.
    let rightBufferPointer = 0; // Pointer for tracking the current element in the right temporary buffer.

    // Iterate through the main array's target range (from startPoint to endPoint)
    // and place elements from the temporary buffers in sorted order.
    for (let currentMergeIndex = startPoint; currentMergeIndex < endPoint; currentMergeIndex++) {
        // Increment the global comparison counter. This operation counts each time
        // an element from one buffer is compared to an element from the other.
        sortMetrics.comparisonOperations++;

        let elementToPlace; // Variable to hold the element selected for placement.
        // Compare the elements pointed to by the current pointers in the temporary buffers.
        if (temporaryLeftBuffer[leftBufferPointer] <= temporaryRightBuffer[rightBufferPointer]) {
            elementToPlace = temporaryLeftBuffer[leftBufferPointer];
            leftBufferPointer++; // Advance pointer for the left buffer.
        } else {
            elementToPlace = temporaryRightBuffer[rightBufferPointer];
            rightBufferPointer++; // Advance pointer for the right buffer.
        }
        // Place the smaller (or equal) element into the primary array at the current merge index.
        primaryArray[currentMergeIndex] = elementToPlace;
    }
};

/**
 * Implements the recursive divide-and-conquer strategy for merge sort.
 * This function divides the array into two halves, recursively sorts them independently,
 * and then merges them back together using the 'integrateSortedIntervals' function.
 * @param {number[]} dataCollection The array segment to be sorted.
 * @param {number} lowerBound The starting index (inclusive) of the current segment.
 * @param {number} upperBound The ending index (exclusive) of the current segment.
 */
const recursivelyDivideAndSort = (dataCollection, lowerBound, upperBound) => {
    // Base case for the recursion: If the segment has 0 or 1 element, it's already sorted.
    // The condition (lowerBound + 1 < upperBound) means there are at least two elements
    // that need to be considered for division and sorting.
    if (lowerBound + 1 < upperBound) {
        // Calculate the middle point to divide the array into two halves.
        // Using bitwise right shift (>>> 1) for efficient integer division by 2,
        // which is equivalent to Math.floor((lowerBound + upperBound) / 2) for non-negative numbers.
        const centralDivisionPoint = (lowerBound + upperBound) >>> 1;

        // Recursively sort the left half of the current segment.
        recursivelyDivideAndSort(dataCollection, lowerBound, centralDivisionPoint);
        // Recursively sort the right half of the current segment.
        recursivelyDivideAndSort(dataCollection, centralDivisionPoint, upperBound);

        // After both halves are sorted, merge them back together into a single sorted segment.
        integrateSortedIntervals(dataCollection, lowerBound, centralDivisionPoint, upperBound);
    }
};

// Main execution block for the sorting program.
// Encapsulated in a try-catch block for robust error handling.
try {
    // Step 1: Obtain the numerical sequence from standard input using a dedicated helper function.
    const numbersToSort = extractNumericalSequence();

    // Step 2: Validate the extracted data. If no numbers were found, log a message and exit.
    if (!numbersToSort || numbersToSort.length === 0) {
        console.log("No numbers to sort were extracted from input or input was invalid. Exiting.");
        process.exit(0); // Exit gracefully.
    }

    // Step 3: Perform the merge sort operation.
    // Reset the comparison counter before starting a new sort to ensure accurate metrics.
    sortMetrics.reset();
    // Initiate the recursive sorting process on the entire array from index 0 to its length.
    recursivelyDivideAndSort(numbersToSort, 0, numbersToSort.length);

    // Step 4: Output the sorted array to the console.
    // The numbers are joined by a space, as per common competitive programming output formats.
    console.log(numbersToSort.join(' '));

    // Step 5: Output the total number of comparisons made during the sorting process.
    // This provides insight into the algorithm's performance for the given input data.
    console.log(sortMetrics.comparisonOperations);

} catch (error) {
    // Catch any unexpected errors that might occur during the execution of the sorting process.
    console.error("An unexpected error occurred during the sorting process:", error.message);
    process.exit(1); // Exit with an error code to indicate failure.
}