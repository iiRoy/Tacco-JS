// Enable strict mode for better error handling and cleaner code.
"use strict"

// This function creates an input reader object.
const create = ( ) => {

  // Read input from standard input, trim whitespace, and split into lines.
  const input = require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) . trim ( ) . split ( "\n" ) ;

  // Initialize the reader object with the input list, current index, and maximum length.
  const res = {
    "list" : input ,
    "index" : 0 ,
    "max" : input . length ,
    // Method to check if there are more elements to read.
    "hasNext" : function ( ) { return this . index < this . max } ,
    // Method to get the next element from the input list.
    "next" : function ( ) {
      // Check if there are elements remaining.
      if ( ! this . hasNext ( ) ) {
        // Throw an error if no more elements.
        throw "ArrayIndexOutOfBoundsException" ;
      } else {
        // Return the current element and increment the index.
        return this . list [ this . index ++ ] ;
      }
    }
  } ;
  // Return the configured input reader.
  return res ;
}

// Create an instance of the input reader.
const o = create ( ) ;

// Helper function to get the next line as a string.
const next = ( ) => o . next ( )

// Helper function to get the next line as an integer.
const nextInt = ( ) => parseInt ( o . next ( ) )

// Helper function to get the next line as a string array (space-separated).
const nextStrArray = ( ) => o . next ( ) . split ( " " )

// Helper function to get the next line as an integer array (space-separated).
const nextIntArray = ( ) => o . next ( ) . split ( " " ) . map ( el => parseInt ( el ) )

// Helper function to get the next line as a character array.
const nextCharArray = ( ) => o . next ( ) . split ( "" )

// Helper function to check if there is more input.
const hasNext = ( ) => o . hasNext ( )

// Helper function for console output.
const myout = ( ... x ) => console . log ( ... x )

// This function calculates the factorial of a given number x.
const fn = ( x ) => {
  let ans = 1
  // Loop from 1 up to x to compute the factorial.
  for ( let i = 1 ; i <= x ; i ++ ) {
    ans *= i
  }
  return ans
}

// The main function where the program logic resides.
const Main = ( ) => {

  // Read two integers from the input.
  const [ n , m ] = nextIntArray ( )

  // Check the absolute difference between n and m.
  if ( Math . abs ( n - m ) > 1 ) {
    // If the difference is greater than 1, print 0 and exit.
    console . log ( 0 )
    return
  }

  // Define a modulo constant.
  const MOD = 1e9 + 7
  let ans = 1

  // Calculate factorial of n modulo MOD.
  for ( let i = 1 ; i <= n ; i ++ ) {
    ans = ( ans % MOD ) * ( i % MOD )
  }

  // Calculate factorial of m modulo MOD and multiply with current ans.
  for ( let i = 1 ; i <= m ; i ++ ) {
    ans = ( ans % MOD ) * ( i % MOD )
  }

  // Check if n and m are equal.
  if ( n == m ) {
    // If equal, multiply the result by 2 and apply modulo.
    console . log ( 2 * ans % MOD )
  } else {
    // Otherwise, just apply modulo to the result.
    console . log ( ans % MOD )
  }
}

// Execute the main function to start the program.
Main ( )