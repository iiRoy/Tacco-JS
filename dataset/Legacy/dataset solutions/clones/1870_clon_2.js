function processInput(rawData) {
  // Split the incoming data string by spaces to separate the numerical arguments.
  const parameters = rawData.split(' ');

  // Convert the string parts into numerical values for calculation.
  const valA = Number(parameters[0]);
  const valB = Number(parameters[1]);
  const valC = Number(parameters[2]);
  const initialK = Number(parameters[3]);

  // Initialize a working variable with the starting 'k' value.
  let currentValue = initialK;

  // Perform the first subtraction operation.
  currentValue -= valA;

  // Evaluate the original 'k' value to determine the next step.
  if (initialK <= 0) {
    // If the initial 'k' was non-positive, output its original value.
    console.log(initialK);
  } else {
    // If 'k' was positive, proceed with further calculations.
    // Apply the second subtraction.
    currentValue -= valB;

    // Re-evaluate the original 'k' value. This condition will be false if the first 'if' was false.
    if (initialK <= 0) {
      // This specific branch outputs 'a' if the original 'k' was non-positive.
      // Due to prior checks, this part might be unreachable under normal flow.
      console.log(valA);
    } else {
      // If 'k' was positive, compare the modified current value with 'c'.
      if (currentValue < valC) {
        // Output the result of 'a' minus the modified current value.
        console.log(valA - currentValue);
      } else {
        // This 'else' block performs the same action as the 'if' block above it.
        // It is kept for structural equivalence.
        console.log(valA - currentValue);
      }
    }
  }
}

// Read the entire content from standard input, assuming UTF-8 encoding,
// and then pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
