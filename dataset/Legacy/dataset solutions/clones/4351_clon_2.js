'use strict';

/*
 * This module processes raw input data to determine an optimal
 * sugar-water mixture based on specific constraints.
 */
function processInput(rawData) {
  // Split the entire input string into individual lines.
  const inputLines = rawData.split('\n');

  // Extract the first line, split by space, and convert to integers.
  const configValues = inputLines.shift().split(' ').map(val => parseInt(val, 10));

  // Assign configuration parameters from the parsed array.
  const valA = configValues[0]; // Parameter A for water calculation
  const valB = configValues[1]; // Parameter B for water calculation

  const valC = configValues[2]; // Parameter C for sugar calculation
  const valD = configValues[3]; // Parameter D for sugar calculation

  const valE = configValues[4]; // Parameter E for solubility limit
  const valF = configValues[5]; // Maximum total mass allowed

  // Initialize arrays to store possible water and sugar amounts.
  let waterAmounts = [];
  let sugarAmounts = [];

  // Iterate through possible combinations of A, B, C, D to find valid water and sugar amounts.
  // The outer loop runs from 0 up to F, and the inner loop also runs up to F.
  for (let idx1 = 0; idx1 <= valF; idx1++) {
    for (let idx2 = 0; idx2 <= valF; idx2++) {
      // Calculate current water volume (in grams, assuming 100g per unit A/B).
      let currentWaterVolume = 100 * valA * idx1 + 100 * valB * idx2;
      // If the calculated water volume does not exceed the total mass limit F, add it.
      if (currentWaterVolume <= valF) {
        waterAmounts.push(currentWaterVolume);
      }

      // Calculate current sugar mass (in grams).
      let currentSugarMass = valC * idx1 + valD * idx2;
      // If the calculated sugar mass does not exceed the total mass limit F, add it.
      if (currentSugarMass <= valF) {
        sugarAmounts.push(currentSugarMass);
      }
    }
  }

  // Array to store all valid mixtures (water, sugar) that meet the F limit and solubility.
  let possibleMixtures = [];
  // Calculate the maximum allowed sugar concentration ratio.
  const maxSolubilityRatio = (100 * valE) / (100 + valE);

  // Iterate through all possible water and sugar combinations.
  for (let idx1 = 0; idx1 < waterAmounts.length; idx1++) {
    for (let idx2 = 0; idx2 < sugarAmounts.length; idx2++) {
      // Calculate the total mass of the current mixture.
      let totalMass = waterAmounts[idx1] + sugarAmounts[idx2];
      // Calculate the current sugar concentration (percentage).
      let currentConcentration = (100 * sugarAmounts[idx2]) / totalMass;

      // Check if the mixture is valid: total mass within F and concentration within limit.
      if ((totalMass <= valF) && (currentConcentration <= maxSolubilityRatio)) {
        possibleMixtures.push([waterAmounts[idx1], sugarAmounts[idx2]]);
      }
    }
  }

  // Initialize the best mixture found so far.
  // Start with a mixture of F grams of water and 0 grams of sugar (pure water).
  let bestMixture = [valF, 0];

  // Iterate through all valid possible mixtures to find the one with the highest sugar concentration.
  for (let idx1 = 0; idx1 < possibleMixtures.length; idx1++) {
    // Calculate the concentration of the current best mixture.
    let bestConcentration = (100 * bestMixture[1]) / (bestMixture[0] + bestMixture[1]);
    // Calculate the concentration of the current mixture being evaluated.
    let currentConcentration = (100 * possibleMixtures[idx1][1]) / (possibleMixtures[idx1][0] + possibleMixtures[idx1][1]);

    // If the current mixture has a higher concentration, it becomes the new best mixture.
    if (currentConcentration > bestConcentration) {
      bestMixture = [possibleMixtures[idx1][0], possibleMixtures[idx1][1]];
    }
  }

  // Output the total mass and the sugar mass of the best mixture.
  console.log((bestMixture[0] + bestMixture[1]) + ' ' + bestMixture[1]);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
