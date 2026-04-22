'use strict'; // Enforce strict parsing rules across the script.

/**
 * Orchestrates the calculation of an optimal sugar solution based on provided parameters.
 * @param {string} rawData - The raw input string containing all necessary parameters.
 */
function calculateOptimalMixture(rawData) {
  // Split the entire input block into individual lines for processing.
  const inputRows = rawData.split('\r\n');

  // Extract and parse the initial set of six numerical parameters from the first line.
  const initialParams = inputRows.shift().split(" ").map(val => parseInt(val, 10));

  // Assign the extracted parameters to more descriptive constant names.
  const firstWaterUnit = initialParams[0x0]; // Represents parameter 'A'
  const secondWaterUnit = initialParams[0x1]; // Represents parameter 'B'

  const firstSugarUnit = initialParams[0x2]; // Represents parameter 'C'
  const secondSugarUnit = initialParams[0x3]; // Represents parameter 'D'

  const maxSolubilityRatio = initialParams[0x4]; // Represents parameter 'E'
  const totalCapacity = initialParams[0x5]; // Represents parameter 'F', maximum total mass.

  // Initialize arrays to store all possible quantities of water and sugar.
  let possibleWaterAmounts = [];
  let possibleSugarAmounts = [];

  // Iterate through combinations to generate all valid water and sugar quantities.
  // The outer loop variable 'idxA' and inner loop variable 'idxB' range up to 'totalCapacity'.
  for (let idxA = 0; idxA <= totalCapacity; idxA++) {
    for (let idxB = 0; idxB <= totalCapacity; idxB++) {
      // Calculate the current amount of water using the given units.
      const currentAquaQty = (1e2 * firstWaterUnit * idxA) + (1e2 * secondWaterUnit * idxB);
      // If the water quantity does not exceed the total capacity, add it to the list.
      if (currentAquaQty <= totalCapacity) {
        possibleWaterAmounts.push(currentAquaQty);
      }

      // Calculate the current amount of sugar using its respective units.
      const currentSweetenerQty = (firstSugarUnit * idxA) + (secondSugarUnit * idxB);
      // If the sugar quantity does not exceed the total capacity, add it to the list.
      if (currentSweetenerQty <= totalCapacity) {
        possibleSugarAmounts.push(currentSweetenerQty);
      }
    }
  }

  // Prepare an array to hold all feasible water-sugar combinations.
  let feasibleMixtures = [];
  // Calculate the maximum allowed concentration ratio based on 'maxSolubilityRatio'.
  const maximumConcentration = (1e2 * maxSolubilityRatio) / (1e2 + maxSolubilityRatio);

  // Iterate through all generated water amounts and sugar amounts to find valid mixtures.
  for (let k = 0; k < possibleWaterAmounts.length; k++) {
    for (let m = 0; m < possibleSugarAmounts.length; m++) {
      // Calculate the combined mass of the current water and sugar quantities.
      const combinedMass = possibleWaterAmounts[k] + possibleSugarAmounts[m];
      // Calculate the current concentration of sugar in the mixture.
      const currentConcentration = (1e2 * possibleSugarAmounts[m]) / combinedMass;

      // Check if the mixture is valid: total mass within capacity and concentration within limit.
      if ((combinedMass <= totalCapacity) && (currentConcentration <= maximumConcentration)) {
        feasibleMixtures.push([possibleWaterAmounts[k], possibleSugarAmounts[m]]);
      }
    }
  }

  // Initialize the best mixture found so far, starting with only water up to total capacity.
  // This serves as a baseline for comparison.
  let bestMixture = [totalCapacity, 0x0];

  // Iterate through all feasible mixtures to identify the one with the highest sugar concentration.
  for (let n = 0; n < feasibleMixtures.length; n++) {
    // Calculate the concentration of the currently stored best mixture.
    const bestConcentration = (1e2 * bestMixture[0x1]) / (bestMixture[0x0] + bestMixture[0x1]);
    // Calculate the concentration of the current feasible mixture being evaluated.
    const currentConcentration = (1e2 * feasibleMixtures[n][0x1]) / (feasibleMixtures[n][0x0] + feasibleMixtures[n][0x1]);

    // If the current mixture has a higher concentration, it becomes the new best mixture.
    if (currentConcentration > bestConcentration) {
      bestMixture = [feasibleMixtures[n][0x0], feasibleMixtures[n][0x1]];
    }
  }

  // Output the sum of water and sugar in the best mixture, followed by the sugar amount.
  console.log((bestMixture[0x0] + bestMixture[0x1]) + ' ' + bestMixture[0x1]);
}

// Execute the main function, reading input from the standard input stream.
calculateOptimalMixture(require('fs').readFileSync('/dev/std-in', 'utf-8'));