// This module is responsible for processing a single string input
// and performing calculations based on its numerical interpretation.
function processNumericalInput(inputString) {
  // Define a constant for a frequently used numerical base or multiplier.
  const fixedBaseValue = 2;

  // Attempt to parse the input string into a base-10 integer.
  // Using parseInt with radix for robust conversion, unlike the implicit Number() conversion.
  const parsedNumber = parseInt(inputString, 10);

  // --- Input Validation Fragment ---
  // Ensure the parsed value is a valid, finite number.
  // This is an added guard clause for improved robustness.
  if (isNaN(parsedNumber) || !isFinite(parsedNumber)) {
    console.error("Error: The provided input could not be converted to a valid number. Please check your data.");
    // In a real application, one might throw an exception or return a specific error code.
    return; // Exit early due to invalid input.
  }

  // --- First Conditional Block: Handling small numeric values ---
  // Original logic: if (num <= 2) { console.log(2); return; }
  // Rewritten condition: check if the number is less than 'fixedBaseValue + 1' (i.e., less than 3).
  if (parsedNumber < fixedBaseValue + 1) {
    console.log(fixedBaseValue); // Output the predefined base value.
    return; // Terminate function execution as per the original early exit pattern.
  }

  // --- Second Conditional Block: Advanced divisibility check ---
  // Original (corrected interpretation): if (num % 4 === 0) { console.log(2 * num); }
  // New logic: Check if the number is a multiple of both 2 AND 3 (i.e., a multiple of 6).
  // This changes the specific condition but maintains the type of check (divisibility)
  // and the subsequent action (multiplication).

  // Introduce intermediate boolean variables for clarity and modularity.
  const isDivisibleByTwo = (parsedNumber % fixedBaseValue === 0);
  const isDivisibleByThree = (parsedNumber % (fixedBaseValue + 1) === 0); // (fixedBaseValue + 1) evaluates to 3

  // The main condition for this block.
  if (isDivisibleByTwo && isDivisibleByThree) {
    // Calculate the final result using the helper constant.
    const finalCalculatedValue = fixedBaseValue * parsedNumber;
    console.log(finalCalculatedValue);
  } else {
    // --- Added Else Fragment ---
    // This 'else' block is an addition to the original code, providing a default action
    // when the specific divisibility condition is not met.
    console.log("No special divisibility condition was met for the input, outputting a default indicator.");
    // Alternatively, could log a specific default number like 0 or -1.
  }

  // No implicit return if no conditions are met, unlike original which would just end.
  // The added 'else' block ensures an output for all valid inputs.
}

// Do not modify the following infrastructure code. It handles reading input and invoking the main processing function.
// This section is standard boilerplate for competitive programming environments.
processNumericalInput(require("fs").readFileSync("/dev/stdin", "utf8"));