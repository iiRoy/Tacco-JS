/*
 * This script is designed to process numerical data from standard input.
 * It identifies and counts common elements between two sets of numbers.
 * The input format is expected to be specific:
 * - First line: an integer 'n'
 * - Second line: 'n' space-separated integers for the first set (S)
 * - Third line: an integer 'q'
 * - Fourth line: 'q' space-separated integers for the second set (T)
 * The output will be a single integer representing the count of elements
 * from set T that are also present in set S.
 */
( function ( input ) {
  // Split the entire input string into an array of lines.
  var p = input . split ( '\n' ) ;

  // Extract the first line, convert it to a number, and store it as 'n'.
  // 'n' represents the expected size of the first array 'S'.
  var n = Number ( p . shift ( ) ) ;

  // Extract the next line, split it by spaces, ensure 'n' elements,
  // and map each string element to a Number, forming the array 'S'.
  var S = p . shift ( ) . split ( ' ', n ) . map ( Number ) ;

  // Extract the subsequent line, convert it to a number, and store it as 'q'.
  // 'q' represents the expected size of the second array 'T'.
  var q = Number ( p . shift ( ) ) ;

  // Extract the final data line, split it by spaces, ensure 'q' elements,
  // and map each string element to a Number, forming the array 'T'.
  var T = p . shift ( ) . split ( ' ', q ) . map ( Number ) ;


  // Initialize a counter to keep track of the number of matches found.
  var count = 0 ;

  // Iterate over each element in the array 'T'.
  // The 'forEach' method executes a provided function once for each array element.
  T . forEach ( function ( e ) {
    // For each element 'e' from array 'T', check if it exists in array 'S'.
    // The 'indexOf' method returns the first index at which a given element
    // can be found in the array, or -1 if it is not present.
    if ( S . indexOf ( e ) !== -1 ) {
      // If the element 'e' is found in 'S', increment the 'count' variable.
      count ++ ;
    }
  } ) ;

  // Print the final accumulated count to the console (standard output).
  console . log ( count ) ;

} ) (
  // This immediately invoked function expression (IIFE) is called
  // with the content of the standard input file.
  // 'require('fs')' imports the Node.js file system module.
  // 'readFileSync' reads the file synchronously.
  // '/dev/stdin' is the standard input file path on Unix-like systems.
  // 'utf8' specifies the character encoding.
  require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' )
) ;