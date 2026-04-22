const PRIME_MODULUS_VALUE = 1000000007;

// A functional approach to compute the product of integers from 1 to a limit, modulo a given value.
const computeProductSequenceMod = (upperBoundary, modulusVal) => {
  if (upperBoundary < 0) return 0; // Handle non-positive boundaries gracefully if unexpected
  return Array.from({ length: upperBoundary }, (_, currentIndex) => currentIndex + 1)
              .reduce((currentAggregate, numberFactor) => (currentAggregate * numberFactor) % modulusVal, 1);
};

// Main logic to process input and determine the final outcome.
const deriveFinalResult = (inputPayloadString) => {
  // Parse numerical components from the input string.
  const numericalComponents = inputPayloadString.trim().split(/\s+/).map(Number);
  const primaryValue = numericalComponents[0];
  const secondaryValue = numericalComponents[1];

  // Determine a 'zeroing' factor based on the absolute difference between the two values.
  // If the difference is greater than 1, this factor becomes 0, causing the final result to be 0.
  const differenceZeroingFactor = (Math.abs(primaryValue - secondaryValue) > 1) ? 0 : 1;

  // Calculate the factorial-like products for both primary and secondary values, modulo the prime.
  const productOne = computeProductSequenceMod(primaryValue, PRIME_MODULUS_VALUE);
  const productTwo = computeProductSequenceMod(secondaryValue, PRIME_MODULUS_VALUE);

  // Determine an 'equality' multiplier based on whether the two values are identical.
  // If they are identical, this multiplier is 2; otherwise, it's 1.
  const equalityAdjustmentFactor = (primaryValue === secondaryValue) ? 2 : 1;

  // Combine all calculated factors to produce the ultimate outcome.
  // The order of multiplication and modulo operations is crucial for correctness.
  let interimCalculation = (productOne * productTwo) % PRIME_MODULUS_VALUE;
  interimCalculation = (interimCalculation * equalityAdjustmentFactor) % PRIME_MODULUS_VALUE;
  const ultimateOutput = (interimCalculation * differenceZeroingFactor) % PRIME_MODULUS_VALUE;

  return ultimateOutput;
};

// Entry point for the program, handling file system interaction and output.
const initiateProgramFlow = () => {
  const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  const programOutcome = deriveFinalResult(fileContent);
  console.log(programOutcome);
};

initiateProgramFlow();