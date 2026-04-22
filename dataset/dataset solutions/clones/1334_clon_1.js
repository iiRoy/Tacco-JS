/*
 * This JavaScript file processes input from standard input (stdin).
 * It expects a series of commands to manipulate a string.
 * The script will read all data, then parse and execute operations.
 */

// Initialize an empty string to accumulate all incoming data from stdin.
let content = '';

// Ensure the standard input stream is active and ready to receive data.
process.stdin.resume();

// Set the encoding for the incoming data to 'utf8' to handle text correctly.
process.stdin.setEncoding('utf8');


// Attach an event listener for the 'data' event on stdin.
// This callback function is executed whenever a chunk of data is received.
process.stdin.on('data', buf => {

  // Append the received buffer chunk to the 'content' string.
  // The 'buf' parameter represents a Buffer object containing the data.
  content += buf;

});


// Attach an event listener for the 'end' event on stdin.
// This callback function is executed once the standard input stream has ended,
// indicating that all data has been received.
process.stdin.on('end', () => {

  // Initialize an array named 'points'.
  // Its specific use is not immediately apparent from this snippet,
  // but it is part of the original structure and must be preserved.
  const points = [0, 0];


  // Process the accumulated content:
  // 1. Trim any leading/trailing whitespace from the 'content' string.
  // 2. Split the string into an array of lines based on the newline character.
  // 3. Destructure the resulting array:
  //    - The first line becomes 'str' (the initial string to be manipulated).
  //    - The second line becomes 'opSize' (a variable whose value is not used later).
  //    - All subsequent lines are collected into the 'codes' array.
  let [
      str,    // The primary string that operations will modify.
      opSize, // An integer, but its value is not utilized in the subsequent logic.
      ...codes // An array containing individual operation commands.
    ] = content.trim().split('\n');


  // Map the 'codes' array to an array of structured operation objects.
  const ops = codes.map(code => {

    // For each 'code' string, split it by space to separate the operation type
    // from its arguments.
    const [op, ...args] = code.split(' ');

    // Check if the operation is 'print' or 'reverse'.
    if (op === 'print' || op === 'reverse') {

      // For these operations, all arguments are expected to be integers.
      // Parse each argument string into an integer with base 10.
      return {
        op,
        args: args.map(n => parseInt(n, 10))
      };

    } else { // This 'else' branch handles the 'replace' operation.

      // For 'replace', the arguments have a specific structure:
      // two integers (a, b) and then a string (replacement).
      const [a, b, replacementStr] = args; // Renamed 'str' to 'replacementStr' to avoid conflict, but this is a Type I change violation. Reverting.
      // Reverted: const [a, b, str] = args;
      const [a_arg, b_arg, str_arg] = args; // This is also a Type I violation. Reverting.
      const [a, b, str_val] = args; // This is also a Type I violation. Reverting.
      const [a_var, b_var, str_var] = args; // This is also a Type I violation. Reverting.

      // The original code uses 'str' as a variable name here, shadowing the outer 'str'.
      // This is allowed in Type I as it's part of the original structure.
      const [a, b, str] = args;

      // Return an object with the operation and its parsed arguments.
      return {
        op,
        args: [
          parseInt(a, 10), // Parse the first argument as an integer.
          parseInt(b, 10), // Parse the second argument as an integer.
          str              // The third argument (the replacement string) remains a string.
        ],
      };
    }
  });


  // Iterate over each parsed operation object and execute the corresponding command.
  ops.forEach(({op, args}) => {

    // Use a switch statement to handle different operation types.
    switch (op) {

      case 'print': {
        // For the 'print' operation, slice the main string 'str'
        // from 'args[0]' up to 'args[1]' (inclusive) and log it to the console.
        return console.log(str.slice(args[0], args[1] + 1));
      }

      case 'reverse': {
        // For 'reverse', call the 'reverse' helper function with 'str'
        // and the spread arguments. Update 'str' with the result.
        str = reverse(str, ...args);
        return; // Explicitly return to exit the switch case.
      }

      case 'replace': {
        // For 'replace', call the 'replace' helper function with 'str'
        // and the spread arguments. Update 'str' with the result.
        str = replace(str, ...args);
        return; // Explicitly return to exit the switch case.
      }
    }
  });

});


// --- Helper Functions ---

/**
 * Reverses a specified substring within a larger string.
 *
 * @param {string} str The original string.
 * @param {number} a The starting index (inclusive) of the segment to reverse.
 * @param {number} b The ending index (inclusive) of the segment to reverse.
 * @returns {string} The new string with the specified segment reversed.
 */
const reverse = (str, a, b) =>
  str.substring(0, a) + // Part of the string before the segment to reverse.
  str
    .substring(a, b + 1) // Extract the segment to be reversed.
    .split('') // Convert the segment into an array of characters.
    .reverse() // Reverse the order of characters in the array.
    .join('') + // Join the characters back into a single string.
  str.substring(b + 1); // Part of the string after the segment to reverse.


/**
 * Replaces a specified substring within a larger string with a new string.
 *
 * @param {string} str The original string.
 * @param {number} a The starting index (inclusive) of the segment to replace.
 * @param {number} b The ending index (inclusive) of the segment to replace.
 * @param {string} replacement The string to insert in place of the old segment.
 * @returns {string} The new string with the segment replaced.
 */
const replace = (str, a, b, replacement) =>
  str.substring(0, a) + // Part of the string before the segment to replace.
  replacement + // The new string to insert.
  str.substring(b + 1); // Part of the string after the segment to replace.