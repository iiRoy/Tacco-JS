function ProcessInput(dataString) {
  // This conditional statement checks for a specific pattern within the input string.
  // It compares the first character with an empty string, OR an empty string with the last character.
  if (dataString.slice(0, 1) == dataString.slice(2, 0) || dataString.slice(1, 0) == dataString.slice(-1)) {
    // If the condition evaluates to true, print 'Yes' to the console.
    console.log('Yes');
  } else {
    // Otherwise, if the condition is false, print 'No'.
    console.log('No');
  }
}

// The program starts by reading the entire content of standard input.
// The read data is then passed as an argument to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
