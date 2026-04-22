// This module processes standard input to perform a specific numeric transformation.
// It is designed to be robust against various input conditions and provides detailed feedback.

(async function executeDataTransformation() {
    // Phase 1: Input Acquisition and Accumulation
    // A buffer variable to collect all incoming data chunks from the standard input stream.
    let receivedPayload = '';
    const DEFAULT_NUMERIC_FALLBACK_VALUE = 0; // A constant for cases where parsing fails.

    try {
        // Asynchronously iterate over each data segment provided via standard input.
        // Each `dataFragment` is typically a Buffer, so `toString('utf8')` ensures proper string concatenation.
        for await (const dataFragment of process.stdin) {
            receivedPayload += dataFragment.toString('utf8');
        }

        // Phase 2: Input Validation and Numeric Parsing
        // Define a local utility function to safely extract and convert a number from a string.
        const safelyParseFirstNumber = (sourceText, fallbackValue) => {
            // Trim leading/trailing whitespace from the source text to clean it up.
            const trimmedText = sourceText.trim();

            if (!trimmedText) {
                console.warn("Input was empty or contained only whitespace. Using fallback value.");
                return fallbackValue;
            }

            // Split the cleaned text by any sequence of whitespace characters
            // and attempt to get the very first potential numeric string.
            const potentialNumericStrings = trimmedText.split(/\s+/);
            const candidateString = potentialNumericStrings[0];

            if (!candidateString) {
                console.warn("No valid numeric string segment found in the input. Using fallback value.");
                return fallbackValue;
            }

            // Utilize parseFloat for robust conversion, handling both integers and decimals.
            const numericalResult = Number.parseFloat(candidateString);

            // Check if the parsing operation resulted in a valid number.
            if (Number.isNaN(numericalResult)) {
                console.error(`Parsing failed for input segment '${candidateString}'. Defaulting to fallback.`);
                return fallbackValue;
            }

            return numericalResult;
        };

        // Attempt to extract and parse the primary numeric value from the accumulated input.
        // If parsing fails for any reason, the predefined fallback value will be used.
        const initialValueForCalculation = safelyParseFirstNumber(receivedPayload, DEFAULT_NUMERIC_FALLBACK_VALUE);

        // Phase 3: Core Business Logic - Numeric Transformation
        // Define a specific constant that will be used in the calculation.
        const FIXED_REFERENCE_POINT = 1;

        // Perform the central arithmetic operation: subtract the parsed value from the reference point.
        let finalComputedOutcome = FIXED_REFERENCE_POINT;
        finalComputedOutcome -= initialValueForCalculation;

        // Phase 4: Output Presentation
        // Log the final result to the console with a clear, descriptive message.
        console.log(`The final calculated value after transformation is: ${finalComputedOutcome}`);

    } catch (processingException) {
        // Phase 5: Comprehensive Error Handling
        // If any unexpected error occurs during input processing or calculation,
        // catch it here and log an informative error message.
        console.error("An unrecoverable error occurred during data processing:", processingException.message);
        // Set the process exit code to indicate that the operation failed.
        process.exitCode = 1;
    } finally {
        // Phase 6: Finalization and Cleanup
        // This block ensures that certain actions are performed irrespective of
        // whether an error occurred or the process completed successfully.
        // In this context, it's primarily for demonstrating structural completeness.
        // console.log("Execution of data transformation sequence concluded."); // Optional verbose logging
    }
})(); // End of the immediately invoked asynchronous function expression