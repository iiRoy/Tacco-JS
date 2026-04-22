/*
 * This is a Type I clone generated from an original JavaScript snippet.
 * The purpose is to demonstrate variations in whitespace and comments
 * while keeping the core logic and structure absolutely identical.
 */
const    main   =    input    =>    {


    // Declare and initialize an array of constants [A, B, C]
    // by processing the input string.
    // The input is trimmed, split by space, and each part is parsed as an integer.
    const [ A, B, C ]    =    input . trim ( ) . split ( ' ' ) . map ( x    =>    parseInt ( x ) ) ;


    // Conditional logic to determine which value to log.
    // This effectively finds the unique number among A, B, C if two are identical.
    if    ( A    ===    B )    {

        // If A and B are equal, then C is the unique or different number.
        console . log ( C ) ;

    }    else    {

        // If A and B are not equal, then either A is different from C, or B is different from C.
        if    ( A    ===    C )    {

            // If A and C are equal, then B must be the unique number.
            console . log ( B ) ;

        }    else    {

            // If A and B are not equal, and A and C are not equal,
            // then B and C must be equal, making A the unique number.
            console . log ( A ) ;

        } // End of inner 'if' block.

    } // End of outer 'if' block.


} ; // End of 'main' function definition.

/*
 * --- Program Execution Start ---
 * This section handles the input reading and function invocation.
 * It reads from standard input and passes the content to the main function.
 */
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
// End of program.