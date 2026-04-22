/*
 * This JavaScript file contains an implementation of a binary search
 * algorithm and a main execution block that reads input,
 * performs multiple searches, and outputs a count.
 *
 * The original code included Japanese comments, which are
 * rephrased and expanded upon here for clarity in English.
 */

// This function performs a standard binary search on a sorted array.
// It checks for the existence of 'key' within the array 'a' of length 'n'.
var binarySearch = function ( key , n , a )
{

    // Initialize the search boundaries for the array.
    // 'left' points to the start of the current search segment.
    // 'right' points to one past the end of the current search segment.
    var left  =  0 ;
    var right =  n ;


    // Continue searching as long as the left pointer is before the right pointer.
    while  ( left < right )
    {
        // Calculate the middle index. Using Math.floor ensures an integer index.
        var mid = Math . floor ( ( left + right ) / 2 ) ;

        if ( a [ mid ] == key )
        {
            // If the element at the middle index matches the key, we found it.
            return true ;
        }
        else if ( key < a [ mid ] )
        {
            // If the key is less than the middle element,
            // the key must be in the left half.
            right = mid ;
        }
        else
        {
            // If the key is greater than the middle element,
            // the key must be in the right half.
            left = mid + 1 ;
        }
    }

    // If the loop completes without returning true, the key was not found.
    return false ;
} ;


// This is an immediately invoked function expression (IIFE)
// that handles reading from standard input and executing the main logic.
( function ( stdin )
{
    // First, trim any leading/trailing whitespace from the input string,
    // then split it into an array of strings based on newline characters.
    var arr = ( stdin . trim ( ) ) . split ( '\n' ) ;


    // Parse the input arrays from the 'arr' lines.
    // 's' is the array to be searched (from the second line of input).
    // It's split by spaces and each part converted to a Number.
    var s = arr [ 1 ] . split ( " " ) . map ( Number ) ;

    // 't' contains the elements to search for (from the fourth line of input).
    // Similarly, it's split by spaces and parts converted to Number.
    var t = arr [ 3 ] . split ( " " ) . map ( Number ) ;


    // Initialize a counter for the number of elements found.
    var ans = 0 ;

    // Iterate through each element in the 't' array.
    for ( var i = 0 ; i < t . length ; i ++ )
    {
        // Call binarySearch for the current element of 't' in array 's'.
        // The result (true or false) is implicitly converted to 1 or 0
        // when added to 'ans'.
        ans += binarySearch ( t [ i ] , s . length , s ) ;
    }

    // Finally, print the total count of found elements to the console.
    console . log ( ans ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;