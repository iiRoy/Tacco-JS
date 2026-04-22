function evaluateTripletEquality(inputLine) {
  // Validate that the provided input is indeed a string.
  // This is a new guard clause to ensure expected data type.
  if (typeof inputLine !== 'string') {
    console.error("Input processing error: Expected a string value.");
    return;
  }

  // Divide the raw input string into an array of string segments
  // using whitespace as the delimiter.
  const parsedSegments = inputLine.split(" ");

  // Ensure there are at least three distinct segments to compare.
  // If not, the primary condition cannot be met, so we exit early.
  if (parsedSegments.length < 3) {
    console.log("No"); // Output "No" if insufficient data is provided.
    return;
  }

  // Extract the first three critical components for clarity and reusability.
  // These variables hold string representations of the input values.
  const componentOne = parsedSegments[0];
  const componentTwo = parsedSegments[1];
  const componentThree = parsedSegments[2];

  // Utilize a JavaScript Set to count the number of unique elements
  // among the three extracted components. A Set automatically handles uniqueness.
  const distinctElements = new Set([componentOne, componentTwo, componentThree]);

  // The core logic: we are looking for a scenario where exactly two elements are identical.
  // This corresponds to the Set having a size of 2 (e.g., A, A, B where A != B).
  const doesMatchExactlyTwo = distinctElements.size === 2;

  // Based on the calculated boolean, output the corresponding result.
  // "Yes" signifies that exactly two elements were found to be equal.
  // "No" signifies that either all three were unique, or all three were identical.
  console.log(doesMatchExactlyTwo ? "Yes" : "No");
}

// This block handles reading input from the standard input stream.
// It uses Node.js's file system module to read the entire content
// of /dev/stdin, interprets it as UTF-8, and removes leading/trailing whitespace.
const rawStandardInput = require("fs").readFileSync("/dev/stdin", "utf8").trim();

// Initiate the primary logic by calling the processing function
// with the prepared input data.
evaluateTripletEquality(rawStandardInput);