function ProcessInput(inputData) {
  // Split the input string into an array of lines
  const lines = inputData.split("\n");

  // Parse the first line as an integer, representing the total number of items
  const totalCount = parseInt(lines[0], 10);

  // Calculate the midpoint for comparison
  const midpoint = totalCount / 2;

  // Get the second line, which contains the sequence of characters
  const sequence = lines[1];

  // Initialize a boolean flag to store the final outcome
  let resultFlag = false;

  // Initialize counters for 'R' and 'B' characters
  let redCount = 0;
  let blueCount = 0;

  // Iterate through each character in the sequence
  for (let idx = 0; idx < totalCount; idx++) {
    const currentChar = sequence[idx]; // Get the character at the current index

    // Check if the current character is 'R'
    if (currentChar === 'R') {
      redCount++; // Increment the 'R' counter
      // If 'R' count exceeds the midpoint, set result to true and exit
      if (redCount > midpoint) {
        resultFlag = true;
        break;
      }
    } else {
      blueCount++; // Increment the 'B' counter
      // If 'B' count reaches or exceeds the midpoint, set result to false and exit
      if (blueCount >= midpoint) {
        resultFlag = false;
        break;
      }
    }
  }

  // Output 'Yes' if resultFlag is true, otherwise 'No'
  console.log(resultFlag ? 'Yes' : 'No');
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
