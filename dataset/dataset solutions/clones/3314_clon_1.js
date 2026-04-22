/*
 * This file contains a solution for a programming problem.
 * It uses a custom input reader utility for competitive programming.
 *
 * Author: [Anonymous]
 * Date: [Current Date]
 * Version: 1.0.0
 *
 * Disclaimer: This code is provided as-is, without any warranty.
 * Please review and understand the logic before use.
 */

// Define a module for input processing using an Immediately Invoked Function Expression (IIFE).
var GET = (  function ( )  {

  // The main function exposed by the GET module.
  // It initializes a new instance of the input reader.
  function f ( s )  {
    // Return a new input reader object.
    return   new   g ( s ) ;
  }


  // Constructor for the input reader object.
  // 's' is the raw string input, typically read from a file.
  function g ( s )  {
    /* Initialize the internal string array.
     * Trim whitespace from the input string and split it by newline characters. */
    this . _s = s . trim ( ) . split ( "\n" ) ;

    // Initialize the line pointer (current line index).
    this . _y = 0 ;
  }


  // --- Prototype methods for the input reader 'g' ---


  // Method 'a': Reads a single token from the current line.
  // If the current line is a string, it reverses the order of tokens.
  // 'f' is a boolean flag: if true, returns the token as a string; otherwise, as a number.
  g . prototype . a = function ( f )  {
    // Get a reference to the internal string array and the current line index.
    var s = this . _s ,
        y = this . _y ,
        r ; // Variable to store the result.

    // Check if the current line content is still a string.
    // If it is, it means it hasn't been processed yet.
    if ( typeof   s [ y ]   ===   "string" )
        {
          // Split the line into tokens, then reverse their order.
          // This allows 'pop' to read tokens from left to right.
          s [ y ]   =   s [ y ] . split ( " " ) . reverse ( ) ;
        }

    // Pop the last token (which is effectively the first token due to reversal).
    r = s [ y ] . pop ( ) ;

    // If the current line is now empty, advance to the next line.
    if ( ! s [ y ] . length )
        {
          this . _y ++ ;
        }

    // Return the token, either as a string or converted to a number.
    return   f ? r : + r ;
  } ;


  // Method 'l': Reads an entire line of tokens.
  // Advances the line pointer after reading.
  // 'f' is a boolean flag: if true, returns tokens as strings; otherwise, as numbers.
  g . prototype . l = function ( f )  {
    // Get the current line, split it into tokens, and then advance the line pointer.
    var s = this . _s [ this . _y ++ ] . split ( " " ) ;

    // Return the tokens, either as strings or mapped to numbers.
    return   f ? s : s . map ( a => + a ) ;
  } ;


  // Method 'm': Reads 'n' lines, parsing each into an array of tokens.
  // Advances the line pointer by 'n'.
  // 'f' is a boolean flag: if true, returns tokens as strings; otherwise, as numbers.
  g . prototype . m = function ( n , f )  {
    // Slice 'n' lines from the input array, then map each line.
    // Each line is split into tokens.
    var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;

    // Return the 2D array of tokens, with an optional conversion to numbers.
    return   f ? r : r . map ( a => a . map ( a => + a ) ) ;
  } ;


  // Method 'r': Reads 'n' raw lines without splitting them into tokens.
  // Advances the line pointer by 'n'.
  // 'f' is a boolean flag: if true, returns lines as strings; otherwise, attempts to convert each line to a number.
  g . prototype . r = function ( n , f )  {
    // Slice 'n' lines directly from the input array.
    var r = this . _s . slice ( this . _y , this . _y += n ) ;

    // Return the array of lines, with an optional conversion to numbers.
    return   f ? r : r . map ( a => + a ) ;
  } ;


  // The IIFE returns the 'f' function, which is the main entry point for the input reader.
  return f ;

} ) ( ) ;


// Initialize the input reader 'o' by reading the content of /dev/stdin.
// The 'require("fs").readFileSync' method is used to read the file synchronously.
// The file content is expected to be UTF-8 encoded.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


// Call the main function and print its return value to the console.
console . log ( main ( ) ) ;


/**
 * The primary function that encapsulates the problem's logic.
 * Reads input using the 'o' (GET) object and computes the result.
 * @returns {number} The computed answer.
 */
function main ( )  {

  // Read the first integer, 'n', from the input.
  var n = o . a ( ) ;

  // Read the second integer, 'm', from the input.
  var m = o . a ( ) ;

  // Read 'm' lines, each containing two integers, into a 2D array 'x'.
  var x = o . m ( m ) ;

  // Initialize an array 'z' of size n+1 with all elements set to 1.
  // This array likely acts as a visited/status tracker.
  var z = Array ( n + 1 ) . fill ( 1 ) ;

  // Initialize an array 'p' of size n+1, where each element is an empty array.
  // This array likely represents an adjacency list or similar structure.
  var p = Array ( n + 1 ) . fill ( 0 ) . map ( a => [ ] ) ;

  // Process the 'm' input relations stored in 'x'.
  // This loop populates 'z' and 'p' based on the input.
  for ( var i = 0 ;   i < m ;   i ++ )  {
    // Mark the first element of the current relation as 0 in array 'z'.
    z [ x [ i ] [ 0 ] ] = 0 ;

    // Add the first element of the current relation to the adjacency list
    // corresponding to the second element of the current relation.
    p [ x [ i ] [ 1 ] ] . push ( x [ i ] [ 0 ] ) ;
  }


  // Initialize the answer variable to -1.
  var ans = -1 ;

  // Initialize an array 'y' to store starting nodes or current nodes for processing.
  var y = [ ] ;

  // Populate 'y' with nodes 'i' for which z[i] is true (i.e., z[i] is 1).
  // This typically means finding unvisited or initial nodes.
  for ( i = 1 ;   i <= n ;   i ++ )  {
    if ( z [ i ] )
        {
          y . push ( i ) ;
        }
  }

  // Main processing loop: continues as long as there are nodes in 'y'.
  while ( y . length )  {
    // Create a new temporary array 'a' for the next set of nodes.
    var a = [ ] ;

    // Reset the 'z' array to all zeros for tracking visited nodes in the current iteration.
    z = Array ( n + 1 ) . fill ( 0 ) ;

    // Increment the answer counter. This likely counts "layers" or "stages".
    ans ++ ;

    // Iterate through the nodes currently in 'y'.
    for ( i = 0 ;   i < y . length ;   i ++ )  {
      // If the current node in 'y' has already been visited in this iteration, skip it.
      if ( z [ y [ i ] ] )
          {
            continue ;
          }

      // Mark the current node as visited for this iteration.
      z [ y [ i ] ] = 1 ;

      // Add all neighbors from 'p[y[i]]' to the temporary array 'a'.
      // The spread operator '...' is used to add individual elements.
      a . push ( ... p [ y [ i ] ] ) ;
    }

    // Update 'y' with the new set of nodes collected in 'a' for the next iteration.
    y = a ;
  }

  // Return the final computed answer.
  return ans ;
}