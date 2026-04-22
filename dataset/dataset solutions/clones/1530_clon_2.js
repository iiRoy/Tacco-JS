const primeModulus = 1_000_000_007; // A large prime number used for modulo operations

function calculatePowerModulo(baseValue, exponentValue) {
  // This function computes (baseValue ^ exponentValue) % primeModulus efficiently.
  let currentResult = 1;
  for (let iterationIndex = 0; iterationIndex < exponentValue; iterationIndex++) {
    currentResult = (currentResult * baseValue) % primeModulus;
  }
  return currentResult;
}

function processInput(sourceString) {
  // Parse the input string into an integer value.
  const integerInput = parseInt(sourceString, 10);

  // Perform the primary calculation using the modular exponentiation function.
  // The formula is (10^N - 2 * 9^N + 8^N) mod M.
  let calculatedAnswer = calculatePowerModulo(10, integerInput)
                       - (calculatePowerModulo(9, integerInput) * 2)
                       + calculatePowerModulo(8, integerInput);

  // Apply the modulus to the intermediate result.
  calculatedAnswer = calculatedAnswer % primeModulus;

  // Ensure the final result is non-negative after modulo operation.
  calculatedAnswer = (calculatedAnswer + primeModulus) % primeModulus;

  // Output the final computed answer to the console.
  console.log(calculatedAnswer);
}

// Read data from standard input, then process it.
processInput( require("fs") .readFileSync( "/dev/stdin" , "utf8" ) );