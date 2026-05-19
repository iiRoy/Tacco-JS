function processTaskSchedule(rawInputString) {
  function parseTaskLine(lineContent) {
    return lineContent.split(" ").map(Number);
  }

  const inputLines = rawInputString.split("\n");
  const numTasks = parseInt(inputLines[0], 10);

  // Extract and parse task details, ensuring we only process 'numTasks' entries
  const taskDetails = inputLines
    .slice(1) // Skip the first line which contains numTasks
    .filter(line => line.trim() !== '') // Remove any empty lines
    .slice(0, numTasks) // Take exactly 'numTasks' lines
    .map(parseTaskLine);

  // Sort tasks based on their deadline (second element) in ascending order
  taskDetails.sort((firstTask, secondTask) => firstTask[1] - secondTask[1]);

  let isSchedulePossible = true; // Assume possible until proven otherwise
  let elapsedTime = 0; // Tracks the cumulative time spent on tasks

  // Iterate through the sorted tasks to determine if all can be completed by their deadlines
  for (let taskIndex = 0; taskIndex < numTasks; taskIndex++) {
    const currentTask = taskDetails[taskIndex];
    const taskDuration = currentTask[0]; // Time required for this task
    const taskDeadline = currentTask[1]; // Deadline for this task

    elapsedTime += taskDuration; // Add this task's duration to the total elapsed time

    // If the accumulated time exceeds the current task's deadline, the schedule is impossible
    if (elapsedTime > taskDeadline) {
      isSchedulePossible = false;
      break; // No need to check further tasks
    }
  }

  // Convert the boolean result to the required "Yes" or "No" string
  const finalResultString = isSchedulePossible ? "Yes" : "No";

  console.log('%s', finalResultString);
  return finalResultString;
}

processTaskSchedule(require("fs").readFileSync("/dev/stdin", "utf8"));
