"use strict" ;

// This file defines the core logic for checking equality within sets.

Object.defineProperty ( exports, "__esModule", { value: true } ) ;


/*
 * The main entry point for the application.
 * It takes an input string, parses it, and then processes it
 * to determine the count of elements that are equal based on specific criteria.
 *
 * @param input The raw input string containing all necessary data.
 * @returns The calculated count.
 */
function Equals ( input ) {
    // Parse the raw input string into structured data.
    // The first line of input provides N and M.
    // The second line provides the array 'p'.
    // Subsequent lines provide 'xy' pairs.
    var _a = parseInput ( input ) , N = _a.N , p = _a.p , xy = _a.xy ;

    // Initialize Disjoint Sets data structure based on N and the 'xy' pairs.
    var sets = DisjointSets . buildFrom ( N , xy ) ;

    /*
     * Calculate the final count.
     * This involves filtering the 'p' array:
     * - For each number 'num' at index 'i' in 'p',
     * - Check if 'num' is in the same set as 'i + 1'.
     * - The length of the filtered array gives the desired count.
     */
    var count = p . filter ( function ( num , i ) {
        return sets . areInSameSet ( num , i + 1 ) ;
    } ) . length ;

    // Output the final count to the console.
    console . log ( count ) ;

    // Return the calculated count.
    return count ;
}

// Export the Equals function so it can be used as a module.
exports . Equals = Equals ;

/*
 * DisjointSets class: Manages a collection of DisjointSetTree objects.
 * This class provides high-level operations for working with disjoint sets.
 */
var DisjointSets = /* @class */ ( function ( ) {
    /*
     * Constructor for DisjointSets.
     * @param trees An array of DisjointSetTree instances.
     */
    function DisjointSets ( trees ) {
        this . trees = trees ;
    }

    /*
     * Static method to build a DisjointSets instance from given parameters.
     *
     * @param N The total number of elements.
     * @param xy An array of objects, each containing an 'x' and 'y' property,
     *           representing connections between elements.
     * @returns A new DisjointSets instance.
     */
    DisjointSets . buildFrom = function ( N , xy ) {
        // Create N+1 DisjointSetTree instances (1-indexed).
        var trees = Array . apply ( this , Array ( N + 1 ) ) . map ( function ( ) {
            return new DisjointSetTree ( ) ;
        } ) ;

        // For each pair (x, y) in xy, perform a union operation on their respective trees.
        xy . forEach ( function ( _a ) {
            var x = _a . x , y = _a . y ;
            return trees [ x ] . union ( trees [ y ] ) ;
        } ) ;

        return new DisjointSets ( trees ) ;
    } ;

    /*
     * Checks if two numbers belong to the same disjoint set.
     *
     * @param num1 The first number.
     * @param num2 The second number.
     * @returns True if both numbers are in the same set, false otherwise.
     */
    DisjointSets . prototype . areInSameSet = function ( num1 , num2 ) {
        return this . trees [ num1 ] . isSameSetAs ( this . trees [ num2 ] ) ;
    } ;

    return DisjointSets ;
} ( ) ) ;


/*
 * DisjointSetTree class: Represents a single node/tree in the disjoint set forest.
 * Implements union-by-rank and path compression for efficient operations.
 */
var DisjointSetTree = /* @class */ ( function ( ) {
    function DisjointSetTree ( ) {
        // Initially, each node is its own parent.
        this . parent = this ;
        // Rank for union-by-rank optimization.
        this . rank = 0 ;
    }

    /*
     * Checks if this tree is in the same set as another DisjointSetTree.
     *
     * @param other The other DisjointSetTree to compare with.
     * @returns True if they are in the same set, false otherwise.
     */
    DisjointSetTree . prototype . isSameSetAs = function ( other ) {
        return this . find ( ) === other . find ( ) ;
    } ;

    /*
     * Performs a union operation on this tree and another tree.
     * Uses union-by-rank heuristic to maintain tree balance.
     *
     * @param other The other DisjointSetTree to union with.
     */
    DisjointSetTree . prototype . union = function ( other ) {
        var _a ;
        // Find the root of this tree.
        var xRoot = this . find ( ) ;
        // Find the root of the other tree.
        var yRoot = other . find ( ) ;

        // If they are not already in the same set...
        if ( xRoot !== yRoot ) {
            // Attach the smaller rank tree under the root of the larger rank tree.
            if ( xRoot . rank < yRoot . rank ) {
                _a = [ yRoot , xRoot ] , xRoot = _a [ 0 ] , yRoot = _a [ 1 ] ;
            }
            yRoot . parent = xRoot ;
            // If ranks were equal, increment the rank of the new root.
            if ( yRoot . rank === xRoot . rank ) {
                xRoot . rank = xRoot . rank + 1 ;
            }
        }
    } ;

    /*
     * Finds the root of the set to which this tree belongs.
     * Implements path compression for optimization.
     *
     * @returns The root DisjointSetTree of the set.
     */
    DisjointSetTree . prototype . find = function ( ) {
        // If this node is not its own parent,
        // it means it's not the root.
        if ( this . parent !== this ) {
            // Recursively find the root and compress the path.
            this . parent = this . parent . find ( ) ;
        }
        return this . parent ;
    } ;

    return DisjointSetTree ;
} ( ) ) ;


/*
 * Helper function to parse the raw input string into structured data.
 *
 * @param input The raw input string.
 * @returns An object containing N, M, p, and xy arrays.
 */
function parseInput ( input ) {
    // Split the input string by newlines.
    var _a = input . split ( "\n" ) , line0 = _a [ 0 ] , line1 = _a [ 1 ] , lines = _a . slice ( 2 ) ;

    // Parse the first line for N and M.
    var _b = parseSpaceSeparatedInts ( line0 ) , N = _b [ 0 ] , M = _b [ 1 ] ;

    // Parse the second line for the array 'p'.
    var p = parseSpaceSeparatedInts ( line1 ) ;

    // Parse the remaining lines for 'xy' pairs.
    var xy = lines . map ( function ( line ) {
        var _a = parseSpaceSeparatedInts ( line ) , x = _a [ 0 ] , y = _a [ 1 ] ;
        return { x : x , y : y } ;
    } ) ;

    // Return the parsed data.
    return { N : N , M : M , p : p , xy : xy } ;
}


/*
 * Helper function to parse a space-separated string of integers into an array of numbers.
 *
 * @param line The string containing space-separated integers.
 * @returns An array of numbers.
 */
function parseSpaceSeparatedInts ( line ) {
    return line . split ( " " ) . map ( Number ) ;
}


// --- Main execution block ---
// This part reads input from stdin and calls the main Equals function.
// Don't edit this line! It's for the specific environment.
Equals ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
// # sourceMappingURL=Equals.js.map
// This is a source map comment, usually generated by TypeScript.