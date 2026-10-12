((inputData) => {
  const processedLines = inputData.trim().split('\n');
  const outputBuffer = [];

  for (const currentLine of processedLines) {
    const [countParam, sumParam] = currentLine.split(' ').map(Number);

    if (countParam === 0 && sumParam === 0) {
      break;
    }

    outputBuffer.push(calculateCombinations(countParam, sumParam));
  }

  console.log(outputBuffer.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function calculateCombinations(numDigits, targetSum) {
  // Maximum possible digit is 9.
  const MAX_DIGIT_VALUE = 9;
  // Maximum number of distinct digits (0-9) is 10.
  const MAX_NUM_DIGITS = 10;
  // Maximum possible sum for 10 distinct digits (0+1+...+9) is 45.
  const MAX_POSSIBLE_SUM = 45;

  // Early exit for impossible scenarios, though DP handles many implicitly.
  if (numDigits > MAX_NUM_DIGITS || targetSum < 0 || targetSum > MAX_POSSIBLE_SUM) {
    return 0;
  }
  // If 0 digits are requested, sum must be 0 for 1 valid combination.
  if (numDigits === 0) {
    return targetSum === 0 ? 1 : 0;
  }

  // dpTable[digit_index][num_chosen][current_sum]
  // digit_index: Represents the smallest digit currently allowed to be chosen.
  //              Ranges from 0 to MAX_DIGIT_VALUE (9), plus an extra index (10)
  //              to represent "no more digits available" for recursion base.
  // num_chosen: The number of digits remaining to choose. Ranges from 0 to numDigits.
  // current_sum: The remaining sum to achieve. Ranges from 0 to targetSum.
  const dpTable = Array(MAX_DIGIT_VALUE + 2).fill(0).map(() => // +2 for indices 0-10 (11 total)
    Array(numDigits + 1).fill(0).map(() =>
      Array(targetSum + 1).fill(0)
    )
  );

  // Base case: If 0 digits are chosen, and the current_sum is 0, there is 1 way to achieve this.
  // This holds true regardless of which digit_index we are "considering" (from 0 to MAX_DIGIT_VALUE + 1).
  for (let d = 0; d <= MAX_DIGIT_VALUE + 1; d++) {
    dpTable[d][0][0] = 1;
  }

  // Iterate from the largest possible digit (9) down to 0.
  // This ensures that when we calculate dpTable[currentDigit],
  // dpTable[currentDigit + 1] (representing combinations using only larger digits) is already computed.
  for (let currentDigit = MAX_DIGIT_VALUE; currentDigit >= 0; currentDigit--) {
    // Iterate the number of digits to choose, from 1 up to the requested numDigits.
    for (let k = 1; k <= numDigits; k++) {
      // Iterate the target sum, from 0 up to the requested targetSum.
      for (let currentS = 0; currentS <= targetSum; currentS++) {

        // Option 1: Do NOT include the 'currentDigit' in the combination.
        // In this case, we need to choose 'k' digits from the set of digits
        // strictly greater than 'currentDigit' (represented by dpTable[currentDigit + 1]).
        let waysWithoutCurrent = dpTable[currentDigit + 1][k][currentS];

        // Option 2: DO include the 'currentDigit' in the combination.
        let waysWithCurrent = 0;
        // Check if including 'currentDigit' is possible (i.e., remaining sum is non-negative).
        if (currentS - currentDigit >= 0) {
          // If we include 'currentDigit', we now need to choose (k-1) more digits
          // from the set of digits strictly greater than 'currentDigit' (dpTable[currentDigit + 1]),
          // to sum up to (currentS - currentDigit).
          waysWithCurrent = dpTable[currentDigit + 1][k - 1][currentS - currentDigit];
        }

        // The total number of ways for the current state is the sum of these two options.
        dpTable[currentDigit][k][currentS] = waysWithoutCurrent + waysWithCurrent;
      }
    }
  }

  // The final answer is the number of ways to choose 'numDigits' digits from the set {0, 1, ..., 9}
  // (represented by dpTable[0]) that sum up to 'targetSum'.
  return dpTable[0][numDigits][targetSum];
}
