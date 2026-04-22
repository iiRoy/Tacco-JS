// This module implements a simulation algorithm that processes a sequence of characters
// based on a series of directional transformation rules. It tracks the cumulative
// counts of 'entities' at various positions within the sequence, applying shifts
// according to specified rules and then reports the total sum of these entities.

function processInputData(rawInputText) {
    // --- Input Validation and Parsing (Type III Additions for Robustness) ---

    // Basic validation: Ensure the input is a non-empty string.
    if (typeof rawInputText !== 'string' || rawInputText.trim().length === 0) {
        // In a real application, one might throw an error or return a specific error code.
        // For this context, logging an error and returning early is sufficient.
        console.error("Error: The provided input data is invalid or empty. Please provide a non-empty string.");
        return;
    }

    // Split the entire raw input string into an array of individual lines.
    let inputLines = rawInputText.split("\n");

    // The first line is typically a dummy or an unused header in such problems.
    // We extract it to conform to the input structure, but its value is not used,
    // which is a form of 'deletion' of non-essential logic for this specific problem.
    const initialHeaderLine = inputLines.shift();

    // After removing the header, the next line should contain the character sequence.
    // Validate if the sequence line exists.
    if (inputLines.length === 0) {
        console.error("Error: No character sequence line found in the input after header processing.");
        return;
    }
    const characterSequenceArray = inputLines.shift().split(""); // Convert string to char array.
    const sequenceLength = characterSequenceArray.length;

    // Validate the length of the character sequence itself.
    if (sequenceLength === 0) {
        console.error("Error: The character sequence extracted from input is empty.");
        return;
    }

    // Parse the remaining lines, each representing a transformation rule.
    // Each rule consists of a target character and a direction ('L' for Left, 'R' for Right).
    const transformationRules = inputLines.map(lineContent => {
        const ruleDefinitionParts = lineContent.split(" ");
        // Enhanced validation for each rule's format and allowed directions.
        if (ruleDefinitionParts.length !== 2 || !['L', 'R'].includes(ruleDefinitionParts[1])) {
            console.warn(`Warning: Skipping malformed or invalid rule definition: "${lineContent}". Expected format: "char [L|R]".`);
            return null; // Invalid rules will be filtered out.
        }
        return {
            targetCharacter: ruleDefinitionParts[0],
            movementDirection: ruleDefinitionParts[1]
        };
    }).filter(Boolean); // Filter out any `null` entries resulting from invalid rules.

    // --- Core Simulation Logic (Type II & Type III Changes) ---

    // Initialize an array to store the counts of entities at each position in the sequence.
    // Initially, each position is considered to hold one entity.
    // Using `Array.from` for a more modern and explicit array initialization.
    let currentEntityCounts = Array.from({ length: sequenceLength }, () => 1);

    // Introduce constants for clarity when referring to movement directions.
    const MOVE_LEFT = 'L';
    const MOVE_RIGHT = 'R';

    // Iterate through each transformation rule provided in the input.
    // Each rule represents one step in the simulation of entity movements.
    for (let ruleIteration = 0; ruleIteration < transformationRules.length; ruleIteration++) {
        const currentRule = transformationRules[ruleIteration];
        const ruleTargetChar = currentRule.targetCharacter;
        const ruleMovementDirection = currentRule.movementDirection;

        // A new array to accumulate the entity counts for the *next* state.
        // This array will receive contributions from non-matching characters and 'L' moves.
        let nextEntityCounts = new Array(sequenceLength).fill(0);

        // Create a *mutable working copy* of the current entity counts.
        // This copy is essential to replicate the original code's specific behavior for 'R' moves:
        // 'R' moves modify this array in-place, allowing cascading effects within the same inner loop.
        // This array's final state for this iteration will be discarded, but its intermediate states are critical.
        let mutableStateForRightwardShifts = [...currentEntityCounts];

        // Iterate through each position in the character sequence.
        for (let positionIndex = 0; positionIndex < sequenceLength; positionIndex++) {
            // Get the entity count at the current position from the mutable working state.
            // This ensures that 'R' moves from previous positions (j-1) correctly influence
            // the count at the current position (j) before it's processed.
            const entitiesAtCurrentPosition = mutableStateForRightwardShifts[positionIndex];

            // If the character at `positionIndex` does not match the rule's target character:
            if (characterSequenceArray[positionIndex] !== ruleTargetChar) {
                // The entities at this position remain, contributing to the same position in the next state.
                nextEntityCounts[positionIndex] += entitiesAtCurrentPosition;
            } else {
                // If the character matches the target, apply the directional movement.
                if (ruleMovementDirection === MOVE_LEFT) {
                    const destinationIndexLeft = positionIndex - 1;
                    // Ensure the leftward move stays within the bounds of the sequence.
                    if (destinationIndexLeft >= 0) {
                        // Entities move left, contributing to the `nextEntityCounts` array.
                        nextEntityCounts[destinationIndexLeft] += entitiesAtCurrentPosition;
                    }
                    // If moving out of bounds (e.g., from index 0 to -1), these entities are "lost".
                } else if (ruleMovementDirection === MOVE_RIGHT) {
                    const destinationIndexRight = positionIndex + 1;
                    // Ensure the rightward move stays within the bounds of the sequence.
                    if (destinationIndexRight < sequenceLength) {
                        // This is the crucial part replicating the original code's behavior:
                        // For 'R' moves, entities are added directly to the *mutable working state*
                        // at the new position. This allows for cascading additions for subsequent
                        // positions within the *same* rule iteration.
                        // IMPORTANT: The entities at `positionIndex` themselves are NOT added to `nextEntityCounts`
                        // when an 'R' move occurs; they are considered "consumed" by the rightward shift.
                        mutableStateForRightwardShifts[destinationIndexRight] += entitiesAtCurrentPosition;
                    }
                    // If moving out of bounds (e.g., from N-1 to N), these entities are "lost".
                }
                // (No 'else' block for invalid directions, as they are filtered during parsing).
            }
        }
        // After iterating through all positions for the current rule:
        // The `mutableStateForRightwardShifts` (which handled 'R' moves) is effectively discarded.
        // The `nextEntityCounts` array, containing results from 'L' moves and non-matches,
        // becomes the new `currentEntityCounts` for the next rule iteration.
        currentEntityCounts = nextEntityCounts;
    }

    // --- Final Calculation and Output ---

    // Calculate the total sum of all entities across all positions in the final state.
    // Using `reduce` for a functional and concise summation.
    const totalFinalEntities = currentEntityCounts.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Output the final calculated sum to the console.
    console.log(totalFinalEntities);
}

// Entry point: Read input from standard input and pass it to the processing function.
// This part remains largely unchanged as it handles the external interaction.
// `require('fs').readFileSync('/dev/stdin', 'utf8')` is a common pattern for Node.js
// applications in competitive programming environments to read all input at once.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));