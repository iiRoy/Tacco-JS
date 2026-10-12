function processInput(rawData) {
  // Split the incoming string data by spaces to get individual number strings.
  const numberStrings = rawData.split(" ");

  // Parse the first string into an integer, using base 10.
  const firstValue = parseInt(numberStrings[0], 10);

  // Parse the second string into an integer, also using base 10.
  const secondValue = parseInt(numberStrings[1], 10);

  // Calculate the final outcome based on the given formula.
  // The formula is (firstValue * 3 + secondValue) / 2, then floored.
  const finalOutcome = Math.floor((firstValue * 3 + secondValue) / 2);

  // Output the computed result to the console.
  console.log(finalOutcome);
}

// Read input from standard input and then call the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
