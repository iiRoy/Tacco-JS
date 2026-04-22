// This module is designed to process and analyze structured text input, specifically to compare the frequency of two distinct character categories.
// It applies a series of parsing, validation, and counting steps before presenting a final comparative assessment.
function analyzeStringDistribution(incomingDataBundle) {

    // --- Phase 1: Input Data Acquisition and Initial Parsing ---
    // Ensure the raw input is a string and contains at least one newline to proceed with splitting.
    if (typeof incomingDataBundle !== 'string' || !incomingDataBundle.includes('\n')) {
        console.error("Execution Aborted: Input data payload is malformed or empty. Expected string with newlines.");
        return; // Terminate execution gracefully
    }

    // Split the incoming text into individual lines, handling various newline conventions (\n, \r\n).
    const parsedLineSegments = incomingDataBundle.split(/\r?\n/);

    // --- Phase 2: Data Validation and Extraction ---
    // Verify that the necessary number of data lines are present for processing.
    if (parsedLineSegments.length < 2) {
        console.error("Execution Aborted: Insufficient line segments in input. Expected at least two lines.");
        return;
    }

    // Extract and parse the first line as an integer, representing an anticipated sequence length.
    let declaredSequenceLength = parseInt(parsedLineSegments[0].trim(), 10);

    // Retrieve the second line, which contains the actual character sequence for analysis.
    const characterSequenceForAnalysis = parsedLineSegments[1].trim();

    // Perform a robust validation check:
    // 1. Is the declared length a valid non-negative number?
    // 2. Does the declared length match the actual length of the character sequence?
    if (isNaN(declaredSequenceLength) || declaredSequenceLength < 0 || declaredSequenceLength !== characterSequenceForAnalysis.length) {
        console.warn(`[Warning: Data Inconsistency] Declared length (${declaredSequenceLength}) does not match actual sequence length (${characterSequenceForAnalysis.length}). Prioritizing actual sequence length.`);
        // Adjust the effective length to the actual string length to prevent out-of-bounds errors or missed characters.
        declaredSequenceLength = characterSequenceForAnalysis.length;
    }

    // --- Phase 3: Character Categorization and Counting ---
    // Initialize counters for the two categories of characters ('R' for primary, 'B' for secondary, or any other for secondary).
    let primaryCategoryItemCount = 0; // Corresponds to 'R'
    let secondaryCategoryItemCount = 0; // Corresponds to 'B' or any other character

    // Utilize a 'while' loop for iterating through the character sequence, demonstrating an alternative control flow.
    let currentCharacterPosition = 0;
    while (currentCharacterPosition < declaredSequenceLength) {
        const symbolUnderInspection = characterSequenceForAnalysis[currentCharacterPosition];

        // Increment the appropriate counter based on the character's classification.
        if (symbolUnderInspection === 'R') {
            primaryCategoryItemCount++;
        } else {
            // Any character that is not 'R' is classified into the secondary category, mirroring the original logic.
            secondaryCategoryItemCount++;
        }

        // Advance to the next character in the sequence.
        currentCharacterPosition++;
    }

    // --- Phase 4: Final Comparison and Output Generation ---
    let finalComparativeVerdict;
    // Compare the accumulated counts to determine the dominance of the primary category.
    if (primaryCategoryItemCount > secondaryCategoryItemCount) {
        finalComparativeVerdict = "Yes, the Primary Character Category Exhibited Dominance.";
    } else {
        finalComparativeVerdict = "No, the Primary Character Category Did Not Exhibit Dominance.";
    }

    // Log the final outcome, including a timestamp for context.
    const currentExecutionTimestamp = new Date().toISOString();
    console.log(`[${currentExecutionTimestamp}] Result of Character Distribution Analysis: ${finalComparativeVerdict}`);
}

// --- Standard Input/Output Handling (DO NOT MODIFY THIS SECTION) ---
// This segment is responsible for reading input from the standard input stream
// and invoking the primary analysis function with the collected data.
// It is part of the execution environment and should remain unaltered.
analyzeStringDistribution(require("fs").readFileSync("/dev/stdin", "utf8"));