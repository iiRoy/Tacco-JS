const processInput = (rawData) => {
  // Convert the incoming string data into an array of individual characters,
  // each representing a 'stone' in the sequence.
  const rockArray = [...rawData];

  // Initialize a variable to count the total number of successful swaps.
  let swapCount = 0;

  // Begin a loop that continues as long as at least one swap can be performed
  // in a full iteration over the 'rockArray'.
  while (
    rockArray.some((currentRock, idx, arrRef) => {
      // Check for the specific condition: a 'B' stone followed by a 'W' stone.
      // Ensure we are not at the very last element to prevent out-of-bounds access.
      if (idx < arrRef.length - 1 && currentRock === "B" && arrRef[idx + 1] === "W") {
        // If the condition is met, swap the positions of the 'B' and 'W' stones.
        // This effectively moves 'W' to the left of 'B'.
        [arrRef[idx], arrRef[idx + 1]] = [arrRef[idx + 1], arrRef[idx]];
        // Return 'true' to indicate that a swap occurred in this iteration,
        // which will cause the 'some' method to stop and the 'while' loop to continue.
        return true;
      }
      // If no swap condition is met for the current pair, return 'false'.
      return false;
    })
  ) {
    // If the 'some' method returned true (meaning at least one swap happened),
    // increment the overall swap counter.
    swapCount++;
  }

  // After the loop finishes (no more 'B' followed by 'W' pairs exist),
  // print the final count of swaps to the console.
  console.log(swapCount);
};

// Read the input from standard input, assuming UTF-8 encoding,
// and then pass it to our main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
