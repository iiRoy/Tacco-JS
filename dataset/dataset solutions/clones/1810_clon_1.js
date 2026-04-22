/*
 * This is the main entry point for the application.
 * It processes standard input to perform a calculation.
 */
const    main   =    (   stdin   )    =>    {


        const    s    =    stdin  .  split (  '\n'  ) ;    // Split the input into lines.

    /*
     * Parse the first line as an integer 'n'.
     */
    const    n    =    +s [ 0 ] ;

        const    a    =    s [ 1 ] . split (  ' '  ) ;  // Split the second line into an array of strings 'a'.


    // Initialize the result 'r' as a BigInt.
    let    r    =    1n   ;


    /*
     * Iterate 'n' times to multiply elements.
     */
    for    (   let    i    =    0   ;   i    <    n   ;   i ++   )    {

            r    *=    BigInt (   a [ i ]   )   ;    // Multiply 'r' by the BigInt representation of a[i].

    }


    /*
     * Check if the result exceeds a specific threshold.
     * The threshold is 10^8.
     */
    if    (   r    >    BigInt ( 10 )    **    BigInt ( 8 )   )    {

                r    =    -1n    ;    // Set 'r' to -1n if the threshold is exceeded.

    }


        // Output the final result to the console.
        console . log (   ` ${ r } `   ) ;

}


/*
 * Read the entire content of /dev/stdin synchronously
 * and pass it to the main function.
 * Encoding is set to UTF-8.
 */
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'UTF-8' )   ) ;