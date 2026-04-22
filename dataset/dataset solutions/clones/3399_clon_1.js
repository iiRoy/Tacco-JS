/*
 * This is the main function responsible for processing the input.
 * It orchestrates a series of operations to compute a specific result.
 */
function Main ( input )
{
    // First, split the entire input string into an array of lines.
    input = input . split ( "\n" ) ;


    // Extract the first number from the input, which represents N.
    var N = parseInt ( input [ 0 ] ) ;


    // Initialize an array 'A' which will hold N integer values.
    A = new Array ( N ) ;


    // The second line of input contains space-separated numbers; split them into a temporary array.
    tmp = input [ 1 ] . split ( " " ) ;


    // Populate array A by converting the string elements from 'tmp' into integers.
    for ( i = 0 ; i < N ; i ++ )
    {
        A [ i ] = parseInt ( tmp [ i ] ) ;
    }

    // Declare and initialize several control variables.
    var ans = 1 ; // This 'ans' declaration is immediately overwritten below.
    var flag = 0 ; // A flag variable used for conditional branching.
    var ans = 0 ; // The actual initial value for 'ans' that will be used.
    var c = 0 ; // A variable to track maximum values or counts.


    // Initialize array B. Its initial size is determined by A[0], and all elements are set to 1.
    B = new Array ( A [ 0 ] ) . fill ( 1 ) ;


    // Begin the main iterative process, starting from the second element of array A.
    for ( i = 1 ; i < N ; i ++ )
    {
        // Inner loop to analyze array B and update 'c' and 'flag'.
        for ( j = 0 ; j < B . length ; j ++ )
        {
            // Update 'c' to be the maximum value found so far in B.
            c = Math . max ( c , B [ j ] ) ;

            // Check if any element in B is different from its first element.
            if ( B [ j ] != B [ 0 ] )
            {
                flag = 1 ; // If different, set the flag to 1.
                break ;    // Exit this inner loop as the condition is met.
            }
        }


        // Conditional logic based on the relationship between A[i] and A[i-1], and the 'flag'.
        if ( A [ i ] > A [ i - 1 ] )
        {
            // If the current element of A is greater than the previous one, extend B.
            // Add (A[i] - A[i-1]) number of '1's to the end of array B.
            for ( j = 0 ; j < A [ i ] - A [ i - 1 ] ; j ++ )
            {
                B . push ( 1 ) ;
            }

        }
        else if ( flag == 0 )
        {
            // If the flag is 0, increment a specific element in B and then truncate B.
            B [ A [ i ] - 1 ] = B [ A [ i ] - 1 ] + 1 ; // Increment the element at index (A[i]-1).
            B = B . slice ( 0 , A [ i ] ) ;             // Resize B to length A[i].
        }
        else if ( flag == 1 )
        {
            // If the flag is 1, first truncate B, then iterate backwards to find and update an element.
            B = B . slice ( 0 , A [ i ] ) ; // Resize B to length A[i].

            // Iterate from the end of the (newly sized) B array backwards.
            for ( j = A [ i ] - 1 ; j >= 0 ; j -- )
            {
                // Find the first element that is not equal to 'c'.
                if ( B [ j ] != c )
                {
                    B [ j ] = B [ j ] + 1 ; // Increment that element.
                    break ;                 // Exit this inner loop after updating.
                }
            }
        }
    }


    // After all iterations, find the maximum value within the final array B.
    for ( i = 0 ; i < B . length ; i ++ )
    {
        ans = Math . max ( ans , B [ i ] ) ; // Update 'ans' if a larger value is found.
    }


    // Output the final computed answer to the console.
    console . log ( '%s' , ans ) ;
}


// This 'debug' function is typically used in a web browser environment for testing.
// It retrieves input from an HTML element and passes it to the Main function.
function debug ( )
{
    var input = document . getElementById ( "input" ) . value ; // Get the value from the 'input' HTML element.
    Main ( input ) ; // Execute the main processing logic.
}

// This line handles input for a Node.js environment, common in competitive programming.
// It reads the entire content of '/dev/stdin' as a UTF-8 string and passes it to Main.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;