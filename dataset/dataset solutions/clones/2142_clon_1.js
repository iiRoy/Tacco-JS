/*
 * This file contains several utility functions and a main execution block.
 * The primary goal is to calculate a specific combination-related sum modulo a large prime.
 */

// Function to parse raw input string into an array of individual string values.
function      parseInput ( input )
{
  // Initialize an empty array to store all parsed values.
  const   values  =  [ ] ;

  // Split the input string by newlines to get individual rows.
  // Then, iterate over each row.
  input.split ( '\n' ) . forEach ( row =>
  {
    // Split each row by spaces to get a list of values for that row.
    const   list    =  row.split ( ' ' ) ;

    // For each value in the current row, add it to the main 'values' array.
    list.forEach ( v =>  values.push ( v ) ) ;
  } ) ;

  // Return the accumulated list of all values.
  return   values ;
}


// Function to obtain input data.
// It uses a dummy string for testing purposes, or reads from stdin in a production-like environment.
function  getInput ( )
{
  // A hardcoded dummy string for local testing or default behavior.
  const   dummy = `1000000000 141421 173205` ;

  // If `dummy` is truthy (which it always is here), use it.
  // Otherwise, read from standard input.
  // The read data is then passed to the parseInput function.
  return   parseInput ( dummy  ||  require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
}


// Function to calculate the factorial of a given number.
// Note: This implementation includes a console.log inside the loop, which might be unusual for a pure factorial function.
function      factorial ( num )
{
  // Initialize the result for factorial calculation.
  var   number    =   1 ;

  // Loop from 1 up to 'num' (inclusive).
  for   ( var   i = 1 ;   i <= num ;   i++ )
  {
    // Log the current 'number' value before multiplication.
    console.log ( number ) ;

    // Multiply 'number' by the current loop iterator 'i'.
    number   *=   i ;
  }

  // Return the final factorial result.
  return   number ;
}


// Function to calculate combinations (nCr).
// It uses the formula n! / (r! * (n-r)!).
function    combination ( n , r )
{
  // Calculate factorial of n, r, and (n-r), then apply the combination formula.
  return   factorial ( n )   /   ( factorial ( r )   *   factorial ( n - r ) ) ;
}


// Immediately Invoked Function Expression (IIFE) to encapsulate the main execution logic.
; ( function   main ( )
{
  // Get the processed input values.
  const   input   =   getInput ( ) ;

  // Parse the input values into numbers.
  // 'n' is the total number of items.
  const   n       =   +input [ 0 ] ;
  // 'a' is the first excluded item count.
  const   a       =   +input [ 1 ] ;
  // 'b' is the second excluded item count.
  const   b       =   +input [ 2 ] ;

  // Initialize a variable to accumulate the sum of combinations.
  var     sum     =   0 ;

  // Loop through all possible values of 'r' from 1 to 'n'.
  for   ( var   r = 1 ;   r <= n ;   r++ )
  {
    // If 'r' is equal to 'a' or 'b', skip this iteration (these combinations are excluded).
    if   ( r   ===   a   ||   r   ===   b )
    {
      continue ;    // Move to the next iteration of the loop.
    }

    // Add the combination (nCr) to the total sum.
    sum   +=   combination ( n , r ) ;
  }

  // Define the large prime modulus.
  const   c   =   Math.pow ( 10 , 9 )   +   7 ;

  // Print the final sum modulo 'c' to the console.
  console.log ( sum   %   c ) ;
} ) ( ) ; // The '()' at the end immediately invokes the function.