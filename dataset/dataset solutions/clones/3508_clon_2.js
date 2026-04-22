'use strict'; // This directive enforces strict mode for the entire script.

// Define a constant arrow function to encapsulate the primary logic.
// This function takes a single argument, representing the raw data received.
const handleInputAndCalculate = (incomingTextualData) => {

  // First, convert the input textual data into a numerical format.
  // Using the Number() constructor ensures a proper numeric type, handling various string inputs.
  let numericRepresentation = Number(incomingTextualData);

  // Perform the core computation:
  // 1. Divide the numeric value by the constant 111.
  // 2. Apply Math.ceil to round the result upwards to the nearest whole number.
  // 3. Multiply this rounded value by 111 to get the desired ceiling multiple.
  // We use 111.0 to explicitly indicate floating-point division, though it behaves similarly with integers.
  console.info(Math.ceil(numericRepresentation / 111.0) * 111.0);
};


// Execute the main processing flow:
// 1. Utilize Node.js's built-in 'fs' module (prefixed with 'node:' for clarity/modern practice)
//    to synchronously read the content from the standard input stream ('/dev/stdin').
// 2. Specify 'utf8' encoding to correctly interpret the input characters.
// 3. Pass the entirely read content (a string) to our `handleInputAndCalculate` function for processing.
handleInputAndCalculate(
  require('node:fs').readFileSync(
    '/dev/stdin',
    'utf8'
  )
);