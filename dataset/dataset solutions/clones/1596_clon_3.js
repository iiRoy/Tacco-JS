// Function designed to process incoming data and determine a specific numerical classification.
function handleInputOperation(rawInputContent) {
    // Define string constants for the character of interest and the possible classification values.
    const TARGET_CHARACTER = 'R';
    const RESULT_FOR_TRIPLE_SEQUENCE = 3;
    const RESULT_FOR_DOUBLE_SEQUENCE = 2;
    const RESULT_FOR_SINGLE_SEQUENCE = 1;
    const RESULT_FOR_NO_SEQUENCE = 0;

    // Internal helper function to emit the final numerical classification to the standard output.
    const emitFinalClassification = (classificationValue) => {
        console.log(classificationValue);
    };

    // Ensure the input is treated as a string and remove any leading or trailing whitespace.
    // This creates a clean textual representation for subsequent analysis.
    const sanitizedTextualData = String(rawInputContent).trim();

    // Implement an early return mechanism for cases where the input text is empty
    // after trimming. An empty string inherently contains no sequences of 'R's.
    if (sanitizedTextualData.length === 0) {
        emitFinalClassification(RESULT_FOR_NO_SEQUENCE);
        return; // Exit the function as the classification is determined.
    }

    // Initialize counters to track the lengths of 'R' character sequences.
    // 'currentConsecutiveCount' tracks the ongoing sequence, 'peakConsecutiveCount' stores the longest found.
    let currentConsecutiveCount = RESULT_FOR_NO_SEQUENCE;
    let peakConsecutiveCount = RESULT_FOR_NO_SEQUENCE;

    // Traverse the sanitized text character by character to identify and measure 'R' sequences.
    // This loop effectively replaces direct substring checks with a character-level analysis.
    for (let charIterator = 0; charIterator < sanitizedTextualData.length; charIterator++) {
        // Extract the character at the current position for evaluation.
        const inspectedCharacter = sanitizedTextualData[charIterator];

        // Conditional logic to update sequence counters based on the character.
        if (inspectedCharacter === TARGET_CHARACTER) {
            // If the character matches 'R', extend the current sequence.
            currentConsecutiveCount++;
        } else {
            // If a non-'R' character is encountered, the current sequence is broken.
            // Update the peak count if the just-completed sequence was longer.
            peakConsecutiveCount = Math.max(peakConsecutiveCount, currentConsecutiveCount);
            // Reset the current sequence counter to begin tracking a potential new sequence.
            currentConsecutiveCount = RESULT_FOR_NO_SEQUENCE;
        }
    }

    // After the loop concludes, it's crucial to compare the last 'currentConsecutiveCount'
    // with 'peakConsecutiveCount'. This handles cases where the string ends with 'R's.
    peakConsecutiveCount = Math.max(peakConsecutiveCount, currentConsecutiveCount);

    // Based on the maximum consecutive 'R's found, determine the final classification.
    // This tiered conditional structure maps the calculated peak length to the required output.
    let finalClassificationOutcome;
    if (peakConsecutiveCount >= RESULT_FOR_TRIPLE_SEQUENCE) {
        // If three or more consecutive 'R's were found, classify as 3.
        finalClassificationOutcome = RESULT_FOR_TRIPLE_SEQUENCE;
    } else if (peakConsecutiveCount === RESULT_FOR_DOUBLE_SEQUENCE) {
        // If exactly two consecutive 'R's were found, classify as 2.
        finalClassificationOutcome = RESULT_FOR_DOUBLE_SEQUENCE;
    } else if (peakConsecutiveCount === RESULT_FOR_SINGLE_SEQUENCE) {
        // If exactly one consecutive 'R' was found, classify as 1.
        finalClassificationOutcome = RESULT_FOR_SINGLE_SEQUENCE;
    } else {
        // If no 'R's or no consecutive 'R's were found (peak count is 0), classify as 0.
        finalClassificationOutcome = RESULT_FOR_NO_SEQUENCE;
    }

    // Present the derived numerical classification.
    emitFinalClassification(finalClassificationOutcome);
}

// Initiate the processing by reading input from the standard input stream.
// This typically involves file system operations to get data for the program.
handleInputOperation(require("fs").readFileSync("/dev/stdin", "utf8"));