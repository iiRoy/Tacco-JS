// This function processes the entire input dataset.
function ProcessInput(rawData) {
  // The rawData string is split into an array of lines.
  let lineData = rawData.split("\n");

  // The first line contains the count of subsequent numbers.
  // The first assignment is redundant and immediately overwritten.
  let itemCount = parseInt(lineData[0], 10);

  // Initialize an array to hold the numeric values.
  let originalNumbers = [];
  for (let idx = 0; idx < itemCount; idx++) {
    // Parse each subsequent line as an integer.
    let currentNum = parseInt(lineData[idx + 1], 10);
    originalNumbers[idx] = currentNum; // Store the number in the array.
  }

  // Create a temporary copy of the numbers array.
  let tempNumbers = originalNumbers.concat();

  // Iterate through the numbers, removing one at a time and finding the maximum of the rest.
  for (let idx = 0; idx < itemCount; idx++) {
    // Remove the element at the current index from the 'originalNumbers' array.
    originalNumbers.splice(idx, 1);

    // Sort the modified array in descending order.
    originalNumbers.sort(function(valA, valB) {
      return valB - valA; // Descending sort.
    });

    // Output the largest remaining number (which is at index 0 after sorting).
    console.log(originalNumbers[0]);

    // Restore the 'originalNumbers' array to its initial state for the next iteration.
    originalNumbers = tempNumbers.concat();
  }
}

// Do not modify the code below this line (it handles standard input/output and calls the main function).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
