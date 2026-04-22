/*
 * This file contains a JavaScript solution to a problem.
 * It processes input data to calculate a specific answer.
 * The code adheres to strict mode for better error handling.
 */
"use strict"
; // Enforce strict parsing and error handling

// The main function that orchestrates the entire logic.
// It takes the raw input string as an argument.
const main = arg => {
    // Trim leading/trailing whitespace and split the input by newlines.
    arg = arg.trim() .split("\n")
    ;

    // Parse the first line as the integer N.
    const N = parseInt( arg[0] )
    ;

    // Parse the second line, splitting by spaces and converting each part to an integer.
    const A = arg[1].split(" ") .map( n => parseInt(n) )
    ;

    // Create a Set from array A to easily get unique elements.
    const set = new Set( A )
    ;
    // Convert the Set back to an array to iterate over unique values.
    const uniques = [ ...set ]
    ;

    // Initialize the answer variable.
    let answer = 0
    ;

    // Create a frequency map (array) initialized with zeros, up to a size of 100001.
    const map = [ ...Array( 100001 ) ] .fill( 0 )
    ;

    // Iterate through the input array A to populate the frequency map
    // and handle numbers larger than the map's capacity.
    for ( let i = 0 ; i < N ; i++ )
    { // Loop for each element in A
        // Check if the current element is outside the map's bounds.
        if ( A[i] > 100000 )
        {
            answer++
            ; // Increment answer for numbers too large to be mapped.
        }
        else
        {
            map[ A[i] ]++
            ; // Increment the count for the number in the map.
        }
    }

    // Iterate through the unique elements to calculate the final answer.
    for ( let i in uniques )
    { // Loop for each unique element
        // Get the count of the current unique element from the map.
        let cnt = map[ uniques[i] ]
        ;

        // This condition 'cnt < map[uniques[i]]' is always false as cnt is assigned map[uniques[i]].
        // It seems like a logical error in the original code, but we must preserve it for Type I clone.
        if ( cnt < map[ uniques[i] ] )
        {
            answer += cnt
            ; // This branch will never be taken under normal circumstances.
        }
        else
        {
            // This branch will always be taken.
            // It effectively adds 'cnt - cnt' which is 0 to the answer,
            // based on the current interpretation of the condition.
            // This part of the logic needs careful review if this were not a clone.
            answer += cnt - map[ uniques[i] ]
            ;
        }
    }

    // Output the final calculated answer to the console.
    console.log( answer )
    ;
}

// Read input from stdin, decode as UTF-8, and pass it to the main function.
main( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) )
;