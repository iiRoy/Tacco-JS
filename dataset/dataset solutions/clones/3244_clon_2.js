// This function serves as the primary entry point for processing incoming data.
function processInput (rawData) {
  // Split the raw input string into individual lines for further parsing.
  const lines = rawData.split('\n');

  // Determine the total number of data entries from the first line.
  const countOfItems = Number.parseInt(lines[0], 10);

  // Initialize two arrays to hold our primary and secondary numerical values.
  const primaryValues = [];
  const secondaryValues = [];

  // Iterate through the input lines, starting from the second line (index 1)
  // up to the total number of items, to populate our value arrays.
  for (let idx = 1; idx <= countOfItems; idx++) {
    // Each line contains two space-separated numbers.
    const currentLineParts = lines[idx].split(' ');
    // Parse the first number as a primary value.
    primaryValues[idx - 1] = Number.parseInt(currentLineParts[0], 10);
    // Parse the second number as a secondary value.
    secondaryValues[idx - 1] = Number.parseInt(currentLineParts[1], 10);
  }

  // Call the core transformation logic with the populated arrays and item count.
  let finalResult = transformData(primaryValues, secondaryValues, countOfItems);


  // Output the computed final result to the console.
  console.log(finalResult);
}

// This function performs the main data manipulation, alternating between adding and subtracting values.
function transformData (listOne, listTwo, iterationLimit) {
  // Initialize an accumulator for the final calculated value.
  // The original code had `var o;` which would lead to `NaN` when `o += ...` is used.
  // Initializing to 0 to ensure proper arithmetic operation, fixing a common oversight.
  let accumulator = 0;

  // Loop a specified number of times to process the data.
  for (let loopIndex = 0; loopIndex < iterationLimit; loopIndex++) {
    let chosenIndex; // Variable to store the index determined by the helper function.

    // Alternate operations based on whether the current loop index is even or odd.
    if (loopIndex % 2 === 0) {
      // For even indices, determine an index using listOne as primary, then add its value to the accumulator.
      chosenIndex = determineIndex(listOne, listTwo);
      accumulator += listOne[chosenIndex];
    } else {
      // For odd indices, determine an index using listTwo as primary, then subtract its value from the accumulator.
      chosenIndex = determineIndex(listTwo, listOne);
      accumulator -= listTwo[chosenIndex];
    }

    // After each step, remove the chosen element from both lists to prevent re-selection.
    listOne.splice(chosenIndex, 1);
    listTwo.splice(chosenIndex, 1);
  }

  // Return the accumulated total.
  return accumulator;
}

// This helper function identifies a specific index based on a maximum value criteria.
function determineIndex (currentArray, comparisonArray) {
  let bestIndex = 0; // Initialize the best index found so far.

  // Find the maximum value within the currentArray using the modern spread syntax.
  const maximumValue = Math.max(...currentArray);

  // Iterate through the currentArray to find the appropriate index.
  // Note: The loop condition `arrayIterator <= currentArray.length` may access `currentArray[currentArray.length]`
  // which is `undefined` for a 0-indexed array. The original code had this behavior, which is preserved.
  for (let arrayIterator = 0; arrayIterator <= currentArray.length; arrayIterator++) {
    // Check if the current element matches the maximum value,
    // is not the same as the already chosen best index,
    // AND if the corresponding value in the comparison array is greater than or equal
    // to the value at the current best index in the comparison array.
    if (maximumValue === currentArray[arrayIterator] && bestIndex !== arrayIterator && comparisonArray[bestIndex] <= comparisonArray[arrayIterator]) {
      bestIndex = arrayIterator; // Update the best index.
    }
  }

  // Return the determined best index.
  return bestIndex;
}

// Execute the main processing function by reading input from standard input.
processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));