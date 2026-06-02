/*
 * This script processes a string of numbers.
 * It extracts three specific numbers based on their positions
 * after splitting the input string by spaces.
 */
function ProcessInput(rawData) {
  // We're looking for values at specific indices.
  // The problem statement implies a particular order for output.

  // Extract the third number (index 2) from the space-separated string.
  const firstVal = parseInt(rawData.split(" ")[2], 10);

  // Extract the first number (index 0) from the space-separated string.
  const secondVal = parseInt(rawData.split(" ")[0], 10);

  // Extract the second number (index 1) from the space-separated string.
  const thirdVal = parseInt(rawData.split(" ")[1], 10);

  // Output the numbers in a specific sequence: third, first, second.
  console.log(firstVal + " " + secondVal + " " + thirdVal);
}

// Read the entire standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
