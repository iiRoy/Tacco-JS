// This module processes and categorizes a raw input string,
// interpreting it as a numerical score for classification purposes.
// It aims to assign a specific label based on established thresholds.
function analyzeAndClassifyScore(sourceDataString) {

    // Define symbolic constants for the classification boundaries.
    // Using named constants improves readability and maintainability.
    const SCORE_LOWER_BOUNDARY = 1200;
    const SCORE_UPPER_BOUNDARY = 2800;

    // Establish a default classification label, which also serves as the highest tier.
    const DEFAULT_HIGH_TIER_LABEL = 'AGC';

    let processedNumericScore; // Variable to store the integer representation of the input.
    let finalCategorizationTag = DEFAULT_HIGH_TIER_LABEL; // Initialize with the highest category.

    // --- Robust Input Handling and Parsing ---
    // Perform initial validation on the input string's type and content.
    // This guards against unexpected input formats.
    if (typeof sourceDataString !== 'string' || sourceDataString.trim().length === 0) {
        console.error("Input processing error: The provided data is not a valid string or is empty.");
        // Assign a specific tag for invalid input, diverging from original behavior
        // which might have silently resulted in NaN.
        finalCategorizationTag = 'INVALID_DATA_FORMAT';
    } else {
        // Attempt to convert the clean input string into a base-10 integer.
        // This is a crucial step for numerical comparisons.
        processedNumericScore = parseInt(sourceDataString.trim(), 10);

        // --- Post-Parsing Validation ---
        // Check if the parsing operation was successful. `isNaN` detects non-numeric results.
        if (isNaN(processedNumericScore)) {
            console.warn(`Warning: Could not convert "${sourceDataString.trim()}" into a number. Applying default classification.`);
            // Another specific tag for unparseable numeric values.
            finalCategorizationTag = 'UNPARSEABLE_NUMERIC_VALUE';
        } else {
            // --- Core Classification Logic ---
            // This section determines the appropriate category tag based on the parsed score.
            // The conditional structure is intentionally reordered and broken down for clarity
            // and as a Type III modification.

            // Evaluate if the score falls into the lowest category.
            const isLowestTier = (processedNumericScore < SCORE_LOWER_BOUNDARY);

            // Evaluate if the score falls into the middle category.
            // This condition implicitly covers scores greater than or equal to SCORE_LOWER_BOUNDARY.
            const isMiddleTier = (processedNumericScore >= SCORE_LOWER_BOUNDARY && processedNumericScore < SCORE_UPPER_BOUNDARY);

            // Apply the determined category tag.
            if (isLowestTier) {
                finalCategorizationTag = 'ABC';
            } else if (isMiddleTier) {
                finalCategorizationTag = 'ARC';
            }
            // If neither of the above conditions is met, the score must be in the highest tier,
            // so `finalCategorizationTag` remains its initialized `DEFAULT_HIGH_TIER_LABEL`.
        }
    }

    // --- Final Output Presentation ---
    // Log verbose details about the categorization process for debugging or auditing.
    console.log(`Debug Info: Initial input: '${sourceDataString}', Parsed score: ${processedNumericScore || 'N/A'}, Assigned category: ${finalCategorizationTag}`);

    // Print the final, determined categorization tag to standard output.
    console.log(finalCategorizationTag);
}

// This line handles the execution environment's input acquisition.
// It reads from standard input and passes the data to our primary processing function.
// This mechanism is typically external and should not be altered for functional integrity.
analyzeAndClassifyScore(require("fs").readFileSync("/dev/stdin", "utf8"));