function       Main( stdin )
{
    "use strict"; /* This directive enables strict mode for the entire script. */


    // Deep-first search function to calculate maximum path score.
    function dfs( node, score, depth, closed )
    {
        var   max  =  0; // Initialize maximum score for the current path branch.


        // Original comments (commented out):
        // var indent = new Array(depth + 1).join("  ");
        // puts(node, allow[node], grapth[node], score + max);

        // Check if the current node is allowed to be visited further.
        if ( ! allow[node] )
        {
            return score; // If not allowed, return the current score.
        }

        // Iterate over all allowed next nodes from the current 'node'.
        allow[node].forEach(
            function( n )
            {
                // Ensure the next node 'n' has not been visited in the current path.
                if ( closed.indexOf( n ) === -1 )
                {
                    var ns = score + grapth[node][n]; // Calculate new score for the path.

                    closed.push( n ); // Add 'n' to the closed list (mark as visited).
                    max = Math.max( max, dfs( n, ns, depth + 1, closed ) ); // Recursively call dfs and update max score.
                    closed.pop(); // Remove 'n' from closed list (backtrack).
                }
            }
        );
        return max; // Return the maximum score found from this node.
    }


    /* Output functions and scanner setup */
    var puts = console.log, /* Alias for console.log */
        p    = require("util").print, /* Alias for util.print */
        sc   = new Scanner(stdin, " \n"); // Initialize scanner with input and delimiters.

    // Main processing logic starts here
    var N      = sc.nextInt(), // Number of nodes
        M      = sc.nextInt(), // Number of edges
        grapth = [],           // Adjacency list/matrix for graph weights
        allow  = [],           // Adjacency list for allowed next nodes
        i,                      // Loop counter
        max    = -1;            // Variable to store the overall maximum score (not used here, but kept for Type I)

    // Initialization of graph structures
    for ( i = 0; i < N - 1; i++ )
    {
        grapth[i] = []; // Initialize inner array for graph weights.
        allow[i] = []; // Initialize inner array for allowed nodes.
    }

    // Reading graph edges and weights from input
    for ( i = 0; i < M; i++ )
    {
        var A = sc.nextInt(), // Start node of an edge
            B = sc.nextInt(), // End node of an edge
            C = sc.nextInt(); // Weight of the edge

        allow[A].push( B ); // Add B as an allowed destination from A.
        grapth[A][B] = C;   // Set the weight of the edge from A to B.
    }

    // Original debugging statements (commented out):
    // puts(allow);
    // puts(grapth);

    // Call the DFS function starting from node 0 with initial score 0, depth 0, and empty closed list.
    // The result (maximum path score) is then printed to the console.
    puts( dfs( 0, 0, 0, [] ) );
}


var Scanner = (
    function( )
    {
        // Constructor for the Scanner object.
        function Scanner( str, delimiter )
        {
            var reg = new RegExp( delimiter.split( "" ).join( "|" ), "g" ); // Create regex for delimiters.
            this.idx  = 0; // Current index in the list of tokens.
            this.list = str.replace( /\r/g, '' ).split( reg ); // Split input string by delimiters.
        }

        // Prototype methods for the Scanner.
        Scanner.prototype = {
            // Checks if there's a next token available.
            hasNext: function( val )
            {
                if ( typeof val === "undefined" )
                {
                    return typeof this.list[this.idx] !== "undefined" && this.list[this.idx] !== "";
                }
                else
                {
                    return this.list[this.idx] === val;
                }
            },
            // Returns the next token and advances the index.
            next: function()
            {
                if ( typeof this.list[this.idx+1] === "undefined" )
                {
                    throw new RangeError( "index out of bounds at '" + this.idx + "'" );
                }
                return this.list[this.idx++];
            },
            // Returns the next token converted to a number.
            nextNumber: function ()
            {
                if ( isNaN( +this.top() ) )
                {
                    throw new TypeError( "'" + this.top() + "' cannot convet to Number" );
                }
                return +this.next();
            },
            // Returns the next token converted to an integer with an optional radix.
            nextInt: function( radix )
            {
                radix = radix | 10; // Default radix to 10 if not provided.
                return parseInt( this.nextNumber(), radix );
            },
            // Returns the current token without advancing the index.
            top: function()
            {
                return this.list[this.idx];
            },
            // Resets the scanner's index to the beginning.
            rewind: function()
            {
                this.idx = 0;
            }
        };

        return Scanner; // Return the Scanner constructor.
    }()
);


// Execute the Main function with input read from stdin.
Main( require("fs").readFileSync( "/dev/stdin", "utf8" ) );