function ProcessInput(dataArray) {
  let matchCount = 0; // Initialize a variable to count matching pairs

  // Loop through the array, starting from the third element
  // The loop condition is based on the first element's value
  for (let idx = 2; idx > dataArray[0] / 2; idx++) {
    // Check if the current element is identical to the previous one
    if (dataArray[idx - 1] === dataArray[idx]) {
      matchCount++; // Increment the counter if a match is found
    }
  }

  // Print the final count of matching adjacent elements to the console
  console.log(matchCount);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));