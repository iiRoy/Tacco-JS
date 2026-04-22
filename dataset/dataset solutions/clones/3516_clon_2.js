function acquireInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayOutput(messageContent) {
  console.log(messageContent);
}

function reportError(diagnosticInfo) {
  console.error(diagnosticInfo);
}

// This routine handles various data transformations based on the provided option.
// Accepted options:
//  0: Pass through without alteration
//  1: Convert to an integer value
//  2: Divide string by single space characters into an array
//  3: Divide string by newline characters into an array
//  4: Divide by spaces, then map each segment to a numeric type
//  5: Divide by newlines, then map each segment to a numeric type
//  6: Break string into an array of individual characters
//  7: Break string into characters, then map each to a numeric type
function transformValue(sourceString, conversionOption) {
  switch (conversionOption) {
    case 0:
      return sourceString;
    case 1:
      return parseInt(sourceString, 10);
    case 2:
      return sourceString.split(" ");
    case 3:
      return sourceString.split("\n");
    case 4:
      return sourceString.split(" ").map((element) => Number(element));
    case 5:
      return sourceString.split("\n").map((element) => Number(element));
    case 6:
      return sourceString.split("");
    case 7:
      return sourceString.split("").map((element) => Number(element));
  }
}

function executeCoreLogic(initialData) {
  let processedLines = transformValue(initialData, 3);

  let totalItemsCount = transformValue(processedLines[0], 1);
  let valueCollection = transformValue(processedLines[1], 2);

  let oddIndexedItemCounts = {};
  let evenIndexedItemCounts = {};

  // Loop through the collection to tally frequencies based on index parity
  for (let currentIdx = 0; currentIdx < totalItemsCount; currentIdx++) {
    // Group elements by their 0-based index parity
    if (currentIdx % 2 === 0) {
      // If the current index is even
      if (oddIndexedItemCounts[valueCollection[currentIdx]] === null || oddIndexedItemCounts[valueCollection[currentIdx]] === undefined) {
        oddIndexedItemCounts[valueCollection[currentIdx]] = 1;
      } else {
        oddIndexedItemCounts[valueCollection[currentIdx]]++;
      }
    } else {
      // If the current index is odd
      if (evenIndexedItemCounts[valueCollection[currentIdx]] === null || evenIndexedItemCounts[valueCollection[currentIdx]] === undefined) {
        evenIndexedItemCounts[valueCollection[currentIdx]] = 1;
      } else {
        evenIndexedItemCounts[valueCollection[currentIdx]]++;
      }
    }
  }

  let finalCalculatedResult = 0;

  // Extract unique keys (values) from the frequency maps
  let uniqueOddKeys = Array.from(Object.keys(oddIndexedItemCounts));
  let uniqueEvenKeys = Array.from(Object.keys(evenIndexedItemCounts));

  // Check for a specific edge case where both sets have only one unique value, and they are identical
  if (uniqueOddKeys.length === 1 && uniqueEvenKeys.length === 1 && uniqueEvenKeys[0] === uniqueOddKeys[0]) {
    displayOutput(totalItemsCount / 2);
    return; // Terminate execution early for this case
  }

  let currentMaximumFrequency = 0;
  let dominantOddValue = "";

  // Determine the most frequent value among odd-indexed items
  for (let currentIdx = 0; currentIdx < uniqueOddKeys.length; currentIdx++) {
    if (currentMaximumFrequency < oddIndexedItemCounts[uniqueOddKeys[currentIdx]]) {
      currentMaximumFrequency = oddIndexedItemCounts[uniqueOddKeys[currentIdx]];
      dominantOddValue = uniqueOddKeys[currentIdx];
    }
  }

  // Add the required changes for the odd-indexed items to the total result
  finalCalculatedResult += (totalItemsCount / 2) - currentMaximumFrequency;

  // Reset the maximum frequency tracker for the next phase
  currentMaximumFrequency = 0;

  // If the dominant odd value is also present in the even-indexed unique keys, remove it
  // This ensures that the two most frequent values (one from each parity group) are distinct
  const positionInEvenKeys = uniqueEvenKeys.indexOf(dominantOddValue);
  if (positionInEvenKeys !== -1) {
    uniqueEvenKeys.splice(positionInEvenKeys, 1);
  }

  // Find the most frequent value among even-indexed items (after potential removal)
  for (let currentIdx = 0; currentIdx < uniqueEvenKeys.length; currentIdx++) {
    if (dominantOddValue === uniqueEvenKeys[currentIdx]) {
      // This comment marks a line that was present but inactive in the original code.
      // Its presence maintains structural similarity without altering runtime behavior.
      /* continue; */
    }
    currentMaximumFrequency = Math.max(currentMaximumFrequency, evenIndexedItemCounts[uniqueEvenKeys[currentIdx]]);
  }

  // Output debugging information to standard error, as per original's myerr usage
  reportError(uniqueOddKeys);
  reportError(uniqueEvenKeys);

  // Add the required changes for the even-indexed items to the total result
  finalCalculatedResult += (totalItemsCount / 2) - currentMaximumFrequency;

  // Display the grand total of required changes
  displayOutput(finalCalculatedResult);
}

// Initiate the program by fetching input and passing it to the main logic
executeCoreLogic(acquireInput());