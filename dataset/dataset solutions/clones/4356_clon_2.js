function processInput(dataString) {
  // This function processes the provided string data.
  console.log("ABC" + dataString); // Outputs a concatenated string to the console.
}

// Read input from standard input using Node.js file system module.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
