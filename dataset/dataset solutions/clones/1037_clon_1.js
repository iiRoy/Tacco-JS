'use strict'; /* This directive enforces stricter parsing and error handling on the code, leading to cleaner and more robust JavaScript. */

// The primary execution flow is managed by the 'waterfall' pattern.
// This design ensures that asynchronous tasks run sequentially, with the output of one
// serving as the input for the next, culminating in a final callback.

waterfall(
  [
    // Task 1: Asynchronously read a predefined number of lines from standard input.
    function (next) {
      /*
       * The 'lineReader' utility is invoked here.
       * It's configured to read exactly 4 lines.
       * Once these lines are successfully read, the 'next' callback
       * (provided by the waterfall mechanism) will be triggered,
       * passing the collected lines to the subsequent task.
       */
      lineReader(4, next);
    },
    // Task 2: Process the lines obtained from the previous step.
    function (line, next) {
      // Inline helper function for converting string representations to integers.
      var toInt = function (s) {
        return parseInt(s);
      };

      // Extract and parse the second line (index 1) into an array of integers.
      // Spaces are used as delimiters for splitting the string.
      var s = line[1].split(' ').map(toInt);

      // Extract and parse the fourth line (index 3) into another array of integers.
      var t = line[3].split(' ').map(toInt);

      // Implements a standard binary search algorithm.
      // This function efficiently determines if a target integer 'i' exists
      // within a sorted sub-segment of the 's' array, defined by 'start' and 'end' indices.
      function binSearch(start, end, i) {
        // console.log(start, end) /* Debugging output, intentionally preserved as a comment. */

        var arr = s; // The array being searched is 's' from the enclosing scope.

        // Calculate the value of the middle element within the current search range.
        var t = arr[start + Math.floor((end - start) / 2)];

        // Case 1: If the target 'i' is exactly equal to the middle element, it's found.
        if (i === t) {
          return 1; // Return 1 to indicate 'found'.
        }

        // Case 2: If the search range is invalid or has collapsed, the element is not present.
        if (start >= end) {
          return 0; // Return 0 to indicate 'not found'.
        }

        // Case 3: If 'i' is less than the middle element, recurse on the left half.
        if (i < t) {
          return binSearch(start, start + Math.floor((end - start) / 2) - 1, i);
        }

        // Case 4: If 'i' is greater than the middle element, recurse on the right half.
        if (i > t) {
          return binSearch(start + Math.floor((end - start) / 2) + 1, end, i);
        }
      }

      // Use the 'reduce' method on array 't' to count how many of its elements
      // are also present in array 's' (using the binary search).
      next(
        t.reduce(function (sum, i) {
          // console.log(i, sum,'---------------') /* Another debugging comment. */
          // Accumulate the results of the binary search for each element 'i' from 't'.
          return sum + binSearch(0, s.length - 1, i);
        }, 0)
      ); // The initial value for 'sum' is set to 0.
    },
  ],
  // Final callback executed once all tasks in the waterfall have completed.
  function (result) {
    console.log(result); // Display the final aggregated result to the user.

    process.exit(0); // Terminate the Node.js process gracefully with a success code.
  }
);

// Utility function: Iterates over a string's characters, applying a mapping function.
function strMap(str, map) {
  var newStr = ''; // Initialize an empty string to build the result.

  // Loop through each character of the input string.
  for (var i = 0; i < str.length; i++) {
    // Apply the 'map' function to the current character and its index,
    // then append the result to 'newStr'.
    newStr += map(str.charAt(i), i);
  }

  return newStr; // Return the newly constructed string.
}

// Utility function: Facilitates reading a specific number of lines from standard input.
function lineReader(limit, cb) {
  // Create a readline interface for interactive input/output.
  var reader = require('readline').createInterface({
    input: process.stdin, // Designate standard input as the source.
    output: process.stdout, // Standard output is specified, though not actively used for reading.
  });

  var lines = []; // An array to store the lines as they are read.
  var counter = 0; // A counter to track how many lines have been processed.

  // Event handler for the 'line' event, triggered upon reading each new line.
  reader.on('line', function (line) {
    lines.push(line); // Add the freshly read line to our collection.
    ++counter; // Increment the line counter.

    // Check if the required number of lines ('limit') has been reached.
    if (counter === limit) {
      reader.close(); // If so, close the readline interface to stop further input.
      return cb(lines); // Invoke the provided callback with all collected lines.
    }
  });

  // Event handler for the 'close' event, fired when the input stream ends.
  reader.on('close', function () {
    /* No specific actions are required upon closing for this implementation. */
  });

  // Event handler for the 'error' event, capturing any issues during line reading.
  reader.on('error', function (err) {
    cb(err); // Pass any encountered error to the callback.
  });
}

// Utility function: Orchestrates a series of asynchronous 'tasks' in a sequential manner.
// Each task receives a callback to trigger the next task, passing its results along.
function waterfall(tasks, cb) {
  var taskIndex = 0; // Index to keep track of the current task to execute.

  // Recursive function to process the next task in the sequence.
  function nextTask(args) {
    // Base case: If all tasks have been completed, invoke the final callback.
    if (taskIndex === tasks.length) {
      return cb.apply(null, args); // Pass all accumulated arguments to the final callback.
    }

    // Define the callback function that a task will use to signal completion
    // and pass its results to the subsequent task.
    var taskCallback = function () {
      var _arguments = arguments; // Capture the arguments passed to this task's callback.

      // Convert the 'arguments' object into a proper array and pass it
      // to the next iteration of 'nextTask'.
      nextTask(
        Object.keys(_arguments).reduce(function (memo, key) {
          memo.push(_arguments[key]); // Add each argument from the current task's output.
          return memo;
        }, [])
      );
    };

    args.push(taskCallback); // Append the task-specific callback to the current arguments list.

    var task = tasks[taskIndex++]; // Retrieve the current task function and advance the index.

    task.apply(null, args); // Execute the current task with its prepared arguments.
  }

  nextTask([]); // Initiate the waterfall process with an empty array of initial arguments.
}