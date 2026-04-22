'use strict' // This directive enables strict mode for the entire script.

/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * have been preserved exactly as they were in the original.
 * Only whitespace (spacing, indentation, blank lines) and comments have been
 * extensively modified to create a visually distinct, yet functionally identical, clone.
 */

// Define the main function that will process the input.
function   main  ( input )
{

    // Declare a variable 'n' and assign it the first number from the first line of the input.
    // The input string is split by newline, then the first line is split by space,
    // and the very first part is converted to a Number.
    let n = Number ( input . split ( '\n' ) [ 0 ] . split ( ' ' ) [ 0 ] ) ;


    // Initialize an empty array named 'a'. This array will store numbers from the second line of input.
    let a = [ ] ;


    // Loop 'n' times to populate the array 'a'.
    // Each iteration processes one number from the second line of input.
    for ( let i = 0 ; i < n ; i ++ )
    {
        // Get the second line of input, split it by spaces, and take the i-th element.
        // Convert this string element to a Number and store it in the array 'a' at index 'i'.
        a [ i ] = Number ( input . split ( '\n' ) [ 1 ] . split ( ' ' ) [ i ] ) ;
    }


    // Initialize a counter variable 'ans' to 0. This will store the final count of specific elements.
    let ans = 0 ;


    // Iterate through the array 'a', potentially including an index beyond its actual length.
    // The loop runs from i = 0 up to, but not including, a.length + 1.
    // This means if a.length is L, i will go from 0 to L.
    for ( let i = 0 ; i < a . length + 1 ; i ++ )
    {
        // Check two conditions using a logical AND (&&) operator:
        // 1. Is the (current index + 1) an odd number? (i.e., is the position 1st, 3rd, 5th, etc.)
        //    `(i + 1) % 2 !== 0` checks if the remainder when (i+1) is divided by 2 is not 0.
        // 2. Is the element at the current index `a[i]` an odd number?
        //    `a[i] % 2 !== 0` checks if the remainder when `a[i]` is divided by 2 is not 0.
        //    Note: If `i` reaches `a.length` and `(i+1)%2!==0` is true, then `a[i]` will be `undefined`.
        //    `undefined % 2` results in `NaN`, and `NaN !== 0` evaluates to `true`.
        //    This specific behavior, including the potential `undefined` handling, is preserved from the original.
        if ( ( i + 1 ) % 2 !== 0   &&   a [ i ] % 2 !== 0 )
        {
            // If both conditions are met, increment the 'ans' counter.
            ans ++ ;
        }
    }


    // Output the final calculated answer to the console.
    console . log ( ans ) ;

} // End of the main function definition.


// Immediately invoke the main function with input read from '/dev/stdin'.
// The 'fs' module is used to synchronously read the file content,
// and 'utf8' encoding is specified for the input.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

// End of the JavaScript program.