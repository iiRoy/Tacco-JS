/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates extensive modifications to whitespace and comments
 * without altering any identifiers, operators, or the logical structure.
 *
 * The purpose of the original code is to read numerical input from stdin,
 * perform a specific calculation for each number, and then print the result
 * of that calculation to standard output.
 */

// --- Start of the main program execution flow ---


// Access the global 'process' object, which provides information about the
// current Node.js process.
process


  // Access the standard input stream ('stdin') from the 'process' object.
  .stdin


  // Attach an event listener for the "data" event on the stdin stream.
  // The provided callback function will be executed whenever data is received.
  .on(
    "data", // The name of the event to listen for.


    // This is the event handler function.
    // 'c' represents the chunk of data received from stdin (typically a Buffer).
    function (c) {

      // Process the incoming data chunk.
      // First, ensure the chunk is treated as a string.
      (c + "")


        // Remove any leading or trailing whitespace characters from the string.
        .trim()


        // Split the multi-line string into an array of individual lines.
        // The delimiter used is the newline character ("\n").
        .split("\n")


        // Use the '.some()' array method to iterate over each line.
        // This method will execute the provided callback for each element
        // until the callback returns a truthy value.
        .some(
          // This callback function processes each individual line 'n'.
          function (n) {

            // The core calculation logic is encapsulated within this compact 'for' loop.
            // It uses a non-standard structure where initialization, condition,
            // and even some operations are packed into the loop header.
            for (
                // Initialization part: Declare and initialize several variables.
                var d = +n, // 'd': Converts the input line 'n' (string) to a number.
                    i = 1,  // 'i': A counter variable, initialized to 1.
                    a = 0,  // 'a': An accumulator, initialized to 0, to store the final sum.
                    t       // 't': A temporary variable to hold intermediate product results.
                ; // End of the initialization section.

                // Condition part: This section performs calculations and determines loop continuation.
                t = i++ * d, // First, calculate 't' by multiplying 'i' (current value) with 'd'.
                             // Then, immediately increment 'i' (post-increment).
                             // The result of this assignment (`t = ...`) is the value assigned to `t`.
                t < 600 ?    // Next, check if the calculated 't' is less than 600.
                a += t * t * d : // If 't' IS less than 600, calculate (t * t * d) and add it to 'a'.
                0                // If 't' is NOT less than 600, the expression evaluates to 0, having no effect.
                                 // The loop continues as long as the entire expression (due to the comma operator,
                                 // this is effectively the result of the last part 't < 600 ? ... : ...')
                                 // evaluates to a truthy value (i.e., not 0 in this context).
                ; // End of the condition section.

                // Increment part: This part is explicitly empty in the original code.
                // The increment of 'i' occurs within the condition part (i++).
            )
            ; // The loop body is empty, as all necessary operations are handled in the header.


            // After the 'for' loop completes, print the accumulated sum 'a'.
            console.log(a);

            // The '.some()' method continues iterating until its callback returns 'true'.
            // By implicitly returning 'undefined' (which is falsy), we ensure that
            // all lines from the input are processed by this callback.
          }
        ); // End of the '.some()' method call.
    }
  ) // End of the '.on()' method call.


  // Resume the standard input stream. This is crucial for Node.js
  // to start emitting 'data' events if stdin was paused or not explicitly resumed.
  .resume();


// --- End of the main program logic ---

/*
 * This concludes the Type I cloned code.
 * It is functionally identical to the original, with only
 * cosmetic changes in whitespace and comments applied throughout.
 */