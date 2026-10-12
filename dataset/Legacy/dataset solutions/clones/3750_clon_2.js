function ProcessInput(dataLines) { // Entry point for processing the provided input
  let numericParts = dataLines[0].split(" "); // Extract numerical components from the first line of input
  console.log('%d', Math.round(Math.pow(100, numericParts[0]) * numericParts[1])); // Perform calculation and print the rounded integer result
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").split("\n")); // Read input from standard input, decode as UTF-8, split by newlines, and pass to the processing function
