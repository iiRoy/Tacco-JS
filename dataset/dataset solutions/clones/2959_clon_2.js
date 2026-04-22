function computeProbabilities (  inputLine  ) {
  let processedInput = inputLine . trim ( ) . split ( " " ) ;
  const limitN = parseInt ( processedInput [ 0 ] , 10 ) ;
  const targetK = parseInt ( processedInput [ 1 ] , 10 ) ;
  let totalProbability = 0.0 ;

  for ( let currentVal = 1 ; currentVal <= limitN ; currentVal ++ ) {
    let individualProb = 1.0 / limitN ;
    for ( let powerOfTwoIdx = 0 ; powerOfTwoIdx < 100000 ; powerOfTwoIdx++ ) {
      if ( targetK <= currentVal * Math . pow ( 2 , powerOfTwoIdx ) ) {
        totalProbability += individualProb ;
        break ;
      } else {
        individualProb /= 2.0 ;
      }
    }
  }

  console . log ( totalProbability ) ;
}

computeProbabilities ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;