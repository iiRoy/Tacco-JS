function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  const parsedLines = rawData.split('\n');
  let resultHolder; // This variable is declared but not used in the original logic.

  // Parse the first line to get container count and maximum allowed sweets per pair
  const firstLineParts = parsedLines[0].split(' ');
  const numContainers = parseInt(firstLineParts[0], 10); // Number of containers (not directly used in logic)
  const maxAllowedSweets = parseInt(firstLineParts[1], 10); // Maximum sweets allowed for two adjacent containers

  // Parse the second line to get the initial sweet counts in each container
  let sweetItems = parsedLines[1].split(' ');
  let consumedTotal = 0; // Accumulator for the total number of sweets eaten

  // Convert sweet counts from strings to integers
  sweetItems = sweetItems.map((itemStr) => parseInt(itemStr, 10));

  /**
   * Function to simulate eating sweets from containers based on an excess amount.
   * @param {number[]} containerIndices - An array containing the indices of the two adjacent containers.
   * @param {number} excessAmount - The amount of sweets to be removed.
   */
  function consumeSweets(containerIndices, excessAmount) {
    // If the excess can be fully removed from the second container
    if (excessAmount <= sweetItems[containerIndices[1]]) {
      consumedTotal += excessAmount;
      sweetItems[containerIndices[1]] -= excessAmount;
    } else {
      // If the excess is more than what's in the second container
      consumedTotal += excessAmount; // Add the full excess to the total consumed
      excessAmount -= sweetItems[containerIndices[1]]; // Reduce excess by what was in the second container
      sweetItems[containerIndices[1]] = 0; // Second container is now empty
      sweetItems[containerIndices[0]] -= excessAmount; // Remove remaining excess from the first container
    }
  }

  /**
   * Calculates the sum of sweets in two specified containers.
   * @param {number[]} containerIndices - An array containing the indices of the two adjacent containers.
   * @returns {number} The total number of sweets in the two containers.
   */
  function calculateCombinedSweets(containerIndices) {
    return sweetItems[containerIndices[0]] + sweetItems[containerIndices[1]];
  }

  /**
   * Iterates through adjacent pairs of containers and adjusts sweet counts if they exceed the maximum.
   * @param {number[]} currentSweetsArray - The array representing sweet counts in containers.
   */
  function evaluateContainers(currentSweetsArray) {
    let containerIndices; // Holds the indices of the current pair of containers

    // Loop through all adjacent pairs of containers
    for (let idx = 0; idx < (currentSweetsArray.length - 1); idx++) {
      let excessAmount; // The amount of sweets exceeding the maximum allowed
      containerIndices = [idx, idx + 1]; // Define the current pair of indices

      // Calculate the excess amount for the current pair
      excessAmount = calculateCombinedSweets(containerIndices) - maxAllowedSweets;

      // If there's an excess, call the consumeSweets function
      if (excessAmount > 0) {
        consumeSweets(containerIndices, excessAmount);
      }
    }
  }

  // Execute the main logic to evaluate and adjust sweets in containers
  evaluateContainers(sweetItems);

  // Output the total number of sweets consumed
  console.log(consumedTotal);
}

// This part handles reading input from standard input and calling the main processing function.
// It should not be modified as it's part of the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
