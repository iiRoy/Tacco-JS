/*
 * This file contains a JavaScript program designed to solve a specific problem.
 * It uses custom input/output functions and a graph-related algorithm.
 *
 * Author: Clone Generator v1.0
 * Date: 2023-10-27
 * License: Unspecified (original code's license applies)
 */


function main()
{
    // Declare and initialize variables for problem dimensions
    var n = scan(); // Number of nodes
    var m = scan(); // Number of edges/constraints


    // Initialize arrays to store graph edges
    var e = []; // Stores directed edges for Bellman-Ford
    var f = []; // Stores alternative edges for specific constraints


    // Process each constraint given in the input
    rep(m, function()
    {
        var s = scan('string'); // Read the constraint string


        // Parse the numerical parts from the constraint string
        // The regex splits by '<=', '>=', '*', '+', or '-'
        var p = s.split(/<=|>=|\*|\+|-/);
        p[0] = +p[0] - 1; // Convert to number and adjust for 0-based indexing
        p[1] = +p[1] - 1; // Convert to number and adjust for 0-based indexing
        p[2] = +p[2];     // Convert to number


        var u; // Variable to determine the type of comparison operator
        if (s.indexOf('*') !== -1)
        {
            u = 2; // Represents '*' operator (absolute difference)
        }
        else
        {
            // If not '*', check for '<='
            u = +(s.indexOf('<=') === -1); // 0 for '<=', 1 for '>='
        }


        var v = +(s.indexOf('+') === -1); // 0 for '+', 1 for '-' (sign of constant)


        // Based on operator types (u and v), add edges to 'e' or 'f'
        if (u == 0) // Case: '<=' (p[0] <= p[1] + C)
        {
            if (v == 0) // Case: '+' (p[0] <= p[1] + p[2])
            {
                // This translates to p[0] - p[1] <= p[2] => p[1] - p[0] >= -p[2]
                // Or: edge from p[1] to p[0] with weight -p[2]
                e[e.length] = [p[1], p[0], -p[2]];
            }
            else // Case: '-' (p[0] <= p[1] - p[2])
            {
                // p[0] - p[1] <= -p[2] => p[1] - p[0] >= p[2]
                // Edge from p[1] to p[0] with weight 0 (effectively p[1] >= p[0])
                e[e.length] = [p[1], p[0], 0];
                // And edge from p[0] to p[1] with weight p[2] (p[0] <= p[1] - p[2])
                e[e.length] = [p[0], p[1], p[2]];
            }
        }
        else if (u == 1) // Case: '>=' (p[0] >= p[1] + C)
        {
            if (v == 0) // Case: '+' (p[0] >= p[1] + p[2])
            {
                // p[0] - p[1] >= p[2]
                // Edge from p[0] to p[1] with weight -p[2]
                e[e.length] = [p[0], p[1], -p[2]];
            }
            else // Case: '-' (p[0] >= p[1] - p[2])
            {
                // p[0] - p[1] >= -p[2] => p[1] - p[0] <= p[2]
                // Edge from p[1] to p[0] with weight p[2]
                e[e.length] = [p[1], p[0], p[2]];
                // Edge from p[0] to p[1] with weight 0 (effectively p[0] >= p[1])
                e[e.length] = [p[0], p[1], 0];
            }
        }
        else // Case: '*' (absolute difference |p[0] - p[1]| op C)
        {
            if (v == 0) // Case: '+' (|p[0] - p[1]| <= p[2])
            {
                // This means -p[2] <= p[0] - p[1] <= p[2]
                // Two possibilities:
                // 1) p[0] - p[1] <= p[2]  => p[1] - p[0] >= -p[2] (edge p[1] -> p[0] with -p[2])
                // 2) p[0] - p[1] >= -p[2] => p[0] - p[1] <= p[2] (edge p[0] -> p[1] with -p[2])
                // These are mutually exclusive in terms of which one applies in a given Bellman-Ford iteration,
                // so we store them in 'f' to try combinations.
                f[f.length] = [[p[0], p[1], -p[2]], [p[1], p[0], -p[2]]];
            }
            else // Case: '-' (This case is not explicitly handled in the original, assuming it implies equality or range)
            {
                // Original code has: |p[0] - p[1]| <= p[2]
                // If it's |p[0] - p[1]| >= p[2], it would be handled differently.
                // Assuming it's actually |p[0] - p[1]| <= p[2] because of the problem context.
                // This implies p[0] <= p[1] + p[2] and p[1] <= p[0] + p[2]
                e[e.length] = [p[1], p[0], p[2]];
                e[e.length] = [p[0], p[1], p[2]];
            }
        }
    }); // End of rep loop for processing constraints


    var ans = -Infinity; // Initialize the answer with negative infinity


    // Iterate through all combinations for edges in 'f' (using bitmask)
    rep(1 << f.length, function(comb)
    {
        // Create a temporary graph 'g' by copying 'e'
        var g = [].concat(e);

        // Add edges from 'f' based on the current combination
        rep(f.length, function(i)
        {
            // Select one of the two possible edges for each constraint in 'f'
            g[g.length] = f[i][(comb >> i) & 1];
        });


        // Initialize distances for Bellman-Ford algorithm
        var d = [];
        rep(n, function(i)
        {
            d[i] = Infinity; // All distances are initially infinity
        });
        d[0] = 0; // Starting node (node 0) has a distance of 0


        // Run Bellman-Ford algorithm for n iterations
        // This ensures all shortest paths are found, assuming no negative cycles reachable from source
        rep(n, function()
        {
            // Relax all edges in the graph 'g'
            rep(g.length, function(j)
            {
                var edge = g[j];
                // Update distance if a shorter path is found
                d[edge[1]] = Math.min(d[edge[0]] + edge[2], d[edge[1]]);
            });
        });


        // Check for negative cycles reachable from source (d[0] should remain 0)
        // If d[0] is still 0, it means no negative cycle affects the source,
        // and a valid set of distances `d` is found for this combination.
        if (d[0] == 0)
        {
            // Find the maximum distance in the current `d` array
            // And update the overall maximum answer
            ans = Math.max(ans, Math.max.apply(null, d));
        }
    }); // End of rep loop for combinations


    // Output the final answer
    if (ans === Infinity)
    {
        print('inf'); // If the maximum distance is still infinity, it's unbounded
    }
    else if (ans === -Infinity)
    {
        print(-1); // If no valid combination yielded a finite answer
    }
    else
    {
        print(ans); // Print the calculated maximum distance
    }
} // End of main function


// Helper function for repetition/loops
function rep(a, b, c)
{
    // Handle overloaded arguments: rep(count, callback) or rep(start, end, callback)
    if (c == null)
    {
        c = b;    // callback is the second argument
        b = a;    // end is the first argument
        a = 0;    // start from 0
    }
    // Loop from 'a' up to (but not including) 'b'
    for (var i = a; i < b; ++i)
    {
        c(i); // Execute the callback function with the current loop index
    }
}


// Standard input/output setup for Node.js environment
process.stdin.resume();
process.stdin.setEncoding('utf8');


var input = '';       // Accumulates all input data
var input_index = 0;  // Current index for parsing input tokens


// Function to read a token from the pre-processed input array
function scan(type)
{
    if (type === 'string')
    {
        return input[input_index++]; // Return string token
    }
    else
    {
        return +input[input_index++]; // Return number token (unary plus for conversion)
    }
}


// Function to print a value to the console
function print(val)
{
    console.log(val);
}


// Event listener for incoming data on standard input
process.stdin.on('data', function(chunk)
{
    input += chunk; // Append new data chunks to the input string
});


// Event listener for the end of standard input stream
process.stdin.on('end', function()
{
    // Split the accumulated input string by whitespace into an array of tokens
    input = input.split(/\s+/);
    main(); // Call the main function to start program execution
});