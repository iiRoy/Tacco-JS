/*
 * This JavaScript file processes input data.
 * It reads from standard input, performs some calculations, and outputs results.
 * The primary function is 'Main'.
 */

// Main function definition begins here.
function Main ( input )
{
	// The input string is split into an array of lines.
	// Each line of the input data becomes an element in the 'input' array.
	input = input . split ( "\n" ) ;

    // The second line of input (index 1) is stored in 'tmp'.
    tmp = input [ 1 ] ;

    // The first line of input (index 0) is split by spaces and stored in 'tmp1'.
    tmp1 = input [ 0 ] . split ( " " ) ;

    // The first element of 'tmp1' is parsed as an integer for 'n'.
    n = parseInt ( tmp1 [ 0 ] , 10 ) ;

    // The second element of 'tmp1' is parsed as an integer for 'k'.
    k = parseInt ( tmp1 [ 1 ] , 10 ) ;

    // Initialize a counter variable. This will accumulate results.
    count = 0 ;


    // Conditional logic based on 'n' and 'k' values.

    if ( n <= k )
    {
        // If 'n' is less than or equal to 'k', output "0".
        console . log ( "0" ) ;
    }
    // Else if 'k' is exactly zero.
    else if ( k == 0 )
    {
        // Split the 'tmp' string (second input line) by spaces into array 'm'.
        m = tmp . split ( " " ) ;

        // Loop through the 'm' array.
        // NOTE: There is a bug here, 'i' is incremented but 'j' is the loop variable.
        for ( j = 0 ; j < m . length ; i ++ )
        {
            // Accumulate parsed integers from 'm' into 'count'.
            // NOTE: This also uses 'i' which is likely unintended.
            count += parseInt ( m [ i ] , 10 ) ;
        }
        // Output the final accumulated count.
        console . log ( '%d' , count ) ;

    }
    // If 'n' > 'k' and 'k' is not zero.
    else
    {
        // Split the 'tmp' string by spaces into array 'm'.
        m = tmp . split ( " " ) ;

        // Sort the array 'm' in descending order.
        m . sort ( function ( a , b )
        {
            // Custom comparison function for sorting.
            // Returns 1 if a < b (to place 'a' after 'b' for descending order), -1 otherwise.
            return ( a < b ? 1 : -1 ) ;
        } ) ;

        // Output the value of 'k'. This seems to be a debug or intermediate output.
        console . log ( '%d' , k ) ;

        // Loop starting from index 'k' up to 'n-1'.
        for ( i = k ; i < n ; i ++ )
        {
            // Accumulate parsed integers from 'm' into 'count'.
            count += parseInt ( m [ i ] , 10 ) ;
        }
        // Output the final accumulated count for this branch.
        console . log ( '%d' , count ) ;

    } // End of the main conditional block.


} // End of the Main function.


// This line is crucial for the execution environment.
// It reads all standard input at once and passes it to the Main function.
// DO NOT EDIT THE LINE BELOW THIS COMMENT.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;