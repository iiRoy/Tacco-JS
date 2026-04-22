function processSequence(rawSequenceData) {
    // Define a constant for the modulo operation to ensure results fit within integer limits.
    const MODULO_VALUE = 1000000007;

    // Pre-process the raw input string.
    // Trim any leading/trailing whitespace, then split the string into individual lines.
    // Each line is then further split by space, creating a 2D array of string segments.
    const parsedInputLines = rawSequenceData.trim().split('\n').map(inputLine => inputLine.split(' '));

    // --- Input Validation and Extraction ---

    // Guard clause: Check if the input contains at least the expected number of lines.
    // We anticipate at least two lines: one for length, one for the sequence itself.
    if (parsedInputLines.length < 2) {
        // If critical input is missing, the calculation cannot proceed meaningfully.
        return 0; // Return 0 as an indicator of an invalid state or no valid arrangements.
    }

    // Extract the sequence's intended length from the first element of the first line.
    // Using Number() for conversion is robust against various string formats.
    const overallSequenceLength = Number(parsedInputLines[0][0]);

    // Guard clause: Validate the extracted sequence length.
    // It must be a valid positive number.
    if (isNaN(overallSequenceLength) || overallSequenceLength < 1) {
        return 0; // An invalid length means no valid arrangements.
    }

    // Parse the actual numeric sequence from the second line of input.
    // All elements are converted to numbers for direct arithmetic operations.
    const mainNumericSequence = parsedInputLines[1].map(Number);

    // Guard clause: Verify that the parsed numeric sequence has at least the declared length.
    if (mainNumericSequence.length < overallSequenceLength) {
        return 0; // Incomplete sequence implies invalid input.
    }

    // --- Core Logic Initialization ---

    // Initialize the state array. This array represents the current "level" or "count"
    // for three distinct abstract slots or categories.
    // The initial values [1, 0, 0] are problem-specific.
    let abstractSlotStateCounters = [1, 0, 0];

    // Initialize the accumulator for the total number of valid configurations.
    // The starting value of 3 suggests an initial set of possibilities or branches.
    let totalValidConfigurations = 3;

    // --- Iterative Calculation Loop ---

    // The main loop processes the numeric sequence, starting from the second element (index 1).
    // The first element (index 0) is typically handled as a special pre-condition or post-condition.
    for (let currentElementIndex = 1; currentElementIndex < overallSequenceLength; ++currentElementIndex) {
        // Retrieve the target value for the current step from the main sequence.
        const requiredTargetValue = mainNumericSequence[currentElementIndex];

        // Count how many of the abstract slots currently match the requiredTargetValue.
        // This count determines the number of choices available at this step.
        let currentStepMatchingSlots = 0;
        for (const slotCurrentValue of abstractSlotStateCounters) {
            if (slotCurrentValue === requiredTargetValue) {
                currentStepMatchingSlots++;
            }
        }

        // Update the total valid configurations by multiplying with the number of matches found.
        // Apply the modulo operation to keep the result within defined bounds, preventing overflow.
        totalValidConfigurations = (totalValidConfigurations * currentStepMatchingSlots) % MODULO_VALUE;

        // Optimization/Guard: If at any point the total configurations become zero,
        // it means no valid path exists further, so we can stop early.
        if (totalValidConfigurations === 0) {
            break; // Exit the loop as the result is already determined.
        }

        // Update the state: Find the *first* abstract slot whose current value matches
        // the requiredTargetValue, and then increment its counter.
        // This simulates "consuming" or "advancing" the state of one of the matching slots.
        let slotStateWasUpdated = false; // Flag to confirm an update occurred.
        for (let slotPosition = 0; slotPosition < abstractSlotStateCounters.length; ++slotPosition) {
            if (abstractSlotStateCounters[slotPosition] === requiredTargetValue) {
                abstractSlotStateCounters[slotPosition]++;
                slotStateWasUpdated = true; // Mark that an update happened.
                break; // Important: only update the first matching slot, then exit.
            }
        }
        // Optional: Could add a check here for !slotStateWasUpdated if this scenario
        // implies an error in problem logic, but typically it means currentStepMatchingSlots was 0.
    }

    // --- Final Condition Check ---

    // Apply a specific final rule based on the very first element of the main numeric sequence.
    // If this initial condition value is not 0, the entire set of arrangements is invalidated.
    const initialSequenceStartValue = mainNumericSequence[0];
    if (initialSequenceStartValue !== 0) {
        totalValidConfigurations = 0; // Override the result if the initial condition is not met.
    }

    // Return the final computed number of valid arrangements.
    return totalValidConfigurations;
}

// --- Execution Entry Point ---

// Read the entire input content from standard input synchronously as a UTF-8 string.
const standardInputRawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Call the main processing function with the raw input data.
const finalCalculatedResult = processSequence(standardInputRawData);

// Output the final result to standard output.
console.log(finalCalculatedResult);