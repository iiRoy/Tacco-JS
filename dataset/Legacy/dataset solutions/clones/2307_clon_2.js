function processInput(rawData) {
  // Parse the first line of input to get two integer values
  let firstLineParts = rawData[0].split(" ");
  let firstVal = firstLineParts[0] - 0; // Convert string to number
  let secondVal = firstLineParts[1] - 0; // Convert string to number

  // Process the second line: split, convert to numbers, and sort in descending order
  const sortedNumbers = rawData[1]
    .split(" ")
    .map((currentStr) => currentStr - 0) // Convert each string element to a number
    .sort((elemA, elemB) => elemB - elemA); // Sort in descending order

  // Initialize the accumulator for the final result
  let finalResult = 0;

  // Main processing loop, labeled for breaking out of nested loops
  outerLoop: for (let outerIdx = 0; outerIdx < firstVal; outerIdx++) {
    // Add twice the current element to the result
    finalResult += sortedNumbers[outerIdx] * 2;
    // Decrement the second value counter
    secondVal--;

    // If the counter reaches zero, exit the main loop
    if (secondVal === 0) {
      break outerLoop;
    }

    // Nested loop for combinations
    for (let innerIdx = outerIdx + 1; innerIdx < firstVal; innerIdx++) {
      // Calculate the contribution from the pair and add to the result
      finalResult +=
        (sortedNumbers[outerIdx] + sortedNumbers[innerIdx]) *
        Math.min(2, secondVal);
      // Decrement the second value counter by 2
      secondVal -= 2;

      // If the counter is zero or less, exit both loops
      if (secondVal <= 0) {
        break outerLoop;
      }
    }
  }

  // Output the calculated final result to the console
  console.log(finalResult);
}

// Read input from standard input, split by newlines, and pass to the processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
