function ProcessInputData(rawData) {
  // Split the entire input string into individual lines.
  let processedLines = rawData.split('\n');

  // The first line indicates the total number of test scenarios.
  let caseCount = processedLines[0];

  // An array to store all parsed test case details.
  let testCases = [];

  // A string accumulator for the final results.
  let finalOutput = '';

  // Loop through the input lines to parse each test case.
  for (let idx = 0; idx < caseCount; idx++) {
    // Each test case consists of 3 lines:
    // 1. An integer (N)
    // 2. A space-separated list of integers (A_i)
    // 3. A string of '0's and '1's (S)
    testCases.push([
      parseInt(processedLines[3 * idx + 1]), // N
      processedLines[3 * idx + 2].split(' ').map(numStr => parseInt(numStr, 10)), // A_i array
      processedLines[3 * idx + 3] // S string
    ]);
  }

  // Now, process each individual test case.
  for (let idx = 0; idx < caseCount; idx++) {
    let currentResult = 0; // Default result for the current test case.
    let trailingZeroes = 0; // Counter for trailing '0's in the S string.

    // Count how many '0's are at the end of the S string.
    while (testCases[idx][2][testCases[idx][2].length - trailingZeroes - 1] === "0") {
      trailingZeroes++;
    }

    // Store the count of trailing zeroes with the test case data.
    testCases[idx].push(trailingZeroes);

    // Initialize a set of possible XOR sums from the first part of the A_i array.
    let initialStates = [0];
    let counterA = 0;

    // Perform XOR operations for the first N - trailingZeroes elements of A_i.
    while (counterA < testCases[idx][0] - trailingZeroes) {
      let updatedStates = []; // Temporary array for new possible states.

      // Iterate through the current possible states.
      for (let subIdx = 0; subIdx < initialStates.length; subIdx++) {
        // Add the current state if not already present.
        if (updatedStates.indexOf(initialStates[subIdx]) === -1) {
          updatedStates.push(initialStates[subIdx]);
        }
        // Add the XOR sum with the current A_i element if not already present.
        if (updatedStates.indexOf(initialStates[subIdx] ^ testCases[idx][1][counterA]) === -1) {
          updatedStates.push(initialStates[subIdx] ^ testCases[idx][1][counterA]);
        }
      }
      initialStates = updatedStates; // Update the set of possible states.
      counterA++; // Move to the next A_i element.
    }

    // For each state generated from the first part, check if it can be reduced to 0
    // using the remaining A_i elements (corresponding to trailing '0's in S).
    for (let subIdx = 0; subIdx < initialStates.length; subIdx++) {
      let currentChoices = [initialStates[subIdx]]; // Start with the current state.
      let isPossible = "False"; // Flag to check if 0 is reachable.
      let counterB = testCases[idx][0] - trailingZeroes; // Start from the A_i elements corresponding to trailing '0's.

      // Iterate through the A_i elements corresponding to the trailing '0's in S.
      while (counterB < testCases[idx][0] && isPossible === "False") {
        let nextChoices = []; // Temporary array for new possible choices.

        // Iterate through the current possible choices.
        for (let innerIdx = 0; innerIdx < currentChoices.length; innerIdx++) {
          // Add the current choice if not already present.
          if (nextChoices.indexOf(currentChoices[innerIdx]) === -1) {
            nextChoices.push(currentChoices[innerIdx]);
          }
          // Add the XOR sum with the current A_i element if not already present.
          if (nextChoices.indexOf(currentChoices[innerIdx] ^ testCases[idx][1][counterB]) === -1) {
            nextChoices.push(currentChoices[innerIdx] ^ testCases[idx][1][counterB]);
          }
        }

        // If 0 is found among the new choices, it's possible.
        if (nextChoices.indexOf(0) >= 0) {
          isPossible = "True";
        }
        currentChoices = nextChoices; // Update the set of choices.
        counterB++; // Move to the next A_i element.
      }

      // If 0 was not reachable for this initial state, then the overall result is 1.
      if (isPossible === "False") {
        currentResult = 1;
        break; // No need to check other initial states.
      }
    }
    // Append the result for the current test case to the final output string.
    finalOutput += ('\n' + String(currentResult));
  }

  // Remove the leading newline character from the accumulated output.
  finalOutput = finalOutput.slice(1);

  // Print the final computed results to the console.
  console.log(finalOutput);
}

// This line should not be modified. It handles reading input and calling the main function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
