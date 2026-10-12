function processInput(rawData) {
  // Split the raw input string by newline characters to get individual lines.
  rawData = rawData.split('\n');
  // Convert the first line to a number, representing the array size (though not directly used in this algorithm).
  const arraySize = Number(rawData[0]);
  // Split the second line into an array of characters, representing the color sequence.
  const colorSequence = rawData[1].split('');

  // Initialize a counter for the number of swap operations performed.
  let swapOperations = 0;
  // Loop indefinitely until a break condition is met.
  while (true) {
    // Find all indices where a 'W' is immediately followed by an 'R'.
    let mismatchedPairs = locateMismatchedWR(colorSequence);
    // If no such problematic pairs are found, the sequence is sorted, so exit the loop.
    if (mismatchedPairs.length === 0) {
      break;
    }

    // Find the index of the first 'W' in the sequence.
    let firstWhiteIndex = findFirstW(colorSequence);
    // Find the index of the last 'R' in the sequence.
    let lastRedIndex = findLastR(colorSequence);

    // Swap the 'W' at firstWhiteIndex with the 'R' at lastRedIndex.
    // This moves a 'W' from the left side (where it shouldn't be) to the right,
    // and an 'R' from the right side (where it shouldn't be) to the left.
    colorSequence[firstWhiteIndex] = 'R';
    colorSequence[lastRedIndex] = 'W';

    // Increment the counter for successful swap operations.
    swapOperations++;
  }

  // Output the total number of swap operations required to sort the sequence.
  console.log(swapOperations);
}

// This function identifies and returns the starting indices of all 'W' followed by 'R' pairs.
function locateMismatchedWR(colorArray) {
  let problematicIndices = []; // Array to store the indices of 'W' in 'WR' pairs.
  // Iterate through the color array, stopping one element before the end.
  for (let idx = 0; idx < colorArray.length - 1; idx++) {
    // Check if the current element is 'W' and the next element is 'R'.
    if (colorArray[idx] === 'W' && colorArray[idx + 1] === 'R') {
      problematicIndices.push(idx); // If so, add the current index to the list.
    }
  }
  return problematicIndices; // Return the list of problematic indices.
}

// This function finds the index of the first occurrence of 'W' in the color array.
function findFirstW(colorArr) {
  // Iterate from the beginning of the array.
  for (let idx = 0; idx < colorArr.length; idx++) {
    // If 'W' is found, return its index.
    if (colorArr[idx] === 'W') {
      return idx;
    }
  }
  // (Assumes 'W' will always be found if a swap is needed, based on algorithm logic.)
}

// This function finds the index of the last occurrence of 'R' in the color array.
function findLastR(colorArr) {
  // Iterate from the end of the array backwards.
  for (let idx = colorArr.length - 1; idx >= 0; idx--) {
    // If 'R' is found, return its index.
    if (colorArr[idx] === 'R') {
      return idx;
    }
  }
  // (Assumes 'R' will always be found if a swap is needed, based on algorithm logic.)
}

// Read input from standard input, decode it as UTF-8, remove leading/trailing whitespace, and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
