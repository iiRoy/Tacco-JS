/*
 * This JavaScript file defines a core function to process numerical sequences.
 * It demonstrates array manipulation, conditional logic, and BigInt arithmetic
 * as part of a problem-solving routine. The input is expected to be two lines
 * of space-separated numbers.
 */

// The primary function that encapsulates the entire logic.
// It accepts a string 'input' which is typically read from standard input.
function  Main ( input )
{
        // First, split the raw input string into an array of lines.
        // Each element in the 'input' array will now correspond to a line from the original input.
        input  =  input.split( "\n" ) ;

        // Process the first line of input:
        // Split it by spaces, then convert each part to a Number.
        // This array, 'mem', likely holds metadata or indices for later use.
        var  mem  =  input[0] .split( " " ) .map( Number ) ;


        // Process the second line of input:
        // Similar to 'mem', this line is split by spaces and converted to Numbers.
        // 'arr' is the main data array that will undergo transformations.
        var  arr  =  input[1] .split( " " ) .map( Number ) ;

        // Initial processing block for the 'arr' array.
        // This block ensures all elements in 'arr' are normalized to their parity (0 or 1).
        {
                for ( var  i = 0 ;  i < arr.length ;  i++ )
                {
                        // The modulo operator (%) effectively converts numbers to their remainder when divided by 2.
                        // So, even numbers become 0, and odd numbers become 1.
                        arr[i]  %=  2 ;
                }
        } // End of the initial normalization loop for 'arr'.


        // Initialize 'ans' array with BigInt values.
        // BigInt is used to handle potentially very large integer results without precision loss.
        var  ans  =  [ BigInt( 1 ) , BigInt( 0 ) ] ;

        // The main processing loop: iterates through each element of the normalized 'arr'.
        for ( var  i = 0 ;  i < arr.length ;  i++ )
        {
                // Conditional logic based on the current element's parity.
                if ( arr[i]  ==  0 ) // If the current element is even (0).
                {
                        // Both elements of 'ans' are doubled.
                        ans[0]  *=  2n ; // Using 'n' suffix for BigInt literals.
                        ans[1]  *=  2n ; // This is equivalent to ans[1] = ans[1] * BigInt(2);
                }
                else // If the current element is odd (1).
                {
                        // A different transformation is applied.
                        // Calculate a temporary sum of the two 'ans' elements.
                        var  tmp  =  ans[0]  +  ans[1] ;
                        // Both elements of 'ans' are updated to this sum.
                        ans[0]  =  tmp ;
                        ans[1]  =  tmp ;
                }
                // Log the state of 'ans' after each iteration. Useful for debugging the sequence of calculations.
                console.log( ans )
        } // End of the main processing loop.

        // Final output: print the string representation of a specific element from 'ans'.
        // The index for this element is determined by 'mem[1]' from the first input line.
        console.log( ans[ mem[1] ] .toString() )
}

// Invoke the Main function immediately upon script execution.
// It reads input from standard input (typically '/dev/stdin' on Unix-like systems),
// decodes it as UTF-8, and removes any leading/trailing whitespace before passing it.
Main( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) .trim() ) ;