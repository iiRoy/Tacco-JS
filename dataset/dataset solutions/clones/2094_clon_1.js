/*
 * This JavaScript file contains a function designed to process an input array.
 * It checks for specific patterns within the joined elements of the array.
 */
function   main (   input   )   {

  //   Begin   processing   the   input   array.

  // The core logic starts here. We join the array elements into a single string.
  // Then, we check if this resulting string matches either 'AAA' or 'BBB'.
  if   (   input   .   join   (   ''   )   ==   'AAA'   ||   input   .   join   (   ''   )   ==   'BBB'   )   {
    // If either condition is true (input is 'AAA' or 'BBB'),
    // we print 'No' to the standard output.
    console   .   log   (   'No'   )   ;

    // Immediately exit the function as the condition is met.
    return   ;

  } // End of the conditional block for 'AAA'/'BBB' check.

  // If the program execution reaches this point, it means
  // the input string was neither 'AAA' nor 'BBB'.
  // In this case, we print 'Yes'.
  console   .   log   (   'Yes'   )   ;

} // End of the main function definition.


// This section handles the execution of the main function.
// It reads data from standard input, typically from a file or piped content.
// The 'fs' module is used for file system operations, specifically 'readFileSync'.
// '/dev/stdin' is the conventional path for standard input on Unix-like systems.
// 'utf8' specifies the character encoding for reading the input.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;