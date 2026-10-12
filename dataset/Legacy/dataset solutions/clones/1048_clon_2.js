(function executeProgram() {
  // This function serves as the main entry point for the program execution.

  // Read all input from standard input, decode it as UTF-8,
  // remove any leading or trailing whitespace, and then split the content
  // into an array of strings, where each string represents a line.
  let inputDataRows = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");

  // The first line of the input contains two space-separated integers.
  // 'itemCount' (n) represents the total number of items.
  // 'containerCount' (k) represents the number of available containers.
  // We extract this line, split it by space, and convert the parts to numbers.
  let [itemCount, containerCount] = inputDataRows.shift().split(' ').map(Number);

  // The remaining lines in 'inputDataRows' represent the individual weights of the items.
  // We convert each of these lines to a number to form the 'itemWeights' array.
  let itemWeights = inputDataRows.map(Number);

  /**
   * Determines if it's possible to place all items into the specified number of containers,
   * given a maximum weight capacity for each container.
   *
   * Note: This implementation precisely mirrors the original's behavior, including
   * a specific pattern of item indexing (`itemWeights[++processedItems]`) that
   * effectively skips the very first item (`itemWeights[0]`) from being placed.
   *
   * @param {number} maxWeightPerContainer - The maximum allowed total weight for any single container.
   * @returns {number} The total count of items that were successfully processed and placed.
   *                   If this count equals 'itemCount', it means all items fit.
   */
  const checkFeasibility = (maxWeightPerContainer) => {
    let processedItems = 0; // Tracks the number of items that have been placed so far.
                            // Also acts as an index for the 'itemWeights' array,
                            // but due to `++processedItems`, it points to the *next* item to consider.

    // Iterate through each available container.
    for (let containerIndex = 0; containerIndex < containerCount; containerIndex++) {
      let currentContainerWeight = 0; // Accumulates the weight of items in the current container.

      // This inner loop attempts to fill the current container.
      // The loop condition `currentContainerWeight <= maxWeightPerContainer` checks if the *current*
      // accumulated weight is within limits.
      // The increment part `currentContainerWeight += itemWeights[++processedItems]`
      // increments 'processedItems' *before* using it as an index, and adds that item's weight.
      for (
        ;
        currentContainerWeight <= maxWeightPerContainer;
        currentContainerWeight += itemWeights[++processedItems]
      ) {
        // If 'processedItems' reaches 'itemCount' at any point, it means all items
        // have been successfully placed across the containers.
        if (processedItems === itemCount) {
          return processedItems; // Return the total count of processed items.
        }
      }
    }
    // If the outer loop finishes (all containers are processed) but not all items fit,
    // return the total number of items that were processed.
    return processedItems;
  };

  // Calculate an initial lower bound for the 'maxWeightPerContainer'.
  // This is the total sum of all item weights divided by the number of containers,
  // rounded down to the nearest integer. This provides a starting point for the search.
  let currentCapacity = Math.floor(itemWeights.reduce((accumulator, currentWeight) => accumulator + currentWeight) / containerCount);

  // Use a 'while' loop to find the minimum 'maxWeightPerContainer' that allows all items to fit.
  // The '++currentCapacity' increments the capacity *before* it's passed to 'checkFeasibility'.
  // The loop continues as long as 'checkFeasibility' indicates that not all items ('itemCount')
  // could be placed with the current 'currentCapacity'.
  while (checkFeasibility(++currentCapacity) !== itemCount);

  // Once the loop terminates, 'currentCapacity' holds the smallest integer value
  // for the maximum weight per container that satisfies the condition.
  // This result is then printed to the console.
  console.log(currentCapacity);

})();
