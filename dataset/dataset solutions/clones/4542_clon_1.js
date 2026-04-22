'use strict'   ;  // Enforce strict mode for cleaner code

/*
 * This is the main function that processes the input.
 * It determines if all characters in the input string are unique.
 */
function   main ( input )   {

  input  =  input.split ( '' ) ;  // Split the input string into an array of characters.

  const   n   =   input.length ;  // Get the total number of characters in the input.

  /*
   * Filter the array to find unique characters.
   * A character is considered unique if its first occurrence is at its current index.
   */
  const   ss   =   input.filter ( ( v , i , self )   =>   {
    return   self.indexOf ( v )   ==   i ;  // Check if the first occurrence of 'v' is at index 'i'.
  } ) ;

  // Begin conditional check to see if the number of unique characters equals the total number of characters.
  if   (   ss.length   ==   n   )   {
    console.log ( 'yes' ) ;  // If true, all characters are unique.
  }   else   {  // If the lengths do not match, there are duplicate characters.
    console.log ( 'no' ) ;  // Output 'no' indicating duplicates.
  } // End of conditional block.

} // End of main function definition.

// Call the main function with input read from standard input.
// The 'fs' module is used to read the file synchronously.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;