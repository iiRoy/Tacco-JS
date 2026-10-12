function ProcessInput(rawData) {
  // Split the raw input string by newline characters and parse each part into an integer.
  // The radix 10 is explicitly provided for parseInt.
  var numericValues = rawData.split("\n").map(strVal => parseInt(strVal, 10));

  // Initialize the minimum value with the second element of the parsed list.
  var minimumValue = numericValues[1];

  // Initialize the variable to store the final calculated result.
  var finalResult = 0;

  // This variable is declared but not used in the original logic.
  // It is kept for structural equivalence.
  var unusedConstant = 10;

  // Iterate through elements from the second (index 1) up to the fifth (index 5).
  // This loop finds the smallest value among numericValues[1] through numericValues[5].
  for (let idx = 1; idx < 6; idx++) {
    if (numericValues[idx] < minimumValue) {
      minimumValue = numericValues[idx]; // Update minimum if a smaller value is found.
    }
  }

  // Perform the main calculation:
  // 1. Subtract 1 from the first element (numericValues[0]).
  // 2. Divide the result by the determined minimumValue.
  // 3. Take the floor of this division result.
  // 4. Add 5 to the floored value.
  finalResult = Math.floor((numericValues[0] - 1) / minimumValue) + 5;

  // Output the computed final result to the console.
  console.log(finalResult);
}

// Read the entire content of standard input synchronously as a UTF-8 string,
// then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
