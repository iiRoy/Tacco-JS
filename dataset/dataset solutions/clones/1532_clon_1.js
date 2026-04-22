// This JavaScript program is designed to read input from standard input,
// process it, and then output a calculated result to standard output.
// It leverages Node.js's process.stdin for input handling.

// Resume the standard input stream. This is crucial for Node.js to
// start listening for input data.
process.stdin.resume();

// Set the encoding for the standard input stream to 'utf-8'.
// This ensures that text data is correctly interpreted.
process.stdin.setEncoding( 'utf-8' );


// A global variable to accumulate all incoming standard input data.
let inputString = '';

// A global variable to keep track of the current line number being read
// from the 'inputString' array after it's split.
let currentLine = 0;


// Attach an event listener for the 'data' event on the standard input stream.
// This event fires whenever there is input data available.
process.stdin.on( 'data', inputStdin => {
    // Concatenate the new chunk of input data to the 'inputString'.
    inputString += inputStdin;
} );


// Attach an event listener for the 'end' event on the standard input stream.
// This event fires when there is no more input data to be read.
process.stdin.on( 'end', _ => {
    // Once all input is received, split the entire 'inputString' into an array
    // of individual lines, using the newline character as a delimiter.
    inputString = inputString.split( /\n/ );

    // After processing the input, call the main function to execute the core
    // business logic of the program.
    main();
} );


/**
 * A utility function to read a single line from the processed input.
 * It automatically increments the 'currentLine' counter to point to the next line.
 *
 * @returns {string} The next available line from the 'inputString' array.
 */
function readLine() {
    // Return the line at the 'currentLine' index and then increment the index.
    return inputString[ currentLine++ ];
}


// Define a constant for the modulo operation. This value is frequently used
// in competitive programming for calculations that need to stay within a
// specific range, preventing integer overflow. It's a large prime number.
const mod = Math.pow( 10, 9 ) + 7;


/**
 * The main function encapsulates the primary logic of the program.
 * It reads an integer 'n' and then performs a series of calculations
 * involving powers of 10, 9, and 8, all modulo 'mod'.
 */
function main() {
    // Read the first line of input, convert it to a number, and store it in 'n'.
    const n = Number( readLine() );

    // Initialize variables that will store intermediate results for powers.
    // 'tens' will store (10^k) % mod.
    // 'nines' will store (2 * 9^k) % mod.
    // 'eights' will store (8^k) % mod.
    let tens   = 1;
    let nines  = 2;
    let eights = 1;

    // Loop 'n' times to compute the required powers modulo 'mod'.
    for ( let _ = 0; _ < n; _++ ) {
        // Update 'tens' for the next iteration: (tens * 10) % mod.
        tens   = ( tens   * 10 ) % mod;

        // Update 'nines' for the next iteration: (nines * 9) % mod.
        nines  = ( nines  * 9  ) % mod;

        // Update 'eights' for the next iteration: (eights * 8) % mod.
        eights = ( eights * 8  ) % mod;
    }

    // Calculate the final result based on the computed 'tens', 'nines', and 'eights'.
    // The expression is effectively (10^n - 2*9^n + 8^n) % mod.
    const total = tens - nines + eights;

    // Output the final 'total'.
    // It's important to handle potential negative results from the subtraction
    // before applying the modulo, ensuring the final output is always positive
    // and within the [0, mod-1] range.
    console.log( total >= 0 ? total % mod : total + mod );
}