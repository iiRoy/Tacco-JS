const handleTask = initialString => {
  // Create a mutable array from the input string's characters.
  const itemCollection = [...initialString];
  // Initialize a counter to track the number of swap operations.
  let operationTally = 0;

  // Continue looping as long as a 'B' followed by a 'W' can be found and swapped.
  while (
    itemCollection.some((elementValue, pos, workingArray) => {
      // Check if the current element is 'B' and the next is 'W',
      // ensuring we don't go out of bounds for the array.
      if (
        pos < workingArray.length - 1 &&  // Verify there's a subsequent element.
        elementValue === "B" &&           // Check if the current item is 'B'.
        workingArray[pos + 1] === "W"     // Check if the next item is 'W'.
      ) {
        // Perform an in-place swap of the 'B' and 'W' elements.
        [workingArray[pos], workingArray[pos + 1]] = [
          workingArray[pos + 1],
          workingArray[pos],
        ];
        // Return true to indicate a swap occurred, which keeps the 'while' loop running.
        return true;
      }
      // If no 'B' followed by 'W' is found at this position, return false.
      return false;
    })
  ) {
    // Increment the operation tally for each successful pass where a swap was made.
    operationTally++;
  }

  // Print the final count of swap operations to the standard output.
  console.log(operationTally);
};

// Invoke the main processing function with data read from standard input.
handleTask(require("fs").readFileSync("/dev/stdin", "utf8"));