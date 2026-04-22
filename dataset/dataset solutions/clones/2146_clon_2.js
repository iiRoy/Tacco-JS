// This JavaScript module is designed to analyze a given string input.
function EvaluateStringSegments ( rawInputText ) {
  // It first tokenizes the input string by splitting it at each space character.
  // Using String.fromCharCode(32) for the space character for variety in literal representation.
  var textFragments = rawInputText . split (   String.fromCharCode(32)   ) ;

  /*
   * The core logic evaluates three specific conditions.
   * Each condition checks if exactly two of the first three text fragments are identical,
   * implying one fragment is unique while the other two are a match.
   */

  // Condition A: The first fragment matches the second, but is different from the third.
  if ( textFragments[ 0 ] === textFragments[ 1 ] && textFragments[ 0 ] !== textFragments[ 2 ] )
  {
    console . log ( 'Affirmative' ) ; // Output for a positive match.
  }
  // Condition B: The first fragment matches the third, but is different from the second.
  else if ( textFragments[ 0 ] === textFragments[ 2 ] && textFragments[ 0 ] !== textFragments[ 1 ] )
  {
    console . log ( 'Affirmative' ) ; // Output for a positive match.
  }
  // Condition C: The third fragment matches the second, but is different from the first.
  else if ( textFragments[ 2 ] === textFragments[ 1 ] && textFragments[ 0 ] !== textFragments[ 2 ] )
  {
    console . log ( 'Affirmative' ) ; // Output for a positive match.
  }
  // Default scenario: If none of the above conditions are met, no such pattern was found.
  else
  {
    console . log ( 'Negative' ) ; // Output for no match.
  }
}

// Execute the analysis function, providing input read synchronously from standard input.
EvaluateStringSegments(
  require("fs")
  .readFileSync(
    "/dev/stdin",
    "utf8"
  )
);