function Main(stdin)   {
        "use strict" ; // Enforce strict mode for cleaner code.


        // Recursive Depth-First Search function definition.
        function dfs( node , score , depth )
            {
                var max = 0 ; // Initialize maximum score for the current path.

                // If the current node has no outgoing allowed connections,
                // return the accumulated score for this path.
                if ( ! allow[node] )
                    {
                        return score ;
                    }

                // Iterate over all allowed neighbors of the current node.
                allow[node] . forEach ( function (n)
                    {
                        // Check if the path from 'node' to 'n' has not been processed yet.
                        if ( ! closed[node][n] )
                            {
                                // Calculate the new score for the path including the edge (node, n).
                                var ns = score + grapth[node][n] ;

                                // Recursively call dfs for the neighbor 'n', updating closed paths.
                                closed[node][n] = dfs ( n , ns , depth + 1 , closed ) ;
                            }

                        // Update the maximum score found so far among all paths from this node.
                        max = Math.max ( max , closed[node][n] ) ;
                    }
                ) ;
                return max ; // Return the maximum score from this node.
            }


        // Setup console output functions and input scanner.
        var puts = console.log , // Alias for console.log for convenience.
            p    = require("util").print , // Alias for util.print (not used in this specific code but often present).
            sc   = new Scanner(stdin , " \n") ; // Initialize scanner with input string and delimiters.


        // Main logic starts here.
        // Declare and initialize variables for graph processing.
        var N        = sc.nextInt() , // Number of nodes.
            M        = sc.nextInt() , // Number of edges.
            grapth   = []           , // Adjacency matrix/list for edge weights.
            allow    = []           , // Adjacency list for allowed connections.
            closed   = []           , // Memoization table for DFS results.
            i                       , // Loop counter.
            max      = -1           ; // Variable to store the overall maximum path score (unused here, dfs returns it).


        // Initialize graph structures.
        // Note: The loop runs N-1 times, which might be a specific requirement
        // or an oversight if N represents the total number of nodes from 0 to N-1.
        for ( i = 0 ; i < N - 1 ; i++ )
            {
                grapth[i] = [] ; // Initialize inner array for weights.
                allow[i]  = [] ; // Initialize inner array for allowed neighbors.
                closed[i] = [] ; // Initialize inner array for memoization.
            }


        // Read graph edges from input.
        for ( i = 0 ; i < M ; i++ )
            {
                var A = sc.nextInt() , // Starting node of the edge.
                    B = sc.nextInt() , // Ending node of the edge.
                    C = sc.nextInt() ; // Weight of the edge.

                allow[A] . push ( B ) ; // Add B to the list of allowed neighbors for A.
                grapth[A][B] = C ;     // Set the weight of the edge from A to B.
            }

        // Debugging lines commented out.
        // puts(allow);
        // puts(grapth);

        // Start DFS from node 0 with initial score 0 and depth 0.
        // The 'closed' parameter is passed, but the function uses the global 'closed' variable.
        puts ( dfs ( 0 , 0 , 0 , closed ) ) ;
    }

// Scanner utility class for parsing input.
var Scanner = ( function ( )
    {
        // Scanner constructor.
        function Scanner ( str , delimiter )
            {
                // Create a regular expression from the delimiter string.
                var reg = new RegExp ( delimiter . split ( "" ) . join ( "|" ) , "g" ) ;
                this.idx  = 0 ; // Current index in the token list.
                // Replace carriage returns and split the input string by delimiters.
                this.list = str . replace ( /\r/g , '' ) . split ( reg ) ;
            }

        // Scanner prototype methods.
        Scanner . prototype =
            {
                // Checks if there's a next token, optionally matching a specific value.
                hasNext : function ( val )
                    {
                        if ( typeof val === "undefined" )
                            {
                                // If no value is specified, check if the current token exists and is not empty.
                                return typeof this.list[this.idx] !== "undefined" && this.list[this.idx] !== "" ;
                            }
                        else
                            {
                                // If a value is specified, check if the current token matches it.
                                return this.list[this.idx] === val ;
                            }
                    } ,
                // Returns the next token and advances the index.
                next : function ( )
                    {
                        // Check for out-of-bounds access.
                        if ( typeof this.list[this.idx+1] === "undefined" )
                            {
                                throw new RangeError ( "index out of bounds at '" + this.idx + "'" ) ;
                            }
                        return this.list[this.idx++] ; // Return current token and increment index.
                    } ,
                // Returns the next token converted to a number.
                nextNumber : function ( )
                    {
                        // Validate if the current token can be converted to a number.
                        if ( isNaN ( +this.top() ) )
                            {
                                throw new TypeError ( "'" + this.top() + "' cannot convet to Number" ) ;
                            }
                        return +this.next() ; // Convert and return the next token as a number.
                    } ,
                // Returns the next token converted to an integer with a specified radix.
                nextInt : function ( radix )
                    {
                        radix = radix | 10 ; // Default radix to 10 if not provided.
                        return parseInt ( this.nextNumber() , radix ) ; // Parse the number as an integer.
                    } ,
                // Returns the current token without advancing the index.
                top : function ( )
                    {
                        return this.list[this.idx] ;
                    } ,
                // Resets the scanner index to the beginning.
                rewind : function ( )
                    {
                        this.idx = 0 ;
                    }
            } ;

        return Scanner ; // Return the Scanner constructor.
    }
( ) ) ; // Immediately-invoked function expression (IIFE) for Scanner definition.

// Read input from /dev/stdin and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;