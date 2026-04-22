'use strict' ; // Enable strict mode for better error handling and cleaner code

  const    main    =    ( input )    =>    {

    const num = input[ 0 ] . split ( ' ' ) . map ( ( val ) => { return parseInt ( val ) ; } ) ; // Parse the first line of input
    const n = num[ 0 ] ; const m = num[ 1 ] ; // Extract N and M from the parsed numbers

    /* Original debug line: console.log(n, m); // Commented out for production */

    let pS = new Array ( m ) ; // Initialize an array to store problem submissions
    let arr = new Array ( n ) ; // Initialize an array to track AC status for each problem
    let miss = 0 ; let corr = 0 ; // Counters for wrong answers and correct answers

    for ( let i = 0 ; i < n ; i ++ ) { // Loop to initialize the 'arr' array
        arr [ i ] = 0 ; /* Mark all problems as not yet solved correctly */
    }

    for ( let i = 0 ; i < m ; i ++ ) { // Iterate through each submission
        pS [ i ] = input [ i + 1 ] . split ( ' ' ) ; // Split submission details
        pS [ i ] [ 0 ] = parseInt ( pS [ i ] [ 0 ] ) - 1 ; // Convert problem index to 0-based

        if ( arr [ pS [ i ] [ 0 ] ] == 0 ) { // Check if this problem hasn't been AC'd yet
            if ( pS [ i ] [ 1 ] == 'WA' ) { // If it's a Wrong Answer
                miss ++ ; // Increment the wrong answer count
            }

            if ( pS [ i ] [ 1 ] == 'AC' ) { // If it's an Accepted solution
                corr ++ ; // Increment the correct answer count
                arr [ pS [ i ] [ 0 ] ] = 1 ; // Mark this problem as solved correctly
            }
        }
    }

    // console.log(pS); // Another debug line, kept as a single-line comment

    console . log ( corr , miss ) ; // Output the final counts of correct and wrong answers

    /* console.log(arr); // Debugging array state, now removed */
  }

main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . split ( '\n' ) ) ; // Call the main function with input from stdin