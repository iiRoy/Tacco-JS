function ProcessInput(rawData) {
  // The incoming raw string data is first processed.
  // It's split by spaces and each part is converted into a numerical value.
  let parsedNumbers = rawData.split(" ").map(Number);

  // A conditional check is performed using the first two numerical values.
  // We evaluate if the first number, when multiplied by 500, is greater than or equal to the second number.
  if (parsedNumbers[0] * 500 >= parsedNumbers[1]) {
    // If the condition holds true, a positive confirmation message is displayed.
    console.log("Yes");
  } else {
    // Otherwise, if the condition is false, a negative confirmation message is displayed.
    console.log("No");
  }
}

// The program initiates by reading content from the standard input stream.
// The 'fs' module is utilized to synchronously read the file located at '/dev/stdin',
// interpreting its content as a UTF-8 encoded string.
// This retrieved string data is then passed as an argument to our primary processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
