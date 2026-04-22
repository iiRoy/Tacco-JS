'use strict'; // Enable strict mode for better error handling and cleaner code.

// This function reads input from standard input.
function myin() {

  return require("fs")
         .readFileSync("/dev/stdin", "utf8") // Read the entire file synchronously.
         .trim();                            // Remove leading/trailing whitespace.
}


// This function writes the given text to standard output.
function myout(t) {

  console.log(t); // Output the result.

}


// --- Helper function for input conversion based on a given type ---
// The 'no' parameter determines the conversion type:
// 0: No conversion, return as is.
// 1: Convert to integer.
// 2: Split by single space.
// 3: Split by newline.
// 4: Split by space and convert each part to a number (array of numbers).
// 5: Split by newline and convert each part to a number (array of numbers).
// 6: Split into individual characters (array of strings).
// 7: Split into individual characters and convert each to a number (array of numbers).

function myconv( i , no ) {

  switch ( no ) {

    case 0:
      return i; // No conversion.

    case 1:
      return parseInt( i ); // Convert to integer.

    case 2:
      return i.split( " " ); // Split by space.

    case 3:
      return i.split( "\n" ); // Split by newline.

    case 4:
      return i.split( " " )
              .map( ( a ) => Number( a ) ); // Split by space, then map to numbers.

    case 5:
      return i.split( "\n" )
              .map( ( a ) => Number( a ) ); // Split by newline, then map to numbers.

    case 6:
      return i.split( "" ); // Split into individual characters.

    case 7:
      return i.split( "" )
              .map( ( a ) => Number( a ) ); // Split into individual characters, then map to numbers.

  }

}


// The main logic of the program resides in this function.
function Main( input ) {

  // Convert the raw input string into an array of strings, split by newline.
  input = myconv( input , 3 );

  // Remove the first element of the array (often a count or irrelevant line).
  input.shift();

  // Initialize a variable to store the cumulative output.
  var output = 0;

  // Iterate through each remaining line in the input array.
  for ( var i = 0 ; i < input.length ; i++ ) {

    // Parse the first number from the current line, separated by a space.
    var A = parseInt( input[i].split( " " )[0] );

    // Parse the second number from the current line, separated by a space.
    var B = parseInt( input[i].split( " " )[1] );

    // If A is less than B, add B to the output.
    if ( A < B ) {

      output += B; // Accumulate B to the total output.

    }

  }

  // Print the final calculated output.
  myout( output );

}


// Execute the Main function with the input obtained from myin().
Main( myin() );