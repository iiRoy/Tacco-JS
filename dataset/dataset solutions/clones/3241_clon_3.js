// This module encapsulates the logic for a strategic item selection game.
// Players take turns selecting items from a pool, aiming to maximize their score difference.

/**
 * Processes raw input data to simulate a two-player item selection game.
 * Each item has two associated values, and players pick items based on
 * different priorities to achieve the highest possible score difference.
 *
 * @param {string} rawInputString The entire input as a single string,
 *                                  typically from standard input.
 */
function ProcessGameData(rawInputString) {
  // Parse the input string into individual lines, trimming any leading/trailing whitespace.
  const inputLines = rawInputString.trim().split('\n');

  // --- Input Validation and Setup ---

  // Ensure there's at least one line for the item count.
  if (inputLines.length === 0) {
    console.error("Error: Input data is empty. Cannot proceed with game simulation.");
    return; // Exit if no input
  }

  // Extract the total number of items from the first line.
  const totalItemCount = parseInt(inputLines[0], 10);

  // Validate the parsed item count.
  if (isNaN(totalItemCount) || totalItemCount < 0) {
    console.error("Error: Invalid number of items specified in the input. Must be a non-negative integer.");
    return;
  }
  if (totalItemCount === 0) {
    console.log(0); // If no items, difference is 0
    return;
  }

  // Check if enough data lines are provided for all items.
  if (inputLines.length < totalItemCount + 1) {
    console.error(`Error: Insufficient data lines provided. Expected ${totalItemCount + 1} but got ${inputLines.length}.`);
    return;
  }

  // Prepare a collection of all items, enriching them with their original index.
  const initialItemRecords = [];
  for (let lineIdx = 0; lineIdx < totalItemCount; lineIdx++) {
    const dataParts = inputLines[lineIdx + 1].split(" ").map(Number);

    // Validate each item's data structure.
    if (dataParts.length < 2 || isNaN(dataParts[0]) || isNaN(dataParts[1])) {
      console.warn(`Warning: Malformed item data on line ${lineIdx + 2}. Skipping this item.`);
      continue; // Skip invalid items
    }

    initialItemRecords.push({
      firstValue: dataParts[0],
      secondValue: dataParts[1],
      originalIdentifier: lineIdx, // Store original index to track claimed items
    });
  }

  // If after parsing, we have fewer items than totalItemCount, adjust accordingly.
  const actualItemCount = initialItemRecords.length;
  if (actualItemCount === 0) {
    console.log(0);
    return;
  }

  // --- Sorting Strategies for Players ---

  // Comparator for Player Alpha's strategy: prioritize higher 'firstValue', then higher 'secondValue'.
  const sortForPlayerAlpha = (recordA, recordB) => {
    if (recordA.firstValue < recordB.firstValue) return 1;
    if (recordA.firstValue > recordB.firstValue) return -1;
    if (recordA.secondValue < recordB.secondValue) return 1;
    if (recordA.secondValue > recordB.secondValue) return -1;
    return 0;
  };

  // Comparator for Player Beta's strategy: prioritize higher 'secondValue', then higher 'firstValue'.
  const sortForPlayerBeta = (recordA, recordB) => {
    if (recordA.secondValue < recordB.secondValue) return 1;
    if (recordA.secondValue > recordB.secondValue) return -1;
    if (recordA.firstValue < recordB.firstValue) return 1;
    if (recordA.firstValue > recordB.firstValue) return -1;
    return 0;
  };

  // Create two distinct lists, each sorted according to a player's specific picking criteria.
  // Using spread syntax `...` ensures a shallow copy, so sorting doesn't affect the original.
  const alphaPrioritizedItems = [...initialItemRecords].sort(sortForPlayerAlpha);
  const betaPrioritizedItems = [...initialItemRecords].sort(sortForPlayerBeta);

  // --- Game State Variables ---

  let alphaScoreAccumulator = 0; // Total score for Player Alpha
  let betaScoreAccumulator = 0;  // Total score for Player Beta
  let currentTurnFlag = 0;       // 0 for Alpha's turn, 1 for Beta's turn

  // A Set provides efficient O(1) average-case time complexity for checking
  // if an item's original identifier has already been claimed.
  const claimedItemIdentifiers = new Set();

  // --- Helper for Item Selection ---

  /**
   * Retrieves the next available item from a sorted list, ensuring it hasn't been claimed yet.
   * Marks the selected item's original identifier as claimed.
   *
   * @param {Array<Object>} sortedList The list of items sorted by a player's preference.
   * @param {Set<number>} usedIdentifiersSet A set tracking original identifiers of claimed items.
   * @returns {Object|null} The chosen item object, or null if no available item is found.
   */
  const selectAndClaimItem = (sortedList, usedIdentifiersSet) => {
    let pickedItem = null;
    // Iterate through the sorted list, removing items that are already claimed
    // until an available one is found or the list is exhausted.
    while (sortedList.length > 0) {
      const candidateItem = sortedList[0]; // Peek at the top item
      if (!usedIdentifiersSet.has(candidateItem.originalIdentifier)) {
        pickedItem = candidateItem;
        usedIdentifiersSet.add(pickedItem.originalIdentifier); // Mark as used
        sortedList.shift(); // Remove from the working list (expensive for large arrays)
        return pickedItem;
      } else {
        // This item has already been claimed by the other player; discard it from this list.
        sortedList.shift();
      }
    }
    return null; // No available items left in this list
  };

  // --- Main Game Simulation Loop ---

  // Players take turns selecting items until all items are claimed.
  for (let round = 0; round < actualItemCount; round++) {
    let selectedItemForRound = null;

    if (currentTurnFlag === 0) { // It's Player Alpha's turn
      selectedItemForRound = selectAndClaimItem(alphaPrioritizedItems, claimedItemIdentifiers);
      if (selectedItemForRound) {
        alphaScoreAccumulator += selectedItemForRound.firstValue;
      } else {
          // This edge case implies an issue if actualItemCount is correct and items exist
          break;
      }
      currentTurnFlag = 1; // Switch turn to Player Beta
    } else { // It's Player Beta's turn
      selectedItemForRound = selectAndClaimItem(betaPrioritizedItems, claimedItemIdentifiers);
      if (selectedItemForRound) {
        betaScoreAccumulator += selectedItemForRound.secondValue;
      } else {
          break;
      }
      currentTurnFlag = 0; // Switch turn back to Player Alpha
    }
  }

  // Calculate the final score difference as per game rules.
  const finalScoreOutcome = alphaScoreAccumulator - betaScoreAccumulator;

  // Output the result to the console.
  console.log(finalScoreOutcome);
}

// --- Entry Point for Execution ---

// This block ensures the `ProcessGameData` function is called when the script is executed
// in a Node.js environment, typically for competitive programming platforms.
// It reads the entire content of standard input as a UTF-8 string.
if (typeof require !== 'undefined' && require.main === module) {
  try {
    const fileSystem = require("fs");
    const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    ProcessGameData(standardInputContent);
  } catch (error) {
    console.error("An error occurred during input reading or processing:", error.message);
    // Optionally, handle specific error types (e.g., file not found for /dev/stdin)
  }
}