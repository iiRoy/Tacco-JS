/*
 * This file contains a utility function to check for uppercase
 * characters and a main function to process input.
 */

// Define a constant arrow function named 'isUpperCase'.
// It takes a single character 'c' as an argument.
const    isUpperCase     =    ( c )    =>    {
  // The function returns true if the character 'c' consists
  // solely of uppercase English letters (A-Z), otherwise false.
  // The regular expression /^[A-Z]+$/g ensures that the entire string
  // matches one or more uppercase letters.
  return    /^[A-Z]+$/g.test ( c )    ;
}     // End of isUpperCase function definition.


/**
 * The main entry point function for processing input.
 * @param {string} input - The raw input string, potentially multi-line.
 */
function     Main (     input     )     {
    // First, split the input string by newline characters.
    // This converts the single input string into an array of lines.
    input     =     input.split ( "\n" )     ;


    // Get the first line of the input array.
    // This line is assigned to a constant variable named 'hoge'.
    const     hoge     =     input [ 0 ]     ;


    // Now, check if the 'hoge' string (the first line of input)
    // consists entirely of uppercase characters using our helper function.
    if     (     isUpperCase ( hoge )     )     {
        // If 'hoge' is all uppercase, print 'A' to the console.
        console.log ( 'A' )     ;
    }     else     {
        // Otherwise (if it contains any lowercase or non-alphabetic chars),
        // print 'a' to the console.
        console.log ( 'a' )     ;
    }
} /* End of Main function */