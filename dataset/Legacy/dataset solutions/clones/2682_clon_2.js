function ProcessInput(inputData) {
  // Extract the first line from the input string.
  const initialLine = inputData.split('\n')[0];
  // Extract the second line, then split it into an array of strings by spaces.
  const dataSequence = inputData.split('\n')[1].split(' ');

  // The following lines were commented out in the original code,
  // so they remain commented here to preserve behavior.
  // console.log(initialLine);
  // console.log(dataSequence);

  // Iterate through the sequence, checking conditions between adjacent elements.
  for (let idx = 0; idx < dataSequence.length - 1; idx++) {
    // If the difference between the current element and the next is less than -1,
    // it indicates an invalid pattern.
    if (dataSequence[idx + 1] - dataSequence[idx] < -1) {
      return console.log("No"); // Output "No" and terminate the function.
    }

    // If the difference is exactly -1, a specific modification and check are performed.
    if (dataSequence[idx + 1] - dataSequence[idx] === -1) {
      // Decrement the current element's value.
      dataSequence[idx] = dataSequence[idx] - 1;
      // After modification, check if the previous element (if it exists) is greater than the current.
      // This check is crucial for maintaining the sequence's property.
      if (dataSequence[idx - 1] > dataSequence[idx]) {
        return console.log("No"); // If this condition is met, output "No" and terminate.
      }
    }
  }

  // After the first set of checks and potential modifications,
  // log the current state of the data sequence. This is part of the observable output.
  console.log(dataSequence);

  // Second validation pass: Ensure the sequence is non-decreasing after all operations.
  for (let idx = 0; idx < dataSequence.length - 1; idx++) {
    // If any element is found to be greater than its successor, the sequence is invalid.
    if (dataSequence[idx + 1] < dataSequence[idx]) {
      return console.log("No"); // Output "No" and terminate.
    }
  }

  // If all checks pass without returning "No", the sequence is considered valid.
  console.log("Yes");
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
