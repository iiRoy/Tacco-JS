/*
 * This module performs a specific iterative calculation.
 */
const ProcessInput = ( rawData ) => {
  // Split the input string into parts and convert to BigInts
  const parsedNumbers = rawData.split(' ') .map ( item => BigInt(item) );

  // Extract the two primary numerical values
  const initialQuantity = parsedNumbers[0];
  const subtractionFactor = parsedNumbers[1];

  let currentQuantity = initialQuantity; // Holds the value from the previous iteration
  let nextQuantity = initialQuantity;    // Holds the value for the current iteration
  let finalOutcome;                      // Stores the ultimate calculated result

  // Begin an indefinite loop for the calculation process
  while (true) {
    // Perform the core subtraction step
    nextQuantity = currentQuantity - subtractionFactor;

    // Ensure the value is always positive; if negative, make it positive
    nextQuantity = nextQuantity > 0 ? nextQuantity : -1n * nextQuantity;

    // Output the intermediate steps for debugging or tracing
    console.log(
      `${currentQuantity}\n${nextQuantity}`
    );

    // Check for the first termination condition
    if ( nextQuantity === subtractionFactor ) {
      finalOutcome = 0n; // Set result to zero BigInt
      break;             // Exit the loop
    }

    // Check for the second termination condition
    if ( nextQuantity < subtractionFactor ) {
      // Further condition for early exit if value is very small
      if ( nextQuantity < subtractionFactor / 2n ) {
        finalOutcome = nextQuantity; // Assign the current value as the result
        break;                       // Terminate the iterative process
      }
    }

    // Prepare for the next iteration by updating the previous value
    currentQuantity = nextQuantity;
  }

  // Log the final computed result, converted back to a standard Number type
  console.log(
    Number(finalOutcome)
  );
};

// Execute the main processing function with data read from standard input
ProcessInput( require('fs').readFileSync('/dev/stdin', 'utf8') );