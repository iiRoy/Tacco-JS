function ProcessInput(rawData) {
  // Convert the raw input string into an array of individual characters.
  const characterSequence = [...rawData];

  // Transform each character into its integer representation.
  const numericValues = characterSequence.map(currentDigitChar => {
    // Use parseInt to convert the character string to a number.
    return parseInt(currentDigitChar, 10); // Explicitly specify base 10 for clarity.
  });

  // Calculate the total sum of all the numeric values.
  const totalSum = numericValues.reduce((accumulator, currentNumber) => {
    // Add the current number to the running total.
    return accumulator + currentNumber;
  });

  // Determine if the total sum is divisible by 9 and print the result.
  console.log(totalSum % 9 === 0 ? "Yes" : "No");
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
