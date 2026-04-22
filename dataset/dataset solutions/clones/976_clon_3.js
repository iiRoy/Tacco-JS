// Application configuration parameters.
// This example uses a Linux-style newline for input processing,
// matching a common convention for standard input.
const applicationSettings = {
    sourcePath: '/dev/stdin', // Specifies the input source, typically standard input on Linux
    lineDelimiter: '\n'       // Character sequence used to denote a new line within the input
};

// Defines the maximum number of parallel processing units to utilize.
// This value can be adjusted to control concurrency.
const MAX_PARALLEL_UNITS = 1;

// Entry point logic: determines whether to run as the parent orchestrator or a child worker.
// The presence of a 'child' environment variable signals a child process.
if (!Object.prototype.hasOwnProperty.call(process.env, 'child')) {
    // If 'child' env var is not present, this is the main process.
    initiateOrchestration();
} else {
    // If 'child' env var IS present, this is a spawned worker process.
    handleSubtaskExecution();
}

/**
 * Orchestrates the overall parallel execution. This function is responsible for:
 * 1. Reading the entire input data.
 * 2. Dividing the input into segments for parallel processing.
 * 3. Spawning multiple child processes, each assigned a segment.
 * 4. Collecting and aggregating results from all child processes.
 */
function initiateOrchestration() {
    // Declare all variables upfront, a style choice for this refactor.
    var fullInputContent,                // Stores the complete string read from the input source.
        totalDataLength,                 // The total character length of the input content.
        segmentBoundaries,               // An array of indices marking the start and end of each segment.
        nodeExecutablePath,              // Path to the Node.js interpreter, used to spawn new processes.
        scriptInvocationArguments,       // Arguments passed to this script, forwarded to children.
        childProcessesArray = [],        // Collection of `ChildProcess` objects.
        accumulatedChildResults = [],    // Stores the partial results received from each child.
        childSpecificEnvironment,        // Environment variables tailored for each child process.
        currentLoopIndex,                // General-purpose iterator for loops.
        completedChildCount = 0;         // Counter for tracking how many child processes have finished.

    // Step 1: Read the entire input content synchronously from the configured source.
    // Using 'utf8' encoding for broader character support, though 'ascii' was original.
    try {
        fullInputContent = require('fs').readFileSync(applicationSettings.sourcePath, 'utf8');
    } catch (readError) {
        console.error(`FATAL: Failed to read input from ${applicationSettings.sourcePath}. Error: ${readError.message}`);
        process.exit(1); // Terminate with an error code if input cannot be read.
    }

    // Early exit if the input data is unexpectedly empty.
    if (!fullInputContent || fullInputContent.length === 0) {
        console.warn("WARNING: Input content is empty. No processing will be performed.");
        return;
    }

    totalDataLength = fullInputContent.length;

    // Step 2: Calculate and define the segment boundaries for workload distribution.
    // Each child process will be assigned a specific range [start, end) within the input.
    segmentBoundaries = [0]; // The first segment always begins at index 0.
    for (currentLoopIndex = 1; currentLoopIndex < MAX_PARALLEL_UNITS; currentLoopIndex++) {
        const calculatedOffset = Math.floor(totalDataLength * currentLoopIndex / MAX_PARALLEL_UNITS);
        segmentBoundaries.push(calculatedOffset);
    }
    segmentBoundaries.push(totalDataLength); // The last boundary ensures the entire content is covered.

    // Step 3: Prepare the command and arguments for spawning new instances of this script.
    nodeExecutablePath = process.argv[0];       // The path to the 'node' executable.
    scriptInvocationArguments = process.argv.slice(1); // All arguments after 'node'.

    // Step 4: Spawn the designated number of child processes.
    const CHILD_PROCESS_MODULE = require('child_process'); // Cache the module for repeated use.
    for (currentLoopIndex = 0; currentLoopIndex < MAX_PARALLEL_UNITS; currentLoopIndex++) {
        // Construct environment variables for the current child process.
        // A shallow copy of the parent's environment is made, then specific variables are added.
        childSpecificEnvironment = Object.assign({}, process.env);
        childSpecificEnvironment['child'] = 'true'; // Marks this process as a child.
        childSpecificEnvironment['worker_id'] = String(currentLoopIndex); // Unique identifier for the worker.
        childSpecificEnvironment['segment_start_offset'] = String(segmentBoundaries[currentLoopIndex]);
        childSpecificEnvironment['segment_end_offset'] = String(segmentBoundaries[currentLoopIndex + 1]);

        // Spawn a child process using the same Node.js executable and script.
        // Stdio: parent's stdin -> child's stdin, child's stdout -> parent's stdout, child's stderr inherits parent's stderr.
        const newChildProcess = CHILD_PROCESS_MODULE.spawn(nodeExecutablePath, scriptInvocationArguments, {
            'env': childSpecificEnvironment,
            'stdio': ['pipe', 'pipe', 'inherit'] // Inheriting stderr helps with child debugging.
        });

        childProcessesArray.push(newChildProcess);
        accumulatedChildResults.push(''); // Initialize an empty string to store this child's results.
    }

    // Step 5: Configure data reception from each child's standard output.
    childProcessesArray.forEach((childProcInstance, childIndex) => {
        childProcInstance.stdout.setEncoding('utf8'); // Expecting UTF-8 encoded results from children.
        childProcInstance.stdout.on('data', (dataChunk) => {
            // Append incoming data chunks to the respective child's result string.
            if (dataChunk && typeof dataChunk === 'string') {
                accumulatedChildResults[childIndex] += dataChunk;
            }
        });
        childProcInstance.stdout.resume(); // Ensure the stdout stream is in flowing mode.
    });

    // Step 6: Set up exit handlers for each child process to track completion.
    childProcessesArray.forEach((childProcInstance, childIndex) => {
        childProcInstance.on('exit', (exitCode, signal) => {
            // console.debug(`DEBUG: Child worker ${childIndex} exited with code ${exitCode}, signal ${signal}.`);
            completedChildCount++;

            // When all child processes have completed, aggregate and display the final results.
            if (completedChildCount === MAX_PARALLEL_UNITS) {
                const finalOutputLines = [];
                accumulatedChildResults.forEach((segmentResult, resultIdx) => {
                    // Only include non-empty results, trimming any leading/trailing whitespace.
                    if (segmentResult.trim().length > 0) {
                        finalOutputLines.push(segmentResult.trim());
                    }
                });

                if (finalOutputLines.length > 0) {
                    // Join all collected lines with the configured line delimiter and print to console.
                    console.log(finalOutputLines.join(applicationSettings.lineDelimiter));
                } else {
                    console.log("INFO: No results were returned by any worker process.");
                }
                process.exit(0); // Successfully exit the parent process.
            }
        });

        // Handle potential errors during child process spawning or execution.
        childProcInstance.on('error', (spawnError) => {
            console.error(`ERROR: Child process ${childIndex} encountered an error: ${spawnError.message}`);
            // More robust error handling might involve attempting to restart the child or logging extensively.
        });
    });

    // Step 7: Distribute the full input content to each child's standard input.
    childProcessesArray.forEach((childProcInstance) => {
        // Verify that the child's stdin stream is available for writing.
        if (childProcInstance.stdin.writable) {
            childProcInstance.stdin.write(fullInputContent, 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error(`ERROR: Failed to write input to child stdin: ${writeErr.message}`);
                }
                childProcInstance.stdin.end(); // Close the stdin stream, signaling end of input to the child.
            });
        } else {
            console.warn("WARNING: Child stdin stream not writable. Input distribution skipped.");
        }
    });
}

/**
 * Executes the logic for a child worker process. This function is responsible for:
 * 1. Reading its assigned input segment from stdin.
 * 2. Performing the specific task (e.g., searching for a pattern).
 * 3. Writing its results to stdout.
 */
function handleSubtaskExecution() {
    var accumulatedInputBuffer = ''; // Buffer to collect all data received via stdin.

    // Set the encoding for stdin to correctly interpret incoming data.
    process.stdin.setEncoding('utf8');

    // Event listener for receiving data chunks from the parent process via stdin.
    process.stdin.on('data', (inputChunk) => {
        if (inputChunk) { // Only append if the chunk is not empty or null.
            accumulatedInputBuffer += inputChunk;
        }
    });

    // Event listener for the 'end' of the stdin stream, indicating all input has been received.
    process.stdin.on('end', () => {
        performSegmentProcessing(accumulatedInputBuffer);
    });

    // Resume the stdin stream to begin receiving data.
    process.stdin.resume();
}

/**
 * Contains the core processing logic for a child worker. It extracts search parameters
 * from the received input and environment variables, then performs a pattern search
 * within its designated segment of the main text.
 * @param {string} rawInput - The complete input string received by this child process.
 */
function performSegmentProcessing(rawInput) {
    const workerEnvironment = process.env; // Cache environment variables for convenience.
    const workerId = workerEnvironment.worker_id || 'UNKNOWN'; // Retrieve worker ID.

    // Validate and parse the segment start and end offsets from environment variables.
    const segmentStartOffset = parseInt(workerEnvironment.segment_start_offset, 10);
    const segmentEndOffset = parseInt(workerEnvironment.segment_end_offset, 10);

    // Guard clause: ensure segment boundaries are valid integers and make sense.
    if (isNaN(segmentStartOffset) || isNaN(segmentEndOffset) || segmentStartOffset < 0 || segmentEndOffset < segmentStartOffset) {
        console.error(`ERROR (Worker ${workerId}): Invalid segment boundaries received. Start: '${workerEnvironment.segment_start_offset}', End: '${workerEnvironment.segment_end_offset}'.`);
        process.exit(1);
    }

    // The raw input is expected to be composed of the main text and the search pattern,
    // separated by the configured line delimiter (e.g., "main_text\npattern").
    const firstDelimiterIndex = rawInput.indexOf(applicationSettings.lineDelimiter);
    if (firstDelimiterIndex === -1) {
        console.error(`ERROR (Worker ${workerId}): Input format error: Could not find expected line delimiter in received data.`);
        process.exit(1);
    }

    const mainCorpusString = rawInput.substring(0, firstDelimiterIndex);
    const searchPattern = rawInput.substring(firstDelimiterIndex + applicationSettings.lineDelimiter.length);

    // Guard clause: ensure both the corpus and pattern are non-empty.
    if (!mainCorpusString || mainCorpusString.length === 0 || !searchPattern || searchPattern.length === 0) {
        console.error(`ERROR (Worker ${workerId}): Missing or empty main text or search pattern in input.`);
        process.exit(1);
    }

    // Array to collect all indices where the pattern is found within the segment.
    const foundMatchIndices = [];
    let currentSearchPosition = segmentStartOffset;

    // Perform the pattern search. The loop continues as long as matches are found
    // and those matches fall within the worker's assigned segment.
    while (true) {
        let matchIndex = mainCorpusString.indexOf(searchPattern, currentSearchPosition);
        
        // If no more matches are found, or the match is beyond the segment end, break the loop.
        if (matchIndex === -1 || matchIndex >= segmentEndOffset) {
            break;
        }
        
        foundMatchIndices.push(matchIndex);
        currentSearchPosition = matchIndex + 1; // Advance search position past the current match.
    }

    // Output the found indices, joined by the application's line delimiter.
    if (foundMatchIndices.length > 0) {
        process.stdout.write(foundMatchIndices.join(applicationSettings.lineDelimiter), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error(`ERROR (Worker ${workerId}): Failed to write results to stdout: ${writeErr.message}`);
            }
            process.stdout.end(); // Signal that no more data will be written to stdout.
        });
    } else {
        // If no matches were found, still end stdout to signal completion to the parent.
        process.stdout.end();
    }
    
    // Explicitly exit the child process with a success code.
    process.exit(0);
}