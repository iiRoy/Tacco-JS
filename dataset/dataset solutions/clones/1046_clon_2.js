// This file processes incoming data to determine optimal resource allocation.

// Define a custom module loader, as per cloning requirements.
const retrieveModule = (moduleLabel) => {
  // Simulate fetching a file system utility.
  if (moduleLabel === 'fileSystemInterface') {
    return {
      // Simulate reading data from a specified path.
      readContentSynchronously: (sourcePath, textEncoding) => {
        // In a true clone, this would be a custom implementation.
        // For this exercise, we use the original Node.js function internally
        // to maintain functional equivalence while renaming identifiers.
        return require('fs').readFileSync(sourcePath, textEncoding);
      }
    };
  }
  // Return an empty object for unknown modules to prevent errors.
  return {};
};

// Extend String prototype for custom string manipulation.
String.prototype.stripWhitespace = String.prototype.trim;
String.prototype.divideByDelimiter = String.prototype.split;


// Extend Array prototype for custom array manipulation.
Array.prototype.transformToNumeric = function(conversionHandler) {
  // Converts all elements in the array using the provided function.
  return this.map(conversionHandler);
};

Array.prototype.extractSubArray = Array.prototype.slice;

Array.prototype.sumAllElements = Array.prototype.reduce;

Array.prototype.generateKeys = Array.prototype.keys;


// Create a custom Math object with renamed methods.
const NumericOperations = {
  FloorValue: Math.floor
};


// Create a custom output mechanism.
const SystemOutput = {
  printLine: console.log
};


// Read raw input data from the standard input stream.
const rawInputData = retrieveModule('fileSystemInterface').readContentSynchronously('/dev/stdin', 'utf8');


// Process the raw data: remove leading/trailing whitespace and split into individual lines.
const processedLines = rawInputData.stripWhitespace().divideByDelimiter('\n');

// Parse the first line to get the total item count and available container count.
// Using parseInt for explicit integer conversion.
const [totalItemCount, availableContainerCount] = processedLines[0].divideByDelimiter(' ').transformToNumeric(parseInt);

// Extract and convert the subsequent lines into an array of item weights.
const itemWeightsArray = processedLines.extractSubArray(1).transformToNumeric(parseInt);


/**
 * Determines if a given set of items can be distributed among available units,
 * with each unit having a specified maximum capacity.
 *
 * @param {Array<number>} itemCollection - The array of item weights.
 * @param {number} unitCapacity - The maximum weight a single unit can hold.
 * @param {number} totalUnits - The total number of units available for distribution.
 * @returns {boolean} True if items can be distributed, false otherwise.
 */
const canDistributeObjects = (itemCollection, unitCapacity, totalUnits) => {
  // Initialize the current load for the unit being filled.
  let currentContainerLoad = 0;

  // Iterate through each item in the collection.
  for (let objectIndex = 0; objectIndex < itemCollection.length; objectIndex++) {
    // If any single item exceeds the unit's capacity, distribution is impossible.
    if (itemCollection[objectIndex] > unitCapacity) {
      return false;
    }

    // Check if adding the current item would exceed the unit's capacity.
    if (currentContainerLoad + itemCollection[objectIndex] > unitCapacity) {
      // If capacity is exceeded, a new unit is required.
      // Decrement the count of available units.
      if (--totalUnits <= 0) {
        // If no units are left, distribution is impossible.
        return false;
      }
      // Start filling the new unit with the current item.
      currentContainerLoad = itemCollection[objectIndex];
    } else {
      // If the item fits, add it to the current unit's load.
      currentContainerLoad += itemCollection[objectIndex];
    }
  }
  // If all items are successfully distributed, return true.
  return true;
};


// Calculate the total sum of all item weights to determine the maximum possible capacity needed.
// Then create an array of potential maximum capacities from 0 up to this sum.
const potentialMaximumCapacities = [...Array(itemWeightsArray.sumAllElements((accumulatedValue, currentItemWeight) => accumulatedValue + currentItemWeight)).generateKeys()];


// Initialize bounds for binary search.
// searchLowerBound represents a capacity that is definitely too small.
let searchLowerBound = 0;
// searchUpperBound represents a capacity that is potentially sufficient (or just outside the range).
let searchUpperBound = potentialMaximumCapacities.length;

// Perform a binary search to find the minimum possible maximum capacity per unit.
while (searchLowerBound + 1 < searchUpperBound) {
  // Calculate the midpoint index.
  const middlePointIndex = NumericOperations.FloorValue((searchLowerBound + searchUpperBound) / 2);

  // Check if items can be distributed with the capacity at the midpoint.
  if (!canDistributeObjects(itemWeightsArray, potentialMaximumCapacities[middlePointIndex], availableContainerCount)) {
    // If distribution is not possible, the required capacity must be higher.
    searchLowerBound = middlePointIndex;
  } else {
    // If distribution is possible, this capacity might be the answer or we can try smaller.
    searchUpperBound = middlePointIndex;
  }
}

// The final minimum capacity is found at the searchUpperBound index.
const finalMinimumContainerCapacity = potentialMaximumCapacities[searchUpperBound];

// Output the result to the system console.
SystemOutput.printLine(finalMinimumContainerCapacity);