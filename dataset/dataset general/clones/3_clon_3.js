const calculateScaledRound = (inputNumericalValue, precisionFactor) => {
  // Define a constant for the zero magnitude shift, enhancing readability.
  const ZERO_EXPONENT_MAGNITUDE = 0;

  // Early exit condition: If the precision factor is not provided (undefined)
  // or explicitly set to zero, perform a basic mathematical rounding.
  // This directly reflects the initial behavior of the original code for these specific cases.
  if (typeof precisionFactor === 'undefined' || Number(precisionFactor) === ZERO_EXPONENT_MAGNITUDE) {
    return Math.round(inputNumericalValue);
  }

  // Convert the primary input and the precision factor into their definitive numeric forms.
  // This ensures robust handling of various input types (e.g., strings, null).
  let processedNumber = Number(inputNumericalValue);
  let requestedPrecision = Number(precisionFactor);

  // Validation check: If the processed number is not a valid number (NaN),
  // or if the requested precision is not a whole integer, return NaN as the result.
  // This guards against invalid operations further down the execution path.
  if (Number.isNaN(processedNumber) || !Number.isInteger(requestedPrecision)) {
    return Number.NaN;
  }

  // --- Core Transformation Logic: Scale Down, Round, Scale Up ---

  // Phase 1: Prepare the number for the initial scaling (down-shift).
  // Convert the numeric value to its string representation, which can include
  // scientific notation (e.g., "1.23e+5"). This facilitates exponent manipulation.
  const numberStringSegments = processedNumber.toString().split('e');

  // Determine the current exponent of the number. If the number string
  // does not contain 'e' (i.e., not in scientific notation), its implicit exponent is 0.
  let currentBaseExponent = numberStringSegments[1] ? Number(numberStringSegments[1]) : ZERO_EXPONENT_MAGNITUDE;

  // Calculate the new exponent required for the 'down-shift' operation.
  // Per the original algorithm, this involves subtracting the requested precision from the current exponent.
  // This step effectively divides the number by 10 raised to the power of `requestedPrecision`.
  let adjustedExponentForDownShift = currentBaseExponent - requestedPrecision;

  // Reconstruct the number as a string with the newly calculated, reduced exponent.
  // Example: For 123.456 and requestedPrecision = 2, this might result in "123.456e-2".
  const downShiftedNumberString = numberStringSegments[0] + 'e' + adjustedExponentForDownShift;

  // Convert this adjusted string back into a number and apply standard Math.round().
  // This is the central rounding action of the entire process.
  let roundedIntermediateResult = Math.round(Number(downShiftedNumberString));

  // Phase 2: Prepare to scale the number back to its original magnitude (up-shift).
  // Convert the rounded intermediate result back into its string segments.
  const roundedResultStringSegments = roundedIntermediateResult.toString().split('e');

  // Determine the exponent of the rounded intermediate value.
  // Similar to the first phase, handle cases where scientific notation is not explicit.
  let roundedResultBaseExponent = roundedResultStringSegments[1] ? Number(roundedResultStringSegments[1]) : ZERO_EXPONENT_MAGNITUDE;

  // Calculate the final exponent for the 'up-shift' operation.
  // This step adds the requested precision back to the exponent,
  // effectively multiplying the number by 10 raised to the power of `requestedPrecision`.
  let finalExponentForUpShift = roundedResultBaseExponent + requestedPrecision;

  // Reconstruct the final number string using its base part and the calculated up-shift exponent.
  const finalScaledNumberString = roundedResultStringSegments[0] + 'e' + finalExponentForUpShift;

  // Convert the final string representation to a numeric value and return it.
  return Number(finalScaledNumberString);
};

// Export the custom numerical adjustment function for use in other JavaScript modules.
// This utility performs a specific form of rounding, distinct from typical decimal rounding functions.
// Its operational pattern is equivalent to: round(N / (10^P)) * (10^P).
module.exports = calculateScaledRound;