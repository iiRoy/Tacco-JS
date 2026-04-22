// Initialize a buffer to accumulate incoming standard input data.
let incomingBuffer = '';

// Ensure standard input stream is active and set its encoding to UTF-8.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for 'data' chunks from the standard input.
// Each chunk is appended to our accumulating buffer.
process.stdin.on('data', dataSegment => {
  incomingBuffer += dataSegment;
});

// Event listener for the 'end' of the standard input stream.
// This signifies that all input has been received, and processing can begin.
process.stdin.on('end', () => {
  /**
   * Helper function to parse a single line representing a job entry.
   * Expected format: "ProcessID ExecutionTime"
   * @param {string} recordString - The input line string.
   * @returns {object|null} A job object with id, initial time, and remaining time, or null if parsing fails.
   */
  const parseJobEntry = (recordString) => {
    const parts = recordString.trim().split(' '); // Trim individual line and split by space.
    
    // Basic validation: ensure the line has exactly two parts.
    if (parts.length !== 2) {
      console.error(`[ERROR] Skipping malformed job entry: "${recordString}". Expected "ID TIME".`);
      return null;
    }

    const processIdentifier = parts[0];
    const initialExecutionTime = Number(parts[1]); // Convert time string to a number.

    // Validate the parsed execution time.
    if (isNaN(initialExecutionTime) || initialExecutionTime <= 0) {
      console.error(`[ERROR] Skipping job with invalid execution time: "${recordString}". Time must be a positive number.`);
      return null;
    }

    // Return a structured object for the job.
    return {
      processId: processIdentifier,
      initialTime: initialExecutionTime,
      remainingTime: initialExecutionTime // This will be decremented during scheduling.
    };
  };

  // --- Input Processing and Validation ---

  // Clean and split the entire accumulated input into individual lines.
  // `filter(Boolean)` removes any empty lines that might result from splitting or extra newlines.
  const allInputLines = incomingBuffer
    .trim()
    .split('\n')
    .filter(Boolean);

  // If no valid lines remain after cleaning, log an error and exit.
  if (allInputLines.length === 0) {
    console.error("[CRITICAL] No valid input lines received for scheduling simulation. Please provide input.");
    return;
  }

  // The first line contains scheduler parameters: total process count and time slice interval (quantum).
  const firstLineDetails = allInputLines.shift().trim().split(' ');

  // Parse the total number of processes (though not directly used in the simulation logic, it's part of input spec).
  const totalProcessesCount = parseInt(firstLineDetails[0], 10);
  // Parse the time slice interval (quantum) for the Round Robin scheduler.
  const timeSliceInterval = parseInt(firstLineDetails[1], 10);

  // Validate the parsed time slice interval. It must be a positive number.
  if (isNaN(timeSliceInterval) || timeSliceInterval <= 0) {
    console.error(`[CRITICAL] Invalid or non-positive time slice interval provided: "${firstLineDetails[1]}". Exiting.`);
    return;
  }

  // Parse all subsequent lines as job definitions, filtering out any entries that failed parsing.
  const rawJobDefinitions = allInputLines
    .map(parseJobEntry)
    .filter(Boolean); // Ensure only valid job objects proceed.

  // Initialize the queue for jobs that are ready to be executed or are waiting.
  // We use a spread operator to create a shallow copy, so the original definitions remain untouched.
  let jobExecutionQueue = [...rawJobDefinitions];

  // Initialize the system's global clock, tracking elapsed time.
  let currentSystemTime = 0;

  // An array to keep a log of all jobs once they have completed their execution.
  const completedJobsLog = [];

  // --- Round Robin Scheduling Simulation ---

  // The main scheduling loop continues as long as there are jobs remaining in the queue.
  while (jobExecutionQueue.length > 0) {
    // Dequeue the next job from the front of the queue.
    const activeJob = jobExecutionQueue.shift();

    // Defensive check: if for some reason an invalid job slipped through or queue became empty unexpectedly.
    if (!activeJob) {
      continue;
    }

    // Determine how long this job will execute in the current time slice.
    // It's the minimum of its remaining required time and the defined time slice interval.
    const executedDuration = Math.min(activeJob.remainingTime, timeSliceInterval);

    // Advance the system's clock by the duration the job was executed.
    currentSystemTime += executedDuration;

    // Reduce the job's remaining execution time.
    activeJob.remainingTime -= executedDuration;

    // Check if the job has any time left after this execution burst.
    if (activeJob.remainingTime > 0) {
      // If the job is not yet finished, re-enqueue it at the back of the queue.
      jobExecutionQueue.push(activeJob);
    } else {
      // If the job's remaining time is 0 or less, it means it has completed.
      // Record its completion time.
      activeJob.completionTime = currentSystemTime;
      // Add the completed job to our log.
      completedJobsLog.push(activeJob);
      // Output the job's identifier and its final completion time.
      console.log(`${activeJob.processId} ${activeJob.completionTime}`);
    }
  }

  // Optional: A final message indicating the simulation has concluded.
  // console.log(`\n[INFO] Round Robin scheduling simulation concluded. Processed ${completedJobsLog.length} jobs.`);
});