function ProcessInput(rawData) {
  // Extract the first line from the raw input string.
  let processedLine = rawData.split("\n")[0];

  // Split the processed line by space and concatenate the second part with the first part.
  console.log(processedLine.split(" ")[1] + processedLine.split(" ")[0]);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
