'use strict' // Enforce strict mode for better error handling and cleaner code.

// This is the main function responsible for processing the input string.
function   main( s )
{
  // First, we parse the input string 's'.
  // We split by newline, take the second line (index 1),
  // then split that line by space, and finally map each part to a number.
  s =  s.split( '\n' )[1] .split(' ') .map( n => Number( n ) ) ;

  // Initialize an array of points for calculation.
  // It starts with 0, includes all numbers from 's', and ends with 0.
  const points = [ 0 ,  ...s ,  0 ] ;

  // 'diff' will store the differences between consecutive points.
  const diff   =   [ ] ;

  // 'answer' will store the final results for each scenario.
  const answer = [ ] ;

  // Iterate over the 'points' array to calculate differences.
  // 'p' is the current point, 'i' is its index, 'self' is the array itself.
  points.forEach( ( p , i , self ) => {

    // Only calculate differences for points that are not the very last one.
    if ( i < self.length - 1 )
    {
      // Add the difference between the next point and the current point to 'diff'.
      diff.push( self[ i + 1 ] - self[ i ] ) ;
    }

  } ) ;


  // Calculate the total sum of absolute differences between consecutive points.
  // This represents the total travel distance in the original path.
  const sum = diff.map( n => Math.abs( n ) ) .reduce( ( a , b ) => a + b ) ;


  // Now, iterate through the points, excluding the initial and final '0's,
  // to simulate skipping each intermediate point.
  for ( let i = 1 ; i < points.length - 1 ; i++ )
  {
      // Calculate the distance if the current point (b) is skipped.
      // This is the direct distance from the previous point (a) to the next point (c).
      const skipped = Math.abs( points[ i - 1 ] - points[ i + 1 ] ) ;

      // Calculate the original distance covered by passing through the current point.
      // This is the sum of distances from (a to b) and (b to c).
      const stepped = Math.abs( points[ i - 1 ] - points[ i ] ) + Math.abs( points[ i ] - points[ i + 1 ] ) ;

      // Determine the change in total distance if point 'b' is skipped.
      // It's (distance a to c) - ((distance a to b) + (distance b to c)).
      const changed = skipped - stepped ;

      // Add the new total distance (original sum + change) to the 'answer' array.
      answer.push( sum + changed ) ;
  }

  // Print the final results, each on a new line.
  console.log( answer.join( '\n' ) ) ;
}


// Read input from standard in and pass it to the main function.
main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;