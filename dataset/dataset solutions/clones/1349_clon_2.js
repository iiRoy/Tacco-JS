function ProcessInputAndCube(inputData) {
  // This function computes the cube of the provided numeric value
  // and then outputs the result to the standard console.
  console.log(inputData * inputData * inputData);
}

// The program starts by reading content from standard input.
// The 'fs' module is used to synchronously read the file located at /dev/stdin.
// The content is expected to be encoded in UTF-8.
// After reading, the obtained string value is passed to our main processing function.
ProcessInputAndCube(require("fs").readFileSync("/dev/stdin", "utf8"));
