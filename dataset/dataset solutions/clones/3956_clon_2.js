function logOutput(messageContent) {
  console.log(messageContent);
}

/*
 * This is the primary function to process incoming data.
 * It calculates a specific sum based on numerical sequences.
 */
function ExecuteAlgorithm(receivedText) {

  receivedText = receivedText.trim(); // Clean up the initial input string by removing leading/trailing whitespace.

  receivedText = receivedText.trim().split("\n"); // Split the cleaned input string by newline characters to get individual lines.

  // Parse the first line as the number of elements.
  var numberOfItems = parseInt(receivedText[0], 10);

  // Process the second line: split by space, then convert each part to a number.
  var dataArray = receivedText[1].split(" ").map((element) => Number(element));

  // Initialize the cumulative value with the absolute value of the first element.
  var cumulativeValue = Math.abs(dataArray[0]);

  // Iterate through the array to calculate the sum of absolute differences between adjacent elements.
  for (var loopIndex = 0; loopIndex < numberOfItems - 1; loopIndex++) {
    cumulativeValue += Math.abs(dataArray[loopIndex] - dataArray[loopIndex + 1]);
  }

  // Add the absolute value of the last element to the cumulative sum.
  cumulativeValue += Math.abs(dataArray[numberOfItems - 1]);

  // Now, iterate again to calculate modified sums for each element's removal/replacement scenario.
  for (var loopIndex = 0; loopIndex < numberOfItems; loopIndex++) {
    var calculatedValue = 0; // Temporary storage for each iteration's result.

    // Case 1: The first element is being considered.
    if (loopIndex === 0) {
      calculatedValue = cumulativeValue - Math.abs(dataArray[0]) - Math.abs(dataArray[0] - dataArray[1]) + Math.abs(dataArray[1]);
    }
    // Case 2: The last element is being considered.
    else if (loopIndex === dataArray.length - 1) {
      let finalIndex = dataArray.length - 1; // Store the index of the last element.
      calculatedValue = cumulativeValue - Math.abs(dataArray[finalIndex - 1] - dataArray[finalIndex]) - Math.abs(dataArray[finalIndex]) + Math.abs(dataArray[finalIndex - 1]);
    }
    // Case 3: Any intermediate element is being considered.
    else {
      calculatedValue = cumulativeValue - Math.abs(dataArray[loopIndex - 1] - dataArray[loopIndex]) - Math.abs(dataArray[loopIndex] - dataArray[loopIndex + 1]) + Math.abs(dataArray[loopIndex - 1] - dataArray[loopIndex + 1]);
    }
    console.log(calculatedValue); // Output the result for the current element's scenario.
  }

}

// Invoke the main processing function with data read from standard input.
ExecuteAlgorithm(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
);