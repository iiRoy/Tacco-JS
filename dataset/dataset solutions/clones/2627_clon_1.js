/*
 * This is a Type I clone generated to demonstrate strict adherence
 * to the definition: only whitespace and comments are altered.
 * All core elements (identifiers, operators, expressions) are identical.
 */
    'use strict' // Enable strict mode for better error handling and cleaner code.


function   main  ( input )
{
    // The input string is first trimmed to remove leading/trailing whitespace,
    // then split into an array of strings based on newline characters.
    input = input.trim() .  split ( '\n' )


    // A constant variable 'ans' is declared. Its value depends on a condition.
    // The first element of the input array (input[0]) is parsed as an integer (base 10).
    // If this integer is greater than or equal to 3200, 'ans' takes the value of input[1].
    // Otherwise, 'ans' is assigned the string literal 'red'.
    const   ans   =   parseInt ( input [ 0 ] ,   10 )   >=   3200   ?   input [ 1 ]   :   'red'


    // The final computed answer is printed to the standard output.
    console . log ( ans )
}


// This section handles the execution flow.
// It reads the entire content of the standard input stream ('/dev/stdin')
// as a UTF-8 encoded string using Node.js's 'fs' module.
// This content is then passed as an argument to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) )