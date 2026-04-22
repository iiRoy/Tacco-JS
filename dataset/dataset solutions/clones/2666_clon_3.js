// This function serves as the primary entry point for processing a job scheduling problem.
// It takes raw input data, parses it, and then calculates the maximum possible profit
// by strategically selecting jobs within a given number of working days.
function ProcessJobSchedule(rawData) {
    // --- Input Validation and Preprocessing ---

    // Ensure the input data is valid and provided as a string.
    if (typeof rawData !== 'string' || rawData.trim().length === 0) {
        console.error("Critical Error: Input data is either missing, empty, or not a string. Cannot proceed.");
        return;
    }

    // Define a custom class to encapsulate job details.
    // This improves readability and maintainability compared to raw array indices.
    class TaskOpportunity {
        constructor(deadlineString, rewardString, uniqueIdentifier) {
            this.deadline = parseInt(deadlineString, 10); // Convert deadline string to integer.
            this.reward = parseInt(rewardString, 10);     // Convert reward string to integer.
            this.id = uniqueIdentifier;                   // Assign a unique ID for tracking/debugging.

            // Perform basic validation for the parsed numeric values.
            this.isValid = !isNaN(this.deadline) && !isNaN(this.reward) &&
                           this.deadline > 0 && this.reward > 0;

            if (!this.isValid) {
                console.warn(`Warning: Encountered an invalid task opportunity. ID: ${this.id}, Deadline: '${deadlineString}', Reward: '${rewardString}'. This task will be ignored.`);
            }
        }
    }

    // Split the raw input string into an array of lines.
    // Filter out any lines that are empty or contain only whitespace to ensure clean data.
    const dataLines = rawData.split('\n').filter(line => line.trim() !== '');

    // Verify that we have at least the header line for parameters.
    if (dataLines.length === 0) {
        console.error("Error: No actionable data lines found in the input after filtering. Exiting.");
        return;
    }

    // Parse the first line to extract the total number of tasks and available working days.
    const [taskCountString, totalDaysString] = dataLines[0].split(' ');

    const numberOfTasksToProcess = parseInt(taskCountString, 10);
    const totalAvailableWorkingDays = parseInt(totalDaysString, 10);

    // Validate the parsed global parameters.
    if (isNaN(numberOfTasksToProcess) || numberOfTasksToProcess <= 0) {
        console.error(`Error: Invalid or non-positive number of tasks specified: '${taskCountString}'. Program will terminate.`);
        return;
    }
    if (isNaN(totalAvailableWorkingDays) || totalAvailableWorkingDays <= 0) {
        console.error(`Error: Invalid or non-positive total working days specified: '${totalDaysString}'. Program will terminate.`);
        return;
    }

    // Check if the number of actual data lines matches the declared number of tasks.
    if (dataLines.length < numberOfTasksToProcess + 1) { // +1 accounts for the header line itself
        console.warn(`Warning: Expected ${numberOfTasksToProcess} task entries but received only ${dataLines.length - 1}. Processing available valid tasks.`);
    }

    // --- Task Data Collection ---

    // Initialize an array to hold all valid task opportunities.
    let activeTaskOpportunities = [];
    // Iterate through the data lines, starting from the second line (index 1),
    // up to the declared number of tasks.
    for (let currentLineIndex = 0; currentLineIndex < numberOfTasksToProcess; ++currentLineIndex) {
        const taskDetailsLine = dataLines[currentLineIndex + 1]; // +1 to skip header line.

        // If a line is unexpectedly missing (e.g., input shorter than declared task count), skip it.
        if (!taskDetailsLine) {
            console.warn(`Warning: Data line for task ${currentLineIndex + 1} is missing. Skipping.`);
            continue;
        }

        const [taskDeadlineStr, taskRewardStr] = taskDetailsLine.split(' ');
        const potentialTask = new TaskOpportunity(taskDeadlineStr, taskRewardStr, currentLineIndex);

        // Only add tasks that passed the internal validation check.
        if (potentialTask.isValid) {
            activeTaskOpportunities.push(potentialTask);
        }
    }

    // --- Core Algorithm: Greedy Job Selection ---

    // If no valid tasks were collected, there's no profit to be made.
    if (activeTaskOpportunities.length === 0) {
        console.log(0);
        return;
    }

    // Sort the available tasks by their reward in descending order.
    // This is a crucial step for the greedy approach: prioritize high-value tasks.
    activeTaskOpportunities.sort((taskA, taskB) => taskB.reward - taskA.reward);

    // Initialize the accumulator for the total earnings.
    let totalRealizedProfit = 0;

    // Iterate through each available working day.
    for (let dayIterator = 0; dayIterator < totalAvailableWorkingDays; ++dayIterator) {
        let bestTaskForCurrentDay = null;
        let indexOfBestTask = -1;

        // Calculate the number of days remaining from the current day.
        const remainingScheduleDuration = totalAvailableWorkingDays - dayIterator;

        // Search for the most profitable task that can be completed by its deadline
        // within the `remainingScheduleDuration`.
        // Since `activeTaskOpportunities` is sorted by reward (descending),
        // the first task that meets the deadline criterion is the best choice for this day.
        for (let taskSearchIndex = 0; taskSearchIndex < activeTaskOpportunities.length; ++taskSearchIndex) {
            const candidateTask = activeTaskOpportunities[taskSearchIndex];

            // Check if the candidate task's deadline is within the remaining days.
            if (candidateTask.deadline <= remainingScheduleDuration) {
                bestTaskForCurrentDay = candidateTask;
                indexOfBestTask = taskSearchIndex;
                break; // Found the highest-rewarding eligible task, so stop searching for this day.
            }
        }

        // If a suitable task was identified for the current day:
        if (bestTaskForCurrentDay !== null) {
            totalRealizedProfit += bestTaskForCurrentDay.reward;
            // Remove the selected task from the list of available opportunities.
            // This ensures it's not picked again.
            activeTaskOpportunities.splice(indexOfBestTask, 1);
        }
        // If no task is found for a particular day, no profit is added for that day,
        // and we simply proceed to the next day.
    }

    // --- Output Result ---

    // Display the final calculated total profit to the console.
    console.log(totalRealizedProfit);
}

// The following line is essential for standard input/output handling in competitive programming environments.
// It reads all data from standard input and passes it to the ProcessJobSchedule function.
// This part should not be altered.
ProcessJobSchedule(require("fs").readFileSync("/dev/stdin", "utf8"));