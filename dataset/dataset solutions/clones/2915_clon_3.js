function ProcessInputData(rawInputText) {
  // Parse the raw input text, filtering out any empty lines.
  const parsedLines = rawInputText.split("\n").filter(line => line.trim() !== "");

  // Helper function to convert a space-separated string of numbers into an array of numbers.
  const extractNumericValues = (textLine) => textLine.split(" ").map(Number);

  // Extract initial parameters from the first line of input.
  // initialGemCount is parsed but not directly used in the logic, similar to the original.
  const [initialGemCount, maxOperationsAllowed] = extractNumericValues(parsedLines[0]);
  
  // Initialize the main pile of gems from the second line of input.
  let gemPile = extractNumericValues(parsedLines[1]);

  // Global variable to store the highest possible sum of gems found in possession.
  let highestValueAchieved = 0;

  // Utility function to calculate the sum of all elements in a given array.
  const calculateArraySum = (numericArray) => numericArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  // Utility function to create a new state object with deep copies of its array properties.
  const createClonedState = (originalState) => ({
    remainingGems: [...originalState.remainingGems],
    gemsInPossession: [...originalState.gemsInPossession],
  });

  // Recursive function to explore all possible sequences of operations.
  // currentExplorationState: An object containing 'remainingGems' (in the pile) and 'gemsInPossession' (in hand).
  // currentOperationCount: The number of operations performed so far in this path.
  function recursivelyExplore(currentExplorationState, currentOperationCount) {
    // Base case: If we have exceeded the maximum allowed operations, terminate this path.
    if (currentOperationCount > maxOperationsAllowed) {
      return;
    }

    // Calculate the current sum of gems held in possession.
    const currentHandSum = calculateArraySum(currentExplorationState.gemsInPossession);
    // Update the global maximum if the current hand sum is greater.
    if (currentHandSum > highestValueAchieved) {
      highestValueAchieved = currentHandSum;
    }

    // --- Explore taking a gem from the main pile ---
    if (currentExplorationState.remainingGems.length > 0) {
      // Option A: Take a gem from the front of the pile.
      let stateAfterTakeFront = createClonedState(currentExplorationState);
      const gemFromFront = stateAfterTakeFront.remainingGems.shift(); // Remove from front of pile
      stateAfterTakeFront.gemsInPossession.push(gemFromFront);      // Add to hand
      recursivelyExplore(stateAfterTakeFront, currentOperationCount + 1);

      // Option B: Take a gem from the back of the pile.
      let stateAfterTakeBack = createClonedState(currentExplorationState);
      const gemFromBack = stateAfterTakeBack.remainingGems.pop();   // Remove from back of pile
      stateAfterTakeBack.gemsInPossession.push(gemFromBack);        // Add to hand
      recursivelyExplore(stateAfterTakeBack, currentOperationCount + 1);
    }

    // --- Explore returning a gem from possession to the main pile ---
    if (currentExplorationState.gemsInPossession.length > 0) {
      // Iterate through each gem currently in possession.
      for (let gemIndex = 0; gemIndex < currentExplorationState.gemsInPossession.length; gemIndex++) {
        const gemToReturn = currentExplorationState.gemsInPossession[gemIndex];

        // Option C: Return a specific gem from hand to the front of the pile.
        let stateAfterReturnToFront = createClonedState(currentExplorationState);
        stateAfterReturnToFront.gemsInPossession.splice(gemIndex, 1); // Remove from hand
        stateAfterReturnToFront.remainingGems.unshift(gemToReturn);   // Add to front of pile
        recursivelyExplore(stateAfterReturnToFront, currentOperationCount + 1);

        // Option D: Return a specific gem from hand to the back of the pile.
        let stateAfterReturnToBack = createClonedState(currentExplorationState);
        stateAfterReturnToBack.gemsInPossession.splice(gemIndex, 1); // Remove from hand
        stateAfterReturnToBack.remainingGems.push(gemToReturn);      // Add to back of pile
        recursivelyExplore(stateAfterReturnToBack, currentOperationCount + 1);
      }
    }
  }

  // Initiate the recursive exploration process with the initial state:
  // All gems are in the 'remainingGems' pile, and the hand ('gemsInPossession') is empty.
  // The operation count starts at 0.
  recursivelyExplore({ remainingGems: [...gemPile], gemsInPossession: [] }, 0);

  // Output the maximum sum found across all explored paths.
  console.log(highestValueAchieved);
}

// Standard input processing block. This part should not be modified.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));