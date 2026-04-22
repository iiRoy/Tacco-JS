/*
 * This module defines a primary routine
 * for processing a raw string input.
 */
function ProcessInputData(initialPayload) {
  /* Step 1: Clean up the incoming string by removing leading/trailing whitespace. */
  let trimmedPayload = initialPayload.trim();

  // Step 2: Divide the cleaned string into an array of constituent parts
  let tokenizedSegments = trimmedPayload.split(" ");

  /*
   * Assign the numeric components from the tokenized array
   * to distinct variables for easier manipulation.
   */
  let quantityA = tokenizedSegments[0];
  let quantityB = tokenizedSegments[1];
  let quantityC = tokenizedSegments[2];

  /* Initialize the final computed value to zero. */
  let calculationOutcome = 0;

  // Calculate an initial difference and an adjusted third quantity.
  let differenceAB = quantityA - quantityB;
  let adjustedC = quantityC - 1;

  /*
   * Conditional logic based on the parity of the difference
   * between the third and second quantities.
   */
  if ((quantityC - quantityB) % 2 == 0) {
    // If the difference is even, perform specific adjustments.
    if (quantityC - quantityB - 2 >= 0) {
      differenceAB -= (quantityC - quantityB - 2) / 2;
      adjustedC -= (quantityC - quantityB - 2) / 2;
    }
  } else {
    // If the difference is odd, apply a different set of adjustments.
    if (quantityC - quantityB - 1 >= 0) {
      differenceAB -= (quantityC - quantityB - 1) / 2;
      adjustedC -= (quantityC - quantityB - 1) / 2;
    }
  }

  /* Determine the minimum of the two adjusted values. */
  calculationOutcome = Math.min(differenceAB, adjustedC);

  // Re-evaluate the outcome if the initial C-B difference was even.
  if ((quantityC - quantityB) % 2 == 0) {
    calculationOutcome = Math.min((quantityC - quantityB) / 2, calculationOutcome);
  }

  /* Output the final derived result to the console. */
  console.log(calculationOutcome);
}

// Entry point: Read input from standard input and pass it to the processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));