// This is the main entry point for processing input data.
// The 'input' parameter is expected to be an array of strings,
// typically representing lines from standard input.
function    Main ( input )    {

    // Parse the initial parameters N, M, and K from the first line of input.
    // The `.split(" ")[X]` extracts the X-th space-separated token.
    // The `-0` is a concise way to convert a string to a number.
    var N = input[ 0 ].split( " " )[ 0 ] - 0 ; // Total number of elements.
    var M = input[ 0 ].split( " " )[ 1 ] - 0 ; // Number of friendship relations.
    var K = input[ 0 ].split( " " )[ 2 ] - 0 ; // Number of blocked relations.

    // Initialize a UnionFind data structure with 'N' elements.
    // This structure will help track connected components (friendship groups).
    var     uf = new UnionFind( N ) ;

    // 'map' is used to store direct relationships between individuals.
    // map[a][b] = false means 'a' and 'b' are directly connected (friends or blocked).
    // If map[a][b] is undefined or true, they are not directly connected.
    var map = { } ;

    // Process 'M' friendship relations.
    // Each relation links two individuals, 'a' and 'b'.
    for ( var i = 0 ; i < M ; i++ ) {
        // Parse the two individuals involved in the friendship.
        // Subtracting 1 converts them to 0-indexed.
        var a = input[ i + 1 ].split( " " )[ 0 ] - 1 ;
        var b = input[ i + 1 ].split( " " )[ 1 ] - 1 ;

        // Link 'a' and 'b' in the UnionFind structure,
        // indicating they are in the same friendship group.
        uf.link( a, b ) ;

        // Ensure that 'a' and 'b' have entries in the 'map'.
        // If an entry doesn't exist, initialize it as an empty object.
        if ( ! map[ a ] ) map[ a ] = { } ;
        if ( ! map[ b ] ) map[ b ] = { } ;

        // Mark 'a' and 'b' as directly connected (false) in the 'map'.
        // This signifies they are not potential *new* friends because they are already friends.
        map[ a ][ b ] = false ;
        map[ b ][ a ] = false ;
    }


    // Process 'K' blocked relations.
    // These relations indicate individuals who cannot be friends.
    for ( var i = 0 ; i < K ; i++ ) {
        // Parse the two individuals involved in the blocked relation.
        // Convert them to 0-indexed.
        var a = input[ i + M + 1 ].split( " " )[ 0 ] - 1 ;
        var b = input[ i + M + 1 ].split( " " )[ 1 ] - 1 ;

        // Ensure map entries exist for 'a' and 'b'.
        if ( ! map[ a ] ) {
            map[ a ] = { } ;
        }
        if ( ! map[ b ] ) {
            map[ b ] = { } ;
        }

        // Mark 'a' and 'b' as directly connected (false) in the 'map'.
        // This signifies they cannot be potential *new* friends because they are blocked.
        map[ a ][ b ] = false ;
        map[ b ][ a ] = false ;
    }


    // 'fmap' (friendship map) will store all members of each connected component.
    // The key is the root of the component, and the value is an object
    // where keys are members of that component.
    var fmap = { } ;

    // 'cmap' (component map) will map each individual to their corresponding
    // component's entry in 'fmap'.
    var cmap = { } ;

    // Iterate through all 'N' individuals to build 'fmap' and 'cmap'.
    for ( var i = 0 ; i < N ; i++ ) {
        // Find the representative (root) of the set that individual 'i' belongs to.
        var f = uf.find( i ) ;

        // If this root 'f' hasn't been seen yet, initialize its component in 'fmap'.
        if ( ! fmap[ f ] ) {
            fmap[ f ] = { } ;
        }

        // Add individual 'i' to the component represented by 'f'.
        fmap[ f ][ i ] = true ;

        // Map individual 'i' directly to their component's member list.
        cmap[ i ] = fmap[ f ] ;

        // Ensure a self-entry exists in 'map' for 'i', marked as false.
        // An individual cannot be a potential friend to themselves.
        if ( ! map[ i ] ) map[ i ] = { } ;
        map[ i ][ i ] = false ;
    }


    // 'ans' will store the final count of potential new friends for each person.
    var ans = [ ] ;

    // Calculate potential new friends for each individual.
    for ( var i = 0 ; i < N ; i++ ) {
        ans[ i ] = 0 ; // Initialize the count for person 'i' to zero.

        // Check if person 'i' is part of any component.
        // (This check is mostly for safety; all persons 0 to N-1 should be).
        if ( cmap[ i ] ) {
            // Iterate over all other individuals 'key' in the same component as 'i'.
            Object.keys( cmap[ i ] ).forEach( key => {
                // If 'i' and 'key' are NOT marked as directly connected (friends or blocked)
                // in the 'map', then 'key' is a potential new friend for 'i'.
                if ( map[ i ][ key ] !== false ) {
                    ans[ i ]++ ; // Increment the count for 'i'.
                }
            } ) ;
        }
    }

    // Output the results, with each count separated by a space.
    console.log( ans.join( " " ) ) ;
}


// Definition of the UnionFind data structure.
// It manages a collection of disjoint sets.
// 'count' specifies the initial number of elements, indexed from 0 to count-1.
function UnionFind ( count ) {
    // 'roots' array: roots[i] stores the parent of element 'i'.
    // If roots[i] === i, then 'i' is the representative (root) of its set.
    this.roots = new Array( count ) ;

    // 'ranks' array: ranks[i] stores the rank (or size heuristic) of the set
    // if 'i' is a root. Used for optimization during union operations.
    this.ranks = new Array( count ) ;

    // Initialize each element to be in its own set,
    // with itself as the root and a rank of 0.
    for ( var i = 0 ; i < count ; ++i ) {
        this.roots[ i ] = i ;
        this.ranks[ i ] = 0 ;
    }
}


// Create a shortcut reference to the UnionFind prototype for easier method definition.
var proto = UnionFind.prototype ;


// Define a 'length' getter property on the UnionFind prototype.
// This allows querying the total number of elements currently managed
// by the UnionFind instance.
Object.defineProperty( proto, "length", {
    "get" : function() {
        return this.roots.length ;
    }
} ) ;


// Adds a new, isolated element to the UnionFind structure.
// The new element is initially in its own set.
// Returns the index of the newly added element.
proto.makeSet = function ( ) {
    // The index of the new element will be the current number of elements.
    var n = this.roots.length ;

    // Add the new element as its own root.
    this.roots.push( n ) ;

    // Give the new element an initial rank of 0.
    this.ranks.push( 0 ) ;

    return n ; // Return the index of the new element.
} ;


// Finds the representative (root) of the set containing element 'x'.
// This method also performs path compression, flattening the tree structure
// to make future 'find' operations faster.
proto.find = function ( x ) {
    // Store the original value of 'x' for path compression.
    var x0 = x ;
    var roots = this.roots ; // Cache the 'roots' array for performance.

    // Traverse up the tree until the root is found.
    // The root is an element whose parent is itself.
    while ( roots[ x ] !== x ) {
        x = roots[ x ] ;
    }

    // Path compression: Iterate again from the original 'x0' to the root 'x'.
    // Make all elements on this path point directly to the root 'x'.
    while ( roots[ x0 ] !== x ) {
        var y = roots[ x0 ] ; // Store the current parent of 'x0'.
        roots[ x0 ] = x ;     // Make 'x0' point directly to the root.
        x0 = y ;              // Move up to the next element on the original path.
    }

    return x ; // Return the root of the set.
} ;


// Merges the sets containing elements 'x' and 'y'.
// This operation is optimized using "union by rank" heuristic.
proto.link = function ( x, y ) {
    // Find the representatives (roots) of the sets that 'x' and 'y' belong to.
    var xr = this.find( x ) ,
        yr = this.find( y ) ;

    // If 'x' and 'y' are already in the same set, there's nothing to do.
    if ( xr === yr ) {
        return ;
    }

    // Cache 'ranks' and 'roots' arrays for efficiency.
    var ranks = this.ranks ,
        roots = this.roots ,
        xd    = ranks[ xr ] , // Rank of 'xr' (root of x's set).
        yd    = ranks[ yr ] ; // Rank of 'yr' (root of y's set).

    // Union by rank heuristic:
    // Attach the tree with the smaller rank under the root of the tree with the larger rank.
    // This helps keep the trees relatively flat.
    if ( xd < yd ) {
        roots[ xr ] = yr ; // Make 'xr's root point to 'yr's root.
    } else if ( yd < xd ) {
        roots[ yr ] = xr ; // Make 'yr's root point to 'xr's root.
    } else {
        // If ranks are equal, either choice is fine.
        // Attach 'yr's root to 'xr's root, and increment 'xr's rank.
        roots[ yr ] = xr ;     // Make 'yr's root point to 'xr's root.
        ++ranks[ xr ] ;        // Increment the rank of the new root.
    }
} ;


// This line reads input from standard input, processes it, and calls the Main function.
// `require("fs").readFileSync("/dev/stdin", "utf8")` reads the entire standard input as a string.
// `.trim()` removes leading/trailing whitespace.
// `.split("\n")` splits the string into an array of lines.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ).trim().split( "\n" ) ) ;