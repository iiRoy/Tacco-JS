function processInputData(sourceText) {
    // Validate the primary input to ensure it's a non-empty string.
    if (typeof sourceText !== 'string' || sourceText.trim() === '') {
        console.error("Input processing terminated: Invalid or empty source data provided.");
        return;
    }

    // Split the entire input string into an array of individual lines.
    const rawDataSegments = sourceText.split("\n");

    // Helper function to safely parse an integer, providing a default or null on failure.
    const safelyParseInt = (value, base = 10) => {
        const parsed = parseInt(value, base);
        // Return null for invalid numbers instead of NaN, for clearer checks.
        return isNaN(parsed) ? null : parsed;
    };

    // --- Data Extraction and Initial Validation ---

    // Extract the sequence length (N) from the first line.
    const sequenceLength = safelyParseInt(rawDataSegments[0]);
    if (sequenceLength === null || sequenceLength < 1) {
        console.error("Input processing terminated: Sequence length (N) is invalid or missing.");
        return;
    }

    // Convert the initial string (S) from the second line into a mutable character array.
    // This is a critical change to allow in-place character updates, as JS strings are immutable.
    let charSequenceMutable = rawDataSegments[1] ? rawDataSegments[1].split('') : [];
    // A validation check for the initial sequence length.
    if (charSequenceMutable.length !== sequenceLength) {
        console.warn(`Warning: Declared sequence length (${sequenceLength}) differs from actual initial sequence length (${charSequenceMutable.length}). Proceeding with actual length.`);
        // Depending on problem requirements, this might be an error. For this clone, it's a warning.
    }

    // Extract the total number of operations (Q) from the third line.
    const totalOperations = safelyParseInt(rawDataSegments[2]);
    if (totalOperations === null || totalOperations < 0) {
        console.error("Input processing terminated: Total operations count (Q) is invalid or missing.");
        return;
    }

    // Define the starting line index for the operation commands.
    const operationCommandStartLine = 3;

    // Use slice to extract all operation command strings from the raw input.
    // This is a more functional approach compared to a manual loop.
    const operationCommands = rawDataSegments.slice(
        operationCommandStartLine,
        operationCommandStartLine + totalOperations
    );

    // --- Process Each Operation Command ---

    // Iterate over each command string received.
    for (const currentCommandSpec of operationCommands) {
        // Skip any empty command lines, providing robustness.
        if (currentCommandSpec.trim() === '') {
            console.warn("Skipping an empty command specification line.");
            continue;
        }

        // Split the command string into its individual components.
        const commandParts = currentCommandSpec.split(" ");
        // Parse the command type code.
        const commandIdentifier = safelyParseInt(commandParts[0]);

        // Use a switch statement to handle different command types.
        switch (commandIdentifier) {
            case 1: { // Command Type 1: Update a character at a specified 1-based position.
                // Parse the 1-based target position and the new character value.
                const targetPositionOneBased = safelyParseInt(commandParts[1]);
                const newCharacterValue = commandParts[2];

                // Comprehensive validation for update command parameters.
                if (targetPositionOneBased === null || newCharacterValue === undefined || newCharacterValue.length !== 1) {
                    console.warn(`Invalid parameters for character update command: "${currentCommandSpec}". Skipping.`);
                    break;
                }

                // Convert the 1-based position to a 0-based array index.
                const actualArrayIndex = targetPositionOneBased - 1;

                // Add a guard clause to ensure the index is within valid bounds of the character sequence.
                if (actualArrayIndex >= 0 && actualArrayIndex < charSequenceMutable.length) {
                    // Only perform the update if the character is actually changing, for minor optimization.
                    if (charSequenceMutable[actualArrayIndex] !== newCharacterValue) {
                        charSequenceMutable[actualArrayIndex] = newCharacterValue;
                    }
                } else {
                    console.warn(`Attempted update at out-of-bounds index ${targetPositionOneBased} for sequence of length ${charSequenceMutable.length}. Command: "${currentCommandSpec}".`);
                }
                break;
            }
            case 2: { // Command Type 2: Count distinct characters within a 1-based range [L, R).
                // Parse the 1-based left and right bounds of the range.
                // The original code's loop was `l` up to `r` (exclusive), affecting `S[l-1]` to `S[r-2]`.
                const leftBoundOneBased = safelyParseInt(commandParts[1]);
                const rightBoundOneBased = safelyParseInt(commandParts[2]);

                // Validate the range parameters.
                if (leftBoundOneBased === null || rightBoundOneBased === null) {
                    console.warn(`Invalid parameters for distinct character count command: "${currentCommandSpec}". Skipping.`);
                    break;
                }

                // Convert 1-based bounds to 0-based array indices.
                const startIdxZeroBased = leftBoundOneBased - 1;
                // The original loop condition `l < r` translates to `k < rightBoundOneBased - 1` for 0-based `k`.
                const endIdxExclusiveZeroBased = rightBoundOneBased - 1; 

                // Use a Set data structure for efficient tracking of unique characters.
                const uniqueCharactersFound = new Set();

                // Add comprehensive validation for the query range itself.
                // Ensures start is valid, end is valid, and the range is not inverted.
                if (startIdxZeroBased >= 0 && startIdxZeroBased < charSequenceMutable.length &&
                    endIdxExclusiveZeroBased >= startIdxZeroBased && endIdxExclusiveZeroBased <= charSequenceMutable.length) {
                    
                    // Iterate through the specified 0-based range.
                    for (let k = startIdxZeroBased; k < endIdxExclusiveZeroBased; k++) {
                        // Add an additional safety check for array bounds during iteration.
                        // This handles cases where `endIdxExclusiveZeroBased` might be valid but `k` could exceed if `charSequenceMutable` was modified.
                        if (k < charSequenceMutable.length) {
                            uniqueCharactersFound.add(charSequenceMutable[k]);
                        } else {
                            console.warn(`Range query encountered an out-of-bounds access at index ${k}. Terminating segment scan.`);
                            break;
                        }
                    }
                } else {
                    console.warn(`Invalid or out-of-bounds range [${leftBoundOneBased}, ${rightBoundOneBased}) for sequence length ${charSequenceMutable.length}. Command: "${currentCommandSpec}".`);
                }

                // Output the total count of distinct characters found in the range.
                console.log(uniqueCharactersFound.size);
                break;
            }
            default: { // Handle any unrecognized command types.
                console.warn(`Unsupported or unknown command identifier: ${commandIdentifier}. Command details: "${currentCommandSpec}".`);
                break;
            }
        }
    }
}