/*
 * This JavaScript code processes input data to perform
 * some kind of graph-like component analysis or union-find operation.
 * It reads from standard input, parses numbers, and manipulates
 * a 'map' array of objects.
 *
 * Author: Code Clone Generator v1.0
 * Date: 2023-10-27
 * Purpose: Demonstrate Type I code cloning by altering only whitespace and comments.
 */

const input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ; // Read all input data synchronously from stdin.

const lines = input . split ( '\n' ) ; /* Split the input string by newline characters
                                         to get an array of individual lines. */

// Parse the first line to get N and M, converting them to numbers.
let [ N , M ] = lines [ 0 ] . split ( ' ' ) . map ( Number ) ;

const map = [ ] ; // Initialize an empty array to store the 'areas' or components.

/*
 * This is the main processing loop.
 * It iterates from 1 up to M (inclusive), processing each subsequent line of input.
 */
for ( let i = 1 ; i <= M ; i++ )
{
    // For each line, parse two numbers A and B, representing a connection.
    const [ A , B ] = lines [ i ] . split ( ' ' ) . map ( Number ) ;

    let findA = null ; // Flag to store the index of the component A belongs to.
    let findB = null ; // Flag to store the index of the component B belongs to.

    // Iterate through the existing 'map' (components) to find A and B.
    for ( let i = 0 ; i < map . length ; i++ ) {

        /*
         * Check if the current component 'map[i]' contains 'A'.
         * If 'A' is found, update findA and potentially add 'B' to this component.
         */
        if ( map [ i ] [ A ] ) {

            findA = i ; // A is found in this component.

            // If B is not already in this component, add it and increment the count.
            if ( ! map [ i ] [ B ] ) {
                map [ i ] . count++ ; // Increment the count of elements in this component.
                map [ i ] [ B ] = true ; // Mark B as part of this component.
            }

        } else if ( map [ i ] [ B ] ) { /* If A wasn't found, check if the current
                                          component 'map[i]' contains 'B'. */

            findB = i ; // B is found in this component.

            // If A is not already in this component, add it and increment the count.
            if ( ! map [ i ] [ A ] ) {
                map [ i ] . count++ ; // Increment the count of elements in this component.
                map [ i ] [ A ] = true ; // Mark A as part of this component.
            }
        }
    }

    /*
     * After checking all existing components:
     * Case 1: Neither A nor B were found in any existing component.
     * This means A and B form a brand new component together.
     */
    if ( findA === null && findB === null ) {

        const area = {
            count : 2 /* Initial count is 2, as both A and B are in this new component. */
        } ;

        area [ A ] = true ; // Mark A as present in this new component.
        area [ B ] = true ; // Mark B as present in this new component.

        map . push ( area ) ; // Add the newly created component to the 'map' array.

    } else if ( findA !== findB ) { /* Case 2: A and B were found in *different* components.
                                      This implies a merge operation is needed. */

        // Create a new merged component by combining properties from both existing components.
        const merge = {
            ... map [ findA ] , // Spread properties from the component containing A.
            ... map [ findB ] , // Spread properties from the component containing B.
            count : map [ findA ] . count + map [ findB ] . count - 2 // Adjust the count for the merge.
        } ;

        /*
         * Replace the component at 'findA' with the new 'merge' component.
         * The '1' indicates that one element should be removed starting from 'findA'.
         */
        map . splice ( findA , 1 , merge ) ;

        /*
         * Remove the component at 'findB' (which is now redundant or has been merged).
         * Note: If findB was greater than findA, its index might have shifted by -1 due to the previous splice.
         * The original code seems to assume findA and findB are distinct and handles replacement/removal order carefully.
         */
        map . splice ( findB ) ; // This splice variant removes all elements from findB to the end. This is a bug in the original code, but Type I clone must preserve it.
    }
}

let c = 0 ; // Initialize a counter 'c'.

// Sum up the 'count' property of all components remaining in the 'map'.
for ( let i = 0 ; i < map . length ; i++ ) {
    c += map [ i ] . count ; // Add the count of each component to 'c'.
}

/*
 * Finally, log the calculated result to the console.
 * The formula seems to be (number of components) + N - (total elements in components) - 1.
 */
console . log ( map . length + N - c - 1 ) ;