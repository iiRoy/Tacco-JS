class SequenceProcessor {
    // A constant representing the modulo value, typically a large prime.
    static readonly MODULO_CONSTANT = 1000000007; // This is (10^9 + 7)

    /**
     * Parses the raw input string to extract processing parameters and the numeric data sequence.
     * @param {string} rawInputString The complete input string, usually from a file or stdin.
     * @returns {object} An object containing the parsed total element count, window size, and the number array.
     * @throws {Error} If the input format does not conform to expectations.
     */
    static parseInputData(rawInputString) {
        // Guard against empty or non-string input.
        if (typeof rawInputString !== 'string' || rawInputString.trim() === '') {
            throw new Error("Provided input data is empty or not a valid string.");
        }

        // Split the entire input into individual lines for easier processing.
        const inputLines = rawInputString.trim().split('\n');

        // Ensure that at least two lines are present: one for parameters, one for the sequence.
        if (inputLines.length < 2) {
            throw new Error("Insufficient number of lines in the input. Expected at least two lines.");
        }

        // Extract and convert parameters (totalElementsCount, slidingWindowSize) from the first line.
        const parameterTokens = inputLines[0].split(' ').map(Number);
        if (parameterTokens.length < 2 || isNaN(parameterTokens[0]) || isNaN(parameterTokens[1])) {
            throw new Error("Failed to parse numeric parameters from the first line.");
        }
        const totalElementsCount = parameterTokens[0];
        const slidingWindowSize = parameterTokens[1];

        // Parse the actual numeric sequence from the second line.
        const numericDataSequence = inputLines[1].split(' ').map(Number);
        if (numericDataSequence.some(val => isNaN(val))) {
            throw new Error("The numeric sequence contains non-numeric entries.");
        }

        // Add a warning for potentially problematic parameter combinations.
        if (totalElementsCount < 0 || slidingWindowSize < 0 || slidingWindowSize > totalElementsCount) {
            console.warn("Warning: Input parameters (N or K) are inconsistent or out of typical range.");
        }

        return { totalElementsCount, slidingWindowSize, numericDataSequence };
    }

    /**
     * Calculates the initial product of the first 'windowLength' elements of a sequence,
     * applying modulo arithmetic at each step to prevent overflow.
     * @param {number[]} sequenceArray The array of numbers to process.
     * @param {number} currentWindowLength The size of the initial window.
     * @returns {number} The product of the elements in the initial window, modulo MODULO_CONSTANT.
     */
    static calculateInitialProductForWindow(sequenceArray, currentWindowLength) {
        let currentWindowProduct = 1; // Multiplicative identity.
        let elementIterator = 0; // Loop counter.

        // Handle an empty window gracefully; product of an empty set is 1.
        if (currentWindowLength === 0) {
            return currentWindowProduct;
        }

        // Multiply elements within the initial window, applying modulo at each step.
        while (elementIterator < currentWindowLength) {
            const currentElement = sequenceArray[elementIterator];
            currentWindowProduct = (currentWindowProduct * currentElement) % SequenceProcessor.MODULO_CONSTANT;
            elementIterator++;
        }
        // Ensure the result is non-negative, even if modulo operations on negative numbers yield negative results.
        return (currentWindowProduct + SequenceProcessor.MODULO_CONSTANT) % SequenceProcessor.MODULO_CONSTANT;
    }

    /**
     * Executes the core sliding window logic, comparing successive window products.
     * @param {number} totalElements The total count of numbers.
     * @param {number} windowSize The length of the sliding window.
     * @param {number[]} dataSequence The array of numbers.
     * @param {number} initialWindowProduct The pre-calculated product of the first window.
     */
    static performSlidingWindowComparison(totalElements, windowSize, dataSequence, initialWindowProduct) {
        let currentProductState = initialWindowProduct; // This holds the modulo product of the current window.
        let currentWindowBeginIndex = 1; // Index for the start of the current window (after the initial one).

        // Iterate through all possible subsequent window positions.
        // The loop continues as long as a full window can be formed.
        while (currentWindowBeginIndex <= totalElements - windowSize) {
            // Identify the element that is leaving the window and the one entering.
            const elementExitingWindow = dataSequence[currentWindowBeginIndex - 1];
            const elementEnteringWindow = dataSequence[currentWindowBeginIndex + windowSize - 1];

            let prospectiveWindowProduct; // Temporary variable for the next window's product.

            // Type III addition: Robust handling for division by zero.
            // If the element leaving the window is zero, the standard sliding window product update formula (division)
            // becomes invalid or problematic. We recompute the product for the new window from scratch.
            if (elementExitingWindow === 0) {
                console.warn(`Encountered zero at index ${currentWindowBeginIndex - 1}. Recomputing product for new window.`);
                // Recompute the product for the new window (from currentWindowBeginIndex up to windowSize elements).
                prospectiveWindowProduct = SequenceProcessor.calculateInitialProductForWindow(
                    dataSequence.slice(currentWindowBeginIndex, currentWindowBeginIndex + windowSize),
                    windowSize
                );
            } else {
                // Calculate the product for the next window.
                // This mirrors the original code's specific calculation:
                // it uses the current (modulo-ed) product, multiplies, and then divides.
                prospectiveWindowProduct = (currentProductState * elementEnteringWindow) / elementExitingWindow;
            }

            // Perform the comparison as per the original logic.
            // This compares the raw result of 'prospectiveWindowProduct' against the current 'currentProductState'.
            const didProductIncrease = prospectiveWindowProduct > currentProductState;

            // Output the result of the comparison.
            SequenceProcessor.displayComparisonOutcome(didProductIncrease);

            // Update the current product state for the next iteration.
            // Ensure the modulo operation correctly handles potential negative results from JavaScript's '%' operator.
            currentProductState = (prospectiveWindowProduct % SequenceProcessor.MODULO_CONSTANT + SequenceProcessor.MODULO_CONSTANT) % SequenceProcessor.MODULO_CONSTANT;

            // Move to the next window position.
            currentWindowBeginIndex++;
        }
    }

    /**
     * Helper method to output the comparison result to the console.
     * @param {boolean} isLarger True if the new product is greater, false otherwise.
     */
    static displayComparisonOutcome(isLarger) {
        if (isLarger) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    }
}

// Immediately Invoked Function Expression (IIFE) to encapsulate the script's main execution flow.
(function processSequenceMain() {
    // Attempt to read the input data from standard input.
    const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    try {
        // Step 1: Parse and validate the input data.
        const { totalElementsCount, slidingWindowSize, numericDataSequence } = SequenceProcessor.parseInputData(rawInputContent);

        // Step 2: Calculate the product for the very first window.
        const initialResultingProduct = SequenceProcessor.calculateInitialProductForWindow(numericDataSequence, slidingWindowSize);

        // Step 3: Execute the sliding window comparison logic and print results.
        SequenceProcessor.performSlidingWindowComparison(totalElementsCount, slidingWindowSize, numericDataSequence, initialResultingProduct);

    } catch (processingError) {
        // Catch and log any errors that occur during the processing.
        console.error("An unrecoverable error occurred during sequence processing:", processingError.message);
        // Exit with a non-zero status code to indicate failure.
        process.exit(1);
    }
})();