// The entire incoming stream of characters is contained within the dataSource variable.
function ProcessData(dataSource) {
  // Define constant arrays representing two distinct categories of numbers.
  const firstCollection = [1, 3, 5, 7, 8, 12];
  const secondCollection = [4, 6, 9, 11];

  let finalVerdict; // This variable will store the ultimate determination.

  // The initial line of the input is found at dataSource[0].
  const parsedInputTokens = dataSource[0].split(" "); // The raw string is broken into components.

  const valueOne = parseInt(parsedInputTokens[0], 10); // Convert the initial token to an integer.
  const valueTwo = parseInt(parsedInputTokens[1], 10); // Convert the subsequent token to an integer.

  // Evaluate conditions based on the parsed numerical values.
  if (valueOne === 2 || valueTwo === 2) {
    finalVerdict = "No"; // If either value is two, the condition is not met.
  } else if (
    (firstCollection.indexOf(valueOne) >= 0 &&
      firstCollection.indexOf(valueTwo) >= 0) ||
    (secondCollection.indexOf(valueOne) >= 0 &&
      secondCollection.indexOf(valueTwo) >= 0)
  ) {
    finalVerdict = "Yes"; // Both values are in the same collection.
  } else {
    finalVerdict = "No"; // Otherwise, the condition is not met.
  }

  // Display the computed outcome.
  console.log("%s", finalVerdict);
}

// *** Do not modify the following section (it handles standard input/output and invokes the primary processing function). ***
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));