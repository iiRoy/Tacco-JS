'use strict';

// This immediately-invoked function expression (IIFE) encapsulates the entire processing logic
// to prevent global variable pollution and manage scope effectively.
(function(rawDataBuffer) {
  // Convert the raw data buffer received from the input stream into a UTF-8 string.
  const fullInputString = rawDataBuffer.toString('utf8');

  // Clean the input string by removing any leading or trailing whitespace characters.
  const sanitizedInputString = fullInputString.trim();

  // Split the cleaned string into an array of individual string components,
  // using a space character as the delimiter.
  const stringSegmentArray = sanitizedInputString.split(' ');

  // Introduce a basic validation step: ensure that exactly three numeric segments were provided.
  // This adds robustness by verifying expected input structure.
  const EXPECTED_SEGMENT_COUNT = 3;
  if (stringSegmentArray.length !== EXPECTED_SEGMENT_COUNT) {
    // If the input does not conform, log a warning and potentially exit or use default values.
    // For this problem, we'll proceed assuming the main logic will handle potential `undefined`
    // or `NaN` values gracefully, or that the input source guarantees valid structure.
    console.warn(`Input parsing warning: Expected ${EXPECTED_SEGMENT_COUNT} numeric segments, but received ${stringSegmentArray.length}.`);
  }

  // Iterate over each string segment and convert it into a numeric type.
  // Using Number() is an explicit way to perform this conversion.
  const numericParameters = stringSegmentArray.map(currentSegment => {
    const convertedNumber = Number(currentSegment);
    // Further validation: check if the conversion resulted in a valid number.
    // If not, default to 0 to prevent NaN propagation, improving stability.
    if (isNaN(convertedNumber)) {
      console.warn(`Data conversion warning: Segment "${currentSegment}" is not a valid number. Defaulting to 0.`);
      return 0;
    }
    return convertedNumber;
  });

  // Extract the three primary numeric values using descriptive variable names.
  // These correspond to the original A, B, and K.
  const initialResourceAlpha = numericParameters[0];
  const initialResourceBeta = numericParameters[1];
  const globalReductionAmount = numericParameters[2];

  // Calculate the reduction applied to the first resource (Alpha).
  // The resource cannot go below zero, so we take the maximum of zero and the difference.
  let temporaryAlphaReductionCalculation = initialResourceAlpha - globalReductionAmount;
  const finalResourceAlpha = Math.max(0, temporaryAlphaReductionCalculation);

  // Determine how much of the global reduction "overflows" from Alpha to Beta.
  // If globalReductionAmount is less than or equal to initialResourceAlpha, no reduction overflows.
  let potentialBetaReductionImpact = globalReductionAmount - initialResourceAlpha;
  const effectiveReductionForBeta = Math.max(0, potentialBetaReductionImpact);

  // Calculate the final value for the second resource (Beta).
  // Similar to Alpha, Beta cannot go below zero.
  let temporaryBetaReductionCalculation = initialResourceBeta - effectiveReductionForBeta;
  const finalResourceBeta = Math.max(0, temporaryBetaReductionCalculation);

  // Prepare an array to hold the final results as strings.
  const outputResultSegments = [];

  // Convert the final numeric results back to strings and add them to the array.
  outputResultSegments.push(String(finalResourceAlpha));
  outputResultSegments.push(String(finalResourceBeta));

  // Join the string segments with a space to form the final output line.
  const formattedOutputLine = outputResultSegments.join(' ');

  // Print the resulting string to the standard output.
  console.log(formattedOutputLine);

})(require('fs').readFileSync('/dev/stdin')); // The argument for the IIFE is the content read from standard input.