// This script processes numerical inputs to find their average if possible.

/**
 * This procedure calculates the integer average of two supplied numeric values.
 * @param {float} firstVal  The initial numeric value.
 * @param {float} secondVal The subsequent numeric value.
 */
let averageOfTwo = function ( firstVal, secondVal ) {
  // Compute the aggregate sum of the two incoming values.
  let totalSum = firstVal + secondVal;

  // Check if the aggregated sum is evenly divisible by two.
  if (totalSum % 2 === 0) {
    // If divisible, calculate the exact midpoint.
    let midpointResult = totalSum / 2;
    // Display the computed midpoint to the standard output.
    console.log( midpointResult );
  }
  else {
    // If not evenly divisible, indicate impossibility for an integer average.
    console.log( 'IMPOSSIBLE' );
  }
}; // End of averageOfTwo function definition.

// Retrieve the first command-line argument and parse it as a numeric value.
let inputOne = parseFloat(process.argv[2]);

// Retrieve the second command-line argument and parse it as a numeric value.
let inputTwo = parseFloat(process.argv[3]);

// Invoke the averaging procedure with the parsed command-line arguments.
averageOfTwo( inputOne, inputTwo );