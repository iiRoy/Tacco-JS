let inputBuffer = ''; // A buffer to store all incoming data from standard input.

// Activate the standard input stream to begin listening for data.
process.stdin.resume();

// Configure the standard input stream to interpret incoming bytes as UTF-8 encoded characters.
process.stdin.setEncoding('utf8');

// Register an event handler for the 'data' event.
// This function is called whenever a chunk of data is received from stdin.
process.stdin.on('data', (chunkData) => {
  inputBuffer += chunkData; // Append the received data chunk to our buffer.
});

// Register an event handler for the 'end' event.
// This function is executed once all data has been received from stdin.
process.stdin.on('end', () => {
  // Process the accumulated input data.
  // 1. Remove any leading or trailing whitespace from the entire input.
  // 2. Split the input string into an array of individual lines.
  // 3. Map each line to a structured format:
  //    - Split the line by space to separate the job name and its duration.
  //    - Convert the duration string to a numeric value using the unary plus operator.
  //    - Return an array containing the job name (string) and its numeric duration.
  // 4. Use array destructuring to extract the time slice (quantum) from the second element
  //    of the first parsed line, and collect all subsequent parsed lines into the 'jobQueue' array.
  const [[, timeSlice], ...jobQueue] = inputBuffer
    .trim()
    .split('\n')
    .map((inputLine) => {
      const [jobName, jobDuration] = inputLine.split(' '); // Separate name and duration.
      return [jobName, +jobDuration]; // Return as [string, number].
    });

  // Initialize a variable to keep track of the total time that has elapsed.
  let elapsedTime = 0;

  // Begin the simulation loop: continue as long as there are jobs remaining in the queue.
  while (jobQueue.length > 0) {
    // Retrieve the next job from the front of the queue for processing.
    const currentJob = jobQueue.shift();

    // Calculate the actual time this job will run in the current time slice.
    // It's the minimum of the job's remaining duration and the predefined time slice.
    const processedTime = Math.min(currentJob[1], timeSlice);

    // Increment the total elapsed time by the amount of time this job ran.
    elapsedTime += processedTime;

    // Decrease the remaining duration of the current job.
    currentJob[1] -= processedTime;

    // Check if the job still has time remaining after this processing step.
    if (currentJob[1] > 0) {
      // If the job is not yet complete, add it back to the end of the queue
      // to be processed in a future time slice.
      jobQueue.push(currentJob);
    } else {
      // If the job's remaining duration is zero or less, it means the job is finished.
      // Output the job's name and the total elapsed time at which it completed.
      console.log(currentJob[0], elapsedTime);
    }
  }
});
