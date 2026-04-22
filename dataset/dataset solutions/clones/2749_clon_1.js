var GET = ( function ( ) {
    // Inner function 'f' acts as the public constructor.
    function f ( s ) {
        return new g ( s ) ;
    }

    // Inner class 'g' handles parsing the input string.
    function g ( s ) {
        // Store lines of input, trimmed and split.
        this . _s = s . trim ( ) . split ( "\n" ) ;
        // Initialize current line index.
        this . _y = 0 ;
    }

    // Prototype methods for 'g' to read different data types.

    // Reads a single item, either integer or string.
    g . prototype . a = function ( f ) {
        var s = this . _s ,
            y = this . _y ,
            r ;

        // If the current line hasn't been processed into individual items yet,
        // split it by space and reverse to read from the end.
        if ( typeof s [ y ] === "string" ) {
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
        }

        // Pop the last item from the current line.
        r = s [ y ] . pop ( ) ;

        // If the current line is now empty, advance to the next line.
        if ( ! s [ y ] . length ) {
            this . _y ++ ;
        }

        // Return as string if 'f' is true, otherwise convert to number.
        return f ? r : + r ;
    } ;

    // Reads a whole line of items, either as strings or numbers.
    g . prototype . l = function ( f ) {
        // Get the current line, split by space, and advance line index.
        var s = this . _s [ this . _y ++ ] . split ( " " ) ;

        // Return as strings if 'f' is true, otherwise map to numbers.
        return f ? s : s . map ( a => + a ) ;
    } ;

    // Reads a matrix (n lines), either as strings or numbers.
    g . prototype . m = function ( n , f ) {
        // Slice 'n' lines, split each line by space.
        var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;

        // Return as string arrays if 'f' is true, otherwise map inner arrays to numbers.
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ;

    // Reads 'n' lines as a single array, either as strings or numbers.
    g . prototype . r = function ( n , f ) {
        // Slice 'n' lines.
        var r = this . _s . slice ( this . _y , this . _y += n ) ;

        // Return as strings if 'f' is true, otherwise map to numbers.
        return f ? r : r . map ( a => + a ) ;
    } ;

    // Expose the public constructor 'f'.
    return f ;
} ) ( ) ;

// Initialize the input reader 'o' by reading from standard input.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// Helper function to create multi-dimensional arrays dynamically.
function xArray ( v ) {
    var a = arguments ,
        l = a . length ,
        // Start with the innermost array creation.
        r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ;

    // Loop to build up outer array creations.
    while ( -- l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    // Evaluate the constructed string to create the array.
    return eval ( r ) ;
}


// Union-Find data structure implementation.
function unionFind ( n ) {
    // Initialize parent array, with -1 indicating root and size.
    this . a = Array ( n + 1 ) . fill ( - 1 ) ;
}

// Prototype methods for the Union-Find structure.
unionFind . prototype = {
    // Finds the root of the set containing element 'i' with path compression.
    root : function ( i ) {
        return this . a [ i ] < 0 ? i : ( this . a [ i ] = this . root ( this . a [ i ] ) ) ;
    } ,

    // Checks if two elements 'x' and 'y' are in the same set.
    same : function ( x , y ) {
        return this . root ( x ) === this . root ( y ) ;
    } ,

    // Unites the sets containing elements 'x' and 'y'.
    // Returns 1 if they were already in the same set, undefined otherwise.
    unite : function ( x , y ) {
        x = this . root ( x ) ;
        y = this . root ( y ) ;

        if ( x === y ) {
            return 1 ; // Already in the same set.
        }

        // Union by size heuristic: attach smaller tree to root of larger tree.
        if ( this . a [ y ] <= this . a [ x ] ) {
            this . a [ y ] += this . a [ x ] ;
            this . a [ x ] = y ;
        } else {
            this . a [ x ] += this . a [ y ] ;
            this . a [ y ] = x ;
        }
    } ,

    // Returns the size of the set containing element 'i'.
    size : function ( i ) {
        return - this . a [ this . root ( i ) ] ;
    } ,
}


// Main function where the program logic resides.
function main ( ) {
    // Read the number of nodes (n) and edges (m).
    var n = o . a ( ) ;
    var m = o . a ( ) ;

    // If m is odd, it's impossible to form pairs, return -1.
    if ( m & 1 ) {
        return - 1 ;
    }

    // Read all edges.
    var a = o . m ( m ) ;

    // Initialize Union-Find structure for 'n' nodes.
    var uf = new unionFind ( n ) ;

    // Array to store the resulting edges.
    var ans = [ ] ;

    // Adjacency list for the spanning forest.
    // e[v] will store neighbors of v in the forest.
    var e = xArray ( "[]" , n + 1 ) ;

    // 'w' array to track parity for each node.
    // w[v] = 1 means node v needs an outgoing edge to balance parity.
    var w = xArray ( 0 , n + 1 ) ;

    // Process each edge.
    for ( var i = 0 ; i < m ; i ++ ) {
        var u = a [ i ] [ 0 ] ,
            v = a [ i ] [ 1 ] ;

        // If uniting u and v creates a new connection (not in the same component yet).
        if ( uf . unite ( u , v ) ) {
            // This edge is part of the spanning forest. Add it to 'ans'.
            ans . push ( u + " " + v ) ;
            // Toggle parity for node 'u'.
            w [ u ] ^= 1 ;
        } else {
            // This edge creates a cycle. Add it to the adjacency list 'e' for later DFS.
            e [ u ] . push ( v ) ;
            e [ v ] . push ( u ) ;
        }
    }

    // Perform Depth-First Search starting from node 1 (arbitrary root) with no parent (0).
    dfs ( 1 , 0 ) ;

    // Join the resulting edges with newline characters.
    return ans . join ( "\n" ) ;

    // Nested DFS function to orient edges.
    function dfs ( v , p ) {
        // Traverse all neighbors of the current node 'v'.
        for ( var V of e [ v ] ) {
            // Skip the parent to avoid going back up the tree.
            if ( V === p ) {
                continue ;
            }
            // Recursively call DFS for the neighbor.
            dfs ( V , v ) ;
        }

        // Base case: If 'v' is the root of the DFS (p === 0), return.
        // No edge needs to be oriented towards its non-existent parent.
        if ( p === 0 ) {
            return ;
        }

        // If the parity of 'v' is 1 (w[v] is true),
        // it means 'v' needs an outgoing edge.
        if ( w [ v ] ) {
            // Orient edge from 'v' to its parent 'p'.
            ans . push ( v + " " + p ) ;
        } else {
            // If parity of 'v' is 0, 'v' needs an incoming edge.
            // Orient edge from 'p' to 'v'.
            ans . push ( p + " " + v ) ;
            // Toggle parity for 'p' as it now has an outgoing edge.
            w [ p ] ^= 1 ;
        }
    }
}

// Check if a command-line argument is provided.
// If not, fork a new process with increased stack size and run 'Main.js'.
// This is a common pattern in competitive programming for handling recursion depth.
if ( process . argv . length < 3 ) {
    require ( "child_process" ) . fork ( "Main.js" , [ "1" ] , { execArgv : [ "--stack-size=240000" ] } ) ;
}
// If an argument is provided (e.g., to prevent infinite forking),
// execute the main function and print its result.
else {
    console . log ( main ( ) ) ;
}