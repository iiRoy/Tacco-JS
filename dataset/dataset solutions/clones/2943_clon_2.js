'use strict';
(function(initialString) {
  // Prepare the incoming textual data: remove surrounding spaces, split by any whitespace,
  // then transform each resulting part into a numerical value.
  initialString = initialString.trim().split(/\s+/).map(currentElement => currentElement - 0);

  // Define the primary numerical parameters from the processed input.
  const minVal = Math.min(initialString[0], initialString[1]); // Smallest of the first two numbers.
  const maxVal = Math.max(initialString[0], initialString[1]); // Largest of the first two numbers.
  const targetCount = initialString[2]; // The third input number, used for combination calculations.
  const primeModulus = Math.pow(10, 9) + 7; // A large prime number for modular arithmetic operations.

  // Initialize a variable to accumulate the result of various computations.
  var cumulativeSum = 0;

  // First iterative phase: Calculate contributions for distances from 1 up to (minVal - 1).
  for (let currentDistance = 1; currentDistance <= minVal - 1; currentDistance++) {
    // Compute four distinct terms based on currentDistance and input values.
    let term_A = (1 / 6) * (currentDistance + 1) * (currentDistance + 2) * (currentDistance + 3);
    let term_B = ((minVal - currentDistance - 1) + (maxVal - currentDistance - 1)) * (1 / 2) * (currentDistance + 1) * (currentDistance + 2);
    let term_C = (minVal - currentDistance - 1) * (maxVal - currentDistance - 1) * (currentDistance + 1);
    let term_D = (minVal - currentDistance) * maxVal + (maxVal - currentDistance) * minVal;
    
    // Update the cumulative sum with the calculated terms, applying the specified formula.
    cumulativeSum += currentDistance * ((term_A + term_B + term_C) * 2 - term_D);
    // Apply the prime modulus to keep the sum within bounds.
    cumulativeSum %= primeModulus;
  }

  // Second iterative phase: Extend calculations for distances from minVal up to (maxVal - 1).
  for (let currentDistance = minVal; currentDistance <= maxVal - 1; currentDistance++) {
    // Re-evaluate the terms, some values might simplify or become constant.
    let term_A = (1 / 6) * (minVal) * (minVal + 1) * (minVal + 2);
    let term_B = (maxVal - currentDistance - 1) * (1 / 2) * (minVal) * (minVal + 1);
    let term_C = 0; // This specific term is zero in this range.
    let term_D = (maxVal - currentDistance) * minVal;
    
    // Add the new contribution to the running total.
    cumulativeSum += currentDistance * ((term_A + term_B + term_C) * 2 - term_D);
    // Maintain modular congruence.
    cumulativeSum %= primeModulus;
  }

  // Third iterative phase: Process distances from maxVal up to (minVal + maxVal - 2).
  for (let currentDistance = maxVal; currentDistance <= minVal + maxVal - 2; currentDistance++) {
    // Introduce an intermediate variable for simplified calculation of term_A.
    let tempLimit = minVal + maxVal - 1 - currentDistance;
    // Calculate terms for this final distance range.
    let term_A = (1 / 6) * (tempLimit) * (tempLimit + 1) * (tempLimit + 2);
    let term_B = 0; // These terms are zero in this range.
    let term_C = 0;
    let term_D = 0;
    
    // Increment the cumulative sum.
    cumulativeSum += currentDistance * ((term_A + term_B + term_C) * 2 - term_D);
    // Apply the modulus.
    cumulativeSum %= primeModulus;
  }
  // console.log("Intermediate sum:", cumulativeSum); // Debugging output, intentionally commented.

  // Now, multiply the current cumulative sum by the numerator part of a combination (N*M-2)C(K-2).
  // This loop calculates (minVal * maxVal - 2) * (minVal * maxVal - 3) * ... up to (targetCount - 2) terms.
  for (let multiplierIndex = 0; multiplierIndex < targetCount - 2; multiplierIndex++) {
    cumulativeSum *= (minVal * maxVal - 2 - multiplierIndex);
    cumulativeSum %= primeModulus;
  }
  // console.log("Sum after numerator:", cumulativeSum); // Another commented debugging line.

  // Calculate the denominator part of the combination, which is (K-2)!.
  var combinationDivisor = 1;
  for (let multiplierIndex = 1; multiplierIndex <= targetCount - 2; multiplierIndex++) {
    combinationDivisor *= multiplierIndex;
    // IMPORTANT: The original code uses `targetCount` for this specific modulo, not `primeModulus`.
    // This behavior is replicated precisely as per Type II cloning rules.
    combinationDivisor %= targetCount;
  }

  // To perform division in modular arithmetic, we need to find the modular multiplicative inverse
  // of `combinationDivisor` with respect to `primeModulus` using the Extended Euclidean Algorithm.
  const remainderSequence = [primeModulus, combinationDivisor];
  // Step 1: Compute the sequence of remainders.
  while (remainderSequence[remainderSequence.length - 1] !== 0) {
    let currentDividend = remainderSequence[remainderSequence.length - 2];
    let currentDivisor = remainderSequence[remainderSequence.length - 1];
    let newRemainder = currentDividend % currentDivisor;
    remainderSequence.push(newRemainder);
  }
  remainderSequence.pop(); // Remove the final zero from the sequence.

  // Step 2: Backtrack through the Euclidean algorithm to find the coefficients (Bézout's identity).
  const coeffX = [1], coeffY = [0];
  while (remainderSequence.length > 2) {
    let currentSequenceLength = remainderSequence.length;
    let currentQuotient = (remainderSequence[currentSequenceLength - 3] - remainderSequence[currentSequenceLength - 1]) / remainderSequence[currentSequenceLength - 2];
    // Apply the recursive formulas for x and y coefficients.
    coeffX.push(coeffY[coeffY.length - 1] - currentQuotient * coeffX[coeffX.length - 1]);
    coeffY.push(coeffX[coeffX.length - 2]);
    remainderSequence.pop(); // Move to the previous step in the sequence.
  }
  // The last calculated x coefficient is the modular inverse.
  const inverseFactor = coeffX[coeffX.length - 1];

  // To handle potentially very large numbers in JavaScript (which uses 64-bit floats for all numbers,
  // limiting integer precision to 2^53), the `cumulativeSum` is split into two parts:
  // a quotient and a remainder when divided by 10^5. This strategy helps manage intermediate products.
  cumulativeSum = [(cumulativeSum - (cumulativeSum % 100000)) / 100000, cumulativeSum % 100000];
  
  // Multiply the quotient part by the inverse factor and apply modulo.
  cumulativeSum[0] *= inverseFactor;
  cumulativeSum[0] %= primeModulus;
  
  // Recombine the parts, multiplying the quotient by 10^5 and the remainder by the inverse factor,
  // then apply the final modulo.
  cumulativeSum = (cumulativeSum[0] * 100000 + cumulativeSum[1] * inverseFactor) % primeModulus;
  // Ensure the final result is non-negative by adding the modulus if it's negative.
  cumulativeSum = (cumulativeSum + primeModulus) % primeModulus;
  
  // Output the final computed value.
  console.log(cumulativeSum);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));