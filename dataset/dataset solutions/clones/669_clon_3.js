const fileSystemModule = require('node:fs');

// Acquire all raw input content from standard input (file descriptor 0)
// and decode it using UTF-8. This is a common way to read stdin in Node.js scripts.
const rawInputContent = fileSystemModule.readFileSync(0, 'utf8');

// Pre-process the entire input: remove any leading/trailing whitespace
// and then split the content into an array of individual lines.
const inputLineBuffer = rawInputContent.trim().split('\n');

// A mutable index to keep track of which line we are currently processing
// from the `inputLineBuffer`. This avoids modifying the buffer with `shift()`.
let currentInputLinePointer = 0;

// A counter to provide unique identifiers for each test scenario processed.
let testScenarioIdentifier = 0;

/**
 * Retrieves the next line from the input buffer and attempts to parse it as an integer.
 * Advances the internal line pointer.
 * @returns {number} The integer value parsed from the next available line.
 */
const consumeNextIntegerLine = () => {
    // Fetch the line string at the current pointer position.
    const lineString = inputLineBuffer[currentInputLinePointer];
    // Advance the pointer to the next line for subsequent reads.
    currentInputLinePointer++;
    // Convert the string to an integer, specifying base 10 for safety.
    return parseInt(lineString, 10);
};

/**
 * Retrieves the next line from the input buffer, splits it by space,
 * and parses each resulting part into a number. Advances the internal line pointer.
 * @returns {number[]} An array of numbers parsed from the next available line.
 */
const consumeNextNumberArrayLine = () => {
    const lineString = inputLineBuffer[currentInputLinePointer];
    currentInputLinePointer++;
    // Split the line by spaces and map each substring to its numerical equivalent.
    return lineString.split(' ').map(Number);
};

// The primary loop that processes multiple independent test scenarios until a termination signal is found.
while (true) {
    // Increment the scenario identifier for the current iteration.
    testScenarioIdentifier++;

    // Read the number of jobs that need to be scheduled for the current scenario.
    const currentScenarioJobCount = consumeNextIntegerLine();

    // Check for the termination condition: if the job count is zero, exit the loop.
    if (currentScenarioJobCount === 0) {
        break; // End of input signal.
    }

    // An array to hold structured job objects, each containing its duration and deadline.
    const jobScheduleEntries = [];
    // A running total of all job durations for the current scenario.
    let aggregateJobDuration = 0;

    // Loop through and read the details for each job in the current scenario.
    for (let jobIndex = 0; jobIndex < currentScenarioJobCount; jobIndex++) {
        // Destructure the duration and deadline directly from the parsed line.
        const [jobProcessingTime, jobCompletionDeadline] = consumeNextNumberArrayLine();
        
        // Create an object literal for the job for better readability and structure.
        jobScheduleEntries.push({
            processingTime: jobProcessingTime,
            completionDeadline: jobCompletionDeadline
        });
        
        // Add the current job's processing time to the overall sum.
        aggregateJobDuration += jobProcessingTime;
    }

    // Sort the jobs. The critical scheduling heuristic is to process jobs
    // in descending order of their deadlines (latest deadline first).
    // This allows us to check feasibility by working backward from the finish time.
    jobScheduleEntries.sort((jobEntryA, jobEntryB) => {
        // The comparison function sorts by 'completionDeadline' in descending order.
        return jobEntryB.completionDeadline - jobEntryA.completionDeadline;
    });

    // Initialize the 'available time' counter with the total sum of all job durations.
    // This represents the theoretical completion time of the last job if all jobs were done consecutively.
    let currentAvailableTime = aggregateJobDuration;

    // A flag to track whether the current job schedule is found to be feasible.
    // It is optimistically set to true and changed to false if any constraint is violated.
    let isSchedulePossible = true;

    // Iterate through the sorted jobs (from latest deadline to earliest) to verify feasibility.
    for (const singleJobEntry of jobScheduleEntries) {
        // If the 'current available time' (which is the estimated completion time of this job
        // if processed in this order) exceeds the job's actual deadline...
        if (currentAvailableTime > singleJobEntry.completionDeadline) {
            // ...then this job cannot be completed by its deadline, making the entire schedule impossible.
            isSchedulePossible = false;
            break; // No need to check further jobs; the schedule is already invalid.
        }
        // If the deadline is met, subtract this job's duration from the 'current available time'.
        // This simulates moving backward in time, confirming previous jobs could finish by their deadlines.
        currentAvailableTime -= singleJobEntry.processingTime;
    }

    // Based on the feasibility flag, construct the final output message.
    const finalScenarioVerdict = isSchedulePossible ? "Yes" : "No";

    // Output the verdict for the current scenario to standard output, followed by a newline.
    // `process.stdout.write` is an alternative to `console.log` for direct stream writing.
    process.stdout.write(finalScenarioVerdict + '\n');
}

// The script concludes after processing all scenarios or encountering the termination signal.