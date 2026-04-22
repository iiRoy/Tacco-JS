// Define a constant for the base used in large number arithmetic.
// This constant represents 10^12, which is the overflow threshold for the lower part of our custom large number representation.
const LARGE_NUMERIC_BASE = 1000000000000; // A trillion

// Helper function to safely parse an integer from a string.
// It provides basic validation and defaults to 0 if parsing fails, preventing NaN issues.
const parseNumericValue = (stringValue) => {
    const parsedValue = Number(stringValue);
    // Validate if the parsed result is a finite number.
    if (!Number.isFinite(parsedValue)) {
        // In a production scenario, one might throw an error or log a more severe warning.
        // For this clone, we'll gracefully default to zero.
        console.warn(`Warning: Failed to convert "${stringValue}" into a valid number. Using 0 instead.`);
        return 0;
    }
    return parsedValue;
};

// Encapsulates the logic for reading raw input data from stdin.
// This function improves modularity and adds basic error handling for file operations.
const retrieveInputDataLines = () => {
    try {
        // Read the entire content of the standard input as a UTF-8 string.
        const fileDataContent = require('fs').readFileSync('/dev/stdin', 'utf8');
        // Trim leading/trailing whitespace from the content and split it into an array of lines.
        // Also, filter out any empty lines that might arise from multiple newlines.
        return fileDataContent.trim().split("\n").filter(lineText => lineText.length > 0);
    } catch (readingError) {
        // Log an error if file reading fails.
        console.error("Critical Error: Unable to read input data from /dev/stdin.", readingError.message);
        // Terminate the process as input data is essential for execution.
        process.exit(1);
    }
};

// Parses a string representation of a very large number into a two-part array.
// The array `[highPart, lowPart]` simulates a BigInt, where `lowPart` holds the last `SPLIT_DIGITS` digits.
const decomposeBigNumberString = (largeNumString) => {
    const SPLIT_DIGITS = 13; // Number of digits to keep in the lower part.
    const totalStringLength = largeNumString.length;

    let higherSegmentString = "0"; // Default high part if number is short.
    let lowerSegmentString = largeNumString; // Default low part if number is short.

    // If the string is longer than the split point, divide it.
    if (totalStringLength > SPLIT_DIGITS) {
        higherSegmentString = largeNumString.substring(0, totalStringLength - SPLIT_DIGITS);
        lowerSegmentString = largeNumString.substring(totalStringLength - SPLIT_DIGITS);
    }

    // Convert string segments to numbers, removing any leading zeros for clean conversion.
    const highValue = parseNumericValue(higherSegmentString.replace(/^0+/, ""));
    const lowValue = parseNumericValue(lowerSegmentString.replace(/^0+/, ""));

    return [highValue, lowValue];
};

// Compares two large numbers represented as two-part arrays `[high, low]`.
// Returns `true` if the first number is less than or equal to the second, `false` otherwise.
const compareLargeNumbers = (firstNumberParts, secondNumberParts) => {
    // Compare the higher parts first.
    if (firstNumberParts[0] < secondNumberParts[0]) {
        return true;
    }
    // If higher parts are equal, compare the lower parts.
    if (firstNumberParts[0] === secondNumberParts[0]) {
        return firstNumberParts[1] <= secondNumberParts[1];
    }
    // If the first number's high part is greater, it's definitely not less than or equal.
    return false;
};

// --- Main Program Execution Flow ---

// 1. Retrieve all lines from the input source.
const processedInputLines = retrieveInputDataLines();

// Define the maximum value an element can take for our lookup table.
// This corresponds to the original array initialization size.
const MAX_ELEMENT_VALUE_FOR_LOOKUP = 1000000;

// Validate that we have sufficient input lines to proceed.
// The problem expects at least 5 lines (2 ignored, 3 data arrays).
if (processedInputLines.length < 5) {
    console.error(`Error: Insufficient input lines. Expected at least 5, but received ${processedInputLines.length}.`);
    process.exit(1); // Terminate due to critical input error.
}

// Discard the first line, which typically contains a count for the primary dataset.
// This value is not used in the subsequent logic.
const discardedPrimaryDatasetCount = processedInputLines.shift();

// 2. Parse the primary dataset elements (formerly 'a').
// These are space-separated numbers from the second line of input.
const primaryDatasetElements = processedInputLines.shift().split(" ").map(parseNumericValue);

// Sort the primary dataset elements in ascending numerical order.
// A more explicit comparison function is used for clarity.
primaryDatasetElements.sort((valA, valB) => {
    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
});

// Discard the third line, which contains a count for the query dataset.
// This value is also not used.
const discardedQueryDatasetCount = processedInputLines.shift();

// 3. Parse the secondary query values (formerly 'b').
// These are space-separated numbers from the fourth line of input.
const secondaryQueryValues = processedInputLines.shift().split(" ").map(parseNumericValue);

// 4. Parse the comparison threshold strings (formerly 'c').
// These are space-separated strings from the fifth line of input.
const comparisonThresholdStrings = processedInputLines.shift().split(" ");

// 5. Initialize a lookup table for cumulative sums.
// This table will store the prefix sum for each unique value encountered in `primaryDatasetElements`.
// Using `null` as the initial fill value to clearly indicate "no sum calculated yet".
const cumulativeSumRepository = new Array(MAX_ELEMENT_VALUE_FOR_LOOKUP).fill(null);

// Establish the base case: the cumulative sum for value 0 is [0, 0].
// This is important for scenarios where queries might decrement to 0 or if 0 is an element.
cumulativeSumRepository[0] = [0, 0];

// Initialize the running total, represented as two parts [high, low] for large number handling.
let currentAccumulatedTotal = [0, 0]; // [high_part, low_part]

// 6. Calculate prefix sums for the sorted primary dataset and populate the lookup table.
primaryDatasetElements.forEach((currentElement) => {
    // Add the current element's value to the lower part of the running total.
    currentAccumulatedTotal[1] += currentElement;

    // If the lower part exceeds our defined base, carry over to the higher part.
    if (currentAccumulatedTotal[1] >= LARGE_NUMERIC_BASE) {
        currentAccumulatedTotal[0]++; // Increment the high part.
        currentAccumulatedTotal[1] -= LARGE_NUMERIC_BASE; // Adjust the low part.
    }

    // Store a *copy* of the current accumulated total in the lookup table
    // at the index corresponding to the `currentElement`'s value.
    // Ensure the element value is within the bounds of our lookup table.
    if (currentElement >= 0 && currentElement < MAX_ELEMENT_VALUE_FOR_LOOKUP) {
        cumulativeSumRepository[currentElement] = Array.from(currentAccumulatedTotal);
    } else {
        // Log a warning if an element's value is out of the expected range for the lookup table.
        console.warn(`Data element value (${currentElement}) is outside the lookup table's bounds (0 to ${MAX_ELEMENT_VALUE_FOR_LOOKUP - 1}). Sum not stored for this value.`);
    }
});

// 7. Process each query value from the secondary dataset.
secondaryQueryValues.forEach((queryValueCandidate, queryIterationIndex) => {
    let actualLookupKey = queryValueCandidate;

    // Find the largest value `k` such that `k <= queryValueCandidate` and `cumulativeSumRepository[k]` is not null.
    // This effectively finds the prefix sum for the largest `primaryDatasetElements` value less than or equal to `queryValueCandidate`.
    while (actualLookupKey >= 0 && cumulativeSumRepository[actualLookupKey] === null) {
        actualLookupKey--;
    }

    // Retrieve the relevant cumulative sum. If `actualLookupKey` became negative, it means no relevant sum was found,
    // so default to [0, 0] (representing a zero sum).
    const resolvedCumulativeSum = (actualLookupKey >= 0)
        ? cumulativeSumRepository[actualLookupKey]
        : [0, 0]; // Default to zero if no relevant prefix sum is found.

    // Get the corresponding threshold string for the current query.
    const currentThresholdText = comparisonThresholdStrings[queryIterationIndex];

    // Parse the threshold string into its two-part large number representation.
    const comparisonTargetParts = decomposeBigNumberString(currentThresholdText);

    let finalAnswer = "No"; // Initialize the comparison result.

    // Perform the comparison using our dedicated helper function.
    // We are checking if the comparison target is less than or equal to the resolved cumulative sum.
    if (compareLargeNumbers(comparisonTargetParts, resolvedCumulativeSum)) {
        finalAnswer = "Yes";
    }

    // Output the comparison result for the current query.
    console.log(finalAnswer);
});