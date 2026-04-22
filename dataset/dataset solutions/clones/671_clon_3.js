const fileSystemHandler = require('fs');

// Function to safely parse a line into a numeric pair [value, weight]
// Includes basic validation for robust processing.
const extractTaskMetrics = (lineContent) => {
    const dataPoints = lineContent.split(' ').map(Number);
    // Ensure exactly two numeric values are present
    if (dataPoints.length !== 2 || dataPoints.some(isNaN)) {
        console.warn(`Encountered malformed input line: "${lineContent}". Defaulting to [0, 0].`);
        return [0, 0];
    }
    return dataPoints;
};

// Read the entire standard input as a string and prepare it for processing.
// Trim removes leading/trailing whitespace, split creates an array of lines.
const rawInputData = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputData.trim().split('\n');

let currentCaseIdentifier = 0; // Tracks the current test case being processed

// Main loop to handle multiple test cases from the input.
// Continues until a test case with zero items is encountered.
while (true) {
    currentCaseIdentifier++;

    // Retrieve the number of items for the current test case.
    // Using parseInt with radix 10 for explicit conversion.
    const numberOfItemsInCase = parseInt(processedInputLines.shift(), 10);

    // If the number of items is zero, it's the termination condition.
    if (numberOfItemsInCase === 0) {
        break;
    }

    // Array to store the task specifications, each as [value, weight].
    const jobSpecifications = [];
    let initialTotalJobValue = 0; // Accumulates the sum of all task values for this case.

    // Loop to read and process each task's value and weight for the current test case.
    for (let itemIndex = 0; itemIndex < numberOfItemsInCase; ++itemIndex) {
        const lineForCurrentTask = processedInputLines.shift();
        const taskDetails = extractTaskMetrics(lineForCurrentTask);
        jobSpecifications.push(taskDetails);
        initialTotalJobValue += taskDetails[0]; // Add task's value to the running total.
    }

    // Sort the job specifications in descending order based on their 'weight' (second element).
    // This greedy approach is often crucial for problems of this type.
    jobSpecifications.sort((specA, specB) => specB[1] - specA[1]);

    let cumulativeValueRemaining = initialTotalJobValue; // Tracks the value yet to be processed.
    let scheduleIsAchievable = true; // Flag to determine if the schedule is feasible.

    // Iterate through the sorted jobs to check feasibility.
    // The Array.prototype.every() method is used here for a concise check,
    // stopping iteration as soon as a condition fails (returning false).
    scheduleIsAchievable = jobSpecifications.every(currentJobEntry => {
        const jobContribution = currentJobEntry[0]; // The 'value' part of the task.
        const jobDeadlineOrCapacity = currentJobEntry[1]; // The 'weight' or constraint part.

        // If the current cumulative value exceeds the current job's weight/capacity,
        // then the schedule is not achievable.
        if (cumulativeValueRemaining > jobDeadlineOrCapacity) {
            return false; // This will stop the .every() iteration and set scheduleIsAchievable to false.
        }

        // Subtract the current job's value from the cumulative total as it's "processed".
        cumulativeValueRemaining -= jobContribution;
        return true; // Continue to the next job if this one is feasible.
    });

    // Output the result for the current test case.
    console.log(scheduleIsAchievable ? "YES" : "NO");
}