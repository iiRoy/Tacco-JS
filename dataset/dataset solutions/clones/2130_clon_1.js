function   Main ( input ) {
  /*
   * This function processes the input string.
   * It takes a string 'input' which typically contains two space-separated numbers.
   */

  const   split   =   input . split ( ' ' ) ; // Separate the input string by the space character.

  const   value   =   + split [ 0 ] ; // Convert the first part of the split string to a numeric value.

  const   digit   =   + split [ 1 ] ;   // Convert the second part of the split string to a numeric digit (base).

  let     result    =   '' ; /* Initialize an empty string to build the result. */


  while ( value > 0 ) { // Begin a loop that continues as long as 'value' is greater than zero.

        // Calculate the remainder when 'value' is divided by 'digit'.
        // This remainder is then appended to the 'result' string.
        result += value % digit ;

        // Update 'value' by dividing it by 'digit' and taking the floor (integer part).
        // This prepares 'value' for the next iteration of the loop.
        value = Math . floor ( value / digit ) ;

  } // End of the 'while' loop.


  console . log ( result . length ) ; // Print the total length of the 'result' string to the console.

} // End of the Main function definition.


/*
 * The following line handles reading input from standard input and calling the Main function.
 * It should typically not be modified for competitive programming environments.
 * It reads the entire content of /dev/stdin as a UTF-8 string.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Execute the Main function with the standard input.