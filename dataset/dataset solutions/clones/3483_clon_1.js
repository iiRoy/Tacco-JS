/*
 * This function converts a string to a number.
 * It uses parseInt with radix 10 for safety.
 */
function   toNum   ( str )
{
    // The parseInt function is used here.
    return   parseInt   ( str ,   10 )   ;
}


// Function to compute the greatest common divisor (GCD) of two numbers.
// This implementation uses the Euclidean algorithm.
function   gcd   ( a ,   b )
{
    // Check if 'a' is perfectly divisible by 'b'.
    if   ( a   %   b   ===   0 )
    {
        // If 'a' is divisible by 'b', then 'b' is the GCD.
        return   b   ;
    }
    else
    {
        // Otherwise, recursively call gcd with 'b' and the remainder of 'a' divided by 'b'.
        return   gcd   ( b ,   a   %   b )   ;
    }
}


/*
 * Calculates the least common multiple (LCM) of two numbers.
 * The formula used is: LCM(a, b) = |a * b| / GCD(a, b).
 * Here, we assume a and b are positive integers.
 */
function   lcm   ( a ,   b )
{
    // The LCM is calculated using the product of a and b, divided by their GCD.
    return   a   *   b   /   gcd   ( a ,   b )   ;
}


// This is the main processing function for the input data.
// The entire input data is passed as a single string.
function   Main   ( input )
{
    // Parse the first line of input to get N and M.
    // N is the first number on the first line.
    var   N   =   toNum   ( input . split   ( '\n' ) [ 0 ] . split   ( ' ' ) [ 0 ] )   ;

    // M is the second number on the first line.
    var   M   =   toNum   ( input . split   ( '\n' ) [ 0 ] . split   ( ' ' ) [ 1 ] )   ;

    // S is the string from the second line of input.
    var   S   =   input . split   ( '\n' ) [ 1 ]   ;

    // T is the string from the third line of input.
    var   T   =   input . split   ( '\n' ) [ 2 ]   ;


    // Calculate L, which is the LCM of N and M.
    // The ternary operator ensures lcm is called correctly, though order for lcm usually doesn't matter.
    var   L   =   N   >   M   ?   lcm   ( N ,   M )   :   lcm   ( M ,   N )   ;

    // Initialize a flag to track if a mismatch is found.
    var   flag   =   true   ;

    // Create an array X to store characters.
    var   X   =   [ ]   ;

    // Populate array X with empty strings, up to length L.
    for   ( var   i   =   0 ;   i   <   L ;   i++ )
    {
        X . push   ( '' )   ; // Add an empty string at each index.
    }

    // Assign the first character of S to the first position in X.
    X [ 0 ]   =   S [ 0 ]   ;

    // Fill in characters from S into X at specific indices.
    // The index is i * (L / N).
    for   ( var   i   =   1 ;   i   <   S . length ;   i++   )
    {
        X [ i   *   ( L   /   N ) ]   =   S [ i ]   ;
    }


    // Check the first character of X against T.
    if   ( X [ 0 ]   !=   T [ 0 ] )
    {
        // If they don't match, print -1.
        console . log   ( '-1' )   ;
    }
    else
    {
        // If the first characters match, proceed to check the rest of T.
        for   ( var   i   =   1 ;   i   <   T . length ;   i++ )
        {
            // Calculate the current index for T in X.
            var   currentIndex   =   i   *   ( L   /   M )   ;

            // Check if X at this index is already populated and if it mismatches T[i].
            if   ( X [ currentIndex ]   !=   ''   &&   X [ currentIndex ]   !=   T [ i ] )
            {
                // If a mismatch is found, print -1.
                console . log   ( '-1' )   ;

                // Set the flag to false to indicate a mismatch.
                flag   =   false   ;

                // Exit the loop early as a mismatch is confirmed.
                break   ;
            }
        }
    }


    // After all checks, if no mismatch was found (flag is still true).
    if   ( flag )
    {
        // Print the value of L.
        console . log   ( L )   ;
    }

}


// *** DO NOT EDIT THE FOLLOWING LINE. It handles reading input and calling Main. ***
// This part reads the entire standard input and passes it to the Main function.
Main   ( require   ( "fs" ) . readFileSync   ( "/dev/stdin" ,   "utf8" ) )   ;