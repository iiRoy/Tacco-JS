/**
 * This module computes the minimum total absolute difference between three numbers
 * based on all possible permutations of their indices.
 * It's designed to work with a space-separated string of three integers.
 */
function CalculateMinDistance(dataString) {
  // Parse the input string into an array of numbers.
  // The `~~` operator is a concise way to convert to integer (bitwise NOT twice).
  let numericValues = dataString.split(" ").map(currentVal => ~~currentVal);

  // Define all 6 permutations of indices (0, 1, 2) as strings.
  const indexPermutations = ["012", "021", "102", "120", "201", "210"];

  // Map each permutation string to its corresponding total absolute difference.
  const differences = indexPermutations.map(function(permutationStr) {
    // Convert the permutation string (e.g., "012") into an array of numbers (e.g., [0, 1, 2]).
    let currentPermutation = permutationStr.split("").map(digitChar => ~~digitChar);

    // Calculate the sum of absolute differences for the current permutation:
    // |value[p0] - value[p1]| + |value[p1] - value[p2]|
    return Math.abs(numericValues[currentPermutation[0]] - numericValues[currentPermutation[1]]) +
           Math.abs(numericValues[currentPermutation[1]] - numericValues[currentPermutation[2]]);
  });

  // Return the smallest difference found among all permutations.
  return Math.min(...differences);
}

/*
 * This section handles environment-specific execution.
 * It detects if it's running in a Node.js environment or a browser.
 * In Node.js, it reads from stdin and prints to console.
 * In a browser, it displays the input and output in textareas.
 */
((rawInput, processedResult, resultType) => {
  if (typeof require !== "undefined") { // Check for Node.js environment
    const fileSystem = require("fs");
    const standardInput = fileSystem.readFileSync("/dev/stdin", "utf8");
    console.log(CalculateMinDistance(standardInput));
  } else { // Assume browser environment
    // Process the raw input string for browser display.
    rawInput = rawInput.split("\n").slice(1, -1).join("\n");

    // Execute the main logic and capture any errors.
    processedResult = (() => {
      try {
        return CalculateMinDistance(rawInput);
      } catch (errorObject) {
        return errorObject.stack || errorObject.message;
      }
    })();

    // Determine the type of the result.
    resultType = typeof processedResult;

    // If the result is not a string, convert it to JSON for display.
    if (resultType !== "string") {
      processedResult = JSON.stringify(processedResult);
    }

    // Use jQuery to create and append elements to the body for display.
    // This part is for a specific browser-based testing setup.
    $("<form>")
      .append(
        [
          [10, rawInput],
          0,
          [1, resultType],
          0,
          [10, processedResult]
        ].map(elementConfig =>
          $(
            elementConfig ? "<textarea>" : "<br>",
            elementConfig && {
              rows: elementConfig[0],
              cols: 40,
              text: elementConfig[1]
            }
          )
        )
      )
      .appendTo("body");
  }
})(`
1 6 3
`);
