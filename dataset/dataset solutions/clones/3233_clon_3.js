// This module is designed to process a specific type of game data,
// simulating a turn-based selection process between two players.
// The primary entry point, `ProcessGameData`, orchestrates the entire flow.

/**
 * Orchestrates the game simulation based on provided raw input data.
 * It parses item definitions, sorts them, and then simulates player turns
 * to calculate final scores, ultimately printing the score difference.
 *
 * @param {string} rawInputData - The complete input string, typically from stdin,
 *                                 containing game parameters and item details.
 */
function ProcessGameData(rawInputData) {

    // --- Input Validation and Pre-processing ---

    // Ensure the input is a valid string and not empty.
    if (!rawInputData || typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
        console.error("Execution Aborted: Raw input data is either empty, null, or not a string.");
        // In a more complex application, an error might be thrown or a specific error code returned.
        return; // Terminate execution gracefully.
    }

    // Split the entire input string into an array of individual lines.
    // Each line represents a distinct piece of information.
    const dataLines = rawInputData.split('\n');

    // The first line of the input typically specifies the total number of items
    // or the maximum number of turns in the game. Parse it as an integer.
    const totalGameTurns = Number(dataLines[0].trim());

    // Validate the parsed number of turns. It must be a positive integer.
    if (isNaN(totalGameTurns) || totalGameTurns <= 0) {
        console.error(`Execution Aborted: Invalid or non-positive turn count detected: "${dataLines[0].trim()}".`);
        return;
    }

    // --- Item Parsing and Initial Sorting ---

    // Process the subsequent lines (after the first line) to construct game items.
    // Each line describes an item with two numerical attributes.
    // We transform these into a structured array: [attributeA, attributeB, sumOfAttributes].
    // Items are then sorted primarily by their sum, which is crucial for the game logic.
    const gameItemRecords = dataLines.slice(1) // Skip the first line containing 'totalGameTurns'.
        .map(currentLineText => {
            // Ignore empty lines that might result from extra newlines in input.
            if (currentLineText.trim() === '') {
                return null; // Mark for removal later.
            }

            // Split the item's attributes, which are space-separated on each line.
            const attributeStringComponents = currentLineText.split(' ');

            // Convert string components to numerical values.
            const scoreComponentA = Number(attributeStringComponents[0]);
            const scoreComponentB = Number(attributeStringComponents[1]);

            // Validate that both components are valid numbers.
            if (isNaN(scoreComponentA) || isNaN(scoreComponentB)) {
                console.warn(`Warning: Skipping malformed item entry: "${currentLineText}". Expected two numbers.`);
                return null; // Mark for removal.
            }

            // Return the item as an array: [A's value, B's value, A+B sum].
            return [scoreComponentA, scoreComponentB, scoreComponentA + scoreComponentB];
        })
        .filter(item => item !== null) // Remove any items marked as null (malformed or empty lines).
        .sort((firstItem, secondItem) => {
            // Sort items in ascending order based on their combined sum (the third element).
            // This is a stable sort for items with equal sums.
            return firstItem[2] - secondItem[2];
        });

    // --- Game Simulation and Score Accumulation ---

    // Initialize accumulators for each player's total score.
    let playerOneTotalScore = 0;
    let playerTwoTotalScore = 0;

    // Iterate through the game for the specified number of turns.
    // In each turn, a player selects an item based on specific rules.
    for (let currentTurnIndex = 0; currentTurnIndex < totalGameTurns; ++currentTurnIndex) {
        // Ensure we don't go out of bounds if totalGameTurns > actual number of items.
        if (currentTurnIndex >= gameItemRecords.length) {
            console.warn(`Warning: Not enough items for ${totalGameTurns} turns. Stopping at turn ${currentTurnIndex}.`);
            break;
        }

        let subgroupIterator = 0;
        // This variable tracks the index *relative to currentTurnIndex* of the best item found
        // within the current subgroup of items having identical total sums.
        let optimalSubgroupItemOffset = 0;

        // Determine which player is making the selection this turn.
        // Player One (index 0) takes even turns, Player Two (index 1) takes odd turns.
        const activePlayerScoreIndex = currentTurnIndex % 2; // 0 for Player One, 1 for Player Two.

        // Scan the 'subgroup' of items that share the same combined sum as the item
        // at the current `currentTurnIndex`. This loop identifies the "best" item
        // within this subgroup for the current player's turn.
        while ((currentTurnIndex + subgroupIterator) < gameItemRecords.length &&
               gameItemRecords[currentTurnIndex + subgroupIterator][2] === gameItemRecords[currentTurnIndex][2]) {

            // Compare the current item in the subgroup with the current optimal candidate.
            // The comparison is based on the active player's specific score component.
            if (gameItemRecords[currentTurnIndex + subgroupIterator][activePlayerScoreIndex] >
                gameItemRecords[currentTurnIndex + optimalSubgroupItemOffset][activePlayerScoreIndex]) {
                // If a better item is found for the active player, update the optimal offset.
                optimalSubgroupItemOffset = subgroupIterator;
            }
            subgroupIterator++; // Move to the next item in the subgroup.
        }

        // If an item better than the one initially at `currentTurnIndex` was found
        // within the subgroup (meaning `optimalSubgroupItemOffset` is not 0),
        // swap it into the current `currentTurnIndex` position.
        // This ensures the chosen item is at the correct position for processing.
        if (optimalSubgroupItemOffset !== 0) {
            // Use array destructuring for an efficient and readable swap operation.
            [gameItemRecords[currentTurnIndex], gameItemRecords[currentTurnIndex + optimalSubgroupItemOffset]] =
            [gameItemRecords[currentTurnIndex + optimalSubgroupItemOffset], gameItemRecords[currentTurnIndex]];
        }

        // Assign the score from the selected item to the appropriate player.
        // The item at `currentTurnIndex` is now the one selected for this turn.
        if (activePlayerScoreIndex === 0) { // It's Player One's turn (even index).
            playerOneTotalScore += gameItemRecords[currentTurnIndex][0]; // Player One takes their 'A' score.
        } else { // It's Player Two's turn (odd index).
            playerTwoTotalScore += gameItemRecords[currentTurnIndex][1]; // Player Two takes their 'B' score.
        }
    }

    // --- Final Output ---

    // Calculate the difference between Player One's and Player Two's final scores.
    // This difference represents the outcome of the game.
    const finalScoreDifference = playerOneTotalScore - playerTwoTotalScore;

    // Print the final score difference to standard output.
    // Using a template literal for clear string formatting.
    console.log(`${finalScoreDifference}`);

    // Optionally, return the result for programmatic use, though the original
    // problem statement implies only a print to stdout.
    return finalScoreDifference;
}

// --- Environment-Specific Input Handling ---

// This standard block is for competitive programming environments.
// It reads all data from standard input (`/dev/stdin`) as a UTF-8 string
// and then passes it to our `ProcessGameData` function.
// This part should typically remain unaltered to ensure compatibility
// with the execution environment.
ProcessGameData(require("fs").readFileSync("/dev/stdin", "utf8"));