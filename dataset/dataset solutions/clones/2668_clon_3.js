const calculateOptimalValue = (rawDataInput) => {
  // Divide the entire raw input string into individual line segments.
  const allInputLines = rawDataInput.trim().split('\n');

  // Extract the first line, which typically contains configuration parameters.
  const configurationData = allInputLines.shift();
  const configElements = configurationData.split(' ');

  // Parse the total count of initial items (not directly used in this logic, but part of input)
  const totalItemCount = parseInt(configElements[0], 10);
  // Parse the number of processing cycles (days) the system will operate for.
  const numberOfSimulationDays = parseInt(configElements[1], 10);

  // Prepare a collection to store all available tasks.
  // Each task is represented as an object for clear property access.
  const pendingTasks = [];
  for (let i = 0; i < allInputLines.length; i++) {
    const taskDetails = allInputLines[i].split(' ');
    // Convert string components to numeric types for computation.
    const requiredProcessingTime = parseInt(taskDetails[0], 10);
    const associatedMonetaryValue = parseInt(taskDetails[1], 10);
    // Add the structured task object to our list.
    pendingTasks.push({
      durationNeeded: requiredProcessingTime,
      financialReward: associatedMonetaryValue,
    });
  }

  // Initialize a running total for the profit accumulated over all days.
  let cumulativeEarnings = 0;

  // Iterate through each day of the simulation period.
  // 'currentDayIndex' tracks the progression through the processing cycles.
  for (let currentDayIndex = 0; currentDayIndex < numberOfSimulationDays; currentDayIndex++) {
    // Determine how many days are still left until the end of the simulation.
    const remainingDaysForCompletion = numberOfSimulationDays - currentDayIndex;

    let bestTaskCandidateIndex = -1; // Index of the most valuable task found for the current day.
    let highestRewardForDay = -1;    // The maximum reward value found among eligible tasks.

    // Scan through all currently available tasks to find the most suitable one for this specific day.
    for (let currentTaskPosition = 0; currentTaskPosition < pendingTasks.length; currentTaskPosition++) {
      const activeTask = pendingTasks[currentTaskPosition];

      // Check if the task's required duration can be met within the remaining simulation days.
      if (activeTask.durationNeeded <= remainingDaysForCompletion) {
        // If this task offers a higher reward than any eligible task found so far,
        // update our choice for the day.
        if (activeTask.financialReward > highestRewardForDay) {
          highestRewardForDay = activeTask.financialReward;
          bestTaskCandidateIndex = currentTaskPosition;
        }
      }
    }

    // After evaluating all available tasks for the current day,
    // if a viable task was identified (i.e., 'bestTaskCandidateIndex' is not -1).
    if (bestTaskCandidateIndex !== -1) {
      // Add the reward of the selected task to the overall earnings.
      cumulativeEarnings += highestRewardForDay;

      // Remove the chosen task from the list of pending tasks, as it has now been processed.
      pendingTasks.splice(bestTaskCandidateIndex, 1);
    }
    // If no eligible task was found for the day, no profit is added, and the list of tasks remains unchanged.
  }

  // Return the final calculated total earnings.
  return cumulativeEarnings;
};

// Standard boilerplate for reading input from stdin in a Node.js environment.
const fileSystemModule = require("fs");
const programInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Execute the main logic with the provided input and display the outcome.
console.log(calculateOptimalValue(programInputData));