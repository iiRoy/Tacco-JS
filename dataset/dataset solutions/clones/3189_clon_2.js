'use strict'
function ProcessInput( rawData ) {
  rawData = ParseNumericData(rawData);
  var elementCount = rawData.shift();
  rawData = InsertSortBinary(rawData);
  var sortedNumbers = rawData;
  if ( elementCount === 1 ) {
    console.log(sortedNumbers[0]);
    return;
  }
  var commonFactor = sortedNumbers[0];
  for ( let idx = 0; idx < elementCount - 1; idx++ ) {
    commonFactor = DetermineGCD( sortedNumbers[idx + 1], commonFactor );
  }
  console.log(commonFactor);
}

function DetermineGCD( firstVal, secondVal ) {
  while ( !(firstVal === 0 || secondVal === 0) ) {
    if ( firstVal > secondVal ) {
      firstVal = firstVal % secondVal;
    } else {
      secondVal = secondVal % firstVal;
    }
  }
  var resultDivisor = Math.max(firstVal, secondVal);
  return resultDivisor;
}

function ParseNumericData( sourceText ) {
  var numericValues = [], counter = 0;
  var numPattern = /^-*\d+/;
  var spacePattern = / +|\n+/;
  while ( sourceText.length > 0 ) {
    if ( sourceText.match(numPattern) !== null ) {
      numericValues[counter] = parseInt(sourceText.match(numPattern)[0]);
      sourceText = sourceText.replace(numPattern, "");
      counter++;
      continue;
    }
    sourceText = sourceText.replace(spacePattern, "");
    continue;
  }
  return numericValues;
}

function InsertSortBinary( unsortedCollection ) {
  var collectionSize = unsortedCollection.length;
  var orderedCollection = [];
  for ( let outerIndex = 0; outerIndex < collectionSize; outerIndex++ ) {
    var lowBound = 0, midPoint = 0, highBound = collectionSize - 1;
    midPoint = Math.floor((lowBound + highBound) / 2);
    while ( !(lowBound > highBound) ) {
      if ( orderedCollection[midPoint] < unsortedCollection[outerIndex] ) {
        lowBound = midPoint + 1;
      } else {
        highBound = midPoint - 1;
      }
      midPoint = Math.floor((lowBound + highBound) / 2);
    }
    orderedCollection.splice(midPoint + 1, 0, unsortedCollection[outerIndex]);
  }
  return orderedCollection;
}

ProcessInput( require('fs').readFileSync('/dev/stdin', 'utf8') );