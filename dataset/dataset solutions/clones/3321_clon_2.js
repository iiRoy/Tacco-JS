console.log(
  (function(inputStr) {
    // This function processes input to calculate a specific probability using dynamic programming.

    // First, the raw input string is prepared.
    // It's trimmed, then split into individual lines.
    // Each line is subsequently split by spaces to form an array of string arrays.
    const parsedLines = inputStr.trim().split('\n').map(
      (rowStr) => rowStr.split(' ')
    );

    // The total number of elements (N) is extracted from the first line of the processed input.
    // The bitwise OR with zero (`| 0`) is used for efficient string-to-integer conversion.
    const numElements = parsedLines.shift()[0] | 0;

    // The individual success probabilities (p) are parsed from the next line.
    // `parseFloat` converts each string probability into a floating-point number.
    const probabilities = parsedLines[0].map(parseFloat);

    // A 2D array, which serves as our dynamic programming table, is initialized.
    // It has `numElements` rows and `numElements + 1` columns.
    // All cells are initially filled with the floating-point value zero.
    const dynamicProg = Array(numElements).fill(0).map(
      (_) => Array(numElements + 1).fill(0.0)
    );

    // Establish the base cases for the dynamic programming calculation.
    // For the very first element (index 0):
    // `dynamicProg[0][0]` stores the probability of having 0 successes.
    dynamicProg[0][0] = 1.0 - probabilities[0];
    // `dynamicProg[0][1]` stores the probability of having 1 success.
    dynamicProg[0][1] = probabilities[0];

    // Iterate through the elements to populate the dynamic programming table.
    // The outer loop progresses from the first element up to the second-to-last element.
    for (let idxOuter = 0; idxOuter < numElements - 1; idxOuter++) {
      // The inner loop considers all possible counts of successes up to the current element (`idxOuter`).
      for (let idxInner = 0; idxInner <= idxOuter + 1; idxInner++) {
        // Calculate the probability of achieving one more success with the next element (`idxOuter + 1`).
        // This is added to the cell representing `idxOuter + 1` elements and `idxInner + 1` successes.
        dynamicProg[idxOuter + 1][idxInner + 1] += dynamicProg[idxOuter][idxInner] * probabilities[idxOuter + 1];

        // Calculate the probability of maintaining the same number of successes with the next element.
        // This is added to the cell representing `idxOuter + 1` elements and `idxInner` successes.
        dynamicProg[idxOuter + 1][idxInner] += dynamicProg[idxOuter][idxInner] * (1.0 - probabilities[idxOuter + 1]);
      }
    }

    // Finally, compute the desired result based on the completed DP table.
    // We take the last row of the `dynamicProg` table.
    // Then, we slice it from the index representing more than half of the total elements.
    // The `reduce` method sums all the probabilities in the sliced portion.
    // The final sum is converted to a string before being returned.
    return dynamicProg[numElements - 1]
      .slice((numElements + 1) / 2)
      .reduce((accumulator, currentVal) => accumulator + currentVal)
      .toString();
  })(require('fs').readFileSync('/dev/stdin', 'utf8'))
);
