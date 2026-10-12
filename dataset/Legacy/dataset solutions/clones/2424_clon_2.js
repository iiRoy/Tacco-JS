function processInput(incomingData) {
  // Calculate the square of the provided numeric input
  console.log(incomingData * incomingData);
}

// Read data from standard input, decode it as UTF-8, and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
