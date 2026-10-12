function ProcessData(receivedText) {
  // Check if the first line of the input starts with "YAKI"
  console.log(receivedText.split("\n")[0].indexOf("YAKI") === 0 ? "Yes" : "No");
}

/*
 * Do not modify the following lines.
 * This section handles reading from standard input and invoking the primary function.
 */
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
