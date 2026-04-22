/*
 * This JavaScript file contains the implementation for a problem solution.
 * It features a custom input parsing class to streamline data acquisition.
 * The core logic involves sorting two sets of coordinate pairs and then
 * finding optimal matches based on specific criteria.
 */

"use strict"; // This directive enables strict mode, which helps in writing cleaner code
              // by catching common coding errors and "unsafe" actions.


// The main function, serving as the entry point for program execution.
// It takes the raw input string as its sole argument.
function Main ( input )
{
    // Initialize an instance of the Inputer class to handle parsing of input data.
    let cin = new Inputer(input);


    // Read the first integer from the input, which defines the number of elements (N).
    let N = cin.getInt();

    // Declare and initialize two arrays, 'R' and 'B', each designed to hold 'N' elements.
    // These arrays will store coordinate pairs, likely representing points.
    let R = new Array( N );
    let B = new Array( N );


    // Loop to populate the array 'R' with 'N' pairs of integers.
    // Each pair [x, y] is read sequentially from the input.
    for ( let r = 0 ; r < N ; r++ )
    {
        R[r] = [ cin.getInt() , cin.getInt() ]; // Assigns a pair of integers to the current index.
    }

    // Loop to populate the array 'B' with 'N' pairs of integers, similar to array 'R'.
    for ( let b = 0 ; b < N ; b++ )
    {
        B[b] = [ cin.getInt() , cin.getInt() ]; // Another pair of integers is assigned.
    }


    /*
     * Defines a comparison function used for sorting arrays of coordinate pairs.
     * It prioritizes sorting by the first element (x-coordinate).
     * If x-coordinates are equal, it then sorts by the second element (y-coordinate).
     */
    const sortFunc = ( a , b ) => a[0] == b[0] ? a[1] - b[1] : a[0] - b[0] ;

    // Sort the array 'R' using the custom comparison function 'sortFunc'.
    R.sort( sortFunc );

    // Sort the array 'B' using the same custom comparison function.
    B.sort( sortFunc );


    // Initialize a variable to store the final answer (count of successful matches).
    let ans = 0;

    // Outer loop: Iterate through each element in the 'R' array.
    for ( let r = 0 ; r < N ; r++ )
    {
        // If the current element in 'R' has already been matched (marked as undefined), skip it.
        if ( R[r] == undefined )
        {
            continue; // Move to the next element in 'R'.
        }

        // Inner loop: Iterate through each element in the 'B' array.
        for ( let b = 0 ; b < N ; b++ )
        {
            // If the current element in 'B' has already been matched, skip it.
            if ( B[b] == undefined )
            {
                continue; // Move to the next element in 'B'.
            }

            // Check the matching condition:
            // R's x-coordinate must be strictly less than B's x-coordinate,
            // AND R's y-coordinate must be strictly less than B's y-coordinate.
            if ( R[r][0] < B[b][0] && R[r][1] < B[b][1] )
            {
                // If a match is found, mark both matched elements as undefined to prevent
                // them from being matched again.
                B[b] = undefined;
                R[r] = undefined;

                // Increment the counter for successful matches.
                ans++;

                // Break out of the inner loop because R[r] has found its match,
                // and we don't need to check it against other B elements.
                break;
            }
        }
    }

    // Output the final computed answer to the console.
    console.log( ans );
}


// A utility class designed to simplify reading various data types from a string input.
class Inputer
{
    /**
     * The constructor for the Inputer class.
     * @param {string} t - The complete input string, typically received from standard input.
     * @throws {Error} If the input string 't' is not provided.
     */
    constructor( t )
    {
        // Validate that the input string 't' is not undefined.
        if ( typeof t == 'undefined' )
        {
            throw new Error('引数（stdin）を省略できません！'); // Error message in Japanese.
        }

        // Initialize a counter to keep track of the current position in the input items.
        this.cnt = 0;

        // Split the input string into an array of individual items using newline or space as delimiters.
        this.items = t.split( /\n|\s/ );
    }

    /**
     * Reads and returns the next integer from the input stream.
     * It automatically advances the internal counter.
     * @returns {number} The parsed integer value.
     */
    getInt()
    {
        // Convert the current string item to a number and then increment the counter.
        return this.items[this.cnt++] - 0;
    }

    /**
     * Reads a specified number of integers from the input and returns them as an array.
     * @param {number} t - The quantity of integers to read.
     * @returns {number[]} An array containing the parsed integers.
     * @throws {Error} If the count 't' is not provided.
     */
    getIntArray( t )
    {
        // Validate that the count 't' is provided.
        if ( typeof t == 'undefined' )
        {
            throw new Error('引数（1以上）を省略できません！'); // Error message.
        }

        // Create a new array to store the integers.
        let r = new Array( t );

        // Loop to read 't' integers and populate the array.
        for ( let e = 0 ; e < t ; e++ )
        {
            r[e] = this.getInt(); // Call getInt() for each element.
        }

        return r;
    }

    /**
     * Reads and returns the next string item from the input stream.
     * It automatically advances the internal counter.
     * @returns {string} The next string value.
     */
    getStr()
    {
        // Return the current string item and then increment the counter.
        return this.items[this.cnt++];
    }

    /**
     * Reads a specified number of strings from the input and returns them as an array.
     * @param {number} t - The quantity of strings to read.
     * @returns {string[]} An array containing the parsed strings.
     * @throws {Error} If the count 't' is not provided.
     */
    getStrArray( t )
    {
        // Validate that the count 't' is provided.
        if ( typeof t == 'undefined' )
        {
            throw new Error('引数（1以上）を省略できません！'); // Error message.
        }

        // Create a new array to store the strings.
        let r = new Array( t );

        // Loop to read 't' strings and populate the array.
        for ( let e = 0 ; e < t ; e++ )
        {
            r[e] = this.getStr(); // Call getStr() for each element.
        }

        return r;
    }
}

// This conditional block determines the execution environment.
// If the code is running outside of a web browser (e.g., in Node.js),
// it reads input from standard input and passes it to the Main function.
if ( typeof window == "undefined" )
{
    // Dynamically import the 'fs' (file system) module, which is available in Node.js.
    const fileSystem = require("fs");

    // Define the path for standard input.
    const standardInputPath = "/dev/stdin";

    // Specify the encoding for reading the file.
    const fileEncoding = "utf8";

    // Read the entire content of the standard input file synchronously
    // and then invoke the Main function with this content.
    Main( fileSystem.readFileSync( standardInputPath , fileEncoding ) );
}
// End of JavaScript file.