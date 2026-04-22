"use strict"; // Enforce strict mode for cleaner code execution.

/**
 * This primary function orchestrates the processing of input data
 * to compute a specific numerical outcome.
 * @param {string} incomingString - The raw text received as input.
 */
const ProcessInputData = (incomingString) => {
    // Parse the input string into an array of integers.
    // First, remove leading/trailing whitespace, then split by space,
    // and finally convert each segment into an integer.
    let numericElements = incomingString
                          .trim()
                          .split(' ')
                          .map( (item) => {
                                      return parseInt(item, 10); // Ensure base 10 parsing.
                                  }
                              );

    // Extract the first number for initial comparison or calculation.
    let primaryValue = numericElements[0];
    // Extract the second number, often used as a target or limit.
    let limitingFactor = numericElements[1];

    // Initialize a variable to store the calculated result count.
    let outcomeTotal = 0;

    // Check if the primary value is already greater than or equal to the limiting factor.
    if ( primaryValue >= limitingFactor ) {
        // If so, the outcome is a simple '1'.
        outcomeTotal = 1;
    } else {
        // Otherwise, perform an iterative calculation.
        // Loop as long as the condition based on (primaryValue - 1) * iteration + 1 is less than limitingFactor.
        for ( let currentIteration = 0;
              (primaryValue - 1) * currentIteration + 1 < limitingFactor;
              currentIteration++ )
        {
            // Increment the outcome total for each successful iteration.
            outcomeTotal = outcomeTotal + 1;
        }
    }

    // Display the final computed outcome to the console.
    console.log(outcomeTotal);
};

// Execute the main program by reading input from standard input.
ProcessInputData(
    require('fs')
        .readFileSync('/dev/stdin', 'utf8') // Read the entire file content as a UTF-8 string.
);