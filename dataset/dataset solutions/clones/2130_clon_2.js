function ProcessInput(rawData) {
  // Split the raw input string by space to get individual components.
  const parts = rawData.split(' ');

  // Convert the first part to a numeric value, representing the number to be processed.
  const currentNumber = +parts[0];

  // Convert the second part to a numeric value, representing the base or divisor.
  const baseValue = +parts[1];

  // Initialize an empty string to accumulate the digits in the new base.
  let outputString = '';

  // Loop as long as the current number is greater than zero.
  while (currentNumber > 0) {
    // Append the remainder of the current number divided by the base value to the output string.
    // This effectively gets the next digit in the new base.
    outputString += currentNumber % baseValue;

    // Update the current number by performing integer division (floor) by the base value.
    // This prepares the number for extracting the next digit.
    currentNumber = Math.floor(currentNumber / baseValue);
  }

  // Output the length of the resulting string, which represents the count of digits in the new base.
  console.log(outputString.length);
}

// The following line handles reading from standard input and invoking the main processing function.
// This part should not be modified as per the problem's instructions.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
