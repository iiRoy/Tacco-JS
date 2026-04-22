/*
   * This is a main entry point function.
   * It processes standard input to determine a specific condition.
   */
  const   main    =    stdin    =>    {
    // The raw input string is first trimmed and then split by newlines.
    const   input =    stdin .  trim() .  split( '\n' ) ;

    /*
     * The first line of input is parsed as an integer.
     * This integer 'N' is the target value for our calculation.
     */
    const N    =    parseInt (   input[ 0 ]   ) ;


    // Outer loop iterates from i = 0 up to and including 25.
    for ( let i = 0 ; i <= 25 ; i ++ )
    {
      // Inner loop iterates from j = 0 up to and including 14.
      for ( let j = 0 ; j <= 14 ; j ++ )
      {
        // Check if the linear combination 4*i + 7*j equals the target N.
        if ( 4 * i + 7 * j === N )
        {
          // If a combination is found, print 'Yes' and terminate the function.
          console . log ( 'Yes' ) ;
          return ; // Exit the main function immediately.
        }
      } // End of inner loop for 'j'
    } // End of outer loop for 'i'

    // If no combination is found after checking all possibilities, print 'No'.
    console . log ( 'No' ) ;
  } ; // End of the main function definition.


  // --- Input Handling Section ---
  // This line reads all content from standard input synchronously.
  // It then decodes it as UTF-8 and passes it to the 'main' function.
  main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Call the main function.