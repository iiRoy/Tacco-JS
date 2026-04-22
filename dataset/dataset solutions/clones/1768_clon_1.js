/*
   * This module defines a main function to process input.
   * It identifies the 1-based index of zero-valued elements.
   */

  function   main (   input   )   {
    // The input string is first cleaned by removing any leading or trailing whitespace.
    input   =   input .   trim   (   )   ;

    /*
     * The cleaned input string is then split into an array of strings
     * using a space character as the delimiter.
     */
    const   list   =   input .   split   (   " "   )   ;

    // Iterate over each element in the 'list' array.
    // 'v' represents the current value, and 'i' represents its zero-based index.
    list .   forEach   (   (   v   ,   i   )   =>   {

      // Convert the current string value 'v' to a number.
      // If this numeric value is strictly equal to 0, proceed.
      if   (   Number   (   v   )   ===   0   )   {
        // Output the 1-based index to the console.
        // This means adding 1 to the zero-based index 'i'.
        console .   log   (   i   +   1   )   ;
      }   // End of the conditional check for zero value
    }   )   ;   // End of the forEach loop that processes each list item
  }   // End of the main function definition


/*
 * This section is responsible for calling the main function.
 * It reads the entire content of standard input synchronously,
 * decodes it as UTF-8, and passes it to the main function.
 */
main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;
// The script's execution flow ends here after the main function completes.