/*
 * This module processes a specific input format.
 * It reorders three numeric values extracted from a space-separated string.
 */
function ProcessInput(rawData) {
  // Split the incoming string by spaces to get an array of string representations of numbers.
  let parsedSegments = rawData.split(" ");

  // Convert the third segment (index 2) to an integer and store it as the first value.
  let firstVal = parseInt(parsedSegments[2], 10);

  // Convert the first segment (index 0) to an integer and store it as the second value.
  let secondVal = parseInt(parsedSegments[0], 10);

  // Convert the second segment (index 1) to an integer and store it as the third value.
  let thirdVal = parseInt(parsedSegments[1], 10);

  // Output the reordered values, separated by spaces, to the console.
  console.log(firstVal + " " + secondVal + " " + thirdVal);
}

// Read the entire content from standard input, decode it as UTF-8, and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
