/*
 * This JavaScript code snippet handles standard input processing,
 * reads data, and then executes a main function.
 * It's designed for competitive programming environments.
 */

// Resumes the standard input stream.
process.stdin.resume( ) ;

// Sets the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding( 'utf-8' ) ;

// A variable to accumulate the incoming input data.
let inputString = '' ;
// A pointer to keep track of the current line being processed from inputString.
let currentLine = 0 ;


// Event listener for incoming 'data' on the standard input stream.
process.stdin.on( 'data' , ( inputStdin ) => {

    // Appends the received chunk of data to 'inputString'.
    inputString += inputStdin ;
} ) ;


// Event listener for the 'end' of the standard input stream.
process.stdin.on( 'end' , ( _ ) => {
    /*
     * When all input has been received:
     * 1. Trim leading/trailing whitespace from the entire string.
     * 2. Split the string into an array of lines based on newline characters.
     * 3. Map over each line to trim its own leading/trailing whitespace.
     */
    inputString = inputString.trim( ).split( '\n' ).map( ( string ) => {
                                                                           return string.trim( ) ;
                                                                         } ) ;


    // Call the main function to start the core logic.
    main( ) ;
} ) ;


/**
 * Reads a single line from the processed input string array.
 * Increments the currentLine pointer after reading.
 * @returns {string} The next line from the input.
 */
function readLine ( )
{
    return inputString[ currentLine ++ ] ;
}



/*
 * The primary logic function where the problem-solving code resides.
 * This particular 'main' function appears to solve a problem involving
 * rearranging 'R' and 'W' characters in a string.
 */
function main ( )
{
    // Read the integer 'n' from the input, likely representing the length of a sequence.
    const n = Number( readLine( ) ) ;

    // Read the character sequence 'cs' (e.g., a string) from the input.
    const cs = readLine( ) ;

    // Initialize two pointers, 's' (start) and 'e' (end), for a two-pointer approach.
    let s = 0 , e = n - 1 ;

    // Initialize a variable to store the result (e.g., count of operations).
    let result = 0 ;

    // Define constants for the characters 'R' and 'W' for clarity.
    const r = 'R' , w = 'W' ;

    // Main loop: continues as long as the start pointer is less than or equal to the end pointer.
    while ( s <= e )
    {
        // Flags to track if a 'W' was found in the left part and an 'R' was successfully swapped.
        let wFound = false ;
        let rFound = false ;

        // Inner loop: iterates from the start pointer 's' towards 'e'.
        for ( let i = s ; i < e ; i ++ )
        {
            // If the current character is 'R', skip it and continue searching for 'W'.
            if ( cs[ i ] === r )
            {
                continue ;
            }
            // A 'W' character is found at index 'i'.
            wFound = true ;
            rFound = false ; // Reset rFound for a new search for 'R' from the right.

            // Innermost loop: iterates from the end pointer 'e' backwards towards 'i'.
            for ( let j = e ; j > i ; j -- )
            {
                // If the current character is 'W', skip it and continue searching for 'R'.
                if ( cs[ j ] === w )
                {
                    continue ;
                }
                // An 'R' character is found at index 'j' to swap with 'W' at 'i'.
                e = j - 1 ; // Move the end pointer one step to the left, as 'j' is now processed.
                result += 1 ; // Increment the operation count.
                rFound = true ; // Mark that an 'R' was found and processed.
                break ; // Exit the innermost loop since a swap pair is found.
            }

            // If no 'R' was found to swap with the 'W' at 'i', then no more swaps are possible from this 'W'.
            if ( ! rFound )
            {
                break ; // Exit the inner loop.
            }

            // Move the start pointer one step to the right, as 'i' (the 'W') is now processed.
            s = i + 1 ;
            break ; // Exit the inner loop, as a pair has been processed.
        }

        // If no 'W' was found or no 'R' was found to pair with a 'W', then stop.
        if ( ! wFound || ! rFound )
        {
            break ; // Exit the main while loop.
        }
    }

    // Print the final calculated result to the console.
    console.log( result ) ;
}

// End of the main program logic.