"use strict" ;

Object.defineProperty(exports, "__esModule" , {
 value : true
} ) ;

// This function serves as the main entry point for processing input.
// The 'input' parameter is expected to contain all necessary data as a string.
function Equals ( input )
{
  // Parse the raw input string to extract relevant data: N, p, and xy coordinates.
  // The first line often contains N and M, the second line contains p, and subsequent lines contain xy pairs.
  var _a = parseInput(input) ,
      N  = _a.N ,
      p  = _a.p ,
      xy = _a.xy ;

  // Initialize a Disjoint Sets data structure based on the number of elements N
  // and the connections specified by xy.
  var sets = DisjointSets.buildFrom( N , xy ) ;

  // Calculate the final count based on the problem's criteria.
  // This involves filtering elements of 'p' where the element itself and its index (plus one)
  // are found to be in the same set within the Disjoint Sets structure.
  var count = p.filter(
    function ( num , i )
    {
      return sets.areInSameSet( num , i + 1 ) ;
    }
  ).length ;

  // Output the calculated count to the console.
  console.log( count ) ;

  // Return the count as the function's result.
  return count ;
}

// Export the Equals function for external use.
exports.Equals = Equals ;

// The DisjointSets class implements the Union-Find data structure.
// It manages a collection of DisjointSetTree instances.
var DisjointSets = /** @class */ (function () {

  // Constructor for DisjointSets.
  // It takes an array of DisjointSetTree objects.
  function DisjointSets( trees )
  {
    this.trees = trees ;
  }

  // Static method to construct a DisjointSets instance from N and xy data.
  // N represents the total number of elements.
  // xy is an array of objects, each containing x and y, representing connections.
  DisjointSets.buildFrom = function ( N , xy )
  {
    var trees = [ ] ;
    // Initialize N+1 DisjointSetTree instances.
    // The indexing typically starts from 1, so we need N+1 elements.
    for ( var i = 0 ; i <= N ; ++i )
    {
      trees.push( new DisjointSetTree( ) ) ;
    }

    // Iterate through each (x, y) pair in 'xy' and perform a union operation
    // between the sets containing x and y.
    xy.forEach( function ( _a ) {
      var x = _a.x ,
          y = _a.y ;
      return trees [ x ] . union ( trees [ y ] ) ;
    } ) ;

    // Return a new DisjointSets object containing the constructed trees.
    return new DisjointSets( trees ) ;
  } ;

  // Checks if two numbers (elements) are in the same disjoint set.
  // num1 and num2 are assumed to be indices corresponding to the 'trees' array.
  DisjointSets.prototype.areInSameSet = function ( num1 , num2 )
  {
    return this.trees[ num1 ] . isSameSetAs ( this.trees [ num2 ] ) ;
  } ;

  return DisjointSets ;
} ( ) ) ;

// The DisjointSetTree class represents an individual element (node) in a disjoint set.
// It keeps track of its parent and its rank (for union by rank optimization).
var DisjointSetTree = /** @class */ (function () {

  // Constructor for DisjointSetTree.
  // Initially, each element is its own parent and has a rank of 0.
  function DisjointSetTree( )
  {
    this.parent = this ;
    this.rank   = 0 ;
  }

  // Checks if this tree node is in the same set as another tree node.
  // This is determined by comparing their respective root elements (found via 'find').
  DisjointSetTree.prototype.isSameSetAs = function ( other )
  {
    return this.find ( ) === other.find ( ) ;
  } ;

  // Performs a union operation on two sets, using the "union by rank" heuristic.
  // It merges the set containing 'this' with the set containing 'other'.
  DisjointSetTree.prototype.union = function ( other )
  {
    var _a ;
    var xRoot = this.find ( ) ; // Find the root of the set containing 'this'.
    var yRoot = other.find ( ) ; // Find the root of the set containing 'other'.

    // If the roots are different, the sets are distinct and need to be merged.
    if ( xRoot !== yRoot )
    {
      // Attach the smaller rank tree under the root of the larger rank tree.
      // This helps in keeping the tree flat.
      if ( xRoot.rank < yRoot.rank )
      {
        _a      = [ yRoot , xRoot ] ,
        xRoot   = _a [ 0 ] ,
        yRoot   = _a [ 1 ] ;
      }
      yRoot.parent = xRoot ; // Make xRoot the parent of yRoot's root.

      // If ranks were equal, increment the rank of the new root.
      if ( yRoot.rank === xRoot.rank )
      {
        xRoot.rank = xRoot.rank + 1 ;
      }
    }
  } ;

  // Finds the representative (root) of the set to which this element belongs.
  // It uses path compression optimization for efficiency.
  DisjointSetTree.prototype.find = function ( )
  {
    try
    {
      // If this node is not its own parent, it means it's not the root.
      // Recursively find the root and compress the path.
      if ( this.parent !== this )
      {
        this.parent = this.parent.find ( ) ;
      }
    }
    catch ( e )
    {
      // An empty catch block; errors during find are ignored in this specific implementation.
    }
    return this.parent ; // Return the root of the set.
  } ;

  return DisjointSetTree ;
} ( ) ) ;

// Helper function to parse the raw input string into structured data.
// It assumes a specific format for the input lines.
function parseInput ( input )
{
  var _a    = input.split ( "\n" ) ,
      line0 = _a [ 0 ] ,
      line1 = _a [ 1 ] ,
      lines = _a . slice ( 2 ) ;

  // Parse the first line for N (number of elements) and M (number of connections, though M is not used here).
  var _b = parseSpaceSeparatedInts ( line0 ) ,
      N  = _b [ 0 ] ,
      M  = _b [ 1 ] ;

  // Parse the second line for the permutation array 'p'.
  var p = parseSpaceSeparatedInts ( line1 ) ;

  // Parse subsequent lines into an array of {x, y} objects.
  var xy = lines.map( function ( line ) {
    var _a = parseSpaceSeparatedInts ( line ) ,
        x  = _a [ 0 ] ,
        y  = _a [ 1 ] ;
    return { x : x , y : y } ;
  } ) ;

  // Return all parsed data as an object.
  return { N : N , M : M , p : p , xy : xy } ;
}

// Helper function to parse a space-separated string of integers into an array of numbers.
function parseSpaceSeparatedInts ( line )
{
  return line.split ( " " ) . map ( Number ) ;
}

// This section handles reading input from stdin and calling the main function.
// It's typically used in competitive programming environments.
// Don't edit this line!
try
{
  // Attempt to read input from standard input file '/dev/stdin'.
  Equals ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
}
catch ( e )
{
  // If an error occurs (e.g., file not found or permission issues), ignore it.
  // This often happens during local testing where /dev/stdin might not exist.
  // ignore
}
// Source mapping URL, usually generated by TypeScript compiler.
//# sourceMappingURL=Equals.js.map