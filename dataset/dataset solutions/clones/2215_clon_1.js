// This is the strict mode directive for the JavaScript file.
'use strict'

// Define the main function to process the provided input.
function   Main ( input )   {

  // First, trim any leading or trailing whitespace from the input string.
  // Then, split the cleaned string by spaces into an array of strings.
  input = input . trim ( ) . split ( ' ' ) ;

  // Parse the first element of the resulting array into an integer.
  // This value is assigned to the constant 'a'.
  const   a   =   parseInt ( input [ 0 ] ) ;
  // Parse the second element of the resulting array into an integer.
  // This value is assigned to the constant 'b'.
  const   b   =   parseInt ( input [ 1 ] ) ;

  // Initialize an empty string variable to store the final result.
  let   res   =   '' ;

  // Check the condition: if 'a' is strictly less than 'b'.
  if   ( a   <   b )   {
    // If 'a' is less than 'b', the program will append the string representation
    // of 'a' to the 'res' string exactly 'b' times.
    for   ( let   i   =   0 ;   i   <   b ;   ++ i )   {
      // Using a template literal to convert 'a' to a string and append it.
      res   +=   `${ a }` ;
    }
  }   else   {
    // Otherwise (if 'a' is greater than or equal to 'b'), the program will append
    // the string representation of 'b' to the 'res' string exactly 'a' times.
    for   ( let   i   =   0 ;   i   <   a ;   ++ i )   {
      // Using a template literal to convert 'b' to a string and append it.
      res   +=   `${ b }` ;
    }
  }

  // Finally, print the accumulated result string to the console.
  console . log ( res ) ;


}

// This line reads the input from standard input (/dev/stdin) using Node.js's 'fs' module.
// The input is read as a UTF-8 encoded string, and then passed to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;