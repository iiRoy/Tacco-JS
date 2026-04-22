/*
 * This JavaScript code processes a list of numbers from standard input
 * to find and print the most frequent numbers (modes) in ascending order.
 * It's designed to read a single line of space-separated numbers.
 */

x = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( /\s/ ) . sort ( function ( a , b ) { return a - b ; } ) ;


/*
 * The following line was used for debugging purposes
 * to inspect the content of the 'x' array after initial processing.
 * console . log ( x ) ;
 */


// Initialize variables for mode calculation.
// 'mode' will store the frequency count for each unique number.
// 'cnt' is unused in the final version of the loop.
// 'i' is the loop counter for iterating through the sorted array 'x'.
for ( mode = [ ] , cnt = 0 , i = 0 ; i < x . length ; i ++ )
{
    // Initialize a temporary counter for the current element's frequency.
    temp_cnt = 1 ;


    // Inner loop to compare the current element (x[i]) with subsequent elements (x[j]).
    for ( j = i + 1 ; j < x . length ; j ++ )
    {
        // If a match is found, increment the temporary counter.
        if ( x [ i ] == x [ j ] )
        {
            temp_cnt ++ ;
        }
    }

    // After checking all subsequent elements, push the final count for x[i] into the 'mode' array.
    mode . push ( temp_cnt ) ;
}


// Determine the maximum frequency found among all numbers.
max = Math . max . apply ( null , mode ) ;

// Initialize 'k' which is used to adjust the index when printing mode elements.
k = 1 ;


/*
 * Loop continues as long as the current maximum frequency
 * is equal to the overall maximum frequency found.
 * This ensures all numbers with the highest frequency are processed.
 */
while ( max == Math . max . apply ( null , mode ) )
{
    // Print the number corresponding to the current highest frequency.
    // 'mode.indexOf' finds the index of the first occurrence of the max frequency.
    // 'k++' is used to correctly index into the original 'x' array,
    // considering that 'mode' array's indices might not directly map to 'x' after splicing.
    console . log ( x [ mode . indexOf ( Math . max . apply ( null , mode ) ) + k ++ ] ) ;

    /*
     * This was another debugging line to check the index of the maximum frequency in the 'mode' array.
     * console . log ( mode . indexOf ( Math . max . apply ( null , mode ) ) ) ;
     */

    // Remove the current maximum frequency from the 'mode' array to find the next highest (if any)
    // or to continue processing other instances of the same max frequency.
    mode . splice ( mode . indexOf ( Math . max . apply ( null , mode ) ) , 1 ) ;

    // console . log ( mode ) ; // This line was also used for debugging the 'mode' array's state.
}