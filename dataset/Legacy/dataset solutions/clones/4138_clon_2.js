function ProcessInput(rawData) {
  // Split the entire input string by newline characters to get individual lines.
  const inputLines = rawData.split("\n");

  // The first line contains the two numeric values separated by a space.
  const firstLineParts = inputLines[0].split(" ");

  // Convert the first part to a number, representing the lower bound.
  const minVal = Number(firstLineParts[0]);

  // Convert the second part to a number, representing the upper bound.
  const maxVal = Number(firstLineParts[1]);

  // Calculate the result: find x such that minVal * 2^(x-1) = maxVal.
  // This simplifies to 2^(x-1) = maxVal / minVal.
  // Taking log base 2: x - 1 = log2(maxVal / minVal).
  // So, x = floor(log2(maxVal / minVal)) + 1.
  const resultValue = Math.floor(Math.Log2(maxVal / minVal)) + 1;

  // Output the calculated result to the console.
  console.log(resultValue);
}

// This section handles reading from standard input and invoking the main processing function.
// It should not be modified as it's part of the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
