/**
 * This module processes input strings to calculate a specific numerical result.
 * It analyzes a sequence of characters to determine a cumulative score based on directional markers.
 */

/**
 * Main processing function for the input data.
 * It analyzes a sequence of characters to determine a cumulative score.
 * @param {string} rawData - The raw input string, typically from stdin.
 * @returns {number} The calculated total score.
 */
function ProcessInput(rawData) {
  // Split the incoming data by newline characters to handle multi-line input.
  rawData = rawData.split("\n");

  // Extract the first line and convert it into an array of individual characters for analysis.
  let charSequence = rawData[0].split("");

  // Determine the effective length for array initialization, which is one more than the character sequence length.
  // This accounts for boundary conditions in the problem logic.
  const sequenceLength = charSequence.length + 1;

  // Initialize a variable that is declared in the original structure but not utilized in the final calculation.
  let minimumValue = 0;

  // Initialize the variable that will store the final computed sum of scores.
  let calculationResult = 0;

  // Create an array to mark specific boundary points within the sequence.
  // These markers help in resetting counts during subsequent passes.
  const boundaryMarkers = new Array(sequenceLength);

  // First pass: Identify and mark initial boundary conditions based on character patterns.
  // This loop iterates through the character sequence to find specific configurations.
  for (let idx = 0; idx < sequenceLength - 1; idx++) {
    // If at the very beginning of the sequence and the character is '<', mark the current position.
    if (idx === 0 && charSequence[idx] === "<") {
      boundaryMarkers[idx] = 0;
    }
    // If a '>' character is followed immediately by a '<' character, mark the position after the '>'.
    else if (charSequence[idx] === ">" && charSequence[idx + 1] === "<") {
      boundaryMarkers[idx + 1] = 0;
    }
    // If at the very end of the sequence and the character is '>', mark the last position.
    else if (idx === sequenceLength - 2 && charSequence[idx] === ">") {
      boundaryMarkers[idx + 1] = 0;
    }
  }

  // Initialize counters for forward and backward traversals.
  // These counters track consecutive '<' or '>' characters.
  let currentCountForward = 0;
  let currentCountBackward = 0;

  // Initialize arrays to store cumulative counts from forward and backward passes, filled with zeros.
  // These arrays will hold the scores for each position based on directional sequences.
  const forwardCounts = new Array(sequenceLength).fill(0);
  const backwardCounts = new Array(sequenceLength).fill(0);

  // Second pass: Calculate cumulative counts based on '<' and '>' characters, respecting boundary markers.
  // This loop performs two simultaneous traversals: one forward and one effectively backward.
  for (let idx = 0; idx < sequenceLength - 1; idx++) {
    // Reset the forward count if a boundary marker is encountered at the current position.
    if (boundaryMarkers[idx] === 0) {
      currentCountForward = 0;
    }

    // If a '<' character is found, increment the forward count and store it in the next position.
    // Otherwise, reset the forward count.
    if (charSequence[idx] === "<") {
      currentCountForward++;
      forwardCounts[idx + 1] = currentCountForward;
    } else {
      currentCountForward = 0;
      forwardCounts[idx + 1] = currentCountForward;
    }

    // Reset the backward count if a boundary marker is encountered from the reverse direction.
    if (boundaryMarkers[sequenceLength - 1 - idx] === 0) {
      currentCountBackward = 0;
    }

    // If a '>' character is found (when traversing from the end), increment the backward count and store it.
    // Otherwise, reset the backward count.
    if (charSequence[sequenceLength - 2 - idx] === ">") {
      currentCountBackward++;
      backwardCounts[sequenceLength - 2 - idx] = currentCountBackward;
    } else {
      currentCountBackward = 0;
      backwardCounts[sequenceLength - 2 - idx] = currentCountBackward;
    }
  }

  // Re-initialize the result variable for the final summation, ensuring it starts from zero.
  calculationResult = 0;

  // Third pass: Aggregate the maximum of forward and backward counts at each position.
  // This loop calculates the final score by combining the directional counts.
  for (let idx = 0; idx < sequenceLength; idx++) {
    // Only consider positions that were marked as boundaries or are part of the sequence.
    // The original logic implies that if L[i] is not 0, it contributes to the sum.
    // This condition effectively filters positions based on the initial boundary marking.
    if (boundaryMarkers[idx] !== 0) {
      calculationResult += Math.max(forwardCounts[idx], backwardCounts[idx]);
    }
  }

  // Output the final computed result to the console, formatted as a string.
  console.log('%s', calculationResult);

  // Return the final calculated result.
  return calculationResult;
}

/**
 * A utility function for testing the main logic within a web environment.
 * It retrieves input from a DOM element, processes it, and displays the outcome.
 * @param {number} testCaseNum - The identifier for the specific test case elements (e.g., "input1", "output1").
 */
function testSolution(testCaseNum) {
  // Retrieve the input string from the designated HTML element using its ID.
  let testInputString = document.getElementById("input" + testCaseNum).value;

  // Execute the main processing function with the retrieved input to get the computed value.
  let computedValue = ProcessInput(testInputString);

  // Initialize the test outcome as "Wrong Answer" by default.
  let testOutcome = "WA";

  // Compare the computed result with the expected output, which is retrieved from another HTML element.
  // The expected output is also split by newline and only the first line is considered.
  if (computedValue === document.getElementById("output" + testCaseNum).value.split("\n")[0]) {
    // If the computed value matches the expected output, set the outcome to "Accepted".
    testOutcome = "AC";
  }

  // Display the final test outcome in the corresponding result HTML element.
  document.getElementById("result" + testCaseNum).innerHTML = testOutcome;
}

// Execute the main processing function with input read from standard input.
// This is a common pattern in Node.js environments for competitive programming challenges.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
