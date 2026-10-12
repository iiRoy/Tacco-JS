'use strict';

// Encapsulates the entire script within an immediately invoked function expression (IIFE).
(function(rawInputData) {
  // Pre-process the input string: remove leading/trailing whitespace,
  // split into an array of strings by any whitespace, then convert each string to a number.
  let numericInputs = rawInputData.trim().split(/\s+/).map(strValue => strValue - 0);

  // Assign meaningful names to the input values.
  // 'minDimension' will hold the smaller of the first two numbers.
  const minDimension = Math.min(numericInputs[0], numericInputs[1]);
  // 'maxDimension' will hold the larger of the first two numbers.
  const maxDimension = Math.max(numericInputs[0], numericInputs[1]);
  // 'selectionCount' is the third input number, representing K.
  const selectionCount = numericInputs[2];

  // Define the modulo constant, a large prime number (10^9 + 7).
  const primeModulus = Math.pow(10, 9) + 7;

  // Initialize the primary accumulator variable for the result.
  let accumulatedResult = 0;

  // --- First Iteration Block: Calculate contributions for distances 'dist' from 1 up to (minDimension - 1) ---
  // This loop covers cases where the distance is less than the minimum dimension.
  for (let dist = 1; dist <= minDimension - 1; dist++) {
    // Calculate four intermediate terms (term_alpha, term_beta, term_gamma, term_delta)
    // based on the current distance and dimensions.
    let term_alpha = (1 / 6) * (dist + 1) * (dist + 2) * (dist + 3);
    let term_beta = ((minDimension - dist - 1) + (maxDimension - dist - 1)) * (1 / 2) * (dist + 1) * (dist + 2);
    let term_gamma = (minDimension - dist - 1) * (maxDimension - dist - 1) * (dist + 1);
    let term_delta = (minDimension - dist) * maxDimension + (maxDimension - dist) * minDimension;

    // Update the accumulated result, applying the modulo operation at each step.
    accumulatedResult += dist * ((term_alpha + term_beta + term_gamma) * 2 - term_delta);
    accumulatedResult %= primeModulus;
  }

  // --- Second Iteration Block: Calculate contributions for distances 'dist' from minDimension up to (maxDimension - 1) ---
  // This loop handles distances that are greater than or equal to the minimum dimension
  // but less than the maximum dimension.
  for (let dist = minDimension; dist <= maxDimension - 1; dist++) {
    // Calculate intermediate terms. Note that term_gamma is zero in this range.
    let term_alpha = (1 / 6) * (minDimension) * (minDimension + 1) * (minDimension + 2);
    let term_beta = (maxDimension - dist - 1) * (1 / 2) * (minDimension) * (minDimension + 1);
    let term_gamma = 0; // This term evaluates to zero for this specific range.
    let term_delta = (maxDimension - dist) * minDimension;

    // Update the accumulated result, ensuring it stays within the modulo.
    accumulatedResult += dist * ((term_alpha + term_beta + term_gamma) * 2 - term_delta);
    accumulatedResult %= primeModulus;
  }

  // --- Third Iteration Block: Calculate contributions for distances 'dist' from maxDimension up to (minDimension + maxDimension - 2) ---
  // This loop covers the largest distances.
  for (let dist = maxDimension; dist <= minDimension + maxDimension - 2; dist++) {
    // A temporary variable 'temp_val' is used in the calculation of term_alpha.
    let temp_val = minDimension + maxDimension - 1 - dist;
    // Calculate intermediate terms. Note that term_beta, term_gamma, and term_delta are all zero here.
    let term_alpha = (1 / 6) * (temp_val) * (temp_val + 1) * (temp_val + 2);
    let term_beta = 0; // These terms are zero for this range.
    let term_gamma = 0;
    let term_delta = 0;

    // Update the accumulated result, applying the modulo.
    accumulatedResult += dist * ((term_alpha + term_beta + term_gamma) * 2 - term_delta);
    accumulatedResult %= primeModulus;
  }

  // --- Calculate the numerator part of the binomial coefficient (N*M-2)C(K-2) ---
  // This loop performs the multiplication for the numerator: (N*M-2) * (N*M-3) * ...
  for (let idx = 0; idx < selectionCount - 2; idx++) {
    accumulatedResult *= (minDimension * maxDimension - 2 - idx);
    accumulatedResult %= primeModulus;
  }

  // --- Calculate the denominator part: (K-2)! ---
  let divisorValue = 1;
  for (let idx = 1; idx <= selectionCount - 2; idx++) {
    divisorValue *= idx;
    // IMPORTANT: The original code uses 'selectionCount' (K) as the modulus here, not 'primeModulus' (E).
    // This behavior is preserved as per Type II cloning rules.
    divisorValue %= selectionCount;
  }

  // --- Apply Extended Euclidean Algorithm to find the modular inverse ---
  // This section computes the modular inverse of 'divisorValue' modulo 'primeModulus'.
  // The sequence 'rem_seq' stores remainders in the Euclidean algorithm.
  const rem_seq = [primeModulus, divisorValue];
  while (rem_seq[rem_seq.length - 1] !== 0) {
    let current_A = rem_seq[rem_seq.length - 2];
    let current_B = rem_seq[rem_seq.length - 1];
    let remainder_val = current_A % current_B;
    rem_seq.push(remainder_val);
  }
  rem_seq.pop(); // Remove the final zero remainder.

  // 'x_coeffs' and 'y_coeffs' store the coefficients during back-substitution.
  const x_coeffs = [1];
  const y_coeffs = [0];

  // Back-substitute to find the coefficients for Bezout's identity.
  while (rem_seq.length > 2) {
    let current_len = rem_seq.length;
    let current_quotient = (rem_seq[current_len - 3] - rem_seq[current_len - 1]) / rem_seq[current_len - 2];
    // The logic here follows the Extended Euclidean Algorithm's back-substitution steps.
    x_coeffs.push(y_coeffs[y_coeffs.length - 1] - current_quotient * x_coeffs[x_coeffs.length - 1]);
    y_coeffs.push(x_coeffs[x_coeffs.length - 2]);
    rem_seq.pop(); // Shorten the remainder sequence.
  }
  // The last element in 'x_coeffs' is the modular inverse.
  const inverseFactor = x_coeffs[x_coeffs.length - 1];

  // --- Final calculation: Multiply 'accumulatedResult' by the 'inverseFactor' ---
  // To prevent potential overflow issues with large numbers, 'accumulatedResult' is split
  // into two parts (quotient and remainder when divided by 100,000).
  let resultParts = [(accumulatedResult - (accumulatedResult % 100000)) / 100000, accumulatedResult % 100000];

  resultParts[0] *= inverseFactor;
  resultParts[0] %= primeModulus;

  // Recombine the parts and apply the modular inverse, then ensure the result is positive.
  accumulatedResult = (resultParts[0] * 100000 + resultParts[1] * inverseFactor) % primeModulus;
  accumulatedResult = (accumulatedResult + primeModulus) % primeModulus;

  // Output the final calculated value to the console.
  console.log(accumulatedResult);

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Reads input from standard input.
