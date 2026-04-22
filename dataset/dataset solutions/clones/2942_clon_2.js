'use strict';
(function(initialString) {
  // Pre-process the raw input: trim whitespace, split into array, and convert elements to numbers.
  initialString = initialString.trim().split(/\s+/).map(val => Number(val));

  const widthVal = Math.min(initialString[0], initialString[1]);
  const heightVal = Math.max(initialString[0], initialString[1]);
  const selectionNum = initialString[2];
  const primeMod = Math.pow(10, 9) + 7; // A large prime constant used for modulo operations.

  let totalSum = 0; // This variable accumulates the calculation results.

  // First computational phase: Iterating from 1 up to (widthVal - 1).
  for (let loopIndex = 1; loopIndex <= widthVal - 1; loopIndex++) {
    const termOne = (1.0 / 6.0) * (loopIndex + 1) * (loopIndex + 2) * (loopIndex + 3);
    const termTwo = ((widthVal - loopIndex - 1) + (heightVal - loopIndex - 1)) * (0.5) * (loopIndex + 1) * (loopIndex + 2);
    const termThree = (widthVal - loopIndex - 1) * (heightVal - loopIndex - 1) * (loopIndex + 1);
    const termFour = (widthVal - loopIndex) * heightVal + (heightVal - loopIndex) * widthVal;

    totalSum += loopIndex * ((termOne + termTwo + termThree) * 2 - termFour);
    totalSum %= primeMod; // Apply modulo after each addition to keep the sum within bounds.
  }

  // Second computational phase: Iterating from widthVal up to (heightVal - 1).
  for (let loopIndex = widthVal; loopIndex <= heightVal - 1; loopIndex++) {
    const termOne = (1.0 / 6.0) * (widthVal) * (widthVal + 1) * (widthVal + 2);
    const termTwo = (heightVal - loopIndex - 1) * (0.5) * (widthVal) * (widthVal + 1);
    const termThree = 0; // This component is zero in this specific iteration range.
    const termFour = (heightVal - loopIndex) * widthVal;

    totalSum += loopIndex * ((termOne + termTwo + termThree) * 2 - termFour);
    totalSum %= primeMod;
  }

  // Third computational phase: Iterating from heightVal up to (widthVal + heightVal - 2).
  for (let loopIndex = heightVal; loopIndex <= widthVal + heightVal - 2; loopIndex++) {
    const currentDim = widthVal + heightVal - 1 - loopIndex;
    const termOne = (1.0 / 6.0) * (currentDim) * (currentDim + 1) * (currentDim + 2);
    const termTwo = 0; // This component is zero.
    const termThree = 0; // This component is zero.
    const termFour = 0; // This component is zero.

    totalSum += loopIndex * ((termOne + termTwo + termThree) * 2 - termFour);
    totalSum %= primeMod;
  }

  // Calculate the numerator part for the binomial coefficient (N*M-2) C (K-2).
  // This involves multiplying 'totalSum' by a decreasing sequence of values.
  for (let counter = 0; counter < selectionNum - 2; counter++) {
    totalSum *= (widthVal * heightVal - 2 - counter);
    totalSum %= primeMod;
  }

  let denomTerm = 1; // Initialize the denominator for the combination.
  // Calculate the factorial part for the denominator: (K-2)!.
  for (let counter = 1; counter <= selectionNum - 2; counter++) {
    denomTerm *= counter;
    denomTerm %= primeMod;
  }

  // Compute the modular multiplicative inverse of 'denomTerm' modulo 'primeMod'.
  // This is achieved using the Extended Euclidean Algorithm.
  const gcdSteps = [primeMod, denomTerm]; // Store intermediate remainders.
  while (gcdSteps[gcdSteps.length - 1] !== 0) {
    let currentA = gcdSteps[gcdSteps.length - 2];
    let currentB = gcdSteps[gcdSteps.length - 1];
    let remainder = currentA % currentB;
    gcdSteps.push(remainder);
  }
  gcdSteps.pop(); // Remove the final zero from the list of remainders.

  const coeffX = [1];
  const coeffY = [0];

  // Perform back-substitution to find the Bezout coefficients.
  while (gcdSteps.length > 2) {
    let currentQuotient = (gcdSteps[gcdSteps.length - 3] - gcdSteps[gcdSteps.length - 1]) / gcdSteps[gcdSteps.length - 2];
    coeffX.push(coeffY[coeffY.length - 1] - currentQuotient * coeffX[coeffX.length - 1]);
    coeffY.push(coeffX[coeffX.length - 2]);
    gcdSteps.pop();
  }
  // The 'modularInverse' is the modular inverse of 'denomTerm' modulo 'primeMod'.
  const modularInverse = (coeffX[coeffX.length - 1] + primeMod) % primeMod;

  // Final calculation step: multiply 'totalSum' by its modular inverse,
  // splitting 'totalSum' into parts to prevent exceeding JavaScript's safe integer limit.
  const largePart = Math.floor(totalSum / 100000);
  const smallPart = (totalSum % 100000);

  let resultPartOne = largePart;
  resultPartOne *= modularInverse;
  resultPartOne %= primeMod;
  resultPartOne = (resultPartOne + primeMod) % primeMod; // Ensure positivity.
  resultPartOne *= 100000;
  resultPartOne %= primeMod;

  let resultPartTwo = (smallPart * modularInverse) % primeMod;

  totalSum = (resultPartOne + resultPartTwo) % primeMod;
  totalSum = (totalSum + primeMod) % primeMod; // Final adjustment to ensure a positive result.

  console.log(totalSum); // Output the computed final value.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));