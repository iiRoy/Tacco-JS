/*
 * This is a Type I clone generated from the original source.
 * All functional aspects, variable names, and logic remain precisely identical.
 * Only whitespace and comments have been altered to demonstrate visual difference.
 */
// The following section was commented out in the original source,
// suggesting it might be an alternative input method or legacy code.
// var lines = [];
// var reader = require('readline').createInterface({
//   input: process.stdin,
//   output: process.stdout
// });
// reader.on('line', function (line) {
//   lines.push(line);
// });



// Initialize an empty string to accumulate all incoming data from standard input.
var      input    =    '';


// Ensure the standard input stream remains open, preventing the process from exiting prematurely.
process.stdin.resume();
// Set the encoding for the incoming data to UTF-8, which is common for text.
process.stdin.setEncoding('utf8');

// Attach a 'data' event listener to process.stdin.
// This function will be called whenever new data chunks are available.
process.stdin.on('data',   function(chunk)   {
  input   +=   chunk;     // Append each received data chunk to the 'input' string.
});


// Attach an 'end' event listener to process.stdin.
// This function will be called once the entire input stream has been received.
process.stdin.on('end',    function()   {

    // Split the accumulated input string by newline characters to get an array of lines.
    input = input.split('\n');

    // Call the main processing function after all input has been read.
    main();

});


// Define a global array representing the mapping of numeric button presses to characters.
// The index corresponds to the button number (1-9), and the inner array contains characters.
// Note: Index 0 is intentionally left empty/unused in this specific mapping scheme.
var button = [

  []
  ,
  [ '.', ',', '!', '?', ' ' ]
  ,
  [ 'a', 'b', 'c' ]
  ,
  [ 'd', 'e', 'f' ]
  ,
  [ 'g', 'h', 'i' ]
  ,
  [ 'j', 'k', 'l' ]
  ,
  [ 'm', 'n', 'o' ]
  ,
  [ 'p', 'q', 'r', 's' ]
  ,
  [ 't', 'u', 'v' ]
  ,
  [ 'w', 'x', 'y', 'z' ]

];


/**
 * Decodes a sequence of button presses (represented as a string) into a readable message.
 * This function simulates text input on an old-style mobile phone keypad.
 * @param {string} str The input string representing button presses.
 * @returns {string} The decoded message.
 */
function solve ( str ) {

    var result = '',             // Stores the continuously built decoded message.
        pushed = '',             // Stores the last numeric button that was pressed.
        times  = 0,              // Counts how many consecutive times the 'pushed' button was pressed.
        temp;                    // A temporary variable to hold the character array for a given button.

    // Iterate through each character in the input string of button presses.
    for ( var i = 0 ; i < str.length ; i++ ) {

        // If the current character is '0', it signifies the end of a sequence of presses for a single button.
        if ( str[i] == '0' ) {

            // If there were actual presses (i.e., 'times' is not zero) before the '0'.
            if ( times !== 0 ) {

                // Convert the 'pushed' button string to a number and get its corresponding character array.
                temp = button[ +pushed ];

                // Append the correct character to the result.
                // The character is determined by (number of presses - 1) modulo the length of the character array.
                result += temp[ ( times - 1 ) % temp.length ];

            }

            // Reset the counter for consecutive presses after processing a '0'.
            times = 0;

        } else { // If the current character is a numeric button (1-9).

            // Update the last button that was pressed.
            pushed = str[i];
            // Increment the counter for consecutive presses of this button.
            times++;

        }
    }

    // Return the final decoded string.
    return result;

}


/**
 * The main function orchestrates the decoding process for multiple test cases.
 * It reads the number of test cases from input and then processes each case.
 */
function main() {

    // The first line of input contains the number of test cases.
    // Convert it to a number using the unary plus operator.
    var n = +input[0];

    // Loop through each test case, starting from the second line of input.
    for ( var i = 0 ; i < n ; i++ ) {

        // Solve the current test case (input[i + 1]) and print the result to the console.
        console.log( solve( input[ i + 1 ] ) );

    }

}