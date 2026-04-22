function readSource() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}
function displayResult(resultValue) {
  console.log(resultValue);
} // Print the computed result to standard output
function reportProblem(issue) {
  console.error(issue);
} // Report errors to standard error stream

// Conversion operation codes:
// 0: Return input as-is
// 1: Convert to integer number
// 2: Split by single space character
// 3: Split by newline character
// 4: Split by space, then convert each part to number
// 5: Split by newline, then convert each part to number
// 6: Split into individual characters
// 7: Split into individual characters, then convert each to number
function processString(inputTxt, operationCode) {
  switch (operationCode) {
    case 0:
      return inputTxt;
    case 1:
      return Number(inputTxt); // Using Number() for conversion
    case 2:
      return inputTxt.split(" ");
    case 3:
      return inputTxt.split("\n");
    case 4:
      return inputTxt.split(" ").map((element) => Number(element));
    case 5:
      return inputTxt.split("\n").map((element) => Number(element));
    case 6:
      return inputTxt.split("");
    case 7:
      return inputTxt.split("").map((element) => Number(element));
  }
}

function PrimaryProcess(incomingPayload) {
  incomingPayload = processString(incomingPayload, 3); // Split the initial input by newlines

  let totalElements = processString(incomingPayload[0], 1); // Get the count of elements from the first line
  const valueArray = processString(incomingPayload[1], 4); // Get the numeric list from the second line

  const occurrenceTracker = {}; // Object to store the frequency of each number
  for (let loopIndex = 0; loopIndex < totalElements; loopIndex++) {
    if (occurrenceTracker[valueArray[loopIndex]] === undefined) {
      occurrenceTracker[valueArray[loopIndex]] = 1;
    } else {
      occurrenceTracker[valueArray[loopIndex]]++;
    }
  }

  const uniqueElements = Array.from(Object.keys(occurrenceTracker)); // Get an array of unique numbers
  uniqueElements.sort(function (firstVal, secondVal) {
    return processString(firstVal, 1) - processString(secondVal, 1); // Sort unique numbers numerically
  });

  // Strategy: Prioritize consuming numbers that appear multiple times.
  // Attack from both ends (smallest and largest values).
  // If one end runs out, use single-occurrence numbers to fulfill requirements.

  let leftIndex = 0; // Pointer for the beginning of the sorted unique elements
  let rightIndex = uniqueElements.length - 1; // Pointer for the end of the sorted unique elements

  while (true) {
    const leftCount = occurrenceTracker[uniqueElements[leftIndex]]; // Frequency of the current left element
    if (leftCount <= 1) {
      leftIndex++; // Move left pointer if its count is 1 or less
      continue;
    }

    const rightCount = occurrenceTracker[uniqueElements[rightIndex]]; // Frequency of the current right element
    if (rightCount <= 1) {
      rightIndex--; // Move right pointer if its count is 1 or less
      continue;
    }

    if (leftIndex >= rightIndex) {
      // Termination condition: pointers crossed or met
      if (leftCount >= 2) {
        if (leftCount % 2 === 1) {
          occurrenceTracker[uniqueElements[leftIndex]] = 1; // If odd, one remains
        } else {
          occurrenceTracker[uniqueElements[leftIndex]] = 0; // If even, none remain
        }
      }
      break; // Exit the loop
    } else {
      occurrenceTracker[uniqueElements[leftIndex]]--; // Decrement count of left element
      occurrenceTracker[uniqueElements[rightIndex]]--; // Decrement count of right element
    }
  }

  let singleItemCount = 0; // Counter for items remaining with a frequency of 1
  for (let idx = 0; idx < uniqueElements.length; idx++) {
    if (occurrenceTracker[uniqueElements[idx]] === 1) {
      singleItemCount++; // Increment if the item's frequency is exactly 1
    }
  }

  displayResult(singleItemCount); // Output the final count
}

PrimaryProcess(readSource()); // Initiate the main processing logic with input from source