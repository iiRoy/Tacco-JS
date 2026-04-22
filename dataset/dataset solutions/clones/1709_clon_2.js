var parseNumeric = val => Number.parseInt(val, 10) ;
var parseNumericArray = sourceArray => sourceArray.map(item => parseNumeric(item)) ;
var absoluteValue = num => ( num > 0 ? num : -num ) ;
function findMinimum ( ) {
  var valueSet = arguments,
    currentMinimal = valueSet[0];
  for ( var index = 1 ; index < valueSet.length ; index ++ ) {
    if ( valueSet[index] < currentMinimal ) {
      currentMinimal = valueSet[index] ;
    }
  }
  return currentMinimal ;
}
function findMaximum ( ) {
  var valueSet = arguments,
    currentMaximal = valueSet[0];
  for ( var index = 1 ; index < valueSet.length ; index ++ ) {
    if ( valueSet[index] > currentMaximal ) {
      currentMaximal = valueSet[index] ;
    }
  }
  return currentMaximal ;
}
ExecuteProcessing( require("fs").readFileSync("/dev/stdin", "utf8") ) ;

function ExecuteProcessing ( rawData ) {
  var processedLines = rawData.split('\n') ;
  processedLines = processedLines.map( entry => parseNumericArray(entry.split(' ')) ) ;

  var totalDays = processedLines[0][0] ;
  var activityCostCoefficients = processedLines[1] ;
  var dailySatisfactionScores = processedLines.slice(2) ;
  // Original comment: //var ts = input.slice(d+2).map(e=>e[0]);
  // This line is commented out in the original, so we keep it commented or remove it. Let's remove it.

  var cumulativeScore = 0 ;
  var resultingActions = [] ;
  let currentActivityKind ;
  var lastActivityDay = [] ;
  lastActivityDay.length = 26 ;
  lastActivityDay.fill(-1) ;

  // Original comment: //let scoreDay = [];
  // Removed.

  // Calculates the impact on satisfaction for a given day and activity type
  // based on previous activity occurrences.
  function calculateDailyImpact ( currentDayIndex, activityKind, previousActivityOccurrences ) {
    let impactResult = 0 ;
    impactResult += dailySatisfactionScores[currentDayIndex][activityKind - 1] ;
    for ( let kindIterator = 0 ; kindIterator < 26 ; kindIterator ++ ) {
      if ( kindIterator !== activityKind - 1 ) {
        impactResult -= activityCostCoefficients[kindIterator] * ( currentDayIndex - previousActivityOccurrences[kindIterator] ) ;
      }
    }
    return impactResult ;
  }

  let thirdsBlockCount = Math.floor(totalDays / 3) ;
  let remainingDays = totalDays - thirdsBlockCount * 3 ;

  var blockScores ; // Stores [[activity0, activity1, activity2, totalScore], ...]
  var temporaryLastActivityRegistry ;
  let blockAccumulatedScore ;

  for ( let blockIndex = 0 ; blockIndex < thirdsBlockCount ; blockIndex ++ ) {
    blockScores = [] ;

    for ( let activity0 = 0 ; activity0 < 26 ; activity0 ++ ) {
      temporaryLastActivityRegistry = lastActivityDay.slice() ; // Create a shallow copy
      blockAccumulatedScore = 0 ;

      temporaryLastActivityRegistry[activity0] = blockIndex * 3 ;
      blockAccumulatedScore += calculateDailyImpact( blockIndex * 3, activity0 + 1, temporaryLastActivityRegistry ) ;

      for ( let activity1 = 0 ; activity1 < 26 ; activity1 ++ ) {
        temporaryLastActivityRegistry = lastActivityDay.slice() ; // Reset for each activity1
        temporaryLastActivityRegistry[activity0] = blockIndex * 3; // Re-set t0
        temporaryLastActivityRegistry[activity1] = blockIndex * 3 + 1 ;
        blockAccumulatedScore = calculateDailyImpact( blockIndex * 3, activity0 + 1, temporaryLastActivityRegistry ) +
                                calculateDailyImpact( blockIndex * 3 + 1, activity1 + 1, temporaryLastActivityRegistry ) ;

        for ( let activity2 = 0 ; activity2 < 26 ; activity2 ++ ) {
          let innerTempLastActivity = temporaryLastActivityRegistry.slice(); // Copy for final day in block
          innerTempLastActivity[activity2] = blockIndex * 3 + 2;
          let currentBlockTotal = calculateDailyImpact( blockIndex * 3, activity0 + 1, innerTempLastActivity ) +
                                  calculateDailyImpact( blockIndex * 3 + 1, activity1 + 1, innerTempLastActivity ) +
                                  calculateDailyImpact( blockIndex * 3 + 2, activity2 + 1, innerTempLastActivity ) ;
          blockScores.push([ activity0, activity1, activity2, currentBlockTotal ]) ;
        }
      }
    }

    // Original comment: //console.log(tempScore)
    // Removed.

    let bestBlockOptionIndex = blockScores.map( entry => entry[3] ).indexOf( findMaximum(...blockScores.map( entry => entry[3] )) ) ;
    let selectedBlockChoice = blockScores[bestBlockOptionIndex] ;
    // Original comment: //console.log(want,want2)
    // Removed.

    resultingActions.push( selectedBlockChoice[0] + 1, selectedBlockChoice[1] + 1, selectedBlockChoice[2] + 1 ) ;
    lastActivityDay[selectedBlockChoice[0]] = blockIndex * 3 ;
    lastActivityDay[selectedBlockChoice[1]] = blockIndex * 3 + 1 ;
    lastActivityDay[selectedBlockChoice[2]] = blockIndex * 3 + 2 ;
  }

  for ( let dayCounter = thirdsBlockCount * 3 ; dayCounter < totalDays ; dayCounter ++ ) {
    blockScores = [] ; // Re-purpose blockScores for single day options

    for ( let activityOption = 0 ; activityOption < 26 ; activityOption ++ ) {
      blockScores[activityOption] = calculateDailyImpact( dayCounter, activityOption + 1, lastActivityDay ) ;
    }

    let optimalChoiceIndex = blockScores.indexOf( findMaximum(...blockScores) ) ;
    resultingActions.push( optimalChoiceIndex + 1 ) ;
    lastActivityDay[optimalChoiceIndex] = dayCounter ;
  }

  console.log( resultingActions.join('\n') ) ;
}

// Original comment: //a.indexOf(Math.max(...a))
// Removed.