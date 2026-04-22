"use strict";

function computeMaximumValue( totalElements, heightSeries, initialWeights )
{
  var calculatedValues = new Array(totalElements)
                               .fill(0)
                               .map( ( _element, currentIdx ) => initialWeights[currentIdx] );

  var peakScore = 0;

  for ( var outerIndex = 0; outerIndex < totalElements; outerIndex++ )
  {
    var currentPotential = 0;

    for ( var innerIndex = 0; innerIndex < outerIndex; innerIndex++ )
    {
      if ( heightSeries[outerIndex] > heightSeries[innerIndex] && currentPotential < calculatedValues[innerIndex] )
      {
        currentPotential = calculatedValues[innerIndex];
      }
    }

    calculatedValues[outerIndex] += currentPotential;

    if ( calculatedValues[outerIndex] > peakScore )
    {
      peakScore = calculatedValues[outerIndex];
    }
  }

  return peakScore;
}


function executeProcessing( sourceData )
{
  var dataLines = sourceData.split("\n");

  var numItems = parseInt( dataLines[0] );

  var itemHeights = dataLines[1]
                      .split(' ')
                      .map( segment => parseInt(segment) );

  var itemScores = dataLines[2]
                     .split(' ')
                     .map( segment => parseInt(segment) );

  var finalResult = computeMaximumValue( numItems, itemHeights, itemScores );

  console.log( finalResult );
}


executeProcessing( require('fs').readFileSync('/dev/stdin', 'utf8') );