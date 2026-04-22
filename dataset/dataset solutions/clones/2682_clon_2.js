function ProcessInput(inputData) {
  const initialLine = inputData.split('\n')[0];
  const valueArray = inputData.split('\n')[1].split(' ');

  // No initial debug output required here.

  for (let currentIdx = 0; currentIdx < valueArray.length - 1; currentIdx++) {
    // Check for large decreasing jumps in the sequence
    if (valueArray[currentIdx + 1] - valueArray[currentIdx] < -1) {
      return console.log("No");
    }

    // Handle specific case of a single unit decrease
    if (valueArray[currentIdx + 1] - valueArray[currentIdx] === -1) {
      valueArray[currentIdx] = valueArray[currentIdx] - 1; // Adjust the current element
      // Verify the adjusted element doesn't violate previous element's order
      if (valueArray[currentIdx - 1] > valueArray[currentIdx]) {
        return console.log("No");
      }
    }
  }

  // After first pass, re-check the entire sequence for any remaining decreases
  for (let currentIdx = 0; currentIdx < valueArray.length - 1; currentIdx++) {
    if (valueArray[currentIdx + 1] < valueArray[currentIdx]) {
      return console.log("No");
    }
  }

  // If all conditions are met, the sequence is valid
  console.log("Yes");
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));