const parseNumericElement = (textFragment, fallbackValue = NaN) => {
    const numericalConversion = Number(textFragment);
    return isNaN(numericalConversion) ? fallbackValue : numericalConversion;
};

/**
 * Analyzes structured text input to count elements that satisfy a specific condition.
 * The first line of input provides two configuration values:
 *   1. The expected number of data points to evaluate (N).
 *   2. A maximum permissible value (K) for comparison.
 * The second line contains a sequence of N space-separated numerical data points.
 * This routine reports the total count of data points that are less than or equal to K.
 * @param {string} fullInputString - The entire raw input as a single string.
 */
function performConditionalDataAggregation(fullInputString) {
    // Pre-validation: Check for valid input string presence and type
    if (!fullInputString || typeof fullInputString !== 'string' || fullInputString.trim().length === 0) {
        console.error("Data processing halted: No valid input string was provided.");
        return; // Terminate execution gracefully
    }

    // Decompose the input string into an array of distinct lines,
    // ensuring to strip leading/trailing whitespace and exclude empty lines.
    const structuredInputLines = fullInputString.trim().split('\n').filter(line => line.length > 0);

    // Validate the minimum number of input lines required for processing
    if (structuredInputLines.length < 2) {
        console.error("Data processing halted: Insufficient input lines detected. Expected at least two.");
        return; // Terminate execution
    }

    // Extract and parse the operational parameters from the first line
    const operationalParameters = structuredInputLines[0].split(' ');
    const expectedDataCount = parseNumericElement(operationalParameters[0]); // N
    const comparisonBoundary = parseNumericElement(operationalParameters[1]); // K

    // Parameter validation: Ensure N and K are valid numbers and N is non-negative
    if (isNaN(expectedDataCount) || isNaN(comparisonBoundary) || expectedDataCount < 0) {
        console.error("Data processing halted: Invalid numerical parameters found on the first input line.");
        return; // Terminate execution
    }

    // Extract and parse the data points from the second line
    const rawDataSeries = structuredInputLines[1].split(' ');
    const cleanedNumericSeries = rawDataSeries
        .map(segment => parseNumericElement(segment))
        .filter(num => !isNaN(num)); // Discard any segments that failed to parse into numbers

    // Optional warning: Alert if the actual number of parsed data points is less than expected
    if (cleanedNumericSeries.length < expectedDataCount) {
        console.warn(`Warning: Expected ${expectedDataCount} data points, but only ${cleanedNumericSeries.length} were successfully parsed.`);
        // The processing loop will adapt to the available data.
    }

    let qualifyingItemTally = 0; // Initialize a counter for items meeting the criterion

    // Iterate through the data series up to the 'expectedDataCount' limit,
    // or until the available cleaned data points are exhausted.
    for (let currentPosition = 0; currentPosition < expectedDataCount; currentPosition++) {
        // Ensure the current position is within the bounds of the actual parsed data array
        if (currentPosition < cleanedNumericSeries.length) {
            const currentDatum = cleanedNumericSeries[currentPosition];

            // Apply the core conditional logic: check if the current data point is within the boundary
            if (currentDatum <= comparisonBoundary) {
                qualifyingItemTally++; // Increment counter if the condition is satisfied
            }
        } else {
            // If we run out of valid data points before reaching the expected count,
            // further iterations would be meaningless or lead to errors.
            break; // Exit the loop early
        }
    }

    // Output the final aggregated count
    console.log(qualifyingItemTally);
}

// This section is responsible for standard input/output handling and must remain unaltered.
performConditionalDataAggregation(require('fs').readFileSync('/dev/stdin', 'utf8'));