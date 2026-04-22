// This module is designed to evaluate a numerical input against specific divisibility criteria.

/**
 * Initiates the primary sequence for processing a raw data stream.
 * It takes a single string, extracts the crucial numeric value,
 * and then performs a check based on predefined conditions.
 *
 * @param {string} incomingDataPayload - The entire data package received, typically from standard input.
 */
const InitiateDataExamination = (incomingDataPayload) => {
    // Decompose the multi-line data payload into an array of individual string lines.
    // This facilitates easy access to specific data points by their line index.
    const contentLines = incomingDataPayload.split('\n');

    // Extract the first piece of information, presumed to be the key numerical value.
    // It's parsed as a base-10 integer for precision, ensuring no unexpected type coercions.
    let numericSubject = Number.parseInt(contentLines[0], 10);

    // A control flag to indicate if a definitive answer has been reached during the iterative process.
    let decisionReached = false;
    // This variable will store the final textual outcome of the examination.
    // It's pre-initialized to 'No' to handle cases where no conditions are met positively.
    let outcomeMessage = 'No';

    // Begin an iterative search, testing potential multipliers from 9 down to 1.
    // The loop will terminate early if a decision is definitively reached.
    for (let potentialMultiplier = 9; potentialMultiplier > 0 && !decisionReached; potentialMultiplier--) {
        // Verify if the numeric subject is perfectly divisible by the current potential multiplier.
        // A modulo operation yielding zero confirms divisibility.
        if (numericSubject % potentialMultiplier === 0) {
            // If divisible, compute the corresponding factor that completes the multiplication.
            const complementaryFactor = numericSubject / potentialMultiplier;

            // Now, assess if this complementary factor itself falls within the single-digit range (1-9).
            // This is crucial for the problem's criteria.
            if (complementaryFactor < 10) {
                // Should both the 'potentialMultiplier' and 'complementaryFactor' be single digits,
                // the condition is satisfied. The process can conclude with a positive result.
                outcomeMessage = 'Yes';
                decisionReached = true; // Signal that the loop can terminate.
            } else {
                // If the 'complementaryFactor' is 10 or greater, it implies that even with this 'potentialMultiplier',
                // we cannot form the 'numericSubject' using two single-digit components.
                // Given the descending iteration, any smaller 'potentialMultiplier' would only produce an even larger
                // 'complementaryFactor', thus also failing. Hence, a 'No' is conclusive.
                outcomeMessage = 'No';
                decisionReached = true; // Signal that the loop can terminate.
            }
        }
    }

    // Output the final determined message to standard output.
    console.log(outcomeMessage);
};

// This boilerplate code handles the standard input/output interface,
// reading from /dev/stdin and invoking the main processing function.
// It is typically kept immutable in competitive programming environments.
InitiateDataExamination(require('fs').readFileSync('/dev/stdin', 'utf8'));