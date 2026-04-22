"use strict" ; // Enforce strict mode for better error handling and cleaner code.


/**
 * Implements a Union-Find data structure (also known as Disjoint Set Union).
 * This structure tracks a set of elements partitioned into a number of disjoint (non-overlapping) subsets.
 * It provides near-constant time operations for adding new sets, merging sets, and finding a representative member of a set.
 */
class UnionFind

{ // Beginning of the UnionFind class definition.

    /*
     * Internal array to store parent pointers.
     * par[i] holds the parent of element i. If par[i] === i, then i is the root of its set.
     * (e.g., par[3] = 2 means element 3's parent is 2).
     */
    // This comment line is for demonstration of comment modification.
    // The original Japanese comment: par[i]:iの親の番号　(例) par[3] = 2 : 3の親が2
    par ;


    /**
     * Constructor for the UnionFind class.
     * Initializes 'n' disjoint sets, where each element is initially its own parent (root of its own set).
     * @param {number} n - The number of elements to manage in the Union-Find structure.
     */
    constructor ( n )
    { // Initial setup: every element is its own root.
        this . par = new Array ( n ) . map ( ( v , i ) => i ) ; // Populate the parent array.
    } // End of constructor.



    /**
     * Finds the representative (root) of the set containing element 'x'.
     * Uses path compression for efficiency: during the traversal, it makes every node point directly to the root.
     * @param {number} x - The element whose set representative is to be found.
     * @returns {number} The root of the set containing 'x'.
     */
    root ( x )
    { // Recursively find the root of the tree that data 'x' belongs to.
        if ( this . par [ x ] == x )
        {
            return x ; // If 'x' is its own parent, it is the root.
        }

        // Path compression: set 'x's parent directly to the root.
        return this . par [ x ] = this . root ( this . par [ x ] ) ;
    } // End of root method.



    /**
     * Merges the sets containing elements 'x' and 'y'.
     * If 'x' and 'y' are already in the same set, nothing happens.
     * Otherwise, one set's root is made the child of the other set's root.
     * @param {number} x - An element in the first set to be united.
     * @param {number} y - An element in the second set to be united.
     */
    unite ( x , y )
    { // Merge the trees containing 'x' and 'y'.
        let rx = this . root ( x ) ; // Get the root of 'x'.
        let ry = this . root ( y ) ; // Get the root of 'y'.

        if ( rx == ry )
        { // If roots are the same, 'x' and 'y' are already in the same set.
            return ; // No action needed.
        }

        // If roots are different (not in the same set):
        this . par [ rx ] = ry ; // Make 'ry' the parent of 'rx', effectively merging 'rx's tree into 'ry's tree.
    } // End of unite method.



    /**
     * Checks if two elements 'x' and 'y' belong to the same set.
     * This is determined by checking if their respective roots are the same.
     * @param {number} x - The first element.
     * @param {number} y - The second element.
     * @returns {boolean} True if 'x' and 'y' are in the same set, false otherwise.
     */
    same ( x , y )
    { // Returns true if the trees containing 'x' and 'y' are the same.
        let rx = this . root ( x ) ; // Find the root of 'x'.
        let ry = this . root ( y ) ; // Find the root of 'y'.

        return rx == ry ; // Compare the roots.
    } // End of same method.

} // End of UnionFind class.





/**
 * Main function to process input and solve the problem.
 * This function reads input, performs Union-Find operations, and outputs the result.
 * @param {string} input - The raw input string, typically from stdin.
 */
function Main ( input )
{
    // Split the input into an array of lines.
    let lines = input . split ( "\n" ) ;


    // Parse the first line for N and M.
    // It splits by whitespace and converts values to numbers.
    let num = lines . shift ( ) . split ( /\s/ ) . map ( ( v ) => v - 0 ) ;

    // N: Number of elements.
    let N = num [ 0 ] ;
    // M: Number of union operations.
    let M = num [ 1 ] ;


    // Initialize a UnionFind structure with N elements.
    let tree = new UnionFind ( N ) ;


    // Parse the second line for array P.
    // Converts values to numbers.
    let P = lines . shift ( ) . split ( /\s/ ) . map ( ( v ) => v - 0 ) ;


    // Loop M times to perform union operations based on subsequent input lines.
    for ( let i = 0 ; i < M ; i ++ )
    {
        // Each line contains two elements x and y to be united.
        let [ x , y ] = lines . shift ( ) . split ( /\s/ ) . map ( ( v ) => v - 0 ) ;

        // Unite the sets containing (x-1) and (y-1) because problem often uses 1-based indexing.
        // The original comment: x-1の木とy-1の木を併合する
        tree . unite ( x - 1 , y - 1 ) ;
    }


    // Initialize a counter for matching elements.
    let cnt = 0 ;

    // Iterate through all N elements to check a specific condition.
    for ( let i = 0 ; i < N ; i ++ )
    {
        // Check if element 'i' and element 'P[i]-1' belong to the same set.
        // The original comment: iとP[i]-1が同じ木に属するなら，カウンタに1追加
        if ( tree . same ( i , P [ i ] - 1 ) )
        {
            cnt ++ ; // Increment counter if they are in the same set.
        }
    }


    // Output the final count to the console.
    console . log ( cnt ) ;

} // End of Main function.



// Call the Main function with input read from standard input.
// This typically reads the entire content of a file named "/dev/stdin" (common in competitive programming environments).
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;