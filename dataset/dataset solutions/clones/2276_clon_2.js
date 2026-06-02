function ProcessInput(rawData) {
  // Convert the raw input to a string and then split it by spaces.
  const parsedValues = rawData.toString().split(" ");

  // Assign the first element to itemCount and the second to targetValue.
  const itemCount = parsedValues[0];
  const targetValue = parsedValues[1];

  // Output the two extracted values.
  console.log(itemCount, targetValue);

  // Evaluate a condition and print "YES" or "NO" based on the result.
  console.log(500 * itemCount > targetValue ? "YES" : "NO");
}

// This section reads from standard input and calls the main processing function.
// It should remain unchanged to ensure proper execution in the environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
