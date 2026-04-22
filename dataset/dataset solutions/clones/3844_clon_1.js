"use strict" ;

Object.defineProperty( exports , "__esModule" , { value : true } ) ;

/*
 * This function serves as the main entry point for processing the input data.
 * It orchestrates the parsing of input and the calculation of the final result.
 */
function Equals( input ) {

  // The 'input' parameter contains all necessary data, typically a multi-line string.
  // We parse this string to extract relevant numerical and structural information.
  // Specifically, N, M, p, and xy are destructured from the result of parseInput.
  var _a = parseInput( input ) , N = _a.N , M = _a.M , p = _a.p , xy = _a.xy ;

  // Initialize a DisjointSets data structure based on N elements and the connections defined by xy.
  // This structure will help in determining connectivity between elements.
  var sets = DisjointSets.buildFrom( N , xy ) ;

  // The core logic for calculating the result:
  // 1. Filter the 'p' array (a permutation or mapping).
  // 2. Keep only those elements 'num' where 'num' is in the same set as its index + 1.
  //    The 'i + 1' is because array indices are 0-based, while problem statements often use 1-based indexing.
  // 3. Get the count of such elements.
  // 4. Convert the final count to a string, as per typical output requirements.
  return p . filter( function ( num , i ) { return sets . areInSameSet( num , i + 1 ) ; } ) . length . toString( ) ;
}
exports . Equals = Equals ;

/*
 * The DisjointSets class implements the Disjoint Set Union (DSU) data structure.
 * It is used to keep track of a collection of disjoint sets and supports two primary operations:
 * 1. Union: Merges two sets into a single set.
 * 2. Find: Determines which set a particular element belongs to.
 * This particular implementation uses an array of DisjointSetTree objects internally.
 */
var DisjointSets = /** @class */ ( function ( ) {
  function DisjointSets( trees ) {
    this . trees = trees ; // An array where each index corresponds to an element, storing its DisjointSetTree.
  }

  // Static factory method to construct a DisjointSets instance.
  // N: The number of elements (nodes).
  // xy: An array of pairs [x, y] representing connections between elements.
  DisjointSets . buildFrom = function ( N , xy ) {
    // Create an array of N+1 DisjointSetTree objects.
    // The first element (index 0) is often unused if problem uses 1-based indexing.
    var trees = Array . apply( this , Array( N + 1 ) ) . map( function ( ) { return new DisjointSetTree( ) ; } ) ;

    // Iterate through all given connections (x, y) and union their respective sets.
    xy . forEach( function ( _a ) {
      var x = _a . x , y = _a . y ;
      // Perform the union operation between the trees representing x and y.
      return trees[ x ] . union( trees[ y ] ) ;
    } ) ;

    // Return a new DisjointSets instance initialized with the constructed trees.
    return new DisjointSets( trees ) ;
  } ;

  // Checks if two elements (num1 and num2) belong to the same set.
  DisjointSets . prototype . areInSameSet = function ( num1 , num2 ) {
    // This is achieved by checking if their respective DisjointSetTree roots are the same.
    return this . trees[ num1 ] . isSameSetAs( this . trees[ num2 ] ) ;
  } ;

  return DisjointSets ;
}( ) ) ;

/*
 * The DisjointSetTree class represents a single element within the Disjoint Set Union structure.
 * Each element is a node in a tree, and the root of the tree represents the set.
 * It includes path compression and union by rank optimizations for efficiency.
 */
var DisjointSetTree = /** @class */ ( function ( ) {
  function DisjointSetTree( ) {
    this . parent = this ; // Initially, each element is its own parent (its own set).
    this . rank = 0 ;     // Rank is used for union by rank optimization.
  }

  // Determines if this tree's set is the same as another tree's set.
  DisjointSetTree . prototype . isSameSetAs = function ( other ) {
    // This is true if their respective root nodes are identical.
    return this . find( ) === other . find( ) ;
  } ;

  // Performs the union operation on two sets (represented by 'this' and 'other').
  // This implementation uses the "union by rank" heuristic to keep trees flat.
  DisjointSetTree . prototype . union = function ( other ) {
    var _a ; // Temporary variable for destructuring assignment.

    // Find the root (representative) of the set containing 'this'.
    var xRoot = this . find( ) ;
    // Find the root (representative) of the set containing 'other'.
    var yRoot = other . find( ) ;

    // If the two elements are not already in the same set:
    if ( xRoot !== yRoot ) {
      // Apply union by rank: attach the smaller rank tree under the root of the larger rank tree.
      if ( xRoot . rank < yRoot . rank ) {
        // Swap xRoot and yRoot if xRoot's rank is smaller.
        // This ensures xRoot always points to the root of the potentially larger tree.
        _a = [ yRoot , xRoot ] , xRoot = _a[ 0 ] , yRoot = _a[ 1 ] ;
      }
      // Make the root of the smaller tree (yRoot) a child of the root of the larger tree (xRoot).
      yRoot . parent = xRoot ;

      // If ranks were equal, the rank of the new root increases.
      if ( yRoot . rank === xRoot . rank ) {
        xRoot . rank = xRoot . rank + 1 ;
      }
    }
  } ;

  // Finds the representative (root) of the set that 'this' element belongs to.
  // This method also performs path compression for efficiency.
  DisjointSetTree . prototype . find = function ( ) {
    // If 'this' is not its own parent, it means it's not the root of its tree.
    if ( this . parent !== this ) {
      // Recursively find the root and compress the path by directly linking 'this' to the root.
      this . parent = this . parent . find( ) ;
    }
    // Return the (now compressed) parent, which is the root.
    return this . parent ;
  } ;

  return DisjointSetTree ;
}( ) ) ;

// Helper function to parse the raw input string into structured data.
function parseInput( input ) {
  // Split the input string by newline characters to get individual lines.
  // line0: First line (N, M)
  // line1: Second line (p array)
  // lines: Remaining lines (xy pairs)
  var _a = input . split( "\n" ) , line0 = _a[ 0 ] , line1 = _a[ 1 ] , lines = _a . slice( 2 ) ;

  // Parse the first line to get N and M (number of elements and number of connections).
  var _b = parseSpaceSeparatedInts( line0 ) , N = _b[ 0 ] , M = _b[ 1 ] ;
  // Parse the second line to get the permutation array 'p'.
  var p = parseSpaceSeparatedInts( line1 ) ;

  // Map the remaining lines to an array of objects, each containing x and y coordinates.
  var xy = lines . map( function ( line ) {
    var _a = parseSpaceSeparatedInts( line ) , x = _a[ 0 ] , y = _a[ 1 ] ;
    return { x : x , y : y } ; // Return an object { x: value, y: value }
  } ) ;

  // Return all parsed data as a single object.
  return { N : N , M : M , p : p , xy : xy } ;
}

// Another helper function to parse a line containing space-separated integers.
function parseSpaceSeparatedInts( line ) {
  // Splits the line by space and converts each part to a Number.
  return line . split( " " ) . map( Number ) ;
}

// Main function for AtCoder-like environments.
function atCoder( input ) {
  // Calls the Equals function with the provided input and logs the result to console.
  console . log( Equals( input ) ) ;
}

// This block handles execution in a typical competitive programming setup,
// reading input from stdin and calling the main logic.
// Please do not modify this specific section for submission purposes.
try {
  atCoder( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;
}
catch ( e ) {
  // In a local development environment, this catch block prevents errors
  // if /dev/stdin is not available. It effectively ignores the error.
  // This is often used to allow testing without actual stdin input.
}
// This comment is often generated by TypeScript and indicates the source map file.
// It is not part of the executable code.
// # sourceMappingURL=Equals.js.map