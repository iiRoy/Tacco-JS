function processInput(rawData) {
  // Remove any leading or trailing whitespace from the raw input string.
  rawData = rawData.trim();

  // Split the cleaned string by spaces and convert each part to a number.
  // This extracts the three numerical values required for the comparison.
  const [valX, valA, valB] = rawData.split(" ").map(Number);

  // Calculate the absolute difference between valX and valA.
  // Then, calculate the absolute difference between valX and valB.
  // Compare these two absolute differences to determine which value is closer to valX.
  if (Math.abs(valX - valA) < Math.abs(valX - valB)) {
    // If valA is strictly closer to valX, output "A".
    console.log("A");
  } else {
    // Otherwise (if valB is closer or if both are equidistant), output "B".
    console.log("B");
  }
}

// The program initiates by reading input from standard input.
// It uses Node.js's 'fs' module to synchronously read the file content.
// The input is expected to be UTF-8 encoded.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
