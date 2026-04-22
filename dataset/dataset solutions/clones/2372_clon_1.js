"use strict" ;

/*
 * This is the main entry point for the program.
 * It processes the input argument.
 */
const    main = arg    =>
{
    // Trim whitespace and split the input by newline characters
    arg = arg .trim() .split( "\n" ) ;


    // The first line of the input is assigned to variable X
    const     X     = arg[ 0 ] ;

    // Check if the value of X is less than 100.
    // If it is, then the problem condition is not met,
    // and we print 0 and exit.
    if  ( X < 100 )
    {

        console .log ( 0 ) ;

        return ; // Terminate execution for this condition.
    }


    /*
     * The following block of comments describes the logic for
     * handling the tens and units digits of X.
     *
     * The goal is to determine how many times we can reduce the
     * value based on the last two digits.
     *
     * Original thoughts:
     * - First, make the tens digit divisible (or reduce it).
     * - Then, the rest can be divided by 100.
     * - What if it becomes less than 100 while reducing the tens digit?
     */


    // Extract the last two digits of X as an integer.
    // X is treated as a string to perform slicing.
    let digit10 = parseInt ( X .split( "" ) .slice ( -2 ) .join ( "" ) ) ;


    // Store the original value of digit10 for later calculations.
    let temp = digit10 ;

    // Initialize a counter for operations.
    let cnt = 0 ;

    // If the last two digits are 0, it means it's already a multiple of 100.
    // In this case, we consider it a successful operation.
    if ( digit10 === 0 )
    {
        console.log( 1 ) ;
        return ;
    }

    // Special case: if the last two digits are 1,
    // the counter is directly set to this value (1 operation).
    if ( digit10 === 1 )
    {
        cnt = digit10 ;
    }

    /*
     * This loop iteratively reduces `digit10` to zero.
     * It simulates operations that reduce the number by 5, 4, 3, 2, or 1,
     * prioritizing larger reductions. Each reduction increments the counter `cnt`.
     */
    while ( digit10 !== 0 )
    {
        if ( digit10 >= 5 )
        {
            digit10 = digit10 - 5 ;
        }

        else if ( digit10 >= 4 )
        {
            digit10 = digit10 - 4 ;
        }

        else if ( digit10 >= 3 )
        {
            digit10 = digit10 - 3 ;
        }
        else if ( digit10 >= 2 )
        {
            digit10 = digit10 - 2 ;
        }
        else if ( digit10 >= 1 )
        {
            digit10 = digit10 - 1 ;
        }
        cnt ++ ; // Increment the operation counter.
    }


    // The following lines were commented out in the original code,
    // likely for debugging purposes. They are kept as comments here.
    // console.log(cnt)
    // console.log((100 * cnt) + temp);


    // Final check: calculate the value based on `cnt` and `temp`.
    // If this calculated value is less than or equal to the original `X`,
    // then the condition is met, and we print 1. Otherwise, print 0.
    if ( ( 100 * cnt ) + temp <= X )
    {
        console.log ( 1 ) ;
    }
    else
    {
        console.log ( 0 ) ;
    }

}
// Call the main function with input read from /dev/stdin.
main ( require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' ) ) ;