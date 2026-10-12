function printToConsole(messageContent) {
  // This function outputs the provided text to the standard console.
  console.log(messageContent);
}

function ProcessInputData(rawData) {
  // First, we clean up the raw input string.
  let processedData = rawData.trim();

  // Then, we split the input into an array of strings based on newline characters.
  processedData = processedData.split("\n");

  // The first line of input contains the length of the sequence.
  const arrayLength = parseInt(processedData[0]);

  // The second line contains the space-separated numbers, which we convert to a numeric array.
  const numericSequence = processedData[1].split(" ").map((elementValue) => Number(elementValue));

  // Initialize a variable to accumulate the total absolute distance.
  // Start with the absolute value of the first element's distance from origin.
  let totalDistance = Math.abs(numericSequence[0]);

  // Iterate through the sequence to calculate the sum of absolute differences between adjacent elements.
  for (let currentIdx = 0; currentIdx < arrayLength - 1; currentIdx++) {
    totalDistance += Math.abs(numericSequence[currentIdx] - numericSequence[currentIdx + 1]);
  }

  // Add the absolute distance of the last element from the origin.
  totalDistance += Math.abs(numericSequence[arrayLength - 1]);

  // Now, iterate through each element to calculate the modified total distance
  // if that specific element were removed.
  for (let currentIdx = 0; currentIdx < arrayLength; currentIdx++) {
    let currentResult = 0; // Temporary variable for the result of the current iteration.

    if (currentIdx === 0) {
      // If the first element is "removed":
      // Subtract its distance from origin and its distance to the next element.
      // Add the distance of the next element from origin.
      currentResult = totalDistance - Math.abs(numericSequence[0]) - Math.abs(numericSequence[0] - numericSequence[1]) + Math.abs(numericSequence[1]);
    } else if (currentIdx === numericSequence.length - 1) {
      // If the last element is "removed":
      // Subtract its distance from the previous element and its distance from origin.
      // Add the distance of the previous element from origin.
      const finalIndex = numericSequence.length - 1;
      currentResult = totalDistance - Math.abs(numericSequence[finalIndex - 1] - numericSequence[finalIndex]) - Math.abs(numericSequence[finalIndex]) + Math.abs(numericSequence[finalIndex - 1]);
    } else {
      // If an intermediate element is "removed":
      // Subtract its distance from the previous element and its distance to the next element.
      // Add the distance between the previous and next elements.
      currentResult = totalDistance - Math.abs(numericSequence[currentIdx - 1] - numericSequence[currentIdx]) - Math.abs(numericSequence[currentIdx] - numericSequence[currentIdx + 1]) + Math.abs(numericSequence[currentIdx - 1] - numericSequence[currentIdx + 1]);
    }
    // Output the calculated result for the current element.
    console.log(currentResult);
  }
}

// Read input from standard input and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
