/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered.
 *
 * The primary goal of this script is to process input data
 * related to a graph problem, likely involving connected components
 * and friend/block relationships, using a Union-Find data structure.
 */

// The 'Main' function serves as the entry point for processing the input.
// 'input' is expected to be an array of strings, where each string
// represents a line of input data.
function                                           Main
(
    input                                       // input: entire input data as an array of strings
)
{
    // Parse the first line of input to get N, M, and K.
    // N: number of elements/nodes.
    // M: number of 'friend' relationships.
    // K: number of 'blocked' relationships.
    var N = input [ 0 ] . split ( " " ) [ 0 ] - 0 ; // Convert string to number for N
    var M = input [ 0 ] . split ( " " ) [ 1 ] - 0 ; // Convert string to number for M
    var K = input [ 0 ] . split ( " " ) [ 2 ] - 0 ; // Convert string to number for K


    // Initialize a Union-Find data structure with N elements.
    // This will be used to track connected components (friend groups).
    var uf = new UnionFind ( N ) ;


    // A map to store adjacency information and blocked relationships.
    // Keys are node indices, values are objects mapping to other node indices.
    // true means potential friend, false means explicitly blocked or not a friend.
    var map = { } ;

    // Process M friend relationships.
    // These relationships are used to build the connected components.
    // input[i+1] contains the i-th friend relationship.
    for
    (
        var i = 0 ;
        i < M ;
        i ++
    )
    {
        var a = input [ i + 1 ] . split ( " " ) [ 0 ] - 1 ; // Node A (0-indexed)
        var b = input [ i + 1 ] . split ( " " ) [ 1 ] - 1 ; // Node B (0-indexed)

        // Link nodes 'a' and 'b' in the Union-Find structure,
        // indicating they are in the same connected component.
        uf . link ( a , b ) ;

        // Initialize map entries for 'a' and 'b' if they don't exist.
        if ( ! map [ a ] ) map [ a ] = { } ;
        if ( ! map [ b ] ) map [ b ] = { } ;

        // Mark 'a' and 'b' as directly connected (false means not a candidate for 'friend of friend').
        // This implicitly means they are already friends and thus not "potential" friends.
        map [ a ] [ b ] = false ;
        map [ b ] [ a ] = false ;
    }

    // Process K blocked relationships.
    // These relationships are explicitly marked as non-friends.
    // input[i+M+1] contains the i-th blocked relationship.
    for
    (
        var i = 0 ;
        i < K ;
        i ++
    )
    {
        var a = input [ i + M + 1 ] . split ( " " ) [ 0 ] - 1 ; // Node A (0-indexed)
        var b = input [ i + M + 1 ] . split ( " " ) [ 1 ] - 1 ; // Node B (0-indexed)

        // Initialize map entries for 'a' and 'b' if they don't exist.
        if ( ! map [ a ] ) map [ a ] = { } ;
        if ( ! map [ b ] ) map [ b ] = { } ;

        // Mark 'a' and 'b' as blocked (false means not a potential friend).
        map [ a ] [ b ] = false ;
        map [ b ] [ a ] = false ;
    }


    // fmap: Stores all members of each connected component.
    //      Key: root of a component, Value: object mapping member nodes to true.
    // cmap: Maps each node to the fmap entry of its component.
    //      Key: node index, Value: reference to the component object in fmap.
    var fmap = { } ;
    var cmap = { } ;

    // Populate fmap and cmap.
    // Also, mark each node as not being a potential friend of itself in 'map'.
    for
    (
        var i = 0 ;
        i < N ;
        i ++
    )
    {
        var f = uf . find ( i ) ; // Find the root (representative) of node 'i''s component.

        // If this component root hasn't been seen yet, initialize its entry in fmap.
        if ( ! fmap [ f ] ) fmap [ f ] = { } ;

        // Add node 'i' to its component's set of members.
        fmap [ f ] [ i ] = true ;

        // Store a reference to the component's member list for quick lookup.
        cmap [ i ] = fmap [ f ] ;

        // A node cannot be its own "friend of friend" candidate.
        // Ensure its entry exists in 'map' before setting.
        if ( ! map [ i ] ) map [ i ] = { } ;
        map [ i ] [ i ] = false ;
    }


    // Array to store the final answer for each node.
    var ans = [ ] ;

    // Calculate the number of "friend of friend" candidates for each node.
    for
    (
        var i = 0 ;
        i < N ;
        i ++
    )
    {
        ans [ i ] = 0 ; // Initialize count for current node.

        // Start with all members of node 'i''s connected component (potential friends).
        // Use Object.assign to create a shallow copy to avoid modifying cmap directly.
        var obj = Object . assign ( { } , cmap [ i ] ) ;

        // Overlay the 'map' entries for node 'i'.
        // This will override 'true' values with 'false' for directly connected friends
        // and blocked relationships, effectively removing them from the candidate list.
        Object . assign ( obj , map [ i ] ) ;

        // Count how many relationships remain 'true' in 'obj'.
        // These are the nodes in the same component that are NOT directly friends
        // and NOT explicitly blocked, thus "friend of friend" candidates.
        ans [ i ] = Object . keys ( obj ) . filter ( v => obj [ v ] ) . length ;
    }

    // Output the results, joined by spaces.
    console . log ( ans . join ( " " ) ) ;
}


// --- Union-Find Data Structure Implementation ---

// Constructor for the UnionFind data structure.
// 'count' specifies the initial number of elements.
function                                           UnionFind
(
    count                                       // Number of elements to initialize
)
{
    // 'roots' array: stores the parent of each element.
    // If roots[i] === i, then i is a root of a set.
    this . roots = new Array ( count ) ;
    // 'ranks' array: stores the rank (or size/height) of each tree.
    // Used for union by rank optimization.
    this . ranks = new Array ( count ) ;

    // Initialize each element to be its own root, with a rank of 0.
    for
    (
        var i = 0 ;
        i < count ;
        ++ i
    )
    {
        this . roots [ i ] = i ;
        this . ranks [ i ] = 0 ;
    }
}


// Get a reference to the UnionFind prototype for adding methods.
var proto = UnionFind . prototype ;


// Define a 'length' getter property for the UnionFind instance.
// This will return the current number of elements managed by UnionFind.
Object . defineProperty
(
    proto ,
    "length" ,
    {
        "get" : function ( )
        {
            return this . roots . length ;
        }
    }
) ;


// Method to add a new, isolated element to the UnionFind structure.
// It returns the index of the newly added element.
proto . makeSet = function ( )
{
    var n = this . roots . length ; // Get the next available index.
    this . roots . push ( n ) ;     // Add it as its own root.
    this . ranks . push ( 0 ) ;     // Initialize its rank to 0.
    return n ;                      // Return the index of the new element.
} ;


// Method to find the representative (root) of the set containing element 'x'.
// It also performs path compression for optimization.
proto . find = function ( x )
{
    var x0 = x ;                // Store original 'x' for path compression.
    var roots = this . roots ;  // Cache roots array for performance.

    // Traverse up the tree until the root is found (where roots[x] === x).
    while
    (
        roots [ x ] !== x
    )
    {
        x = roots [ x ] ;
    }

    // Path compression: Make all nodes on the path from x0 to the root
    // point directly to the root.
    while
    (
        roots [ x0 ] !== x
    )
    {
        var y = roots [ x0 ] ;  // Store current parent.
        roots [ x0 ] = x ;      // Point x0 directly to the root.
        x0 = y ;                // Move up to the next node on the original path.
    }
    return x ;                  // Return the root.
} ;


// Method to unite the sets containing elements 'x' and 'y'.
// It uses union by rank optimization.
proto . link = function ( x , y )
{
    var xr = this . find ( x )      // Find root of x.
    ,   yr = this . find ( y ) ;    // Find root of y.

    // If they are already in the same set, do nothing.
    if
    (
        xr === yr
    )
    {
        return ;
    }

    var ranks = this . ranks        // Cache ranks array.
    ,   roots = this . roots        // Cache roots array.
    ,   xd    = ranks [ xr ]        // Rank of x's root.
    ,   yd    = ranks [ yr ] ;      // Rank of y's root.

    // Union by rank: Attach the smaller rank tree under the root of the larger rank tree.
    if
    (
        xd < yd
    )
    {
        roots [ xr ] = yr ;         // xr's tree becomes a child of yr's tree.
    }
    else if
    (
        yd < xd
    )
    {
        roots [ yr ] = xr ;         // yr's tree becomes a child of xr's tree.
    }
    else
    {
        // If ranks are equal, attach one to the other and increment the rank of the new root.
        roots [ yr ] = xr ;         // yr's tree becomes a child of xr's tree.
        ++ ranks [ xr ] ;           // Increment rank of xr.
    }
} ;


// Execute the Main function with input read from standard input.
// The input is read as a UTF-8 string, trimmed, and then split by newlines.
Main
(
    require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" )
) ;