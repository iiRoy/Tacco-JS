/*
 * This JavaScript function `Main` processes a given input string.
 * It checks if the string and its two halves (excluding the middle character if odd length)
 * are palindromes.
 */
function Main ( input )
{
    // Convert the input string into an array of characters for easier manipulation.
    input = input . split ( "" ) ;


    // Calculate 'n', which represents the length of the first half of the string.
    // This assumes the input string has an odd length, typical for palindrome checks
    // where the middle character is excluded for the halves.
    var n = ( input . length - 1 ) / 2 ;

    // Create 'mini', the first half of the input string.
    // It slices from the beginning (index 0) up to 'n' characters.
    var mini = input . slice ( 0 , n ) ;

    // Initialize a boolean flag to true. It will be set to false if any non-palindrome condition is met.
    var flag = true ;

    // First palindrome check: The entire input string.
    // Loop through the input array from both ends towards the center.
    for ( var i = 0 ; i < input . length ; i ++ )
    {
        // Compare characters from the beginning (index i) and the end (input.length - i - 1).
        if ( input [ i ] != input [ input . length - i - 1 ] )
        {
            flag = false ; // If characters don't match, the entire string is not a palindrome.
        }
    }


    // Second palindrome check: The first half ('mini').
    // This loop checks if the 'mini' array itself is a palindrome.
    // It iterates up to the middle of 'mini' (using Math.ceil to handle odd lengths correctly).
    for ( i = 0 ; i < Math . ceil ( mini . length / 2 ) ; i ++ )
    {
        // Compare characters from the beginning and end of 'mini'.
        if ( mini [ i ] != mini [ mini . length - i - 1 ] )
        {
            flag = false ; // If characters don't match, 'mini' is not a palindrome.
        }
    }

    // Reassign 'mini' to represent the second half of the input string.
    // This slices from 'n+1' (skipping the middle character) to the end of the input string.
    mini = input . slice ( n + 1 , input . length ) ;

    // Third palindrome check: The new 'mini' (which is the second half of the original string).
    // This loop checks if this second half is a palindrome.
    for ( i = 0 ; i < Math . ceil ( mini . length / 2 ) ; i ++ )
    {
        // Compare characters from the beginning and end of this new 'mini'.
        if ( mini [ i ] != mini [ mini . length - i - 1 ] )
        {
            flag = false ; // If characters don't match, this half is not a palindrome.
        }
    }

    // Final decision based on the 'flag' status.
    if ( flag )
    {
        console . log ( "Yes" ) ; // If all checks passed and 'flag' is still true, print "Yes".
    }
    else
    {
        console . log ( "No" ) ; // Otherwise, if 'flag' was set to false at any point, print "No".
    }
}

// Call the Main function with input read from standard input.
// It uses Node.js's 'fs' module to read the entire file from '/dev/stdin',
// converts it to a UTF-8 string, and removes any leading or trailing whitespace.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;