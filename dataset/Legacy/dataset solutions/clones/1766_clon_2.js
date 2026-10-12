function processInputData(rawData) {
  // Split the incoming string by spaces to get an array of elements.
  rawData = rawData.split(' ');

  // Iterate through each element in the processed array.
  for (let idx = 0; idx < rawData.length; idx++) {
    // Check if the current element is strictly equal to the string '0'.
    if (rawData[idx] === '0') {
      // If it is, print the 1-based index of this element.
      console.log(idx + 1);
    }
  }
}

// Read the entire content from standard input, decode it as UTF-8,
// and then pass it to our primary processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
