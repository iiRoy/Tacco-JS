function ProcessInput(rawData) {
  // Remove any leading or trailing whitespace from the received string.
  rawData = rawData.trim();

  // The following line is commented out, indicating an alternative data processing
  // that is not currently active in this version of the code.
  // rawData = rawData.split(" ").map(Number);

  // Calculate a specific value based on the processed input and print it to the console.
  // The calculation involves adding 24 to the result of subtracting the input from 24.
  console.log(24 + (24 - rawData));
}

// Obtain the raw data by reading the entire content of standard input as a UTF-8 string,
// and then pass this data to our primary processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
