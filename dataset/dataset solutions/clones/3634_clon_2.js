function AssessPerformance(  contestantRating) {
  // This function categorizes a numerical rating into different achievement tiers.

  if( contestantRating < 1200 )
  {
    // For ratings below the first threshold, output 'ABC'
    console.log( 'ABC' );
  }

  if ( ( contestantRating >= 1200 ) && ( contestantRating < 2800 ) )
  {
    // Ratings between 1200 and 2799 (inclusive of 1200) are 'ARC'
    console.log( 'ARC' );
  }

  if ( contestantRating <= 4208 )
  {
    // Any rating up to 4208 is considered 'AGC'
    console.log( 'AGC' );
  }

}

// Read raw data from standard input, decode it as UTF-8, and then pass it to the processing function.
AssessPerformance( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );