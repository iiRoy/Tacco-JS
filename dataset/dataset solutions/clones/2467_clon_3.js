function processInputData(rawDataString) {
  // Define a constant for the maximum permissible value for the second operand
  const UPPER_BOUND_FOR_SECOND_OPERAND = 9;

  // Utilize a more robust parsing approach for the input string.
  // First, remove any extraneous leading or trailing whitespace.
  // Then, split the string by one or more whitespace characters to handle varied spacing.
  const stringTokens = rawDataString.trim().split(/\s+/);

  // Introduce a preliminary validation step: ensure exactly two numeric tokens are provided.
  // If the input doesn't conform to this expected structure, output an error.
  if (stringTokens.length !== 2) {
    emitCalculationResult("-1"); // Indicate an invalid input format
    return; // Terminate execution for this input
  }

  // Convert the extracted string tokens into integer numbers.
  // Explicitly specify radix 10 for `parseInt` to prevent unexpected base conversions.
  const primaryNumber = parseInt(stringTokens[0], 10);
  const secondaryNumber = parseInt(stringTokens[1], 10);

  // Perform an additional validation to check if the parsed values are indeed numbers.
  // If either conversion resulted in NaN (Not-a-Number), it signifies invalid numeric input.
  if (isNaN(primaryNumber) || isNaN(secondaryNumber)) {
    emitCalculationResult("-1"); // Indicate non-numeric input
    return; // Terminate execution
  }

  // Evaluate the core condition.
  // The original code's condition `!args[0] <= 9` effectively always evaluated to `true`
  // for any numeric value of `args[0]` due to JavaScript's type coercion rules
  // (e.g., `!5` is `false`, `false <= 9` is `true`; `!0` is `true`, `true <= 9` is `true`).
  // Therefore, the only meaningful part of the original conditional check was `args[1] <= 9`.
  const isSecondaryValueWithinRange = (secondaryNumber <= UPPER_BOUND_FOR_SECOND_OPERAND);

  // Based on the simplified and effectively equivalent condition, proceed with the calculation or error.
  if (isSecondaryValueWithinRange) {
    // If the secondary number meets the criteria, compute the product.
    const computedProduct = primaryNumber * secondaryNumber;
    emitCalculationResult(computedProduct);
  } else {
    // Otherwise, output the designated error value.
    emitCalculationResult("-1");
  }
}

// A dedicated helper function for outputting results.
// This abstraction allows for easier modification of the output mechanism in the future.
function emitCalculationResult(outputValue) {
  // Direct the output to the standard console.
  console.log(outputValue);
}

/*
// This section typically handles input acquisition.
// For competitive programming environments, input is often read from standard input.
// The 'fs' module is used here to synchronously read the entire content of '/dev/stdin'
// as a UTF-8 encoded string, which is then passed to our main processing function.
*/
emitCalculationResult(require("fs").readFileSync("/dev/stdin", "utf8"));