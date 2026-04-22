'use strict' /* This directive enables strict mode for the entire script. */

// Define the main processing function for the input data.
const    main    =    ( INPUT )    =>    {

    /*
     * Parse the first line of input to extract N and K.
     * The input is expected to be a single line containing two space-separated numbers.
     */
    const    N    =    Number ( INPUT . split ( '\n' ) [ 0 ] . split ( ' ' ) [ 0 ] ) ; // Extract the first number as N.
    const    K    =    Number ( INPUT . split ( '\n' ) [ 0 ] . split ( ' ' ) [ 1 ] ) ; // Extract the second number as K.

    let    cnt    =    0 ; // Initialize a counter variable.

    // Loop through numbers from 1 to N, incrementing by 2.
    // This effectively counts the odd numbers up to N.
    for    ( let    i    =    1 ;    i    <=    N ;    i    +=    2 )    {
        cnt ++ ; // Increment the counter for each odd number.
    }

    // Check if the count of odd numbers (cnt) is greater than K.
    if    ( cnt    >    K )    {
        console . log ( 'YES' ) ; // If true, print 'YES'.
    }
    else    {
        console . log ( 'NO' ) ; // Otherwise, print 'NO'.
    }

} ; // End of the main function definition.

// Read input from standard input and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // Execute the main function with the read content.