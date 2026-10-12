'use strict'; // Enforce strict mode for cleaner code

/**
 * Processes the provided raw data to perform calculations and output results.
 * @param {string} rawData - The entire input string from stdin.
 */
function ProcessInput(rawData) {
  // Parse the number of elements from the first line of input.
  const countElements = Number(rawData.split('\n')[0]);

  // Extract connection data from subsequent lines, up to countElements.
  // Each connection is represented as an array of two strings.
  const connectionsData = rawData.split('\n').slice(1, countElements).map(currentVal => currentVal.split(' '));

  // Extract numerical values from the line corresponding to countElements.
  const valueList = rawData.split('\n')[countElements].split(' ').map(currentVal => Number(currentVal));

  // Sort the numerical values in descending order.
  valueList.sort((itemA, itemB) => itemB - itemA);

  // Calculate the sum of all values except the maximum value.
  // This is achieved by summing all values and then subtracting the maximum.
  const sumExcludingMax = valueList.reduce((accumulator, currentVal) => accumulator + currentVal) - Math.max(...valueList);

  // Output the calculated sum.
  console.log(sumExcludingMax);

  // Initialize an array to hold objects representing each element.
  const elementObjects = [];
  // Populate the elementObjects array with basic identifiers.
  for (let idx = 0; idx < countElements; idx++) {
    elementObjects.push({ "identifier": idx + 1 });
  }

  // Determine the hierarchy level for each element based on connections.
  // This assumes a tree-like structure where the first element in a connection
  // is the parent of the second, and its level is one less.
  for (let connIdx = 0; connIdx < countElements - 1; connIdx++) {
    // If the parent element's hierarchy level hasn't been set, initialize it to 0.
    if (elementObjects[(Number(connectionsData[connIdx][0]) - 1)].hierarchyLevel == null) {
      elementObjects[(Number(connectionsData[connIdx][0]) - 1)].hierarchyLevel = 0;
    }
    // Set the child element's hierarchy level based on its parent's level.
    elementObjects[(Number(connectionsData[connIdx][1]) - 1)].hierarchyLevel = elementObjects[(Number(connectionsData[connIdx][0]) - 1)].hierarchyLevel + 1;
  }

  // Sort the element objects by their hierarchy level in ascending order.
  elementObjects.sort((itemA, itemB) => itemA.hierarchyLevel - itemB.hierarchyLevel);

  // Create the final result sequence by mapping sorted values to sorted elements.
  const resultSequence = [];
  for (let finalIdx = 0; finalIdx < countElements; finalIdx++) {
    // Assign values from the sorted valueList to the positions indicated by
    // the identifiers of the sorted elementObjects.
    resultSequence[elementObjects[finalIdx].identifier - 1] = valueList[finalIdx];
  }

  // Output the final sequence as a space-separated string.
  console.log(resultSequence.join(' '));
}

// Read input from standard input, decode as UTF-8, and trim whitespace.
// Then, pass the processed input to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
