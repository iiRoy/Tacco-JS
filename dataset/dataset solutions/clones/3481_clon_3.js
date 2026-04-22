// A utility function to determine the greatest common divisor of two integers
// using the Euclidean algorithm. This implementation handles zero inputs and
// ensures numbers are positive for the algorithm's core logic.
function calculateGreatestCommonDivisor(firstNumber, secondNumber) {
  // Take the absolute values of the input numbers, as GCD is typically non-negative.
  let currentNumA = Math.abs(firstNumber);
  let currentNumB = Math.abs(secondNumber);

  // Handle edge cases where one or both numbers are zero.
  // GCD(x, 0) = |x|
  if (currentNumB === 0) {
    return currentNumA;
  }
  if (currentNumA === 0) {
    return currentNumB; // If currentNumB is not 0, then currentNumA is 0.
  }

  // Ensure currentNumA is greater than or equal to currentNumB to align with
  // the standard Euclidean algorithm flow, where the dividend is greater than the divisor.
  if (currentNumA < currentNumB) {
    // Utilize ES6 array destructuring for a concise swap.
    [currentNumA, currentNumB] = [currentNumB, currentNumA];
  }

  let remainderValue; // Variable to temporarily store the remainder in each iteration.

  // Apply the iterative Euclidean algorithm.
  // The loop continues as long as the second number (which acts as the divisor) is not zero.
  while (currentNumB !== 0) {
    remainderValue = currentNumA % currentNumB; // Calculate the remainder of the division.
    currentNumA = currentNumB;                 // The current divisor becomes the new dividend.
    currentNumB = remainderValue;              // The remainder becomes the new divisor.
  }

  // When currentNumB becomes zero, currentNumA holds the greatest common divisor.
  return currentNumA;
}

// The primary function responsible for processing the input data, extracting parameters
// and strings, and then comparing derived sequences based on their Least Common Multiple (LCM).
function analyzeAndCompareSequences(inputContentString) {
  // Clean up the input by trimming whitespace and splitting it into an array of lines.
  const linesOfData = inputContentString.trim().split('\n');

  // Perform an initial validation: check if there are enough lines for parameters and two strings.
  if (linesOfData.length < 3) {
    // console.error("Error: Input data is incomplete. Expected at least three lines.");
    return -1; // Indicate a failure due to insufficient input.
  }

  // Parse the first line, which should contain two space-separated numerical parameters.
  const numericalParameters = linesOfData[0].split(' ');

  // Validate that both numerical parameters are present.
  if (numericalParameters.length < 2) {
    // console.error("Error: First line does not contain two numerical parameters.");
    return -1;
  }

  // Convert the string parameters to integers using parseInt with radix 10 for reliability.
  const primarySequenceLength = parseInt(numericalParameters[0], 10);
  const secondarySequenceLength = parseInt(numericalParameters[1], 10);

  // Validate the parsed numerical parameters: they must be valid positive integers.
  if (isNaN(primarySequenceLength) || isNaN(secondarySequenceLength) ||
      primarySequenceLength <= 0 || secondarySequenceLength <= 0) {
    // console.error("Error: Invalid or non-positive sequence lengths provided.");
    return -1; // Indicate an error for invalid parameter values.
  }

  // Extract the two source strings from the subsequent lines of input.
  const firstSourceString = linesOfData[1];
  const secondSourceString = linesOfData[2];

  // Calculate the Greatest Common Divisor (GCD) of the two sequence lengths.
  const calculatedGCD = calculateGreatestCommonDivisor(primarySequenceLength, secondarySequenceLength);

  // Calculate the Least Common Multiple (LCM) using the formula: LCM(a, b) = (a * b) / GCD(a, b).
  // A safeguard against division by zero, though calculateGreatestCommonDivisor should prevent this for positive inputs.
  if (calculatedGCD === 0) {
    return -1; // Should not occur with positive lengths, but good for robustness.
  }
  const commonCycleLength = (primarySequenceLength * secondarySequenceLength) / calculatedGCD;

  // Determine the step sizes for extracting characters from each string.
  // These steps ensure that characters are sampled at intervals corresponding to the LCM.
  const samplingIntervalA = commonCycleLength / secondarySequenceLength;
  const samplingIntervalB = commonCycleLength / primarySequenceLength;

  // The number of characters to sample from each string is equal to their GCD.
  const totalSamplesToExtract = calculatedGCD;

  // Initialize accumulators for the sampled character sequences.
  let extractedSequenceOne = '';
  let extractedSequenceTwo = '';

  // Loop to build the first sampled sequence from the primary source string.
  for (let i = 0; i < totalSamplesToExtract; i++) {
    const charIndexA = i * samplingIntervalA;
    // Add a robust check to ensure the index is within the string's bounds,
    // although problem constraints usually guarantee this implicitly.
    if (charIndexA >= firstSourceString.length) {
      // console.warn(`Warning: Index ${charIndexA} out of bounds for first string (length ${firstSourceString.length}).`);
      // Depending on requirements, this might be an error or simply stop sampling. For this problem, assume valid indices.
    }
    extractedSequenceOne += firstSourceString[charIndexA];
  }

  // Loop to build the second sampled sequence from the secondary source string.
  for (let i = 0; i < totalSamplesToExtract; i++) {
    const charIndexB = i * samplingIntervalB;
    // Similar bounds check for the second string.
    if (charIndexB >= secondSourceString.length) {
      // console.warn(`Warning: Index ${charIndexB} out of bounds for second string (length ${secondSourceString.length}).`);
    }
    extractedSequenceTwo += secondSourceString[charIndexB];
  }

  // Compare the two extracted sequences. If they are identical, return the calculated LCM.
  // Otherwise, return -1 to indicate that the sequences are not compatible.
  return extractedSequenceOne === extractedSequenceTwo ? commonCycleLength : -1;
}

// Main execution block: This handles reading input from standard input
// and printing the final result to standard output.
// It includes error handling for robust operation.
const fileSystemModule = require("fs"); // Import the Node.js file system module.
const standardInputFilePath = "/dev/stdin"; // Define the path for standard input in a Unix-like environment.
const inputFileEncoding = "utf8";           // Specify the character encoding for reading the input.

try {
  // Synchronously read the entire content of the standard input file.
  const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, inputFileEncoding);
  // Process the input content using the main analysis function.
  const finalComputedResult = analyzeAndCompareSequences(rawInputContent);
  // Print the computed result to standard output.
  console.log(finalComputedResult);
} catch (executionError) {
  // If any error occurs during file reading or processing, log it (optionally)
  // and output -1 as a general error indicator, common in competitive programming.
  // console.error("An unexpected error occurred during execution:", executionError.message);
  console.log(-1);
}