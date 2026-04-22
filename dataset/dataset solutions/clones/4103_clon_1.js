/*
 * This is a Type I clone generated to demonstrate extensive
 * modifications to whitespace and comments only.
 * The core logic and structure remain absolutely identical.
 */
  function   main ( input )
  { // Start of the main function block.

    // The original comment has been completely replaced.
    // This line previously contained a commented-out test input.

    const   args    =    input . split ( "/n" ) ;   /*  Splits the raw input string by the literal sequence "/n".
                                                      *  Note: This is not a newline character, but a literal string. */

    console . log ( args ) ; // For diagnostic purposes, the parsed arguments array is logged.

    /*
     *  Declaration of two constant variables: 'N' and 'nums'.
     *  'N' is assigned the first element of the 'args' array.
     *  'nums' is assigned a sliced portion of 'args', excluding the first and last elements.
     */
    const   N   =   args [ 0 ] ,
          nums  =   args . slice ( 1 , args . length - 1 ) ;


    // This statement calculates the number of unique items within the 'nums' array.
    // It achieves this by converting 'nums' into a Set (which only stores unique values)
    // then converting the Set back into an Array, and finally getting its length.
    console . log ( Array . from ( new Set ( nums ) ) . length ) ;

  } // End of the main function definition.

// Invokes the 'main' function.
// The input is read synchronously from standard input ('/dev/stdin') as a UTF-8 string.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; /* Function call */