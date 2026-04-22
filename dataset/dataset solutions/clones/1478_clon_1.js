/* This file enforces strict mode for better error handling and cleaner code. */
"use strict" ;

// Declare and initialize input related variables.
var input = require("fs") . readFileSync ( "/dev/stdin" , "utf8" ) ;
var cin = input . split ( / |\n/ ) , cid = 0 ;

/*
 * These are helper functions for parsing input from the 'cin' array.
 * They advance the 'cid' (current index) as they consume elements.
 */
function next ( )
{
  return + cin [ cid ++ ] ; // Converts the current string element to a number and increments cid.
}

function nextstr ( )
{
  return cin [ cid ++ ] ; // Returns the current string element and increments cid.
}

function nextbig ( )
{
  return BigInt ( cin [ cid ++ ] ) ; // Converts to BigInt and increments cid.
}

function nexts ( n , a )
{
  // If 'a' is truthy, return as strings; otherwise, map to numbers.
  return a
    ? cin . slice ( cid , cid += n )
    : cin . slice ( cid , cid += n ) . map ( a => + a ) ;
}

function nextssort ( n , a )
{
  /*
   * This function reads 'n' elements, maps them to numbers,
   * and then sorts them.
   * If 'a' is truthy, it sorts in descending order (b-a).
   * Otherwise, it sorts in ascending order (a-b).
   */
  return a
    ? cin . slice ( cid , cid += n ) . map ( a => + a ) . sort ( ( a , b ) => b - a )
    : cin . slice ( cid , cid += n ) . map ( a => + a ) . sort ( ( a , b ) => a - b ) ;
}

function nextm ( h , w , a )
{
  var r = [ ] , i = 0 ; // Initialize result array and loop counter.
  if ( a )
  {
    // If 'a' is truthy, slices are returned as strings (no mapping).
    for ( ; i < h ; i ++ )
    {
      r . push ( cin . slice ( cid , cid += w ) ) ;
    }
  }
  else
  {
    // Otherwise, slices are mapped to numbers.
    for ( ; i < h ; i ++ )
    {
      r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
    }
  }
  return r ; // Return the 2D array.
}

/*
 * The xArray function creates multi-dimensional arrays initialized with a value.
 * It uses eval, which should be used with caution.
 */
function xArray ( v )
{
  var a = arguments , l = a . length , r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})" ;
  while ( --l )
  {
    r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
  }
  return eval ( r ) ;
}

// An array to store output streams, and a helper function to push to it.
var streams = [ ] ;
function print ( s )
{
  streams . push ( s ) ;
}

// Execute the main logic of the program.
var myOut = main ( ) ;

// If main() returns a value, print it to console.
if ( myOut !== undefined )
{
  console . log ( String ( myOut ) ) ;
}

// If there are any buffered streams, join and print them.
if ( streams . length )
{
  console . log ( streams . join ( "\n" ) ) ;
}


/*
 * This is the primary function where the program's core logic resides.
 * It reads an integer 'k' and constructs a string based on it.
 */
function main ( )
{
  var k = next ( ) ; // Read the input integer k.

  // Return a slice of "ACLACLACLACLACL" string, based on 3*k length.
  return "ACLACLACLACLACL" . slice ( 0 , k * 3 ) ;
}