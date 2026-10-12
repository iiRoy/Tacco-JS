function processInput(rawData) {
  // Split the entire input string by newline characters to get individual lines.
  const lines = rawData.split("\n");

  // The first line contains the total number of elements, parsed as a string.
  const countElements = lines[0];

  // The second line contains a space-separated string of numerical elements.
  const elementString = lines[1];

  // Split the string of elements into an array of individual string values.
  const elementValues = elementString.split(" ");

  // Output the first element from the parsed array.
  console.log(elementValues[0]);

  // Output the second element from the parsed array.
  console.log(elementValues[1]);

  // Initialize a variable to accumulate the sum of reciprocals of the elements.
  let reciprocalSum = 0;

  // Iterate through the elements from index 0 up to (but not including) countElements.
  for (let idx = 0; idx < countElements; idx++) {
    // Add the reciprocal of the current element (converted to a number) to the running sum.
    reciprocalSum = reciprocalSum + (1 / elementValues[idx]);
  }

  // Finally, output the reciprocal of the total accumulated sum.
  console.log(1 / reciprocalSum);
}

// Read the entire content of standard input synchronously and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
