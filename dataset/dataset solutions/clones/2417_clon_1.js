/*
 * This file contains a JavaScript program designed to interact with an external system
 * by making queries and processing responses. It uses a generator function for asynchronous
 * operations and a custom array initialization utility.
 */

"use strict";

// Custom utility function to create multi-dimensional arrays.
// It dynamically constructs and evaluates a string representing array creation.
function xArray( v )
{
  var a = arguments , l = a . length ,
      r = "Array(a[" + --l + "]) . fill(0) . map(x => { return " + v + "; })";
  /*
   * The loop iteratively wraps the array creation string
   * to build the desired multi-dimensional structure.
   */
  while ( --l )
  {
    r = "Array(a[" + l + "]) . fill(0) . map(x => " + r + ")";
  }
  // Evaluate the dynamically constructed string to create the array.
  return eval(r) ;
}


// Initialize readline interface for standard input and output.
const rl = require("readline") . createInterface ( process . stdin , process . stdout ) ;


// Define a generator function 'g' to manage the asynchronous query process.
const g = ( function * ( )
{

  // Helper function to get a single line of input using the readline interface.
  const gets = ( ) =>
  {
    return rl . once ( "line" , s => g . next ( s ) ) ;
  } ; // End of gets function definition.


  // Step 1: Get the initial value for 'n'.
  var n = yield gets ( ) ;
  // Convert 'n' to a number.
  n = +n ;


  // Initialize array 'p'.
  var p = [ ] ;

  // Populate 'p' with numbers from 1 to 'n'.
  for ( var i = 1 ; i <= n ; i ++ )
  {
    p [ i - 1 ] = i ;
  }


  // Output the first query.
  console . log ( "?" , p . join ( " " ) ) ;


  // Get the response for the first query.
  var s = yield gets ( ) ;


  // Initialize 'x' for the subsequent loop.
  var x = 1 ;


  // Loop to find a specific condition.
  while ( 1 )
  {

    // Modify 'p' based on 'x' and 'n'.
    p [ x - 1 ] = x + n ;

    // Output the modified query.
    console . log ( "?" , p . join ( " " ) ) ;

    // Get the response for the current query.
    var t = yield gets ( ) ;

    // Check if the first character of responses 's' and 't' are different.
    if ( s [ 0 ] !== t [ 0 ] )
    {
      break ; // Exit the loop if they differ.
    }

    // Increment 'x'.
    x ++ ;

  } // End of while loop.


  // Initialize arrays for the final answer and temporary queries.
  var ans = [ ] ;
  var q = [ ] ;
  var set = new Set ( ) ;


  // Populate 'p', 'q', and 'set' for the next phase.
  for ( var i = 0 ; i < n - 1 ; i ++ )
  {

    p [ i ] = ( x + i ) % ( 2 * n ) + 1 ;
    q [ i ] = ( p [ i ] + n ) % ( 2 * n ) + 1 ;
    set . add ( p [ i ] ) ;

  } // End of first for loop.


  // Iterate through a range to determine final answers.
  for ( var i = 1 ; i <= 2 * n ; i ++ )
  {

    // Check if 'i' is present in the 'set'.
    if ( set . has ( i ) )
    {
      // If 'i' is in set, modify 'q'.
      q [ n - 1 ] = i ;

      // Output query with 'q'.
      console . log ( "?" , q . join ( " " ) ) ;

      // Get response.
      var t = yield gets ( ) ;

      // Assign 'R' or 'B' to 'ans' based on response.
      if ( t [ 0 ] === "R" )
      {
        ans [ i - 1 ] = "R" ;
      }
      else
      {
        ans [ i - 1 ] = "B" ;
      }

    }
    else
    {
      // If 'i' is not in set, modify 'p'.
      p [ n - 1 ] = i ;

      // Output query with 'p'.
      console . log ( "?" , p . join ( " " ) ) ;

      // Get response.
      var t = yield gets ( ) ;

      // Assign 'R' or 'B' to 'ans' based on response.
      if ( t [ 0 ] === "R" )
      {
        ans [ i - 1 ] = "R" ;
      }
      else
      {
        ans [ i - 1 ] = "B" ;
      }

    } // End of if-else block.

  } // End of second for loop.


  // Output the final answer.
  console . log ( "!" , ans . join ( "" ) ) ;

} ) ( ) ; // Immediately invoke the generator function.


// Start the generator execution.
g . next ( ) ;