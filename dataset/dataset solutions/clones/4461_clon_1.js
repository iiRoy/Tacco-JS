// Enforce strict mode for cleaner code execution.
"use strict";


/*
 * This is the main entry point of the program.
 * It processes the input argument.
 */
const main = arg =>
{

    // Pre-process the input string: trim whitespace and split by newline.
    arg = arg .trim() .split ( "\n" );


    // Parse N and M from the first line of the input.
    // N: The total number of nodes.
    const N = parseInt ( arg [ 0 ] .split ( " " ) [ 0 ] );
    // M: The total number of edges.
    const M = parseInt ( arg [ 0 ] .split ( " " ) [ 1 ] );


    // Extract the 'ab' array representing edges from the input.
    // Each element in 'ab' is a string "from to".
    const ab = arg .slice ( 1, M + 1 );


    // Initialize a 'map' array of size N, filled with zeros.
    // This map will store counts related to paths.
    let map = [ ...Array ( N ) ] .fill ( 0 );


    // Initialize the answer as "IMPOSSIBLE".
    // It will be changed to "POSSIBLE" if a valid path is found.
    let answer = "IMPOSSIBLE";


    // Loop through each edge to determine if a path exists from 1 to N.
    for ( let i = 0; i < M; i++ )
    {

        // Parse the current edge's 'from' and 'to' nodes.
        let temp = ab [ i ] .split ( " " ) .map ( n => parseInt ( n ) );
        let from = temp [ 0 ]; // Starting node of the current edge.
        let to = temp [ 1 ];   // Ending node of the current edge.


        // Check if the current edge starts from node 1.
        if ( from === 1 )
        {
            // If node 'to' has already reached N in its path count,
            // it means a path from 1 to N is possible.
            if ( map [ to ] === N )
            {
                answer = "POSSIBLE"; // Set answer and break the loop.
                break;
            }
            else
            {
                // Increment the path count for node 'to'.
                map [ to ]++;
            }
        }


        // Check if the current edge ends at node N.
        if ( to === N )
        {
            // If node 'from' has a path count of 1,
            // it means a path from 1 to N is possible.
            if ( map [ from ] === 1 )
            {
                answer = "POSSIBLE"; // Set answer and break the loop.
                break;
            }
            else
            {
                // Increment the path count for node 'from'.
                map [ from ]++;
            }
        }

    }


    // Output the final answer to the console.
    console .log ( answer );

};


// Read input from standard input and pass it to the main function.
main ( require ( 'fs' ) .readFileSync ( '/dev/stdin', 'utf8' ) );