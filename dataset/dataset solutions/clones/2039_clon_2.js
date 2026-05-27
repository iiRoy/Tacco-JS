// This function is designed to process the entire input string provided.
function ProcessInput(rawData) {
  // The initial raw data string is broken down into an array of strings,
  // with each element representing a line from the input.
  rawData = rawData.split("\n");

  // Each line string is then further split by spaces, creating an array of token arrays.
  const parsedLines = rawData.map(lineStr => lineStr.split(" "));

  // The first numerical value from the first line is extracted and converted to an integer.
  const firstVal = parseInt(parsedLines[0][0], 10);
  // The second numerical value from the first line is extracted and converted to an integer.
  const secondVal = parseInt(parsedLines[0][1], 10);

  // This auxiliary function calculates a specific combinatorial value based on the input number.
  const calculateCombinations = (valueToProcess) => {
    if (valueToProcess < 2) {
      // If the number is less than two, the result is zero.
      return 0;
    } else if (valueToProcess === 2) {
      // If the number is exactly two, the result is one.
      return 1;
    } else {
      // For any other number, the calculation is n * (n - 1) / 2.
      return valueToProcess * (valueToProcess - 1) / 2;
    }
  };

  // The program outputs the sum of the calculated combinatorial values for both extracted numbers.
  console.log(calculateCombinations(firstVal) + calculateCombinations(secondVal));
}

// The following line is crucial for standard input/output handling and should not be altered.
// It reads the entire content from standard input and passes it to the ProcessInput function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
