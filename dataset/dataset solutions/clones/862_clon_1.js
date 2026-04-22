// This document presents a Type I clone of the original JavaScript source code.
// The primary goal is to introduce extensive variations in whitespace and comments
// across the entire file, making it visually distinct from the original.
//
// Crucially, all core elements such as identifiers (variable names, function names),
// operators, expressions, and the underlying logical structure remain absolutely identical.
// Only changes to spacing, indentation, line breaks, and comments are permitted.

print = console . log ; // Assign console.log to a shorter alias 'print'.

// Read input from /dev/stdin, decode as UTF-8, split by newlines, and remove the last (potentially empty) line.
ls = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf-8" ) . split ( "\n" ) ;
ls . length -- ; // Decrement length to discard the final empty string from splitting.


// --- Object Prototype Extensions ---

// Adds a 'trace' method to Object.prototype for debugging.
Object . prototype . trace = function ( ) {
  print ( this + "" ) ; // Converts the object to its string representation and prints it.
  return this ; // Returns the object itself, allowing for method chaining.
} ;


// --- String Prototype Extensions ---

// Adds an 'int' method to String.prototype to parse space-separated integers.
// 'c' is an optional delimiter; defaults to a space.
String . prototype . int = function ( c ) {
  return this . split ( c || " " ) . map ( int ) ; // Splits the string and maps each part to an integer.
} ;


// --- Array Prototype Extensions ---

var ap = Array . prototype ; // Create a short alias for Array.prototype for convenience.

// Adds a 'trace' method to Array.prototype for debugging.
ap . trace = function ( ) {
  print ( this ) ; // Prints the entire array.
  return this ; // Returns the array for chaining.
} ;

// Adds a 'max' method to Array.prototype to find the maximum value.
ap . max = function ( ) {
  return Math . max . apply ( null , this ) ; // Uses Math.max with apply to find the maximum.
} ;

// Adds a 'min' method to Array.prototype to find the minimum value.
ap . min = function ( ) {
  return Math . min . apply ( null , this ) ; // Uses Math.min with apply to find the minimum.
} ;

// Adds a 'copy' method to Array.prototype for a shallow copy.
ap . copy = function ( ) {
  return this . map ( id ) ; // Maps each element using the identity function to create a new array.
} ;

// Adds a 'rotate' method to Array.prototype to rotate array elements.
// 'n' specifies the number of positions to rotate.
ap . rotate = function ( n ) {
  return this . slice ( n , this . length ) . concat ( this . slice ( 0 , n ) ) ;
} ;

// Adds a 'permutation' method to Array.prototype to generate all permutations.
ap . permutation = function ( ) {
  if ( this . length == 0 ) return [ ] ; // Base case: no permutations for an empty array.
  if ( this . length == 1 ) return [ this ] ; // Base case: one permutation for a single-element array.

  var ret = [ ] , // Array to store all generated permutations.
      ar = this , // Reference to the array being permuted.
      i = 0 ;     // Loop counter.

  for ( ; i < ar . length ; ++ i )
    ret = ret . concat (
      ar . slice ( 0 , i )                      // Elements before the current one.
        . concat ( ar . slice ( i + 1 , ar . length ) ) // Elements after the current one.
        . permutation ( )                       // Recursively get permutations of the rest.
        . map ( function ( p ) { return p . concat ( ar [ i ] ) } ) // Append the current element.
    ) ;
  return ret ; // Return the complete list of permutations.
} ;

// Adds a 'flatten' method to Array.prototype to flatten a 2D array.
ap . flatten = function ( ) {
  for ( var i = 0 , ret = [ ] ; i < this . length ; ++ i )
    ret = ret . concat ( this [ i ] ) ; // Concatenate each sub-array.
  return ret ;
} ;

// Adds a 'nub' method to Array.prototype to remove duplicate elements (unique).
ap . nub = function ( ) {
  var that = this ; // Capture 'this' for use within the filter callback.
  return this . filter ( function ( x , i ) {
    return that . slice ( i + 1 ) . indexOf ( x ) < 0 ; // Keep only the first occurrence of each element.
  } ) ;
} ;


// --- Global Utility Functions ---

// Generates an array of numbers from 'b' (inclusive) to 'b + n*s' (exclusive).
function iota ( n , b , s ) {
  b = b || 0 ; // Default starting value is 0.
  s = s || 1 ; // Default step value is 1.
  for ( var ret = [ ] ; n -- ; b += s )
    ret . push ( b ) ; // Add the current number to the array.
  return ret ;
}

// Converts a string 's' to an integer.
function int ( s ) {
  return + s ; // Unary plus operator converts string to number.
}

// Adds two numbers 'a' and 'b'.
function add ( a , b ) {
  return a + b ;
}

// Subtracts 'b' from 'a'.
function sub ( a , b ) {
  return a - b ;
}

// Subtracts 'a' from 'b'.
function bus ( a , b ) {
  return b - a ;
}

// Identity function: returns its input 'x' unchanged.
function id ( x ) {
  return x ;
}


// --- Main Program Logic (Immediately Invoked Function Expression) ---
( function main ( ) {

  // Parse input values from 'ls' array.
  var n = + ls [ 0 ] , // Read N, the grid dimension (N x N).
      ab = ls [ 1 ] . int ( ) , // Read coordinates a, b from the second line.
      a = ab [ 0 ] - 1 , // Convert 'a' to 0-indexed.
      b = ab [ 1 ] - 1 , // Convert 'b' to 0-indexed.
      cd = ls [ 2 ] . int ( ) , // Read coordinates c, d from the third line.
      c = cd [ 0 ] - 1 , // Convert 'c' to 0-indexed.
      d = cd [ 1 ] - 1 ; // Convert 'd' to 0-indexed.

  var min = n * n ; // Initialize minimum distance with a large upper bound (N*N).

  // Helper function to calculate Manhattan distance between two points (p1, p2)
  // on a grid of width 'i_val'.
  function dis ( p1 , p2 , i_val ) {
    return Math . abs ( ( p1 % i_val ) - ( p2 % i_val ) ) + // Absolute difference in columns.
           Math . abs ( ( ( p1 / i_val ) | 0 ) - ( ( p2 / i_val ) | 0 ) ) ; // Absolute difference in rows.
  }

  // Iterate through all possible grid widths 'i' from 1 to N-1.
  for ( var i = 1 ; i < n ; ++ i ) {
    // Calculate total distance for the current grid width 'i'.
    var k = dis ( a , b , i ) + dis ( c , d , i ) ;
    // The following line was a commented-out debug print in the original code:
    // print ( i , dis ( a , b , i ) , dis ( c , d , i ) ) ;

    if ( min > k ) min = k ; // Update the minimum distance if 'k' is smaller.
  }

  print ( min ) ; // Output the final minimum calculated distance.

} ) ( ) ; // Invoke the main function immediately.

// vim: set ft=javascript: // Editor configuration hint (from original file).
// End of the Type I cloned code.