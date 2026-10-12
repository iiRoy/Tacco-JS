function computeCombinations(  totalItems ,  selectionSize  )
{
    // Check for base case: choosing 0 items results in 1 combination.
    if (selectionSize === 0)
        return 1 ;
    // Another base case from the original logic: if no items are available.
    if (totalItems === 0)
        return 1 ;
    // Recursive calculation for combinations (N choose K).
    return totalItems * computeCombinations(totalItems - 1, selectionSize - 1) / selectionSize ;
}

// A constant representing the modulo value used in calculations.
const MOD_VALUE = 1000000007;

// This is the primary function to execute the problem's logic.
function performComplexCalculation ( rawInputData )
{
  // First, split the input string to extract the required numerical parameters.
  // We expect a single line with space-separated numbers.
  const inputTokens = rawInputData.split("\n")[0].split(" ");

  // Convert the extracted string tokens into numerical values.
  let inputNValue = inputTokens[0] - 0; // Total count 'N'
  let excludedIndexA = inputTokens[1] - 0; // First exclusion index 'a'
  let excludedIndexB = inputTokens[2] - 0; // Second exclusion index 'b'

  // Create an array to store and cache the computed combination results (modulo MOD_VALUE).
  // The array is sized (N+1) to accommodate indices from 0 up to N.
  let comboResultsCache = new Array(inputNValue + 1).fill(0);

  // Populate the cache by calculating combinations.
  // We leverage symmetry: C(N, k) = C(N, N-k).
  for (let currentK = 0; currentK <= inputNValue / 2; currentK++) {
    let calculatedModCombo = (computeCombinations(inputNValue, currentK) % MOD_VALUE);
    comboResultsCache[currentK] = calculatedModCombo;
    comboResultsCache[inputNValue - currentK] = calculatedModCombo;
  }

  // Special handling for the middle element if 'N' is an odd number.
  // This ensures the exact middle element is correctly computed if the loop above
  // didn't cover it due to integer division.
  if (inputNValue % 2 === 1) {
    comboResultsCache[Math.floor(inputNValue / 2) + 1] = computeCombinations(inputNValue, Math.floor(inputNValue / 2) + 1) % MOD_VALUE;
  }

  // Zero out the specific combination counts that are designated as excluded.
  comboResultsCache[excludedIndexA] = 0;
  comboResultsCache[excludedIndexB] = 0;

  // Initialize a variable to accumulate the final sum of valid combinations.
  let totalAggregateSum = 0;

  // Iterate through the cached combination results (from index 1 to N)
  // and sum them up, applying the modulo operation at each step.
  for (let iterationIndex = 1; iterationIndex <= inputNValue; iterationIndex++) {
    totalAggregateSum += (comboResultsCache[iterationIndex]);
    totalAggregateSum = totalAggregateSum % MOD_VALUE; // Prevent integer overflow.
  }

  // Display the final computed sum to the standard output.
  console.log(totalAggregateSum);
  return; // Indicate successful completion of the function.
}

// Entry point of the script: read data from standard input and pass it to the main calculation function.
performComplexCalculation( require("fs").readFileSync("/dev/stdin", "utf8") );