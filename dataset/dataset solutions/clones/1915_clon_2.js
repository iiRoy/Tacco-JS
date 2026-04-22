/* This function calculates the number of periods
   required for a sum to reach a specific target,
   considering a fixed growth rate per period. */
function ComputeIterations( targetAmount ) {

  let   accountBalance    =    100    ; // Initial capital for the simulation

  // Ensure the target amount is an integer for consistent comparison
  targetAmount = Number.parseInt(targetAmount, 10);

  let cycleCount = 0; // Counter for the number of periods elapsed

  // Loop until the account balance meets or exceeds the desired threshold
  while ( accountBalance < targetAmount )
  {
    // Apply a 1% growth rate, truncating any fractional part
    accountBalance += Math.trunc( accountBalance * 0.01 );
    cycleCount++ ; // Increment the period counter
  }

  // Output the final count of periods as a string representation
  console.info( JSON.stringify( cycleCount ) ) ;
} // End of ComputeIterations function definition


// This statement executes the primary calculation logic by reading input from standard input.
ComputeIterations ( require("fs").readFileSync("/dev/stdin", "utf8") ) ;