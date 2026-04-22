// This directive enforces strict mode for the entire script.
// It helps in writing cleaner code and catching common errors.
"use strict"
;


// Main function: The primary entry point for the program logic.
// It takes the raw input string as its argument.
function Main ( input )
{

    // Initialize an instance of the custom Inputer class.
    // This object will handle parsing various data types from the input.
    let cin = new Inputer( input )
    ;

    // Read the main string 'S' from the processed input.
    let S = cin.getStr()
    ;


    // Determine the length of the string 'S'.
    // This value 'N' is crucial for loop bounds and array dimensions.
    let N = S.length
    ;


    // Define a constant string 'ABC'.
    // This is the target pattern we are trying to find in 'S'.
    const ABC = "ABC"
    ;

    // Define a modulo constant.
    // This is used to prevent integer overflow in calculations,
    // ensuring results stay within a manageable range for large numbers.
    const MOD = 1000000007
    ;


    // Initialize a 2D dynamic programming (DP) array.
    // The dimensions are (N + 1) rows and (3 + 1) columns.
    // All elements are initially set to zero.
    // This DP table will store intermediate results for counting valid sequences.
    let dp = new Array( N + 1 )
        .fill( 0 )
        .map( ( ) => new Array( 3 + 1 )
            .fill( 0 )
        )
    ;


    // Outer loop: Iterate backwards through the string 'S' from N down to 0.
    // 'i' represents the current index in string S.
    for ( let i = N ; i >= 0 ; --i )
    {

        // Inner loop: Iterate backwards through the target pattern 'ABC' from 3 down to 0.
        // 'j' represents the current character index we are looking for in 'ABC' (0 for 'A', 1 for 'B', 2 for 'C', 3 for end).
        for ( let j = 3 ; j >= 0 ; --j )
        {

            // Base case for the DP calculation: when 'i' has reached the end of the string 'S'.
            if ( i == N )
            {
                // If 'j' is 3, it means we have successfully matched all characters of 'ABC'.
                // So, there's 1 way to form 'ABC' (an empty string matches if we've already matched all).
                // Otherwise (j < 3), we haven't matched all, so there are 0 ways.
                dp[ i ][ j ] = ( j == 3 ? 1 : 0 )
                ;
            }
            else // Recursive step: when 'i' is not yet at the end of the string.
            {
                // First part of the DP transition:
                // Count ways if S[i] does *not* contribute to forming ABC[j],
                // or if S[i] is '?' and can be *any* character.
                // If S[i] is '?', it can be any of 3 characters (A, B, C),
                // so we multiply dp[i+1][j] by 3.
                // If S[i] is a specific character, it can only be 1 specific character,
                // so we multiply by 1.
                dp[ i ][ j ] = dp[ i + 1 ][ j ] * ( S[ i ] == '?' ? 3 : 1 )
                ;

                // Second part of the DP transition:
                // Count ways if S[i] *does* contribute to forming ABC[j].
                // This condition checks if 'j' is not yet 3 (meaning we still need to match characters)
                // AND if S[i] is '?' (can match anything) OR S[i] specifically matches ABC[j].
                if ( j < 3 && ( S[ i ] == '?' || S[ i ] == ABC[ j ] ) )
                {
                    // If it matches, we add the ways from the next state (i+1, j+1).
                    // This means S[i] is used to form ABC[j], and we now look for ABC[j+1] from S[i+1].
                    dp[ i ][ j ] += dp[ i + 1 ][ j + 1 ]
                    ;
                }

                // Apply modulo operation to the current DP value.
                // This keeps the numbers from becoming too large and prevents overflow.
                dp[ i ][ j ] %= MOD
                ;
            }
        }
    }


    // After the DP table is fully populated, the final answer is stored at dp[0][0].
    // This represents the total number of ways to form 'ABC' starting from index 0
    // of the input string 'S', looking for the first character ('A') of 'ABC'.
    console.log( dp[ 0 ][ 0 ] )
    ;
}


// Custom class designed for efficient input parsing.
// It tokenizes the input string and provides methods to retrieve different data types.
class Inputer
{

    // Constructor for the Inputer class.
    // 't' is the raw input string passed to the instance.
    constructor ( t )
    {
        // Initialize a counter for the current item being read.
        // Also, split the input string 't' into an array of items,
        // using newlines or spaces as delimiters.
        this.cnt = 0 , this.items = t.split( /\n|\s/ )
        ;
    }

    // Method to retrieve and convert the next input item into an integer.
    getInt ( )
    {
        // Increment the counter and subtract 0 to ensure type conversion to number.
        return this.items[ this.cnt++ ] - 0
        ;
    }

    // Method to retrieve an array of integers.
    // 't' specifies the number of integers to read into the array.
    getIntArray ( t )
    {
        let r = new Array( t )
        ;
        for ( let e = 0 ; e < t ; e++ )
        {
            r[ e ] = this.getInt()
            ;
        }
        return r
        ;
    }

    // Method to retrieve the next input item as a string.
    getStr ( )
    {
        // Simply return the item and increment the counter.
        return this.items[ this.cnt++ ]
        ;
    }

    // Method to retrieve an array of strings.
    // 't' specifies the number of strings to read into the array.
    getStrArray ( t )
    {
        let r = new Array( t )
        ;
        for ( let e = 0 ; e < t ; e++ )
        {
            r[ e ] = this.getStr()
            ;
        }
        return r
        ;
    }
}


// This conditional block checks if the code is running in a Node.js environment.
// 'typeof window == "undefined"' is a common way to detect if it's not a browser environment.
if ( typeof window == "undefined" )
{
    // If running in Node.js, read input from standard input (/dev/stdin).
    // The 'fs' module is used to synchronously read the file.
    // The content is then decoded as UTF-8 and passed to the Main function for processing.
    Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) )
    ;
}