// This function processes the entire input string.
function ProcessInput(rawData) {
  // Declare variables to hold parsed data and a counter.
  let numItems, itemData, counter, valuesArray;

  // Split the raw input into lines; the first line is numItems (unused), the second is itemData.
  [numItems, itemData] = rawData.split('\n');

  // Parse the second line of data into an array of integers.
  valuesArray = itemData.split(' ').map(valStr => parseInt(valStr, 10));

  // Initialize a counter for specific conditions.
  counter = 0;

  // Iterate through the array to find pairs that satisfy a condition.
  valuesArray.forEach((currentVal, idx, srcArr) => {
    // Check if the value at (currentVal - 1) in the source array is equal to (idx + 1).
    // If true, increment the counter.
    if (srcArr[currentVal - 1] === idx + 1) {
      counter += 1;
    }
  });

  // Output half of the final counter value.
  console.log(counter / 2);
}

// The following line handles standard input/output and invokes the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
