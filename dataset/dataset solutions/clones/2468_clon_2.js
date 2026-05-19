function ProcessInput(rawData) {
  // Split the entire input string by newline characters to get an array of lines.
  let lines = rawData.split("\n");

  // Take the very first line and further split it by spaces to isolate individual string tokens.
  let tokenizedLine = lines[0].split(" ");

  // Convert the first token from the split line into an integer.
  const firstNum = Number.parseInt(tokenizedLine[0]);

  // Convert the second token from the split line into an integer.
  const secondNum = Number.parseInt(tokenizedLine[1]);

  // Evaluate if both parsed numbers are single-digit integers (i.e., between 0 and 9 inclusive).
  if (firstNum <= 9 && secondNum <= 9) {
    // If the condition holds true, compute and display their product.
    console.log(firstNum * secondNum);
  } else {
    // Otherwise, if either number is not a single digit, display -1.
    console.log(-1);
  }
}

// Read the content from standard input synchronously using Node.js file system module,
// then pass the obtained string to our primary processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
