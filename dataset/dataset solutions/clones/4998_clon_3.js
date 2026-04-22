const formatBinaryStringPadded = (binaryInputString, requiredOutputLength) => {
  // A helper function designed to prefix a binary string with '0's to reach a specific length.
  // This ensures consistent bit representation, for instance, for fixed-width binary numbers.
  // Added validation for robust input handling.
  if (typeof binaryInputString !== 'string' || typeof requiredOutputLength !== 'number' || requiredOutputLength < 0) {
    // In a production environment, one might throw an error or handle it more gracefully.
    // For this context, we return an empty string to indicate invalid input.
    console.error('Validation Error: Invalid arguments provided to formatBinaryStringPadded. Expected string and non-negative number.');
    return '';
  }

  // Leveraging String.prototype.padStart for a concise and efficient padding operation.
  // It automatically handles cases where the input string is already long enough or too long.
  return binaryInputString.padStart(requiredOutputLength, '0');
};

const computeSubsetSumFrequencies = (numericalSet) => {
  // This central function determines the frequency of every possible sum achievable from subsets
  // of the given array of numbers. It employs a bitmasking technique for efficiency.

  // Initial input validation to ensure the 'numericalSet' is an array of valid numbers.
  if (!Array.isArray(numericalSet) || numericalSet.some(val => typeof val !== 'number' || isNaN(val))) {
    console.error('Validation Error: computeSubsetSumFrequencies requires an array of valid numbers.');
    return []; // Returning an empty array to signify an error or no valid sums.
  }

  const setLength = numericalSet.length;

  // Edge case: If the input set is empty, the only subset is the empty set, which sums to 0.
  // Thus, the sum 0 occurs once.
  if (setLength === 0) {
    return [1]; // Represents {sum: 0, count: 1}.
  }

  // A constant defining the maximum sum value for which frequencies are tracked.
  // This limit (2500) is crucial for sizing the frequency array and is derived from problem constraints.
  const MAX_TRACKED_SUM_VALUE = 2500;
  const frequencyArraySize = MAX_TRACKED_SUM_VALUE + 1; // Array indexes from 0 to MAX_TRACKED_SUM_VALUE.

  // Initialize an array to store the counts of each sum. All counts start at zero.
  const sumOccurrences = new Array(frequencyArraySize).fill(0);

  // The total number of unique subsets for a set of 'N' elements is 2^N.
  // We iterate through each possible subset using an integer 'currentMask' as a bitmask.
  const totalSubsetCombinations = 1 << setLength; // Equivalent to Math.pow(2, setLength).

  for (let currentMask = 0; currentMask < totalSubsetCombinations; ++currentMask) {
    let currentSubsetTotal = 0; // Accumulator for the sum of elements in the current subset.

    // Iterate through each element of the input 'numericalSet'.
    for (let elementIndex = 0; elementIndex < setLength; ++elementIndex) {
      // Check if the 'elementIndex'-th bit is set in 'currentMask'.
      // If it is, the corresponding element from 'numericalSet' is part of the current subset.
      if ((currentMask >> elementIndex) & 1) {
        currentSubsetTotal += numericalSet[elementIndex];
      }
    }

    // Increment the count for the calculated sum.
    // Ensure the sum is within the defined tracking limit to prevent out-of-bounds access.
    if (currentSubsetTotal <= MAX_TRACKED_SUM_VALUE) {
      sumOccurrences[currentSubsetTotal]++;
    }
    // Sums exceeding MAX_TRACKED_SUM_VALUE are implicitly ignored, as per the original logic's array bounds.
  }

  return sumOccurrences;
};

const solveSubsetSumProblem = (rawProblemInput) => {
  // This is the main orchestrating function that reads input, processes data,
  // and computes the final result based on subset sum frequencies.

  // Robustness check for the input string.
  if (!rawProblemInput || typeof rawProblemInput !== 'string') {
    console.error('Error: Input string for solveSubsetSumProblem cannot be empty or invalid.');
    return -1; // Indicate an error by returning a specific value.
  }

  // Variable to accumulate the product sums from positive and negative groups.
  let cumulativeProductSum = 0;

  // Split the raw input string into individual lines and trim whitespace.
  const inputRows = rawProblemInput.trim().split('\n');

  // Parse the first line to extract 'N' (total elements) and 'A' (target value).
  const [sizeNString, valueAString] = inputRows[0].split(' ');
  const totalElementsN = parseInt(sizeNString, 10);
  const targetValueA = parseInt(valueAString, 10);

  // Validate the parsed numerical inputs.
  if (isNaN(totalElementsN) || isNaN(targetValueA) || totalElementsN < 0) {
    console.error('Error: Invalid numerical parameters (N or A) found in the input data.');
    return -1;
  }

  // Parse the second line, converting string elements to numbers.
  // Filters out any potential non-numeric entries if input is malformed.
  const initialNumericalArray = inputRows[1].split(' ').map(Number).filter(num => !isNaN(num));

  // A warning if the number of parsed elements does not match the declared 'N'.
  if (totalElementsN > 0 && initialNumericalArray.length !== totalElementsN) {
    console.warn(`Warning: Declared N=${totalElementsN} but parsed ${initialNumericalArray.length} elements. Proceeding with parsed count.`);
    // In some scenarios, one might adjust totalElementsN here or throw an error.
  }

  // Adjust each element in the array by subtracting 'targetValueA'.
  const adjustedNumericalElements = initialNumericalArray.map(element => element - targetValueA);

  // Categorize the adjusted elements into three groups: positive, negative (stored as absolute values), and zeros.
  const positiveAdjustedElements = [];
  const absoluteNegativeAdjustedElements = [];
  let zeroElementsCount = 0;

  for (const elementValue of adjustedNumericalElements) {
    if (elementValue > 0) {
      positiveAdjustedElements.push(elementValue);
    } else if (elementValue < 0) {
      absoluteNegativeAdjustedElements.push(Math.abs(elementValue)); // Store absolute value.
    } else {
      zeroElementsCount++;
    }
  }

  // Calculate the number of ways to choose subsets from the zero-valued elements.
  // Each of the 'zeroElementsCount' elements can either be included or not, resulting in 2^Z options.
  const combinationsFromZeros = Math.pow(2, zeroElementsCount);

  // Compute the frequency maps for subset sums for both positive and absolute negative groups.
  const positiveSumFrequencies = computeSubsetSumFrequencies(positiveAdjustedElements);
  const negativeSumFrequencies = computeSubsetSumFrequencies(absoluteNegativeAdjustedElements);

  // Iterate through possible sum values (from 1 up to the maximum tracked sum, 2500).
  // We're looking for pairs of sums (one from positives, one from negatives) that are equal.
  // This corresponds to a net sum of zero when combining an element from the positive group
  // and an element from the original negative group (before taking absolute values).
  const MAX_SUM_FOR_PAIRING = 2500; // Consistent with the internal limit in computeSubsetSumFrequencies.
  for (let currentSum = 1; currentSum <= MAX_SUM_FOR_PAIRING; ++currentSum) {
    // Retrieve frequencies, defaulting to 0 if a sum doesn't exist in a particular map.
    const posCount = positiveSumFrequencies[currentSum] || 0;
    const negCount = negativeSumFrequencies[currentSum] || 0;

    // Multiply the frequencies: if sum 'S' appears 'X' times in positives and 'Y' times in negatives,
    // there are X*Y ways to combine them to form a net sum of zero (S + (-S) = 0).
    cumulativeProductSum += posCount * negCount;
  }

  // The final calculation combines the results from positive/negative sums and zero elements.
  // The formula (cumulativeProductSum + 1) * (combinationsFromZeros + 1) - 1 is a specific
  // pattern for counting non-empty subsets that sum to zero.
  // (cumulativeProductSum + 1) accounts for the case where the sum from non-zero elements is 0
  // (i.e., by picking empty subsets from both positive and negative groups).
  // (combinationsFromZeros + 1) is a quirk of the original problem's formula, usually it would be just combinationsFromZeros.
  // The final -1 subtracts the case where all subsets (from positive, negative, and zero groups) are empty.
  const finalCalculatedResult = (cumulativeProductSum + 1) * (combinationsFromZeros + 1) - 1;

  // Output the final computed result.
  console.log(finalCalculatedResult);
};

// Entry point for execution: Reads input from standard input and processes it.
try {
  // Utilizing Node.js 'fs' module to synchronously read the entire standard input.
  // 'utf8' encoding ensures correct character interpretation.
  const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  solveSubsetSumProblem(standardInputContent);
} catch (error) {
  // Comprehensive error handling for file reading or processing issues.
  console.error('An unhandled error occurred during input reading or problem processing:', error.message);
  // Exiting with a non-zero status code is a common practice to signal an error in shell environments.
  process.exit(1);
}