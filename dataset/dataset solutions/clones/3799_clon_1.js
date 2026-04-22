/*
 *  This JavaScript code solves a problem
 *  related to bitwise operations on subarrays.
 *  It uses a custom Inputer class for parsing input.
 */
"use strict"; // Enforces strict mode for cleaner code and fewer errors.

/**
 * The main function that processes the input and calculates the result.
 * @param {string} input - The raw input string from stdin.
 */
function Main ( input )
{
    // Initialize an Inputer instance to handle parsing
    let cin  =  new Inputer ( input ) ;

    // Read N, the number of elements, and A, the array of N integers.
    let N  =  cin.getInt ( ) ;
    let A  =  cin.getIntArray ( N ) ;

    // Define a constant for the maximum number of bits to consider (e.g., for numbers up to 2^20 - 1).
    const DIGIT = 20 ;

    /*
     *  B is a 2D array used to store prefix sums of bit counts.
     *  B[n][m] will represent the count of the m-th bit set
     *  in the subarray A[0]...A[n-1].
     *  It's initialized with N+1 rows and DIGIT columns.
     */
    let B = new Array ( N + 1 )
            .fill ( 0 )
            .map ( ( ) => new Array ( DIGIT ) ) ;

    // The first row (B[0]) represents an empty prefix, so all bit counts are zero.
    B [ 0 ] . fill ( 0 ) ;

    // Calculate prefix sums for each bit position.
    // This loop iterates through each number in the input array A.
    for ( let n = 1 ; n <= N ; n++ )
    {
        // This inner loop iterates through each bit position (from 0 to DIGIT-1).
        // 's' is a bitmask used to check if a specific bit is set.
        for ( let m = 0 , s = 1 << 19 ; m < DIGIT ; m++ , s >>= 1 )
        {
            // B[n][m] is the count of the m-th bit in A[0]...A[n-1].
            // It's calculated by adding the count from the previous prefix B[n-1][m]
            // and checking if the m-th bit is set in the current number A[n-1].
            B [ n ] [ m ]  =  B [ n - 1 ] [ m ]  +  ( ( A [ n - 1 ]  &  s )  ?  1  :  0 ) ;
        }
    }

    // Initialize the answer variable. This will count valid subarrays.
    let ans = 0 ;

    // Iterate through all possible starting positions of subarrays (1-indexed).
    for ( let n = 1 ; n <= N ; n++ )
    {
        // 'done' flag indicates if the current subarray (from 'n' to 'm') is valid so far.
        let done = true ;

        // Iterate through all possible ending positions of subarrays (1-indexed),
        // starting from the current 'n'.
        // The loop continues only if the subarray remains valid ('done' is true).
        for ( let m = n ; m <= N  &&  done ; m++ )
        {
            // Iterate through each bit position to check the condition.
            // The loop continues only if the subarray remains valid.
            for ( let b = 0 ; b < DIGIT  &&  done ; b++ )
            {
                /*
                 *  Check if the count of the 'b'-th bit in the subarray A[n-1]...A[m-1]
                 *  is greater than 1.
                 *  B[m][b] - B[n-1][b] gives the count of the 'b'-th bit
                 *  in the subarray A[n-1]...A[m-1].
                 *  If any bit appears more than once, the subarray is not valid.
                 */
                if ( B [ m ] [ b ]  -  B [ n - 1 ] [ b ]  >  1 )
                {
                    done  =  false ; // Mark as invalid.
                }
            }

            // If after checking all bits, the subarray is still valid, increment the answer.
            if ( done )
            {
                ans++ ;
            }
            else
            {
                // If the current subarray (n to m) is not valid,
                // then any longer subarray starting at 'n' (n to m+1, n to m+2, etc.)
                // will also be invalid because it contains the invalid subarray.
                // So, we can break the inner loop and move to the next starting position 'n'.
                break ;
            }
        }
    }

    // Output the final calculated answer to the console.
    console.log ( ans ) ;
}


/**
 *  A custom class to simplify reading various types of input from a string.
 *  It splits the input string by newlines and spaces.
 */
class Inputer
{
    // Constructor: Takes the input string and initializes internal state.
    constructor ( t )
    {
        // Ensure that an input string is provided.
        if ( typeof t == 'undefined' )
            throw new Error ( '引数（stdin）を省略できません！' ) ;

        // Initialize a counter for the current item being read.
        this.cnt = 0 ;

        // Split the input string into an array of items (numbers or strings).
        // It splits by newlines or spaces.
        this.items = t . split ( / \n | \s / ) ;
    }


    // Reads and returns the next item as an integer.
    getInt ( )
    {
        // Subtracting 0 converts the string item to a number.
        return this . items [ this . cnt++ ]  -  0 ;
    }


    // Reads and returns an array of 't' integers.
    getIntArray ( t )
    {
        // Ensure that the number of elements to read is provided.
        if ( typeof t == 'undefined' )
            throw new Error ( '引数（1以上）を省略できません！' ) ;

        let r = new Array ( t ) ; // Create a new array to store the integers.

        // Loop 't' times to read each integer.
        for ( let e = 0 ; e < t ; e++ )
            r [ e ] = this . getInt ( ) ; // Read and store the integer.

        return r ; // Return the array of integers.
    }


    // Reads and returns the next item as a string.
    getStr ( )
    {
        return this . items [ this . cnt++ ] ;
    }


    // Reads and returns an array of 't' strings.
    getStrArray ( t )
    {
        // Ensure that the number of elements to read is provided.
        if ( typeof t == 'undefined' )
            throw new Error ( '引数（1以上）を省略できません！' ) ;

        let r = new Array ( t ) ; // Create a new array to store the strings.

        // Loop 't' times to read each string.
        for ( let e = 0 ; e < t ; e++ )
            r [ e ] = this . getStr ( ) ; // Read and store the string.

        return r ; // Return the array of strings.
    }
}


/*
 *  This block checks if the code is running in a Node.js environment (i.e., not in a browser).
 *  If it's Node.js, it reads input from standard input and calls the Main function.
 */
if ( typeof window  ==  "undefined" )
{
    Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
}