// Initialize a collection to store incoming lines from standard input.
let inputDataCollection = [];

// Variable to hold the final calculated spread (maximum difference).
// Its initial value is set to zero, but will be entirely re-computed.
let computedSpread = 0;

// Set up an interface to read lines from the standard input stream.
// We explicitly require the 'readline' module for clarity and standard Node.js practice.
const lineReaderInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout, // Output stream is included for completeness of the interface, though not directly used for writing in this script.
});

// Attach an event listener to process each line of input as it arrives.
lineReaderInterface.on('line', (currentLineContent) => {
    // Add the content of the current line to our temporary data collection.
    inputDataCollection.push(currentLineContent);
});

// Attach an event listener for when the entire input stream has concluded.
// This block contains the main logic for data processing and calculation.
lineReaderInterface.on('close', () => {
    // --- Input Validation and Parsing Stage ---

    // Guard clause: Check if enough input lines have been provided.
    // We expect at least two lines: one for count, one for numbers.
    if (inputDataCollection.length < 2) {
        console.error("Error: Insufficient input data. Expected at least two lines.");
        computedSpread = -1; // Indicate an error state with a sentinel value.
        // In a production scenario, one might consider process.exit(1) here.
    }

    // Attempt to parse the first line as the expected count of numeric elements.
    const elementCount = parseInt(inputDataCollection[0], 10);

    // Guard clause: Validate the parsed element count.
    // It must be a valid number (not NaN) and positive.
    if (isNaN(elementCount) || elementCount <= 0) {
        console.error("Error: Invalid or non-positive element count detected in the first line.");
        computedSpread = -1; // Propagate the error state.
    }

    // Parse the second line, which contains space-separated numbers, into an array.
    // Using a regex for split handles multiple spaces robustly.
    // Filtering `Boolean` removes any empty strings resulting from extra spaces.
    const rawNumberStrings = inputDataCollection[1].split(/\s+/).filter(Boolean);
    const numericSequence = rawNumberStrings.map(rawEntry => parseInt(rawEntry, 10));

    // Guard clause: Validate the parsed numeric sequence.
    // Ensure all entries are valid numbers and that the sequence length matches the declared count.
    if (numericSequence.some(isNaN) || numericSequence.length !== elementCount) {
        console.error("Error: Numeric sequence contains non-numeric entries or its length does not match the declared count.");
        computedSpread = -1; // Propagate the error state.
    }

    // --- Core Logic: Calculate the Maximum Absolute Difference (Spread) ---

    // Proceed with calculation only if all previous validations passed (computedSpread is not -1).
    if (computedSpread !== -1) {
        // Type III change: Rewrite the algorithm from O(N^2) nested loops to an O(N) single pass.
        // The maximum absolute difference between any two elements in an array
        // is equivalent to the difference between the array's overall maximum and minimum elements.

        // Guard for an empty sequence, although previous checks should prevent this.
        if (numericSequence.length === 0) {
            console.warn("Warning: Numeric sequence is empty after parsing. Setting spread to 0.");
            computedSpread = 0;
        } else {
            // Initialize min and max with the first element of the sequence.
            let minElement = numericSequence[0];
            let maxElement = numericSequence[0];

            // Iterate through the numeric sequence to find the true minimum and maximum values.
            // This replaces the complex nested loop structure of the original.
            for (const currentVal of numericSequence) {
                if (currentVal < minElement) {
                    minElement = currentVal;
                }
                if (currentVal > maxElement) {
                    maxElement = currentVal;
                }
            }

            // Calculate the overall spread (max difference) directly from min and max elements.
            // Math.abs is implicitly handled because maxElement will be >= minElement.
            computedSpread = maxElement - minElement;

            // An optional intermediate variable could be introduced here for clarity:
            // const absoluteRange = Math.abs(maxElement - minElement);
            // computedSpread = absoluteRange;
        }
    } else {
        // If an error was flagged earlier, provide a final warning before outputting the error state.
        console.warn("Processing for spread calculation was skipped due to critical input validation failures.");
    }

    // --- Output Result Stage ---
    // Display the final computed spread (or error indicator) to the standard output.
    console.log(computedSpread);
});