/*
 * This is a JavaScript function named Main.
 * It processes a string input to calculate a specific value.
 */
function   Main  ( s )
{
    // The input string 's' is initially a single string.
    // We split it by newline characters to get an array of lines.
    s   =   s.split ( "\n" ) ;

    // The first line (s[0]) contains an integer 'n'.
    // The unary plus operator converts the string to a number.
    var   n   =   +s[0] ;

    // The second line (s[1]) is the primary string to be processed.
    s   =   s[1] ;

    // 'r' is the reverse of the string 's'.
    // First, split 's' into an array of characters.
    // Then, reverse the array.
    // Finally, join the characters back into a string.
    var   r   =   s.split ( "" ) . reverse ( ) . join ( "" ) ;


    // 'k' is calculated as 2 to the power of 'n'.
    // This is equivalent to 1 shifted left by 'n' bits.
    var   k   =   1   <<   n ;

    // Initialize two empty objects (hash maps) 'a' and 'b'.
    // These will store counts of generated string combinations.
    var   a   =   { } ,   b   =   { } ;

    // This loop iterates 'k' times.
    // 'i' acts as a bitmask to generate all 2^n combinations.
    for   ( var   i   =   0 ;   i   <   k ;   i++ )
    {
        // Initialize four empty strings for each iteration.
        // t, u will store parts of 's'.
        // v, w will store parts of 'r'.
        var   t   =   "" ,   u   =   "" ,   v   =   "" ,   w   =   "" ;

        // Inner loop iterates 'n' times, corresponding to each character in 's' (and 'r').
        for   ( var   j   =   0 ;   j   <   n ;   j++ )
        {
            // Check if the j-th bit of 'i' is set.
            // If the bit is set (i.e., (1 << j) & i is true):
            if   ( i   &   ( 1   <<   j ) )
            {
                // Append the j-th character of 's' to 't'.
                t   +=   s[j] ;
                // Append the j-th character of 'r' to 'v'.
                v   +=   r[j] ;
            }
            // If the j-th bit is not set:
            else
            {
                // Append the j-th character of 's' to 'u'.
                u   +=   s[j] ;
                // Append the j-th character of 'r' to 'w'.
                w   +=   r[j] ;
            }
        }

        // Concatenate 't' and 'u' with a comma, and 'v' and 'w' with a comma.
        // These form the keys for our hash maps.
        t   +=   ","   +   u ;
        v   +=   ","   +   w ;

        // Increment the count for key 't' in map 'a'.
        // If 'a[t]' doesn't exist, initialize it to 1. Otherwise, increment.
        if   ( !a[t] )   a[t]   =   1 ;
        else   a[t]++ ;

        // Increment the count for key 'v' in map 'b'.
        // Similar logic as for map 'a'.
        if   ( !b[v] )   b[v]   =   1 ;
        else   b[v]++ ;
    }

    // Initialize the answer variable.
    var   ans   =   0 ;

    // Iterate over the keys in map 'a'.
    for   ( i   in   a )
    {
        // If the current key 'i' does not exist in map 'b',
        // then there's no matching pair, so skip to the next key.
        if   ( !b[i] )
        {
            continue ;
        }

        // If 'i' exists in both 'a' and 'b',
        // multiply their counts and add to the total answer.
        ans   +=   a[i]   *   b[i] ;
    }

    // Output the final calculated answer to the console.
    console.log ( ans ) ;
}

// This is the entry point of the program.
// It reads input from standard input, using Node.js's 'fs' module.
// The input is read synchronously as UTF-8.
Main (
    require ( "fs" )
        . readFileSync ( "/dev/stdin" ,   "utf8" )
) ;