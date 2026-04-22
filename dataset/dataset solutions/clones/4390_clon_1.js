// This script initializes Node.js standard input processing.
// It is designed to read multiple lines of input for a computational problem.

process . stdin . resume ( ) ; // Ensures the standard input stream remains active.

process . stdin . setEncoding ( 'utf8' ) ; // Sets the character encoding for the input data to UTF-8.

// An array to accumulate all incoming lines from standard input.
var lines = [ ] ;

/*
 * The 'readline' module provides an interface for reading data from a Readable stream
 * (in this case, process.stdin) one line at a time.
 */
var reader = require ( 'readline' ) . createInterface ( {
    input  : process . stdin ,   // Specifies process.stdin as the input source for the reader.
    output : process . stdout    // Specifies process.stdout as the output destination (not actively used for prompting here).
} ) ;

// Attaches an event listener for the 'line' event.
// This callback function executes every time a new line of input is received.
reader . on ( 'line' , ( line ) => {
    // Adds the currently read line to the 'lines' array.
    lines . push ( line ) ;
} ) ;

/*
 * Attaches an event listener for the 'close' event.
 * This callback function executes once the input stream has ended and all data has been read.
 * It contains the main logic of the program.
 */
reader . on ( 'close' , ( ) => {

    // Parses the first line of input. It's expected to contain four space-separated BigInt values.
    // These values represent different costs (Q, H, S, D).
    const [ Q , H , S , D ] = lines [ 0 ] . split ( " " ) . map ( v => BigInt ( v ) ) ;

    // Parses the second line of input. It's expected to contain a single BigInt value.
    // This value represents the target quantity (N).
    const N = BigInt ( lines [ 1 ] ) ;

    // Checks if the target quantity N is an even number.
    if ( N % 2n == 0n ) {
        // If N is even, calculate the minimum cost to acquire 2 units of the item.
        // Q * 8n: cost if using quarter-liter bottles (8 * 1/4L = 2L)
        // H * 4n: cost if using half-liter bottles (4 * 1/2L = 2L)
        // S * 2n: cost if using one-liter bottles (2 * 1L = 2L)
        // D:      cost if using two-liter packages (1 * 2L = 2L)
        const unit = min ( Q * 8n , H * 4n , S * 2n , D ) ;

        // The total cost for an even N is (N / 2) multiplied by the minimum cost for 2 units.
        log ( N / 2n * unit ) ;
    } else {
        // If N is an odd number, the strategy is different.
        // We will need to buy (N-1) units (which is even) and 1 additional unit.

        // Calculate the minimum cost to acquire 1 unit of the item.
        // Q * 4n: cost if using quarter-liter bottles (4 * 1/4L = 1L)
        // H * 2n: cost if using half-liter bottles (2 * 1/2L = 1L)
        // S:      cost if using one-liter bottles (1 * 1L = 1L)
        const unit1 = min ( Q * 4n , H * 2n , S ) ;

        // The cost for a 2-liter package (D) is directly given.
        const unit2 = D ;

        // Compare the cost of buying two single units (unit1 * 2n)
        // against the cost of buying one 2-liter package (D).
        if ( unit1 * 2n < D ) {
            // If buying two single units is cheaper than a 2-liter package,
            // then it's always optimal to buy N single units.
            log ( N * unit1 ) ;
        } else {
            // Otherwise, it's optimal to buy (N-1) units as (N-1)/2 packages of 2 liters (cost D),
            // and the remaining 1 unit as a single unit (cost unit1).
            log ( ( N - 1n ) / 2n * unit2 + unit1 ) ;
        }
    }
} ) ;


/*
 * A helper function to determine the minimum value among an arbitrary number of BigInt arguments.
 * It leverages the 'reduce' method to compare values iteratively.
 */
min = ( ... a ) => { return a . reduce ( ( a , b ) => a < b ? a : b , a [ 0 ] ) } ;


// A helper function for logging BigInt values to the console.
// It ensures that the BigInt is converted to its string representation before output.
log = ( a ) => { console . log ( a . toString ( ) ) } ;