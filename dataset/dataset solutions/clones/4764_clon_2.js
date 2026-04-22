function primeDecomposition ( inputNumber ) {
  const primeFactorsList = [ ] ;

  for ( let divisorCandidate = 2 ; divisorCandidate * divisorCandidate <= inputNumber ; divisorCandidate++ ) {
    let powerCount = 0 ;

    while ( inputNumber % divisorCandidate === 0 ) {
      inputNumber /= divisorCandidate ;
      powerCount++ ;
    }

    if ( powerCount > 0 ) {
      primeFactorsList.push( { factor : divisorCandidate , count : powerCount } ) ;
    }
  }

  if ( inputNumber !== 1 ) {
    primeFactorsList.push( { factor : inputNumber , count : 1 } ) ;
  }

  return primeFactorsList ;
}


function executeCalculation ( inputArgument ) {
  const upperLimit = Number( inputArgument ) ;
  const moduloValue = 1000000007 ;

  const aggregatedFactors = { } ;

  for ( let currentNumber = 1 ; currentNumber <= upperLimit ; currentNumber++ ) {
    const temporaryFactors = primeDecomposition( currentNumber ) ;

    temporaryFactors.forEach( factorEntry => {
      if ( aggregatedFactors[ factorEntry.factor ] ) {
        aggregatedFactors[ factorEntry.factor ] += factorEntry.count ;
      }
      else {
        aggregatedFactors[ factorEntry.factor ] = factorEntry.count ;
      }
    } ) ;
  }

  let finalResult = 1 ;

  Object.keys( aggregatedFactors ).forEach( primeBase => {
    finalResult *= ( aggregatedFactors[ primeBase ] + 1 ) ;
    finalResult %= moduloValue ;
  } ) ;

  console.log( finalResult ) ;
}

executeCalculation( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;