// This module defines a core function to process a specific data format,
// simulating a game-like scenario where two players accumulate scores.
// The input consists of a series of numerical pairs, and decisions are made
// based on these values and their sums.

/**
 * Processes raw string input to calculate a final score difference.
 * The input is expected to be multi-line:
 * - The first line contains an integer representing the total number of data entries.
 * - Subsequent lines each contain two space-separated integers (e.g., "10 20").
 *
 * @param {string} rawInputData - The entire input as a single string.
 */
const ProcessGameData = (rawInputData) => {
    // Input validation: Ensure the raw data is a non-empty string.
    if (typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
        console.error("Error: Input data is missing or not a string.");
        // In a real application, one might throw an exception or return a specific error code.
        return;
    }

    // Define constants for array indices to enhance code readability and maintainability.
    // Each processed item will be an array: [value_a, value_b, sum_a_b]
    const VALUE_A_INDEX = 0;
    const VALUE_B_INDEX = 1;
    const SUM_OF_VALUES_INDEX = 2; // This index stores the pre-calculated sum of A and B.

    // Split the raw input into individual lines.
    // Using a regex for split handles both Windows (\r\n) and Unix (\n) line endings.
    const dataLines = rawInputData.split(/\r?\n/);

    // Attempt to parse the first line, which should contain the expected count of entries.
    const declaredEntryCount = parseInt(dataLines[0], 10);

    // Validate the declared entry count.
    if (isNaN(declaredEntryCount) || declaredEntryCount <= 0) {
        console.error(`Error: Invalid or non-positive entry count found: "${dataLines[0]}". Expected a positive integer.`);
        return;
    }

    /**
     * Helper function to parse a single line of data into a structured array.
     * @param {string} lineText - The text content of a single line (e.g., "5 15").
     * @returns {number[] | null} An array [valA, valB, valA+valB] or null if parsing fails.
     */
    const parseDataEntry = (lineText) => {
        // Remove leading/trailing whitespace and split by space.
        const numericalParts = lineText.trim().split(' ');

        // Ensure exactly two numerical parts are present.
        if (numericalParts.length !== 2) {
            console.warn(`Warning: Malformed data line encountered, skipping: "${lineText}"`);
            return null;
        }

        const firstValue = parseInt(numericalParts[VALUE_A_INDEX], 10);
        const secondValue = parseInt(numericalParts[VALUE_B_INDEX], 10);

        // Validate that both parsed values are actual numbers.
        if (isNaN(firstValue) || isNaN(secondValue)) {
            console.warn(`Warning: Non-numeric values found in line, skipping: "${lineText}"`);
            return null;
        }

        // Return the structured entry including the pre-calculated sum.
        return [firstValue, secondValue, firstValue + secondValue];
    };

    // Process the data lines (excluding the first count line).
    // Map each line to a structured entry, then filter out any entries that failed parsing.
    const gameItemsCollection = dataLines.slice(1)
        .map(parseDataEntry)
        .filter(item => item !== null); // Remove nulls from failed parsing.

    // After parsing, verify if the actual number of valid items matches the declared count.
    if (gameItemsCollection.length !== declaredEntryCount) {
        console.warn(`Discrepancy: Declared count was ${declaredEntryCount}, but ${gameItemsCollection.length} valid entries were parsed.`);
        // The algorithm will proceed with the actually parsed items.
    }

    // Sort the collection of game items. The primary sorting criterion is the sum of A and B.
    // Items with smaller sums come first.
    gameItemsCollection.sort((item1, item2) => {
        return item1[SUM_OF_VALUES_INDEX] - item2[SUM_OF_VALUES_INDEX];
    });

    // Initialize scores for both players.
    let playerOneCumulativeScore = 0;
    let playerTwoCumulativeScore = 0;

    // Iterate through the sorted game items, simulating turns for the players.
    // Player One takes even turns (0, 2, 4...), Player Two takes odd turns (1, 3, 5...).
    for (let currentTurnIndex = 0; currentTurnIndex < gameItemsCollection.length; ++currentTurnIndex) {
        const isPlayerOneTurn = (currentTurnIndex % 2 === 0);
        // Determine which value (A or B) is relevant for the current player's choice.
        const currentPlayersPreferredValueIndex = isPlayerOneTurn ? VALUE_A_INDEX : VALUE_B_INDEX;

        // Find the end of the current "block" of items that have the same A+B sum.
        let blockRelativeOffset = 0;
        // Keep track of the offset of the best item found within this block for the current player.
        let bestItemOffsetInBlock = 0;
        let highestValueInBlock = gameItemsCollection[currentTurnIndex][currentPlayersPreferredValueIndex];

        // Traverse through the block of items with identical sums.
        while (
            (currentTurnIndex + blockRelativeOffset < gameItemsCollection.length) &&
            (gameItemsCollection[currentTurnIndex + blockRelativeOffset][SUM_OF_VALUES_INDEX] === gameItemsCollection[currentTurnIndex][SUM_OF_VALUES_INDEX])
        ) {
            const candidateItemValue = gameItemsCollection[currentTurnIndex + blockRelativeOffset][currentPlayersPreferredValueIndex];
            // If a better item for the current player is found, update the best choice.
            if (candidateItemValue > highestValueInBlock) {
                highestValueInBlock = candidateItemValue;
                bestItemOffsetInBlock = blockRelativeOffset;
            }
            blockRelativeOffset++;
        }

        // If the best item for the current player was not already at the front of the block,
        // swap it into the current position so it can be "picked".
        if (bestItemOffsetInBlock !== 0) {
            // Utilize array destructuring for a clean swap operation.
            [gameItemsCollection[currentTurnIndex], gameItemsCollection[currentTurnIndex + bestItemOffsetInBlock]] =
            [gameItemsCollection[currentTurnIndex + bestItemOffsetInBlock], gameItemsCollection[currentTurnIndex]];
        }

        // Add the value of the chosen item to the current player's score.
        const selectedItem = gameItemsCollection[currentTurnIndex];
        if (isPlayerOneTurn) {
            playerOneCumulativeScore += selectedItem[VALUE_A_INDEX];
        } else {
            playerTwoCumulativeScore += selectedItem[VALUE_B_INDEX];
        }
    }

    // Output the final difference between Player One's and Player Two's scores.
    console.log(`Final score difference (Player A - Player B): ${playerOneCumulativeScore - playerTwoCumulativeScore}`);
};

// This part of the code is boilerplate for competitive programming environments
// to read input from standard input and pass it to the main processing function.
// It should typically remain unchanged to ensure compatibility with judge systems.
((executionPayload) => {
    // The primary processing function is invoked here with the input.
    ProcessGameData(executionPayload);
})(require("fs").readFileSync("/dev/stdin", "utf8"));