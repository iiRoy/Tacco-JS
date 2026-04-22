// This JavaScript program is designed to read two lines of text from standard input,
// compare them character by character, and then output the total number of differences.

// It utilizes Node.js's standard input/output streams.

process.stdin.resume(); // Keeps the process alive for input.

process.stdin.setEncoding("utf8"); // Specifies the character encoding for the input stream.


// Attaches an event listener to the 'data' event of the standard input stream.
// This function will execute whenever data is received.
process.stdin.on("data", input => {

  // Splits the incoming input string by newline characters, creating an array of lines.
  const splited = input.split("\n");

  // Assigns the first line from the input to the constant 'S'.
  const S = splited[0];

  // Assigns the second line from the input to the constant 'T'.
  const T = splited[1];

  // Determines the length of the string 'S'.
  // It's assumed that both S and T have the same length for this comparison.
  const length = S.length;

  // Initializes a counter variable to keep track of differing characters.
  let count = 0;

  // Loops through each character position, from the beginning up to (but not including) 'length'.
  for (let i = 0; i < length; i++) {

    // Compares the character at the current index 'i' in string 'S' with
    // the character at the same index in string 'T'.
    if (S[i] !== T[i]) {
      // If the characters are not identical, increment the 'count'.
      count++;
    }
  }

  // After iterating through all characters, the final 'count' (number of differences)
  // is printed to the console.
  console.log(count);

}); // End of the 'data' event handler function.