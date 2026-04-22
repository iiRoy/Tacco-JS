/*
 * This JavaScript program processes input from standard input (stdin).
 * It expects a sequence of lines, where some lines represent
 * numeric operations and others represent new string values.
 * The program performs string shuffling based on numeric inputs
 * and collects certain string states as results.
 */

let content = ''; // This variable accumulates all incoming data from stdin.


process.stdin.resume(); // Activates the standard input stream to begin receiving data.

// Sets the character encoding for the input stream to UTF-8.
// This ensures proper interpretation of multi-byte characters.
process.stdin.setEncoding('utf8');


// Event listener for the 'data' event on the standard input stream.
// This callback function is executed whenever a chunk of data is received.
process.stdin.on('data', buf => {
  // The received data 'buf' (a Buffer object) is appended to 'content'.
  // JavaScript implicitly converts the Buffer to a string for concatenation.
  content += buf;
});


// Event listener for the 'end' event on the standard input stream.
// This signifies that all input has been successfully received and the stream is closed.
process.stdin.on('end', () => {

  // First, trim any leading/trailing whitespace from the accumulated content.
  // Then, split the content into an array of lines based on the newline character.
  // The first line is destructured into 'curAlpha', and the rest go into the 'lines' array.
  let [curAlpha, ...lines] = content.trim().split('\n');

  const results = []; // An array to store the final string results that will be printed.

  // Iterate through the 'lines' array, starting from the second element (index 1).
  // The first element of the original content was already assigned to 'curAlpha'.
  for (let i = 1; i < lines.length; i++) {

    // Attempt to parse the current line as an integer in base 10.
    const h = parseInt(lines[i], 10);

    // Check if the parsed value 'h' is a valid number (i.e., not Not-a-Number).
    if (!isNaN(h)) {
      // If 'h' is a valid number, apply the 'shuffle' function to 'curAlpha'
      // using 'h' as the shifting parameter, and update 'curAlpha' with the result.
      curAlpha = shuffle(curAlpha, h);
    } else {
      // If 'h' is not a number, it indicates a new block of operations or a new starting string.
      // 1. The current 'curAlpha' string is added to the 'results' array.
      results.push(curAlpha);
      // 2. The current line (which was not a number) becomes the new 'curAlpha' string.
      curAlpha = lines[i];
      // 3. Increment 'i' to skip the next line. This is a specific logic
      //    where a non-numeric line consumes the current line as the new alpha
      //    and implicitly skips the *next* logical line in the sequence.
      i++;
    }
  }

  // After the loop completes, all results are joined together by newline characters
  // and then printed to the standard output.
  console.log(results.join('\n'));
});


// Defines a constant arrow function named 'shuffle'.
// This function performs a cyclic string shift (rotation).
const shuffle = (str, h) =>
  // It takes a string 'str' and an integer 'h'.
  // It returns a new string formed by taking the substring of 'str'
  // starting from index 'h' to the end, concatenated with the substring
  // from index 0 up to (but not including) index 'h'.
  str.slice(h) + str.slice(0, h);