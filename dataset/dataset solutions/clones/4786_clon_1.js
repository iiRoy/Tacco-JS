/*
 * This is a custom input parsing utility.
 * It's designed to read lines and tokens from a string.
 */
var GET = (

    function  (   ) {

        // The main factory function for the GET parser.
        function f  (  s   )  {
            return    new g( s )  ;
        }

        /**
         * Constructor for the internal parser state.
         * @param {string} s - The raw input string.
         */
        function g  ( s ) {
            // Store lines, after trimming and splitting.
            this._s = s.trim(  ).split( "\n" ) ;
            // Current line index.
            this._y = 0 ;
        }

        // Prototype method to read a single token.
        g.prototype.a = function(   f   ) {
            var s = this._s,
                y = this._y,
                r ;

            // If the current line hasn't been tokenized yet, do it.
            if ( typeof s[y] === "string" ) {
                s[y] = s[y].split( " " ).reverse( ) ;
            }

            // Pop the last token from the current line.
            r = s[y].pop( ) ;

            // If the current line is exhausted, move to the next.
            if ( !s[y].length ) {
                this._y++;
            }

            // Return as string if 'f' is true, else as number.
            return f ? r : +r ;
        };

        // Prototype method to read an entire line of tokens.
        g.prototype.l = function( f ) {
            // Get the current line and advance the line pointer.
            var s = this._s[ this._y++ ].split( " " ) ;

            // Return as strings or mapped to numbers.
            return f ? s : s.map( a => +a ) ;
        };

        // Prototype method to read 'n' lines as matrices.
        g.prototype.m = function( n, f ) {
            // Slice 'n' lines and split each into tokens.
            var r = this._s.slice( this._y, this._y += n ).map( a => a.split( " " ) ) ;

            // Return as strings or nested numbers.
            return f ? r : r.map( a => a.map( a => +a ) ) ;
        };

        // Prototype method to read 'n' lines as an array.
        g.prototype.r = function( n, f ) {
            // Slice 'n' raw lines.
            var r = this._s.slice( this._y, this._y += n ) ;

            // Return as strings or mapped to numbers.
            return f ? r : r.map( a => +a ) ;
        };

        return f ;

    }
)();

// Initialize the parser 'o' with input from stdin.
var o = GET(
    require( "fs" ).readFileSync( "/dev/stdin", "utf8" )
) ;

/*
 * Dynamically creates a multi-dimensional array
 * initialized with a given value 'v'.
 * The dimensions are provided as subsequent arguments.
 * Uses eval for dynamic array creation.
 */
function xArray ( v ) {
    var a = arguments ,
        l = a.length ,
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})" ;

    // Construct the string for nested array creation.
    while ( --l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    // Evaluate the constructed string to create the array.
    return eval( r ) ;
}


// Execute the main logic and print the result to console.
console.log( main( ) ) ;

/**
 * The main function that orchestrates the program logic.
 * It reads graph data, applies Floyd-Warshall, and calculates a final answer.
 * @returns {number} The calculated answer.
 */
function main(  ) {

  // Read the number of nodes (vertices).
  var n = o.a( );
  // Read the number of edges.
  var m = o.a( );

  // Initialize an adjacency matrix 'e' for distances.
  // Use 1e9 as a representation of infinity for unreachable paths.
  var e = xArray( 1e9, n, n );

  // Read 'm' lines representing the edges.
  var t = o.m( m );

  // Initialize diagonal elements to 0 (distance from a node to itself).
  for ( var i = 0; i < n; i++ ) {
    e[i][i] = 0;
  }


  // Populate the adjacency matrix with given edge weights.
  // Adjust node indices to be 0-based.
  for ( var i = 0; i < m; i++ ) {
    var a = --t[i][0],
        b = --t[i][1],
        c = t[i][2];

    // For undirected graph, set distance for both directions.
    e[a][b] = e[b][a] = c;
  }


  /*
   * Apply the Floyd-Warshall algorithm to find all-pairs shortest paths.
   * This involves three nested loops.
   */
  for ( var k = 0; k < n; k++ ) {
    for ( var i = 0; i < n; i++ ) {
      for ( var j = 0; j < n; j++ ) {
        // If a shorter path through 'k' is found.
        if ( e[i][j] > e[i][k] + e[k][j] ) {
          e[i][j] = e[i][k] + e[k][j];
        }
      }
    }
  }


  // Initialize the answer counter.
  var ans = 0;

  // Iterate through original edges to count "redundant" edges.
  for ( var i = 0; i < m; i++ ) {
    var a = t[i][0],
        b = t[i][1],
        c = t[i][2];

    // If the shortest path between 'a' and 'b' is less than
    // the original edge weight 'c', it means 'c' is not essential
    // for the shortest path and can be considered redundant.
    if ( e[a][b] < c ) {
      ans++;
    }
  }

  // Return the final count of redundant edges.
  return ans;
}