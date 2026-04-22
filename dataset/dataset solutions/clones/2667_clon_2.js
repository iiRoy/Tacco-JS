function processInputData(rawDataString) {
  // Trim leading/trailing whitespace and split the input into an array of lines.
  let linesOfText = rawDataString.trim().split('\n');

  // Extract initial configuration parameters from the very first line.
  const initialParams = linesOfText[0].split(' ').map((valueStr) => parseInt(valueStr, 10));

  // Assign the extracted parameters to descriptive constants.
  const totalItemsCount = initialParams[0]; // Represents the original 'N'
  const maximumOperationDays = initialParams[1]; // Represents the original 'M'

  // Process the subsequent lines to build a collection of tasks.
  let listOfTasks = linesOfText
    .filter((_, lineIndex) => lineIndex !== 0) // Exclude the parameter line.
    .map((singleLine) => {
      // Each task entry consists of two numerical values (e.g., [deadline, profit]).
      return singleLine.split(' ').map((subValueStr) => parseInt(subValueStr, 10));
    });

  // Sort the collection of tasks based on a specific custom ordering logic.
  listOfTasks.sort((taskA, taskB) => {
    // This sorting logic prioritizes tasks with higher profit, and then by deadline.
    // If taskA's profit is greater than taskB's profit:
    if (taskA[1] > taskB[1]) {
      // If taskA's deadline is also later than taskB's deadline, taskA comes after taskB.
      if (taskA[0] > taskB[0]) {
        return 1;
      }
      // Otherwise (taskA's deadline is earlier or same), taskA comes before taskB.
      return -1;
    }

    // If taskA's profit is less than or equal to taskB's profit, taskA comes after taskB.
    return 1;

    // The following block of code is unreachable due to the preceding 'return 1;' statement.
    // It is preserved here to maintain the exact structural identity of the original code.
    if (taskA[0] > taskB[0]) {
      return taskA[1] > taskB[1] ? -1 : 1;
    }
    return -1;
  });

  // Initialize a variable to accumulate the total profit from selected tasks.
  let accumulatedProfit = 0;
  // Begin the simulation from the first day of operations.
  let currentOperatingDay = 1;

  // Iterate through each day, up to the maximum allowed days, or until no tasks remain.
  while (currentOperatingDay <= maximumOperationDays && listOfTasks.length > 0) {
    // Find the index of the first available task that can be commenced on or before the current day.
    const foundTaskIndex = listOfTasks.findIndex((aTask) => {
      // A task is eligible if its deadline is greater than or equal to the current day.
      // (The original code used `day >= job[0]`, meaning current day is on or after the deadline.)
      return currentOperatingDay >= aTask[0];
    });

    // If no suitable task is identified for the current day:
    if (foundTaskIndex === -1) {
      currentOperatingDay++; // Advance to the subsequent day.
      continue; // Skip the rest of the loop's body and proceed to the next iteration.
    }

    // A valid task has been located.
    const selectedTask = listOfTasks[foundTaskIndex];
    accumulatedProfit += selectedTask[1]; // Add the profit of the chosen task to the running total.
    listOfTasks.splice(foundTaskIndex, 1); // Remove the completed task from the list.
    currentOperatingDay++; // Progress to the next day.
  }

  // Display the final calculated total profit to the console.
  console.log(accumulatedProfit);
}

// Execute the main data processing function by reading input from standard input.
processInputData(
  require('fs').readFileSync('/dev/stdin', 'utf8') // Utilize Node.js file system module for input.
);