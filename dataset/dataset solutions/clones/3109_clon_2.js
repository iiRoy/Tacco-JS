// This helper function inserts a specified value into an array at a position determined by the value itself.
function addValue(dataList, valToInsert) {
  // The splice method is used to modify the contents of an array by removing or replacing existing elements
  // and/or adding new elements in place.
  // Here, it inserts 'valToInsert' at the index 'valToInsert - 1', effectively shifting subsequent elements.
  dataList.splice(valToInsert - 1, 0, valToInsert);
}

// The primary function responsible for processing the input string.
function processInput(inputString) {
  // First, split the input string by newline characters, then take the second line (index 1).
  // Next, split that line by spaces, and finally, map each resulting string segment to a Number.
  let numericArray = inputString.split("\n")[1].split(" ").map(Number);

  // The original code contained a commented-out line for sorting.
  // numericArray = numericArray.sort((x, y) => x - y); // This line is intentionally left commented as per Type II rules.

  // Determine the total number of elements in the processed array.
  const arrayLength = numericArray.length;
  // Initialize an empty array that will store the final ordered sequence.
  let resultList = [];
  // A boolean flag to indicate if any number in the input array violates the expected sequence rule.
  let hasMismatch = false;

  // Iterate through each element of the 'numericArray'.
  for (let idx = 0; idx < arrayLength; idx++) {
    // Calculate the maximum allowed value for the current index (index + 1).
    const currentMax = idx + 1;
    // Retrieve the current number from the input array.
    const currentNum = numericArray[idx];

    // Check if the current number exceeds its allowed maximum.
    if (currentNum > currentMax) {
      // If it does, set the mismatch flag to true.
      hasMismatch = true;
    }
    // Call the helper function to insert the current number into the 'resultList'.
    // The insertion position is based on the value of 'currentNum'.
    addValue(resultList, currentNum);
  }

  // After the loop, check if any mismatch was detected.
  if (hasMismatch) {
    // If a mismatch occurred, print -1 to the console.
    console.log(-1);
    // Exit the function early.
    return;
  }

  // If no mismatch, iterate through the 'resultList' and print each element.
  for (let outputIdx = 0; outputIdx < numericArray.length; outputIdx++) {
    console.log(resultList[outputIdx]);
  }
}

// Read the entire content of standard input synchronously using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
// Then, pass the read content to the 'processInput' function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
