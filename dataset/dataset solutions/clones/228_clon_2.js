// Obtain program's input
let fileSystem = require('fs'),
  bufferSize = fileSystem.fstatSync(process.stdin.fd).size,
  dataHolder = new Uint8Array(bufferSize),
  readBytes = fileSystem.readSync(process.stdin.fd, dataHolder, 0, bufferSize, 0),
  incomingData = Buffer.from(dataHolder.buffer).toString('utf8', 0, readBytes).split('\n');
startExecution();


// Main program logic begins here
function startExecution ( )
{
  let generatedPrimes = computePrimes ( ) ;
  let sumOccurrences = new Uint32Array( 50001 );

  for ( let outerIndex = 1 ; outerIndex < 5133 ; outerIndex ++ )
  {
    let currentPrimeVal = generatedPrimes[outerIndex] ;
    for ( let innerIndex = 1 ; innerIndex <= outerIndex ; innerIndex ++ )
    {
      let totalValue = currentPrimeVal + generatedPrimes[innerIndex] ;
      if ( totalValue > 50000 )
      {
        break ;
      }
      sumOccurrences[totalValue]++ ;
    }
  }
  let inputIterator = 0 ;
  while ( ( currentNumericInput = +incomingData[inputIterator++] ) )
  {
    console.log ( sumOccurrences[currentNumericInput] ) ;
  }

}


function computePrimes ( )
{
  const upperLimit = 49999 ;
  let isCompound = new Uint8Array ( upperLimit + 1 ) ; // 0 for prime, 1 for compound

  // Mark non-prime numbers
  isCompound[0] = isCompound[1] = 1 ;
  for ( let sieveIteratorA = 2 , sqrtCeiling = ~ ~ Math.sqrt ( upperLimit ) ; sieveIteratorA <= sqrtCeiling ; sieveIteratorA ++ )
  {
    if ( isCompound[sieveIteratorA] )
    {
      continue ;
    }

    for ( let sieveIteratorB = ( sieveIteratorA << 1 ) ; sieveIteratorB <= upperLimit ; sieveIteratorB += sieveIteratorA )
    {
      isCompound[sieveIteratorB] = 1 ;
    }
  }

  let collectedPrimes = new Uint32Array ( 5134 ) ;
  let primeCounter = 0 ;
  for ( let numberCheck = 1 ; numberCheck <= upperLimit ; numberCheck ++ )
  {
    if ( ! isCompound[numberCheck] )
    {
      collectedPrimes [ ++ primeCounter ] = numberCheck ;
    }
  }

  return collectedPrimes ;
}