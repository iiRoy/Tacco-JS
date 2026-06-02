function ProcessInput(rawData) {
  // Split the raw input string by spaces to get individual numeric values.
  let parsedValues = rawData.split(" ");

  // Parse integer values for various parameters from the input array.
  const valA = parseInt(parsedValues[0], 10); // Represents a unit of water (e.g., 100g)
  const valB = parseInt(parsedValues[1], 10); // Represents another unit of water (e.g., 100g)
  const valC = parseInt(parsedValues[2], 10); // Represents a unit of sugar
  const valD = parseInt(parsedValues[3], 10); // Represents another unit of sugar
  const valE = parseInt(parsedValues[4], 10); // Represents maximum sugar solubility per 100g water
  const valF = parseInt(parsedValues[5], 10); // Represents the maximum total weight of the solution

  // Initialize variables to store the maximum concentration found and corresponding weights.
  let maxConcentration = 0; // Stores the highest sugar concentration percentage
  let totalWeight = 0;      // Stores the total weight of the solution for maxConcentration
  let sugarWeight = 0;      // Stores the sugar weight for maxConcentration

  // Handle a specific edge case: if the smallest possible water amount (100*valA)
  // combined with the smallest sugar amount (valC) already exceeds the total capacity valF,
  // or if valF is too small to even hold the smallest sugar amount with the smallest water.
  // This condition implies that only water can be added, or the smallest water amount is the only option.
  if (valF - 100 * valA < valC) {
    totalWeight = 100 * valA; // The solution will consist only of the smallest water unit
    sugarWeight = 0;          // No sugar can be added in this scenario
  } else {
    // Iterate through all possible combinations of water and sugar amounts.
    // idxI and idxJ represent multiples of water units (valA and valB).
    for (let idxI = 0; idxI * 100 * valA <= valF; idxI++) {
      for (let idxJ = 0; idxI * 100 * valA + idxJ * 100 * valB <= valF; idxJ++) {
        // idxK and idxL represent multiples of sugar units (valC and valD).
        for (let idxK = 0; idxI * 100 * valA + idxJ * 100 * valB + idxK * valC <= valF; idxK++) {
          for (let idxL = 0; idxI * 100 * valA + idxJ * 100 * valB + idxK * valC + idxL * valD <= valF; idxL++) {

            // Calculate current water and sugar amounts for this iteration.
            const currentWaterAmount = idxI * 100 * valA + idxJ * 100 * valB;
            const currentSugarAmount = idxK * valC + idxL * valD;

            // Check if the current sugar amount respects the solubility limit.
            // Solubility is valE grams of sugar per 100 grams of water.
            if (currentSugarAmount <= (currentWaterAmount / 100) * valE) {
              // Calculate the total weight of the current solution.
              const currentTotalWeight = currentWaterAmount + currentSugarAmount;

              // Ensure the total weight does not exceed the maximum allowed weight.
              if (currentTotalWeight <= valF) {
                // Calculate the current sugar concentration percentage.
                // Avoid division by zero if currentTotalWeight is 0 (though unlikely with water present).
                const currentConcentration = (currentTotalWeight === 0) ? 0 : (100 * currentSugarAmount / currentTotalWeight);

                // If this concentration is higher than the previously found maximum, update the results.
                if (currentConcentration > maxConcentration) {
                  maxConcentration = currentConcentration;
                  totalWeight = currentTotalWeight;
                  sugarWeight = currentSugarAmount;
                }
              }
            }
          }
        }
      }
    }
  }

  // Output the total weight and the sugar weight of the solution with the highest concentration.
  console.log('%s %d', totalWeight, sugarWeight);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
