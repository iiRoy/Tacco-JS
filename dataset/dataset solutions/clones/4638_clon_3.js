const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let collectedInputLines = [];
let streamController = null;

inputProcessor.on('line', (currentLine) => {
  collectedInputLines.push(currentLine);
});

inputProcessor.on('close', () => {
  streamController = createLineIterator(collectedInputLines);
  const executionStartTime = Date.now();
  performCalculation();
  const executionEndTime = Date.now();
  
  reportDiagnostic(`Runtime: ${executionEndTime - executionStartTime} ms`);
  reportDiagnostic(`Memory usage: ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
});

/**
 * Generates an object to iterate through an array of strings.
 * @param {string[]} sourceArray - The array of input strings to iterate over.
 * @returns {object} An object providing sequential access to the array elements.
 */
function createLineIterator(sourceArray) {
  let currentPosition = 0;
  const totalEntries = sourceArray.length;

  return {
    // Verifies if there are more items to retrieve.
    hasMore: () => (currentPosition < totalEntries),
    // Retrieves the subsequent item from the collection.
    getNext: () => {
      if (!this.hasMore()) {
        throw new Error("Input stream exhausted. No further entries can be retrieved.");
      }
      const nextEntry = sourceArray[currentPosition];
      currentPosition++;
      return nextEntry;
    }
  };
}

/**
 * Retrieves the next available input line and processes it into an array of numbers.
 * @returns {number[]} A numerical array parsed from the input line.
 */
function getIntegerArrayFromLine() {
  const lineStr = streamController.getNext();
  return lineStr.split(" ").map(Number);
}

/**
 * Transmits a given message to the standard output channel.
 * @param {*} message - The content to be displayed.
 */
function outputLine(message) {
  console.log(message);
}

/**
 * Logs a diagnostic message to the standard error stream.
 * @param {*} debugInfo - Information pertinent to debugging.
 */
function reportDiagnostic(debugInfo) {
  console.error(`DEBUG: ${debugInfo}`);
}

// ----------------------------------------------------------------------------------

/**
 * Executes the primary problem-solving logic.
 * The goal is to find the minimum expense to achieve a specific height configuration
 * across a selected subset of items.
 */
function performCalculation() {
  // Acquire the problem's primary parameters: total number of items and minimum items to select.
  const configurationParameters = getIntegerArrayFromLine();
  const totalItems = configurationParameters[0];
  const minSelected = configurationParameters[1];
  
  // Acquire the initial heights for all items.
  const itemHeights = getIntegerArrayFromLine();
  
  // Initialize the lowest calculated expense to an extremely large value.
  let optimalExpense = 1e16; // Represents a very large initial cost.
  
  // Special case: If only one item is required, no expense is incurred as no relative height adjustment is needed.
  if (minSelected === 1) {
    outputLine(0);
    return;
  }

  // Edge case: If the minimum number of items to select exceeds the total available items,
  // it's an impossible scenario given the problem constraints (or default to max cost).
  if (minSelected > totalItems) {
      outputLine(optimalExpense); 
      return;
  }

  // Iterate through all possible subsets of items. Each 'subsetMask' uniquely identifies a combination.
  const maximumCombinations = (1 << totalItems); // Total number of possible subsets (2^totalItems).
  for (let subsetMask = 0; subsetMask < maximumCombinations; ++subsetMask) {
    let currentCost = 0;          // Accumulated cost for the current subset.
    let highestReached = 0;       // Keeps track of the maximum height seen so far within processed items.
    let selectedCount = 0;        // Counter for items chosen in this specific subset.

    // Examine each individual item to determine if it's part of the current subset.
    for (let itemIndex = 0; itemIndex < totalItems; ++itemIndex) {
      // Check if the bit corresponding to 'itemIndex' is set in 'subsetMask'.
      // This indicates the item is included in the current combination.
      const isItemSelected = ((subsetMask >>> itemIndex) & 1) !== 0;
      
      if (isItemSelected) {
        selectedCount++; // Increment the count of chosen items.
        
        // If the current item's height is less than or equal to the tallest item
        // encountered among previously processed items, its height must be increased.
        if (highestReached >= itemHeights[itemIndex]) {
          currentCost += (highestReached - itemHeights[itemIndex] + 1);
          highestReached++; // Update highestReached to reflect the new target height.
        }
      }
      // Update 'highestReached' with the maximum of its current value and the actual height
      // of the current item. This happens regardless of selection, ensuring 'highestReached'
      // always tracks the maximum physical height up to the current item's position.
      highestReached = Math.max(itemHeights[itemIndex], highestReached);
    }
    
    // If the number of selected items meets or exceeds the minimum requirement,
    // update the overall optimal expense if the current cost is lower.
    if (selectedCount >= minSelected) {
      optimalExpense = Math.min(optimalExpense, currentCost);
    }
  }
  
  // Present the final minimum expense calculated.
  outputLine(optimalExpense);
}