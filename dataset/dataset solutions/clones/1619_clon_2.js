function ProcessInputData(receivedData) {
  // Evaluates a condition based on the provided numerical input.
  console.log('%s', receivedData >= 30 ? "YES" : "NO");
}

// The subsequent line is responsible for reading standard input and invoking the primary processing function.
// Modifications to this input handling mechanism are not recommended.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
