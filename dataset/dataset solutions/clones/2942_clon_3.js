'use strict';
(function(inputString){
  const processedInput = inputString.trim().split(/\s+/).map(val => val - 0);
  
  const minDim = Math.min(processedInput[0], processedInput[1]);
  const maxDim = Math.max(processedInput[0], processedInput[1]);
  const numK = processedInput[2];
  const primeModulus = Math.pow(10, 9) + 7;

  let finalResult = 0;

  // Define constants for fractional coefficients to improve readability
  const SIXTH_COEFFICIENT = 1 / 6;
  const HALF_COEFFICIENT = 1 / 2;

  // Helper function for consistent modular arithmetic application
  const applyMod = (value) => (value % primeModulus + primeModulus) % primeModulus;

  // First calculation phase: currentDim from 1 to minDim-1
  for(let currentDim = 1; currentDim <= minDim - 1; currentDim++){
    // Introduce helper variables for common sub-expressions
    const dPlus1 = currentDim + 1;
    const dPlus2 = currentDim + 2;
    const dPlus3 = currentDim + 3;

    let termA = SIXTH_COEFFICIENT * dPlus1 * dPlus2 * dPlus3;
    let termB = (minDim - currentDim - 1 + maxDim - currentDim - 1) * HALF_COEFFICIENT * dPlus1 * dPlus2;
    let termC = (minDim - currentDim - 1) * (maxDim - currentDim - 1) * dPlus1;
    let termD = (minDim - currentDim) * maxDim + (maxDim - currentDim) * minDim;
    
    // Combine terms before applying to finalResult
    let currentTermContribution = (termA + termB + termC) * 2 - termD;
    finalResult += currentDim * currentTermContribution;
    finalResult = applyMod(finalResult);
  }
  
  // Second calculation phase: currentDim from minDim to maxDim-1
  for(let currentDim = minDim; currentDim <= maxDim - 1; currentDim++){
    // Introduce helper variables for common sub-expressions
    const minDimPlus1 = minDim + 1;
    const minDimPlus2 = minDim + 2;

    let termA = SIXTH_COEFFICIENT * minDim * minDimPlus1 * minDimPlus2;
    let termB = (maxDim - currentDim - 1) * HALF_COEFFICIENT * minDim * minDimPlus1;
    let termC = 0; // Explicitly set to 0 as per original logic
    let termD = (maxDim - currentDim) * minDim;

    let currentTermContribution = (termA + termB + termC) * 2 - termD;
    finalResult += currentDim * currentTermContribution;
    finalResult = applyMod(finalResult);
  }
  
  // Third calculation phase: currentDim from maxDim to minDim+maxDim-2
  for(let currentDim = maxDim; currentDim <= minDim + maxDim - 2; currentDim++){
    const tempVarA = minDim + maxDim - 1 - currentDim;
    // Introduce helper variables for common sub-expressions
    const tempVarAPlus1 = tempVarA + 1;
    const tempVarAPlus2 = tempVarA + 2;

    let termA = SIXTH_COEFFICIENT * tempVarA * tempVarAPlus1 * tempVarAPlus2;
    let termB = 0; // Explicitly set to 0 as per original logic
    let termC = 0; // Explicitly set to 0 as per original logic
    let termD = 0; // Explicitly set to 0 as per original logic

    let currentTermContribution = (termA + termB + termC) * 2 - termD;
    finalResult += currentDim * currentTermContribution;
    finalResult = applyMod(finalResult);
  }
  
  // Calculate numerator part of combinations (N*M-2)C(K-2)
  const totalCellsMinusTwo = minDim * maxDim - 2;
  const numTermsForNumerator = numK - 2;

  for(let iterIndex = 0; iterIndex < numTermsForNumerator; iterIndex++){
    finalResult *= (totalCellsMinusTwo - iterIndex);
    finalResult = applyMod(finalResult);
  }
  
  // Calculate denominator part of combinations (K-2)!
  let combDenominator = 1;
  for(let iterIndex = 1; iterIndex <= numTermsForNumerator; iterIndex++){
    combDenominator *= iterIndex;
    combDenominator = applyMod(combDenominator);
  }

  // Helper function to calculate modular inverse using Extended Euclidean Algorithm
  function calculateModularInverse(number, modulus) {
      const euclidRemainders = [modulus, number];
      while (euclidRemainders[euclidRemainders.length - 1] !== 0) {
          let valA = euclidRemainders[euclidRemainders.length - 2];
          let valB = euclidRemainders[euclidRemainders.length - 1];
          let remainder = valA % valB;
          euclidRemainders.push(remainder);
      }
      euclidRemainders.pop(); // Remove the last zero remainder

      const euclidCoeffX = [1];
      const euclidCoeffY = [0];

      // Back-substitute to find coefficients for Bezout's identity
      while (euclidRemainders.length > 2) {
          let currentLength = euclidRemainders.length;
          let euclidQuotient = Math.floor((euclidRemainders[currentLength - 3] - euclidRemainders[currentLength - 1]) / euclidRemainders[currentLength - 2]);
          
          euclidCoeffX.push(euclidCoeffY[euclidCoeffY.length - 1] - euclidQuotient * euclidCoeffX[euclidCoeffX.length - 1]);
          euclidCoeffY.push(euclidCoeffX[euclidCoeffX.length - 2]);
          euclidRemainders.pop();
      }
      return (euclidCoeffX[euclidCoeffX.length - 1] + modulus) % modulus;
  }

  const modInverse = calculateModularInverse(combDenominator, primeModulus);

  // Final multiplication, splitting result to prevent overflow before modulo
  const SPLIT_THRESHOLD = 100000; // Constant for the split value
  let resultParts = [
    Math.floor(finalResult / SPLIT_THRESHOLD), // Use Math.floor for explicit integer division
    finalResult % SPLIT_THRESHOLD
  ];

  resultParts[0] *= modInverse;
  resultParts[0] = applyMod(resultParts[0]);
  resultParts[0] *= SPLIT_THRESHOLD;
  resultParts[0] = applyMod(resultParts[0]);

  resultParts[1] = (resultParts[1] * modInverse);
  resultParts[1] = applyMod(resultParts[1]);

  finalResult = (resultParts[0] + resultParts[1]);
  finalResult = applyMod(finalResult);
  
  console.log(finalResult);
})(require('fs').readFileSync('/dev/stdin','utf8'));
