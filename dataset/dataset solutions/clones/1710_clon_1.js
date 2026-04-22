/*
 * This JavaScript file enforces strict mode for cleaner, safer code.
 */
'use strict'

/*
 * The main function processes the input data.
 * @param {string} input - The raw input string, typically from stdin.
 */
function main (  input  ) {

  // Split the entire input string into an array of rows based on newline characters.
  const inputRows   =   input.split('\n');

  // Parse the first row to get the value of 'd'.
  const d   =   parseInt(inputRows[0]);

  // Split the second row by spaces to get an array of strings for 'c'.
  let cStrArray   =   inputRows[1].split(' ');

  // Convert the array of 'c' strings into an array of integers.
  const c   =   cStrArray.map(  str   =>   parseInt(str)  );

  // Initialize an empty array 's' which will store 2D data.
  let s   =   [];

  // Loop through the remaining input rows, starting from the third row (index 2).
  // These rows represent the 2D array 's'.
  for (  let i   =   2;   i   <   inputRows.length;   i++  ) {

    // For each row, push an empty array into 's' to represent a new sub-array.
    s.push([]);

    // Split the current input row by spaces to get temporary row elements.
    const tmpRow   =   inputRows[i].split(' ');

    // Loop through the elements of the temporary row.
    for (  let j   =   0;   j   <   tmpRow.length;   j++  ) {

      // Parse each element as an integer and push it into the current sub-array of 's'.
      // Note: i - 2 is used to correctly index into 's' as 'i' starts from 2.
      s[i   -   2].push(  parseInt(tmpRow[j])  );
    }
  }

  // Initialize an empty array 't' which will store the results of processing 's'.
  let t   =   [];

  // Iterate over each row in the 2D array 's'.
  for (  let i   =   0;   i   <   s.length;   i++  ) {

    // Initialize 'tmpMax' with the first element of the current row in 's'.
    let tmpMax   =   s[i][0];

    // Initialize 'index' to 0, representing the position of the maximum value found so far.
    let index   =   0;

    // Iterate through the rest of the elements in the current row of 's', starting from the second element.
    for (  let j   =   1;   j   <   s[i].length;   j++  ) {

      // Check if the current element is greater than the current maximum.
      if (  s[i][j]   >   tmpMax  ) {

        // If it is, update 'index' to the current position 'j'.
        index   =   j;

        // And update 'tmpMax' to the new maximum value.
        tmpMax   =   s[i][j];
      }
    }

    // After finding the maximum element in the row, push its 1-based index into 't'.
    t.push(  index   +   1  );
  }

  // Output the final array 't' to the console.
  console.log(t);
}

// Read input from standard in, decode it as UTF-8, and pass it to the main function.
main(  require("fs").readFileSync("/dev/stdin",   "utf8")  );

// This line appears to be a redundant call or a placeholder.
// In a typical Node.js environment, 'input' would not be defined in the global scope here.
main(input)