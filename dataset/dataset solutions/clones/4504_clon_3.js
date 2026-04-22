// A utility function to standardize how results are presented.
const displayAnalysisResult = (messageContent) => {
    // This function simply wraps the standard console output,
    // allowing for future changes in logging strategy without
    // modifying core logic.
    console.log(messageContent);
};

/**
 * Main processing function to evaluate a given scenario based on numerical inputs.
 * It determines a state ("delicious", "safe", or "dangerous") from a raw string.
 * @param {string} rawInputLine - The input string containing space-separated numerical values.
 */
function evaluateScenario(rawInputLine) {
    // --- Input Pre-processing and Validation ---

    // First, ensure the input isn't null, undefined, or just empty spaces.
    if (!rawInputLine || typeof rawInputLine !== 'string' || rawInputLine.trim().length === 0) {
        console.error("Evaluation Error: Provided input string is empty or invalid.");
        return; // Abort processing for invalid input.
    }

    // Split the raw string into an array of potential number strings.
    // Using a regular expression to handle multiple spaces and leading/trailing whitespace robustly.
    const numericalTokens = rawInputLine.trim().split(/\s+/);

    // Define the expected number of arguments for this specific evaluation logic.
    const REQUIRED_NUM_ARGS = 3;

    // Validate if the correct number of arguments were provided in the input.
    if (numericalTokens.length < REQUIRED_NUM_ARGS) {
        console.error(`Evaluation Error: Insufficient arguments. Expected ${REQUIRED_NUM_ARGS}, but found ${numericalTokens.length}.`);
        return; // Exit early if argument count is wrong.
    }

    // Parse the string tokens into numerical values.
    // The unary plus operator (+) is a concise way to convert strings to numbers.
    const comparisonThreshold = +numericalTokens[0]; // Corresponds to 'x' in original logic
    const lowerBoundaryValue = +numericalTokens[1]; // Corresponds to 'a' in original logic
    const upperBoundaryValue = +numericalTokens[2]; // Corresponds to 'b' in original logic

    // Validate that all parsed values are indeed numbers and not NaN (Not-a-Number).
    if (isNaN(comparisonThreshold) || isNaN(lowerBoundaryValue) || isNaN(upperBoundaryValue)) {
        console.error("Evaluation Error: Failed to parse one or more input tokens into valid numbers.");
        return; // Abort if any number parsing fails.
    }

    // --- Core Logic Calculations ---

    // Calculate the span or difference between the upper and lower boundaries.
    const calculatedSpan = upperBoundaryValue - lowerBoundaryValue;

    // Determine the effective limit for the "safe" condition.
    // This value is 'x + 1' from the original problem statement.
    const effectiveSafetyLimit = comparisonThreshold + 1;

    // --- Scenario Determination ---

    // Scenario 1: The span is zero or negative.
    // This is typically an 'early exit' condition in the original problem.
    if (calculatedSpan <= 0) {
        displayAnalysisResult("delicious");
        return; // Crucially, terminate function execution here, similar to 'break' in the original context.
    }

    // Scenario 2: The span is positive but falls within the "safe" range.
    // This range is defined by being less than the effective safety limit.
    if (calculatedSpan < effectiveSafetyLimit) {
        displayAnalysisResult("safe");
    }
    // Scenario 3: The span is positive and exceeds or meets the "dangerous" threshold.
    // This is the default outcome if the above conditions are not met.
    else {
        displayAnalysisResult("dangerous");
    }
}

// --- Script Entry Point and I/O Handling ---

// This block handles reading input from stdin and invoking the main logic.
try {
    // Attempt to read the entire content of standard input.
    // Using 'fs' module, which is common for competitive programming environments.
    const fullInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    
    // Pass the acquired input string to our primary evaluation function.
    evaluateScenario(fullInputContent);
} catch (ioError) {
    // Catch and report any errors that occur during file reading or initial setup.
    console.error("System Error: Could not read input or an unexpected issue occurred.", ioError.message);
    // Optionally, could exit process here with a non-zero code to indicate failure.
    // process.exit(1);
}