'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Processes the input string to calculate a specific combination sum.
 * @param {string} rawData The raw input string, typically from standard input.
 */
function processInputData(rawData) {
  // Split the entire input string by newline characters into an array of lines.
  rawData = rawData.split('\n');

  // The first line contains a number, which is stored but not used in the calculation.
  const totalCount = Number(rawData[0]);

  // Extract the names from the input, excluding the first line (count) and the last (empty or EOF).
  const itemNames = rawData.slice(1, -1);

  // Initialize an array to store counts for specific starting letters: M, A, R, C, H.
  // The order corresponds to the letters: M=0, A=1, R=2, C=3, H=4.
  const initialCounts = [0, 0, 0, 0, 0];

  // Iterate through each name to count occurrences based on the first letter.
  for (const currentName of itemNames) {
    // Check the first character of the current name.
    const firstChar = currentName.charAt(0);

    // Increment the corresponding counter in the initialCounts array.
    if (firstChar === 'M') {
      initialCounts[0]++;
    }
    if (firstChar === 'A') {
      initialCounts[1]++;
    }
    if (firstChar === 'R') {
      initialCounts[2]++;
    }
    if (firstChar === 'C') {
      initialCounts[3]++;
    }
    if (firstChar === 'H') {
      initialCounts[4]++;
    }
  }

  // Initialize a variable to accumulate the final sum of products.
  let finalResult = 0;

  /**
   * Recursive function to calculate combinations of three counts from initialCounts.
   * @param {number} currentIndex The current index in the initialCounts array to consider.
   * @param {number[]} currentProductList An array storing the counts selected for the current combination.
   */
  const calculateCombinations = (currentIndex, currentProductList) => {
    // Base case: If all five possible indices have been considered.
    if (currentIndex === 5) {
      // If exactly three counts have been selected for this combination.
      if (currentProductList.length === 3) {
        // Calculate the product of the three selected counts and add it to the final result.
        finalResult += currentProductList.reduce((accumulator, currentValue) => accumulator * currentValue);
      }
      return; // End of this recursive branch.
    }

    // Recursive step 1: Include the count at the current index in the combination.
    calculateCombinations(currentIndex + 1, [...currentProductList, initialCounts[currentIndex]]);

    // Recursive step 2: Exclude the count at the current index from the combination.
    calculateCombinations(currentIndex + 1, currentProductList);

    return; // Explicit return for clarity.
  };

  // Start the combination calculation from the first index (0) with an empty product list.
  calculateCombinations(0, []);

  // Output the final calculated sum to the console.
  console.log(finalResult);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
