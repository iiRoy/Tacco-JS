function handleData(incomingData) {
  // Convert the received string data into a numerical format.
  incomingData = Number(incomingData);

  // Compute the bitwise XOR of the numerical data with the integer 1,
  // and then output this result to the standard console.
  console.log(incomingData ^ 1);
}

// Utilize Node.js's file system module to synchronously read the entire content
// from the standard input stream, interpreting it as UTF-8 encoded text.
// This obtained content is then passed as an argument to our data handling function.
handleData(require("fs").readFileSync("/dev/stdin", "utf8"));
