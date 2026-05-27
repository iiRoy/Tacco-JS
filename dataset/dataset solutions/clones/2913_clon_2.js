function ProcessInput(rawData) {
  // Split the raw input string into individual lines
  var lineSegments = rawData.split("\n");
  // Remove the last element, which is usually an empty string due to trailing newline
  lineSegments.pop();

  // Parse the first line for initial parameters
  var firstLineData = lineSegments[0].split(" ");
  var totalGemCount = parseInt(firstLineData[0]); // Number of initial gems
  var maxOperations = parseInt(firstLineData[1]); // Maximum allowed operations

  // Parse the second line for the initial gem values
  var initialGems = lineSegments[1].split(" ").map(function(str) {
    return parseInt(str);
  });

  // Calculate the maximum possible sum if all positive gems were collected
  var potentialMaxSum = 0;
  // Flag to indicate if the maximum possible sum has been reached, allowing early exit
  var computationComplete = false;

  // Iterate through initial gems to find the sum of positive values
  for (var idx = 0, lengthVal = initialGems.length; idx < lengthVal; idx++) {
    if (initialGems[idx] > 0) {
      potentialMaxSum = potentialMaxSum + initialGems[idx];
    }
  }

  // Variable to store the highest score found during the operations
  var highestScore = 0;

  // Start the recursive operation process
  // Initial state: all gems in 'availableItems', 'heldItems' is empty
  performRecursiveOperations({ availableItems: initialGems.slice(), heldItems: [] }, 1);

  /**
   * Recursively explores possible operations to maximize the score.
   * @param {object} currentState - The current state of gems, with 'availableItems' (dequeue) and 'heldItems' (hands).
   * @param {number} operationNumber - The current operation count.
   */
  function performRecursiveOperations(currentState, operationNumber) {
    // Base case: If operation limit exceeded or max possible sum achieved, stop.
    if ((operationNumber > maxOperations) || computationComplete) {
      return null;
    }

    // If there are gems available to be picked up
    if (currentState.availableItems.length !== 0) {
      // --- Operation A: Take from the front of available items ---
      var tempStateA = { availableItems: currentState.availableItems.slice(), heldItems: currentState.heldItems.slice() };
      PerformOperationA(tempStateA); // Modifies tempStateA
      evaluateCurrentScore(tempStateA); // Checks and updates highestScore
      performRecursiveOperations(tempStateA, operationNumber + 1); // Recurse with new state

      // --- Operation B: Take from the back of available items ---
      var tempStateB = { availableItems: currentState.availableItems.slice(), heldItems: currentState.heldItems.slice() };
      PerformOperationB(tempStateB); // Modifies tempStateB
      evaluateCurrentScore(tempStateB); // Checks and updates highestScore
      performRecursiveOperations(tempStateB, operationNumber + 1); // Recurse with new state
    }

    // Iterate through currently held gems for operations C and D
    for (var j = 0, heldLength = currentState.heldItems.length; j < heldLength; j++) {
      // --- Operation C: Return a held gem to the front of available items ---
      var tempStateC = { availableItems: currentState.availableItems.slice(), heldItems: currentState.heldItems.slice() };
      PerformOperationC(tempStateC, j); // Modifies tempStateC
      evaluateCurrentScore(tempStateC); // Checks and updates highestScore
      performRecursiveOperations(tempStateC, operationNumber + 1); // Recurse with new state

      // --- Operation D: Return a held gem to the back of available items ---
      var tempStateD = { availableItems: currentState.availableItems.slice(), heldItems: currentState.heldItems.slice() };
      PerformOperationD(tempStateD, j); // Modifies tempStateD
      evaluateCurrentScore(tempStateD); // Checks and updates highestScore
      performRecursiveOperations(tempStateD, operationNumber + 1); // Recurse with new state
    }

    /**
     * Calculates the total value of held gems and updates the highest score if necessary.
     * Also sets a flag if the potential maximum sum is reached.
     * @param {object} evaluatedState - The state after an operation, containing 'heldItems'.
     */
    function evaluateCurrentScore(evaluatedState) {
      var currentSum = calculateHandSum(evaluatedState.heldItems);
      if (highestScore < currentSum) {
        highestScore = currentSum;
        // If the current score equals the maximum possible sum, we can stop further computation
        if (potentialMaxSum === highestScore) {
          computationComplete = true;
        }
      }
    }
  }

  // Output the final highest score found
  console.log(highestScore);

  /**
   * Calculates the sum of all gem values in a given array.
   * @param {Array<number>} gemHand - An array of gem values.
   * @returns {number} The total sum of the gem values.
   */
  function calculateHandSum(gemHand) {
    var currentSum = 0;
    for (var idx = 0, lengthVal = gemHand.length; idx < lengthVal; idx++) {
      currentSum = currentSum + gemHand[idx];
    }
    return currentSum;
  }

  /**
   * Operation A: Moves the first gem from 'availableItems' to 'heldItems'.
   * @param {object} modifiedState - The state object to modify.
   */
  function PerformOperationA(modifiedState) {
    modifiedState.heldItems[modifiedState.heldItems.length] = modifiedState.availableItems.shift();
  }

  /**
   * Operation B: Moves the last gem from 'availableItems' to 'heldItems'.
   * @param {object} modifiedState - The state object to modify.
   */
  function PerformOperationB(modifiedState) {
    modifiedState.heldItems[modifiedState.heldItems.length] = modifiedState.availableItems.pop();
  }

  /**
   * Operation C: Moves a gem from 'heldItems' at a specific index to the front of 'availableItems'.
   * @param {object} modifiedState - The state object to modify.
   * @param {number} targetIndex - The index of the gem in 'heldItems' to move.
   */
  function PerformOperationC(modifiedState, targetIndex) {
    modifiedState.availableItems.unshift(modifiedState.heldItems.splice(targetIndex, 1)[0]);
  }

  /**
   * Operation D: Moves a gem from 'heldItems' at a specific index to the back of 'availableItems'.
   * @param {object} modifiedState - The state object to modify.
   * @param {number} targetIndex - The index of the gem in 'heldItems' to move.
   */
  function PerformOperationD(modifiedState, targetIndex) {
    modifiedState.availableItems.push(modifiedState.heldItems.splice(targetIndex, 1)[0]);
  }
}

// This line should not be edited (reads from standard input and calls Main)
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
