/*
 * This file processes input from stdin to calculate
 * specific values related to a "pond" and "stack" data structure.
 * It's designed to solve a particular algorithmic problem.
 */

// Configuration object for input handling
const config = {
  // Input source, typically standard input
  input: '/dev/stdin',

  // Newline character used for splitting input lines
  newline: '\n'
};

// --- Input Reading Section ---

// Read the entire input file, decode it as UTF-8, and split into lines.
// The 'line' variable will hold an array of strings, where each string
// is a line from the input.
const line = require('fs')
                 .readFileSync(config.input, 'utf-8')
                 .split(config.newline);


// Initial data structure to hold the 'pond' and 'stack'
// This will be used as the initial accumulator for the reduce operation.
const data = {
  pond: [],  // Stores segments of the pond
  stack: []  // Helps track open backslashes
};

/*
 * Process the first line of input character by character.
 * The reduce function iterates over each character, maintaining
 * an accumulator (acc) which contains the 'pond' and 'stack'.
 */
const results = line[0].split('')
                      .reduce((acc, x, i) => {
                          // If a backslash is encountered, push its index onto the stack.
                          if (x === '\\') {
                            acc.stack.push(i);
                          }
                          // If a forward slash is encountered AND there's a backslash on the stack
                          else if (x === '/' && acc.stack.length > 0) {
                            // Pop the index of the matching backslash from the stack.
                            const k = acc.stack.pop();

                            // Filter the existing pond segments: 'hd' are segments starting at or after 'k'.
                            const hd = acc.pond.filter(xs => xs[0] >= k);

                            // 'tl' are segments starting before 'k'.
                            const tl = acc.pond.filter(xs => xs[0] < k);

                            // Calculate the sum for the new segment:
                            // [start index, total area of this segment]
                            // The area includes previous segments within this range plus the current segment's width.
                            const sum = [
                              k,
                              hd.map(xs => xs[1]).reduce((acc, x) => acc + x, 0) + (i - k)
                            ];

                            // Add the newly calculated segment to the 'tl' (tail) array.
                            tl.push(sum);

                            // Update the pond with the new, combined list of segments.
                            acc.pond = tl;
                          }

                          // Return the updated accumulator for the next iteration.
                          return acc;
                      }, data); // 'data' is the initial value of the accumulator.


// --- Final Calculation and Output ---

// Calculate the total sum of all areas in the pond.
const sum = results.pond.reduce((acc, x) => acc + x[1], 0);

// Get the number of distinct pond segments.
const l = results.pond.length;

// Output the total sum.
console.log(sum);

// Output the number of segments, followed by the area of each segment if any exist.
console.log(`${l}${l > 0 ? ' ' + results.pond.map(x => x[1].toString()).join(' ') : ''}`);