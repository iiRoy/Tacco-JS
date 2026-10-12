function ProcessInput(dataString) {
  // Check the character at index 1 of the provided string.
  if (dataString[1] === 'B') {
    // If it's 'B', output 'ARC' to the console.
    console.log('ARC');
  }

  // Perform another check on the same character.
  if (dataString[1] === 'R') {
    // If it's 'R', output 'ABC' to the console.
    console.log('ABC');
  }
}

// Read the entire content from standard input as a UTF-8 string
// and then pass it to our main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
