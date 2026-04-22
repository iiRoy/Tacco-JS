/*
 * This module orchestrates a simulation involving elemental entities within a sequence.
 * It processes a series of commands to determine the final count of active entities
 * after various movement operations.
 * The input defines the initial state and subsequent operational spells.
 */
function processElementalSimulation(rawDataString) {
    // Divide the raw input string into an array of individual lines for easier parsing.
    const parsedInputLines = rawDataString.split("\n");

    // Extract the initial length of the elemental sequence from the first line.
    // The first number on the first line specifies the sequence size.
    let sequenceLength = parseInt(parsedInputLines[0].split(" ")[0], 10);

    // Implement basic validation for the sequence length.
    // If invalid, log an error and terminate the simulation.
    if (isNaN(sequenceLength) || sequenceLength <= 0) {
        console.error("Initialization error: Provided sequence length is not a positive integer. Aborting simulation.");
        return;
    }

    // Initialize the primary data structure: an array representing the counts
    // of active elements at each position within the sequence.
    // Each position starts with a single active element.
    let currentElementCounts = new Array(sequenceLength).fill(1);

    // The second line of input provides the character sequence that governs
    // how elements respond to movement spells.
    const characterSequenceMap = parsedInputLines[1];

    // Validate if the character map length matches the declared sequence length.
    // A mismatch could lead to unexpected behavior; a warning is issued.
    if (characterSequenceMap.length !== sequenceLength) {
        console.warn(`Configuration Warning: Character sequence map length (${characterSequenceMap.length}) does not match declared sequence length (${sequenceLength}). Proceeding, but behavior may be unexpected for out-of-bounds indices.`);
    }

    // Iterate through each subsequent line, treating it as a "spell" or operation
    // that modifies the state of the elemental counts.
    // Processing starts from the third line (index 2).
    for (let operationIndex = 2; operationIndex < parsedInputLines.length; operationIndex++) {
        const currentSpellCommand = parsedInputLines[operationIndex].trim();

        // Skip any empty or malformed command lines to prevent errors.
        if (currentSpellCommand.length < 3) {
            // console.warn(`Skipping malformed or empty spell command: "${currentSpellCommand}"`);
            continue; // Move to the next command
        }

        // Deconstruct the spell command:
        // The first character is the target character for the spell.
        // The third character ('L' or 'R') indicates the movement direction.
        const spellTargetChar = currentSpellCommand[0];
        const spellMoveDirection = currentSpellCommand[2];

        // Prepare a temporary array to store the element counts after applying
        // the effects of the current spell. It is initialized with zeros.
        const nextElementCounts = new Array(sequenceLength).fill(0);

        // Apply the spell's effects by iterating through each position in the current element counts array.
        for (let currentPosition = 0; currentPosition < sequenceLength; currentPosition++) {
            const elementsAtCurrentPosition = currentElementCounts[currentPosition];

            // Elements cannot move if there are none at the current position.
            if (elementsAtCurrentPosition === 0) {
                continue;
            }

            // Determine if the character at the current position matches the spell's target.
            const isTargetCharMatch = (characterSequenceMap[currentPosition] === spellTargetChar);

            // Calculate the potential new position for the elements.
            // By default, elements stay at their current position.
            let potentialNewPosition = currentPosition;

            if (isTargetCharMatch) {
                // If the character matches, elements attempt to move according to the spell's direction.
                if (spellMoveDirection === 'L') {
                    potentialNewPosition = currentPosition - 1; // Move one step left
                } else if (spellMoveDirection === 'R') {
                    potentialNewPosition = currentPosition + 1; // Move one step right
                } else {
                    // Log a warning for unrecognized movement directions, elements remain stationary.
                    console.warn(`Unrecognized spell direction '${spellMoveDirection}' at command index ${operationIndex}. Elements at position ${currentPosition} remain stationary.`);
                    // potentialNewPosition remains currentPosition.
                }
            }
            // If 'isTargetCharMatch' is false, 'potentialNewPosition' remains 'currentPosition' (elements don't move).

            // Check if the calculated new position is within the valid bounds of the sequence.
            // Elements that move out of bounds are considered lost and are not added to 'nextElementCounts'.
            const isPositionValid = (potentialNewPosition >= 0 && potentialNewPosition < sequenceLength);

            if (isPositionValid) {
                // Add the elements from the current position to their new valid position.
                nextElementCounts[potentialNewPosition] += elementsAtCurrentPosition;
            }
        }

        // After processing all positions for the current spell, update the main
        // element counts array for the next iteration. A shallow copy is made.
        currentElementCounts = Array.from(nextElementCounts);

        // Optimization: If all elements are lost after a spell, there's no need
        // to process subsequent spells, as no elements remain to move.
        const totalElementsAfterSpell = currentElementCounts.reduce((sum, count) => sum + count, 0);
        if (totalElementsAfterSpell === 0) {
            // All elements have been destroyed or moved off-screen. Exit the spell processing loop.
            break;
        }
    }

    // Calculate the final sum of all active elements remaining in the sequence.
    let finalActiveElementCount = 0;
    for (const countValue of currentElementCounts) {
        finalActiveElementCount += countValue;
    }
    // An alternative using array.reduce:
    // const finalActiveElementCount = currentElementCounts.reduce((sum, count) => sum + count, 0);

    // Output the final count of active elements to the console.
    console.log(finalActiveElementCount);
}

// Self-executing anonymous function to handle input reading and initiate the simulation.
(function() {
    try {
        // Read the entire content from standard input, assuming UTF-8 encoding.
        const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
        // Start the elemental simulation with the retrieved input data.
        processElementalSimulation(fileData);
    } catch (error) {
        // Catch and log any errors that occur during file reading or simulation.
        console.error("An error occurred during input processing or simulation execution:", error.message);
    }
})();