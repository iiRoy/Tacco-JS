/*
 * This script processes a list of tasks using a Round Robin scheduling algorithm.
 * Input is expected to be provided via standard input.
 */

// Global variable to accumulate raw input data
let programInput = '';

/*
 * Set up event listeners for standard input to capture all incoming data.
 */
process.stdin.resume(); // Ensure the input stream stays open
process.stdin.setEncoding('utf8'); // Specify character encoding for input
process.stdin.on(
  'data',
  function (bufferChunk) { // Event handler for incoming data chunks
    programInput += bufferChunk; // Append the received chunk to the overall input string
  }
);
process.stdin.on(
  'end',
  function () { // Event handler for when all input has been received
    programInput = programInput.split('\n'); // Split the accumulated input into lines
    orchestrateTasks(); // Initiate the primary task scheduling process
  }
);


/**
 * Core function to manage and execute the task scheduling.
 * It simulates a Round Robin scheduler based on provided input.
 */
function orchestrateTasks() {
  // Parse the first line of input: [number_of_tasks, time_quantum]
  const schedulerConfig = programInput[0].split(' ').map(Number);
  // Initialize a queue to hold pending tasks
  const jobPool = [];
  // Variable to hold the currently active job
  let activeJob;
  // Accumulator for the total time elapsed during task execution
  let elapsedTime;

  /*
   * Populate the job pool from the subsequent input lines.
   * Each line represents a job with its identifier and required processing time.
   */
  programInput.slice(1, schedulerConfig[0] + 1).forEach(
    function (jobDefinition) {
      jobDefinition = jobDefinition.split(' '); // Separate job identifier and time
      jobDefinition[1] = Number(jobDefinition[1]); // Convert time string to a numerical value
      jobPool.push(jobDefinition); // Add the parsed job to the end of the queue
    }
  );

  // Initialize the total elapsed time to zero
  elapsedTime = 0;

  // Main scheduling loop: continues as long as there are jobs in the queue
  while (jobPool.length !== 0) {

    activeJob = jobPool.shift(); // Retrieve the next job from the front of the queue

    // Check if the current job's remaining time is greater than the allocated time quantum
    if (activeJob[1] > schedulerConfig[1]) {
      // If so, the job is partially executed for one quantum
      activeJob[1] -= schedulerConfig[1]; // Reduce job's remaining time by the quantum
      elapsedTime += schedulerConfig[1]; // Add the quantum to the total elapsed time
      jobPool.push(activeJob); // Re-queue the job at the end for further processing
    } else {
      // If the job's remaining time is less than or equal to the quantum, it completes
      elapsedTime += activeJob[1]; // Add the job's remaining time to the total elapsed time
      // Output the job identifier and its completion time
      console.log(activeJob[0] + ' ' + elapsedTime);
    }
  }
}