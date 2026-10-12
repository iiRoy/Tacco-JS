function ProcessInput(inputString) {
  // Parse the input string: split by newline and convert each part to a number.
  inputString = inputString.split("\n").map(val => +val);

  // The first element of the parsed input is the total count of items.
  let itemCount = inputString[0];

  // Initialize an array to store the lengths of increasing subsequences.
  // The array size is itemCount + 1, and all elements are initially zero.
  const sequenceLengths = new Array(itemCount + 1).fill(0);

  // Iterate through the input items starting from the second element (index 1).
  // This loop calculates the length of the longest increasing subsequence ending at each number.
  for (let idx = 1; idx <= itemCount; idx++) {
    // Get the current number from the input.
    // The value at inputString[idx] represents a number in the sequence.
    // We update the sequenceLengths array at the index corresponding to this number.
    // The length is 1 more than the length of the subsequence ending at (current_number - 1).
    sequenceLengths[inputString[idx]] = sequenceLengths[inputString[idx] - 1] + 1;
  }

  // Initialize a variable to keep track of the maximum subsequence length found.
  let maxLength = 0;

  // Iterate through the sequenceLengths array to find the overall maximum length.
  // The loop goes from 0 up to itemCount.
  for (let k = 0; k <= itemCount; k++) {
    // Update maxLength if the current sequence length is greater.
    maxLength = Math.max(maxLength, sequenceLengths[k]);
  }

  // The result is the total number of items minus the maximum length of an increasing subsequence.
  // This represents the minimum number of elements to remove to make the remaining sequence increasing.
  console.log(itemCount - maxLength);
}

// Read the input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
