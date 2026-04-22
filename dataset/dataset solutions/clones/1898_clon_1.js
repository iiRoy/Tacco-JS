'use strict' ; /* Enforce strict mode for better code quality */


// This script reads input from standard input, processes it,
// and calculates a specific result based on tower heights and connections.

/**
 * Reads all input lines from /dev/stdin.
 * Each line is then split by newline character.
 * The first line is removed as it's typically metadata not needed for processing.
 */
const inputs = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . split ( '\n' ) ;

inputs . shift ( ) ; // Remove the initial line, often containing problem constraints or count.


// Parse the heights of the towers from the first remaining input line.
// Each height is converted to an integer.
const heights = inputs . shift ( ) . split ( ' ' ) . map ( v => parseInt ( v , 10 ) ) ;

// Initialize an array of arrays to represent the adjacency list for towers.
// Each tower will have an array to store its connected towers.
const towers = new Array ( heights . length )
    . fill ( )
    . map (
        _ =>
        {
            return [ ] ; // Initialize each element as an empty array
        }
    ) ;


// Process the remaining input lines to build the tower connections (adjacency list).
/*
 * For each line, split by space, convert to integer, and adjust to 0-based indexing.
 * Then, add bidirectional connections between the two towers.
 */
inputs . forEach (
    v =>
    {
        // Split the line and parse tower indices, adjusting for 0-based indexing.
        const splited = v . split ( ' ' ) . map ( w => parseInt ( w , 10 ) - 1 ) ;

        // Add connection from tower A to tower B
        towers [ splited [ 0 ] ] . push ( splited [ 1 ] ) ;

        // Add connection from tower B to tower A (undirected graph)
        towers [ splited [ 1 ] ] . push ( splited [ 0 ] ) ;
    }
) ;


// Initialize a counter for "good" towers.
let result = 0 ;

// Iterate through each tower and its connections to determine if it's a "good" tower.
/*
 * A tower is considered "good" if it has no connections,
 * or if all its connected towers are strictly shorter than itself.
 */
towers . forEach (
    ( t , i ) =>
    {
        // Assume the current tower is good initially.
        let good = true ;

        // Check if the tower has any connections.
        if ( t . length )
        {
            // If it has connections, iterate through each connected tower.
            t . forEach (
                t2 =>
                {
                    // If the current tower's height is less than or equal to a connected tower's height,
                    // then it's not a "good" tower.
                    if ( heights [ i ] <= heights [ t2 ] )
                    {
                        good = false ; // Mark as not good.
                    }
                }
            ) ;
        }

        // If after checking all connections (or if it had none), the tower is still "good",
        // increment the result counter.
        if ( good )
        {
            ++ result ; // Increment the count of good towers.
        }
    }
) ;

// Output the final count of "good" towers to the console.
console . log ( result ) ; // Display the computed result.