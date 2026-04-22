/*
 * This JavaScript code processes input from stdin.
 * It's designed to read multi-line input, perform transformations,
 * and then output the result to stdout.
 *
 * The core logic involves iteratively cleaning up a grid-like
 * structure represented by an array of strings.
 */


// Begin by resuming the standard input stream.
// This ensures that the process doesn't exit prematurely
// while waiting for input.
process.stdin.resume();


// Set the character encoding for the standard input stream to UTF-8.
// This is a common and robust encoding for text.
process.stdin.setEncoding('utf8');


// Declare a global variable to accumulate all chunks of input data
// received from stdin. It is initialized as an empty string.
var g_input = '';


// Attach an event listener to the 'data' event of the standard input stream.
// This function will be called whenever a chunk of data is received.
process.stdin.on('data', function (chunk) {

    // Append the current data chunk to the global input string.
    g_input += chunk;

});


// Attach an event listener to the 'end' event of the standard input stream.
// This function executes once all input has been received and the stream closes.
process.stdin.on('end', function () {

    // When the input ends, split the accumulated global input string
    // into an array of lines. It handles both Windows (\r\n) and Unix (\n) newlines.
    // The resulting array is then passed to the main processing function.
    main(g_input.split(/\r?\n/));

});


/**
 * This function processes an array of strings,
 * effectively trimming 'empty' rows and columns.
 * A row/column is considered 'empty' if it does not contain
 * the '#' character.
 *
 * @param {Array<string>} input An array of strings, where each string represents a row.
 * @returns {Array<any>} A tuple: [boolean, string]. The boolean indicates if any
 *                         modifications were made. The string is the processed input
 *                         joined by newline characters.
 */
function fn (input) {
  // Initialize a flag to false. This flag will be set to true
  // if any modifications (row/column removal) occur during this function's execution.
  var f = false;


  // --- Pass 1: Remove rows that do not contain '#' ---
  // Iterate through the input array from beginning to end.
  for (var i = 0; i < input.length; i++) {
    // Check if the current string (row) does NOT contain the '#' character.
    if (!input[i].match(/\#/)) {
      input.splice(i, 1); // If no '#', remove this row from the array.
      i--;                 // Decrement 'i' to re-check the element that moved
                           // into the current position after removal.
      f = true;            // Set the modification flag to true.
    }
  }


  // --- Pass 2: Convert each string into an array of characters ---
  // This prepares the data structure for easy column-wise processing.
  for (var i = 0; i < input.length; i++) {
    input[i] = input[i].split(""); // Split each string into an array of individual characters.
  }


  // --- Pass 3: Remove columns that do not contain '#' ---
  // This loop iterates through columns (index 'i' refers to column index).
  // It assumes 'input' is not empty and 'input[0]' exists.
  for (var i = 0; i < input[0].length; i++) {
    var flag = true; // Assume the current column is 'empty' (no '#') initially.

    // Nested loop: Iterate through each row for the current column 'i'.
    for (var j = 0; j < input.length; j++) {
      // If a '#' character is found in the current column at any row,
      // then this column is NOT empty.
      if (input[j][i] == "#") {
        flag = false; // Set flag to false, indicating '#' found.
      }
    }

    // After checking all rows for the current column, if 'flag' is still true,
    // it means the entire column does not contain any '#'.
    if (flag) {
      // Remove this 'empty' column from all rows.
      for (var j = 0; j < input.length; j++) {
        input[j].splice(i, 1); // Remove the character at column index 'i' from row 'j'.
      }
      j--; // This `j--` is an artifact; it doesn't affect the outer loop's `i`
           // or subsequent iterations of the inner `j` loop in a meaningful way
           // due to block scoping and loop control flow. It's kept for Type I fidelity.
      f = true; // Set the modification flag to true.
    }
  }


  // --- Pass 4: Convert character arrays back into strings ---
  // Reconstruct the rows from character arrays to strings.
  for (var i = 0; i < input.length; i++) {
    input[i] = input[i].join(""); // Join the array of characters back into a single string.
  }


  // Join all the processed rows into a single string,
  // separated by newline characters.
  input = input.join("\n");


  // Return the modification flag and the final processed string.
  return [f, input];
}


/**
 * The main function that orchestrates the processing.
 * It takes an array of input strings, removes the first element,
 * and then repeatedly applies the `fn` function until no more
 * changes are detected. Finally, it logs the result.
 *
 * @param {Array<string>} input An array of strings received from stdin.
 */
function main (input) {
  // Remove the first element from the input array.
  // This is a common pattern in competitive programming to discard
  // a line containing metadata like the number of test cases or array size.
  input.splice(0, 1);


  // Call the `fn` function for the first time.
  // The result `a` will be a tuple: [boolean, string].
  var a = fn(input);


  // Continuously call `fn` as long as the first element of `a` (the boolean flag)
  // indicates that modifications were made in the previous call.
  while (a[0]) {
    // Re-apply `fn`. Note that `fn` modifies the `input` array in place,
    // so subsequent calls to `fn(input)` operate on the already modified data.
    a = fn(input);
  }


  // Once `fn` returns `false` for its modification flag,
  // it means no more rows or columns could be removed.
  // Log the final processed string (the second element of `a`) to the console.
  console.log(a[1]);
}