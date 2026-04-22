/*
 * This JavaScript program processes text manipulation commands received via standard input.
 * It reads an initial text string and a series of operations to perform on it.
 */

// Initialize a variable to accumulate input data.
var input = "";


// Resume standard input stream to start listening for data.
process.stdin.resume();

// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf-8');


// Event listener for incoming 'data' chunks from stdin.
process.stdin.on('data', function (chunk) {

  // Append each received data chunk to the 'input' variable.
  input += chunk;

}); // End of 'data' event handler


// Event listener for the 'end' of the standard input stream.
process.stdin.on('end', function () {
  /*
   * Once all input has been received, process the accumulated data.
   */

  // Split the entire input string by newline characters into an array of lines.
  input = input.split("\n");

  // The first line of input is the initial text string.
  var text = input[0];

  // The second line contains the number of queries (q). Parse it as an integer with base 10.
  var q = parseInt(input[1], 10);


  // Loop through each query, starting from the third line (index 2) up to q + 2.
  // The loop variable 'i' is declared implicitly here.
  for (i = 2; i <= q + 2; i++) {

    // Split the current query line by spaces to get the command and its arguments.
    var order = input[i].split(" ");

    // Parse the first argument (index 1) as an integer, representing 'a'.
    var a = parseInt(order[1], 10);

    // Parse the second argument (index 2) as an integer, representing 'b'.
    var b = parseInt(order[2], 10);


    // Use a switch statement to handle different types of commands.
    switch (order[0]) {

      // Case for the "print" command.
      case "print":
        // Print the substring of 'text' from index 'a' to 'b' (inclusive).
        // The slice method's second argument is exclusive, so we use b + 1.
        console.log(text.slice(a, b + 1));
        break; // Exit the switch after handling the "print" command.

      // Case for the "reverse" command.
      case "reverse":
        // Reconstruct the 'text' by:
        // 1. Taking the part before 'a'.
        // 2. Taking the part from 'a' to 'b' (inclusive), splitting it into characters,
        //    reversing the array, and joining it back into a string.
        // 3. Taking the part after 'b'.
        text = text.slice(0, a) // Part before index 'a'
               + text.slice(a, b + 1) // Part from 'a' to 'b'
                     .split("") // Convert to array of characters
                     .reverse() // Reverse the character array
                     .join("") // Join characters back into a string
               + text.slice(b + 1); // Part after index 'b'
        break; // Exit the switch after handling the "reverse" command.

      // Case for the "replace" command.
      case "replace":
        // Reconstruct the 'text' by:
        // 1. Taking the part before 'a'.
        // 2. Inserting the replacement string (order[3]).
        // 3. Taking the part after 'b'.
        text = text.slice(0, a) // Part before index 'a'
               + order[3] // The new string to insert
               + text.slice(b + 1); // Part after index 'b'
        break; // Exit the switch after handling the "replace" command.

    } // End of switch statement

  } // End of for loop through queries

}); // End of 'end' event handler for stdin