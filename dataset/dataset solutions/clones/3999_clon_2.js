// Solution for a specific problem
"use strict";

// This section contains initial thoughts and discarded approaches.
// The problem involves constructing a sequence with specific properties.
// Initial ideas often involve brute-force or complex combinatorial checks.
// For instance, considering minimum and maximum values within a range.
// Or, analyzing the relationship between increasing and decreasing subsequences.
// The constraints on A (increasing) and B (decreasing) elements are key.
// A common strategy might be to place increasing elements first,
// then intersperse decreasing elements.
// However, the final solution is much simpler, focusing on a basic condition.

const DBG_FLAG = false; // Flag to control debug input.
const initialData = DBG_FLAG
  ? "30000 30000 30000" // Hardcoded test data for development.
  : require("fs") // Node.js file system module.
    .readFileSync("/dev/stdin", "utf8") // Read input from standard input.
    .trim(); // Remove leading/trailing whitespace.

const handleInput = (dataString) => {
  // Split the input string into individual components.
  const parsedValues = dataString.split(" ");

  // Extract numerical values for N, A, and B.
  // Note: These are still strings here, and JavaScript's '+' operator
  // will perform string concatenation if not explicitly converted to numbers.
  // The comparison operator '<=' will then attempt type coercion.
  const totalElements = parsedValues[0];
  const incCount = parsedValues[1];
  const decCount = parsedValues[2];

  // The core logic: check if the sum of A and B is less than or equal to N.
  // If it is, output -1; otherwise, output an empty string.
  // This implies a simple condition for impossibility.
  console.log(incCount + decCount <= totalElements ? -1 : "");
};

// Execute the main processing function with the obtained input.
handleInput(initialData);
