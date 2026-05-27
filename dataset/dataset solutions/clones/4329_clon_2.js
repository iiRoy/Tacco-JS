function ProcessInput(receivedData) {
  // Check if the first line of the input starts with "YAKI"
  console.log(receivedData.split("\n")[0].indexOf("YAKI") === 0 ? "Yes" : "No");
}

/*
 * The following line handles reading from standard input and invoking the primary processing function.
 * It should not be modified to ensure proper execution in the given environment.
 */
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
