"use strict" // Enable strict mode for cleaner code.

// Function to create an input reader object.
const create = ( ) =>
{
  // Read input from standard in, trim whitespace, and split by newlines.
  const input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ;

  // The reader object structure.
  const res = {
    "list" : input , // Store the array of input lines.
    "index" : 0 , // Current position in the input array.
    "max" : input . length , // Total number of input lines.

    // Checks if there are more elements to read.
    "hasNext" : function ( ) { return this . index < this . max } ,

    // Returns the next element from the input.
    "next" : function ( )
    {
      if ( ! this . hasNext ( ) )
      { // If no more elements, throw an error.
        throw "ArrayIndexOutOfBoundsException" ;
      }
      else
      { // Otherwise, return the current element and advance the index.
        return this . list [ this . index ++ ] ;
      }
    }
  } ; // End of reader object definition.
  return res ;
}

// Global reader instance.
const o = create ( ) ; // Initialize the input reader.

// Helper function to get the next line.
const next = ( ) => o . next ( )

// Helper function to get the next line as an integer.
const nextInt = ( ) => parseInt ( o . next ( ) )

// Helper function to get the next line as a string array.
const nextStrArray = ( ) => o . next ( ) . split ( " " )

// Helper function to get the next line as an array of integers.
const nextIntArray = ( ) => o . next ( ) . split ( " " ) . map ( el => parseInt ( el ) )

// Helper function to get the next line as a character array.
const nextCharArray = ( ) => o . next ( ) . split ( "" )

// Helper function to check if there is more input.
const hasNext = ( ) => o . hasNext ( )

// Custom output function for convenience.
const myout = ( ...x ) => console . log ( ...x )

// Main execution logic.
const Main = ( ) => {
  let n = nextInt ( ) // Read the first integer, which is 'n'.
  let p = new Array ( n ) . fill ( 0 ) // Initialize an array 'p' of size 'n' with zeros.

  // Declare arrays 'a' and 'b' to store parsed input.
  let a = [ ]
  let b = [ ]

  // Loop to read 'n' pairs of integers.
  while ( hasNext ( ) )
  {
    let tmp = nextIntArray ( ) // Read a line and parse it into an integer array.
    a . push ( tmp [ 0 ] ) // Add the first element to array 'a'.
    b . push ( tmp [ 1 ] ) // Add the second element to array 'b'.
  }

  // Initialize a temporary variable for calculations.
  let tmp = 0

  // Loop backwards from n-1 down to 0.
  for ( let i = n - 1 ; i >= 0 ; i -- )
  {
    let mul = 1 // Initialize multiplier.
    // Inner loop to find the smallest 'mul' that satisfies the condition.
    while ( mul * b [ i ] < a [ i ] + tmp )
    {
      mul ++ // Increment multiplier.
    }
    // Calculate and store a value in array 'p'.
    p [ i ] = mul * b [ i ] - a [ i ] - tmp
    // Update the temporary variable.
    tmp += p [ i ]
  }

  // Calculate the sum of elements in array 'p'.
  let ans = p . reduce ( ( acc , curr ) => acc + curr )
  // Output the final answer to the console.
  console . log ( ans )
}

// Execute the main function.
Main ( )