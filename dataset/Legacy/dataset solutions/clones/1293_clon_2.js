function processInput(rawData) {
  // Split the entire raw input string into individual lines based on newline characters.
  let inputLines = rawData.split("\n");

  // Initialize an index to iterate through the processed lines.
  let lineIndex = 0;

  // Continue processing lines until a specific termination string "0 0" is encountered.
  while (inputLines[lineIndex] !== "0 0") {
    // Initialize a counter for valid combinations found in the current line's data.
    let validTriplets = 0;

    // Parse the current line's string into an array of integers.
    // First, split the line by spaces, then convert each part to an integer.
    let currentNumbers = parseNumbers(inputLines[lineIndex].split(" "));

    // The outer loop iterates for the first number of the triplet, from 1 up to the maximum allowed value (currentNumbers[0]).
    for (let firstNum = 1; firstNum <= currentNumbers[0]; firstNum++) {
      // The middle loop iterates for the second number, starting from the value of the first number
      // to ensure unique combinations and avoid duplicates (e.g., (1,2) vs (2,1) if order doesn't matter).
      for (let secondNum = firstNum; secondNum <= currentNumbers[0]; secondNum++) {
        // Calculate the third number required to sum up to currentNumbers[1].
        let thirdNum = currentNumbers[1] - firstNum - secondNum;

        // Check if any two numbers in the potential triplet are identical.
        // If they are, this combination is not valid according to the problem's criteria, so skip to the next iteration.
        if (firstNum === secondNum || secondNum === thirdNum || firstNum === thirdNum) {
          continue;
        }

        // Check if the calculated third number is within the valid range (1 to currentNumbers[0])
        // and if it is strictly greater than the second number to maintain distinctness and order.
        if (thirdNum <= currentNumbers[0] && thirdNum > secondNum) {
          // If all conditions are met, increment the counter for valid triplets.
          validTriplets++;
        }
      }
    }

    // Output the total count of valid triplets found for the current input line.
    console.log(validTriplets);

    // Move to the next line in the input.
    lineIndex++;
  }
}

// Helper function to convert an array of strings to an array of integers.
function parseNumbers(stringArray) {
  // Use the map method to apply parseInt to each element of the array.
  return stringArray.map((strNum) => parseInt(strNum));
}

// Read input from standard input, decode it as UTF-8, and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf-8"));
