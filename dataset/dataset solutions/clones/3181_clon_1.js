/*
 * This is a Type I clone example generated for demonstration purposes.
 * Extensive modifications to whitespace and comments have been applied
 * to achieve a visually distinct representation while preserving
 * absolute logical and structural equivalence to the original code.
 */
const    main    =     stdin     =>      {


    //  First, we process the raw input received from the standard input stream.
    //  The input string is trimmed of leading/trailing whitespace and then split
    //  into an array of lines based on the newline character.
    const    input     =     stdin.trim().split(    '\n'    )     ;


    //  Next, we extract the primary data points.
    //  The first line of the input array (input[0]) is expected to contain
    //  two space-separated integer values. These are parsed and assigned
    //  to constants 'A' and 'B' using array destructuring.
    const    [A,    B]     =     input[0].split(    ' '    ).map(    x     =>     parseInt(x)    )     ;



    //  Now, we apply the core business logic based on a conditional check.
    //  The condition evaluates whether the integer 'B' is perfectly divisible
    //  by the integer 'A' (i.e., the remainder of B divided by A is zero).
    if     (    B     %     A     ===     0    )     {

        //  If 'B' is perfectly divisible by 'A', the program's requirement
        //  is to output the sum of 'A' and 'B' to the console.
        console.log(    A     +     B    )     ;

    }     else     {

        //  Conversely, if 'B' is not perfectly divisible by 'A',
        //  the program must output the difference between 'B' and 'A'.
        console.log(    B     -     A    )     ;

    }


}     ;     //  End of the 'main' function definition.


//  ----------------------------------------------------------------------
//  Program Entry Point: Standard Input Handling
//  ----------------------------------------------------------------------

/*
 *  This section handles the invocation of the 'main' function.
 *  It reads the entire content of the standard input stream (/dev/stdin)
 *  as a UTF-8 encoded string using Node.js's built-in 'fs' module.
 *  The read content is then passed as the 'stdin' argument to the 'main' function,
 *  initiating the program's execution flow.
 */
main(    require("fs").readFileSync(    "/dev/stdin"    ,     "utf8"    )    )     ;