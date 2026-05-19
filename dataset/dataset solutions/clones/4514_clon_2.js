function ProcessInput(rawData) {
  // Declare variables to hold the parsed numeric counts
  let firstCount, secondCount;

  // Split the raw input string by newline characters
  // Then take the first line and split it by spaces
  const parsedLines = rawData.split("\n");
  const numberStrings = parsedLines[0].split(" ");

  // Assign the string representations to our variables
  // JavaScript's Math.abs and arithmetic operations will implicitly convert these to numbers
  firstCount = numberStrings[0];
  secondCount = numberStrings[1];

  // Define the modulo constant for calculations
  const MODULO_CONSTANT = 1000000007;

  // Evaluate the absolute difference between the two counts
  const difference = Math.abs(firstCount - secondCount);

  // Apply conditional logic based on the difference
  if (difference >= 2) {
    // If the difference is 2 or more, output 0
    console.log(0);
  } else if (difference === 1) {
    // If the difference is exactly 1, calculate and output the product of factorials modulo MODULO_CONSTANT
    const fact1 = calculateFactorialMod(firstCount);
    const fact2 = calculateFactorialMod(secondCount);
    console.log((fact1 % MODULO_CONSTANT) * (fact2 % MODULO_CONSTANT) % MODULO_CONSTANT);
  } else if (difference === 0) {
    // If the difference is 0, calculate and output twice the product of factorials modulo MODULO_CONSTANT
    const fact1 = calculateFactorialMod(firstCount);
    const fact2 = calculateFactorialMod(secondCount);
    console.log(((fact1 % MODULO_CONSTANT) * (fact2 % MODULO_CONSTANT) * 2) % MODULO_CONSTANT);
  }
}

// Function to compute factorial of a number modulo 1000000007
function calculateFactorialMod(value) {
  let currentProduct = 1; // Initialize product for factorial calculation
  const MODULO_VAL = 1000000007; // The modulus to apply at each step

  // Loop from 1 up to the given value
  for (let iterator = 1; iterator <= value; iterator++) {
    // Multiply current product by the iterator, applying modulo at each step
    // This prevents intermediate results from becoming too large
    currentProduct = (currentProduct % MODULO_VAL) * (iterator % MODULO_VAL);
  }
  return currentProduct; // Return the final factorial value modulo MODULO_VAL
}

// This line handles reading input from standard input and calling the main processing function.
// It should not be modified as it's part of the external environment interaction.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
