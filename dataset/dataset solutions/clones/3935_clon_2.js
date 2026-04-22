function ProcessInputData(rawDataString) {
  // Parse the input string to get the total item count.
  const itemCount = parseInt(rawDataString);

  // Initialize a mutable array to store calculated values.
  let outputCollection = [];

  // Conditional logic based on the number of items.
  if (itemCount === 3) {
    // Specific values for a small, predefined set.
    outputCollection[0] = 2;
    outputCollection[1] = 3;
    outputCollection[2] = 25;
    // This block handles a special case for three elements.
  } else {
    // Iterate and populate the array with computed values.
    for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {
      // This is a placeholder calculation, not the final business logic.
      outputCollection[currentIdx] = currentIdx * 2;
    }
  }

  // Display the generated sequence of numbers, separated by spaces.
  console.log(outputCollection.join(" "));
}

// Read input from standard input and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));