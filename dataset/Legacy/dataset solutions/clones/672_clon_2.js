let taskCount; // Global variable to store the number of tasks for a given test case
let jobData = []; // Global array to hold job details (duration, deadline)

/**
 * Orchestrates the entire job scheduling process.
 * Reads input, performs scheduling checks, and outputs results.
 */
function processScheduling() {
    // Continuously process test cases until a termination signal is received
    for (;;) {
        taskCount = readNextToken(); // Get the count of jobs for the current scenario

        // A taskCount of 0 indicates the end of input, so we exit the loop
        if (taskCount === 0) {
            break;
        }

        // Populate the jobData array with duration and deadline for each job
        iterateRange(0, taskCount, function(currentIdx) {
            jobData[currentIdx] = [readNextToken(), readNextToken()]; // Each job is [duration, deadline]
        });

        // Sort the jobs based on their deadlines in ascending order.
        // This is a critical step for the Earliest Deadline First (EDF) scheduling algorithm.
        jobData.sort(function(firstJob, secondJob) {
            return firstJob[1] - secondJob[1]; // Compare deadlines (second element of each job array)
        });

        let isFeasible = true; // Flag to track if the current schedule is possible
        let accumulatedTime = 0; // Keeps track of the total time elapsed as jobs are processed

        // Iterate through the sorted jobs to determine if they can all be completed by their deadlines
        iterateRange(0, taskCount, function(currentIdx) {
            accumulatedTime += jobData[currentIdx][0]; // Add the current job's duration to the total time
            // If the current job's deadline is earlier than the accumulated time,
            // it means this job cannot be completed on time.
            if (jobData[currentIdx][1] < accumulatedTime) {
                isFeasible = false; // The schedule is not feasible
                return false; // Stop iterating, as feasibility is already broken
            }
        });

        // Output the result for the current test case
        displayResult(isFeasible ? "Yes" : "No");
    }
}

/**
 * A flexible utility function for iterating over a numeric range.
 * It can be called with (end, callback) or (start, end, callback).
 * @param {number} initialValue - The starting value of the iteration (inclusive).
 * @param {number} limitValue - The upper bound of the iteration (exclusive).
 * @param {Function} callbackFn - A function to execute for each iteration, receiving the current index.
 *                                If the callback returns `false`, the loop terminates early.
 */
function iterateRange(initialValue, limitValue, callbackFn) {
    // Adjust arguments if only two are provided (meaning start is implicitly 0)
    if (callbackFn === undefined) {
        callbackFn = limitValue;
        limitValue = initialValue;
        initialValue = 0;
    }

    // Standard for loop iteration
    for (let currentIdx = initialValue; currentIdx < limitValue; ++currentIdx) {
        // Execute the provided callback function
        if (callbackFn(currentIdx) === false) {
            break; // Terminate loop if callback returns false
        }
    }
}

// Configure standard input stream for reading data
process.stdin.resume();
process.stdin.setEncoding('utf8');

let rawInputBuffer = ''; // Buffer to accumulate all incoming data from stdin
let inputTokenPointer = 0; // Index to keep track of the current position in the parsed input array

/**
 * Reads and returns the next token from the pre-processed input buffer.
 * Tokens are typically numbers, but can be strings if specified.
 * @param {string} [dataType] - Optional. If 'string', the token is returned as a string.
 *                               Otherwise, it's converted to a number.
 * @returns {string|number} The next token from the input.
 */
function readNextToken(dataType) {
    if (dataType === 'string') {
        return rawInputBuffer[inputTokenPointer++];
    } else {
        // Use unary plus to convert the string token to a number
        return +rawInputBuffer[inputTokenPointer++];
    }
}

/**
 * Prints a given value to the console, followed by a newline.
 * This function serves as the primary output mechanism.
 * @param {*} outputValue - The value to be displayed.
 */
function displayResult(outputValue) {
    console.log(outputValue);
}

// Event listener for when data chunks are received from stdin
process.stdin.on('data', function(dataSegment) {
    rawInputBuffer += dataSegment; // Append the new data chunk to the buffer
});

// Event listener for when the entire stdin stream has ended
process.stdin.on('end', function() {
    // Once all input is received, clean it up:
    // 1. Trim leading/trailing whitespace.
    // 2. Split the string into an array of tokens using whitespace as a delimiter.
    rawInputBuffer = rawInputBuffer.trim().split(/\s+/);
    // After processing the input, initiate the main scheduling logic
    processScheduling();
});
