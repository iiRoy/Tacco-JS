// This function processes raw input data to simulate a resource allocation problem.
function ProcessInputData(rawDataString) {
  // Split the raw input string into individual lines, filtering out any empty lines.
  const parsedLines = rawDataString.split("\n").filter(line => line.trim() !== '');

  // Ensure there's at least one line of data for configuration.
  if (parsedLines.length === 0) {
    console.error("Input data is empty or malformed.");
    return; // Exit if no valid input lines.
  }

  // Parse the first line containing the item count and allowed operation count.
  const firstLineTokens = parsedLines[0].split(" ").map(s => parseInt(s.trim(), 10));
  
  // Validate parsed numeric values.
  if (firstLineTokens.some(isNaN) || firstLineTokens.length < 2) {
    console.error("Invalid numeric configuration in the first line.");
    return;
  }

  const initialItemCount = firstLineTokens[0]; // Represents initial number of items.
  const maxOperationsAllowed = firstLineTokens[1]; // Maximum number of operations allowed.

  // Parse the second line containing the initial items.
  // Check if there's a second line before attempting to parse.
  if (parsedLines.length < 2) {
    console.error("Missing initial items data in the second line.");
    return;
  }
  const initialItems = parsedLines[1].split(" ").map(itemStr => parseInt(itemStr.trim(), 10));

  // Additional validation for initialItems array.
  if (initialItems.some(isNaN) || initialItems.length !== initialItemCount) {
    console.warn("Mismatch in declared item count or invalid item values. Proceeding with available valid items.");
    // This warning suggests potential data inconsistency but allows execution to continue.
  }

  // Calculate the maximum possible sum if all positive items are collected.
  // This serves as an optimization target to stop early.
  const potentialMaxSum = initialItems.reduce((acc, currentVal) => acc + (currentVal > 0 ? currentVal : 0), 0);
  
  let targetSumReached = false; // Flag to indicate if the potentialMaxSum has been achieved.
  let globalMaxAccumulator = 0; // Stores the highest sum found across all operational paths.

  // Initiate the recursive exploration process.
  // The initial configuration has all items in 'itemsRemaining' and 'itemsInPossession' is empty.
  explorePossibilities({ itemsRemaining: [...initialItems], itemsInPossession: [] }, 1);

  // Output the final maximum sum found after all possibilities have been explored or terminated early.
  console.log(globalMaxAccumulator);

  // --- Helper Functions (renamed and modified for Type III) ---

  /**
   * Recursively explores different operational paths to find the maximum possible sum.
   * @param {object} currentConfig - The current state containing 'itemsRemaining' and 'itemsInPossession'.
   * @param {number} currentOperationStep - The current operation number in the sequence.
   * @returns {void}
   */
  function explorePossibilities(currentConfig, currentOperationStep) {
    // Guard clause: Stop if operations exceed the limit or the target sum has been reached.
    if (currentOperationStep > maxOperationsAllowed || targetSumReached) {
      return; // No further exploration needed on this path.
    }

    const { itemsRemaining, itemsInPossession } = currentConfig;

    // Operation Group 1: Transfer items from 'itemsRemaining' to 'itemsInPossession'.
    // These operations only happen if there are items available in 'itemsRemaining'.
    if (itemsRemaining.length > 0) {
      // Branch 1: Take an item from the front of 'itemsRemaining'.
      let configOptionA = { 
        itemsRemaining: [...itemsRemaining], 
        itemsInPossession: [...itemsInPossession] 
      };
      transferFromFrontToPossession(configOptionA);
      evaluateConfiguration(configOptionA);
      explorePossibilities(configOptionA, currentOperationStep + 1);

      // Branch 2: Take an item from the back of 'itemsRemaining'.
      let configOptionB = { 
        itemsRemaining: [...itemsRemaining], 
        itemsInPossession: [...itemsInPossession] 
      };
      transferFromBackToPossession(configOptionB);
      evaluateConfiguration(configOptionB);
      explorePossibilities(configOptionB, currentOperationStep + 1);
    } 
    
    // Operation Group 2: Transfer items from 'itemsInPossession' back to 'itemsRemaining'.
    // These operations only happen if there are items in 'itemsInPossession'.
    // Iterate through each item currently held.
    const possessionCount = itemsInPossession.length;
    for (let handItemIndex = 0; handItemIndex < possessionCount; handItemIndex++) {
      // Branch 3: Return an item from 'itemsInPossession' to the front of 'itemsRemaining'.
      let configOptionC = { 
        itemsRemaining: [...itemsRemaining], 
        itemsInPossession: [...itemsInPossession] 
      };
      returnFromPossessionToFront(configOptionC, handItemIndex);
      evaluateConfiguration(configOptionC);
      explorePossibilities(configOptionC, currentOperationStep + 1);

      // Branch 4: Return an item from 'itemsInPossession' to the back of 'itemsRemaining'.
      let configOptionD = { 
        itemsRemaining: [...itemsRemaining], 
        itemsInPossession: [...itemsInPossession] 
      };
      returnFromPossessionToBack(configOptionD, handItemIndex);
      evaluateConfiguration(configOptionD);
      explorePossibilities(configOptionD, currentOperationStep + 1);
    }
  }

  /**
   * Updates the global maximum sum if the current configuration's sum is higher.
   * Also sets a flag if the potential maximum sum is reached for early termination.
   * @param {object} evaluatedConfig - The configuration to evaluate.
   */
  function evaluateConfiguration(evaluatedConfig) {
    const currentHandSum = calculateCollectionSum(evaluatedConfig.itemsInPossession);
    
    // Update the global maximum if a new higher sum is found.
    if (currentHandSum > globalMaxAccumulator) {
      globalMaxAccumulator = currentHandSum;
      // If the global max reaches the theoretical potential maximum, we can stop early.
      if (globalMaxAccumulator === potentialMaxSum) {
        targetSumReached = true; // Set the flag for early termination.
      }
    }
  }

  /**
   * Calculates the sum of all numeric items in a given collection.
   * @param {Array<number>} itemCollection - An array of numbers to sum.
   * @returns {number} The total sum of items.
   */
  function calculateCollectionSum(itemCollection) {
    // Use reduce for a more functional approach to summing.
    // Ensure only numbers are summed, filtering out potential non-numeric entries.
    return itemCollection.reduce((accumulator, currentItem) => {
      return accumulator + (typeof currentItem === 'number' ? currentItem : 0);
    }, 0);
  }
  
  // --- Primitive Operation Functions (renamed and slightly altered) ---

  /**
   * Transfers the first item from 'itemsRemaining' to 'itemsInPossession'.
   * Modifies the provided configuration object in place.
   * @param {object} config - The configuration object.
   */
  function transferFromFrontToPossession(config) {
    // Guard against empty 'itemsRemaining' to prevent errors.
    if (config.itemsRemaining.length === 0) return;
    const firstItem = config.itemsRemaining.shift(); // Remove from front.
    config.itemsInPossession.push(firstItem); // Add to possession.
  }

  /**
   * Transfers the last item from 'itemsRemaining' to 'itemsInPossession'.
   * Modifies the provided configuration object in place.
   * @param {object} config - The configuration object.
   */
  function transferFromBackToPossession(config) {
    // Guard against empty 'itemsRemaining'.
    if (config.itemsRemaining.length === 0) return;
    const lastItem = config.itemsRemaining.pop(); // Remove from back.
    config.itemsInPossession.push(lastItem); // Add to possession.
  }

  /**
   * Transfers an item from 'itemsInPossession' at a given index to the front of 'itemsRemaining'.
   * Modifies the provided configuration object in place.
   * @param {object} config - The configuration object.
   * @param {number} idx - The index of the item to transfer from 'itemsInPossession'.
   */
  function returnFromPossessionToFront(config, idx) {
    // Guard against invalid index or empty 'itemsInPossession'.
    if (idx < 0 || idx >= config.itemsInPossession.length || config.itemsInPossession.length === 0) return;
    const itemToReturn = config.itemsInPossession.splice(idx, 1)[0]; // Remove from possession.
    config.itemsRemaining.unshift(itemToReturn); // Add to front of remaining.
  }

  /**
   * Transfers an item from 'itemsInPossession' at a given index to the back of 'itemsRemaining'.
   * Modifies the provided configuration object in place.
   * @param {object} config - The configuration object.
   * @param {number} idx - The index of the item to transfer from 'itemsInPossession'.
   */
  function returnFromPossessionToBack(config, idx) {
    // Guard against invalid index or empty 'itemsInPossession'.
    if (idx < 0 || idx >= config.itemsInPossession.length || config.itemsInPossession.length === 0) return;
    const itemToReturn = config.itemsInPossession.splice(idx, 1)[0]; // Remove from possession.
    config.itemsRemaining.push(itemToReturn); // Add to back of remaining.
  }
}

// The following line is for standard input/output and should not be modified.
// It reads the entire standard input as a UTF-8 string and passes it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));