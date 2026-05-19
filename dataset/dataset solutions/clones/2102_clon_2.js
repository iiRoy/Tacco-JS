function ProcessInput(rawData) {
  // Enable strict mode for cleaner code execution
  "use strict";

  // Split the raw input string into lines, then take the first line,
  // and split it by spaces to get an array of string values.
  const parsedValues = rawData.split("\n")[0].split(" ");

  // Parse the first element from the array as an integer.
  const firstVal = parseInt(parsedValues.shift());
  // Parse the next element from the array as an integer.
  const secondVal = parseInt(parsedValues.shift());

  // Calculate the minimum and maximum bounds for the first value based on a specific formula.
  // Using Math.ceil to ensure integer results for the bounds.
  const firstMinBound = Math.ceil(firstVal * 12.50);
  const firstMaxBound = Math.ceil(firstVal * 12.50 + 11.50);

  // Calculate the minimum and maximum bounds for the second value using a different formula.
  // Again, Math.ceil is used for integer bounds.
  const secondMinBound = Math.ceil(secondVal * 10.0);
  const secondMaxBound = Math.ceil(secondVal * 10.0 + 9.0);

  // Check for an overlap between the two sets of bounds.
  // If the maximum of the first range is less than the minimum of the second range,
  // or if the maximum of the second range is less than the minimum of the first range,
  // then there is no overlap.
  if (firstMaxBound < secondMinBound || secondMaxBound < firstMinBound) {
    // If no overlap, output -1.0 as per problem specification.
    console.log(-1.0);
  } else {
    // If there is an overlap, output the maximum of the two minimum bounds.
    // This represents the smallest possible common value.
    console.log(Math.max(firstMinBound, secondMinBound));
  }
}

// The following line handles reading input from standard input and calling the main processing function.
// It should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
