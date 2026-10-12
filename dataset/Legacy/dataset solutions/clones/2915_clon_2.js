function ProcessInput(rawData) {
  // Split the incoming raw data string into individual lines.
  var lineSegments = rawData.split("\n");
  // Remove the last element, which is often an empty string due to trailing newline.
  lineSegments.pop();

  // Parse the first line to extract configuration parameters.
  var firstLineParts = lineSegments[0].split(" ");
  var gemCount = parseInt(firstLineParts[0]); // The total number of gems available.
  var actionLimit = parseInt(firstLineParts[1]); // The maximum number of operations allowed.

  // Parse the second line to get the numerical values of the gems.
  var gemValues = lineSegments[1].split(" ").map(function(textVal) {
    return parseInt(textVal);
  });

  // Initialize variables to keep track of the highest sum found and the current sum.
  var highestValue = 0; // Stores the maximum sum of gems held in hand across all simulations.
  var currentSum = 0;   // Stores the sum of gems for the current state being evaluated.

  // A temporary state object used for creating new states in the recursive calls.
  var tempState = null;

  // Initiate the recursive simulation process.
  // The initial state has all gems in the 'gemPile' (representing the original 'dequeue')
  // and an empty 'heldGems' array (representing the original 'hands').
  performActions({ gemPile: gemValues.slice(), heldGems: [] }, 1);

  /**
   * Recursively explores possible gem manipulation actions to find the maximum sum.
   * @param {object} currentState - An object containing the current 'gemPile' and 'heldGems' arrays.
   * @param {number} actionNumber - The sequential number of the current action being performed.
   */
  function performActions(currentState, actionNumber) {
    // Base case: If the current action number exceeds the allowed limit, terminate this path.
    if (actionNumber > actionLimit) {
      return null;
    }

    // --- Section for taking gems from the main pile ---
    // Proceed only if there are gems remaining in the main pile.
    if (currentState.gemPile.length !== 0) {
      // Scenario 1: Take a gem from the front of the pile.
      // Create a deep copy of the current state to avoid side effects on other branches.
      tempState = { gemPile: currentState.gemPile.slice(), heldGems: currentState.heldGems.slice() };
      // Move the first gem from the pile to the hand.
      tempState.heldGems[tempState.heldGems.length] = tempState.gemPile.shift();
      
      currentSum = 0; // Reset sum for the new hand configuration.
      // Calculate the sum of gems currently held.
      for (var idx = 0, arrLen = tempState.heldGems.length; idx < arrLen; idx++) {
        currentSum = currentSum + tempState.heldGems[idx];
      }
      // Update the global highest value if the current hand sum is greater.
      if (highestValue < currentSum) {
        highestValue = currentSum;
      }
      // Recursively call with the updated state and incremented action number.
      performActions(tempState, actionNumber + 1);                  
      
      // Scenario 2: Take a gem from the back of the pile.
      // Create another deep copy for this distinct action path.
      tempState = { gemPile: currentState.gemPile.slice(), heldGems: currentState.heldGems.slice() };
      // Move the last gem from the pile to the hand.
      tempState.heldGems[tempState.heldGems.length] = tempState.gemPile.pop();
      
      currentSum = 0; // Reset sum.
      // Calculate the sum of gems currently held.
      for (var idx = 0, arrLen = tempState.heldGems.length; idx < arrLen; idx++) {
        currentSum = currentSum + tempState.heldGems[idx];
      }
      // Update the global highest value.
      if (highestValue < currentSum) {
        highestValue = currentSum;
      }
      // Recursively call.
      performActions(tempState, actionNumber + 1);        
    } 

    // --- Section for returning gems from hand to the main pile ---
    // Iterate through each gem currently held in hand.
    for (var k = 0, arrLen = currentState.heldGems.length; k < arrLen; k++) {
      // Scenario 3: Return a gem from hand to the front of the pile.
      // Create a deep copy for this action path.
      tempState = { gemPile: currentState.gemPile.slice(), heldGems: currentState.heldGems.slice() };
      // Remove the gem at index 'k' from hand and add it to the front of the pile.
      tempState.gemPile.unshift(tempState.heldGems.splice(k, 1)[0]);
      
      currentSum = 0; // Reset sum.
      // Calculate the sum of gems currently held.
      for (var idx = 0, arrLen = tempState.heldGems.length; idx < arrLen; idx++) {
        currentSum = currentSum + tempState.heldGems[idx];
      }
      // Update the global highest value.
      if (highestValue < currentSum) {
        highestValue = currentSum;
      }
      // Recursively call.
      performActions(tempState, actionNumber + 1);                  
      
      // Scenario 4: Return a gem from hand to the back of the pile.
      // Create another deep copy for this distinct action path.
      tempState = { gemPile: currentState.gemPile.slice(), heldGems: currentState.heldGems.slice() };
      // Remove the gem at index 'k' from hand and add it to the back of the pile.
      tempState.gemPile.push(tempState.heldGems.splice(k, 1)[0]);
      
      currentSum = 0; // Reset sum.
      // Calculate the sum of gems currently held.
      for (var idx = 0, arrLen = tempState.heldGems.length; idx < arrLen; idx++) {
        currentSum = currentSum + tempState.heldGems[idx];
      }
      // Update the global highest value.
      if (highestValue < currentSum) {
        highestValue = currentSum;
      }
      // Recursively call.
      performActions(tempState, actionNumber + 1);        
    }
  }  
  // After all possible action sequences have been explored, output the maximum sum found.
  console.log(highestValue);
}

// This line handles standard input/output and should remain unchanged.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
