/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical identity.
 * Only whitespace and comments have been modified extensively.
 *
 * Original source: Provided as input.
 * Purpose: Implements a Union-Find data structure and uses it
 *          to process queries from standard input.
 */

// Import the 'fs' module for file system operations.
var input = require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ;

// Initialize input processing variables.
// 'cin' stores input tokens, 'cid' is the current token index.
var cin = input . split( / |\n/ ) ,
    cid = 0 ;

/**
 * Retrieves the next number from the input token array.
 * Converts the string token to a number using the unary plus operator.
 * @returns {number} The next number from the input.
 */
function next ( )
{
    return + cin [ cid ++ ] ;
}

/*
 * The following section defines the UnionFind data structure.
 * It's a standard implementation for disjoint set union.
 * This particular structure was contributed by "catoonさん" (as per original comment).
 */
var UnionFind = /** @class */ ( function ( )
{
    /**
     * Constructor for the UnionFind class.
     * Initializes 'n' disjoint sets, each containing one element.
     * @param {number} n The number of elements to initialize.
     */
    function UnionFind ( n )
    {
        // 'p' (parent) array: p[i] stores the parent of element i.
        // Initially, each element is its own parent.
        this . p = [ ] ;

        // 'sizes' array: sizes[i] stores the size of the set whose root is i.
        // Initially, each set has a size of 1.
        this . sizes = [ ] ;

        // Populate parent and sizes arrays.
        for ( var i = 0 ; i < n ; i ++ )
        {
            this . p . push( i ) ;
            this . sizes . push( 1 ) ;
        }

        // 'tmpsize' tracks the current number of disjoint sets.
        this . tmpsize = n ;
    }

    /**
     * Finds the representative (root) of the set containing element 'x'.
     * Uses path compression for efficiency.
     * @param {number} x The element to find the root for.
     * @returns {number} The root of the set containing 'x'.
     */
    UnionFind . prototype . find = function ( x )
    {
        // If x is its own parent, it's the root.
        if ( this . p [ x ] === x )
        {
            return x ;
        }
        else
        {
            // Otherwise, recursively find the root and compress the path.
            var tmp = this . find ( this . p [ x ] ) ;
            this . p [ x ] = tmp ; // Path compression
            return tmp ;
        }
    } ;

    /**
     * Unites the sets containing elements 'x' and 'y'.
     * Uses union by size heuristic.
     * @param {number} x An element in the first set.
     * @param {number} y An element in the second set.
     */
    UnionFind . prototype . unite = function ( x , y )
    {
        // If x and y are already in the same set, do nothing.
        if ( this . find ( x ) === this . find ( y ) )
        {
            return ;
        }

        // Determine which root is larger to attach the smaller tree under the larger.
        var _a = this . sizes [ this . find ( x ) ] >= this . sizes [ this . find ( y ) ]
                 ? [ this . find ( x ) , this . find ( y ) ]
                 : [ this . find ( y ) , this . find ( x ) ] ,
            large = _a [ 0 ] ,
            small = _a [ 1 ] ;

        // Set the parent of the smaller tree's root to the larger tree's root.
        this . p [ small ] = large ;

        // Update the size of the larger tree.
        this . sizes [ large ] += this . sizes [ small ] ;

        // Decrement the count of disjoint sets.
        this . tmpsize -- ;
    } ;

    /**
     * Checks if elements 'x' and 'y' are in the same set.
     * @param {number} x An element.
     * @param {number} y Another element.
     * @returns {boolean} True if x and y are in the same set, false otherwise.
     */
    UnionFind . prototype . is_same = function ( x , y )
    {
        return this . find ( x ) === this . find ( y ) ;
    } ;

    return UnionFind ;
} ( ) ) ;


/**
 * The main function of the program.
 * Reads input, performs Union-Find operations, and outputs results.
 */
function main ( )
{
    // Read the number of elements (n) and the number of queries (q).
    var n = next ( ) ;
    var q = next ( ) ;

    // Create a new UnionFind instance with 'n' elements.
    var uf = new UnionFind ( n ) ;

    // Process each query.
    while ( q -- )
    {
        // Read the query type (condition) and two elements (tmp, tmp1).
        var condition = next ( ) ;
        var tmp = next ( ) ;
        var tmp1 = next ( ) ;

        // If condition is 0, unite the sets containing tmp and tmp1.
        if ( condition === 0 )
        {
            uf . unite ( tmp , tmp1 ) ;
        }
        // If condition is not 0 (e.g., 1), check if tmp and tmp1 are in the same set.
        else
        {
            if ( uf . is_same ( tmp , tmp1 ) )
            {
                console . log ( 1 ) ; // Output 1 if they are in the same set.
            }
            else
            {
                console . log ( 0 ) ; // Output 0 if they are in different sets.
            }
        }
    }

    // The function does not explicitly return a value, but 'return;' is used for clarity.
    return ;
}

// Execute the main function to start the program.
main ( ) ;