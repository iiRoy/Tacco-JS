var totalItems;
var jobSchedule = [];

/*
 * This function orchestrates the main job scheduling and feasibility check.
 * It repeatedly reads sets of jobs, sorts them by deadline, and determines
 * if all jobs can be completed by their respective deadlines.
 */
function processJobs() {
    // The main execution loop continues until an explicit break condition is met.
    for (;;) {
        totalItems = fetchInputDatum(); // Obtain the count of jobs for the current batch.

        // A count of zero signifies the end of input, so the loop terminates.
        if (totalItems === 0) {
            break;
        }

        // Populate the 'jobSchedule' array with job details (duration and deadline).
        // Each job is represented as an array: [duration, deadline].
        performIteration(totalItems, function(currentIdx) {
            jobSchedule[currentIdx] = [fetchInputDatum(), fetchInputDatum()];
        });

        // Sort the jobs based on their deadline. Jobs with earlier deadlines
        // are processed first, which is a common greedy approach for scheduling.
        jobSchedule.sort(function(jobA, jobB) {
            return jobA[1] - jobB[1];
        });

        var isPossible = true; // Flag to track if the current schedule is feasible.
        var accumulatedDuration = 0; // Keeps track of the total time spent on jobs up to the current point.

        // Iterate through the sorted jobs to verify if each can meet its deadline.
        performIteration(totalItems, function(currentIdx) {
            accumulatedDuration += jobSchedule[currentIdx][0]; // Add the current job's processing time.
            // If the current job's deadline is earlier than the total time accumulated so far,
            // then this schedule is not possible.
            if (jobSchedule[currentIdx][1] < accumulatedDuration) {
                isPossible = false; // Mark the schedule as infeasible.
                return false;       // Terminate the iteration early as feasibility is already broken.
            }
        });

        // Output the result of the feasibility check.
        outputResult(isPossible ? "Yes" : "No");
    }
}

/*
 * A versatile iteration utility function, similar to a for loop.
 * It can be called with either one or two numeric bounds, and a callback function.
 * If called with (N, callback), it iterates from 0 to N-1.
 * If called with (A, B, callback), it iterates from A to B-1.
 */
function performIteration(startBound, endBound, actionFn) {
    // Adjust arguments if only an upper bound and a callback are provided.
    if (actionFn === undefined) {
        actionFn = endBound;    // The second argument is the callback.
        endBound = startBound;  // The first argument is the upper bound.
        startBound = 0;         // Start the iteration from zero.
    }

    // Execute the loop from the determined start bound up to (but not including) the end bound.
    for (var currentIdx = startBound; currentIdx < endBound; ++currentIdx) {
        // If the provided action function returns `false`, the loop is terminated.
        if (actionFn(currentIdx) === false) {
            break;
        }
    }
}

// Initialize the standard input stream for reading user data.
process.stdin.resume();
// Set the encoding for incoming data to UTF-8.
process.stdin.setEncoding('utf8');

var rawInputBuffer = ''; // A string buffer to accumulate all incoming standard input data.
var bufferPosition = 0;  // An index pointer to the current element in the parsed input array.

/*
 * Retrieves the next data item from the processed input buffer.
 * By default, it attempts to convert the item to a number.
 * If 'string' is specified as desiredType, it returns the item as a string.
 */
function fetchInputDatum(desiredType) {
    // If the caller explicitly requests a string type, return the raw string.
    if (desiredType === 'string') {
        return rawInputBuffer[bufferPosition++];
    }
    // Otherwise, convert the string item to a number using the unary plus operator.
    else {
        return +rawInputBuffer[bufferPosition++];
    }
}

/*
 * Prints the given value to the console, followed by a newline.
 * This function wraps `console.log` for consistent output handling.
 */
function outputResult(valueToDisplay) {
    console.log(valueToDisplay);
}

// Attach an event listener to the standard input stream to handle incoming data.
process.stdin.on('data', function(dataPiece) {
    rawInputBuffer += dataPiece; // Append each received data piece to the input buffer.
});

// Attach an event listener for when the standard input stream signals its end.
process.stdin.on('end', function() {
    // Once all input has been received, trim leading/trailing whitespace and split the
    // entire buffer into an array of strings based on any whitespace delimiter.
    rawInputBuffer = rawInputBuffer.trim().split(/\s+/);
    // After parsing the input, initiate the main job processing logic.
    processJobs();
});