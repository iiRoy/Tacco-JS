const appSettings = { input: '/dev/stdin', newline: '\n' }; // Standard Unix-like input configuration

const concurrentTasks = 1; // Number of parallel worker processes to utilize

// The primary execution path is determined by the presence of a 'child' environment variable.
if (!process.env.hasOwnProperty('child')) {
  orchestratorProcess(); // Parent process logic
} else {
  workerProcess(); // Child process logic
}

/**
 * Orchestrates the main process, spawning child workers and collecting their results.
 */
function orchestratorProcess() {
  let inputContent; // Stores the entire content read from the input file.
  let totalLength; // Total character length of the input content.
  let segmentBoundaries; // Array defining start/end points for each worker.
  let commandPath; // Path to the Node.js executable.
  let commandArgs; // Arguments passed to the Node.js executable.
  let childProcs; // Array to hold child process objects.
  let environmentVars; // Environment variables for a child process.
  let loopIndex; // General-purpose loop counter.
  let completedTasks; // Counter for finished child processes.
  let taskResults; // Array to store results from each child process.

  // Read the entire input file synchronously.
  inputContent = require('fs').readFileSync(appSettings.input, 'ascii');

  // Determine the length of the content before the first newline.
  totalLength = inputContent.indexOf(appSettings.newline);

  // Initialize segment boundaries for workload distribution.
  segmentBoundaries = [0];
  for (loopIndex = 1; loopIndex < concurrentTasks; loopIndex++) {
    segmentBoundaries.push(Math.floor(totalLength * loopIndex / concurrentTasks));
  }
  segmentBoundaries.push(totalLength); // The final boundary is the total length.

  // Prepare command and arguments for spawning child processes.
  commandPath = process.argv[0];
  commandArgs = process.argv.slice(1);

  childProcs = []; // Initialize array for child process instances.
  taskResults = []; // Initialize array for collecting output from children.

  // Spawn child processes based on the 'concurrentTasks' count.
  for (loopIndex = 0; loopIndex < concurrentTasks; loopIndex++) {
    environmentVars = {}; // Create a fresh environment object for each child.
    environmentVars['child'] = true; // Mark this as a child process.
    environmentVars['index'] = loopIndex; // Assign a unique index to the child.
    environmentVars['start'] = segmentBoundaries[loopIndex]; // Define its processing start.
    environmentVars['end'] = segmentBoundaries[loopIndex + 1]; // Define its processing end.

    // Spawn the child process.
    childProcs.push(require('child_process').spawn(commandPath, commandArgs, {
      'env': environmentVars, // Pass the custom environment.
      'stdio': ['pipe', 'pipe', null] // stdin, stdout are piped; stderr is inherited.
    }));
    taskResults.push(''); // Initialize an empty string for this worker's output.
  }

  // Set up data listeners for each child process's stdout.
  for (loopIndex in childProcs) {
    childProcs[loopIndex].stdout.setEncoding('ascii'); // Ensure ASCII encoding for output.
    childProcs[loopIndex].stdout.on('data',
      (function () {
        const currentWorkerIndex = loopIndex; // Capture the current index for the closure.
        return function (dataChunk) {
          taskResults[currentWorkerIndex] = taskResults[currentWorkerIndex] + dataChunk; // Accumulate output.
        };
      })()
    );
    childProcs[loopIndex].stdout.resume(); // Start flowing data from stdout.
  }

  completedTasks = 0; // Initialize the counter for completed workers.

  // Set up exit listeners for each child process.
  for (loopIndex in childProcs) {
    childProcs[loopIndex].on('exit',
      (function () {
        const exitWorkerIndex = loopIndex; // Capture the index for the closure.
        return function () {
          // console.log("Worker exited: ", exitWorkerIndex); // Debugging line.
          completedTasks++; // Increment the count of finished workers.
          if (completedTasks === concurrentTasks) {
            // If all workers have finished, process and display results.
            for (let resultIndex in taskResults) {
              if (taskResults[resultIndex].length !== 0) {
                console.log(taskResults[resultIndex]); // Output non-empty results.
              }
            }
          }
        };
      })());
  }

  // Send the full input content to each child process's stdin.
  for (loopIndex in childProcs) {
    childProcs[loopIndex].stdin.write(inputContent, 'ascii'); // Write the data.
    childProcs[loopIndex].stdin.end(); // Close the stdin stream.
  }
}

/**
 * Executes the logic for a child worker process.
 */
function workerProcess() {
  let receivedInput = ''; // Accumulates data received via stdin.

  process.stdin.setEncoding('ascii'); // Set encoding for incoming data.
  process.stdin.on('data', function (dataChunk) {
    receivedInput = receivedInput + dataChunk; // Append received data.
  });
  process.stdin.on('end', executeWorkerLogic); // Call main logic when stdin ends.
  process.stdin.resume(); // Start reading from stdin.

  /**
   * Contains the core logic for the child process after all input is received.
   */
  function executeWorkerLogic() {
    let parsedInput; // Array holding the split input (text and pattern).
    let textToSearch; // The main text string.
    let patternToFind; // The pattern string to search for.
    let segmentStart; // The starting index for this worker's search.
    let segmentEnd; // The ending index for this worker's search.
    let foundIndices; // Array to store indices where the pattern is found.
    let searchPosition; // Current position in the text during search.

    // Split the received input into two parts: the text and the pattern.
    parsedInput = receivedInput.split(appSettings.newline, 2);
    textToSearch = parsedInput[0];
    patternToFind = parsedInput[1];

    // Retrieve the search range from environment variables.
    segmentStart = process.env.start;
    segmentEnd = process.env.end;

    foundIndices = []; // Initialize array for results.
    searchPosition = segmentStart; // Start searching from the assigned segment beginning.

    // Perform the pattern search within the assigned segment.
    while ((searchPosition = textToSearch.indexOf(patternToFind, searchPosition)) !== -1 && searchPosition < segmentEnd) {
      foundIndices.push(searchPosition); // Record the found index.
      searchPosition++; // Move to the next character to find overlapping matches.
    }

    // Write the collected indices to stdout, joined by newlines.
    process.stdout.write(foundIndices.join('\n'), 'ascii');
    // console.log(''); // Original had this commented out.
    process.stdout.end(); // Close the stdout stream.
    process.exit(); // Terminate the child process.
  }
}
