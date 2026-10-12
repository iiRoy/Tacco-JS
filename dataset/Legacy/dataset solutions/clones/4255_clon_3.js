(function() {
    'use strict';

    // Helper function to safely parse an input string into an integer.
    // This encapsulates the parsing logic and explicitly uses base 10.
    const parseNumericInput = (inputString) => {
        // Ensure the input is treated as a string before parsing
        const stringRepresentation = String(inputString);
        return parseInt(stringRepresentation, 10);
    };

    // Collection for all lines read from standard input.
    let collectedInputLines = [];

    // Setup readline interface to process input line by line.
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).on('line', function(currentInputLine) { // Renamed 'line' to 'currentInputLine'
      collectedInputLines.push(currentInputLine);
    });

    // Event listener for when standard input stream ends.
    process.stdin.on('end', function() {
      // The original code had commented-out lines for processing multiple tokens per line,
      // which are not relevant to the current problem's logic.

      // Retrieve the first line of input, which contains the number N.
      const firstInputEntry = collectedInputLines[0];

      // Parse the input string to get the numeric limit for calculation.
      const calculationLimit = parseNumericInput(firstInputEntry); // Renamed 'N'

      // Initialize the variable to store the largest perfect square found.
      let largestFoundSquare = 0; // Renamed 'ans'

      // Define the starting point for the iteration counter.
      const loopStartValue = 0;

      // Iterate from the start value up to the calculation limit (inclusive).
      // The loop structure and iteration count are preserved from the original.
      for (let currentIterationBase = loopStartValue; currentIterationBase <= calculationLimit; currentIterationBase++) { // Renamed 'i'
        // Calculate the square of the current base value.
        const computedSquareValue = currentIterationBase * currentIterationBase; // Renamed 'test'

        // Check if the computed square is within the allowed limit.
        if (computedSquareValue <= calculationLimit) {
            // If it is, update the largest found square.
            largestFoundSquare = computedSquareValue;
        }
        // No 'else' branch is needed as 'largestFoundSquare' should only be updated
        // when a valid square is found.
      }

      // Output the final result to standard output.
      console.log(largestFoundSquare); // Renamed 'ans'
    });
})();
