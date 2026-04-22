const retrieveAndProcessNumericalSequence = (sourcePayload) => {
    // This routine is designed to parse raw input data, extract a numerical sequence
    // and its designated length, then perform a series of calculations based on
    // the count of distinct elements within that sequence.
    // The final computed values are then output in a structured format.

    // --- Input Validation: Ensure a valid string payload is provided ---
    if (!sourcePayload || typeof sourcePayload !== 'string' || sourcePayload.trim().length === 0) {
        console.error("Error: The provided input payload is either empty, null, or not a string. Processing halted.");
        // A Type III addition: early exit for invalid input.
        return;
    }

    // Split the entire input string into individual lines for easier processing.
    const lineSegments = sourcePayload.split("\n");

    // --- Data Extraction and Type Coercion ---
    // The first line is expected to contain the primary sequence length (cardinality).
    // Using parseInt for explicit conversion and radix for robustness.
    const primarySequenceLength = parseInt(lineSegments[0], 10);

    // Validate the parsed length. If it's not a number, log a warning and default.
    // This is another Type III added validation fragment.
    if (isNaN(primarySequenceLength)) {
        console.warn("Warning: The first line did not contain a valid integer for sequence length. Defaulting to 0.");
        // We might want to throw an error here in a production system.
        // For this clone, defaulting or exiting gracefully is sufficient.
        return;
    }

    // The second line holds the space-separated numerical elements.
    // Each string element is converted to a number using the unary plus operator.
    // An intermediate variable for the raw string parts is used for clarity.
    const rawNumberStrings = lineSegments[1].split(" ");
    const numericalElements = rawNumberStrings.map(elementString => {
        const coercedValue = Number(elementString); // Explicit Number() conversion
        // Another Type III validation: check for non-numeric items in the sequence.
        if (isNaN(coercedValue)) {
            console.warn(`Non-numeric entry detected: '${elementString}'. It will be treated as 0.`);
            return 0; // Defaulting to 0 for invalid entries.
        }
        return coercedValue;
    });

    // --- Core Logic: Identify Unique Elements ---
    // A Set data structure is employed to efficiently gather all unique numerical values.
    const distinctValueCollector = new Set(numericalElements);
    // Store the count of these unique values in a dedicated constant for repeated access.
    const uniqueValuesCount = distinctValueCollector.size;

    // --- Result Aggregation ---
    // Initialize an array to store all the calculated outcomes.
    const calculatedOutcomes = [];

    // The first element in our results array is always the primary sequence length.
    calculatedOutcomes.push(primarySequenceLength);

    // Iterate through potential divisors, starting from two, up to the primary sequence length.
    // Using a pre-increment for the loop counter is a minor syntactic change.
    for (let currentDivisor = 2; currentDivisor <= primarySequenceLength; ++currentDivisor) {
        // If the total count of unique values is less than the current divisor,
        // it means no full groups can be formed, so the result is zero.
        if (uniqueValuesCount < currentDivisor) {
            calculatedOutcomes.push(0);
        } else {
            // Otherwise, calculate how many full groups of 'currentDivisor'
            // can be formed from the unique elements using floor division.
            const quotientResult = Math.floor(uniqueValuesCount / currentDivisor);
            calculatedOutcomes.push(quotientResult);
        }
    }

    // --- Output Generation ---
    // Join all the computed outcomes with newline characters and print the final string to console.
    // The `.toString()` call on the joined string is redundant, so it's deleted as a Type III change.
    console.log(calculatedOutcomes.join("\n"));

    // An explicit return statement, mirroring the original's structure.
    return;
};

// Entry point for execution: Read from standard input and invoke the processing function.
// The function name called here must reflect the new name.
retrieveAndProcessNumericalSequence(require("fs").readFileSync("/dev/stdin", "utf8"));