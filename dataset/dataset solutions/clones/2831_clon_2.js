function ProcessInput(rawData) {
  // Split the raw input string into individual lines.
  let lines = rawData.split("\n");

  // Parse the dimensions N and M from the first line.
  let dimensions = lines[0].split(" ");
  let firstDimension = parseInt(dimensions[0]);
  let secondDimension = parseInt(dimensions[1]);

  // Parse sequence A (S in original) from the second line.
  let sequenceA = lines[1].split(" ").map(item => parseInt(item));

  // Parse sequence B (T in original) from the third line.
  let sequenceB = lines[2].split(" ").map(item => parseInt(item));

  // Define the modulo value for calculations.
  const moduloVal = Math.pow(10, 9) + 7;

  // Initialize a 2D array for dynamic programming.
  // This grid will store intermediate results.
  let dynamicProgGrid = new Array(firstDimension + 1).fill(0);
  // Initialize a 1D array, though it's not used in the final calculation.
  let cumulativeSums = new Array(firstDimension + 1).fill(0);

  // Populate the dynamic programming grid with sub-arrays.
  for (let rowIdx = 0; rowIdx < firstDimension + 1; rowIdx++) {
    let tempRow = new Array(secondDimension + 1).fill(0);
    dynamicProgGrid[rowIdx] = tempRow;
  }

  // Core dynamic programming logic to compute the number of common subsequences.
  // Iterate through each element of sequence A and sequence B.
  for (let rowIdx = 0; rowIdx < firstDimension; rowIdx++) {
    for (let colIdx = 0; colIdx < secondDimension; colIdx++) {
      // If the current elements from both sequences match.
      if (sequenceA[rowIdx] === sequenceB[colIdx]) {
        // The count is the sum of (dp[i][j+1] + dp[i+1][j] + 1) modulo `moduloVal`.
        // The `+1` accounts for the new common subsequence formed by the current match.
        dynamicProgGrid[rowIdx + 1][colIdx + 1] = (dynamicProgGrid[rowIdx][colIdx + 1] + dynamicProgGrid[rowIdx + 1][colIdx] + 1) % moduloVal;
      } else {
        // If the current elements do not match.
        // The count is the sum of (dp[i][j+1] + dp[i+1][j] - dp[i][j]) modulo `moduloVal`.
        // We add `moduloVal` before taking modulo to handle potential negative results from subtraction.
        dynamicProgGrid[rowIdx + 1][colIdx + 1] = (dynamicProgGrid[rowIdx][colIdx + 1] + dynamicProgGrid[rowIdx + 1][colIdx] + (moduloVal - dynamicProgGrid[rowIdx][colIdx])) % moduloVal;
      }
    }
  }

  // The final result is the value at the bottom-right of the DP grid plus one (for the empty subsequence).
  let finalResult = dynamicProgGrid[firstDimension][secondDimension] + 1;

  // Output the computed answer to the console.
  console.log('%s', finalResult);
  // Return the final computed answer.
  return finalResult;
}

// This function is for a specific testing environment, not part of the main algorithm.
function VerifySolution(testCaseNum) {
  // Retrieve input data from a specific HTML element.
  let testInputData = document.getElementById("input" + testCaseNum).value;
  // Compute the answer using the main processing function.
  let computedAnswer = ProcessInput(testInputData);
  // Initialize the test outcome as "Wrong Answer".
  let testOutcome = "WA";
  // Compare the computed answer with the expected output from another HTML element.
  if (computedAnswer == document.getElementById("output" + testCaseNum).value.split("\n")[0]) {
    // If they match, set the outcome to "Accepted".
    testOutcome = "AC";
  }
  // Display the test outcome in a designated HTML element.
  document.getElementById("result" + testCaseNum).innerHTML = testOutcome;
}

// Main execution block: read input from standard input and process it.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
