function processInputData(rawData) {
    // 1. Initial Input Parsing and Setup
    // Remove leading/trailing whitespace from the entire input, then split into individual lines.
    // Each line is further split by spaces, creating a 2D array of string segments.
    const parsedLineSegments = rawData.trim().split("\n").map(segment => segment.split(" "));

    // Extract the primary character sequence from the first line's first segment.
    const primaryCharacterSequence = parsedLineSegments[0][0];
    // Retrieve the total count of operations to be performed from the second line's first segment.
    const totalOperationCount = Number.parseInt(parsedLineSegments[1][0], 10);

    // Prepare an array to store all subsequent operation specifications.
    // Operations start from the third line (index 2) of the parsed input.
    const detailedOperationSpecs = [];
    for (let opIndex = 0; opIndex < totalOperationCount; opIndex++) {
        // Incorporate a basic validation: ensure the operation line exists.
        // If a line is missing, we'll break early to prevent errors, which is a Type III addition.
        if (opIndex + 2 >= parsedLineSegments.length) {
            // For a robust system, an error might be logged or thrown here.
            break;
        }
        detailedOperationSpecs.push(parsedLineSegments[opIndex + 2]);
    }

    // 2. Initialize the dynamic character buffer and internal pointers.
    // Calculate a generous buffer capacity to accommodate the initial string and all possible character additions.
    // We add `totalOperationCount * 2` to ensure enough space for additions to both ends, plus a small safety margin.
    const bufferExpansionAllowance = totalOperationCount + 10;
    const allocatedBufferCapacity = primaryCharacterSequence.length + (bufferExpansionAllowance * 2);

    // Create a new array and pre-fill it with empty strings. This serves as our character storage.
    const characterStorageBuffer = new Array(allocatedBufferCapacity).fill('');

    // Define pointers for the current active front and back boundaries of the sequence within the buffer.
    // The initial sequence is placed roughly in the middle of the allocated buffer.
    let currentFrontBoundary = bufferExpansionAllowance;
    let currentBackBoundary = bufferExpansionAllowance + primaryCharacterSequence.length - 1;

    // Populate the initial character sequence into the designated part of the buffer.
    for (let charPos = 0; charPos < primaryCharacterSequence.length; charPos++) {
        characterStorageBuffer[currentFrontBoundary + charPos] = primaryCharacterSequence[charPos];
    }

    // Introduce a boolean flag to track if the sequence is conceptually reversed.
    // This allows for efficient "flipping" without physically moving characters.
    let isSequenceConceptuallyReversed = false;

    // 3. Process each specified operation.
    for (let opIndex = 0; opIndex < totalOperationCount; opIndex++) {
        const activeOperation = detailedOperationSpecs[opIndex];
        const operationCategory = activeOperation[0]; // '1' for flip, '2' for character addition.

        // Operation Type 1: Toggle the conceptual reversal state.
        if (operationCategory === '1') {
            isSequenceConceptuallyReversed = !isSequenceConceptuallyReversed;
            // No physical array manipulation or pointer adjustments needed here,
            // which is a key Type III change from the original's array reversal.
            continue; // Proceed to the next operation.
        }

        // Operation Type 2: Add a character to either end.
        const insertionPointIndicator = activeOperation[1]; // '1' for conceptual front, '2' for conceptual back.
        const characterToInsert = activeOperation[2];

        // The actual physical insertion point depends on the `isSequenceConceptuallyReversed` flag.
        if (isSequenceConceptuallyReversed) {
            // If the sequence is conceptually reversed:
            // - Adding to the "conceptual front" means physically adding to the `currentBackBoundary` side.
            // - Adding to the "conceptual back" means physically adding to the `currentFrontBoundary` side.
            if (insertionPointIndicator === '1') { // Add to conceptual front
                currentBackBoundary++;
                characterStorageBuffer[currentBackBoundary] = characterToInsert;
            } else { // Add to conceptual back
                currentFrontBoundary--;
                characterStorageBuffer[currentFrontBoundary] = characterToInsert;
            }
        } else {
            // If the sequence is not conceptually reversed:
            // - Adding to the "conceptual front" means physically adding to the `currentFrontBoundary` side.
            // - Adding to the "conceptual back" means physically adding to the `currentBackBoundary` side.
            if (insertionPointIndicator === '1') { // Add to physical front
                currentFrontBoundary--;
                characterStorageBuffer[currentFrontBoundary] = characterToInsert;
            } else { // Add to physical back
                currentBackBoundary++;
                characterStorageBuffer[currentBackBoundary] = characterToInsert;
            }
        }
        // An additional guard for buffer overflow could be placed here,
        // though typically problem constraints ensure sufficient initial buffer size.
        // if (currentFrontBoundary < 0 || currentBackBoundary >= allocatedBufferCapacity) { /* Handle overflow */ }
    }

    // 4. Construct the final result string from the active part of the buffer.
    const finalCharacterElements = [];
    // Extract characters between the active front and back boundaries (inclusive).
    for (let currentPos = currentFrontBoundary; currentPos <= currentBackBoundary; currentPos++) {
        finalCharacterElements.push(characterStorageBuffer[currentPos]);
    }

    // If the sequence ended in a conceptually reversed state, physically reverse the extracted elements.
    if (isSequenceConceptuallyReversed) {
        finalCharacterElements.reverse();
    }

    // Join the collected characters to form the final string.
    return finalCharacterElements.join('');
}

// Standard entry point for Node.js execution, reading from standard input.
// This block ensures the code runs correctly in a typical competitive programming setup.
if (typeof require !== 'undefined' && require.main === module) {
    const fileSystem = require("fs");
    const inputPayload = fileSystem.readFileSync("/dev/stdin", "utf8");
    const resultingString = processInputData(inputPayload);
    console.log(resultingString);
}