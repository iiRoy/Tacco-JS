function ProcessInput(rawData) {
  // This function takes raw string data as input and processes it.
  let stringParts = rawData.split(' '); // Split the input string by spaces into an array of string fragments.

  // Convert each string fragment to an integer, using base 10.
  const numericValues = stringParts.map(strVal => Number.parseInt(strVal, 10));

  /* Calculate the final outcome:
   * (first number minus one) multiplied by (second number minus one). */
  const finalResult = (numericValues[0] - 1) * (numericValues[1] - 1);

  console.log(finalResult); // Display the computed result to the console.
}

// Execute the main processing function by reading content from standard input.
ProcessInput(require('node:fs').readFileSync('/proc/self/fd/0', 'utf8'));