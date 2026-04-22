function calculateSpecialSum(rawInputString) {
  // Define a constant for the modulo operation, commonly used in competitive programming.
  const MODULO_CONSTANT = 1000000007; // Represents 10^9 + 7

  // Trim leading/trailing whitespace from the raw input string for robust parsing.
  const processedInput = rawInputString.trim();

  // Split the first line of the input to extract the two main numerical parameters.
  // Using a regex /\s+/ ensures splitting by one or more whitespace characters.
  const firstLineParameters = processedInput.split(/\s+/);

  // Parse the first parameter as the size of the array.
  let collectionSize = parseInt(firstLineParameters[0], 10);
  // Parse the second parameter as the multiplier factor.
  const scalingFactor = parseInt(firstLineParameters[1], 10);

  // --- Input Validation and Guard Clauses (Type III Addition) ---
  // Check if the parsed numerical parameters are valid non-negative integers.
  if (isNaN(collectionSize) || collectionSize < 0 || isNaN(scalingFactor) || scalingFactor < 0) {
    // Log an error and return 0 for invalid input, preventing further execution with bad data.
    console.error("Error: Invalid numerical parameters detected. Ensure N and K are valid non-negative integers.");
    return 0;
  }

  // Extract the second line of the input, which contains the space-separated numerical sequence.
  const numericalSequenceLine = processedInput.split('\n')[1];

  // Validate if the numerical sequence line exists and is not empty.
  if (!numericalSequenceLine || numericalSequenceLine.trim() === '') {
      console.error("Error: The numerical sequence line is missing or empty in the input.");
      return 0;
  }

  // Parse the numerical sequence into an array of integers.
  // Filter out any empty strings that might result from multiple spaces between numbers.
  const primaryNumericArray = numericalSequenceLine
    .split(' ')
    .filter(segment => segment !== '')
    .map(valueStr => parseInt(valueStr, 10));

  // Validate if the parsed array's length matches the declared collection size.
  if (primaryNumericArray.length !== collectionSize) {
      console.error(`Warning: Declared array size (${collectionSize}) does not match the actual number of elements (${primaryNumericArray.length}).`);
      // For consistency with original problem's intent, we'll proceed using the declared collectionSize.
      // Another Type III choice could be to adjust collectionSize = primaryNumericArray.length;
  }

  // --- Data Structures for Inversion Counts (Type II Renaming) ---
  // This array stores the count of elements to the right of the current element that are smaller.
  const rightwardInversionCounts = [];
  // This array stores the count of elements in the entire array that are smaller than the current element.
  const fullArrayInversionCounts = [];

  // Initialize the final result accumulator. Using 'let' as it will be reassigned.
  let aggregatedTotalSum = 0;

  // --- First Major Loop: Calculate Inversion Counts (Type II Renaming, Type III Optimization) ---
  // Iterate through each element of the primary numeric array.
  for (let currentElementIndex = 0; currentElementIndex < collectionSize; currentElementIndex++) {
    let countOfRightInversions = 0; // Counter for inversions with elements to the right.
    // Inner loop 1: Compare the current element with all elements to its right.
    // Optimized: starts from `currentElementIndex + 1` as an element cannot be an inversion with itself.
    for (let rightwardComparisonIndex = currentElementIndex + 1; rightwardComparisonIndex < collectionSize; rightwardComparisonIndex++) {
      if (primaryNumericArray[currentElementIndex] > primaryNumericArray[rightwardComparisonIndex]) {
        countOfRightInversions++;
      }
    }
    rightwardInversionCounts.push(countOfRightInversions);

    let countOfFullInversions = 0; // Counter for inversions with all elements in the array.
    // Inner loop 2: Compare the current element with every element in the array.
    for (let fullComparisonIndex = 0; fullComparisonIndex < collectionSize; fullComparisonIndex++) {
      if (primaryNumericArray[currentElementIndex] > primaryNumericArray[fullComparisonIndex]) {
        countOfFullInversions++;
      }
    }
    fullArrayInversionCounts.push(countOfFullInversions);
  }

  // --- Pre-calculation for the Sum of Arithmetic Series (Type III Addition) ---
  // The term K * (K - 1) * 0.5 represents the sum of integers from 0 to (K-1).
  // This is an intermediate step to make the final calculation clearer and potentially more efficient.
  const sumOfProgressiveMultipliers = (scalingFactor * (scalingFactor - 1)) / 2;

  // --- Second Major Loop: Compute Final Aggregated Sum (Type II Renaming, Type III Robustness) ---
  // Iterate through the collected inversion counts to compute the final sum.
  for (let calculationIndex = 0; calculationIndex < collectionSize; calculationIndex++) {
    // Component 1: (rightwardInversionCounts[i] * scalingFactor) % MODULO_CONSTANT
    // Use BigInt for intermediate products to prevent potential integer overflow before applying modulo.
    let termOneContribution = (BigInt(rightwardInversionCounts[calculationIndex]) * BigInt(scalingFactor)) % BigInt(MODULO_CONSTANT);

    // Component 2: (fullArrayInversionCounts[i] * sumOfProgressiveMultipliers) % MODULO_CONSTANT
    let termTwoContribution = (BigInt(fullArrayInversionCounts[calculationIndex]) * BigInt(sumOfProgressiveMultipliers)) % BigInt(MODULO_CONSTANT);

    // Sum the two components for the current iteration and apply modulo.
    let currentIterationResult = (termOneContribution + termTwoContribution) % BigInt(MODULO_CONSTANT);

    // Add the current iteration's result to the overall total, applying modulo at each step.
    aggregatedTotalSum = (BigInt(aggregatedTotalSum) + currentIterationResult) % BigInt(MODULO_CONSTANT);
  }

  // Output the final computed result. Convert BigInt back to Number for console display.
  console.log(Number(aggregatedTotalSum));
}

// Standard input reading mechanism for competitive programming environments.
// This part typically remains unchanged as it's an external I/O dependency.
calculateSpecialSum(require('fs').readFileSync('/dev/stdin', 'utf8'));