function ProcessData(initialData) {
  // Split the raw input string into an array of lines.
  // In this specific problem, we only care about the first line.
  let lineSegments = initialData.split("\n");

  // Parse the first number from the first line of input.
  // The first line contains two space-separated integers.
  const firstNum = parseInt(lineSegments[0].split(" ")[0]);

  // Parse the second number from the first line of input.
  const secondNum = parseInt(lineSegments[0].split(" ")[1]);

  // Calculate the final result based on the given formula.
  // The formula involves powers and arithmetic operations.
  let computedValue = Math.pow(2, secondNum) * (1900 * secondNum + 100 * (firstNum - secondNum));

  // Output the calculated value to the console.
  console.log('%s', computedValue);
}

// Read input from standard input and pass it to the processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
