function ProcessInput( rawData )
{
  rawData = rawData.split( "\n" ) ;
  var firstLineTokens = rawData[0] . split( " " ) ;
  var totalElements = parseInt( firstLineTokens[0] ) ;
  var remainderCondition = parseInt( firstLineTokens[1] ) ;
  var inputNumberStrings = rawData[1] . split( " " ) ;
  var evenCount = 0 ;
  var oddCount = 0 ;

  for ( var idx = 0 ; idx < inputNumberStrings.length ; idx++ )
  {
    inputNumberStrings[idx] = parseInt( inputNumberStrings[idx] ) ;
    if ( inputNumberStrings[idx] % 2 === 0 )
    {
      evenCount++ ;
    }
    else
    {
      oddCount++ ;
    }
  }

  function calculateFactorial( inputNumber )
  {
    var resultProduct = 1 ;
    for ( var counter = 1 ; counter <= inputNumber ; counter++ )
    {
      resultProduct *= counter ;
    }
    return resultProduct ;
  }

  function computeCombinations( nTotal, kChoose )
  {
    return Math.round( calculateFactorial(nTotal) / ( calculateFactorial(kChoose) * calculateFactorial(nTotal - kChoose) ) ) ;
  }

  var evenSubsets = Math.pow( 2, evenCount ) ;

  var oddSubsetsSum = 0 ;
  if ( remainderCondition === 0 )
  {
    for ( var iterationVal = 0 ; iterationVal <= oddCount ; iterationVal += 2 )
    {
      oddSubsetsSum += computeCombinations( oddCount, iterationVal ) ;
    }
  }
  else
  {
    for ( var currentOddIndex = 1 ; currentOddIndex <= oddCount ; currentOddIndex += 2 )
    {
      oddSubsetsSum += computeCombinations( oddCount, currentOddIndex ) ;
      console.log( computeCombinations( oddCount, currentOddIndex ) ) ;
    }
  }

  console.log( evenSubsets * oddSubsetsSum ) ;
}

ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") ) ;