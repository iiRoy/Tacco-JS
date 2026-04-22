var input = '';                                        // This variable will accumulate all incoming data from stdin.
var readable = process.stdin;                              // Obtain a reference to the standard input stream.

// --- Configure and start reading from stdin ---
readable.resume();                                         // Explicitly resume the input stream to begin data flow.
readable.setEncoding('utf-8');                             // Set the encoding for the input data to UTF-8 to handle text correctly.

readable.on('data', function(chunk) {                      // Attach an event listener for 'data' events.
  // Each time a chunk of data is available, this function will be called.
  input += chunk;                                          // Append the received data chunk to our 'input' string.
});

// --- Handle the 'end' of the input stream ---
readable.on('end', function() {                            // Attach an event listener for the 'end' event.
  // This function executes once all input data has been received.

  var data = input.split("\n");                            // Split the accumulated input string into an array of lines.
  var rc = data[0].split(" ").map(Number);                 // Parse the first line to get row (r) and column (c) counts.
                                                           // It splits by space and converts parts to numbers.
  var r = rc[0];                                           // Extract the number of rows from the parsed first line.
  var c = rc[1];                                           // Extract the number of columns from the parsed first line.

  var t = Array(c + 1);                                    // Initialize an array 't' to store column sums.
                                                           // It has 'c' elements for column sums and one extra for the grand total.

  for (var i = 0; i < c + 1; i++) {                        // Loop to initialize all elements of array 't' to zero.
    t[i] = 0;
  }

  var output = [];                                         // Initialize an array to store the formatted output lines.
  var len = data.length;                                   // Get the total number of lines in the input data array.

  // --- Process each data row from the second line onwards ---
  for (var index = 1; index < len; index++) {             // Iterate through the input data, skipping the first line (r, c counts).
    var nums = data[index].split(' ').map(Number);         // Parse the current data line into an array of numbers.
    var sum = 0;                                           // Initialize a variable to calculate the sum for the current row.

    // --- Calculate row sum and update column sums ---
    for (var j = 0; j < c; j++) {                          // Loop through each number in the current row (up to 'c' columns).
      sum += nums[j];                                      // Add the current number to the row's sum.
      t[j] += nums[j];                                     // Add the current number to its respective column's total in array 't'.
    }

    t[c] += sum;                                           // Add the calculated row sum to the last element of 't' (grand total).
    nums.push(sum);                                        // Append the row sum to the 'nums' array for the current row.
    output.push(nums.join(" "));                           // Join the numbers (including row sum) with spaces and add to output.
  }

  // --- Final output generation ---
  output.push(t.join(" "));                                // After processing all rows, join the elements of 't' (column sums + grand total)
                                                           // with spaces and add this as the final line to the output array.

  console.log(output.join("\n"));                          // Print all lines in the 'output' array, separated by newlines.
});