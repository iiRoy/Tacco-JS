// This function receives the entire content of the input data.
function ProcessInput(rawData) {
  // Each line of the input is separated and stored as an element in an array.
  let parsedLines = rawData.split('\n');
  var caseCount = Number.parseInt(parsedLines[0]); // Determines the total quantity of scenarios to evaluate.
  var problemCases = []; // An array to hold all the structured problem data.
  var finalOutput = ''; // A string builder for accumulating the computed results.

  // A loop to parse and prepare each problem case from the input lines.
  var loopCounterA;
  for (loopCounterA = 0; loopCounterA < caseCount; loopCounterA++) {
    problemCases.push([
      Number.parseInt(parsedLines[3 * loopCounterA + 1]),
      parsedLines[3 * loopCounterA + 2].split(' ').map(numStr => Number.parseInt(numStr, 10)),
      parsedLines[3 * loopCounterA + 3]
    ]);
  }

  // Process each individual problem case to find its specific solution.
  for (let loopCounterB = 0; loopCounterB < caseCount; loopCounterB++) {
    var outcome = 0; // The default computed result for the current scenario.
    var trailingZeros = 0; // Counts the number of '0' characters at the end of the third element.

    // Calculate the number of consecutive '0's from the end.
    while (problemCases[loopCounterB][2][problemCases[loopCounterB][2].length - trailingZeros - 1] === '0') {
      trailingZeros++;
    }
    problemCases[loopCounterB].push(trailingZeros); // Append this count to the current problem case.

    var currentStates = [0]; // Represents the initial set of possible XOR sums.
    var opIndex = 0; // Iterator for the initial sequence of operations.

    // Generate all unique XOR sums based on the first part of the operations.
    while (opIndex < problemCases[loopCounterB][0] - trailingZeros) {
      var nextStates = []; // Collection of states after applying the current operation.
      for (let innerLoopCounterA = 0; innerLoopCounterA < currentStates.length; innerLoopCounterA++) {
        // Include the existing state if it's not already in the next set.
        if (nextStates.indexOf(currentStates[innerLoopCounterA]) === -1) {
          nextStates.push(currentStates[innerLoopCounterA]);
        }
        // Include the new state formed by XORing with the current operation value.
        if (nextStates.indexOf(currentStates[innerLoopCounterA] ^ problemCases[loopCounterB][1][opIndex]) === -1) {
          nextStates.push(currentStates[innerLoopCounterA] ^ problemCases[loopCounterB][1][opIndex]);
        }
      }
      currentStates = nextStates; // Propagate the new states for the next iteration.
      opIndex++;
    }

    // For each generated state, verify if it can be reduced to zero by the '0' operations.
    for (let innerLoopCounterA = 0; innerLoopCounterA < nextStates.length; innerLoopCounterA++) {
      var possibleValues = [nextStates[innerLoopCounterA]]; // The starting value for this particular check.
      var isSolvable = 'False'; // A flag indicating if the value can become zero.
      var zeroOpIndex = problemCases[loopCounterB][0] - trailingZeros; // The starting index for the '0' operations.

      // Apply the remaining '0' operations to determine reachability of zero.
      while (zeroOpIndex < problemCases[loopCounterB][0] && isSolvable === 'False') {
        var nextValues = []; // States after applying the current '0' operation.
        for (let innerLoopCounterB = 0; innerLoopCounterB < possibleValues.length; innerLoopCounterB++) {
          if (nextValues.indexOf(possibleValues[innerLoopCounterB]) === -1) {
            nextValues.push(possibleValues[innerLoopCounterB]);
          }
          if (nextValues.indexOf(possibleValues[innerLoopCounterB] ^ problemCases[loopCounterB][1][zeroOpIndex]) === -1) {
            nextValues.push(possibleValues[innerLoopCounterB] ^ problemCases[loopCounterB][1][zeroOpIndex]);
          }
        }
        if (nextValues.indexOf(0) >= 0) { // If a zero state is discovered.
          isSolvable = 'True';
        }
        zeroOpIndex++;
      }

      // If a state cannot be reduced to zero, the final outcome for this case is 1.
      if (isSolvable === 'False') {
        outcome = 1;
        break; // Stop checking further states for this specific case.
      }
    }
    finalOutput += ('\n' + outcome.toString()); // Add the result for the current case to the output string.
  }

  // Prepare the final output string and display it.
  finalOutput = finalOutput.slice(1); // Remove the initial newline character.
  console.log(finalOutput); // Print the aggregated results to the console.
}
// No modifications should be made beyond this point (handles reading from standard input and invoking the primary function).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));