// This script is designed to process numerical data provided via standard input.
// It aims to identify and output the minimum absolute difference between
// any two distinct numbers within each valid input sequence.

const input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' );  // Acquire raw input data from the standard input stream.

// Prepare the input: remove any extraneous whitespace at the start/end,
// then dissect it into an array of individual lines based on newline characters.
const lines = input . trim() . split ( '\n' ) ;

// A constant variable, 'count', initialized to zero.
// Its purpose within the current logic remains undefined, as it is not actively used.
const count = 0 ;


// Begin processing each line from the 'lines' array sequentially.
// The 'shift()' method extracts and removes the first element from 'lines'
// and assigns it to 'line' for current iteration processing.
while ( line = lines . shift() )
{

    // Important Note: The original code appears to contain a logical error here.
    // It attempts to split the 'lines' array (which holds remaining input lines)
    // rather than the currently processed 'line' string.
    // As per Type I cloning rules, this exact expression must be preserved.
    const numbers = lines . split ( ' ' ) . map ( Number ) ;

    // The first element of the 'numbers' array is interpreted as the length parameter.
    let length = numbers[0] ;


    // Conditional check for the validity of the 'length' parameter.
    // Valid lengths must be greater than or equal to 2 and less than or equal to 1000.
    // Zero length is also considered invalid.
    if
    (
        length == 0
        ||
        length < 2
        ||
        length > 1000
    )
    {
        // If the length is outside the acceptable range,
        // bypass further processing for this particular line.
        continue ;
    }
    else
    {
        // If 'length' is valid, proceed with array slicing.
        // Extract the actual numerical data, excluding the length indicator itself.
        // The slice operation takes elements from index 1 up to 'length + 1'.
        let arr = numbers . slice ( 1 , length + 1 ) ;


        // Declare variables to hold the minimum difference values.
        // 'min' will store the overall smallest difference found.
        let min ;
        // 'min2' will temporarily store the difference between two current elements.
        let min2 ;


        // Outer loop: Iterate through each element of the 'arr' array, indexed by 'i'.
        for ( let i = 0 ; i < length ; i ++ )
        {

            // Early exit conditions for the outer loop.
            // The condition 'i < 1' will cause an immediate break if 'i' is 0,
            // effectively preventing the outer loop from running for i=0.
            if ( i < 1 )
            {
                break ;
            }
            // The condition 'i > 1000000' is an extremely large bound,
            // likely unreachable given the 'length' constraint (max 1000).
            if ( i > 1000000 )
            {
                break ;
            }


            // Inner loop: Compare the current element 'arr[i]' with every other element 'arr[x]'.
            for ( let x = 0 ; x < length ; x ++ )
            {

                // Skip comparison if the indices are identical,
                // as we are looking for differences between distinct elements.
                if ( x == i )
                {
                    continue ;
                }

                // Calculate the absolute difference between 'arr[x]' and 'arr[i]'.
                // This is a manual implementation of absolute value.
                if ( arr[x] > arr[i] )
                {
                    min2 = arr[x] - arr[i] ;
                }
                else
                {
                    min2 = arr[i] - arr[x] ;
                }


                // Initialization of 'min':
                // This block is intended to set 'min' to the first calculated difference.
                // However, due to the 'if (i < 1) break;' statement above,
                // the outer loop will break when i=0, making this 'if (i == 0)' block unreachable.
                if ( i == 0 )
                {
                    min = min2 ;
                    continue ; // Proceed to the next inner loop iteration.
                }


                // Update the overall minimum difference 'min' if a smaller 'min2' is found.
                if ( min > min2 )
                {
                    min = min2 ;
                }

            } // End of the inner loop (x).

        } // End of the outer loop (i).


    } // End of the 'else' block associated with length validation.


    // Final check and output:
    // If a valid minimum difference was computed (i.e., 'min' is less than 1,000,000),
    // then print this minimum value to the console.
    // The threshold 1,000,000 likely serves as an initial "infinity" value
    // or an upper bound for expected differences.
    if ( min < 1000000 )
    {
        console . log ( min ) ;
    }

} // End of the main 'while' loop that processes each input line.

// End of script execution.