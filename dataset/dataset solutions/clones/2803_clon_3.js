// Function to compute the maximum possible taste score from a sequence of apple flavors.
function calculateTasteScore(rawInputData) {
  // Parse the input string into numerical components, assuming space-separated values.
  const parsedTokens = rawInputData.split(" ");

  // Input validation: Ensure the expected number of parameters are present.
  if (parsedTokens.length < 2) {
    console.error("Error: Not enough input parameters. Expected N (apple count) and L (initial flavor).");
    return; // Exit if input is malformed.
  }

  // Extract and convert the string tokens into integer values.
  // The first token represents the total number of apples (N).
  const totalAppleCount = parseInt(parsedTokens[0], 10);
  // The second token represents the starting flavor value (L).
  const startingFlavorValue = parseInt(parsedTokens[1], 10);

  // Robustness check: Verify that the parsed values are indeed numbers.
  if (isNaN(totalAppleCount) || isNaN(startingFlavorValue)) {
    console.error("Error: Invalid numeric input detected for apple count or initial flavor.");
    return; // Exit if parsing failed.
  }

  // Domain validation: The number of apples must be a positive integer.
  if (totalAppleCount <= 0) {
    console.error("Error: The total number of apples must be a positive integer greater than zero.");
    return; // Exit if apple count is non-positive.
  }

  // Determine the range of flavors. The sequence is L, L+1, ..., L+(N-1).
  // The flavor of the first apple in the sequence.
  const firstFlavorInSeries = startingFlavorValue;
  // The flavor of the last apple in the sequence.
  const lastFlavorInSeries = startingFlavorValue + totalAppleCount - 1;

  // Calculate the aggregate sum of all N flavors available.
  // This is the sum of an arithmetic progression: (first + last) * count / 2.
  const sumOfAllAvailableFlavors = (firstFlavorInSeries + lastFlavorInSeries) * totalAppleCount / 2;

  // A variable to store the flavor of the apple that will be excluded.
  // The goal is to maximize the remaining sum, so we exclude the flavor closest to zero.
  let flavorToExcludeFromSum = 0;

  // Logic to identify the apple flavor to be excluded:
  // Condition 1: Check if a zero-flavored apple exists within the sequence [L, L+N-1].
  // If 0 is present, removing it has no impact on the sum, making it the optimal choice for removal.
  if (firstFlavorInSeries <= 0 && 0 <= lastFlavorInSeries) {
    flavorToExcludeFromSum = 0; // Remove the neutral-flavored apple.
  }
  // Condition 2: If all apple flavors are negative (i.e., the last flavor is less than 0).
  // To maximize the sum, we must remove the "least negative" apple (the one closest to zero).
  // In a sequence of negative numbers, this is the largest value (e.g., -5 is larger than -10).
  // For L, L+1, ..., L+N-1, the largest value is L+N-1.
  else if (lastFlavorInSeries < 0) {
    flavorToExcludeFromSum = lastFlavorInSeries; // Remove the least negative apple.
  }
  // Condition 3: If none of the above conditions are met, it implies all apple flavors are positive.
  // (i.e., the first flavor L must be greater than 0).
  // To maximize the sum, we must remove the "least positive" apple (the one closest to zero).
  // In a sequence of positive numbers, this is the smallest value.
  // For L, L+1, ..., L+N-1, the smallest value is L.
  else { // This branch is reached when firstFlavorInSeries > 0.
    flavorToExcludeFromSum = firstFlavorInSeries; // Remove the smallest positive apple.
  }

  // Compute the final maximum taste score by subtracting the chosen excluded flavor.
  const finalMaximumScore = sumOfAllAvailableFlavors - flavorToExcludeFromSum;

  // Output the computed maximum taste score to the console.
  console.log(finalMaximumScore);
}

// Entry point for execution: Reads input from standard input and processes it.
// This section is typically environment-specific and is kept functionally similar.
(function() {
  // Read the entire content from standard input, assuming UTF-8 encoding.
  const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  // Pass the trimmed input content to the main calculation function.
  // Trimming helps in handling potential trailing newline characters.
  calculateTasteScore(inputContent.trim());
})();