'use strict';

function   executeCoreLogic  ( incomingDataString )
{
  let  digitArray  =  incomingDataString
    .split ( '' )
    .map ( digitChar => ~~digitChar )
    .slice ( 0, -1 ) ;

  let totalElements = digitArray.length ;

  let sumOfOnes = digitArray
    .reduce ( ( runningTotal, currentDigit ) => runningTotal + currentDigit ) ;

  let sumOfZeros = totalElements - sumOfOnes ;

  console.log ( Math.min ( sumOfZeros, sumOfOnes ) * 2 ) ;
}

executeCoreLogic ( require('fs').readFileSync ( '/dev/stdin', 'utf8' ) ) ;