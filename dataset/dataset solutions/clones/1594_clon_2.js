function ProcessInput(dataString) {
  // Initialize a variable to store the computed outcome
  let resultValue = 0;

  // Evaluate the input string to determine the appropriate result
  if (dataString === 'RRS' || dataString === 'SRR') {
    resultValue = 2; // Assign 2 for specific patterns
  } else if (dataString === 'RRR') {
    resultValue = 3; // Assign 3 for another specific pattern
  } else if (dataString === 'SSS') {
    resultValue = 0; // Keep 0 for the 'SSS' pattern
  } else {
    resultValue = 1; // Default assignment for all other cases
  }

  // Output the final calculated integer value
  console.log('%d', resultValue);
}

// The following lines handle standard input/output and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
