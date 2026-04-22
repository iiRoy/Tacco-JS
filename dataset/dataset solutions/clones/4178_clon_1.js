/*
 * This JavaScript code defines a function 'Main' that processes input data
 * to perform a specific sequence of operations. It appears to be solving
 * a problem related to array manipulation and sorting based on min/max values.
 *
 * The core logic involves identifying whether the maximum or the absolute minimum
 * value in an array is dominant, and then applying a series of additions
 * to elements to achieve a specific ordering or state.
 * The operations themselves are recorded and then printed to standard output.
 */
function Main( input )
{
    // The input is initially a single string.
    // We split it by newline characters to get an array of lines.
    input  =  input.split( "\n" )  ;

    // Extract the first number from the first line of the input.
    // This number 'n' likely represents the size of an array or a count.
    var  n  =  parseInt(  input[0].split(" ")[0]  )  ;

    // The second line of input is split by spaces.
    // This temporary array 'tmp' will be used to populate the main array 'a'.
    tmp = input[1].split(" ") ;


    // Initialize array 'a' with 'n' elements, all set to the value 0.
    // This array will hold the primary data for manipulation.
    a  =  new Array( n ) . fill( 0 ) ;

    // Initialize an empty array 'b'.
    // This array will store the records of operations performed.
    b  =  new Array( )  ;


    // Initialize 'max' to a very small number.
    // This ensures that any actual number from the input will be greater than it.
    var max = -Math.pow( 10, 6 ) - 1 ;

    // Initialize 'min' to a very large number.
    // This ensures that any actual number from the input will be smaller than it.
    var min = Math.pow( 10, 6 ) + 1 ;


    // Loop through the elements to populate array 'a' and find the true min/max.
    for ( i = 0 ; i < n ; i++ )
    {
        // Convert the string representation of the number to an integer.
        a[i] = parseInt( tmp[i] ) ;

        // Update the maximum value found so far.
        max = Math.max( a[i], max ) ;

        // Update the minimum value found so far.
        min = Math.min( a[i], min ) ;
    }


    // Conditional block: Logic depends on whether 'max' or 'abs(min)' is greater.
    if ( max >= Math.abs( min ) )
    {
        // Case 1: 'max' is greater than or equal to the absolute value of 'min'.
        // Perform operations to potentially make elements non-decreasing.

        for ( i = 0 ; i < n ; i++ )
        {
            // If the current element is not at the index where 'max' is located,
            // an operation is performed.
            if ( a.indexOf( max ) != i )
            {
                // Create a sub-array 'bsub' to record the operation.
                // Indices are 1-based, hence the '+1'.
                bsub = [ a.indexOf( max ) + 1, i + 1 ] ;

                // Add this operation record to array 'b'.
                b.push( bsub ) ;

                // Modify the current element by adding the 'max' value.
                a[i] = a[i] + max ;
            }
        }

        // Second pass: Ensure the array is sorted in a non-decreasing order.
        for ( i = 0 ; i < n ; i++ )
        {
            // If not the first element and the current element is smaller than the previous one,
            // an operation is needed.
            if ( i > 0 && a[i] < a[i-1] )
            {
                // Record the operation: add a[i-1] to a[i].
                bsub = [ i, i + 1 ] ;
                b.push( bsub ) ;

                // Perform the addition.
                a[i] = a[i-1] + a[i] ;
            }
        }
    }
    // Else if 'abs(min)' is strictly greater than 'max'.
    else if ( Math.abs( min ) > max )
    {
        // Case 2: Absolute value of 'min' is greater than 'max'.
        // Perform operations to potentially make elements non-increasing.

        for ( i = 0 ; i < n ; i++ )
        {
            // If the current element is not at the index where 'min' is located,
            // an operation is performed.
            if ( a.indexOf( min ) != i )
            {
                // Record the operation with 1-based indices.
                bsub = [ a.indexOf( min ) + 1, i + 1 ] ;
                b.push( bsub ) ;

                // Modify the current element by adding the 'min' value.
                a[i] = a[i] + min ;
            }
        }

        // Second pass: Ensure the array is sorted in a non-increasing order.
        // Loop backwards from n-1 down to 0.
        for ( i = n - 1 ; i >= 0 ; i-- )
        {
            // If not the last element and the current element is greater than the next one,
            // an operation is needed.
            if ( i < n - 1 && a[i] > a[i+1] )
            {
                // Record the operation: add a[i+1] to a[i].
                // Indices might be adjusted differently here.
                bsub = [ i + 2, i + 1 ] ;
                b.push( bsub ) ;

                // Perform the addition.
                a[i] = a[i+1] + a[i] ;
            }
        }
    }


    // Initialize the answer string with the total number of operations recorded.
    var ans = b.length ;

    // Append each recorded operation to the answer string, formatted.
    for ( i = 0 ; i < b.length ; i++ )
    {
        ans += "\n" + b[i][0] + " " + b[i][1] ;
    }

    // Finally, print the entire answer string to the console.
    console.log( '%s', ans ) ;
}

// This line reads input from standard input (/dev/stdin)
// and passes it to the Main function for processing.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;