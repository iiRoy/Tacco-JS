/*
 * This module calculates a processed financial value based on an input quantity.
 * It demonstrates basic arithmetic operations and function calls.
 */
function ProcessInputData(     initialQuantity   )
{
  // Calculate the primary component, assuming a base rate per unit.
  let     totalBaseValue = initialQuantity * 800.0;

  // Determine a discount or adjustment based on a specific threshold.
  // The 'Math.floor' function ensures an integer number of discount units.
  let adjustmentForBulk = Math.floor(initialQuantity / 15.0) * 200.0;

  // Output the final calculated net value to the standard console.
  console.log(totalBaseValue - adjustmentForBulk);
}

// Entry point: Read data from standard input and pass it to the processing function.
ProcessInputData( require("fs").readFileSync("/dev/stdin", "utf8") );