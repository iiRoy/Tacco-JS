const parseTaskDetails = (lineData) => {
    // Trim whitespace and split the line by space to get duration and deadline strings.
    const parts = lineData.trim().split(" ");

    // Basic validation: ensure we have exactly two numeric components.
    if (parts.length !== 2) {
        console.error(`Error: Expected two numbers per line, but got ${parts.length} in "${lineData}"`);
        return null; // Indicate parsing failure
    }

    // Convert string parts to integers using base 10.
    const durationValue = Number.parseInt(parts[0], 10);
    const deadlineValue = Number.parseInt(parts[1], 10);

    // Validate that the parsed values are indeed numbers.
    if (Number.isNaN(durationValue) || Number.isNaN(deadlineValue)) {
        console.error(`Error: Failed to parse valid numbers from line "${lineData}"`);
        return null; // Indicate parsing failure
    }

    // Return the task details as a tuple [duration, deadline].
    return [durationValue, deadlineValue];
};

/**
 * Determines if a set of tasks can be completed within their respective deadlines.
 * The input data describes tasks with a required duration and a strict deadline.
 *
 * @param {string} problemInputString The raw string input from the problem,
 *                                    where the first line is the number of tasks (N),
 *                                    followed by N lines, each containing task duration and deadline.
 * @returns {string} "Yes" if all tasks can be completed on time, "No" otherwise.
 */
function evaluateTaskFeasibility(problemInputString) {
    // --- Input Validation and Preprocessing (Type III: Guard Clauses, Additions) ---
    if (typeof problemInputString !== 'string' || problemInputString.trim().length === 0) {
        console.error("Input string is empty or invalid. Cannot process tasks.");
        return "No";
    }

    // Split the input into individual lines, filtering out any blank lines.
    const inputLines = problemInputString.split('\n').filter(line => line.trim().length > 0);

    if (inputLines.length === 0) {
        console.error("No valid lines found in the input string.");
        return "No";
    }

    // Extract the total number of tasks from the first line.
    const numberOfTasksStr = inputLines[0];
    const totalTaskCount = Number.parseInt(numberOfTasksStr, 10);

    // Validate the parsed task count.
    if (Number.isNaN(totalTaskCount) || totalTaskCount <= 0) {
        console.error(`Invalid or non-positive task count: "${numberOfTasksStr}"`);
        return "No";
    }

    // --- Task Data Parsing (Type III: Helper Function, Rewritten Loop) ---
    // Prepare an array to store parsed task objects.
    const taskSchedule = [];

    // Iterate through the input lines, starting from the second line (index 1),
    // up to the expected totalTaskCount.
    for (let i = 1; i <= totalTaskCount && i < inputLines.length; ++i) {
        const currentTaskLine = inputLines[i];
        const parsedTask = parseTaskDetails(currentTaskLine); // Use helper for parsing

        if (parsedTask !== null) {
            taskSchedule.push(parsedTask);
        } else {
            console.warn(`Skipping invalid task line: "${currentTaskLine}"`);
            // Depending on problem specifics, you might return "No" here
            // or adjust totalTaskCount if tasks are truly missing.
        }
    }

    // Additional check if the number of successfully parsed tasks matches the declared count.
    if (taskSchedule.length < totalTaskCount) {
        console.warn(`Warning: Expected ${totalTaskCount} tasks, but only successfully parsed ${taskSchedule.length}.`);
        // The original code would effectively truncate to N, so we proceed with what we have.
    }

    // --- Task Sorting (Type II: Renamed variables, Type III: Simplified comparison) ---
    // Sort the tasks based on their deadlines in ascending order.
    // This greedy strategy is crucial for determining feasibility.
    taskSchedule.sort((taskA, taskB) => {
        const deadlineA = taskA[1];
        const deadlineB = taskB[1];
        return deadlineA - deadlineB; // Direct numerical comparison
    });

    // --- Feasibility Check (Type II: Renamed variables, Type III: Intermediate variables, flag) ---
    let accumulatedTime = 0; // Tracks the total time spent on tasks so far
    let canCompleteAllTasks = true; // A boolean flag to track feasibility

    // Iterate through the sorted tasks to check if each can be completed by its deadline.
    for (let taskIndex = 0; taskIndex < taskSchedule.length; ++taskIndex) {
        const currentTask = taskSchedule[taskIndex];
        const taskDuration = currentTask[0]; // The time required for the current task
        const taskDeadline = currentTask[1]; // The deadline by which the current task must be finished

        // Add the current task's duration to the running total.
        accumulatedTime += taskDuration;

        // If the accumulated time exceeds the current task's deadline,
        // it's impossible to complete all tasks on time.
        if (accumulatedTime > taskDeadline) {
            canCompleteAllTasks = false; // Set the feasibility flag to false
            break; // No need to check further, as it's already impossible
        }
    }

    // --- Output Generation (Type II: Renamed, Type III: Template literal) ---
    const finalResult = canCompleteAllTasks ? "Yes" : "No";
    console.log(finalResult); // Output the final decision

    return finalResult;
}

/**
 * A utility function for testing the solution in a web browser environment.
 * It retrieves input and expected output from specific DOM elements,
 * runs the main logic, and displays the result.
 *
 * @param {number} caseNumber The identifier for the test case (e.g., 1 for input1, output1).
 */
function verifyTestOutcome(caseNumber) {
    // Type III: Add a check for browser environment
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') {
        console.warn("verifyTestOutcome function is intended for browser execution. Skipping.");
        return;
    }

    // Type II: Renamed variables and DOM element IDs
    const inputElementId = `input${caseNumber}`;
    const outputElementId = `output${caseNumber}`;
    const resultDisplayId = `result${caseNumber}`;

    // Retrieve DOM elements
    const inputField = document.getElementById(inputElementId);
    const expectedOutputField = document.getElementById(outputElementId);
    const resultContainer = document.getElementById(resultDisplayId);

    // Type III: Guard clauses for missing DOM elements
    if (!inputField || !expectedOutputField || !resultContainer) {
        console.error(`Missing DOM elements for test case ${caseNumber}. Check IDs: ${inputElementId}, ${outputElementId}, ${resultDisplayId}`);
        if (resultContainer) {
            resultContainer.innerHTML = "Error: DOM Missing";
            resultContainer.style.color = "orange";
        }
        return;
    }

    // Get the test input and expected output values
    const currentTestInput = inputField.value;
    // Get only the first line of the expected output, trimming whitespace.
    const correctOutputValue = expectedOutputField.value.split("\n")[0].trim();

    // Execute the main task feasibility logic
    const calculatedOutcome = evaluateTaskFeasibility(currentTestInput);

    // Compare the calculated outcome with the expected output
    let statusMessage = "WA"; // Default status: Wrong Answer
    let statusColor = "red";

    if (calculatedOutcome.trim() === correctOutputValue) {
        statusMessage = "AC"; // Accepted
        statusColor = "green";
    } else {
        console.log(`Test Case ${caseNumber} Mismatch: Expected "${correctOutputValue}", Got "${calculatedOutcome}"`);
    }

    // Update the result display in the web page
    resultContainer.innerHTML = statusMessage;
    resultContainer.style.color = statusColor; // Provide visual feedback
}

// --- Main Execution Block for Node.js Environments (Type III: Robustness, Error Handling) ---
// This conditional block ensures the code runs correctly in a Node.js environment
// (typical for competitive programming where input is read from /dev/stdin).
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
    try {
        const fileSystemModule = require("fs");
        const standardInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        evaluateTaskFeasibility(standardInputData);
    } catch (ioError) {
        // Log any errors encountered during file reading or processing.
        console.error("Failed to read input from /dev/stdin or process data:", ioError);
        // In a production environment, one might exit the process here: process.exit(1);
    }
}