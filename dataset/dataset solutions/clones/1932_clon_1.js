/* This function serves as the primary data processor for the application.
 * It takes an array of strings, typically representing lines of input.
 * The core logic involves generating pairs of numbers based on the parity of 'n'.
 */
const processData = (lines) => {
    // The first line of input contains two numbers, 'n' and 'm'.
    // We split the string by space and convert each part to a number.
    let [n, m] = lines[0] .split (' ') .map (x => +x) ; /* Convert string parts to numbers using unary plus */

    // Check if the number 'n' is odd or even.
    if (n % 2 === 1) { // This block executes if 'n' is an odd number.
        let end = n - 1 ; // Initialize the 'end' pointer.
        let start = 1 ; // Initialize the 'start' pointer.

        // Loop 'm' times, printing a pair of numbers in each iteration.
        while (m) { // The loop continues as long as 'm' is a truthy value (i.e., not zero).
            console.log(`${start++} ${end--}`) ; // Print current 'start' and 'end', then increment 'start' and decrement 'end'.
            m-- ; // Decrement 'm' to move closer to loop termination.
        } // End of the while loop for odd 'n'.
    } else { // This block executes if 'n' is an even number.
        let end = n / 2 + 1 ; // Initialize 'end' for even 'n'.
        let start = n / 2 ; // Initialize 'start' for even 'n'.

        // Loop 'm' times again, but with a different pairing logic.
        while (m) { // Continue looping while 'm' is greater than zero.
            console.log(`${start--} ${end++}`) ; // Print current 'start' and 'end', then decrement 'start' and increment 'end'.
            m-- ; // Reduce the counter 'm'.
        } // End of the while loop for even 'n'.
    } // End of the if-else conditional block.
}; // End of the processData function definition.

// Initialize a string variable to accumulate all incoming data from standard input.
let i = '' ;

// Set up an event listener for 'data' events on the standard input stream.
// Each chunk of data 'c' received is appended to the string 'i'.
process.stdin .on ('data', c => i += c) ; // Concatenate incoming data chunks

// Set up an event listener for the 'end' event on the standard input stream.
// This event fires when there is no more data to be read.
process.stdin .on ('end', () => {
    // Dynamically require the 'os' module to get the platform-specific End-Of-Line character.
    const { EOL } = require('os') ;

    // Split the accumulated input string 'i' into an array of lines using the determined EOL character.
    const lines = i .split (EOL) ; /* The entire input text is now parsed into individual lines */

    // Invoke the main data processing function with the prepared array of lines.
    processData(lines) ;
}) ; // End of the 'end' event handler for process.stdin.