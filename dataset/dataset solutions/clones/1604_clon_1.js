/*
 * This is a JavaScript program designed to solve a specific problem.
 * It takes three numerical inputs: x, k, and d.
 * The 'x' represents an initial coordinate.
 * The 'k' represents the number of allowed moves.
 * The 'd' represents the distance that can be moved in one step.
 */
// Original input example: //let input = "1000000000000000 1000000000000000 1000000000000000";

function   main  ( input )
{
  // First, ensure the input string is clean by removing leading/trailing whitespace.
  input   =   input . trim ( ) ;

  // Split the cleaned input string into an array of strings based on spaces.
  let list    =   input . split ( " " ) ;


  // Parse the string elements into integer variables.
  let x       =   parseInt ( list [ 0 ] ) ; // Initial coordinate
  let k       =   parseInt ( list [ 1 ] ) ; // Number of moves allowed
  let d       =   parseInt ( list [ 2 ] ) ; // Distance per move

  // Calculate the maximum number of full 'd' steps that can be taken towards the origin.
  let kaisuu      =   Math . floor ( x / d ) ;
  // Determine the remaining moves after taking the 'kaisuu' steps.
  let nokoriKaisuu    =   k   -   kaisuu ;

  // Conditional logic to adjust 'kaisuu' based on remaining moves.
  if  ( kaisuu   >   k )
  {
    // If calculated 'kaisuu' exceeds total allowed moves 'k', cap it at 'k'.
    kaisuu  =   k ;
  }
  else  if  ( nokoriKaisuu   %   2   ===   0 )
  {
    // If remaining moves are even, no further adjustment to 'kaisuu' is needed for optimal path.
    /* No operation is performed here, as the current 'kaisuu' is considered optimal
       for an even number of remaining steps, assuming we want to minimize distance
       from origin. */
  }
  else  if  ( nokoriKaisuu   %   2   ===   1 )
  {
    // If remaining moves are odd, a slight adjustment might be necessary.
    if  ( 0   <   d   *   nokoriKaisuu )
    {
      // If moving further away would be beneficial (i.e., we are already past the origin or near it)
      kaisuu  +=  1 ; // Take one more step in the direction that brings us closer to origin
                      // or makes the final position after odd steps closer.
    }
    else
    {
      // Otherwise, reduce the number of steps.
      kaisuu  -=  1 ; // Take one less step.
    }
  }

  // Calculate the final absolute distance from the origin.
  let answer    =   Math . abs ( x   -   d   *   kaisuu ) ;

  // Output the final calculated answer to the console.
  console . log ( answer ) ;
}

// The commented out line below was likely used for local testing.
//main(input);

// Execute the main function, reading input from standard input (e.g., in a competitive programming environment).
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;