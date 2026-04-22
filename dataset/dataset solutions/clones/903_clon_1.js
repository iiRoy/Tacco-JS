/*
 * This is a custom function designed to perform addition on
 * very large numbers that might exceed standard JavaScript
 * number precision. It treats numbers as strings and performs
 * digit-by-digit addition.
 */
function bigAdd ( x , y )
{
    // Convert x and y to strings, split into digits, reverse, and convert to numbers.
    // This prepares them for digit-by-digit addition starting from the least significant digit.
    var a = ( x + "" ) . split ( "" ) . reverse ( ) . map ( Number ) ;

    // Perform the same conversion for the second operand, y.
    var b = ( y + "" ) . split ( "" ) . reverse ( ) . map ( Number ) ;

    // Initialize an array 'c' to store the result digits.
    var c = [ ] ;

    // Determine the maximum length between the two number arrays to ensure all digits are processed.
    var max = Math . max ( a . length , b . length ) ;

    // Initialize the result array 'c' with zeros. We add 1 to 'max' to account for a potential carry-over
    // for the most significant digit.
    for ( var i = 0 ; i < max + 1 ; i ++ ) {
        c [ i ] = 0 ;
    } // End of initialization loop

    // --- Main addition loop ---
    // Iterate through each digit position up to the maximum length of the input numbers.
    for ( var i = 0 ; i < max ; i ++ )
    {
        // Initialize sum for the current digit position.
        var sum = 0 ;

        // If 'a' has a digit at the current position, add it to the sum.
        if ( a . length > i ) {
            sum += a [ i ] ;
        }

        // If 'b' has a digit at the current position, add it to the sum.
        if ( b . length > i ) {
            sum += b [ i ] ;
        }

        // Add the current sum to the corresponding digit in the result array 'c'.
        // This also incorporates any carry-over from the previous digit position.
        c [ i ] += sum ;
    } // End of main addition loop

    // --- Carry-over propagation loop ---
    // Iterate through the result digits to handle carry-overs.
    for ( var i = 0 ; i < max ; i ++ )
    {
        // If the current digit is 10 or more, a carry-over is needed.
        if ( c [ i ] >= 10 )
        {
            c [ i ] -= 10 ;   // Reduce current digit by 10 (keeping only the unit digit).
            c [ i + 1 ] ++ ; // Increment the next digit (carry over 1).
        }
    } // End of carry-over loop

    // Remove leading zero if the most significant digit (last element) is zero.
    // This happens if the sum didn't result in an extra digit.
    if ( c [ c . length - 1 ] == 0 )
    {
        c . pop ( ) ; // Remove the last element.
    }

    // Reverse the result digits (because we added from least significant) and join them into a string.
    var str = c . reverse ( ) . join ( "" ) ;

    // Return the final sum as a string.
    return str ;
} // End of bigAdd function definition


// --- Main Program Execution ---

// Read the entire input from standard input as a UTF-8 string.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim whitespace from the input and split it into an array of lines.
var arr = input . trim ( ) . split ( "\n" ) ;

// Remove the first line (often contains N or other metadata not directly used here).
arr . shift ( ) ;

// Get the next line, split by spaces, and convert elements to numbers. Store in 'a'.
var a = arr . shift ( ) . split ( " " ) . map ( Number ) ;

// Sort the array 'a' in ascending numerical order.
a . sort ( function ( a , b ) { return a - b ; } ) ;

// Remove another line from 'arr'.
arr . shift ( ) ;

// Get the next line, split by spaces, and convert elements to numbers. Store in 'b'.
var b = arr . shift ( ) . split ( " " ) . map ( Number ) ;

// Get the next line, split by spaces (elements remain strings). Store in 'c'.
var c = arr . shift ( ) . split ( " " ) ;

// Initialize a large array 'ary' with 'false' values.
// This array will act as a memoization table or a lookup for cumulative sums.
var ary = [ ] ;
for ( var i = 0 ; i <= 1000000 ; i ++ )
{
    ary [ i ] = false ; // Initialize each element to false.
}

ary [ 0 ] = 0 ; // Special case: the sum for 0 is 0.

var sum = 0 ; // Initialize a running sum for 'a'.

// Iterate through each value in array 'a'.
a . forEach ( function ( v )
{
    // Calculate the cumulative sum using the bigAdd function.
    sum = bigAdd ( sum , v ) ;

    // Store the cumulative sum in 'ary' at the index corresponding to 'v'.
    // This essentially stores the sum of all elements in 'a' up to 'v'.
    ary [ v ] = sum ;
} ) ; // End of a.forEach loop

// Process elements in array 'b'.
b . forEach ( function ( v , i )
{
    // Find the largest value 'v' or less for which a cumulative sum is stored in 'ary'.
    while ( true )
    {
        if ( ary [ v ] !== false ) { // If a sum is found for 'v', break.
            break ;
        }
        v -- ; // Decrement 'v' and try again.
    }

    var ans = "No" ; // Default answer is "No".

    // Compare the string from 'c' with the calculated sum from 'ary'.
    // Note: The comparison logic is specific to this problem.

    // Case 1: If strings are exactly equal (values are equal).
    if ( c [ i ] == ary [ v ] )
    {
        ans = "Yes" ;
    }
    // Case 2: If the string from 'c' is shorter than the sum string.
    // This implies ary[v] is a larger number, so it's "Yes".
    else if ( c [ i ] . length < ary [ v ] . length )
    {
        ans = "Yes" ;
    }
    // Case 3: If lengths are equal, perform digit-by-digit comparison.
    else if ( c [ i ] . length == ary [ v ] . length )
    {
        for ( var j = 0 ; j < c [ i ] . length ; j ++ )
        {
            // Compare digits. Subtracting 0 converts char to number.
            if ( c [ i ] [ j ] - 0 === ary [ v ] [ j ] - 0 )
            {
                continue ; // Digits are same, move to next.
            }
            else if ( c [ i ] [ j ] - 0 > ary [ v ] [ j ] - 0 )
            {
                ans = "No" ; // c[i] is greater, so "No".
                break ;
            }
            else if ( c [ i ] [ j ] - 0 < ary [ v ] [ j ] - 0 )
            {
                ans = "Yes" ; // ary[v] is greater, so "Yes".
                break ;
            }
        } // End of digit comparison loop
    }

    // Output the result for the current element in 'b'.
    console . log ( ans ) ;
} ) ; // End of b.forEach loop