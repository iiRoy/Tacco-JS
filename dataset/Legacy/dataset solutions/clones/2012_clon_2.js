function processInput(rawData) {
  // Parse the input string into an integer, representing the number of iterations.
  const iterationCount = parseInt(rawData);

  // Initialize a list (acting as a queue) with single-digit numbers from 1 to 9.
  let processingList = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Loop 'iterationCount' times to generate new numbers based on the current one.
  for (let loopIndex = 0; loopIndex < iterationCount; loopIndex++) {
    // Retrieve the first element from the front of the queue.
    let currentValue = processingList.shift();

    // Check if the last digit of 'currentValue' is not zero.
    // If it's not zero, add a new number formed by appending (last_digit - 1) to 'currentValue'.
    if (currentValue % 10 !== 0) {
      processingList.push(10 * currentValue + currentValue % 10 - 1);
    }

    // Always add a new number formed by appending the last digit of 'currentValue' to itself.
    processingList.push(10 * currentValue + currentValue % 10);

    // Check if the last digit of 'currentValue' is not nine.
    // If it's not nine, add a new number formed by appending (last_digit + 1) to 'currentValue'.
    if (currentValue % 10 !== 9) {
      processingList.push(10 * currentValue + currentValue % 10 + 1);
    }
  }

  // After the loop completes, the last 'currentValue' processed is the one we need to output.
  console.log(currentValue);
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
