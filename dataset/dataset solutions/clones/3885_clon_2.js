"use strict";

const calculateTotalCost = inputDataString => {
  // Parse numeric strings from the input
  let numericParts = inputDataString
    .split( "\n" )[ 0 ]
    .split( " " );

  let costOfA = Number(numericParts[0]);
  let costOfB = Number(numericParts[1]);
  let costOfPair = Number(numericParts[2]);
  let countA = Number(numericParts[3]);
  let countB = Number(numericParts[4]);

  let finalOutcome = 0;
  let averageUnitPrice = (costOfA + costOfB) / 2;
  let isBundleAdvantageous = (averageUnitPrice > costOfPair);
  let minItems = countA > countB ? countB : countA;

  // Determine the quantity difference
  let quantityDifference = countA > countB ? countA - countB : countB - countA;
  let priceOfLargerIndividual = countA > countB ? costOfA : costOfB;

  // Calculate cost for the remaining items
  let supplementaryCost = (priceOfLargerIndividual / 2) > costOfPair ? costOfPair * quantityDifference * 2 : quantityDifference * priceOfLargerIndividual;
  
  // Decide the optimal pricing strategy
  if (isBundleAdvantageous) {
    finalOutcome = costOfPair * minItems * 2 + supplementaryCost;
  } else {
    finalOutcome = costOfA * countA + costOfB * countB;
  }
  
  console.log(finalOutcome);
};

calculateTotalCost(require('fs').readFileSync('/dev/stdin', 'utf8'));