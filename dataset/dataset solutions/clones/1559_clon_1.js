/*
 * This is a Type I clone of an original JavaScript file.
 * The purpose is to demonstrate code cloning where only
 * whitespace and comments are altered.
 * All identifiers, operators, and logical structures
 * remain exactly as they were in the source code.
 */

"use strict"; // Enforces strict mode for cleaner code.

// --- Input/Output Utility Functions ---

/*
 * Reads the entire content of standard input synchronously.
 * It expects input from a file typically redirected to /dev/stdin.
 */
var input = require("fs") . readFileSync( "/dev/stdin" , "utf8" ) ;

/*
 * Splits the input string by spaces or newlines into an array.
 * 'cin' (current input) stores these tokens.
 * 'cid' (current input index) tracks the current position in 'cin'.
 */
var cin = input . split( / |\n/ ) ,
    cid = 0
    ;

/*
 * Retrieves the next token from the input array 'cin'
 * and converts it to a number.
 */
function next ( )
{
  return + cin [ cid ++ ] ; // Unary plus operator converts string to number.
}

/*
 * Retrieves the next token from the input array 'cin'
 * as a string.
 */
function nextstr ( )
{
  return cin [ cid ++ ] ;
}

/*
 * Retrieves the next token from the input array 'cin'
 * and converts it to a BigInt.
 */
function nextbig ( )
{
  return BigInt ( cin [ cid ++ ] ) ;
}

/*
 * Retrieves 'n' tokens from 'cin'.
 * If 'a' is true, returns them as strings.
 * Otherwise, converts them to numbers.
 */
function nexts ( n , a )
{
  return a
         ? cin . slice ( cid , cid += n )
         : cin . slice ( cid , cid += n ) . map ( a => + a )
         ;
}

/*
 * Retrieves 'n' tokens, converts them to numbers, and sorts them.
 * If 'a' is true, sorts in descending order (b-a).
 * Otherwise, sorts in ascending order (a-b).
 */
function nextssort ( n , a )
{
  return a
         ? cin . slice ( cid , cid += n ) . map ( a => + a ) . sort ( ( a , b ) => b - a )
         : cin . slice ( cid , cid += n ) . map ( a => + a ) . sort ( ( a , b ) => a - b )
         ;
}

/*
 * Reads a 2D array (matrix) of dimensions h x w.
 * If 'a' is true, elements are strings.
 * Otherwise, elements are numbers.
 */
function nextm ( h , w , a )
{
  var r = [ ] , // Result array
      i = 0
      ;

  if ( a )
  {
    for ( ; i < h ; i ++ )
    {
      r . push ( cin . slice ( cid , cid += w ) ) ;
    }
  }
  else
  {
    for ( ; i < h ; i ++ )
    {
      r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
    }
  }
  return r ;
}

/*
 * Creates a multi-dimensional array dynamically using eval.
 * The dimensions are passed as arguments after 'v'.
 * 'v' is the initial value for the innermost array elements.
 * This function is generally considered unsafe due to 'eval'.
 */
function xArray ( v )
{
  var a = arguments ,
      l = a . length ,
      r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})"
      ;

  while ( -- l )
  {
    r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
  }
  return eval ( r ) ;
}

// --- Union-Find Data Structure ---

/*
 * Implements the Union-Find (Disjoint Set Union) data structure.
 * Used for tracking connected components in a graph or grouping elements.
 */
class unionFind
{
  /*
   * Constructor initializes an array 'a' of size n+1.
   * Each element is set to -1, indicating it's a root and its
   * subtree size is 1 (represented by -1).
   */
  constructor ( n )
  {
    this . a = Array ( n + 1 ) . fill ( - 1 ) ;
  }

  /*
   * Finds the root of the set containing element 'i' with path compression.
   * If a[i] is negative, 'i' is the root.
   * Otherwise, recursively finds the root and updates a[i] to point directly to it.
   */
  root ( i )
  {
    return this . a [ i ] < 0
           ? i
           : ( this . a [ i ] = this . root ( this . a [ i ] ) )
           ;
  }

  /*
   * Checks if two elements 'x' and 'y' belong to the same set.
   * This is true if their roots are identical.
   */
  same ( x , y )
  {
    return this . root ( x ) === this . root ( y ) ;
  }

  /*
   * Merges the sets containing elements 'x' and 'y'.
   * Uses union by size heuristic. The smaller tree's root
   * points to the larger tree's root.
   * Returns true if a merge occurred, false if they were already in the same set.
   */
  unite ( x , y )
  {
    const a = this . a ;
    x = this . root ( x ) ;
    y = this . root ( y ) ;

    if ( x === y )
    {
      return false ;
    }

    if ( a [ y ] < a [ x ] ) // y's tree is larger/equal (more negative value implies larger absolute size)
    {
      a [ y ] += a [ x ] ; // Add size of x's tree to y's tree
      a [ x ] = y ;        // Make y the parent of x
    }
    else                     // x's tree is larger
    {
      a [ x ] += a [ y ] ; // Add size of y's tree to x's tree
      a [ y ] = x ;        // Make x the parent of y
    }
    return true ;
  }

  /*
   * Returns the size of the set containing element 'i'.
   * The size is stored as the negative value at the root of the set.
   */
  size ( i )
  {
    return - this . a [ this . root ( i ) ] ;
  }
}

// --- Main Program Execution ---

/*
 * Calls the main logic function.
 * The result is stored in 'myOut'.
 */
var myOut = main ( ) ;

/*
 * If 'myOut' has a defined value (i.e., not 'undefined'),
 * it is converted to a string and printed to the console.
 */
if ( myOut !== undefined )
{
  console . log ( String ( myOut ) ) ;
}

/*
 * The primary function containing the problem's solution logic.
 * This specific problem likely involves finding connected components.
 */
function main ( )
{
  // Read two integers, 'n' and 'm', from input.
  var n = next ( ) ,
      m = next ( )
      ;

  // Initialize a Union-Find structure for 'n' elements.
  var uf = new unionFind ( n ) ;

  // Process 'm' union operations.
  // Each operation reads two elements 'a' and 'b' and unites their sets.
  for ( var i = 0 ; i < m ; i ++ )
  {
    var [ a , b ] = nexts ( 2 ) ; // Reads two numbers from input.
    uf . unite ( a , b ) ;        // Unites the sets containing 'a' and 'b'.
  }

  /*
   * After all unions, the 'uf.a' array contains negative values at roots,
   * representing the size of the component (negated).
   * Positive values are pointers to parents.
   * We are interested in the largest component size.
   * Math.min(...uf.a) finds the smallest (most negative) root value.
   * Negating this value gives the largest component size.
   */
  return - Math . min ( ... uf . a ) ;
}