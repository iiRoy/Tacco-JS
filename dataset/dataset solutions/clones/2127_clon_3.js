function ProcessInputData(rawData) {
    // This function orchestrates the processing of a multi-line input string.
    // It parses initial configuration, then executes a series of specified operations.

    // Split the entire input string into an array of individual lines.
    const dataLines = rawData.split("\n");

    // Define a constant for the numeric radix (base 10) for parsing integers.
    const RADIX_DECIMAL = 10;

    // A small utility function to convert a string to an integer using the defined radix.
    const convertToInteger = (strValue) => parseInt(strValue, RADIX_DECIMAL);

    // Extract core parameters from the initial lines of input.
    // The initial length of the character sequence.
    const initialCharacterCount = convertToInteger(dataLines[0]);
    // The foundational string from which the character sequence is derived.
    const sourceStringData = dataLines[1];
    // The total number of operations or queries that follow.
    const totalOperationsToExecute = convertToInteger(dataLines[2]);

    // Initialize a mutable array of characters from the source string.
    // This allows for individual character modifications.
    let mutableCharSequence = Array.from(sourceStringData);

    // Determine the starting index in `dataLines` for reading operation specifications.
    let operationLineStartingIndex = 3;

    // Collect all raw operation strings into an array.
    const operationCommands = [];
    for (let opCounter = 0; opCounter < totalOperationsToExecute; opCounter++) {
        operationCommands.push(dataLines[operationLineStartingIndex + opCounter]);
    }

    // Process each operation command sequentially.
    for (const currentCommandString of operationCommands) {
        // Parse the command string into its constituent parts.
        const commandSegments = currentCommandString.split(" ");
        // The first segment indicates the type of operation.
        const commandType = convertToInteger(commandSegments[0]);

        // Use a switch statement to dispatch to the appropriate handler based on command type.
        switch (commandType) {
            case 1: // Command Type 1: Modify a character at a specified position.
                // The 1-indexed position to update.
                const targetOneBasedPosition = convertToInteger(commandSegments[1]);
                // The new character value to assign.
                const replacementCharacter = commandSegments[2];

                // Convert to 0-indexed for array access.
                const zeroBasedIndex = targetOneBasedPosition - 1;

                // Directly update the character in the sequence.
                mutableCharSequence[zeroBasedIndex] = replacementCharacter;
                break;

            case 2: // Command Type 2: Count distinct characters within a given range.
                // The 1-indexed start boundary of the range.
                const rangeLeftBoundary = convertToInteger(commandSegments[1]);
                // The 1-indexed end boundary of the range.
                const rangeRightBoundary = convertToInteger(commandSegments[2]);

                // Adjust boundaries to be 0-indexed for array iteration.
                const effectiveRangeStart = rangeLeftBoundary - 1;
                const effectiveRangeEnd = rangeRightBoundary - 1; // Inclusive

                // Utilize a Set to efficiently store and count unique characters.
                const uniqueCharactersInWindow = new Set();

                // Iterate through the specified range and add each character to the Set.
                for (let charIterator = effectiveRangeStart; charIterator <= effectiveRangeEnd; charIterator++) {
                    uniqueCharactersInWindow.add(mutableCharSequence[charIterator]);
                }

                // Output the total count of unique characters found in the range.
                // Using a template literal for straightforward console output.
                console.log(`${uniqueCharactersInWindow.size}`);
                break;

            default: // Fallback for any unrecognized command types.
                // This serves as an error-handling or logging mechanism.
                console.warn(`Unrecognized operation command type encountered: ${commandType}. Skipping.`);
                break;
        }
    }
}

// The script's entry point: reads input from standard input (/dev/stdin).
// It ensures the input is read as UTF-8 and then passes it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));