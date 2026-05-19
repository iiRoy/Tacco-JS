function ProcessInput(rawData) {
  // The rawData parameter contains the entire input string.
  // We first split it into individual lines.
  let lineData = rawData.split("\n");

  // The first line contains the count of numbers.
  // The second line contains the numbers themselves.
  let firstLineParts = lineData[0].split(" ");
  let secondLineParts = lineData[1].split(" ");

  // Parse the first element of the first line to get the total count.
  const countElements = parseInt(firstLineParts[0], 10);

  // Initialize the status variable. Note the trailing space here.
  let resultStatus = 'APPROVED ';

  // Iterate through the numbers provided in the second line.
  for (let idx = 0; idx < countElements; idx++) {
    // Parse the current number from the second line.
    const currentNumber = parseInt(secondLineParts[idx], 10);

    // Check if the current number is even.
    if (currentNumber % 2 === 0) {
      // If it's even, check if it's divisible by 3 or 5.
      if (currentNumber % 3 === 0 || currentNumber % 5 === 0) {
        // If divisible by 3 or 5, it's still approved.
        // Note: The trailing space is removed here if it was 'APPROVED '.
        resultStatus = 'APPROVED';
      } else {
        // If even but not divisible by 3 or 5, it's denied.
        resultStatus = 'DENIED';
        // No need to check further numbers, so break the loop.
        break;
      }
    }
  }

  // Output the final approval status.
  console.log(resultStatus);
}

// This section handles reading input from standard input and calling the main processing function.
// It should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
