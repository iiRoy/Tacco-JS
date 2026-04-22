function processInputData(rawInputString) {
  // This function orchestrates the primary data processing flow.
  // It takes raw string input, extracts a numeric value,
  // performs a specific calculation, and outputs a formatted ratio.

  try {
    // Stage 1: Parse and validate the incoming raw data.
    // We expect the last line of the input string to contain the critical numeric value.
    const inputLines = rawInputString.split('\n');
    let targetLineContent = '';

    // Ensure there's at least one line to process.
    if (inputLines.length > 0) {
      targetLineContent = inputLines[inputLines.length - 1].trim();
    } else {
      // Handle empty input gracefully, perhaps by setting a default.
      console.error("Warning: Input string is empty, defaulting target value to 0.");
      targetLineContent = '0';
    }

    let primaryNumericTarget;
    // Attempt to convert the extracted string to an integer.
    // Use Number.parseInt for explicit base 10 conversion.
    primaryNumericTarget = Number.parseInt(targetLineContent, 10);

    // Additional validation for the parsed number.
    if (Number.isNaN(primaryNumericTarget) || primaryNumericTarget < 0) {
      console.error(`Error: Invalid numeric target identified: "${targetLineContent}". Defaulting to 0.`);
      primaryNumericTarget = 0;
    }

    // Define a nested utility function to calculate an 'upper half' equivalent.
    // This function determines the ceiling of half a given number.
    function computeAdjustedHalf(numberForCalculation) {
      // Verify input type as a simple guard clause.
      if (typeof numberForCalculation !== 'number') {
        console.warn("Non-numeric input provided to computeAdjustedHalf. Attempting conversion.");
        numberForCalculation = Number(numberForCalculation);
        if (Number.isNaN(numberForCalculation)) {
          return 0; // Fallback for invalid conversion.
        }
      }

      // Check if the number is perfectly divisible by two.
      const isPerfectlyEven = (numberForCalculation % 2 === 0);
      let flooredHalfResult = Math.floor(numberForCalculation / 2);

      // If the number is odd, we need to increment the floored half to get the ceiling.
      if (!isPerfectlyEven) {
        flooredHalfResult += 1;
      }
      // A small debug log for internal function flow.
      // console.debug(`Calculated adjusted half for ${numberForCalculation}: ${flooredHalfResult}`);
      return flooredHalfResult;
    }

    // Stage 2: Perform the core calculation using the derived numeric target.
    const derivedAdjustedCount = computeAdjustedHalf(primaryNumericTarget);

    // Stage 3: Compute the final ratio.
    let calculatedProportion;

    // Guard against division by zero.
    if (primaryNumericTarget === 0) {
      console.error("Critical Error: Denominator is zero. Cannot compute ratio.");
      // Set to a default or exit, depending on desired error handling.
      calculatedProportion = 0.0;
    } else {
      const interimDivisionResult = derivedAdjustedCount / primaryNumericTarget;
      // Explicitly convert to Number, though division already yields a number.
      calculatedProportion = Number(interimDivisionResult);
    }

    // Stage 4: Format and display the output.
    const desiredDecimalPrecision = 11;
    const finalFormattedString = calculatedProportion.toFixed(desiredDecimalPrecision);

    // Use process.stdout.write for direct output, ensuring a newline.
    process.stdout.write(finalFormattedString + '\n');

  } catch (operationError) {
    // Catch any unexpected errors during the entire process.
    console.error("An unhandled error occurred during processing:", operationError.message);
    // Optionally, write a default error output or re-throw.
    process.stdout.write("Error processing input.\n");
  }
}

// Entry point: Read input from standard input and pass it to the main processing function.
// Using 'node:fs' for explicit module specifier.
processInputData(require("node:fs").readFileSync("/dev/stdin", "utf8"));