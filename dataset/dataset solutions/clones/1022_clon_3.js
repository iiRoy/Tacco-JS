// Global variable to accumulate all raw input data from standard input.
let systemRawInputBuffer = '';

/**
 * Parses a string line into an array of numbers. It handles potential non-numeric values
 * by logging a warning and treating them as zero, or by returning an empty array on error.
 * @param {string} dataLine - The input string, expected to contain space-separated numerical values (e.g., "5 20").
 * @returns {number[]} An array of parsed numbers. Returns an empty array if the input is invalid or empty.
 */
function extractNumericParameters(dataLine) {
    // Basic validation for the input line.
    if (typeof dataLine !== 'string' || !dataLine.trim()) {
        console.error("Parsing Error: Attempted to extract numeric parameters from an invalid or empty line.");
        return []; // Return an empty array to indicate failure or no data.
    }

    // Split the line by spaces and convert each part to a number.
    return dataLine.split(' ').map(segment => {
        const numericValue = Number(segment);
        // If conversion results in NaN, it means the segment wasn't a valid number.
        if (isNaN(numericValue)) {
            console.warn(`Parsing Warning: Found non-numeric segment "${segment}". Treating as 0.`);
            return 0; // Default to 0, or could throw an error for stricter parsing.
        }
        return numericValue;
    });
}

/**
 * @typedef {object} SchedulerJob
 * @property {string} jobId - The unique identifier or name of the process (e.g., "P1").
 * @property {number} remainingTimeUnits - The amount of CPU time (in units) still required for this job to finish.
 */

/**
 * Parses a single line representing a scheduler job into a structured object.
 * Expected format: "JOB_ID DURATION" (e.g., "P1 10").
 * @param {string} jobEntryLine - The input string for a single job.
 * @returns {SchedulerJob | null} A `SchedulerJob` object if parsing is successful, otherwise `null`.
 */
function createJobFromLine(jobEntryLine) {
    // Ensure the input line is valid before attempting to parse.
    if (typeof jobEntryLine !== 'string' || !jobEntryLine.trim()) {
        console.warn("Job Parsing Warning: Skipping empty or invalid job entry line.");
        return null;
    }

    const partsOfEntry = jobEntryLine.split(' ');
    // A valid job entry must have at least two parts: ID and Duration.
    if (partsOfEntry.length < 2) {
        console.error(`Job Parsing Error: Malformed job entry "${jobEntryLine}". Expected format 'JOB_ID DURATION'.`);
        return null;
    }

    const processIdentifier = partsOfEntry[0];
    const initialDurationValue = Number(partsOfEntry[1]);

    // Validate the parsed duration. It must be a non-negative number.
    if (isNaN(initialDurationValue) || initialDurationValue < 0) {
        console.error(`Job Parsing Error: Invalid duration value "${partsOfEntry[1]}" for job "${processIdentifier}". Duration must be a non-negative number.`);
        return null;
    }

    return {
        jobId: processIdentifier,
        remainingTimeUnits: initialDurationValue
    };
}

/**
 * Executes a Round Robin CPU scheduling simulation based on input data.
 * It reads configuration (number of jobs, time quantum) and job details from
 * the global `systemRawInputBuffer`, then simulates their execution.
 */
function performRoundRobinSimulation() {
    // Initial check: verify that input data has been collected.
    if (!systemRawInputBuffer || typeof systemRawInputBuffer !== 'string' || systemRawInputBuffer.trim().length === 0) {
        console.error("Simulation Aborted: No valid system input data was provided.");
        return; // Exit if no input is available.
    }

    // Split the entire input buffer into individual lines, filtering out any empty lines.
    const allInputLines = systemRawInputBuffer.split('\n').filter(line => line.trim() !== '');

    // Critical check: ensure there's at least one line for configuration.
    if (allInputLines.length === 0) {
        console.error("Simulation Aborted: Input data contains no active lines after filtering.");
        return;
    }

    // Parse the first line to get scheduler settings: [total_jobs_expected, time_quantum_per_turn].
    const schedulerConfiguration = extractNumericParameters(allInputLines[0]);

    // Validate the parsed configuration parameters.
    if (schedulerConfiguration.length < 2) {
        console.error("Configuration Error: First line must specify 'totalJobs timeQuantum'. Simulation cannot proceed.");
        return;
    }
    const expectedTotalJobs = schedulerConfiguration[0];
    const schedulerTimeQuantum = schedulerConfiguration[1];

    // Ensure fundamental parameters are positive.
    if (expectedTotalJobs <= 0 || schedulerTimeQuantum <= 0) {
        console.error(`Configuration Error: Both total jobs (${expectedTotalJobs}) and time quantum (${schedulerTimeQuantum}) must be positive integers. Simulation aborted.`);
        return;
    }

    // Initialize the queue that will hold jobs awaiting their turn for CPU time.
    /** @type {SchedulerJob[]} */
    const jobExecutionQueue = [];

    // Extract lines corresponding to job definitions.
    // We start from the second line (index 1) and go up to `expectedTotalJobs` lines.
    // Adding 1 to `expectedTotalJobs` for the slice end index because slice is exclusive.
    const jobDefinitionLines = allInputLines.slice(1, expectedTotalJobs + 1);

    // Populate the queue by parsing each job definition line.
    for (let i = 0; i < jobDefinitionLines.length; i++) {
        const potentialJob = createJobFromLine(jobDefinitionLines[i]);
        if (potentialJob) { // Only add valid jobs to the queue.
            jobExecutionQueue.push(potentialJob);
        } else {
            console.warn(`Skipping job entry due to parsing failure: "${jobDefinitionLines[i]}"`);
        }
    }

    // After population, verify that the queue isn't empty.
    if (jobExecutionQueue.length === 0) {
        console.warn("No valid jobs were successfully loaded into the execution queue. Simulation ending prematurely.");
        return;
    }

    // This variable tracks the total time units that have elapsed since the simulation began.
    let cumulativeSystemTime = 0;

    // The primary simulation loop continues as long as there are jobs waiting in the queue.
    while (jobExecutionQueue.length > 0) {
        // Dequeue the next job from the front of the queue.
        const currentActiveJob = jobExecutionQueue.shift();

        // Safety check: ensure a job was actually retrieved.
        if (!currentActiveJob) {
            console.warn("Unexpected condition: Attempted to process an undefined job from the queue. Breaking simulation loop.");
            break;
        }

        // Determine how much time this job will actually run for in this turn.
        // It's the minimum of its remaining required time and the scheduler's time quantum.
        const actualExecutionDuration = Math.min(currentActiveJob.remainingTimeUnits, schedulerTimeQuantum);

        // Advance the system's cumulative time by the duration the current job ran.
        cumulativeSystemTime += actualExecutionDuration;

        // Reduce the job's remaining time by the amount it just ran.
        currentActiveJob.remainingTimeUnits -= actualExecutionDuration;

        // Check if the job has now completed its entire execution.
        if (currentActiveJob.remainingTimeUnits <= 0) {
            // If the job is finished, print its identifier and the total time it completed at.
            console.log(`${currentActiveJob.jobId} ${cumulativeSystemTime}`);
        } else {
            // If the job still requires more time, re-enqueue it at the back of the queue
            // to await its next turn.
            jobExecutionQueue.push(currentActiveJob);
        }
    }
}

// --- Standard Input Stream Management ---

// Resume the standard input stream to start listening for data.
process.stdin.resume();
// Set the character encoding for the input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Event handler for when data chunks are received from stdin.
process.stdin.on('data', function (receivedChunk) {
    // Append each received data chunk to our global buffer.
    systemRawInputBuffer += receivedChunk;
});

// Event handler for when the input stream signals its end (no more data).
process.stdin.on('end', function () {
    // Once all input has been collected, initiate the Round Robin scheduling simulation.
    performRoundRobinSimulation();
});

// Optional: Add an error handler for the stdin stream for robustness.
process.stdin.on('error', (ioError) => {
    console.error('An error occurred while reading from standard input:', ioError);
    // It's good practice to exit with a non-zero code to indicate an error.
    process.exit(1);
});