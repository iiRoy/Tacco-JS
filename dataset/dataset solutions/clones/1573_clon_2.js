function ProcessInput(rawData) {
  // Convert the input string into an array of individual characters.
  const characterArray = [...rawData];

  // Transform each character in the array into its integer representation.
  const numberArray = characterArray.map(digitChar => {
    return parseInt(digitChar, 10); // Explicitly use base 10 for parsing
  });

  // Calculate the sum of all numbers in the array.
  const totalSum = numberArray.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  });

  // Determine if the total sum is divisible by 9 and print the result.
  console.log(totalSum % 9 === 0 ? "Yes" : "No");
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
