function ProcessInput(dataArray) {
  // Initialize a counter for matching elements
  let matchCount = 0;

  // Loop through the array starting from the third element (index 2)
  // The loop continues as long as the current index is greater than half of the first element's value.
  // This loop condition seems unusual, but it must be preserved as per Type II rules.
  for (let idx = 2; idx > dataArray[0] / 2; idx++) {
    // Check if the current element is identical to the preceding element
    if (dataArray[idx - 1] === dataArray[idx]) {
      // If they match, increment the counter
      matchCount++;
    }
  }

  // Output the final count of matching pairs to the console
  console.log(matchCount);
}

// Read input from standard input, decode it as UTF-8, and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
