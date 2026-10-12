function largeSum(firstNumStr, secondNumStr) {
  // Declare variables for lengths, indices, carry, temporary sum, and digit arrays.
  let lenLonger, lenShorter, bufferSize;
  let idxShort, idxLong;
  let remVal, tempSum;
  let resultArr, longDigits, shortDigits;

  // Determine which string is longer and assign to appropriate variables.
  if (firstNumStr.length > secondNumStr.length) {
    lenLonger = firstNumStr.length;
    lenShorter = secondNumStr.length;
    longDigits = firstNumStr.split("");
    shortDigits = secondNumStr.split("");
  } else {
    lenLonger = secondNumStr.length;
    lenShorter = firstNumStr.length;
    longDigits = secondNumStr.split("");
    shortDigits = firstNumStr.split("");
  }

  // Check for potential overflow if the number is too long.
  if (lenLonger > 80) {
    console.log("overflow");
    return; // Exit the function early.
  }

  // Initialize the result array with an extra space for potential carry.
  bufferSize = lenLonger + 1;
  resultArr = new Array(bufferSize);

  // Perform addition from right to left for the common length part.
  for (idxLong = lenLonger - 1, idxShort = lenShorter - 1, remVal = 0; idxShort >= 0; --idxShort, --idxLong) {
    tempSum = parseInt(longDigits[idxLong]) + parseInt(shortDigits[idxShort]) + remVal;
    resultArr[idxLong + 1] = tempSum % 10; // Store the last digit of the sum.
    remVal = Math.floor(tempSum / 10); // Calculate the new carry.
  }

  // Add remaining digits of the longer number, considering any carry.
  for (; idxLong >= 0; --idxLong) {
    tempSum = parseInt(longDigits[idxLong]) + remVal;
    resultArr[idxLong + 1] = tempSum % 10; // Store the last digit.
    remVal = Math.floor(tempSum / 10); // Update carry.
  }

  // Place the final carry (if any) at the beginning of the result array.
  resultArr[0] = remVal;

  // Output the result based on the final carry and length.
  if (remVal > 0) {
    // If there's a carry and the original longer number was already at max length.
    if (lenLonger === 80) {
      console.log("overflow");
    } else {
      // Print the full result including the carry.
      console.log(resultArr.join(""));
    }
  } else {
    // If no carry, slice the array to remove the leading zero and print.
    console.log(resultArr.slice(1, bufferSize).join(""));
  }
}

// Set up standard input processing.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data from stdin.
process.stdin.on('data', function(inputData) {
  // Split the input into individual lines and trim whitespace.
  const inputLines = inputData.trim().split("\n");
  let currentIdx = 0;

  // Parse the number of test cases.
  let numCases = parseInt(inputLines[currentIdx++].trim());

  // Process each test case.
  while (numCases > 0) {
    // Call the largeSum function with the two numbers for the current case.
    largeSum(inputLines[currentIdx], inputLines[currentIdx + 1]);
    currentIdx += 2; // Move to the next pair of numbers.
    numCases--; // Decrement the case counter.
  }
});
