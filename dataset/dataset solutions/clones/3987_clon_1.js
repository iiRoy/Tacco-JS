function myin ( ) {
  // This function reads input from standard input.
  // It uses Node.js 'fs' module to read the file.
  return require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ;
}


/*
 * Function to output to standard output.
 * It simply logs the given argument to the console.
 */
function myout ( t ) {
  console . log ( t ) ;
}


/**
 * Function to output to standard error.
 * Useful for debugging or error messages.
 */
function myerr ( t ) {
  console . error ( t ) ;
}



// Conversion parameter 'no' definitions:
// 0: No operation, return as is.
// 1: Convert to integer.
// 2: Split by half-width space.
// 3: Split by newline character.
// 4: Split by half-width space and convert each part to a number.
// 5: Split by newline and convert each part to a number.
// 6: Split into individual characters.
// 7: Split into individual characters and convert each to a number.
function myconv ( i , no ) {
  switch ( no ) {

    case 0 : // Case 0: Return input 'i' without any modification.
      return i ;

    case 1 : // Case 1: Parse 'i' as an integer.
      return parseInt ( i ) ;

    case 2 : // Case 2: Split 'i' string by spaces.
      return i . split ( " " ) ;

    case 3 : // Case 3: Split 'i' string by newline characters.
      return i . split ( "\n" ) ;

    case 4 : // Case 4: Split by spaces, then map each part to a Number.
      return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;

    case 5 : // Case 5: Split by newlines, then map each part to a Number.
      return i . split ( "\n" ) . map ( ( a ) => Number ( a ) ) ;

    case 6 : // Case 6: Split 'i' into an array of individual characters.
      return i . split ( "" ) ;

    case 7 : // Case 7: Split 'i' into characters, then map each to a Number.
      return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;

  }
}


/*
 * The main program logic starts here.
 * It takes the raw input and processes it.
 */
function Main ( input ) {

  // Convert the input string into an array of numbers, split by spaces.
  input = myconv ( input , 4 ) ;

  // Assign the first element of the input array to variable A.
  var A = input [ 0 ] ;
  // Assign the second element of the input array to variable B.
  var B = input [ 1 ] ;

  // Initialize a counter for the output.
  var output = 0 ;

  // Loop through numbers from A to B (inclusive).
  for ( var i = A ; i <= B ; i ++ ) {

    // Convert the current number 'i' to a string, then split it into individual characters.
    var tmp = myconv ( i . toString ( ) , 6 ) ;

    // Check if the number is a palindrome of 5 digits.
    // This condition checks if the first digit equals the last (5th) digit,
    // and the second digit equals the second-to-last (4th) digit.
    if ( tmp [ 0 ] == tmp [ 4 ] && tmp [ 1 ] == tmp [ 3 ] ) {
      // If it's a palindrome, increment the output counter.
      output ++ ;
    }
  }

  // Output the final count of palindromic numbers.
  myout ( output ) ;
}


// Call the Main function with the input read from stdin.
Main ( myin ( ) ) ;