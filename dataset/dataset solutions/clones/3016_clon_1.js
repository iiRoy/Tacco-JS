// This JavaScript code processes input data for a specific calculation.

function    Main ( input )
{
    // The input string is split into an array of lines.
    var     inputArr = input . split ( "\n" ) ;

    // The first line contains the integer N.
    var     n = parseInt ( inputArr [ 0 ] ) ;

    // The second line contains space-separated numbers, stored in array 'a'.
    var     a = inputArr [ 1 ] . split ( " " ) ;


    // Initialize variables for calculations.
    var     sum   =   0 ; // Total sum of absolute values.
    var     count =   0 ; // Count of negative numbers.
    var     min   =   9999999999 ; // Smallest absolute value encountered.

    // An object 'obj' is declared but not used in this specific logic.
    var     obj   =   { } ;


    /*
     * This loop iterates through each element of the array 'a'.
     * It calculates the absolute value, counts negatives, and finds the minimum absolute value.
     */
    for ( var   i = 0 ;   i < n ;   i ++ )
    {
        // Get the absolute value of the current number.
        var     ai = Math . abs ( a [ i ] ) ;

        // Check if the original number is negative.
        if  ( a [ i ] < 0 )
        {
            count ++ ; // Increment negative count.
        }

        // Check if the current absolute value is the new minimum.
        if  ( ai < min )
        {
            min = ai ; // Update the minimum absolute value.
        }

        // Add the absolute value to the total sum.
        sum = sum + ai ;
    }

    // Output the count of negative numbers.
    console . log ( count ) ;

    /*
     * Based on the parity of the negative number count,
     * a final sum is calculated and displayed.
     */
    if  ( count % 2 === 0 )
    {
        // If count is even, print the sum of all absolute values.
        console . log ( sum ) ;
    }
    else
    {
        // If count is odd, print the sum minus the smallest absolute value.
        console . log ( sum - min ) ;
    }
}

// The main function is called with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;