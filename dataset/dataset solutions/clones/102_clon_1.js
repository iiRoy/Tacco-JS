// This JavaScript code processes input data to determine 'hits' and 'blows' based on specific matching rules.

/*
 * The script starts by importing the 'fs' (file system) module
 * to enable reading from the standard input.
 * It reads the entire content of '/dev/stdin' as a UTF-8 string,
 * then splits it into an array of strings based on newline characters.
 */
var arr = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . split ( /\n/ ) ;

// Store the total number of lines read from the input file.
var length = arr . length ;

// Declare two empty arrays, 'x' and 'y', which will be used to store processed input for each comparison.
var x = [ ] , y = [ ] ;

// Declare two variables, 'h' for 'hits' and 'b' for 'blows'.
// These will count the matches for each pair of input lines.
var h , b ;

// This is the main processing loop.
// It iterates through the 'arr' array, taking two lines at a time for each test case.
// 'i' is incremented by 2 in each step to process pairs of lines.
for ( var i = 0 ; i < length ; i += 2 )
{
    // Initialize 'hits' and 'blows' counters to zero for the current test case.
    h = 0 ;
    b = 0 ;

    // Process the first line of the current pair (arr[i]):
    // - trim() removes leading/trailing whitespace.
    // - split(/\s/) splits the line into an array of strings using whitespace as a delimiter.
    // The result is assigned to array 'x'.
    x = arr [ i ] . trim ( ) . split ( /\s/ ) ;

    // Process the second line of the current pair (arr[i+1]) similarly, assigning to array 'y'.
    y = arr [ i + 1 ] . trim ( ) . split ( /\s/ ) ;

    // This nested loop compares elements between array 'x' and array 'y'.
    // It is assumed that both 'x' and 'y' will contain at least 4 elements relevant for comparison.
    for ( var j = 0 ; j < 4 ; j ++ )
    {
        // Check for a 'hit': if an element in 'x' is exactly equal to the element
        // at the same position in 'y'.
        if ( x [ j ] == y [ j ] )
        {
            // If a hit is found, increment the 'h' (hits) counter.
            h ++ ;
        }
        else
        {
            // If it's not a direct hit, check for a 'blow'.
            // A blow occurs if the element x[j] exists anywhere else in array 'y'.
            // This inner-most loop iterates through all elements of 'y'.
            for ( var k = 0 ; k < 4 ; k ++ )
            {
                // If x[j] matches any element y[k], it's a blow.
                if ( x [ j ] == y [ k ] )
                {
                    // Increment the 'b' (blows) counter.
                    b ++ ;
                }
            }
        }
    }

    // After processing each pair of lines, print the total 'hits' and 'blows'
    // separated by a space to the console.
    console . log ( h + ' ' + b ) ;
}