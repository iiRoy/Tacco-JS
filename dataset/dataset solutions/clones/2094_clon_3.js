// This module is responsible for analyzing input data to identify specific patterns.
// It acts as a gatekeeper, flagging certain predetermined sequences as 'No' and others as 'Yes'.

/**
 * Fetches the raw textual data from the standard input stream.
 * This function handles the low-level interaction with the system's input.
 * @returns {string[]} An array of individual characters derived from the input, or an empty array if input acquisition fails.
 */
const acquireSystemInput = () => {
    try {
        // Leveraging Node.js's built-in file system module to read from /dev/stdin.
        // It's crucial that the input is interpreted as UTF-8 encoded text.
        const incomingRawData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
        // Pre-processing the raw data: removing leading/trailing whitespace
        // and then splitting the string into an array of its constituent characters.
        // This prepares the data for sequence-based evaluation.
        return incomingRawData.trim().split('');
    } catch (readingError) {
        // In the event of an error during input reading (e.g., file not found, permissions),
        // we log the incident for diagnostic purposes and return an empty array.
        // This ensures the main processing function receives a predictable, albeit empty, input.
        // console.error('Data acquisition process encountered an issue:', readingError.message);
        return [];
    }
};

/**
 * Presents the final outcome of the sequence evaluation to the standard output.
 * This function serves as a standardized interface for reporting results.
 * @param {string} determinationMessage - The conclusive message to be displayed, typically 'Yes' or 'No'.
 */
const presentEvaluationResult = (determinationMessage) => {
    // Utilizing the console for output, but abstracted for future flexibility
    // (e.g., redirecting output to a file or a different UI element).
    console.log(determinationMessage);
};

/**
 * The primary logic handler that evaluates an array of string fragments
 * against a set of disallowed patterns.
 * @param {string[]} sequenceFragments - An ordered collection of string segments awaiting analysis.
 */
function evaluateInputSequence(sequenceFragments) {
    // --- Robust input validation and initial checks (Type III additions) ---

    // First, verify that the provided input is indeed an array and contains elements.
    // An invalid or empty input array cannot form the prohibited sequences.
    if (!Array.isArray(sequenceFragments) || sequenceFragments.length === 0) {
        // For malformed or missing input, the default assumption is 'Yes',
        // as it doesn't explicitly match a 'No' condition.
        presentEvaluationResult('Yes');
        return; // Early exit to prevent further processing with invalid data.
    }

    // --- Core pattern matching and decision-making (Type III updates) ---

    // Combine all individual fragments into a single, continuous string for pattern matching.
    // This intermediate string represents the full sequence under consideration.
    const unifiedSequence = sequenceFragments.join('');

    // Define the specific patterns that are considered forbidden.
    // A Set is used for efficient lookup, particularly beneficial if the number of patterns grew.
    const forbiddenConfigurations = new Set(['AAA', 'BBB']);

    // Introduce an early validation step based on the expected length of forbidden patterns.
    // If the sequence length doesn't match, it cannot be a forbidden pattern.
    if (unifiedSequence.length !== 3) {
        presentEvaluationResult('Yes'); // Sequences of non-standard length default to 'Yes'.
        return; // Exit early.
    }

    // Determine the final decision based on whether the unified sequence
    // is found within the set of forbidden configurations.
    let finalDecision;
    if (forbiddenConfigurations.has(unifiedSequence)) {
        // If a match is found, the sequence is deemed 'No'.
        finalDecision = 'No';
    } else {
        // Otherwise, if no forbidden pattern is matched, the sequence is 'Yes'.
        finalDecision = 'Yes';
    }

    // --- Final outcome presentation (Type III restructuring) ---
    // Utilize the dedicated function to output the result.
    presentEvaluationResult(finalDecision);
}

// --- Orchestration of the entire process (Type III restructuring) ---

// Step 1: Acquire the necessary data from the system's input.
const acquiredFragments = acquireSystemInput();

// Step 2: Pass the acquired data to the evaluation engine for processing.
evaluateInputSequence(acquiredFragments);