function ProcessInput(rawData) {
  // Output the initial three characters from the received string.
  console.log(rawData.substring(0, 3));
}

// Do not alter the code below this line; it handles reading from standard input and invoking the main function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
