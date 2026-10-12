"use strict";
main(require("fs").readFileSync("/dev/stdin", "UTF-8"));

function main(sourceText) {
  const [initialValue, targetValue] = sourceText
    .split("\n")[0]
    .split(" ")
    .map(valStr => parseInt(valStr));

  let finalCount;

  if (initialValue === 1) {
    if (targetValue > 1) {
      while (true) {
        // This loop replicates the original's infinite loop behavior
        // when the starting value is 1 and the target is greater than 1.
        // The original update (valA = valA + valA - 1) would keep valA at 1.
      }
    } else {
      // If initialValue is 1 and targetValue is 1 or less (implies 1),
      // the condition initialValue >= targetValue is met immediately.
      finalCount = 1;
    }
  } else { // initialValue > 1
    if (initialValue >= targetValue) {
      // If the initial value is already sufficient, no operations are needed.
      finalCount = 1;
    } else {
      // The transformation of the value follows the pattern:
      // x_k = 2^k * (x_0 - 1) + 1, where x_0 is initialValue and k is the number of operations.
      // We need to find the smallest k such that x_k >= targetValue.
      // 2^k * (initialValue - 1) + 1 >= targetValue
      // 2^k * (initialValue - 1) >= targetValue - 1
      // 2^k >= (targetValue - 1) / (initialValue - 1)
      // k >= log2((targetValue - 1) / (initialValue - 1))
      // The number of operations (k) is the ceiling of this logarithm.

      const requiredGrowthRatio = (targetValue - 1) / (initialValue - 1);
      const numberOfOperations = Math.ceil(Math.log2(requiredGrowthRatio));
      finalCount = numberOfOperations + 1;
    }
  }

  // The console output is only reached if the execution path does not enter an infinite loop.
  if (finalCount !== undefined) {
    console.log(finalCount);
  }
}
