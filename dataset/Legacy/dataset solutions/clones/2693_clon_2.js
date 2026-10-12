const processInput = (rawData) => {
  // Process the raw input string into an array of lines.
  const parsedLines = rawData.trim().split('\n');

  // Extract the count of elements from the first line.
  const elementCount = parseInt(parsedLines[0], 10);

  // Parse the second line into an array of integers.
  const originalArray = parsedLines[1].split(' ').map((val) => parseInt(val, 10));

  // Create a sorted version of the array for comparison.
  const orderedArray = originalArray.slice().sort((firstVal, secondVal) => firstVal - secondVal);

  let mismatchCount = 0; // Initialize a counter for differing elements.

  // Iterate through both arrays to find discrepancies.
  for (let idx = 0; idx < elementCount; idx++) {
    // Check if the element at the current index in the original array
    // is different from the element in the sorted array.
    if (originalArray[idx] !== orderedArray[idx]) {
      mismatchCount++; // Increment the counter if a difference is found.
    }
  }

  // Determine the output based on the number of mismatches.
  // If mismatchCount is 2 or 0, print 'YES', otherwise print 'NO'.
  mismatchCount === 2 || mismatchCount === 0 ? console.log('YES') : console.log('NO');
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
