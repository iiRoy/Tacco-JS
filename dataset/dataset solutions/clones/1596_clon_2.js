function ProcessInput(rawData) {
  // Trim leading/trailing whitespace from the raw input string
  const processedString = rawData.trim();

  if (processedString.includes("RRR")) {
    console.log(3); // Output 3 if "RRR" is found
  } else if (processedString.includes("RR")) {
    console.log(2); // Output 2 if "RR" is found (but not "RRR")
  } else if (processedString.includes("R")) {
    console.log(1); // Output 1 if "R" is found (but not "RR" or "RRR")
  } else {
    console.log(0); // Output 0 if no "R" is found
  }
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
