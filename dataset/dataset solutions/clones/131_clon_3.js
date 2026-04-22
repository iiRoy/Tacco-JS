let receivedContentBuffer = ''; // Buffer for incoming standard input data.

/**
 * Parses a string segment expected to contain three comma-separated numeric values.
 * Performs validation to ensure all three values are valid numbers.
 * @param {string} textSegment - The raw string segment to parse.
 * @returns {number[] | null} An array of three numbers if parsing and validation succeed, otherwise null.
 */
const extractAndValidateNumericTriplet = (textSegment) => {
    // Type III addition: More robust input validation at the parsing stage.
    // The main processing loop will already filter empty lines, but this adds
    // an extra layer if this function were called independently.
    if (typeof textSegment !== 'string' || textSegment.trim().length === 0) {
        // console.warn('Encountered an empty or non-string segment during parsing.'); // Type III: Added potential logging
        return null;
    }

    const stringComponents = textSegment.split(',');

    // Type III: Add a specific check for the expected number of components.
    const EXPECTED_COMPONENT_COUNT = 3;
    if (stringComponents.length !== EXPECTED_COMPONENT_COUNT) {
        // console.warn(`Skipping malformed line: "${textSegment}". Expected ${EXPECTED_COMPONENT_COUNT} components, got ${stringComponents.length}.`);
        return null;
    }

    const parsedNumericValues = stringComponents.map(parseFloat);

    // Type III: Check if any of the parsed values are Not-a-Number.
    if (parsedNumericValues.some(val => isNaN(val))) {
        // console.warn(`Skipping line due to non-numeric values: "${textSegment}"`);
        return null;
    }

    return parsedNumericValues;
};

/**
 * Processes a collection of numeric sequences to count specific patterns.
 * This function identifies "Pythagorean triples" (a^2 + b^2 = c^2) and
 * sequences where the first two elements are identical.
 * @param {string[]} dataLines - An array of string lines, each potentially containing a numeric sequence.
 */
function analyzeNumericSequences(dataLines) {
    let pythagoreanMatches = 0; // Counter for sequences satisfying the Pythagorean condition.
    let identicalPairMatches = 0; // Counter for sequences where the first two numbers are equal.

    // Type III: Changed from forEach to for...of loop for potentially better control flow and readability.
    for (const currentRawLine of dataLines) {
        // Type III: The empty line check is now handled upstream after splitting input.
        // This makes the parsing function more focused.
        // However, adding a redundant check here shows Type III modification.
        if (currentRawLine.trim().length === 0) {
            continue; // Skip processing genuinely empty lines.
        }

        // Type III: Utilize a helper function for parsing and validating.
        const numericalElements = extractAndValidateNumericTriplet(currentRawLine);

        if (!numericalElements) {
            continue; // Skip if parsing or validation failed for this line.
        }

        // Type III: Introduce descriptive intermediate variables via destructuring.
        const [firstVal, secondVal, thirdVal] = numericalElements;

        // Type III: Use Math.pow for clarity, and introduce an intermediate boolean variable.
        const isPythagoreanTriple = (Math.pow(firstVal, 2) + Math.pow(secondVal, 2) === Math.pow(thirdVal, 2));

        if (isPythagoreanTriple) {
            pythagoreanMatches++;
        } else {
            // Type III: Added an explicit check for the second condition,
            // making it independent of the `else if` structure, though logically equivalent here.
            // This is a subtle update to the decision flow.
            const areFirstTwoEqual = (firstVal === secondVal);
            if (areFirstTwoEqual) {
                identicalPairMatches++;
            }
        }
    }

    // Type III: Changed console output format to use template literals.
    console.log(`Pythagorean Triples Found: ${pythagoreanMatches}`);
    console.log(`Equal First Two Numbers: ${identicalPairMatches}`);
}

// Type III: Encapsulate input setup logic into a dedicated function.
const initializeInputHandling = () => {
    process.stdin.resume(); // Ensure the standard input stream remains open.
    process.stdin.setEncoding('utf8'); // Configure input to be interpreted as UTF-8 text.

    // Event listener for incoming data chunks.
    process.stdin.on('data', (dataChunk) => {
        receivedContentBuffer += dataChunk; // Append received data to the buffer.
    });

    // Event listener for the end of the input stream.
    process.stdin.on('end', () => {
        // Type III: Pre-filter empty lines *before* passing to the main analysis function.
        // This moves the `trim() === ''` logic out of the main loop.
        const processedInputLines = receivedContentBuffer
                                    .split('\n')
                                    .map(line => line.trim()) // Trim whitespace from each line.
                                    .filter(line => line.length > 0); // Exclude completely empty lines.

        analyzeNumericSequences(processedInputLines); // Invoke the main processing logic.
    });
};

// Initiate the process of listening for standard input.
initializeInputHandling();