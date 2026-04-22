/* This script processes input from standard input,
 * performs Union-Find operations, and outputs results.
 * It includes utility functions for input parsing and output.
 */


 var input  = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ; /* Reads entire file, trims whitespace, and splits by newline character */


 // This 'obj' object acts as a custom iterator for the input lines.
var obj = {
  "list" : input /* The array of input lines */ ,
  "index" : 0 , // Current position in the input array
  "max" : input . length , // Total number of lines
  "next" : function ( ) { /* Retrieves the next element from the input list. */
    if ( ! this . hasNext ( ) ) {
      throw "NoSuchElementException:次に要素は無いよ" ; // Error if no more elements are available
    }
    // Store the current object before incrementing the index
    var returnObj = this . list [ this . index ] ;
    this . index ++ ; /* Move to the next element */
    return returnObj ;
  } ,
  "hasNext" : function ( ) { // Checks if there are more elements to iterate over
    return ( this . index < this . max ) ;
  }
} ;


// Main program entry point
Main ( ) ;


  /* Function to get the next item from the custom iterator */
function next ( ) {
  return obj . next ( ) ;
}


  /* Function to get the next item as an integer */
function nextInt ( ) {
  return myconv ( next ( ) , 1 ) ;
}


  /* Function to get the next item as a string array, split by space */
function nextStrArray ( ) {
  return myconv ( next ( ) , 2 ) ; // Delimits by half-width space
}


  /* Function to get the next item as an integer array, split by space */
function nextIntArray ( ) {
  return myconv ( next ( ) , 4 ) ; // Delimits by half-width space and converts to numbers
}


  /* Function to get the next item as a character array */
function nextCharArray ( ) {
  return myconv ( next ( ) , 6 ) ; // Splits into individual characters
}


  /* Function to check if there are more items in the custom iterator */
function hasNext ( ) {
  return obj . hasNext ( ) ;
}


  /* Utility function for standard output */
function myout ( t ) {
  console . log ( t ) ;
}


  /* Utility function for standard error output */
function myerr ( t ) {
  console . error ( t ) ;
}


/*
 * myconv function: Handles various conversions for input data.
 *
 * [no] parameter specifies the conversion type:
 *  - Unknown/Error: Returns the input 'i' as is.
 *  - 1: Converts 'i' to an integer.
 *  - 2: Splits 'i' by half-width spaces into a string array.
 *  - 4: Splits 'i' by half-width spaces and converts elements to numbers, returning an array of numbers.
 *  - 6: Splits 'i' into a character array.
 *  - 7: Splits 'i' into a character array and converts elements to numbers, returning an array of numbers.
 *  - 8: Joins elements of 'i' (assumed to be an array) with half-width spaces.
 *  - 9: Joins elements of 'i' (assumed to be an array) with newlines.
 *  - 0: Joins elements of 'i' (assumed to be an array) without any separator.
 */
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1 :
        return parseInt ( i ) ;
      case 2 :
        return i . split ( " " ) ;
      case 4 :
        return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;
      case 6 :
        return i . split ( "" ) ;
      case 7 :
        return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
      case 8 :
        return i . join ( " " ) ;
      case 9 :
        return i . join ( "\n" ) ;
      case 0 :
        return i . join ( "" ) ;
      default :
        return i ;
    }
  } catch ( e ) {
    return i ;
  }
}


/*
 * The main function where the program logic resides.
 * It uses a Union-Find data structure to process queries.
 */
function Main ( ) {

  // Definition of the Union-Find data structure object.
  var unionFind = {
    "list" : null , // The internal array representing the disjoint sets.
    // Each index holds either:
    //   -X (if it's a root, where X is the absolute size of the group)
    //   The index of its parent (if it's not a root).
    // Initially, all elements are roots of their own group of size 1.

    "init" : function ( n ) { // Initializes the Union-Find structure with 'n' elements.
      this . list = new Array ( n ) . fill ( -1 ) ;
    } ,

    // Checks if two elements 'mae' and 'ato' belong to the same set.
    "isSame" : function ( mae , ato ) {
      return this . getRootIndex ( mae ) == this . getRootIndex ( ato ) ;
    } ,

    // Finds the root (representative) of the set containing 'index'.
    // Also performs path compression for optimization.
    "getRootIndex" : function ( index ) {
      if ( this . list [ index ] < 0 ) {
         return index ; // 'index' is a root if its value is negative.
      } else {
         // Path compression: set parent of 'index' directly to the root.
         this . list [ index ] = this . getRootIndex ( this . list [ index ] ) ;
        return this . list [ index ] ;
      }
    } ,

    // Merges the sets containing 'mae' and 'ato'.
    // Uses union by size heuristic.
    "doUnion" : function ( mae , ato ) {
      var maeRoot = this . getRootIndex ( mae ) ; // Find root of 'mae'
      var atoRoot = this . getRootIndex ( ato ) ; // Find root of 'ato'

      if ( ! this . isSame ( maeRoot , atoRoot ) ) { // Only merge if they are in different sets
         if ( maeRoot >= atoRoot ) { // Heuristic: Attach smaller tree to larger tree.
            // If maeRoot's group is larger or equal, attach atoRoot's group to maeRoot.
            this . list [ maeRoot ] += this . list [ atoRoot ] ; // Update size of maeRoot's group
           this . list [ atoRoot ] = maeRoot ; // Make maeRoot the parent of atoRoot
         } else {
            // If atoRoot's group is larger, attach maeRoot's group to atoRoot.
            this . list [ atoRoot ] += this . list [ maeRoot ] ; // Update size of atoRoot's group
           this . list [ maeRoot ] = atoRoot ; // Make atoRoot the parent of maeRoot
         }
      }
    } ,

    // Returns the size of the set containing 'index'.
    // The size is stored as the negative value of the root's entry.
    "getSize" : function ( index ) {
      return - this . list [ this . getRootIndex ( index ) ] ;
    }
  } ;


  // Read the first line of input, which contains N and Q.
  var one = nextIntArray ( ) ;
  var N = one [ 0 ] ; // Number of elements for Union-Find
  var Q = one [ 1 ] ; // Number of queries

  unionFind . init ( N ) ; // Initialize the Union-Find structure with N elements.

  var output = [ ] ; // Array to store results of 'isSame' queries.

  // Process Q queries.
  for ( var i = 0 ; i < Q ; i ++ ) {
    var query = nextIntArray ( ) ; // Read the current query.

    if ( query [ 0 ] == 0 ) { // Query type 0: Union operation
       unionFind . doUnion ( query [ 1 ] , query [ 2 ] ) ;
    } else { // Query type 1: Check if same set
       if ( unionFind . isSame ( query [ 1 ] , query [ 2 ] ) ) {
          output . push ( "Yes" ) ;
       } else {
          output . push ( "No" ) ;
       }
    }
  }


  // Output all collected results, joined by newlines.
  myout ( myconv ( output , 9 ) ) ;
}