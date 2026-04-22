var rawDataStream = require('fs') .readFileSync(  '/dev/stdin',  'utf8'  );
var inputLines = rawDataStream
  .trim()
  .split( "\n" );

while ( true ) {

  var currentLineSegment = inputLines.shift();

  if ( currentLineSegment === "0 0 0 0 0" ) {
    break;
  }

  var parsedNumbers = ( currentLineSegment + " " + inputLines.shift() )
      .split( " " )
      .map( Number );

  ( function( costPerUnitA, costPerUnitB, costForRemainder, groupingFactor, costPerGroup, initialCountA, initialCountB, targetCount ) {

    var strategyOneTotal,
        strategyTwoTotal;

    var remainingUnits = targetCount % groupingFactor;

    strategyOneTotal = initialCountA * costPerUnitA
                       + initialCountB * costPerUnitB
                       + Math.floor( targetCount / groupingFactor ) * groupingFactor * costPerGroup
                       + remainingUnits * costForRemainder;

    if ( targetCount >= groupingFactor ) {
      strategyTwoTotal = initialCountA * costPerUnitA + initialCountB * costPerUnitB + targetCount * costPerGroup;
    } else {
      var shortfallAmount = groupingFactor - remainingUnits;

      while ( shortfallAmount-- ) {
        if ( initialCountB > 0 ) {
          initialCountB--;
        } else if ( initialCountA > 0 ) {
          initialCountA--;
        }
      }
      strategyTwoTotal = initialCountA * costPerUnitA + initialCountB * costPerUnitB + groupingFactor * costPerGroup;
    }

    console.log( Math.min( strategyOneTotal, strategyTwoTotal ) );

  } ).apply( null, parsedNumbers );
}