/*
 * This JavaScript file processes input from stdin,
 * treating it as a sequence of numbers and operators
 * to perform calculations on a stack-like container.
 *
 * Author: Clone Generator
 * Date: 2023-10-27
 */

// Read input from standard input, process it, and convert parts to numbers.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' )
    . trim ( ) // Remove leading/trailing whitespace
    . split ( ' ' ) // Split by space into an array of strings
    . map ( function ( value ) {
        // Attempt to parse each value as an integer.
        // If it's a valid number, return the number; otherwise, return the original string.
        if ( ! isNaN ( parseInt ( value ) ) )
        {
            return parseInt ( value ) ;
        }
        else
        {
            return value ;
        }
    } ) ;


// Function to push a value onto the container (stack).
function push ( value , container ) {
    container . push ( value ) ; // Add the value to the end of the array.
    return container ;           // Return the modified container.
}


// Function to perform addition.
function add ( container ) {
    var a = container . pop ( ) ; // Pop the first operand.
    var b = container . pop ( ) ; // Pop the second operand.

    container . push ( a + b ) ; // Push the result of addition back.
    return container ;           // Return the container.
}


// Function to perform subtraction.
function sub ( container ) {
    var b = container . pop ( ) ; // Pop the subtrahend (second operand).
    var a = container . pop ( ) ; // Pop the minuend (first operand).

    container . push ( a - b ) ; // Push the result of subtraction back.
    return container ;           // Return the container.
}


// Function to perform multiplication.
function mul ( container ) {
    var a = container . pop ( ) ; // Pop the first factor.
    var b = container . pop ( ) ; // Pop the second factor.

    container . push ( a * b ) ; // Push the result of multiplication back.
    return container ;           // Return the container.
}


// Main calculation function, dispatches based on the operation symbol.
function calc ( operation , container )
{
    switch ( operation )
    {
        case '+' :
            container = add ( container ) ; // Perform addition.
            break ;

        case '-' :
            container = sub ( container ) ; // Perform subtraction.
            break ;

        case '*' :
            container = mul ( container ) ; // Perform multiplication.
    }

    return container ; // Return the updated container.
}


// Initialize an empty array to serve as our stack/container.
var container = [ ] ;


// Iterate over each item in the processed input.
input . forEach ( function ( value ) {
    // Check if the current value is a number.
    if ( typeof value === 'number' )
    {
        push ( value , container ) ; // If it's a number, push it onto the container.
    }
    else
    {
        calc ( value , container ) ; // If it's not a number (an operator), perform the calculation.
    }
} ) ;


// After processing all input, the final result should be the only element left in the container.
console . log ( container [ 0 ] ) ; // Print the final result.