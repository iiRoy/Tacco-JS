function ComputeFinalValue( inputQuantity )
{
  /*
   * This function calculates a final net value based on an initial quantity.
   * It involves a series of arithmetic operations and a decrementing loop.
   */

  // Determine the initial gross income from the input quantity and a fixed unit price.
  var grossIncome = inputQuantity * 800.0;

  // Initialize a variable to track the number of loop iterations.
  var loopIterations = 0.0;


  // Start a processing loop; the input quantity is decremented in each step.
  // The loop continues as long as the processing quantity remains non-negative.
  for (inputQuantity; inputQuantity >= 0.0; inputQuantity -= 15.0)
  {
    // Increment the iteration counter for each cycle completed.
    loopIterations += 1.0;
  }

  // Calculate a deduction value based on the total loop iterations.
  // This value is derived from a base amount per iteration plus a fixed offset.
  var deductionValue = (loopIterations * 200.0) + 200.0;

  // Output the final net result, which is the gross income minus the calculated deduction.
  console.log( grossIncome - deductionValue );
}


// Execute the main processing function with data read from standard input.
// The input is first converted to a numerical type to ensure correct arithmetic operations.
ComputeFinalValue( Number( require("fs").readFileSync("/dev/stdin", "utf8") ) );