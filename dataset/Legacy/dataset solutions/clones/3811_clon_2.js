function ProcessData(rawData) {
  // Split the initial string by spaces to get an array of string components.
  rawData = rawData.split(" ");

  // Take the fourth component (index 3), split it into individual characters,
  // and then convert each character into a numerical digit.
  rawData[3] = rawData[3].split("").map(Number);

  // From the array of digits, extract only the very last digit.
  rawData[3] = rawData[3][rawData[3].length - 1];

  // Determine the output based on the parity of the extracted last digit.
  // If the last digit is odd, calculate the difference between the second and first components.
  // Otherwise (if it's even), calculate the difference between the first and second components.
  console.log(rawData[3] % 2 === 1 ? rawData[1] - rawData[0] : rawData[0] - rawData[1]);
}

// Read input from standard input, decode it as UTF-8, remove leading/trailing whitespace,
// and then pass it to the primary data processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
