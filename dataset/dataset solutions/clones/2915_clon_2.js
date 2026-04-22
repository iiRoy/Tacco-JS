function ExecuteProgram(rawData) {
  // Parsing the initial input string into an array of lines
  let linesArray = rawData.split("\n");
  // Removing the last (potentially empty) line
  linesArray.pop();

  // Extracting key numerical configurations from the first line
  const firstLineData = linesArray[0].split(" ");
  const gemCount = parseInt(firstLineData[0], 10);
  const actionLimit = parseInt(firstLineData[1], 10);

  // Converting the second line into an array of integer gem values
  const gemValues = linesArray[1].split(" ").map(itemText => parseInt(itemText, 10));

  // Initializing variables for tracking the highest sum and current sum
  let highestScore = 0;
  let currentHandSum = 0;

  // A temporary state object used during recursive calls
  let tempSituation = null;

  // Initiating the recursive process with the initial state
  processOperations({ availableItems: gemValues.slice(), heldItems: [] }, 1);

  /**
   * Recursively explores all possible operation sequences to find the maximum hand sum.
   * @param {object} currentSituation - The current state containing available items and items in hand.
   * @param {number} operationNumber - The current operation count.
   * @returns {void}
   */
  function processOperations(currentSituation, operationNumber) {
    // Base case: if the operation limit is exceeded, terminate this path
    if (operationNumber > actionLimit) {
      return;
    }

    // --- Operations involving drawing items from the available queue ---
    if (currentSituation.availableItems.length !== 0) {
      // Scenario 1: Draw from the front (dequeue)
      tempSituation = { availableItems: currentSituation.availableItems.slice(), heldItems: currentSituation.heldItems.slice() };
      tempSituation.heldItems[tempSituation.heldItems.length] = tempSituation.availableItems.shift();
      currentHandSum = 0;
      for (let idx = 0, listLength = tempSituation.heldItems.length; idx < listLength; idx++) {
        currentHandSum = currentHandSum + tempSituation.heldItems[idx];
      }
      if (highestScore < currentHandSum) highestScore = currentHandSum;
      processOperations(tempSituation, operationNumber + 1);

      // Scenario 2: Draw from the back (pop)
      tempSituation = { availableItems: currentSituation.availableItems.slice(), heldItems: currentSituation.heldItems.slice() };
      tempSituation.heldItems[tempSituation.heldItems.length] = tempSituation.availableItems.pop();
      currentHandSum = 0;
      for (let idx = 0, listLength = tempSituation.heldItems.length; idx < listLength; idx++) {
        currentHandSum = currentHandSum + tempSituation.heldItems[idx];
      }
      if (highestScore < currentHandSum) highestScore = currentHandSum;
      processOperations(tempSituation, operationNumber + 1);
    }

    // --- Operations involving returning items from hand to the available queue ---
    for (let k = 0, handSize = currentSituation.heldItems.length; k < handSize; k++) {
      // Scenario 3: Return an item to the front of the available queue (unshift)
      tempSituation = { availableItems: currentSituation.availableItems.slice(), heldItems: currentSituation.heldItems.slice() };
      tempSituation.availableItems.unshift(tempSituation.heldItems.splice(k, 1)[0]);
      currentHandSum = 0;
      for (let idx = 0, listLength = tempSituation.heldItems.length; idx < listLength; idx++) {
        currentHandSum = currentHandSum + tempSituation.heldItems[idx];
      }
      if (highestScore < currentHandSum) highestScore = currentHandSum;
      processOperations(tempSituation, operationNumber + 1);

      // Scenario 4: Return an item to the back of the available queue (push)
      tempSituation = { availableItems: currentSituation.availableItems.slice(), heldItems: currentSituation.heldItems.slice() };
      tempSituation.availableItems.push(tempSituation.heldItems.splice(k, 1)[0]);
      currentHandSum = 0;
      for (let idx = 0, listLength = tempSituation.heldItems.length; idx < listLength; idx++) {
        currentHandSum = currentHandSum + tempSituation.heldItems[idx];
      }
      if (highestScore < currentHandSum) highestScore = currentHandSum;
      processOperations(tempSituation, operationNumber + 1);
    }
  }

  // Output the final maximum sum found
  console.log(highestScore);
}

// Standard input processing for competitive programming environments
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));