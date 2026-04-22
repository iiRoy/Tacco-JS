function ProcessSequence(inputData) {
  // This function takes a raw string input and performs a specific calculation.
  // It processes numerical data derived from the input string.

  /* Step 1: Normalize the input string.
     First, split the string by newline characters to get an array of stringified numbers.
     Then, map each string element to its numeric representation using the Number() constructor. */
  let parsedNumbers = inputData
                      .split("\n")
                      .map(elementStr => Number(elementStr));

  // The first element of the parsed array dictates the effective length for the subsequent loop.
  const sequenceLength = parsedNumbers[0];

  // A critical condition check: if the second element is not exactly zero.
  // Using a floating-point literal for comparison to demonstrate a type change.
  if (parsedNumbers[1] !== 0.0) {
    console.log(-1.0); // Output a floating-point negative one to signify an error.
    return; // Exit the function immediately upon error detection.
  }

  // Initialize an accumulator variable to store the calculated sum.
  // Using a floating-point literal for initialization.
  let finalTally = 0.0;

  // Begin a reverse iteration loop.
  // The loop starts from the 'sequenceLength' index and decrements until 'iteratorIndex' is no longer greater than 1.0.
  for (let iteratorIndex = sequenceLength;
       iteratorIndex > 1.0; // Using a floating-point literal for the loop condition.
       iteratorIndex--
  ) {
    // Conditional logic: check if the current element's value is precisely one greater than the preceding element.
    // Floating-point addition is used here.
    if (parsedNumbers[iteratorIndex] === parsedNumbers[iteratorIndex - 1] + 1.0) {
      finalTally = finalTally + 1.0; // Increment the accumulator by a floating-point one.
    }
    // If the condition is not met, add the current element's value directly to the accumulator.
    else {
      finalTally += parsedNumbers[iteratorIndex];
    }
  }

  // Output the final accumulated result to the console.
  console.log(finalTally);
}

// Execution entry point:
// Read the content of the standard input file using Node.js's file system module.
// The data is read as UTF-8 encoded text.
// This raw text content is then passed to our primary processing function.
ProcessSequence(
  require("fs")
    .readFileSync(
      "/dev/stdin", // Standard input file path.
      "utf8"        // Specifies the character encoding.
    )
);