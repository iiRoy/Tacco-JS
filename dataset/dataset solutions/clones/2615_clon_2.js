function calculateFactorCombinations(maximumValue, thresholdValue) {
  // Inner helper to recursively check factors
  function inspectFactor(currentDivisor) {
    if (currentDivisor > 9) {
      return 0; // Factor too large
    }

    if (currentDivisor * currentDivisor > maximumValue) {
      return 0; // Optimization: currentDivisor is too large for its square to be a factor
    }

    if (maximumValue % currentDivisor === 0 && maximumValue / currentDivisor < 10 && currentDivisor * 10 + maximumValue / currentDivisor <= thresholdValue) {
      // Found a valid combination, recursively check next divisor
      let pairCount = 1;
      if (maximumValue / currentDivisor * 10 + currentDivisor <= thresholdValue && maximumValue / currentDivisor !== currentDivisor) {
        pairCount = 2; // Both permutations are valid and distinct
      }
      return inspectFactor(currentDivisor + 1) + pairCount;
    } else {
      // No valid combination with currentDivisor, try next
      return inspectFactor(currentDivisor + 1);
    }
  }

  if (maximumValue < 4) {
    return 0; // Minimum value for calculation
  } else {
    // Start checking from divisor 2, and recurse for previous maximumValue
    return inspectFactor(2) + calculateFactorCombinations(maximumValue - 1, thresholdValue);
  }
}

function ProcessInputData(inputString) {
  // Split the input string into numerical components
  const parsedParts = inputString.split(" ");

  // Convert string parts to integers for calculation
  const firstValue = parseInt(parsedParts[0], 10);
  const secondValue = parseInt(parsedParts[1], 10);

  // Display the computed result
  console.log('%d', calculateFactorCombinations(firstValue, secondValue));
}

// The following line should not be altered (it handles standard input/output)
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));