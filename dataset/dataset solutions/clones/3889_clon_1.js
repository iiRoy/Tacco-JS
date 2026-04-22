/*
 * This JavaScript program processes numerical input to determine
 * if a specific set of conditions is met.
 * It expects a single line of space-separated numbers.
 */
function   main
(
    input
)
{
    // Begin by cleaning the input string: remove any leading or trailing whitespace.
    input   =   input   .   trim ( ) ;

    /*
     * The cleaned input string is then parsed.
     * First, it's split into individual string parts wherever a space occurs.
     * Second, each of these string parts is converted into a numerical value.
     * The resulting array of numbers is stored in the constant variable 'a'.
     */
    const    a    =    input    .    split ( " " )    .    map ( Number ) ;


    // Calculate the sum of the first two elements of the array 'a'.
    // This sum represents a combined value from the input.
    const    gou    =    a [ 0 ]    +    a [ 1 ]    ;

    // Evaluate a compound conditional statement.
    // This checks if the third element is within a certain range defined by the first two.
    if
    (
            a [ 2 ]    >=    a [ 0 ]
        &&  // Logical AND operator connects the two sub-conditions
            a [ 0 ]    +    a [ 1 ]    >=    a [ 2 ]
    )
    {
        // If both parts of the condition are true, print "YES".
        // Note: There appears to be a typo in 'console' here, preserved as per cloning rules.
        cosole . log ( "YES" ) ;
    }
    else
    {
        // If the condition is false (either one or both parts are false), print "NO".
        console . log ( "NO" ) ;
    }

} /* End of the main function definition. */


// The program is executed by calling the 'main' function.
// Input is read from standard input (/dev/stdin) using Node.js's 'fs' module.
// The entire file content is read synchronously and decoded as a UTF-8 string.
main
(
    require
    (
        'fs'
    )
    .
    readFileSync
    (
        '/dev/stdin',
        'utf8'
    )
)
; // Final statement: function call with input.