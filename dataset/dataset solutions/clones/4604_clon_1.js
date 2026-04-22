"use strict" ;
// This script processes input data to determine a specific mathematical property.
// The primary function, 'Main', handles the core logic.

function Main (  input  )
{
  // Split the entire input string by spaces into an array.
  input = input . split ( " " ) ;

  // Parse integer values from the first three elements of the input array.
  var a = parseInt ( input [ 0 ] ) ;
  var b = parseInt ( input [ 1 ] ) ;
  var c = parseInt ( input [ 2 ] ) ;


  // Perform a modulo operation on 'a' with 'b'.
  a = a % b ;

  // Initialize a flag to indicate if the condition is met.
  var flag = 0 ;

  // Loop 'b' times to check for the condition.
  for ( var i = 0 ; i < b ; i ++ )
  {
    // Check if (a * i) % b is strictly equal to c.
    if ( ( a * i ) % b === c )
    {
      // If the condition is met, set the flag and exit the loop.
      flag = 1 ;
      break ;
    }
  }

  // Based on the flag's value, print "YES" or "NO".
  if ( flag === 1 )
  {
    console . log ( "YES" ) ;
  }
  else
  {
    console . log ( "NO" ) ;
  }
}

// DO NOT EDIT BELOW THIS LINE (Standard input/output handling)
// This section reads from standard input and calls the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;