function generatePermutations(inputSequence) {
  // Calculate the length of the input sequence.
  let sequenceLength = inputSequence.length;
  // Initialize the result array with the original sequence as the first permutation.
  let allPerms = [inputSequence.slice()];
  // Initialize a control array for Heap's algorithm, filled with zeros.
  let controlArray = new Array(sequenceLength).fill(0);
  // Initialize loop counter.
  let currentIdx = 1;
  let swapIdx, tempVal; // Variables for swapping elements.

  // Main loop for generating permutations.
  while (currentIdx < sequenceLength) {
    // Check if the current element needs to be swapped.
    if (controlArray[currentIdx] < currentIdx) {
      // Determine the index for swapping based on parity.
      swapIdx = currentIdx % 2 && controlArray[currentIdx];
      // Store the element at currentIdx.
      tempVal = inputSequence[currentIdx];
      // Perform the swap.
      inputSequence[currentIdx] = inputSequence[swapIdx];
      inputSequence[swapIdx] = tempVal;
      // Increment the counter for the current index.
      ++controlArray[currentIdx];
      // Reset currentIdx to 1 to re-evaluate from the beginning.
      currentIdx = 1;
      // Add the new permutation to the results.
      allPerms.push(inputSequence.slice());
    } else {
      // If no swap is needed, reset the counter for currentIdx and move to the next element.
      controlArray[currentIdx] = 0;
      ++currentIdx;
    }
  }
  // Return the array containing all generated permutations.
  return allPerms;
}

// Pre-calculate permutations for sequences of length 0 to 10.
let cachedPermutations = [
  [0]
]; // Initialize with a dummy for index 0, or handle it differently if 0 is not used.
// Loop to populate cachedPermutations.
for (let lenCounter = 0; lenCounter < 10; lenCounter++) {
  let currentSequence = []; // Temporary array for the current sequence.
  // Populate currentSequence with numbers from 0 to lenCounter.
  for (let elementIdx = 0; elementIdx < lenCounter + 1; elementIdx++) {
    currentSequence.push(elementIdx);
  }
  // Generate permutations for currentSequence and store them.
  cachedPermutations[lenCounter + 1] = generatePermutations(currentSequence);
}

// Read input from standard input.
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input into lines and remove leading/trailing whitespace.
let inputLines = rawData.trim().split("\n");

// Process input lines until a '0' is encountered.
while (true) {
  // Parse the first line as the number of items for the current test case.
  let itemCount = inputLines.shift() - 0;
  // If itemCount is 0, terminate the loop.
  if (itemCount === 0) break;

  // Array to store parsed item data.
  let parsedItems = [];
  // Read itemCount lines and parse them.
  for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
    parsedItems[itemIndex] = inputLines.shift().split(" ");
  }
  // Convert the second and third elements of each item to numbers.
  parsedItems = parsedItems.map(itemData => [itemData[0], itemData[1] - 0, itemData[2] - 0]);

  // Retrieve pre-calculated permutations for the current itemCount.
  let currentPermutations = cachedPermutations[itemCount];
  let maximumRatio = 0; // Stores the maximum ratio found.
  let bestOrder = ""; // Stores the permutation that yields the maximum ratio.

  // Iterate through all possible permutations.
  for (let permIndex = 0; permIndex < currentPermutations.length; permIndex++) {
    let currentOrder = currentPermutations[permIndex];
    let isValidOrder = true; // Flag to check if the current order is valid.
    let totalWeight = 0; // Accumulator for the sum of weights.
    let weightedSum = 0; // Accumulator for the weighted sum.

    // Iterate through elements in the current permutation.
    for (let positionIndex = 0; positionIndex < currentOrder.length; positionIndex++) {
      let originalItemIndex = currentOrder[positionIndex]; // Get the original index of the item.
      // Check if the accumulated weight exceeds the item's capacity.
      if (totalWeight > parsedItems[originalItemIndex][2]) {
        isValidOrder = false; // Mark as invalid.
        break; // Exit inner loop.
      }
      // Add the item's weight to the total.
      totalWeight += parsedItems[originalItemIndex][1];
      // Add the item's weighted value to the weighted sum.
      weightedSum += parsedItems[originalItemIndex][1] * (positionIndex + 1);
    }

    // If the order is valid and yields a higher ratio, update maximumRatio and bestOrder.
    if (isValidOrder && weightedSum / totalWeight > maximumRatio) {
      maximumRatio = weightedSum / totalWeight;
      bestOrder = currentOrder;
    }
  }
  // Map the best order (indices) back to item names, reverse them, and join with newlines for output.
  console.log(bestOrder.map(originalItemIndex => parsedItems[originalItemIndex][0]).reverse().join("\n"));
}
