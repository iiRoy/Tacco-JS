function ProcessData(rawContent) {
  // Utility function for numerical sorting
  function numericSort(valA, valB) {
    return valA - valB;
  }

  // Parse input: trim, split by new line, then split each line by space
  let parsedLines = rawContent
    .trim()
    .split("\n")
    .map(function(lineStr) {
      return lineStr.split(" ");
    });

  // Extract initial parameters from the first line and convert to integers
  let firstLineVals = parsedLines[0].map(e => parseInt(e, 10));

  // Define problem constraints and costs
  // A: Cost of 100g of water component 1 (e.g., pure water)
  // B: Cost of 100g of water component 2 (e.g., flavored water base)
  // C: Cost of 1g of solute component 1 (e.g., sugar)
  // D: Cost of 1g of solute component 2 (e.g., salt)
  // E: Maximum allowed concentration percentage (e.g., 100 * (solute / water))
  // F: Maximum total weight of the mixture
  const waterBaseCost = firstLineVals[0] * 100;
  const waterAdditiveCost = firstLineVals[1] * 100;
  const soluteSugarCost = firstLineVals[2];
  const soluteSaltCost = firstLineVals[3];
  const maxConcentrationRatio = firstLineVals[4];
  const maxMixtureWeight = firstLineVals[5];

  // Generate all possible water weights (combinations of waterBaseCost and waterAdditiveCost)
  // The total weight must not exceed maxMixtureWeight
  let waterWeightOptions = [];
  let currentWaterWeight;
  for (let waterIdx = 0; waterIdx < (maxMixtureWeight / waterBaseCost); waterIdx++) {
    currentWaterWeight = waterBaseCost * waterIdx;
    for (let additiveIdx = 0; additiveIdx < ((maxMixtureWeight - currentWaterWeight) / waterAdditiveCost); additiveIdx++) {
      waterWeightOptions.push(currentWaterWeight + waterAdditiveCost * additiveIdx);
    }
  }

  // Sort the generated water weights and remove duplicates
  waterWeightOptions.sort(numericSort);
  waterWeightOptions = waterWeightOptions.filter(function(currentVal, currentIndex, fullArray) {
    return fullArray.indexOf(currentVal) === currentIndex;
  });

  // Calculate the maximum possible solute weight based on maxConcentrationRatio and maxMixtureWeight
  // This is derived from: solute / (water + solute) <= E / 100  => solute <= E/100 * (water + solute)
  // => solute * (1 - E/100) <= E/100 * water => solute * (100 - E)/100 <= E/100 * water
  // => solute <= E/(100 - E) * water.
  // The original formula `F * E / (100 + E)` seems to be for max solute where total weight is F, and solute/total_weight = E/(100+E)
  // Let's assume the original formula is correct for the problem's intent: max_solute_weight_limit = floor(F * E / (100 + E))
  const maxSoluteWeightLimit = Math.floor(maxMixtureWeight * maxConcentrationRatio / (100 + maxConcentrationRatio));

  // Generate all possible solute weights (combinations of soluteSugarCost and soluteSaltCost)
  // The total solute weight must not exceed maxSoluteWeightLimit
  let soluteWeightOptions = [];
  let currentSugarWeight;
  for (let sugarIdx = 0; sugarIdx < (maxSoluteWeightLimit / soluteSugarCost); sugarIdx++) {
    currentSugarWeight = soluteSugarCost * sugarIdx;
    for (let saltIdx = 0; saltIdx < ((maxSoluteWeightLimit - currentSugarWeight) / soluteSaltCost); saltIdx++) {
      soluteWeightOptions.push(currentSugarWeight + soluteSaltCost * saltIdx);
    }
  }

  // Sort the generated solute weights and remove duplicates
  soluteWeightOptions.sort(numericSort);
  soluteWeightOptions = soluteWeightOptions.filter(function(currentVal, currentIndex, fullArray) {
    return fullArray.indexOf(currentVal) === currentIndex;
  });

  // Create a bitmap (boolean array) for quick lookup of available solute weights
  // Initialize all entries to 0 (false)
  let solutePresenceMap = [];
  for (let mapIdx = 0; mapIdx <= maxSoluteWeightLimit; mapIdx++) {
    solutePresenceMap.push(0);
  }
  // Mark existing solute weights as 1 (true)
  for (let presentSoluteWeight of soluteWeightOptions) {
    solutePresenceMap[presentSoluteWeight] = 1;
  }

  // Initialize variables for tracking the best density found
  let currentHighestDensity = 0;
  let bestResultArray = [0, 0]; // [totalWeight, soluteWeight]

  // Iterate through all possible water weights
  for (let currentWaterWeight of waterWeightOptions) {
    // Calculate the lower and upper bounds for solute weight for the current water weight
    // Lower bound: Based on the current highest density achieved
    // Upper bound: Limited by the max concentration ratio and the remaining total weight capacity
    let minSoluteForWater = Math.floor(currentWaterWeight * currentHighestDensity);
    let maxSoluteForWater = Math.min(Math.floor(currentWaterWeight * maxConcentrationRatio / 100), maxMixtureWeight - currentWaterWeight);

    // Iterate through possible solute weights within the calculated range
    for (let currentSoluteWeight = minSoluteForWater; currentSoluteWeight <= maxSoluteForWater; currentSoluteWeight++) {
      // Check if this solute weight is valid (i.e., can be formed by C and D)
      if (solutePresenceMap[currentSoluteWeight] === 1) {
        // Calculate the density for the current combination
        const currentDensity = currentSoluteWeight / currentWaterWeight;

        // If this density is higher than the current highest, update the best result
        if (currentDensity > currentHighestDensity) {
          bestResultArray[0] = currentWaterWeight + currentSoluteWeight;
          bestResultArray[1] = currentSoluteWeight;
          currentHighestDensity = currentDensity;
        }
        // Mark this solute weight as used to avoid redundant checks (optimization)
        solutePresenceMap[currentSoluteWeight] = 0;
      }
    }
  }

  // Output the total weight and solute weight of the mixture with the highest density
  console.log("%d %d", bestResultArray[0], bestResultArray[1]);
}

// Read input from standard input and pass it to the main processing function
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));