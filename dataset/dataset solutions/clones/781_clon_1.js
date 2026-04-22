/*
 * This JavaScript file processes input data from standard input.
 * It simulates a change-making problem, calculating the number of coins
 * returned for a given transaction.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

// Import the 'fs' module to interact with the file system.
// Specifically, readFileSync is used to read input synchronously.
var      input     =   require( 'fs' ) . readFileSync( '/dev/stdin' ,    'utf8' );

// Process the raw input: trim whitespace and split it into an array of lines.
var      Arr     =      ( input . trim() ) . split( "\n" );

// Initialize a counter variable, though it appears unused in the current logic.
var      j     =     0;

// Main processing loop: continues indefinitely until a specific condition is met.
// This loop handles multiple test cases from the input.
while (     true     )
{
    // Extract the first value from the array, converting it to a number.
    // The `-0` trick ensures a numeric conversion, even if it's already a number.
    var      v     =      Arr . shift()     -     0;

    // Check for the termination condition: if the value is 0, break the loop.
    if (     v     ==     0     )
    {
        break; // Exit the while(true) loop.
    }


    /*
     * Read the next line, which contains coin counts separated by spaces.
     * Split it, and then map each string part to a Number.
     * These represent the initial number of available coins for 10, 50, 100, 500 units.
     */
    var      m     =      ( Arr . shift() ) . split( " " ) . map( Number );


    // Calculate the total money received from the customer based on available coins,
    // and then subtract the purchase amount 'v'. This is the change to be given.
    var      money     =      (     10     *     m[ 0 ]     +     50     *     m[ 1 ]     +     100     *     m[ 2 ]     +     500     *     m[ 3 ]     )     -     v;

    // Initialize an array 'M' to store the count of each coin denomination that will be returned as change.
    // M[0] for 10, M[1] for 50, M[2] for 100, M[3] for 500.
    var      M     =      [     0     ,     0     ,     0     ,     0     ];


    // Greedily calculate the number of 500-unit coins to return.
    while (     500     <=     money     )
    {
        M[ 3 ] ++;          // Increment count of 500-unit coins.
        money     -=     500;     // Decrease remaining change amount.
    }

    // Greedily calculate the number of 100-unit coins to return.
    while (     100     <=     money     )
    {
        M[ 2 ] ++;          // Increment count of 100-unit coins.
        money     -=     100;     // Decrease remaining change amount.
    }

    // Greedily calculate the number of 50-unit coins to return.
    while (     50     <=     money     )
    {
        M[ 1 ] ++;          // Increment count of 50-unit coins.
        money     -=     50;      // Decrease remaining change amount.
    }

    // Greedily calculate the number of 10-unit coins to return.
    while (     10     <=     money     )
    {
        M[ 0 ] ++;          // Increment count of 10-unit coins.
        money     -=     10;      // Decrease remaining change amount.
    }


    // Define an array holding the coin denominations for easy lookup.
    var      coin     =      [     10     ,     50     ,     100     ,     500     ];

    // Initialize an empty string to build the output.
    var      str     =      "";

    // Iterate through the initial coin counts 'm' (coins the customer gave).
    // Compare them with the coins 'M' returned as change.
    m . forEach (     function (     v     ,     i     )
    {
        // If the customer gave more of a specific coin type than was returned as change,
        // it means some of that coin type was kept by the store.
        if (     v     >     M[ i ]     )
        {
            // Append a line to the output string indicating the coin type and the number kept.
            str     +=     coin[ i ]     +     " "     +     (     v     -     M[ i ]     )     +     "\n";
        }
    }     );

    // Print the accumulated result string to the console.
    console . log(     str     );

    // Add an extra blank line between test case outputs for readability, if needed.
    // This part is an addition for visual difference.
    console . log ( "" );
}

/*
 * End of script.
 * This program efficiently calculates change and reports coin discrepancies.
 */