const FILE_SOURCE_PATH = '/dev/stdin'; // Define a constant for the standard input file path

/**
 * Computes the smallest possible range (difference between maximum and minimum value)
 * among all contiguous subarrays of a specified length 'k' from a given list of numbers.
 * The input data is expected to be a string where the first line contains 'N' and 'K'
 * (space-separated), and subsequent lines contain individual numeric values.
 *
 * @param {string} rawInputContent - The entire content read from the input source.
 * @returns {number} The minimum range found, or -1 if an error or invalid input prevents calculation.
 */
function determineMinimalSpan(rawInputContent) {
    // Initialize the variable to hold the smallest observed span.
    // Starting with Infinity ensures any valid calculated span will be smaller.
    let minimalValueSpan = Infinity;

    // --- Input Validation and Initial Parsing ---
    // Check for fundamental input validity.
    if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
        console.error("Processing Error: Input content is either missing or not a valid string.");
        return -1; // Indicate failure
    }

    const contentLines = rawInputContent.split('\n');

    // Ensure there are enough lines for configuration and data.
    if (contentLines.length < 2) {
        console.error("Processing Error: Insufficient lines in input. Expected at least two lines (config + data).");
        return -1;
    }

    // Parse the first line to extract configuration parameters (N and K).
    const configurationElements = contentLines[0].split(' ');
    if (configurationElements.length < 2) {
        console.error("Processing Error: First line configuration is incomplete. Expected 'N K'.");
        return -1;
    }

    // N (total count of numbers) is often provided but not directly used by this algorithm
    // after K is extracted and the list is sorted.
    const totalNumbersExpected = Number.parseInt(configurationElements[0], 10);
    let windowSegmentSize = Number.parseInt(configurationElements[1], 10);

    // Validate the parsed window segment size.
    if (isNaN(windowSegmentSize) || windowSegmentSize <= 0) {
        console.error(`Processing Error: Invalid window segment size (K) detected: "${configurationElements[1]}". Must be a positive integer.`);
        return -1;
    }

    // --- Data Extraction, Filtering, and Sorting ---
    // Extract the actual numeric data lines, skipping the configuration line.
    const rawNumericDataLines = contentLines.slice(1);

    // Convert raw string lines to numbers, filter out invalid entries, and sort them.
    const processedAndSortedNumbers = rawNumericDataLines
        .map(singleLineText => {
            const parsedNumber = Number(singleLineText.trim());
            // Add a check for non-numeric lines.
            if (isNaN(parsedNumber)) {
                console.warn(`Data Warning: Skipping non-numeric entry encountered: "${singleLineText.trim()}".`);
                return null; // Mark for removal
            }
            return parsedNumber;
        })
        .filter(validNumber => validNumber !== null) // Remove the null placeholders
        .sort((firstNum, secondNum) => firstNum - secondNum); // Sort in ascending order

    // --- Post-Processing Validation ---
    const actualDataElementCount = processedAndSortedNumbers.length;

    // Check if there are enough numbers to form even one window of the required size.
    if (actualDataElementCount < windowSegmentSize) {
        console.error(`Data Error: Not enough valid numbers (${actualDataElementCount}) to form a window of size ${windowSegmentSize}.`);
        return -1;
    }
    // Optionally warn if the provided N doesn't match actual count
    if (totalNumbersExpected && actualDataElementCount !== totalNumbersExpected) {
        console.warn(`Data Warning: Declared total numbers (N=${totalNumbersExpected}) does not match actual count of valid data elements (${actualDataElementCount}).`);
    }

    // --- Core Logic: Iterate and Find Minimum Span ---
    // Calculate the maximum possible starting index for a window.
    // A window of size 'windowSegmentSize' starting at 'startIndex' ends at 'startIndex + windowSegmentSize - 1'.
    // The last possible start index is when 'startIndex + windowSegmentSize - 1' equals the last element's index.
    const maxPermissibleStartIndex = actualDataElementCount - windowSegmentSize;

    // Loop through all possible starting positions for a window of 'windowSegmentSize'.
    for (let currentWindowStartIndex = 0; currentWindowStartIndex <= maxPermissibleStartIndex; currentWindowStartIndex++) {
        // Determine the index of the last element in the current window.
        const currentWindowEndIndex = currentWindowStartIndex + windowSegmentSize - 1;

        // Fetch the minimum and maximum values within the current sorted window.
        // Since the array is sorted, the first element is the minimum and the last is the maximum.
        const minValueInWindow = processedAndSortedNumbers[currentWindowStartIndex];
        const maxValueInWindow = processedAndSortedNumbers[currentWindowEndIndex];

        // Calculate the difference (span) for the current window.
        const currentWindowCalculatedSpan = maxValueInWindow - minValueInWindow;

        // Update the overall minimal span if the current window's span is smaller.
        minimalValueSpan = Math.min(minimalValueSpan, currentWindowCalculatedSpan);
    }

    // Return the smallest span found across all valid windows.
    return minimalValueSpan;
}

// --- Main Execution Block ---
let finalComputedResult = -1; // Default error value or initial state

try {
    // Attempt to read the input content from the specified file path.
    const systemInputContent = require('fs').readFileSync(FILE_SOURCE_PATH, 'utf8');

    // Invoke the primary function to process the input and determine the result.
    finalComputedResult = determineMinimalSpan(systemInputContent);

} catch (fileSystemError) {
    // Catch and report any errors that occur during file reading.
    console.error(`File System Error: Could not read from ${FILE_SOURCE_PATH}. Details: ${fileSystemError.message}`);
    // finalComputedResult remains -1, indicating a failure.
}

// Output the final calculated result to the console.
console.log(finalComputedResult);