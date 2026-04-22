/*
 * This JavaScript program processes a series of stone arrangements.
 * It reads input from standard input, manipulates arrays based on specific rules,
 * and then outputs a count.
 *
 * Author: AI Code Clone Generator
 * Date: 2023-10-27
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 * The core logic, variable names, and expressions remain identical.
 */


// Import the 'fs' (file system) module to enable reading from standard input.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' ,  'utf8' ) ;


// Process the raw input string:
// 1.  Remove any leading or trailing whitespace characters using 'trim()'.
// 2.  Split the resulting string into an array of substrings based on the newline character ("\n").
// 3.  Map each substring in the array to its numerical equivalent using the 'Number' constructor.
var arr = input.trim().split( "\n" ) . map( Number ) ;


// Begin the main processing loop. This loop continues indefinitely
// until an explicit 'break' statement is encountered, indicating the end of input.
while ( true )
{

    // Extract the first element from the 'arr' array. This element represents
    // the value 'n' for the current test case. The 'shift()' method removes
    // and returns the first element, effectively consuming it.
    var n = arr.shift() ;


    // Check if the value of 'n' is zero. A zero 'n' typically signals
    // the termination condition for the input data set.
    if ( n == 0 )
    {
        // If 'n' is zero, break out of the infinite 'while(true)' loop.
        break ;
    }


    // Initialize an empty array named 'stone'. This array will store
    // the specific stone values for the current test case, as determined by 'n'.
    var stone = [ ] ;


    // Populate the 'stone' array. The 'n--' expression decrements 'n'
    // after each iteration, and the loop continues as long as 'n' is greater than zero.
    while ( n -- )
    {
        // Add the next available stone value from the 'arr' array to the 'stone' array.
        stone.push( arr.shift() ) ;
    }


    // Initialize another empty array named 'ary'. This array will be
    // dynamically built and modified based on the processing of the 'stone' values.
    var ary = [ ] ;


    // Iterate over each stone value ('v') and its corresponding index ('i')
    // in the 'stone' array using the 'forEach' method.
    stone.forEach( function( v , i )
    {
        // Determine if the current index (plus one, to make it 1-based) is odd.
        // This checks if (i+1) modulo 2 is equal to 1.
        if ( ( i + 1 ) % 2 == 1 )
        {
            // If the 1-based index is odd, simply append the current stone value 'v' to 'ary'.
            ary.push( v ) ;
        }
        else
        {
            // If the 1-based index is even, more complex logic is applied.

            // Check if the last element currently in 'ary' is identical to the current stone value 'v'.
            if ( ary[ ary.length - 1 ] == v )
            {
                // If the last element matches 'v', append 'v' to 'ary'.
                ary.push( v ) ;
            }
            else
            {
                // If the last element does NOT match 'v'.

                // First, append 'v' to 'ary' regardless.
                ary.push( v ) ;

                // Enter an inner 'while(true)' loop for a "back-filling" operation.
                while ( true )
                {
                    // Decrement the index 'i' to move backwards through the array.
                    i -- ;

                    // Continue the inner loop if 'i' is still positive AND
                    // the element at 'ary[i]' is not equal to 'v'.
                    if ( i > 0 && ary[ i ] != v )
                    {
                        continue ; // Skip to the next iteration of this inner loop.
                    }
                    else
                    {
                        // If 'i' is not positive (i.e., 0 or negative) OR 'ary[i]' is equal to 'v'.

                        // Ensure 'i' does not fall below zero; if it does, reset it to 0.
                        if ( i < 0 )
                        {
                            i = 0 ;
                        }

                        // This loop fills elements in 'ary' with 'v' starting from the adjusted 'i'
                        // up to (but not including) the last element.
                        while ( i != ary.length - 1 )
                        {
                            ary[ i ] = v ; // Assign 'v' to the element at the current index.
                            i ++ ;         // Increment 'i' to move to the next position.
                        }

                        // Once the back-filling is complete, break out of this inner 'while(true)' loop.
                        break ;
                    }
                }
            }
        }
    } ) ;


    // Initialize a counter variable 'cnt' to zero. This will be used to count
    // specific values in the final 'ary' array.
    var cnt = 0 ;


    // Iterate through each value ('v') in the 'ary' array.
    ary.forEach( function( v )
    {
        // Check if the current value 'v' is equal to zero.
        if ( v == 0 )
        {
            cnt ++ ; // If 'v' is zero, increment the counter.
        }
    } ) ;


    // Output the final count of zeros for the current test case to the console.
    console.log( cnt ) ;
}

// The program concludes after the main 'while(true)' loop terminates.