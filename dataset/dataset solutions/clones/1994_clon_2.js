((sourceText) => {
  const firstVal = parseInt(sourceText.split(' ')[0], 10);
  const secondVal = parseInt(sourceText.split(' ')[1], 10);

  // Utility method to compute the Greatest Common Divisor
  const greatestCommonDivisor = (numA, numB) => {
    const calculateRecursive = (valX, valY) => {
      if (valY === 0) {
        return valX;
      }
      return calculateRecursive(valY, valX % valY);
    };
    return calculateRecursive(numA, numB);
  };

  // Step 1: Generate initial lookup structures
  const initialCalculations = [];

  for (let outerIndex = 0; outerIndex < secondVal; ++outerIndex) {
    let divisorMap = {}; // Temporary object to tally GCD occurrences

    for (let innerIndex = 0; innerIndex < secondVal; ++innerIndex) {
      const currentGCD = greatestCommonDivisor(outerIndex + 1, innerIndex + 1);

      if (divisorMap[currentGCD] === undefined) {
        divisorMap[currentGCD] = 0;
      }
      divisorMap[currentGCD] += 1;
    }

    const divisorList = [];
    Object.keys(divisorMap).forEach((mapEntry) => {
      divisorList.push([Number(mapEntry), divisorMap[mapEntry]]);
    });

    initialCalculations.push(divisorList);
  }

  const stateMatrix = [new Array(secondVal + 1).fill(1)]; // Initialize the DP table with a first row of ones

  // Step 2: Populate the dynamic programming table
  for (let rowIdx = 1; rowIdx < firstVal; ++rowIdx) {
    stateMatrix.push(new Array(secondVal + 1).fill(0)); // Add a new row, initialized to zeros

    for (let colIdx = 0; colIdx < secondVal; ++colIdx) {
      for (const precalcTuple of initialCalculations[colIdx]) {
        // Apply the state transition rule and modulo arithmetic
        stateMatrix[rowIdx][precalcTuple[0] - 1] =
          (stateMatrix[rowIdx][precalcTuple[0] - 1] +
            stateMatrix[rowIdx - 1][colIdx] * precalcTuple[1]) %
          1000000007; // Ensure result stays within modulo
      }
    }
  }

  const finalStateRow = stateMatrix.pop(); // Extract the final computed row
  let totalResult = 0;

  // Step 3: Compute the aggregated final sum
  for (let resIdx = 0; resIdx < finalStateRow.length; ++resIdx) {
    totalResult =
      (totalResult + (resIdx + 1) * finalStateRow[resIdx]) % 1000000007; // Accumulate and apply modulo
  }

  console.log(totalResult);
})(require("fs").readFileSync("/dev/stdin", "utf8"));