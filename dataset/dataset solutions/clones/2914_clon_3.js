function ProcessInputData(rawInputStr) {
  // Parse the raw input string into individual lines.
  const parsedLines = rawInputStr.split("\n");
  // Remove the last element, which is typically an empty string from the trailing newline.
  parsedLines.pop();

  // Extract numerical parameters from the first line of input.
  const initialParameters = parsedLines[0].split(" ");
  // The first parameter (item count) is not directly used in the simulation logic, so we skip it.
  const maximumAllowedOperations = parseInt(initialParameters[1], 10);

  // Parse the initial set of items (jwells) from the second line into an array of numbers.
  const initialItemsQueue = parsedLines[1].split(" ").map(s => parseInt(s, 10));

  // Initialize the global maximum sum found across all possible game states.
  let globalMaxSum = 0;

  /**
   * Calculates the total value of items currently held in hand.
   * @param {number[]} itemsInHand - An array of item values currently held.
   * @returns {number} The sum of all items in hand.
   */
  const calculateHandTotal = (itemsInHand) => {
    // Utilizes Array.prototype.reduce for a concise sum calculation.
    return itemsInHand.reduce((accumulator, currentVal) => accumulator + currentVal, 0);
  };

  /**
   * Updates the global maximum sum if the current state's hand total is higher.
   * @param {{availableItems: number[], heldItems: number[]}} currentState - The game state to evaluate.
   */
  const updateOverallMaximum = (currentState) => {
    const currentHandValue = calculateHandTotal(currentState.heldItems);
    if (currentHandValue > globalMaxSum) {
      globalMaxSum = currentHandValue;
    }
  };

  /**
   * Creates a deep copy of the current game state to ensure operations
   * do not modify parent states in the recursive call stack.
   * @param {{availableItems: number[], heldItems: number[]}} originalState - The state to duplicate.
   * @returns {{availableItems: number[], heldItems: number[]}} A new, independent copy of the state.
   */
  const duplicateGameState = (originalState) => ({
    availableItems: originalState.availableItems.slice(), // Deep copy the available items array.
    heldItems: originalState.heldItems.slice(),           // Deep copy the held items array.
  });

  /**
   * Operation A: Moves an item from the front of the available items queue to the hand.
   * @param {{availableItems: number[], heldItems: number[]}} gameState - The state to modify.
   */
  const acquireFromFront = (gameState) => {
    // Precondition: Ensure there's an item to take from the queue.
    if (gameState.availableItems.length > 0) {
      gameState.heldItems.push(gameState.availableItems.shift());
    }
  };

  /**
   * Operation B: Moves an item from the back of the available items queue to the hand.
   * @param {{availableItems: number[], heldItems: number[]}} gameState - The state to modify.
   */
  const acquireFromBack = (gameState) => {
    // Precondition: Ensure there's an item to take from the queue.
    if (gameState.availableItems.length > 0) {
      gameState.heldItems.push(gameState.availableItems.pop());
    }
  };

  /**
   * Operation C: Moves a specific item from the hand to the front of the available items queue.
   * @param {{availableItems: number[], heldItems: number[]}} gameState - The state to modify.
   * @param {number} itemIndex - The index of the item in hand to move.
   */
  const returnToFront = (gameState, itemIndex) => {
    // Precondition: Ensure the index is valid for an item in hand.
    if (itemIndex >= 0 && itemIndex < gameState.heldItems.length) {
      const itemToReturn = gameState.heldItems.splice(itemIndex, 1)[0];
      gameState.availableItems.unshift(itemToReturn);
    }
  };

  /**
   * Operation D: Moves a specific item from the hand to the back of the available items queue.
   * @param {{availableItems: number[], heldItems: number[]}} gameState - The state to modify.
   * @param {number} itemIndex - The index of the item in hand to move.
   */
  const returnToBack = (gameState, itemIndex) => {
    // Precondition: Ensure the index is valid for an item in hand.
    if (itemIndex >= 0 && itemIndex < gameState.heldItems.length) {
      const itemToReturn = gameState.heldItems.splice(itemIndex, 1)[0];
      gameState.availableItems.push(itemToReturn);
    }
  };

  /**
   * Recursively explores all possible sequences of operations to find the maximum hand sum.
   * @param {{availableItems: number[], heldItems: number[]}} currentGameState - The current state of the game.
   * @param {number} currentOpStep - The current operation number being performed (1-indexed).
   */
  const explorePossibilities = (currentGameState, currentOpStep) => {
    // Base case: If the current operation step exceeds the maximum allowed operations,
    // this branch of recursion terminates.
    if (currentOpStep > maximumAllowedOperations) {
      return;
    }

    // Define an array of functions, each representing a distinct operation type.
    // This replaces the original `if/else if` chain with a more modular structure.
    const potentialActionTypes = [
      // Operation A: Take from front of available items.
      () => {
        // Only proceed if there are items to take.
        if (currentGameState.availableItems.length > 0) {
          const nextState = duplicateGameState(currentGameState);
          acquireFromFront(nextState);
          updateOverallMaximum(nextState); // Update max after this operation.
          explorePossibilities(nextState, currentOpStep + 1);
        }
      },
      // Operation B: Take from back of available items.
      () => {
        // Only proceed if there are items to take.
        if (currentGameState.availableItems.length > 0) {
          const nextState = duplicateGameState(currentGameState);
          acquireFromBack(nextState);
          updateOverallMaximum(nextState);
          explorePossibilities(nextState, currentOpStep + 1);
        }
      },
      // Operation C: Return an item from hand to the front of available items.
      () => {
        // This operation requires at least one item in hand.
        if (currentGameState.heldItems.length > 0) {
          // Iterate through each item currently in hand as a potential candidate to return.
          for (let itemIdxInHand = 0; itemIdxInHand < currentGameState.heldItems.length; itemIdxInHand++) {
            const nextState = duplicateGameState(currentGameState);
            returnToFront(nextState, itemIdxInHand);
            updateOverallMaximum(nextState);
            explorePossibilities(nextState, currentOpStep + 1);
          }
        }
      },
      // Operation D: Return an item from hand to the back of available items.
      () => {
        // This operation requires at least one item in hand.
        if (currentGameState.heldItems.length > 0) {
          // Iterate through each item currently in hand as a potential candidate to return.
          for (let itemIdxInHand = 0; itemIdxInHand < currentGameState.heldItems.length; itemIdxInHand++) {
            const nextState = duplicateGameState(currentGameState);
            returnToBack(nextState, itemIdxInHand);
            updateOverallMaximum(nextState);
            explorePossibilities(nextState, currentOpStep + 1);
          }
        }
      },
    ];

    // Execute each defined action type for the current step.
    for (const action of potentialActionTypes) {
      action();
    }
  };

  // Initialize the game state for the first recursive call.
  // All items start in 'availableItems', and 'heldItems' is empty.
  const initialGameState = {
    availableItems: initialItemsQueue.slice(), // Ensure a fresh copy for the initial state.
    heldItems: [],
  };

  // Begin the recursive exploration process, starting from the first operation step.
  explorePossibilities(initialGameState, 1);

  // Output the highest sum of items found in hand across all valid operation sequences.
  console.log(globalMaxSum);
}

// --- Standard Input/Output Handling (DO NOT MODIFY) ---
// This line reads all input from stdin at once and passes it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));