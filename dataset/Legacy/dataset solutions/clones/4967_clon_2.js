function ProcessInput(rawData) {
  // This function takes raw input and processes it to calculate a specific value.
  // First, we split the entire input string by newline characters.
  rawData = rawData.split("\n");

  // We extract three numerical values from the first three lines of the input.
  // The '-0' operation is a concise way to convert a string to a number in JavaScript.
  const firstVal = rawData[0] - 0; // Represents the first base of a trapezoid.
  const secondVal = rawData[1] - 0; // Represents the second base of a trapezoid.
  const heightVal = rawData[2] - 0; // Represents the height of the trapezoid.

  // Calculate the area of the trapezoid using the formula: (base1 + base2) * height / 2.
  // The result is then printed to the console.
  console.log((firstVal + secondVal) * heightVal / 2);
}

// The following line is crucial for competitive programming environments.
// It reads the entire content from standard input, typically a file,
// and passes it as a string to our main processing function.
// This part should not be altered as it handles the I/O mechanism.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
