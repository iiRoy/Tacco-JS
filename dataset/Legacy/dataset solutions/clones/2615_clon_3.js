function calculateDivisorCount(initialProduct, maxCombinedValue) {
  let totalCount = 0;

  // Helper function to determine the count of valid divisor pairs for a single product value.
  // This function encapsulates the logic previously handled by the inner recursive function.
  const getDivisorCountForSingleProduct = (targetProduct) => {

    // Inner recursive function to iterate through potential factors.
    function recursiveFactorCheck(currentFactor) {
      // Guard clause: If the current factor exceeds 9, it's no longer a single-digit factor.
      if (currentFactor > 9) {
        return 0;
      }
      // Guard clause: If the square of the current factor exceeds the target product,
      // subsequent factors will also be too large to form valid pairs (where both factors are <= 9).
      if (currentFactor * currentFactor > targetProduct) {
        return 0;
      }

      let currentFactorContribution = 0; // Accumulator for valid pairs found with this currentFactor.

      // Check if currentFactor is a divisor of targetProduct.
      if (targetProduct % currentFactor === 0) {
        const otherFactor = targetProduct / currentFactor; // Calculate the complementary factor.

        // Evaluate conditions for the first potential pair (currentFactor, otherFactor).
        const isOtherFactorSingleDigit = otherFactor < 10;
        const combinedValueForward = currentFactor * 10 + otherFactor;
        const isCombinedValueForwardValid = combinedValueForward <= maxCombinedValue;

        // If the first pair (currentFactor, otherFactor) meets the criteria.
        if (isOtherFactorSingleDigit && isCombinedValueForwardValid) {
          currentFactorContribution = 1; // Count this pair.

          // Evaluate conditions for the second potential pair (otherFactor, currentFactor).
          // This pair is only distinct and counted separately if otherFactor is not equal to currentFactor.
          const combinedValueBackward = otherFactor * 10 + currentFactor;
          const isCombinedValueBackwardValid = combinedValueBackward <= maxCombinedValue;
          const areFactorsDistinct = otherFactor !== currentFactor;

          // If the second pair (otherFactor, currentFactor) also meets its criteria and is distinct.
          if (isCombinedValueBackwardValid && areFactorsDistinct) {
            currentFactorContribution = 2; // Increment count to 2 for both distinct valid pairs.
          }
        }
      }

      // Recursively check the next potential factor and add its contribution.
      return currentFactorContribution + recursiveFactorCheck(currentFactor + 1);
    }

    // Start the recursive check for factors from 2.
    return recursiveFactorCheck(2);
  };

  // The original function had an outer recursion `countDivisor(m-1, d)`.
  // This loop replaces that recursion by iterating downwards from initialProduct.
  for (let currentProduct = initialProduct; currentProduct >= 4; currentProduct--) {
    // The base case `if(m<4) return 0;` is handled by the loop's termination condition.
    totalCount += getDivisorCountForSingleProduct(currentProduct);
  }

  return totalCount;
}

function Main(inputString) {
  const parsedInput = inputString.split(" ");
  const productVal = parseInt(parsedInput[0], 10);
  const limitVal = parseInt(parsedInput[1], 10);
  console.log('%d', calculateDivisorCount(productVal, limitVal));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
