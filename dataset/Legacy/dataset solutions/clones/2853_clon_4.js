"use strict";

(function () {
  const calculateMinimumSum = (sourceData) => {
    const firstLineContent = sourceData.split('\n')[0];

    // Split the first line by any sequence of common whitespace characters.
    // This regex is a distinct alternative to /\s+/.
    const stringTokens = firstLineContent.split(/[\u0009-\u000D\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000\u2028\u2029]+/);

    // Use a reducer to parse and collect the first three numeric values.
    // This handles non-numeric tokens by converting them to NaN via parseInt.
    const collectedNumbers = stringTokens.reduce((accumulator, currentToken) => {
      if (accumulator.length < 3) {
        const parsedValue = parseInt(currentToken, 10);
        accumulator.push(parsedValue);
      }
      return accumulator;
    }, []);

    // Ensure there are exactly three numbers, filling any missing positions with NaN.
    const finalNumbers = Array.from({ length: 3 }, (_, index) => {
      return index < collectedNumbers.length ? collectedNumbers[index] : NaN;
    });

    // Assign values to distinct identifiers.
    const numA = finalNumbers[0];
    const numB = finalNumbers[1];
    const numC = finalNumbers[2];

    // Calculate the three possible sums and store them in an array.
    const sumCombinations = [
      numA + numB,
      numB + numC,
      numC + numA
    ];

    // Find the smallest sum using an explicit loop, propagating NaN if any sum is NaN.
    let currentMin = Infinity;
    for (const individualSum of sumCombinations) {
      if (isNaN(individualSum)) {
        return NaN; // If any sum is NaN, the final result must be NaN.
      }
      if (individualSum < currentMin) {
        currentMin = individualSum;
      }
    }

    return currentMin;
  };

  // Read the entire file content from standard input.
  const fileInput = require("fs").readFileSync("/dev/stdin", "utf8");

  // Compute the result and print it to standard output.
  console.log(calculateMinimumSum(fileInput));
})();
