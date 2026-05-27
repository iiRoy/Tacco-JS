function ProcessInput(rawData) {
  // Extract the first line from the raw input string.
  const parsedNumber = rawData.split('\n')[0];

  // Check if the number modulo 11 results in 4, 7, or 0.
  if (parsedNumber % 11 === 4 || parsedNumber % 11 === 7 || parsedNumber % 11 === 0) {
    // If the condition is met, print "Yes".
    console.log("Yes");
  } else {
    // Otherwise, print "No".
    console.log("No");
  }
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
