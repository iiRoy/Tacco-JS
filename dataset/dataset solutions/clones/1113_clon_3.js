(function processArrayForHeap() {
    // Import the file system module for input operations.
    const fileSystem = require('fs');

    // Define the standard input path.
    const standardInputPath = '/dev/stdin';

    /**
     * Helper function to safely read and parse input lines from a specified path.
     * Includes error handling and basic input validation.
     * @param {string} path - The file path to read from (e.g., '/dev/stdin').
     * @returns {string[]} An array of trimmed lines from the input.
     */
    const acquireInputData = (path) => {
        try {
            const rawContent = fileSystem.readFileSync(path, 'utf8');
            // Early check for empty input to prevent further processing errors.
            if (!rawContent.trim()) {
                console.error("Input stream is unexpectedly empty. Exiting operation.");
                process.exit(1); // Terminate with an error code.
            }
            // Trim whitespace from the overall content and split into individual lines.
            return rawContent.trim().split('\n');
        } catch (error) {
            // Catch and report any file system errors during input reading.
            console.error(`Failed to read input from specified path "${path}":`, error.message);
            process.exit(1); // Terminate due to input failure.
        }
    };

    /**
     * Helper function to format and display the final result.
     * @param {number[]} dataElements - The array of numbers to display.
     */
    const presentResult = (dataElements) => {
        // Prepend a descriptive string to the output and join array elements with a space.
        console.log("Transformed sequence: " + dataElements.join(' '));
    };

    // --- Main processing flow starts here ---

    // Retrieve and parse all lines from the standard input.
    const inputLines = acquireInputData(standardInputPath);

    // Extract the first line, which should contain the expected count of elements.
    const firstDataLine = inputLines.shift();
    const expectedElementCount = Number(firstDataLine);

    // Perform validation on the parsed expected element count.
    if (isNaN(expectedElementCount) || expectedElementCount < 0) {
        console.error("Error: Invalid number of elements specified in the first line. Must be a non-negative integer.");
        process.exit(1);
    }

    // Handle the trivial case where no elements are expected.
    if (expectedElementCount === 0) {
        presentResult([]); // Output an empty sequence.
        return; // Exit the main function.
    }

    // Extract the second line, which contains the space-separated array elements.
    const rawElementStrings = inputLines.shift();
    // Guard against a missing second line in the input.
    if (!rawElementStrings) {
        console.error("Error: Missing array elements line in the input stream.");
        process.exit(1);
    }

    // Parse the raw string of elements into an array of numbers.
    const numericalCollection = rawElementStrings
        .split(' ')            // Split by space.
        .filter(s => s !== '') // Remove any empty strings resulting from multiple spaces.
        .map(s => Number(s));  // Convert each string part to a number.

    // Validate that all elements were successfully converted to numbers.
    const invalidElements = numericalCollection.filter(isNaN);
    if (invalidElements.length > 0) {
        console.error("Error: Input array contains non-numeric values. Please provide only numbers.");
        process.exit(1);
    }

    // Warn if the actual number of elements found doesn't match the expected count.
    if (numericalCollection.length !== expectedElementCount) {
        console.warn(`Warning: Expected ${expectedElementCount} elements but found ${numericalCollection.length}. Proceeding with the available elements.`);
    }

    /**
     * Function to convert an array of numbers into a max-heap structure in-place.
     * @param {number[]} inputNumericalArray - The array to be transformed into a max-heap.
     */
    function convertToMaxHeapStructure(inputNumericalArray) {
        const currentArraySize = inputNumericalArray.length;

        // If the array has 0 or 1 element, it's already considered a heap.
        if (currentArraySize <= 1) {
            return;
        }

        /**
         * Helper function to swap two elements within an array.
         * @param {number[]} arrRef - Reference to the array.
         * @param {number} idxA - Index of the first element.
         * @param {number} idxB - Index of the second element.
         */
        const exchangeElements = (arrRef, idxA, idxB) => {
            // Using modern destructuring assignment for an elegant swap.
            [arrRef[idxA], arrRef[idxB]] = [arrRef[idxB], arrRef[idxA]];
        };

        /**
         * Recursive function to maintain the max-heap property by sifting a node down.
         * This ensures that the parent node is always greater than its children.
         * @param {number} parentPosition - The index of the node to start sifting down from.
         */
        const performHeapSiftDown = (parentPosition) => {
            // Assume the current node is the largest initially.
            let largestElementPosition = parentPosition;
            // Calculate child indices using bitwise left shift for potential minor optimization.
            const leftChildPosition = (parentPosition << 1) + 1; // Equivalent to 2 * parentPosition + 1
            const rightChildPosition = (parentPosition << 1) + 2; // Equivalent to 2 * parentPosition + 2

            // Check if the left child exists and is greater than the current largest.
            if (leftChildPosition < currentArraySize && inputNumericalArray[leftChildPosition] > inputNumericalArray[largestElementPosition]) {
                largestElementPosition = leftChildPosition;
            }

            // Check if the right child exists and is greater than the current largest.
            if (rightChildPosition < currentArraySize && inputNumericalArray[rightChildPosition] > inputNumericalArray[largestElementPosition]) {
                largestElementPosition = rightChildPosition;
            }

            // If the largest element is not the current parent, a swap is needed.
            if (largestElementPosition !== parentPosition) {
                // Swap the parent with the largest child.
                exchangeElements(inputNumericalArray, parentPosition, largestElementPosition);
                // Recursively call sift-down on the affected child subtree to maintain heap property.
                performHeapSiftDown(largestElementPosition);
            }
        };

        // The core heap construction loop:
        // Iterate from the last non-leaf node up to the root (index 0).
        // The last non-leaf node is located at index (currentArraySize / 2) - 1.
        for (let k = Math.floor(currentArraySize / 2) - 1; k >= 0; --k) {
            performHeapSiftDown(k); // Apply the sift-down operation to each non-leaf node.
        }
    }

    // Execute the heap conversion on the prepared numerical collection.
    convertToMaxHeapStructure(numericalCollection);

    // Display the final transformed array which is now a max-heap.
    presentResult(numericalCollection);

})(); // This is an Immediately-Invoked Function Expression (IIFE) to encapsulate the script.