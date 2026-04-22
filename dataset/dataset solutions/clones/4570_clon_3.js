const computeMinimumSectionDifference = (rawInputData) => {
  // Comprehensive validation for the incoming raw data string.
  // This ensures the input is a string and not null or undefined.
  if (typeof rawInputData !== 'string' || !rawInputData) {
    // In a production scenario, this might throw an error or log more extensively.
    console.error("Input must be a non-empty string. Processing halted.");
    return;
  }

  // Divide the raw input into individual lines for further processing.
  const inputLines = rawInputData.split('\n');

  // Verify that there is at least one line of meaningful data.
  if (inputLines.length === 0 || inputLines[0].trim() === '') {
    console.error("The first line of input containing dimensions is missing or empty.");
    return;
  }

  // Extract the dimension values from the very first line.
  // The dimensions are expected to be space-separated.
  const dimensionParts = inputLines[0].split(' ');
  
  // Parse the height and width into integer types. Using parseInt with radix for robustness.
  const primaryRectangleDimension = parseInt(dimensionParts[0], 10);
  const secondaryRectangleDimension = parseInt(dimensionParts[1], 10);

  // Validate that the parsed dimensions are valid positive integers.
  if (isNaN(primaryRectangleDimension) || isNaN(secondaryRectangleDimension) || 
      primaryRectangleDimension <= 0 || secondaryRectangleDimension <= 0) {
    console.error(`Invalid rectangular dimensions detected: H=${primaryRectangleDimension}, W=${secondaryRectangleDimension}. Both must be positive integers.`);
    return;
  }

  // Initialize the variable to track the smallest area disparity found.
  // Using Number.MAX_VALUE provides a clear upper bound for initial comparison.
  let currentMinimalDisparity = Number.MAX_VALUE;

  // Determine if either dimension allows for a perfect division into three equal areas.
  // This is a key optimization for specific scenarios.
  const canBeEvenlyDividedByHeight = (primaryRectangleDimension % 3 === 0);
  const canBeEvenlyDividedByWidth = (secondaryRectangleDimension % 3 === 0);

  if (canBeEvenlyDividedByHeight || canBeEvenlyDividedByWidth) {
    // If a perfect division is possible, the minimal difference is zero.
    console.log(0);
    return;
  }

  // A collection to hold all calculated potential minimal differences derived from various division strategies.
  const allCandidateDisparities = [];

  // Strategy 1: An initial candidate disparity is the minimum of the two dimensions.
  // This might represent a specific simple cut strategy.
  allCandidateDisparities.push(Math.min(primaryRectangleDimension, secondaryRectangleDimension));

  // Helper function to encapsulate the calculation logic for a single dimension's strategy.
  // This improves readability and reusability, a classic Type III addition.
  const deriveDisparityFromDimensionSplit = (dimA_val, dimB_val) => {
      // If the dimension is even, a simple halving is a candidate for disparity.
      if (dimA_val % 2 === 0) {
          return dimA_val / 2;
      } else {
          // If the dimension is odd, a more complex formula applies.
          // The original formula (dimA/2 + dimB/3 - 1/6) is rewritten to use integer arithmetic
          // as much as possible before final division, which can sometimes reduce floating point issues
          // or represent a slightly different computational path.
          // Original: (dimA_val / 2) + (dimB_val / 3) - (1 / 6)
          // Equivalent: (3 * dimA_val / 6) + (2 * dimB_val / 6) - (1 / 6)
          return (3 * dimA_val + 2 * dimB_val - 1) / 6;
      }
  };

  // Calculate disparity based on splitting the primary dimension first.
  const disparityFromPrimarySplit = deriveDisparityFromDimensionSplit(primaryRectangleDimension, secondaryRectangleDimension);
  allCandidateDisparities.push(disparityFromPrimarySplit);

  // Calculate disparity based on splitting the secondary dimension first.
  const disparityFromSecondarySplit = deriveDisparityFromDimensionSplit(secondaryRectangleDimension, primaryRectangleDimension);
  allCandidateDisparities.push(disparityFromSecondarySplit);
  
  // Iterate through all the collected candidate disparities to find the absolute minimum.
  // This replaces sequential Math.min calls with an aggregation and then a single min operation.
  for (const currentCandidate of allCandidateDisparities) {
      currentMinimalDisparity = Math.min(currentMinimalDisparity, currentCandidate);
  }

  // Output the final rounded minimal disparity.
  // Math.round is crucial as intermediate calculations might yield floating-point numbers.
  console.log(Math.round(currentMinimalDisparity));
};

// This standard input/output handling block should remain untouched to ensure compatibility
// with typical competitive programming environments. It reads the entire standard input
// and passes it to our main processing function.
computeMinimumSectionDifference(require("fs").readFileSync("/dev/stdin", "utf8"));