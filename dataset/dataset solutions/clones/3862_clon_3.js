function analyzeZeroSumSubarrays(inputDataSet) {
    // This helper function is responsible for parsing the raw input string
    // into a structured format containing the array length and numeric values.
    const extractNumericalData = (rawDataString) => {
        // Guard clause: Handle cases where the input string is empty or just whitespace.
        if (!rawDataString || rawDataString.trim() === '') {
            console.warn("Received empty or whitespace-only input string. Processing with default empty values.");
            return { totalElements: 0, numericalSequence: [] };
        }

        // Split the input into individual lines.
        const allInputLines = rawDataString.split('\n');

        // Ensure there are at least two lines: one for count, one for numbers.
        if (allInputLines.length < 2) {
            console.error("Insufficient input lines. Expected at least two lines (count and numbers).");
            return { totalElements: 0, numericalSequence: [] };
        }

        // Parse the first line as the expected count of elements.
        const declaredElementCount = parseInt(allInputLines[0].trim(), 10);

        // Validate the parsed count: must be a non-negative integer.
        if (isNaN(declaredElementCount) || declaredElementCount < 0) {
            console.error(`Invalid element count detected: '${allInputLines[0].trim()}'. Using 0 elements.`);
            return { totalElements: 0, numericalSequence: [] };
        }

        // Parse the second line, splitting by space and converting to numbers.
        const rawNumericStrings = allInputLines[1].trim().split(' ');
        const parsedNumericalSequence = rawNumericStrings.map(Number);

        // Filter out any non-numeric values that might result from map(Number) on non-numeric strings.
        const validatedNumericalSequence = parsedNumericalSequence.filter(val => !isNaN(val));

        // Optional warning if the actual number of elements doesn't match the declared count.
        if (validatedNumericalSequence.length !== declaredElementCount) {
            console.warn(`Element count mismatch: Declared ${declaredElementCount}, but found ${validatedNumericalSequence.length} valid numbers.`);
            // For robustness, we proceed with the actual number of valid elements found.
        }

        return {
            totalElements: validatedNumericalSequence.length,
            numericalSequence: validatedNumericalSequence
        };
    };

    // Extract the element count and the array of numbers from the input.
    const { totalElements, numericalSequence } = extractNumericalData(inputDataSet);

    // If there are no elements, there can be no zero-sum subarrays.
    if (totalElements === 0) {
        console.log(0);
        return;
    }

    // A Map is used to store the frequencies of prefix sums.
    // Using a Map is generally preferred over a plain object for arbitrary keys (especially numbers)
    // as it prevents potential conflicts with prototype properties and offers better performance for frequent additions/lookups.
    const prefixSumOccurrences = new Map();

    // Initialize the map with a prefix sum of 0 having occurred once.
    // This accounts for subarrays that start from the beginning of the sequence and sum to zero.
    prefixSumOccurrences.set(0, 1);

    let runningAggregateSum = 0; // This variable tracks the sum of elements up to the current index.

    // Iterate through the numerical sequence to compute prefix sums and update their frequencies.
    for (let currentElementIndex = 0; currentElementIndex < totalElements; currentElementIndex++) {
        const currentNumericalValue = numericalSequence[currentElementIndex];

        // Basic type validation for the current element (should be numeric after parsing).
        if (typeof currentNumericalValue !== 'number' || isNaN(currentNumericalValue)) {
            console.warn(`Non-numeric value encountered at index ${currentElementIndex}. Skipping this element.`);
            continue; // Skip invalid entries to prevent errors in sum calculation.
        }

        // Accumulate the current element into the running sum.
        runningAggregateSum += currentNumericalValue;

        // Retrieve the current frequency of this running sum; default to 0 if not yet seen.
        const existingCount = prefixSumOccurrences.get(runningAggregateSum) || 0;

        // Increment and store the updated frequency.
        prefixSumOccurrences.set(runningAggregateSum, existingCount + 1);
    }

    // Helper function to compute the number of combinations 'n choose 2'.
    // This formula (n * (n - 1) / 2) calculates how many distinct pairs can be chosen from 'n' items.
    // Each pair of indices where prefix sums are equal defines a unique zero-sum subarray.
    const calculatePairsFromCount = (nItems) => {
        // If there are fewer than 2 items, no pairs can be formed.
        if (nItems < 2) {
            return 0;
        }
        // Use Math.floor to ensure the result is an integer, as expected for counts.
        return Math.floor(nItems * (nItems - 1) / 2);
    };

    let finalZeroSumSubarrayCount = 0; // This will store our final answer.

    // Iterate through the values (frequencies) stored in the prefixSumOccurrences Map.
    for (const frequencyOfSum of prefixSumOccurrences.values()) {
        // Only frequencies greater than 1 contribute to zero-sum subarrays,
        // because we need at least two occurrences of a prefix sum to form a pair.
        if (frequencyOfSum > 1) {
            // Add the number of pairs that can be formed from this frequency to the total count.
            finalZeroSumSubarrayCount += calculatePairsFromCount(frequencyOfSum);
        }
    }

    // Display the final result.
    console.log(finalZeroSumSubarrayCount);
}


// Self-invoking anonymous function to manage the execution context and input reading.
(function() {
    // Check if the script is running in a Node.js environment.
    // This allows using Node's 'fs' module for standard input.
    if (typeof require !== 'undefined' && typeof module !== 'undefined' && module.exports) {
        try {
            // Dynamically require the 'fs' module for file system operations.
            const fileSystemModule = require('fs');
            // Read the entire content of the standard input file (/dev/stdin) as a UTF-8 string.
            const programInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
            // Call the main processing function with the obtained input.
            analyzeZeroSumSubarrays(programInputData);
        } catch (executionError) {
            // Catch and log any errors that occur during file reading or the main processing.
            console.error("An unexpected error occurred during execution:", executionError.message);
            // Optionally, exit with an error code.
            // process.exit(1);
        }
    } else {
        // Provide a fallback or warning for environments where 'fs' is not available (e.g., browsers).
        console.warn("Input source '/dev/stdin' is only available in Node.js environments.");
        console.warn("Please run this script in Node.js or provide input via another mechanism.");
        // For testing in a browser, you might manually call:
        // analyzeZeroSumSubarrays("3\n1 -1 0");
        // analyzeZeroSumSubarrays("5\n1 2 -3 3 1");
    }
})();