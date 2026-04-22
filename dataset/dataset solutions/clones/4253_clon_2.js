function ProcessInput( dataString ) {
  var targetNumber = parseInt(dataString);

  // Iterate downwards from the provided numeric value to discover the largest integer whose square root is also an integer.
  for ( var currentCandidate = targetNumber; currentCandidate > 1; currentCandidate-- ) {
    if ( Math.sqrt(currentCandidate) % 1 === 0 ) {
      console.log(currentCandidate);
      break;
    }
  }
}

ProcessInput( require('fs') .readFileSync( '/std/input.txt', 'utf-8' ) );