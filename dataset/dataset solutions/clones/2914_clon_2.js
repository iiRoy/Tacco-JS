function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  let lineSegments = rawData.split("\n");

  // Remove the last empty line, if any, from the input.
  lineSegments.pop();

  // Parse the first line to get the number of jewels and operations.
  const initialParams = lineSegments[0].split(" ");

  // The total number of jewels (though not directly used in the logic, it's parsed).
  const jewelCount = parseInt(initialParams[0]);

  // The maximum number of operations allowed.
  const operationLimit = parseInt(initialParams[1]);

  // Parse the second line to get the values of the jewels.
  let jewelQueue = lineSegments[1].split(" ").map((numStr) => parseInt(numStr));

  // Initialize the variable to store the highest score found.
  let highestScore = 0;

  // Start the recursive exploration of states.
  // The initial state has all jewels in the 'availableJewels' queue and an empty 'playerHand'.
  exploreStates({ availableJewels: jewelQueue.slice(), playerHand: [] }, 1);

  // Recursive function to explore all possible operation sequences.
  function exploreStates(currentState, currentOperation) {
    // Base case: If the number of operations exceeds the limit, stop.
    if (currentOperation > operationLimit) {
      return null; // No further operations possible from this path.
    }

    // Iterate through the four possible types of operations.
    for (let operationTypeIndex = 0; operationTypeIndex < 4; operationTypeIndex++) {
      // Operation Type 0: Take a jewel from the front of the queue.
      if (operationTypeIndex === 0) {
        // Only perform if there are jewels left in the queue.
        if (currentState.availableJewels.length !== 0) {
          // Create a deep copy of the current state to avoid side effects on other branches.
          let clonedState = { availableJewels: currentState.availableJewels.slice(), playerHand: currentState.playerHand.slice() };
          // Apply operation A (take from front).
          takeFromFront(clonedState);
          // Update the maximum score if the current hand sum is higher.
          updateMaximumScore(clonedState);
          // Recursively call for the next operation.
          exploreStates(clonedState, currentOperation + 1);
        }
      // Operation Type 1: Take a jewel from the back of the queue.
      } else if (operationTypeIndex === 1) {
        // Only perform if there are jewels left in the queue.
        if (currentState.availableJewels.length !== 0) {
          // Create a deep copy of the current state.
          let clonedState = { availableJewels: currentState.availableJewels.slice(), playerHand: currentState.playerHand.slice() };
          // Apply operation B (take from back).
          takeFromBack(clonedState);
          // Update the maximum score.
          updateMaximumScore(clonedState);
          // Recursively call for the next operation.
          exploreStates(clonedState, currentOperation + 1);
        }
      // Operation Type 2: Return a jewel from hand to the front of the queue.
      } else if (operationTypeIndex === 2) {
        // Iterate through each jewel currently in hand.
        for (let handItemIndex = 0; handItemIndex < currentState.playerHand.length; handItemIndex++) {
          // Create a deep copy of the current state.
          let clonedState = { availableJewels: currentState.availableJewels.slice(), playerHand: currentState.playerHand.slice() };
          // Apply operation C (return to front) for the specific jewel.
          returnToFront(clonedState, handItemIndex);
          // Update the maximum score.
          updateMaximumScore(clonedState);
          // Recursively call for the next operation.
          exploreStates(clonedState, currentOperation + 1);
        }
      // Operation Type 3: Return a jewel from hand to the back of the queue.
      } else {
        // Iterate through each jewel currently in hand.
        for (let handItemIndex = 0; handItemIndex < currentState.playerHand.length; handItemIndex++) {
          // Create a deep copy of the current state.
          let clonedState = { availableJewels: currentState.availableJewels.slice(), playerHand: currentState.playerHand.slice() };
          // Apply operation D (return to back) for the specific jewel.
          returnToBack(clonedState, handItemIndex);
          // Update the maximum score.
          updateMaximumScore(clonedState);
          // Recursively call for the next operation.
          exploreStates(clonedState, currentOperation + 1);
        }
      }
    }

    // Helper function to check and update the global maximum score.
    function updateMaximumScore(processedState) {
      // Calculate the sum of jewels in the current hand.
      const currentSum = calculateHandSum(processedState.playerHand);
      // If the current sum is greater than the highest recorded score, update it.
      if (highestScore < currentSum) {
        highestScore = currentSum;
      }
    }
  }

  // After exploring all possible paths, print the highest score found.
  console.log(highestScore);

  // Calculates the sum of values in an array of jewels.
  function calculateHandSum(playerHand) {
    let currentSum = 0;
    for (let itemIndex = 0; itemIndex < playerHand.length; itemIndex++) {
      currentSum = currentSum + playerHand[itemIndex];
    }
    return currentSum;
  }

  // Operation A: Takes the first jewel from the available queue and adds it to the hand.
  function takeFromFront(processedState) {
    processedState.playerHand.push(processedState.availableJewels.shift());
  }

  // Operation B: Takes the last jewel from the available queue and adds it to the hand.
  function takeFromBack(processedState) {
    processedState.playerHand.push(processedState.availableJewels.pop());
  }

  // Operation C: Removes a jewel from the hand at a specific index and adds it to the front of the available queue.
  function returnToFront(processedState, index) {
    processedState.availableJewels.unshift(processedState.playerHand.splice(index, 1)[0]);
  }

  // Operation D: Removes a jewel from the hand at a specific index and adds it to the back of the available queue.
  function returnToBack(processedState, index) {
    processedState.availableJewels.push(processedState.playerHand.splice(index, 1)[0]);
  }
}

// Standard input/output handling. Do not modify this part.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
