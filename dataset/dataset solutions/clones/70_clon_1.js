/*
 * This JavaScript file processes input from stdin.
 * It attempts to "decrypt" lines of text using a Caesar cipher-like shift
 * and then prints lines that contain specific keywords after decryption.
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 */

// Resume the standard input stream to listen for data.
process.stdin.resume();


// Set the encoding for the incoming data stream to UTF-8.
process
  .stdin
  .setEncoding(
    'utf8'
  );


// Attach an event listener for the 'data' event on stdin.
// When data is received, the 'ondata' function will be called.
process.stdin.on('data',
  ondata
);


/**
 * Handles incoming data chunks from the standard input.
 * This function is triggered whenever data is available.
 *
 * @param {string} data - The raw data string received from stdin.
 */
function ondata(
  data
) {
  // Split the received data into individual lines
  // and process each line using the decrypt function.
  data
    .split(
      '\n'
    )
    .forEach(
      decrypt
    );
}


/**
 * Decrypts a given string by shifting each lowercase letter by one position
 * (a -> b, b -> c, ..., z -> a).
 * It then checks if the decrypted string contains "the", "this", or "that".
 * If it does, the string is printed to stdout.
 * This function also includes a recursive call to itself, iterating 26 times.
 *
 * @param {string} str - The string to be processed and potentially decrypted.
 * @param {number} i   - An iteration counter, used for the recursive calls.
 *                       It starts implicitly at 0 for the first call from forEach.
 */
function decrypt(
  str
  ,
  i
) {
  // Apply a Caesar cipher shift to all lowercase letters in the string.
  // Each letter is shifted forward by one position (e.g., 'a' becomes 'b').
  str
    =
    String(
      str
    )
    .replace(
      /[a-z]/g,
      function(
        c // 'c' represents the current character matched by the regex.
      ) {
        // Calculate the new character code:
        // 1. Get the ASCII code of the character.
        // 2. Subtract the ASCII code of 'a' to get a 0-25 index.
        // 3. Add 1 for the shift.
        // 4. Use modulo 26 to wrap around (e.g., 25 + 1 = 26 % 26 = 0).
        // 5. Add back the ASCII code of 'a' to get the new character's code.
        return String.fromCharCode(
          0x61
          +
          (
            (
              c
                .charCodeAt(
                  0
                )
              -
              0x61
            )
            +
            1
          )
          %
          26
        );
      }
    );

  // Check if the modified string contains any of the target keywords.
  if (
    /the|this|that/
      .test(
        str
      )
  ) {
    // If a keyword is found, print the modified string to standard output,
    // followed by a newline character.
    process
      .stdout
      .write(
        str
        +
        '\n'
      );
  }

  // Ensure 'i' is treated as a number.
  // This bitwise OR with 0 effectively converts 'undefined' or other non-numeric
  // values to 0, and keeps numbers as they are.
  i
    |=
    0;

  // This function calls itself recursively up to 26 times.
  // The 'i' parameter acts as a counter for these iterations.
  if (
    i
    <
    26
  ) {
    // Increment 'i' before passing it to the next recursive call.
    // The string 'str' remains the same for subsequent recursive calls
    // within this chain, as the decryption is only applied once at the start.
    decrypt(
      str
      ,
      ++i
    );
  }
}
// End of the JavaScript code.