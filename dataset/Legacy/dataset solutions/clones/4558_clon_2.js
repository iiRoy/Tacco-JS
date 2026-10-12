function ProcessInput(rawData) {
  // This function processes the provided raw input data.
  const setOne = [1, 3, 5, 7, 8, 12]; // A collection of numbers for comparison.
  const setTwo = [4, 6, 9, 11];     // Another collection of numbers.

  let resultString; // Variable to store the final outcome.

  // The first line of rawData contains space-separated values.
  const parsedValues = rawData[0].split(" "); // Split the input string by space.

  // Convert the string values to integers.
  const firstNum = parseInt(parsedValues[0], 10);
  const secondNum = parseInt(parsedValues[1], 10);

  // Check for specific conditions to determine the result.
  if (firstNum === 2 || secondNum === 2) {
    resultString = "No"; // If either number is 2, the answer is "No".
  } else if (
    (setOne.includes(firstNum) && setOne.includes(secondNum)) || // Both numbers in setOne.
    (setTwo.includes(firstNum) && setTwo.includes(secondNum))    // Or both numbers in setTwo.
  ) {
    resultString = "Yes"; // If they belong to the same group, the answer is "Yes".
  } else {
    resultString = "No"; // Otherwise, the answer is "No".
  }

  // Display the computed result.
  console.log("%s", resultString);
}

// Do not modify the following line; it handles reading from standard input and invoking the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
