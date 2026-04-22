// This script simulates a task distribution process among a set of workers.
// Tasks are assigned in a round-robin fashion, with a dynamic global task quota.
// The simulation determines which worker first reaches a predefined task completion target.

// Import the Node.js file system module for input operations.
const fileSystemModule = require('fs');

/**
 * Reads content from a specified file path, processes it, and returns an array of cleaned lines.
 * Handles potential file reading errors gracefully.
 *
 * @param {string} sourceFilePath The path to the input file (e.g., '/dev/stdin').
 * @returns {string[]} An array of strings, where each string is a non-empty, trimmed line from the input.
 */
function acquireAndPrepareInputData(sourceFilePath) {
    try {
        // Read the entire file synchronously, decode as UTF-8, and remove leading/trailing whitespace from the whole content.
        const fileContentRaw = fileSystemModule.readFileSync(sourceFilePath, 'utf8').trim();

        // Split the content into individual lines.
        // Filter out any lines that are empty or consist only of whitespace after trimming.
        const cleanedLinesArray = fileContentRaw.split('\n').filter(lineItem => lineItem.trim().length > 0);

        return cleanedLinesArray;
    } catch (readError) {
        // Log an error if file reading fails and return an empty array to prevent further processing issues.
        console.error("Critical error encountered while reading input file:", readError.message);
        return [];
    }
}

/**
 * Calculates the next index in a cyclic sequence.
 * Useful for round-robin assignment or array indexing.
 *
 * @param {number} currentIndex The current index.
 * @param {number} totalElements The total number of elements in the cycle.
 * @returns {number} The next cyclic index.
 */
const calculateNextCyclicIndex = (currentIndex, totalElements) => (currentIndex + 1) % totalElements;

/**
 * Executes the core task distribution simulation for a given number of workers and a completion target.
 * Tasks are initially drawn from a global quota, and workers can 'return' their accumulated tasks
 * to the global quota if it's depleted, resetting their own count.
 * The simulation terminates when any worker reaches the specified completion target.
 * Includes a safety mechanism to prevent infinite loops.
 *
 * @param {number} workerUnitCount The total number of worker units participating in the simulation.
 * @param {number} completionGoal The target number of tasks a single worker needs to complete.
 * @returns {number} The index of the worker (0-based) that first reached the completion goal,
 *                   or -1 if the simulation terminates early due to an iteration limit.
 */
function executeDistributionSimulation(workerUnitCount, completionGoal) {
    // Array to track the progress (tasks completed) for each worker. Initialized to zero.
    const workerTaskProgress = Array(workerUnitCount).fill(0);

    // The index of the worker currently being considered for task assignment.
    let activeWorkerIdentifier = 0;

    // A global pool of tasks available for distribution.
    // Initially, it holds the total target amount, representing the initial 'workload'.
    let globalAvailableQuota = completionGoal;

    // Flag to indicate if any worker has met the completion goal.
    let hasGoalBeenAchieved = false;

    // Safety counter to prevent potential infinite loops, especially useful for complex simulations.
    // The heuristic for MAX_ITERATIONS is chosen to be sufficiently large for expected inputs.
    const MAX_SIMULATION_CYCLES = workerUnitCount * completionGoal * 1000; // An extensive upper bound.
    let currentCycleCount = 0;

    // The main simulation loop continues until a worker achieves the goal.
    while (!hasGoalBeenAchieved) {
        currentCycleCount++;

        // Guard against excessive iterations, indicating a potential issue or very long run.
        if (currentCycleCount > MAX_SIMULATION_CYCLES) {
            console.warn(`Simulation for workers=${workerUnitCount}, goal=${completionGoal} exceeded maximum allowed cycles (${MAX_SIMULATION_CYCLES}). Terminating prematurely.`);
            return -1; // Return a sentinel value to indicate early termination.
        }

        // Get the current task count for the worker at the active index.
        const tasksOfCurrentWorker = workerTaskProgress[activeWorkerIdentifier];

        // Check if this worker has already met the completion goal.
        if (tasksOfCurrentWorker === completionGoal) {
            hasGoalBeenAchieved = true; // Set flag to exit loop.
            break; // Exit the while loop.
        }

        // Conditional logic for task distribution based on the global quota.
        if (globalAvailableQuota > 0) {
            // If tasks are available in the global pool, assign one to the current worker.
            workerTaskProgress[activeWorkerIdentifier]++;
            globalAvailableQuota--; // Reduce the global pool.
        } else {
            // If the global pool is empty, the current worker 'donates' its accumulated tasks
            // back to the global pool, and its own count is reset.
            // This mechanism redistributes tasks when the direct supply runs out.
            globalAvailableQuota += tasksOfCurrentWorker; // Add worker's tasks to the global pool.
            workerTaskProgress[activeWorkerIdentifier] = 0; // Reset worker's tasks.
        }

        // Move to the next worker in the round-robin sequence.
        activeWorkerIdentifier = calculateNextCyclicIndex(activeWorkerIdentifier, workerUnitCount);
    }

    // Return the index of the worker who caused the simulation to terminate
    // by reaching the completion target.
    return activeWorkerIdentifier;
}

// --- Main Program Execution Flow ---
// Acquire and prepare all input lines from /dev/stdin.
const processingInstructionQueue = acquireAndPrepareInputData('/dev/stdin');

// The original code uses `lines.length > 1` with `lines.shift()`.
// This implies that the very last line of input is intentionally ignored or serves as a terminator.
// We replicate this behavior by continuing as long as there are at least two lines available for processing.
while (processingInstructionQueue.length > 1) {
    // Extract the first line containing the parameters for the current simulation run.
    const currentInstructionLine = processingInstructionQueue.shift();

    // Parse the parameters from the line, ensuring robust handling of whitespace and conversion to numbers.
    const parsedNumericParameters = currentInstructionLine
                                    .trim() // Trim whitespace from the current line.
                                    .split(' ') // Split by space.
                                    .map(paramStr => {
                                        const numericalValue = Number(paramStr.trim()); // Trim each parameter string and convert.
                                        // Basic validation: if conversion results in NaN, we explicitly return NaN.
                                        // This allows for subsequent checks.
                                        return isNaN(numericalValue) ? NaN : numericalValue;
                                    });

    // Validate that we have exactly two valid numerical parameters.
    // Check for length, integer type, and positive values.
    if (parsedNumericParameters.length < 2 ||
        !Number.isInteger(parsedNumericParameters[0]) ||
        !Number.isInteger(parsedNumericParameters[1]) ||
        parsedNumericParameters[0] <= 0 || parsedNumericParameters[1] <= 0) {
        console.error(`Warning: Skipping invalid or malformed input line. Expected two positive integers: "${currentInstructionLine}"`);
        continue; // Skip to the next line in the queue.
    }

    const unitsForWorkers = parsedNumericParameters[0];
    const targetForCompletion = parsedNumericParameters[1];

    // Execute the simulation with the validated parameters.
    const resultingWorkerIndex = executeDistributionSimulation(unitsForWorkers, targetForCompletion);

    // Only print a result if the simulation completed successfully (i.e., not terminated early).
    if (resultingWorkerIndex !== -1) {
        console.log(resultingWorkerIndex);
    } else {
        console.error(`Error: Simulation for input "${currentInstructionLine}" did not complete successfully.`);
    }
}