/*
 * This script processes input from standard input,
 * performs a union-find operation, and outputs a count.
 * It includes several utility functions for input parsing.
 */

var input = require( "fs" )
               . readFileSync( "/dev/stdin", "utf8" )
               . trim()
               . split( "\n" );

// An iterator-like object to manage input lines.
var obj = {

  "list"  :  input, // The array of input lines.
  "index" :  0,     // Current position in the list.
  "max"   :  input.length, // Total number of items.

  /**
   * Checks if there are more elements to iterate over.
   * @returns {boolean} True if there are more elements, false otherwise.
   */
  "hasNext" : function()
  {
    return ( this.index < this.max );
  },

  /**
   * Retrieves the next element from the list.
   * Throws an error if no more elements are available.
   * @returns {string} The next element.
   */
  "next" : function()
  {
    if ( ! this.hasNext() )
    {
      throw "NoSuchElementException:次に要素は無いよ"; // Error message for end of input.
    }

    var returnObj = this.list[ this.index ]; // Get the current element.
    this.index++;                             // Advance the index.

    return returnObj; // Return the element.
  }
};


// Execute the main logic of the program.
Main();


// --- Utility functions for input parsing and output ---

/**
 * Gets the next line from the input iterator.
 * @returns {string} The next input line.
 */
function next()
{
  return obj.next();
}


/**
 * Parses the next input line as an integer.
 * @returns {number} The parsed integer.
 */
function nextInt()
{
  return myconv( next(), 1 );
}


/*
 * Parses the next input line into an array of strings,
 * split by half-width spaces.
 */
function nextStrArray()
{
  return myconv( next(), 2 );
}


/**
 * Parses the next input line into an array of numbers,
 * split by half-width spaces.
 */
function nextIntArray()
{
  return myconv( next(), 4 );
}


// Parses the next input line into an array of characters.
function nextCharArray()
{
  return myconv( next(), 6 );
}


/**
 * Checks if there are more lines in the input.
 * @returns {boolean} True if more lines exist, false otherwise.
 */
function hasNext()
{
  return obj.hasNext();
}


// Outputs a value to standard output, followed by a newline.
function myout( t )
{
  console.log( t );
}


// Outputs a value to standard error, followed by a newline.
function myerr( t )
{
  console.error( t );
}


/*
 * myconv function options (second argument 'no'):
 * ------------------------------------------------
 *  Default: Returns input as is (for unknown/invalid 'no').
 *  1: Converts input to an integer (parseInt).
 *  2: Splits input string by spaces into an array of strings.
 *  4: Splits input string by spaces and converts each part to a Number, returning an array of numbers.
 *  6: Splits input string into an array of individual characters.
 *  7: Splits input string into an array of characters and converts each to a Number.
 *  8: Joins an array of elements with spaces.
 *  9: Joins an array of elements with newlines.
 *  0: Joins an array of elements without any separator.
 */


/**
 * Implements a Union-Find data structure.
 * @param {number} n The initial number of elements.
 * @returns {object} The Union-Find object.
 */
function unionFind( n )
{
  var uf = {
    /*
     * The internal list representing the disjoint set.
     * Each element is either:
     *   - A negative number: This element is a root, and its absolute value is the size of the set.
     *   - A non-negative number: This element's parent index.
     * Initially, all elements are roots of sets of size 1 (-1).
     */
    "list" : new Array( n ) . fill( -1 ),


    /**
     * Checks if two elements belong to the same set.
     * @param {number} mae Index of the first element.
     * @param {number} ato Index of the second element.
     * @returns {boolean} True if they are in the same set, false otherwise.
     */
    "isSame" : function( mae, ato )
    {
      return this.getRootIndex( mae ) == this.getRootIndex( ato );
    },


    /**
     * Finds the root (representative) of the set containing the given element.
     * Uses path compression for optimization: updates parents along the path to point directly to the root.
     * @param {number} index The element's index.
     * @returns {number} The root index of the set.
     */
    "getRootIndex" : function( index )
    {
      if ( this.list[ index ] < 0 )
      {
        return index; // 'index' is a root.
      }
      else
      {
        // Path compression: set parent to the root of its current parent.
        this.list[ index ] = this.getRootIndex( this.list[ index ] );
        return this.list[ index ];
      }
    },


    /**
     * Merges two sets. If the elements are already in the same set, nothing happens.
     * It merges the smaller set into the larger set (union by size/rank heuristic).
     * @param {number} mae Index of an element in the first set.
     * @param {number} ato Index of an element in the second set.
     */
    "doUnion" : function( mae, ato )
    {
      var maeRoot = this.getRootIndex( mae ); // Find root of first element's set.
      var atoRoot = this.getRootIndex( ato ); // Find root of second element's set.

      if ( ! this.isSame( maeRoot, atoRoot ) ) // Only union if they are in different sets.
      {
        // Union by size: attach smaller tree to root of larger tree.
        if ( maeRoot >= atoRoot ) // Note: this comparison (>=) effectively means "if mae's root index is numerically larger or equal to ato's root index", it's not directly about size.
                                  // The original code has a potential bug/misinterpretation here for union by size.
                                  // It should compare this.list[maeRoot] and this.list[atoRoot] (which are negative sizes).
                                  // However, Type I clone means no logical change, so I keep the original comparison.
        {
          this.list[ maeRoot ] += this.list[ atoRoot ]; // Update size of new root.
          this.list[ atoRoot ] = maeRoot;               // Make maeRoot the parent of atoRoot.
        }
        else
        {
          this.list[ atoRoot ] += this.list[ maeRoot ]; // Update size of new root.
          this.list[ maeRoot ] = atoRoot;               // Make atoRoot the parent of maeRoot.
        }
      }
    },


    /**
     * Gets the size of the set containing the given element.
     * @param {number} index The element's index.
     * @returns {number} The size of the set.
     */
    "getSize" : function( index )
    {
      // The root stores the negative size of its set.
      return -this.list[ this.getRootIndex( index ) ];
    }
  };

  return uf; // Return the created Union-Find object.
}


/**
 * A versatile conversion utility function.
 * @param {any} i The input to convert.
 * @param {number} no The conversion type (see comments above for details).
 * @returns {any} The converted value.
 */
function myconv( i, no )
{
  try
  {
    switch ( no )
    {
      case 1:
        return parseInt( i ); // Convert to integer.
      case 2:
        return i.split( " " ); // Split by space.
      case 4:
        return i.split( " " ) . map( ( a ) => Number( a ) ); // Split by space and convert to numbers.
      case 6:
        return i.split( "" ); // Split into characters.
      case 7:
        return i.split( "" ) . map( ( a ) => Number( a ) ); // Split into characters and convert to numbers.
      case 8:
        return i.join( " " ); // Join with spaces.
      case 9:
        return i.join( "\n" ); // Join with newlines.
      case 0:
        return i.join( "" ); // Join without separator.
      default:
        return i; // No conversion, return as is.
    }
  }
  catch ( e )
  {
    return i; // In case of error during conversion, return original input.
  }
}


/**
 * The main function where the program's primary logic resides.
 * It reads N and M, then N numbers, then M pairs for union-find operations.
 * Finally, it counts elements where their value (minus 1) is in the same set as their index.
 */
function Main()
{
  var one  = nextIntArray(); // Read N and M (first line).
  var N    = one[ 0 ];       // Number of elements.
  var M    = one[ 1 ];       // Number of union operations.

  var list = nextIntArray(); // Read the N numbers.

  var uf   = unionFind( N ); // Initialize Union-Find structure for N elements.

  // Perform M union operations.
  for ( var i = 0; i < M; i++ )
  {
    var tmp = nextIntArray(); // Read a pair (u, v) for union.
    // Adjust to 0-based indexing for union-find.
    uf.doUnion( tmp[ 0 ] - 1, tmp[ 1 ] - 1 );
  }

  var count = 0; // Initialize counter for matching elements.

  // Iterate through the list and check the condition.
  for ( var i = 0; i < N; i++ )
  {
    var now = list[ i ] - 1; // Get the value from list[i] and adjust to 0-based.

    // Check if the adjusted value and the current index are in the same set.
    if ( uf.isSame( now, i ) )
    {
       count++; // Increment count if they are in the same set.
    }
  }

  myout( count ); // Output the final count.
}