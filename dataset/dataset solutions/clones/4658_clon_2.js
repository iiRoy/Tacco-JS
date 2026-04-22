'use strict'

function executeLogic ( rawData )
{

  let processedNumbers = rawData
    .split( '\n' )
    [0]
    .split( ' ' )
    .map( digitTxt => Number( digitTxt ) )
  ;

  const hourlyOffset = processedNumbers[0]
  ;
  const minuteAdjustment = processedNumbers[1]
  ;

  const computedTime = ( hourlyOffset + minuteAdjustment ) % 24
  ;

  console.log( computedTime )
  ;
}

executeLogic(
  require( "fs" )
    .readFileSync( "/dev/stdin"
                 , "utf8"
                 )
);