const acquireRawData = () => {
  // This function is responsible for fetching the raw input string.
  // It uses Node.js's built-in 'fs' module to perform a synchronous read
  // from the standard input stream, typically `/dev/stdin` in many
  // online judge environments. The data is expected to be UTF-8 encoded.
  return require('fs').readFileSync('/dev/stdin', 'utf8');
};

const assessDistributionFeasibility = (
  itemPayloads,           // A collection of numeric weights representing items.
  maximumContainerLoad,   // The highest weight a single container can hold.
  availableContainerSlots // The total number of containers at our disposal.
) => {
  // --- Guard Clauses for Edge Cases ---
  // If there are no containers provided, it's impossible to distribute any items.
  if (availableContainerSlots <= 0) {
    return false;
  }

  // If there are no items to place, distribution is trivially feasible.
  if (itemPayloads.length === 0) {
    return true;
  }

  // --- Core Logic for Item Placement ---
  // We start by assuming we're using the first container.
  let containersCurrentlyInUse = 1;
  // This tracks the cumulative weight in the container we are currently filling.
  let currentContainerOccupancy = 0;

  // Iterate through each item to determine if it can be placed under the given constraints.
  for (const individualItemWeight of itemPayloads) {
    // Fundamental constraint: If any single item is heavier than the maximum allowed
    // load for a container, then no distribution is possible, as that item can never fit.
    if (individualItemWeight > maximumContainerLoad) {
      return false;
    }

    // Check if adding the current item would push the current container over its limit.
    if (currentContainerOccupancy + individualItemWeight > maximumContainerLoad) {
      // If it would, we must allocate a new container for this item.
      containersCurrentlyInUse++;

      // After allocating a new container, check if we have exceeded the total
      // number of available slots. If so, this distribution plan is not viable.
      if (containersCurrentlyInUse > availableContainerSlots) {
        return false;
      }

      // Start filling the newly allocated container with the current item.
      currentContainerOccupancy = individualItemWeight;
    } else {
      // If the item fits comfortably, add its weight to the current container.
      currentContainerOccupancy += individualItemWeight;
    }
  }

  // If we've successfully iterated through all items without violating any
  // capacity limits or running out of containers, the distribution is feasible.
  return true;
};

// --- Main Program Execution Flow ---

// Step 1: Retrieve the raw text input from the standard input stream.
const rawInputPayload = acquireRawData();

// Step 2: Pre-process the input string.
// Remove any leading/trailing whitespace and then split the string into an array of lines.
const processedInputLines = rawInputPayload.trim().split('\n');

// Step 3: Parse the first line to extract global parameters.
// The first line typically contains two space-separated integers:
// - The total number of items (though not explicitly used beyond parsing).
// - The number of carriers/containers available.
const mainParameters = processedInputLines[0].split(' ');
const totalNumberOfItems = Number(mainParameters[0]); // Original 'n'
const numberOfAvailableCarriers = Number(mainParameters[1]); // Original 'k'

// Step 4: Parse the subsequent lines to get the weight of each individual item.
// This creates an array of item weights.
const collectionOfItemWeights = []; // Original 'wi'
for (let lineIndex = 1; lineIndex < processedInputLines.length; lineIndex++) {
  const currentLineAsNumber = Number(processedInputLines[lineIndex]);
  // A simple check to ensure we only add valid numeric weights.
  if (!isNaN(currentLineAsNumber)) {
    collectionOfItemWeights.push(currentLineAsNumber);
  } else {
    // In a production scenario, one might throw an error or log more extensively.
    console.warn(`Encountered non-numeric input on line ${lineIndex + 1}. Skipping.`);
  }
}

// --- Binary Search for Optimal Capacity ---

// Determine the absolute upper bound for the search space.
// The maximum possible capacity is the sum of all item weights (i.e., putting all items in one container).
const summationOfAllWeights = collectionOfItemWeights.reduce((acc, weight) => acc + weight, 0);

// Determine the absolute lower bound for the search space.
// The minimum possible capacity must at least be able to hold the heaviest single item.
const heaviestIndividualItem = Math.max(...collectionOfItemWeights);

// Initialize the search boundaries for our binary search.
let searchRangeMinimum = heaviestIndividualItem; // Lower bound for capacity, optimized from 0.
let searchRangeMaximum = summationOfAllWeights;  // Upper bound for capacity.

// This variable will store the smallest capacity found that satisfies the distribution criteria.
let finalOptimalCapacity = summationOfAllWeights; // Initialize with a safe (but potentially too high) value.

// Execute the binary search algorithm.
// We are searching for the smallest `maximumContainerLoad` that makes `assessDistributionFeasibility` return true.
while (searchRangeMinimum <= searchRangeMaximum) {
  // Calculate the midpoint capacity to test in this iteration.
  const candidateCapacity = Math.floor((searchRangeMinimum + searchRangeMaximum) / 2);

  // Test if all items can be distributed using the `candidateCapacity` with the available carriers.
  if (assessDistributionFeasibility(collectionOfItemWeights, candidateCapacity, numberOfAvailableCarriers)) {
    // If it's feasible, this `candidateCapacity` is a possible answer.
    // We store it and attempt to find an even smaller capacity by searching in the lower half.
    finalOptimalCapacity = candidateCapacity;
    searchRangeMaximum = candidateCapacity - 1; // Adjust the upper bound to look for smaller values.
  } else {
    // If it's not feasible, the `candidateCapacity` is too small.
    // We need more capacity, so we search in the upper half.
    searchRangeMinimum = candidateCapacity + 1; // Adjust the lower bound to look for larger values.
  }
}

// Step 5: Output the result.
// Print the minimum maximum capacity required for successful distribution.
console.log(finalOptimalCapacity);