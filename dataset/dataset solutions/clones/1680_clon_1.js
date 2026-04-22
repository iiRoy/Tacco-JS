/*
 * This is the main function that processes the input.
 * It reads N and a binary string X, then iterates N times,
 * flipping one bit in X each time and calculating a specific function 'f'
 * on the resulting binary number.
 */
function Main ( input )
{
    // Split the input string by newline characters to get individual lines.
    input = input.split( "\n" ) ;

    // Parse the first line as an integer N (base 10).
    const   N = parseInt( input[ 0 ], 10 ) ;

    // The second line is the binary string X.
    const   X = input[ 1 ] ;


    /*
     * Loop N times, modifying the binary string X at each position 'i'.
     * For each modification, calculate 'f' and print the result.
     */
    for ( let i = 0 ; i < N ; i ++ )
    {
        // Create a new string x_str by flipping the bit at position 'i' in X.
        const x_str = X.slice( 0 , i ).concat( ( X[ i ] === "1" ? "0" : "1" ) , X.slice( i + 1 ) ) ;

        // Convert x_str to an integer (base 2) and pass it to function 'f', then log the result.
        console.log( f( Number.parseInt( x_str , 2 ) ) ) ;
    }

} // End of Main function.


/*
 * This line calls the Main function with input read from standard input.
 * It reads the entire content of /dev/stdin as a UTF-8 string.
 */
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;


/*
 * Function to calculate the population count (number of set bits) of an integer.
 * It converts the number to its binary string representation, then counts '1's.
 */
function popcount ( n )
{
    // Convert n to its binary string, then parse it back to int (to remove leading zeros if any),
    // convert to string again, split into array of characters, filter out empty strings, and get length.
    return parseInt( n.toString( 2 ) ).toString().split( "" ).filter( b => b ).length ;
} // End of popcount function.


/*
 * Recursive function 'f' as defined in the problem.
 * It calculates a sequence based on the number and its popcount.
 */
function f ( n , count )
{
    // Base case: if n becomes 0, return the accumulated count or 0 if it's the first call.
    if ( n === 0 )
    {
        return count || 0 ;
    }

    // Recursive step: call f with n modulo its popcount, and increment the count.
    return f( n % popcount( n ) , count ? count + 1 : 1 ) ;
} // End of f function.