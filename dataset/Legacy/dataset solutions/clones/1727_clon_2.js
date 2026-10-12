function processInput(rawData) {
  // Split the raw input string into individual lines
  const parsedLines = rawData.split('\n');

  // Parse the first line for N, M, and K values
  const [numA, numB, maxDuration] = parsedLines[0].split(' ').map(val => Number(val));

  // Process the second line to get durations for stack A, then reverse it
  const stackA = parsedLines[1].split(' ').map(val => Number(val)).reverse();

  // Process the third line to get durations for stack B, then reverse it
  const stackB = parsedLines[2].split(' ').map(val => Number(val)).reverse();

  let booksRead = 0; // Counter for the number of items processed
  let elapsedTime = 0; // Accumulator for the total time spent

  // Loop as long as the total elapsed time does not exceed the maximum allowed duration
  while (elapsedTime <= maxDuration) {
    booksRead++; // Increment the count of items considered

    // If both stacks are empty, we can't read any more, so break the loop
    if ((stackA.length === 0) && (stackB.length === 0)) {
      break;
    }

    let currentItemDuration; // Variable to hold the duration of the next item to be "read"

    // Determine which item to pick next based on the greedy strategy
    if (stackA.length === 0) {
      // If stack A is empty, take from stack B
      currentItemDuration = stackB.pop();
    } else if (stackB.length === 0) {
      // If stack B is empty, take from stack A
      currentItemDuration = stackA.pop();
    } else if (stackA[stackA.length - 1] <= stackB[stackB.length - 1]) {
      // If the top item of stack A is less than or equal to the top item of stack B, take from A
      currentItemDuration = stackA.pop();
    } else {
      // Otherwise, take from stack B
      currentItemDuration = stackB.pop();
    }

    // Add the duration of the chosen item to the total elapsed time
    elapsedTime += currentItemDuration;
  }

  // Output the final count of books read, subtracting 1 because the loop overshoots by one successful read
  console.log(booksRead - 1);
}

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
