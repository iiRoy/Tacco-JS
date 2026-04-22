/**
 * This is a Type I clone of the original JavaScript code.
 * All variable names, function names, operators, and expressions
 * are preserved exactly as they were in the source.
 *
 * The only modifications made are to whitespace (indentation,
 * spacing, and blank lines) and comments. These changes are
 * applied extensively to alter the visual appearance of the code
 * while maintaining its complete logical and structural identity.
 *
 * This program implements a Union-Find data structure
 * to solve a connectivity problem, likely counting connected components.
 */

function Main( input ) {

    // Process the input string: trim, split by newline, then split each line by space.
    input = input.trim( ).split( "\n" ).map( function ( x ) { return x.split( " " ) } ) ;


    // Parse N and M from the first line of input.
    // N represents the number of elements, M represents the number of union operations.
    let N = parseInt( input[ 0 ][ 0 ], 10 ) ;
    let M = parseInt( input[ 0 ][ 1 ], 10 ) ;


    // Initialize the Union-Find data structure with N elements.
    var uf = new UnionFind( N ) ;

    let line ; // Declare a variable to hold parsed line data.

    // Loop through M union operations.
    for ( let i = 0 ; i < M ; i++ ) {
        // Parse the current line, converting elements to integers.
        line = input[ i + 1 ].map( e => parseInt( e, 10 ) ) ;

        // Perform the union operation on the two elements (adjusting for 0-based indexing).
        uf.union( line[ 0 ] - 1, line[ 1 ] - 1 ) ;
    }

    let ans = 0 ; // Initialize counter for connected components.

    // Iterate through all elements to count the number of distinct roots.
    // Each root represents a unique connected component.
    for ( let i = 0 ; i < N ; i++ ) {
        if ( uf.find( i ) === i ) { // If an element is its own parent, it's a root.
            ans++ ; // Increment the count of connected components.
        }
        // The following line is a commented-out debugging statement from the original.
        // console.log(i, uf.find(i));
    }

    console.log( ans ) ; // Output the final count of connected components.
    // Another commented-out debugging statement.
    // console.log(uf);

} // End of Main function definition.


/**
 * UnionFind constructor function.
 * Initializes the parents array with -1 for all elements,
 * indicating each element is initially its own root and represents a component of size 1.
 * @param {number} n - The number of elements to manage in the Union-Find structure.
 */
function UnionFind( n ) {
    this.parents = [] ;
    for ( let i = 0 ; i < n ; i++ ) {
        this.parents.push( -1 ) ; // -1 indicates parent and size 1.
    }
}


/**
 * Finds the representative (root) of the set containing element x.
 * Implements path compression for efficiency.
 * @param {number} x - The element whose representative is to be found.
 * @returns {number} The representative (root) of the set.
 */
UnionFind.prototype.find = function ( x ) {
    if ( this.parents[ x ] < 0 ) {
        return x ; // x is the root of its set.
    }
    // Path compression: set parent of x to the root directly.
    return this.parents[ x ] = this.find( this.parents[ x ] ) ;
}


/**
 * Unites the sets containing elements x and y.
 * Implements union by size (or rank, implicitly by storing negative size).
 * @param {number} x - The first element.
 * @param {number} y - The second element.
 */
UnionFind.prototype.union = function ( x, y ) {
    x = this.find( x ) ; // Find root of x.
    y = this.find( y ) ; // Find root of y.

    if ( x === y ) {
        return ; // Already in the same set, do nothing.
    }

    // Union by size: attach smaller tree to root of larger tree.
    // The parent value stores the negative of the size of the tree if it's a root.
    if ( this.parents[ x ] > this.parents[ y ] ) {
        [ x, y ] = [ y, x ] ; // Swap x and y if y's tree is larger.
    }

    this.parents[ x ] += this.parents[ y ] ; // Update size of the new root's tree.
    this.parents[ y ] = x ; // Make x the parent of y.
}


/**
 * Returns the size of the set containing element x.
 * The size is stored as a negative value in the root's parent entry.
 * @param {number} x - The element whose set size is to be determined.
 * @returns {number} The size of the set containing x.
 */
UnionFind.prototype.size = function ( x ) {
    x = this.find( x ) ; // Find the root of the set containing x.
    // The original code had a loop here, but `find` already returns the root,
    // and the size is stored directly in `parents[x]` if `x` is a root.
    // The original loop was:
    // while (x >= 0) {
    //     x = this.parents[x];
    // }
    // This loop seems to be incorrect or for a different implementation.
    // The correct way to get size after finding root x is `this.parents[x] * -1`.
    // Preserving the exact original expression as per Type I clone definition.
    while ( x >= 0 ) {
        x = this.parents[ x ] ; // This loop will only execute if x is not a root, but x is already a root from find(x).
                                // If parents[x] is negative (a root), it will jump out.
                                // If parents[x] is positive (not a root), this will eventually lead to a negative value.
                                // The original code's logic here for `size` is a bit unusual after `find` already path-compressed to the root.
    }
    return x * -1 ; // Return the absolute value of the negative size.
}

// The following lines are example usage comments from the original code.
// var uf = new UnionFind(5);
// uf.union(3,4);
// uf.union(1,2);
// uf.union(0,4);
// console.log(uf.find(0)); //3 (3-4-0)
// console.log(uf.size(2)); //2 (1-2)
// console.log(uf) // UnionFind { parents: [ 3, -2, 1, -3, 3 ] } //経路圧縮された各ノードの親が格納 それ自身が親の場合はその木のサイズ*-1を返す


// Call the Main function with input read from standard input.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;