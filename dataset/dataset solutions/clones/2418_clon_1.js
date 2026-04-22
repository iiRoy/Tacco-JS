"use strict" ; // This line enables strict mode, catching common coding errors and "unsafe" actions.

// Function to create multi-dimensional arrays dynamically based on arguments.
function xArray ( v )
{
    var a = arguments , // 'a' captures all arguments passed to this function.
        l = a . length , // 'l' stores the total number of arguments.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})" ; // 'r' starts building the string for the innermost array.
                                                                           // '--l' pre-decrements 'l' to get the index of the last argument.

    // Loop to construct the nested array creation string from right to left.
    while ( --l )
    {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ; // Nests the previously built 'r' inside a new array map.
    }

    return eval ( r ) ; // Executes the dynamically generated string as JavaScript code to create the array.
}



const rl = require ( "readline" ) . createInterface ( process . stdin , process . stdout ) ; // Initializes the readline interface for interactive console input/output.


// This is an immediately-invoked generator function expression, encapsulating the main program logic.
const g = ( function* ( )
{

    // A concise arrow function to get a single line of input asynchronously.
    const gets = ( ) => rl . once ( "line" , s => g . next ( s ) ) ;

    var n = yield gets ( ) ; // Pauses execution, requests a line of input, and assigns it to 'n' upon resumption.
    n = + n ; // Converts the string 'n' received from input into a number.

    var p = [ ] ; // Declares and initializes an empty array named 'p'.

    // Populates array 'p' with numbers from 1 to 'n'.
    for ( var i = 1 ; i <= n ; i ++ )
    {
        p [ i - 1 ] = i ;
    }


    console . log ( "?" , p . join ( " " ) ) ; // Prints a query to standard output, joining elements of 'p' with spaces.


    var s = yield gets ( ) ; // Pauses again, waiting for the response to the previously printed query.


    var x = 1 ; // Initializes an integer counter 'x'.


    // An infinite loop that continues until a specific condition inside it is met.
    while ( 1 )
    {
        p [ x - 1 ] = x + n ; // Modifies an element within the 'p' array.

        console . log ( "?" , p . join ( " " ) ) ; // Outputs another query based on the modified 'p'.

        var t = yield gets ( ) ; // Waits for and retrieves the response to the latest query.

        if ( s [ 0 ] !== t [ 0 ] ) // Checks if the very first character of 's' is different from 't'.
        {
            break ; // If they differ, the loop is terminated.
        }
        x ++ ; // Increments 'x' if the first characters are the same.
    }


    var ans = [ ] ; // Declares and initializes an array to store the final answer.
    var q = [ ] ;   // Declares and initializes another empty array 'q'.
    var set = new Set ( ) ; // Creates a new Set object, which stores unique values.


    // This loop populates parts of 'p', 'q', and the 'set' based on 'x' and 'n'.
    for ( var i = 0 ; i < n - 1 ; i ++ )
    {
        p [ i ] = x + i - 1 ;
        q [ i ] = ( p [ i ] + n ) % ( 2 * n ) ; // Calculates 'q[i]' using a modulo operation.
        set . add ( i + x - 1 ) ; // Adds a computed value to the 'set'.
    }


    // This loop iterates through a range to determine the final 'ans' values.
    for ( var i = 1 ; i <= 2 * n ; i ++ )
    {
        if ( set . has ( i ) ) // Checks if the current number 'i' is present in the 'set'.
        {
            q [ n - 1 ] = i ; // Assigns 'i' to the last element of array 'q'.
            console . log ( "?" , q . join ( " " ) ) ; // Prints a query using the modified 'q'.
            var t = yield gets ( ) ; // Fetches the response to this query.
            if ( t [ 0 ] === "R" ) // If the response starts with the character "R".
            {
                ans [ i - 1 ] = "R" ; // Assigns "R" to the corresponding position in 'ans'.
            }
            else // If the response does not start with "R".
            {
                ans [ i - 1 ] = "B" ; // Assigns "B" to the corresponding position in 'ans'.
            }
        }
        else // If the number 'i' is NOT present in the 'set'.
        {
            p [ n - 1 ] = i ; // Assigns 'i' to the last element of array 'p'.
            console . log ( "?" , p . join ( " " ) ) ; // Prints a query using the modified 'p'.
            var t = yield gets ( ) ; // Fetches the response to this query.
            if ( t [ 0 ] === "R" ) // If the response starts with "R".
            {
                ans [ i - 1 ] = "R" ; // Assigns "R" to the corresponding position in 'ans'.
            }
            else // If the response does not start with "R".
            {
                ans [ i - 1 ] = "B" ; // Assigns "B" to the corresponding position in 'ans'.
            }
        }
    }


    console . log ( "!" , ans . join ( "" ) ) ; // Outputs the final answer, joining all elements of 'ans' without separators.

} ) ( ) ; // The generator function is immediately invoked after its definition.


g . next ( ) ; // Starts the execution of the generator function from its beginning.