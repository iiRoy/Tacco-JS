// Helper function to safely convert a string segment into a floating-point number.
// This function aims for robustness by explicitly checking for non-numeric input.
function extractNumericSegment(segmentString) {
  // Attempt to parse the string into a floating-point number.
  const parsedNumericValue = parseFloat(segmentString);

  // Validate if the parsing was successful. If not, treat it as zero.
  // In a production system, more sophisticated error handling (e.g., throwing an exception)
  // might be implemented here based on specific requirements.
  if (isNaN(parsedNumericValue)) {
    // Log a warning for invalid data, but proceed with a default value to prevent crashes.
    console.warn(`Warning: Encountered non-numeric data segment '${segmentString}'. Defaulting to 0.`);
    return 0.0;
  }
  return parsedNumericValue;
}

// A utility function designed to determine the lesser of two numeric values.
// This provides an alternative implementation to the standard Math.min function,
// showcasing a structural rewrite for equivalent functionality.
function determineMinimum(valueOne, valueTwo) {
  // Using a conditional (ternary) operator to explicitly compare and return the smaller value.
  return (valueOne < valueTwo) ? valueOne : valueTwo;
}

// The core processing function that calculates a specialized financial charge
// based on a series of input parameters provided as a single raw string.
// This function encapsulates the business logic for the pricing model.
function processFinancialData(incomingDataSource) {
  // Declare constants for key numerical factors to improve readability and maintainability.
  // Using constants makes the magic numbers explicit and easy to modify.
  const RATIO_FOR_AVERAGING = 0.5; // Equivalent to dividing by 2.0
  const SPECIAL_MULTIPLIER_FOR_THIRD = 2.0;

  // Split the raw input string into an array of individual string segments.
  // The regular expression `[\s\n]+` handles one or more spaces or newlines as delimiters.
  const dataSegments = incomingDataSource.split(/[\s\n]+/);

  // Implement a guard clause to ensure that the input data contains a sufficient number of segments.
  // This is an added validation step for increased robustness, not present in the original.
  if (dataSegments.length < 5) {
    console.error("Error: Insufficient input data provided. Expected at least 5 numeric segments.");
    // Return a default error value or throw an exception to indicate failure.
    return 0.0;
  }

  // Parse and store the first five essential numeric components from the input segments.
  // Utilizing the `extractNumericSegment` helper for consistent parsing and validation.
  const firstDataPoint = extractNumericSegment(dataSegments[0]);
  const secondDataPoint = extractNumericSegment(dataSegments[1]);
  const thirdDataPoint = extractNumericSegment(dataSegments[2]);
  const fourthDataPoint = extractDataPoint(dataSegments[3]); // Demonstrating a minor rename for variety
  const fifthDataPoint = extractNumericSegment(dataSegments[4]);

  // Initialize a variable to accumulate the computed charge.
  // Using `let` as its value will be modified throughout the function.
  let computedChargeAccumulator = 0.0;

  // --- First Pricing Rule Evaluation Block ---
  // This block calculates a preliminary component of the charge.

  // Calculate the sum of the first two data points as an intermediate step.
  const sumOfInitialPair = firstDataPoint + secondDataPoint;
  // Compute the mean of the initial pair using the defined ratio.
  const meanOfInitialPair = sumOfInitialPair * RATIO_FOR_AVERAGING;

  // Determine the smaller value between the fourth and fifth data points.
  // This uses the custom `determineMinimum` utility.
  const minimumOfFourthAndFifth = determineMinimum(fourthDataPoint, fifthDataPoint);

  // Apply the first conditional logic based on the comparison of the mean and the third data point.
  if (meanOfInitialPair > thirdDataPoint) {
    // If the mean is greater, a specific formula involving the third data point is applied.
    const productWithSpecialMultiplier = thirdDataPoint * SPECIAL_MULTIPLIER_FOR_THIRD;
    computedChargeAccumulator += productWithSpecialMultiplier * minimumOfFourthAndFifth;
  } else {
    // Otherwise, an alternative formula using the sum of the initial pair is used.
    computedChargeAccumulator += sumOfInitialPair * minimumOfFourthAndFifth;
  }

  // --- Second Pricing Rule Evaluation Block ---
  // This block calculates an additional component of the charge based on a different comparison.

  // Evaluate the relationship between the fourth and fifth data points using an expanded conditional structure.
  if (fourthDataPoint > fifthDataPoint) {
    // If the fourth data point is strictly larger.
    const differenceBetweenFourAndFive = fourthDataPoint - fifthDataPoint;
    computedChargeAccumulator += firstDataPoint * differenceBetweenFourAndFive;
  } else if (fifthDataPoint > fourthDataPoint) {
    // If the fifth data point is strictly larger (explicitly handled for clarity).
    const differenceBetweenFiveAndFour = fifthDataPoint - fourthDataPoint;
    computedChargeAccumulator += secondDataPoint * differenceBetweenFiveAndFour;
  } else {
    // If the fourth and fifth data points are equal, their difference is zero.
    // In this case, the contribution to the accumulator is zero, making this an effective no-op.
    // This 'else' branch is added for structural completeness, demonstrating a Type III modification.
    // computedChargeAccumulator += 0.0; // Explicitly adding zero, though mathematically redundant.
  }

  // Return the final calculated total charge after all rules have been applied.
  return computedChargeAccumulator;
}

// A slightly renamed helper to show variations
function extractDataPoint(inputString) {
    return extractNumericSegment(inputString);
}


// Application Entry Point and Execution Flow.
// This section handles reading input, invoking the main processing logic, and outputting the result.
try {
  // Read the entire content of standard input synchronously, assuming UTF-8 encoding.
  const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

  // Call the main function to process the input and obtain the final calculated value.
  const finalCalculatedValue = processFinancialData(standardInputContent);

  // Output the final computed charge to the console.
  // The original problem implies integer-like output, so direct logging is appropriate.
  console.log(finalCalculatedValue);
} catch (executionError) {
  // Catch and report any errors that occur during file reading or processing.
  console.error("An unexpected error occurred during program execution:", executionError.message);
  // Optionally, exit with a non-zero status code to indicate an error to the shell environment.
  // process.exit(1);
}