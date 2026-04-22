function calculateOptimalReadings(rawInputString) {
  // Decompose the entire input string into an array of individual lines.
  const inputLines = rawInputString.split('\n');

  // Parse the first line to extract configuration values.
  // The first two numbers (original 'n' and 'm') represent the initial sizes
  // of the book stacks, but they are not directly used in the core logic
  // as we rely on the actual array lengths.
  const configurationValues = inputLines[0].split(' ').map(value => parseInt(value, 10));

  // The third value from the first line is our maximum allowed duration (time budget).
  const maxAllowedDuration = configurationValues[2];

  // Parse the second line to get the durations of books in the first stack.
  // We use parseInt for explicit type conversion.
  // The books are assumed to be provided in ascending order of duration,
  // so 'shift()' will naturally pick the shortest available.
  const bookDurationsStackA = inputLines[1].split(' ').map(value => parseInt(value, 10));

  // Parse the third line for durations of books in the second stack.
  const bookDurationsStackB = inputLines[2].split(' ').map(value => parseInt(value, 10));

  // --- Core Reading Simulation Logic ---

  // Initialize a counter for the number of books successfully selected within the budget.
  let successfulSelectionsCount = 0;
  // Initialize a running total for the time accumulated by selected books.
  let currentAccumulatedTime = 0;

  // This variable will temporarily hold the duration of the book chosen in each step.
  let chosenBookDuration;

  // The primary loop continues as long as the total accumulated time does not exceed
  // the maximum allowed duration.
  // Note: The loop increments successfulSelectionsCount before checking the time
  // and potentially adding a book, requiring a final adjustment of -1.
  while (currentAccumulatedTime <= maxAllowedDuration) {
    // Optimistically increment the selection count.
    // This will be corrected at the end if the last chosen book pushed us over the limit.
    successfulSelectionsCount++;

    // If both stacks of books are completely empty, there are no more books to choose.
    // We must break out of the loop to prevent errors or infinite execution.
    if (bookDurationsStackA.length === 0 && bookDurationsStackB.length === 0) {
      break;
    }

    // Apply a greedy strategy: always pick the book with the shortest duration available
    // from either stack. This maximizes the number of books read within the time limit.
    if (bookDurationsStackA.length === 0) {
      // If the first stack is exhausted, we are forced to take from the second stack.
      chosenBookDuration = bookDurationsStackB.shift(); // Remove and get the first element.
    } else if (bookDurationsStackB.length === 0) {
      // If the second stack is exhausted, we must take from the first stack.
      chosenBookDuration = bookDurationsStackA.shift(); // Remove and get the first element.
    } else {
      // Both stacks have books. Compare the durations of their next available books (at index 0).
      const nextFromStackA = bookDurationsStackA[0];
      const nextFromStackB = bookDurationsStackB[0];

      if (nextFromStackA <= nextFromStackB) {
        // If the book from stack A is shorter or equal, prioritize it.
        chosenBookDuration = bookDurationsStackA.shift();
      } else {
        // Otherwise, the book from stack B is shorter, so select it.
        chosenBookDuration = bookDurationsStackB.shift();
      }
    }

    // Add the duration of the chosen book to our running total.
    currentAccumulatedTime += chosenBookDuration;
  }

  // The 'successfulSelectionsCount' includes the last book chosen, which might have
  // caused 'currentAccumulatedTime' to exceed 'maxAllowedDuration'.
  // Therefore, we subtract 1 to report the actual number of books that fit within the budget.
  console.log(successfulSelectionsCount - 1);
}

// Standard boilerplate for reading input from stdin in a Node.js environment.
calculateOptimalReadings(require('fs').readFileSync('/dev/stdin', 'utf8'));