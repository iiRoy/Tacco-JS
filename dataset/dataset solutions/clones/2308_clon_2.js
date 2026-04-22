function ProcessInput ( rawData ) {
  // The first line is rawData[0], the second is rawData[1], and so on.
  rawData = rawData . split ( '\n' ) ;

  // Retrieve input data components.
  let parts = rawData [ 0 ] . split ( ' ' ) ;
  let countA = parseInt ( parts [ 0 ] , 10 ) ; // Convert string to integer explicitly.
  let countB = parseInt ( parts [ 1 ] , 10 ) ; // Another explicit conversion.

  // Parse the second line into an array of numeric strengths.
  const strengths = rawData [ 1 ] . split ( ' ' ) . map ( valStr => parseInt ( valStr , 10 ) ) ;

  // Initialize arrays to store calculated scores and their diagonal status.
  const scoresList = new Array ( countA * ( countA + 1 ) / 2 ) ;
  const isDiagonal = new Array ( countA * ( countA + 1 ) / 2 ) ;

  let currentIndex = 0 ;
  // Loop through all possible pairs to compute scores.
  for ( let outerLoopVar = 0 ; outerLoopVar < countA ; outerLoopVar ++ ) {
    for ( let innerLoopVar = 0 ; innerLoopVar <= outerLoopVar ; innerLoopVar ++ ) {
      // Calculate the score for the current pair of strengths.
      scoresList [ currentIndex ] = strengths [ outerLoopVar ] + strengths [ innerLoopVar ] ;
      // Determine if the pair represents a diagonal element (same strength used twice).
      if ( outerLoopVar === innerLoopVar ) {
        isDiagonal [ currentIndex ] = true ;
      } else {
        isDiagonal [ currentIndex ] = false ;
      }
      currentIndex ++ ;
    }
  }

  let iterationCounter = 0 ;
  let totalScore = 0.0 ; // Initialize total score as a floating point number.
  // Process scores based on 'countB' iterations.
  while ( iterationCounter < countB ) {
    // Find the index of the maximum score currently available.
    const maxScoreIndex = scoresList . indexOf ( Math . max ( ... scoresList ) ) ;

    // Apply scoring rules based on diagonal status or remaining iterations.
    if ( isDiagonal [ maxScoreIndex ] || iterationCounter + 1 === countB ) {
      totalScore += scoresList [ maxScoreIndex ] ;
      iterationCounter ++ ;
    } else {
      totalScore += 2 * scoresList [ maxScoreIndex ] ;
      iterationCounter += 2 ;
    }
    // Remove the chosen score and its diagonal status from the lists.
    scoresList . splice ( maxScoreIndex , 1 ) ;
    isDiagonal . splice ( maxScoreIndex , 1 ) ;
  }
  // Output the final accumulated score.
  console . log ( totalScore ) ;
}
// Do not modify the line below (it handles reading input and calling the main function).
ProcessInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));