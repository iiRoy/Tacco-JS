function ProcessInput(rawData) {
  // This function processes raw input data.
  // It expects a string of space-separated numbers.
  let parsedNumbers = rawData.split(' ').map((currentValue) => parseInt(currentValue, 10));

  /*
   * The original code had commented out lines for individual parsing:
   * let firstNum = parseInt(parsedNumbers[0], 10);
   * let secondNum = parseInt(parsedNumbers[1], 10);
   * let thirdNum = parseInt(parsedNumbers[2], 10);
   */

  // Output the sum of the first two parsed numbers.
  console.log(parsedNumbers[0] + parsedNumbers[1]);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf-8"));
