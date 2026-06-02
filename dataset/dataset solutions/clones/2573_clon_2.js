function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  // The first line will be at index 0, the second at index 1, and so on.
  let processedLines = rawData.split("\n");

  // Extract the number of elements from the first line.
  let countElements = processedLines[0];

  // Parse the second line into an array of numbers for sequence A.
  let sequenceA = processedLines[1].split(" ").map(Number);

  // Parse the third line into an array of numbers for values B.
  let valuesB = processedLines[2].split(" ").map(Number);

  // Parse the fourth line into an array of numbers for bonuses C.
  let bonusesC = processedLines[3].split(" ").map(Number);

  // Define a utility function to compute the sum of elements in a numeric array.
  const calculateTotal = function(numericArray) {
    let currentTotal = 0; // Initialize accumulator for the sum.
    // Iterate through each element of the provided array.
    for (let idx = 0; idx < numericArray.length; ++idx) {
      currentTotal += numericArray[idx]; // Add the current element to the total.
    }
    return currentTotal; // Return the final sum.
  };

  // Calculate the initial total sum using the values from array B.
  let finalScore = calculateTotal(valuesB);

  // Iterate through sequence A to check for specific conditions and apply bonuses.
  // The loop runs from the first element up to the second-to-last element.
  for (let k = 0; k < countElements - 1; k++) {
    // Check if the current element in sequence A is exactly one less than the next element.
    if (sequenceA[k] === sequenceA[k + 1] - 1) {
      // If the condition is met, add the corresponding bonus from array C to the final score.
      finalScore = finalScore + bonusesC[k];
    }
  }

  // Output the computed final score to the console.
  console.log(finalScore);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
